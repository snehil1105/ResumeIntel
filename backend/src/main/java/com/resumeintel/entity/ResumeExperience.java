package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * PROTECTED IMMUTABLE EMPLOYMENT CHRONOLOGY
 * Employer names, official designations, and employment dates are locked against AI mutation.
 */
@Entity
@Table(name = "resume_experiences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_resume_id", nullable = false)
    @JsonIgnore
    private MasterResume masterResume;

    @Column(nullable = false, name = "company_name")
    private String companyName;

    @Column(nullable = false, name = "job_title")
    private String jobTitle;

    private String location;

    @Column(nullable = false, name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    @Builder.Default
    @Column(name = "is_current")
    private Boolean isCurrent = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "resume_experience_bullets", joinColumns = @JoinColumn(name = "experience_id"))
    @Column(name = "bullet_point", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> bulletPoints = new ArrayList<>();

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
