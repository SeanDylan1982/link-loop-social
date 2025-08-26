import React from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SupabaseIndex: React.FC = () => {
  const { user, loading } = useSupabaseAuth();

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
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Hello {user.email}!</p>
          <p>You are now logged in with Supabase authentication.</p>
          
          {/* Temporarily disable complex features */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Advanced features like messaging, profiles, and social interactions are being updated 
              to work with the new Supabase backend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseIndex;