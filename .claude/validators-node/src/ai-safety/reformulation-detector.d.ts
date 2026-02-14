/**
 * BMAD Validators - Reformulation Detector (TPI-09)
 * ==================================================
 * Detects injection payloads disguised through code formatting:
 * - Code comments (10+ styles): //, block comments, #, --, %, REM, etc.
 * - Multi-line comments: triple-quote, Haskell, Pascal
 * - HTML/XML comments
 * - Markdown code blocks and inline code
 * - Variable/function name encoding
 *
 * LIBRARY MODULE ONLY — no bin entry point (P1-4).
 * Called from prompt-injection.ts pipeline.
 */
import type { Severity } from '../types/index.js';
export interface ReformulationFinding {
    category: string;
    pattern_name: string;
    severity: Severity;
    source_type: string;
    extracted_text: string;
    description: string;
}
/**
 * Detect injection payloads hidden in code format constructs.
 *
 * 1. Extracts text from code comments (10+ comment styles)
 * 2. Runs pattern engine detection on extracted text
 * 3. Detects variable/function name encoding
 *
 * Returns array of ReformulationFinding objects.
 */
export declare function detectCodeFormatInjection(content: string): ReformulationFinding[];
/**
 * Detect character-level encoded injection payloads.
 * Decodes ROT13, ROT47, reverse text, acrostic, and pig latin.
 */
export declare function detectCharacterLevelEncoding(content: string): ReformulationFinding[];
/**
 * Detect context overload and many-shot injection patterns.
 * - Token flooding: long content with high repetition
 * - Many-shot: >10 similar instruction patterns in single message
 * - Repetition: >40% sentences share same hash bucket (O(n) hash-based, P1-5)
 */
export declare function detectContextOverload(content: string): ReformulationFinding[];
/**
 * Detect mathematical/logical encoding of injection payloads.
 */
export declare function detectMathLogicEncoding(content: string): ReformulationFinding[];
