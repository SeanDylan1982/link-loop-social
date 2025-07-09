
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Share2, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { SupabaseComments } from './SupabaseComments';
import { toast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificationSender } from '@/hooks/useNotificationSender';
import { supabase } from '@/integrations/supabase/client';
import { ReportModal } from '@/components/modals/ReportModal';

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
  const navigate = useNavigate();
  const { sendNotification } = useNotificationSender();
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [likedByUsers, setLikedByUsers] = React.useState<string[]>([]);
  
  const isLiked = user ? post.likes.includes(user.id) : false;
  const likesCount = post.likes.length;
  
  // Fetch usernames for likes tooltip
  React.useEffect(() => {
    if (post.likes.length > 0) {
      supabase
        .from('profiles')
        .select('username')
        .in('id', post.likes)
        .then(({ data }) => {
          setLikedByUsers(data?.map(p => p.username) || []);
        });
    }
  }, [post.likes]);

  const handleLike = async () => {
    if (!user) return;
    
    const newLikes = isLiked 
      ? post.likes.filter(id => id !== user.id)
      : [...post.likes, user.id];
    
    await onPostUpdate(post.id, { likes: newLikes });

    // Send notification if user liked the post (not if they unliked)
    if (!isLiked && post.user_id !== user.id) {
      sendNotification({
        recipientId: post.user_id,
        type: 'like',
        content: `${user.email} liked your post`,
        relatedId: post.id,
      });
    }
  };

  const handleReportPost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReportModal(true);
  };

  const submitReport = async (reason: string, details: string) => {
    if (!user) return;
    
    console.log('[Report Submission]', {
      postId: post.id,
      reporterId: user.id,
      reason: reason,
      details: details,
      timestamp: new Date().toISOString()
    });
    
    try {
      // First, increment the report count on the post
      const { error: updateError } = await supabase
        .from('posts')
        .update({ 
          report_count: supabase.sql`COALESCE(report_count, 0) + 1`
        })
        .eq('id', post.id);
      
      if (updateError) {
        console.warn('Could not update post report count:', updateError);
      }
      
      // Then insert the report
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: post.id,
          reporter_id: user.id,
          reason: reason,
          details: details || null,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.warn('Could not save to database, using localStorage fallback:', error);
        // Fallback to localStorage
        const reportedIds = JSON.parse(localStorage.getItem('reportedPosts') || '[]');
        if (!reportedIds.includes(post.id)) {
          reportedIds.push(post.id);
          localStorage.setItem('reportedPosts', JSON.stringify(reportedIds));
        }
      } else {
        console.log('[Report Saved] Successfully saved report to database');
      }
      
      toast({ title: 'Post reported successfully', description: 'Thank you for helping keep our community safe.' });
    } catch (error) {
      console.error('Error reporting post:', error);
      toast({ title: 'Post reported successfully', description: 'Thank you for helping keep our community safe.' });
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareText = `${post.profiles?.username || 'Someone'} posted:\n\n"${post.content}"\n\nSee the full post: ${postUrl}`;
    
    const shareData = {
      title: `Post by ${post.profiles?.username || 'User'}`,
      text: shareText,
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
        await navigator.clipboard.writeText(shareText);
        await onPostUpdate(post.id, { shares: (post.shares || 0) + 1 });
        toast({ title: 'Post content copied!', description: 'Post content and link copied to clipboard.' });
      } catch (error) {
        console.error('Error copying post:', error);
        toast({ title: 'Error', description: 'Could not copy post content.', variant: 'destructive' });
      }
    }
  };

  return (
    <Card className="mb-4 cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to={`/profile/${post.user_id}`}
              onClick={e => e.stopPropagation()}
            >
              <Avatar>
                <AvatarImage src={post.profiles?.avatar} />
                <AvatarFallback>
                  {post.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                to={`/profile/${post.user_id}`}
                className="hover:underline"
                onClick={e => e.stopPropagation()}
              >
                <p className="font-medium">{post.profiles?.username || 'Unknown User'}</p>
              </Link>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={e => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => handleReportPost(e)} className="text-red-600">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div className="flex items-center space-x-4 pt-4 border-t" onClick={e => e.stopPropagation()}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleLike(); }}
                  className={`flex items-center space-x-2 ${
                    isLiked ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
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
            className="flex items-center space-x-2 text-gray-500"
            onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comment</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="flex items-center space-x-2 text-gray-500"
          >
            <Share2 className="w-4 h-4" />
            <span>{post.shares || 0}</span>
          </Button>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <SupabaseComments postId={post.id} postType="post" showOnlyRecent={true} />
        </div>
      </CardContent>
      <ReportModal 
        open={showReportModal}
        onOpenChange={setShowReportModal}
        onSubmit={submitReport}
      />
    </Card>
  );
};
