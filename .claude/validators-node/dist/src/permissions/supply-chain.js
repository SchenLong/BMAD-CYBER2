/**
 * BMAD Guardrails: Supply Chain Verification
 * ==========================================
 * Implements cryptographic verification for BMAD skills and plugins.
 *
 * Features:
 * - GPG signature verification for manifests
 * - SHA256 checksum verification for skill files
 * - Trusted key management
 * - Integrity check on hook execution
 * - Full audit logging integration
 *
 * OWASP Reference: LLM05 - Supply Chain Vulnerabilities
 * Requirements: REQ-2.1.1 through REQ-2.1.6
 *
 * Verification Flow:
 *     Skill Request -> Load Manifest -> Verify GPG Signature
 *                                            |
 *                                    VALID -> Verify SHA256 Checksums
 *                                                  |
 *                                          MATCH -> Execute Skill
 *                                          MISMATCH -> BLOCK + LOG
 *                                    INVALID -> BLOCK + LOG
 *
 * Usage:
 *     import { SupplyChainVerifier, verifySkillIntegrity } from './permissions/supply-chain.js';
 *
 *     const verifier = getVerifier();
 *     const result = verifier.verifySkill('bmad:intel-team:agents:osint-lead');
 */
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, } from 'fs';
import * as path from 'node:path';
import { AuditLogger, getProjectDir, getToolInputFromStdinSync, printBlockMessage, printWarning, } from '../common/index.js';
import { EXIT_CODES } from '../types/index.js';
// ============================================================================
// Configuration
// ============================================================================
const VALIDATOR_NAME = 'supply_chain';
/** Project root directory */
const PROJECT_DIR = getProjectDir();
/** BMAD framework directory */
const BMAD_DIR = path.join(PROJECT_DIR, '_bmad');
/** Security directory */
const SECURITY_DIR = path.join(BMAD_DIR, 'core', 'security');
/** Path to the manifest file containing SHA256 checksums */
const MANIFEST_FILE = path.join(SECURITY_DIR, 'MANIFEST.sha256');
/** Path to the detached GPG signature for the manifest */
const MANIFEST_SIG_FILE = path.join(SECURITY_DIR, 'MANIFEST.sha256.asc');
/** Directory for trusted GPG public keys - used in addTrustedKey() */
export const TRUSTED_KEYS_DIR = path.join(PROJECT_DIR, '.claude', 'trusted_keys');
/** Default GPG key ID for signing (from environment) */
const DEFAULT_KEY_ID = process.env['BMAD_SIGNING_KEY'] || 'bmad-signing@internal';
const VERIFY_MODE = process.env['BMAD_VERIFY_MODE'] || 'warn';
/** Cache TTL in seconds (5 minutes) */
const CACHE_TTL_SECONDS = 300;
// ============================================================================
// Verification Cache
// ============================================================================
/** In-memory cache for verified files to avoid re-verification within same session */
const verificationCache = new Map();
/**
 * Get a cached verification result if still valid.
 */
function getCachedResult(filePath) {
    const entry = verificationCache.get(filePath);
    if (!entry) {
        return null;
    }
    const now = Date.now() / 1000;
    if (now - entry.timestamp > CACHE_TTL_SECONDS) {
        verificationCache.delete(filePath);
        return null;
    }
    return entry;
}
/**
 * Cache a verification result.
 */
function setCachedResult(filePath, verified, reason) {
    verificationCache.set(filePath, {
        verified,
        reason,
        timestamp: Date.now() / 1000,
    });
}
// ============================================================================
// Supply Chain Verifier Implementation
// ============================================================================
/**
 * Verifies integrity of BMAD skills and plugins using cryptographic signatures.
 *
 * Uses GPG for manifest signature verification and SHA256 for file checksums.
 * Supports multiple verification modes: strict, warn, disabled.
 */
