import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserPreferences, UserStats } from '@fooddrop/shared';
import { UserProfileService } from '../services/UserProfileService';
import { useAuth } from './AuthContext';

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateStats: (stats: Partial<UserStats>) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Computed values
  isSubscribed: boolean;
  daysActive: number;
  hasCompletedOnboarding: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: React.ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize profile when user logs in
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeProfile = async () => {
      if (!user || authLoading) {
        setProfile(null);
        setLoading(authLoading);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Ensure profile exists and get it
        const userProfile = await UserProfileService.ensureUserProfile(user);
        setProfile(userProfile);

        // Set up real-time subscription
        unsubscribe = UserProfileService.subscribeToUserProfile(
          user.uid,
          (updatedProfile) => {
            setProfile(updatedProfile);
          },
          (subscriptionError) => {
            console.error('Profile subscription error:', subscriptionError);
            setError('Failed to sync profile data');
          }
        );
      } catch (err) {
        console.error('Error initializing profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();

    // Cleanup subscription on unmount or user change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]);

  // Actions
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await UserProfileService.updateUserProfile(user.uid, updates);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw new Error('Failed to update profile');
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await UserProfileService.updateUserPreferences(user.uid, preferences);
    } catch (err) {
      console.error('Error updating preferences:', err);
      throw new Error('Failed to update preferences');
    }
  };

  const updateStats = async (stats: Partial<UserStats>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await UserProfileService.updateUserStats(user.uid, stats);
    } catch (err) {
      console.error('Error updating stats:', err);
      throw new Error('Failed to update stats');
    }
  };

  const updateDisplayName = async (displayName: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await UserProfileService.updateDisplayName(user.uid, displayName);
    } catch (err) {
      console.error('Error updating display name:', err);
      throw new Error('Failed to update display name');
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const refreshedProfile = await UserProfileService.getUserProfile(user.uid);
      setProfile(refreshedProfile);
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError('Failed to refresh profile data');
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const isSubscribed = profile?.subscriptionStatus === 'active';
  
  const daysActive = profile?.stats?.joinDate 
    ? Math.ceil((Date.now() - profile.stats.joinDate.toDate().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const hasCompletedOnboarding = Boolean(
    profile?.displayName && 
    profile?.preferences?.emailNotifications !== undefined &&
    profile?.gdprConsent?.given
  );

  const contextValue: UserProfileContextType = {
    profile,
    loading,
    error,
    updateProfile,
    updatePreferences,
    updateStats,
    updateDisplayName,
    refreshProfile,
    isSubscribed,
    daysActive,
    hasCompletedOnboarding
  };

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

// Hook to use the UserProfile context
export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

// Hook for specific profile data with loading states
export const useProfileData = () => {
  const { profile, loading, error } = useUserProfile();

  return {
    profile,
    preferences: profile?.preferences,
    stats: profile?.stats,
    loading,
    error,
    hasProfile: Boolean(profile)
  };
};

// Hook for profile statistics
export const useProfileStats = () => {
  const { profile, daysActive, isSubscribed } = useUserProfile();

  const stats = profile?.stats;
  
  return {
    totalItemsCollected: stats?.totalItemsCollected || 0,
    completedCollections: stats?.completedCollections || 0,
    daysActive,
    streakDays: stats?.streakDays || 0,
    joinDate: stats?.joinDate?.toDate(),
    lastCollectionDate: stats?.lastCollectionDate?.toDate(),
    isSubscribed,
    favoriteTheme: stats?.favoriteTheme
  };
};

export default UserProfileContext;