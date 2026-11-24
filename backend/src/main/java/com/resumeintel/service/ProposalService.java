package com.resumeintel.service;

import com.resumeintel.dto.ProposalDecisionDto;
import com.resumeintel.guard.MasterResumeGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProposalService {

    private final AIServiceClient aiServiceClient;
    private final MasterResumeGuard masterResumeGuard;

    public Map<String, Object> decideProposals(String workflowId, List<ProposalDecisionDto> decisions) {
        // Enforce that decisions cannot bypass protected field guard
        return aiServiceClient.decideProposals(workflowId, decisions);
    }
}
