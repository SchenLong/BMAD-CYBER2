/**
 * BMAD Guardrails: Archival Configuration Interface
 * ================================================
 * Provides configuration validation and management for the log archival system.
 *
 * Features:
 * - Environment variable validation
 * - Configuration file support
 * - S3 bucket verification
 * - GPG key validation
 * - Schedule expression parsing
 * - Compliance requirement checking
 */
import type { ArchivalConfig } from './log-archiver.js';
/**
 * Configuration validation result.
 */
export interface ConfigValidationResult {
    isValid: boolean;
    config?: ArchivalConfig | undefined;
    errors: string[];
    warnings: string[];
    recommendations: string[];
}
/**
 * S3 bucket verification result.
 */
export interface S3BucketStatus {
    exists: boolean;
    accessible: boolean;
    objectLockEnabled: boolean;
    encryptionEnabled: boolean;
    versioning: boolean;
    region: string;
    error?: string;
}
/**
 * GPG key information.
 */
export interface GPGKeyInfo {
    valid: boolean;
    keyId: string;
    name?: string | undefined;
    email?: string | undefined;
    fingerprint?: string | undefined;
    expires?: string | undefined;
    error?: string | undefined;
}
/**
 * Schedule validation result.
 */
export interface ScheduleValidation {
    valid: boolean;
    expression: string;
    description?: string;
    nextRuns?: string[];
    error?: string;
}
/**
 * Archival configuration manager.
 */
export declare class ArchivalConfigManager {
    private configPath;
    constructor();
    /**
     * Load configuration from environment and/or config file.
     */
    loadConfiguration(options?: {
        skipS3Verification?: boolean;
    }): Promise<ConfigValidationResult>;
    /**
     * Load configuration from environment variables.
     */
    private loadFromEnvironment;
    /**
     * Load configuration from file.
     */
    private loadFromFile;
    /**
     * Save configuration to file.
     */
    saveConfiguration(config: ArchivalConfig): Promise<void>;
    /**
     * Validate a configuration object.
     */
    validateConfiguration(config: Partial<ArchivalConfig>, options?: {
        skipS3Verification?: boolean;
    }): Promise<{
        errors: string[];
        warnings: string[];
        recommendations: string[];
    }>;
    /**
     * Verify S3 bucket configuration.
     */
    verifyS3Bucket(config: Partial<ArchivalConfig>): Promise<S3BucketStatus>;
    /**
     * Validate GPG signing key.
     */
    validateGPGKey(keyId: string): Promise<GPGKeyInfo>;
    /**
     * Validate cron expression.
     */
    private validateCronExpression;
    /**
     * Generate human-readable description of cron expression.
     */
    private describeCronExpression;
    /**
     * Validate AWS region name.
     */
    private isValidAwsRegion;
    /**
     * Generate example configuration for documentation.
     */
    generateExampleConfig(): ArchivalConfig;
    /**
     * Generate configuration setup instructions.
     */
    generateSetupInstructions(): string;
}
/**
 * Convenience function to create configuration manager.
 */
export declare function createConfigManager(): ArchivalConfigManager;
/**
 * Quick configuration check for CLI usage.
 */
export declare function checkConfiguration(): Promise<void>;
