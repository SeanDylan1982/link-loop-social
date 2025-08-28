import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const SimpleFeedPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Feed Coming Soon</h2>
          <p className="text-muted-foreground mb-4">
            The social feed is being updated to work with Supabase. Check back soon!
          </p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
};