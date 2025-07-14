
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { FriendshipStatus } from '@/types';

const fetchFriendshipStatus = async (profileId: string, token: string | null): Promise<FriendshipStatus> => {
  const res = await fetch(`/api/friendships/status/${profileId}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch friendship status');
  const data = await res.json();
  return data.status;
};

export const useFriendshipStatus = (profileId: string | undefined) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ['friendshipStatus', user?.id, profileId],
    queryFn: () => fetchFriendshipStatus(profileId!, token),
    enabled: !!user && !!profileId && user.id !== profileId,
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async () => {
      if (!user || !profileId || status !== 'not_friends') throw new Error("Cannot send friend request");
      const res = await fetch("/api/friendships/request", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ friendId: profileId }),
      });
      if (!res.ok) throw new Error("Could not send friend request");
    },
    onSuccess: () => {
      toast({ title: "Friend request sent!" });
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus', user?.id, profileId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Could not send friend request.", variant: 'destructive' });
      console.error(error);
    },
  });

  const refetchStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['friendshipStatus', user?.id, profileId] });
  };

  return {
    status: status ?? 'not_friends',
    loading: isLoading || sendFriendRequestMutation.isPending,
    sendFriendRequest: sendFriendRequestMutation.mutate,
    refetchStatus,
  };
};
