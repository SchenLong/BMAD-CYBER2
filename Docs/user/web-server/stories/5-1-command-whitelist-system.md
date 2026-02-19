# Story 5.1: Command Whitelist System

**Status:** done
**Epic:** Epic 5 - CLI Bridge Integration
**Story ID:** 5.1
**Story Key:** 5-1-command-whitelist-system
**Dependencies:** Story 1.1 (Project Scaffold), Story 1.5 (RBAC)

---

## Story

**As a** Security Architect,
**I want** only explicitly whitelisted commands to be executable,
**So that** the system cannot be abused for arbitrary command execution.

---

## Acceptance Criteria

**Given** the CLI bridge module
**When** defining ALLOWED_COMMANDS configuration
**Then** each whitelist entry specifies command, args, timeout, and allowed roles
**And** whitelist includes: mission.list, mission.create, agent.invoke, workflow.execute
**And** reject any command not in whitelist with 404 response
**And** validate user roles against command requirements before execution
**And** log all command attempts (allowed and blocked) to audit trail

---

## Tasks / Subtasks

- [x] **Task 1: Create Command Definition Types** (AC: Then - each whitelist entry specifies command, args, timeout, allowed roles)
  - [x] Create `types/commands.ts` with CommandDefinition interface
  - [x] Define properties: command, args, timeout, allowedRoles, validationSchema
  - [x] Create CliResult interface for execution results
  - [x] Export all types for use across CLI bridge modules

- [x] **Task 2: Define ALLOWED_COMMANDS Configuration** (AC: And - whitelist includes core commands)
  - [x] Create `lib/cli-bridge/allowed-commands.ts`
  - [x] Define mission.list command with timeout 30s, roles: [user, admin]
  - [x] Define mission.create command with timeout 60s, roles: [admin]
  - [x] Define agent.invoke command with timeout 300s, roles: [user, admin]
  - [x] Define workflow.execute command with timeout 600s, roles: [user, admin]
  - [x] Add intel.flash-assessment, security.architecture-review commands
  - [x] Add security.threat-model, security.incident-response commands

- [x] **Task 3: Create Whitelist Validation Middleware** (AC: And - reject commands not in whitelist)
  - [x] Create `middleware/cli-whitelist.ts`
  - [x] Implement whitelist check function
  - [x] Return 404 response for unknown commands with error message
  - [x] Attach command definition to request object for downstream handlers
  - [x] Add unit tests for whitelist validation

- [x] **Task 4: Implement Role-Based Access Control for Commands** (AC: And - validate user roles)
  - [x] Create `lib/cli-bridge/role-validator.ts`
  - [x] Implement function to check user role against command's allowedRoles
  - [x] Return 403 Forbidden for insufficient permissions
  - [x] Support role hierarchy (admin > user > guest)
  - [x] Add integration with existing RBAC system from Story 1.5

- [x] **Task 5: Create Audit Logging for CLI Commands** (AC: And - log all command attempts)
  - [x] Create `lib/cli-bridge/audit-logger.ts`
  - [x] Log successful commands with: userId, command, timestamp, IP
  - [x] Log blocked commands with: userId, attempted command, reason (not found/forbidden), timestamp, IP
  - [x] Store audit logs in structured format (JSON)
  - [x] Implement log rotation for audit files
  - [x] Add search/retrieval functions for audit trail

- [x] **Task 6: Create Whitelist API Endpoint** (AC: Given, When - CLI bridge module)
  - [x] Create `/api/cli/commands/route.ts` GET endpoint
  - [x] Return list of whitelisted commands user has access to
  - [x] Include command metadata (timeout, description, required roles)
  - [x] Filter commands based on authenticated user's role
  - [x] Add caching for command list responses

- [x] **Task 7: Verification** (AC: Then, And)
  - [x] Test whitelisted command execution succeeds
  - [x] Test non-whitelisted command returns 404
  - [x] Test user without required role gets 403
  - [x] Verify all command attempts are logged
  - [x] Test command list API returns correct subset for different roles
  - [x] Run security scan to ensure no command injection possible

---

## Dev Notes

### Architecture Patterns & Constraints

**Command Whitelist Security Model:**

The command whitelist is the primary security control preventing arbitrary command execution. Only explicitly defined commands may be executed through the CLI bridge.

```
Request Flow:
1. User Request -> Auth Middleware -> Whitelist Middleware -> Role Validator -> Command Dispatcher
2. Each layer validates before passing to next
3. Audit log records at each decision point
```

**Command Definition Structure:**
```typescript
interface CommandDefinition {
  command: string              // Executable name (e.g., 'bmad')
  args: string[]               // Base arguments (e.g., ['list', 'projects'])
  timeout: number              // Maximum execution time in milliseconds
  allowedRoles: Role[]         // Roles that can execute this command
  validation?: z.ZodSchema     // Runtime parameter validation schema
  description?: string         // Human-readable description
  category?: 'project' | 'agent' | 'workflow' | 'intel' | 'security'
}

interface CliResult {
  stdout: string
  stderr: string
  exitCode: number
  timedOut: boolean
  command: string              // Full command executed
  duration?: number            // Execution time in milliseconds
}
```

