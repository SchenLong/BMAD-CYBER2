/**
 * Audit Log Retention Management
 * Story 9.4: Comprehensive Audit Logging
 *
 * Manages retention policies for audit logs according to compliance frameworks.
 */

/**
 * Compliance framework retention requirements (in years)
 */
export const RETENTION_PERIODS = {
  SOC2: 7, // SOC 2 Type II
  ISO27001: 3, // ISO 27001
  HIPAA: 6, // HIPAA (if handling PHI)
  GDPR: 1, // GDPR minimum
  PCI_DSS: 1, // PCI DSS
  DEFAULT: 3, // Default retention period
} as const;

/**
 * Compliance framework type
 */
export type ComplianceFramework = keyof typeof RETENTION_PERIODS;

/**
 * Retention policy configuration
 */
export interface RetentionPolicy {
  framework: ComplianceFramework;
  years: number;
  archiveAfterDays?: number;
  deleteAfterDays?: number;
}

/**
 * Retention statistics
 */
export interface RetentionStats {
  totalEntries: number;
  activeEntries: number;
  archivedEntries: number;
  expiredEntries: number;
  nextArchiveDate?: Date;
  nextDeleteDate?: Date;
}

/**
 * Retention Manager class
 * Handles log archiving and deletion based on retention policies
 */
export class RetentionManager {
  private policy: RetentionPolicy;

  constructor(policy?: RetentionPolicy) {
    this.policy = policy || {
      framework: 'DEFAULT',
      years: RETENTION_PERIODS.DEFAULT,
      archiveAfterDays: 90, // Move to cold storage after 90 days
      deleteAfterDays: undefined, // Calculated from retention period
    };
  }

  /**
   * Calculate if an entry should be archived
   */
  shouldArchive(entryDate: Date): boolean {
    if (!this.policy.archiveAfterDays) return false;

    const archiveThreshold = new Date();
    archiveThreshold.setDate(archiveThreshold.getDate() - this.policy.archiveAfterDays);

    return entryDate < archiveThreshold;
  }

  /**
   * Calculate if an entry should be deleted
   */
  shouldDelete(entryDate: Date): boolean {
    const deleteYears = this.policy.years;
    const deleteThreshold = new Date();
    deleteThreshold.setFullYear(deleteThreshold.getFullYear() - deleteYears);

    return entryDate < deleteThreshold;
  }

  /**
   * Get the retention policy
   */
  getPolicy(): RetentionPolicy {
    return { ...this.policy };
  }

  /**
   * Update the retention policy
   */
  updatePolicy(policy: Partial<RetentionPolicy>): void {
    this.policy = { ...this.policy, ...policy };
  }

  /**
   * Get compliance requirements for a framework
   */
  static getComplianceRequirements(framework: ComplianceFramework): {
    framework: ComplianceFramework;
    retentionYears: number;
    description: string;
    requirements: string[];
  } {
    const requirements = {
      SOC2: {
        framework: 'SOC2' as const,
        retentionYears: RETENTION_PERIODS.SOC2,
        description: 'SOC 2 Type II compliance',
        requirements: [
          'Maintain audit logs for 7 years',
          'Include access logging for all systems',
          'Log all configuration changes',
          'Tamper-evident logging required',
          'Regular log review process',
        ],
      },
      ISO27001: {
        framework: 'ISO27001' as const,
        retentionYears: RETENTION_PERIODS.ISO27001,
        description: 'ISO 27001 Information Security',
        requirements: [
          'Maintain audit logs for 3 years',
          'Record all security events',
          'Log access to sensitive information',
          'Maintain chain of custody for logs',
        ],
      },
      HIPAA: {
        framework: 'HIPAA' as const,
        retentionYears: RETENTION_PERIODS.HIPAA,
        description: 'HIPAA (Health Insurance Portability and Accountability Act)',
        requirements: [
          'Maintain audit logs for 6 years',
          'Log all PHI (Protected Health Information) access',
          'Log all disclosures of PHI',
          'Maintain access controls documentation',
        ],
      },
      GDPR: {
        framework: 'GDPR' as const,
        retentionYears: RETENTION_PERIODS.GDPR,
        description: 'GDPR (General Data Protection Regulation)',
        requirements: [
          'Maintain audit logs for at least 1 year',
          'Document all data processing activities',
          'Log consent management',
          'Maintain records of data subject requests',
        ],
      },
      PCI_DSS: {
        framework: 'PCI_DSS' as const,
        retentionYears: RETENTION_PERIODS.PCI_DSS,
        description: 'PCI DSS (Payment Card Industry Data Security Standard)',
        requirements: [
          'Maintain audit logs for 1 year',
          'Log all access to cardholder data',
          'Log all actions by privileged users',
          'Maintain audit trail history',
        ],
      },
      DEFAULT: {
        framework: 'DEFAULT' as const,
        retentionYears: RETENTION_PERIODS.DEFAULT,
        description: 'Default retention policy',
        requirements: [
          'Maintain audit logs for 3 years',
          'Log all security-relevant events',
          'Implement tamper-evident logging',
        ],
      },
    };

    return requirements[framework];
  }

  /**
   * Calculate next archive date
   */
  getNextArchiveDate(): Date {
    if (!this.policy.archiveAfterDays) return new Date(0);

    const nextArchive = new Date();
    nextArchive.setDate(nextArchive.getDate() - this.policy.archiveAfterDays);
    nextArchive.setHours(0, 0, 0, 0);

    return nextArchive;
  }

  /**
   * Calculate next delete date
   */
  getNextDeleteDate(): Date {
    const nextDelete = new Date();
    nextDelete.setFullYear(nextDelete.getFullYear() - this.policy.years);
    nextDelete.setHours(0, 0, 0, 0);

    return nextDelete;
  }

  /**
   * Calculate retention statistics for a set of entries
   */
  calculateStats(entries: Array<{ timestamp: string }>): RetentionStats {
    const now = Date.now();
    const archiveThreshold = this.policy.archiveAfterDays
      ? now - this.policy.archiveAfterDays * 24 * 60 * 60 * 1000
      : 0;
    const deleteThreshold = now - this.policy.years * 365 * 24 * 60 * 60 * 1000;

    let activeEntries = 0;
    let archivedEntries = 0;
    let expiredEntries = 0;

    entries.forEach(entry => {
      const entryTime = new Date(entry.timestamp).getTime();

      if (entryTime < deleteThreshold) {
        expiredEntries++;
      } else if (this.policy.archiveAfterDays && entryTime < archiveThreshold) {
        archivedEntries++;
      } else {
        activeEntries++;
      }
    });

    return {
      totalEntries: entries.length,
      activeEntries,
      archivedEntries,
      expiredEntries,
      nextArchiveDate: this.getNextArchiveDate(),
      nextDeleteDate: this.getNextDeleteDate(),
    };
  }
}

/**
 * Default retention manager instance
 */
export const retentionManager = new RetentionManager();
