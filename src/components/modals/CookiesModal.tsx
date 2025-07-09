import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CookiesModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const CookiesModal: React.FC<CookiesModalProps> = ({ open, onAccept, onDecline }) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>🍪 Cookie Notice & Data Collection</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Why We Collect Data</h3>
              <p>We collect and store your data for the following essential purposes:</p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Provide and maintain your account and platform access</li>
                <li>Enable login authentication and security</li>
                <li>Deliver notifications and service communications</li>
                <li>Improve platform performance and user experience</li>
                <li>Ensure platform security and prevent abuse</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What Data We Collect</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Account information (name, email, username)</li>
                <li>Profile data and content you create</li>
                <li>Usage analytics and performance data</li>
                <li>Device and browser information</li>
                <li>Cookies for functionality and preferences</li>
              </ul>
            </div>

            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
              <h3 className="font-semibold text-green-800 mb-2">Our Data Promise</h3>
              <p className="text-green-700">
                <strong>We DO NOT sell, rent, lease, or monetize your personal data in any way.</strong> 
                Your data is used solely to provide you with our service and improve your experience on Groupify.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Your Rights</h3>
              <p>Under South African POPIA law, you have the right to:</p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to certain processing</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Cookies</h3>
              <p>We use cookies to remember your preferences, keep you logged in, and analyze site usage to improve performance. You can manage cookie settings in your browser.</p>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button onClick={onAccept}>
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};