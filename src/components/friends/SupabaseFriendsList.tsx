
import React from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from '@/integrations/supabase/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Profile = Tables<'profiles'>;
type FriendRequest = Tables<'friend_requests'> & { profiles: Profile };

const fetchFriends = async (userId: string) => {
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('user1_id, user2_id')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (friendshipsError) throw friendshipsError;

  const friendIds = friendships.map(f => f.user1_id === userId ? f.user2_id : f.user1_id);

  if (friendIds.length > 0) {
    const { data: friendProfiles, error: friendProfilesError } = await supabase
      .from('profiles').select('*').in('id', friendIds);
    if (friendProfilesError) throw friendProfilesError;
    return friendProfiles || [];
  }
  return [];
};

const fetchFriendRequests = async (userId: string) => {
  const { data: friendRequests, error: requestsError } = await supabase
    .from('friend_requests')
    .select(`*, profiles:sender_id (*)`)
    .eq('receiver_id', userId)
    .eq('status', 'pending');
  
  if (requestsError) throw requestsError;
  return (friendRequests as any[] || []) as FriendRequest[];
};

export const SupabaseFriendsList: React.FC = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: () => fetchFriends(user!.id),
    enabled: !!user,
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['friendRequests', user?.id],
    queryFn: () => fetchFriendRequests(user!.id),
    enabled: !!user,
  });

  const handleRequestMutation = useMutation({
    mutationFn: async ({ request, accepted }: { request: FriendRequest, accepted: boolean }) => {
      if (!user) throw new Error("User not authenticated");
      
      if (accepted) {
        const { error: friendshipError } = await supabase.from('friendships').insert({ user1_id: user.id, user2_id: request.sender_id });
        if (friendshipError) {
          if (friendshipError.code !== '23505') {
            throw friendshipError;
          }
        }
      }
      
      const { error: updateError } = await supabase.from('friend_requests').update({ status: accepted ? 'accepted' : 'rejected' }).eq('id', request.id);
      if (updateError) throw updateError;
      
      return { accepted, senderId: request.sender_id };
    },
    onSuccess: ({ accepted, senderId }) => {
      toast({ title: `Request ${accepted ? 'accepted' : 'rejected'}` });
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus', user?.id, senderId] });
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus', senderId, user?.id] });
    },
    onError: (error: any) => {
      console.error('Error handling request:', error);
      toast({ title: "Error", description: "Could not process request.", variant: "destructive" });
    },
  });

  const loading = friendsLoading || requestsLoading;

  const handleRequest = (request: FriendRequest, accepted: boolean) => {
    handleRequestMutation.mutate({ request, accepted });
  };

  return (
    <Tabs defaultValue="friends" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
        <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="friends">
        <Card>
          <CardHeader>
            <CardTitle>Your Friends</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <Link to={`/profile/${friend.id}`} key={friend.id} className="p-3 border rounded-lg flex items-center space-x-3 hover:bg-accent">
                    <Avatar>
                      <AvatarImage src={friend.avatar || undefined} />
                      <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{friend.username}</span>
                  </Link>
                ))}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No friends yet.</p>}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="requests">
        <Card>
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <Link to={`/profile/${request.sender_id}`} className="flex items-center space-x-3 hover:underline">
                      <Avatar>
                        <AvatarImage src={request.profiles.avatar || undefined} />
                        <AvatarFallback>{request.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{request.profiles.username}</span>
                    </Link>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleRequest(request, true)} disabled={handleRequestMutation.isPending}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleRequest(request, false)} disabled={handleRequestMutation.isPending}>Decline</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No new friend requests.</p>}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
