
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, token } = useAuth();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
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
      const formData = new FormData();
      formData.append('content', content);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create post');
      const data = await res.json();
      setPosts([data, ...posts]);
      toast({ title: "Post created successfully!" });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  };

  const updatePost = async (postId: string, updates: Partial<Post>) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update post');
      const data = await res.json();
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
