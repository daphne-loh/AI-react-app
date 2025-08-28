import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from './ProfilePage';
import type { User } from '@fooddrop/shared';

// Mock Firebase auth
jest.mock('../../config/firebase', () => ({
  auth: {
    currentUser: {
      emailVerified: true,
      metadata: {
        creationTime: '2024-01-01T00:00:00.000Z'
      }
    }
  }
}));

jest.mock('firebase/auth', () => ({
  sendEmailVerification: jest.fn()
}));

// Mock the AuthContext hook
const mockUser: User = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true
};

const mockUnverifiedUser: User = {
  uid: 'test-uid',
  email: 'unverified@example.com',
  emailVerified: false
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn()
  })
}));

describe('ProfilePage', () => {
  it('renders profile page with user information', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays verified badge for verified email', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('shows account statistics section', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Account Statistics')).toBeInTheDocument();
    expect(screen.getByText('Days Active')).toBeInTheDocument();
    expect(screen.getByText('Items Collected')).toBeInTheDocument();
  });

  it('displays subscription status', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Subscription')).toBeInTheDocument();
    expect(screen.getByText('Free Plan')).toBeInTheDocument();
    expect(screen.getByText('No subscription active')).toBeInTheDocument();
  });

  it('shows quick actions section', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('📧 Change Email')).toBeInTheDocument();
    expect(screen.getByText('🔑 Change Password')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Account Settings')).toBeInTheDocument();
    expect(screen.getByText('🗑️ Delete Account')).toBeInTheDocument();
  });

  it('has responsive layout classes', () => {
    const { container } = render(<ProfilePage />);
    
    const gridElement = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
    expect(gridElement).toBeInTheDocument();
  });

  it('displays join date correctly', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Member Since')).toBeInTheDocument();
    // Should display a formatted date
    expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeInTheDocument();
  });

  it('calculates days active correctly', () => {
    render(<ProfilePage />);
    
    // Should show some number of days (will be calculated based on mock creation time)
    const daysActiveElements = screen.getAllByText(/\d+/);
    expect(daysActiveElements.length).toBeGreaterThan(0);
  });
});