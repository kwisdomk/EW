package com.epidemiwatch.bootstrap;

import com.epidemiwatch.entity.DiseaseReport;
import com.epidemiwatch.repository.DiseaseReportRepository;
import com.epidemiwatch.util.DataNormalizer;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.util.Random;

/**
 * Startup data seeder for EpidermiWatch.
 * Generates 4 weeks of mock epidemiological data for 10 Kenyan counties.
 * 
 * GUARANTEED: Nairobi + cholera will produce a RED alert after /api/detect.
 */
@ApplicationScoped
public class DataSeeder {

    private static final Logger LOG = Logger.getLogger(DataSeeder.class);

    @Inject
    DiseaseReportRepository reportRepository;

    private static final String[] COUNTIES = {
        "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu",
        "Machakos", "Uasin Gishu", "Kakamega", "Kilifi", "Meru"
    };

    private static final String[] DISEASES = { "malaria", "cholera", "typhoid" };

    private static final String[] SUB_COUNTIES = {
        "Central", "North", "South", "East", "West"
    };

    void onStart(@Observes StartupEvent ev) {
        seedData();
    }

    @Transactional
    void seedData() {
        long existingCount = reportRepository.count();
        if (existingCount > 0) {
            LOG.infof("Data already seeded (%d records found). Skipping.", existingCount);
            return;
        }

        LOG.info("=== EpidemiWatch Data Seeder Starting ===");

        Random rng = new Random(42); // deterministic seed for reproducibility
        LocalDate today = LocalDate.now();

        int totalReports = 0;

        for (String county : COUNTIES) {
            for (String disease : DISEASES) {

                // Generate 4 weeks of data: weeks -4, -3, -2, -1 relative to today
                for (int weekOffset = 4; weekOffset >= 1; weekOffset--) {

                    // Each week gets 2–3 sub-county reports
                    int reportsThisWeek = 2 + rng.nextInt(2); // 2 or 3

                    for (int r = 0; r < reportsThisWeek; r++) {
                        LocalDate reportDate = today.minusWeeks(weekOffset).minusDays(rng.nextInt(5));
                        String subCounty = SUB_COUNTIES[rng.nextInt(SUB_COUNTIES.length)];

                        int cases;

                        // SPECIAL CASE: Nairobi cholera gets baseline in weeks 2-4, spike in week 1
                        if ("Nairobi".equals(county) && "cholera".equals(disease)) {
                            if (weekOffset == 1) {
                                // SPIKE WEEK — guaranteed RED alert trigger
                                cases = 120 + rng.nextInt(80); // 120–200
                            } else {
                                // Baseline: low/normal
                                cases = 8 + rng.nextInt(15); // 8–23
                            }
                        } else {
                            // All other county+disease combos: normal baseline
                            cases = 10 + rng.nextInt(41); // 10–50
                        }

                        // Normalise county, subCounty, and disease before persisting
                        DiseaseReport report = new DiseaseReport(
                            DataNormalizer.normalizeCounty(county),
                            DataNormalizer.normalizeSubCounty(subCounty),
                            DataNormalizer.normalizeDisease(disease),
                            cases,
                            reportDate
                        );
                        reportRepository.persist(report);
                        totalReports++;
                    }
                }
            }
        }

        LOG.infof("=== Data Seeder Complete: %d reports generated ===", totalReports);
        LOG.info("TIP: Call POST /api/detect to generate outbreak alerts.");
        LOG.info("EXPECT: Nairobi + cholera → RED alert (guaranteed)");
    }
}
