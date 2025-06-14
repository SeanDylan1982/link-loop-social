
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Users } from 'lucide-react';

export const FriendsList: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'discover' | 'requests'>('friends');

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('socialUsers') || '[]');
    setAllUsers(users);
  }, []);

  const sendFriendRequest = (targetUserId: string) => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('socialUsers') || '[]');
    const targetUserIndex = users.findIndex((u: User) => u.id === targetUserId);
    
    if (targetUserIndex > -1) {
      if (!users[targetUserIndex].friendRequests.includes(user.id)) {
        users[targetUserIndex].friendRequests.push(user.id);
        localStorage.setItem('socialUsers', JSON.stringify(users));
        setAllUsers(users);
        toast({ title: "Friend request sent!" });
      }
    }
  };

  const acceptFriendRequest = (senderId: string) => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('socialUsers') || '[]');
    
    // Add each other as friends
    const currentUserIndex = users.findIndex((u: User) => u.id === user.id);
    const senderIndex = users.findIndex((u: User) => u.id === senderId);
    
    if (currentUserIndex > -1 && senderIndex > -1) {
      // Remove from friend requests
      users[currentUserIndex].friendRequests = users[currentUserIndex].friendRequests.filter((id: string) => id !== senderId);
      
      // Add as friends
      if (!users[currentUserIndex].friends.includes(senderId)) {
        users[currentUserIndex].friends.push(senderId);
      }
      if (!users[senderIndex].friends.includes(user.id)) {
        users[senderIndex].friends.push(user.id);
      }
      
      localStorage.setItem('socialUsers', JSON.stringify(users));
      updateUser(users[currentUserIndex]);
      setAllUsers(users);
      toast({ title: "Friend request accepted!" });
    }
  };

  const rejectFriendRequest = (senderId: string) => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('socialUsers') || '[]');
    const currentUserIndex = users.findIndex((u: User) => u.id === user.id);
    
    if (currentUserIndex > -1) {
      users[currentUserIndex].friendRequests = users[currentUserIndex].friendRequests.filter((id: string) => id !== senderId);
      localStorage.setItem('socialUsers', JSON.stringify(users));
      updateUser(users[currentUserIndex]);
      setAllUsers(users);
      toast({ title: "Friend request rejected" });
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.id !== user?.id && 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const friends = allUsers.filter(u => user?.friends.includes(u.id));
  const friendRequests = allUsers.filter(u => user?.friendRequests.includes(u.id));
  const discoveredUsers = filteredUsers.filter(u => 
    !user?.friends.includes(u.id) && 
    !user?.friendRequests.includes(u.id) &&
    !u.friendRequests.includes(user?.id || '')
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