**Key Technical Decisions:**
1. **Explicit Allow List** - Default deny, explicit allow only
2. **Per-Command Timeouts** - Prevent runaway processes
3. **Role-Based Authorization** - Commands require specific roles
4. **Comprehensive Auditing** - All attempts logged for security review

### Security Considerations

**Whitelist Bypass Prevention:**
- Never concatenate user input into command strings
- Always use spawn() with shell: false (Story 5.2)
- Validate parameters against schemas before execution
- Sanitize all user inputs for prompt injection patterns

**Audit Log Content:**
```typescript
interface AuditEntry {
  timestamp: string
  userId: string
  userRole: string
  command: string
  parameters: Record<string, unknown>
  allowed: boolean
  reason?: string              // Why blocked (if not allowed)
  ipAddress: string
  userAgent: string
}
```

### File Structure Requirements

**Critical Paths & Files:**
- `types/commands.ts` - Command definition types
- `lib/cli-bridge/allowed-commands.ts` - Whitelist configuration
- `middleware/cli-whitelist.ts` - Whitelist validation middleware
- `lib/cli-bridge/role-validator.ts` - Role-based access control
- `lib/cli-bridge/audit-logger.ts` - Audit logging utilities
- `src/app/api/cli/commands/route.ts` - Commands list endpoint

**Project Structure:**
```
src/
├── types/
│   └── commands.ts                # Command definition types
├── lib/
│   └── cli-bridge/
│       ├── allowed-commands.ts    # Whitelist configuration
│       ├── role-validator.ts      # Role validation
│       ├── audit-logger.ts        # Audit logging
│       └── command-dispatcher.ts  # Command execution (Story 5.2)
├── middleware/
│   └── cli-whitelist.ts           # Whitelist middleware
└── app/
    └── api/
        └── cli/
            └── commands/
                └── route.ts       # Commands list API
```

### Command Whitelist Configuration

**Core Commands (Minimum Viable):**
```typescript
export const ALLOWED_COMMANDS: Record<string, CommandDefinition> = {
  'mission.list': {
    command: 'bmad',
    args: ['list', 'missions'],
    timeout: 30000,
    allowedRoles: ['user', 'admin'],
    description: 'List all available missions',
    category: 'project',
  },

  'mission.create': {
    command: 'bmad',
    args: ['mission', 'create'],
    timeout: 60000,
    allowedRoles: ['admin'],
    description: 'Create a new mission',
    category: 'project',
    validation: z.object({
      name: z.string().min(3).max(100),
      type: z.enum(['assessment', 'investigation', 'response']),
    }),
  },

  'agent.invoke': {
    command: 'bmad',
    args: ['invoke'],
    timeout: 300000,  // 5 minutes
    allowedRoles: ['user', 'admin'],
    description: 'Invoke a BMAD agent',
    category: 'agent',
    validation: z.object({
      agent: z.string(),
      message: z.string().max(10000),
    }),
  },

  'workflow.execute': {
    command: 'bmad',
    args: ['workflow', 'execute'],
    timeout: 600000,  // 10 minutes
    allowedRoles: ['user', 'admin'],
    description: 'Execute a workflow',
    category: 'workflow',
    validation: z.object({
      workflow: z.string(),
      parameters: z.record(z.any()).optional(),
    }),
  },
}
```

### Testing Standards Summary

**Verification Requirements:**
1. Unit tests for whitelist validation
2. Unit tests for role-based access control
3. Integration tests for command execution flow
4. Security tests for bypass attempts
5. Audit log verification

**Test Cases:**
- Whitelisted command with valid role -> success
- Non-whitelisted command -> 404
- Whitelisted command with insufficient role -> 403
- Audit log contains all attempts
- Command list API filters by user role

---

## Dev Agent Guardrails

### Technical Requirements

**Command Definition Requirements:**
- All commands must specify timeout (max 600000ms for long-running)
- All commands must specify allowedRoles (never allow '*')
- Complex commands must include validation schema
- Description required for UI display

**Role Validation:**
- Integrate with existing RBAC from Story 1.5
- Support role hierarchy: admin > user > guest
- Cache role assignments for performance
- Validate on every request (no stale permissions)

**Audit Logging:**
- Write to file system in JSON format
- Include IP address and user agent
- Implement log rotation (daily)
- Provide search interface for admins

### Architecture Compliance

**Middleware Order:**
```typescript
// Correct middleware order for CLI routes
app.use('/api/cli',
  authenticateRequest,    // Story 1.2
  validateRateLimit,      // Story 5.5
  validateWhitelist,      // This story
  validateRoles,          // This story
  validateParameters,     // Command-specific
  executeCommand          // Story 5.2
)
```

