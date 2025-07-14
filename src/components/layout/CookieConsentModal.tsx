import React from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Button } from '@/components/ui/button';

const CookieConsentModal: React.FC = () => {
  const { showCookieModal, acceptCookies, declineCookies } = useCookieConsent();

  if (!showCookieModal) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center">
      <p>This website uses cookies to ensure you get the best experience on our website.</p>
      <div>
        <Button onClick={acceptCookies} className="mr-2">Accept</Button>
        <Button onClick={declineCookies} variant="secondary">Decline</Button>
      </div>
    </div>
  );
};

export default CookieConsentModal;
