import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import * as api from '@/api/api';
import { io, Socket } from 'socket.io-client';

interface Profile {
  id: string;
  username: string;
  avatar: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null;
  conversationId: string | null;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: string;
  title: string | null;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  participants: Profile[];
  lastMessage?: string;
  unreadCount: number;
}

let socket: Socket | null = null;

export const useSimpleMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  // Connect to Socket.IO on mount
  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    }
    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  // Load friends list
  const loadFriends = async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const data = await api.request('/friendships', { method: 'GET' });
      setFriends(data);
      return data;
    } catch (error) {
      setFriends([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load conversations
  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.request('/conversations', { method: 'GET' });
      setConversations(data.map((conv: any) => ({
        ...conv,
        lastMessage: conv.lastMessage || null,
        unreadCount: conv.unreadCount || 0,
      })));
    } catch (error) {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Create or find direct conversation
  const createDirectConversation = async (friendId: string): Promise<string | null> => {
    if (!user) return null;
    try {
      // Try to find existing conversation
      const data = await api.request('/conversations', { method: 'GET' });
      const existing = data.find((conv: any) =>
        !conv.isGroup && conv.participants.some((p: any) => p.id === friendId)
      );
      if (existing) return existing.id;
      // Create new conversation
      const newConv = await api.request('/conversations', {
        method: 'POST',
        body: JSON.stringify({ participantIds: [user.id, friendId], isGroup: false }),
      });
      await loadConversations();
      return newConv.id;
    } catch (error) {
      return null;
    }
  };

  // Send message
  const sendMessage = async (conversationId: string, content: string): Promise<boolean> => {
    if (!user || !content.trim()) return false;
    try {
      await api.request('/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, content }),
      });
      // Optionally, emit via socket for real-time
      socket?.emit('join-conversation', conversationId);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Get messages for a conversation
  const getMessages = async (conversationId: string): Promise<Message[]> => {
    try {
      const data = await api.request(`/messages/${conversationId}`, { method: 'GET' });
      return data;
    } catch (error) {
      return [];
    }
  };

  // Mark messages as read (not implemented in backend yet)
  const markAsRead = async (conversationId: string) => {
    // Optionally implement
  };

  // Load initial data
  useEffect(() => {
    if (user) {
      loadConversations();
      loadFriends();
    }
  }, [user?.id]);

  return {
    conversations,
    friends,
    loading,
    loadConversations,
    createDirectConversation,
    sendMessage,
    getMessages,
    markAsRead,
  };
};