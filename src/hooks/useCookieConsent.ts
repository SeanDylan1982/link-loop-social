import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const useCookieConsent = () => {
  const { user } = useSupabaseAuth();
  const [showCookieModal, setShowCookieModal] = useState(false);

  const showConsentModal = () => {
    const localConsent = localStorage.getItem('cookieConsent');
    if (localConsent !== 'accepted') {
      setShowCookieModal(true);
    }
  };

  const acceptCookies = async () => {
    localStorage.setItem('cookieConsent', 'accepted');
    // Note: With Supabase, we'd need to implement profile updates differently
    // For now, just store locally
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
    declineCookies,
    showConsentModal,
  };
};