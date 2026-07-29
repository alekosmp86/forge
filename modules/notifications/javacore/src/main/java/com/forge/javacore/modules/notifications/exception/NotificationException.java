package com.forge.javacore.modules.notifications.exception;

import com.forge.javacore.core.error.AppException;
import org.springframework.http.HttpStatus;

public class NotificationException extends AppException {

    public NotificationException(String message, HttpStatus status) {
        super(message, status);
    }
}
