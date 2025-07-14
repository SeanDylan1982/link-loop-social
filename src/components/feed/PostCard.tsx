
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageSquare, Share, Send } from 'lucide-react';
import { Post, Comment, User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PostCardProps {
  post: Post;
  author: User;
  onPostUpdate: (updatedPost: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, author, onPostUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleLike = () => {
    if (!user) return;

    const updatedPost = { ...post };
    const userIndex = updatedPost.likes.indexOf(user.id);
    
    if (userIndex > -1) {
      updatedPost.likes.splice(userIndex, 1);
    } else {
      updatedPost.likes.push(user.id);
    }

    // Update in localStorage
    const posts = JSON.parse(localStorage.getItem('socialPosts') || '[]');
    const postIndex = posts.findIndex((p: Post) => p.id === post.id);
    if (postIndex > -1) {
      posts[postIndex] = updatedPost;
      localStorage.setItem('socialPosts', JSON.stringify(posts));
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
        userId: user.id,
        postId: post.id,
        content: newComment.trim(),
        likes: [],
        replies: [],
        createdAt: new Date()
      };

      const updatedPost = { ...post };
      updatedPost.comments.push(comment);

      // Update in localStorage
      const posts = JSON.parse(localStorage.getItem('socialPosts') || '[]');
      const postIndex = posts.findIndex((p: Post) => p.id === post.id);
      if (postIndex > -1) {
        posts[postIndex] = updatedPost;
        localStorage.setItem('socialPosts', JSON.stringify(posts));
      }

      onPostUpdate(updatedPost);
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
    updatedPost.shares += 1;

    // Update in localStorage
    const posts = JSON.parse(localStorage.getItem('socialPosts') || '[]');
    const postIndex = posts.findIndex((p: Post) => p.id === post.id);
    if (postIndex > -1) {
      posts[postIndex] = updatedPost;
      localStorage.setItem('socialPosts', JSON.stringify(posts));
    }

    onPostUpdate(updatedPost);
    toast({ title: "Post shared!" });
  };

  const isLiked = user ? post.likes.includes(user.id) : false;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={author.avatar} />
            <AvatarFallback>{author.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{author.username}</p>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
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
            <span>{post.comments.length}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2"
          >
            <Share size={16} />
            <span>{post.shares}</span>
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3">
            <form onSubmit={handleComment} className="flex space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
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
              {post.comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
