package com.resumeintel.controller;

import com.resumeintel.dto.ApiResponse;
import com.resumeintel.entity.MasterResume;
import com.resumeintel.security.UserPrincipal;
import com.resumeintel.service.MasterResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resumes/master")
@RequiredArgsConstructor
public class MasterResumeController {

    private final MasterResumeService masterResumeService;

    @GetMapping
    public ResponseEntity<ApiResponse<MasterResume>> getMasterResume(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        MasterResume resume = masterResumeService.getMasterResume(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(resume, "Master resume retrieved successfully"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<MasterResume>> updateMasterResume(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody MasterResume incomingResume
    ) {
        MasterResume updated = masterResumeService.saveOrUpdateMasterResume(currentUser.getId(), incomingResume);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Master resume updated successfully"));
    }
}
