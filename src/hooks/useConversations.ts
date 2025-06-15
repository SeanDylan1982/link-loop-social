
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Tables } from '@/integrations/supabase/types';

export type Conversation = Tables<'conversations'> & { participants: { id: string, username: string, avatar: string | null }[] };
export type ConversationParticipant = Tables<'conversation_participants'>;

const getUserConversations = async (userId: string) => {
  // Fetch conversations where user is a participant, including participants and their profile.
  // Participants profile: join via conversation_participants and profiles
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
    .in('id', 
      (
        await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', userId)
      ).data?.map(cp => cp.conversation_id) || []
    )
    .order('updated_at', { ascending: false });

  if (error) throw error;
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

const getAllProfiles = async (excludeId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .neq('id', excludeId);
  if (error) throw error;
  return data || [];
};

const createGroupConversation = async ({
  title, participantIds, isGroup
}: { title: string; participantIds: string[]; isGroup: boolean }) => {
  // Create conversation
  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert([
      { title, is_group: isGroup }
    ])
    .select()
    .single();
  if (error) throw error;

  // Add participants (must include the creator)
  const participantsToAdd = participantIds.map(id => ({
    conversation_id: conversation.id,
    user_id: id
  }));
  await supabase.from('conversation_participants').insert(participantsToAdd);

  return conversation;
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
    mutationFn: createGroupConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    }
  });

  return {
    conversations: conversations ?? [],
    getProfiles,
    isLoading,
    createConversation: createConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,
  };
};
