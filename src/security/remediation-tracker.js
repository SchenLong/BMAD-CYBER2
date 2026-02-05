/**
 * Remediation Tracker Module
 * Tracks security findings and links them to evidence automatically
 *
 * Compliance:
 * - PCI-DSS 6.2: Security patch remediation tracking
 * - SOC 2 CC7.3: Security incident tracking
 * - ISO 27001 A.16.1.6: Learning from security incidents
 * - NIST SI-2: Flaw remediation
 *
 * @module remediation-tracker
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const TRACKER_STORE_PATH = process.env.REMEDIATION_STORE_PATH || './data/remediation';

/**
 * Remediation Status
 */
export const RemediationStatus = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    REMEDIATED: 'REMEDIATED',
    VERIFIED: 'VERIFIED',
    CLOSED: 'CLOSED',
    WONT_FIX: 'WONT_FIX',
    RISK_ACCEPTED: 'RISK_ACCEPTED'
};

/**
 * Finding Severity
 */
export const FindingSeverity = {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    INFO: 'INFO'
};

/**
 * Finding Category
 */
export const FindingCategory = {
    VULNERABILITY: 'VULNERABILITY',
    CONFIGURATION: 'CONFIGURATION',
    COMPLIANCE: 'COMPLIANCE',
    CODE_QUALITY: 'CODE_QUALITY',
    ACCESS_CONTROL: 'ACCESS_CONTROL',
    DATA_PROTECTION: 'DATA_PROTECTION',
    INFRASTRUCTURE: 'INFRASTRUCTURE',
    PROCESS: 'PROCESS'
};

/**
 * Finding class - Represents a security finding
 */
export class Finding {
    constructor(data) {
        this.id = data.id || crypto.randomUUID();
        this.title = data.title;
        this.description = data.description;
        this.severity = data.severity || FindingSeverity.MEDIUM;
        this.category = data.category || FindingCategory.VULNERABILITY;
        this.status = data.status || RemediationStatus.OPEN;

        this.source = data.source || 'manual'; // scan, audit, pentest, manual
        this.sourceReference = data.sourceReference; // External reference ID

        this.affectedAssets = data.affectedAssets || [];
        this.cweId = data.cweId; // Common Weakness Enumeration
        this.cveId = data.cveId; // Common Vulnerabilities and Exposures

        this.linkedEvidence = data.linkedEvidence || [];
        this.remediationSteps = data.remediationSteps || [];
        this.timeline = data.timeline || [];

        this.assignedTo = data.assignedTo;
        this.dueDate = data.dueDate;
        this.slaHours = data.slaHours || this._defaultSLA();

        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.closedAt = data.closedAt;
    }

    /**
     * Get default SLA based on severity
     * @private
     */
    _defaultSLA() {
        const slaMap = {
            [FindingSeverity.CRITICAL]: 24,    // 24 hours
            [FindingSeverity.HIGH]: 72,        // 3 days
            [FindingSeverity.MEDIUM]: 336,     // 14 days
            [FindingSeverity.LOW]: 720,        // 30 days
            [FindingSeverity.INFO]: 0          // No SLA
        };
        return slaMap[this.severity] || 336;
    }

    /**
     * Check if SLA is breached
     */
    isSLABreached() {
        if (this.slaHours === 0) return false;
        if (this.status === RemediationStatus.CLOSED || this.status === RemediationStatus.VERIFIED) {
            return false;
        }

        const created = new Date(this.createdAt);
        const deadline = new Date(created.getTime() + this.slaHours * 60 * 60 * 1000);
        return new Date() > deadline;
    }

    /**
     * Get SLA status
     */
    getSLAStatus() {
        if (this.slaHours === 0) return { status: 'N/A', hoursRemaining: null };

        const created = new Date(this.createdAt);
        const deadline = new Date(created.getTime() + this.slaHours * 60 * 60 * 1000);
        const now = new Date();
        const hoursRemaining = Math.round((deadline - now) / (1000 * 60 * 60));

        if (this.status === RemediationStatus.CLOSED || this.status === RemediationStatus.VERIFIED) {
            const closed = new Date(this.closedAt || this.updatedAt);
            const metSLA = closed <= deadline;
            return {
                status: metSLA ? 'MET' : 'BREACHED',
                hoursRemaining: 0,
                resolvedWithin: Math.round((closed - created) / (1000 * 60 * 60))
            };
        }

        return {
            status: hoursRemaining > 0 ? 'ON_TRACK' : 'BREACHED',
            hoursRemaining,
            deadline: deadline.toISOString()
        };
    }

