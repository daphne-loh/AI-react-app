import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/auth';
import type { AuthUser, AuthContextType } from '@fooddrop/shared';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): AuthUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || undefined,
  emailVerified: firebaseUser.emailVerified
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const mappedUser = mapFirebaseUserToUser(firebaseUser);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Check for remember me preference on initial load
    const checkRememberMe = () => {
      const rememberMe = localStorage.getItem('fooddrop_remember_me');
      if (!rememberMe && !auth.currentUser) {
        // If no remember me preference and no current user, ensure user is logged out
        setUser(null);
      }
    };

    checkRememberMe();

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const user = await authService.login(email, password);
    setUser(user);
  };

  const register = async (email: string, password: string): Promise<void> => {
    const user = await authService.register(email, password);
    setUser(user);
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    // Clear remember me preference on logout
    localStorage.removeItem('fooddrop_remember_me');
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;