import { AppError } from '@/core/errors/AppError';

export class NotificationError extends AppError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
    this.name = 'NotificationError';
  }
}

export class NotificationNotFoundError extends NotificationError {
  constructor(notificationId: string) {
    super(`Notification not found with ID: ${notificationId}`, 404);
    this.name = 'NotificationNotFoundError';
  }
}

export class NotificationAccessDeniedError extends NotificationError {
  constructor() {
    super('Access denied: You do not have permission to access this notification', 403);
    this.name = 'NotificationAccessDeniedError';
  }
}
