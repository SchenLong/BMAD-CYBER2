/**
 * BMAD Guardrails: Secret Guard Validator
 * ========================================
 * Detects and blocks hardcoded secrets, API keys, and credentials.
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 2: Block the operation (secrets detected)
 *
 * Security Features:
 * - 30+ API key patterns for major providers
 * - Shannon entropy validation for generic secrets
 * - Example/placeholder content detection
 * - Single-use override tokens with 5-minute timeout
 */
import * as path from 'node:path';
import { AuditLogger, getToolInputFromStdinSync, OverrideManager, printBlockMessage, printOverrideConsumed, } from '../common/index.js';
import { EXIT_CODES } from '../types/index.js';
const VALIDATOR_NAME = 'secret_guard';
// ============================================================================
// Secret Patterns
// ============================================================================
/** Critical patterns - always block */
const CRITICAL_PATTERNS = [
    // AWS
    { pattern: /AKIA[0-9A-Z]{16}/g, secretType: 'AWS Access Key ID', confidence: 'critical' },
    { pattern: /aws_secret_access_key\s*=\s*["'][A-Za-z0-9/+=]{40}["']/gi, secretType: 'AWS Secret Access Key', confidence: 'critical' },
    // GitHub
    { pattern: /ghp_[A-Za-z0-9]{36}/g, secretType: 'GitHub Personal Access Token', confidence: 'critical' },
    { pattern: /gho_[A-Za-z0-9]{36}/g, secretType: 'GitHub OAuth Token', confidence: 'critical' },
    { pattern: /ghu_[A-Za-z0-9]{36}/g, secretType: 'GitHub User Token', confidence: 'critical' },
    { pattern: /ghs_[A-Za-z0-9]{36}/g, secretType: 'GitHub Server Token', confidence: 'critical' },
    { pattern: /ghr_[A-Za-z0-9]{36}/g, secretType: 'GitHub Refresh Token', confidence: 'critical' },
    // Slack
    { pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}/g, secretType: 'Slack Token', confidence: 'critical' },
    // Stripe
    { pattern: /sk_live_[A-Za-z0-9]{24,}/g, secretType: 'Stripe Secret Key', confidence: 'critical' },
    { pattern: /sk_test_[A-Za-z0-9]{24,}/g, secretType: 'Stripe Secret Key', confidence: 'critical' },
    { pattern: /rk_live_[A-Za-z0-9]{24,}/g, secretType: 'Stripe Restricted Key', confidence: 'critical' },
    // Google
    { pattern: /AIza[0-9A-Za-z\-_]{35}/g, secretType: 'Google API Key', confidence: 'critical' },
    // OpenAI
    { pattern: /sk-proj-[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{20,}/g, secretType: 'OpenAI Project Key', confidence: 'critical' },
    { pattern: /sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}/g, secretType: 'OpenAI Legacy Key', confidence: 'critical' },
    // Anthropic
    { pattern: /sk-ant-api03-[A-Za-z0-9\-_]{93}/g, secretType: 'Anthropic API Key', confidence: 'critical' },
    // Twilio
    { pattern: /SK[a-f0-9]{32}/g, secretType: 'Twilio API Key', confidence: 'critical' },
    // SendGrid
    { pattern: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g, secretType: 'SendGrid API Key', confidence: 'critical' },
    // Mailgun
    { pattern: /key-[A-Za-z0-9]{32}/g, secretType: 'Mailgun API Key', confidence: 'critical' },
    // Azure (SA-02 LOW: Missing Azure token patterns)
    { pattern: /SharedAccessSignature\s+sr=[^\s&]+&sig=[A-Za-z0-9%+/=]+&/g, secretType: 'Azure Shared Access Signature', confidence: 'critical' },
    // GitLab (SA-02 LOW: Missing GitLab token patterns)
    { pattern: /glpat-[A-Za-z0-9\-_]{20,}/g, secretType: 'GitLab Personal Access Token', confidence: 'critical' },
    { pattern: /gldt-[A-Za-z0-9\-_]{20,}/g, secretType: 'GitLab Deploy Token', confidence: 'critical' },
    // npm (SA-02 LOW: Missing npm token patterns)
    { pattern: /npm_[A-Za-z0-9]{36}/g, secretType: 'npm Access Token', confidence: 'critical' },
    // Private Keys
    { pattern: /-----BEGIN\s+(?:RSA\s+|EC\s+|DSA\s+|OPENSSH\s+)?PRIVATE\s+KEY-----/g, secretType: 'Private Key', confidence: 'critical' },
    { pattern: /-----BEGIN\s+PGP\s+PRIVATE\s+KEY\s+BLOCK-----/g, secretType: 'PGP Private Key', confidence: 'critical' },
    // Database URLs with credentials
    { pattern: /(mongodb|postgres|mysql|redis|mariadb):\/\/[^\s:]+:[^\s@]+@[^\s]+/gi, secretType: 'Database Connection URL', confidence: 'critical' },
];
/** High confidence patterns */
const HIGH_PATTERNS = [
    // Stripe publishable (less sensitive but still flag)
    { pattern: /pk_live_[A-Za-z0-9]{24,}/g, secretType: 'Stripe Publishable Key', confidence: 'high' },
    // Twilio Account
    { pattern: /AC[a-f0-9]{32}/g, secretType: 'Twilio Account SID', confidence: 'high' },
    // Generic patterns
    { pattern: /api[_-]?key\s*=\s*["'][A-Za-z0-9_\-]{20,}["']/gi, secretType: 'Generic API Key', confidence: 'high' },
    { pattern: /secret[_-]?key\s*=\s*["'][A-Za-z0-9_\-]{20,}["']/gi, secretType: 'Generic Secret Key', confidence: 'high' },
    { pattern: /access[_-]?token\s*=\s*["'][A-Za-z0-9_\-]{20,}["']/gi, secretType: 'Access Token', confidence: 'high' },
    { pattern: /auth[_-]?token\s*=\s*["'][A-Za-z0-9_\-]{20,}["']/gi, secretType: 'Auth Token', confidence: 'high' },
    { pattern: /bearer\s+[A-Za-z0-9_\-\.]{30,}/gi, secretType: 'Bearer Token', confidence: 'high' },
    // JWT
    { pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, secretType: 'JWT Token', confidence: 'high' },
    // Firebase
    { pattern: /firebase[_-]?api[_-]?key\s*=\s*["'][A-Za-z0-9_\-]{30,}["']/gi, secretType: 'Firebase API Key', confidence: 'high' },
];
/** Medium confidence patterns - require entropy validation */
const MEDIUM_PATTERNS = [
    // Passwords
    { pattern: /(password|passwd|pwd)\s*=\s*["'][^"']{12,}["']/gi, secretType: 'Password', confidence: 'medium' },
    // Generic high-entropy secrets
    { pattern: /(token|secret|credential|private[_-]?key)\s*=\s*["'][A-Za-z0-9+/=]{40,}["']/gi, secretType: 'Generic Secret', confidence: 'medium' },
];
// ============================================================================
// CONTENT-BASED SECRET DETECTION (SEC-002-6)
// ============================================================================
/** Content scanning patterns for common secret formats in text */
const CONTENT_SCANNING_PATTERNS = [
    // Configuration file entries
    { pattern: /(?:DATABASE_URL|DB_URL|CONNECTION_STRING)\s*=\s*["'][^"']{20,}["']/gi, secretType: 'Database Connection String', confidence: 'critical' },
    { pattern: /(?:SMTP_PASSWORD|EMAIL_PASSWORD|MAIL_PASS)\s*=\s*["'][^"']{8,}["']/gi, secretType: 'Email Password', confidence: 'high' },
    { pattern: /(?:WEBHOOK_URL|CALLBACK_URL)\s*=\s*["']https?:\/\/[^"']{20,}["']/gi, secretType: 'Webhook URL', confidence: 'medium' },
    // Cloud provider credentials in text
    { pattern: /(?:aws_access_key|AWS_ACCESS_KEY_ID)[\s:=]+["']?AKIA[0-9A-Z]{16}["']?/gi, secretType: 'AWS Access Key in Text', confidence: 'critical' },
    { pattern: /(?:aws_secret|AWS_SECRET_ACCESS_KEY)[\s:=]+["']?[A-Za-z0-9/+=]{40}["']?/gi, secretType: 'AWS Secret Key in Text', confidence: 'critical' },
    { pattern: /(?:google_client_secret|GOOGLE_CLIENT_SECRET)[\s:=]+["']?[A-Za-z0-9_-]{24}["']?/gi, secretType: 'Google Client Secret', confidence: 'critical' },
    // Social media and API keys in content
    { pattern: /(?:twitter_consumer_secret|TWITTER_CONSUMER_SECRET)[\s:=]+["']?[A-Za-z0-9]{50}["']?/gi, secretType: 'Twitter Consumer Secret', confidence: 'critical' },
    { pattern: /(?:facebook_app_secret|FACEBOOK_APP_SECRET)[\s:=]+["']?[A-Za-z0-9]{32}["']?/gi, secretType: 'Facebook App Secret', confidence: 'critical' },
    { pattern: /(?:discord_token|DISCORD_TOKEN)[\s:=]+["']?[A-Za-z0-9_-]{24}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27}["']?/gi, secretType: 'Discord Bot Token', confidence: 'critical' },
    // Payment processor keys
    { pattern: /(?:stripe_secret|STRIPE_SECRET)[\s:=]+["']?sk_live_[A-Za-z0-9]{24,}["']?/gi, secretType: 'Stripe Live Secret Key', confidence: 'critical' },
    { pattern: /(?:paypal_client_secret|PAYPAL_CLIENT_SECRET)[\s:=]+["']?[A-Za-z0-9_-]{80}["']?/gi, secretType: 'PayPal Client Secret', confidence: 'critical' },
    // Messaging and communication
    { pattern: /(?:slack_webhook|SLACK_WEBHOOK)[\s:=]+["']?https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]{9}\/[A-Z0-9]{9}\/[A-Za-z0-9]{24}["']?/gi, secretType: 'Slack Webhook URL', confidence: 'high' },
    { pattern: /(?:telegram_token|TELEGRAM_TOKEN)[\s:=]+["']?[0-9]{8,10}:[A-Za-z0-9_-]{35}["']?/gi, secretType: 'Telegram Bot Token', confidence: 'critical' },
    // Database credentials in connection strings
    { pattern: /(?:mysql|postgres|mongodb):\/\/[^:\s]+:[^@\s]+@[^\s\/]+/gi, secretType: 'Database Connection with Embedded Credentials', confidence: 'critical' },
    // Generic high-entropy secrets in configuration format
    { pattern: /(?:secret|key|token|password)[\s:=]+["']?[A-Za-z0-9+/=]{32,}["']?/gi, secretType: 'Generic High-Entropy Secret', confidence: 'medium' },
    // SSH keys in text content
    { pattern: /-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA )?PRIVATE KEY-----/gi, secretType: 'SSH Private Key in Content', confidence: 'critical' },
    { pattern: /-----BEGIN ENCRYPTED PRIVATE KEY-----[\s\S]*?-----END ENCRYPTED PRIVATE KEY-----/gi, secretType: 'Encrypted SSH Private Key in Content', confidence: 'critical' },
    // Certificate files
    { pattern: /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/gi, secretType: 'X.509 Certificate', confidence: 'medium' },
    // Common credential patterns in logs/dumps
    { pattern: /(?:Authorization:\s*Bearer\s+)([A-Za-z0-9_-]{20,})/gi, secretType: 'Bearer Token in Authorization Header', confidence: 'high' },
    { pattern: /(?:Cookie:\s*[^;]*session[^=]*=)([A-Za-z0-9+/=]{20,})/gi, secretType: 'Session Cookie Value', confidence: 'medium' },
];
// Add content scanning patterns to the main patterns array
const ALL_PATTERNS_WITH_CONTENT = [...CRITICAL_PATTERNS, ...HIGH_PATTERNS, ...MEDIUM_PATTERNS, ...CONTENT_SCANNING_PATTERNS];
// ============================================================================
// Example/Placeholder Detection
// ============================================================================
/** Files that are expected to contain example secrets */
const EXPECTED_SECRET_FILES = [
    '.env.example',
    '.env.template',
    '.env.sample',
    'example.env',
    'template.env',
    '.env.development.example',
    '.env.production.example',
];
/** Content indicators for example/placeholder values */
const EXAMPLE_INDICATORS = [
    /\bexample\b/i,
    /\bplaceholder\b/i,
    /your[_-]?api[_-]?key/i,
    /your[_-]?secret/i,
    /replace[_-]?with/i,
    /xxx+/i,
    /\bdummy\b/i,
    /\bfake\b/i,
    /test[_-]?key/i,
    /\bsample\b/i,
    /todo:?\s*replace/i,
    /insert[_-]?your/i,
    /<your[_-]/i,
    /\[your[_-]/i,
];
// ============================================================================
// Entropy Calculation
// ============================================================================
/**
 * Calculate Shannon entropy of a string.
 * Higher entropy indicates more randomness (likely a real secret).
 */
export function calculateEntropy(s) {
    if (!s.length)
        return 0;
    const freq = new Map();
    for (const char of s) {
        freq.set(char, (freq.get(char) || 0) + 1);
    }
    let entropy = 0;
    for (const count of freq.values()) {
        const p = count / s.length;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}
/**
 * Check if a value has high entropy (likely a real secret).
 */
export function isHighEntropy(value, threshold = 3.5) {
    // Clean the value - remove common prefixes
    const cleanValue = value.replace(/^(sk[-_]|ghp_|gho_|xox[baprs][-_]|AKIA|AIza)/i, '');
    return calculateEntropy(cleanValue) >= threshold;
}
// ============================================================================
// Detection Functions
// ============================================================================
/**
 * Check if the file is an expected secret file (example/template).
 */
export function isExpectedSecretFile(filePath) {
    if (!filePath)
        return false;
    const basename = path.basename(filePath).toLowerCase();
    return EXPECTED_SECRET_FILES.some(expected => basename === expected.toLowerCase());
}
/**
 * Check if content around a match indicates it's an example/placeholder.
 */
export function isExampleContent(content, line) {
    // Check the line itself
    for (const indicator of EXAMPLE_INDICATORS) {
        if (indicator.test(line)) {
            return true;
        }
    }
    // Check surrounding context (5 lines before and after)
    const lines = content.split('\n');
    const lineIndex = lines.findIndex(l => l.includes(line.trim()));
    if (lineIndex !== -1) {
        const start = Math.max(0, lineIndex - 5);
        const end = Math.min(lines.length, lineIndex + 6);
        const context = lines.slice(start, end).join('\n');
        for (const indicator of EXAMPLE_INDICATORS) {
            if (indicator.test(context)) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Detect secrets in content.
 */
export function detectSecrets(content) {
    const detections = [];
    const lines = content.split('\n');
    for (const secretPattern of ALL_PATTERNS_WITH_CONTENT) {
        // Reset regex state
        secretPattern.pattern.lastIndex = 0;
        let match;
        while ((match = secretPattern.pattern.exec(content)) !== null) {
            const matchText = match[0];
            // Find which line this match is on
            let charCount = 0;
            let lineNumber = 0;
            let matchLine = '';
            for (let i = 0; i < lines.length; i++) {
                const lineLength = lines[i].length + 1; // +1 for newline
                if (charCount + lineLength > match.index) {
                    lineNumber = i + 1;
                    matchLine = lines[i];
                    break;
                }
                charCount += lineLength;
            }
            // For medium confidence, validate entropy
            if (secretPattern.confidence === 'medium') {
                // Extract the actual secret value (the part in quotes)
                const valueMatch = matchText.match(/["']([^"']+)["']/);
                if (valueMatch) {
                    const value = valueMatch[1];
                    if (!isHighEntropy(value)) {
                        continue; // Skip low-entropy matches
                    }
                }
            }
            // Check if this looks like example/placeholder content
            if (isExampleContent(content, matchLine)) {
                continue;
            }
            detections.push({
                secretType: secretPattern.secretType,
                match: matchText.slice(0, 50) + (matchText.length > 50 ? '...' : ''),
                line: matchLine.trim().slice(0, 100),
                lineNumber,
                confidence: secretPattern.confidence,
            });
        }
    }
    return detections;
}
// ============================================================================
// Main Validation
// ============================================================================
/**
 * Main validation function.
 */
export function validateSecretGuard(content, filePath) {
    if (!content) {
        return EXIT_CODES.ALLOW;
    }
    // Check if this is an expected secret file (example/template)
    if (isExpectedSecretFile(filePath)) {
        AuditLogger.logAllowed(VALIDATOR_NAME, 'Expected secret file (example/template)', { file: filePath });
        return EXIT_CODES.ALLOW;
    }
    // Detect secrets
    const detections = detectSecrets(content);
    if (detections.length === 0) {
        AuditLogger.logAllowed(VALIDATOR_NAME, 'No secrets detected', { file: filePath });
        return EXIT_CODES.ALLOW;
    }
    // Separate by confidence
    const criticalSecrets = detections.filter(d => d.confidence === 'critical');
    const highSecrets = detections.filter(d => d.confidence === 'high');
    const mediumSecrets = detections.filter(d => d.confidence === 'medium');
    // Check for override
    const overrideResult = OverrideManager.checkAndConsume('SECRETS');
    if (overrideResult.valid) {
        AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_SECRETS', filePath);
        printOverrideConsumed(`${detections.length} potential secret(s) detected`, 'BMAD_ALLOW_SECRETS');
        return EXIT_CODES.ALLOW;
    }
    // Block the operation
    const secretSummary = detections.slice(0, 3).map(d => `- ${d.secretType} (${d.confidence}) at line ${d.lineNumber}`).join('\n');
    AuditLogger.logBlocked(VALIDATOR_NAME, `Secrets detected: ${detections.length}`, filePath, {
        critical_count: criticalSecrets.length,
        high_count: highSecrets.length,
        medium_count: mediumSecrets.length,
        detections: detections.slice(0, 5).map(d => ({
            type: d.secretType,
            confidence: d.confidence,
            line: d.lineNumber,
        })),
    });
    printBlockMessage({
        title: 'HARDCODED SECRETS DETECTED',
        message: `Found ${detections.length} potential secret(s):\n${secretSummary}${detections.length > 3 ? `\n  ... and ${detections.length - 3} more` : ''}`,
        target: filePath,
        overrideVar: 'BMAD_ALLOW_SECRETS',
        recommendations: [
            'Use environment variables for secrets',
            'Store secrets in a secure vault (AWS Secrets Manager, HashiCorp Vault)',
            'Use .env files that are gitignored',
            'If this is example content, rename file to .example or .template',
        ],
    });
    return EXIT_CODES.HARD_BLOCK;
}
/**
 * CLI entry point.
 */
export function main() {
    const input = getToolInputFromStdinSync();
    const toolInput = input.tool_input;
    const content = toolInput.content || toolInput.new_string || '';
    const filePath = toolInput.file_path || '';
    const exitCode = validateSecretGuard(content, filePath);
    process.exit(exitCode);
}
// Run if executed directly
const isMain = process.argv[1]?.endsWith('secret.js') ||
    process.argv[1]?.endsWith('secret.ts');
if (isMain) {
    main();
}
//# sourceMappingURL=secret.js.map