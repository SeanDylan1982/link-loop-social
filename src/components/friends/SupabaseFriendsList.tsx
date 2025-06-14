
import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SupabaseFriendsList: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // Fetch friendships where the current user is user1 or user2
        const { data, error } = await import('@/integrations/supabase/client')
          .then(({ supabase }) =>
            supabase
              .from('friendships')
              .select('*')
              .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          );

        if (error) {
          console.error('Error fetching friends:', error);
          setFriends([]);
          setLoading(false);
          return;
        }

        // Extract the friend's id (the "other" user in each friendship)
        const friendIds =
          data
            ?.map((f: any) =>
              f.user1_id === user.id ? f.user2_id : f.user1_id
            )
            .filter(Boolean) || [];

        setFriends(friendIds);
      } catch (e) {
        console.error('Error fetching friends:', e);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading friends...</div>
        ) : friends.length > 0 ? (
          <ul>
            {friends.map((friendId) => (
              <li key={friendId} className="py-2 border-b last:border-b-0">
                <span className="font-mono text-gray-700">{friendId}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No friends yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
