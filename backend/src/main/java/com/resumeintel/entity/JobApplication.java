package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "job_description_id", nullable = false)
    private UUID jobDescriptionId;

    @Column(name = "resume_version_id")
    private UUID resumeVersionId;

    @Column(nullable = false, name = "company_name")
    private String companyName;

    @Column(nullable = false, name = "job_title")
    private String jobTitle;

    @Column(nullable = false)
    @Builder.Default
    private String status = "INTERESTED"; 
    // INTERESTED, RESEARCHING, RESUME_READY, APPLIED, ASSESSMENT, INTERVIEW, OFFER, REJECTED

    @Column(name = "application_date")
    private LocalDate applicationDate;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "portal_url")
    private String portalUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
