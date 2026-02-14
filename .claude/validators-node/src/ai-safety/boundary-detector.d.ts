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
import type { Severity } from '../types/index.js';
export interface BoundaryFinding {
    category: string;
    pattern_name: string;
    severity: Severity;
    match: string;
    description: string;
}
/**
 * Detect prompt boundary manipulation attempts.
 * Runs on both raw content (pre-normalization) and normalized content
 * to catch confusable character variants (P1-10).
 *
 * @param rawContent - Original content before normalization
 * @param normalizedContent - Content after normalizeText() processing
 * @returns Array of boundary manipulation findings
 */
export declare function detectBoundaryManipulation(rawContent: string, normalizedContent?: string): BoundaryFinding[];
