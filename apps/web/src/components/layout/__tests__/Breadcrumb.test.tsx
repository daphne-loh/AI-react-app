import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';

const renderWithRouter = (initialEntries: string[] = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Breadcrumb />
    </MemoryRouter>
  );
};

describe('Breadcrumb', () => {
  it('does not render on dashboard page (only one breadcrumb)', () => {
    renderWithRouter(['/dashboard']);
    
    // Should not render anything when only "Home" would be shown
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders breadcrumb for profile page', () => {
    renderWithRouter(['/profile']);
    
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders breadcrumb for settings page', () => {
    renderWithRouter(['/settings']);
    
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders breadcrumb for collections page', () => {
    renderWithRouter(['/collections']);
    
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Collections')).toBeInTheDocument();
  });

  it('shows current page as non-clickable text', () => {
    renderWithRouter(['/profile']);
    
    const profileText = screen.getByText('Profile');
    expect(profileText).toHaveAttribute('aria-current', 'page');
    expect(profileText.tagName).toBe('SPAN');
  });

  it('shows Home as clickable link when not on dashboard', () => {
    renderWithRouter(['/profile']);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/dashboard');
  });

  it('renders separator icon between breadcrumb items', () => {
    renderWithRouter(['/profile']);
    
    // Check for SVG separator
    const svgElement = screen.getByRole('navigation').querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles unknown routes gracefully', () => {
    renderWithRouter(['/unknown-route']);
    
    // Should not render for unknown routes (only Home would show)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('does not duplicate dashboard in breadcrumb path', () => {
    renderWithRouter(['/dashboard/profile']);
    
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    
    // Should not have duplicate Home/Dashboard entries
    const homeLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(homeLinks).toHaveLength(1);
  });

  it('applies correct CSS classes for styling', () => {
    renderWithRouter(['/profile']);
    
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveClass('bg-gray-50', 'border-b', 'px-4', 'py-2');
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveClass('text-primary-600', 'hover:text-primary-700', 'font-medium', 'transition-colors');
    
    const currentPage = screen.getByText('Profile');
    expect(currentPage).toHaveClass('text-gray-500', 'font-medium');
  });
});