
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';

export type Conversation = Tables<'conversations'> & { 
  participants: { id: string, username: string, avatar: string | null }[];
  lastMessage?: string | null;
};
export type ConversationParticipant = Tables<'conversation_participants'>;

// Fetch all conversations for a user
const getUserConversations = async (userId: string) => {
  console.log('[getUserConversations] Starting fetch for userId:', userId);
  
  // Fetch list of conversation IDs for this user as participant
  const { data: participationRows, error: partErr } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId,)
    
  if (partErr) {
    console.error('[getUserConversations] participationRows error:', partErr);
    throw partErr;
  }
  
  const ids = participationRows?.map(cp => cp.conversation_id) || [];
  console.log('[getUserConversations] conversation IDs:', ids);

  if (ids.length === 0) {
    console.log('[getUserConversations] No conversation_participants found for userId:', userId);
    return [];
  }

  // Now fetch conversation details with last message
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants (
        user_id,
        profiles!conversation_participants_user_id_fkey (
          id, username, avatar
        )
      ),
      last_message:messages (
        content,
        created_at
      )
    `)
    .in('id', ids)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('[getUserConversations] conversations fetch error:', error);
    throw error;
  }
  
  console.log('[getUserConversations] conversations fetch data:', data);

  // Flatten for UI and ensure we have proper profile data
  const conversationsWithProfiles = await Promise.all(
    (data || []).map(async (c: any) => {
      // Get participant profiles separately if not loaded properly
      const participantIds = (c.participants || []).map((p: any) => p.user_id).filter(Boolean);
      
      let participantProfiles = [];
      if (participantIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar')
          .in('id', participantIds);
        
        participantProfiles = participantIds.map(id => {
          const profile = profiles?.find(p => p.id === id);
          return {
            id: id,
            username: profile?.username || 'Unknown User',
            avatar: profile?.avatar
          };
        });
      }
      
      return {
        ...c,
        participants: participantProfiles,
        lastMessage: c.last_message?.[0]?.content || null,
      };
    })
  );
  
  return conversationsWithProfiles as Conversation[];
};

// Fetch all profiles except yours
const getAllProfiles = async (excludeId: string) => {
  console.log('[getAllProfiles] Fetching profiles excluding:', excludeId);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .neq('id', excludeId);
  if (error) {
    console.error('[getAllProfiles] error:', error);
    throw error;
  }
  console.log('[getAllProfiles] result:', data?.length, 'profiles');
  return data || [];
};

// Create conversation (group)
const createGroupConversation = async ({
  title, participantIds, isGroup, creatorId
}: { title: string; participantIds: string[]; isGroup: boolean; creatorId: string }) => {
  console.log('[createGroupConversation] Creating with:', { title, participantIds, isGroup, creatorId });
  
  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert([
      { title, is_group: isGroup, creator_id: creatorId }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('[createGroupConversation] conversation error:', error);
    throw error;
  }

  // Add participants including the creator
  const allParticipantIds = [...new Set([creatorId, ...participantIds])]; // Use Set to avoid duplicates
  const participantsToAdd = allParticipantIds.map(id => ({
    conversation_id: conversation.id,
    user_id: id
  }));
  
  console.log('[createGroupConversation] Adding participants:', participantsToAdd);
  
  const { error: participantError } = await supabase
    .from('conversation_participants')
    .insert(participantsToAdd);
  
  if (participantError) {
    console.error('[createGroupConversation] participant error:', participantError);
    throw participantError;
  }

  console.log('[createGroupConversation] Success, conversation:', conversation);
  return conversation;
};

// Get your friends for the DM dialog
const getFriendsList = async (userId: string) => {
  console.log('[getFriendsList] Fetching friends for userId:', userId);
  
  // Get friendships where you're user1 or user2, and get profile for the other user
  const { data: friendships, error } = await supabase
    .from('friendships')
    .select('user1_id, user2_id');
  
  if (error) {
    console.error('[getFriendsList] friendships error:', error);
    throw error;
  }
  
  if (!friendships) return [];
  
  const friendIds = friendships
    .filter(f => f.user1_id === userId || f.user2_id === userId)
    .map(f => f.user1_id === userId ? f.user2_id : f.user1_id);
  
  console.log('[getFriendsList] Friend IDs:', friendIds);
  
  if (friendIds.length === 0) return [];
  
  const { data: friendProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .in('id', friendIds);
  
  if (profilesError) {
    console.error('[getFriendsList] profiles error:', profilesError);
    throw profilesError;
  }
  
  console.log('[getFriendsList] Friend profiles:', friendProfiles?.length);
  return friendProfiles || [];
};

// Find or create a direct (private) conversation between two users
const getOrCreateDirectConversation = async ({
  userId,
  friendId,
}: { userId: string, friendId: string }) => {
  console.log('[getOrCreateDirectConversation] Finding/creating DM between:', userId, 'and', friendId)
  
  if (userId === friendId) {
    console.error('[getOrCreateDirectConversation] Cannot create DM with yourself');
    throw new Error('Cannot create DM with yourself');
  }
  
  // 1. Search for existing direct conversation with both participants, is_group false
  const { data: candidateConvs, error } = await supabase
    .from('conversations')
    .select('id')
    .eq('is_group', false);

  if (error) {
    console.error('[getOrCreateDirectConversation] error fetching conversations:', error);
    throw error;
  }
  
  // For each, check if both userId and friendId exist in conversation_participants (exactly two participants)
  for (const conv of candidateConvs || []) {
    // Fetch participants for this conversation
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conv.id);
    const participantIds = (parts || []).map(p => p.user_id);
    if (participantIds.length === 2 && participantIds.includes(userId) && participantIds.includes(friendId)) {
      console.log('[getOrCreateDirectConversation] Found existing DM:', conv.id);
      return { id: conv.id };
    }
  }
  
  // 2. Otherwise create direct conversation, setting creator_id
  console.log('[getOrCreateDirectConversation] Creating new DM');
  const { data: conversation, error: cError } = await supabase
    .from('conversations')
    .insert([{ title: null, is_group: false, creator_id: userId }])
    .select()
    .single();
  
  if (cError) {
    console.error('[getOrCreateDirectConversation] error creating conversation:', cError);
    throw cError;
  }
  
  // Insert participants with error handling
  const { error: participantError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: conversation.id, user_id: userId },
      { conversation_id: conversation.id, user_id: friendId }
    ]);
  
  if (participantError) {
    console.error('[getOrCreateDirectConversation] error adding participants:', participantError);
    throw participantError;
  }
  
  // Send initial message to start the conversation
  try {
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    
    const initialMessage = `👋 ${senderProfile?.username || 'Someone'} started a conversation with you!`;
    
    // Insert the initial message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: userId,
        receiver_id: friendId,
        content: initialMessage,
        created_at: new Date().toISOString()
      });
    
    if (messageError) {
      console.error('[getOrCreateDirectConversation] error creating initial message:', messageError);
    } else {
      console.log('[getOrCreateDirectConversation] Initial message created');
    }
    
    // Create notification for the friend
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: friendId,
        type: 'message',
        related_id: conversation.id,
        content: initialMessage,
      });
    
    if (notifError) {
      console.error('[getOrCreateDirectConversation] error creating notification:', notifError);
    } else {
      console.log('[getOrCreateDirectConversation] Notification created for friend:', friendId);
    }
  } catch (err) {
    console.error('[getOrCreateDirectConversation] Error creating initial message/notification:', err);
  }
  
  console.log('[getOrCreateDirectConversation] Created new DM:', conversation.id, ' and ', + friendId);
  
  // Force immediate refresh for both users
  setTimeout(() => {
    console.log('[getOrCreateDirectConversation] Triggering conversation list refresh');
    // This will be picked up by the real-time subscription
  }, 100);
  
  return { id: conversation.id };
};

export const useConversations = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => getUserConversations(user!.id),
    enabled: !!user,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 100, // Don't cache to ensure fresh data
  });

  // Force refresh conversations when hook is used
  React.useEffect(() => {
    if (user) {
      console.log('[useConversations] Force refreshing conversations for user:', user.id);
      refetch();
    }
  }, [user?.id, refetch]);



  const getProfiles = async () => {
    if (!user) throw new Error("Not authenticated");
    return getAllProfiles(user.id);
  };

  const createConversationMutation = useMutation({
    mutationFn: (args: { title: string; participantIds: string[]; isGroup: boolean }) =>
      createGroupConversation({ ...args, creatorId: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    }
  });

  // Get friends for DMs
  const getFriends = async () => {
    if (!user) throw new Error("Not authenticated");
    return getFriendsList(user.id);
  };

  // Logic for finding/creating direct conversations
  const getOrCreateDM = async (friendId: string) => {
    if (!user) throw new Error("Not authenticated");
    const conv = await getOrCreateDirectConversation({ userId: user.id, friendId });
    // Invalidate queries for both users to ensure real-time updates
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    return conv;
  };

  return {
    conversations: conversations ?? [],
    getProfiles,
    isLoading,
    createConversation: createConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,
    // New for DMs:
    getFriends,
    getOrCreateDM,
  };
};
