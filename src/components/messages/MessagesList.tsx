
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBroadcastMessaging } from '@/hooks/useBroadcastMessaging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: { username: string };
  receiver?: { username: string };
}

export const MessagesList: React.FC<{ conversationId: string }> = ({ conversationId }) => {
  const { user } = useAuth();
  const { messages, loading } = useBroadcastMessaging({ conversationId });

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div>
      {messages.map((message, idx) => (
        <div key={message.id || idx}>
          <b>{message.sender_id === user?.id ? 'You' : message.sender_id}:</b> {message.content}
        </div>
      ))}
    </div>
  );
};
