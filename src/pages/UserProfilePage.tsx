
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useFriendshipStatus } from '@/hooks/useFriendshipStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { UserPlus, Check, Clock } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading: authLoading } = useSupabaseAuth();
  const { profile, posts, loading: profileLoading, error } = useUserProfile(userId);
  const { status: friendshipStatus, sendFriendRequest, loading: friendshipLoading } = useFriendshipStatus(userId);
  const navigate = useNavigate();

  const handleNavChange = (tab: string) => {
    navigate(`/?tab=${tab}`);
  };

  const loading = authLoading || profileLoading;

  const renderFriendButton = () => {
    if (friendshipLoading || !user || user.id === userId) return null;

    switch (friendshipStatus) {
      case 'friends':
        return <Button variant="outline" disabled><Check className="mr-2 h-4 w-4" /> Friends</Button>;
      case 'request_sent':
        return <Button variant="outline" disabled><Clock className="mr-2 h-4 w-4" /> Request Sent</Button>;
      case 'request_received':
        return <Button asChild><Link to="/?tab=friends">Respond to Request</Link></Button>;
      case 'not_friends':
        return <Button onClick={() => sendFriendRequest()}><UserPlus className="mr-2 h-4 w-4" /> Add Friend</Button>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={user?.id === userId ? 'profile' : ''} onTabChange={handleNavChange}/>
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading profile...</div>
        ) : error || !profile ? (
          <div className="text-center py-8 text-red-500">Error loading profile.</div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-6 mb-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar || undefined} />
                    <AvatarFallback className="text-2xl">
                      {profile.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{profile.username}</h2>
                    <p className="text-gray-600">{profile.email}</p>
                     <p className="text-sm text-gray-500">
                        Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                  {renderFriendButton()}
                </div>
                 <div>
                    <h3 className="font-medium text-gray-700">Bio</h3>
                    <p className="text-gray-600">{profile.bio || 'No bio added yet.'}</p>
                  </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Posts ({posts?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {posts && posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="p-4 border rounded-lg">
                        <p className="mb-2">{post.content}</p>
                         {post.image && (
                          <img src={post.image} alt="Post content" className="w-full rounded-lg mb-4 max-h-96 object-cover"/>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{post.likes?.length || 0} likes</span>
                          <span>{post.shares || 0} shares</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    This user hasn't posted anything yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
