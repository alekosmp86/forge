package com.forge.javacore.core.user.service;

import com.forge.javacore.core.auth.JwtTokenProvider;
import com.forge.javacore.core.error.AppException;
import com.forge.javacore.core.user.domain.User;
import com.forge.javacore.core.user.domain.UserRole;
import com.forge.javacore.core.user.dto.AuthRequest;
import com.forge.javacore.core.user.dto.AuthResponse;
import com.forge.javacore.core.user.dto.CreateUserRequest;
import com.forge.javacore.core.user.dto.UserResponse;
import com.forge.javacore.core.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    @Transactional
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> AppException.unauthorized("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw AppException.unauthorized("Invalid credentials");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .success(true)
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public UserResponse register(CreateUserRequest request) {
        String email = request.getEmail().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw AppException.conflict("Email is already registered");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(UserRole.USER)
                .build();

        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found"));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
