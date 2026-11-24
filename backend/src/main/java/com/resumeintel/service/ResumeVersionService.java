package com.resumeintel.service;

import com.resumeintel.entity.ResumeVersion;
import com.resumeintel.entity.User;
import com.resumeintel.exception.ResourceNotFoundException;
import com.resumeintel.repository.ResumeVersionRepository;
import com.resumeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeVersionService {

    private final ResumeVersionRepository versionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ResumeVersion> getVersionsForUser(UUID userId) {
        return versionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public ResumeVersion getVersionById(UUID versionId) {
        return versionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("ResumeVersion", "id", versionId));
    }

    @Transactional
    public ResumeVersion saveVersion(UUID userId, ResumeVersion version) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        version.setUser(user);
        return versionRepository.save(version);
    }
}
