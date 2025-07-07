
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';
import { useEffect } from 'react';

type Message = Tables<'messages'>;

const fetchConversation = async (conversationId: string): Promise<Message[]> => {
  console.log('[fetchConversation] Fetching messages for conversation:', conversationId);
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[fetchConversation] Error:', error);
    throw error;
  }
  
  console.log('[fetchConversation] Fetched messages:', data);
  return data || [];
};

// Send a message in a conversation; for direct messages receiverId is required
const sendMessage = async (
  currentUserId: string,
  conversationId: string,
  content: string,
  receiverId?: string
) => {
  console.log('[sendMessage] Sending:', { currentUserId, conversationId, content, receiverId });
  
  // If no receiverId provided, try to find it from conversation participants
  let finalReceiverId = receiverId;
  if (!finalReceiverId) {
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', currentUserId);
    
    if (participants && participants.length === 1) {
      finalReceiverId = participants[0].user_id;
      console.log('[sendMessage] Found receiverId from participants:', finalReceiverId);
    }
  }
  
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      sender_id: currentUserId,
      receiver_id: finalReceiverId || null,
      conversation_id: conversationId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('[sendMessage] Error inserting message:', error);
    throw error;
  }

  console.log('[sendMessage] Message created:', message);

  // For direct messages, ensure we have a receiver_id
  if (!finalReceiverId) {
    console.error('[sendMessage] No receiver_id found for direct message');
    throw new Error('Cannot send message: recipient not found');
  }

  // Ensure receiver is a participant in the conversation
  const { error: participantError } = await supabase
    .from('conversation_participants')
    .upsert({
      conversation_id: conversationId,
      user_id: finalReceiverId
    }, {
      onConflict: 'conversation_id,user_id'
    });

  if (participantError) {
    console.error('[sendMessage] Error adding receiver as participant:', participantError);
  } else {
    console.log('[sendMessage] Ensured receiver is participant:', finalReceiverId);
  }

  // Update conversation timestamp to trigger real-time updates
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  console.log('[sendMessage] Updated conversation timestamp for real-time sync');

  return message;
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
      // Update conversation lists for both users
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
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
          console.log('[useConversation] New message received via real-time:', payload);
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
