package com.resumeintel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class ProposalDecisionDto {
    private UUID proposalId;
    
    @NotBlank(message = "Action is required (APPROVED, REJECTED, EDITED, SAVED_FOR_LATER)")
    private String action;
    
    private String userEditedContent;
    private String verificationAnswer;
    private String feedbackNotes;
}
