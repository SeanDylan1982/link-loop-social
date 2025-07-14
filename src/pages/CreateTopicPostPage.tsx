import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTopicPosts } from '@/hooks/useTopicPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/layout/Navbar';

const CreateTopicPostPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const { createTopicPost } = useTopicPosts(topicId);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await createTopicPost(title, content, image);
    navigate(`/topics/${topicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Create a new Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
                <Input
                  id="image"
                  type="file"
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                />
              </div>
              <Button type="submit">Create Post</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTopicPostPage;
