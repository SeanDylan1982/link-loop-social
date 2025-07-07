
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations } from '@/hooks/useConversations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  avatar?: string;
}

interface DirectMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export const DirectMessageDialog: React.FC<DirectMessageDialogProps> = ({ 
  open, 
  onOpenChange, 
  onConversationCreated 
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const { getFriends, getOrCreateDM } = useConversations();

  useEffect(() => {
    if (open) {
      setLoading(true);
      getFriends().then((friendsList) => {
        setFriends(friendsList);
        setLoading(false);
      }).catch((error) => {
        console.error('Error fetching friends:', error);
        setLoading(false);
      });
    }
  }, [open, getFriends]);

  const handleStartConversation = async (friend: Friend) => {
    try {
      const conversation = await getOrCreateDM(friend.id);
      onOpenChange(false);
      onConversationCreated(conversation.id);
    } catch (error) {
      console.error('Error creating/finding conversation:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {loading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded" />
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No friends found. Add some friends to start conversations!
                </div>
              ) : (
                friends.map((friend) => (
                  <Button
                    key={friend.id}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => handleStartConversation(friend)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.avatar || undefined} />
                        <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{friend.username}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MessageCircle size={12} />
                          Start conversation
                        </div>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
