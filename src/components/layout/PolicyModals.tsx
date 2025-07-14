import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PolicyModalsProps {
  showPrivacy: boolean;
  setShowPrivacy: (show: boolean) => void;
  showTerms: boolean;
  setShowTerms: (show: boolean) => void;
}

const PolicyModals: React.FC<PolicyModalsProps> = ({ showPrivacy, setShowPrivacy, showTerms, setShowTerms }) => {
  const handleAccept = (policy: 'privacy' | 'terms') => {
    localStorage.setItem(`${policy}Consent`, 'accepted');
    if (policy === 'privacy') setShowPrivacy(false);
    if (policy === 'terms') setShowTerms(false);
  };

  return (
    <>
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          {/* Add your privacy policy content here */}
          <p>This is a placeholder for the privacy policy.</p>
          <Button onClick={() => handleAccept('privacy')}>Accept</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          {/* Add your terms and conditions content here */}
          <p>This is a placeholder for the terms and conditions.</p>
          <Button onClick={() => handleAccept('terms')}>Accept</Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PolicyModals;
