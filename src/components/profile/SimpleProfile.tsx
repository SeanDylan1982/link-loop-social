import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const SimpleProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.user_metadata?.avatar} />
              <AvatarFallback>{user?.email?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user?.user_metadata?.username || 'User'}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Profile management is being updated to work with Supabase. Check back soon!
          </p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
};