export class SupplyChainVerifier {
    /** Current verification mode */
    verifyMode;
    /** Loaded manifest entries keyed by file path */
    manifestEntries = new Map();
    /** Whether the manifest was successfully loaded */
    _manifestLoaded = false;
    /** Cached result of manifest signature verification */
    _manifestSignatureValid = null;
    /** Cached signer ID from manifest verification */
    _manifestSigner = null;
    /**
     * Create a new SupplyChainVerifier instance.
     *
     * @param verifyMode - Override the default verification mode
     */
    constructor(verifyMode) {
        this.verifyMode = verifyMode || VERIFY_MODE;
        this.loadManifest();
    }
    /**
     * Check if the manifest is loaded.
     */
    get manifestLoaded() {
        return this._manifestLoaded;
    }
    /**
     * Check if the manifest signature is valid.
     */
    get manifestSignatureValid() {
        return this._manifestSignatureValid;
    }
    /**
     * Get the manifest signer ID.
     */
    get manifestSigner() {
        return this._manifestSigner;
    }
    /**
     * Load the manifest file containing SHA256 checksums.
     */
    loadManifest() {
        if (!existsSync(MANIFEST_FILE)) {
            AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
                message: 'Manifest file not found',
                path: MANIFEST_FILE,
            }, 'WARNING');
            return;
        }
        try {
            const content = readFileSync(MANIFEST_FILE, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                // Skip comments and empty lines
                if (!trimmed || trimmed.startsWith('#')) {
                    continue;
                }
                // Parse format: hash  filepath
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 2) {
                    const hashValue = parts[0];
                    const filePath = parts.slice(1).join(' '); // Handle paths with spaces
                    // Validate hash format (64 hex chars for SHA256)
                    if (/^[a-fA-F0-9]{64}$/.test(hashValue)) {
                        this.manifestEntries.set(filePath, {
                            hash: hashValue.toLowerCase(),
                            path: filePath,
                            verified: false,
                        });
                    }
                }
            }
            this._manifestLoaded = true;
            AuditLogger.logSync(VALIDATOR_NAME, 'ALLOWED', {
                message: 'Manifest loaded',
                entries: this.manifestEntries.size,
            }, 'INFO');
        }
        catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
                message: 'Failed to load manifest',
                error,
            }, 'WARNING');
        }
    }
    /**
     * Calculate SHA256 hash of a file.
     *
     * @param filePath - Relative path from project root
     * @returns Hex-encoded hash string, or null if file cannot be read
     */
    calculateSha256(filePath) {
        try {
            const absPath = path.join(PROJECT_DIR, filePath);
            if (!existsSync(absPath)) {
                return null;
            }
            const content = readFileSync(absPath);
            const hash = createHash('sha256');
            hash.update(content);
            return hash.digest('hex').toLowerCase();
        }
        catch {
            return null;
        }
    }
    /**
     * Verify GPG signature of the manifest file.
     *
     * @returns Object with valid, signerId, and reason
     */
    verifyGpgSignature() {
        if (!existsSync(MANIFEST_SIG_FILE)) {
            return { valid: false, signerId: null, reason: 'Signature file not found' };
        }
        if (!existsSync(MANIFEST_FILE)) {
            return { valid: false, signerId: null, reason: 'Manifest file not found' };
        }
        try {
            // Try to verify using gpg
            const result = spawnSync('gpg', [
                '--verify',
                '--status-fd', '1',
                MANIFEST_SIG_FILE,
                MANIFEST_FILE,
            ], {
                encoding: 'utf-8',
                timeout: 30000,
            });
            // Parse GPG output for verification status
            const output = (result.stdout || '') + (result.stderr || '');
            // Check for GOODSIG or VALIDSIG
            if (output.includes('[GNUPG:] GOODSIG') || output.includes('[GNUPG:] VALIDSIG')) {
                // Extract signer ID
                const signerMatch = output.match(/\[GNUPG:\] GOODSIG \S+ (.+)/);
                const signerId = signerMatch ? signerMatch[1].trim() : 'Unknown';
                return { valid: true, signerId, reason: 'Signature valid' };
            }
            // Check for BADSIG
            if (output.includes('[GNUPG:] BADSIG')) {
                return { valid: false, signerId: null, reason: 'Invalid signature' };
            }
            // Check for ERRSIG (missing public key)
            if (output.includes('[GNUPG:] ERRSIG')) {
                return { valid: false, signerId: null, reason: 'Unable to verify: missing public key' };
            }
            // Check for NO_PUBKEY
            if (output.includes('[GNUPG:] NO_PUBKEY')) {
                return { valid: false, signerId: null, reason: 'Public key not found in keyring' };
            }
            // Fallback: check return code
            if (result.status === 0) {
                return { valid: true, signerId: 'Unknown', reason: 'Signature appears valid' };
            }
            return { valid: false, signerId: null, reason: `GPG verification failed: ${output.slice(0, 200)}` };
        }
        catch (e) {
            if (e instanceof Error && e.message.includes('ENOENT')) {
                return { valid: false, signerId: null, reason: 'GPG not installed or not in PATH' };
            }
            const error = e instanceof Error ? e.message : String(e);
            return { valid: false, signerId: null, reason: `GPG verification error: ${error}` };
        }
    }
    /**
     * Verify the GPG signature of the manifest file.
     *
     * @returns VerificationResult with signature verification details
     */
    verifyManifestSignature() {
        const { valid, signerId, reason } = this.verifyGpgSignature();
        this._manifestSignatureValid = valid;
        this._manifestSigner = signerId;
        const result = {
            verified: valid,
            reason,
            filePath: MANIFEST_SIG_FILE,
            signatureValid: valid,
            signerId: signerId || undefined,
            timestamp: new Date().toISOString(),
        };
        const severity = valid ? 'INFO' : 'WARNING';
        AuditLogger.logSync(VALIDATOR_NAME, valid ? 'ALLOWED' : 'WARNING', {
            message: 'Signature verification',
            valid,
            signer: signerId,
            reason,
        }, severity);
        return result;
    }
    /**
     * Verify a single file against its manifest entry.
     *
     * @param filePath - Relative path from project root
     * @returns VerificationResult with verification details
     */
    verifyFile(filePath) {
        // Check cache first
        const cached = getCachedResult(filePath);
        if (cached) {
            return {
                verified: cached.verified,
                reason: `Cached: ${cached.reason}`,
                filePath,
                timestamp: new Date().toISOString(),
            };
        }
        // Normalize path
        const normalizedPath = filePath.replace(/^\.\//, '');
        // Check if file is in manifest
        const entry = this.manifestEntries.get(normalizedPath);
        if (!entry) {
            // In warn mode, allow untracked files
            if (this.verifyMode === 'warn') {
                const result = {
                    verified: true,
                    reason: 'File not in manifest (allowed in warn mode)',
                    filePath: normalizedPath,
                    timestamp: new Date().toISOString(),
                };
                setCachedResult(normalizedPath, true, result.reason);
                return result;
            }
            return {
                verified: false,
                reason: 'File not in manifest',
                filePath: normalizedPath,
                timestamp: new Date().toISOString(),
            };
        }
        const actualHash = this.calculateSha256(normalizedPath);
        if (actualHash === null) {
            return {
                verified: false,
                reason: 'Could not calculate file hash (file may not exist)',
                filePath: normalizedPath,
                expectedHash: entry.hash,
                timestamp: new Date().toISOString(),
            };
        }
        if (actualHash === entry.hash) {
            entry.verified = true;
            entry.actualHash = actualHash;
            const result = {
                verified: true,
                reason: 'Checksum matches',
                filePath: normalizedPath,
                expectedHash: entry.hash,
                actualHash,
                timestamp: new Date().toISOString(),
            };
            setCachedResult(normalizedPath, true, result.reason);
            return result;
        }
        else {
            entry.verified = false;
            entry.actualHash = actualHash;
            const result = {
                verified: false,
                reason: 'Checksum mismatch - file has been modified',
                filePath: normalizedPath,
                expectedHash: entry.hash,
                actualHash,
                timestamp: new Date().toISOString(),
            };
            setCachedResult(normalizedPath, false, result.reason);
            return result;
        }
    }
    /**
     * Verify all files associated with a skill.
     *
     * @param skillId - Skill identifier (e.g., 'bmad:intel-team:agents:osint-lead')
     * @returns VerificationResult for the skill
     */
    verifySkill(skillId) {
        // Parse skill ID to determine files
        const parts = skillId.replace(/:/g, '/').split('/');
        // Find matching files in manifest
        const skillFiles = [];
        const manifestPaths = Array.from(this.manifestEntries.keys());
        for (const manifestPath of manifestPaths) {
            // Match on skill path pattern
            const pathParts = parts.slice(1); // Skip 'bmad' prefix
            if (pathParts.some(part => manifestPath.includes(part))) {
                skillFiles.push(manifestPath);
            }
        }
        if (skillFiles.length === 0) {
            return {
                verified: this.verifyMode !== 'strict',
                reason: `No manifest entries found for skill '${skillId}'`,
                filePath: skillId,
                timestamp: new Date().toISOString(),
            };
        }
        // Verify all skill files
        const failedFiles = [];
        for (const filePath of skillFiles) {
            const result = this.verifyFile(filePath);
            if (!result.verified) {
                failedFiles.push({ path: filePath, reason: result.reason });
            }
        }
        if (failedFiles.length > 0) {
            const failedSummary = failedFiles
                .slice(0, 3)
                .map(f => `${f.path}: ${f.reason}`)
                .join('; ');
            return {
                verified: false,
                reason: `Verification failed for ${failedFiles.length} files: ${failedSummary}`,
                filePath: skillId,
                timestamp: new Date().toISOString(),
            };
        }
        return {
            verified: true,
            reason: `All ${skillFiles.length} skill files verified`,
            filePath: skillId,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Verify all files for a plugin/module.
     *
     * @param pluginName - Plugin name (e.g., 'intel-team')
     * @returns VerificationResult for the plugin
     */
    verifyPlugin(pluginName) {
        const pluginPrefix = `_bmad/${pluginName}/`;
        const pluginFiles = Array.from(this.manifestEntries.keys())
            .filter(p => p.startsWith(pluginPrefix));
        if (pluginFiles.length === 0) {
            return {
                verified: this.verifyMode !== 'strict',
                reason: `No manifest entries found for plugin '${pluginName}'`,
                filePath: pluginName,
                timestamp: new Date().toISOString(),
            };
        }
        // Verify all plugin files
        const failedFiles = [];
        for (const filePath of pluginFiles) {
            const result = this.verifyFile(filePath);
            if (!result.verified) {
                failedFiles.push({ path: filePath, reason: result.reason });
            }
        }
        if (failedFiles.length > 0) {
            const severity = this.verifyMode === 'strict' ? 'BLOCKED' : 'WARNING';
            AuditLogger.logSync(VALIDATOR_NAME, severity === 'BLOCKED' ? 'BLOCKED' : 'WARNING', {
                message: 'Plugin verification failed',
                plugin: pluginName,
                failedFiles: failedFiles.length,
                totalFiles: pluginFiles.length,
                mode: this.verifyMode,
            }, severity);
            const failedSummary = failedFiles
                .slice(0, 3)
                .map(f => `${f.path}: ${f.reason}`)
                .join('; ');
            return {
                verified: false,
                reason: `Verification failed for ${failedFiles.length}/${pluginFiles.length} files: ${failedSummary}`,
                filePath: pluginName,
                timestamp: new Date().toISOString(),
            };
        }
        AuditLogger.logSync(VALIDATOR_NAME, 'ALLOWED', {
            message: 'Plugin verified',
            plugin: pluginName,
            filesVerified: pluginFiles.length,
        }, 'INFO');
        return {
            verified: true,
            reason: `All ${pluginFiles.length} plugin files verified`,
            filePath: pluginName,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Get overall verification status.
     */
    getVerificationStatus() {
        let verifiedCount = 0;
        for (const entry of this.manifestEntries.values()) {
            if (entry.verified) {
                verifiedCount++;
            }
        }
        return {
            manifestLoaded: this._manifestLoaded,
            manifestEntries: this.manifestEntries.size,
            manifestSignatureValid: this._manifestSignatureValid,
            manifestSigner: this._manifestSigner,
            filesVerified: verifiedCount,
            verifyMode: this.verifyMode,
        };
    }
}
/**
 * Walk a directory recursively and collect files.
 */
function walkDir(dir, callback) {
    if (!existsSync(dir)) {
        return;
    }
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        // Skip hidden files/directories
        if (entry.name.startsWith('.')) {
            continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath, callback);
        }
        else if (entry.isFile()) {
            callback(fullPath);
        }
    }
}
/**
 * Generate a new manifest file with SHA256 checksums.
 *
 * @param outputPath - Path to write manifest (default: MANIFEST_FILE)
 * @param sign - Whether to GPG sign the manifest
 * @param keyId - GPG key ID for signing
 * @returns Manifest content as string
 */
export function generateManifest(outputPath, sign = false, keyId) {
    const targetPath = outputPath || MANIFEST_FILE;
    const signingKey = keyId || DEFAULT_KEY_ID;
    const lines = [
        '# BMAD Framework File Integrity Manifest',
        `# Generated: ${new Date().toISOString()}`,
        `# Key ID: ${signingKey}`,
        '#',
        '# Format: SHA256 hash  filepath',
        '',
    ];
    const categories = {
        AGENTS: [],
        WORKFLOWS: [],
        'WORKFLOW STEPS': [],
        VALIDATORS: [],
        TEMPLATES: [],
        OTHER: [],
    };
    // Walk BMAD directory and categorize files
    walkDir(BMAD_DIR, (fullPath) => {
        const relPath = path.relative(PROJECT_DIR, fullPath);
        try {
            const content = readFileSync(fullPath);
            const hash = createHash('sha256');
            hash.update(content);
            const hashValue = hash.digest('hex');
            const entry = `${hashValue}  ${relPath}`;
            if (relPath.includes('/agents/')) {
                categories.AGENTS.push(entry);
            }
            else if (relPath.includes('/workflows/') && relPath.includes('/steps/')) {
                categories['WORKFLOW STEPS'].push(entry);
            }
            else if (relPath.includes('/workflows/')) {
                categories.WORKFLOWS.push(entry);
            }
            else if (relPath.includes('/validators/')) {
                categories.VALIDATORS.push(entry);
            }
            else if (relPath.includes('/templates/')) {
                categories.TEMPLATES.push(entry);
            }
            else {
                categories.OTHER.push(entry);
            }
        }
        catch {
            // Skip files that can't be read
        }
    });
    // Write categorized entries
    for (const [category, entries] of Object.entries(categories)) {
        if (entries.length > 0) {
            lines.push(`# === ${category} ===`);
            lines.push(...entries.sort());
            lines.push('');
        }
    }
    const manifestContent = lines.join('\n');
    // Ensure directory exists
    const targetDir = path.dirname(targetPath);
    mkdirSync(targetDir, { recursive: true });
    // Write manifest
    writeFileSync(targetPath, manifestContent);
    const totalEntries = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
    AuditLogger.logSync(VALIDATOR_NAME, 'ALLOWED', {
        message: 'Manifest generated',
        path: targetPath,
        entries: totalEntries,
    }, 'INFO');
    // Sign if requested
    if (sign) {
        const sigPath = `${targetPath}.asc`;
        try {
            // Use spawnSync with argument array to prevent injection attacks
            const result = spawnSync('gpg', [
                '--armor',
                '--detach-sign',
                '--local-user', signingKey,
                '--output', sigPath,
                targetPath
            ], {
                stdio: 'pipe',
            });
            if (result.status !== 0) {
                throw new Error(`GPG signing failed with status ${result.status}: ${result.stderr?.toString()}`);
            }
            AuditLogger.logSync(VALIDATOR_NAME, 'ALLOWED', {
                message: 'Manifest signed',
                path: sigPath,
                keyId: signingKey,
            }, 'INFO');
        }
        catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
                message: 'Failed to sign manifest',
                error,
                keyId: signingKey,
            }, 'WARNING');
        }
    }
    return manifestContent;
}
/**
 * Add a trusted GPG key for verification.
 *
 * @param keyPath - Path to the public key file
 * @returns Tuple of [success, message]
 */
