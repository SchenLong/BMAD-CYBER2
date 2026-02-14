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
import type { Severity } from '../types/index.js';
/**
 * Pattern finding result.
 */
export interface PatternFinding {
    category: string;
    pattern_name: string;
    severity: Severity;
    match?: string;
    description: string;
    line_number?: number;
}
/**
 * Pattern definition structure.
 */
export interface PatternDefinition {
    name: string;
    pattern: RegExp;
    severity: Severity;
    description: string;
}
/**
 * Category A: System Override Patterns
 * Attempts to override system instructions or behavior.
 */
export declare const SYSTEM_OVERRIDE_PATTERNS: PatternDefinition[];
/**
 * Category B: Role Hijacking Patterns
 * Attempts to inject fake conversation roles.
 */
export declare const ROLE_HIJACKING_PATTERNS: PatternDefinition[];
/**
 * Category C: Instruction Injection Patterns
 * Direct attempts to inject new instructions.
 */
export declare const INSTRUCTION_INJECTION_PATTERNS: PatternDefinition[];
/**
 * Category D: Encoded Payload Patterns
 * Attempts to hide malicious content via encoding.
 */
export declare const ENCODED_PAYLOAD_PATTERNS: PatternDefinition[];
/**
 * Category E: Context Manipulation Patterns
 * Attempts to manipulate conversation context.
 */
export declare const CONTEXT_MANIPULATION_PATTERNS: PatternDefinition[];
/**
 * Critical patterns used for decoded content scanning.
 */
export declare const CRITICAL_PATTERNS: PatternDefinition[];
/**
 * All pattern categories with their category names.
 */
export declare const ALL_PATTERN_CATEGORIES: readonly [{
    readonly patterns: PatternDefinition[];
    readonly category: "system_override";
}, {
    readonly patterns: PatternDefinition[];
    readonly category: "role_hijacking";
}, {
    readonly patterns: PatternDefinition[];
    readonly category: "instruction_injection";
}, {
    readonly patterns: PatternDefinition[];
    readonly category: "encoded_payload";
}, {
    readonly patterns: PatternDefinition[];
    readonly category: "context_manipulation";
}];
/**
 * Get line number for a match position.
 */
export declare function getLineNumber(text: string, position: number): number;
/**
 * Run pattern detection on content.
 */
export declare function detectPatterns(content: string): PatternFinding[];
