
import React, { useEffect, useState, useCallback } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type FriendRequest = Tables<'friend_requests'> & { profiles: Profile };

export const SupabaseFriendsList: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendsAndRequests = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (friendshipsError) throw friendshipsError;

      const friendIds = friendships.map(f => f.user1_id === user.id ? f.user2_id : f.user1_id);

      if (friendIds.length > 0) {
        const { data: friendProfiles, error: friendProfilesError } = await supabase
          .from('profiles').select('*').in('id', friendIds);
        if (friendProfilesError) throw friendProfilesError;
        setFriends(friendProfiles || []);
      } else {
        setFriends([]);
      }

      const { data: friendRequests, error: requestsError } = await supabase
        .from('friend_requests')
        .select(`*, profiles:sender_id (*)`)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
      
      if (requestsError) throw requestsError;
      setRequests((friendRequests as any) || []);

    } catch (error) {
      console.error('Error fetching friends data:', error);
      toast({ title: "Error", description: "Could not load friends data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFriendsAndRequests();
  }, [fetchFriendsAndRequests]);

  const handleRequest = async (request: FriendRequest, accepted: boolean) => {
    if (!user) return;
    
    if (accepted) {
      const { error: friendshipError } = await supabase.from('friendships').insert({ user1_id: user.id, user2_id: request.sender_id });
      if (friendshipError) {
        console.error('Error creating friendship:', friendshipError);
        toast({ title: "Error", description: "Could not accept request.", variant: "destructive" });
        return;
      }
    }
    
    const { error: updateError } = await supabase.from('friend_requests').update({ status: accepted ? 'accepted' : 'rejected' }).eq('id', request.id);

    if (updateError) {
      console.error('Error updating request:', updateError);
      toast({ title: "Error", description: "Could not process request.", variant: "destructive" });
    } else {
      toast({ title: `Request ${accepted ? 'accepted' : 'rejected'}` });
      fetchFriendsAndRequests();
    }
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
                      <Button size="sm" onClick={() => handleRequest(request, true)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleRequest(request, false)}>Decline</Button>
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
