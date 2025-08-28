import React from 'react';
import type { User } from '@fooddrop/shared';
import { useProfileStats } from '../../contexts/UserProfileContext';

interface WelcomeSectionProps {
  user: User;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user }) => {
  const { daysActive, totalItemsCollected, isSubscribed } = useProfileStats();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getDisplayName = () => {
    if (user.displayName) {
      return user.displayName;
    }
    // Extract name from email if no display name
    return user.email.split('@')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {getDisplayName()}! 👋
          </h1>
          <p className="text-gray-600 mb-4 sm:mb-0">
            You've been active for {daysActive} days and collected {totalItemsCollected} items!
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Subscription Status Badge */}
          <div className="flex items-center">
            {isSubscribed ? (
              <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 010 2h2a1 1 0 011 1v2a1 1 0 01-2 0V6h-2a1 1 0 010-2h2V2zm6 7a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 010-2h1V9a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Premium
              </div>
            ) : (
              <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                Free Plan
              </div>
            )}
          </div>
          
          {/* Email Verification Badge */}
          <div className="flex items-center">
            {user.emailVerified ? (
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </div>
            ) : (
              <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Verify Email
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;