import React, { useState, useEffect } from 'react';
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
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarPreview(profile.avatar || null);
      setBannerPreview(profile.banner || null);
    }
  }, [profile]);

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
      await updateProfile({ username, bio }, avatarFile, bannerFile);
      setEditing(false);
      setAvatarFile(null);
      setBannerFile(null);
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
        <CardContent className="p-0">
          {/* Banner Image */}
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            {bannerPreview ? (
              <img 
                src={bannerPreview} 
                alt="Profile banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
            )}
          </div>
          
          <div className="p-6">
            <div className="flex items-center space-x-6 mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profile?.username}</h2>
                <p className="text-gray-600">{profile?.email}</p>
                <p className="text-sm text-gray-500">
                  Joined {profile?.created_at ? new Date(profile?.created_at).toLocaleDateString() : ""}
                </p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="banner">Banner Image</Label>
                  <Input
                    id="banner"
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setBannerFile(file);
                        setBannerPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="file:text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="file:text-foreground"
                  />
                </div>
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
                  <Button variant="outline" onClick={() => {
                    setEditing(false);
                    setAvatarFile(null);
                    setBannerFile(null);
                    if (profile) {
                      setAvatarPreview(profile.avatar || null);
                      setBannerPreview(profile.banner || null);
                      setUsername(profile.username || '');
                      setBio(profile.bio || '');
                    }
                  }}>
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
          </div>
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