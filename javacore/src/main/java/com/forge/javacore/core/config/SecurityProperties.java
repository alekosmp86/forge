package com.forge.javacore.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Dedicated configuration properties class for security and JWT settings.
 * Maps properties under prefix 'app.security' from application.yml or environment variables.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    private String jwtSecret;
    private long jwtExpirationMs = 86400000L; // 24 hours
    private long refreshTokenExpirationMs = 604800000L; // 7 days
}
