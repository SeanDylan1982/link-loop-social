import React, { useState } from 'react';
import PolicyModals from './PolicyModals';

const Footer: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-200 dark:bg-gray-800 text-center p-2 text-xs">
        <button onClick={() => setShowTerms(true)} className="underline mx-2">Terms and Conditions</button>
        <button onClick={() => setShowPrivacy(true)} className="underline mx-2">Privacy Policy</button>
      </footer>
      <PolicyModals 
        showPrivacy={showPrivacy} 
        setShowPrivacy={setShowPrivacy} 
        showTerms={showTerms} 
        setShowTerms={setShowTerms} 
      />
    </>
  );
};

export default Footer;
