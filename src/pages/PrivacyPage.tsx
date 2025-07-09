import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage: React.FC = () => {
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
            <h1>🔐 PRIVACY POLICY</h1>
            <p><strong>Effective Date:</strong> January 7, 2025</p>
            <p><strong>Platform Name:</strong> Groupify</p>
            <p><strong>Company:</strong> Groupify</p>
            <p><strong>Website:</strong> groupify.netlify.app</p>
            <p><strong>Jurisdiction:</strong> Republic of South Africa</p>

            <h2>1. Introduction</h2>
            <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use the Groupify platform (the "Platform") or any individual social network (each a "Network") created and managed by other users ("Network Owners").</p>
            <p>We are committed to protecting your personal data in compliance with the Protection of Personal Information Act, 4 of 2013 (POPIA).</p>
            <p>By using our Platform, you consent to the data practices described in this policy.</p>

            <h2>2. Who This Policy Covers</h2>
            <p>This policy applies to:</p>
            <ul>
              <li><strong>Platform Users:</strong> Anyone accessing or registering an account on Groupify</li>
              <li><strong>Network Owners:</strong> Users who create and manage independent social networks</li>
              <li><strong>Network Members:</strong> Users who join, post to, or participate in any Network</li>
            </ul>

            <h2>3. Definitions (as per POPIA)</h2>
            <ul>
              <li><strong>Data Subject:</strong> You, the individual whose personal information is being processed</li>
              <li><strong>Responsible Party:</strong>
                <ul>
                  <li>Groupify for platform-level data</li>
                  <li>Individual Network Owners for data inside their specific networks</li>
                </ul>
              </li>
              <li><strong>Operator:</strong> Any third-party service provider processing data on our or a Network Owner's behalf</li>
            </ul>

            <h2>4. What Personal Information We Collect</h2>
            <p>Depending on how you use the Platform, we may collect:</p>
            
            <h3>Platform-level data (collected by us):</h3>
            <ul>
              <li>Full name</li>
              <li>Email address and contact info</li>
              <li>Login credentials</li>
              <li>IP address and device/browser details</li>
              <li>Billing/payment details (if applicable)</li>
              <li>Support tickets or inquiries</li>
            </ul>

            <h3>Network-level data (collected by Network Owners):</h3>
            <ul>
              <li>Profile data specific to that network</li>
              <li>Posts, media, comments, reactions</li>
              <li>Group membership and participation activity</li>
              <li>Survey or form submissions inside that network</li>
            </ul>

            <h2>5. How We Collect It</h2>
            <ul>
              <li>Directly from you (e.g., when you register, post, or contact support)</li>
              <li>Automatically via cookies and analytics tools</li>
              <li>From Network Owners when you join a Network</li>
              <li>From third-party integrations (if applicable and with consent)</li>
            </ul>

            <h2>6. How We Use Your Information</h2>
            <p>We may use your data to:</p>
            <ul>
              <li>Provide and maintain your account</li>
              <li>Facilitate login and access across multiple Networks</li>
              <li>Deliver notifications, emails, and service-related communication</li>
              <li>Enable payments and manage subscriptions (if applicable)</li>
              <li>Improve platform stability, performance, and security</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>

            <p>Network Owners may use your data within their Network for:</p>
            <ul>
              <li>Community moderation</li>
              <li>Sending announcements</li>
              <li>Collecting feedback or data through forms or polls</li>
              <li>Managing network membership</li>
            </ul>

            <h2>7. Sharing and Disclosure</h2>
            <p>We do not sell or rent personal data.</p>
            <p>We may share your data with:</p>
            <ul>
              <li><strong>Operators:</strong> such as cloud storage, analytics, payment processors (under contract)</li>
              <li><strong>Network Owners:</strong> for data relevant to their Network</li>
              <li><strong>Law enforcement or regulators:</strong> when legally obligated</li>
            </ul>
            <p>Each Network Owner is independently responsible for how they handle the data within their Network.</p>

            <h2>8. Cross-Border Data Transfers</h2>
            <p>If your data is transferred or stored outside South Africa (e.g., via cloud services), we will ensure that adequate protection measures are in place, as required by POPIA.</p>

            <h2>9. Data Security</h2>
            <p>We implement appropriate technical and organisational security measures to protect your data, including:</p>
            <ul>
              <li>Encrypted connections (HTTPS)</li>
              <li>Access control and authentication</li>
              <li>Data backups and logging</li>
              <li>Secure infrastructure provided by cloud providers</li>
            </ul>
            <p>However, no system is 100% secure. You use the Platform at your own risk.</p>

            <h2>10. Data Retention</h2>
            <p>We retain personal information:</p>
            <ul>
              <li>For as long as your account is active</li>
              <li>For as long as needed to comply with legal obligations</li>
              <li>As determined by each Network Owner for content within their Network</li>
            </ul>
            <p>You may request deletion of your account or content at any time (see Section 11).</p>

            <h2>11. Your Rights Under POPIA</h2>
            <p>As a data subject, you have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate or outdated data</li>
              <li>Object to processing under certain circumstances</li>
              <li>Request deletion of your data, subject to legal or contractual exceptions</li>
              <li>Lodge a complaint with the Information Regulator</li>
            </ul>

            <p><strong>Information Regulator South Africa:</strong></p>
            <ul>
              <li>📧 Email: inforeg@justice.gov.za</li>
              <li>🌐 Website: https://www.justice.gov.za/inforeg/</li>
            </ul>

            <h2>12. Cookies & Analytics</h2>
            <p>We use cookies and third-party analytics (e.g., Google Analytics) to:</p>
            <ul>
              <li>Understand usage patterns</li>
              <li>Enhance performance</li>
              <li>Store your preferences</li>
            </ul>
            <p>You can manage cookie preferences through your browser settings.</p>

            <h2>13. Platform vs. Network Responsibility</h2>
            <p>The Platform (Groupify) is responsible for safeguarding platform-level user data (login, authentication, support, etc.).</p>
            <p>Each Network Owner is independently responsible for how they handle, use, store, and disclose data within their Network.</p>
            <p>We advise Network Owners to publish their own privacy guidelines or community rules.</p>

            <h2>14. Changes to This Policy</h2>
            <p>We may revise this policy from time to time. Significant changes will be notified through the Platform. Continued use after updates implies acceptance of the revised terms.</p>

            <h2>15. Contact Us</h2>
            <p>If you have questions, concerns, or data access requests, contact us at:</p>
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

export default PrivacyPage;