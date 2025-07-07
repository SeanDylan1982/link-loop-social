
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/hooks/useNotifications";

export const useNotificationSender = () => {
  const sendNotification = useMutation({
    mutationFn: async ({
      recipientId,
      type,
      content,
      relatedId,
    }: {
      recipientId: string;
      type: NotificationType;
      content: string;
      relatedId?: string;
    }) => {
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: recipientId,
          type,
          content,
          related_id: relatedId || null,
        });
      
      if (error) throw error;
    },
  });

  return {
    sendNotification: sendNotification.mutate,
    isLoading: sendNotification.isPending,
  };
};
