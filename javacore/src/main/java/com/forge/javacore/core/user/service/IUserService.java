package com.forge.javacore.core.user.service;

import com.forge.javacore.core.user.dto.AuthRequest;
import com.forge.javacore.core.user.dto.CreateUserRequest;
import com.forge.javacore.core.user.dto.UserResponse;

import java.util.List;
import java.util.UUID;

public interface IUserService {
    UserResponse login(AuthRequest request);
    UserResponse register(CreateUserRequest request);
    UserResponse getCurrentUser(UUID id);
    UserResponse getUserById(UUID id);
    List<UserResponse> getAllUsers();
}
