
import React, { useState, useEffect } from "react";
import { useSupabaseComments } from "@/hooks/useSupabaseComments";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationSender } from "@/hooks/useNotificationSender";

interface Props {
  postId: string;
  postType?: 'post' | 'topic_post';
}

interface Profile {
  id: string;
  username: string;
  avatar?: string;
}

export const SupabaseComments: React.FC<Props> = ({ postId, postType = 'post' }) => {
  const { comments, loading, addComment } = useSupabaseComments(postId);
  const { user, profile } = useSupabaseAuth();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { sendNotification } = useNotificationSender();

  // Map of user_id to profile
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [postOwnerId, setPostOwnerId] = useState<string | null>(null);

  // Fetch post owner info to send notifications
  useEffect(() => {
    const fetchPostOwner = async () => {
      const tableName = postType === 'topic_post' ? 'topic_posts' : 'posts';
      const { data, error } = await supabase
        .from(tableName)
        .select('user_id')
        .eq('id', postId)
        .single();
      
      if (!error && data) {
        setPostOwnerId(data.user_id);
      }
    };

    fetchPostOwner();
  }, [postId, postType]);

  // Fetch all relevant profiles when comments load
  useEffect(() => {
    // Get unique user_ids from the comments, including your profile
    const userIds = Array.from(
      new Set([
        ...(comments.map((comment) => comment.user_id) || []),
        ...(profile?.id ? [profile.id] : []),
      ])
    );

    if (userIds.length === 0) {
      setProfiles({});
      return;
    }

    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,avatar")
        .in("id", userIds);

      if (!error && data) {
        // Map by id for fast lookup
        const map: Record<string, Profile> = {};
        for (const row of data) {
          map[row.id] = row;
        }
        setProfiles(map);
      }
    };

    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments.length, profile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    
    setSubmitting(true);
    const success = await addComment(commentText.trim());
    
    if (success) {
      // Send notification to post owner if it's not their own comment
      if (postOwnerId && postOwnerId !== user.id) {
        sendNotification({
          recipientId: postOwnerId,
          type: 'comment',
          content: `${profile?.username || user.email} commented on your ${postType === 'topic_post' ? 'topic post' : 'post'}`,
          relatedId: postId,
        });
      }
      setCommentText("");
    }
    
    setSubmitting(false);
  };

  return (
    <div className="pt-4">
      <h4 className="text-sm font-semibold mb-2">Comments</h4>
      {user && (
        <form onSubmit={handleSubmit} className="flex items-start space-x-2 mb-4">
          <Avatar className="w-8 h-8 mt-1">
            <AvatarImage src={profile?.avatar} />
            <AvatarFallback>
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
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
          comments.map((comment) => {
            const commentProfile = profiles[comment.user_id];
            return (
              <div key={comment.id} className="flex space-x-2 items-start p-2 bg-gray-50 rounded-lg">
                <Avatar className="w-6 h-6 mt-1">
                  <AvatarImage src={commentProfile?.avatar} />
                  <AvatarFallback>
                    {commentProfile?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">
                      {commentProfile?.username || "User"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
