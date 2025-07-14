import React from 'react';
import { useParams } from 'react-router-dom';
import { useConversation } from '@/hooks/useConversation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/Navbar';

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { messages, loading, sendMessage } = useConversation(conversationId);
  const [newMessage, setNewMessage] = React.useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading messages...</div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <b>{message.senderId}:</b> {message.content}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversationPage;
