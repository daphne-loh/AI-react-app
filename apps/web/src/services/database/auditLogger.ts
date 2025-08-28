import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuditLog, AuditLogValidation } from '@fooddrop/shared';
import { DataValidator } from './validation';

export class AuditLogger {
  private static readonly COLLECTION_NAME = 'analytics';
  private static readonly SUBCOLLECTION_NAME = 'audit-logs';

  static async logUserAction(
    userId: string,
    action: AuditLog['action'],
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      // Don't log in development mode unless explicitly enabled
      if (process.env.NODE_ENV === 'development' && 
          process.env.VITE_ENABLE_AUDIT_LOGGING !== 'true') {
        console.log('Audit log (dev mode):', { userId, action, details });
        return;
      }

      const logEntry: Omit<AuditLog, 'id'> = {
        userId,
        action,
        timestamp: Timestamp.now(),
        details: {
          ...details,
          userAgent: userAgent || this.getUserAgent(),
          url: window?.location?.href || 'unknown',
          timestamp: new Date().toISOString()
        },
        ipAddress,
        sessionId: sessionId || this.getSessionId()
      };

      // Validate the audit log entry
      DataValidator.validateAndThrow(logEntry, AuditLogValidation);

      // Create audit log document
      const auditRef = doc(collection(db, this.COLLECTION_NAME, this.SUBCOLLECTION_NAME));
      await setDoc(auditRef, {
        ...logEntry,
        id: auditRef.id,
        timestamp: serverTimestamp() // Use server timestamp for consistency
      });

    } catch (error) {
      // Audit logging should not break the application
      console.error('Failed to create audit log:', error);
      
      // In production, you might want to send this to an error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to error tracking service
        // errorTracker.captureException(error, { extra: { userId, action, details } });
      }
    }
  }

  static async logSecurityEvent(
    userId: string | null,
    event: 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_token',
    details: Record<string, any> = {},
    ipAddress?: string
  ): Promise<void> {
    await this.logUserAction(
      userId || 'anonymous',
      'login', // Map to closest existing action
      {
        ...details,
        securityEvent: event,
        severity: this.getEventSeverity(event)
      },
      ipAddress
    );
  }

  static async logPerformanceMetric(
    operation: string,
    duration: number,
    userId?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance metric:', { operation, duration, userId });
        return;
      }

      const perfRef = doc(collection(db, 'analytics', 'performance-metrics'));
      await setDoc(perfRef, {
        id: perfRef.id,
        operation,
        duration,
        timestamp: serverTimestamp(),
        userId,
        ...additionalData
      });

    } catch (error) {
      console.error('Failed to log performance metric:', error);
    }
  }

  static async logDataAccess(
    userId: string,
    dataType: 'user_profile' | 'user_collections' | 'food_items',
    operation: 'read' | 'write' | 'delete',
    resourceId?: string
  ): Promise<void> {
    await this.logUserAction(
      userId,
      'profile_update', // Map to closest existing action
      {
        dataAccess: {
          dataType,
          operation,
          resourceId
        }
      }
    );
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private static getUserAgent(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return 'unknown';
  }

  private static getSessionId(): string {
    // Try to get session ID from sessionStorage or generate one
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let sessionId = sessionStorage.getItem('audit_session_id');
      if (!sessionId) {
        sessionId = this.generateSessionId();
        sessionStorage.setItem('audit_session_id', sessionId);
      }
      return sessionId;
    }
    return this.generateSessionId();
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private static getEventSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (event) {
      case 'failed_login':
        return 'medium';
      case 'suspicious_activity':
        return 'high';
      case 'rate_limit_exceeded':
        return 'high';
      case 'invalid_token':
        return 'critical';
      default:
        return 'low';
    }
  }

  // ============================================================================
  // Batch Operations
  // ============================================================================

  static async logMultipleActions(
    logs: Array<{
      userId: string;
      action: AuditLog['action'];
      details?: Record<string, any>;
      ipAddress?: string;
    }>
  ): Promise<void> {
    // For high-volume logging, batch the operations
    const promises = logs.map(log => 
      this.logUserAction(log.userId, log.action, log.details, log.ipAddress)
    );

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Failed to log multiple actions:', error);
    }
  }

  // ============================================================================
  // Development and Testing Helpers
  // ============================================================================

  static setTestMode(enabled: boolean): void {
    if (process.env.NODE_ENV === 'development') {
      (window as any).__AUDIT_TEST_MODE__ = enabled;
    }
  }

  static async flush(): Promise<void> {
    // In a real implementation, this might flush any pending logs
    // For now, it's just a placeholder for testing
    console.log('Audit logger flush requested');
  }
}

// Export singleton instance
export const auditLogger = AuditLogger;

// Export helper functions for specific logging scenarios
export const logUserRegistration = (
  userId: string, 
  email: string, 
  gdprConsentVersion: string,
  ipAddress?: string
) => auditLogger.logUserAction(
  userId, 
  'register', 
  { email, gdprConsentVersion }, 
  ipAddress
);

export const logUserLogin = (
  userId: string, 
  loginMethod: 'email' | 'social',
  ipAddress?: string
) => auditLogger.logUserAction(
  userId, 
  'login', 
  { loginMethod }, 
  ipAddress
);

export const logUserLogout = (
  userId: string,
  sessionDuration?: number,
  ipAddress?: string
) => auditLogger.logUserAction(
  userId, 
  'logout', 
  { sessionDuration }, 
  ipAddress
);

export const logDataExportRequest = (
  userId: string,
  exportType: string,
  ipAddress?: string
) => auditLogger.logUserAction(
  userId, 
  'data_export', 
  { exportType }, 
  ipAddress
);

export const logDataDeletionRequest = (
  userId: string,
  reason?: string,
  ipAddress?: string
) => auditLogger.logUserAction(
  userId, 
  'data_deletion', 
  { reason }, 
  ipAddress
);

// Export the logUserAction function for direct use
export const logUserAction = AuditLogger.logUserAction.bind(AuditLogger);