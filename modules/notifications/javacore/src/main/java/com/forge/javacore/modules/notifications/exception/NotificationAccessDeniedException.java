package com.forge.javacore.modules.notifications.exception;

import org.springframework.http.HttpStatus;

public class NotificationAccessDeniedException extends NotificationException {

    public NotificationAccessDeniedException() {
        super("Access denied: You do not have permission to access this notification", HttpStatus.FORBIDDEN);
    }
}
