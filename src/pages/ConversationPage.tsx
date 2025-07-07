
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@/hooks/useConversation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from "@/integrations/supabase/client";

const ConversationPage: React.FC = () => {
    const { conversationId } = useParams<{ conversationId?: string }>();
    const { user } = useSupabaseAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [conv, setConv] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const convId = conversationId || undefined;

    // Enhanced logging!
    useEffect(() => {
      console.log('[ConversationPage] useParams', { conversationId });
      console.log('[ConversationPage] Current user:', user);
    }, [conversationId, user]);

    React.useEffect(() => {
      (async () => {
        if (convId) {
          setLoading(true);
          const { data, error } = await supabase
            .from("conversations")
            .select(`
              *,
              participants:conversation_participants (
                user_id,
                profiles:profiles!conversation_participants_user_id_fkey (
                  id, username, avatar
                )
              )
            `)
            .eq("id", convId)
            .maybeSingle();
          if (error) console.error("Error loading conversation detail", error);
          setConv(data);
          setLoading(false);
          console.log("[ConversationPage] Loaded conversation:", data);
        }
      })();
    }, [convId]);

    // Infer receiverId for DMs:
    let receiverId: string | undefined = undefined;
    if (conv && !conv.is_group && user) {
      const participantProfiles = conv.participants as any[];
      console.log('[ConversationPage] All participants:', participantProfiles);
      const other = participantProfiles?.find((p) => {
        const profileId = p.profiles?.id || p.user_id;
        return profileId && profileId !== user.id;
      });
      receiverId = other?.profiles?.id || other?.user_id;
      console.log("[ConversationPage] receiverId for DM:", receiverId);
    }

    console.log('[ConversationPage] Calling useConversation:', { convId, receiverId });
    const { messages, isLoading: messagesLoading, sendMessage, isSending } = useConversation(
      convId,
      receiverId
    );
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
      console.log("[ConversationPage] messages array", messages, "messagesLoading:", messagesLoading, "conv:", conv);
    }, [messages, messagesLoading, conv]);
    
    const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedMessage = newMessage.trim();
      
      if (!trimmedMessage) {
        console.warn('[ConversationPage] Attempted to send empty message');
        return;
      }
      
      if (!convId) {
        console.error('[ConversationPage] No conversation ID available');
        return;
      }
      
      console.log('[ConversationPage] Sending message:', {
          content: trimmedMessage,
          conversation_id: convId,
          receiver_id: receiverId,
          sender_id: user?.id
      });
      
      try {
        sendMessage(trimmedMessage);
        setNewMessage('');
      } catch (error) {
        console.error('[ConversationPage] Error sending message:', error);
      }
    };

    const handleNavChange = (tab: string) => {
      navigate(`/?tab=${tab}`);
    };
    
    const loadingAny = loading || messagesLoading;

    // Get display info for conversation header
    const getConversationDisplayInfo = () => {
      if (!conv) return { title: 'Conversation', subtitle: '' };
      
      if (conv.is_group) {
        return {
          title: conv.title || 'Group Chat',
          subtitle: `${conv.participants?.length || 0} members`,
          avatar: null
        };
      } else {
        // Direct message - show the other person's info
        const otherParticipant = conv.participants?.find((p: any) => p.profiles?.id !== user?.id);
        return {
          title: otherParticipant?.profiles?.username || 'Direct Message',
          subtitle: 'Direct Message',
          avatar: otherParticipant?.profiles?.avatar
        };
      }
    };

    const displayInfo = getConversationDisplayInfo();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar activeTab={'messages'} onTabChange={handleNavChange} />
            <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
                {loadingAny ? (
                    <div className="text-center py-8 text-gray-500">Loading conversation...</div>
                ) : !conv ? (
                    <div className="text-center py-8 text-red-500">Conversation not found.</div>
                ) : (
                <Card className="flex-grow flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/?tab=messages')}>
                                Back
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              console.log('[ConversationPage] Manual refresh triggered');
                              queryClient.invalidateQueries({ queryKey: ['conversation', convId] });
                            }}>
                                Refresh
                            </Button>
                            <Avatar>
                              {displayInfo.avatar ? (
                                <AvatarImage src={displayInfo.avatar} />
                              ) : null}
                              <AvatarFallback>
                                {conv.is_group ? 
                                  (conv.title?.slice(0,2).toUpperCase() || "G") : 
                                  displayInfo.title.charAt(0).toUpperCase()
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{displayInfo.title}</CardTitle>
                              <div className="text-xs text-muted-foreground">
                                {displayInfo.subtitle}
                              </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center text-gray-400 py-6">No messages yet. Say hello!</div>
                        ) : (
                          messages.map((message: any) => (
                            <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${message.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p>{message.content}</p>
                                    <p className="text-xs text-right opacity-70 mt-1">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>
                    <div className="border-t p-4 bg-background">
                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={conv ? "Type a message..." : "Loading conversation..."}
                                autoComplete="off"
                                disabled={!conv || isSending}
                                maxLength={1000}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                  }
                                }}
                            />
                            <Button 
                              type="submit" 
                              disabled={isSending || !conv || !newMessage.trim()} 
                              size="icon"
                              title={isSending ? "Sending..." : "Send message"}
                            >
                                <span className="sr-only">{isSending ? "Sending..." : "Send"}</span>
                                {isSending ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                )}
                            </Button>
                        </form>
                    </div>
                </Card>
                )}
            </div>
        </div>
    );
};

export default ConversationPage;
