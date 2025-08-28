import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Login from './Login';
import { AuthProvider } from '../../../contexts/AuthContext';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login', () => {
  it('renders login form with all required fields', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithRouter(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('clears errors when user starts typing', async () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Trigger validation error
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    
    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test@' } });
    
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  it('handles remember me checkbox', () => {
    renderWithRouter(<Login />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    expect(rememberMeCheckbox).not.toBeChecked();
    
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
    
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  it('shows loading state during form submission', async () => {
    renderWithRouter(<Login />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // Check loading state
    expect(screen.getByText('Signing In...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Wait for form submission to complete
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('provides navigation links', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByRole('link', { name: /create one here/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<Login />);
    
    // Check ARIA labels and required attributes
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('required');
    
    // Check form has proper noValidate attribute
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('novalidate');
  });

  it('handles forgot password button click', () => {
    renderWithRouter(<Login />);
    
    const forgotPasswordButton = screen.getByText(/forgot password/i);
    expect(forgotPasswordButton).toBeInTheDocument();
    
    // The button should be clickable (not disabled)
    expect(forgotPasswordButton).not.toBeDisabled();
  });

  it('stores remember me preference in localStorage', async () => {
    // Mock localStorage
    const localStorageMock = {
      setItem: jest.fn(),
      removeItem: jest.fn(),
      getItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    renderWithRouter(<Login />);
    
    // Fill form with valid data and check remember me
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByLabelText(/remember me/i));
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // Wait for form submission to complete
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('fooddrop_remember_me', 'true');
    }, { timeout: 2000 });
  });

});