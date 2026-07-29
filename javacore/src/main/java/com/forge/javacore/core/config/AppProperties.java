package com.forge.javacore.core.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Centralized application properties provider.
 * Holds references to domain-specific configuration properties (such as SecurityProperties)
 * and validates required settings on application startup.
 */
@Slf4j
@Getter
@Component
@RequiredArgsConstructor
public class AppProperties {

    private final SecurityProperties security;

    @PostConstruct
    public void validateProperties() {
        if (security == null || !StringUtils.hasText(security.getJwtSecret())) {
            String errorMessage = "CRITICAL CONFIGURATION ERROR: Required configuration 'app.security.jwt-secret' (or environment variable 'SESSION_SECRET') is missing or empty!";
            log.error(errorMessage);
            throw new IllegalStateException(errorMessage);
        }
    }
}

