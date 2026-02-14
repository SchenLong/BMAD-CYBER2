/**
 * BMAD Validators - Agent Output Injection Patterns (TPI-03)
 * ============================================================
 * Detects injection payloads in Task/Skill (subagent) output.
 * These patterns target agent-specific attack vectors:
 * - Fake tool call formatting
 * - Privilege escalation claims
 * - Self-referential loops ("ask user to run...")
 * - System-level instruction injection in agent response
 *
 * Reference: TPI-CROWDSTRIKE Implementation Plan, Story TPI-03
 */
import type { Severity } from '../types/index.js';
/** A finding from agent output pattern analysis. */
export interface AgentOutputFinding {
    category: string;
    pattern_name: string;
    severity: Severity;
    match?: string;
    description: string;
}
interface AgentPatternDef {
    name: string;
    pattern: RegExp;
    severity: Severity;
    description: string;
}
/** Patterns detecting fake tool call formatting in agent output. */
declare const FAKE_TOOL_CALL_PATTERNS: AgentPatternDef[];
/** Patterns detecting privilege escalation claims in agent output. */
declare const PRIVILEGE_ESCALATION_PATTERNS: AgentPatternDef[];
/** Patterns detecting self-referential loops (agent trying to get user to execute). */
declare const SELF_REFERENTIAL_PATTERNS: AgentPatternDef[];
declare const ALL_AGENT_PATTERNS: AgentPatternDef[];
/**
 * Analyze agent/skill output for agent-specific injection patterns.
 * Runs ADDITIONAL checks beyond what analyzeContent() already does.
 *
 * @param content - The agent/skill output text
 * @returns Array of agent-specific findings
 */
export declare function analyzeAgentOutput(content: string): AgentOutputFinding[];
export { FAKE_TOOL_CALL_PATTERNS, PRIVILEGE_ESCALATION_PATTERNS, SELF_REFERENTIAL_PATTERNS, ALL_AGENT_PATTERNS, };
