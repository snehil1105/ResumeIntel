package com.resumeintel.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
public class AIServiceClient {

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public AIServiceClient(
            RestTemplateBuilder builder,
            @Value("${ai-service.url:http://localhost:8000}") String aiServiceUrl,
            @Value("${ai-service.timeout-seconds:60}") int timeoutSeconds
    ) {
        this.aiServiceUrl = aiServiceUrl;
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(timeoutSeconds))
                .build();
    }

    public Map<String, Object> startWorkflow(String userId, Map<String, Object> payload) {
        String url = String.format("%s/api/v1/workflow/start?user_id=%s", aiServiceUrl, userId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to call AI microservice at {}: {}", url, e.getMessage());
            throw new RuntimeException("AI Orchestration Service temporarily unavailable: " + e.getMessage());
        }
    }

    public Map<String, Object> decideProposals(String workflowId, Object decisionsPayload) {
        String url = String.format("%s/api/v1/workflow/%s/decide-proposals", aiServiceUrl, workflowId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> entity = new HttpEntity<>(decisionsPayload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to submit proposal decisions to {}: {}", url, e.getMessage());
            throw new RuntimeException("Error processing proposal decisions in AI service: " + e.getMessage());
        }
    }
}
