package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "resume_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_resume_id", nullable = false)
    @JsonIgnore
    private MasterResume masterResume;

    @Column(nullable = false)
    private String category; // Languages, Frameworks, Cloud, Databases, Tools

    @Column(nullable = false, name = "skill_name")
    private String skillName;

    @Builder.Default
    @Column(name = "proficiency_level")
    private String proficiencyLevel = "INTERMEDIATE";

    @Column(name = "years_experience")
    private Double yearsExperience;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
