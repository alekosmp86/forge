package com.forge.javacore.core.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Centralized application properties provider.
 * Holds references to domain-specific configuration properties (such as SecurityProperties)
 * and validates required settings on application startup.
 */
@Getter
@Component
@RequiredArgsConstructor
public class AppProperties {

    private static final Logger log = LoggerFactory.getLogger(AppProperties.class);

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
