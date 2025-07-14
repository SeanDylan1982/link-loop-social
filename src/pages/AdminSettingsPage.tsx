import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/Navbar';

const AdminSettingsPage: React.FC = () => {
  const { isAdmin } = useAdmin();
  const { settings, updateSettings } = useSiteSettings();
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName);
      setSiteDescription(settings.siteDescription);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({ siteName, siteDescription });
  };

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Site Name</label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">Site Description</label>
              <Input
                id="siteDescription"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleSave}>Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
