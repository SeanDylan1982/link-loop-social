
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations } from '@/hooks/useConversations';
import { Users, Plus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversationsListProps {
  onCreateGroup: () => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({ onCreateGroup }) => {
  const { conversations, loading } = useConversations();
  const navigate = useNavigate();

  const handleConversationClick = (conversationId: string) => {
    navigate(`/conversation/${conversationId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              Messages
            </div>
            <Button size="sm" variant="outline" onClick={onCreateGroup}>
              <Plus size={16} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            Messages
          </div>
          <Button size="sm" variant="outline" onClick={onCreateGroup}>
            <Plus size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  className="w-full justify-start text-left p-3 h-auto"
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {conversation.is_group ? (
                        <Users size={16} />
                      ) : (
                        <MessageCircle size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {conversation.title || 'Direct Message'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {conversation.is_group ? 'Group' : 'Direct'}
                      </div>
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No conversations yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
