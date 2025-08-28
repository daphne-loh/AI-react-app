import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import MainNavigation from '../MainNavigation';

const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  createdAt: new Date(),
  lastLoginAt: new Date(),
  preferences: {
    emailNotifications: true,
    theme: 'light' as const,
    language: 'en'
  },
  stats: {
    totalItemsCollected: 10,
    completedCollections: 2,
    joinDate: new Date()
  },
  subscriptionStatus: 'none' as const
};

const mockLogout = jest.fn();

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: mockLogout,
    resetPassword: jest.fn()
  })
}));

const renderWithRouter = (component: React.ReactElement, initialEntries: string[] = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('MainNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the brand logo and name', () => {
    renderWithRouter(<MainNavigation />);
    
    expect(screen.getByText('🍜')).toBeInTheDocument();
    expect(screen.getByText('FoodDrop')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderWithRouter(<MainNavigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Collections')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('highlights active navigation link', () => {
    renderWithRouter(<MainNavigation />, ['/profile']);
    
    const profileLinks = screen.getAllByText('Profile');
    const desktopProfileLink = profileLinks.find(link => 
      link.closest('a')?.classList.contains('bg-primary-100')
    );
    
    expect(desktopProfileLink).toBeInTheDocument();
  });

  it('displays user information', () => {
    renderWithRouter(<MainNavigation />);
    
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of name
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows user dropdown menu when clicked', () => {
    renderWithRouter(<MainNavigation />);
    
    const userButton = screen.getByRole('button', { name: /test user/i });
    fireEvent.click(userButton);
    
    expect(screen.getByText('👤 Profile')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
    expect(screen.getByText('🚪 Sign Out')).toBeInTheDocument();
  });

  it('handles logout when Sign Out is clicked', () => {
    renderWithRouter(<MainNavigation />);
    
    const userButton = screen.getByRole('button', { name: /test user/i });
    fireEvent.click(userButton);
    
    const signOutButton = screen.getByText('🚪 Sign Out');
    fireEvent.click(signOutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('shows mobile menu when hamburger is clicked', () => {
    renderWithRouter(<MainNavigation />);
    
    // Find the mobile menu button by its SVG content
    const menuButtons = screen.getAllByRole('button');
    const mobileMenuButton = menuButtons.find(button => {
      const svg = button.querySelector('svg');
      return svg && svg.querySelector('path[d="M4 6h16M4 12h16M4 18h16"]');
    });
    
    expect(mobileMenuButton).toBeInTheDocument();
    fireEvent.click(mobileMenuButton!);
    
    // Check for mobile-specific elements
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it('closes mobile menu when navigation link is clicked', () => {
    renderWithRouter(<MainNavigation />);
    
    // Find the mobile menu button and click it
    const menuButtons = screen.getAllByRole('button');
    const mobileMenuButton = menuButtons.find(button => {
      const svg = button.querySelector('svg');
      return svg && svg.querySelector('path[d="M4 6h16M4 12h16M4 18h16"]');
    });
    
    fireEvent.click(mobileMenuButton!);
    
    // Find mobile Dashboard link and click it
    const mobileLinks = screen.getAllByText('Dashboard');
    const mobileDashboardLink = mobileLinks[1]; // Second instance should be mobile
    
    fireEvent.click(mobileDashboardLink);
    
    // Menu should close - check that email is no longer visible (mobile-only element)
    expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
  });

  it('handles user without display name', () => {
    const mockUserNoName = { ...mockUser, displayName: undefined };
    
    // Re-mock the useAuth hook for this specific test
    const mockUseAuth = jest.fn().mockReturnValue({
      user: mockUserNoName,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
      resetPassword: jest.fn()
    });
    
    jest.doMock('../../../contexts/AuthContext', () => ({
      useAuth: mockUseAuth
    }));
    
    renderWithRouter(<MainNavigation />);
    
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of email
    expect(screen.getByText('test')).toBeInTheDocument(); // Email username part
  });
});