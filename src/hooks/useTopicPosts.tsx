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
      // Fetch posts for this topic from database using topic_id
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching topic posts:', postsError);
        return;
      }

      // Then get the profiles for each post
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar')
            .eq('id', post.user_id)
            .single();

          return {
            ...post,
            profiles: profile || { username: 'Unknown User', avatar: null }
          };
        })
      );

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching topic posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTopicPost = async (content: string, imageFile?: File | null, onPostCreated?: () => void) => {
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
        .from('posts')
        .insert([{
          user_id: user.id,
          content,
          image: imageUrl,
          topic_id: topicId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Get the profile for the new post
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar')
        .eq('id', user.id)
        .single();

      const newPost = {
        ...data,
        profiles: profile || { username: 'Unknown User', avatar: null }
      };

      setPosts([newPost, ...posts]);
      toast({ title: "Post created successfully!" });
      
      // Call the callback to refresh topic stats
      if (onPostCreated) {
        onPostCreated();
      }
      
      // Trigger a refresh of topics to update stats
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('topicStatsUpdate'));
      }, 100);
    } catch (error) {
      console.error('Error creating topic post:', error);
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  };

  const updateTopicPost = async (postId: string, updates: Partial<TopicPost>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Get the profile for the updated post
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar')
        .eq('id', data.user_id)
        .single();

      const updatedPost = {
        ...data,
        profiles: profile || { username: 'Unknown User', avatar: null }
      };

      setPosts(posts.map(post =>
        post.id === postId ? { ...post, ...updatedPost } : post
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