**Error Response Format:**
```typescript
// 404 - Command not in whitelist
{
  error: 'Command not found',
  command: 'malicious.command',
  availableCommands: ['mission.list', 'agent.invoke', ...]
}

// 403 - Insufficient permissions
{
  error: 'Insufficient permissions',
  command: 'mission.create',
  requiredRole: 'admin',
  userRole: 'user'
}
```

### Security Requirements

**Critical Security Rules:**
1. NEVER execute commands not in whitelist
2. NEVER bypass role validation
3. ALWAYS log all command attempts
4. ALWAYS validate parameters before execution
5. NEVER expose system commands to frontend

**Input Validation:**
- Use Zod schemas for runtime validation
- Sanitize against prompt injection patterns
- Validate parameter types and ranges
- Reject malformed requests immediately

### Testing Requirements

**Security Test Cases:**
```typescript
// Test whitelist bypass attempts
const maliciousAttempts = [
  'rm -rf /',
  'cat /etc/passwd',
  'bmad; malicious command',
  'bmad && malicious',
  'bmad | malicious',
  '../../../etc/passwd',
]

// All should return 404
```

**Role Testing:**
```typescript
// Test each role has correct access
const roleAccess = {
  admin: ['mission.list', 'mission.create', 'agent.invoke', 'workflow.execute'],
  user: ['mission.list', 'agent.invoke', 'workflow.execute'],
  guest: ['mission.list'],
}
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 5 Objective:** Build secure CLI-to-Web bridge for executing BMAD commands

**Related Stories:**
- Story 5.2: Safe Process Spawning - Executes whitelisted commands
- Story 5.3: CLI Output Streaming - Streams command output
- Story 5.4: Terminal Emulator Component - Displays commands in UI
- Story 5.5: CLI Bridge Security Middleware - Rate limiting and auth

**Security Context:**
- CLI bridge is a critical security boundary
- All commands must be explicitly allowed
- Role-based access prevents privilege escalation
- Comprehensive audit trail for compliance

---

## Story Completion Status

**Status:** done
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Implementation Date:** 2026-02-17
**Code Review Date:** 2026-02-17
**Code Review Outcome:** Approved with fixes applied

---

## References

**Source Documents:**
- [Backend Integration - CLI Bridge](../10-backend-integration.md#1-cli-to-web-bridge-architecture) - Bridge architecture and design
- [Backend Integration - Security Layer](../10-backend-integration.md#4-security-layer) - Security controls
- [Technical Implementation](../06-technical-implementation.md) - Overall architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Phase-by-phase guide

**Story Breakdown Reference:**
- Epic 5: CLI Bridge Integration - [epics.md#epic-5](../epics.md#epic-5-cli-bridge-integration)
- Story 5.1 Details - [epics.md#story-51-command-whitelist-system](../epics.md#story-51-command-whitelist-system)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
No debugging issues encountered during implementation.

### Completion Notes List
- Created comprehensive type definitions for CLI bridge in `src/lib/cli-bridge/types.ts`
- Implemented `ALLOWED_COMMANDS` whitelist with 15+ commands across 5 categories (project, agent, workflow, intel, security)
- Created whitelist validation middleware with security checks for command injection attempts
- Implemented role-based access control integration with existing RBAC system from Story 1.5
- Built comprehensive audit logging system with tamper-evident hash chain
- Created API endpoints for listing commands and getting command details
- Added extensive unit tests for whitelist validation and role checking
- All TypeScript compilation successful
- Build completed without errors

### File List
**New Files Created:**
- `src/lib/cli-bridge/types.ts` - Type definitions for CLI bridge
- `src/lib/cli-bridge/allowed-commands.ts` - Whitelist configuration
- `src/lib/cli-bridge/role-validator.ts` - Role validation utilities
- `src/lib/cli-bridge/audit-logger.ts` - Audit logging system
- `src/lib/cli-bridge/index.ts` - Module exports
- `src/middleware/cli-whitelist.ts` - Whitelist validation middleware
- `src/app/api/cli/commands/route.ts` - Commands list API endpoint
- `src/app/api/cli/commands/[commandId]/route.ts` - Command detail API endpoint
- `src/lib/cli-bridge/__tests__/allowed-commands.test.ts` - Unit tests for allowed commands
- `src/lib/cli-bridge/__tests__/role-validator.test.ts` - Unit tests for role validation
- `src/lib/cli-bridge/__tests__/whitelist-validation.test.ts` - Unit tests for whitelist validation

**Files Modified:**
- `team/bmad-web-server/sprint-status.yaml` - Updated story status to in-progress
- `team/bmad-web-server/stories/5-1-command-whitelist-system.md` - Updated task completion status
