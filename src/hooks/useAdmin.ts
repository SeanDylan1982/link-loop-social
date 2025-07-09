import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const { user } = useSupabaseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin (first user or specified admin email)
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user is the first registered user or has admin email
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, email, created_at')
          .order('created_at', { ascending: true })
          .limit(1);

        if (error) throw error;

        const isFirstUser = profiles?.[0]?.id === user.id;
        const isAdminEmail = user.email === 'seandylanpatterson@gmail.com';

        setIsAdmin(isFirstUser || isAdminEmail);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const suspendUser = async (userId: string, reason: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        suspended: true,
        suspension_reason: reason,
        suspended_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    toast({ title: 'User suspended successfully' });
  };

  const deletePost = async (postId: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    toast({ title: 'Post deleted successfully' });
  };

  const sendSystemMessage = async (message: string) => {
    if (!isAdmin) throw new Error('Unauthorized');
    
    // Get all user IDs
    const { data: users } = await supabase
      .from('profiles')
      .select('id');

    if (!users) return;

    // Send notification to all users
    const notifications = users.map(u => ({
      user_id: u.id,
      type: 'system',
      content: message,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;
    toast({ title: 'System message sent to all users' });
  };

  return {
    isAdmin,
    loading,
    suspendUser,
    deletePost,
    sendSystemMessage
  };
};