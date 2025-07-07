
import React, { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  afterCreated: (conversationId: string) => void;
}

export const CreateGroupConversation: React.FC<Props> = ({ open, onOpenChange, afterCreated }) => {
  const { getProfiles, createConversation, isCreating } = useConversations();
  const [title, setTitle] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; username: string; avatar: string | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    if (open) {
      console.log("[CreateGroupConversation] Dialog opened, fetching profiles");
      setLoading(true);
      setError(null);

      getProfiles()
        .then((ps) => {
          if (isMounted) {
            console.log("[CreateGroupConversation] Fetched profiles:", ps);
            setProfiles(ps);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error(
            "[CreateGroupConversation] Error fetching profiles:",
            error
          );
          if (isMounted) {
            setError("Failed to load users");
            setLoading(false);
          }
        });

      // Reset form state
      setTitle("");
      setSelectedUsers([]);
    } else {
      // Reset state when dialog closes
      setProfiles([]);
      setError(null);
      setTitle("");
      setSelectedUsers([]);
    }

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!title || selectedUsers.length === 0) return;
    
    try {
      console.log('[CreateGroupConversation] Creating group with:', { title, selectedUsers });
      // The hook will automatically add the creator as a participant
      const conversation = await createConversation({
        title,
        participantIds: selectedUsers, // Just the selected users, creator will be added by the hook
        isGroup: true,
      });
      
      if (conversation?.id) {
        console.log('[CreateGroupConversation] Group created successfully:', conversation.id);
        onOpenChange(false);
        afterCreated(conversation.id);
      }
    } catch (error) {
      console.error('[CreateGroupConversation] Error creating group conversation:', error);
      setError('Failed to create group conversation');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Group Conversation</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-4 text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="py-4 text-red-500">{error}</div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
          >
            <Input
              type="text"
              placeholder="Group Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div>
              <div className="font-medium mb-2">Add participants:</div>
              <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
                {profiles.map((profile) => (
                  <label key={profile.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedUsers.includes(profile.id)}
                      onCheckedChange={() => handleSelectUser(profile.id)}
                      id={`chk-${profile.id}`}
                    />
                    <span>{profile.username}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating || !title || selectedUsers.length === 0}>
                {isCreating ? "Creating..." : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
