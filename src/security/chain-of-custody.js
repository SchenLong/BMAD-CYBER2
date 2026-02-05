/**
 * Chain of Custody Module
 * Tracks evidence custody throughout its lifecycle with transfer acknowledgment
 *
 * Compliance:
 * - SOC 2 CC7.3: Incident response includes evidence handling
 * - GDPR Article 30: Records of processing activities
 * - ISO 27001 A.16.1.7: Collection of evidence with chain of custody
 * - NIST AU-11: Audit record retention with custody documentation
 *
 * @module chain-of-custody
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { hashFile, hashString } from './evidence-integrity.js';

const CUSTODY_STORE_PATH = process.env.CUSTODY_STORE_PATH || './data/custody';

/**
 * Custody event types
 */
export const CustodyEventType = {
    CREATED: 'CREATED',
    ACCESSED: 'ACCESSED',
    TRANSFERRED: 'TRANSFERRED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    MODIFIED: 'MODIFIED',
    ARCHIVED: 'ARCHIVED',
    DESTROYED: 'DESTROYED',
    LEGAL_HOLD: 'LEGAL_HOLD',
    HOLD_RELEASED: 'HOLD_RELEASED'
};

/**
 * Chain of Custody Manager
 */
export class CustodyChain {
    constructor(evidenceId, storagePath = CUSTODY_STORE_PATH) {
        this.evidenceId = evidenceId;
        this.storagePath = storagePath;
        this.chain = [];
        this.pendingTransfers = new Map();
        this._load();
    }

