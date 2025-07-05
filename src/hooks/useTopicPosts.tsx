
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';
import { TopicPost } from './useTopics';

export const useTopicPosts = (topicId?: string) => {
  const [posts, setPosts] = useState<TopicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const fetchTopicPosts = async () => {
    if (!topicId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('topic_posts')
        .select(`
          *,
          profiles:profiles (
            username,
            avatar
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching topic posts:', error);
        return;
      }
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching topic posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTopicPost = async (content: string, imageFile?: File | null) => {
    if (!user || !topicId) {
      toast({ title: "Error", description: "You must be logged in to create a post", variant: "destructive" });
      return;
    }

    try {
      let imageUrl: string | undefined = undefined;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('topic_posts')
        .insert([{
          topic_id: topicId,
          user_id: user.id,
          content,
          image: imageUrl
        }])
        .select(`
          *,
          profiles:profiles (
            username,
            avatar
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      setPosts([data, ...posts]);
      toast({ title: "Post created successfully!" });
    } catch (error) {
      console.error('Error creating topic post:', error);
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  };

  const updateTopicPost = async (postId: string, updates: Partial<TopicPost>) => {
    try {
      const { data, error } = await supabase
        .from('topic_posts')
        .update(updates)
        .eq('id', postId)
        .select(`
          *,
          profiles:profiles (
            username,
            avatar
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      setPosts(posts.map(post =>
        post.id === postId ? { ...post, ...data } : post
      ));
    } catch (error) {
      console.error('Error updating topic post:', error);
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTopicPosts();
  }, [topicId]);

  return {
    posts,
    loading,
    createTopicPost,
    updateTopicPost,
    refetchTopicPosts: fetchTopicPosts
  };
};
