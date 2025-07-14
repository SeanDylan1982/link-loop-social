import React from 'react';
import { useParams } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { profile, posts, loading, error } = useUserProfile(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;
  if (!profile) return <div>User not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              {profile.banner ? (
                <img src={profile.banner} alt="Profile banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
              )}
              <div className="absolute bottom-0 left-0 transform translate-y-1/2 pl-6">
                <Avatar className="w-32 h-32 border-4 border-white">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback>{profile.username.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-20">
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            <p className="text-gray-600">{profile.bio}</p>
            <div className="flex space-x-4 mt-4">
              {profile.social_links?.map((link: any) => (
                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.platform}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" className="mt-6">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          <TabsContent value="about">
            {/* Add detailed about section here */}
          </TabsContent>
          <TabsContent value="posts">
            {posts.map((post) => (
              <Card key={post.id} className="mb-4">
                <CardContent className="p-4">
                  <p>{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="likes">
            {/* Add liked posts here */}
          </TabsContent>
          <TabsContent value="comments">
            {/* Add user's comments here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
