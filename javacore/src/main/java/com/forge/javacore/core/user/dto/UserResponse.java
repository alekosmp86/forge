package com.forge.javacore.core.user.dto;

import com.forge.javacore.core.user.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String email;
    private String name;
    private UserRole role;
    private Instant createdAt;
    private Instant updatedAt;
}
