# Database Backup and Recovery Procedures

## Overview

This document outlines the backup and recovery procedures for FoodDrop's Firestore database and associated services. Our backup strategy ensures data protection, business continuity, and compliance with data retention requirements.

## Backup Strategy

### 1. Automated Firestore Backups

**Schedule:** Daily at 2:00 AM UTC
**Retention:** 30 days for daily backups, 12 weeks for weekly backups, 12 months for monthly backups

```bash
# Firebase CLI backup command (run via Cloud Scheduler)
firebase firestore:databases:backup \
  --project fooddrop-production \
  --database fooddrop-prod \
  --backup-id "daily-$(date +%Y%m%d)" \
  --location us-central1
```

### 2. Cross-Region Replication

- Primary region: `us-central1`
- Secondary region: `europe-west3` (for GDPR compliance)
- Backup region: `asia-southeast1`

### 3. Collection-Specific Backup Priorities

| Collection | Priority | Backup Frequency | Retention |
|-----------|----------|------------------|-----------|
| users | Critical | Daily | 7 years |
| collections (user) | Critical | Daily | 7 years |
| food-items | High | Daily | 2 years |
| analytics/audit-logs | High | Daily | 7 years |
| gdpr/* | Critical | Daily | 10 years |
| content-packs | Medium | Weekly | 1 year |

## Backup Configuration

### Firebase Project Setup

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

### Cloud Scheduler Configuration

```yaml
# backup-scheduler.yaml
name: projects/fooddrop-production/locations/us-central1/jobs/daily-firestore-backup
description: "Daily Firestore backup job"
schedule: "0 2 * * *"
timeZone: "UTC"
httpTarget:
  uri: "https://us-central1-fooddrop-production.cloudfunctions.net/createBackup"
  httpMethod: POST
  headers:
    Content-Type: "application/json"
  body: |
    {
      "collections": ["users", "food-items", "content-packs", "analytics", "gdpr"],
      "backupType": "daily"
    }
```

## Recovery Procedures

### 1. Point-in-Time Recovery

**Recovery Time Objective (RTO):** 4 hours
**Recovery Point Objective (RPO):** 24 hours

```bash
# List available backups
firebase firestore:databases:list-backups \
  --project fooddrop-production \
  --location us-central1

# Restore from backup
firebase firestore:databases:restore \
  --project fooddrop-production \
  --location us-central1 \
  --backup-id "daily-20231215" \
  --destination-database fooddrop-recovery
```

### 2. Partial Data Recovery

For recovering specific collections or documents:

```typescript
// scripts/recover-user-data.ts
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const backupApp = initializeApp({
  projectId: 'fooddrop-backup'
}, 'backup');

const productionApp = initializeApp({
  projectId: 'fooddrop-production'
}, 'production');

async function recoverUserData(userId: string, backupDate: string) {
  const backupDb = getFirestore(backupApp);
  const prodDb = getFirestore(productionApp);

  // Recover user profile
  const userDoc = await backupDb.collection('users').doc(userId).get();
  if (userDoc.exists) {
    await prodDb.collection('users').doc(userId).set(userDoc.data());
  }

  // Recover user collections
  const collectionsSnapshot = await backupDb
    .collection('users')
    .doc(userId)
    .collection('collections')
    .get();

  const batch = prodDb.batch();
  collectionsSnapshot.docs.forEach(doc => {
    const ref = prodDb
      .collection('users')
      .doc(userId)
      .collection('collections')
      .doc(doc.id);
    batch.set(ref, doc.data());
  });

  await batch.commit();
  console.log(`Recovered data for user: ${userId}`);
}
```

### 3. Disaster Recovery

**Scenario:** Complete data center failure

1. **Immediate Response (0-1 hours)**
   - Activate incident response team
   - Switch DNS to maintenance page
   - Notify stakeholders

2. **Assessment (1-2 hours)**
   - Evaluate extent of data loss
   - Identify latest usable backup
   - Estimate recovery time

3. **Recovery Execution (2-6 hours)**
   - Provision new Firebase project in secondary region
   - Restore from latest backup
   - Update application configuration
   - Test critical functionality

4. **Verification (6-8 hours)**
   - Run data integrity checks
   - Test user authentication
   - Verify GDPR compliance features
   - Validate application functionality

```bash
#!/bin/bash
# disaster-recovery.sh

set -e

BACKUP_PROJECT="fooddrop-backup"
NEW_PROJECT="fooddrop-recovery"
BACKUP_DATE=${1:-$(date -d "yesterday" +%Y%m%d)}

echo "Starting disaster recovery for backup: $BACKUP_DATE"

# Create new Firebase project
firebase projects:create $NEW_PROJECT

# Configure Firestore
firebase firestore:databases:create \
  --project $NEW_PROJECT \
  --location us-central1

# Restore from backup
firebase firestore:databases:restore \
  --project $NEW_PROJECT \
  --location us-central1 \
  --backup-id "daily-$BACKUP_DATE"

# Deploy security rules
firebase deploy --only firestore:rules --project $NEW_PROJECT

# Deploy indexes
firebase deploy --only firestore:indexes --project $NEW_PROJECT

echo "Disaster recovery completed. New project: $NEW_PROJECT"
```

## Monitoring and Alerting

### 1. Backup Success Monitoring

```typescript
// functions/backup-monitor.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

export const monitorBackups = onSchedule(
  { schedule: '0 3 * * *', timeZone: 'UTC' },
  async (event) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const backupId = `daily-${yesterday.toISOString().slice(0, 10).replace(/-/g, '')}`;

    try {
      // Check if backup exists
      const backup = await admin.firestore().backup(backupId).get();
      
      if (!backup.exists) {
        logger.error(`Backup missing: ${backupId}`);
        await sendAlert('CRITICAL', `Daily backup missing: ${backupId}`);
        return;
      }

      const backupData = backup.data();
      if (backupData.state !== 'READY') {
        logger.error(`Backup failed: ${backupId}`, { state: backupData.state });
        await sendAlert('HIGH', `Backup failed: ${backupId}`);
        return;
      }

      logger.info(`Backup verified: ${backupId}`);
      await sendAlert('INFO', `Backup completed successfully: ${backupId}`);
    } catch (error) {
      logger.error('Backup monitoring failed', error);
      await sendAlert('CRITICAL', 'Backup monitoring system failure');
    }
  }
);
```

### 2. Storage Usage Monitoring

```typescript
// Monitor backup storage usage
export const monitorStorageUsage = onSchedule(
  { schedule: '0 6 * * 0' }, // Weekly on Sunday
  async (event) => {
    try {
      const backups = await admin.firestore().listBackups();
      const totalSize = backups.reduce((sum, backup) => sum + backup.sizeBytes, 0);
      const totalSizeGB = totalSize / (1024 * 1024 * 1024);

      logger.info(`Total backup storage: ${totalSizeGB.toFixed(2)} GB`);

      // Alert if approaching quota
      if (totalSizeGB > 900) { // Assuming 1TB quota
        await sendAlert('HIGH', `Backup storage usage high: ${totalSizeGB.toFixed(2)} GB`);
      }

      // Clean up old backups if needed
      if (totalSizeGB > 950) {
        await cleanupOldBackups();
      }
    } catch (error) {
      logger.error('Storage monitoring failed', error);
    }
  }
);
```

## Data Integrity Verification

### 1. Automated Integrity Checks

```typescript
// scripts/verify-data-integrity.ts
import { getFirestore } from 'firebase-admin/firestore';

interface IntegrityReport {
  collections: Record<string, {
    documentCount: number;
    sampleChecks: boolean;
    schemaValidation: boolean;
    referentialIntegrity: boolean;
  }>;
  issues: string[];
}

export async function verifyDataIntegrity(): Promise<IntegrityReport> {
  const db = getFirestore();
  const report: IntegrityReport = {
    collections: {},
    issues: []
  };

  // Check users collection
  const usersSnapshot = await db.collection('users').get();
  report.collections.users = {
    documentCount: usersSnapshot.size,
    sampleChecks: await verifyUserDocuments(usersSnapshot.docs.slice(0, 10)),
    schemaValidation: true, // Implement schema validation
    referentialIntegrity: true
  };

  // Check for orphaned collections
  const orphanedCollections = await findOrphanedCollections();
  if (orphanedCollections.length > 0) {
    report.issues.push(`Found ${orphanedCollections.length} orphaned collection documents`);
  }

  // Verify GDPR compliance
  const gdprIssues = await verifyGDPRCompliance();
  report.issues.push(...gdprIssues);

  return report;
}
```

### 2. Recovery Testing

```bash
#!/bin/bash
# test-recovery.sh

BACKUP_DATE=${1:-$(date -d "yesterday" +%Y%m%d)}
TEST_PROJECT="fooddrop-recovery-test"

echo "Testing recovery from backup: $BACKUP_DATE"

# Create test environment
firebase projects:create $TEST_PROJECT --display-name "Recovery Test"

# Restore backup
firebase firestore:databases:restore \
  --project $TEST_PROJECT \
  --backup-id "daily-$BACKUP_DATE"

# Run integrity tests
npm run test:recovery --project $TEST_PROJECT

# Cleanup test environment
firebase projects:delete $TEST_PROJECT --force

echo "Recovery test completed"
```

## Compliance and Retention

### 1. GDPR Compliance

- **User data:** Retained as per user consent and legal requirements
- **Audit logs:** 7 years minimum for compliance
- **Backup encryption:** All backups encrypted at rest and in transit
- **Access controls:** Backup access restricted to authorized personnel only

### 2. Retention Policies

```typescript
// functions/cleanup-old-backups.ts
export const cleanupOldBackups = onSchedule(
  { schedule: '0 4 1 * *' }, // Monthly cleanup
  async (event) => {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12); // Keep 12 months

    try {
      const backups = await admin.firestore().listBackups();
      const oldBackups = backups.filter(backup => 
        backup.createTime < cutoffDate && 
        !backup.name.includes('monthly') // Keep monthly backups longer
      );

      for (const backup of oldBackups) {
        await backup.delete();
        logger.info(`Deleted old backup: ${backup.name}`);
      }

      logger.info(`Cleanup completed. Deleted ${oldBackups.length} backups`);
    } catch (error) {
      logger.error('Backup cleanup failed', error);
      throw error;
    }
  }
);
```

## Emergency Contacts

| Role | Contact | Phone | Email |
|------|---------|-------|-------|
| Database Administrator | John Doe | +1-555-0101 | dba@fooddrop.com |
| DevOps Lead | Jane Smith | +1-555-0102 | devops@fooddrop.com |
| Security Officer | Bob Wilson | +1-555-0103 | security@fooddrop.com |
| On-Call Engineer | Pager | +1-555-0999 | oncall@fooddrop.com |

## Recovery Runbooks

### User Data Recovery Request

1. **Verify Request**
   - Confirm user identity
   - Check if legitimate data loss
   - Document incident number

2. **Assess Scope**
   - Determine what data needs recovery
   - Identify appropriate backup
   - Estimate recovery time

3. **Execute Recovery**
   - Use partial recovery scripts
   - Verify data integrity
   - Test user access

4. **Follow-up**
   - Notify user of completion
   - Document lessons learned
   - Update procedures if needed

### Performance Degradation Response

1. **Immediate Actions**
   - Check backup job status
   - Monitor system resources
   - Scale up if necessary

2. **Investigation**
   - Review recent backups
   - Check for data corruption
   - Analyze query performance

3. **Resolution**
   - Restore from clean backup if needed
   - Optimize queries
   - Update monitoring thresholds

## Testing Schedule

| Test Type | Frequency | Next Due | Owner |
|-----------|-----------|----------|-------|
| Backup Verification | Daily | Automated | System |
| Partial Recovery | Weekly | 2023-12-24 | DBA Team |
| Full Recovery | Monthly | 2024-01-15 | DevOps Team |
| Disaster Recovery | Quarterly | 2024-03-15 | Full Team |
| Compliance Audit | Annually | 2024-08-15 | Security Team |

---

**Document Version:** 1.0  
**Last Updated:** December 2023  
**Next Review:** March 2024