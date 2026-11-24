package com.resumeintel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ApplicationStatusUpdateDto {
    @NotBlank(message = "Status is required")
    private String status;
    
    private LocalDate applicationDate;
    private LocalDate followUpDate;
    private String notes;
}
