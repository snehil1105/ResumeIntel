package com.resumeintel.repository;

import com.resumeintel.entity.ResumeChangeProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResumeChangeProposalRepository extends JpaRepository<ResumeChangeProposal, UUID> {
    List<ResumeChangeProposal> findByCandidateMatchId(UUID matchId);
    List<ResumeChangeProposal> findByApprovalStatus(String status);
}
