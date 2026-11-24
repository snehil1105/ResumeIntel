package com.resumeintel.service;

import com.resumeintel.dto.ApplicationStatusUpdateDto;
import com.resumeintel.entity.JobApplication;
import com.resumeintel.entity.User;
import com.resumeintel.exception.ResourceNotFoundException;
import com.resumeintel.repository.JobApplicationRepository;
import com.resumeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationTrackerService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<JobApplication> getUserApplications(UUID userId) {
        return applicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public JobApplication createApplication(UUID userId, JobApplication application) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        application.setUser(user);
        if (application.getApplicationDate() == null) {
            application.setApplicationDate(LocalDate.now());
        }
        return applicationRepository.save(application);
    }

    @Transactional
    public JobApplication updateStatus(UUID applicationId, ApplicationStatusUpdateDto dto) {
        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", applicationId));

        app.setStatus(dto.getStatus());
        if (dto.getApplicationDate() != null) app.setApplicationDate(dto.getApplicationDate());
        if (dto.getFollowUpDate() != null) app.setFollowUpDate(dto.getFollowUpDate());
        if (dto.getNotes() != null) app.setNotes(dto.getNotes());

        return applicationRepository.save(app);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics(UUID userId) {
        List<JobApplication> apps = applicationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        Map<String, Long> statusCounts = apps.stream()
                .collect(Collectors.groupingBy(JobApplication::getStatus, Collectors.counting()));

        long totalApps = apps.size();
        long interviews = apps.stream()
                .filter(a -> "INTERVIEW".equalsIgnoreCase(a.getStatus()) || "OFFER".equalsIgnoreCase(a.getStatus()))
                .count();
        double conversionRate = totalApps > 0 ? ((double) interviews / totalApps) * 100.0 : 0.0;

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("total_applications", totalApps);
        analytics.put("status_breakdown", statusCounts);
        analytics.put("interview_conversion_rate", Math.round(conversionRate * 10.0) / 10.0);
        return analytics;
    }
}
