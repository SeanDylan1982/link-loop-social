import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId?: string;
}

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

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({ isOpen, onClose, recipientId }) => {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, profile } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && recipientId) {
      fetchMessages(recipientId);
    }
  }, [isOpen, recipientId]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async (recipientId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (
            username,
            avatar
          )
        `)
        .or(`and(sender_id.eq.${user?.id}, receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId}, receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({ title: "Error", description: "Failed to load messages.", variant: "destructive" });
        return;
      }

      setMessages(data || []);
      // Mark messages as read
      markMessagesAsRead(recipientId, data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({ title: "Error", description: "Failed to load messages.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (recipientId: string, messages: Message[]) => {
    if (!user) return;

    // Filter out messages that are already read or sent by the current user
    const unreadMessages = messages.filter(msg => !msg.read && msg.receiver_id === user.id);

    if (unreadMessages.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadMessages.map(msg => msg.id));

      if (error) {
        console.error('Error marking messages as read:', error);
        toast({ title: "Error", description: "Failed to update message status.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      toast({ title: "Error", description: "Failed to update message status.", variant: "destructive" });
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !user || !recipientId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          content: messageText,
          sender_id: user.id,
          receiver_id: recipientId,
          read: false,
        }])
        .select(`
          *,
          profiles:sender_id (
            username,
            avatar
          )
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
        return;
      }

      setMessages([...messages, data]);
      setMessageText('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Direct Message</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[350px] w-full pr-2">
          <div className="flex flex-col space-y-2 p-2">
            {loading ? (
              <div>Loading messages...</div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-2">
                    {message.sender_id !== user?.id && (
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={message.profiles?.avatar} />
                        <AvatarFallback>{message.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg px-3 py-2 text-sm ${message.sender_id === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'}`}>
                      {message.content}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Input
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            className="mr-2"
          />
          <Button onClick={sendMessage}><Send className="mr-2" size={16} /> Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
