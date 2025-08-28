import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../config/firebase';
import { UserProfile, UserPreferences, UserStats, GDPRConsent } from '@fooddrop/shared';

export class UserProfileService {
  private static readonly COLLECTION = 'users';

  /**
   * Creates a new user profile document in Firestore
   */
  static async createUserProfile(user: User): Promise<UserProfile> {
    const defaultPreferences: UserPreferences = {
      emailNotifications: true,
      theme: 'light',
      language: 'en',
      marketingEmails: false,
      dataProcessingConsent: true,
      cookiePreferences: {
        necessary: true,
        analytics: false,
        marketing: false
      }
    };

    const defaultStats: UserStats = {
      totalItemsCollected: 0,
      completedCollections: 0,
      joinDate: Timestamp.now(),
      totalLoginDays: 1,
      streakDays: 1
    };

    const defaultGDPRConsent: GDPRConsent = {
      given: true,
      timestamp: Timestamp.now(),
      version: '1.0'
    };

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      emailVerified: user.emailVerified,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      preferences: defaultPreferences,
      stats: defaultStats,
      subscriptionStatus: 'none',
      gdprConsent: defaultGDPRConsent
    };

    const userDocRef = doc(db, this.COLLECTION, user.uid);
    await setDoc(userDocRef, userProfile);

    return userProfile;
  }

  /**
   * Gets user profile from Firestore
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(db, this.COLLECTION, uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Creates user profile if it doesn't exist, or updates last login
   */
  static async ensureUserProfile(user: User): Promise<UserProfile> {
    try {
      let userProfile = await this.getUserProfile(user.uid);

      if (!userProfile) {
        // Create new profile
        userProfile = await this.createUserProfile(user);
      } else {
        // Update last login time
        await this.updateLastLogin(user.uid);
        userProfile.lastLoginAt = Timestamp.now();
      }

      return userProfile;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      throw new Error('Failed to ensure user profile exists');
    }
  }

  /**
   * Updates user profile data
   */
  static async updateUserProfile(
    uid: string, 
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      const userDocRef = doc(db, this.COLLECTION, uid);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDocRef, updateData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Updates user preferences
   */
  static async updateUserPreferences(
    uid: string, 
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    try {
      const currentProfile = await this.getUserProfile(uid);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const updatedPreferences = {
        ...currentProfile.preferences,
        ...preferences
      };

      await this.updateUserProfile(uid, {
        preferences: updatedPreferences
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw new Error('Failed to update user preferences');
    }
  }

  /**
   * Updates user stats
   */
  static async updateUserStats(
    uid: string, 
    stats: Partial<UserStats>
  ): Promise<void> {
    try {
      const currentProfile = await this.getUserProfile(uid);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const updatedStats = {
        ...currentProfile.stats,
        ...stats
      };

      await this.updateUserProfile(uid, {
        stats: updatedStats
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw new Error('Failed to update user stats');
    }
  }

  /**
   * Updates last login time
   */
  static async updateLastLogin(uid: string): Promise<void> {
    try {
      await this.updateUserProfile(uid, {
        lastLoginAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for login time updates
    }
  }

  /**
   * Sets up real-time listener for user profile changes
   */
  static subscribeToUserProfile(
    uid: string, 
    onUpdate: (profile: UserProfile | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    const userDocRef = doc(db, this.COLLECTION, uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const profile = doc.data() as UserProfile;
          onUpdate(profile);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.error('Error in user profile subscription:', error);
        if (onError) {
          onError(new Error('Failed to sync user profile'));
        }
      }
    );

    return unsubscribe;
  }

  /**
   * Updates display name
   */
  static async updateDisplayName(uid: string, displayName: string): Promise<void> {
    try {
      await this.updateUserProfile(uid, {
        displayName: displayName.trim() || undefined
      });
    } catch (error) {
      console.error('Error updating display name:', error);
      throw new Error('Failed to update display name');
    }
  }

  /**
   * Updates subscription status
   */
  static async updateSubscriptionStatus(
    uid: string, 
    status: 'none' | 'active' | 'cancelled' | 'expired'
  ): Promise<void> {
    try {
      await this.updateUserProfile(uid, {
        subscriptionStatus: status
      });
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw new Error('Failed to update subscription status');
    }
  }

  /**
   * Updates email verification status
   */
  static async updateEmailVerificationStatus(
    uid: string, 
    verified: boolean
  ): Promise<void> {
    try {
      await this.updateUserProfile(uid, {
        emailVerified: verified
      });
    } catch (error) {
      console.error('Error updating email verification status:', error);
      throw new Error('Failed to update email verification status');
    }
  }

  /**
   * Gets user collection statistics
   */
  static async getUserStats(uid: string): Promise<UserStats | null> {
    try {
      const profile = await this.getUserProfile(uid);
      return profile?.stats || null;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  /**
   * Increments collection count
   */
  static async incrementItemsCollected(uid: string): Promise<void> {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile) {
        throw new Error('User profile not found');
      }

      const updatedStats: UserStats = {
        ...profile.stats,
        totalItemsCollected: profile.stats.totalItemsCollected + 1,
        lastCollectionDate: Timestamp.now()
      };

      await this.updateUserProfile(uid, {
        stats: updatedStats
      });
    } catch (error) {
      console.error('Error incrementing items collected:', error);
      throw new Error('Failed to update collection count');
    }
  }

  /**
   * Archives/soft deletes user profile (for GDPR compliance)
   */
  static async archiveUserProfile(uid: string): Promise<void> {
    try {
      await this.updateUserProfile(uid, {
        accountDeletionScheduled: Timestamp.now(),
        dataRetentionOptOut: true
      });
    } catch (error) {
      console.error('Error archiving user profile:', error);
      throw new Error('Failed to archive user profile');
    }
  }

  /**
   * Validates user profile data structure
   */
  static validateUserProfile(profile: any): profile is UserProfile {
    return (
      typeof profile === 'object' &&
      typeof profile.uid === 'string' &&
      typeof profile.email === 'string' &&
      typeof profile.emailVerified === 'boolean' &&
      profile.createdAt instanceof Timestamp &&
      profile.lastLoginAt instanceof Timestamp &&
      typeof profile.preferences === 'object' &&
      typeof profile.stats === 'object' &&
      typeof profile.subscriptionStatus === 'string' &&
      ['none', 'active', 'cancelled', 'expired'].includes(profile.subscriptionStatus) &&
      typeof profile.gdprConsent === 'object'
    );
  }
}