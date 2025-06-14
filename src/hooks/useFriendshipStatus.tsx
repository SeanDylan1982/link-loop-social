
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';

export type FriendshipStatus = 'friends' | 'request_sent' | 'request_received' | 'not_friends';

export const useFriendshipStatus = (profileId: string | undefined) => {
  const { user } = useSupabaseAuth();
  const [status, setStatus] = useState<FriendshipStatus>('not_friends');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profileId || user.id === profileId) {
        setLoading(false);
        return;
    }

    const checkStatus = async () => {
        setLoading(true);

        const { data: friendship } = await supabase
            .from('friendships')
            .select('*')
            .or(`(user1_id.eq.${user.id},user2_id.eq.${profileId}),(user1_id.eq.${profileId},user2_id.eq.${user.id})`)
            .maybeSingle();

        if (friendship) {
            setStatus('friends');
            setLoading(false);
            return;
        }

        const { data: sentRequest } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('sender_id', user.id)
            .eq('receiver_id', profileId)
            .eq('status', 'pending')
            .maybeSingle();
        
        if (sentRequest) {
            setStatus('request_sent');
            setLoading(false);
            return;
        }

        const { data: receivedRequest } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('sender_id', profileId)
            .eq('receiver_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

        if(receivedRequest) {
            setStatus('request_received');
            setLoading(false);
            return;
        }
        
        setStatus('not_friends');
        setLoading(false);
    };

    checkStatus();
  }, [user, profileId]);

  const sendFriendRequest = async () => {
    if (!user || !profileId || status !== 'not_friends') return;
    const { error } = await supabase
        .from('friend_requests')
        .insert({ sender_id: user.id, receiver_id: profileId });
    
    if (error) {
        toast({ title: "Error", description: "Could not send friend request.", variant: 'destructive' });
        console.error(error);
    } else {
        toast({ title: "Friend request sent!" });
        setStatus('request_sent');
    }
  };

  return { status, loading, sendFriendRequest };
};
