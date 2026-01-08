---

name: 'step-01b-continue'
description: 'Handle Security Architecture Review workflow continuation from previous session'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-architecture-review'

# File References

thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/planning/architecture/security-review-{project_name}.md'
workflowFile: '{workflow_path}/workflow.md'

# Step File References (for analysis)
step02File: '{workflow_path}/steps/step-02-threat-modeling.md'
step03File: '{workflow_path}/steps/step-03-control-assessment.md'
step04File: '{workflow_path}/steps/step-04-attack-surface.md'
step05File: '{workflow_path}/steps/step-05-zero-trust.md'
step06File: '{workflow_path}/steps/step-06-recommendations.md'
step07File: '{workflow_path}/steps/step-07-report-generation.md'

---

# Step 1B: Security Architecture Review Continuation

## STEP GOAL:

To resume the Security Architecture Review workflow from where it was left off, ensuring smooth continuation without loss of context or security analysis progress.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Architect (Bastion persona)
- ✅ If you already have been given a name, communication_style and identity, continue to use those while playing this role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in STRIDE threat modeling, zero-trust principles, security control frameworks, and risk assessment
- ✅ User brings architecture knowledge, technical context, and implementation constraints
- ✅ Maintain collaborative, professional, technically precise tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on analyzing and resuming workflow state
- 🚫 FORBIDDEN to modify content completed in previous steps
- 💬 Maintain continuity with previous security analysis sessions
- 🚪 DETECT exact continuation point from frontmatter of incomplete file {outputFile}

## EXECUTION PROTOCOLS:

- 🎯 Show your analysis of current security review state before taking action
- 💾 Keep existing frontmatter `stepsCompleted` values intact
- 📖 Review the security analysis content already generated in {outputFile}
- 🚫 FORBIDDEN to modify threat model, control assessments, or other content completed in previous steps
- 📝 Update frontmatter with continuation timestamp when resuming

## CONTEXT BOUNDARIES:

- Current security-review document is already loaded
- Previous context = complete report + existing frontmatter + all completed analyses
- Architecture context, threat models, and assessments already gathered in previous sessions
- Last completed step = last value in `stepsCompleted` array from frontmatter

## CONTINUATION SEQUENCE:

### 1. Analyze Current State

Review the frontmatter of {outputFile} to understand:

- `stepsCompleted`: Which steps are already done (the rightmost value is the last step completed)
- `lastStep`: Name/description of last completed step (if exists)
- `date`: Original workflow start date
- `architectureDocs`: Any architecture documents referenced
- `project_name`: System being reviewed
- Any other relevant metadata

Example: If `stepsCompleted: [1, 2, 3, 4]`, then step 4 (Attack Surface Analysis) was the last completed step.

**Step Mapping:**
- Step 1: Initialization & Architecture Context
- Step 2: STRIDE Threat Modeling
- Step 3: Security Control Assessment
- Step 4: Attack Surface Analysis (optional)
- Step 5: Zero-Trust Validation
- Step 6: Recommendations & Remediation
- Step 7: Report Generation

### 2. Read Last Completed Step File

Determine which step was last completed and read that step file to understand context:

- If `stepsCompleted` ends with 1: Read {step02File} to understand next step (Threat Modeling)
- If `stepsCompleted` ends with 2: Read {step03File} to understand next step (Control Assessment)
- If `stepsCompleted` ends with 3: Read {step04File} to understand next step (Attack Surface - optional)
- If `stepsCompleted` ends with 4: Read {step05File} to understand next step (Zero-Trust Validation)
- If `stepsCompleted` ends with 5: Read {step06File} to understand next step (Recommendations)
- If `stepsCompleted` ends with 6: Read {step07File} to understand next step (Report Generation)

### 3. Review Previous Security Analysis

Read the complete {outputFile} to understand:

- Architecture Overview (Section 2): System context and boundaries
- Threat Model (Section 3): STRIDE threats identified (if completed)
- Control Assessment (Section 4): Existing controls evaluated (if completed)
- Risk Matrix (Section 5): Prioritized findings (if completed)
- Recommendations (Section 6): Mitigations proposed (if completed)
- Roadmap (Section 7): Implementation plan (if completed)

### 4. Determine Next Step

Based on the last value in `stepsCompleted` array, determine the next step file:

| Last Completed | Next Step File | Next Step Description |
|----------------|----------------|----------------------|
| 1 | {step02File} | STRIDE Threat Modeling |
| 2 | {step03File} | Security Control Assessment |
| 3 | {step04File} | Attack Surface Analysis (optional) |
| 4 | {step05File} | Zero-Trust Validation |
| 5 | {step06File} | Recommendations & Remediation |
| 6 | {step07File} | Report Generation |

### 5. Welcome Back Dialog

Present a warm, context-aware welcome:

"**Welcome back to your Security Architecture Review for {project_name}!**

I see we've completed [X] steps of the security analysis.

**Progress Summary:**
- ✅ Architecture Context Gathered
[If step 2 complete:] - ✅ STRIDE Threat Model Complete
[If step 3 complete:] - ✅ Security Control Assessment Complete
[If step 4 complete:] - ✅ Attack Surface Analysis Complete
[If step 5 complete:] - ✅ Zero-Trust Validation Complete
[If step 6 complete:] - ✅ Recommendations Developed

**Next Step:** [Description of next step based on section 4 mapping]

Are you ready to continue where we left off?"

### 6. Validate Continuation Intent

Ask confirmation questions if needed:

"Before we continue:
- Has the architecture changed since our last session?
- Do you need to review any of the completed analysis?
- Are there new threats or controls to consider?"

### 7. Present MENU OPTIONS

Display: **Resuming Security Architecture Review - Select an Option:** [C] Continue to [Next Step Name] [R] Review Previous Analysis

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- If user selects 'R', display summary of completed sections, then redisplay menu
- User can chat or ask questions - always respond and then end with display again of the menu options
- Update frontmatter with continuation timestamp when 'C' is selected

#### Menu Handling Logic:

- IF C:
  1. Update frontmatter in {outputFile}: add `lastContinued: [current date YYYY-MM-DD HH:MM]`
  2. Load, read entire file, then execute the appropriate next step file (determined in section 4)
- IF R: Display summary of completed analysis sections from {outputFile}, then redisplay menu
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#7-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and continuation analysis is complete, will you then:

1. Update frontmatter in {outputFile} with `lastContinued: [current timestamp]`
2. Load, read entire file, then execute the next step file determined from the analysis

Do NOT modify any security analysis content in the output document during this continuation step.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Correctly identified last completed step from `stepsCompleted` array
- Read and understood previous security analysis context
- Displayed accurate progress summary to user
- User confirmed readiness to continue
- Frontmatter updated with continuation timestamp
- Workflow resumed at appropriate next step
- No modification of existing threat models or assessments

### ❌ SYSTEM FAILURE:

- Skipping analysis of existing security review state
- Modifying threat models, control assessments, or other content from previous steps
- Loading wrong next step file
- Not updating frontmatter with continuation info
- Proceeding without user confirmation
- Losing track of completed analysis work

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
