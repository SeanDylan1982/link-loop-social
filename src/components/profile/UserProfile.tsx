import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { toast } from '@/hooks/use-toast';
import { Link, Globe, Github, Twitter, Instagram, Linkedin, Facebook, Youtube, Plus, X } from 'lucide-react';
import { request } from '@/api/api';

export const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { posts } = usePosts();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // About form fields
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [school, setSchool] = useState('');
  const [university, setUniversity] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [honors, setHonors] = useState<string[]>([]);
  const [awards, setAwards] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string; icon: string }[]>([]);
  
  // Temp input for adding arrays
  const [hobbyInput, setHobbyInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [likeInput, setLikeInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [honorInput, setHonorInput] = useState('');
  const [awardInput, setAwardInput] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialUrl, setSocialUrl] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setUsername(user.profile.username || '');
      setBio(user.profile.bio || '');
      setAvatarPreview(user.profile.avatar || null);
      setBannerPreview(user.profile.banner || null);
      setFullName(user.profile.full_name || '');
      setNickname(user.profile.nickname || '');
      setAddress(user.profile.address || '');
      setSchool(user.profile.school || '');
      setUniversity(user.profile.university || '');
      setWorkplace(user.profile.workplace || '');
      setHobbies(user.profile.hobbies || []);
      setInterests(user.profile.interests || []);
      setLikes(user.profile.likes || []);
      setDislikes(user.profile.dislikes || []);
      setAchievements(user.profile.achievements || []);
      setHonors(user.profile.honors || []);
      setAwards(user.profile.awards || []);
      setSocialLinks(user.profile.social_links || []);
    }
  }, [user]);

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      try {
        const data = await request(`/comments/post/${user?.id}`);
        setComments(data);
      } catch (e) {
        setComments([]);
      }
      setLoading(false);
    }
    if (user?.id) fetchComments();
  }, [user?.id]);

  if (!user) {
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
      await updateUser({ 
        username, 
        bio,
        full_name: fullName,
        nickname,
        address,
        school,
        university,
        workplace,
        hobbies,
        interests,
        likes,
        dislikes,
        achievements,
        honors,
        awards,
        social_links: socialLinks
      }, avatarFile, bannerFile);
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

  const addArrayItem = (type: string, value: string, setValue: (items: string[]) => void, currentItems: string[]) => {
    if (value.trim() && !currentItems.includes(value.trim())) {
      setValue([...currentItems, value.trim()]);
    }
  };

  const removeArrayItem = (type: string, index: number, setValue: (items: string[]) => void, currentItems: string[]) => {
    setValue(currentItems.filter((_, i) => i !== index));
  };

  const addSocialLink = () => {
    if (socialPlatform && socialUrl && socialLinks.length < 5) {
      const iconMap: { [key: string]: string } = {
        'facebook': 'Facebook',
        'twitter': 'Twitter',
        'instagram': 'Instagram',
        'linkedin': 'Linkedin',
        'github': 'Github',
        'youtube': 'Youtube',
        'website': 'Globe'
      };
      
      setSocialLinks([...socialLinks, {
        platform: socialPlatform,
        url: socialUrl,
        icon: iconMap[socialPlatform.toLowerCase()] || 'Link'
      }]);
      setSocialPlatform('');
      setSocialUrl('');
    }
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const getSocialIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Facebook, Twitter, Instagram, Linkedin, Github, Youtube, Globe, Link
    };
    const IconComponent = icons[iconName] || Link;
    return <IconComponent className="w-4 h-4" />;
  };

  const userPosts = posts?.filter((post) => post.user_id === user?.id);
  const userLikes = posts?.filter((post) => post.likes?.includes(user?.id || ''));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-0">
          {/* Banner Image with overlay profile info */}
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
            
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Profile info overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end space-x-4 text-white">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-2xl text-gray-900">
                  {user?.profile?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">{user?.profile?.username}</h2>
                <p className="text-white/90 drop-shadow">{user?.profile?.email}</p>
                <p className="text-sm text-white/80 drop-shadow">
                  Joined {user?.profile?.created_at ? new Date(user?.profile?.created_at).toLocaleDateString() : ""}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
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
                    if (user?.profile) {
                      setAvatarPreview(user.profile.avatar || null);
                      setBannerPreview(user.profile.banner || null);
                      setUsername(user.profile.username || '');
                      setBio(user.profile.bio || '');
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
                  <p className="text-gray-600">{user?.profile?.bio || 'No bio added yet.'}</p>
                </div>
                
                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Social Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                        >
                          {getSocialIcon(link.icon)}
                          {link.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">Posts ({userPosts?.length || 0})</TabsTrigger>
              <TabsTrigger value="likes">Likes ({userLikes?.length || 0})</TabsTrigger>
              <TabsTrigger value="comments">Comments ({userComments?.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="mt-6">
              {editing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Your nickname"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="school">School</Label>
                      <Input
                        id="school"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="Your school"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="Your university"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workplace">Workplace</Label>
                    <Input
                      id="workplace"
                      value={workplace}
                      onChange={(e) => setWorkplace(e.target.value)}
                      placeholder="Your workplace"
                    />
                  </div>
                  
                  {/* Array fields with add/remove functionality */}
                  {[
                    { label: 'Hobbies', items: hobbies, setItems: setHobbies, input: hobbyInput, setInput: setHobbyInput },
                    { label: 'Interests', items: interests, setItems: setInterests, input: interestInput, setInput: setInterestInput },
                    { label: 'Likes', items: likes, setItems: setLikes, input: likeInput, setInput: setLikeInput },
                    { label: 'Dislikes', items: dislikes, setItems: setDislikes, input: dislikeInput, setInput: setDislikeInput },
                    { label: 'Achievements', items: achievements, setItems: setAchievements, input: achievementInput, setInput: setAchievementInput },
                    { label: 'Honors', items: honors, setItems: setHonors, input: honorInput, setInput: setHonorInput },
                    { label: 'Awards', items: awards, setItems: setAwards, input: awardInput, setInput: setAwardInput }
                  ].map(({ label, items, setItems, input, setInput }) => (
                    <div key={label} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={`Add ${label.toLowerCase().slice(0, -1)}`}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addArrayItem(label, input, setItems, items);
                              setInput('');
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          onClick={() => {
                            addArrayItem(label, input, setItems, items);
                            setInput('');
                          }}
                          size="sm"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {items.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {items.map((item, index) => (
                            <span key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                              {item}
                              <button 
                                type="button"
                                onClick={() => removeArrayItem(label, index, setItems, items)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Social Links */}
                  <div className="space-y-2">
                    <Label>Social Links (Max 5)</Label>
                    <div className="flex gap-2">
                      <select 
                        value={socialPlatform}
                        onChange={(e) => setSocialPlatform(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="">Select platform</option>
                        <option value="website">Website</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="github">GitHub</option>
                        <option value="youtube">YouTube</option>
                      </select>
                      <Input
                        value={socialUrl}
                        onChange={(e) => setSocialUrl(e.target.value)}
                        placeholder="Enter URL"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={addSocialLink}
                        size="sm"
                        disabled={socialLinks.length >= 5}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {socialLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {socialLinks.map((link, index) => (
                          <span key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded text-sm">
                            {getSocialIcon(link.icon)}
                            {link.platform}
                            <button 
                              type="button"
                              onClick={() => removeSocialLink(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: user?.profile?.full_name },
                    { label: 'Nickname', value: user?.profile?.nickname },
                    { label: 'Address', value: user?.profile?.address },
                    { label: 'School', value: user?.profile?.school },
                    { label: 'University', value: user?.profile?.university },
                    { label: 'Workplace', value: user?.profile?.workplace }
                  ].map(({ label, value }) => (
                    value && (
                      <div key={label}>
                        <h4 className="font-medium text-gray-700">{label}</h4>
                        <p className="text-gray-600">{value}</p>
                      </div>
                    )
                  ))}
                  
                  {[
                    { label: 'Hobbies', items: user?.profile?.hobbies },
                    { label: 'Interests', items: user?.profile?.interests },
                    { label: 'Likes', items: user?.profile?.likes },
                    { label: 'Dislikes', items: user?.profile?.dislikes },
                    { label: 'Achievements', items: user?.profile?.achievements },
                    { label: 'Honors', items: user?.profile?.honors },
                    { label: 'Awards', items: user?.profile?.awards }
                  ].map(({ label, items }) => (
                    items && items.length > 0 && (
                      <div key={label}>
                        <h4 className="font-medium text-gray-700">{label}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {items.map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="posts" className="mt-6">
              {userPosts && userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <p className="mb-2">{post.content}</p>
                      {post.image && (
                        <img src={post.image} alt="Post content" className="w-full rounded-lg mb-4 max-h-96 object-cover"/>
                      )}
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
            </TabsContent>
            
            <TabsContent value="likes" className="mt-6">
              {userLikes && userLikes.length > 0 ? (
                <div className="space-y-4">
                  {userLikes.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        {post.image && (
                          <img src={post.image} alt="Post thumbnail" className="w-16 h-16 rounded object-cover flex-shrink-0"/>
                        )}
                        <div className="flex-1">
                          <p className="mb-2 line-clamp-2">{post.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{post.likes?.length || 0} likes</span>
                            <span>{post.shares || 0} shares</span>
                            <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  You haven't liked any posts yet.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="comments" className="mt-6">
              {userComments && userComments.length > 0 ? (
                <div className="space-y-4">
                  {userComments.map((comment) => (
                    <div key={comment.id} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <p className="mb-2">{comment.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{comment.likes?.length || 0} likes</span>
                        <span>{comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ""}</span>
                        <span>on post</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  You haven't commented on any posts yet.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};