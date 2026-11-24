package com.resumeintel.guard;

import com.resumeintel.entity.MasterResume;
import com.resumeintel.exception.ImmutableFieldViolationException;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Set;

/**
 * MASTER RESUME IMMUTABILITY GUARD
 * Enforces the non-negotiable security boundary:
 * AI recommendations, customization merges, and automated batch updates
 * are structurally blocked from modifying protected candidate credentials.
 */
@Component
public class MasterResumeGuard {

    private static final Set<String> FORBIDDEN_SECTION_TYPES = Set.of(
            "FULL_NAME", "EMAIL", "PHONE", "LOCATION", "LINKEDIN", "GITHUB",
            "EDUCATION", "DEGREE", "INSTITUTION", "GRADUATION_DATE",
            "EXPERIENCE_COMPANY", "EXPERIENCE_TITLE", "EXPERIENCE_DATES"
    );

    public void validateProposalTarget(String sectionType) {
        if (sectionType != null && FORBIDDEN_SECTION_TYPES.contains(sectionType.toUpperCase())) {
            throw new ImmutableFieldViolationException(
                    sectionType,
                    "Automated modification of personal contact information, academic credentials, or employment chronology is prohibited."
            );
        }
    }

    public void assertProtectedFieldsUnmodified(MasterResume original, MasterResume candidateUpdate) {
        if (!Objects.equals(original.getFullName(), candidateUpdate.getFullName())) {
            throw new ImmutableFieldViolationException("fullName", "Candidate full name was modified.");
        }
        if (!Objects.equals(original.getEmail(), candidateUpdate.getEmail())) {
            throw new ImmutableFieldViolationException("email", "Candidate email address was modified.");
        }
        if (!Objects.equals(original.getPhone(), candidateUpdate.getPhone())) {
            throw new ImmutableFieldViolationException("phone", "Candidate phone number was modified.");
        }
        if (!Objects.equals(original.getLocation(), candidateUpdate.getLocation())) {
            throw new ImmutableFieldViolationException("location", "Candidate location was modified.");
        }
        if (!Objects.equals(original.getLinkedinUrl(), candidateUpdate.getLinkedinUrl())) {
            throw new ImmutableFieldViolationException("linkedinUrl", "LinkedIn profile URL was modified.");
        }
        if (!Objects.equals(original.getGithubUrl(), candidateUpdate.getGithubUrl())) {
            throw new ImmutableFieldViolationException("githubUrl", "GitHub URL was modified.");
        }
    }
}
