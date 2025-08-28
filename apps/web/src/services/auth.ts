import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { AuthUser } from '@fooddrop/shared';

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): AuthUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || undefined,
  emailVerified: firebaseUser.emailVerified
});

export const authService = {
  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return mapFirebaseUserToUser(userCredential.user);
    } catch (error: any) {
      throw new AuthError(getAuthErrorMessage(error.code), error.code);
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return mapFirebaseUserToUser(userCredential.user);
    } catch (error: any) {
      throw new AuthError(getAuthErrorMessage(error.code), error.code);
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new AuthError('Failed to sign out', error.code);
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new AuthError(getAuthErrorMessage(error.code), error.code);
    }
  },

  async updateUserProfile(displayName?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new AuthError('No user is currently signed in');
    }

    try {
      await updateProfile(user, { displayName });
    } catch (error: any) {
      throw new AuthError('Failed to update profile', error.code);
    }
  },

  getCurrentUser(): User | null {
    const user = auth.currentUser;
    return user ? mapFirebaseUserToUser(user) : null;
  }
};

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'An error occurred. Please try again.';
  }
}