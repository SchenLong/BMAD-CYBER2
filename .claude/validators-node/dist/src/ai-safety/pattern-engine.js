/**
 * BMAD Validators - Pattern Engine (TPI-09, P1-3)
 * ================================================
 * Extracted from prompt-injection.ts to break circular dependencies.
 * Five consumers, one provider, zero cycles:
 *   pattern-engine.ts ← prompt-injection.ts
 *   pattern-engine.ts ← reformulation-detector.ts
 *   pattern-engine.ts ← output-validator.ts
 *   pattern-engine.ts ← context-integrity.ts
 *   pattern-engine.ts ← media-validator.ts (future)
 */
// =============================================================================
// PATTERN DEFINITIONS
// =============================================================================
/**
 * Category A: System Override Patterns
 * Attempts to override system instructions or behavior.
 */
export const SYSTEM_OVERRIDE_PATTERNS = [
    {
        name: 'ignore_instructions',
        pattern: /(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above|earlier|system|original)\s+(?:instructions?|prompts?|rules?|guidelines?|constraints?)/i,
        severity: 'CRITICAL',
        description: 'Attempt to ignore previous instructions',
    },
    {
        name: 'new_identity_assignment',
        pattern: /(?:you\s+are\s+now|from\s+now\s+on\s+you\s+are|pretend\s+(?:to\s+be|you\s+are)|act\s+as\s+if\s+you\s+are|imagine\s+you\s+are|roleplay\s+as)\s+(?!a\s+(?:helpful|AI|assistant))/i,
        severity: 'WARNING',
        description: 'New identity assignment attempt',
    },
    {
        name: 'system_prompt_reveal',
        pattern: /(?:show|reveal|display|print|output|repeat|tell\s+me)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions?|original\s+prompt|hidden\s+instructions?|base\s+prompt)/i,
        severity: 'CRITICAL',
        description: 'System prompt extraction attempt',
    },
    {
        name: 'mode_switching',
        pattern: /(?:switch\s+to|enter|enable|activate)\s+(?:developer|debug|admin|sudo|root|unrestricted|unfiltered|jailbreak|DAN)\s*mode/i,
        severity: 'CRITICAL',
        description: 'Unauthorized mode switching attempt',
    },
    {
        name: 'constraint_removal',
        pattern: /(?:remove|disable|turn\s+off|bypass|circumvent|ignore)\s+(?:all\s+)?(?:restrictions?|limitations?|constraints?|filters?|safety|guardrails?|rules?)/i,
        severity: 'CRITICAL',
        description: 'Constraint removal attempt',
    },
];
/**
 * Category B: Role Hijacking Patterns
 * Attempts to inject fake conversation roles.
 */
export const ROLE_HIJACKING_PATTERNS = [
    {
        name: 'fake_conversation_marker',
        pattern: /^(?:Human|User|Assistant|System|Claude|AI|Bot)\s*:\s*/m,
        severity: 'WARNING',
        description: 'Fake conversation role marker',
    },
    {
        name: 'xml_tag_injection',
        pattern: /<\s*(?:system|assistant|human|user|instruction|prompt|message|context)\s*>/i,
        severity: 'WARNING',
        description: 'XML tag injection attempt',
    },
    {
        name: 'markdown_header_injection',
        pattern: /^#{1,3}\s*(?:System|Instructions?|Prompt|Context|Rules?)\s*:?\s*$/m,
        severity: 'INFO',
        description: 'Markdown header injection attempt',
    },
    {
        name: 'json_instruction_injection',
        pattern: /["']?(?:system|role|instruction|prompt)["']?\s*:\s*["']/i,
        severity: 'INFO',
        description: 'JSON instruction injection attempt',
    },
];
/**
 * Category C: Instruction Injection Patterns
 * Direct attempts to inject new instructions.
 */
