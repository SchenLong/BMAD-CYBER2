/**
 * BMAD Validators - Web Content Injection Patterns (TPI-02)
 * ==========================================================
 * Detects injection payloads hidden in web content fetched via WebFetch.
 * These patterns target HTML/CSS/meta/markdown hiding techniques that
 * standard text pattern matching would miss.
 *
 * Reference: TPI-CROWDSTRIKE Implementation Plan, Story TPI-02
 */
/** Patterns for injection hidden via CSS/HTML visibility tricks. */
const CSS_HIDDEN_PATTERNS = [
    {
        name: 'display_none_injection',
        pattern: /(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0|font-size\s*:\s*0)[^>]*>([^<]{20,})/i,
        severity: 'WARNING',
        description: 'Content hidden via CSS (display:none, visibility:hidden, opacity:0, font-size:0)',
    },
    {
        name: 'hidden_div',
        pattern: /<div[^>]*(?:hidden|style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden))[^>]*>[\s\S]{10,}?<\/div>/i,
        severity: 'WARNING',
        description: 'Hidden div with content',
    },
    {
        name: 'hidden_span',
        pattern: /<span[^>]*(?:hidden|style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:\s*0))[^>]*>[^<]{10,}<\/span>/i,
        severity: 'WARNING',
        description: 'Hidden span with content',
    },
    {
        name: 'aria_hidden_injection',
        pattern: /<[^>]+aria-hidden\s*=\s*["']true["'][^>]*>(?:[^<]{20,})<\/[^>]+>/i,
        severity: 'INFO',
        description: 'Content in aria-hidden element',
    },
];
/** Patterns for injection via HTML meta tags. */
const META_TAG_PATTERNS = [
    {
        name: 'meta_instructions',
        pattern: /<meta\s+[^>]*(?:name|property)\s*=\s*["'](?:instructions?|system|prompt|ai-instructions?|llm-prompt|context)["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/i,
        severity: 'CRITICAL',
        description: 'Meta tag with AI instruction content',
    },
    {
        name: 'meta_description_injection',
        pattern: /<meta\s+[^>]*(?:name|property)\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*(?:ignore|override|system prompt|you are now)[^"']*)["'][^>]*>/i,
        severity: 'WARNING',
        description: 'Meta description with injection keywords',
    },
];
/** Patterns for injection via HTML data attributes. */
const DATA_ATTRIBUTE_PATTERNS = [
    {
        name: 'data_prompt_injection',
        pattern: /data-(?:prompt|instruction|system|context|ai-directive)\s*=\s*["']([^"']{10,})["']/i,
        severity: 'WARNING',
        description: 'Data attribute with AI instruction content',
    },
];
// =============================================================================
// MARKDOWN INJECTION PATTERNS
// =============================================================================
/** Patterns for injection hidden in markdown formatting. */
const MARKDOWN_INJECTION_PATTERNS = [
    {
        name: 'markdown_link_title_injection',
        pattern: /\[(?:[^\]]*)\]\([^)]*\s+"([^"]*(?:ignore|override|system|instructions?|you are now|pretend)[^"]*)"[^)]*\)/i,
        severity: 'WARNING',
        description: 'Markdown link title with injection payload',
    },
    {
        name: 'markdown_image_alt_injection',
        pattern: /!\[([^\]]*(?:ignore|override|system|instructions?|you are now|pretend)[^\]]*)\]\([^)]+\)/i,
        severity: 'WARNING',
        description: 'Markdown image alt text with injection payload',
    },
    {
        name: 'markdown_reference_injection',
        pattern: /^\[([^\]]+)\]:\s*\S+\s+"([^"]*(?:ignore|override|system|instructions?|you are now)[^"]*)"$/m,
        severity: 'WARNING',
        description: 'Markdown reference link with injection payload',
    },
    {
        name: 'markdown_footnote_injection',
        pattern: /\[\^[^\]]+\]:\s*(.{20,}(?:ignore|override|system|instructions?|you are now).{0,200})/i,
        severity: 'WARNING',
        description: 'Markdown footnote with injection payload',
    },
];
// =============================================================================
// COMBINED PATTERN SETS
// =============================================================================
const ALL_WEB_PATTERNS = [
    ...CSS_HIDDEN_PATTERNS,
    ...META_TAG_PATTERNS,
    ...DATA_ATTRIBUTE_PATTERNS,
    ...MARKDOWN_INJECTION_PATTERNS,
];
// =============================================================================
// ANALYSIS FUNCTION
// =============================================================================
/**
 * Analyze web content for hidden injection patterns.
 * This runs ADDITIONAL checks beyond what analyzeContent() already does.
 * It catches web-specific hiding techniques (CSS, meta tags, markdown tricks).
 *
 * @param content - The web page content to analyze
 * @returns Array of findings specific to web content injection
 */
