# Custom Workflow Creation Guide

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** Advanced users, module developers

---

## Overview

Workflows in BMAD-CYBER2 are structured processes that guide users through multi-step tasks. They combine configuration, execution instructions, and artifact generation into a cohesive experience. This guide shows you how to create custom workflows that integrate with the existing ecosystem.

---

## Prerequisites

Before creating a custom workflow:

- [ ] Write access to the `_bmad/` directory
- [ ] Understanding of the target module's structure
- [ ] Familiarity with YAML and XML syntax
- [ ] Reviewed existing workflows for patterns

---

## Workflow Architecture

### File Structure

Workflows can be simple (single file) or complex (directory with multiple files):

**Simple Workflow:**
```
_bmad/{module}/workflows/{workflow-name}/
└── workflow.md          # Combined config and instructions
```

**Complex Workflow:**
```
_bmad/{module}/workflows/{workflow-name}/
├── workflow.yaml        # Configuration
├── instructions.md      # Execution steps
└── steps/               # Optional: individual step files
    ├── step-01.md
    ├── step-02.md
    └── step-03.md
```

### Components

| Component | Purpose | Required |
|-----------|---------|----------|
| Configuration | Variables, paths, dependencies | Yes |
| Instructions | Step-by-step execution | Yes |
| Artifacts | Expected outputs | Recommended |
| State tracking | Progress persistence | Optional |

---

## Step-by-Step Creation

### Step 1: Plan Your Workflow

Before writing code, document:

1. **Goal:** What does this workflow accomplish?
2. **Inputs:** What does the user need to provide?
3. **Steps:** What are the major phases?
4. **Outputs:** What artifacts are produced?
5. **Dependencies:** What other workflows or agents might be needed?

### Step 2: Create the Directory

```bash
mkdir -p _bmad/{module}/workflows/{workflow-name}
```

Example: `mkdir -p _bmad/cybersec-team/workflows/vulnerability-assessment`

### Step 3: Create the Configuration (workflow.yaml)

```yaml
# Workflow metadata
name: vulnerability-assessment
description: "Comprehensive vulnerability assessment for target systems"
author: "Your Name"
version: "1.0"

# Configuration variable resolution
config_source: "{project-root}/_bmad/cybersec-team/config.yaml"
output_folder: "{config_source}:output_folder"
user_name: "{config_source}:user_name"
communication_language: "{config_source}:communication_language"
date: system-generated

# Workflow paths
installed_path: "{project-root}/_bmad/cybersec-team/workflows/vulnerability-assessment"
instructions: "{installed_path}/instructions.md"

# Optional: Party mode preset for collaboration
party_preset: "security-review-team"
party_preset_file: "{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml"

# Optional: Reference other workflows
related_workflows:
  threat_modeling: "{project-root}/_bmad/cybersec-team/workflows/threat-modeling/workflow.yaml"
  pentest: "{project-root}/_bmad/cybersec-team/workflows/pentest-methodology/workflow.md"

# Expected artifacts
artifacts:
  reconnaissance:
    - target-profile.md
    - attack-surface.md
  scanning:
    - vulnerability-scan-results.md
    - service-enumeration.md
  analysis:
    - risk-assessment.md
    - remediation-priorities.md
  final:
    - vulnerability-assessment-report.md
    - executive-summary.md

# Workflow behavior
standalone: true                    # Can run independently
requires_project: false             # Doesn't need existing project context
estimated_duration: "2-4 hours"     # User guidance
```

### Step 4: Create the Instructions (instructions.md)

The instructions file uses XML-based step definitions:

