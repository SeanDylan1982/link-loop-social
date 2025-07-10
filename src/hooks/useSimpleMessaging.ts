import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
  avatar: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string | null;
  conversation_id: string | null;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  title: string | null;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  creator_id: string;
  other_user?: Profile;
  last_message?: string;
  unread_count: number;
}

export const useSimpleMessaging = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  // Load friends list
  const loadFriends = async () => {
    if (!user) return [];
    
    try {
      // Get friendships where current user is involved
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) throw error;

      // Extract friend IDs
      const friendIds = friendships
        .map(f => f.user1_id === user.id ? f.user2_id : f.user1_id)
        .filter(Boolean);

      if (friendIds.length === 0) return [];

      // Get friend profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar')
        .in('id', friendIds);

      if (profilesError) throw profilesError;

      return profiles || [];
    } catch (error) {
      console.error('Error loading friends:', error);
      return [];
    }
  };

  // Load conversations with a much simpler approach
  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all conversations where user is a participant
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      const conversationIds = participants.map(p => p.conversation_id);
      
      if (conversationIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get conversation details
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // For each conversation, get the other participants and last message
      const enrichedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          // Get other participants (for DMs)
          const { data: otherParticipants } = await supabase
            .from('conversation_participants')
            .select('user_id, profiles!conversation_participants_user_id_fkey(id, username, avatar)')
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id);

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .eq('read', false);

          const otherUser = otherParticipants?.[0]?.profiles as Profile;

          return {
            ...conv,
            other_user: otherUser,
            last_message: lastMessage?.content || null,
            unread_count: unreadCount || 0
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create or find direct conversation
  const createDirectConversation = async (friendId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // First, check if a direct conversation already exists
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, conversations!inner(is_group)')
        .eq('user_id', user.id);

      if (existingParticipants) {
        for (const participant of existingParticipants) {
          if (!participant.conversations.is_group) {
            // Check if this DM conversation also includes the friend
            const { data: friendParticipant } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', participant.conversation_id)
              .eq('user_id', friendId)
              .single();

            if (friendParticipant) {
              return participant.conversation_id;
            }
          }
        }
      }

      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          title: null,
          is_group: false,
          creator_id: user.id
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Add both users as participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConversation.id, user_id: user.id },
          { conversation_id: newConversation.id, user_id: friendId }
        ]);

      if (participantsError) throw participantsError;

      // Reload conversations
      await loadConversations();

      return newConversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    }
  };

  // Send message
  const sendMessage = async (conversationId: string, content: string): Promise<boolean> => {
    if (!user || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get messages for a conversation
  const getMessages = async (conversationId: string): Promise<Message[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  // Mark messages as read
  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    if (user) {
      loadConversations();
      loadFriends().then(setFriends);
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
    markAsRead
  };
};