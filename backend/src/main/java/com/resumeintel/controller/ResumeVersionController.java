package com.resumeintel.controller;

import com.resumeintel.dto.ApiResponse;
import com.resumeintel.entity.ResumeVersion;
import com.resumeintel.security.UserPrincipal;
import com.resumeintel.service.ResumeVersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes/versions")
@RequiredArgsConstructor
public class ResumeVersionController {

    private final ResumeVersionService versionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeVersion>>> getUserVersions(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<ResumeVersion> versions = versionService.getVersionsForUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(versions, "Resume versions retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeVersion>> getVersionById(@PathVariable UUID id) {
        ResumeVersion version = versionService.getVersionById(id);
        return ResponseEntity.ok(ApiResponse.ok(version, "Resume version retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResumeVersion>> saveVersion(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody ResumeVersion version
    ) {
        ResumeVersion saved = versionService.saveVersion(currentUser.getId(), version);
        return ResponseEntity.ok(ApiResponse.ok(saved, "Resume version stored successfully"));
    }
}
