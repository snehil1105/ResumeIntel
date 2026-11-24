package com.resumeintel.service;

import com.resumeintel.dto.JobAnalysisRequestDto;
import com.resumeintel.entity.JobDescription;
import com.resumeintel.entity.MasterResume;
import com.resumeintel.entity.User;
import com.resumeintel.exception.BadRequestException;
import com.resumeintel.exception.ResourceNotFoundException;
import com.resumeintel.repository.JobDescriptionRepository;
import com.resumeintel.repository.MasterResumeRepository;
import com.resumeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobAnalysisService {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final MasterResumeRepository masterResumeRepository;
    private final UserRepository userRepository;
    private final AIServiceClient aiServiceClient;

    @Transactional
    public Map<String, Object> analyzeJob(UUID userId, JobAnalysisRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        MasterResume masterResume = masterResumeRepository.findByUserIdAndIsActiveTrue(userId)
                .orElse(null);

        // Save Job Description
        JobDescription jd = JobDescription.builder()
                .user(user)
                .companyName(dto.getCompanyName())
                .jobTitle(dto.getJobTitle())
                .rawJdText(dto.getRawJdText())
                .jobUrl(dto.getJobUrl())
                .location(dto.getLocation())
                .seniorityLevel(dto.getSeniorityLevel())
                .additionalNotes(dto.getAdditionalNotes())
                .build();
        jd = jobDescriptionRepository.save(jd);

        // Prepare payload for AI microservice
        Map<String, Object> jobInput = new HashMap<>();
        jobInput.put("company_name", jd.getCompanyName());
        jobInput.put("job_title", jd.getJobTitle());
        jobInput.put("raw_jd_text", jd.getRawJdText());
        jobInput.put("job_url", jd.getJobUrl());
        jobInput.put("location", jd.getLocation());
        jobInput.put("seniority_level", jd.getSeniorityLevel());

        Map<String, Object> payload = new HashMap<>();
        payload.put("job_input", jobInput);
        payload.put("raw_resume_text", masterResume != null ? masterResume.getRawText() : "");

        Map<String, Object> aiResult = aiServiceClient.startWorkflow(userId.toString(), payload);
        aiResult.put("job_id", jd.getId());
        return aiResult;
    }
}
