/**
 * BMAD Validators - PostToolUse Output Validator (TPI-00)
 * ========================================================
 * Validates tool output content for injection payloads before it enters
 * the LLM context. This is the PostToolUse counterpart to the PreToolUse
 * prompt-injection validator.
 *
 * Scans output from: WebFetch, Task, Skill, WebSearch
 *
 * Exit Codes:
 * - 0: ALLOW (clean output, or out-of-scope tool)
 * - 2: HARD_BLOCK (injection detected, or fail-closed error)
 *
 * Security Principles:
 * - Fail-closed: genuine errors exit(2), not exit(0) (P1-6)
 * - Size limits: >1MB output rejected to prevent OOM (P1-7)
 * - Depth limits: JSON depth >50 rejected (P1-7)
 *
 * Reference: TPI-CROWDSTRIKE Implementation Plan, Story TPI-00
 */
import type { PostToolInput } from '../types/index.js';
/**
 * Read and parse PostToolUse stdin input.
 * Fail-closed: returns null only for genuinely empty stdin.
 * Throws on malformed JSON (caller handles with exit 2).
 */
export declare function parsePostToolInput(): PostToolInput | null;
/**
 * Check JSON depth of an object. Throws if depth exceeds limit.
 */
export declare function checkJsonDepth(obj: unknown, maxDepth?: number, currentDepth?: number): void;
/**
 * Check output size. Throws if too large.
 */
export declare function checkOutputSize(content: string): void;
/**
 * Extract the text content to analyze from a PostToolUse tool_response.
 * Returns the text content string, or null if nothing to analyze.
 */
export declare function getOutputToAnalyze(toolName: string, toolResponse: Record<string, unknown>): string | null;
/**
 * Set the session contamination flag (P1-12).
 * Called when WARNING+ findings detected in tool output.
 */
export declare function setContaminationFlag(toolName: string, reason: string): void;
/**
 * Check if session is contaminated (P1-12).
 */
export declare function isSessionContaminated(): boolean;
/**
 * Validate PostToolUse output content for injection patterns.
 *
 * @param toolName - The tool that produced the output
 * @param toolResponse - The tool's response object
 * @param toolInput - The original tool input (for URL tracking in WebFetch)
 * @returns Exit code (0 = allow, 2 = block)
 */
export declare function validateOutput(toolName: string, toolResponse: Record<string, unknown>, toolInput?: Record<string, unknown>): number;
/**
 * Main entry point for PostToolUse hook execution.
 * Fail-closed: ALL genuine errors exit(2) (P1-6).
 * Exit(0) ONLY for out-of-scope (unrecognized tool) or clean output.
 */
export declare function main(): void;
