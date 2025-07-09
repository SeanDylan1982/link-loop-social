import React, { useState, useMemo } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { SupabaseAuthForm } from "@/components/auth/SupabaseAuthForm";
import { Navbar } from "@/components/layout/Navbar";
import { SupabaseCreatePost } from "@/components/feed/SupabaseCreatePost";
import { SupabasePostCard } from "@/components/feed/SupabasePostCard";
import { UserProfile } from "@/components/profile/UserProfile";
import { SupabaseFriendsList } from "@/components/friends/SupabaseFriendsList";
import { MessagesList } from "@/components/messages/MessagesList";
import { usePosts } from "@/hooks/usePosts";
import { useSearchParams } from "react-router-dom";
import { SupabaseSearch } from "@/components/search/SupabaseSearch";
import { ConversationsList } from "@/components/messages/ConversationsList";
import { CreateGroupConversation } from "@/components/messages/CreateGroupConversation";
import { useNavigate } from "react-router-dom";
import {
  FeedFilters,
  FeedFilterType,
  FeedSortType,
} from "@/components/feed/FeedFilters";
import { TopicsSidebar } from "@/components/topics/TopicsSidebar";
import { TopicCreatePost } from "@/components/topics/TopicCreatePost";
import { TopicPostCard } from "@/components/topics/TopicPostCard";
import { useTopicPosts } from "@/hooks/useTopicPosts";
import { useTopics } from "@/hooks/useTopics";
import { useConversationsRealtime } from "@/hooks/useConversationsRealtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Users, MessageSquare } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { SystemMessage } from "@/components/notifications/SystemMessage";
import { CookiesModal } from "@/components/modals/CookiesModal";
import { useCookieConsent } from "@/hooks/useCookieConsent";

const MainApp: React.FC = () => {
  const { user, profile, loading } = useSupabaseAuth();
  const { posts, createPost, updatePost } = usePosts();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "home";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { showCookieModal, acceptCookies, declineCookies } = useCookieConsent();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string>();
  const navigate = useNavigate();

  // Set up real-time subscriptions for conversations (only once at app level)
  useConversationsRealtime();

  const { topics, refetchTopics, joinTopic } = useTopics();
  const {
    posts: topicPosts,
    createTopicPost,
    updateTopicPost,
  } = useTopicPosts(selectedTopicId);

  // Filtering & Sorting State
  const [filter, setFilter] = useState<FeedFilterType>("all");
  const [sort, setSort] = useState<FeedSortType>("recent");

  // Get list of friends' user IDs (simplified - remove friends array dependency)
  const friendsIds: string[] = useMemo(() => {
    // For now, return empty array - friends functionality can be enhanced later
    return [];
  }, []);

  // Filter and sort posts for feed
  const filteredSortedPosts = useMemo(() => {
    let filtered = posts;
    if (filter === "friends" && friendsIds.length) {
      filtered = posts.filter((p) => friendsIds.includes(p.user_id));
    }
    // Sort logic
    if (sort === "recent") {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === "oldest") {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sort === "popular") {
      filtered = [...filtered].sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    } else if (sort === "trending") {
      // Trending: posts with most likes in last 48h
      const since = Date.now() - 1000 * 60 * 60 * 48;
      filtered = [...filtered].sort((a, b) => {
        const aRecent =
          new Date(a.created_at).getTime() > since ? a.likes?.length || 0 : 0;
        const bRecent =
          new Date(b.created_at).getTime() > since ? b.likes?.length || 0 : 0;
        return bRecent - aRecent;
      });
    }
    return filtered;
  }, [posts, filter, sort, friendsIds]);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const handleBackToFeed = () => {
    setSelectedTopicId(undefined);
  };

  const handleTopicPostCreated = (content: string, imageFile?: File | null) => {
    return createTopicPost(content, imageFile, refetchTopics);
  };

  const handleJoinTopic = async () => {
    if (selectedTopicId) {
      await joinTopic(selectedTopicId);
    }
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <SystemMessage />
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <SupabaseSearch />
      <div className="container mx-auto px-4 py-6 flex-1 pb-[120px]">
        {activeTab === "home" && (
          <div className="flex gap-6">
            <TopicsSidebar
              selectedTopicId={selectedTopicId}
              onTopicSelect={setSelectedTopicId}
            />
            <div className="flex-1 max-w-2xl">
              {selectedTopicId ? (
                <div>
                  {selectedTopic && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleBackToFeed}
                              className="p-2"
                            >
                              <ArrowLeft size={16} />
                            </Button>
                            <div># {selectedTopic.title}</div>
                          </div>
                          {!selectedTopic.is_member && (
                            <Button onClick={handleJoinTopic} size="sm">
                              Join Topic
                            </Button>
                          )}
                        </CardTitle>
                        {selectedTopic.description && (
                          <p className="text-muted-foreground ml-11">
                            {selectedTopic.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 ml-11 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>
                              {selectedTopic.member_count || 0} members
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare size={14} />
                            <span>{selectedTopic.post_count || 0} posts</span>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )}
                  <TopicCreatePost onPostCreated={handleTopicPostCreated} />
                  <div className="space-y-4">
                    {topicPosts.length > 0 ? (
                      topicPosts.map((post) => (
                        <TopicPostCard
                          key={post.id}
                          post={post}
                          onPostUpdate={updateTopicPost}
                        />
                      ))
                    ) : (
                      <Card>
                        <CardContent className="text-center py-12">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No posts yet in this topic
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Be the first to start the conversation!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <SupabaseCreatePost onPostCreated={createPost} />
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
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Welcome to SocialConnect!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Start by creating your first post or selecting a topic
                          to join the conversation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "profile" && <UserProfile />}
        {activeTab === "friends" && <SupabaseFriendsList />}
        {activeTab === "messages" && (
          <div className="max-w-2xl mx-auto">
            <ConversationsList onCreateGroup={() => setShowCreateGroup(true)} />
            <CreateGroupConversation
              open={showCreateGroup}
              onOpenChange={setShowCreateGroup}
              afterCreated={(conversationId) => {
                console.log('CONVERSATION ID - ', conversationId);
                navigate(`/conversation/${conversationId}`);
              }}
            />
          </div>
        )}
      </div>
      <Footer />
      <CookiesModal 
        open={showCookieModal}
        onAccept={acceptCookies}
        onDecline={declineCookies}
      />
    </div>
  );
};

const SupabaseIndex = () => {
  return <MainApp />;
};

export default SupabaseIndex;
