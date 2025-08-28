import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GameLayout from '../../components/layout/GameLayout';
import WelcomeSection from './WelcomeSection';
import CollectionPreview from './CollectionPreview';
import QuickActions from './QuickActions';
import { DashboardSkeleton } from '../../components/common/LoadingSkeleton';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { NetworkStatus } from '../../components/common/RetryComponent';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <GameLayout>
        <NetworkStatus />
        <DashboardSkeleton />
      </GameLayout>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <GameLayout>
        <NetworkStatus />
        <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Welcome Section */}
          <ErrorBoundary fallback={
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Failed to load welcome section. Please refresh the page.</p>
            </div>
          }>
            <WelcomeSection user={user} />
          </ErrorBoundary>

          {/* Dashboard Content */}
          <div className="flex-1 mt-4 sm:mt-8 min-h-0">
            {/* Collection Preview */}
            <ErrorBoundary fallback={
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Failed to load collection preview.</p>
              </div>
            }>
              <CollectionPreview />
            </ErrorBoundary>
          </div>

          {/* Quick Actions - Only show on desktop to keep mobile compact */}
          <div className="hidden md:block mt-4 sm:mt-8">
            <ErrorBoundary fallback={
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Failed to load quick actions.</p>
              </div>
            }>
              <QuickActions />
            </ErrorBoundary>
          </div>
        </div>
      </GameLayout>
    </ErrorBoundary>
  );
};

export default Dashboard;