
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';

export type FriendshipStatus = 'friends' | 'request_sent' | 'request_received' | 'not_friends';

const fetchFriendshipStatus = async (currentUserId: string, profileId: string): Promise<FriendshipStatus> => {
    const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`(user1_id.eq.${currentUserId},user2_id.eq.${profileId}),(user1_id.eq.${profileId},user2_id.eq.${currentUserId})`)
        .maybeSingle();

    if (friendship) {
        return 'friends';
    }

    const { data: sentRequest } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', currentUserId)
        .eq('receiver_id', profileId)
        .eq('status', 'pending')
        .maybeSingle();
    
    if (sentRequest) {
        return 'request_sent';
    }

    const { data: receivedRequest } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', profileId)
        .eq('receiver_id', currentUserId)
        .eq('status', 'pending')
        .maybeSingle();

    if(receivedRequest) {
        return 'request_received';
    }
    
    return 'not_friends';
};

export const useFriendshipStatus = (profileId: string | undefined) => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
      queryKey: ['friendshipStatus', user?.id, profileId],
      queryFn: () => fetchFriendshipStatus(user!.id, profileId!),
      enabled: !!user && !!profileId && user.id !== profileId
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async () => {
        if (!user || !profileId || status !== 'not_friends') throw new Error("Cannot send friend request");
        const { error } = await supabase
            .from('friend_requests')
            .insert({ sender_id: user.id, receiver_id: profileId });
        if (error) throw error;
    },
    onSuccess: () => {
        toast({ title: "Friend request sent!" });
        queryClient.invalidateQueries({ queryKey: ['friendshipStatus', user?.id, profileId] });
    },
    onError: (error) => {
        toast({ title: "Error", description: "Could not send friend request.", variant: 'destructive' });
        console.error(error);
    }
  });

  // Add a refetch method so components can force-update the status
  const refetchStatus = () => {
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus', user?.id, profileId] });
  };

  return {
    status: status ?? 'not_friends',
    loading: isLoading || sendFriendRequestMutation.isPending,
    sendFriendRequest: sendFriendRequestMutation.mutate,
    refetchStatus
  };
};
