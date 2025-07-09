
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';
import { useNotificationSender } from '@/hooks/useNotificationSender';

export type FriendshipStatus = 'friends' | 'request_sent' | 'request_received' | 'not_friends';

const fetchFriendshipStatus = async (currentUserId: string, profileId: string): Promise<FriendshipStatus> => {
    try {
        // Get current user's profile to check friends list
        const { data: currentUserProfile } = await supabase
            .from('profiles')
            .select('friends')
            .eq('id', currentUserId)
            .single();
        
        console.log('[FriendshipStatus] Current user friends:', currentUserProfile?.friends);
        console.log('[FriendshipStatus] Checking if', profileId, 'is in friends list');
        
        // Check if profileId is in the friends array
        if (currentUserProfile?.friends && Array.isArray(currentUserProfile.friends)) {
            const isFriend = currentUserProfile.friends.includes(profileId);
            console.log('[FriendshipStatus] Is friend?', isFriend);
            if (isFriend) {
                return 'friends';
            }
        }
        
        // For now, return not_friends if not in friends list
        // You can add friend request logic here later if needed
        return 'not_friends';
        
    } catch (error) {
        console.error('[FriendshipStatus] Error checking friendship:', error);
        return 'not_friends';
    }
};

export const useFriendshipStatus = (profileId: string | undefined) => {
  const { user, profile } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const { sendNotification } = useNotificationSender();

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
        // Send notification to the recipient
        if (profileId && user) {
          sendNotification({
            recipientId: profileId,
            type: 'friend_request',
            content: `${profile?.username || user.email} sent you a friend request`,
            relatedId: user.id,
          });
        }
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
