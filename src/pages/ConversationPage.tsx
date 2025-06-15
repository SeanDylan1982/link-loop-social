import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@/hooks/useConversation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const ConversationPage: React.FC = () => {
    const { userId, conversationId } = useParams<{ userId?: string, conversationId?: string }>();
    const { user } = useSupabaseAuth();
    const navigate = useNavigate();
    const [conv, setConv] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const convId = conversationId || undefined;

    // Fetch conversation details (participants, is_group, etc.)
    React.useEffect(() => {
      (async () => {
        if (convId) {
          setLoading(true);
          const { data, error } = await supabase
            .from("conversations")
            .select("*, participants:conversation_participants (user_id, profiles:profiles(id,username,avatar))")
            .eq("id", convId)
            .maybeSingle();
          setConv(data);
          setLoading(false);
        }
      })();
    }, [convId]);

    // Infer receiverId for DMs:
    let receiverId: string | undefined = undefined;
    if (conv && !conv.is_group && user) {
      // Find the participant that's NOT the current user; fallback to undefined
      const participantProfiles = conv.participants as any[];
      const other = participantProfiles?.find((p) => p.profiles?.id && p.profiles.id !== user.id);
      receiverId = other?.profiles?.id;
    }

    const { messages, isLoading: messagesLoading, sendMessage, isSending } = useConversation(
      convId ?? userId, // For direct/legacy flow this stays
      receiverId // This is undefined for group chats, set for DMs
    );
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    const handleNavChange = (tab: string) => {
        navigate(`/?tab=${tab}`);
    };
    
    const loadingAny = loading || messagesLoading;

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
                            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                                Back
                            </Button>
                            {/* Show avatar/title for groups, username(s) for dm */}
                            {conv.is_group ? (
                              <>
                                <Avatar>
                                  <AvatarFallback>{conv.title?.slice(0,2).toUpperCase() || "G"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{conv.title}</CardTitle>
                                  <div className="text-xs text-muted-foreground">
                                    {conv.participants.map((p: any) => p.profiles?.username).filter(Boolean).join(", ")}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <Avatar>
                                  <AvatarImage src={conv.participants?.[0]?.profiles?.avatar || undefined} />
                                  <AvatarFallback>{conv.participants?.[0]?.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{conv.participants?.[0]?.profiles?.username ?? "User"}</CardTitle>
                                </div>
                              </>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                        {messages.map((message: any) => (
                            <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${message.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p>{message.content}</p>
                                    <p className="text-xs text-right opacity-70 mt-1">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </CardContent>
                    <div className="border-t p-4 bg-background">
                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                autoComplete="off"
                            />
                            <Button type="submit" disabled={isSending} size="icon">
                                <span className="sr-only">Send</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
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
