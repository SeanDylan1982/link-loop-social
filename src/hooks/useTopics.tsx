
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';

export interface Topic {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  post_count?: number;
  member_count?: number;
  last_post_date?: string;
  is_member?: boolean;
}

export interface TopicPost {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  image?: string;
  likes: string[];
  created_at: string;
  profiles?: {
    username: string;
    avatar?: string;
  };
}

export type TopicSortType = "trending" | "popular" | "alphabetical" | "recent";

export const useTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<TopicSortType>("recent");
  const { user } = useSupabaseAuth();

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching topics:', error);
        return;
      }

      // Get additional stats for each topic
      const topicsWithStats = await Promise.all(
        (data || []).map(async (topic) => {
          // Get post count and last post date
          const { data: posts, count: postCount } = await supabase
            .from('topic_posts')
            .select('created_at', { count: 'exact' })
            .eq('topic_id', topic.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Get member count
          const { count: memberCount } = await supabase
            .from('topic_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);

          // Check if current user is a member
          let isMember = false;
          if (user) {
            const { data: membership } = await supabase
              .from('topic_memberships')
              .select('id')
              .eq('topic_id', topic.id)
              .eq('user_id', user.id)
              .single();
            
            isMember = !!membership;
          }

          return {
            ...topic,
            post_count: postCount || 0,
            member_count: memberCount || 0,
            last_post_date: posts && posts.length > 0 ? posts[0].created_at : null,
            is_member: isMember
          };
        })
      );

      setTopics(topicsWithStats);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedTopics = useMemo(() => {
    const sorted = [...topics];
    
    switch (sortBy) {
      case "trending":
        // Trending: most posts in last 7 days + member activity
        return sorted.sort((a, b) => {
          const aScore = (a.post_count || 0) + (a.member_count || 0) * 0.5;
          const bScore = (b.post_count || 0) + (b.member_count || 0) * 0.5;
          return bScore - aScore;
        });
      case "popular":
        // Popular: most members
        return sorted.sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
      case "alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "recent":
      default:
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  }, [topics, sortBy]);

  const createTopic = async (title: string, description?: string, isPublic: boolean = true) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create a topic", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('topics')
        .insert([{
          title,
          description,
          creator_id: user.id,
          is_public: isPublic
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Auto-join the creator as a member
      await supabase
        .from('topic_memberships')
        .insert([{
          topic_id: data.id,
          user_id: user.id
        }]);

      const newTopic = { ...data, post_count: 0, member_count: 1, is_member: true };
      setTopics([newTopic, ...topics]);
      toast({ title: "Topic created successfully!" });
      return newTopic;
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({ title: "Error", description: "Failed to create topic", variant: "destructive" });
    }
  };

  const joinTopic = async (topicId: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to join a topic", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('topic_memberships')
        .insert([{
          topic_id: topicId,
          user_id: user.id
        }]);

      if (error) {
        throw error;
      }

      toast({ title: "Joined topic successfully!" });
      fetchTopics(); // Refresh to update member counts and membership status
    } catch (error) {
      console.error('Error joining topic:', error);
      toast({ title: "Error", description: "Failed to join topic", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [user]);

  return {
    topics: sortedTopics,
    loading,
    sortBy,
    setSortBy,
    createTopic,
    joinTopic,
    refetchTopics: fetchTopics
  };
};
