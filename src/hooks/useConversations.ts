
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';

export type Conversation = Tables<'conversations'> & { participants: { id: string, username: string, avatar: string | null }[] };
export type ConversationParticipant = Tables<'conversation_participants'>;

// Fetch all conversations for a user
const getUserConversations = async (userId: string) => {
  // Fetch list of conversation IDs for this user as participant
  const { data: participationRows, error: partErr } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);
  console.log('[getUserConversations] participationRows:', participationRows);
  if (partErr) {
    console.error('[getUserConversations] participationRows error:', partErr);
    throw partErr;
  }
  const ids = participationRows?.map(cp => cp.conversation_id) || [];
  console.log('[getUserConversations] conversation IDs:', ids);

  if (ids.length === 0) {
    console.warn('[getUserConversations] No conversation_participants found for userId:', userId);
    return [];
  }

  // Now fetch conversation details if there are any
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants (
        user_id,
        profiles:profiles (
          id, username, avatar
        )
      )
    `)
    .in('id', ids)
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('[getUserConversations] conversations fetch error:', error);
    throw error;
  }
  console.log('[getUserConversations] conversations fetch data:', data);

  // Flatten for UI
  return (data || []).map((c: any) => ({
    ...c,
    participants: (c.participants ?? []).map((p: any) => ({
      id: p.profiles?.id,
      username: p.profiles?.username,
      avatar: p.profiles?.avatar,
    })).filter((p: any) => p.id),
  })) as Conversation[];
};

// Fetch all profiles except yours
const getAllProfiles = async (excludeId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .neq('id', excludeId);
  if (error) throw error;
  return data || [];
};

// Create conversation (group)
const createGroupConversation = async ({
  title, participantIds, isGroup, creatorId
}: { title: string; participantIds: string[]; isGroup: boolean; creatorId: string }) => {
  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert([
      { title, is_group: isGroup, creator_id: creatorId }
    ])
    .select()
    .single();
  if (error) throw error;

  // Add participants including the creator
  const allParticipantIds = [...new Set([creatorId, ...participantIds])]; // Use Set to avoid duplicates
  const participantsToAdd = allParticipantIds.map(id => ({
    conversation_id: conversation.id,
    user_id: id
  }));
  
  const { error: participantError } = await supabase
    .from('conversation_participants')
    .insert(participantsToAdd);
  
  if (participantError) throw participantError;

  return conversation;
};

// Get your friends for the DM dialog
const getFriendsList = async (userId: string) => {
  // Get friendships where you're user1 or user2, and get profile for the other user
  const { data: friendships } = await supabase
    .from('friendships')
    .select('user1_id, user2_id');
  if (!friendships) return [];
  const friendIds = friendships
    .filter(f => f.user1_id === userId || f.user2_id === userId)
    .map(f => f.user1_id === userId ? f.user2_id : f.user1_id);
  if (friendIds.length === 0) return [];
  const { data: friendProfiles } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .in('id', friendIds);
  return friendProfiles || [];
};

// Find or create a direct (private) conversation between two users
const getOrCreateDirectConversation = async ({
  userId,
  friendId,
}: { userId: string, friendId: string }) => {
  // 1. Search for existing direct conversation with both participants, is_group false
  const { data: candidateConvs, error } = await supabase
    .from('conversations')
    .select('id')
    .eq('is_group', false);

  if (error) throw error;
  // For each, check if both userId and friendId exist in conversation_participants (exactly two participants)
  for (const conv of candidateConvs || []) {
    // Fetch participants for this conversation
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conv.id);
    const participantIds = (parts || []).map(p => p.user_id);
    if (participantIds.length === 2 && participantIds.includes(userId) && participantIds.includes(friendId)) {
      return { id: conv.id };
    }
  }
  // 2. Otherwise create direct conversation, setting creator_id
  const { data: conversation, error: cError } = await supabase
    .from('conversations')
    .insert([{ title: null, is_group: false, creator_id: userId }])
    .select()
    .single();
  if (cError) throw cError;
  // Insert participants
  await supabase.from('conversation_participants').insert([
    { conversation_id: conversation.id, user_id: userId },
    { conversation_id: conversation.id, user_id: friendId }
  ]);
  return { id: conversation.id };
};

export const useConversations = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => getUserConversations(user!.id),
    enabled: !!user,
  });

  const getProfiles = () =>
    getAllProfiles(user!.id);

  const createConversationMutation = useMutation({
    mutationFn: (args: { title: string; participantIds: string[]; isGroup: boolean }) =>
      createGroupConversation({ ...args, creatorId: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    }
  });

  // Get friends for DMs
  const getFriends = () => getFriendsList(user!.id);

  // Logic for finding/creating direct conversations
  const getOrCreateDM = async (friendId: string) => {
    if (!user) throw new Error("Not authenticated");
    const conv = await getOrCreateDirectConversation({ userId: user.id, friendId });
    queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
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
