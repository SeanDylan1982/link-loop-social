import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    try {
      const stored = localStorage.getItem('siteSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          siteName: parsed.siteName || 'Groupify',
          siteDescription: parsed.siteDescription || 'Social networking platform',
          siteLogo: parsed.siteLogo
        });
      }
    } catch (error) {
      console.warn('Could not fetch site settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    try {
      // Save to localStorage
      localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));

      // Update local state
      setSettings(updatedSettings);

      // Update document title and meta description
      document.title = updatedSettings.siteName;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', updatedSettings.siteDescription);
      }

      console.log('[useSiteSettings] Settings updated:', updatedSettings);
    } catch (error) {
      console.error('[useSiteSettings] Error updating settings:', error);
      throw error;
    }
  };

  return { settings, updateSettings };
};