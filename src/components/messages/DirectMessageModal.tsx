
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
  profiles?: {
    username: string;
    avatar?: string;
  };
}

interface DirectMessageModalProps {
  friend: {
    id: string;
    username: string;
    avatar?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({ friend, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const fetchMessages = async () => {
    if (!user || !friend) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Get profiles for each message separately to avoid the relationship error
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar')
            .eq('id', message.sender_id)
            .single();

          return {
            ...message,
            profiles: profile || { username: 'Unknown User', avatar: null }
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !friend || !newMessage.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: friend.id,
          content: newMessage.trim()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Get the profile for the new message
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar')
        .eq('id', user.id)
        .single();

      const newMessageWithProfile = {
        ...data,
        profiles: profile || { username: 'Unknown User', avatar: null }
      };

      setMessages([...messages, newMessageWithProfile]);
      setNewMessage('');
      toast({ title: "Message sent!" });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isOpen && friend) {
      fetchMessages();
    }
  }, [isOpen, friend, user]);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chat with {friend.username}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded max-w-xs ${
                    message.sender_id === user?.id
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-gray-200 mr-auto'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
