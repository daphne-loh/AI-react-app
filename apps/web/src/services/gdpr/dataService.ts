import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserService } from '../database/userService';
import { auditLogger } from '../database/auditLogger';
import { 
  UserProfile, 
  UserCollection, 
  DataExportRequest, 
  DataDeletionRequest 
} from '@fooddrop/shared';

export interface ExportOptions {
  includeProfile: boolean;
  includeCollections: boolean;
  includePreferences: boolean;
  includeAnalytics: boolean;
  includeAuditLogs: boolean;
  format: 'json' | 'csv';
}

export interface UserDataExport {
  metadata: {
    exportDate: string;
    userId: string;
    version: string;
    dataTypes: string[];
  };
  profile?: UserProfile;
  collections?: UserCollection[];
  preferences?: any;
  analytics?: any[];
  auditLogs?: any[];
}

export class GDPRDataService {
  
  // ============================================================================
  // Data Export Operations
  // ============================================================================

  static async requestDataExport(
    userId: string,
    options: ExportOptions,
    userEmail: string,
    userIpAddress?: string
  ): Promise<string> {
    try {
      // Create export request record
      const requestId = await UserService.requestDataExport(
        userId,
        {
          includeCollections: options.includeCollections,
          includeAnalytics: options.includeAnalytics,
          includeAuditLogs: options.includeAuditLogs
        },
        userIpAddress
      );

      // In a real application, this would trigger a background job
      // For now, we'll process it immediately
      const exportData = await this.generateUserDataExport(userId, options);
      
      // In production, you would:
      // 1. Store the export data in secure cloud storage
      // 2. Generate a signed download URL
      // 3. Send an email with the download link
      // 4. Set expiration date for the download

      console.log('Data export generated for user:', userId, {
        size: JSON.stringify(exportData).length,
        types: Object.keys(exportData).filter(key => key !== 'metadata' && exportData[key as keyof UserDataExport])
      });

      // Log the successful export
      await auditLogger.logUserAction(userId, 'data_export', {
        requestId,
        exportSize: JSON.stringify(exportData).length,
        includedData: Object.keys(exportData).filter(key => key !== 'metadata')
      }, userIpAddress);

      return requestId;
    } catch (error) {
      console.error('Error processing data export request:', error);
      throw new Error('Failed to process data export request');
    }
  }

  static async generateUserDataExport(
    userId: string, 
    options: ExportOptions
  ): Promise<UserDataExport> {
    const exportData: UserDataExport = {
      metadata: {
        exportDate: new Date().toISOString(),
        userId,
        version: '1.0',
        dataTypes: []
      }
    };

    try {
      // Export user profile
      if (options.includeProfile) {
        const profile = await UserService.getUserProfile(userId);
        if (profile) {
          exportData.profile = profile;
          exportData.metadata.dataTypes.push('profile');
        }
      }

      // Export collections
      if (options.includeCollections) {
        const collections = await UserService.getUserCollections(userId);
        exportData.collections = collections;
        exportData.metadata.dataTypes.push('collections');
      }

      // Export preferences (stored as part of profile, but can be extracted)
      if (options.includePreferences && exportData.profile) {
        exportData.preferences = {
          userPreferences: exportData.profile.preferences,
          gdprConsent: exportData.profile.gdprConsent
        };
        exportData.metadata.dataTypes.push('preferences');
      }

      // Export analytics data (limited to user-specific data)
      if (options.includeAnalytics) {
        const analytics = await this.getUserAnalytics(userId);
        exportData.analytics = analytics;
        exportData.metadata.dataTypes.push('analytics');
      }

      // Export audit logs (user's own actions only)
      if (options.includeAuditLogs) {
        const auditLogs = await this.getUserAuditLogs(userId);
        exportData.auditLogs = auditLogs;
        exportData.metadata.dataTypes.push('auditLogs');
      }

      return exportData;
    } catch (error) {
      console.error('Error generating user data export:', error);
      throw error;
    }
  }

  // ============================================================================
  // Data Deletion Operations
  // ============================================================================

  static async requestDataDeletion(
    userId: string,
    reason?: string,
    retainAnalytics: boolean = false,
    userIpAddress?: string
  ): Promise<{ requestId: string; confirmationCode: string }> {
    try {
      const requestId = await UserService.requestDataDeletion(
        userId,
        reason,
        retainAnalytics,
        userIpAddress
      );

      // Get confirmation code from the request
      const deletionRef = doc(db, 'gdpr', 'deletion-requests', requestId);
      const confirmationCode = Math.random().toString(36).substring(2, 15);

      // In a real application:
      // 1. Send confirmation email to user
      // 2. Wait for confirmation or 30-day period
      // 3. Process deletion via background job

      return { requestId, confirmationCode };
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      throw new Error('Failed to process data deletion request');
    }
  }

