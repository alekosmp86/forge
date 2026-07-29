package com.forge.javacore.modules.notifications.exception;

import org.springframework.http.HttpStatus;

public class NotificationNotFoundException extends NotificationException {

    public NotificationNotFoundException(String notificationId) {
        super("Notification not found with ID: " + notificationId, HttpStatus.NOT_FOUND);
    }
}
