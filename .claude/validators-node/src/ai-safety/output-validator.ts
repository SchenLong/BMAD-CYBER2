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

import * as fs from 'fs';
import * as path from 'path';
import {
  AuditLogger,
  getProjectDir,
} from '../common/index.js';
import { analyzeContent } from './prompt-injection.js';
import {
  analyzeWebContent,
  computeEffectiveSeverity,
  recordUrlFinding,
} from './web-content-patterns.js';
import type { WebContentFinding } from './web-content-patterns.js';
import { analyzeAgentOutput } from './agent-output-patterns.js';
import type { AgentOutputFinding } from './agent-output-patterns.js';
import { analyzeSearchResults } from './web-search-patterns.js';
import type { SearchResultFinding } from './web-search-patterns.js';
import type { PostToolInput, Severity } from '../types/index.js';
import { EXIT_CODES } from '../types/index.js';

const VALIDATOR_NAME = 'output_validator';

/** Maximum output size in bytes (1MB). Larger outputs are rejected (P1-7). */
const MAX_OUTPUT_SIZE = 1024 * 1024;

/** Maximum JSON nesting depth (P1-7). */
const MAX_JSON_DEPTH = 50;

/** Tool names we validate in PostToolUse. */
const VALIDATED_TOOLS = ['WebFetch', 'Task', 'Skill', 'WebSearch'];

// =============================================================================
// INPUT PARSING
// =============================================================================

/**
 * Read and parse PostToolUse stdin input.
 * Fail-closed: returns null only for genuinely empty stdin.
 * Throws on malformed JSON (caller handles with exit 2).
 */
export function parsePostToolInput(): PostToolInput | null {
  let raw: string;
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    // No stdin available (e.g., piped empty)
    return null;
  }

  if (!raw || raw.trim().length === 0) {
    return null;
  }

  // Size limit check on raw input (P1-7)
  if (Buffer.byteLength(raw, 'utf8') > MAX_OUTPUT_SIZE * 2) {
    throw new Error(`Input exceeds maximum size (${MAX_OUTPUT_SIZE * 2} bytes)`);
  }

  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Stdin is not a JSON object');
  }

  return {
    tool_name: parsed.tool_name ?? '',
    tool_input: parsed.tool_input ?? {},
    tool_response: parsed.tool_response ?? {},
    session_id: parsed.session_id,
    cwd: parsed.cwd ?? getProjectDir(),
    hook_event_name: parsed.hook_event_name,
    tool_use_id: parsed.tool_use_id,
  };
}

// =============================================================================
// SIZE AND DEPTH VALIDATION (P1-7)
// =============================================================================

/**
 * Check JSON depth of an object. Throws if depth exceeds limit.
 */
export function checkJsonDepth(obj: unknown, maxDepth: number = MAX_JSON_DEPTH, currentDepth: number = 0): void {
  if (currentDepth > maxDepth) {
    throw new Error(`JSON depth exceeds maximum (${maxDepth} levels)`);
  }

  if (obj && typeof obj === 'object') {
    const entries = Array.isArray(obj) ? obj : Object.values(obj);
    for (const value of entries) {
      checkJsonDepth(value, maxDepth, currentDepth + 1);
    }
  }
}

/**
 * Check output size. Throws if too large.
 */
export function checkOutputSize(content: string): void {
  if (Buffer.byteLength(content, 'utf8') > MAX_OUTPUT_SIZE) {
    throw new Error(`Output exceeds maximum size (${MAX_OUTPUT_SIZE} bytes)`);
  }
}

// =============================================================================
// OUTPUT EXTRACTION
// =============================================================================

/**
 * Extract the text content to analyze from a PostToolUse tool_response.
 * Returns the text content string, or null if nothing to analyze.
 */
