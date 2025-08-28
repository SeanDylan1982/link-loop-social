import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageSquare, Share, Send } from 'lucide-react';
import { Post, Comment, User } from '@/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';
import { CommentCard } from './CommentCard';

interface PostCardProps {
  post: Post;
  author: User;
  onPostUpdate: (updatedPost: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, author, onPostUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useSupabaseAuth();

  const handleLike = () => {
    if (!user) return;

    const updatedPost = { ...post };
    const userIndex = updatedPost.likes.indexOf(user.id);
    
    if (userIndex > -1) {
      updatedPost.likes.splice(userIndex, 1);
    } else {
      updatedPost.likes.push(user.id);
    }

    onPostUpdate(updatedPost);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    
    try {
      const comment: Comment = {
        id: Date.now().toString(),
        user_id: user.id,
        post_id: post.id,
        content: newComment.trim(),
        likes: [],
        post_type: 'post',
        created_at: new Date().toISOString()
      };

      setComments([...comments, comment]);
      setNewComment('');
      toast({ title: "Comment added!" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const updatedPost = { ...post };
    updatedPost.shares = (updatedPost.shares || 0) + 1;
    onPostUpdate(updatedPost);
    toast({ title: "Post shared!" });
  };

  const isLiked = user ? post.likes.includes(user.id) : false;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={author.user_metadata?.avatar} />
            <AvatarFallback>{author.user_metadata?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{author.user_metadata?.username || 'User'}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{post.content}</p>
        
        {post.image && (
          <img 
            src={post.image} 
            alt="Post content" 
            className="w-full rounded-lg mb-4 max-h-96 object-cover"
          />
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{post.likes.length}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2"
          >
            <MessageSquare size={16} />
            <span>{comments.length}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2"
          >
            <Share size={16} />
            <span>{post.shares || 0}</span>
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3">
            <form onSubmit={handleComment} className="flex space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.user_metadata?.avatar} />
                <AvatarFallback>{user?.user_metadata?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
                <Button type="submit" size="sm" disabled={!newComment.trim() || loading}>
                  <Send size={16} />
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};