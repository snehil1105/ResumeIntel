package com.resumeintel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "resume_change_proposals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeChangeProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "candidate_match_id")
    private UUID candidateMatchId;

    @Column(nullable = false, name = "section_type")
    private String sectionType; // PROFESSIONAL_SUMMARY, SKILLS_ORDERING, PROJECT_BULLET, PROJECT_TITLE

    @Column(name = "target_id")
    private String targetId;

    @Column(nullable = false, columnDefinition = "TEXT", name = "original_content")
    private String originalContent;

    @Column(nullable = false, columnDefinition = "TEXT", name = "proposed_content")
    private String proposedContent;

    @Column(nullable = false, columnDefinition = "TEXT", name = "justification_why")
    private String justificationWhy;

    @Column(columnDefinition = "TEXT", name = "supporting_jd_requirement")
    private String supportingJdRequirement;

    @Column(columnDefinition = "TEXT", name = "supporting_company_insight")
    private String supportingCompanyInsight;

    @Column(columnDefinition = "TEXT", name = "expected_benefit")
    private String expectedBenefit;

    @Column(name = "confidence_level")
    @Builder.Default
    private Double confidenceLevel = 0.90;

    @Column(name = "evidence_status")
    @Builder.Default
    private String evidenceStatus = "VERIFIED_FROM_MASTER";

    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED, EDITED

    @Column(columnDefinition = "TEXT", name = "user_edited_content")
    private String userEditedContent;

    @Column(columnDefinition = "TEXT", name = "verification_question")
    private String verificationQuestion;

    @Column(columnDefinition = "TEXT", name = "user_verification_answer")
    private String userVerificationAnswer;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
