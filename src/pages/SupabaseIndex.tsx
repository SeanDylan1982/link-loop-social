import React, { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { SupabaseAuthForm } from '@/components/auth/SupabaseAuthForm';
import { Navbar } from '@/components/layout/Navbar';
import { SupabaseCreatePost } from '@/components/feed/SupabaseCreatePost';
import { SupabasePostCard } from '@/components/feed/SupabasePostCard';
import { UserProfile } from '@/components/profile/UserProfile';
import { SupabaseFriendsList } from '@/components/friends/SupabaseFriendsList';
import { MessagesList } from '@/components/messages/MessagesList';
import { usePosts } from '@/hooks/usePosts';
import { useSearchParams } from 'react-router-dom';
import { SupabaseSearch } from '@/components/search/SupabaseSearch';

const MainApp: React.FC = () => {
  const { user, profile, loading } = useSupabaseAuth();
  const { posts, createPost, updatePost } = usePosts();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'home';
  const [activeTab, setActiveTab] = useState(initialTab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SupabaseAuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Add search bar at the top */}
      <SupabaseSearch />
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <div className="max-w-2xl mx-auto">
            <SupabaseCreatePost onPostCreated={createPost} />
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <SupabasePostCard
                    key={post.id}
                    post={post}
                    onPostUpdate={updatePost}
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
        {activeTab === 'friends' && <SupabaseFriendsList />}
        {activeTab === 'messages' && <MessagesList />}
      </div>
    </div>
  );
};

const SupabaseIndex = () => {
  return (
    <MainApp />
  );
};

export default SupabaseIndex;
