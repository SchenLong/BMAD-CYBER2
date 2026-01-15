# YOLO Mode Restrictions

**Feature ID:** SEC-001
**Implementation Date:** 2026-01-15
**Status:** IMPLEMENTED
**Category:** Security Control

---

## Overview

YOLO mode is a workflow execution mode that skips all user confirmations, allowing workflows to execute automatically without user review. While convenient for experienced users on trusted workflows, this presents a security risk as it bypasses the human-in-the-loop safeguard.

This feature implements configurable restrictions on YOLO mode usage to prevent unauthorized or accidental bypass of confirmation prompts.

---

## Problem Statement

### Before Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│  UNRESTRICTED YOLO MODE                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User: "Run workflow in YOLO mode"                              │
│                                                                  │
│  Framework: [Skips ALL confirmations]                           │
│             [Executes ALL steps automatically]                  │
│             [No logging of YOLO usage]                          │
│             [Any workflow can use YOLO]                         │
│                                                                  │
│  Risk: Unreviewed execution of potentially harmful operations   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### After Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│  RESTRICTED YOLO MODE                                           │
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

## Configuration

### Location

`_bmad/core/config.yaml` - Security section

### Configuration Options

```yaml
security:
  yolo_mode:
    # Master switch - if false, YOLO is completely disabled
    enabled: false

    # Require explicit acknowledgment to use YOLO
    require_explicit_flag: true

    # Log all YOLO invocations (cannot be disabled)
    log_invocations: true

    # Workflows allowed to use YOLO mode
    # Empty list = no workflows can use YOLO (safest)
    allowed_workflows: []

    # Show warning banner when YOLO mode is active
    show_warning_banner: true

    # Warning message shown when YOLO is active
    warning_message: |
      YOLO MODE ACTIVE - All confirmations disabled.
      Steps will execute automatically without review.
```

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled` | boolean | `false` | Master switch for YOLO mode system-wide |
| `require_explicit_flag` | boolean | `true` | Require user to explicitly acknowledge YOLO risks |
| `log_invocations` | boolean | `true` | Log all YOLO attempts (always true, cannot disable) |
| `allowed_workflows` | list | `[]` | Workflows permitted to use YOLO mode |
| `show_warning_banner` | boolean | `true` | Display warning when YOLO activates |
| `warning_message` | string | (see above) | Custom warning message text |

---

## Security Controls

### 1. Master Switch (Defense in Depth)

The `enabled: false` default ensures YOLO is completely disabled unless explicitly enabled by an administrator.

### 2. Explicit Acknowledgment

When `require_explicit_flag: true`, users must explicitly acknowledge they understand the risks before YOLO activates.

### 3. Workflow Allowlist

Only workflows explicitly listed in `allowed_workflows` can use YOLO mode. An empty list (default) means no workflows can use YOLO.

### 4. Mandatory Logging

All YOLO invocations (whether allowed or blocked) are logged to the audit system. This cannot be disabled.

### 5. Warning Banner

When YOLO is allowed, a prominent warning banner is displayed to ensure the user is aware of the mode change.

---

## User Messages

### YOLO Disabled

```
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
```

### YOLO Not in Allowlist

```
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
```

### YOLO Allowed

```
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
```

---

## Implementation Details

### Files Modified

| File | Changes |
|------|---------|
| `_bmad/core/config.yaml` | Added `security.yolo_mode` configuration section |
| `_bmad/core/tasks/workflow.xml` | Added `yolo-restriction` security directive |

### Security Directive Location

The YOLO restriction is implemented as a security directive in `workflow.xml`:

```xml
<security-directive id="yolo-restriction" mandatory="true" order="1">
  <!-- Pre-execution checks for YOLO mode -->
</security-directive>
```

### Check Order

1. Check master switch (`enabled`)
2. Check explicit acknowledgment (`require_explicit_flag`)
3. Check workflow allowlist (`allowed_workflows`)
4. If all pass: Log and show warning
5. If any fail: Block and show appropriate message

---

## How to Enable YOLO for Specific Workflows

If you need to allow YOLO mode for trusted, low-risk workflows:

```yaml
# In _bmad/core/config.yaml
security:
  yolo_mode:
    enabled: true              # Enable YOLO system
    require_explicit_flag: true
    allowed_workflows:
      - "create-story"         # Allow YOLO for story creation
      - "sprint-planning"      # Allow YOLO for sprint planning
      - "quick-dev"            # Allow YOLO for quick development
```

**Warning:** Only add workflows that:
- Do not modify critical system files
- Do not execute shell commands with elevated privileges
- Have been reviewed for safety in unattended mode

---

## User Experience Impact

| User Type | Impact |
|-----------|--------|
| Normal users (never use YOLO) | **Zero friction** - No change in experience |
| Users who try YOLO | Clear, helpful message explaining restrictions |
| Admins who need YOLO | Can whitelist specific workflows |

---

## Audit Trail

All YOLO-related events are logged:

```json
{
  "timestamp": "2026-01-15T12:00:00.000Z",
  "event_type": "workflow.yolo_blocked",
  "severity": "WARNING",
  "user": "J",
  "workflow": "create-story",
  "reason": "YOLO mode is disabled in configuration"
}
```

---

## Related Documentation

- [Security Roadmap](/_bmad-output/BMAD-Security-Review/Security-Roadmap.md)
- [Audit Logging Feature](Security-Audit-Logging.md)
- [BMAD Security Audit Report](/_bmad-output/BMAD-Security-Review/BMAD-Security-Audit-Report.md)

---

*Feature implemented by: Bastion (Security Architect)*
*Documentation updated: 2026-01-15*
