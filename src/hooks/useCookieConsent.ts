import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

export const useCookieConsent = () => {
  const { user } = useSupabaseAuth();
  const [showCookieModal, setShowCookieModal] = useState(false);

  useEffect(() => {
    const checkCookieConsent = async () => {
      // Check localStorage first
      const localConsent = localStorage.getItem('cookieConsent');
      
      if (localConsent === 'accepted') {
        return; // User already accepted
      }

      // If user is logged in, check their profile
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('cookie_consent')
          .eq('id', user.id)
          .single();

        if (data?.cookie_consent) {
          localStorage.setItem('cookieConsent', 'accepted');
          return;
        }
      }

      // Show modal if no consent found
      setShowCookieModal(true);
    };

    checkCookieConsent();
  }, [user]);

  const acceptCookies = async () => {
    // Save to localStorage
    localStorage.setItem('cookieConsent', 'accepted');
    
    // Save to user profile if logged in
    if (user) {
      await supabase
        .from('profiles')
        .update({ cookie_consent: true })
        .eq('id', user.id);
    }
    
    setShowCookieModal(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowCookieModal(false);
    // Could redirect to external site or show limited functionality
  };

  return {
    showCookieModal,
    acceptCookies,
    declineCookies
  };
};