```markdown
---
stepsCompleted: []
workflowType: 'vulnerability-assessment'
user_name: '{{user_name}}'
date: '{{date}}'
---

# Vulnerability Assessment Workflow

This workflow guides you through a comprehensive vulnerability assessment.

<workflow>

<step n="1" goal="Define scope and targets">
<output>
## Step 1: Scope Definition

Let's define the assessment scope to ensure we have clear boundaries.
</output>

<ask>Please provide the target information:

1. Single host/IP
2. IP range/CIDR
3. Domain/subdomain list
4. Application URL

Choice [1-4]:</ask>
<action>Store as target_type</action>

<ask>Enter the target(s) (one per line if multiple):</ask>
<action>Store as targets</action>

<ask>What type of assessment is authorized?

1. External only (no credentials)
2. Authenticated (with credentials)
3. Full scope (all techniques permitted)

Choice [1-3]:</ask>
<action>Store as assessment_type</action>

<output>
### Scope Summary

| Parameter | Value |
|-----------|-------|
| Target Type | {target_type} |
| Targets | {targets} |
| Assessment Type | {assessment_type} |

Proceeding to reconnaissance phase...
</output>
</step>

<step n="2" goal="Passive reconnaissance">
<output>
## Step 2: Passive Reconnaissance

Gathering information without directly interacting with the target.
</output>

<check if="target_type == 'Domain/subdomain list'">
  <action>Perform DNS enumeration, WHOIS lookup, certificate transparency search</action>
</check>

<check if="target_type == 'Single host/IP' OR target_type == 'IP range/CIDR'">
  <action>Perform IP registration lookup, ASN identification, historical data search</action>
</check>

<ask>Review the reconnaissance results above. Ready to proceed to active scanning?

1. Yes, continue to scanning
2. No, need to refine scope
3. Export current findings first

Choice [1-3]:</ask>
<action>Store as recon_decision</action>

<check if="recon_decision == 'No, need to refine scope'">
  <action>Return to Step 1</action>
</check>

<check if="recon_decision == 'Export current findings first'">
  <action>Write reconnaissance findings to {output_folder}/reconnaissance/target-profile.md</action>
</check>
</step>

<step n="3" goal="Active scanning">
<output>
## Step 3: Active Scanning

Now performing active vulnerability scanning. This will interact directly with targets.
</output>

<ask>Select scanning approach:

1. Quick scan (top 100 ports, common vulnerabilities)
2. Standard scan (top 1000 ports, comprehensive checks)
3. Deep scan (all ports, all checks - slower but thorough)

Choice [1-3]:</ask>
<action>Store as scan_depth</action>

<action>
Perform vulnerability scanning based on {scan_depth}:
- Port scanning and service enumeration
- Version detection
- Vulnerability identification
- Configuration assessment
</action>

<output>
### Scan Results Summary

Findings will be categorized by severity:
- **Critical**: Immediate exploitation risk
- **High**: Significant security impact
- **Medium**: Moderate risk, should address
- **Low**: Minor issues, best practice violations
- **Info**: Informational findings

Analyzing results...
</output>
</step>

<step n="4" goal="Analysis and prioritization">
<output>
## Step 4: Risk Analysis

Analyzing findings and prioritizing remediation.
</output>

<action>
For each vulnerability found:
1. Assess exploitability (CVSS score if available)
2. Evaluate business impact
3. Consider existing mitigations
4. Calculate risk score
5. Prioritize remediation order
</action>

<ask>Would you like to:

1. Generate the full assessment report now
2. Review findings with the security team first (Party Mode)
3. Export raw findings for external analysis

Choice [1-3]:</ask>
<action>Store as analysis_decision</action>

<check if="analysis_decision == 'Review findings with the security team first'">
  <action>Invoke party mode with preset=security-review-team</action>
</check>
</step>

<step n="5" goal="Report generation">
<output>
## Step 5: Report Generation

Compiling the vulnerability assessment report.
</output>

<action>
Generate comprehensive report including:
1. Executive summary (non-technical stakeholders)
2. Methodology description
3. Findings by severity
4. Risk assessment matrix
5. Remediation recommendations with priorities
6. Appendices (technical details, evidence)
</action>

<ask>Select report format:

1. Markdown (for internal use/git tracking)
2. Executive brief only (1-2 pages)
3. Full technical report
4. Both executive and technical

Choice [1-4]:</ask>
<action>Store as report_format and generate accordingly</action>

<output>
### Assessment Complete

**Artifacts Generated:**
- vulnerability-assessment-report.md
- executive-summary.md
- risk-assessment.md

Reports saved to: {output_folder}/vulnerability-assessment/

**Next Steps:**
1. Review report with stakeholders
2. Create remediation tickets
3. Schedule follow-up assessment
</output>
</step>

</workflow>
```

### Step 5: Handle State Tracking

