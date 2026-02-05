/**
 * GDPR Compliance Module
 * Implements data subject rights and PII scanning for validation evidence
 *
 * Compliance:
 * - GDPR Article 15: Right of access
 * - GDPR Article 17: Right to erasure (right to be forgotten)
 * - GDPR Article 20: Right to data portability
 * - GDPR Article 30: Records of processing activities
 *
 * @module gdpr-compliance
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DSR_STORE_PATH = process.env.DSR_STORE_PATH || './data/dsr';
const DSR_DEADLINE_DAYS = 30; // GDPR requires response within 30 days

/**
 * PII Pattern Definitions
 */
const PII_PATTERNS = {
    email: {
        pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        description: 'Email address',
        gdprCategory: 'personal_data'
    },
    phone: {
        pattern: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        description: 'Phone number',
        gdprCategory: 'personal_data'
    },
    ssn: {
        pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
        description: 'Social Security Number',
        gdprCategory: 'special_category'
    },
    creditCard: {
        pattern: /\b(?:\d{4}[-.\s]?){3}\d{4}\b/g,
        description: 'Credit card number',
        gdprCategory: 'financial_data'
    },
    ipv4: {
        pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        description: 'IPv4 address',
        gdprCategory: 'online_identifier'
    },
    ipv6: {
        pattern: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
        description: 'IPv6 address',
        gdprCategory: 'online_identifier'
    },
    dateOfBirth: {
        pattern: /\b(?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12]\d|3[01])[-/](?:19|20)\d{2}\b/g,
        description: 'Date of birth',
        gdprCategory: 'personal_data'
    },
    passport: {
        pattern: /\b[A-Z]{1,2}\d{6,9}\b/g,
        description: 'Passport number',
        gdprCategory: 'personal_data'
    }
};

/**
 * DSR Request Types
 */
export const DSRType = {
    ACCESS: 'ACCESS',           // Article 15
    ERASURE: 'ERASURE',         // Article 17
    PORTABILITY: 'PORTABILITY', // Article 20
    RECTIFICATION: 'RECTIFICATION', // Article 16
    RESTRICTION: 'RESTRICTION', // Article 18
    OBJECTION: 'OBJECTION'      // Article 21
};

/**
 * DSR Status
 */
export const DSRStatus = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
    EXTENDED: 'EXTENDED'
};

/**
 * PII Scanner - Detects PII in content
 */
export class PIIScanner {
    constructor(customPatterns = {}) {
        this.patterns = { ...PII_PATTERNS, ...customPatterns };
    }

    /**
     * Scan content for PII
     * @param {string} content - Content to scan
     * @returns {Object} Scan results with found PII
     */
    scan(content) {
        const results = {
            hasPII: false,
            totalMatches: 0,
            findings: [],
            categories: new Set()
        };

        for (const [type, config] of Object.entries(this.patterns)) {
            const matches = content.match(config.pattern) || [];

            if (matches.length > 0) {
                results.hasPII = true;
                results.totalMatches += matches.length;
                results.categories.add(config.gdprCategory);

                results.findings.push({
                    type,
                    description: config.description,
                    gdprCategory: config.gdprCategory,
                    count: matches.length,
                    // Store redacted samples (not actual values)
                    samples: matches.slice(0, 3).map(m => this._redactMatch(m, type))
                });
            }
        }

        results.categories = Array.from(results.categories);
        return results;
    }

    /**
     * Scan file for PII
     * @param {string} filePath - Path to file
     * @returns {Object} Scan results
     */
    scanFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const results = this.scan(content);
        results.filePath = filePath;
        results.fileSize = fs.statSync(filePath).size;

