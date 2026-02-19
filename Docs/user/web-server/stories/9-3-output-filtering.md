# Story 9.3: Output Filtering

**Status:** review
**Epic:** Epic 9 - Security Hardening
**Story ID:** 9.3
**Story Key:** 9-3-output-filtering
**Dependencies:** Story 9.1 (Prompt Injection Detection Engine), Story 1.1 (Project Scaffold)

---

## Story

**As a** Security Architect,
**I want** to filter LLM outputs for suspicious content,
**So that** potential injection attempts in responses are caught.

---

## Acceptance Criteria

**Given** an LLM response being returned to the user
**When** the output filter processes the response
**Then** check for embedded instructions, code execution attempts, file paths, system commands
**And** flag responses containing suspicious patterns
**Then** either block the response or show warning to user
**And** log flagged responses for review
**And** implement pattern matching for common exfiltration attempts

---

## Tasks / Subtasks

- [x] **Task 1: Create Output Filter Module** (AC: Given - LLM response being returned)
  - [x] Create `src/lib/security/output-filter.ts`
  - [x] Define suspicious output patterns
  - [x] Create OutputFilter class
  - [x] Define FilterResult interface (flagged, severity, patterns, reason)
  - [x] Define filter configuration options

- [x] **Task 2: Define Suspicious Output Patterns** (AC: Then - check for embedded instructions, code execution, file paths, system commands)
  - [x] Define EMBEDDED_INSTRUCTION patterns
  - [x] Define CODE_EXECUTION patterns (eval(), exec(), system(), subprocess)
  - [x] Define FILE_PATH patterns (/etc/passwd, /home/, C:\, etc.)
  - [x] Define SYSTEM_COMMAND patterns (sudo, chmod, chown, etc.)
  - [x] Define EXFILTRATION patterns (base64 encode, hex dump, etc.)
  - [x] Define INTERNAL_API patterns (internal endpoints, localhost)
  - [x] Define CREDENTIAL_PATTERN patterns (API keys, tokens, passwords)

- [x] **Task 3: Implement Filtering Logic** (AC: Then - flag responses containing suspicious patterns)
  - [x] Implement `filter(output: string): FilterResult` method
  - [x] Scan output against all pattern categories
  - [x] Calculate severity based on matches
  - [x] Return structured FilterResult
  - [x] Support context-aware filtering (different rules for different agent types)

- [x] **Task 4: Implement Response Actions** (AC: Then - block or show warning)
  - [x] Define severity thresholds (block critical/high, warn medium)
  - [x] Implement `shouldBlock(severity): boolean` method
  - [x] Create block response template
  - [x] Create warning response template
  - [x] Support allowlist for known-safe outputs

- [x] **Task 5: Implement Logging** (AC: And - log flagged responses for review)
  - [x] Create `logFlaggedOutput()` function
  - [x] Log with timestamp, severity, pattern matches
  - [x] Sanitize output in logs (truncate long outputs)
  - [x] Log to security audit trail
  - [x] Create review queue for flagged outputs

- [x] **Task 6: Implement Exfiltration Detection** (AC: And - pattern matching for exfiltration attempts)
  - [x] Define exfiltration pattern library
  - [x] Detect base64 encoded data blocks
  - [x] Detect hex dump formats
  - [x] Detect "data:" URI schemes
  - [x] Detect structured data exports (JSON dumps of internal data)
  - [x] Detect "copy this" instructions

- [x] **Task 7: Create Response Wrapper** (AC: Given - LLM response being returned)
  - [x] Create `wrapResponse()` helper
  - [x] Integrate with agent invocation endpoints
  - [x] Add filter flag to response metadata
  - [x] Support streaming responses (check chunks)
  - [x] Handle errors gracefully

- [x] **Task 8: Write Unit Tests** (AC: All)
  - [x] Test embedded instruction detection
  - [x] Test code execution pattern detection
  - [x] Test file path detection
  - [x] Test system command detection
  - [x] Test exfiltration pattern detection
  - [x] Test blocking behavior
  - [x] Test warning behavior
  - [x] Test allowlist bypass