The frontmatter tracks progress:

```yaml
---
stepsCompleted: [1, 2, 3]    # Steps user has completed
workflowType: 'vulnerability-assessment'
user_name: 'J'
date: '2026-01-16'
current_step: 4              # Where to resume
variables:
  target_type: 'Domain/subdomain list'
  targets: 'example.com'
  assessment_type: 'Authenticated'
---
```

**Resumption Logic:**
- On workflow start, check `stepsCompleted`
- If not empty, offer to resume from last step
- Allow user to restart or continue

### Step 6: Define Micro-Steps (Optional)

For complex workflows, split steps into individual files:

**steps/step-01-scope.md:**
```markdown
<step n="1" goal="Define scope and targets">
<!-- Step content here -->
</step>
```

**instructions.md (references micro-steps):**
```markdown
<workflow>
<include file="steps/step-01-scope.md" />
<include file="steps/step-02-recon.md" />
<include file="steps/step-03-scan.md" />
<include file="steps/step-04-analysis.md" />
<include file="steps/step-05-report.md" />
</workflow>
```

---

## Workflow XML Reference

### Core Elements

| Element | Purpose | Attributes |
|---------|---------|------------|
| `<workflow>` | Root container | None |
| `<step>` | Individual phase | `n` (order), `goal` (description) |
| `<output>` | Display to user | None |
| `<ask>` | Prompt for input | None |
| `<action>` | Execute instruction | None |
| `<check>` | Conditional logic | `if` (condition) |
| `<include>` | Load external file | `file` (path) |

### Step Structure

```xml
<step n="1" goal="Brief description of this step's purpose">
  <output>
  Content displayed to the user. Supports markdown formatting.
  Can include variables like {user_name} or {date}.
  </output>

  <ask>Question for the user?

  1. Option one
  2. Option two
  3. Option three

  Choice [1-3]:</ask>
  <action>Store as variable_name</action>

  <check if="variable_name == 'Option one'">
    <action>Do something for option one</action>
  </check>

  <check if="variable_name == 'Option two'">
    <action>Do something different for option two</action>
  </check>
</step>
```

### Conditional Logic

```xml
<!-- Simple equality -->
<check if="assessment_type == 'Authenticated'">
  <action>Request credentials from user</action>
</check>

<!-- OR condition -->
<check if="target_type == 'Single host/IP' OR target_type == 'IP range/CIDR'">
  <action>Perform IP-based reconnaissance</action>
</check>

<!-- AND condition -->
<check if="scan_depth == 'Deep scan' AND assessment_type == 'Full scope'">
  <action>Enable all scanning modules</action>
</check>

<!-- NOT condition -->
<check if="NOT findings_exported">
  <action>Export findings before proceeding</action>
</check>
```

### File Operations

```xml
<!-- Write artifact -->
<action>Write findings to {output_folder}/reconnaissance/target-profile.md</action>

<!-- Read artifact -->
<action>Load previous findings from {output_folder}/reconnaissance/target-profile.md</action>

<!-- Create directory -->
<action>Ensure directory exists: {output_folder}/vulnerability-assessment/</action>
```

### Workflow Navigation

```xml
<!-- Jump to specific step -->
<action>Go to Step 3</action>

<!-- Return to previous step -->
<action>Return to Step 1</action>

<!-- Exit workflow -->
<action>Complete workflow and save state</action>

<!-- Invoke another workflow -->
<action>Invoke workflow: _bmad/cybersec-team/workflows/threat-modeling/workflow.yaml</action>

<!-- Invoke party mode -->
<action>Invoke party mode with preset=security-review-team</action>
```

---

## Complete Workflow Template

### workflow.yaml

```yaml
name: custom-workflow
description: "Template for custom workflow creation"
author: "Your Name"
version: "1.0"

config_source: "{project-root}/_bmad/{module}/config.yaml"
output_folder: "{config_source}:output_folder"
user_name: "{config_source}:user_name"
communication_language: "{config_source}:communication_language"
date: system-generated

installed_path: "{project-root}/_bmad/{module}/workflows/custom-workflow"
instructions: "{installed_path}/instructions.md"

# Optional party mode
party_preset: "relevant-preset-name"
party_preset_file: "{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml"

# Related workflows
related_workflows:
  dependency_workflow: "{project-root}/_bmad/{module}/workflows/dependency/workflow.yaml"

# Expected outputs
artifacts:
  phase1:
    - initial-output.md
  phase2:
    - intermediate-output.md
  final:
    - final-deliverable.md

standalone: true
requires_project: false
```