    /**
     * Load existing chain from storage
     * @private
     */
    _load() {
        const chainPath = this._getChainPath();
        if (fs.existsSync(chainPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(chainPath, 'utf8'));
                this.chain = data.chain || [];
                this.pendingTransfers = new Map(Object.entries(data.pendingTransfers || {}));
            } catch (err) {
                console.warn(`Could not load custody chain: ${err.message}`);
            }
        }
    }

    /**
     * Save chain to storage
     * @private
     */
    _save() {
        const chainPath = this._getChainPath();
        const dir = path.dirname(chainPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const data = {
            evidenceId: this.evidenceId,
            chain: this.chain,
            pendingTransfers: Object.fromEntries(this.pendingTransfers),
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(chainPath, JSON.stringify(data, null, 2));
    }

    /**
     * Get chain file path
     * @private
     */
    _getChainPath() {
        return path.join(this.storagePath, `${this.evidenceId}-custody.json`);
    }

    /**
     * Calculate chain hash for integrity verification
     * @private
     */
    _calculateChainHash() {
        const chainData = JSON.stringify(this.chain);
        return hashString(chainData);
    }

    /**
     * Add event to custody chain
     * @param {string} eventType - Type of custody event
     * @param {Object} details - Event details
     * @returns {Object} The created event
     */
    addEvent(eventType, details) {
        const previousHash = this.chain.length > 0
            ? this.chain[this.chain.length - 1].hash
            : '0'.repeat(64);

        const event = {
            id: crypto.randomUUID(),
            evidenceId: this.evidenceId,
            eventType,
            timestamp: new Date().toISOString(),
            details,
            previousHash
        };

        // Calculate event hash
        const eventData = JSON.stringify({ ...event, hash: undefined });
        event.hash = hashString(eventData + previousHash);

        this.chain.push(event);
        this._save();

        return event;
    }

    /**
     * Record evidence creation
     */
    recordCreation(creatorId, creatorRole, source, purpose) {
        return this.addEvent(CustodyEventType.CREATED, {
            creatorId,
            creatorRole,
            source,
            purpose,
            hostname: process.env.HOSTNAME || 'unknown',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Record evidence access
     */
    recordAccess(userId, userRole, reason) {
        return this.addEvent(CustodyEventType.ACCESSED, {
            userId,
            userRole,
            reason,
            accessedAt: new Date().toISOString()
        });
    }

    /**
     * Create transfer record (initiates transfer, pending acknowledgment)
     */
    createTransferRecord(transferDetails) {
        const {
            fromUserId,
            fromRole,
            fromSystem,
            toUserId,
            toRole,
            toSystem,
            transferMethod,
            reason
        } = transferDetails;

        const transferId = crypto.randomUUID();
        const hashBefore = transferDetails.evidenceHash;

        const transfer = {
            transferId,
            evidenceId: this.evidenceId,
            fromUserId,
            fromRole,
            fromSystem,
            toUserId,
            toRole,
            toSystem,
            transferMethod,
            reason,
            hashBeforeTransfer: hashBefore,
            initiatedAt: new Date().toISOString(),
            status: 'PENDING',
            acknowledged: false
        };

        // Store pending transfer
        this.pendingTransfers.set(transferId, transfer);

        // Record transfer initiation
        this.addEvent(CustodyEventType.TRANSFERRED, {
            transferId,
            from: { userId: fromUserId, role: fromRole, system: fromSystem },
            to: { userId: toUserId, role: toRole, system: toSystem },
            method: transferMethod,
            reason,
            hashBeforeTransfer: hashBefore,
            status: 'PENDING_ACKNOWLEDGMENT'
        });

        this._save();
        return transfer;
    }

    /**
     * Acknowledge transfer receipt
     */
    acknowledgeTransfer(transferId, acknowledgment) {
        const {
            recipientId,
            hashAfterTransfer,
            verificationStatus,
            notes
        } = acknowledgment;

        const transfer = this.pendingTransfers.get(transferId);
        if (!transfer) {
            throw new Error(`Transfer not found: ${transferId}`);
        }

        // Verify integrity
        const integrityVerified = transfer.hashBeforeTransfer === hashAfterTransfer;

        // Update transfer record
        transfer.acknowledged = true;
        transfer.acknowledgedAt = new Date().toISOString();
        transfer.acknowledgedBy = recipientId;
        transfer.hashAfterTransfer = hashAfterTransfer;
        transfer.verificationStatus = integrityVerified ? 'VERIFIED' : 'INTEGRITY_MISMATCH';
        transfer.notes = notes;
        transfer.status = 'COMPLETED';

        // Record acknowledgment event
        this.addEvent(CustodyEventType.ACKNOWLEDGED, {
            transferId,
            acknowledgedBy: recipientId,
            acknowledgedAt: transfer.acknowledgedAt,
            hashAfterTransfer,
            integrityVerified,
            verificationStatus: transfer.verificationStatus,
            notes
        });

        // Remove from pending
        this.pendingTransfers.delete(transferId);
        this._save();

        return {
            success: true,
            integrityVerified,
            transfer
        };
    }

    /**
     * Set legal hold on evidence
     */
    setLegalHold(holdId, reason, authorizedBy) {
        return this.addEvent(CustodyEventType.LEGAL_HOLD, {
            holdId,
            reason,
            authorizedBy,
            effectiveFrom: new Date().toISOString()
        });
    }

    /**
     * Release legal hold
     */
    releaseLegalHold(holdId, authorizedBy, reason) {
        return this.addEvent(CustodyEventType.HOLD_RELEASED, {
            holdId,
            releasedBy: authorizedBy,
            reason,
            releasedAt: new Date().toISOString()
        });
    }

    /**
     * Get full custody history
     */
    getCustodyHistory() {
        return {
            evidenceId: this.evidenceId,
            chainLength: this.chain.length,
            events: this.chain,
            pendingTransfers: Array.from(this.pendingTransfers.values()),
            chainHash: this._calculateChainHash()
        };
    }

    /**
     * Verify custody chain integrity
     */
    verifyCustodyChain() {
        const result = {
            valid: true,
            errors: [],
            eventsVerified: 0
        };

        let previousHash = '0'.repeat(64);

        for (let i = 0; i < this.chain.length; i++) {
            const event = this.chain[i];

            // Verify previous hash link
            if (event.previousHash !== previousHash) {
                result.valid = false;
                result.errors.push(`Chain break at event ${i}: previous hash mismatch`);
            }

            // Verify event hash
            const eventCopy = { ...event, hash: undefined };
            const expectedHash = hashString(JSON.stringify(eventCopy) + previousHash);

            if (event.hash !== expectedHash) {
                result.valid = false;
                result.errors.push(`Event ${i} hash mismatch: tampering detected`);
            }

            previousHash = event.hash;
            result.eventsVerified++;
        }

        return result;
    }

    /**
     * Get pending transfers awaiting acknowledgment
     */
    getPendingTransfers() {
        return Array.from(this.pendingTransfers.values());
    }

    /**
     * Generate custody report
     */
    generateCustodyReport() {
        const history = this.getCustodyHistory();
        const verification = this.verifyCustodyChain();

        const report = {
            evidenceId: this.evidenceId,
            generatedAt: new Date().toISOString(),
            chainIntegrity: verification.valid ? 'VERIFIED' : 'COMPROMISED',
            totalEvents: history.chainLength,
            eventSummary: {},
            transfers: [],
            legalHolds: [],
            timeline: []
        };

        // Summarize events by type
        for (const event of history.events) {
            report.eventSummary[event.eventType] = (report.eventSummary[event.eventType] || 0) + 1;

            report.timeline.push({
                timestamp: event.timestamp,
                type: event.eventType,
                summary: this._summarizeEvent(event)
            });

            if (event.eventType === CustodyEventType.TRANSFERRED ||
                event.eventType === CustodyEventType.ACKNOWLEDGED) {
                report.transfers.push(event.details);
            }

            if (event.eventType === CustodyEventType.LEGAL_HOLD ||
                event.eventType === CustodyEventType.HOLD_RELEASED) {
                report.legalHolds.push(event.details);
            }
        }

        return report;
    }

    /**
     * Summarize event for timeline
     * @private
     */
    _summarizeEvent(event) {
        switch (event.eventType) {
            case CustodyEventType.CREATED:
                return `Created by ${event.details.creatorId} (${event.details.creatorRole})`;
            case CustodyEventType.ACCESSED:
                return `Accessed by ${event.details.userId} - ${event.details.reason}`;
            case CustodyEventType.TRANSFERRED:
                return `Transferred from ${event.details.from.userId} to ${event.details.to.userId}`;
            case CustodyEventType.ACKNOWLEDGED:
                return `Transfer acknowledged by ${event.details.acknowledgedBy}`;
            case CustodyEventType.LEGAL_HOLD:
                return `Legal hold applied: ${event.details.reason}`;
            case CustodyEventType.HOLD_RELEASED:
                return `Legal hold released by ${event.details.releasedBy}`;
            default:
                return event.eventType;
        }
    }
}

/**
 * Create a new custody chain for evidence
 */
export function createCustodyChain(evidenceId, storagePath) {
    return new CustodyChain(evidenceId, storagePath);
}

/**
 * Load existing custody chain
 */
export function loadCustodyChain(evidenceId, storagePath) {
    return new CustodyChain(evidenceId, storagePath);
}

export default {
    CustodyChain,
    CustodyEventType,
    createCustodyChain,
    loadCustodyChain
};
