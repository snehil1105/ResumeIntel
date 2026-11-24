package com.resumeintel.controller;

import com.resumeintel.dto.ApiResponse;
import com.resumeintel.dto.ProposalDecisionDto;
import com.resumeintel.service.ProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;

    @PostMapping("/{workflowId}/decide")
    public ResponseEntity<ApiResponse<Map<String, Object>>> decideProposals(
            @PathVariable String workflowId,
            @RequestBody List<ProposalDecisionDto> decisions
    ) {
        Map<String, Object> result = proposalService.decideProposals(workflowId, decisions);
        return ResponseEntity.ok(ApiResponse.ok(result, "Human-in-the-loop decisions processed successfully"));
    }
}
