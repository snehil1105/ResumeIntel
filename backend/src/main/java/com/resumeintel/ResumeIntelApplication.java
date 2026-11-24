package com.resumeintel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ResumeIntelApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResumeIntelApplication.class, args);
    }
}
