
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';

// Add profile object type to Post interface
interface Post {
  id: string;
  user_id: string;
  content: string;
  image?: string;
  likes: string[];
  shares: number | null;
  created_at: string;
  profiles?: {
    username: string;
    avatar?: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:profiles (
            username,
            avatar
          )
        `)
        .is('topic_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, imageFile?: File | null) => {
    if (!user) {
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
          topic_id: null
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
      console.error('Error creating post:', error);
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  };

  const updatePost = async (postId: string, updates: Partial<Post>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
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
      console.error('Error updating post:', error);
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    updatePost,
    refetchPosts: fetchPosts
  };
};
