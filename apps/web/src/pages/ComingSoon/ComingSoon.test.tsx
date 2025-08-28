import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComingSoon from './ComingSoon';

describe('ComingSoon', () => {
  it('renders the main heading', () => {
    render(<ComingSoon />);
    expect(screen.getByText('FoodDrop')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('displays the main description', () => {
    render(<ComingSoon />);
    expect(
      screen.getByText('Discover amazing foods from around the world through our collection game')
    ).toBeInTheDocument();
  });

  it('shows the three main features', () => {
    render(<ComingSoon />);
    expect(screen.getByText('Collect')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
  });

  it('displays the email signup form', () => {
    render(<ComingSoon />);
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText('Notify Me When Ready! 🚀')).toBeInTheDocument();
  });

  it('shows thank you message after email submission', async () => {
    render(<ComingSoon />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Notify Me When Ready! 🚀');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Thank you!')).toBeInTheDocument();
      expect(screen.getByText("We'll let you know when FoodDrop is ready!")).toBeInTheDocument();
    });
  });

  it('displays coming features', () => {
    render(<ComingSoon />);
    expect(screen.getByText('🥟 Weird & Cursed Foods')).toBeInTheDocument();
    expect(screen.getByText('🌮 Global Street Foods')).toBeInTheDocument();
    expect(screen.getByText('🍰 Historical Desserts')).toBeInTheDocument();
    expect(screen.getByText('🐲 Mythical Foods')).toBeInTheDocument();
  });

  it('resets form after successful submission', async () => {
    render(<ComingSoon />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Notify Me When Ready! 🚀');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    // Wait for thank you message to disappear (after 3 seconds)
    await waitFor(
      () => {
        expect(screen.queryByText('Thank you!')).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});