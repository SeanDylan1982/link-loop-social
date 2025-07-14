import React from 'react';
import { Link } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MessagesPage: React.FC = () => {
  const { conversations, loading } = useConversations();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button asChild>
            <Link to="/messages/new">New Message</Link>
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading conversations...</div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card key={conversation.id}>
                <CardContent className="p-4">
                  <Link to={`/messages/${conversation.id}`}>
                    <h3 className="font-bold">{conversation.title || 'Conversation'}</h3>
                    <p className="text-gray-600">{conversation.lastMessage}</p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