        return results;
    }

    /**
     * Scan directory for PII
     * @param {string} dirPath - Path to directory
     * @param {Object} options - Scan options
     * @returns {Object} Aggregated scan results
     */
    scanDirectory(dirPath, options = {}) {
        const { extensions = ['.txt', '.log', '.json', '.md', '.csv'], recursive = true } = options;

        const results = {
            dirPath,
            scannedFiles: 0,
            filesWithPII: 0,
            totalMatches: 0,
            fileResults: []
        };

        const scanDir = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory() && recursive) {
                    scanDir(fullPath);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (extensions.includes(ext)) {
                        try {
                            const fileResult = this.scanFile(fullPath);
                            results.scannedFiles++;

                            if (fileResult.hasPII) {
                                results.filesWithPII++;
                                results.totalMatches += fileResult.totalMatches;
                                results.fileResults.push(fileResult);
                            }
                        } catch (err) {
                            // Skip files that can't be read
                        }
                    }
                }
            }
        };

        scanDir(dirPath);
        return results;
    }

    /**
     * Redact match for safe logging
     * @private
     */
    _redactMatch(match, type) {
        switch (type) {
            case 'email':
                const [local, domain] = match.split('@');
                return `${local.charAt(0)}***@${domain}`;
            case 'phone':
                return match.replace(/\d(?=\d{4})/g, '*');
            case 'ssn':
                return '***-**-' + match.slice(-4);
            case 'creditCard':
                return '**** **** **** ' + match.slice(-4);
            case 'ipv4':
            case 'ipv6':
                return match.split('.').map((o, i) => i < 2 ? '***' : o).join('.');
            default:
                return match.slice(0, 2) + '*'.repeat(match.length - 4) + match.slice(-2);
        }
    }

    /**
     * Redact all PII in content
     * @param {string} content - Content to redact
     * @returns {Object} Redacted content and summary
     */
    redact(content) {
        let redactedContent = content;
        const redactions = [];

        for (const [type, config] of Object.entries(this.patterns)) {
            const matches = content.match(config.pattern) || [];

            for (const match of matches) {
                const redacted = this._redactMatch(match, type);
                redactedContent = redactedContent.replace(match, `[REDACTED-${type.toUpperCase()}]`);
                redactions.push({ type, original: redacted, replacement: `[REDACTED-${type.toUpperCase()}]` });
            }
        }

        return {
            redactedContent,
            redactionCount: redactions.length,
            redactions
        };
    }
}

/**
 * Data Subject Request Handler
 */
export class DataSubjectRequestHandler {
    constructor(storagePath = DSR_STORE_PATH) {
        this.storagePath = storagePath;
        this.requests = new Map();
        this._load();
    }

