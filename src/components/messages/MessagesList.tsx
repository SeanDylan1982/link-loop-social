
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export const MessagesList: React.FC = () => {
  const { user, profile } = useSupabaseAuth();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch friends: users you have friendship with
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      // Get friendships where the user is user1 OR user2
      const { data, error } = await supabase
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      if (error) return;
      const otherUserIds: string[] = data
        ? data.map((f: any) =>
            f.user1_id === user.id ? f.user2_id : f.user1_id
          )
        : [];
      // Fetch profiles for those ids
      if (otherUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', otherUserIds);
        setFriends(profiles || []);
      } else {
        setFriends([]);
      }
    };
    fetchFriends();
  }, [user]);

  // Fetch messages with selected friend
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !selectedFriend) return;
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `(sender_id.eq.${user.id},receiver_id.eq.${selectedFriend.id}),(sender_id.eq.${selectedFriend.id},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });
      if (!error && data) {
        setMessages(data as Message[]);
      }
    };
    fetchMessages();
  }, [selectedFriend, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend || !user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: selectedFriend.id,
            content: newMessage.trim(),
            read: false
          }
        ])
        .select('*')
        .single();
      if (error) throw error;

      setMessages([...messages, data as Message]);
      setNewMessage('');
      toast({ title: "Message sent!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Friends List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 border-b ${
                      selectedFriend?.id === friend.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={friend.avatar || undefined} />
                      <AvatarFallback>
                        {friend.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{friend.username}</p>
                      <p className="text-sm text-gray-500 truncate">
                        Click to start messaging
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>No friends to message yet.</p>
                  <p className="text-sm">Add some friends first!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2">
          {selectedFriend ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={selectedFriend.avatar || undefined} />
                    <AvatarFallback>
                      {selectedFriend.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedFriend.username}</p>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === user?.id
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {message.created_at
                              ? new Date(message.created_at).toLocaleTimeString()
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet.</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim() || loading}>
                      <Send size={16} />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg">Select a friend to start messaging</p>
                <p className="text-sm">Choose from your friends list on the left</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
