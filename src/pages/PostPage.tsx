
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Heart, Share2, ArrowLeft } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useEffect, useState } from 'react';
import { SupabaseComments } from '@/components/feed/SupabaseComments';
import { toast } from '@/hooks/use-toast';

interface PostData {
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

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useSupabaseAuth();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:profiles (
          username,
          avatar
        )
      `)
      .eq('id', postId)
      .maybeSingle();

    setPost(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line
  }, [postId]);

  const handleLike = async () => {
    if (!user || !post) return;
    setLikeLoading(true);
    const isLiked = post.likes.includes(user.id);
    const newLikes = isLiked ? post.likes.filter((id) => id !== user.id) : [...post.likes, user.id];
    const { data, error } = await supabase
      .from('posts')
      .update({ likes: newLikes })
      .eq('id', post.id)
      .select(`
        *,
        profiles:profiles (
          username,
          avatar
        )
      `)
      .maybeSingle();

    if (error) {
      toast({ title: "Error", description: "Could not like post", variant: "destructive" });
    } else if (data) {
      setPost(data);
    }
    setLikeLoading(false);
  };

  const handleShare = async () => {
    if (!post) return;
    setShareLoading(true);
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: `Check out this post on SocialConnect!`,
      text: post.content,
      url: postUrl,
    };
    let shared = false;

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch (e) {
        // ignore abort errors
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        toast({ title: 'Link copied!', description: 'Post link copied to clipboard.' });
        shared = true;
      } catch (e) {
        toast({ title: 'Error', description: 'Could not copy post link.', variant: 'destructive' });
      }
    }

    if (shared) {
      const { data, error } = await supabase
        .from('posts')
        .update({ shares: (post.shares || 0) + 1 })
        .eq('id', post.id)
        .select(`
          *,
          profiles:profiles (
            username,
            avatar
          )
        `)
        .maybeSingle();

      if (!error && data) setPost(data);
      toast({ title: 'Thank you for sharing!' });
    }
    setShareLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p className="text-gray-500 text-lg">Post not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-2">
          <ArrowLeft className="mr-2" size={18} /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="" onTabChange={tab => navigate(`/?tab=${tab}`)} />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2" size={18} /> Back
        </Button>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.user_id}`}>
                <Avatar>
                  <AvatarImage src={post.profiles?.avatar} />
                  <AvatarFallback>
                    {post.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link to={`/profile/${post.user_id}`} className="hover:underline">
                  <p className="font-medium">{post.profiles?.username || 'Unknown User'}</p>
                </Link>
                <p className="text-sm text-gray-500">
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{post.content}</p>
            {post.image && (
              <img src={post.image} alt="Post content" className="w-full rounded-lg mb-4 max-h-96 object-cover" />
            )}
            <div className="flex items-center space-x-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 ${post.likes.includes(user?.id || '') ? 'text-red-500' : 'text-gray-500'}`}
                disabled={likeLoading}
              >
                <Heart className={`w-4 h-4 ${post.likes.includes(user?.id || '') ? 'fill-current' : ''}`} />
                <span>{post.likes.length}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-500"
                disabled={shareLoading}
              >
                <Share2 className="w-4 h-4" />
                <span>{post.shares || 0}</span>
              </Button>
            </div>
            <div className="pt-6">
              <SupabaseComments postId={post.id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostPage;
