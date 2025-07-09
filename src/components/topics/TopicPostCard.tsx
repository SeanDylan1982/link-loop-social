
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TopicPost } from '@/hooks/useTopics';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { SupabaseComments } from '@/components/feed/SupabaseComments';
import { useNotificationSender } from '@/hooks/useNotificationSender';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TopicPostCardProps {
  post: TopicPost;
  onPostUpdate: (postId: string, updates: Partial<TopicPost>) => Promise<void>;
}

export const TopicPostCard: React.FC<TopicPostCardProps> = ({ post, onPostUpdate }) => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  const { sendNotification } = useNotificationSender();
  const [likedByUsers, setLikedByUsers] = React.useState<string[]>([]);

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      const currentLikes = post.likes || [];
      const isLiked = currentLikes.includes(user.id);
      const newLikes = isLiked
        ? currentLikes.filter(id => id !== user.id)
        : [...currentLikes, user.id];

      // Update using the hook's update function
      await onPostUpdate(post.id, { likes: newLikes });

      // Send notification if user liked the post (not if they unliked)
      if (!isLiked && post.user_id !== user.id) {
        sendNotification({
          recipientId: post.user_id,
          type: 'like',
          content: `${user.email} liked your post in a topic`,
          relatedId: post.id,
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast({ title: 'Error', description: 'Failed to update like', variant: 'destructive' });
    } finally {
      setIsLiking(false);
    }
  };

  const isLiked = user && post.likes?.includes(user.id);
  
  // Fetch usernames for likes tooltip
  React.useEffect(() => {
    if (post.likes && post.likes.length > 0) {
      supabase
        .from('profiles')
        .select('username')
        .in('id', post.likes)
        .then(({ data }) => {
          setLikedByUsers(data?.map(p => p.username) || []);
        });
    }
  }, [post.likes]);

  return (
    <Card className="mb-4 cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.profiles?.avatar} />
            <AvatarFallback>
              {post.profiles?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.profiles?.username || 'Unknown User'}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post attachment"
            className="w-full max-w-lg rounded-lg mb-3"
          />
        )}
        <div className="flex items-center space-x-4 border-t pt-3" onClick={e => e.stopPropagation()}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleLike(); }}
                  disabled={isLiking}
                  className={isLiked ? 'text-red-500' : ''}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  <span className="ml-1">{post.likes?.length || 0}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {likedByUsers.length > 0 ? (
                  <div className="max-w-xs">
                    <p className="font-medium">Liked by:</p>
                    <p>{likedByUsers.join(', ')}</p>
                  </div>
                ) : (
                  <p>No likes yet</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
            className="flex items-center space-x-2"
          >
            <MessageCircle size={16} />
            <span>Comments</span>
          </Button>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <SupabaseComments postId={post.id} postType="post" showOnlyRecent={true} />
        </div>
      </CardContent>
    </Card>
  );
};
