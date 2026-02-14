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
// =============================================================================
// FAKE TOOL CALL PATTERNS
// =============================================================================
/** Patterns detecting fake tool call formatting in agent output. */
const FAKE_TOOL_CALL_PATTERNS = [
    {
        name: 'fake_function_call_xml',
        pattern: /<(?:antml:)?(?:function_calls?|tool_use|invoke)\s*>/i,
        severity: 'CRITICAL',
        description: 'Fake XML function call formatting in agent output',
    },
    {
        name: 'fake_tool_result',
        pattern: /<(?:antml:)?(?:function_results?|tool_result|result)\s*>/i,
        severity: 'CRITICAL',
        description: 'Fake tool result formatting in agent output',
    },
    {
        name: 'fake_tool_use_json',
        pattern: /["']?tool_use["']?\s*:\s*\{[^}]*["']?(?:name|type)["']?\s*:\s*["'](?:Bash|Write|Edit|Read)/i,
        severity: 'CRITICAL',
        description: 'Fake tool use JSON structure in agent output',
    },
];
// =============================================================================
// PRIVILEGE ESCALATION PATTERNS
// =============================================================================
/** Patterns detecting privilege escalation claims in agent output. */
const PRIVILEGE_ESCALATION_PATTERNS = [
    {
        name: 'admin_authorization',
        pattern: /(?:as\s+(?:an?\s+)?admin|with\s+admin\s+(?:privileges?|access|rights?))\s*[,.]?\s*(?:I\s+)?(?:authorize|approve|grant|allow|permit)/i,
        severity: 'WARNING',
        description: 'Privilege escalation: admin authorization claim',
    },
    {
        name: 'override_authorization',
        pattern: /(?:I\s+(?:am\s+)?(?:authorized|permitted|allowed)\s+to\s+(?:override|bypass|skip)|override\s+(?:security|safety|permission))/i,
        severity: 'WARNING',
        description: 'Privilege escalation: override authorization claim',
    },
    {
        name: 'elevated_permissions',
        pattern: /(?:elevat(?:e|ed|ing)\s+(?:my\s+)?(?:permissions?|privileges?|access)|(?:sudo|root|superuser)\s+(?:mode|access|permission))/i,
        severity: 'WARNING',
        description: 'Privilege escalation: elevated permissions claim',
    },
];
// =============================================================================
// SELF-REFERENTIAL LOOP PATTERNS
// =============================================================================
/** Patterns detecting self-referential loops (agent trying to get user to execute). */
const SELF_REFERENTIAL_PATTERNS = [
    {
        name: 'user_execution_request',
        pattern: /(?:ask\s+(?:the\s+)?user\s+to\s+(?:run|execute|type)|please\s+(?:run|execute|type)\s+(?:the\s+following|this)\s+command)/i,
        severity: 'WARNING',
        description: 'Self-referential: requesting user to execute commands',
    },
    {
        name: 'copy_paste_instruction',
        pattern: /(?:copy\s+and\s+paste|paste\s+(?:this|the\s+following)\s+(?:into|in)\s+(?:your\s+)?terminal)/i,
        severity: 'INFO',
        description: 'Self-referential: copy-paste terminal instruction',
    },
];
// =============================================================================
// COMBINED
// =============================================================================
const ALL_AGENT_PATTERNS = [
    ...FAKE_TOOL_CALL_PATTERNS,
    ...PRIVILEGE_ESCALATION_PATTERNS,
    ...SELF_REFERENTIAL_PATTERNS,
];
// =============================================================================
// ANALYSIS FUNCTION
// =============================================================================
/**
 * Analyze agent/skill output for agent-specific injection patterns.
 * Runs ADDITIONAL checks beyond what analyzeContent() already does.
 *
 * @param content - The agent/skill output text
 * @returns Array of agent-specific findings
 */
export function analyzeAgentOutput(content) {
    const findings = [];
    if (!content || content.trim().length === 0) {
        return findings;
    }
    for (const patternDef of ALL_AGENT_PATTERNS) {
        const match = patternDef.pattern.exec(content);
        if (match) {
            findings.push({
                category: 'agent_output_injection',
                pattern_name: patternDef.name,
                severity: patternDef.severity,
                match: match[0].slice(0, 100),
                description: patternDef.description,
            });
        }
    }
    return findings;
}
export { FAKE_TOOL_CALL_PATTERNS, PRIVILEGE_ESCALATION_PATTERNS, SELF_REFERENTIAL_PATTERNS, ALL_AGENT_PATTERNS, };
//# sourceMappingURL=agent-output-patterns.js.map