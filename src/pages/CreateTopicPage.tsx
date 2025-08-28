import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CreateTopicPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Create and manage discussion topics.</p>
          <p className="text-sm text-muted-foreground mb-4">
            This page is being updated to work with Supabase. Check back soon!
          </p>
          <Button onClick={() => navigate('/topics')}>Back to Topics</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTopicPage;