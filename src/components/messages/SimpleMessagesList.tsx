import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBroadcastMessaging } from '@/hooks/useBroadcastMessaging';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string | null;
  conversation_id: string | null;
  created_at: string;
  read: boolean;
}

interface SimpleMessagesListProps {
  conversationId: string;
}

// Define types for conversation meta and participant
interface ConversationMeta {
  id: string;
  title: string | null;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    username: string;
    avatar: string | null;
  } | null;
}

export const SimpleMessagesList: React.FC<SimpleMessagesListProps> = ({ conversationId }) => {
  const { messages, loading, sendMessage } = useBroadcastMessaging({ conversationId });
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationMeta, setConversationMeta] = useState<ConversationMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch conversation metadata and other user
  useEffect(() => {
    const fetchMeta = async () => {
      setMetaLoading(true);
      try {
        const res = await fetch(`/api/conversations/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${user?.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch conversation metadata');
        const data = await res.json();
        setConversationMeta(data);
      } catch (error) {
        console.error('Error fetching conversation metadata:', error);
        setConversationMeta(null);
      } finally {
        setMetaLoading(false);
      }
    };
    if (user?.id) {
      fetchMeta();
    }
  }, [conversationId, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    await sendMessage(newMessage);
    setNewMessage('');
    setSending(false);
  };

  // const displayName = conversation?.is_group 
  //   ? conversation.title || 'Group Chat'
  //   : conversation?.other_user?.username || 'Unknown User';

  // Compute displayName
  const displayName = conversationMeta?.other_user?.username || conversationMeta?.title || 'Chat';

  if (loading || metaLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/?tab=messages')}>
              <ArrowLeft size={16} />
            </Button>
            Loading...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/?tab=messages')}>
            <ArrowLeft size={16} />
          </Button>
          <Avatar>
            <AvatarImage src={conversationMeta?.other_user?.avatar || undefined} />
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{displayName}</h3>
            {conversationMeta?.other_user && (
              <p className="text-sm text-muted-foreground">
                @{conversationMeta.other_user.username}
              </p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <Send size={16} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};