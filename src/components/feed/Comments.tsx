import React from 'react';
import { useComments } from '@/hooks/useComments';
import { CommentCard } from './CommentCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';

interface CommentsProps {
  postId: string;
  postType: string; // Not used, but kept for compatibility
  showOnlyRecent?: boolean;
}

export const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const { comments, loading, createComment } = useComments(postId);
  const [newComment, setNewComment] = React.useState('');
  const { user } = useAuth();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    await createComment(newComment);
    setNewComment('');
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div className="mt-4 space-y-3">
      <form onSubmit={handleCommentSubmit} className="flex space-x-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60px] resize-none"
        />
        <Button type="submit" size="sm" disabled={!newComment.trim()}>
          Post
        </Button>
      </form>
      <div className="space-y-2">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};
