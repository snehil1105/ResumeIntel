package com.resumeintel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobAnalysisRequestDto {
    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Job description text is required")
    private String rawJdText;

    private String jobUrl;
    private String location;
    private String seniorityLevel;
    private String additionalNotes;
}
