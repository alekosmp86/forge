import type { INotificationDTO, CreateNotificationInput } from '../types/types';

export interface INotificationService {
  findByUserId(userId: string): Promise<INotificationDTO[]>;
  create(input: CreateNotificationInput): Promise<INotificationDTO>;
  markAsRead(notificationId: string, userId: string): Promise<INotificationDTO>;
  getUnreadCount(userId: string): Promise<number>;
}