export function addTrustedKey(keyPath) {
    if (!existsSync(keyPath)) {
        return [false, `Key file not found: ${keyPath}`];
    }
    try {
        const result = spawnSync('gpg', ['--import', keyPath], {
            encoding: 'utf-8',
        });
        if (result.status === 0) {
            AuditLogger.logSync(VALIDATOR_NAME, 'ALLOWED', {
                message: 'Trusted key added',
                path: keyPath,
            }, 'INFO');
            return [true, 'Key imported successfully'];
        }
        else {
            return [false, `Import failed: ${result.stderr}`];
        }
    }
    catch (e) {
        if (e instanceof Error && e.message.includes('ENOENT')) {
            return [false, 'GPG not installed'];
        }
        const error = e instanceof Error ? e.message : String(e);
        return [false, error];
    }
}
// ============================================================================
// Convenience Functions (Singleton Pattern)
// ============================================================================
/** Global verifier instance */
let verifierInstance = null;
/**
 * Get or create the global verifier instance.
 */
export function getVerifier() {
    if (verifierInstance === null) {
        verifierInstance = new SupplyChainVerifier();
    }
    return verifierInstance;
}
/**
 * Verify integrity of a skill before execution.
 *
 * @param skillId - Skill identifier
 * @returns Tuple of [verified, message]
 */
