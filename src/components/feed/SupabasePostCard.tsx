
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { SupabaseComments } from './SupabaseComments';
import { toast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image?: string;
  likes: string[];
  shares: number | null;
  created_at: string;
  profiles?: {
    username: string;
    avatar?: string;
  };
}

interface SupabasePostCardProps {
  post: Post;
  onPostUpdate: (postId: string, updates: Partial<Post>) => Promise<void>;
}

export const SupabasePostCard: React.FC<SupabasePostCardProps> = ({ post, onPostUpdate }) => {
  const { user } = useSupabaseAuth();
  
  const isLiked = user ? post.likes.includes(user.id) : false;
  const likesCount = post.likes.length;

  const handleLike = async () => {
    if (!user) return;
    
    const newLikes = isLiked 
      ? post.likes.filter(id => id !== user.id)
      : [...post.likes, user.id];
    
    await onPostUpdate(post.id, { likes: newLikes });
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: `Check out this post on SocialConnect!`,
      text: post.content,
      url: postUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        await onPostUpdate(post.id, { shares: (post.shares || 0) + 1 });
        toast({ title: 'Post shared successfully!' });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing post:', error);
          toast({ title: 'Error', description: 'Could not share post.', variant: 'destructive' });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        await onPostUpdate(post.id, { shares: (post.shares || 0) + 1 });
        toast({ title: 'Link copied!', description: 'Post link copied to clipboard.' });
      } catch (error) {
        console.error('Error copying link:', error);
        toast({ title: 'Error', description: 'Could not copy post link.', variant: 'destructive' });
      }
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.profiles?.avatar} />
            <AvatarFallback>
              {post.profiles?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.profiles?.username || 'Unknown User'}</p>
            <p className="text-sm text-gray-500">
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
            className="w-full rounded-lg mb-4"
          />
        )}
        <div className="flex items-center space-x-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              isLiked ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-gray-500"
            disabled
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comment</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-500"
          >
            <Share2 className="w-4 h-4" />
            <span>{post.shares || 0}</span>
          </Button>
        </div>
        <SupabaseComments postId={post.id} />
      </CardContent>
    </Card>
  );
};
