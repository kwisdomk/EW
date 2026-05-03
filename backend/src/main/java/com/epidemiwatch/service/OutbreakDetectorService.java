package com.epidemiwatch.service;

import com.epidemiwatch.entity.DiseaseReport;
import com.epidemiwatch.entity.OutbreakAlert;
import com.epidemiwatch.repository.DiseaseReportRepository;
import com.epidemiwatch.repository.OutbreakAlertRepository;
import com.epidemiwatch.sse.AlertBroadcaster;
import com.epidemiwatch.util.DataNormalizer;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

/**
 * Core anomaly detection service using z-score based statistical analysis.
 * Operates on a per county+disease basis over rolling 4-week windows.
 *
 * <p>Key guarantees:
 * <ul>
 *   <li>Continuous time-series with zero-padding for missing weeks</li>
 *   <li>Sample standard deviation (n-1) for unbiased estimation</li>
 *   <li>Idempotent: one alert per (county + disease + ISO week)</li>
 *   <li>Alert escalation: updates existing alerts only if severity increases</li>
 * </ul>
 */
@ApplicationScoped
public class OutbreakDetectorService {

    private static final Logger LOG = Logger.getLogger(OutbreakDetectorService.class);

    /** Severity ranking for escalation comparisons. */
    private static final Map<String, Integer> SEVERITY_RANK = Map.of(
        "YELLOW", 1,
        "ORANGE", 2,
        "RED",    3
    );

    @Inject
    DiseaseReportRepository reportRepository;

    @Inject
    OutbreakAlertRepository alertRepository;

    @Inject
    AlertBroadcaster alertBroadcaster;

    @Inject
    WatsonAnalyticsService watsonService;

    private final AtomicBoolean isDetecting = new AtomicBoolean(false);

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Result record returned after a full detection run.
     */
    public record DetectionResult(int alertsCreated, int alertsUpdated, int alertsSkipped) {}

    /**
     * Scheduled cron job that automatically triggers outbreak detection every 30 seconds.
     * Uses an AtomicBoolean lock to skip if a manual or previous run is still executing.
     */
    @Scheduled(every = "30s")
    @Transactional
    public void scheduledDetection() {
        if (isDetecting.compareAndSet(false, true)) {
            try {
                LOG.info("[Scheduler] Triggering auto-detection...");
                DetectionResult result = detectOutbreaksInternal();
                if (result.alertsCreated() > 0 || result.alertsUpdated() > 0) {
                    LOG.infof("[Scheduler] Auto-detection completed: %d created, %d updated",
                            result.alertsCreated(), result.alertsUpdated());
                }
            } finally {
                isDetecting.set(false);
            }
        } else {
            LOG.debug("[Scheduler] Detection already in progress. Skipping scheduled run.");
        }
    }

    /**
     * Public manual trigger endpoint. Uses the same lock to avoid race conditions
     * with the scheduler.
     */
    public DetectionResult detectOutbreaks() {
        if (isDetecting.compareAndSet(false, true)) {
            try {
                return detectOutbreaksInternal();
            } finally {
                isDetecting.set(false);
            }
        } else {
            LOG.warn("Manual detection requested, but a run is already in progress.");
            return new DetectionResult(0, 0, 0);
        }
    }

