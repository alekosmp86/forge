import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { INotificationDTO, CreateNotificationInput } from '../types';

export function useNotifications() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<INotificationDTO[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/modules/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const json = await response.json();
      return json.data;
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (input: CreateNotificationInput) => {
      const response = await fetch('/api/modules/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to create notification');
      const json = await response.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/modules/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      const json = await response.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notificationsQuery.data?.filter((n) => !n.isRead).length || 0;

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    unreadCount,
    createNotification: createNotificationMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutateAsync,
  };
}
