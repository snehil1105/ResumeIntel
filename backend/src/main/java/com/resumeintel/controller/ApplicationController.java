package com.resumeintel.controller;

import com.resumeintel.dto.ApiResponse;
import com.resumeintel.dto.ApplicationStatusUpdateDto;
import com.resumeintel.entity.JobApplication;
import com.resumeintel.security.UserPrincipal;
import com.resumeintel.service.ApplicationTrackerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationTrackerService applicationTrackerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobApplication>>> getApplications(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<JobApplication> apps = applicationTrackerService.getUserApplications(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(apps, "Job applications retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobApplication>> createApplication(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody JobApplication application
    ) {
        JobApplication created = applicationTrackerService.createApplication(currentUser.getId(), application);
        return ResponseEntity.ok(ApiResponse.ok(created, "Application created successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<JobApplication>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationStatusUpdateDto dto
    ) {
        JobApplication updated = applicationTrackerService.updateStatus(id, dto);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Application status updated successfully"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Map<String, Object> analytics = applicationTrackerService.getAnalytics(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(analytics, "Application analytics calculated"));
    }
}
