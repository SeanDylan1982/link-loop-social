import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Groupify',
    siteDescription: 'Social networking platform'
  });
  const { token } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin');
      if (!res.ok) throw new Error('Failed to fetch site settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.warn('Could not fetch site settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) throw new Error('Failed to update site settings');
      const updatedSettings = await res.json();
      setSettings(updatedSettings);

      document.title = updatedSettings.siteName;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', updatedSettings.siteDescription);
      }
    } catch (error) {
      console.error('[useSiteSettings] Error updating settings:', error);
      throw error;
    }
  };

  return { settings, updateSettings };
};