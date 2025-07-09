import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showButtons?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({ open, onOpenChange, showButtons = true }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>📜 Terms and Conditions of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <div>
              <p><strong>Effective Date:</strong> January 7, 2025</p>
              <p><strong>Platform Name:</strong> Groupify</p>
              <p><strong>Company:</strong> Groupify</p>
              <p><strong>Website:</strong> groupify.netlify.app</p>
              <p><strong>Country of Operation:</strong> Republic of South Africa</p>
            </div>

            <div>
              <h3 className="font-semibold">1. Acceptance of Terms</h3>
              <p>By accessing or using Groupify ("the Platform"), you agree to be bound by these Terms and Conditions of Service. If you do not agree, you must refrain from using the platform.</p>
            </div>

            <div>
              <h3 className="font-semibold">2. Nature of the Platform</h3>
              <p>Groupify is a software-as-a-service (SaaS) platform that enables users to create and manage their own independent social networks ("Networks"). Each Network is owned, operated, and moderated by its respective creator ("Network Owner").</p>
            </div>

            <div>
              <h3 className="font-semibold">3. User-Generated Content Disclaimer</h3>
              <p>All content posted or uploaded to the Platform is considered User-Generated Content (UGC). All UGC is the sole responsibility of the person or entity that created it. Neither Groupify nor the Platform accept any responsibility or liability for UGC.</p>
            </div>

            <div>
              <h3 className="font-semibold">4. Content Guidelines</h3>
              <p>You may not post or upload content that:</p>
              <ul className="list-disc ml-4">
                <li>Violates any South African law (e.g., hate speech, harassment, incitement, defamation)</li>
                <li>Contains explicit, pornographic, or exploitative material</li>
                <li>Violates copyright or other intellectual property rights</li>
                <li>Misleads, impersonates, or defrauds others</li>
                <li>Contains malware, phishing links, or harmful software</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">5. Platform Account</h3>
              <p>You must provide accurate and complete information to register. You are responsible for maintaining the confidentiality of your account credentials.</p>
            </div>

            <div>
              <h3 className="font-semibold">6. Payment and Subscriptions</h3>
              <p>Some features of the Platform may require payment or a subscription. All fees are clearly stated, non-refundable unless required by law, and must be paid in ZAR.</p>
            </div>

            <div>
              <h3 className="font-semibold">7. Intellectual Property</h3>
              <p>We retain ownership of all platform code, design, and intellectual property. However, you retain ownership of the content you create and grant us a non-exclusive, royalty-free license to store and display your content.</p>
            </div>

            <div>
              <h3 className="font-semibold">8. POPIA Compliance & Privacy</h3>
              <p>Our handling of personal information is governed by South Africa's Protection of Personal Information Act (POPIA). We process personal data lawfully and transparently.</p>
            </div>

            <div>
              <h3 className="font-semibold">9. Termination</h3>
              <p>We may suspend or terminate your access if you breach these Terms, violate laws, or engage in harmful conduct. You may terminate your account at any time by contacting support.</p>
            </div>

            <div>
              <h3 className="font-semibold">10. Limitation of Liability</h3>
              <p>To the maximum extent permitted by law, we are not liable for any damages arising from your use of the Platform and provide the Platform "as-is" with no warranties.</p>
            </div>

            <div>
              <h3 className="font-semibold">11. Governing Law</h3>
              <p>These Terms are governed by the laws of the Republic of South Africa. Disputes will be handled in South African courts with jurisdiction over Johannesburg.</p>
            </div>

            <div>
              <h3 className="font-semibold">12. Contact</h3>
              <p>Questions or legal concerns? Contact us:</p>
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