
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { NotificationType } from "@/types";

export const useNotificationSender = () => {
  const { token } = useAuth();

  const sendNotification = useMutation({
    mutationFn: async (notification: {
      recipientId: string;
      type: NotificationType;
      content: string;
      relatedId?: string;
    }) => {
      const res = await fetch("/api/notifications", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(notification),
      });
      if (!res.ok) throw new Error("Failed to send notification");
    },
  });

  return {
    sendNotification: sendNotification.mutate,
    isLoading: sendNotification.isPending,
  };
};
