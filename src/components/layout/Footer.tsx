import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TermsModal } from '@/components/modals/TermsModal';
import { PrivacyModal } from '@/components/modals/PrivacyModal';

export const Footer: React.FC = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  return (
    <>
      <footer className="bg-white dark:bg-background shadow-lg border-t h-[50px] fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-full text-sm">
            <div></div>
            
            <div className="flex items-center space-x-8">
              <Button variant="ghost" onClick={() => setShowPrivacy(true)}>
                Privacy Policy
              </Button>
              <Button variant="ghost" onClick={() => setShowTerms(true)}>
                Terms of Service
              </Button>
            </div>
            
            <div></div>
          </div>
        </div>
      </footer>
      
      <TermsModal 
        open={showTerms} 
        onOpenChange={(open) => {
          if (!open) setTermsAccepted(true);
          setShowTerms(open);
        }} 
        showButtons={!termsAccepted}
      />
      <PrivacyModal 
        open={showPrivacy} 
        onOpenChange={(open) => {
          if (!open) setPrivacyAccepted(true);
          setShowPrivacy(open);
        }}
        showButtons={!privacyAccepted}
      />
    </>
  );
};