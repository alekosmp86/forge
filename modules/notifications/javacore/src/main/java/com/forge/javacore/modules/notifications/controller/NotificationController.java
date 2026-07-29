package com.forge.javacore.modules.notifications.controller;

import com.forge.javacore.core.dto.ApiResponse;
import com.forge.javacore.core.security.UserPrincipal;
import com.forge.javacore.modules.notifications.dto.CreateNotificationRequest;
import com.forge.javacore.modules.notifications.dto.NotificationDTO;
import com.forge.javacore.modules.notifications.service.INotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/modules/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final INotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotifications(@AuthenticationPrincipal UserPrincipal user) {
        List<NotificationDTO> notifications = notificationService.findByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationDTO>> createNotification(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody CreateNotificationRequest request
    ) {
        NotificationDTO notification = notificationService.createNotification(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(notification, "Notification created successfully"));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDTO>> markAsRead(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String id
    ) {
        NotificationDTO notification = notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification marked as read"));
    }
}
