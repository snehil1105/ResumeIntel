package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * PROTECTED IMMUTABLE ACADEMIC RECORD
 * Cannot be modified by AI suggestions.
 */
@Entity
@Table(name = "resume_educations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_resume_id", nullable = false)
    @JsonIgnore
    private MasterResume masterResume;

    @Column(nullable = false, name = "institution_name")
    private String institutionName;

    @Column(nullable = false)
    private String degree;

    @Column(name = "field_of_study")
    private String fieldOfStudy;

    @Column(name = "grade_or_gpa")
    private String gradeOrGpa;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    private String location;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
