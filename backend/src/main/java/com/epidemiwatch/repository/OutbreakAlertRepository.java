package com.epidemiwatch.repository;

import com.epidemiwatch.entity.OutbreakAlert;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class OutbreakAlertRepository implements PanacheRepository<OutbreakAlert> {

    // ── Non-paginated (legacy) ────────────────────────────────────────────────

    public List<OutbreakAlert> findAllOrderedByDetectedAt() {
        return list("ORDER BY detectedAt DESC");
    }

    public List<OutbreakAlert> findUnacknowledged() {
        return list("acknowledged = false ORDER BY detectedAt DESC");
    }

    /**
     * Finds an existing alert for the same county + disease + ISO week.
     * Used to enforce the one-alert-per-county-disease-week idempotency rule.
     */
    public Optional<OutbreakAlert> findByCountyDiseaseAndWeek(String county, String disease, String weekKey) {
        return find("county = ?1 AND disease = ?2 AND weekKey = ?3", county, disease, weekKey)
                .firstResultOptional();
    }

    // ── Paginated query methods (P2) ──────────────────────────────────────────

    /** All alerts, newest first — no filter, paginated. */
    public List<OutbreakAlert> findAllPaged(int page, int size) {
        return findAll(Sort.by("detectedAt", Sort.Direction.Descending))
                .page(Page.of(page, size))
                .list();
    }

    /** Filter by severity level (YELLOW / ORANGE / RED), paginated. */
    public List<OutbreakAlert> findBySeverity(String alertLevel, int page, int size) {
        return find("alertLevel = ?1",
                Sort.by("detectedAt", Sort.Direction.Descending), alertLevel)
                .page(Page.of(page, size))
                .list();
    }

    /** Filter by county name (normalized), paginated. */
    public List<OutbreakAlert> findByCounty(String county, int page, int size) {
        return find("county = ?1",
                Sort.by("detectedAt", Sort.Direction.Descending), county)
                .page(Page.of(page, size))
                .list();
    }

    /** Filter by county + severity, paginated. */
    public List<OutbreakAlert> findByCountyAndSeverity(String county, String alertLevel, int page, int size) {
        return find("county = ?1 AND alertLevel = ?2",
                Sort.by("detectedAt", Sort.Direction.Descending), county, alertLevel)
                .page(Page.of(page, size))
                .list();
    }
}
