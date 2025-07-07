
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle } from 'lucide-react';
import { TopicPost } from '@/hooks/useTopics';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { SupabaseComments } from '@/components/feed/SupabaseComments';
import { useNotificationSender } from '@/hooks/useNotificationSender';

interface TopicPostCardProps {
  post: TopicPost;
  onPostUpdate: (postId: string, updates: Partial<TopicPost>) => void;
}

export const TopicPostCard: React.FC<TopicPostCardProps> = ({ post, onPostUpdate }) => {
  const { user } = useSupabaseAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { sendNotification } = useNotificationSender();

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      const currentLikes = post.likes || [];
      const isLiked = currentLikes.includes(user.id);
      const newLikes = isLiked
        ? currentLikes.filter(id => id !== user.id)
        : [...currentLikes, user.id];

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
    } finally {
      setIsLiking(false);
    }
  };

  const isLiked = user && post.likes?.includes(user.id);

  return (
    <Card className="mb-4">
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
        <div className="flex items-center space-x-4 border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={isLiked ? 'text-red-500' : ''}
          >
            <Heart size={16} className={isLiked ? 'fill-current' : ''} />
            <span className="ml-1">{post.likes?.length || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2"
          >
            <MessageCircle size={16} />
            <span>Comments</span>
          </Button>
        </div>
        {showComments && (
          <div className="mt-4">
            <SupabaseComments postId={post.id} postType="topic_post" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
