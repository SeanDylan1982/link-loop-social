import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
  import { useAuth } from '@/hooks/useAuth';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

export const useConversationsRealtime = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!user || !token) return;

    socket.auth = { token };
    socket.connect();

    const handleConversationUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleNewMessage = (message: any) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', message.conversationId] });
    };

    socket.on('conversation:update', handleConversationUpdate);
    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('conversation:update', handleConversationUpdate);
      socket.off('message:new', handleNewMessage);
      socket.disconnect();
    };
  }, [user, token, queryClient]);
};