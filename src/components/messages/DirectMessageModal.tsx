
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useBroadcastMessaging } from '@/hooks/useBroadcastMessaging';

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
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the new broadcast messaging hook
  const conversationId = friend?.conversationId; // You may need to ensure this is passed in props or derived
  const { messages, loading, sendMessage } = useBroadcastMessaging({ conversationId });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !friend || !newMessage.trim()) return;
    await sendMessage(newMessage);
    setNewMessage('');
  };

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Direct Message</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-80">
          {messages.map((message, idx) => (
            <div key={message.id || idx} className="mb-2">
              <b>{message.sender_id === user?.id ? 'You' : friend?.username}:</b> {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
        <form onSubmit={e => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2 mt-2">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
