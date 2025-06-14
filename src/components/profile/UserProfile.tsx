
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { usePosts } from '@/hooks/usePosts';
import { toast } from '@/hooks/use-toast';

export const UserProfile: React.FC = () => {
  const { user, profile, updateProfile, loading } = useSupabaseAuth();
  const { posts } = usePosts();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  if (loading || !profile) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ username, bio });
      setEditing(false);
      toast({ title: "Profile updated successfully!" });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update profile", 
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const userPosts = posts?.filter((post) => post.user_id === user?.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {profile?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile?.username}</h2>
              {/* Email is present on profile */}
              <p className="text-gray-600">{profile?.email}</p>
              <p className="text-sm text-gray-500">
                Joined {profile?.created_at ? new Date(profile?.created_at).toLocaleDateString() : ""}
              </p>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Bio</h3>
                <p className="text-gray-600">{profile?.bio || 'No bio added yet.'}</p>
              </div>
              <Button onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Posts ({userPosts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {userPosts && userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg">
                  <p className="mb-2">{post.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{post.likes?.length || 0} likes</span>
                    <span>{post.shares || 0} shares</span>
                    <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              You haven't posted anything yet. Share your first post!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
