import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ConversationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">View and participate in conversations.</p>
          <p className="text-sm text-muted-foreground mb-4">
            This page is being updated to work with Supabase. Check back soon!
          </p>
          <Button onClick={() => navigate('/messages')}>Back to Messages</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationPage;