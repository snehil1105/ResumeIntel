package com.resumeintel.repository;

import com.resumeintel.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<JobApplication> findByUserIdAndStatus(UUID userId, String status);
    long countByUserId(UUID userId);
}
