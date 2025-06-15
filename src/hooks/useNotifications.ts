
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = "message" | "friend_request" | "like" | "comment";

interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  related_id: string | null;
  content: string | null;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  // Get all notifications (latest first)
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Insert a notification for a user
  const insertNotification = useMutation({
    mutationFn: async ({
      userId,
      type,
      relatedId,
      content,
    }: {
      userId: string;
      type: NotificationType;
      relatedId?: string | null;
      content?: string | null;
    }) => {
      // The insert runs as the AUTH'D USER so can only insert "their own" notification (policy)
      // So for cross-user notifications, call this with the supabase client as the recipient.
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          type,
          related_id: relatedId ?? null,
          content: content ?? null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
      if (error) throw error;
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
  };
};
