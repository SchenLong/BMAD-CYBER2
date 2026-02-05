/**
 * Retention Policy Module
 * Implements evidence retention periods with secure deletion
 *
 * Compliance:
 * - SOC 2 CC7.4: Retention periods defined for security evidence
 * - PCI-DSS 10.7: Retain audit trail history for at least one year
 * - GDPR Article 5(1)(e): Storage limitation principle
 * - NIST SP 800-88: Secure deletion guidelines
 *
 * @module retention-policy
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const RETENTION_STORE_PATH = process.env.RETENTION_STORE_PATH || './data/retention';
const LEGAL_HOLD_STORE_PATH = process.env.LEGAL_HOLD_STORE_PATH || './data/legal-holds';

/**
 * Retention periods in days
 */
export const RetentionPeriods = {
    SECURITY_INCIDENT: 365 * 7,        // 7 years - legal/regulatory
    COMPLIANCE_AUDIT: 365 * 7,          // 7 years - SOC2, ISO 27001
    VALIDATION_LOGS: 90,                // 90 days rolling - operational
    AUTHENTICATION_LOGS: 365,           // 1 year - security best practices
    CONFIG_SNAPSHOTS: -1,               // Indefinite (version controlled)
    TEST_RESULTS: 365 * 3,              // 3 years
    SCREENSHOTS: 365,                   // 1 year
    APPROVAL_RECORDS: 365 * 7,          // 7 years
    REMEDIATION_EVIDENCE: 365 * 5,      // 5 years
    GENERAL: 365 * 3                    // 3 years default
};

/**
 * Evidence categories with their retention periods
 */
export const EvidenceCategories = {
    'security-finding': RetentionPeriods.SECURITY_INCIDENT,
    'compliance-report': RetentionPeriods.COMPLIANCE_AUDIT,
    'validation-log': RetentionPeriods.VALIDATION_LOGS,
    'auth-log': RetentionPeriods.AUTHENTICATION_LOGS,
    'config-snapshot': RetentionPeriods.CONFIG_SNAPSHOTS,
    'test-result': RetentionPeriods.TEST_RESULTS,
    'screenshot': RetentionPeriods.SCREENSHOTS,
    'approval': RetentionPeriods.APPROVAL_RECORDS,
    'remediation': RetentionPeriods.REMEDIATION_EVIDENCE
};

/**
 * Retention Policy Manager
 */
export class RetentionPolicy {
    constructor(storagePath = RETENTION_STORE_PATH) {
        this.storagePath = storagePath;
        this.legalHolds = new Map();
        this._loadLegalHolds();
    }