    /**
     * Convert to plain object
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            severity: this.severity,
            category: this.category,
            status: this.status,
            source: this.source,
            sourceReference: this.sourceReference,
            affectedAssets: this.affectedAssets,
            cweId: this.cweId,
            cveId: this.cveId,
            linkedEvidence: this.linkedEvidence,
            remediationSteps: this.remediationSteps,
            timeline: this.timeline,
            assignedTo: this.assignedTo,
            dueDate: this.dueDate,
            slaHours: this.slaHours,
            slaStatus: this.getSLAStatus(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            closedAt: this.closedAt
        };
    }
}

/**
 * Remediation Tracker - Main tracking class
 */
export class RemediationTracker {
    constructor(storagePath = TRACKER_STORE_PATH) {
        this.storagePath = storagePath;
        this.findings = new Map();
        this._load();
    }

    /**
     * Load findings from storage
     * @private
     */
    _load() {
        const findingsPath = path.join(this.storagePath, 'findings.json');
        if (fs.existsSync(findingsPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(findingsPath, 'utf8'));
                for (const [id, findingData] of Object.entries(data.findings || {})) {
                    this.findings.set(id, new Finding(findingData));
                }
            } catch (err) {
                console.warn(`Could not load findings: ${err.message}`);
            }
        }
    }