  static async processDataDeletion(
    userId: string,
    confirmationCode: string,
    retainAnalytics: boolean = false
  ): Promise<void> {
    try {
      // Verify confirmation code
      const deletionRequests = await getDocs(
        query(
          collection(db, 'gdpr', 'deletion-requests'),
          where('userId', '==', userId),
          where('confirmationCode', '==', confirmationCode),
          where('status', '==', 'pending')
        )
      );

      if (deletionRequests.empty) {
        throw new Error('Invalid confirmation code or request not found');
      }

      // Log the deletion process start
      await auditLogger.logUserAction(userId, 'data_deletion', {
        action: 'deletion_started',
        retainAnalytics
      });

      // Delete user data
      await this.deleteAllUserData(userId, retainAnalytics);

      // Update deletion request status
      const batch = writeBatch(db);
      deletionRequests.forEach(docSnapshot => {
        batch.update(docSnapshot.ref, {
          status: 'completed',
          completedAt: serverTimestamp()
        });
      });
      await batch.commit();

      console.log(`Data deletion completed for user: ${userId}`);
    } catch (error) {
      console.error('Error processing data deletion:', error);
      throw error;
    }
  }

  private static async deleteAllUserData(
    userId: string,
    retainAnalytics: boolean
  ): Promise<void> {
    const batch = writeBatch(db);

    try {
      // Delete user profile and subcollections
      await UserService.deleteUserCompletely(userId);

      // Delete GDPR requests (they've been processed)
      const exportRequests = await getDocs(
        query(collection(db, 'gdpr', 'data-exports'), where('userId', '==', userId))
      );
      exportRequests.forEach(doc => batch.delete(doc.ref));

      const deletionRequests = await getDocs(
        query(collection(db, 'gdpr', 'deletion-requests'), where('userId', '==', userId))
      );
      deletionRequests.forEach(doc => batch.delete(doc.ref));

      // Delete analytics data if not retaining
      if (!retainAnalytics) {
        // Note: In production, you might want to anonymize rather than delete
        // analytics data for business intelligence purposes
        const analyticsQuery = query(
          collection(db, 'analytics', 'audit-logs'),
          where('userId', '==', userId)
        );
        const analyticsSnapshot = await getDocs(analyticsQuery);
        analyticsSnapshot.forEach(doc => batch.delete(doc.ref));
      }

      await batch.commit();
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private static async getUserAnalytics(userId: string): Promise<any[]> {
    try {
      // This would query analytics data specific to the user
      // Implementation depends on your analytics schema
      const analyticsQuery = query(
        collection(db, 'analytics', 'user-metrics'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(analyticsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return [];
    }
  }

  private static async getUserAuditLogs(userId: string): Promise<any[]> {
    try {
      const auditQuery = query(
        collection(db, 'analytics', 'audit-logs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(auditQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Remove sensitive information from audit logs export
        ipAddress: '***.***.***.**',
        userAgent: '[User Agent Removed for Privacy]'
      }));
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      return [];
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  static formatDataAsCSV(data: UserDataExport): string {
    // Simple CSV formatter - in production, use a proper CSV library
    let csv = 'Data Type,Field,Value\n';
    
    Object.entries(data).forEach(([dataType, value]) => {
      if (dataType === 'metadata') return;
      
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          Object.entries(item).forEach(([field, fieldValue]) => {
            csv += `${dataType}[${index}],${field},"${String(fieldValue).replace(/"/g, '""')}"\n`;
          });
        });
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([field, fieldValue]) => {
          csv += `${dataType},${field},"${String(fieldValue).replace(/"/g, '""')}"\n`;
        });
      }
    });
    
    return csv;
  }

  static validateGDPRCompliance(userData: UserProfile): {
    compliant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check GDPR consent
    if (!userData.gdprConsent || !userData.gdprConsent.given) {
      issues.push('GDPR consent not properly recorded');
    }

    if (!userData.gdprConsent?.timestamp) {
      issues.push('GDPR consent timestamp missing');
    }

    if (!userData.gdprConsent?.version) {
      issues.push('Privacy policy version not recorded');
    }

    // Check data minimization
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      issues.push('Invalid email format stored');
    }

    return {
      compliant: issues.length === 0,
      issues
    };
  }
}

export default GDPRDataService;