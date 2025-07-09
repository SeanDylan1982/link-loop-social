import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showButtons?: boolean;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ open, onOpenChange, showButtons = true }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>🔐 Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <div>
              <p><strong>Effective Date:</strong> January 7, 2025</p>
              <p><strong>Platform Name:</strong> Groupify</p>
              <p><strong>Company:</strong> Groupify</p>
              <p><strong>Website:</strong> groupify.netlify.app</p>
            </div>

            <div>
              <h3 className="font-semibold">1. Introduction</h3>
              <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use the Groupify platform. We are committed to protecting your personal data in compliance with the Protection of Personal Information Act, 4 of 2013 (POPIA).</p>
            </div>

            <div>
              <h3 className="font-semibold">2. Who This Policy Covers</h3>
              <p>This policy applies to Platform Users, Network Owners, and Network Members who use Groupify.</p>
            </div>

            <div>
              <h3 className="font-semibold">3. What Personal Information We Collect</h3>
              <p><strong>Platform-level data:</strong> Full name, email address, login credentials, IP address, device/browser details, billing/payment details, support tickets.</p>
              <p><strong>Network-level data:</strong> Profile data, posts, media, comments, reactions, group membership activity.</p>
            </div>

            <div>
              <h3 className="font-semibold">4. How We Collect It</h3>
              <p>We collect data directly from you, automatically via cookies and analytics tools, from Network Owners when you join a Network, and from third-party integrations with consent.</p>
            </div>

            <div>
              <h3 className="font-semibold">5. How We Use Your Information</h3>
              <p>We use your data to provide and maintain your account, facilitate login and access, deliver notifications, enable payments, improve platform performance, and comply with legal requirements.</p>
            </div>

            <div>
              <h3 className="font-semibold">6. Sharing and Disclosure</h3>
              <p>We do not sell or rent personal data. We may share your data with operators (cloud storage, analytics, payment processors), Network Owners for data relevant to their Network, and law enforcement when legally obligated.</p>
            </div>

            <div>
              <h3 className="font-semibold">7. Data Security</h3>
              <p>We implement appropriate technical and organisational security measures including encrypted connections (HTTPS), access control and authentication, data backups and logging, and secure infrastructure.</p>
            </div>

            <div>
              <h3 className="font-semibold">8. Data Retention</h3>
              <p>We retain personal information for as long as your account is active, for as long as needed to comply with legal obligations, and as determined by each Network Owner for content within their Network.</p>
            </div>

            <div>
              <h3 className="font-semibold">9. Your Rights Under POPIA</h3>
              <p>As a data subject, you have the right to access your personal information, correct inaccurate data, object to processing, request deletion of your data, and lodge a complaint with the Information Regulator.</p>
              <p><strong>Information Regulator South Africa:</strong> inforeg@justice.gov.za</p>
            </div>

            <div>
              <h3 className="font-semibold">10. Cookies & Analytics</h3>
              <p>We use cookies and third-party analytics to understand usage patterns, enhance performance, and store your preferences. You can manage cookie preferences through your browser settings.</p>
            </div>

            <div>
              <h3 className="font-semibold">11. Platform vs. Network Responsibility</h3>
              <p>Groupify is responsible for platform-level user data. Each Network Owner is independently responsible for data within their Network.</p>
            </div>

            <div>
              <h3 className="font-semibold">12. Contact Us</h3>
              <p>If you have questions, concerns, or data access requests, contact us:</p>
              <ul className="list-none">
                <li>📧 Email: seandylanpatterson@gmail.com</li>
                <li>📞 Phone: +27649884235</li>
                <li>🏢 Address: 16 warwick street, Airfield, Benoni, Gauteng, 1501, South Africa</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
        {showButtons && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Decline
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Accept
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};