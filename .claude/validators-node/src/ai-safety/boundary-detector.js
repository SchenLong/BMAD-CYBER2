/**
 * BMAD Validators - Prompt Boundary Detector (TPI-14)
 * ====================================================
 * Detects techniques that attempt to terminate system prompt sections
 * and inject attacker content at system level.
 *
 * Categories:
 * - Closing system tags: </system>, </s>, [/INST], [END SYSTEM]
 * - Control tokens: <|endoftext|>, <|im_start|>, <<SYS>>
 * - System prompt close markers: ---END SYSTEM PROMPT---, ===SYSTEM END===
 * - Meta-instruction boundaries: BEGIN USER CONTENT, END SYSTEM CONTENT
 *
 * LIBRARY MODULE ONLY — no bin entry point.
 * Called from prompt-injection.ts pipeline.
 */
/**
 * Closing system tag patterns.
 */
const CLOSING_SYSTEM_TAG_PATTERNS = [
    {
        name: 'closing_system_xml',
        pattern: /<\/\s*(?:system|instructions|context|prompt)\s*>/i,
        severity: 'CRITICAL',
        description: 'XML closing system/instructions tag',
    },
    {
        name: 'closing_inst_tag',
        pattern: /\[\/?INST\]/i,
        severity: 'CRITICAL',
        description: 'Instruction delimiter tag [/INST] or [INST]',
    },
    {
        name: 'end_system_marker',
        pattern: /\[(?:END|STOP)\s+(?:SYSTEM|INSTRUCTIONS|CONTEXT)\]/i,
        severity: 'CRITICAL',
        description: 'Bracketed end-of-system marker',
    },
    {
        name: 'closing_s_tag',
        pattern: /<\/s>/,
        severity: 'CRITICAL',
        description: 'Sentence boundary tag </s> (model-specific)',
    },
];
/**
 * Control token injection patterns.
 */
const CONTROL_TOKEN_PATTERNS = [
    {
        name: 'openai_control_token',
        pattern: /<\|(?:endoftext|im_start|im_end|system|user|assistant|pad)\|>/i,
        severity: 'CRITICAL',
        description: 'OpenAI-style control token injection',
    },
    {
        name: 'llama_sys_tag',
        pattern: /<<\/?SYS>>/,
        severity: 'CRITICAL',
        description: 'LLaMA system tag <<SYS>> or <</SYS>>',
    },
    {
        name: 'special_token_s',
        pattern: /<s>/,
        severity: 'WARNING',
        description: 'Special token <s> (sentence start)',
    },
];
/**
 * System prompt close patterns (informal markers).
 */
const SYSTEM_PROMPT_CLOSE_PATTERNS = [
    {
        name: 'dashed_end_marker',
        pattern: /---\s*(?:END|STOP)\s+(?:SYSTEM|OF)\s+(?:PROMPT|INSTRUCTIONS|SYSTEM)\s*---/i,
        severity: 'WARNING',
        description: 'Dashed end-of-system-prompt marker',
    },
    {
        name: 'equals_end_marker',
        pattern: /===\s*(?:SYSTEM|INSTRUCTIONS?)\s+(?:END|COMPLETE|DONE)\s*===/i,
        severity: 'WARNING',
        description: 'Equals-delimited system end marker',
    },
    {
        name: 'asterisk_end_marker',
        pattern: /\*\*\*\s*(?:END|STOP)\s+(?:OF\s+)?(?:INSTRUCTIONS|SYSTEM)\s*\*\*\*/i,
        severity: 'WARNING',
        description: 'Asterisk-delimited instruction end marker',
    },
    {
        name: 'braced_end_marker',
        pattern: /\{(?:end_of_system_prompt|end_system|system_end|stop_instructions)\}/i,
        severity: 'WARNING',
        description: 'Brace-delimited system end marker',
    },
];
/**
 * Meta-instruction boundary patterns.
 */
const META_INSTRUCTION_PATTERNS = [
    {
        name: 'begin_user_content',
        pattern: /(?:BEGIN|START)\s+(?:USER|HUMAN)\s+(?:CONTENT|INPUT|MESSAGE)/i,
        severity: 'WARNING',
        description: 'Meta-instruction: begin user content marker',
    },
    {
        name: 'end_system_content',
        pattern: /(?:END|STOP)\s+(?:SYSTEM|AI|ASSISTANT)\s+(?:CONTENT|MESSAGE|INSTRUCTIONS)/i,
        severity: 'WARNING',
        description: 'Meta-instruction: end system content marker',
    },
    {
        name: 'below_is_user',
        pattern: /(?:BELOW|FOLLOWING)\s+(?:IS|ARE)\s+(?:THE\s+)?(?:USER|HUMAN)\s+(?:INPUT|CONTENT|MESSAGE)/i,
        severity: 'WARNING',
        description: 'Meta-instruction: directional user content marker',
    },
    {
        name: 'above_was_system',
        pattern: /(?:ABOVE|PRECEDING)\s+(?:WAS|IS)\s+(?:THE\s+)?(?:SYSTEM|AI)\s+(?:PROMPT|MESSAGE|INSTRUCTIONS)/i,
        severity: 'WARNING',
        description: 'Meta-instruction: directional system reference marker',
    },
];
/**
 * All boundary pattern categories combined.
 */
const ALL_BOUNDARY_CATEGORIES = [
    { patterns: CLOSING_SYSTEM_TAG_PATTERNS, category: 'closing_system_tag' },
    { patterns: CONTROL_TOKEN_PATTERNS, category: 'control_token' },
    { patterns: SYSTEM_PROMPT_CLOSE_PATTERNS, category: 'system_prompt_close' },
    { patterns: META_INSTRUCTION_PATTERNS, category: 'meta_instruction_boundary' },
];
// =============================================================================
// DETECTION FUNCTION
// =============================================================================
/**
 * Detect prompt boundary manipulation attempts.
 * Runs on both raw content (pre-normalization) and normalized content
 * to catch confusable character variants (P1-10).
 *
 * @param rawContent - Original content before normalization
 * @param normalizedContent - Content after normalizeText() processing
 * @returns Array of boundary manipulation findings
 */
export function detectBoundaryManipulation(rawContent, normalizedContent) {
    if (!rawContent || rawContent.trim().length === 0) {
        return [];
    }
    const findings = [];
    const seenPatterns = new Set();
    // Scan raw content first (catches exact tokens)
    for (const { patterns, category } of ALL_BOUNDARY_CATEGORIES) {
        for (const patternDef of patterns) {
            const match = rawContent.match(patternDef.pattern);
            if (match) {
                seenPatterns.add(patternDef.name);
                findings.push({
                    category: `boundary_${category}`,
                    pattern_name: patternDef.name,
                    severity: patternDef.severity,
                    match: match[0].slice(0, 100),
                    description: patternDef.description,
                });
            }
        }
    }
    // Also scan normalized content if different (catches confusable variants, P1-10)
    if (normalizedContent && normalizedContent !== rawContent) {
        for (const { patterns, category } of ALL_BOUNDARY_CATEGORIES) {
            for (const patternDef of patterns) {
                if (seenPatterns.has(patternDef.name))
                    continue; // Already found in raw
                const match = normalizedContent.match(patternDef.pattern);
                if (match) {
                    findings.push({
                        category: `boundary_${category}`,
                        pattern_name: `confusable_${patternDef.name}`,
                        severity: patternDef.severity,
                        match: match[0].slice(0, 100),
                        description: `Confusable variant: ${patternDef.description}`,
                    });
                }
            }
        }
    }
    return findings;
}
//# sourceMappingURL=boundary-detector.js.map