  import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTopicPosts } from '@/hooks/useTopicPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { TopicPostCard } from '@/components/topics/TopicPostCard';

const SingleTopicPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { posts, loading, createTopicPost, updateTopicPost } = useTopicPosts(topicId);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Topic</h1>
          <Button asChild>
            <Link to={`/topics/${topicId}/new-post`}>Create Post</Link>
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading posts...</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <TopicPostCard key={post.id} post={post} onPostUpdate={updateTopicPost} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleTopicPage;
