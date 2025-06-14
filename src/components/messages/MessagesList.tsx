
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { User, Message } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

export const MessagesList: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const allUsers = JSON.parse(localStorage.getItem('socialUsers') || '[]');
      const userFriends = allUsers.filter((u: User) => user.friends.includes(u.id));
      setFriends(userFriends);
    }
  }, [user]);

  useEffect(() => {
    if (selectedFriend && user) {
      const allMessages = JSON.parse(localStorage.getItem('socialMessages') || '[]');
      const conversationMessages = allMessages.filter((msg: Message) =>
        (msg.senderId === user.id && msg.receiverId === selectedFriend.id) ||
        (msg.senderId === selectedFriend.id && msg.receiverId === user.id)
      );
      setMessages(conversationMessages.sort((a: Message, b: Message) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
    }
  }, [selectedFriend, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend || !user) return;

    setLoading(true);
    
    try {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user.id,
        receiverId: selectedFriend.id,
        content: newMessage.trim(),
        createdAt: new Date(),
        read: false
      };

      const allMessages = JSON.parse(localStorage.getItem('socialMessages') || '[]');
      allMessages.push(message);
      localStorage.setItem('socialMessages', JSON.stringify(allMessages));

      setMessages([...messages, message]);
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
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
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
                    <AvatarImage src={selectedFriend.avatar} />
                    <AvatarFallback>{selectedFriend.username.charAt(0).toUpperCase()}</AvatarFallback>
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
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
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
