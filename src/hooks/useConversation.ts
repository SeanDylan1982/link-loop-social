
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';
import { useEffect } from 'react';

type Message = Tables<'messages'>;

const fetchConversation = async (currentUserId: string, otherUserId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

const sendMessage = async (currentUserId: string, receiverId: string, content: string) => {
  const { error } = await supabase
    .from('messages')
    .insert({ sender_id: currentUserId, receiver_id: receiverId, content });
  
  if (error) throw error;
};

export const useConversation = (otherUserId: string | undefined) => {
    const { user } = useSupabaseAuth();
    const queryClient = useQueryClient();
    const queryKey = ['conversation', user?.id, otherUserId];

    const { data: messages, isLoading } = useQuery({
        queryKey: queryKey,
        queryFn: () => fetchConversation(user!.id, otherUserId!),
        enabled: !!user && !!otherUserId,
    });

    const sendMessageMutation = useMutation({
        mutationFn: (content: string) => sendMessage(user!.id, otherUserId!, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
    
    useEffect(() => {
        if (!user || !otherUserId) return;

        const channelName = `conversation-${[user.id, otherUserId].sort().join('-')}`;
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.new.sender_id === otherUserId) {
                        queryClient.invalidateQueries({ queryKey });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, otherUserId, queryClient, queryKey]);

    return {
        messages: messages ?? [],
        isLoading,
        sendMessage: sendMessageMutation.mutate,
        isSending: sendMessageMutation.isPending,
    };
};

