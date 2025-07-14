
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Topic, TopicPost } from '@/types';


export type TopicSortType = "trending" | "popular" | "alphabetical" | "recent";

export const useTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<TopicSortType>("recent");
  const { user, token } = useAuth();

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/topics', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch topics');
      const data = await res.json();
      setTopics(data || []);
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
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: title, description, isPublic }),
      });
      if (!res.ok) throw new Error('Failed to create topic');
      const newTopic = await res.json();
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
      const res = await fetch(`/api/topics/${topicId}/join`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to join topic');
      toast({ title: "Joined topic successfully!" });
      fetchTopics(); // Refresh to update member counts and membership status
    } catch (error) {
      console.error('Error joining topic:', error);
      toast({ title: "Error", description: "Failed to join topic", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTopics();
    
    // Listen for topic stats updates
    const handleStatsUpdate = () => {
      fetchTopics();
    };
    
    window.addEventListener('topicStatsUpdate', handleStatsUpdate);
    
    return () => {
      window.removeEventListener('topicStatsUpdate', handleStatsUpdate);
    };
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
