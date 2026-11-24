package com.resumeintel.controller;

import com.resumeintel.dto.ApiResponse;
import com.resumeintel.dto.JobAnalysisRequestDto;
import com.resumeintel.security.UserPrincipal;
import com.resumeintel.service.JobAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobAnalysisController {

    private final JobAnalysisService jobAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzeJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody JobAnalysisRequestDto request
    ) {
        Map<String, Object> result = jobAnalysisService.analyzeJob(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(result, "Job analysis and multi-agent workflow started successfully"));
    }
}
