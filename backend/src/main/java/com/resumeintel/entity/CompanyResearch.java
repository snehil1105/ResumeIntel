package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "company_research")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResearch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id", nullable = false)
    @JsonIgnore
    private JobDescription jobDescription;

    @Column(nullable = false, name = "company_name")
    private String companyName;

    @Column(columnDefinition = "TEXT", name = "business_model")
    private String businessModel;

    @Column(columnDefinition = "TEXT", name = "products_and_services")
    private String productsAndServices;

    @Column(columnDefinition = "TEXT", name = "engineering_culture")
    private String engineeringCulture;

    @Column(columnDefinition = "TEXT", name = "hiring_values")
    private String hiringValues;

    @Column(name = "overall_confidence_score")
    private Double overallConfidenceScore;

    @OneToMany(mappedBy = "companyResearch", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResearchSource> sources = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
