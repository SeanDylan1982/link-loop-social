import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useCookieConsent = () => {
  const { user, token } = useAuth();
  const [showCookieModal, setShowCookieModal] = useState(false);

  const showConsentModal = () => {
    const localConsent = localStorage.getItem('cookieConsent');
    if (localConsent !== 'accepted') {
      setShowCookieModal(true);
    }
  };

  const acceptCookies = async () => {
    localStorage.setItem('cookieConsent', 'accepted');
    if (user && token) {
      try {
        await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ cookie_consent: true }),
        });
      } catch (error) {
        console.error('Failed to save cookie consent to profile:', error);
      }
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
    declineCookies,
    showConsentModal,
  };
};