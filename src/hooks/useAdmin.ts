import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const { user, token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const headers = { 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    if (user?.isAdmin) {
      setIsAdmin(true);
    }
    setLoading(false);
  }, [user]);

  const suspendUser = async (userId: string, reason: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    await fetch(`/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    toast({ title: 'User suspended successfully' });
  };

  const deletePost = async (postId: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    await fetch(`/api/admin/posts/${postId}`, {
      method: 'DELETE',
      headers,
    });
    toast({ title: 'Post deleted successfully' });
  };

  const sendSystemMessage = async (message: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    await fetch('/api/system-messages', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    toast({ title: 'System message sent to all users' });
  };

  return {
    isAdmin,
    loading,
    suspendUser,
    deletePost,
    sendSystemMessage,
  };
};