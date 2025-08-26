import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Connect with friends and manage your social network.</p>
          <p className="text-sm text-muted-foreground mb-4">
            This page is being updated to work with Supabase. Check back soon!
          </p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendsPage;
