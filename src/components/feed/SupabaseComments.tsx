
import React, { useState } from "react";
import { useSupabaseComments } from "@/hooks/useSupabaseComments";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface Props {
  postId: string;
}

export const SupabaseComments: React.FC<Props> = ({ postId }) => {
  const { comments, loading, addComment } = useSupabaseComments(postId);
  const { user, profile } = useSupabaseAuth();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await addComment(commentText.trim());
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className="pt-4">
      <h4 className="text-sm font-semibold mb-2">Comments</h4>
      {user && (
        <form onSubmit={handleSubmit} className="flex items-start space-x-2 mb-4">
          <Avatar className="w-8 h-8 mt-1">
            <AvatarImage src={profile?.avatar} />
            <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex space-x-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[36px] resize-none"
              disabled={submitting}
            />
            <Button type="submit" size="sm" disabled={submitting || !commentText.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-400 text-sm">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-2 items-start p-2 bg-gray-50 rounded-lg">
              <Avatar className="w-6 h-6 mt-1">
                <AvatarImage src={comment.profiles?.avatar} />
                <AvatarFallback>{comment.profiles?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs">{comment.profiles?.username || "User"}</span>
                  <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
