
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Search } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DirectMessageModal } from './DirectMessageModal';

interface Friend {
  id: string;
  username: string;
  avatar?: string;
}

export const NewDirectMessageDialog = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [dmModalOpen, setDmModalOpen] = useState(false);
  const { user } = useSupabaseAuth();

  const searchFriends = async () => {
    if (!user || !searchTerm.trim()) return;

    setLoading(true);
    try {
      // Search for friends by username
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (friendshipsError) {
        throw friendshipsError;
      }

      // Get friend IDs
      const friendIds = friendships?.map(f => 
        f.user1_id === user.id ? f.user2_id : f.user1_id
      ) || [];

      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      // Get profiles of friends that match search term
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar')
        .in('id', friendIds)
        .ilike('username', `%${searchTerm}%`);

      if (profilesError) {
        throw profilesError;
      }

      setFriends(profiles || []);
    } catch (error) {
      console.error('Error searching friends:', error);
      toast({ title: "Error", description: "Failed to search friends", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend);
    setOpen(false);
    setDmModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <MessageSquare size={16} className="mr-2" />
            New Message
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search friends..."
                onKeyPress={(e) => e.key === 'Enter' && searchFriends()}
              />
              <Button onClick={searchFriends} disabled={loading}>
                <Search size={16} />
              </Button>
            </div>
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
                    {searchTerm ? 'No friends found' : 'Search for friends to start a conversation'}
                  </div>
                ) : (
                  friends.map((friend) => (
                    <Button
                      key={friend.id}
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto"
                      onClick={() => handleFriendSelect(friend)}
                    >
                      <div className="flex items-center gap-3">
                        {friend.avatar ? (
                          <img 
                            src={friend.avatar} 
                            alt={friend.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{friend.username}</span>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {selectedFriend && (
        <DirectMessageModal
          friend={selectedFriend}
          isOpen={dmModalOpen}
          onClose={() => setDmModalOpen(false)}
        />
      )}
    </>
  );
};
