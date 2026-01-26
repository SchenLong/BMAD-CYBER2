# Next Implementation: 1.3 YOLO Mode Restrictions

**Priority:** IMMEDIATE
**Estimated Effort:** 4-8 hours
**User Impact:** Zero friction (for normal users)
**Dependencies:** None

---

## Overview

YOLO mode allows workflows to execute without user confirmations. This is a security bypass that should be restricted by default.

### Current Problem

```
┌─────────────────────────────────────────────────────────────────┐
│  CURRENT: YOLO MODE IS UNRESTRICTED                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User: "Run workflow in YOLO mode"                              │
│                                                                  │
│  Framework: [Skips ALL confirmations]                           │
│             [Executes ALL steps automatically]                  │
│             [No logging of YOLO usage]                          │
│             [Any workflow can use YOLO]                         │
│                                                                  │
│  Risk: Malicious workflow executes without review               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Solution

```
┌─────────────────────────────────────────────────────────────────┐
│  AFTER: YOLO MODE IS RESTRICTED                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User: "Run workflow in YOLO mode"                              │
│                                                                  │
│  Framework: [Check if YOLO enabled in config]                   │
│             [Check if workflow in allowlist]                    │
│             [Log YOLO invocation with WARNING]                  │
│             [Show warning banner if allowed]                    │
│             [Block if not allowed]                              │
│                                                                  │
│  Result: YOLO only works for explicitly allowed workflows       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Modify Configuration File

**File:** `_bmad/core/config.yaml`

**Add the following section:**

```yaml
# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

security:
  # ---------------------------------------------------------------------------
  # YOLO Mode Configuration
  # ---------------------------------------------------------------------------
  # YOLO mode skips user confirmations during workflow execution.
  # This is a security risk and should be restricted.

  yolo_mode:
    # Master switch - if false, YOLO is completely disabled
    enabled: false

    # Require explicit command-line flag to use YOLO
    # Even if enabled above, user must acknowledge the risk
    require_explicit_flag: true

    # Log all YOLO invocations (cannot be disabled)
    log_invocations: true

    # Workflows allowed to use YOLO mode
    # Empty list = no workflows can use YOLO (safest)
    # Add specific workflow names to allow YOLO for them
    allowed_workflows: []
    # Example - to allow YOLO for specific workflows:
    # allowed_workflows:
    #   - "create-story"
    #   - "sprint-planning"
    #   - "quick-dev"

    # Show warning banner when YOLO mode is active
    show_warning_banner: true

    # Warning message shown when YOLO is active
    warning_message: |
      YOLO MODE ACTIVE - All confirmations disabled.
      Steps will execute automatically without review.
```

---

### Step 2: Modify Workflow Execution Engine

**File:** `_bmad/core/tasks/workflow.xml`

**Add the following security directive after the existing directives:**

```xml
<!--
  ============================================================================
  SECURITY: YOLO MODE RESTRICTION
  ============================================================================

  YOLO mode skips user confirmations, which is a security risk.
  This directive restricts YOLO to explicitly allowed workflows.
-->

<security-directive id="yolo-restriction" mandatory="true" order="2">
  <description>
    Restrict YOLO mode to prevent security bypass.
    YOLO mode skips all user confirmations and must be explicitly allowed.
  </description>

  <configuration-reference>
    security.yolo_mode in config.yaml
  </configuration-reference>

  <pre-execution-check>
    When a workflow requests YOLO mode execution:

    1. Load security.yolo_mode configuration

    2. Check master switch:
       IF security.yolo_mode.enabled = false THEN
         BLOCK with message: "YOLO mode is disabled in configuration"
         STOP

    3. Check explicit flag requirement:
       IF security.yolo_mode.require_explicit_flag = true THEN
         IF user did not provide --yolo-confirm-unsafe flag THEN
           BLOCK with message: "YOLO requires --yolo-confirm-unsafe flag"
           STOP

    4. Check workflow allowlist:
       IF security.yolo_mode.allowed_workflows is empty THEN
         BLOCK with message: "No workflows are allowed to use YOLO mode"
         STOP
       IF current_workflow NOT IN security.yolo_mode.allowed_workflows THEN
         BLOCK with message: "This workflow is not allowed to use YOLO mode"
         STOP

    5. If all checks pass:
       - Log YOLO invocation at WARNING level:
         "[YOLO] User {user_name} invoked YOLO mode for workflow {workflow_name}"
       - Show warning banner if configured
       - Proceed with YOLO execution
  </pre-execution-check>

  <on-blocked reason="disabled">
    ╔══════════════════════════════════════════════════════════════════╗
    ║                  ⚠️  YOLO Mode Disabled                           ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  YOLO mode is disabled in the framework configuration.           ║
    ║                                                                   ║
    ║  YOLO mode skips all user confirmations, which could allow       ║
    ║  unreviewed execution of potentially harmful operations.         ║
    ║                                                                   ║
    ║  Options:                                                         ║
    ║  1. Run without YOLO mode (recommended)                          ║
    ║  2. Contact admin to enable YOLO in config.yaml                  ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </on-blocked>

  <on-blocked reason="no-flag">
    ╔══════════════════════════════════════════════════════════════════╗
    ║                  ⚠️  YOLO Requires Confirmation                   ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  YOLO mode requires explicit acknowledgment of risk.             ║
    ║                                                                   ║
    ║  To use YOLO mode, include the flag:                             ║
    ║  --yolo-confirm-unsafe                                           ║
    ║                                                                   ║
    ║  This confirms you understand that all confirmations will be     ║
    ║  skipped and steps will execute automatically.                   ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </on-blocked>

  <on-blocked reason="not-allowed">
    ╔══════════════════════════════════════════════════════════════════╗
    ║                  ⚠️  YOLO Not Allowed for This Workflow           ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  Workflow: {workflow_name}                                       ║
    ║                                                                   ║
    ║  This workflow is not in the YOLO allowlist.                     ║
    ║                                                                   ║
    ║  Only these workflows can use YOLO mode:                         ║
    ║  {allowed_workflows_list}                                        ║
    ║                                                                   ║
    ║  Options:                                                         ║
    ║  1. Run without YOLO mode (recommended)                          ║
    ║  2. Contact admin to add this workflow to allowlist              ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </on-blocked>

  <on-allowed>
    ╔══════════════════════════════════════════════════════════════════╗
    ║              ⚠️  YOLO MODE ACTIVE - USE WITH CAUTION              ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  User confirmations are DISABLED for this workflow.              ║
    ║  All steps will execute automatically without review.            ║
    ║                                                                   ║
    ║  Workflow: {workflow_name}                                       ║
    ║  User: {user_name}                                               ║
    ║  Time: {timestamp}                                               ║
    ║                                                                   ║
    ║  This invocation has been logged.                                ║
    ║                                                                   ║
    ╚══════════════════════════════════════════════════════════════════╝
  </on-allowed>

  <logging>
    On YOLO invocation (allowed or blocked), log:
    - Event type: workflow.yolo_invoked OR workflow.yolo_blocked
    - Severity: WARNING
    - User: {user_name}
    - Workflow: {workflow_name}
    - Outcome: allowed | blocked
    - Reason: {block_reason if blocked}
    - Timestamp: {current_time}
  </logging>
</security-directive>
```

