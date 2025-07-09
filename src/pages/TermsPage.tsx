import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose max-w-none">
            <h1>📜 TERMS AND CONDITIONS OF SERVICE</h1>
            <p><strong>Effective Date:</strong> January 7, 2025</p>
            <p><strong>Platform Name:</strong> Groupify</p>
            <p><strong>Company:</strong> Groupify</p>
            <p><strong>Website:</strong> groupify.netlify.app</p>
            <p><strong>Country of Operation:</strong> Republic of South Africa</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using Groupify ("the Platform"), you agree to be bound by these Terms and Conditions of Service. If you do not agree, you must refrain from using the platform.</p>

            <h2>2. Nature of the Platform</h2>
            <p>Groupify is a software-as-a-service (SaaS) platform that enables users to create and manage their own independent social networks ("Networks"). Each Network is owned, operated, and moderated by its respective creator ("Network Owner").</p>

            <h2>3. User-Generated Content Disclaimer</h2>
            <p>All content posted or uploaded to the Platform, including but not limited to text, images, audio, video, comments, and links, is considered User-Generated Content (UGC). This includes content created within any individual Network.</p>

            <h3>3.1 Responsibility</h3>
            <p>All UGC is the sole responsibility of the person or entity that created it. Neither Groupify nor the Platform accept any responsibility or liability for UGC. You understand and agree that:</p>
            <ul>
              <li>The Network Owner is responsible for moderating and managing content within their Network</li>
              <li>The User who creates or uploads content is solely accountable for its legality, accuracy, and consequences</li>
              <li>The Platform is not obligated to monitor, moderate, or censor UGC, but reserves the right to remove any content that violates these Terms or applicable laws</li>
            </ul>

            <h2>4. Indemnity</h2>
            <p>By using the Platform, you agree to indemnify and hold harmless:</p>
            <ul>
              <li>Groupify, its directors, employees, and affiliates</li>
              <li>The Network Owner, if applicable</li>
            </ul>
            <p>from any claims, damages, liabilities, losses, or expenses arising out of:</p>
            <ul>
              <li>Content you post or upload</li>
              <li>Your conduct or interactions on the Platform</li>
              <li>Your violation of any third-party rights or applicable laws</li>
            </ul>

            <h2>5. Content Guidelines</h2>
            <p>You may not post or upload content that:</p>
            <ul>
              <li>Violates any South African law (e.g., hate speech, harassment, incitement, defamation)</li>
              <li>Contains explicit, pornographic, or exploitative material</li>
              <li>Violates copyright or other intellectual property rights</li>
              <li>Misleads, impersonates, or defrauds others</li>
              <li>Contains malware, phishing links, or harmful software</li>
            </ul>
            <p>Violation may result in suspension or deletion of your account or content, at our sole discretion.</p>

            <h2>6. Platform Account</h2>
            <p>You must provide accurate and complete information to register. You are responsible for maintaining the confidentiality of your account credentials. You may not:</p>
            <ul>
              <li>Create an account on behalf of someone else without authorization</li>
              <li>Use the service for unlawful or abusive purposes</li>
            </ul>

            <h2>7. Payment and Subscriptions</h2>
            <p>Some features of the Platform may require payment or a subscription. All fees are clearly stated, non-refundable unless required by law, and must be paid in ZAR.</p>

            <h2>8. Intellectual Property</h2>
            <p>We retain ownership of all platform code, design, and intellectual property. However:</p>
            <ul>
              <li>You retain ownership of the content you create</li>
              <li>You grant us a non-exclusive, royalty-free license to store and display your content as part of delivering the service</li>
              <li>We do not claim ownership of your UGC.</li>
            </ul>

            <h2>9. POPIA Compliance & Privacy</h2>
            <p>Our handling of personal information is governed by South Africa's Protection of Personal Information Act (POPIA). We process personal data:</p>
            <ul>
              <li>Lawfully and transparently</li>
              <li>For specific, defined purposes (e.g., providing the service)</li>
              <li>With adequate security and access control</li>
            </ul>
            <p>Please refer to our full Privacy Policy for details.</p>

            <h2>10. Termination</h2>
            <p>We may suspend or terminate your access if you breach these Terms, violate laws, or engage in harmful conduct. You may terminate your account at any time by contacting support.</p>

            <h2>11. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law:</p>
            <ul>
              <li>We are not liable for any damages arising from your use of the Platform, including UGC, downtime, data loss, or third-party content</li>
              <li>We provide the Platform "as-is" with no warranties of availability, accuracy, or performance</li>
            </ul>

            <h2>12. Changes to These Terms</h2>
            <p>We reserve the right to update these Terms from time to time. Significant changes will be announced on the site. Continued use of the Platform means you accept the revised Terms.</p>

            <h2>13. Governing Law</h2>
            <p>These Terms are governed by the laws of the Republic of South Africa. Disputes will be handled in South African courts with jurisdiction over Johannesburg.</p>

            <h2>14. Contact</h2>
            <p>Questions or legal concerns? Contact us:</p>
            <ul>
              <li>📧 Email: seandylanpatterson@gmail.com</li>
              <li>📞 Phone: +27649884235</li>
              <li>🏢 Address: 16 warwick street, Airfield, Benoni, Gauteng, 1501, South Africa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;