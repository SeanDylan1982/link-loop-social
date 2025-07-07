
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations } from '@/hooks/useConversations';
import { Users, Plus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewDirectMessageDialog } from './NewDirectMessageDialog';

interface ConversationsListProps {
  onCreateGroup: () => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({ onCreateGroup }) => {
  const { conversations, isLoading } = useConversations();
  const navigate = useNavigate();
  const [showDMDialog, setShowDMDialog] = useState(false);

  console.log('[ConversationsList] Rendering with conversations:', conversations, 'loading:', isLoading);

  const handleConversationClick = (conversationId: string) => {
    console.log('[ConversationsList] Navigating to conversation:', conversationId);
    navigate(`/conversation/${conversationId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              Messages
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowDMDialog(true)}>
                <MessageCircle size={16} />
              </Button>
              <Button size="sm" variant="outline" onClick={onCreateGroup}>
                <Plus size={16} />
              </Button>
            </div>
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              Messages
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowDMDialog(true)} title="New Direct Message">
                <MessageCircle size={16} />
              </Button>
              <Button size="sm" variant="outline" onClick={onCreateGroup} title="New Group">
                <Plus size={16} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {conversations.length > 0 ? (
                conversations.map((conversation) => {
                  const displayName = conversation.is_group 
                    ? conversation.title 
                    : conversation.participants.find(p => p.id)?.username || 'Direct Message';
                  
                  const participantCount = conversation.participants.length;
                  
                  return (
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
                            {displayName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {conversation.is_group 
                              ? `${participantCount} members` 
                              : 'Direct Message'
                            }
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No conversations yet. Start one by clicking the buttons above!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <NewDirectMessageDialog 
        open={showDMDialog} 
        onOpenChange={setShowDMDialog}
        onConversationCreated={handleConversationClick}
      />
    </>
  );
};
