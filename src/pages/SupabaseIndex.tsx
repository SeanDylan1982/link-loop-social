
import React, { useState, useMemo } from 'react';
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
import { ConversationsList } from "@/components/messages/ConversationsList";
import { CreateGroupConversation } from "@/components/messages/CreateGroupConversation";
import { useNavigate } from "react-router-dom";
import { FeedFilters, FeedFilterType, FeedSortType } from '@/components/feed/FeedFilters';

const MainApp: React.FC = () => {
  const { user, profile, loading } = useSupabaseAuth();
  const { posts, createPost, updatePost } = usePosts();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'home';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const navigate = useNavigate();

  // Filtering & Sorting State
  const [filter, setFilter] = useState<FeedFilterType>("all");
  const [sort, setSort] = useState<FeedSortType>("recent");

  // Get list of friends' user IDs
  // We'll use posts[].profiles?.id and profile?.id for self. For friends, assume profile has friends array (otherwise skip Friends filtering)
  const friendsIds: string[] = useMemo(() => {
    // Try to get friend ids from the profile.friends array (may need improvement based on how SupabaseFriendsList and profile work)
    if (!profile || !profile.friends) return [];
    return profile.friends.map((f: any) => typeof f === "string" ? f : f.id);
  }, [profile]);

  // Filter and sort posts for feed
  const filteredSortedPosts = useMemo(() => {
    let filtered = posts;
    if (filter === "friends" && friendsIds.length) {
      filtered = posts.filter(p => friendsIds.includes(p.user_id));
    }
    // Sort logic
    if (sort === "recent") {
      filtered = [...filtered].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === "oldest") {
      filtered = [...filtered].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sort === "popular") {
      filtered = [...filtered].sort((a, b) =>
        (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    } else if (sort === "trending") {
      // Trending: posts with most likes in last 48h
      const since = Date.now() - 1000 * 60 * 60 * 48;
      filtered = [...filtered].sort((a, b) => {
        const aRecent = new Date(a.created_at).getTime() > since ? (a.likes?.length || 0) : 0;
        const bRecent = new Date(b.created_at).getTime() > since ? (b.likes?.length || 0) : 0;
        return bRecent - aRecent;
      });
    }
    return filtered;
  }, [posts, filter, sort, friendsIds]);

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
            {/* Filter and Sort controls */}
            <FeedFilters
              filter={filter}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
            />
            <div className="space-y-4">
              {filteredSortedPosts.length > 0 ? (
                filteredSortedPosts.map((post) => (
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
        {activeTab === 'messages' && (
          <div className="max-w-2xl mx-auto">
            <ConversationsList
              onCreateGroup={() => setShowCreateGroup(true)}
            />
            <CreateGroupConversation
              open={showCreateGroup}
              onOpenChange={setShowCreateGroup}
              afterCreated={(conversationId) => {
                navigate(`/conversation/${conversationId}`);
              }}
            />
          </div>
        )}
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
