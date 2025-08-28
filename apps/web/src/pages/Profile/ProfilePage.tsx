import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../config/firebase';
import Layout from '../../components/layout/Layout';
import { ProfileSkeleton } from '../../components/common/LoadingSkeleton';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { NetworkStatus } from '../../components/common/RetryComponent';

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      try {
        await sendEmailVerification(auth.currentUser);
        alert('Verification email sent! Please check your inbox.');
      } catch (error) {
        console.error('Error sending verification email:', error);
        alert('Failed to send verification email. Please try again.');
      }
    }
  };

  const getJoinDate = () => {
    if (auth.currentUser?.metadata.creationTime) {
      return new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Unknown';
  };

  const getDaysActive = () => {
    if (auth.currentUser?.metadata.creationTime) {
      const joinDate = new Date(auth.currentUser.metadata.creationTime);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - joinDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  if (loading) {
    return (
      <Layout>
        <NetworkStatus />
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
        <NetworkStatus />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              
              <div className="space-y-6">
                {/* Email Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{user.email}</span>
                    <div className="flex items-center space-x-2">
                      {user.emailVerified ? (
                        <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Not Verified
                          </div>
                          <button
                            onClick={handleResendVerification}
                            className="text-primary-600 hover:text-primary-700 text-xs font-medium underline"
                          >
                            Resend Verification
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Name Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <span className="text-gray-900">
                    {user.displayName || 'Not set'}
                  </span>
                </div>

                {/* Join Date Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <span className="text-gray-900">{getJoinDate()}</span>
                </div>

                {/* Account Statistics */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-primary-600">{getDaysActive()}</div>
                      <div className="text-sm text-gray-600">Days Active</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Items Collected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
              
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🆓</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">Free Plan</h4>
                  <p className="text-xs text-gray-500">No subscription active</p>
                </div>

                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                  Upgrade to Premium
                </button>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  📧 Change Email
                </button>
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  🔑 Change Password
                </button>
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  ⚙️ Account Settings
                </button>
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default ProfilePage;