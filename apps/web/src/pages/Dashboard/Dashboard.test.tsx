import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import type { User } from '@fooddrop/shared';

// Mock the AuthContext hook
const mockUser: User = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true
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

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  it('renders welcome section when user is authenticated', () => {
    renderWithRouter(<Dashboard />);
    
    // Check for welcome message
    expect(screen.getByText(/good morning|good afternoon|good evening/i)).toBeInTheDocument();
  });

  it('renders collection preview section', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Your Collection')).toBeInTheDocument();
    expect(screen.getByText('Items Collected')).toBeInTheDocument();
    expect(screen.getByText('Completion')).toBeInTheDocument();
  });

  it('renders subscription card', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Premium Access')).toBeInTheDocument();
    expect(screen.getByText('Free Plan')).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('has responsive grid layout classes', () => {
    renderWithRouter(<Dashboard />);
    
    const gridElement = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
    expect(gridElement).toBeInTheDocument();
  });
});