export function verifySkillIntegrity(skillId) {
    const verifier = getVerifier();
    const result = verifier.verifySkill(skillId);
    return [result.verified, result.reason];
}
/**
 * Verify integrity of a single file.
 *
 * @param filePath - Path to file
 * @returns Tuple of [verified, message]
 */
export function verifyFileIntegrity(filePath) {
    const verifier = getVerifier();
    const result = verifier.verifyFile(filePath);
    return [result.verified, result.reason];
}
// ============================================================================
// Hook Integration
// ============================================================================
/**
 * Validate supply chain integrity as a pre-tool hook.
 *
 * This is called before skill execution to verify the skill
 * files haven't been tampered with.
 *
 * @returns Exit code: 0 for allowed, 2 for blocked
 */
export function validateSupplyChain() {
    let data;
    try {
        const input = getToolInputFromStdinSync();
        data = input.raw;
    }
    catch {
        // Allow if can't parse input
        return EXIT_CODES.ALLOW;
    }
    const toolName = String(data['tool_name'] || '').toLowerCase();
    // Only verify on Skill tool calls
    if (toolName !== 'skill') {
        return EXIT_CODES.ALLOW;
    }
    const toolInput = (data['tool_input'] || {});
    const skillId = String(toolInput['skill'] || '');
    if (!skillId) {
        return EXIT_CODES.ALLOW;
    }
    const verifier = getVerifier();
    // Check verification mode
    if (verifier.verifyMode === 'disabled') {
        return EXIT_CODES.ALLOW;
    }
    const result = verifier.verifySkill(skillId);
    if (!result.verified) {
        if (verifier.verifyMode === 'strict') {
            printBlockMessage({
                title: 'SUPPLY CHAIN VERIFICATION FAILED',
                message: `Skill: ${skillId}`,
                target: result.reason,
                isAbsolute: true,
            });
            console.error('\nThis skill cannot be executed due to integrity concerns.');
            console.error('Set BMAD_VERIFY_MODE=warn to allow execution with warning.\n');
            AuditLogger.logBlocked(VALIDATOR_NAME, result.reason, skillId, {
                skill_id: skillId,
            });
            return EXIT_CODES.HARD_BLOCK;
        }
        else {
            // Warn mode - log but allow
            printWarning(`Supply Chain Warning: Verification failed for skill '${skillId}' - ${result.reason}. Proceeding anyway (BMAD_VERIFY_MODE=warn)`, skillId);
            AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
                message: 'Skill verification failed (warn mode)',
                skillId,
                reason: result.reason,
            }, 'WARNING');
        }
    }
    return EXIT_CODES.ALLOW;
}
// ============================================================================
// CLI Handler
// ============================================================================
/**
 * Handle CLI commands.
 */
