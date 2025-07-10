import React from 'react';
import { useParams } from 'react-router-dom';
import { SimpleMessagesList } from '@/components/messages/SimpleMessagesList';

export const SimpleConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();

  if (!conversationId) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Conversation not found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen">
      <SimpleMessagesList conversationId={conversationId} />
    </div>
  );
};