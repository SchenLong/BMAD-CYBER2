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
/** Directory for trusted GPG public keys - used in addTrustedKey() */
export declare const TRUSTED_KEYS_DIR: string;
/** Verification mode: 'strict' | 'warn' | 'disabled' */
type VerifyMode = 'strict' | 'warn' | 'disabled';
/**
 * Result of a verification operation.
 */
export interface VerificationResult {
    /** Whether the verification passed */
    verified: boolean;
    /** Human-readable reason for the result */
    reason: string;
    /** Path to the file being verified */
    filePath: string;
    /** Expected hash from the manifest */
    expectedHash?: string | undefined;
    /** Actual computed hash */
    actualHash?: string | undefined;
    /** Whether the GPG signature is valid */
    signatureValid?: boolean | undefined;
    /** ID of the GPG signer */
    signerId?: string | undefined;
    /** ISO timestamp of the verification */
    timestamp: string;
}
/**
 * A single entry in the manifest file.
 */
export interface ManifestEntry {
    /** SHA256 hash from the manifest */
    hash: string;
    /** Relative file path */
    path: string;
    /** Whether this entry has been verified */
    verified: boolean;
    /** Actual computed hash (if verified) */
    actualHash?: string;
}
/**
 * Overall verification status.
 */
export interface VerificationStatus {
    manifestLoaded: boolean;
    manifestEntries: number;
    manifestSignatureValid: boolean | null;
    manifestSigner: string | null;
    filesVerified: number;
    verifyMode: VerifyMode;
}
/**
 * Verifies integrity of BMAD skills and plugins using cryptographic signatures.
 *
 * Uses GPG for manifest signature verification and SHA256 for file checksums.
 * Supports multiple verification modes: strict, warn, disabled.
 */
export declare class SupplyChainVerifier {
    /** Current verification mode */
    readonly verifyMode: VerifyMode;
    /** Loaded manifest entries keyed by file path */
    private manifestEntries;
    /** Whether the manifest was successfully loaded */
    private _manifestLoaded;
    /** Cached result of manifest signature verification */
    private _manifestSignatureValid;
    /** Cached signer ID from manifest verification */
    private _manifestSigner;
    /**
     * Create a new SupplyChainVerifier instance.
     *
     * @param verifyMode - Override the default verification mode
     */
    constructor(verifyMode?: VerifyMode);
    /**
     * Check if the manifest is loaded.
     */
    get manifestLoaded(): boolean;
    /**
     * Check if the manifest signature is valid.
     */
    get manifestSignatureValid(): boolean | null;
    /**
     * Get the manifest signer ID.
     */
    get manifestSigner(): string | null;
    /**
     * Load the manifest file containing SHA256 checksums.
     */
    private loadManifest;
    /**
     * Calculate SHA256 hash of a file.
     *
     * @param filePath - Relative path from project root
     * @returns Hex-encoded hash string, or null if file cannot be read
     */
    private calculateSha256;
    /**
     * Verify GPG signature of the manifest file.
     *
     * @returns Object with valid, signerId, and reason
     */
    private verifyGpgSignature;
    /**
     * Verify the GPG signature of the manifest file.
     *
     * @returns VerificationResult with signature verification details
     */
    verifyManifestSignature(): VerificationResult;
    /**
     * Verify a single file against its manifest entry.
     *
     * @param filePath - Relative path from project root
     * @returns VerificationResult with verification details
     */
    verifyFile(filePath: string): VerificationResult;
    /**
     * Verify all files associated with a skill.
     *
     * @param skillId - Skill identifier (e.g., 'bmad:intel-team:agents:osint-lead')
     * @returns VerificationResult for the skill
     */
    verifySkill(skillId: string): VerificationResult;
    /**
     * Verify all files for a plugin/module.
     *
     * @param pluginName - Plugin name (e.g., 'intel-team')
     * @returns VerificationResult for the plugin
     */
    verifyPlugin(pluginName: string): VerificationResult;
    /**
     * Get overall verification status.
     */
    getVerificationStatus(): VerificationStatus;
}
/**
 * Generate a new manifest file with SHA256 checksums.
 *
 * @param outputPath - Path to write manifest (default: MANIFEST_FILE)
 * @param sign - Whether to GPG sign the manifest
 * @param keyId - GPG key ID for signing
 * @returns Manifest content as string
 */
export declare function generateManifest(outputPath?: string, sign?: boolean, keyId?: string): string;
/**
 * Add a trusted GPG key for verification.
 *
 * @param keyPath - Path to the public key file
 * @returns Tuple of [success, message]
 */
export declare function addTrustedKey(keyPath: string): [boolean, string];
/**
 * Get or create the global verifier instance.
 */
export declare function getVerifier(): SupplyChainVerifier;
/**
 * Verify integrity of a skill before execution.
 *
 * @param skillId - Skill identifier
 * @returns Tuple of [verified, message]
 */
export declare function verifySkillIntegrity(skillId: string): [boolean, string];
/**
 * Verify integrity of a single file.
 *
 * @param filePath - Path to file
 * @returns Tuple of [verified, message]
 */
export declare function verifyFileIntegrity(filePath: string): [boolean, string];
/**
 * Validate supply chain integrity as a pre-tool hook.
 *
 * This is called before skill execution to verify the skill
 * files haven't been tampered with.
 *
 * @returns Exit code: 0 for allowed, 2 for blocked
 */
export declare function validateSupplyChain(): number;
/**
 * Main entry point for the supply chain verifier.
 *
 * When run with arguments, executes CLI commands.
 * When run without arguments, runs as a validator hook reading from stdin.
 */
export declare function main(): void;
export {};
