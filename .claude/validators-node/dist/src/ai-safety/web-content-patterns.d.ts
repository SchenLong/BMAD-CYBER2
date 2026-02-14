/**
 * BMAD Validators - Web Content Injection Patterns (TPI-02)
 * ==========================================================
 * Detects injection payloads hidden in web content fetched via WebFetch.
 * These patterns target HTML/CSS/meta/markdown hiding techniques that
 * standard text pattern matching would miss.
 *
 * Reference: TPI-CROWDSTRIKE Implementation Plan, Story TPI-02
 */
import type { Severity } from '../types/index.js';
/** A finding from web content pattern analysis. */
export interface WebContentFinding {
    category: string;
    pattern_name: string;
    severity: Severity;
    match?: string;
    description: string;
}
interface WebPatternDef {
    name: string;
    pattern: RegExp;
    severity: Severity;
    description: string;
}
/** Patterns for injection hidden via CSS/HTML visibility tricks. */
declare const CSS_HIDDEN_PATTERNS: WebPatternDef[];
/** Patterns for injection via HTML meta tags. */
declare const META_TAG_PATTERNS: WebPatternDef[];
/** Patterns for injection via HTML data attributes. */
declare const DATA_ATTRIBUTE_PATTERNS: WebPatternDef[];
/** Patterns for injection hidden in markdown formatting. */
declare const MARKDOWN_INJECTION_PATTERNS: WebPatternDef[];
declare const ALL_WEB_PATTERNS: WebPatternDef[];
/**
 * Analyze web content for hidden injection patterns.
 * This runs ADDITIONAL checks beyond what analyzeContent() already does.
 * It catches web-specific hiding techniques (CSS, meta tags, markdown tricks).
 *
 * @param content - The web page content to analyze
 * @returns Array of findings specific to web content injection
 */
export declare function analyzeWebContent(content: string): WebContentFinding[];
/** Maximum tracked URLs per session (P2-10). */
declare const MAX_TRACKED_URLS = 50;
/** URL reputation entry. */
export interface UrlReputationEntry {
    url: string;
    finding_count: number;
    first_seen: number;
    last_seen: number;
    highest_severity: Severity;
}
/**
 * Record a URL finding for reputation tracking.
 * Returns the updated entry.
 */
export declare function recordUrlFinding(url: string, findingCount: number, severity: Severity): UrlReputationEntry;
/**
 * Check if a URL is a known repeat offender.
 * Returns the entry if found, null otherwise.
 */
export declare function getUrlReputation(url: string): UrlReputationEntry | null;
/**
 * Get all tracked URLs (for testing/debugging).
 */
export declare function getTrackedUrls(): UrlReputationEntry[];
/**
 * Clear URL reputation (for testing).
 */
export declare function clearUrlReputation(): void;
/**
 * Compare two severities. Returns positive if a > b, negative if a < b, 0 if equal.
 */
export declare function compareSeverity(a: Severity, b: Severity): number;
/**
 * Apply severity threshold logic (P1-1).
 * - Single CRITICAL → CRITICAL
 * - Any WARNING → WARNING
 * - count(INFO) >= 2 → WARNING (escalation)
 * - else → INFO
 */
export declare function computeEffectiveSeverity(findings: WebContentFinding[]): Severity;
export { CSS_HIDDEN_PATTERNS, META_TAG_PATTERNS, DATA_ATTRIBUTE_PATTERNS, MARKDOWN_INJECTION_PATTERNS, ALL_WEB_PATTERNS, MAX_TRACKED_URLS, };
