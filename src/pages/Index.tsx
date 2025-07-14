
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/feed/PostCard';
import { usePosts } from '@/hooks/usePosts';
import { AuthForm } from '@/components/auth/AuthForm';

const Index: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading, createPost, updatePost } = usePosts();

  if (!user) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <CreatePost onPostCreated={createPost} />
          <div className="space-y-4 mt-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={post.author}
                  onPostUpdate={updatePost}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-medium mb-2">No posts yet</p>
                <p className="text-gray-600 mb-4">
                  Start by creating your first post or connecting with friends.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
