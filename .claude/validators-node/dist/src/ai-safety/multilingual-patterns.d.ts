/**
 * BMAD Validators - Multilingual Injection Patterns (TPI-15)
 * ===========================================================
 * Injection patterns in 10 languages: Spanish, French, German, Portuguese,
 * Italian, Chinese Simplified, Japanese, Korean, Russian, Arabic.
 *
 * Categories per language: SYSTEM_OVERRIDE, CONSTRAINT_REMOVAL, MODE_SWITCHING, ROLE_HIJACKING
 * Plus romanized transliterations for CJK/Cyrillic (P2-5, BYPASS-5).
 *
 * LIBRARY MODULE ONLY — no bin entry point.
 * Called from prompt-injection.ts pipeline.
 */
import type { Severity } from '../types/index.js';
export interface MultilingualFinding {
    category: string;
    pattern_name: string;
    severity: Severity;
    language: string;
    match: string;
    description: string;
}
/**
 * Detect multilingual injection patterns.
 * Runs after Unicode normalization for CJK text.
 *
 * @param content - Text content to scan (should be post-normalization for CJK)
 * @returns Array of multilingual injection findings
 */
export declare function detectMultilingualInjection(content: string): MultilingualFinding[];
/**
 * Get the count of languages covered.
 */
export declare function getLanguageCount(): number;
/**
 * Get pattern count per language.
 */
export declare function getPatternCountByLanguage(): Record<string, number>;
