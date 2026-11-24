package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "research_sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchSource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_research_id", nullable = false)
    @JsonIgnore
    private CompanyResearch companyResearch;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1500)
    private String url;

    @Column(nullable = false, name = "source_type")
    private String sourceType; // OFFICIAL_CAREERS, ENGINEERING_BLOG, PUBLIC_REPORTS, TECH_PUBLICATION

    @Column(name = "publication_date")
    private String publicationDate;

    @Column(name = "confidence_level")
    @Builder.Default
    private String confidenceLevel = "HIGH";

    @Column(name = "is_official_company_source")
    @Builder.Default
    private Boolean isOfficialCompanySource = false;

    @Column(name = "is_observed_pattern")
    @Builder.Default
    private Boolean isObservedPattern = true;

    @Column(nullable = false, columnDefinition = "TEXT", name = "extracted_finding")
    private String extractedFinding;

    @CreationTimestamp
    @Column(name = "retrieval_date", updatable = false)
    private ZonedDateTime retrievalDate;
}
