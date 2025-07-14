
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Message } from '@/types';
import { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

const fetchConversation = async (conversationId: string, token: string | null): Promise<Message[]> => {
  const res = await fetch(`/api/messages/${conversationId}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch conversation');
  return res.json();
};

const sendMessage = async (conversationId: string, content: string, receiverId: string | undefined, token: string | null) => {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ conversationId, content, receiverId }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};

export const useConversation = (conversationId: string | undefined, receiverId?: string) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['conversation', conversationId];

  const { data: messages, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchConversation(conversationId!, token),
    enabled: !!user && !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => sendMessage(conversationId!, content, receiverId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
    if (!user || !token || !conversationId) return;

    socket.auth = { token };
    socket.connect();

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        queryClient.setQueryData<Message[]>(queryKey, (oldData) => [...(oldData || []), message]);
      }
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.disconnect();
    };
  }, [user, token, conversationId, queryClient, queryKey]);

  return {
    messages: messages ?? [],
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
};
