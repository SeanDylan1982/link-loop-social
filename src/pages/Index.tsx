
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Navbar } from '@/components/layout/Navbar';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/feed/PostCard';
import { UserProfile } from '@/components/profile/UserProfile';
import { FriendsList } from '@/components/friends/FriendsList';
import { MessagesList } from '@/components/messages/MessagesList';
import { Post, User } from '@/types';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('socialPosts') || '[]');
    const savedUsers = JSON.parse(localStorage.getItem('socialUsers') || '[]');
    setPosts(savedPosts);
    setUsers(savedUsers);
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  const getPostAuthor = (userId: string): User => {
    return users.find(u => u.id === userId) || {
      id: userId,
      username: 'Unknown User',
      email: '',
      createdAt: new Date(),
      friends: [],
      friendRequests: []
    };
  };

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <div className="max-w-2xl mx-auto">
            <CreatePost onPostCreated={handlePostCreated} />
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={getPostAuthor(post.userId)}
                    onPostUpdate={handlePostUpdate}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to SocialConnect!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by creating your first post or connecting with friends.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && <UserProfile />}
        {activeTab === 'friends' && <FriendsList />}
        {activeTab === 'messages' && <MessagesList />}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default Index;