    /**
     * Save findings to storage
     * @private
     */
    _save() {
        const findingsPath = path.join(this.storagePath, 'findings.json');
        const dir = path.dirname(findingsPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const data = {
            findings: Object.fromEntries(
                Array.from(this.findings.entries()).map(([id, f]) => [id, f.toJSON()])
            ),
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(findingsPath, JSON.stringify(data, null, 2));
    }

    /**
     * Add timeline event to finding
     * @private
     */
    _addTimelineEvent(finding, action, details, userId) {
        finding.timeline.push({
            timestamp: new Date().toISOString(),
            action,
            details,
            userId
        });
        finding.updatedAt = new Date().toISOString();
    }

    /**
     * Create new finding
     * @param {Object} findingData - Finding data
     * @returns {Finding} Created finding
     */
    createFinding(findingData) {
        const finding = new Finding(findingData);

        this._addTimelineEvent(finding, 'CREATED', {
            severity: finding.severity,
            category: finding.category
        }, findingData.createdBy);

        this.findings.set(finding.id, finding);
        this._save();

        return finding;
    }

    /**
     * Get finding by ID
     * @param {string} findingId - Finding ID
     * @returns {Finding} Finding
     */
    getFinding(findingId) {
        const finding = this.findings.get(findingId);
        if (!finding) {
            throw new Error(`Finding not found: ${findingId}`);
        }
        return finding;
    }

    /**
     * Link evidence to finding
     * @param {string} findingId - Finding ID
     * @param {string} evidenceId - Evidence ID/path
     * @param {Object} linkDetails - Link details
     * @returns {Object} Link result
     */
    linkEvidence(findingId, evidenceId, linkDetails = {}) {
        const finding = this.getFinding(findingId);

        const link = {
            evidenceId,
            linkedAt: new Date().toISOString(),
            linkedBy: linkDetails.linkedBy,
            linkType: linkDetails.linkType || 'supporting', // supporting, remediation, verification
            notes: linkDetails.notes,
            hash: linkDetails.hash
        };

        // Check for duplicate
        const existing = finding.linkedEvidence.find(e => e.evidenceId === evidenceId);
        if (existing) {
            throw new Error(`Evidence already linked: ${evidenceId}`);
        }

        finding.linkedEvidence.push(link);
        this._addTimelineEvent(finding, 'EVIDENCE_LINKED', {
            evidenceId,
            linkType: link.linkType
        }, linkDetails.linkedBy);

        this._save();

        return link;
    }

    /**
     * Update finding status
     * @param {string} findingId - Finding ID
     * @param {string} status - New status
     * @param {Object} details - Status change details
     * @returns {Finding} Updated finding
     */
    updateStatus(findingId, status, details = {}) {
        const finding = this.getFinding(findingId);
        const oldStatus = finding.status;

        finding.status = status;

        if (status === RemediationStatus.CLOSED || status === RemediationStatus.VERIFIED) {
            finding.closedAt = new Date().toISOString();
        }

        this._addTimelineEvent(finding, 'STATUS_CHANGED', {
            from: oldStatus,
            to: status,
            reason: details.reason
        }, details.changedBy);

        this._save();

        return finding;
    }

    /**
     * Add remediation step
     * @param {string} findingId - Finding ID
     * @param {Object} step - Remediation step
     * @returns {Object} Added step
     */
    addRemediationStep(findingId, step) {
        const finding = this.getFinding(findingId);

        const remediationStep = {
            id: crypto.randomUUID(),
            description: step.description,
            assignedTo: step.assignedTo,
            status: step.status || 'pending', // pending, in_progress, completed
            createdAt: new Date().toISOString(),
            completedAt: null,
            notes: step.notes
        };

        finding.remediationSteps.push(remediationStep);
        this._addTimelineEvent(finding, 'STEP_ADDED', {
            stepId: remediationStep.id,
            description: step.description
        }, step.addedBy);

        this._save();

        return remediationStep;
    }

    /**
     * Complete remediation step
     * @param {string} findingId - Finding ID
     * @param {string} stepId - Step ID
     * @param {Object} completion - Completion details
     */
    completeRemediationStep(findingId, stepId, completion = {}) {
        const finding = this.getFinding(findingId);
        const step = finding.remediationSteps.find(s => s.id === stepId);

        if (!step) {
            throw new Error(`Step not found: ${stepId}`);
        }

        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        step.completionNotes = completion.notes;

        this._addTimelineEvent(finding, 'STEP_COMPLETED', {
            stepId,
            notes: completion.notes
        }, completion.completedBy);

        // Check if all steps completed - auto-update status
        const allComplete = finding.remediationSteps.every(s => s.status === 'completed');
        if (allComplete && finding.status === RemediationStatus.IN_PROGRESS) {
            finding.status = RemediationStatus.REMEDIATED;
            this._addTimelineEvent(finding, 'STATUS_CHANGED', {
                from: RemediationStatus.IN_PROGRESS,
                to: RemediationStatus.REMEDIATED,
                reason: 'All remediation steps completed'
            }, 'system');
        }

        this._save();

        return step;
    }

    /**
     * Get remediation history for finding
     * @param {string} findingId - Finding ID
     * @returns {Array} Timeline events
     */
    getRemediationHistory(findingId) {
        const finding = this.getFinding(findingId);
        return finding.timeline;
    }

    /**
     * Auto-link evidence by file hash
     * @param {string} findingId - Finding ID
     * @param {string} manifestPath - Path to evidence manifest
     * @param {string} targetHash - Hash to search for
     * @returns {Array} Linked evidence
     */
    autoLinkByHash(findingId, manifestPath, targetHash) {
        const finding = this.getFinding(findingId);
        const linked = [];

        if (!fs.existsSync(manifestPath)) {
            return linked;
        }

        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

            for (const [filePath, fileData] of Object.entries(manifest.files || {})) {
                if (fileData.hash === targetHash) {
                    const link = this.linkEvidence(finding.id, filePath, {
                        linkType: 'supporting',
                        hash: targetHash,
                        linkedBy: 'auto-link-hash',
                        notes: `Auto-linked by hash match from ${manifestPath}`
                    });
                    linked.push(link);
                }
            }
        } catch (err) {
            console.warn(`Could not auto-link from manifest: ${err.message}`);
        }

        return linked;
    }

    /**
     * Auto-link evidence by timestamp correlation
     * @param {string} findingId - Finding ID
     * @param {Object} timeRange - Time range { start, end }
     * @param {string} evidenceDir - Directory to search
     * @returns {Array} Linked evidence
     */
    autoLinkByTimestamp(findingId, timeRange, evidenceDir) {
        const finding = this.getFinding(findingId);
        const linked = [];

        if (!fs.existsSync(evidenceDir)) {
            return linked;
        }

        const start = new Date(timeRange.start);
        const end = new Date(timeRange.end);

        const scanDir = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    scanDir(fullPath);
                } else if (entry.isFile()) {
                    const stats = fs.statSync(fullPath);
                    const mtime = new Date(stats.mtime);

                    if (mtime >= start && mtime <= end) {
                        try {
                            const link = this.linkEvidence(finding.id, fullPath, {
                                linkType: 'supporting',
                                linkedBy: 'auto-link-timestamp',
                                notes: `Auto-linked by timestamp correlation (${mtime.toISOString()})`
                            });
                            linked.push(link);
                        } catch (err) {
                            // Skip if already linked
                        }
                    }
                }
            }
        };

        scanDir(evidenceDir);
        return linked;
    }

    /**
     * Get all findings by status
     * @param {string} status - Status to filter by
     * @returns {Array} Findings
     */
    getByStatus(status) {
        return Array.from(this.findings.values())
            .filter(f => f.status === status);
    }

    /**
     * Get all findings by severity
     * @param {string} severity - Severity to filter by
     * @returns {Array} Findings
     */
    getBySeverity(severity) {
        return Array.from(this.findings.values())
            .filter(f => f.severity === severity);
    }

    /**
     * Get findings with breached SLA
     * @returns {Array} SLA-breached findings
     */
    getSLABreached() {
        return Array.from(this.findings.values())
            .filter(f => f.isSLABreached());
    }

    /**
     * Generate remediation report
     * @param {Object} options - Report options
     * @returns {Object} Remediation report
     */
    generateRemediationReport(options = {}) {
        const { findingIds, includeEvidence = true, includeSLA = true } = options;

        let findings = Array.from(this.findings.values());
        if (findingIds && findingIds.length > 0) {
            findings = findings.filter(f => findingIds.includes(f.id));
        }

        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalFindings: findings.length,
                byStatus: {},
                bySeverity: {},
                slaBreached: 0,
                averageRemediationTime: null
            },
            findings: [],
            compliance: {
                'PCI-DSS-6.2': true,
                'SOC2-CC7.3': true,
                'ISO27001-A.16.1.6': true
            }
        };

        // Calculate summaries
        let totalRemediationHours = 0;
        let closedCount = 0;

        for (const finding of findings) {
            // Status counts
            report.summary.byStatus[finding.status] =
                (report.summary.byStatus[finding.status] || 0) + 1;

            // Severity counts
            report.summary.bySeverity[finding.severity] =
                (report.summary.bySeverity[finding.severity] || 0) + 1;

            // SLA tracking
            if (finding.isSLABreached()) {
                report.summary.slaBreached++;
            }

            // Remediation time tracking
            if (finding.closedAt) {
                const created = new Date(finding.createdAt);
                const closed = new Date(finding.closedAt);
                totalRemediationHours += (closed - created) / (1000 * 60 * 60);
                closedCount++;
            }

            // Add to report
            const reportFinding = {
                id: finding.id,
                title: finding.title,
                severity: finding.severity,
                status: finding.status,
                category: finding.category,
                createdAt: finding.createdAt,
                closedAt: finding.closedAt
            };

            if (includeSLA) {
                reportFinding.slaStatus = finding.getSLAStatus();
            }

            if (includeEvidence) {
                reportFinding.linkedEvidence = finding.linkedEvidence.length;
                reportFinding.remediationSteps = finding.remediationSteps.length;
            }

            report.findings.push(reportFinding);
        }

        // Calculate average remediation time
        if (closedCount > 0) {
            report.summary.averageRemediationTime =
                `${(totalRemediationHours / closedCount).toFixed(1)} hours`;
        }

        // Compliance checks
        report.compliance['PCI-DSS-6.2'] = report.summary.slaBreached === 0;
        report.compliance['SOC2-CC7.3'] = findings.every(f =>
            f.linkedEvidence.length > 0 || f.status === RemediationStatus.OPEN
        );

        return report;
    }
}

/**
 * Create remediation tracker instance
 */
export function createRemediationTracker(storagePath) {
    return new RemediationTracker(storagePath);
}

export default {
    RemediationTracker,
    Finding,
    RemediationStatus,
    FindingSeverity,
    FindingCategory,
    createRemediationTracker
};
