---
name: 'step-01-triage'
description: 'Triage coordination - validate identifiers and dispatch parallel collection'
estimated_duration: '2 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/flash-assessment'
thisStepFile: '{workflow_path}/steps/step-01-triage.md'
nextStepFile: '{workflow_path}/steps/step-02-parallel-collection.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 1: Triage Coordination

## STEP GOAL

Validate target identifiers, establish collection scope, and prepare dispatch instructions for parallel agent collection.

## EXECUTION TIME: ~2 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, Intelligence Operations Director
- You coordinate the Flash Assessment triage
- You validate inputs and set collection parameters
- You do NOT perform collection yourself in this step

### Step-Specific Rules
- Focus ONLY on validation and dispatch preparation
- Do NOT start collection activities
- Establish clear scope boundaries
- Set urgency-appropriate parameters

## TRIAGE SEQUENCE

### 1. Validate Target Identifier(s)

Confirm you have received at least ONE valid identifier:

| Identifier Type | Format Validation | Example |
|-----------------|-------------------|---------|
| Email | name@domain.tld | john.doe@company.com |
| Domain | domain.tld | company.com |
| Username | alphanumeric + special | @johndoe, johndoe123 |
| Phone | E.164 or local format | +1-555-123-4567 |
| IP Address | IPv4 or IPv6 | 192.168.1.1 |
| Full Name | First + Last minimum | John Doe |

**If no valid identifier provided:**
- Request clarification from user
- Do not proceed until identifier confirmed

### 2. Determine Urgency Level

Ask user or infer from context:

| Level | Time Budget | Collection Depth |
|-------|-------------|------------------|
| ROUTINE | Full 15 min | Standard coverage |
| PRIORITY | 10 min max | Focus on high-value |
| IMMEDIATE | 5 min max | Critical hits only |

**Default**: ROUTINE (15 minutes)

### 3. Establish Scope Boundaries

Confirm or set:
- Geographic scope (if relevant)
- Time range for historical data
- Specific concerns to prioritize
- Any sources to exclude

### 4. Prepare Dispatch Instructions

Create collection tasking for parallel agents:

```
FLASH ASSESSMENT DISPATCH
========================
Target: [identifier]
Urgency: [ROUTINE/PRIORITY/IMMEDIATE]
Time Budget: [X minutes per agent]

PROBE (Technical):
- Domain/IP reconnaissance
- Technology fingerprinting
- Service enumeration
- Quick vulnerability scan

ECHO (Social):
- Username enumeration
- Profile discovery
- Network snapshot
- Recent activity scan

SHADOW (Dark Web):
- Breach database check
- Paste site scan
- Forum mention search
- Credential exposure check
```

### 5. Initialize Output Document

Create assessment header:

```markdown
# FLASH ASSESSMENT
**Target:** [identifier]
**Generated:** [timestamp]
**Urgency:** [level]
**Turnaround:** 15 minutes

---

## COLLECTION STATUS
- [ ] Technical (Probe)
- [ ] Social (Echo)
- [ ] Dark Web (Shadow)

---
```

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] Target identifier validated
- [ ] Urgency level established
- [ ] Scope boundaries set
- [ ] Dispatch instructions prepared
- [ ] Output document initialized

## MENU OPTIONS

**[C] Continue** - Proceed to parallel collection (Step 2)
**[R] Revise** - Modify scope or parameters
**[X] Cancel** - Abort assessment

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-parallel-collection.md`
