---
name: 'step-07-loop-decision'
description: 'Mark current component as analyzed and decide whether to analyze more components or proceed to summary'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/threat-modeling'

# File References
thisStepFile: '{workflow_path}/steps/step-07-loop-decision.md'
componentSelectionFile: '{workflow_path}/steps/step-03-select-component.md'
summaryFile: '{workflow_path}/steps/step-08-summary.md'
outputFile: '{output_folder}/threat-model-{project_name}.md'
---

# Step 7: Loop Decision

## STEP GOAL:

To mark the current component as fully analyzed, update progress tracking, and decide whether to analyze additional components or proceed to summary and recommendations.

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

- 🎯 Focus ONLY on progress tracking and routing decision
- 🚫 FORBIDDEN to perform threat analysis in this step
- 💬 Present clear progress summary and next options
- 🚪 Route based on whether more components remain

## EXECUTION PROTOCOLS:

- 🎯 Mark currentComponent as analyzed
- 💾 Update componentsAnalyzed array in frontmatter
- 📖 Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]` before routing
- 🚫 FORBIDDEN to proceed without updating progress tracking

## CONTEXT BOUNDARIES:

- Current component has completed steps 4, 5, 6 (STRIDE, Risk, Mitigation)
- Must track completion before proceeding
- Decision point: more components OR proceed to summary
- This is routing logic, not analysis

## LOOP DECISION PROCESS:

### 1. Load Current State

Read {outputFile} frontmatter to extract:
- `currentComponent` - Component just analyzed
- `components` - Array of all components
- `componentsAnalyzed` - Array of components fully analyzed

### 2. Mark Current Component as Analyzed

**Add `currentComponent` to `componentsAnalyzed` array** (if not already present).

Example:
```yaml
componentsAnalyzed: ['Web Frontend', 'API Backend', 'PostgreSQL Database']
```

**Clear `currentComponent`:**
```yaml
currentComponent: ''
```

### 3. Calculate Progress

**Total Components:** {components.length}
**Analyzed:** {componentsAnalyzed.length}
**Remaining:** {components.length - componentsAnalyzed.length}

### 4. Display Progress Summary

Display:

"**Component Analysis Complete**

✅ **{currentComponent}** has been fully analyzed.

**Analysis Coverage:**

{list-all-components-with-status-checkmarks}

**Progress:** {componentsAnalyzed.length} of {components.length} components analyzed ({percentage}%)

**Remaining Components:** {remaining-count}"

### 5. Decision Point

**IF `componentsAnalyzed.length < components.length`:**

Some components remain unanalyzed.

Display:

"**Next Steps:**

You have {remaining-count} component(s) remaining:

{list-remaining-components}

**Options:**

**[M]** - Analyze More Components (continue with next component)
**[C]** - Proceed to Summary and Recommendations (skip remaining components)

What would you like to do?"

Wait for user selection.

#### IF user selects 'M':

"Proceeding to component selection for next analysis..."

Update frontmatter:
```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
lastStep: 'loop-decision'
componentsAnalyzed: [...updated-array...]
currentComponent: ''
```

Load, read entire file, then execute {componentSelectionFile} to select next component.

#### IF user selects 'C':

"You've chosen to proceed to summary with {componentsAnalyzed.length} of {components.length} components analyzed.

**Note:** The following components will NOT be included in the threat model:
{list-unanalyzed-components}

You can always return to this threat model later to analyze the remaining components.

Proceeding to summary and recommendations..."

Update frontmatter:
```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
lastStep: 'loop-decision'
componentsAnalyzed: [...updated-array...]
currentComponent: ''
```

Load, read entire file, then execute {summaryFile} to create summary.

**IF `componentsAnalyzed.length === components.length`:**

All components have been analyzed.

Display:

"**All Components Analyzed! 🎉**

Excellent work! All {components.length} components have been thoroughly analyzed using the STRIDE methodology.

**Analyzed Components:**
{list-all-components-with-checkmarks}

**Analysis Summary:**
- Total STRIDE threats identified: {aggregate-threat-count}
- High-priority mitigations (P0/P1): {aggregate-high-priority-count}

Proceeding to create the final summary and recommendations..."

Update frontmatter:
```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
lastStep: 'loop-decision'
componentsAnalyzed: [...all-components...]
currentComponent: ''
```

Immediately load, read entire file, then execute {summaryFile} to create summary.

### 6. Update Frontmatter

**Before routing to next step**, update {outputFile} frontmatter:

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
lastStep: 'loop-decision'
systemName: '{system-name}'
businessCriticality: '{criticality}'
components: [...existing...]
componentsAnalyzed: [...updated-with-current-component...]
currentComponent: ''
workflowComplete: false
date: '{date}'
user_name: '{user_name}'
---
```

**CRITICAL:** Ensure `currentComponent` is added to `componentsAnalyzed` and `currentComponent` is cleared.

### 7. Route to Next Step

Based on decision:

- **More components to analyze** → Load {componentSelectionFile}
- **All components analyzed OR user chooses to proceed** → Load {summaryFile}

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Current component marked as analyzed
- componentsAnalyzed array updated correctly
- currentComponent cleared
- Progress summary displayed accurately
- User presented with clear options
- Frontmatter updated with step 7 complete
- Routed to appropriate next step (component selection OR summary)

### ❌ SYSTEM FAILURE:

- Not updating componentsAnalyzed array
- Not clearing currentComponent
- Incorrect progress calculation
- Routing without user decision
- Not updating frontmatter before routing
- Skipping unanalyzed components without user approval

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN progress is updated in frontmatter AND routing decision is made (more components OR proceed to summary) will you load, read entire file, then execute the appropriate next step file ({componentSelectionFile} or {summaryFile}).
