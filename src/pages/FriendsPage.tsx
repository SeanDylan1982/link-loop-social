import React from 'react';
import { useFriendshipStatus } from '@/hooks/useFriendshipStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FriendsPage: React.FC = () => {
  // This is a placeholder for the actual friends data
  const friends: any[] = [];
  const pendingRequests: any[] = [];
  const suggestedFriends: any[] = [];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length > 0 ? (
                <ul>
                  {friends.map((friend) => (
                    <li key={friend.id}>{friend.username}</li>
                  ))}
                </ul>
              ) : (
                <p>You have no friends yet.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <ul>
                  {pendingRequests.map((request) => (
                    <li key={request.id}>
                      {request.sender.username}
                      <Button size="sm" className="ml-2">Accept</Button>
                      <Button size="sm" variant="destructive" className="ml-2">Decline</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No pending friend requests.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Suggested Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {suggestedFriends.length > 0 ? (
                <ul>
                  {suggestedFriends.map((friend) => (
                    <li key={friend.id}>
                      {friend.username}
                      <Button size="sm" className="ml-2">Add Friend</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No suggested friends.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
