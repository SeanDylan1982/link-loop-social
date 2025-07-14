import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSimpleMessaging } from '@/hooks/useSimpleMessaging';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SimpleConversationsList: React.FC = () => {
  const { conversations, friends, loading, createDirectConversation } = useSimpleMessaging();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showFriendsDialog, setShowFriendsDialog] = useState(false);

  const handleStartConversation = async (friendId: string) => {
    const conversationId = await createDirectConversation(friendId);
    if (conversationId) {
      setShowFriendsDialog(false);
      navigate(`/conversation/${conversationId}`);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/conversation/${conversationId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle size={20} />
            Messages
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFriendsDialog(true)}
              title="New Direct Message"
            >
              <Plus size={16} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {conversations.length > 0 ? (
                conversations.map((conversation) => {
                  const displayName = conversation.is_group 
                    ? conversation.title || 'Group Chat'
                    : conversation.other_user?.username || 'Unknown User';
                  
                  return (
                    <div
                      key={conversation.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleConversationClick(conversation.id)}
                    >
                      <Avatar>
                        <AvatarImage src={conversation.other_user?.avatar || undefined} />
                        <AvatarFallback>
                          {conversation.is_group ? (
                            <Users size={16} />
                          ) : (
                            displayName.charAt(0).toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{displayName}</h4>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(conversation.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No conversations yet. Start one by clicking the + button!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Friends Dialog for starting new conversations */}
      <Dialog open={showFriendsDialog} onOpenChange={setShowFriendsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a conversation</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <Button
                    key={friend.id}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => handleStartConversation(friend.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.avatar || undefined} />
                        <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-medium">{friend.username}</div>
                        <div className="text-sm text-muted-foreground">
                          Start conversation
                        </div>
                      </div>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No friends found. Add some friends to start conversations!
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};