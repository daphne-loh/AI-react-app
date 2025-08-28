import '@testing-library/jest-dom';

// Mock Firebase Auth for testing
jest.mock('./config/firebase', () => ({
  auth: {
    currentUser: null,
  }
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate no user initially
    callback(null);
    return jest.fn(); // Return unsubscribe function
  }),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('./services/auth', () => ({
  authService: {
    register: jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: false
    }),
    login: jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true
    }),
    logout: jest.fn(),
    resetPassword: jest.fn(),
    getCurrentUser: jest.fn().mockReturnValue(null)
  },
  AuthError: class AuthError extends Error {
    constructor(message: string, public code?: string) {
      super(message);
      this.name = 'AuthError';
    }
  }
}));