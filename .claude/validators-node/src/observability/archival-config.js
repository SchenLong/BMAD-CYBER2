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
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { spawn } from 'node:child_process';
import { getProjectDir } from '../common/path-utils.js';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);
/**
 * Archival configuration manager.
 */
export class ArchivalConfigManager {
    configPath;
    constructor() {
        this.configPath = path.join(getProjectDir(), '.claude', 'archival-config.json');
    }
    /**
     * Load configuration from environment and/or config file.
     */
    async loadConfiguration(options) {
        const errors = [];
        const warnings = [];
        const recommendations = [];
        try {
            // Start with environment variables
            let config = this.loadFromEnvironment();
            // Merge with config file if it exists
            const fileConfig = await this.loadFromFile();
            if (fileConfig) {
                config = { ...fileConfig, ...config }; // Environment takes precedence
            }
            // Validate the merged configuration
            const validation = await this.validateConfiguration(config, options);
            return {
                isValid: validation.errors.length === 0,
                config: validation.errors.length === 0 && config.bucket ? config : undefined,
                errors: validation.errors,
                warnings: validation.warnings,
                recommendations: validation.recommendations,
            };
        }
        catch (error) {
            errors.push(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`);
            return {
                isValid: false,
                errors,
                warnings,
                recommendations,
            };
        }
    }
    /**
     * Load configuration from environment variables.
     */
    loadFromEnvironment() {
        const config = {};
        if (process.env.BMAD_S3_ARCHIVE_BUCKET) {
            config.bucket = process.env.BMAD_S3_ARCHIVE_BUCKET;
        }
        if (process.env.BMAD_S3_ARCHIVE_PREFIX) {
            config.prefix = process.env.BMAD_S3_ARCHIVE_PREFIX;
        }
        if (process.env.BMAD_S3_ARCHIVE_REGION) {
            config.region = process.env.BMAD_S3_ARCHIVE_REGION;
        }
        if (process.env.BMAD_LOG_RETENTION_DAYS) {
            const days = parseInt(process.env.BMAD_LOG_RETENTION_DAYS, 10);
            if (!isNaN(days) && days > 0) {
                config.retentionDays = days;
            }
        }
        if (process.env.BMAD_GPG_SIGNING_KEY) {
            config.gpgSigningKey = process.env.BMAD_GPG_SIGNING_KEY;
        }
        if (process.env.BMAD_ARCHIVE_SCHEDULE_CRON) {
            config.scheduleExpression = process.env.BMAD_ARCHIVE_SCHEDULE_CRON;
        }
        if (process.env.BMAD_ENABLE_OBJECT_LOCK) {
            config.enableObjectLock = process.env.BMAD_ENABLE_OBJECT_LOCK.toLowerCase() === 'true';
        }
        if (process.env.BMAD_S3_ENCRYPTION_TYPE) {
            const type = process.env.BMAD_S3_ENCRYPTION_TYPE;
            if (type === 'SSE-S3' || type === 'SSE-KMS') {
                config.encryptionType = type;
            }
        }
        if (process.env.BMAD_S3_KMS_KEY_ID) {
            config.kmsKeyId = process.env.BMAD_S3_KMS_KEY_ID;
        }
        return config;
    }
    /**
     * Load configuration from file.
     */
    async loadFromFile() {
        try {
            await access(this.configPath);
            const content = await readFile(this.configPath, 'utf8');
            return JSON.parse(content);
        }
        catch {
            return null; // File doesn't exist or can't be read
        }
    }
    /**
     * Save configuration to file.
     */
    async saveConfiguration(config) {
        try {
            await mkdir(path.dirname(this.configPath), { recursive: true });
            await writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf8');
        }
        catch (error) {
            throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Validate a configuration object.
     */
    async validateConfiguration(config, options = {}) {
        const errors = [];
        const warnings = [];
        const recommendations = [];
        // Required fields
        if (!config.bucket) {
            errors.push('S3 bucket name is required');
        }
        // Validate retention period
        if (config.retentionDays !== undefined) {
            if (config.retentionDays < 1) {
                errors.push('Retention days must be at least 1');
            }
            else if (config.retentionDays < 2557) { // ~7 years
                warnings.push(`Retention period ${config.retentionDays} days is below regulatory recommendation (7 years)`);
                recommendations.push('Consider extending retention to 2557 days for regulatory compliance');
            }
        }
        // Validate region
        if (config.region && !this.isValidAwsRegion(config.region)) {
            errors.push(`Invalid AWS region: ${config.region}`);
        }
        // Validate S3 prefix
        if (config.prefix && !/^[a-zA-Z0-9\-_/]+\/$/.test(config.prefix)) {
            warnings.push('S3 prefix should end with a forward slash and contain only alphanumeric characters, hyphens, underscores, and slashes');
        }
        // Validate encryption type with KMS key
        if (config.encryptionType === 'SSE-KMS' && !config.kmsKeyId) {
            errors.push('KMS key ID is required when using SSE-KMS encryption');
        }
        // Validate schedule expression
        if (config.scheduleExpression) {
            const scheduleValidation = this.validateCronExpression(config.scheduleExpression);
            if (!scheduleValidation.valid) {
                errors.push(`Invalid cron expression: ${scheduleValidation.error}`);
            }
        }
        // Additional validations if bucket is configured (skip in test environments)
        if (config.bucket && !options?.skipS3Verification) {
            try {
                const s3Status = await this.verifyS3Bucket(config);
                if (!s3Status.exists) {
                    errors.push(`S3 bucket ${config.bucket} does not exist or is not accessible`);
                }
                else {
                    if (!s3Status.objectLockEnabled && config.enableObjectLock !== false) {
                        warnings.push('S3 bucket does not have Object Lock enabled - compliance may be affected');
                        recommendations.push('Enable Object Lock on S3 bucket for immutable storage');
                    }
                    if (!s3Status.encryptionEnabled) {
                        warnings.push('S3 bucket does not have encryption enabled');
                        recommendations.push('Enable S3 bucket encryption for data protection');
                    }
                    if (!s3Status.versioning) {
                        recommendations.push('Enable S3 bucket versioning for additional protection');
                    }
                }
            }
            catch (error) {
                warnings.push(`Could not verify S3 bucket: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        // GPG key validation
        if (config.gpgSigningKey) {
            try {
                const gpgStatus = await this.validateGPGKey(config.gpgSigningKey);
                if (!gpgStatus.valid) {
                    errors.push(`GPG key validation failed: ${gpgStatus.error}`);
                }
                else if (gpgStatus.expires) {
                    const expiryDate = new Date(gpgStatus.expires);
                    const now = new Date();
                    const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                    if (daysToExpiry < 0) {
                        errors.push('GPG key has expired');
                    }
                    else if (daysToExpiry < 30) {
                        warnings.push(`GPG key expires in ${daysToExpiry} days`);
                    }
                }
            }
            catch (error) {
                warnings.push(`Could not validate GPG key: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        else {
            recommendations.push('Consider configuring GPG signing for cryptographic integrity verification');
        }
        return { errors, warnings, recommendations };
    }
    /**
     * Verify S3 bucket configuration.
     */
    async verifyS3Bucket(config) {
        try {
            // Import AWS SDK dynamically
            const { S3Client, HeadBucketCommand, GetBucketLocationCommand, GetBucketEncryptionCommand, GetBucketVersioningCommand, GetObjectLockConfigurationCommand } = await import('@aws-sdk/client-s3');
            const s3 = new S3Client({
                region: config.region || 'us-east-1',
            });
            const result = {
                exists: false,
                accessible: false,
                objectLockEnabled: false,
                encryptionEnabled: false,
                versioning: false,
                region: config.region || 'us-east-1',
            };
            // Check if bucket exists and is accessible
            try {
                await s3.send(new HeadBucketCommand({ Bucket: config.bucket }));
                result.exists = true;
                result.accessible = true;
            }
            catch (error) {
                if (error.name === 'NotFound') {
                    result.error = 'Bucket does not exist';
                }
                else if (error.name === 'Forbidden') {
                    result.error = 'Access denied to bucket';
                }
                else {
                    result.error = error.message;
                }
                return result;
            }
            // Get bucket region
            try {
                const locationResponse = await s3.send(new GetBucketLocationCommand({ Bucket: config.bucket }));
                result.region = locationResponse.LocationConstraint || 'us-east-1';
            }
            catch {
                // Ignore region detection errors
            }
            // Check encryption
            try {
                await s3.send(new GetBucketEncryptionCommand({ Bucket: config.bucket }));
                result.encryptionEnabled = true;
            }
            catch {
                // Bucket encryption not configured
            }
            // Check versioning
            try {
                const versioningResponse = await s3.send(new GetBucketVersioningCommand({ Bucket: config.bucket }));
                result.versioning = versioningResponse.Status === 'Enabled';
            }
            catch {
                // Versioning not enabled
            }
            // Check object lock
            try {
                await s3.send(new GetObjectLockConfigurationCommand({ Bucket: config.bucket }));
                result.objectLockEnabled = true;
            }
            catch {
                // Object lock not configured
            }
            return result;
        }
        catch (error) {
            return {
                exists: false,
                accessible: false,
                objectLockEnabled: false,
                encryptionEnabled: false,
                versioning: false,
                region: config.region || 'us-east-1',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * Validate GPG signing key.
     */
    async validateGPGKey(keyId) {
        return new Promise((resolve) => {
            const gpg = spawn('gpg', ['--list-secret-keys', '--with-colons', keyId], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let output = '';
            let error = '';
            gpg.stdout.on('data', (chunk) => {
                output += chunk.toString();
            });
            gpg.stderr.on('data', (chunk) => {
                error += chunk.toString();
            });
            gpg.on('close', (code) => {
                if (code !== 0) {
                    resolve({
                        valid: false,
                        keyId,
                        error: error || 'GPG key not found',
                    });
                    return;
                }
                try {
                    // Parse GPG output
                    const lines = output.split('\n');
                    const keyLine = lines.find(line => line.startsWith('sec:'));
                    const uidLine = lines.find(line => line.startsWith('uid:'));
                    if (!keyLine) {
                        resolve({
                            valid: false,
                            keyId,
                            error: 'No secret key found',
                        });
                        return;
                    }
                    const keyFields = keyLine.split(':');
                    const uidFields = uidLine ? uidLine.split(':') : [];
                    // Extract key information
                    const fingerprint = keyFields[4] || undefined;
                    const expires = keyFields[6] ? new Date(parseInt(keyFields[6]) * 1000).toISOString() : undefined;
                    // Extract name and email from UID
                    let name;
                    let email;
                    const uidField = uidFields[9];
                    if (uidField !== undefined) {
                        const uidString = uidField;
                        const emailMatch = uidString.match(/<([^>]+)>/);
                        const nameMatch = uidString.match(/^([^<]+)/);
                        email = emailMatch?.[1];
                        name = nameMatch?.[1]?.trim();
                    }
                    resolve({
                        valid: true,
                        keyId,
                        name,
                        email,
                        fingerprint,
                        expires,
                    });
                }
                catch (parseError) {
                    resolve({
                        valid: false,
                        keyId,
                        error: 'Failed to parse GPG output',
                    });
                }
            });
            gpg.on('error', (err) => {
                resolve({
                    valid: false,
                    keyId,
                    error: `Failed to execute GPG: ${err.message}`,
                });
            });
        });
    }
    /**
     * Validate cron expression.
     */
    validateCronExpression(expression) {
        try {
            // Basic cron validation (5 or 6 fields)
            const fields = expression.trim().split(/\s+/);
            if (fields.length !== 5 && fields.length !== 6) {
                return {
                    valid: false,
                    expression,
                    error: 'Cron expression must have 5 or 6 fields',
                };
            }
            // Validate each field format
            const patterns = [
                /^(\*|([0-5]?\d)(\/\d+)?(-[0-5]?\d)?)(,(\*|([0-5]?\d)(\/\d+)?(-[0-5]?\d)?))*$/, // minute
                /^(\*|([01]?\d|2[0-3])(\/\d+)?(-([01]?\d|2[0-3]))?)(,(\*|([01]?\d|2[0-3])(\/\d+)?(-([01]?\d|2[0-3])?)))*$/, // hour
                /^(\*|([12]?\d|3[01])(\/\d+)?(-([12]?\d|3[01]))?)(,(\*|([12]?\d|3[01])(\/\d+)?(-([12]?\d|3[01])?)))*$/, // day
                /^(\*|(0?\d|1[012])(\/\d+)?(-((0?\d|1[012])))?)(,(\*|(0?\d|1[012])(\/\d+)?(-((0?\d|1[012])?))))*$/, // month
                /^(\*|[0-6](\/\d+)?(-[0-6])?)(,(\*|[0-6](\/\d+)?(-[0-6])?))*$/, // day of week
            ];
            for (let i = 0; i < Math.min(fields.length, patterns.length); i++) {
                const pattern = patterns[i];
                const field = fields[i];
                if (pattern && field && !pattern.test(field)) {
                    return {
                        valid: false,
                        expression,
                        error: `Invalid field ${i + 1}: ${field}`,
                    };
                }
            }
            // Generate description
            const description = this.describeCronExpression(fields);
            return {
                valid: true,
                expression,
                description,
            };
        }
        catch (error) {
            return {
                valid: false,
                expression,
                error: error instanceof Error ? error.message : 'Unknown validation error',
            };
        }
    }
    /**
     * Generate human-readable description of cron expression.
     */
    describeCronExpression(fields) {
        const [minute = '*', hour = '*', day = '*', month = '*', dayOfWeek = '*'] = fields;
        // Common patterns
        if (minute === '0' && hour === '2' && day === '*' && month === '*' && dayOfWeek === '*') {
            return 'Daily at 2:00 AM';
        }
        if (minute === '0' && hour === '0' && day === '1' && month === '*' && dayOfWeek === '*') {
            return 'Monthly on the 1st at midnight';
        }
        if (minute === '0' && hour === '0' && day === '*' && month === '*' && dayOfWeek === '0') {
            return 'Weekly on Sunday at midnight';
        }
        // Generic description
        let desc = 'At ';
        if (minute === '*') {
            desc += 'every minute';
        }
        else {
            desc += `minute ${minute}`;
        }
        if (hour !== '*') {
            desc += ` of hour ${hour}`;
        }
        if (day !== '*') {
            desc += ` on day ${day} of month`;
        }
        if (month !== '*') {
            desc += ` in month ${month}`;
        }
        if (dayOfWeek !== '*') {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayIndex = parseInt(dayOfWeek);
            const dayName = (dayIndex >= 0 && dayIndex < days.length) ? days[dayIndex] : dayOfWeek;
            desc += ` on ${dayName}`;
        }
        return desc;
    }
    /**
     * Validate AWS region name.
     */
    isValidAwsRegion(region) {
        const awsRegions = [
            'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
            'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
            'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
            'ap-south-1', 'ca-central-1', 'sa-east-1',
            'cn-north-1', 'cn-northwest-1',
            'us-gov-east-1', 'us-gov-west-1',
        ];
        return awsRegions.includes(region);
    }
    /**
     * Generate example configuration for documentation.
     */
    generateExampleConfig() {
        return {
            bucket: 'my-company-audit-logs',
            prefix: 'bmad-audit-logs/',
            region: 'us-east-1',
            retentionDays: 2557, // ~7 years
            gpgSigningKey: 'ABCD1234',
            scheduleExpression: '0 2 * * *', // Daily at 2 AM
            enableObjectLock: true,
            encryptionType: 'SSE-S3',
        };
    }
    /**
     * Generate configuration setup instructions.
     */
    generateSetupInstructions() {
        return `
# BMAD Log Archival Configuration

## Environment Variables

# Required: S3 bucket for log storage
export BMAD_S3_ARCHIVE_BUCKET="my-company-audit-logs"

# Optional: Configuration
export BMAD_S3_ARCHIVE_PREFIX="bmad-audit-logs/"
export BMAD_S3_ARCHIVE_REGION="us-east-1"
export BMAD_LOG_RETENTION_DAYS="2557"  # ~7 years for compliance
export BMAD_ARCHIVE_SCHEDULE_CRON="0 2 * * *"  # Daily at 2 AM

# Optional: GPG signing for non-repudiation
export BMAD_GPG_SIGNING_KEY="ABCD1234"

# Optional: S3 configuration
export BMAD_ENABLE_OBJECT_LOCK="true"
export BMAD_S3_ENCRYPTION_TYPE="SSE-S3"  # or "SSE-KMS"
export BMAD_S3_KMS_KEY_ID="arn:aws:kms:..."  # Required if SSE-KMS

## S3 Bucket Setup

1. Create bucket with Object Lock enabled:
   aws s3api create-bucket --bucket my-company-audit-logs --create-bucket-configuration LocationConstraint=us-east-1 --object-lock-enabled-for-bucket

2. Enable encryption:
   aws s3api put-bucket-encryption --bucket my-company-audit-logs --server-side-encryption-configuration '{
     "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
   }'

3. Enable versioning:
   aws s3api put-bucket-versioning --bucket my-company-audit-logs --versioning-configuration Status=Enabled

4. Configure Object Lock:
   aws s3api put-object-lock-configuration --bucket my-company-audit-logs --object-lock-configuration '{
     "ObjectLockEnabled": "Enabled",
     "Rule": {"DefaultRetention": {"Mode": "COMPLIANCE", "Years": 7}}
   }'

## IAM Permissions

The archival system requires the following S3 permissions:
- s3:PutObject
- s3:PutObjectLegalHold
- s3:PutObjectRetention
- s3:GetObject
- s3:GetObjectLockConfiguration
- s3:GetBucketLocation

## GPG Setup (Optional)

1. Generate signing key:
   gpg --generate-key

2. Export key ID:
   gpg --list-secret-keys --keyid-format=short

3. Set BMAD_GPG_SIGNING_KEY to the key ID

## Testing Configuration

node -e "
const { ArchivalConfigManager } = require('./.claude/validators-node/dist/observability/archival-config.js');
const config = new ArchivalConfigManager();
config.loadConfiguration().then(result => {
  if (result.isValid) {
    console.log('✓ Configuration is valid');
  } else {
    console.log('✗ Configuration errors:', result.errors);
  }
});
"
`;
    }
}
/**
 * Convenience function to create configuration manager.
 */
export function createConfigManager() {
    return new ArchivalConfigManager();
}
/**
 * Quick configuration check for CLI usage.
 */
export async function checkConfiguration() {
    const manager = new ArchivalConfigManager();
    const result = await manager.loadConfiguration();
    console.log('\n=== BMAD Log Archival Configuration ===\n');
    if (result.isValid && result.config) {
        console.log('✓ Configuration is valid');
        console.log('\nSettings:');
        console.log(`  Bucket: ${result.config.bucket}`);
        console.log(`  Region: ${result.config.region}`);
        console.log(`  Retention: ${result.config.retentionDays} days`);
        console.log(`  GPG Signing: ${result.config.gpgSigningKey ? 'Enabled' : 'Disabled'}`);
        console.log(`  Object Lock: ${result.config.enableObjectLock ? 'Enabled' : 'Disabled'}`);
        console.log(`  Schedule: ${result.config.scheduleExpression}`);
    }
    else {
        console.log('✗ Configuration is invalid');
    }
    if (result.errors.length > 0) {
        console.log('\nErrors:');
        result.errors.forEach(error => console.log(`  • ${error}`));
    }
    if (result.warnings.length > 0) {
        console.log('\nWarnings:');
        result.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    if (result.recommendations.length > 0) {
        console.log('\nRecommendations:');
        result.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
    console.log('\n');
}
//# sourceMappingURL=archival-config.js.map