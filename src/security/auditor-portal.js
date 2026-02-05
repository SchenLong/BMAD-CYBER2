/**
 * Auditor Portal Module
 * Provides secure access for external auditors to validation evidence
 *
 * Compliance:
 * - SOC 2 CC4.2: Independent assessor access
 * - ISO 27001 A.18.2.1: Independent security review access
 * - NIST AU-11: Audit record retention compliance
 * - PCI-DSS 12.10.5: Forensic analysis availability
 * - GDPR Article 58: Supervisory authority access
 *
 * @module auditor-portal
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SESSION_STORE_PATH = process.env.AUDITOR_SESSION_PATH || './data/auditor-sessions';
const EVIDENCE_BASE_PATH = process.env.EVIDENCE_BASE_PATH || './docs/ValidationLog';
const SESSION_EXPIRY_HOURS = 72; // 3 days default

/**
 * Auditor Session Manager
 */
export class AuditorSession {
    constructor(storagePath = SESSION_STORE_PATH) {
        this.storagePath = storagePath;
        this.sessions = new Map();
        this._load();
    }

    /**
     * Load sessions from storage
     * @private
     */
    _load() {
        const sessionsPath = path.join(this.storagePath, 'sessions.json');
        if (fs.existsSync(sessionsPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
                this.sessions = new Map(Object.entries(data.sessions || {}));

                // Clean expired sessions
                this._cleanExpired();
            } catch (err) {
                console.warn(`Could not load auditor sessions: ${err.message}`);
            }
        }
    }

    /**
     * Save sessions to storage
     * @private
     */
    _save() {
        const sessionsPath = path.join(this.storagePath, 'sessions.json');
        const dir = path.dirname(sessionsPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const data = {
            sessions: Object.fromEntries(this.sessions),
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(sessionsPath, JSON.stringify(data, null, 2));
    }

    /**
     * Clean expired sessions
     * @private
     */
    _cleanExpired() {
        const now = new Date();
        for (const [id, session] of this.sessions.entries()) {
            if (new Date(session.expiresAt) < now) {
                this.sessions.delete(id);
            }
        }
        this._save();
    }

    /**
     * Log access for audit trail
     * @private
     */
    _logAccess(sessionId, action, details) {
        const logPath = path.join(this.storagePath, 'access-log.jsonl');
        const entry = {
            timestamp: new Date().toISOString(),
            sessionId,
            action,
            details
        };

        try {
            const logDir = path.dirname(logPath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
        } catch (err) {
            console.error(`Failed to log auditor access: ${err.message}`);
        }
    }

    /**
     * Create new auditor session
     * @param {string} auditorId - Auditor identifier
     * @param {Object} scope - Access scope definition
     * @param {Date} expiresAt - Session expiration
     * @returns {Object} Session with token
     */
    createSession(auditorId, scope, expiresAt = null) {
        const sessionId = crypto.randomUUID();
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Default expiration
        if (!expiresAt) {
            expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);
        }

        const session = {
            sessionId,
            auditorId,
            tokenHash, // Store hash, not token
            scope: {
                evidenceTypes: scope.evidenceTypes || ['all'],
                dateRange: scope.dateRange || null,
                categories: scope.categories || ['all'],
                readOnly: true,
                exportAllowed: scope.exportAllowed !== false
            },
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
            lastAccessedAt: null,
            accessCount: 0,
            status: 'ACTIVE'
        };

        this.sessions.set(sessionId, session);
        this._save();
        this._logAccess(sessionId, 'SESSION_CREATED', { auditorId, scope: session.scope });

        return {
            sessionId,
            token, // Return actual token only once
            expiresAt: session.expiresAt,
            scope: session.scope
        };
    }

    /**
     * Validate session token
     * @param {string} token - Session token
     * @returns {Object} Validation result with session
     */
    validateSession(token) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.tokenHash === tokenHash) {
                // Check expiration
                if (new Date(session.expiresAt) < new Date()) {
                    return {
                        valid: false,
                        error: 'SESSION_EXPIRED',
                        sessionId
                    };
                }

                // Check status
                if (session.status !== 'ACTIVE') {
                    return {
                        valid: false,
                        error: 'SESSION_REVOKED',
                        sessionId
                    };
                }

                // Update access tracking
                session.lastAccessedAt = new Date().toISOString();
                session.accessCount++;
                this._save();

                return {
                    valid: true,
                    session: {
                        sessionId,
                        auditorId: session.auditorId,
                        scope: session.scope,
                        expiresAt: session.expiresAt
                    }
                };
            }
        }

