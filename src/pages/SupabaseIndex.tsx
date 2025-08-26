import React from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SupabaseIndex: React.FC = () => {
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to continue.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Welcome to your Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Hello {user.email}!</p>
          <p className="mb-6">You are now logged in with Supabase authentication.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button onClick={() => navigate('/topics')} variant="outline">
              Topics
            </Button>
            <Button onClick={() => navigate('/messages')} variant="outline">
              Messages
            </Button>
            <Button onClick={() => navigate('/friends')} variant="outline">
              Friends
            </Button>
            <Button onClick={() => navigate('/notifications')} variant="outline">
              Notifications
            </Button>
            <Button onClick={() => navigate('/admin')} variant="outline">
              Admin
            </Button>
            <Button onClick={() => navigate('/privacy')} variant="outline">
              Privacy
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Advanced features like messaging, profiles, and social interactions are being updated 
            to work with the new Supabase backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseIndex;