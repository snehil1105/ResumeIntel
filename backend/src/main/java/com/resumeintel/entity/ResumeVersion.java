package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "resume_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "master_resume_id", nullable = false)
    private UUID masterResumeId;

    @Column(name = "job_description_id", nullable = false)
    private UUID jobDescriptionId;

    @Column(nullable = false, name = "version_tag")
    private String versionTag; // e.g. "Google - Backend Intern - v1"

    @Column(nullable = false, name = "version_number")
    @Builder.Default
    private Integer versionNumber = 1;

    @Column(nullable = false, columnDefinition = "TEXT", name = "customized_content")
    private String customizedContent; // Serialized JSON of MasterResume model

    @Column(name = "ats_heuristic_score")
    private Integer atsHeuristicScore;

    @Column(nullable = false, name = "human_reviewed")
    @Builder.Default
    private Boolean humanReviewed = true;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Column(name = "docx_path")
    private String docxPath;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
