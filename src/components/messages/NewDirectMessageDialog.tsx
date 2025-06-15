
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversations } from "@/hooks/useConversations";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  afterNavigate: (conversationId: string) => void;
}

export const NewDirectMessageDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  afterNavigate,
}) => {
  const { getFriends, getOrCreateDM } = useConversations();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getFriends().then((f) => {
        setFriends(f);
        setLoading(false);
      });
      setSearch("");
    }
  }, [open, getFriends]);

  const filteredFriends = friends.filter(
    (f) =>
      f.username?.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleSelectFriend = async (id: string) => {
    setCreating(true);
    try {
      const conv = await getOrCreateDM(id);
      if (conv?.id) {
        onOpenChange(false);
        afterNavigate(conv.id);
      }
    } catch (e) {
      window.alert("Could not start direct message. Try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-4 text-gray-500">Loading friends...</div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Search friends"
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={creating}
            />
            <div className="max-h-56 overflow-y-auto flex flex-col gap-2">
              {filteredFriends.length === 0 ? (
                <div className="text-gray-500 py-8 text-center">No friends found.</div>
              ) : (
                filteredFriends.map(friend => (
                  <button
                    key={friend.id}
                    className="flex items-center gap-3 px-2 py-2 hover:bg-muted rounded w-full text-left"
                    onClick={() => handleSelectFriend(friend.id)}
                    disabled={creating}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={friend.avatar || undefined} />
                      <AvatarFallback>{friend.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{friend.username}</span>
                  </button>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                Cancel
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