    /**
     * Load existing requests from storage
     * @private
     */
    _load() {
        const requestsPath = path.join(this.storagePath, 'requests.json');
        if (fs.existsSync(requestsPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(requestsPath, 'utf8'));
                this.requests = new Map(Object.entries(data.requests || {}));
            } catch (err) {
                console.warn(`Could not load DSR requests: ${err.message}`);
            }
        }
    }

    /**
     * Save requests to storage
     * @private
     */
    _save() {
        const requestsPath = path.join(this.storagePath, 'requests.json');
        const dir = path.dirname(requestsPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const data = {
            requests: Object.fromEntries(this.requests),
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(requestsPath, JSON.stringify(data, null, 2));
    }

    /**
     * Log DSR activity for audit trail
     * @private
     */
    _logActivity(requestId, action, details) {
        const activity = {
            requestId,
            action,
            timestamp: new Date().toISOString(),
            details
        };

        const logPath = path.join(this.storagePath, 'activity-log.jsonl');
        fs.appendFileSync(logPath, JSON.stringify(activity) + '\n');

        return activity;
    }

    /**
     * Create access request (GDPR Article 15)
     */
    createAccessRequest(subjectDetails) {
        const { subjectId, email, name, verificationMethod } = subjectDetails;

        const request = {
            requestId: crypto.randomUUID(),
            type: DSRType.ACCESS,
            gdprArticle: '15',
            status: DSRStatus.PENDING,
            subjectId,
            subjectEmail: email,
            subjectName: name,
            verificationMethod,
            verificationStatus: 'PENDING',
            createdAt: new Date().toISOString(),
            deadline: this._calculateDeadline(),
            dataInventory: null,
            responseProvided: false
        };

        this.requests.set(request.requestId, request);
        this._save();
        this._logActivity(request.requestId, 'CREATED', { type: DSRType.ACCESS });

        return request;
    }

    /**
     * Create erasure request (GDPR Article 17)
     */
    createErasureRequest(subjectDetails) {
        const { subjectId, email, reason, scope } = subjectDetails;

        const request = {
            requestId: crypto.randomUUID(),
            type: DSRType.ERASURE,
            gdprArticle: '17',
            status: DSRStatus.PENDING,
            subjectId,
            subjectEmail: email,
            reason,
            scope: scope || 'ALL', // ALL or specific categories
            createdAt: new Date().toISOString(),
            deadline: this._calculateDeadline(),
            exemptionApplied: false,
            exemptionReason: null,
            erasureComplete: false
        };

        this.requests.set(request.requestId, request);
        this._save();
        this._logActivity(request.requestId, 'CREATED', { type: DSRType.ERASURE });

        return request;
    }

    /**
     * Create portability request (GDPR Article 20)
     */
    createPortabilityRequest(subjectDetails) {
        const { subjectId, email, format, deliveryMethod } = subjectDetails;

        const request = {
            requestId: crypto.randomUUID(),
            type: DSRType.PORTABILITY,
            gdprArticle: '20',
            status: DSRStatus.PENDING,
            subjectId,
            subjectEmail: email,
            format: format || 'JSON', // JSON, CSV, XML
            deliveryMethod: deliveryMethod || 'DOWNLOAD', // DOWNLOAD, EMAIL, TRANSFER
            createdAt: new Date().toISOString(),
            deadline: this._calculateDeadline(),
            exportGenerated: false,
            exportPath: null
        };

        this.requests.set(request.requestId, request);
        this._save();
        this._logActivity(request.requestId, 'CREATED', { type: DSRType.PORTABILITY });

        return request;
    }

    /**
     * Calculate deadline (30 days from now)
     * @private
     */
    _calculateDeadline() {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + DSR_DEADLINE_DAYS);
        return deadline.toISOString();
    }

    /**
     * Process DSR request
     * @param {string} requestId - Request ID to process
     * @returns {Object} Processing result
     */
    async processRequest(requestId) {
        const request = this.requests.get(requestId);
        if (!request) {
            throw new Error(`Request not found: ${requestId}`);
        }

        request.status = DSRStatus.IN_PROGRESS;
        request.processingStartedAt = new Date().toISOString();
        this._save();
        this._logActivity(requestId, 'PROCESSING_STARTED', {});

        let result;

        switch (request.type) {
            case DSRType.ACCESS:
                result = await this._processAccessRequest(request);
                break;
            case DSRType.ERASURE:
                result = await this._processErasureRequest(request);
                break;
            case DSRType.PORTABILITY:
                result = await this._processPortabilityRequest(request);
                break;
            default:
                throw new Error(`Unsupported request type: ${request.type}`);
        }

        request.status = DSRStatus.COMPLETED;
        request.completedAt = new Date().toISOString();
        request.result = result;
        this._save();
        this._logActivity(requestId, 'COMPLETED', result);

        return result;
    }

    /**
     * Process access request
     * @private
     */
    async _processAccessRequest(request) {
        // In production, this would query all data stores
        const inventory = {
            subjectId: request.subjectId,
            dataCategories: [],
            processingPurposes: [],
            recipients: [],
            retentionPeriods: {},
            rights: [
                'Right to erasure (Article 17)',
                'Right to restriction (Article 18)',
                'Right to data portability (Article 20)',
                'Right to object (Article 21)'
            ]
        };

        request.dataInventory = inventory;
        return { success: true, inventory };
    }

    /**
     * Process erasure request
     * @private
     */
    async _processErasureRequest(request) {
        // Check for exemptions
        const exemptions = this._checkErasureExemptions(request);

        if (exemptions.hasExemption) {
            request.exemptionApplied = true;
            request.exemptionReason = exemptions.reason;
            return {
                success: false,
                exemptionApplied: true,
                reason: exemptions.reason,
                gdprBasis: exemptions.gdprBasis
            };
        }

        // Perform erasure (placeholder - integrate with data stores)
        request.erasureComplete = true;
        return {
            success: true,
            erasedCategories: request.scope === 'ALL' ? ['all'] : [request.scope],
            erasedAt: new Date().toISOString()
        };
    }

    /**
     * Process portability request
     * @private
     */
    async _processPortabilityRequest(request) {
        // Generate export (placeholder - integrate with data stores)
        const exportData = {
            subjectId: request.subjectId,
            exportedAt: new Date().toISOString(),
            format: request.format,
            data: {}
        };

        const exportPath = path.join(
            this.storagePath,
            'exports',
            `${request.requestId}.${request.format.toLowerCase()}`
        );

        const exportDir = path.dirname(exportPath);
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
        request.exportGenerated = true;
        request.exportPath = exportPath;

        return {
            success: true,
            format: request.format,
            exportPath
        };
    }

    /**
     * Check erasure exemptions
     * @private
     */
    _checkErasureExemptions(request) {
        // GDPR Article 17(3) exemptions
        const exemptionReasons = {
            'freedom_expression': 'Processing necessary for freedom of expression',
            'legal_obligation': 'Processing necessary for legal obligation',
            'public_interest': 'Processing necessary for public interest',
            'legal_claims': 'Processing necessary for legal claims',
            'archiving': 'Processing for archiving in public interest'
        };

        // In production, check against actual data usage
        return { hasExemption: false, reason: null, gdprBasis: null };
    }

    /**
     * Get request status
     * @param {string} requestId - Request ID
     * @returns {Object} Request status
     */
    getRequestStatus(requestId) {
        const request = this.requests.get(requestId);
        if (!request) {
            throw new Error(`Request not found: ${requestId}`);
        }

        const now = new Date();
        const deadline = new Date(request.deadline);
        const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        return {
            requestId: request.requestId,
            type: request.type,
            status: request.status,
            createdAt: request.createdAt,
            deadline: request.deadline,
            daysRemaining: Math.max(0, daysRemaining),
            overdue: now > deadline && request.status !== DSRStatus.COMPLETED
        };
    }

    /**
     * Get all requests for a subject
     * @param {string} subjectId - Subject identifier
     * @returns {Array} Requests for subject
     */
    getSubjectRequests(subjectId) {
        return Array.from(this.requests.values())
            .filter(r => r.subjectId === subjectId);
    }

    /**
     * Get overdue requests
     * @returns {Array} Overdue requests
     */
    getOverdueRequests() {
        const now = new Date();
        return Array.from(this.requests.values())
            .filter(r =>
                r.status !== DSRStatus.COMPLETED &&
                r.status !== DSRStatus.REJECTED &&
                new Date(r.deadline) < now
            );
    }

    /**
     * Generate DSR compliance report
     */
    generateComplianceReport() {
        const requests = Array.from(this.requests.values());

        return {
            generatedAt: new Date().toISOString(),
            totalRequests: requests.length,
            byType: {
                [DSRType.ACCESS]: requests.filter(r => r.type === DSRType.ACCESS).length,
                [DSRType.ERASURE]: requests.filter(r => r.type === DSRType.ERASURE).length,
                [DSRType.PORTABILITY]: requests.filter(r => r.type === DSRType.PORTABILITY).length
            },
            byStatus: {
                [DSRStatus.PENDING]: requests.filter(r => r.status === DSRStatus.PENDING).length,
                [DSRStatus.IN_PROGRESS]: requests.filter(r => r.status === DSRStatus.IN_PROGRESS).length,
                [DSRStatus.COMPLETED]: requests.filter(r => r.status === DSRStatus.COMPLETED).length
            },
            overdueCount: this.getOverdueRequests().length,
            averageProcessingTime: this._calculateAverageProcessingTime(requests),
            complianceRate: this._calculateComplianceRate(requests)
        };
    }

    /**
     * Calculate average processing time
     * @private
     */
    _calculateAverageProcessingTime(requests) {
        const completed = requests.filter(r => r.completedAt);
        if (completed.length === 0) return null;

        const totalDays = completed.reduce((sum, r) => {
            const start = new Date(r.createdAt);
            const end = new Date(r.completedAt);
            return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0);

        return (totalDays / completed.length).toFixed(1);
    }

    /**
     * Calculate compliance rate (completed within deadline)
     * @private
     */
    _calculateComplianceRate(requests) {
        const completed = requests.filter(r => r.completedAt);
        if (completed.length === 0) return 100;

        const onTime = completed.filter(r =>
            new Date(r.completedAt) <= new Date(r.deadline)
        ).length;

        return ((onTime / completed.length) * 100).toFixed(1);
    }
}

/**
 * Create PII scanner instance
 */
export function createPIIScanner(customPatterns) {
    return new PIIScanner(customPatterns);
}

/**
 * Create DSR handler instance
 */
export function createDSRHandler(storagePath) {
    return new DataSubjectRequestHandler(storagePath);
}

export default {
    PIIScanner,
    DataSubjectRequestHandler,
    DSRType,
    DSRStatus,
    PII_PATTERNS,
    createPIIScanner,
    createDSRHandler
};
