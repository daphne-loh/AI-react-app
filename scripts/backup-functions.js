/**
 * Firebase Cloud Functions for Database Backup Operations
 * 
 * These functions handle automated backups, monitoring, and recovery operations.
 * Deploy with: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { CloudSchedulerClient } = require('@google-cloud/scheduler');

admin.initializeApp();

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'fooddrop-production';
const BACKUP_BUCKET = `${PROJECT_ID}-backups`;

/**
 * Scheduled function to create daily Firestore backups
 */
exports.createDailyBackup = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .pubsub.schedule('0 2 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const backupId = `daily-${timestamp}`;
    
    try {
      console.log(`Starting daily backup: ${backupId}`);
      
      // Create Firestore backup
      const client = admin.firestore();
      const backup = await client.backup({
        databaseId: '(default)',
        collectionIds: [
          'users',
          'food-items', 
          'content-packs',
          'analytics',
          'gdpr'
        ],
        outputUriPrefix: `gs://${BACKUP_BUCKET}/firestore/${backupId}`
      });

      console.log(`Backup created successfully: ${backup.name}`);

      // Log backup metadata
      await admin.firestore()
        .collection('system')
        .doc('backups')
        .collection('records')
        .doc(backupId)
        .set({
          backupId,
          name: backup.name,
          state: 'RUNNING',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          type: 'daily',
          collections: ['users', 'food-items', 'content-packs', 'analytics', 'gdpr']
        });

      // Send success notification
      await sendBackupNotification('SUCCESS', `Daily backup started: ${backupId}`);

      return { success: true, backupId, name: backup.name };
    } catch (error) {
      console.error('Daily backup failed:', error);
      await sendBackupNotification('ERROR', `Daily backup failed: ${error.message}`);
      throw error;
    }
  });

/**
 * Weekly backup with extended retention
 */
exports.createWeeklyBackup = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .pubsub.schedule('0 3 * * 0')
  .timeZone('UTC')
  .onRun(async (context) => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const backupId = `weekly-${timestamp}`;
    
    try {
      console.log(`Starting weekly backup: ${backupId}`);
      
      const client = admin.firestore();
      const backup = await client.backup({
        databaseId: '(default)',
        outputUriPrefix: `gs://${BACKUP_BUCKET}/firestore/${backupId}`
      });

      await admin.firestore()
        .collection('system')
        .doc('backups')
        .collection('records')
        .doc(backupId)
        .set({
          backupId,
          name: backup.name,
          state: 'RUNNING',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          type: 'weekly',
          retentionWeeks: 12
        });

      await sendBackupNotification('SUCCESS', `Weekly backup started: ${backupId}`);
      return { success: true, backupId, name: backup.name };
    } catch (error) {
      console.error('Weekly backup failed:', error);
      await sendBackupNotification('ERROR', `Weekly backup failed: ${error.message}`);
      throw error;
    }
  });

/**
 * Monitor backup status and update records
 */
exports.monitorBackupStatus = functions
  .runWith({ timeoutSeconds: 300 })
  .pubsub.schedule('*/15 * * * *')
  .onRun(async (context) => {
    try {
      const backupRecords = await admin.firestore()
        .collection('system')
        .doc('backups')
        .collection('records')
        .where('state', '==', 'RUNNING')
        .get();

      if (backupRecords.empty) {
        console.log('No running backups to monitor');
        return;
      }

      const client = admin.firestore();
      const batch = admin.firestore().batch();

      for (const doc of backupRecords.docs) {
        const record = doc.data();
        try {
          // Check backup status
          const backup = await client.backup(record.name).get();
          const backupData = backup.data();

          if (backupData.state === 'READY') {
            // Backup completed successfully
            batch.update(doc.ref, {
              state: 'READY',
              completedAt: admin.firestore.FieldValue.serverTimestamp(),
              sizeBytes: backupData.sizeBytes || 0,
              durationMinutes: Math.round((Date.now() - record.createdAt.toDate().getTime()) / 60000)
            });

            console.log(`Backup completed: ${record.backupId}`);
            await sendBackupNotification('SUCCESS', 
              `Backup completed: ${record.backupId} (${formatBytes(backupData.sizeBytes || 0)})`
            );

          } else if (backupData.state === 'FAILED') {
            // Backup failed
            batch.update(doc.ref, {
              state: 'FAILED',
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
              errorMessage: backupData.errorMessage || 'Unknown error'
            });

            console.error(`Backup failed: ${record.backupId}`, backupData.errorMessage);
            await sendBackupNotification('ERROR', 
              `Backup failed: ${record.backupId} - ${backupData.errorMessage || 'Unknown error'}`
            );
          }
        } catch (error) {
          console.error(`Error monitoring backup ${record.backupId}:`, error);
        }
      }

      await batch.commit();
      console.log(`Monitored ${backupRecords.size} backup(s)`);
    } catch (error) {
      console.error('Backup monitoring failed:', error);
    }
  });

/**
 * Clean up old backups based on retention policy
 */
