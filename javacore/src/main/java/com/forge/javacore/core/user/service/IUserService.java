package com.forge.javacore.core.user.service;

import com.forge.javacore.core.user.dto.AuthRequest;
import com.forge.javacore.core.user.dto.AuthResponse;
import com.forge.javacore.core.user.dto.CreateUserRequest;
import com.forge.javacore.core.user.dto.UserResponse;

import java.util.List;
import java.util.UUID;

public interface IUserService {
    AuthResponse login(AuthRequest request);
    UserResponse register(CreateUserRequest request);
    UserResponse getUserById(UUID id);
    List<UserResponse> getAllUsers();
}