        return {
            valid: false,
            error: 'INVALID_TOKEN'
        };
    }

    /**
     * Revoke session
     * @param {string} sessionId - Session to revoke
     * @param {string} revokedBy - Who revoked
     * @param {string} reason - Revocation reason
     */
    revokeSession(sessionId, revokedBy, reason) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        session.status = 'REVOKED';
        session.revokedAt = new Date().toISOString();
        session.revokedBy = revokedBy;
        session.revocationReason = reason;

        this._save();
        this._logAccess(sessionId, 'SESSION_REVOKED', { revokedBy, reason });

        return session;
    }

    /**
     * Get session by ID
     * @param {string} sessionId - Session ID
     * @returns {Object} Session details
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    /**
     * List all active sessions
     * @returns {Array} Active sessions
     */
    listActiveSessions() {
        this._cleanExpired();
        return Array.from(this.sessions.values())
            .filter(s => s.status === 'ACTIVE');
    }
}

/**
 * Auditor Access Manager - Evidence access control
 */
export class AuditorAccessManager {
    constructor(sessionManager, evidencePath = EVIDENCE_BASE_PATH) {
        this.sessionManager = sessionManager;
        this.evidencePath = evidencePath;
    }

    /**
     * Grant access to auditor
     * @param {string} auditorId - Auditor identifier
     * @param {Object} evidenceScope - What evidence to grant access to
     * @param {Object} options - Access options
     * @returns {Object} Access grant with session
     */
    grantAccess(auditorId, evidenceScope, options = {}) {
        const { expiresInHours = SESSION_EXPIRY_HOURS, notes } = options;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);

        const session = this.sessionManager.createSession(auditorId, evidenceScope, expiresAt);

