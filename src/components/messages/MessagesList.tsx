
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
  sender?: { username: string };
  receiver?: { username: string };
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

        // Fetch messages where the user is sender or receiver with profile info
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(username),
            receiver:profiles!messages_receiver_id_fkey(username)
          `)
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
        <CardTitle>All Messages ({messages.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading messages...</div>
        ) : messages.length > 0 ? (
          <ul>
            {messages.map((msg) => (
              <li key={msg.id} className="py-3 border-b last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      msg.sender_id === user?.id 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {msg.sender_id === user?.id ? 'SENT' : 'RECEIVED'}
                    </span>
                    <span className="font-medium">
                      {msg.sender_id === user?.id 
                        ? `To: ${msg.receiver?.username || 'Unknown'}` 
                        : `From: ${msg.sender?.username || 'Unknown'}`
                      }
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {msg.created_at && new Date(msg.created_at).toLocaleString()}
                    </div>
                    {!msg.read && msg.receiver_id === user?.id && (
                      <div className="text-xs text-blue-600 font-medium">UNREAD</div>
                    )}
                  </div>
                </div>
                <div className="text-gray-700 pl-2 border-l-2 border-gray-200">
                  {msg.content}
                </div>
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
