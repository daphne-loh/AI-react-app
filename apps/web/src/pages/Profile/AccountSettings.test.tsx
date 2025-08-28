import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AccountSettings from './AccountSettings';
import { AuthContext } from '../../contexts/AuthContext';

// Mock Firebase Auth
jest.mock('../../config/firebase', () => ({
  auth: {
    currentUser: {
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      metadata: {
        creationTime: '2024-01-01T00:00:00Z'
      }
    }
  }
}));

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
  updateProfile: jest.fn(),
  updatePassword: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn()
  },
  reauthenticateWithCredential: jest.fn(),
  sendEmailVerification: jest.fn()
}));

const mockAuthContext = {
  user: {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true
  },
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn()
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('AccountSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders account settings page with tabs', () => {
    renderWithProviders(<AccountSettings />);
    
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  it('shows loading state when user is loading', () => {
    const loadingAuthContext = { ...mockAuthContext, loading: true };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={loadingAuthContext}>
          <AccountSettings />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows authentication required when no user', () => {
    const noUserAuthContext = { ...mockAuthContext, user: null };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={noUserAuthContext}>
          <AccountSettings />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
  });

  it('displays user profile information in profile tab', () => {
    renderWithProviders(<AccountSettings />);
    
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    renderWithProviders(<AccountSettings />);
    
    // Click on Security tab
    fireEvent.click(screen.getByText('Security'));
    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });

    // Click on Preferences tab
    fireEvent.click(screen.getByText('Preferences'));
    await waitFor(() => {
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    });

    // Click on Danger Zone tab
    fireEvent.click(screen.getByText('Danger Zone'));
    await waitFor(() => {
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });
  });

  it('handles profile update form submission', async () => {
    const { updateProfile } = require('firebase/auth');
    updateProfile.mockResolvedValueOnce({});
    
    renderWithProviders(<AccountSettings />);
    
    const displayNameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(displayNameInput, { target: { value: 'Updated Name' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(expect.any(Object), {
        displayName: 'Updated Name'
      });
    });
  });

  it('handles password change form submission', async () => {
    const { updatePassword, reauthenticateWithCredential, EmailAuthProvider } = require('firebase/auth');
    EmailAuthProvider.credential.mockReturnValueOnce({});
    reauthenticateWithCredential.mockResolvedValueOnce({});
    updatePassword.mockResolvedValueOnce({});
    
    renderWithProviders(<AccountSettings />);
    
    // Switch to Security tab
    fireEvent.click(screen.getByText('Security'));
    
    await waitFor(() => {
      const currentPasswordInput = screen.getByLabelText('Current Password');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
      
      fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
      
      const updateButton = screen.getByText('Update Password');
      fireEvent.click(updateButton);
    });
    
    await waitFor(() => {
      expect(reauthenticateWithCredential).toHaveBeenCalled();
      expect(updatePassword).toHaveBeenCalled();
    });
  });

  it('validates password confirmation match', async () => {
    renderWithProviders(<AccountSettings />);
    
    // Switch to Security tab
    fireEvent.click(screen.getByText('Security'));
    
    await waitFor(() => {
      const currentPasswordInput = screen.getByLabelText('Current Password');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
      
      fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
      
      const updateButton = screen.getByText('Update Password');
      fireEvent.click(updateButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
    });
  });

  it('updates user preferences', async () => {
    renderWithProviders(<AccountSettings />);
    
    // Switch to Preferences tab
    fireEvent.click(screen.getByText('Preferences'));
    
    await waitFor(() => {
      // Toggle email notifications
      const emailToggle = screen.getByRole('checkbox');
      fireEvent.click(emailToggle);
      
      // Change theme
      const themeSelect = screen.getByDisplayValue('Light');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      
      const saveButton = screen.getByText('Save Preferences');
      fireEvent.click(saveButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Preferences updated successfully!')).toBeInTheDocument();
    });
  });

  it('shows delete account confirmation modal', async () => {
    renderWithProviders(<AccountSettings />);
    
    // Switch to Danger Zone tab
    fireEvent.click(screen.getByText('Danger Zone'));
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Account');
      fireEvent.click(deleteButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Account Deletion')).toBeInTheDocument();
      expect(screen.getByText('DELETE MY ACCOUNT')).toBeInTheDocument();
    });
  });

  it('requires exact confirmation text for account deletion', async () => {
    renderWithProviders(<AccountSettings />);
    
    // Switch to Danger Zone tab and open modal
    fireEvent.click(screen.getByText('Danger Zone'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete Account'));
    });
    
    await waitFor(() => {
      const confirmationInput = screen.getByPlaceholderText('Type confirmation text');
      const deleteButton = screen.getByRole('button', { name: 'Delete Account' });
      
      // Try with wrong text
      fireEvent.change(confirmationInput, { target: { value: 'wrong text' } });
      expect(deleteButton).toBeDisabled();
      
      // Try with correct text
      fireEvent.change(confirmationInput, { target: { value: 'DELETE MY ACCOUNT' } });
      expect(deleteButton).not.toBeDisabled();
    });
  });

  it('handles email verification for unverified users', async () => {
    const unverifiedUserContext = {
      ...mockAuthContext,
      user: { ...mockAuthContext.user, emailVerified: false }
    };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={unverifiedUserContext}>
          <AccountSettings />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Verify Email')).toBeInTheDocument();
  });
});