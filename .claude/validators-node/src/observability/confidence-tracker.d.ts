/**
 * BMAD Guardrails: Confidence Indicators
 * ========================================
 * Implements confidence scoring and uncertainty detection for model responses.
 *
 * Features:
 * - Track uncertainty markers in model responses
 * - Flag responses containing hedging language
 * - Add confidence indicators for code generation
 * - Implement source attribution tracking
 * - Display confidence in user-facing output
 *
 * OWASP Reference: LLM09 - Overreliance
 * Requirements: REQ-3.1.1 through REQ-3.1.5
 *
 * Usage:
 *   import { getConfidenceTracker, analyzeResponseConfidence } from './confidence-tracker.js';
 *
 *   const tracker = getConfidenceTracker();
 *   const result = tracker.analyzeText("I think this might work, but I'm not sure...");
 */
/** Confidence levels for responses */
export declare enum ConfidenceLevel {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    VERY_LOW = "very_low"
}
/** A detected uncertainty marker */
export interface UncertaintyMatch {
    pattern: string;
    text: string;
    severity: 'high' | 'medium' | 'low';
    position: number;
}
/** A detected source attribution */
export interface SourceAttribution {
    sourceType: string;
    text: string;
    position: number;
}
/** Result of confidence analysis */
export interface ConfidenceResult {
    confidenceLevel: ConfidenceLevel;
    confidenceScore: number;
    uncertaintyMarkers: UncertaintyMatch[];
    confidenceBoosters: string[];
    attributions: SourceAttribution[];
    codeWarnings: string[];
    textLength: number;
    analysisNotes: string[];
    displayIndicator: string;
}
/**
 * Tracks and analyzes confidence indicators in model responses.
 *
 * Provides transparency to users about the certainty level of
 * generated content to prevent overreliance.
 */
export declare class ConfidenceTracker {
    private stateFile;
    private lockFile;
    private compiledUncertainty;
    private compiledBoosters;
    private compiledCode;
    private compiledAttribution;
    constructor();
    private ensureDirs;
    private loadState;
    private initialState;
    private saveState;
    private detectUncertaintyMarkers;
    private detectConfidenceBoosters;
    private detectCodeWarnings;
    private detectAttributions;
    private calculateConfidenceScore;
    private scoreToLevel;
    private getDisplayIndicator;
    /**
     * Analyze text for confidence indicators.
     */
    analyzeText(text: string): ConfidenceResult;
    /**
     * Record analysis result to session state.
     */
    recordAnalysis(result: ConfidenceResult): void;
    /**
     * Get session confidence statistics.
     */
    getSessionStats(): Record<string, unknown>;
    /**
     * Reset confidence tracking for new session.
     */
    reset(): void;
}
/**
 * Get or create the global confidence tracker instance.
 */
export declare function getConfidenceTracker(): ConfidenceTracker;
/**
 * Analyze confidence of a response text.
 *
 * @returns Tuple of [confidence_level, confidence_score, display_indicator]
 */
export declare function analyzeResponseConfidence(text: string): [string, number, string];
/**
 * Get just the confidence indicator string for a text.
 */
export declare function getConfidenceIndicator(text: string): string;
/**
 * Analyze tool output for confidence indicators as a post-tool hook.
 *
 * This is called after tool execution to add confidence indicators
 * to the response when appropriate.
 *
 * @returns Exit code: Always 0 (informational only, never blocks)
 */
export declare function analyzeToolOutput(): number;
/**
 * CLI main function.
 */
export declare function main(): void;