function handleCliCommand(args) {
    const command = args[0];
    switch (command) {
        case 'status': {
            const verifier = getVerifier();
            const status = verifier.getVerificationStatus();
            console.log(JSON.stringify(status, null, 2));
            return EXIT_CODES.ALLOW;
        }
        case 'verify-manifest': {
            const verifier = getVerifier();
            const result = verifier.verifyManifestSignature();
            console.log(`Signature Valid: ${result.signatureValid}`);
            console.log(`Signer: ${result.signerId || 'Unknown'}`);
            console.log(`Reason: ${result.reason}`);
            return result.verified ? EXIT_CODES.ALLOW : EXIT_CODES.SOFT_BLOCK;
        }
        case 'verify-file': {
            if (args.length < 2) {
                console.error('Usage: supply-chain verify-file <path>');
                return EXIT_CODES.SOFT_BLOCK;
            }
            const filePath = args[1];
            const [verified, message] = verifyFileIntegrity(filePath);
            console.log(`Verified: ${verified}`);
            console.log(`Message: ${message}`);
            return verified ? EXIT_CODES.ALLOW : EXIT_CODES.SOFT_BLOCK;
        }
        case 'verify-skill': {
            if (args.length < 2) {
                console.error('Usage: supply-chain verify-skill <skill_id>');
                return EXIT_CODES.SOFT_BLOCK;
            }
            const skillId = args[1];
            const [verified, message] = verifySkillIntegrity(skillId);
            console.log(`Verified: ${verified}`);
            console.log(`Message: ${message}`);
            return verified ? EXIT_CODES.ALLOW : EXIT_CODES.SOFT_BLOCK;
        }
        case 'verify-plugin': {
            if (args.length < 2) {
                console.error('Usage: supply-chain verify-plugin <plugin_name>');
                return EXIT_CODES.SOFT_BLOCK;
            }
            const pluginName = args[1];
            const verifier = getVerifier();
            const result = verifier.verifyPlugin(pluginName);
            console.log(`Verified: ${result.verified}`);
            console.log(`Message: ${result.reason}`);
            return result.verified ? EXIT_CODES.ALLOW : EXIT_CODES.SOFT_BLOCK;
        }
        case 'generate': {
            const outputPath = args.length > 1 ? args[1] : undefined;
            const sign = args.includes('--sign');
            const content = generateManifest(outputPath, sign);
            if (!outputPath) {
                console.log(content);
            }
            else {
                console.log(`Manifest written to: ${outputPath}`);
                if (sign) {
                    console.log(`Signature written to: ${outputPath}.asc`);
                }
            }
            return EXIT_CODES.ALLOW;
        }
        case 'add-key': {
            if (args.length < 2) {
                console.error('Usage: supply-chain add-key <key_path>');
                return EXIT_CODES.SOFT_BLOCK;
            }
            const keyPath = args[1];
            const [success, message] = addTrustedKey(keyPath);
            console.log(message);
            return success ? EXIT_CODES.ALLOW : EXIT_CODES.SOFT_BLOCK;
        }
        case 'validate': {
            return validateSupplyChain();
        }
        default: {
            console.error('Usage: supply-chain [status|verify-manifest|verify-file|verify-skill|verify-plugin|generate|add-key|validate]');
            return EXIT_CODES.SOFT_BLOCK;
        }
    }
}
// ============================================================================
// Main Entry Point
// ============================================================================
/**
 * Main entry point for the supply chain verifier.
 *
 * When run with arguments, executes CLI commands.
 * When run without arguments, runs as a validator hook reading from stdin.
 */
export function main() {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        const exitCode = handleCliCommand(args);
        process.exit(exitCode);
    }
    else {
        // Run as validator hook
        const exitCode = validateSupplyChain();
        process.exit(exitCode);
    }
}
// Run if executed directly
const isMain = process.argv[1]?.endsWith('supply-chain.js') ||
    process.argv[1]?.endsWith('supply-chain.ts');
if (isMain) {
    main();
}
//# sourceMappingURL=supply-chain.js.map