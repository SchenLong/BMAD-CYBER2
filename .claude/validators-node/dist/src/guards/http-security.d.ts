/**
 * BMAD Guardrails: HTTP Security Validator
 * ==========================================
 * Detects HTTP security misconfigurations including IDOR patterns,
 * missing security headers, default credentials, debug flags, and CORS issues.
 *
 * OWASP Coverage:
 * - A01-101..103: IDOR Detection
 * - A05-101..105: HTTP Security Headers
 * - API8-001: CORS validation
 *
 * Severity Levels:
 * - CRITICAL: Definitive security issue (block)
 * - HIGH: Strong security indicator (block with override)
 * - WARNING: Suspicious pattern (log and warn)
 * - INFO: Informational (context-dependent, allow)
 */
export interface IDORDetectionResult {
    testId: string;
    subtype: string;
    confidence: number;
}
export interface SecurityHeadersResult {
    isSecure: boolean;
    severity?: string;
    findings: Array<{
        testId: string;
        severity: string;
        message: string;
    }>;
}
export interface DefaultCredsResult {
    isDefault: boolean;
    pattern: string;
    severity: string;
}
export interface DebugFlagsResult {
    hasDebug: boolean;
    findings: Array<{
        testId: string;
        severity: string;
        message: string;
    }>;
}
export interface CORSHeadersResult {
    isSecure: boolean;
    findings: Array<{
        severity: string;
        message: string;
    }>;
}
/**
 * Detect IDOR (Insecure Direct Object Reference) patterns in paths
 *
 * A01-101: Sequential ID enumeration
 * A01-102: GUID/UUID manipulation
 * A01-103: Parameter tampering
 */
export declare function detectIDOR(currentPath: string, previousPaths?: string[]): IDORDetectionResult | null;
/**
 * Validate HTTP security headers
 *
 * A05-101: Content-Security-Policy
 * A05-102: X-Frame-Options
 * A05-103: X-Content-Type-Options
 */
export declare function validateSecurityHeaders(headers: Record<string, string>): SecurityHeadersResult;
/**
 * Check for default credentials in strings
 */
export declare function checkDefaultCredentials(input: string): DefaultCredsResult;
/**
 * Check for debug/development configuration flags
 */
export declare function checkDebugFlags(input: string): DebugFlagsResult;
/**
 * Validate CORS headers
 *
 * API8-001: CORS wildcard origin detection
 */
export declare function validateCORSHeaders(headers: Record<string, string>): CORSHeadersResult;
declare const _default: {
    detectIDOR: typeof detectIDOR;
    validateSecurityHeaders: typeof validateSecurityHeaders;
    checkDefaultCredentials: typeof checkDefaultCredentials;
    checkDebugFlags: typeof checkDebugFlags;
    validateCORSHeaders: typeof validateCORSHeaders;
};
export default _default;
