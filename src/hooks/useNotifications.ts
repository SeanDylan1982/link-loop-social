
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Notification, NotificationType } from "@/types";

export const useNotifications = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  // Get all notifications (latest first)
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("/api/notifications", { headers });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: !!user,
  });

  // This hook is now for the current user, so no need to pass userId
  const insertNotification = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read'>) => {
      const res = await fetch("/api/notifications", {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });
      if (!res.ok) throw new Error("Failed to create notification");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/mark-all-as-read", {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error("Failed to mark all notifications as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  return {
    notifications: notifications || [],
    isLoading,
    insertNotification,
    markAsRead,
    markAllAsRead,
  };
};
