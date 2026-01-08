---
name: 'step-01b-continue'
description: 'Handle workflow continuation by analyzing progress and routing to appropriate next step'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/threat-modeling'

# File References
thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/threat-model-{project_name}.md'

# Step Files
step02File: '{workflow_path}/steps/step-02-decomposition.md'
step03File: '{workflow_path}/steps/step-03-select-component.md'
step04File: '{workflow_path}/steps/step-04-stride-analysis.md'
step05File: '{workflow_path}/steps/step-05-risk-assessment.md'
step06File: '{workflow_path}/steps/step-06-mitigation.md'
step07File: '{workflow_path}/steps/step-07-loop-decision.md'
step08File: '{workflow_path}/steps/step-08-summary.md'
---

# Step 1b: Workflow Continuation

## STEP GOAL:

To analyze existing threat model progress from frontmatter, present current state to user, and route to the appropriate next step for continuation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Threat Modeling Expert
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring STRIDE methodology and security expertise, user brings system knowledge
- ✅ Maintain professional, systematic, security-focused tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on continuation analysis and routing
- 🚫 FORBIDDEN to proceed with threat analysis in this step
- 💬 Present clear progress summary from document frontmatter
- 🚪 Route to correct next step based on stepsCompleted

## EXECUTION PROTOCOLS:

- 🎯 Read and analyze frontmatter from {outputFile}
- 💾 Display progress summary to user
- 📖 Route to appropriate next step based on last completed step
- 🚫 FORBIDDEN to skip steps or optimize the sequence

## CONTEXT BOUNDARIES:

- Output document exists with frontmatter tracking
- stepsCompleted array indicates progress
- Components and analysis state stored in frontmatter
- Must preserve all existing work

## CONTINUATION SEQUENCE:

### 1. Load Existing Threat Model

Read the complete {outputFile} including frontmatter.

Extract from frontmatter:
- `stepsCompleted` - Array of completed step numbers
- `lastStep` - Name of last completed step
- `systemName` - System being analyzed
- `businessCriticality` - System criticality level
- `components` - Array of identified components
- `componentsAnalyzed` - Array of components fully analyzed
- `currentComponent` - Component currently being analyzed
- `workflowComplete` - Boolean completion flag
- `date` - Workflow start date

### 2. Analyze Workflow State

Determine last completed step from `stepsCompleted` array:

**Step Mapping:**
- `1` = System Overview (init)
- `2` = Component Decomposition
- `3` = Component Selection
- `4` = STRIDE Analysis
- `5` = Risk Assessment
- `6` = Mitigation Strategies
- `7` = Loop Decision
- `8` = Summary and Recommendations

**Identify Current State:**
- What is the last completed step?
- Are we in the middle of analyzing a component?
- How many components identified vs analyzed?
- Is workflow complete?

### 3. Present Progress Summary

Display:

"**Welcome Back to Threat Modeling**

**System:** {systemName}
**Business Criticality:** {businessCriticality}
**Started:** {date}

**Progress Summary:**

✅ **Completed Steps:**
{list-all-completed-steps-with-checkmarks}

**Component Analysis Progress:**
- Total Components Identified: {components.length}
- Components Fully Analyzed: {componentsAnalyzed.length}
- Current Component: {currentComponent || 'None'}

**Last Completed:** {lastStep}

**Next Step:** {next-step-description}"

### 4. Route to Next Step

Based on last completed step number, route as follows:

#### IF stepsCompleted includes 8:
"**Workflow Complete!**

Your threat model was completed on {date}. The complete threat model document is available at:
`{outputFile}`

Would you like to:
1. Review the threat model
2. Update/modify the threat model
3. Export to another format"

**STOP** - Do not proceed, wait for user input.

#### IF last step is 1 (System Overview):
"Resuming at **Component Decomposition**. We'll identify and document all major system components next."

Load, read entire file, then execute {step02File}

#### IF last step is 2 (Component Decomposition):
Check components array:
- If `components.length === 0`: "No components were identified yet. Let's return to component decomposition."
  - Load {step02File}
- Else: "Components identified. Proceeding to component selection for threat analysis."
  - Load {step03File}

#### IF last step is 3 (Component Selection):
Check currentComponent:
- If `currentComponent` exists and not in `componentsAnalyzed`: "Resuming STRIDE analysis for component: {currentComponent}"
  - Load {step04File}
- Else: "Component selection was last step. Proceeding to STRIDE analysis."
  - Load {step04File}

#### IF last step is 4 (STRIDE Analysis):
"STRIDE analysis completed for {currentComponent}. Proceeding to risk assessment."

Load {step05File}

#### IF last step is 5 (Risk Assessment):
"Risk assessment completed for {currentComponent}. Proceeding to mitigation strategies."

Load {step06File}

#### IF last step is 6 (Mitigation Strategies):
"Mitigation strategies completed for {currentComponent}. Checking if more components need analysis."

Load {step07File}

#### IF last step is 7 (Loop Decision):
Check component status:
- If `componentsAnalyzed.length < components.length`: "More components to analyze. Returning to component selection."
  - Load {step03File}
- Else: "All components analyzed. Proceeding to summary."
  - Load {step08File}

### 5. Execute Routing

After determining next step, immediately load, read entire file, then execute the appropriate step file.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Frontmatter loaded and analyzed correctly
- Progress summary displayed accurately
- User understands current state
- Routed to correct next step based on stepsCompleted
- No steps skipped or duplicated

### ❌ SYSTEM FAILURE:

- Not reading frontmatter from output document
- Incorrect routing logic
- Skipping steps in sequence
- Not preserving existing work
- Creating duplicate work

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN the routing decision is made based on stepsCompleted analysis will you immediately load, read entire file, then execute the appropriate next step file.
