import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const SimpleMessages: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Send and receive messages with your friends.</p>
          <p className="text-sm text-muted-foreground mb-4">
            This page is being updated to work with Supabase. Check back soon!
          </p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
};