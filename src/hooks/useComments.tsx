
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Comment } from '@/types';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  const fetchComments = async () => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/comments/post/${postId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (content: string) => {
    if (!user || !postId) {
      toast({ title: "Error", description: "You must be logged in to comment", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content, post: postId }),
      });
      if (!res.ok) throw new Error('Failed to create comment');
      const newComment = await res.json();
      setComments([...comments, newComment]);
      toast({ title: "Comment created successfully!" });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({ title: "Error", description: "Failed to create comment", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    loading,
    createComment,
    refetchComments: fetchComments,
  };
};
