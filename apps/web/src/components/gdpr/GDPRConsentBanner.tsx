import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface GDPRConsentData {
  given: boolean;
  timestamp: Date;
  version: string;
  preferences: CookiePreferences;
}

interface GDPRConsentBannerProps {
  onConsentGiven: (consentData: GDPRConsentData) => void;
  onConsentDeclined: () => void;
  showBanner: boolean;
}

const GDPRConsentBanner: React.FC<GDPRConsentBannerProps> = ({
  onConsentGiven,
  onConsentDeclined,
  showBanner
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false
  });

  const privacyPolicyVersion = '1.0';

  useEffect(() => {
    // Check if user is in EU to determine if GDPR applies
    // This is a simplified check - in production, you'd want more sophisticated geolocation
    const isEUUser = Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Europe');
    
    if (!isEUUser && showBanner) {
      // Auto-consent for non-EU users with analytics enabled
      handleAcceptAll();
    }
  }, [showBanner]);

  const handleAcceptAll = () => {
    const consentData: GDPRConsentData = {
      given: true,
      timestamp: new Date(),
      version: privacyPolicyVersion,
      preferences: {
        necessary: true,
        analytics: true,
        marketing: true
      }
    };
    
    onConsentGiven(consentData);
    storeCookieConsent(consentData);
  };

  const handleAcceptSelected = () => {
    const consentData: GDPRConsentData = {
      given: true,
      timestamp: new Date(),
      version: privacyPolicyVersion,
      preferences
    };
    
    onConsentGiven(consentData);
    storeCookieConsent(consentData);
  };

  const handleDecline = () => {
    const consentData: GDPRConsentData = {
      given: false,
      timestamp: new Date(),
      version: privacyPolicyVersion,
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false
      }
    };
    
    onConsentDeclined();
    storeCookieConsent(consentData);
  };

  const storeCookieConsent = (consentData: GDPRConsentData) => {
    try {
      localStorage.setItem('gdpr_consent', JSON.stringify(consentData));
      localStorage.setItem('gdpr_consent_timestamp', consentData.timestamp.toISOString());
      localStorage.setItem('gdpr_consent_version', consentData.version);
    } catch (error) {
      console.error('Failed to store GDPR consent:', error);
    }
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">🍪 Your Privacy Choices</h3>
                <p className="text-gray-300 text-sm mb-4 lg:mb-0 lg:mr-8">
                  We use cookies and similar technologies to enhance your food discovery experience, 
                  remember your preferences, and analyze how you use FoodDrop. By continuing to use our 
                  service, you agree to our use of cookies as described in our{' '}
                  <Link 
                    to="/privacy-policy" 
                    className="underline text-blue-300 hover:text-blue-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-md hover:border-gray-500 transition-colors"
                >
                  Customize
                </button>
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-md hover:border-gray-500 transition-colors"
                >
                  Decline All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>

            {showDetails && (
              <div className="mt-6 border-t border-gray-700 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Necessary Cookies</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Essential for the app to function properly. Cannot be disabled.
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.necessary}
                          disabled
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Analytics Cookies</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Help us understand how you use the app to improve your experience.
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => updatePreference('analytics', e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Cookies</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Used to personalize ads and track marketing campaign effectiveness.
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => updatePreference('marketing', e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-400 mb-4 sm:mb-0">
                    You can change these preferences anytime in your account settings.
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-md hover:border-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAcceptSelected}
                      className="px-6 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRConsentBanner;