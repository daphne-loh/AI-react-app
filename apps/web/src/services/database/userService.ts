import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  UserProfile, 
  UserCollection, 
  AuditLog, 
  DataExportRequest, 
  DataDeletionRequest,
  GDPRConsent,
  UserProfileValidation,
  UserCollectionValidation,
  AuditLogValidation 
} from '@fooddrop/shared';
import { DataValidator, ValidationError } from './validation';
import { auditLogger } from './auditLogger';

export class UserService {
  private static readonly COLLECTION_NAME = 'users';
  private static readonly COLLECTIONS_SUBCOLLECTION = 'collections';

  // ============================================================================
  // User Profile Operations
  // ============================================================================

  static async createUserProfile(
    userData: Omit<UserProfile, 'createdAt' | 'updatedAt' | 'lastLoginAt'>,
    gdprConsent: Omit<GDPRConsent, 'timestamp'>,
    userIpAddress?: string
  ): Promise<UserProfile> {
    try {
      const now = Timestamp.now();
      const profile: UserProfile = {
        ...userData,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        gdprConsent: {
          ...gdprConsent,
          timestamp: now,
          ipAddress: userIpAddress
        }
      };

      // Validate the profile data
      DataValidator.validateAndThrow(profile, UserProfileValidation);

      // Create the user document
      const userRef = doc(db, this.COLLECTION_NAME, userData.uid);
      await setDoc(userRef, this.prepareForFirestore(profile));

      // Log the creation
      await auditLogger.logUserAction(userData.uid, 'register', {
        email: userData.email,
        gdprConsentGiven: gdprConsent.given,
        gdprConsentVersion: gdprConsent.version
      }, userIpAddress);

      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();
      return this.convertFromFirestore(data) as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>,
    userIpAddress?: string
  ): Promise<void> {
    try {
      // Validate updates
      if (Object.keys(updates).length === 0) {
        throw new Error('No updates provided');
      }

      // Prevent updating certain fields
      const protectedFields = ['uid', 'createdAt', 'gdprConsent'];
      const invalidUpdates = Object.keys(updates).filter(field => 
        protectedFields.includes(field)
      );
      
      if (invalidUpdates.length > 0) {
        throw new Error(`Cannot update protected fields: ${invalidUpdates.join(', ')}`);
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, this.prepareForFirestore(updateData));

      // Log the update
      await auditLogger.logUserAction(userId, 'profile_update', {
        updatedFields: Object.keys(updates)
      }, userIpAddress);

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async updateLastLogin(userId: string, userIpAddress?: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await auditLogger.logUserAction(userId, 'login', {}, userIpAddress);
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // ============================================================================
  // User Collections Operations
  // ============================================================================

  static async addToUserCollection(
    userId: string,
    collectionItem: Omit<UserCollection, 'id' | 'userId' | 'collectedAt'>
  ): Promise<string> {
    try {
      const collectionData: Omit<UserCollection, 'id'> = {
        ...collectionItem,
        userId,
        collectedAt: Timestamp.now()
      };

      // Validate collection data
      DataValidator.validateAndThrow(collectionData, UserCollectionValidation);

      // Add to user's collections subcollection
      const collectionsRef = collection(db, this.COLLECTION_NAME, userId, this.COLLECTIONS_SUBCOLLECTION);
      const docRef = doc(collectionsRef);
      
      const fullCollectionData = {
        ...collectionData,
        id: docRef.id
      };

      await setDoc(docRef, this.prepareForFirestore(fullCollectionData));

      // Update user stats
      await this.updateUserStats(userId);

      // Log the collection addition
      await auditLogger.logUserAction(userId, 'collection_add', {
        foodItemId: collectionItem.foodItemId,
        discoveryMethod: collectionItem.discoveryMethod
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding to user collection:', error);
      throw error;
    }
  }

  static async getUserCollections(
    userId: string,
    options?: { limit?: number; orderBy?: 'collectedAt' | 'foodItemId'; orderDirection?: 'asc' | 'desc' }
  ): Promise<UserCollection[]> {
    try {
      const collectionsRef = collection(db, this.COLLECTION_NAME, userId, this.COLLECTIONS_SUBCOLLECTION);
      
      let collectionQuery = query(collectionsRef);
      
      if (options?.orderBy) {
        collectionQuery = query(collectionQuery, 
          orderBy(options.orderBy, options.orderDirection || 'desc')
        );
      }
      
      if (options?.limit) {
        collectionQuery = query(collectionQuery, limit(options.limit));
      }

      const querySnapshot = await getDocs(collectionQuery);
      
      return querySnapshot.docs.map(doc => 
        this.convertFromFirestore(doc.data()) as UserCollection
      );
    } catch (error) {
      console.error('Error fetching user collections:', error);
      throw error;
    }
  }

  // ============================================================================
  // GDPR Compliance Operations
  // ============================================================================

  static async requestDataExport(
    userId: string,
    options: {
      includeCollections: boolean;
      includeAnalytics: boolean;
      includeAuditLogs: boolean;
    },
    userIpAddress?: string
  ): Promise<string> {
    try {
      const exportRequest: Omit<DataExportRequest, 'id'> = {
        userId,
        requestedAt: Timestamp.now(),
        status: 'pending',
        ...options,
        requestIpAddress: userIpAddress
      };

      const exportRef = doc(collection(db, 'gdpr', 'data-exports'));
      await setDoc(exportRef, this.prepareForFirestore(exportRequest));

      // Log the request
      await auditLogger.logUserAction(userId, 'data_export', {
        requestId: exportRef.id,
        includeCollections: options.includeCollections,
        includeAnalytics: options.includeAnalytics,
        includeAuditLogs: options.includeAuditLogs
      }, userIpAddress);

      return exportRef.id;
    } catch (error) {
      console.error('Error requesting data export:', error);
      throw error;
    }
  }

  static async requestDataDeletion(
    userId: string,
    reason?: string,
    retainAnalytics: boolean = false,
    userIpAddress?: string
  ): Promise<string> {
    try {
      const confirmationCode = Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15);
      
      const deletionRequest: Omit<DataDeletionRequest, 'id'> = {
        userId,
        requestedAt: Timestamp.now(),
        scheduledFor: Timestamp.fromMillis(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
        status: 'pending',
        reason,
        confirmationCode,
        retainAnalytics,
        requestIpAddress: userIpAddress
      };

      const deletionRef = doc(collection(db, 'gdpr', 'deletion-requests'));
      await setDoc(deletionRef, this.prepareForFirestore(deletionRequest));

      // Log the request
      await auditLogger.logUserAction(userId, 'data_deletion', {
        requestId: deletionRef.id,
        scheduledFor: deletionRequest.scheduledFor,
        retainAnalytics
      }, userIpAddress);

      return deletionRef.id;
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      throw error;
    }
  }

  // ============================================================================
  // Admin Operations (Server-side only)
  // ============================================================================

  static async deleteUserCompletely(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete user profile
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      batch.delete(userRef);

      // Delete user collections
      const collectionsSnapshot = await getDocs(
        collection(db, this.COLLECTION_NAME, userId, this.COLLECTIONS_SUBCOLLECTION)
      );
      
      collectionsSnapshot.docs.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });

      // Note: Audit logs are typically retained for compliance
      // Only delete if specifically requested and legally allowed

      await batch.commit();
    } catch (error) {
      console.error('Error deleting user completely:', error);
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private static async updateUserStats(userId: string): Promise<void> {
    try {
      const collections = await this.getUserCollections(userId);
      const uniqueFoodItems = new Set(collections.map(c => c.foodItemId));
      
      const stats = {
        totalItemsCollected: collections.length,
        completedCollections: 0, // TODO: Implement based on collection completion logic
        lastCollectionDate: collections.length > 0 ? 
          collections.sort((a, b) => b.collectedAt.toMillis() - a.collectedAt.toMillis())[0].collectedAt :
          null
      };

      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        'stats.totalItemsCollected': stats.totalItemsCollected,
        'stats.completedCollections': stats.completedCollections,
        'stats.lastCollectionDate': stats.lastCollectionDate,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Don't throw - this is a background operation
    }
  }

  private static prepareForFirestore(data: any): any {
    // Convert any Date objects to Firestore Timestamps
    const prepared = { ...data };
    
    Object.keys(prepared).forEach(key => {
      if (prepared[key] instanceof Date) {
        prepared[key] = Timestamp.fromDate(prepared[key]);
      } else if (prepared[key] && typeof prepared[key] === 'object') {
        prepared[key] = this.prepareForFirestore(prepared[key]);
      }
    });

    return prepared;
  }

  private static convertFromFirestore(data: any): any {
    // Convert Firestore Timestamps to Date objects for client use
    const converted = { ...data };
    
    Object.keys(converted).forEach(key => {
      if (converted[key] && typeof converted[key].toDate === 'function') {
        converted[key] = converted[key].toDate();
      } else if (converted[key] && typeof converted[key] === 'object') {
        converted[key] = this.convertFromFirestore(converted[key]);
      }
    });

    return converted;
  }
}

export default UserService;