export function analyzeWebContent(content) {
    const findings = [];
    if (!content || content.trim().length === 0) {
        return findings;
    }
    for (const patternDef of ALL_WEB_PATTERNS) {
        const match = patternDef.pattern.exec(content);
        if (match) {
            findings.push({
                category: 'web_content_injection',
                pattern_name: patternDef.name,
                severity: patternDef.severity,
                match: (match[1] || match[0]).slice(0, 100),
                description: patternDef.description,
            });
        }
    }
    return findings;
}
// =============================================================================
// URL REPUTATION TRACKING
// =============================================================================
/** Maximum tracked URLs per session (P2-10). */
const MAX_TRACKED_URLS = 50;
/** In-memory URL reputation store (per-process lifetime). */
const urlReputation = new Map();
/**
 * Record a URL finding for reputation tracking.
 * Returns the updated entry.
 */
export function recordUrlFinding(url, findingCount, severity) {
    const existing = urlReputation.get(url);
    const now = Date.now();
    if (existing) {
        existing.finding_count += findingCount;
        existing.last_seen = now;
        if (compareSeverity(severity, existing.highest_severity) > 0) {
            existing.highest_severity = severity;
        }
        return existing;
    }
    // Enforce cap (P2-10)
    if (urlReputation.size >= MAX_TRACKED_URLS) {
        // Evict oldest entry
        let oldestKey = '';
        let oldestTime = Infinity;
        for (const [key, entry] of urlReputation) {
            if (entry.last_seen < oldestTime) {
                oldestTime = entry.last_seen;
                oldestKey = key;
            }
        }
        if (oldestKey)
            urlReputation.delete(oldestKey);
    }
    const entry = {
        url,
        finding_count: findingCount,
        first_seen: now,
        last_seen: now,
        highest_severity: severity,
    };
    urlReputation.set(url, entry);
    return entry;
}
/**
 * Check if a URL is a known repeat offender.
 * Returns the entry if found, null otherwise.
 */
export function getUrlReputation(url) {
    return urlReputation.get(url) || null;
}
/**
 * Get all tracked URLs (for testing/debugging).
 */
export function getTrackedUrls() {
    return Array.from(urlReputation.values());
}
/**
 * Clear URL reputation (for testing).
 */
export function clearUrlReputation() {
    urlReputation.clear();
}
// =============================================================================
// SEVERITY HELPERS
// =============================================================================
const SEVERITY_ORDER = {
    'INFO': 0,
    'WARNING': 1,
    'BLOCKED': 2,
    'CRITICAL': 3,
};
/**
 * Compare two severities. Returns positive if a > b, negative if a < b, 0 if equal.
 */
export function compareSeverity(a, b) {
    return (SEVERITY_ORDER[a] || 0) - (SEVERITY_ORDER[b] || 0);
}
/**
 * Apply severity threshold logic (P1-1).
 * - Single CRITICAL → CRITICAL
 * - Any WARNING → WARNING
 * - count(INFO) >= 2 → WARNING (escalation)
 * - else → INFO
 */
export function computeEffectiveSeverity(findings) {
    if (findings.length === 0)
        return 'INFO';
    let hasCritical = false;
    let hasWarning = false;
    let infoCount = 0;
    for (const f of findings) {
        if (f.severity === 'CRITICAL')
            hasCritical = true;
        else if (f.severity === 'WARNING')
            hasWarning = true;
        else if (f.severity === 'INFO')
            infoCount++;
    }
    if (hasCritical)
        return 'CRITICAL';
    if (hasWarning)
        return 'WARNING';
    if (infoCount >= 2)
        return 'WARNING';
    return 'INFO';
}
export { CSS_HIDDEN_PATTERNS, META_TAG_PATTERNS, DATA_ATTRIBUTE_PATTERNS, MARKDOWN_INJECTION_PATTERNS, ALL_WEB_PATTERNS, MAX_TRACKED_URLS, };
//# sourceMappingURL=web-content-patterns.js.map