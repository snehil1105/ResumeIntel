package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_descriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDescription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, name = "company_name")
    private String companyName;

    @Column(nullable = false, name = "job_title")
    private String jobTitle;

    @Column(name = "job_url")
    private String jobUrl;

    private String location;

    @Column(name = "seniority_level")
    private String seniorityLevel;

    @Column(nullable = false, columnDefinition = "TEXT", name = "raw_jd_text")
    private String rawJdText;

    @Column(columnDefinition = "TEXT", name = "additional_notes")
    private String additionalNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
