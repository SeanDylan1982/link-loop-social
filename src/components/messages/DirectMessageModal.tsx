
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversations } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useQueryClient } from "@tanstack/react-query";

interface DirectMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friend: {
    id: string;
    username: string;
    avatar: string | null;
  } | null;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  open,
  onOpenChange,
  friend,
}) => {
  const { getOrCreateDM } = useConversations();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friend || !message.trim() || !user) return;

    setSending(true);
    try {
      // Get (or create) the conversation
      const conv = await getOrCreateDM(friend.id);
      if (conv?.id) {
        // Insert the first message into the conversation
        const { supabase } = await import("@/integrations/supabase/client");
        const { error } = await supabase.from("messages").insert({
          conversation_id: conv.id,
          sender_id: user.id,
          receiver_id: friend.id,
          content: message.trim(),
        });
        if (error) throw error;

        // Invalidate conversations query for up-to-date conversations list
        queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });

        toast({ title: "Message sent!", description: `Message delivered to ${friend.username}` });
        setMessage("");
        onOpenChange(false);
      }
    } catch (e: any) {
      console.error("Failed to send message:", e);
      toast({
        title: "Error sending message",
        description: e?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (!friend) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New message to</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 my-1">
          <Avatar className="w-8 h-8">
            <AvatarImage src={friend.avatar || undefined} />
            <AvatarFallback>{friend.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{friend.username}</span>
        </div>
        <form className="space-y-2" onSubmit={handleSend}>
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
            autoFocus
          />
          <DialogFooter>
            <Button type="submit" disabled={sending || !message.trim()}>
              Send
            </Button>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
