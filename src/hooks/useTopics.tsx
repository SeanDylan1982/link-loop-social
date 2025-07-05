
import { useState, useEffect } from 'react';
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

export const useTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
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
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

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

      setTopics([data, ...topics]);
      toast({ title: "Topic created successfully!" });
      return data;
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({ title: "Error", description: "Failed to create topic", variant: "destructive" });
    }
  };

  const joinTopic = async (topicId: string) => {
    if (!user) return;

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
    } catch (error) {
      console.error('Error joining topic:', error);
      toast({ title: "Error", description: "Failed to join topic", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return {
    topics,
    loading,
    createTopic,
    joinTopic,
    refetchTopics: fetchTopics
  };
};
