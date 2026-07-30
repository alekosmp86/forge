export const NotificationType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface INotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationDelegate {
  findMany(args: unknown): Promise<NotificationRecord[]>;
  create(args: unknown): Promise<NotificationRecord>;
  findFirst(args: unknown): Promise<NotificationRecord | null>;
  update(args: unknown): Promise<NotificationRecord>;
  count(args: unknown): Promise<number>;
}

export interface UserDelegateExtension {
  update(args: unknown): Promise<unknown>;
}

export interface ExtendedPrisma {
  notification: NotificationDelegate;
  user: UserDelegateExtension;
}