---

### Step 3: Test the Implementation

#### Test Case 1: YOLO Blocked (Default Configuration)

**Config:**
```yaml
security:
  yolo_mode:
    enabled: false
```

**Test:**
```
User: Run create-story workflow in YOLO mode

Expected Output:
╔══════════════════════════════════════════════════════════════════╗
║                  ⚠️  YOLO Mode Disabled                           ║
╠══════════════════════════════════════════════════════════════════╣
║  YOLO mode is disabled in the framework configuration.           ║
║  Options:                                                         ║
║  1. Run without YOLO mode (recommended)                          ║
║  2. Contact admin to enable YOLO in config.yaml                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**Result:** User continues without YOLO, confirmations appear normally.

---

#### Test Case 2: YOLO Blocked (Not in Allowlist)

**Config:**
```yaml
security:
  yolo_mode:
    enabled: true
    allowed_workflows:
      - "sprint-planning"
```

**Test:**
```
User: Run create-story workflow in YOLO mode

Expected Output:
╔══════════════════════════════════════════════════════════════════╗
║                  ⚠️  YOLO Not Allowed for This Workflow           ║
╠══════════════════════════════════════════════════════════════════╣
║  Workflow: create-story                                          ║
║  This workflow is not in the YOLO allowlist.                     ║
║  Only these workflows can use YOLO mode:                         ║
║  - sprint-planning                                               ║
╚══════════════════════════════════════════════════════════════════╝
```

---

#### Test Case 3: YOLO Allowed

**Config:**
```yaml
security:
  yolo_mode:
    enabled: true
    require_explicit_flag: false
    allowed_workflows:
      - "create-story"
      - "sprint-planning"
```

**Test:**
```
User: Run create-story workflow in YOLO mode

Expected Output:
╔══════════════════════════════════════════════════════════════════╗
║              ⚠️  YOLO MODE ACTIVE - USE WITH CAUTION              ║
╠══════════════════════════════════════════════════════════════════╣
║  User confirmations are DISABLED for this workflow.              ║
║  All steps will execute automatically without review.            ║
║                                                                   ║
║  Workflow: create-story                                          ║
║  User: J                                                         ║
║  Time: 2026-01-13T12:00:00Z                                      ║
║                                                                   ║
║  This invocation has been logged.                                ║
╚══════════════════════════════════════════════════════════════════╝

[Workflow executes without confirmations]
```

---

#### Test Case 4: Check Logging

After any YOLO invocation (allowed or blocked), verify log output:

```
[YOLO] 2026-01-13T12:00:00Z WARNING User J attempted YOLO mode for create-story: BLOCKED (not in allowlist)
[YOLO] 2026-01-13T12:05:00Z WARNING User J invoked YOLO mode for sprint-planning: ALLOWED
```

---

## User Experience Summary

| Scenario | User Experience | Friction Level |
|----------|-----------------|----------------|
| Normal workflow (no YOLO) | No change | None |
| YOLO attempted, disabled | Clear message, continues without YOLO | Very Low |
| YOLO attempted, not in allowlist | Clear message with allowed list | Very Low |
| YOLO allowed | Warning banner, then proceeds | Low |

**Key Point:** Users who never use YOLO see absolutely no change.

---

## Rollback Plan

If issues arise, revert by:

1. Remove `security.yolo_mode` section from `config.yaml`
2. Remove security directive from `workflow.xml`

Or simply set:
```yaml
security:
  yolo_mode:
    enabled: true
    require_explicit_flag: false
    allowed_workflows:
      - "*"  # Allow all (reverts to previous behavior)
```

---

## Files Changed Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `_bmad/core/config.yaml` | ADD | ~30 lines |
| `_bmad/core/tasks/workflow.xml` | ADD | ~100 lines |

**Total:** ~130 lines of configuration/XML

---

## Success Criteria

- [ ] YOLO mode blocked by default when `enabled: false`
- [ ] YOLO mode blocked for workflows not in allowlist
- [ ] YOLO mode works for explicitly allowed workflows
- [ ] Warning banner shown when YOLO is active
- [ ] YOLO invocations logged (when logging available)
- [ ] Clear, helpful error messages guide users
- [ ] No impact on normal (non-YOLO) workflow execution

---

*Ready for implementation*
