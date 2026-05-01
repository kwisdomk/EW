package com.epidemiwatch.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "disease_report")
public class DiseaseReport extends PanacheEntity {

    @Column(nullable = false)
    public String county;

    @Column(name = "sub_county")
    public String subCounty;

    @Column(nullable = false)
    public String disease;

    @Column(nullable = false)
    public Integer cases;

    @Column(name = "report_date", nullable = false)
    public LocalDate reportDate;

    @Column(name = "created_at")
    public LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (reportDate == null) {
            reportDate = LocalDate.now();
        }
    }

    // No-arg constructor required by JPA
    public DiseaseReport() {}

    public DiseaseReport(String county, String subCounty, String disease,
                          Integer cases, LocalDate reportDate) {
        this.county = county;
        this.subCounty = subCounty;
        this.disease = disease;
        this.cases = cases;
        this.reportDate = reportDate;
        this.createdAt = LocalDateTime.now();
    }
}
