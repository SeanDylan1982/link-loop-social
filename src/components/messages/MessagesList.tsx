
import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export const MessagesList: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      if (!user) {
        setMessages([]);
        setLoading(false);
        return;
      }
      try {
        const { supabase } = await import('@/integrations/supabase/client');

        // Fetch messages where the user is sender or receiver
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching messages:', error);
          setMessages([]);
          setLoading(false);
          return;
        }
        setMessages(data || []);
      } catch (e) {
        console.error('Error fetching messages:', e);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading messages...</div>
        ) : messages.length > 0 ? (
          <ul>
            {messages.map((msg) => (
              <li key={msg.id} className="py-2 border-b last:border-b-0">
                <div className="flex justify-between">
                  <span>
                    <span className="font-semibold">
                      {msg.sender_id === user?.id ? "Me" : msg.sender_id}
                    </span>
                    {' → '}
                    <span className="font-semibold">
                      {msg.receiver_id === user?.id ? "Me" : msg.receiver_id}
                    </span>
                  </span>
                  <span className="text-xs text-gray-400">
                    {msg.created_at && new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-700">{msg.content}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No messages found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
