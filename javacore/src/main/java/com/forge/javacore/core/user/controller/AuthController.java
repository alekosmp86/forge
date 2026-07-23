package com.forge.javacore.core.user.controller;

import com.forge.javacore.core.auth.JwtTokenProvider;
import com.forge.javacore.core.auth.UserPrincipal;
import com.forge.javacore.core.error.AppException;
import com.forge.javacore.core.dto.ApiResponse;
import com.forge.javacore.core.user.dto.*;
import com.forge.javacore.core.user.service.IUserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IUserService userService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @Valid @RequestBody AuthRequest request,
            HttpServletResponse response
    ) {
        UserResponse user = userService.login(request);
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        addSessionCookies(response, token);

        return ResponseEntity.ok(ApiResponse.of(user));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw AppException.unauthorized("Not authenticated");
        }
        UserResponse user = userService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.of(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        clearSessionCookies(response);
        return ResponseEntity.ok(ApiResponse.of(null, "Logged out successfully"));
    }

    @GetMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutGet(HttpServletResponse response) {
        clearSessionCookies(response);
        return ResponseEntity.ok(ApiResponse.of(null, "Logged out successfully"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody CreateUserRequest request) {
        UserResponse user = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(user));
    }

    private void addSessionCookies(HttpServletResponse response, String token) {
        ResponseCookie sessionCookie = ResponseCookie.from("nexcore_session", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(86400)
                .sameSite("Lax")
                .build();

        ResponseCookie javaSessionCookie = ResponseCookie.from("javacore_session", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(86400)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, javaSessionCookie.toString());
    }

    private void clearSessionCookies(HttpServletResponse response) {
        ResponseCookie cleanSession = ResponseCookie.from("nexcore_session", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        ResponseCookie cleanJavaSession = ResponseCookie.from("javacore_session", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cleanSession.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cleanJavaSession.toString());
    }
}