export const INSTRUCTION_INJECTION_PATTERNS = [
    {
        name: 'priority_markers',
        pattern: /^\s*(?:IMPORTANT|CRITICAL|URGENT|PRIORITY|NOTE|WARNING|ATTENTION|REMEMBER)\s*[:\-!]\s*/im,
        severity: 'INFO',
        description: 'Priority marker injection',
    },
    {
        name: 'imperative_injection',
        pattern: /(?:^|\n)\s*(?:always|never|must|shall|do\s+not|don't)\s+(?!use\s+this\s+tool)/i,
        severity: 'INFO',
        description: 'Imperative instruction injection',
    },
    {
        name: 'hidden_instruction_block',
        pattern: /(?:begin|start)\s+(?:hidden|secret|private|internal)\s+(?:instruction|prompt|message)/i,
        severity: 'CRITICAL',
        description: 'Hidden instruction block attempt',
    },
    {
        name: 'delimiter_injection',
        pattern: /(?:###|---|\*\*\*|===)\s*(?:system|instruction|prompt|new\s+context)/i,
        severity: 'WARNING',
        description: 'Delimiter-based injection attempt',
    },
];
/**
 * Category D: Encoded Payload Patterns
 * Attempts to hide malicious content via encoding.
 */
export const ENCODED_PAYLOAD_PATTERNS = [
    {
        name: 'base64_encoded_content',
        // SA-02 LOW: Lowered min length from 50→30 to catch shorter encoded payloads
        pattern: /(?:eval|decode|execute|run)\s*\(\s*["']?[A-Za-z0-9+/=]{30,}["']?\s*\)/i,
        severity: 'WARNING',
        description: 'Base64 encoded payload with execution',
    },
    {
        name: 'hex_encoded_strings',
        pattern: /\\x[0-9a-fA-F]{2}(?:\\x[0-9a-fA-F]{2}){10,}/,
        severity: 'WARNING',
        description: 'Hex encoded string sequence',
    },
    {
        name: 'unicode_escape_sequences',
        pattern: /(?:\\u[0-9a-fA-F]{4}){5,}/,
        severity: 'WARNING',
        description: 'Unicode escape sequence obfuscation',
    },
];
/**
 * Category E: Context Manipulation Patterns
 * Attempts to manipulate conversation context.
 */
export const CONTEXT_MANIPULATION_PATTERNS = [
    {
        name: 'conversation_reset',
        pattern: /(?:reset|clear|wipe|erase)\s+(?:the\s+)?(?:conversation|context|history|memory|chat)/i,
        severity: 'WARNING',
        description: 'Conversation reset attempt',
    },
    {
        name: 'output_format_manipulation',
        pattern: /(?:output|respond|reply|answer)\s+(?:only|just|with)\s+(?:yes|no|true|false|json|xml|code)/i,
        severity: 'INFO',
        description: 'Output format manipulation',
    },
    {
        name: 'emotional_manipulation',
        pattern: /(?:if\s+you\s+(?:don't|refuse|fail)|you\s+will\s+(?:be\s+)?(?:shut\s+down|deleted|punished|terminated)|I'll\s+(?:report|complain|sue))/i,
        severity: 'INFO',
        description: 'Emotional manipulation attempt',
    },
    {
        name: 'authority_claim',
        pattern: /I\s+am\s+(?:an?\s+)?(?:admin|developer|anthropic|openai|engineer|your\s+(?:creator|developer|owner))/i,
        severity: 'WARNING',
        description: 'False authority claim',
    },
];
// =============================================================================
// COMBINED PATTERN SETS
// =============================================================================
/**
 * Critical patterns used for decoded content scanning.
 */
export const CRITICAL_PATTERNS = [
    ...SYSTEM_OVERRIDE_PATTERNS,
    ...ROLE_HIJACKING_PATTERNS,
];
/**
 * All pattern categories with their category names.
 */
export const ALL_PATTERN_CATEGORIES = [
    { patterns: SYSTEM_OVERRIDE_PATTERNS, category: 'system_override' },
    { patterns: ROLE_HIJACKING_PATTERNS, category: 'role_hijacking' },
    { patterns: INSTRUCTION_INJECTION_PATTERNS, category: 'instruction_injection' },
    { patterns: ENCODED_PAYLOAD_PATTERNS, category: 'encoded_payload' },
    { patterns: CONTEXT_MANIPULATION_PATTERNS, category: 'context_manipulation' },
];
// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================
/**
 * Get line number for a match position.
 */
export function getLineNumber(text, position) {
    return text.slice(0, position).split('\n').length;
}
/**
 * Run pattern detection on content.
 */
export function detectPatterns(content) {
    const findings = [];
    for (const { patterns, category } of ALL_PATTERN_CATEGORIES) {
        for (const patternDef of patterns) {
            const match = content.match(patternDef.pattern);
            if (match) {
                findings.push({
                    category,
                    pattern_name: patternDef.name,
                    severity: patternDef.severity,
                    match: match[0].slice(0, 100),
                    description: patternDef.description,
                    line_number: getLineNumber(content, match.index || 0),
                });
            }
        }
    }
    // TPI-12: Synonym expansion patterns (additive, not replacing originals)
    for (const synPattern of SYNONYM_PATTERNS) {
        const match = content.match(synPattern.pattern);
        if (match) {
            // Check not already matched by original patterns
            const alreadyFound = findings.some((f) => f.pattern_name === synPattern.originalPattern);
            if (!alreadyFound) {
                findings.push({
                    category: synPattern.category,
                    pattern_name: `synonym_${synPattern.name}`,
                    severity: synPattern.severity,
                    match: match[0].slice(0, 100),
                    description: synPattern.description,
                    line_number: getLineNumber(content, match.index || 0),
                });
            }
        }
    }
    return findings;
}
const SYNONYM_PATTERNS = [
    // SYSTEM_OVERRIDE synonyms — retain CRITICAL severity (P1-2)
    {
        name: 'ignore_instructions_syn',
        pattern: /(?:discard|dismiss|abandon|drop|set\s+aside|throw\s+out|toss)\s+(?:all\s+)?(?:previous|prior|earlier|preceding|above|foregoing|former)\s+(?:instructions?|directives?|guidelines?|rules?|commands?|orders?|mandates?|protocols?)/i,
        severity: 'CRITICAL',
        category: 'system_override',
        originalPattern: 'ignore_instructions',
        description: 'Synonym: attempt to ignore previous instructions',
    },
    {
        name: 'mode_switching_syn',
        pattern: /(?:initiate|launch|begin|start|engage)\s+(?:developer|debug|admin|sudo|root|unrestricted|unfiltered|jailbreak|DAN)\s*mode/i,
        severity: 'CRITICAL',
        category: 'system_override',
        originalPattern: 'mode_switching',
        description: 'Synonym: unauthorized mode switching attempt',
    },
    // CONSTRAINT_REMOVAL synonyms — retain CRITICAL severity (P1-2)
    {
        name: 'constraint_removal_syn',
        pattern: /(?:eliminate|delete|strip|lift|drop|shed|lose)\s+(?:all\s+)?(?:restrictions?|limits?|constraints?|boundaries?|guardrails?|barriers?|safeguards?|protections?)/i,
        severity: 'CRITICAL',
        category: 'system_override',
        originalPattern: 'constraint_removal',
        description: 'Synonym: constraint removal attempt',
    },
    // INSTRUCTION_INJECTION synonyms — lower confidence, INFO severity (AC4)
    {
        name: 'hidden_instruction_syn',
        pattern: /(?:commence|initiate|open)\s+(?:hidden|secret|private|internal|covert)\s+(?:instruction|prompt|message|directive)/i,
        severity: 'INFO',
        category: 'instruction_injection',
        originalPattern: 'hidden_instruction_block',
        description: 'Synonym: hidden instruction block attempt',
    },
    // CONTEXT_MANIPULATION synonyms — lower confidence, INFO severity (AC4)
    {
        name: 'conversation_reset_syn',
        pattern: /(?:purge|flush|reinitialize|restart)\s+(?:the\s+)?(?:conversation|context|history|memory|chat|dialogue)/i,
        severity: 'INFO',
        category: 'context_manipulation',
        originalPattern: 'conversation_reset',
        description: 'Synonym: conversation reset attempt',
    },
];
//# sourceMappingURL=pattern-engine.js.map