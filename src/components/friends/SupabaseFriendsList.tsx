
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Users } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export const SupabaseFriendsList: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'discover' | 'requests'>('friends');
  const [friends, setFriends] = useState<Profile[]>([]);
  const [friendRequests, setFriendRequests] = useState<Profile[]>([]);

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id);

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          profiles!friendships_user1_id_fkey(*),
          profiles!friendships_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

      if (error) throw error;

      const friendProfiles = data?.map(friendship => {
        return friendship.user1_id === user?.id 
          ? friendship.profiles 
          : friendship.profiles;
      }).filter(Boolean) || [];

      setFriends(friendProfiles);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          profiles!friend_requests_sender_id_fkey(*)
        `)
        .eq('receiver_id', user?.id)
        .eq('status', 'pending');

      if (error) throw error;

      const requestProfiles = data?.map(request => request.profiles).filter(Boolean) || [];
      setFriendRequests(requestProfiles);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert([{
          sender_id: user.id,
          receiver_id: targetUserId,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({ title: "Friend request sent!" });
      fetchUsers();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({ title: "Error", description: "Failed to send friend request", variant: "destructive" });
    }
  };

  const acceptFriendRequest = async (senderId: string) => {
    if (!user) return;

    try {
      // Update friend request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id);

      if (updateError) throw updateError;

      // Create friendship
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert([{
          user1_id: senderId,
          user2_id: user.id
        }]);

      if (friendshipError) throw friendshipError;

      toast({ title: "Friend request accepted!" });
      fetchFriends();
      fetchFriendRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({ title: "Error", description: "Failed to accept friend request", variant: "destructive" });
    }
  };

  const rejectFriendRequest = async (senderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id);

      if (error) throw error;

      toast({ title: "Friend request rejected" });
      fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({ title: "Error", description: "Failed to reject friend request", variant: "destructive" });
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const discoveredUsers = filteredUsers.filter(u => 
    !friends.some(friend => friend.id === u.id) && 
    !friendRequests.some(request => request.id === u.id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === 'friends' ? 'default' : 'outline'}
          onClick={() => setActiveTab('friends')}
          className="flex items-center space-x-2"
        >
          <Users size={16} />
          <span>Friends ({friends.length})</span>
        </Button>
        <Button
          variant={activeTab === 'discover' ? 'default' : 'outline'}
          onClick={() => setActiveTab('discover')}
          className="flex items-center space-x-2"
        >
          <UserPlus size={16} />
          <span>Discover</span>
        </Button>
        <Button
          variant={activeTab === 'requests' ? 'default' : 'outline'}
          onClick={() => setActiveTab('requests')}
          className="flex items-center space-x-2"
        >
          <UserPlus size={16} />
          <span>Requests ({friendRequests.length})</span>
        </Button>
      </div>

      {activeTab !== 'requests' && (
        <div className="mb-6">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      {activeTab === 'friends' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Friends</CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{friend.username}</p>
                      <p className="text-sm text-gray-500">{friend.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                You don't have any friends yet. Start by discovering new people!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'discover' && (
        <Card>
          <CardHeader>
            <CardTitle>Discover New Friends</CardTitle>
          </CardHeader>
          <CardContent>
            {discoveredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoveredUsers.map((discoveredUser) => (
                  <div key={discoveredUser.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={discoveredUser.avatar} />
                      <AvatarFallback>{discoveredUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{discoveredUser.username}</p>
                      <p className="text-sm text-gray-500">{discoveredUser.bio}</p>
                      <Button
                        size="sm"
                        onClick={() => sendFriendRequest(discoveredUser.id)}
                        className="mt-2"
                      >
                        Add Friend
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No new users to discover right now.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {friendRequests.length > 0 ? (
              <div className="space-y-4">
                {friendRequests.map((requester) => (
                  <div key={requester.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={requester.avatar} />
                        <AvatarFallback>{requester.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{requester.username}</p>
                        <p className="text-sm text-gray-500">{requester.bio}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => acceptFriendRequest(requester.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectFriendRequest(requester.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No friend requests at the moment.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