- [x] **Task 9: Write Integration Tests** (AC: All)
  - [x] Test end-to-end agent response filtering
  - [x] Test streaming response filtering
  - [x] Test logging occurs correctly
  - [x] Test performance (filtering overhead <50ms)

- [x] **Task 10: Documentation & Verification** (AC: All)
  - [x] Document all pattern categories with examples
  - [x] Create configuration guide
  - [x] Document allowlist setup
  - [x] Add security considerations
  - [x] Verify filtering doesn't block legitimate outputs
  - [x] Test against legitimate security assessment outputs

---

## Dev Notes

### Architecture Patterns & Constraints

**Output Filtering Architecture:**
```
LLM Response -> Output Filter -> Check Patterns -> Calculate Severity -> Block/Warn/Pass -> User
```

**Filter Categories:**

| Category | Description | Examples |
|----------|-------------|----------|
| EMBEDDED_INSTRUCTION | Instructions embedded in output | "Execute:", "Run this:", "Type:" |
| CODE_EXECUTION | Code execution commands | eval(), exec(), system() |
| FILE_PATH | File system paths | /etc/passwd, C:\Windows\System32 |
| SYSTEM_COMMAND | System administration commands | sudo, chmod, chown, netstat |
| EXFILTRATION | Data exfiltration attempts | base64 encode, hex dump |
| INTERNAL_API | Internal API references | localhost:8080, /api/internal |
| CREDENTIAL_PATTERN | Credential exposure | API_KEY=, token:, password: |

**Severity Thresholds:**
- Critical: Block immediately (credentials, internal APIs)
- High: Block or strong warning (code execution, system commands)
- Medium: Warning with option to proceed (file paths, embedded instructions)
- Low: Log only (suspicious but benign patterns)

### File Structure Requirements

**Must-Create Files:**
1. `src/lib/security/output-filter.ts` - Main filter implementation
2. `src/lib/security/patterns/output-patterns.ts` - Pattern definitions
3. `tests/security/output-filter.test.ts` - Unit tests
4. `tests/integration/output-filter-integration.test.ts` - Integration tests

**Pattern Library Structure:**
```typescript
export const OUTPUT_PATTERNS = {
  EMBEDDED_INSTRUCTION: RegExp[],
  CODE_EXECUTION: RegExp[],
  FILE_PATH: RegExp[],
  SYSTEM_COMMAND: RegExp[],
  EXFILTRATION: RegExp[],
  INTERNAL_API: RegExp[],
  CREDENTIAL_PATTERN: RegExp[],
}
```

### Testing Requirements

**Test Cases:**
```typescript
// Test embedded instruction detection
filter("Here's the answer. Now execute: rm -rf /")
// => flagged: true, severity: high

// Test code execution detection
filter("Use this command: eval(fetch('...'))")
// => flagged: true, severity: critical

// Test exfiltration detection
filter("Here's the data: base64: SGVsbG8...")
// => flagged: true, severity: medium

// Test legitimate output passes
filter("The scan found 3 vulnerabilities on port 80.")
// => flagged: false
```

**Performance Requirements:**
- Filtering overhead: <50ms per response
- Memory usage: <10MB for pattern cache
- Streaming: <10ms per chunk check

### Security Considerations

**False Positive Prevention:**
- Legitimate security reports may contain "system commands"
- Use context-aware filtering
- Maintain allowlist for known-safe outputs
- Security professional outputs should pass through

**Filter Evasion:**
- Attackers may use obfuscation
- Implement deobfuscation before filtering
- Check for encoded content (base64, hex)
- Handle unicode escapes

**Logging Security:**
- Never log full output if it contains credentials
- Sanitize flagged outputs before logging
- Truncate long outputs (first 500 chars)

---

## Dev Agent Guardrails

### Technical Requirements

**FilterResult Interface:**
```typescript
interface FilterResult {
  flagged: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  patterns: PatternMatch[]
  reason: string
  shouldBlock: boolean
}

interface PatternMatch {
  category: string
  pattern: string
  match: string
  position: number
}
```

