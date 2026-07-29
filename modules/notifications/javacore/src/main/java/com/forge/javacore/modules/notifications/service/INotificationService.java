package com.forge.javacore.modules.notifications.service;

import com.forge.javacore.modules.notifications.dto.CreateNotificationRequest;
import com.forge.javacore.modules.notifications.dto.NotificationDTO;

import java.util.List;

public interface INotificationService {
    List<NotificationDTO> findByUserId(String userId);
    NotificationDTO createNotification(String userId, CreateNotificationRequest request);
    NotificationDTO markAsRead(String notificationId, String userId);
    long getUnreadCount(String userId);
}
