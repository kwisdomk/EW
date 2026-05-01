package com.epidemiwatch.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "outbreak_alert",
       indexes = {
           @Index(name = "idx_alert_week_key", columnList = "county, disease, week_key")
       })
public class OutbreakAlert extends PanacheEntity {

    @Column(nullable = false)
    public String county;

    @Column(nullable = false)
    public String disease;

    /**
     * ISO week identifier for this alert, e.g. "2026-W18".
     * Used to enforce one alert per (county + disease + week) rule.
     */
    @Column(name = "week_key", length = 10)
    public String weekKey;

    @Column(name = "risk_score", precision = 5, scale = 2)
    public BigDecimal riskScore;

    @Column(name = "alert_level", nullable = false)
    public String alertLevel;

    @Column(name = "z_score", precision = 8, scale = 4)
    public BigDecimal zScore;

    @Column(name = "watson_summary", length = 2000)
    public String watsonSummary;

    @Column(name = "recommended_action", length = 1000)
    public String recommendedAction;

    @Column(name = "detected_at")
    public LocalDateTime detectedAt;

    @Column(nullable = false)
    public Boolean acknowledged = false;

    @PrePersist
    public void prePersist() {
        if (detectedAt == null) {
            detectedAt = LocalDateTime.now();
        }
        if (acknowledged == null) {
            acknowledged = false;
        }
    }

    public OutbreakAlert() {}
}
