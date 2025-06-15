
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';
import { useEffect } from 'react';

type Message = Tables<'messages'>;

const fetchConversation = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Send a message in a conversation; for direct messages receiverId is required
const sendMessage = async (
  currentUserId: string,
  conversationId: string,
  content: string,
  receiverId?: string
) => {
  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: currentUserId,
      receiver_id: receiverId ?? null,
      conversation_id: conversationId,
      content,
    });

  if (error) throw error;
};

// Enhanced hook: figure out receiverId when needed
export const useConversation = (
  conversationId: string | undefined,
  receiverId?: string // needed for DMs; undefined for group chats
) => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const queryKey = ['conversation', conversationId];

  const { data: messages, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchConversation(conversationId!),
    enabled: !!user && !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      sendMessage(user!.id, conversationId!, content, receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  useEffect(() => {
    if (!user || !conversationId) return;

    const channelName = `conversation-${conversationId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId, queryClient, queryKey]);

  return {
    messages: messages ?? [],
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
};
