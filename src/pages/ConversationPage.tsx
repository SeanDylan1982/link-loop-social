
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

const ConversationPage: React.FC = () => {
    const { userId: otherUserId } = useParams<{ userId: string }>();
    const { user } = useSupabaseAuth();
    const navigate = useNavigate();
    const { profile: otherUserProfile, loading: profileLoading } = useUserProfile(otherUserId);
    const { messages, isLoading: messagesLoading, sendMessage, isSending } = useConversation(otherUserId);
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
    
    const loading = profileLoading || messagesLoading;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar activeTab={'messages'} onTabChange={handleNavChange} />
            <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading conversation...</div>
                ) : !otherUserProfile ? (
                    <div className="text-center py-8 text-red-500">User not found.</div>
                ) : (
                <Card className="flex-grow flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                        <div className="flex items-center space-x-4">
                             <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                                Back
                            </Button>
                            <Avatar>
                                <AvatarImage src={otherUserProfile.avatar || undefined} />
                                <AvatarFallback>{otherUserProfile.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{otherUserProfile.username}</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
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
                                <Send />
                                <span className="sr-only">Send</span>
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

