package com.forge.javacore.modules.notifications.service;

import com.forge.javacore.core.exception.AppException;
import com.forge.javacore.modules.notifications.dto.CreateNotificationRequest;
import com.forge.javacore.modules.notifications.dto.NotificationDTO;
import com.forge.javacore.modules.notifications.entity.NotificationEntity;
import com.forge.javacore.modules.notifications.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.time.format.DateTimeFormatter;
import java.util.List;

import com.forge.javacore.modules.notifications.domain.NotificationType;
import com.forge.javacore.modules.notifications.exception.NotificationAccessDeniedException;
import com.forge.javacore.modules.notifications.exception.NotificationNotFoundException;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> findByUserId(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public NotificationDTO createNotification(String userId, CreateNotificationRequest request) {
        NotificationEntity entity = NotificationEntity.builder()
                .userId(userId)
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType() != null ? request.getType() : NotificationType.INFO)
                .build();

        NotificationEntity saved = notificationRepository.save(entity);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(String notificationId, String userId) {
        NotificationEntity entity = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId));

        if (!entity.getUserId().equals(userId)) {
            throw new NotificationAccessDeniedException();
        }

        entity.setRead(true);
        NotificationEntity saved = notificationRepository.save(entity);
        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    private NotificationDTO toDTO(NotificationEntity entity) {
        String formattedDate = entity.getCreatedAt() != null ? entity.getCreatedAt().format(DateTimeFormatter.ISO_INSTANT) : "";
        return NotificationDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .type(entity.getType())
                .isRead(entity.isRead())
                .createdAt(formattedDate)
                .build();
    }
}
