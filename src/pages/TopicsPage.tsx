import React from 'react';
import { Link } from 'react-router-dom';
import { useTopics } from '@/hooks/useTopics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TopicsPage: React.FC = () => {
  const { topics, loading } = useTopics();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Topics</h1>
          <Button asChild>
            <Link to="/topics/new">Create Topic</Link>
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading topics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card key={topic.id}>
                <CardHeader>
                  <CardTitle>{topic.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{topic.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">{topic.posts.length} posts</span>
                    <Button asChild variant="secondary">
                      <Link to={`/topics/${topic.id}`}>View Topic</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicsPage;
