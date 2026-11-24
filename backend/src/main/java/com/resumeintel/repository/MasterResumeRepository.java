package com.resumeintel.repository;

import com.resumeintel.entity.MasterResume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MasterResumeRepository extends JpaRepository<MasterResume, UUID> {
    Optional<MasterResume> findByUserIdAndIsActiveTrue(UUID userId);
}
