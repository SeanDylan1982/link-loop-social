import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

// Track active subscriptions per user
const activeSubscriptions = new Map<string, any>();

export const useConversationsRealtime = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!user) return;

    const userId = user.id;
    
    // Always create fresh subscription for current session
    if (activeSubscriptions.has(userId)) {
      const existingChannel = activeSubscriptions.get(userId);
      supabase.removeChannel(existingChannel);
      activeSubscriptions.delete(userId);
    }

    console.log('[useConversationsRealtime] Setting up real-time subscription for user:', userId);
    
    const channelName = `conversations-realtime-${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[useConversationsRealtime] Conversation participants changed:', payload);
          // Force immediate refresh for all conversation queries
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.refetchQueries({ queryKey: ['conversations'] });
          // Also invalidate specific user queries if we can identify them
          if (payload.new && typeof payload.new === 'object' && 'user_id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['conversations', payload.new.user_id] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          console.log('[useConversationsRealtime] Conversation changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.refetchQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('[useConversationsRealtime] New message inserted:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.refetchQueries({ queryKey: ['conversations'] });
          // Also refresh specific conversation
          if (payload.new && typeof payload.new === 'object' && 'conversation_id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['conversation', payload.new.conversation_id] });
          }
        }
      )
      .subscribe();

    // Store the subscription
    activeSubscriptions.set(userId, channel);

    return () => {
      console.log('[useConversationsRealtime] Cleaning up real-time subscription for user:', userId);
      const storedChannel = activeSubscriptions.get(userId);
      if (storedChannel) {
        supabase.removeChannel(storedChannel);
        activeSubscriptions.delete(userId);
      }
    };
  }, [user?.id, queryClient]);
};