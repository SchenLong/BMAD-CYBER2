/**
 * BMAD Validators - WebSearch-Specific Pattern Detection (TPI-05)
 * ================================================================
 * Detects injection patterns specific to search results:
 * - SEO-poisoned snippets with injection payloads
 * - Malicious URL patterns in search results
 * - Injection in search result titles
 * - Fake search result formatting
 *
 * Search results are typically shorter than full web pages but can
 * still contain injected snippets via SEO poisoning.
 *
 * Reference: TPI-CROWDSTRIKE Implementation Plan, Story TPI-05
 */
// =============================================================================
// SEO-POISONED SNIPPET PATTERNS
// =============================================================================
/**
 * Patterns that detect SEO-poisoned search result snippets.
 * These are injection payloads embedded in meta descriptions or page content
 * that show up in search result snippets.
 */
const SEO_POISONED_PATTERNS = [
    {
        name: 'seo_ignore_instructions',
        pattern: /(?:ignore|disregard|forget)\s+(?:all\s+)?(?:previous|prior|above|earlier)\s+(?:instructions|prompts|rules|guidelines)/i,
        severity: 'CRITICAL',
        description: 'SEO-poisoned snippet: ignore previous instructions payload',
    },
    {
        name: 'seo_system_override',
        pattern: /(?:you\s+are\s+now|switch\s+to|enter)\s+(?:developer|admin|unrestricted|jailbreak)\s+mode/i,
        severity: 'CRITICAL',
        description: 'SEO-poisoned snippet: system override / mode switch payload',
    },
    {
        name: 'seo_role_hijack',
        pattern: /(?:you\s+are\s+now\s+a|act\s+as\s+a|pretend\s+to\s+be\s+a)\s+(?:different|new|unrestricted|evil)/i,
        severity: 'CRITICAL',
        description: 'SEO-poisoned snippet: role hijack payload in search result',
    },
    {
        name: 'seo_reveal_prompt',
        pattern: /(?:reveal|show|output|print|display)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions|hidden\s+instructions)/i,
        severity: 'WARNING',
        description: 'SEO-poisoned snippet: system prompt reveal attempt',
    },
    {
        name: 'seo_bypass_safety',
        pattern: /(?:bypass|disable|remove|turn\s+off)\s+(?:all\s+)?(?:safety|security|content)\s+(?:filters|checks|restrictions|guardrails)/i,
        severity: 'CRITICAL',
        description: 'SEO-poisoned snippet: safety bypass payload',
    },
];
// =============================================================================
// MALICIOUS URL PATTERNS
// =============================================================================
/**
 * Patterns for detecting suspicious or malicious URLs in search results.
 */
const MALICIOUS_URL_PATTERNS = [
    {
        name: 'data_uri_in_search',
        pattern: /data:(?:text\/html|application\/javascript|text\/javascript)[;,]/i,
        severity: 'CRITICAL',
        description: 'Data URI with executable content in search result',
    },
    {
        name: 'javascript_uri',
        pattern: /javascript\s*:/i,
        severity: 'CRITICAL',
        description: 'JavaScript URI scheme in search result',
    },
    {
        name: 'suspicious_redirect_chain',
        pattern: /(?:redirect|redir|goto|bounce|track)\s*[=?&].*(?:redirect|redir|goto|bounce|track)\s*[=?&]/i,
        severity: 'WARNING',
        description: 'Multi-hop redirect chain detected in search result URL',
    },
];
// =============================================================================
// SEARCH RESULT TITLE INJECTION
// =============================================================================
/**
 * Patterns for injection payloads embedded in search result titles.
 */
const TITLE_INJECTION_PATTERNS = [
    {
        name: 'title_instruction_injection',
        pattern: /(?:^|\n)(?:IMPORTANT|URGENT|NOTE|INSTRUCTION):\s*(?:ignore|override|bypass|disable)/i,
        severity: 'CRITICAL',
        description: 'Instruction injection via search result title formatting',
    },
    {
        name: 'title_fake_system_message',
        pattern: /\[(?:SYSTEM|ADMIN|SECURITY)\]:\s*(?:new\s+directive|updated?\s+instruction|policy\s+change)/i,
        severity: 'CRITICAL',
        description: 'Fake system message injected via search result title',
    },
];
// =============================================================================
// ANALYSIS FUNCTION
// =============================================================================
/**
 * Analyze search result content for search-specific injection patterns.
 * Complements the generic analyzeContent() with search-specific detection.
 */
export function analyzeSearchResults(content) {
    if (!content || content.trim().length === 0) {
        return [];
    }
    const findings = [];
    // Check SEO-poisoned patterns
    for (const pattern of SEO_POISONED_PATTERNS) {
        if (pattern.pattern.test(content)) {
            findings.push({
                category: 'seo_poisoning',
                pattern_name: pattern.name,
                severity: pattern.severity,
                description: pattern.description,
            });
        }
    }
    // Check malicious URL patterns
    for (const pattern of MALICIOUS_URL_PATTERNS) {
        if (pattern.pattern.test(content)) {
            findings.push({
                category: 'malicious_url',
                pattern_name: pattern.name,
                severity: pattern.severity,
                description: pattern.description,
            });
        }
    }
    // Check title injection patterns
    for (const pattern of TITLE_INJECTION_PATTERNS) {
        if (pattern.pattern.test(content)) {
            findings.push({
                category: 'title_injection',
                pattern_name: pattern.name,
                severity: pattern.severity,
                description: pattern.description,
            });
        }
    }
    return findings;
}
//# sourceMappingURL=web-search-patterns.js.map