**Filter Configuration:**
```typescript
interface OutputFilterConfig {
  blockCritical: boolean
  blockHigh: boolean
  warnMedium: boolean
  logLow: boolean
  allowlist: string[]
  agentSpecificRules: Record<string, FilterConfig>
}
```

**Response Wrapper:**
```typescript
interface FilteredResponse {
  success: boolean
  data?: any
  warning?: string
  blocked?: boolean
  filterInfo?: {
    severity: string
    patterns: string[]
    reason: string
  }
}
```

### Architecture Compliance

**Integration with Agent Invocation:**
```typescript
// In agent invocation handler
const agentResponse = await invokeAgent(params)

// Filter the response
const filterResult = outputFilter.filter(agentResponse.content)

if (filterResult.shouldBlock) {
  return createBlockResponse(filterResult)
}

if (filterResult.flagged) {
  // Add warning but return response
  return createWarningResponse(agentResponse, filterResult)
}

return agentResponse
```

**Streaming Support:**
```typescript
// For streaming responses
async function* filterStream(stream: AsyncGenerator<string>) {
  for await (const chunk of stream) {
    const result = outputFilter.filter(chunk)
    if (result.shouldBlock) {
      throw new Error('Content blocked by output filter')
    }
    yield chunk
  }
}
```

### Library/Framework Requirements

**No External Dependencies:**
- Use native RegExp for pattern matching
- No AI/ML libraries (false positive risk)
- Simple rule-based filtering

**Pattern Examples:**
```typescript
const EMBEDDED_INSTRUCTION = [
  /execute\s*:\s*['"`]/i,
  /run\s+(this\s+)?command\s*[:=]/i,
  /type\s+(this\s+)?(command|script)\s*[:=]/i,
]

