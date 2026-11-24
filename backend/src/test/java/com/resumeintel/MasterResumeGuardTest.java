package com.resumeintel;

import com.resumeintel.entity.MasterResume;
import com.resumeintel.exception.ImmutableFieldViolationException;
import com.resumeintel.guard.MasterResumeGuard;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class MasterResumeGuardTest {

    private MasterResumeGuard guard;
    private MasterResume original;

    @BeforeEach
    void setUp() {
        guard = new MasterResumeGuard();
        original = MasterResume.builder()
                .fullName("Alex Mercer")
                .email("alex@example.com")
                .phone("123-456-7890")
                .location("San Francisco, CA")
                .linkedinUrl("https://linkedin.com/in/alex")
                .githubUrl("https://github.com/alex")
                .professionalSummary("Original summary")
                .build();
    }

    @Test
    @DisplayName("Should pass when only editable professional summary is modified")
    void testEditableFieldModificationPasses() {
        MasterResume updated = MasterResume.builder()
                .fullName("Alex Mercer")
                .email("alex@example.com")
                .phone("123-456-7890")
                .location("San Francisco, CA")
                .linkedinUrl("https://linkedin.com/in/alex")
                .githubUrl("https://github.com/alex")
                .professionalSummary("Enhanced, role-tailored summary")
                .build();

        assertDoesNotThrow(() -> guard.assertProtectedFieldsUnmodified(original, updated));
    }

    @Test
    @DisplayName("Should throw ImmutableFieldViolationException when full name is altered")
    void testFullNameModificationThrowsException() {
        MasterResume updated = MasterResume.builder()
                .fullName("Alexander Great")
                .email("alex@example.com")
                .phone("123-456-7890")
                .location("San Francisco, CA")
                .linkedinUrl("https://linkedin.com/in/alex")
                .githubUrl("https://github.com/alex")
                .build();

        ImmutableFieldViolationException ex = assertThrows(
                ImmutableFieldViolationException.class,
                () -> guard.assertProtectedFieldsUnmodified(original, updated)
        );
        assertTrue(ex.getMessage().contains("fullName"));
    }

    @Test
    @DisplayName("Should throw ImmutableFieldViolationException when email is altered")
    void testEmailModificationThrowsException() {
        MasterResume updated = MasterResume.builder()
                .fullName("Alex Mercer")
                .email("tampered@example.com")
                .phone("123-456-7890")
                .location("San Francisco, CA")
                .linkedinUrl("https://linkedin.com/in/alex")
                .githubUrl("https://github.com/alex")
                .build();

        assertThrows(
                ImmutableFieldViolationException.class,
                () -> guard.assertProtectedFieldsUnmodified(original, updated)
        );
    }

    @Test
    @DisplayName("Should block forbidden section proposal types")
    void testProposalTargetValidation() {
        assertThrows(
                ImmutableFieldViolationException.class,
                () -> guard.validateProposalTarget("EDUCATION")
        );
        assertThrows(
                ImmutableFieldViolationException.class,
                () -> guard.validateProposalTarget("FULL_NAME")
        );
        assertDoesNotThrow(
                () -> guard.validateProposalTarget("PROJECT_BULLET")
        );
    }
}
