import 'server-only';
import { prisma } from '@/core/db/client';
import { AppError } from '@/core/errors/AppError';
import type { INotificationService } from './INotificationService';
import type {
  INotificationDTO,
  CreateNotificationInput,
  NotificationType,
  NotificationRecord,
  ExtendedPrisma,
} from '../types/types';

const db = prisma as unknown as ExtendedPrisma;

export const notificationService: INotificationService = {
  async findByUserId(userId: string): Promise<INotificationDTO[]> {
    const records = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return records.map((record: NotificationRecord) => ({
      id: record.id,
      userId: record.userId,
      title: record.title,
      message: record.message,
      type: record.type as NotificationType,
      isRead: record.isRead,
      createdAt: record.createdAt.toISOString(),
    }));
  },

  async create(input: CreateNotificationInput): Promise<INotificationDTO> {
    const record = await db.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type || 'INFO',
      },
    });

    await db.user.update({
      where: { id: input.userId },
      data: { unreadNotificationCount: { increment: 1 } },
    });

    return {
      id: record.id,
      userId: record.userId,
      title: record.title,
      message: record.message,
      type: record.type as NotificationType,
      isRead: record.isRead,
      createdAt: record.createdAt.toISOString(),
    };
  },

  async markAsRead(notificationId: string, userId: string): Promise<INotificationDTO> {
    const existing = await db.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) {
      throw new AppError('Notification not found', 404);
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false },
    });

    await db.user.update({
      where: { id: userId },
      data: { unreadNotificationCount: unreadCount },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      title: updated.title,
      message: updated.message,
      type: updated.type as NotificationType,
      isRead: updated.isRead,
      createdAt: updated.createdAt.toISOString(),
    };
  },

  async getUnreadCount(userId: string): Promise<number> {
    return db.notification.count({
      where: { userId, isRead: false },
    });
  },
};