exports.cleanupOldBackups = functions
  .runWith({ timeoutSeconds: 540 })
  .pubsub.schedule('0 4 1 * *')
  .onRun(async (context) => {
    try {
      console.log('Starting backup cleanup...');

      const now = new Date();
      const dailyRetentionDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days
      const weeklyRetentionDate = new Date(now.getTime() - (12 * 7 * 24 * 60 * 60 * 1000)); // 12 weeks

      // Get backup records to clean up
      const dailyBackupsToDelete = await admin.firestore()
        .collection('system')
        .doc('backups')
        .collection('records')
        .where('type', '==', 'daily')
        .where('createdAt', '<', dailyRetentionDate)
        .get();

      const weeklyBackupsToDelete = await admin.firestore()
        .collection('system')
        .doc('backups')
        .collection('records')
        .where('type', '==', 'weekly')
        .where('createdAt', '<', weeklyRetentionDate)
        .get();

      const client = admin.firestore();
      const batch = admin.firestore().batch();
      let deletedCount = 0;

      // Delete old daily backups
      for (const doc of dailyBackupsToDelete.docs) {
        const record = doc.data();
        try {
          if (record.name) {
            await client.backup(record.name).delete();
            console.log(`Deleted daily backup: ${record.backupId}`);
          }
          batch.delete(doc.ref);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete backup ${record.backupId}:`, error);
        }
      }

      // Delete old weekly backups
      for (const doc of weeklyBackupsToDelete.docs) {
        const record = doc.data();
        try {
          if (record.name) {
            await client.backup(record.name).delete();
            console.log(`Deleted weekly backup: ${record.backupId}`);
          }
          batch.delete(doc.ref);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete backup ${record.backupId}:`, error);
        }
      }

      await batch.commit();
      
      console.log(`Cleanup completed. Deleted ${deletedCount} backup(s)`);
      await sendBackupNotification('INFO', `Backup cleanup completed. Deleted ${deletedCount} old backup(s)`);

      return { success: true, deletedCount };
    } catch (error) {
      console.error('Backup cleanup failed:', error);
      await sendBackupNotification('ERROR', `Backup cleanup failed: ${error.message}`);
      throw error;
    }
  });

/**
 * Generate backup usage report
 */
exports.generateBackupReport = functions
  .runWith({ timeoutSeconds: 300 })
  .pubsub.schedule('0 6 * * 0')
  .onRun(async (context) => {
    try {
      console.log('Generating backup report...');

      const backupRecords = await admin.firestore()
        .collection('system')
        .doc('backups')
        .collection('records')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();

      const report = {
        generatedAt: new Date().toISOString(),
        totalBackups: backupRecords.size,
        backupsByType: {},
        totalSizeBytes: 0,
        avgSizeBytes: 0,
        successRate: 0,
        recentBackups: []
      };

      let successCount = 0;

      backupRecords.docs.forEach(doc => {
        const backup = doc.data();
        
        // Count by type
        report.backupsByType[backup.type] = (report.backupsByType[backup.type] || 0) + 1;
        
        // Calculate total size
        if (backup.sizeBytes) {
          report.totalSizeBytes += backup.sizeBytes;
        }
        
        // Count successes
        if (backup.state === 'READY') {
          successCount++;
        }
        
        // Add to recent backups (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (backup.createdAt && backup.createdAt.toDate() > weekAgo) {
          report.recentBackups.push({
            backupId: backup.backupId,
            type: backup.type,
            state: backup.state,
            sizeBytes: backup.sizeBytes || 0,
            createdAt: backup.createdAt.toDate().toISOString()
          });
        }
      });

      report.avgSizeBytes = report.totalSizeBytes / Math.max(backupRecords.size, 1);
      report.successRate = (successCount / Math.max(backupRecords.size, 1)) * 100;

      // Store report
      await admin.firestore()
        .collection('system')
        .doc('backups')
        .collection('reports')
        .doc(new Date().toISOString().slice(0, 10))
        .set(report);

      // Send summary notification
      await sendBackupNotification('INFO', 
        `Weekly backup report: ${report.totalBackups} backups, ` +
        `${formatBytes(report.totalSizeBytes)} total, ` +
        `${report.successRate.toFixed(1)}% success rate`
      );

      console.log('Backup report generated:', report);
      return report;
    } catch (error) {
      console.error('Failed to generate backup report:', error);
      throw error;
    }
  });

/**
 * HTTP endpoint for manual backup creation
 */
exports.createManualBackup = functions
  .runWith({ timeoutSeconds: 540 })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be authenticated as admin to create manual backups'
      );
    }

    const { collections, reason } = data;
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '');
    const backupId = `manual-${timestamp}`;

    try {
      console.log(`Creating manual backup: ${backupId}`);

      const client = admin.firestore();
      const backup = await client.backup({
        databaseId: '(default)',
        collectionIds: collections || undefined,
        outputUriPrefix: `gs://${BACKUP_BUCKET}/firestore/${backupId}`
      });

      await admin.firestore()
        .collection('system')
        .doc('backups')
        .collection('records')
        .doc(backupId)
        .set({
          backupId,
          name: backup.name,
          state: 'RUNNING',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          type: 'manual',
          reason: reason || 'Manual backup requested',
          collections: collections || 'all',
          createdBy: context.auth.uid
        });

      await sendBackupNotification('INFO', `Manual backup started: ${backupId} by ${context.auth.token.email}`);

      return { success: true, backupId, name: backup.name };
    } catch (error) {
      console.error('Manual backup failed:', error);
      await sendBackupNotification('ERROR', `Manual backup failed: ${error.message}`);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

// Helper Functions

async function sendBackupNotification(level, message) {
  try {
    // In production, integrate with your notification service
    // (Slack, email, PagerDuty, etc.)
    console.log(`[${level}] ${message}`);
    
    // Store notification in Firestore for dashboard
    await admin.firestore()
      .collection('system')
      .doc('notifications')
      .collection('backup')
      .add({
        level,
        message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Export additional utility functions for local development/testing
if (process.env.NODE_ENV === 'development') {
  exports.testBackupSystem = functions.https.onRequest(async (req, res) => {
    try {
      const result = await exports.createDailyBackup.run();
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}