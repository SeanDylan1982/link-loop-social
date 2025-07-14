
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Post } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import * as api from '@/api/api';
import { ImageIcon } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (image) {
        formData.append('image', image);
      }

      const newPost = await api.request('/api/posts', {
        method: 'POST',
        body: formData,
      });

      onPostCreated(newPost);
      setContent('');
      setImage(null);
      toast({ title: "Post created successfully!" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.username}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="icon">
                <label htmlFor="image-upload">
                  <ImageIcon className="h-5 w-5" />
                </label>
              </Button>
              <Input
                id="image-upload"
                type="file"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              {image && <span className="text-sm text-gray-500">{image.name}</span>}
            </div>
            <Button type="submit" disabled={!content.trim() || loading}>
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
