package com.epidemiwatch.repository;

import com.epidemiwatch.entity.DiseaseReport;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class DiseaseReportRepository implements PanacheRepository<DiseaseReport> {

    /**
     * Returns all reports for a given county+disease within the last 4 weeks.
     */
    public List<DiseaseReport> findLast4WeeksByCountyAndDisease(String county, String disease) {
        LocalDate cutoff = LocalDate.now().minusWeeks(4);
        return list(
            "county = ?1 AND disease = ?2 AND reportDate >= ?3 ORDER BY reportDate ASC",
            county, disease, cutoff
        );
    }

    /**
     * Returns distinct county+disease pairs that have reports in the last 7 days.
     * We fetch all recent reports and deduplicate in Java to avoid JPQL DISTINCT issues.
     */
    public List<DiseaseReport> findRecentReportsLast7Days() {
        LocalDate cutoff = LocalDate.now().minusDays(7);
        return list("reportDate >= ?1", cutoff);
    }

    /** All reports, newest first — no filter. */
    public List<DiseaseReport> findAllOrderedByDate(int page, int size) {
        return findAll(Sort.by("reportDate", Sort.Direction.Descending))
                .page(Page.of(page, size))
                .list();
    }

    /** Filter by county only. */
    public List<DiseaseReport> findByCounty(String county, int page, int size) {
        return find("county = ?1", Sort.by("reportDate", Sort.Direction.Descending), county)
                .page(Page.of(page, size))
                .list();
    }

    /** Filter by disease only. */
    public List<DiseaseReport> findByDisease(String disease, int page, int size) {
        return find("disease = ?1", Sort.by("reportDate", Sort.Direction.Descending), disease)
                .page(Page.of(page, size))
                .list();
    }

    /** Filter by county + disease. */
    public List<DiseaseReport> findByCountyAndDisease(String county, String disease, int page, int size) {
        return find("county = ?1 AND disease = ?2",
                    Sort.by("reportDate", Sort.Direction.Descending), county, disease)
                .page(Page.of(page, size))
                .list();
    }
}
