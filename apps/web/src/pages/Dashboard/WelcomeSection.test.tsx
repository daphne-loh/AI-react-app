import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import WelcomeSection from './WelcomeSection';
import type { User } from '@fooddrop/shared';
import { UserProfileContext } from '../../contexts/UserProfileContext';

const mockUser: User = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true
};

const mockUnverifiedUser: User = {
  uid: 'test-uid',
  email: 'unverified@example.com',
  displayName: undefined,
  emailVerified: false
};

const mockUserProfileContext = {
  profile: null,
  loading: false,
  error: null,
  updateProfile: jest.fn(),
  updatePreferences: jest.fn(),
  updateStats: jest.fn(),
  updateDisplayName: jest.fn(),
  refreshProfile: jest.fn(),
  isSubscribed: false,
  daysActive: 7,
  hasCompletedOnboarding: false
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <UserProfileContext.Provider value={mockUserProfileContext}>
        {component}
      </UserProfileContext.Provider>
    </BrowserRouter>
  );
};

describe('WelcomeSection', () => {
  it('renders welcome message with display name', () => {
    renderWithProviders(<WelcomeSection user={mockUser} />);
    
    expect(screen.getByText(/good morning|good afternoon|good evening/i)).toBeInTheDocument();
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
  });

  it('uses email username when display name is not available', () => {
    const userWithoutDisplayName = { ...mockUser, displayName: undefined };
    renderWithProviders(<WelcomeSection user={userWithoutDisplayName} />);
    
    expect(screen.getByText(/test/i)).toBeInTheDocument(); // Username from email
  });

  it('shows subscription status badge', () => {
    renderWithProviders(<WelcomeSection user={mockUser} />);
    
    expect(screen.getByText('Free Plan')).toBeInTheDocument();
  });

  it('shows verified badge when email is verified', () => {
    renderWithProviders(<WelcomeSection user={mockUser} />);
    
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('shows verification warning when email is not verified', () => {
    renderWithProviders(<WelcomeSection user={mockUnverifiedUser} />);
    
    expect(screen.getByText('Verify Email')).toBeInTheDocument();
    expect(screen.getByText('Verify Email')).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('displays user activity statistics', () => {
    renderWithProviders(<WelcomeSection user={mockUser} />);
    
    expect(screen.getByText(/active for 7 days/i)).toBeInTheDocument();
    expect(screen.getByText(/collected 0 items/i)).toBeInTheDocument();
  });

  it('has proper responsive layout classes', () => {
    const { container } = renderWithProviders(<WelcomeSection user={mockUser} />);
    
    const flexContainer = container.querySelector('.flex.flex-col.sm\\:flex-row');
    expect(flexContainer).toBeInTheDocument();
  });
});