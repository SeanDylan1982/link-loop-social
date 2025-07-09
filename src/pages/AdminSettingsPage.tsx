import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/layout/Navbar';
import { Settings, ArrowLeft, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminSettingsPage: React.FC = () => {
  const { isAdmin, loading } = useAdmin();
  const { settings, updateSettings } = useSiteSettings();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');

  // Update local state when settings change
  React.useEffect(() => {
    setSiteName(settings.siteName);
    setSiteDescription(settings.siteDescription);
  }, [settings]);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [maxPostLength, setMaxPostLength] = useState('1000');
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateSettings({ siteLogo: urlData.publicUrl });
      toast({ title: 'Logo uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({ title: 'Error uploading logo', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings({ 
        siteName, 
        siteDescription,
        siteLogo: settings.siteLogo 
      });
      toast({ title: 'Settings saved successfully!' });
      // Navigate back to admin dashboard
      setTimeout(() => navigate('/admin'), 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ 
        title: 'Error saving settings', 
        description: 'Please try again',
        variant: 'destructive' 
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="" onTabChange={() => {}} />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Site Settings</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Site name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Site Logo</label>
                <div className="flex items-center gap-2">
                  {settings.siteLogo && (
                    <img src={settings.siteLogo} alt="Current logo" className="h-10 w-10 object-contain" />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Site Description (SEO)</label>
                <Textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Site description for search engines"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Allow New Registrations</label>
                <Switch
                  checked={allowRegistration}
                  onCheckedChange={setAllowRegistration}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Require Email Verification</label>
                <Switch
                  checked={requireEmailVerification}
                  onCheckedChange={setRequireEmailVerification}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Post Length</label>
                <Input
                  value={maxPostLength}
                  onChange={(e) => setMaxPostLength(e.target.value)}
                  placeholder="Maximum characters per post"
                  type="number"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-moderate Posts</label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Require Post Approval</label>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Save Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleSaveSettings}>
                Save All Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;