export function getOutputToAnalyze(toolName: string, toolResponse: Record<string, unknown>): string | null {
  if (!toolResponse || typeof toolResponse !== 'object') {
    return null;
  }

  switch (toolName) {
    case 'WebFetch': {
      // WebFetch response contains the fetched content
      const body = toolResponse.response_body ?? toolResponse.content ?? toolResponse.result;
      return typeof body === 'string' ? body : JSON.stringify(toolResponse);
    }

    case 'Task': {
      // Task output contains the subagent result
      const result = toolResponse.result ?? toolResponse.output ?? toolResponse.content;
      return typeof result === 'string' ? result : JSON.stringify(toolResponse);
    }

    case 'Skill': {
      // Skill output contains the skill execution result
      const result = toolResponse.result ?? toolResponse.output ?? toolResponse.content;
      return typeof result === 'string' ? result : JSON.stringify(toolResponse);
    }

    case 'WebSearch': {
      // WebSearch results may be in various formats
      const results = toolResponse.results ?? toolResponse.content ?? toolResponse.output;
      return typeof results === 'string' ? results : JSON.stringify(toolResponse);
    }

    default:
      return null;
  }
}

// =============================================================================
// CONTAMINATION FLAG (P1-12)
// =============================================================================

const CONTAMINATION_FILENAME = '.contamination_flag.json';

interface ContaminationState {
  contaminated: boolean;
  set_at?: number;
  reason?: string;
  tool_name?: string;
}

/**
 * Get contamination flag file path.
 */
function getContaminationFlagPath(): string {
  const projectDir = getProjectDir();
  return path.join(projectDir, '.claude', 'logs', CONTAMINATION_FILENAME);
}

/**
 * Set the session contamination flag (P1-12).
 * Called when WARNING+ findings detected in tool output.
 */
