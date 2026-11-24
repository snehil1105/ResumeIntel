package com.resumeintel.service;

import com.resumeintel.entity.MasterResume;
import com.resumeintel.entity.User;
import com.resumeintel.exception.ResourceNotFoundException;
import com.resumeintel.guard.MasterResumeGuard;
import com.resumeintel.repository.MasterResumeRepository;
import com.resumeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MasterResumeService {

    private final MasterResumeRepository masterResumeRepository;
    private final UserRepository userRepository;
    private final MasterResumeGuard masterResumeGuard;

    @Transactional(readOnly = true)
    public MasterResume getMasterResume(UUID userId) {
        return masterResumeRepository.findByUserIdAndIsActiveTrue(userId)
                .orElse(null);
    }

    @Transactional
    public MasterResume saveOrUpdateMasterResume(UUID userId, MasterResume incomingResume) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        MasterResume existing = masterResumeRepository.findByUserIdAndIsActiveTrue(userId).orElse(null);

        if (existing != null) {
            // ENFORCE IMMUTABLE FIELDS INTEGRITY
            masterResumeGuard.assertProtectedFieldsUnmodified(existing, incomingResume);

            // Update allowed fields
            existing.setProfessionalSummary(incomingResume.getProfessionalSummary());
            existing.setHeadline(incomingResume.getHeadline());
            existing.setVersionNumber(existing.getVersionNumber() + 1);
            return masterResumeRepository.save(existing);
        } else {
            incomingResume.setUser(user);
            return masterResumeRepository.save(incomingResume);
        }
    }
}