        return {
            auditorId,
            ...session,
            accessNotes: notes,
            instructions: this._generateAccessInstructions(session)
        };
    }

    /**
     * Generate access instructions for auditor
     * @private
     */
    _generateAccessInstructions(session) {
        return {
            endpoint: '/api/v1/auditor/evidence',
            authentication: 'Bearer token in Authorization header',
            scope: session.scope,
            expiresAt: session.expiresAt,
            capabilities: [
                'List accessible evidence',
                'Download individual evidence files',
                'Download audit package (ZIP)',
                'View integrity manifests'
            ],
            restrictions: [
                'Read-only access',
                'Access logged for compliance',
                'Download limits may apply'
            ]
        };
    }

    /**
     * List evidence accessible to auditor
     * @param {string} token - Session token
     * @returns {Array} Accessible evidence files
     */
    listAccessibleEvidence(token) {
        const validation = this.sessionManager.validateSession(token);
        if (!validation.valid) {
            throw new Error(`Access denied: ${validation.error}`);
        }

        const { scope } = validation.session;
        const evidence = [];

        // Scan evidence directory
        this._scanEvidence(this.evidencePath, evidence, scope);

        this.sessionManager._logAccess(
            validation.session.sessionId,
            'LIST_EVIDENCE',
            { count: evidence.length }
        );

        return evidence;
    }

    /**
     * Scan evidence directory for accessible files
     * @private
     */
    _scanEvidence(dir, evidence, scope, relativePath = '') {
        if (!fs.existsSync(dir)) {
            return;
        }

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.join(relativePath, entry.name);

            if (entry.isDirectory()) {
                this._scanEvidence(fullPath, evidence, scope, relPath);
            } else if (entry.isFile()) {
                // Check if file is within scope
                if (this._isInScope(relPath, scope)) {
                    const stats = fs.statSync(fullPath);
                    evidence.push({
                        path: relPath,
                        name: entry.name,
                        size: stats.size,
                        modified: stats.mtime.toISOString(),
                        type: this._getEvidenceType(entry.name)
                    });
                }
            }
        }
    }

    /**
     * Check if file is within auditor's scope
     * @private
     */
    _isInScope(filePath, scope) {
        // Check categories
        if (scope.categories && !scope.categories.includes('all')) {
            const category = this._getCategoryFromPath(filePath);
            if (!scope.categories.includes(category)) {
                return false;
            }
        }

        // Check evidence types
        if (scope.evidenceTypes && !scope.evidenceTypes.includes('all')) {
            const type = this._getEvidenceType(filePath);
            if (!scope.evidenceTypes.includes(type)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get evidence type from filename
     * @private
     */
    _getEvidenceType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const typeMap = {
            '.json': 'data',
            '.md': 'documentation',
            '.log': 'log',
            '.txt': 'text',
            '.png': 'screenshot',
            '.jpg': 'screenshot',
            '.pdf': 'report'
        };
        return typeMap[ext] || 'other';
    }

    /**
     * Get category from path
     * @private
     */
    _getCategoryFromPath(filePath) {
        const parts = filePath.split(path.sep);
        return parts[0] || 'general';
    }

    /**
     * Download evidence file
     * @param {string} token - Session token
     * @param {string} evidencePath - Relative path to evidence
     * @returns {Object} File content and metadata
     */
    downloadEvidence(token, evidencePath) {
        const validation = this.sessionManager.validateSession(token);
        if (!validation.valid) {
            throw new Error(`Access denied: ${validation.error}`);
        }

        const { scope } = validation.session;

        // Verify file is in scope
        if (!this._isInScope(evidencePath, scope)) {
            throw new Error('Evidence not in authorized scope');
        }

        const fullPath = path.join(this.evidencePath, evidencePath);

        // Prevent directory traversal
        const resolvedPath = path.resolve(fullPath);
        const resolvedBase = path.resolve(this.evidencePath);
        if (!resolvedPath.startsWith(resolvedBase)) {
            throw new Error('Invalid evidence path');
        }

        if (!fs.existsSync(fullPath)) {
            throw new Error('Evidence not found');
        }

        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath);

        this.sessionManager._logAccess(
            validation.session.sessionId,
            'DOWNLOAD_EVIDENCE',
            { path: evidencePath, size: stats.size }
        );

        return {
            path: evidencePath,
            content,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            hash: crypto.createHash('sha256').update(content).digest('hex')
        };
    }

    /**
     * Generate complete audit package
     * @param {string} token - Session token
     * @param {Object} options - Package options
     * @returns {Object} Package path and manifest
     */
    async generateAuditPackage(token, options = {}) {
        const validation = this.sessionManager.validateSession(token);
        if (!validation.valid) {
            throw new Error(`Access denied: ${validation.error}`);
        }

        const { includeManifests = true } = options;

        // Get all accessible evidence
        const evidence = this.listAccessibleEvidence(token);

        // Create package directory
        const packageId = crypto.randomUUID();
        const packageDir = path.join(this.sessionManager.storagePath, 'packages', packageId);
        fs.mkdirSync(packageDir, { recursive: true });

        // Copy evidence files
        const manifest = {
            packageId,
            generatedAt: new Date().toISOString(),
            generatedFor: validation.session.auditorId,
            scope: validation.session.scope,
            files: []
        };

        for (const file of evidence) {
            const sourcePath = path.join(this.evidencePath, file.path);
            const destPath = path.join(packageDir, 'evidence', file.path);

            const destDir = path.dirname(destPath);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            fs.copyFileSync(sourcePath, destPath);

            const content = fs.readFileSync(sourcePath);
            manifest.files.push({
                path: file.path,
                size: file.size,
                hash: crypto.createHash('sha256').update(content).digest('hex')
            });
        }

        // Include manifests if requested
        if (includeManifests) {
            const manifestPath = path.join(packageDir, 'manifest.json');
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

            // Add verification instructions
            const instructionsPath = path.join(packageDir, 'VERIFICATION.md');
            fs.writeFileSync(instructionsPath, this._generateVerificationInstructions(manifest));
        }

        this.sessionManager._logAccess(
            validation.session.sessionId,
            'GENERATE_PACKAGE',
            { packageId, fileCount: evidence.length }
        );

        return {
            packageId,
            packagePath: packageDir,
            manifest,
            instructions: 'See VERIFICATION.md for integrity verification instructions'
        };
    }

    /**
     * Generate verification instructions
     * @private
     */
    _generateVerificationInstructions(manifest) {
        return `# Evidence Package Verification Instructions

## Package Information
- Package ID: ${manifest.packageId}
- Generated: ${manifest.generatedAt}
- Generated For: ${manifest.generatedFor}
- Total Files: ${manifest.files.length}

## Verification Steps

### 1. Verify File Integrity
Each file's SHA256 hash is listed in manifest.json. Verify using:

\`\`\`bash
# Linux/macOS
sha256sum evidence/<filename>

# Windows
certutil -hashfile evidence\\<filename> SHA256
\`\`\`

### 2. Verify Manifest Integrity
The manifest.json contains hashes for all evidence files.

### 3. Chain of Custody
All access to this package has been logged for audit purposes.

## File Listing
${manifest.files.map(f => `- ${f.path} (${f.size} bytes) - SHA256: ${f.hash}`).join('\n')}

## Compliance
This package complies with:
- SOC 2 CC4.2
- ISO 27001 A.18.2.1
- NIST AU-11
- PCI-DSS 12.10.5
`;
    }
}

/**
 * Evidence Exporter - Export utilities
 */
export class EvidenceExporter {
    /**
     * Export evidence to ZIP
     * @param {Array} evidenceFiles - Files to include
     * @param {string} outputPath - Output ZIP path
     */
    async exportToZip(evidenceFiles, outputPath) {
        // Note: In production, use archiver or similar package
        // This is a simplified implementation
        const manifest = {
            exportedAt: new Date().toISOString(),
            files: evidenceFiles.map(f => ({
                path: f.path,
                hash: f.hash
            }))
        };

        // For now, just create manifest file
        const manifestPath = outputPath.replace('.zip', '-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

        return {
            outputPath,
            manifestPath,
            fileCount: evidenceFiles.length
        };
    }
}

/**
 * Create session manager instance
 */
export function createSessionManager(storagePath) {
    return new AuditorSession(storagePath);
}

/**
 * Create access manager instance
 */
export function createAccessManager(sessionManager, evidencePath) {
    return new AuditorAccessManager(sessionManager, evidencePath);
}

export default {
    AuditorSession,
    AuditorAccessManager,
    EvidenceExporter,
    createSessionManager,
    createAccessManager
};
