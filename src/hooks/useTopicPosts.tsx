import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { TopicPost } from '@/types';

export const useTopicPosts = (topicId?: string) => {
  const [posts, setPosts] = useState<TopicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  const fetchTopicPosts = async () => {
    if (!topicId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/topics/${topicId}/posts`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch topic posts');
      const data = await res.json();
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching topic posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTopicPost = async (title: string, content: string, image?: File | null) => {
    if (!user || !topicId) {
      toast({ title: "Error", description: "You must be logged in to create a post", variant: "destructive" });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('topic', topicId);
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create post');
      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      toast({ title: "Post created successfully!" });
    } catch (error) {
      console.error('Error creating topic post:', error);
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  };

  const updateTopicPost = async (postId: string, updates: Partial<TopicPost>) => {
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
      const updatedPost = await res.json();
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
