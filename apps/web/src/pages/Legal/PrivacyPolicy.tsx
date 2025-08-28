import React from 'react';
import Layout from '../../components/layout/Layout';

const PrivacyPolicy: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">
            Last updated: {currentDate} | Version: 1.0
          </p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              FoodDrop ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our 
              gachapon-style food discovery application.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">2.1 Personal Information</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Email address (required for account creation)</li>
              <li>Display name (optional)</li>
              <li>Account preferences (theme, language, notifications)</li>
              <li>Subscription status and payment information (when applicable)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">2.2 Usage Data</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Food items you collect and view</li>
              <li>Time and date of collections and app usage</li>
              <li>Educational content interactions</li>
              <li>App performance and error data</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">2.3 Technical Data</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>IP address and location data (country/region only)</li>
              <li>Device information and browser type</li>
              <li>Session data and app analytics</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your personal information to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Personalize your food discovery experience</li>
              <li>Send you important account and service updates</li>
              <li>Process subscription payments and manage billing</li>
              <li>Improve our app through analytics and user feedback</li>
              <li>Comply with legal obligations and prevent fraud</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>End-to-end encryption for data in transit and at rest</li>
              <li>Firebase Authentication with industry-standard security</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and audit logging for all data operations</li>
              <li>Secure backup and disaster recovery procedures</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your GDPR Rights</h2>
            <p className="text-gray-700 mb-4">
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal data for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Account data: Until account deletion + 30 days for processing</li>
              <li>Collection data: Until account deletion + 30 days for processing</li>
              <li>Audit logs: 7 years for compliance and security purposes</li>
              <li>Analytics data: 2 years for service improvement</li>
              <li>Payment records: 7 years for tax and legal compliance</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use essential cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Authentication and session management</li>
              <li>Remembering your preferences and settings</li>
              <li>Analytics to improve our service (with your consent)</li>
              <li>Security and fraud prevention</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You can manage your cookie preferences in your browser settings or through our cookie consent banner.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              We use the following third-party services that may process your data:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Google Firebase:</strong> Authentication, database, and hosting services</li>
              <li><strong>Stripe:</strong> Payment processing (for premium subscriptions)</li>
              <li><strong>Email Service Provider:</strong> Account notifications and updates</li>
            </ul>
            <p className="text-gray-700 mb-4">
              These services have their own privacy policies and are bound by strict data processing agreements.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              FoodDrop is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If you are a parent or guardian and believe your child has 
              provided us with personal information, please contact us to request deletion.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your data may be processed and stored in servers located outside your country of residence. 
              We ensure appropriate safeguards are in place for international data transfers, including 
              Standard Contractual Clauses approved by the European Commission.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this privacy policy from time to time. We will notify you of any material changes 
              by posting the new privacy policy on this page and updating the "Last updated" date. For 
              significant changes, we will provide prominent notice or request renewed consent where required by law.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this privacy policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700"><strong>Email:</strong> privacy@fooddrop.com</p>
              <p className="text-gray-700"><strong>Data Protection Officer:</strong> dpo@fooddrop.com</p>
              <p className="text-gray-700"><strong>Response Time:</strong> We aim to respond within 30 days</p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Your Privacy Matters
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      We are committed to transparency and protecting your privacy. You can request a copy of your 
                      data, update your preferences, or delete your account at any time through your account settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;