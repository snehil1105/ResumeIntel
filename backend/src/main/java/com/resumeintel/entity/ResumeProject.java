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
@Table(name = "resume_projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeProject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_resume_id", nullable = false)
    @JsonIgnore
    private MasterResume masterResume;

    @Column(nullable = false)
    private String title;

    private String role;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @ElementCollection
    @CollectionTable(name = "resume_project_technologies", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "technology")
    @Builder.Default
    private List<String> technologies = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "resume_project_bullets", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "bullet_point", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> bulletPoints = new ArrayList<>();

    @Column(name = "repo_url")
    private String repoUrl;

    @Column(name = "demo_url")
    private String demoUrl;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
