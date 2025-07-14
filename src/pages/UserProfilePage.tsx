import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { useFriendshipStatus } from '@/hooks/useFriendshipStatus';
import { useConversations } from '@/hooks/useConversations';
import { useComments } from '@/hooks/useComments';
import { usePosts } from '@/hooks/usePosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { UserPlus, Clock, MessageCircle, Link as LinkIcon, Globe, Github, Twitter, Instagram, Linkedin, Facebook, Youtube } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { profile, posts, loading: profileLoading, error } = useUserProfile(userId);
  const { status: friendshipStatus, sendFriendRequest, loading: friendshipLoading } = useFriendshipStatus(userId);
  const { getOrCreateDM } = useConversations();
  const { comments } = useComments('');
  const { posts: allPosts } = usePosts();
  const navigate = useNavigate();

  const handleNavChange = (tab: string) => {
    navigate(`/?tab=${tab}`);
  };

  const loading = authLoading || profileLoading;
  
  const userComments = comments?.filter((comment) => comment.user_id === userId);
  const userLikes = allPosts?.filter((post) => post.likes?.includes(userId || ''));
  
  const getSocialIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Facebook, Twitter, Instagram, Linkedin, Github, Youtube, Globe, LinkIcon
    };
    const IconComponent = icons[iconName] || LinkIcon;
    return <IconComponent className="w-4 h-4" />;
  };

  // Show the Send Message button if users are friends (do not show for own profile)
  const renderSendMessageButton = () => {
    if (!user || !userId || user.id === userId) return null;
    if (friendshipStatus === 'friends') {
      return (
        <Button onClick={async () => {
          try {
            const conversation = await getOrCreateDM(userId);
            navigate(`/conversation/${conversation.id}`);
          } catch (error) {
            console.error('Error creating conversation:', error);
          }
        }}>
          <MessageCircle className="mr-2 h-4 w-4" /> Send Message
        </Button>
      );
    }
    return null;
  };

  // Render the add/request/respond buttons as before for non-friend states
  const renderFriendControls = () => {
    if (friendshipLoading || !user || user.id === userId) return null;
    if (friendshipStatus === 'friends') {
      return null; // Message button shown above
    }
    if (friendshipStatus === 'not_friends') {
      return (
        <Button onClick={() => sendFriendRequest()}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Friend
        </Button>
      );
    }
    if (friendshipStatus === 'request_sent') {
      return (
        <Button variant="outline" disabled>
          <Clock className="mr-2 h-4 w-4" /> Request Sent
        </Button>
      );
    }
    if (friendshipStatus === 'request_received') {
      return (
        <Button asChild>
          <Link to="/?tab=friends">Respond to Request</Link>
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-sidebar">
      <Navbar activeTab={user?.id === userId ? 'profile' : ''} onTabChange={handleNavChange}/>
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading profile...</div>
        ) : error || !profile ? (
          <div className="text-center py-8 text-red-500">Error loading profile.</div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-0">
                {/* Banner Image with overlay profile info */}
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  {profile.banner ? (
                    <img 
                      src={profile.banner} 
                      alt="Profile banner" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
                  )}
                  
                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Profile info overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div className="flex items-end space-x-4">
                      <Avatar className="w-24 h-24 border-4 border-white">
                        <AvatarImage src={profile.avatar || undefined} />
                        <AvatarFallback className="text-2xl text-gray-900">
                          {profile.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="pb-2">
                        <h2 className="text-2xl font-bold text-white drop-shadow-lg">{profile.username}</h2>
                        <p className="text-white/90 drop-shadow">{profile.email}</p>
                        <p className="text-sm text-white/80 drop-shadow">
                          Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end pb-2">
                      {renderSendMessageButton()}
                      {renderFriendControls()}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700">Bio</h3>
                      <p className="text-gray-600">{profile.bio || 'No bio added yet.'}</p>
                    </div>
                    
                    {/* Social Links */}
                    {profile.social_links && Array.isArray(profile.social_links) && profile.social_links.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Social Links</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.social_links.map((link: any, index: number) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                            >
                              {getSocialIcon(link.icon)}
                              {link.platform}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="posts">Posts ({posts?.length || 0})</TabsTrigger>
                    <TabsTrigger value="likes">Likes ({userLikes?.length || 0})</TabsTrigger>
                    <TabsTrigger value="comments">Comments ({userComments?.length || 0})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="mt-6">
                    <div className="space-y-4">
                      {[
                        { label: 'Full Name', value: profile.full_name },
                        { label: 'Nickname', value: profile.nickname },
                        { label: 'Address', value: profile.address },
                        { label: 'School', value: profile.school },
                        { label: 'University', value: profile.university },
                        { label: 'Workplace', value: profile.workplace }
                      ].map(({ label, value }) => (
                        value && (
                          <div key={label}>
                            <h4 className="font-medium text-gray-700">{label}</h4>
                            <p className="text-gray-600">{value}</p>
                          </div>
                        )
                      ))}
                      
                      {[
                        { label: 'Hobbies', items: profile.hobbies },
                        { label: 'Interests', items: profile.interests },
                        { label: 'Likes', items: profile.likes },
                        { label: 'Dislikes', items: profile.dislikes },
                        { label: 'Achievements', items: profile.achievements },
                        { label: 'Honors', items: profile.honors },
                        { label: 'Awards', items: profile.awards }
                      ].map(({ label, items }) => (
                        items && Array.isArray(items) && items.length > 0 && (
                          <div key={label}>
                            <h4 className="font-medium text-gray-700">{label}</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {items.map((item: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="posts" className="mt-6">
                    {posts && posts.length > 0 ? (
                      <div className="space-y-4">
                        {posts.map((post) => (
                          <div
                            key={post.id}
                            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => navigate(`/post/${post.id}`)}
                          >
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
                  </TabsContent>
                  
                  <TabsContent value="likes" className="mt-6">
                    {userLikes && userLikes.length > 0 ? (
                      <div className="space-y-4">
                        {userLikes.map((post) => (
                          <div 
                            key={post.id} 
                            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => navigate(`/post/${post.id}`)}
                          >
                            <div className="flex items-start gap-3">
                              {post.image && (
                                <img src={post.image} alt="Post thumbnail" className="w-16 h-16 rounded object-cover flex-shrink-0"/>
                              )}
                              <div className="flex-1">
                                <p className="mb-2 line-clamp-2">{post.content}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{post.likes?.length || 0} likes</span>
                                  <span>{post.shares || 0} shares</span>
                                  <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        This user hasn't liked any posts yet.
                      </p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="comments" className="mt-6">
                    {userComments && userComments.length > 0 ? (
                      <div className="space-y-4">
                        {userComments.map((comment) => (
                          <div 
                            key={comment.id} 
                            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => navigate(`/post/${comment.post_id}`)}
                          >
                            <p className="mb-2">{comment.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{comment.likes?.length || 0} likes</span>
                              <span>{comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ""}</span>
                              <span>on post</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        This user hasn't commented on any posts yet.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