    /**
     * Load legal holds from storage
     * @private
     */
    _loadLegalHolds() {
        const holdsPath = path.join(LEGAL_HOLD_STORE_PATH, 'active-holds.json');
        if (fs.existsSync(holdsPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(holdsPath, 'utf8'));
                this.legalHolds = new Map(Object.entries(data.holds || {}));
            } catch (err) {
                console.warn(`Could not load legal holds: ${err.message}`);
            }
        }
    }

    /**
     * Save legal holds to storage
     * @private
     */
    _saveLegalHolds() {
        const holdsPath = path.join(LEGAL_HOLD_STORE_PATH, 'active-holds.json');
        const dir = path.dirname(holdsPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const data = {
            holds: Object.fromEntries(this.legalHolds),
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(holdsPath, JSON.stringify(data, null, 2));
    }

    /**
     * Get retention period for evidence type
     * @param {string} evidenceType - Type/category of evidence
     * @returns {number} Retention period in days (-1 for indefinite)
     */
    getRetentionPeriod(evidenceType) {
        return EvidenceCategories[evidenceType] || RetentionPeriods.GENERAL;
    }

    /**
     * Calculate expiration date for evidence
     * @param {string} evidenceType - Type/category of evidence
     * @param {Date} createdDate - When evidence was created
     * @returns {Date|null} Expiration date (null if indefinite)
     */
    getExpirationDate(evidenceType, createdDate) {
        const retentionDays = this.getRetentionPeriod(evidenceType);

        if (retentionDays === -1) {
            return null; // Indefinite retention
        }

        const expiration = new Date(createdDate);
        expiration.setDate(expiration.getDate() + retentionDays);
        return expiration;
    }

    /**
     * Check if evidence has expired
     * @param {Object} evidenceRecord - Evidence record with type and created date
     * @returns {Object} Expiration status
     */
    isExpired(evidenceRecord) {
        const { evidenceId, type, createdAt } = evidenceRecord;

        // Check for legal hold
        if (this.hasLegalHold(evidenceId)) {
            return {
                expired: false,
                reason: 'LEGAL_HOLD',
                hold: this.legalHolds.get(evidenceId)
            };
        }

        const expirationDate = this.getExpirationDate(type, new Date(createdAt));

        if (expirationDate === null) {
            return {
                expired: false,
                reason: 'INDEFINITE_RETENTION'
            };
        }

        const now = new Date();
        const expired = now > expirationDate;

        return {
            expired,
            expirationDate: expirationDate.toISOString(),
            daysRemaining: expired ? 0 : Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24)),
            daysOverdue: expired ? Math.ceil((now - expirationDate) / (1000 * 60 * 60 * 24)) : 0
        };
    }

    /**
     * Set legal hold on evidence (suspends retention deletion)
     * @param {string} evidenceId - Evidence identifier
     * @param {Object} holdDetails - Hold details
     * @returns {Object} Legal hold record
     */
    setLegalHold(evidenceId, holdDetails) {
        const { holdId, reason, authorizedBy, caseReference } = holdDetails;

        const hold = {
            holdId: holdId || crypto.randomUUID(),
            evidenceId,
            reason,
            authorizedBy,
            caseReference,
            createdAt: new Date().toISOString(),
            status: 'ACTIVE'
        };

        this.legalHolds.set(evidenceId, hold);
        this._saveLegalHolds();

        return hold;
    }

    /**
     * Release legal hold on evidence
     * @param {string} evidenceId - Evidence identifier
     * @param {Object} releaseDetails - Release details
     * @returns {Object} Release confirmation
     */
    releaseLegalHold(evidenceId, releaseDetails) {
        const { authorizedBy, reason } = releaseDetails;

        const hold = this.legalHolds.get(evidenceId);
        if (!hold) {
            throw new Error(`No legal hold found for evidence: ${evidenceId}`);
        }

        hold.status = 'RELEASED';
        hold.releasedAt = new Date().toISOString();
        hold.releasedBy = authorizedBy;
        hold.releaseReason = reason;

        // Archive the released hold
        this._archiveHold(hold);

        // Remove from active holds
        this.legalHolds.delete(evidenceId);
        this._saveLegalHolds();

        return hold;
    }

    /**
     * Archive released legal hold
     * @private
     */
    _archiveHold(hold) {
        const archivePath = path.join(LEGAL_HOLD_STORE_PATH, 'archive', `${hold.holdId}.json`);
        const dir = path.dirname(archivePath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(archivePath, JSON.stringify(hold, null, 2));
    }

    /**
     * Check if evidence has active legal hold
     * @param {string} evidenceId - Evidence identifier
     * @returns {boolean} True if legal hold exists
     */
    hasLegalHold(evidenceId) {
        const hold = this.legalHolds.get(evidenceId);
        return hold && hold.status === 'ACTIVE';
    }

    /**
     * Get all active legal holds
     * @returns {Array} Active legal holds
     */
    getActiveLegalHolds() {
        return Array.from(this.legalHolds.values()).filter(h => h.status === 'ACTIVE');
    }

    /**
     * Secure delete file using NIST SP 800-88 compliant method
     * Overwrites file with random data before deletion
     * @param {string} filePath - Path to file to delete
     * @param {number} passes - Number of overwrite passes (default: 3)
     * @returns {Object} Deletion result with certificate
     */
    secureDelete(filePath, passes = 3) {
        const absolutePath = path.resolve(filePath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`File not found: ${absolutePath}`);
        }

        const stats = fs.statSync(absolutePath);
        const fileSize = stats.size;

        const certificate = {
            filePath: absolutePath,
            fileSize,
            deletionMethod: 'NIST-SP-800-88-CLEAR',
            passes,
            deletedAt: null,
            verificationHash: null
        };

        try {
            // Perform secure overwrite passes
            for (let pass = 0; pass < passes; pass++) {
                const fd = fs.openSync(absolutePath, 'r+');

                // Generate random data for this pass
                const buffer = crypto.randomBytes(Math.min(fileSize, 64 * 1024));

                // Overwrite file content
                let bytesWritten = 0;
                while (bytesWritten < fileSize) {
                    const writeSize = Math.min(buffer.length, fileSize - bytesWritten);
                    fs.writeSync(fd, buffer, 0, writeSize, bytesWritten);
                    bytesWritten += writeSize;
                }

                fs.fsyncSync(fd); // Ensure data is written to disk
                fs.closeSync(fd);
            }

            // Final pass with zeros
            const fd = fs.openSync(absolutePath, 'r+');
            const zeroBuffer = Buffer.alloc(Math.min(fileSize, 64 * 1024), 0);
            let bytesWritten = 0;
            while (bytesWritten < fileSize) {
                const writeSize = Math.min(zeroBuffer.length, fileSize - bytesWritten);
                fs.writeSync(fd, zeroBuffer, 0, writeSize, bytesWritten);
                bytesWritten += writeSize;
            }
            fs.fsyncSync(fd);
            fs.closeSync(fd);

            // Calculate verification hash (should be all zeros)
            const verifyContent = fs.readFileSync(absolutePath);
            certificate.verificationHash = crypto
                .createHash('sha256')
                .update(verifyContent)
                .digest('hex');

            // Delete the file
            fs.unlinkSync(absolutePath);
            certificate.deletedAt = new Date().toISOString();
            certificate.status = 'COMPLETED';

        } catch (err) {
            certificate.status = 'FAILED';
            certificate.error = err.message;
            throw err;
        }

        return certificate;
    }

    /**
     * Run retention cleanup - delete expired evidence
     * @param {Array} evidenceRecords - Array of evidence records to check
     * @param {Object} options - Cleanup options
     * @returns {Object} Cleanup report
     */
    async runRetentionCleanup(evidenceRecords, options = {}) {
        const { dryRun = false, includeArchival = true } = options;

        const report = {
            runAt: new Date().toISOString(),
            dryRun,
            totalRecords: evidenceRecords.length,
            expired: [],
            deleted: [],
            archived: [],
            skipped: [],
            errors: []
        };

        for (const record of evidenceRecords) {
            try {
                const expirationStatus = this.isExpired(record);

                if (!expirationStatus.expired) {
                    if (expirationStatus.reason === 'LEGAL_HOLD') {
                        report.skipped.push({
                            evidenceId: record.evidenceId,
                            reason: 'LEGAL_HOLD',
                            hold: expirationStatus.hold
                        });
                    }
                    continue;
                }

                report.expired.push({
                    evidenceId: record.evidenceId,
                    type: record.type,
                    daysOverdue: expirationStatus.daysOverdue
                });

                if (dryRun) {
                    continue;
                }

                // Archive before deletion if requested
                if (includeArchival && record.filePath) {
                    try {
                        await this._archiveEvidence(record);
                        report.archived.push(record.evidenceId);
                    } catch (err) {
                        report.errors.push({
                            evidenceId: record.evidenceId,
                            stage: 'archive',
                            error: err.message
                        });
                    }
                }

                // Secure delete the file
                if (record.filePath && fs.existsSync(record.filePath)) {
                    try {
                        const certificate = this.secureDelete(record.filePath);
                        report.deleted.push({
                            evidenceId: record.evidenceId,
                            certificate
                        });
                    } catch (err) {
                        report.errors.push({
                            evidenceId: record.evidenceId,
                            stage: 'delete',
                            error: err.message
                        });
                    }
                }

            } catch (err) {
                report.errors.push({
                    evidenceId: record.evidenceId,
                    stage: 'processing',
                    error: err.message
                });
            }
        }

        // Save cleanup report
        this._saveCleanupReport(report);

        return report;
    }

    /**
     * Archive evidence before deletion
     * @private
     */
    async _archiveEvidence(record) {
        const archiveDir = path.join(this.storagePath, 'archive', record.type);
        if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir, { recursive: true });
        }

        const archiveRecord = {
            ...record,
            archivedAt: new Date().toISOString(),
            originalPath: record.filePath
        };

        const archivePath = path.join(archiveDir, `${record.evidenceId}.json`);
        fs.writeFileSync(archivePath, JSON.stringify(archiveRecord, null, 2));
    }

    /**
     * Save cleanup report
     * @private
     */
    _saveCleanupReport(report) {
        const reportsDir = path.join(this.storagePath, 'cleanup-reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const reportPath = path.join(
            reportsDir,
            `cleanup-${new Date().toISOString().split('T')[0]}.json`
        );
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    }

    /**
     * Get retention policy summary
     */
    getRetentionSummary() {
        return {
            categories: Object.entries(EvidenceCategories).map(([category, days]) => ({
                category,
                retentionDays: days,
                retentionYears: days === -1 ? 'Indefinite' : (days / 365).toFixed(1)
            })),
            activeLegalHolds: this.getActiveLegalHolds().length,
            complianceFrameworks: [
                'SOC 2 CC7.4',
                'PCI-DSS 10.7',
                'GDPR Article 5(1)(e)',
                'NIST SP 800-88',
                'ISO 27001 A.18.1.3'
            ]
        };
    }
}

/**
 * Create retention policy instance
 */
export function createRetentionPolicy(storagePath) {
    return new RetentionPolicy(storagePath);
}

export default {
    RetentionPolicy,
    RetentionPeriods,
    EvidenceCategories,
    createRetentionPolicy
};