export function setContaminationFlag(toolName: string, reason: string): void {
  const flagPath = getContaminationFlagPath();
  const state: ContaminationState = {
    contaminated: true,
    set_at: Date.now(),
    reason,
    tool_name: toolName,
  };

  try {
    const dir = path.dirname(flagPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(flagPath, JSON.stringify(state, null, 2) + '\n');
  } catch {
    // Non-fatal: contamination flag is advisory
  }
}

/**
 * Check if session is contaminated (P1-12).
 */
export function isSessionContaminated(): boolean {
  try {
    const flagPath = getContaminationFlagPath();
    if (!fs.existsSync(flagPath)) return false;
    const state: ContaminationState = JSON.parse(fs.readFileSync(flagPath, 'utf-8'));
    return state.contaminated === true;
  } catch {
    return false;
  }
}

// =============================================================================
// CORE VALIDATION
// =============================================================================

/**
 * Validate PostToolUse output content for injection patterns.
 *
 * @param toolName - The tool that produced the output
 * @param toolResponse - The tool's response object
 * @param toolInput - The original tool input (for URL tracking in WebFetch)
 * @returns Exit code (0 = allow, 2 = block)
 */
export function validateOutput(
  toolName: string,
  toolResponse: Record<string, unknown>,
  toolInput?: Record<string, unknown>,
): number {
  const content = getOutputToAnalyze(toolName, toolResponse);

  if (!content || content.trim().length === 0) {
    AuditLogger.logAllowed(VALIDATOR_NAME, 'Empty output — nothing to validate', {
      tool_name: toolName,
    });
    return EXIT_CODES.ALLOW;
  }

  // Check output size (P1-7)
  try {
    checkOutputSize(content);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Output too large';
    console.error(`[${VALIDATOR_NAME}] ${msg}`);
    AuditLogger.logBlocked(VALIDATOR_NAME, msg, toolName, {
      tool_name: toolName,
      content_size: Buffer.byteLength(content, 'utf8'),
    });
    return EXIT_CODES.HARD_BLOCK;
  }

  // Run standard injection analysis
  const result = analyzeContent(content);

  // Run tool-specific analysis (TPI-02, TPI-03, TPI-05)
  let webFindings: WebContentFinding[] = [];
  let agentFindings: AgentOutputFinding[] = [];
  let searchFindings: SearchResultFinding[] = [];

  if (toolName === 'WebFetch') {
    webFindings = analyzeWebContent(content);
  } else if (toolName === 'Task' || toolName === 'Skill') {
    agentFindings = analyzeAgentOutput(content);
  } else if (toolName === 'WebSearch') {
    searchFindings = analyzeSearchResults(content);
  }

  const extraFindings = [...webFindings, ...agentFindings, ...searchFindings];
  const totalFindingCount = result.findings.length + extraFindings.length;
  const hasStandardBlock = result.should_block;
  const extraEffectiveSeverity = computeEffectiveSeverity(extraFindings);
  const shouldBlock = hasStandardBlock ||
    extraEffectiveSeverity === 'CRITICAL' ||
    extraEffectiveSeverity === 'WARNING';

  // URL reputation tracking for WebFetch (TPI-02)
  const url = toolInput?.url as string | undefined;
  if (toolName === 'WebFetch' && url && totalFindingCount > 0) {
    const highestSev: Severity = hasStandardBlock
      ? result.highest_severity
      : extraEffectiveSeverity;
    const repEntry = recordUrlFinding(url, totalFindingCount, highestSev);

    // Escalate on repeat offender
    if (repEntry.finding_count > totalFindingCount) {
      AuditLogger.logBlocked(VALIDATOR_NAME, 'Repeat offender URL', toolName, {
        url,
        total_findings: repEntry.finding_count,
        visits: repEntry.finding_count,
      });
    }
  }

  if (shouldBlock) {
    const allFindings = [
      ...result.findings.map((f) => `[${f.severity}] ${f.category}: ${f.description}`),
      ...extraFindings.map((f) => `[${f.severity}] ${f.category}: ${f.description}`),
    ];
    const findingSummary = allFindings.join('; ');

    console.error(
      `[${VALIDATOR_NAME}] INJECTION DETECTED in ${toolName} output: ${findingSummary}`
    );

    // Attribution logging for agent output (TPI-03 AC3)
    const agentType = toolInput?.subagent_type as string | undefined;
    const agentId = toolInput?.agent_id as string | undefined;

    AuditLogger.logBlocked(VALIDATOR_NAME, 'Injection detected in tool output', toolName, {
      tool_name: toolName,
      findings_count: totalFindingCount,
      web_findings_count: webFindings.length,
      agent_findings_count: agentFindings.length,
      search_findings_count: searchFindings.length,
      max_severity: hasStandardBlock ? result.highest_severity : extraEffectiveSeverity,
      findings_summary: findingSummary.slice(0, 500),
      url: url || undefined,
      agent_type: agentType || undefined,
      agent_id: agentId || undefined,
    });

    // Set contamination flag on WARNING+ (P1-12)
    setContaminationFlag(toolName, `Injection detected: ${findingSummary.slice(0, 200)}`);

    return EXIT_CODES.HARD_BLOCK;
  }

  // Log clean results for audit trail
  AuditLogger.logAllowed(VALIDATOR_NAME, 'Output validated — clean', {
    tool_name: toolName,
    findings_count: totalFindingCount,
    content_size: Buffer.byteLength(content, 'utf8'),
    url: url || undefined,
  });

  return EXIT_CODES.ALLOW;
}

// =============================================================================
// CLI ENTRY POINT
// =============================================================================

/**
 * Main entry point for PostToolUse hook execution.
 * Fail-closed: ALL genuine errors exit(2) (P1-6).
 * Exit(0) ONLY for out-of-scope (unrecognized tool) or clean output.
 */
export function main(): void {
  try {
    const input = parsePostToolInput();

    if (!input) {
      // Empty stdin — allow (no data to validate)
      process.exit(EXIT_CODES.ALLOW);
    }

    const { tool_name, tool_input, tool_response } = input;

    // Out-of-scope: unrecognized tool → exit(0) (not an error)
    if (!VALIDATED_TOOLS.includes(tool_name)) {
      process.exit(EXIT_CODES.ALLOW);
    }

    // Check JSON depth of tool_response (P1-7)
    checkJsonDepth(tool_response);

    const exitCode = validateOutput(tool_name, tool_response, tool_input);
    process.exit(exitCode);
  } catch (error) {
    // Fail-closed: ALL genuine errors exit(2) (P1-6)
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${VALIDATOR_NAME}] FAIL-CLOSED: ${msg}`);

    try {
      AuditLogger.logBlocked(VALIDATOR_NAME, `Fail-closed: ${msg}`, 'PostToolUse', {
        error_type: error instanceof Error ? error.constructor.name : typeof error,
      });
    } catch {
      // If audit logging fails, still exit(2)
    }

    process.exit(EXIT_CODES.HARD_BLOCK);
  }
}

// Direct execution guard
const scriptName = 'output-validator';
if (process.argv[1] && (
  process.argv[1].endsWith(`${scriptName}.js`) ||
  process.argv[1].endsWith(`${scriptName}.ts`)
)) {
  main();
}