    /**
     * Core detection logic.
     * Runs outbreak detection across all county+disease pairs active in the
     * last 7 days. Each call is idempotent: duplicate alerts for the same
     * (county + disease + ISO week) are never created — only escalated.
     *
     * <p>Persistence is handled inside this method.
     */
    private DetectionResult detectOutbreaksInternal() {
        List<DiseaseReport> recentReports = reportRepository.findRecentReportsLast7Days();

        Set<String> pairs = recentReports.stream()
            .map(r -> DataNormalizer.normalizeCounty(r.county) + "|" + DataNormalizer.normalizeDisease(r.disease))
            .collect(Collectors.toCollection(LinkedHashSet::new));

        LOG.infof("Running outbreak detection for %d county+disease pairs", pairs.size());

        int created = 0, updated = 0, skipped = 0;

        for (String pair : pairs) {
            String[] parts = pair.split("\\|");
            String county  = parts[0];
            String disease = parts[1];

            AlertOutcome outcome = analyzeAndPersist(county, disease);
            switch (outcome) {
                case CREATED -> created++;
                case UPDATED -> updated++;
                case SKIPPED -> skipped++;
                case BELOW_THRESHOLD -> { /* no-op */ }
            }
        }

        LOG.infof("Detection complete → created=%d, updated=%d, skipped=%d", created, updated, skipped);
        return new DetectionResult(created, updated, skipped);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal detection logic
    // ─────────────────────────────────────────────────────────────────────────

    private enum AlertOutcome { CREATED, UPDATED, SKIPPED, BELOW_THRESHOLD }

    /**
     * Analyses a county+disease pair and persists/updates an alert as needed.
     */
    private AlertOutcome analyzeAndPersist(String county, String disease) {
        List<DiseaseReport> reports =
            reportRepository.findLast4WeeksByCountyAndDisease(county, disease);

        if (reports == null || reports.isEmpty()) {
            return AlertOutcome.BELOW_THRESHOLD;
        }

        // ── Step 1: Build a CONTIGUOUS ISO-week series with zero-padding ──────
        int minWeek = reports.stream()
            .mapToInt(r -> r.reportDate.get(WeekFields.ISO.weekOfWeekBasedYear()))
            .min().orElse(0);
        int maxWeek = reports.stream()
            .mapToInt(r -> r.reportDate.get(WeekFields.ISO.weekOfWeekBasedYear()))
            .max().orElse(0);

        // Aggregate raw report cases per ISO week (may have gaps)
        Map<Integer, Integer> rawByWeek = new LinkedHashMap<>();
        for (DiseaseReport r : reports) {
            int week = r.reportDate.get(WeekFields.ISO.weekOfWeekBasedYear());
            rawByWeek.merge(week, r.cases, Integer::sum);
        }

        // Build contiguous list, inserting 0 for any missing week
        List<Integer> weeklyTotals = new ArrayList<>();
        for (int w = minWeek; w <= maxWeek; w++) {
            weeklyTotals.add(rawByWeek.getOrDefault(w, 0));
        }

        if (weeklyTotals.size() < 2) {
            // Need at least 2 data points (1 historical + 1 current)
            return AlertOutcome.BELOW_THRESHOLD;
        }

        // ── Step 2: Statistical analysis ──────────────────────────────────────
        int latestCases = weeklyTotals.get(weeklyTotals.size() - 1);
        List<Integer> historicalWeeks = weeklyTotals.subList(0, weeklyTotals.size() - 1);

        double mean = historicalWeeks.stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0.0);

        // Sample standard deviation (n-1 denominator) — unbiased for small n
        double stddev = sampleStdDev(historicalWeeks, mean);

        double zScore = computeZScore(latestCases, mean, stddev);

        LOG.debugf("[%s/%s] weekly=%s mean=%.2f stddev=%.2f z=%.4f",
            county, disease, weeklyTotals, mean, stddev, zScore);

        // ── Step 3: Threshold classification ──────────────────────────────────
        if (zScore < 2.0) {
            return AlertOutcome.BELOW_THRESHOLD;
        }

        String alertLevel = classifyAlert(zScore);
        String weekKey    = currentWeekKey();

        // ── Step 4: Idempotency check ─────────────────────────────────────────
        Optional<OutbreakAlert> existing =
            alertRepository.findByCountyDiseaseAndWeek(county, disease, weekKey);

        if (existing.isPresent()) {
            OutbreakAlert prior = existing.get();
            int existingRank = SEVERITY_RANK.getOrDefault(prior.alertLevel, 0);
            int newRank      = SEVERITY_RANK.getOrDefault(alertLevel, 0);

            if (newRank <= existingRank) {
                LOG.debugf("SKIPPED — alert already exists at same/higher level [%s/%s/%s]",
                    county, disease, weekKey);
                return AlertOutcome.SKIPPED;
            }

            // Escalate the existing alert
            LOG.infof("ALERT UPDATED - %s / %s / %s → %s (z=%.2f)",
                county, disease, weekKey, alertLevel, zScore);
            updateAlert(prior, alertLevel, zScore, latestCases, mean);
            alertRepository.persist(prior);
            alertBroadcaster.broadcast(prior);
            return AlertOutcome.UPDATED;
        }

        // ── Step 5: Create new alert ──────────────────────────────────────────
        OutbreakAlert alert = buildAlert(county, disease, weekKey,
            alertLevel, zScore, latestCases, mean);
        alertRepository.persist(alert);
        alertBroadcaster.broadcast(alert);

        LOG.infof("ALERT CREATED - %s / %s / %s / z=%.2f",
            county, disease, alertLevel, zScore);
        return AlertOutcome.CREATED;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Statistical helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Computes sample standard deviation using Bessel's correction (n-1).
     * Returns 1.0 as a safe fallback when n < 2 to avoid division-by-zero.
     */
    private double sampleStdDev(List<Integer> values, double mean) {
        int n = values.size();
        if (n < 2) {
            return 1.0; // safe fallback — cannot compute stddev from 1 point
        }
        double sumSqDiff = values.stream()
            .mapToDouble(v -> Math.pow(v - mean, 2))
            .sum();
        return Math.sqrt(sumSqDiff / (n - 1));
    }

    /**
     * Computes z-score with safe zero-variance handling.
     * Replaces the unsafe hardcoded zScore=5.0 with a bounded ORANGE fallback.
     */
    private double computeZScore(int latest, double mean, double stddev) {
        if (stddev == 0.0) {
            if (latest > mean) {
                // Non-zero deviation with flat history → constrained ORANGE signal
                return 3.5;
            }
            return 0.0; // flat and unchanged — no alert
        }
        return (latest - mean) / stddev;
    }

    private String classifyAlert(double zScore) {
        if (zScore >= 4.0) return "RED";
        if (zScore >= 3.0) return "ORANGE";
        return "YELLOW";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Alert construction helpers
    // ─────────────────────────────────────────────────────────────────────────

    private OutbreakAlert buildAlert(String county, String disease, String weekKey,
                                     String alertLevel, double zScore,
                                     int latestCases, double mean) {
        OutbreakAlert alert     = new OutbreakAlert();
        alert.county            = county;
        alert.disease           = disease;
        alert.weekKey           = weekKey;
        alert.alertLevel        = alertLevel;
        alert.zScore            = toBD(zScore, 6);
        alert.riskScore         = toBD(Math.min(zScore * 20.0, 100.0), 2);
        alert.watsonSummary     = buildWatsonSummary(county, disease, alertLevel, latestCases, mean, zScore);
        alert.recommendedAction = buildRecommendedAction(alertLevel, disease, county);
        alert.acknowledged      = false;
        alert.detectedAt        = LocalDateTime.now();
        return alert;
    }

    private void updateAlert(OutbreakAlert alert, String alertLevel, double zScore,
                             int latestCases, double mean) {
        alert.alertLevel        = alertLevel;
        alert.zScore            = toBD(zScore, 6);
        alert.riskScore         = toBD(Math.min(zScore * 20.0, 100.0), 2);
        alert.watsonSummary     = buildWatsonSummary(
            alert.county, alert.disease, alertLevel, latestCases, mean, zScore);
        alert.recommendedAction = buildRecommendedAction(alertLevel, alert.disease, alert.county);
        alert.detectedAt        = LocalDateTime.now(); // refresh timestamp on escalation
    }

    private BigDecimal toBD(double value, int scale) {
        return BigDecimal.valueOf(value).round(new MathContext(8, RoundingMode.HALF_UP))
               .setScale(scale, RoundingMode.HALF_UP);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Week key helper
    // ─────────────────────────────────────────────────────────────────────────

    /** Returns the current ISO week in "YYYY-Www" format, e.g. "2026-W18". */
    static String currentWeekKey() {
        LocalDate today = LocalDate.now();
        int year = today.get(IsoFields.WEEK_BASED_YEAR);
        int week = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        return String.format("%04d-W%02d", year, week);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Text generation
    // ─────────────────────────────────────────────────────────────────────────

    private String buildWatsonSummary(String county, String disease, String level,
                                      int latest, double mean, double zScore) {
        // Use IBM Watson Analytics Service for AI-powered outbreak summaries
        return watsonService.generateOutbreakSummary(county, disease, level, latest, mean, zScore);
    }

    private String buildRecommendedAction(String level, String disease, String county) {
        // Use IBM Watson Analytics Service for AI-powered action recommendations
        return watsonService.generateRecommendedActions(level, disease, county, 0.0);
    }
}