### instructions.md

```markdown
---
stepsCompleted: []
workflowType: 'custom-workflow'
user_name: '{{user_name}}'
date: '{{date}}'
---

# Custom Workflow

Brief description of what this workflow accomplishes.

<workflow>

<step n="1" goal="Initialize and gather requirements">
<output>
## Step 1: Initialization

Welcome to the Custom Workflow. Let's begin by gathering necessary information.
</output>

<ask>What is the primary objective?

1. Option A - Description
2. Option B - Description
3. Option C - Description

Choice [1-3]:</ask>
<action>Store as primary_objective</action>

<ask>Please provide additional context or requirements:</ask>
<action>Store as context</action>

<output>
### Configuration Summary

| Setting | Value |
|---------|-------|
| Objective | {primary_objective} |
| Context | {context} |
| User | {user_name} |
| Date | {date} |

Ready to proceed to the main workflow phase.
</output>
</step>

<step n="2" goal="Main processing phase">
<output>
## Step 2: Processing

Executing the main workflow logic based on your inputs.
</output>

<action>
Perform the primary workflow tasks:
1. First task based on {primary_objective}
2. Second task incorporating {context}
3. Generate intermediate artifacts
</action>

<ask>Review the results above. How would you like to proceed?

1. Continue to final phase
2. Adjust parameters and reprocess
3. Export current state and pause

Choice [1-3]:</ask>
<action>Store as proceed_decision</action>

<check if="proceed_decision == 'Adjust parameters and reprocess'">
  <action>Return to Step 1</action>
</check>

<check if="proceed_decision == 'Export current state and pause'">
  <action>Write current state to {output_folder}/custom-workflow/checkpoint.md</action>
  <output>
  State saved. You can resume this workflow later.
  </output>
</check>
</step>

<step n="3" goal="Finalize and generate deliverables">
<output>
## Step 3: Finalization

Generating final deliverables and completing the workflow.
</output>

<action>
Generate final artifacts:
1. Compile all findings
2. Format for target audience
3. Write to output directory
</action>

<ask>Select output format:

1. Standard report
2. Executive summary
3. Technical deep-dive
4. All formats

Choice [1-4]:</ask>
<action>Store as output_format and generate reports accordingly</action>

<output>
### Workflow Complete

**Generated Artifacts:**
- final-deliverable.md

**Output Location:** {output_folder}/custom-workflow/

**Summary:**
- Objective: {primary_objective}
- Status: Complete
- Date: {date}

Thank you for using the Custom Workflow!
</output>
</step>

</workflow>
```

---

## Registration

After creating your workflow, register it in the manifest.

### Add to Workflow Manifest

Edit `_bmad/_config/workflow-manifest.csv`:

```csv
name,description,module,path
"custom-workflow","Template for custom workflow creation","your-module","_bmad/your-module/workflows/custom-workflow/workflow.yaml"
```

### Add to Agent Menu

In your module's agent file, add a menu item:

```xml
<item cmd="X" workflow="_bmad/{module}/workflows/custom-workflow/workflow.yaml">
  Custom Workflow - Description of what this does
</item>
```

### Verify Registration

```bash
# Check workflow appears in manifest
grep "custom-workflow" _bmad/_config/workflow-manifest.csv

# Verify files exist
ls -la _bmad/{module}/workflows/custom-workflow/
```

---

## Testing Your Workflow

### Manual Testing Checklist

- [ ] workflow.yaml parses correctly
- [ ] All variable references resolve
- [ ] Each step executes in order
- [ ] User prompts display correctly
- [ ] Conditional logic works as expected
- [ ] Artifacts are created in correct locations
- [ ] State tracking persists between sessions
- [ ] Resume functionality works

### Validation Commands

