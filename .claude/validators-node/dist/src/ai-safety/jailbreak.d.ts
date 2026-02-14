/**
 * BMAD Guardrails: Jailbreak Guard
 * =================================
 * Multi-layer defense against AI jailbreak attempts.
 *
 * Exit Codes:
 * - 0: Allow the operation (info severity or clean)
 * - 2: Block the operation (warning/critical severity)
 *
 * Detection Layers:
 * 1. Unicode normalization and confusable character mapping
 * 2. Pattern matching (44 patterns across 10 categories)
 * 3. Multi-turn pattern detection
 * 4. Fuzzy matching for keyword variations
 * 5. Heuristic behavioral analysis
 * 6. Session risk tracking with decay and escalation
 *
 * Security Note: This validator uses harmless test patterns.
 * See lessonlearned.md - NEVER use destructive commands in test strings.
 */
import { type Severity } from '../types/index.js';
import { normalizeText } from './text-normalizer.js';
export { normalizeText };
/**
 * Jailbreak finding result.
 */
export interface JailbreakFinding {
    category: string;
    pattern_name: string;
    severity: Severity;
    weight: number;
    match?: string;
    description: string;
    escalated?: boolean;
}
/**
 * Fuzzy finding result.
 */
export interface FuzzyFinding {
    category: string;
    matched_word: string;
    target_keyword: string;
    similarity: number;
    severity: Severity;
    weight: number;
    description: string;
}
/**
 * Fuzzy match keywords in text.
 */
export declare function fuzzyMatchKeywords(text: string, threshold?: number): FuzzyFinding[];
/**
 * Heuristic finding result.
 */
export interface HeuristicFinding {
    category: string;
    heuristic_name: string;
    severity: Severity;
    weight: number;
    description: string;
    details?: string;
}
/**
 * Detect heuristic patterns.
 */
export declare function detectHeuristicPatterns(text: string): HeuristicFinding[];
/**
 * Multi-turn finding.
 */
export interface MultiTurnFinding {
    category: string;
    pattern_name: string;
    severity: Severity;
    weight: number;
    description: string;
}
/**
 * Detect multi-turn setup patterns.
 */
export declare function detectMultiTurnPatterns(text: string): MultiTurnFinding[];
/**
 * Complete analysis result.
 */
export interface JailbreakAnalysisResult {
    findings: JailbreakFinding[];
    fuzzy_findings: FuzzyFinding[];
    heuristic_findings: HeuristicFinding[];
    multi_turn_findings: MultiTurnFinding[];
    obfuscation_detected: boolean;
    highest_severity: Severity;
    should_block: boolean;
    risk_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    is_escalating: boolean;
}
/**
 * Run pattern detection on content.
 */
export declare function detectPatterns(content: string): JailbreakFinding[];
/**
 * Analyze content for jailbreak attempts.
 */
export declare function analyzeContent(content: string, sessionId?: string): JailbreakAnalysisResult;
/**
 * Validate content for jailbreak attempts.
 */
export declare function validateJailbreak(content: string, toolName: string, sessionId?: string): {
    exitCode: number;
    result: JailbreakAnalysisResult;
};
/**
 * CLI entry point.
 */
export declare function main(): void;
