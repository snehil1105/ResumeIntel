package com.resumeintel.repository;

import com.resumeintel.entity.ResumeVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, UUID> {
    List<ResumeVersion> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<ResumeVersion> findByJobDescriptionId(UUID jobDescriptionId);
}
