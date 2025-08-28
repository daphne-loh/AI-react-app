import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

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

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the brand section with logo and description', () => {
    renderWithRouter(<Footer />);
    
    expect(screen.getByText('🍜')).toBeInTheDocument();
    expect(screen.getByText('FoodDrop')).toBeInTheDocument();
    expect(screen.getByText(/Discover amazing foods from around the world/)).toBeInTheDocument();
  });

  it('renders Quick Links section with all navigation links', () => {
    renderWithRouter(<Footer />);
    
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Collections' })).toHaveAttribute('href', '/collections');
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('renders Account section with subscription and logout', () => {
    renderWithRouter(<Footer />);
    
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upgrade to Premium' })).toHaveAttribute('href', '/subscribe');
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
  });

  it('renders Support section with contact and legal links', () => {
    renderWithRouter(<Footer />);
    
    expect(screen.getByText('Support')).toBeInTheDocument();
    
    const contactLink = screen.getByRole('link', { name: 'Contact Us' });
    expect(contactLink).toHaveAttribute('href', 'mailto:support@fooddrop.com');
    
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
    
    const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('renders copyright and brand message in bottom section', () => {
    renderWithRouter(<Footer />);
    
    expect(screen.getByText('© 2025 FoodDrop. All rights reserved.')).toBeInTheDocument();
    expect(screen.getByText('Made with ❤️ for food lovers')).toBeInTheDocument();
  });

  it('handles logout when Sign Out button is clicked', () => {
    renderWithRouter(<Footer />);
    
    const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
    fireEvent.click(signOutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('has proper responsive grid layout classes', () => {
    renderWithRouter(<Footer />);
    
    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toHaveClass('bg-white', 'border-t', 'border-gray-200', 'mt-auto');
    
    const gridContainer = footerElement.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-4', 'gap-8');
  });

  it('applies hover effects to links', () => {
    renderWithRouter(<Footer />);
    
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveClass('hover:text-primary-600', 'transition-colors');
    
    const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
    expect(signOutButton).toHaveClass('hover:text-red-600', 'transition-colors');
  });

  it('console.error is called when logout fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLogout.mockRejectedValueOnce(new Error('Logout failed'));
    
    renderWithRouter(<Footer />);
    
    const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
    fireEvent.click(signOutButton);
    
    // Wait for the async logout to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('has proper semantic HTML structure', () => {
    renderWithRouter(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer.tagName).toBe('FOOTER');
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { name: 'Quick Links', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Account', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Support', level: 3 })).toBeInTheDocument();
  });
});