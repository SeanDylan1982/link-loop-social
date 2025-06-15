
import React, { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Plus, UserPlus } from "lucide-react";
import { NewDirectMessageDialog } from "./NewDirectMessageDialog";

export const ConversationsList: React.FC<{ onCreateGroup: () => void }> = ({ onCreateGroup }) => {
  const { conversations, isLoading } = useConversations();
  const navigate = useNavigate();

  // State for DM dialog modal
  const [showDMDialog, setShowDMDialog] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Conversations</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowDMDialog(true)}
            title="Start private message"
            className="flex items-center gap-1"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Message</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateGroup}
            title="Start group chat"
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>New Group Message</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : conversations.length > 0 ? (
          <ul>
            {conversations.map((conv) => (
              <li 
                key={conv.id} 
                className="py-2 border-b last:border-b-0 cursor-pointer hover:bg-muted rounded"
                onClick={() => navigate(`/conversation/${conv.id}`)}
              >
                <div className="flex items-center gap-x-3">
                  {conv.is_group ? (
                    <Avatar>
                      <AvatarFallback>
                        {conv.title?.slice(0, 2).toUpperCase() || "G"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar>
                      <AvatarImage src={conv.participants?.[0]?.avatar || undefined} />
                      <AvatarFallback>{conv.participants?.[0]?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div className="font-semibold">
                      {conv.is_group
                        ? conv.title
                        : conv.participants
                          .filter(p => p.id !== undefined)
                          .map(p => p.username)
                          .join(", ")}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No conversations yet.
          </div>
        )}
      </CardContent>
      {/* DM modal */}
      <NewDirectMessageDialog
        open={showDMDialog}
        onOpenChange={setShowDMDialog}
        afterNavigate={id => navigate(`/conversation/${id}`)}
      />
    </Card>
  );
};