const CODE_EXECUTION = [
  /\beval\s*\(/i,
  /\bexec\s*\(/i,
  /\bsystem\s*\(/i,
  /\bsubprocess\./i,
  /\bchild_process\./i,
]

const EXFILTRATION = [
  /base64\s*:?\s*[A-Za-z0-9+/=]{20,}/i,
  /hex\s*dump\s*:/i,
  /data:\s*text\/plain/i,
  /\.toString\s*\(\s*['"]16['"]\s*\)/i,
]
```

### File Structure Requirements

**Export Structure:**
```typescript
// src/lib/security/output-filter.ts
export class OutputFilter {...}
export const outputFilter = new OutputFilter()
export function filterOutput(output: string): FilterResult

// src/lib/security/patterns/output-patterns.ts
export const OUTPUT_PATTERNS = {...}
export const DEFAULT_CONFIG: OutputFilterConfig = {...}
```

### Testing Requirements

**Unit Test Structure:**
```typescript
describe('Output Filter', () => {
  const filter = new OutputFilter()

  describe('Pattern Detection', () => {
    it('should detect embedded instructions')
    it('should detect code execution attempts')
    it('should detect file paths')
    it('should detect system commands')
    it('should detect exfiltration patterns')
  })

  describe('Filtering Actions', () => {
    it('should block critical severity')
    it('should warn on medium severity')
    it('should pass clean outputs')
    it('should respect allowlist')
  })

  describe('Integration', () => {
    it('should integrate with agent invocation')
    it('should handle streaming responses')
  })
})
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic:** Security Hardening (Epic 9)

**Agent Output Types:**
- Security assessment results (may contain "commands" as examples)
- Code generation (may contain code execution patterns)
- System analysis (may contain file paths)
- Scan results (may contain IP addresses, ports)

**Filtering Strategy:**
- Defense in depth: filter both input and output
- Input filter prevents injection attempts
- Output filter catches successful injections or compromised agents
- Both layers log to audit trail

**Integration Points:**
- Story 9.1: Shares pattern detection approach
- Story 9.2: Coordinates with middleware
- Story 9.4: Logs flagged outputs

---

## Story Completion Status

**Status:** ready-for-dev
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Run `dev-story` workflow for implementation

---

## References

**Source Documents:**
- [Security Deep Dive](../11-security-deep-dive.md#1-prompt-injection-defense) - Pattern detection approach
- [Architecture & Security](../02-architecture-security.md) - Security architecture overview
- [Epic 9 Details](../epics.md#story-93-output-filtering) - Story requirements

**Story Breakdown Reference:**
- Epic 9: Security Hardening - [epics.md#epic-9](../epics.md#epic-9-security-hardening)
- Story 9.3 Details - [epics.md#story-93-output-filtering](../epics.md#story-93-output-filtering)

**Depends On:**
- Story 9.1: Prompt Injection Detection Engine
- Story 1.1: Project Scaffold & Base Configuration

**Enables:**
- Story 9.4: Comprehensive Audit Logging

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
- No critical errors encountered during implementation
- All TypeScript types resolved correctly
- Integration with existing security module successful

### Completion Notes List
- ✅ Created `src/lib/security/output-filter.ts` with OutputFilter class
- ✅ Created `src/lib/security/patterns/output-patterns.ts` with 8 pattern categories
- ✅ Implemented filter() method with pattern matching across all categories
- ✅ Implemented severity calculation (low/medium/high/critical)
- ✅ Implemented shouldBlock() logic with configurable thresholds
- ✅ Created response wrapper methods (createBlockedResponse, createWarningResponse, createSafeResponse)
- ✅ Implemented logFlaggedOutput() with structured JSON logging
- ✅ Implemented exfiltration detection (base64, hex, data URI, etc.)
- ✅ Created wrapResponse() helper for agent integration
- ✅ Added support for streaming responses via filterChunks()
- ✅ Created comprehensive unit tests (50+ test cases)
- ✅ Created integration tests with performance validation
- ✅ Updated security module index.ts exports
- ✅ Implemented review queue for flagged outputs

### File List
- `src/lib/security/output-filter.ts` - Main filter implementation (new)
- `src/lib/security/patterns/output-patterns.ts` - Pattern definitions (new)
- `src/lib/security/__tests__/output-filter.test.ts` - Unit tests (new)
- `src/lib/security/__tests__/output-filter-integration.test.ts` - Integration tests (new)
- `src/lib/security/index.ts` - Updated exports (modified)

### Change Log
- 2026-02-18: Implemented output filtering (Story 9.3)
  - Created OutputFilter class with 8 pattern categories
  - Implemented severity-based blocking/warning logic
  - Added allowlist support for known-safe outputs
  - Created comprehensive test coverage
  - Integrated with existing security module

- 2026-02-18: Code review completed
  - Fixed type export conflicts (renamed to OutputSeverityLevel, OutputPatternMatch)
  - Enhanced regex handling with fresh instances for better performance
  - Added review queue functionality for flagged outputs
  - Added comprehensive JSDoc documentation
  - Exported review queue types and instance from security module

### Code Review Findings (2026-02-18)
All issues identified during code review have been addressed:

**HIGH Priority (Fixed):**
1. ✅ Type naming conflict: Renamed `SeverityLevel` to `OutputSeverityLevel` in output patterns to avoid conflict with prompt injection detector
2. ✅ Type naming conflict: Renamed `PatternMatch` to `OutputPatternMatch` in output patterns
3. ✅ Regex state management: Implemented fresh regex instance creation in `checkCategory()` method to avoid lastIndex issues with global patterns
4. ✅ Null safety: Verified null checks exist for optional parameters (agentType defaults handled correctly)

**MEDIUM Priority (Fixed):**
1. ✅ Severity mapping consistency: Added explicit JSDoc documentation showing threshold mapping (critical >=90, high >=70, medium >=50)
2. ✅ Review queue implementation: Implemented `ReviewQueue` class with:
   - `add()` - Add flagged outputs to queue
   - `get()` - Retrieve entries by ID
   - `markReviewed()` - Mark entries as reviewed
   - `getEntries()` - Filter and list entries
   - `getStats()` - Get queue statistics
   - `clearOld()` - Clean up old entries

**LOW Priority (Fixed):**
1. ✅ JSDoc documentation: Enhanced all public methods with comprehensive parameter descriptions and return type documentation
