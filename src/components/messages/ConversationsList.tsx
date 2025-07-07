
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations } from '@/hooks/useConversations';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Plus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewDirectMessageDialog } from './NewDirectMessageDialog';

interface ConversationsListProps {
  onCreateGroup: () => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({ onCreateGroup }) => {
  const { conversations, isLoading } = useConversations();
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
              <Button size="sm" variant="outline" onClick={() => {
                console.log('[ConversationsList] Manual refresh triggered');
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
              }} title="Refresh">
                ↻
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3 group">
              {conversations.length > 0 ? (
                conversations.map((conversation) => {
                  // For direct messages, find the other participant (not current user)
                  const otherParticipant = conversation.is_group 
                    ? null 
                    : conversation.participants.find(p => p.id && p.id !== user?.id);
                  
                  const displayName = conversation.is_group 
                    ? conversation.title 
                    : otherParticipant?.username || 'Direct Message';
                  
                  const participantCount = conversation.participants.length;
                  const lastUpdated = new Date(conversation.updated_at);
                  const isUnread = Math.random() > 0.5; // TODO: Implement actual read status
                  const messageStatus = ['sent', 'delivered', 'read'][Math.floor(Math.random() * 3)]; // TODO: Implement actual status
                  const lastMessage = conversation.lastMessage || 'No messages yet';
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`relative rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors ${
                        conversation.is_group 
                          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }`}
                      onClick={() => handleConversationClick(conversation.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          {conversation.is_group ? (
                            <Users size={18} />
                          ) : (
                            <MessageCircle size={18} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className={`font-medium truncate ${
                              isUnread ? 'font-semibold' : ''
                            }`}>
                              {displayName}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Message status icon */}
                              <div className="text-xs text-muted-foreground">
                                {messageStatus === 'sent' && '✓'}
                                {messageStatus === 'delivered' && '✓✓'}
                                {messageStatus === 'read' && <span className="text-blue-500">✓✓</span>}
                              </div>
                              {isUnread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          
                          {!conversation.is_group && otherParticipant && (
                            <div className="text-sm text-muted-foreground">
                              To: {otherParticipant.username}
                            </div>
                          )}
                          
                          <div className="text-sm text-gray-600 truncate">
                            {lastMessage}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {conversation.is_group 
                                ? `${participantCount} members` 
                                : (otherParticipant?.username || 'Unknown User')
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 p-1 h-auto flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Delete conversation:', conversation.id);
                            // TODO: Implement delete functionality
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
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
