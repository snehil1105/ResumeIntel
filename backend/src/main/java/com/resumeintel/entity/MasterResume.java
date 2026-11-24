package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * MASTER RESUME: The authoritative Single Source of Truth.
 * Protected identity fields are annotated and safeguarded against automatic AI rewriting.
 */
@Entity
@Table(name = "master_resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterResume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // === IMMUTABLE PROTECTED IDENTITY FIELDS ===
    @Column(nullable = false, name = "full_name")
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String location;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    // === EDITABLE / OPTIMIZABLE SECTIONS ===
    @Column(columnDefinition = "TEXT", name = "professional_summary")
    private String professionalSummary;

    private String headline;

    @Builder.Default
    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT", name = "raw_text")
    private String rawText;

    @OneToMany(mappedBy = "masterResume", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResumeEducation> educations = new ArrayList<>();

    @OneToMany(mappedBy = "masterResume", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResumeExperience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "masterResume", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResumeProject> projects = new ArrayList<>();

    @OneToMany(mappedBy = "masterResume", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResumeSkill> skills = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
