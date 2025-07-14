import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import * as api from '@/api/api';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  conversationId: string;
  createdAt: string;
  read: boolean;
}

let socket: Socket | null = null;

interface UseBroadcastMessagingProps {
  conversationId: string;
}

export function useBroadcastMessaging({ conversationId }: UseBroadcastMessagingProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Connect to Socket.IO and join conversation room
  useEffect(() => {
    if (!conversationId) return;
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    }
    socket.emit('join-conversation', conversationId);
    // Listen for new messages
    const handleNewMessage = (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('new-message', handleNewMessage);
    return () => {
      socket?.off('new-message', handleNewMessage);
    };
  }, [conversationId]);

  // Fetch messages from backend
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.request(`/messages/${conversationId}`, { method: 'GET' });
      setMessages(data);
    } catch {
      setMessages([]);
    }
    setLoading(false);
  };

  // Send message
  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;
    await api.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content }),
    });
    // Real-time update will be handled by Socket.IO event
  };

  // Initial fetch
  useEffect(() => {
    if (conversationId) fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return {
    messages,
    loading,
    sendMessage,
    fetchMessages,
  };
} 