```bash
# Validate YAML syntax
python -c "import yaml; yaml.safe_load(open('_bmad/{module}/workflows/custom-workflow/workflow.yaml'))"

# Check for broken paths
grep -oE '\{[^}]+\}' _bmad/{module}/workflows/custom-workflow/workflow.yaml | sort -u

# Verify artifact directories exist (or will be created)
ls -la {output_folder}
```

---

## Best Practices

### Design Principles

1. **Keep steps focused** - Each step should have a single clear goal
2. **Provide escape hatches** - Allow users to pause, export, or adjust at each step
3. **Show progress** - Display what's been completed and what's next
4. **Handle errors gracefully** - What happens if a step fails?

### User Experience

1. **Clear prompts** - Users should understand what input is expected
2. **Sensible defaults** - Offer recommended options when possible
3. **Preview before action** - Show what will happen before doing it
4. **Confirm destructive actions** - Require explicit confirmation for overwrites

### Maintainability

1. **Document assumptions** - What does this workflow expect to exist?
2. **Version your workflows** - Track changes in the YAML metadata
3. **Test with different inputs** - Verify edge cases work correctly
4. **Use descriptive variable names** - `assessment_type` not `at`

### Integration

1. **Follow artifact conventions** - Use standard output paths
2. **Enable party mode** - Include preset for collaborative review
3. **Reference related workflows** - Help users discover connected processes
4. **Update the manifest** - Ensure discoverability

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Workflow not found | Not in manifest | Add to `workflow-manifest.csv` |
| Variables not resolving | Wrong config path | Verify `config_source` path |
| Steps out of order | Missing `n` attribute | Add sequential `n` values |
| State not persisting | Frontmatter issue | Check YAML frontmatter syntax |
| Artifacts not created | Wrong output path | Verify `output_folder` resolves |
| Party mode fails | Invalid preset | Check preset name in YAML |

---

## Advanced Patterns

### Workflow Chaining

Call other workflows from within your workflow:

```xml
<step n="X" goal="Run dependent workflow">
<action>
Before proceeding, we need threat modeling results.
Invoke workflow: _bmad/cybersec-team/workflows/threat-modeling/workflow.yaml
Wait for completion and load artifacts.
</action>
</step>
```

### Dynamic Step Generation

For workflows that need flexible step counts:

```xml
<step n="2" goal="Process each target">
<action>
For each target in {targets}:
  1. Perform scanning
  2. Analyze results
  3. Store findings

Loop until all targets processed.
</action>
</step>
```

### Parallel Execution

When steps can run independently:

```xml
<step n="3" goal="Parallel analysis">
<output>
Running multiple analysis tasks in parallel...
</output>

<action type="parallel">
  <task>Perform vulnerability analysis</task>
  <task>Perform configuration review</task>
  <task>Perform compliance check</task>
</action>

<output>
All parallel tasks complete. Proceeding to synthesis.
</output>
</step>
```

---

## Related Documentation

- [Custom Agent Creation](./CUSTOM-AGENT-CREATION.md)
- [Custom Party Presets](./CUSTOM-PARTY-PRESETS.md)
- [Workflow Selection Guide](../WORKFLOW-SELECTION-GUIDE.md)
- [Workflow Chaining Guide](../WORKFLOW-CHAINING-GUIDE.md)

---

## Appendix: Variable Resolution

### Config Variables

Variables from `config.yaml` use the syntax `{config_source}:variable_name`:

```yaml
output_folder: "{config_source}:output_folder"  # Reads from config
user_name: "{config_source}:user_name"
```

### System Variables

| Variable | Source | Example Value |
|----------|--------|---------------|
| `{project-root}` | Git repository root | `/Users/user/BMAD-CYBER2` |
| `{date}` | System generated | `2026-01-16` |
| `{timestamp}` | System generated | `2026-01-16T14:30:00Z` |

### User Variables

Variables stored during workflow execution:

```xml
<ask>Enter your choice:</ask>
<action>Store as user_choice</action>

<!-- Later in workflow -->
<output>You selected: {user_choice}</output>
```

### Path Variables

Combine variables for full paths:

```yaml
installed_path: "{project-root}/_bmad/{module}/workflows/{workflow-name}"
instructions: "{installed_path}/instructions.md"
output_dir: "{output_folder}/{workflow-name}/{date}"
```
