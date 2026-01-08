---
name: 'step-03-select-component'
description: 'Select next component for STRIDE threat analysis and track analysis progress'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/threat-modeling'

# File References
thisStepFile: '{workflow_path}/steps/step-03-select-component.md'
nextStepFile: '{workflow_path}/steps/step-04-stride-analysis.md'
summaryStepFile: '{workflow_path}/steps/step-08-summary.md'
outputFile: '{output_folder}/threat-model-{project_name}.md'
---

# Step 3: Component Selection

## STEP GOAL:

To present the component inventory, allow user to select the next component for threat analysis, track analysis progress, and route appropriately when all components are analyzed.

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

- 🎯 Focus ONLY on component selection and progress tracking
- 🚫 FORBIDDEN to perform threat analysis in this step
- 💬 Present clear component list with analysis status
- 🚪 Route to summary if all components analyzed

## EXECUTION PROTOCOLS:

- 🎯 Load components and componentsAnalyzed from frontmatter
- 💾 Display component selection menu with status indicators
- 📖 Update frontmatter with currentComponent before loading next step
- 🚫 FORBIDDEN to load STRIDE analysis until component is selected

## CONTEXT BOUNDARIES:

- Components array populated from step 2
- componentsAnalyzed array tracks completed analyses
- currentComponent indicates active analysis target
- Must check completion before proceeding

## COMPONENT SELECTION PROCESS:

### 1. Load Current State

Read {outputFile} frontmatter to extract:
- `components` - Array of all identified components
- `componentsAnalyzed` - Array of components already analyzed
- `currentComponent` - Component currently being analyzed (if any)

### 2. Check Completion Status

**IF `componentsAnalyzed.length === components.length`:**

All components have been analyzed. Display:

"**Component Analysis Complete**

✅ All {components.length} components have been analyzed for threats.

**Analyzed Components:**
{list-all-components-with-checkmarks}

Proceeding to summary and recommendations..."

Immediately load, read entire file, then execute {summaryStepFile}

**STOP** - Do not proceed with component selection.

### 3. Calculate Remaining Components

**IF components remain to be analyzed:**

Create two lists:
1. **Analyzed** - Components in `componentsAnalyzed` array
2. **Remaining** - Components NOT in `componentsAnalyzed` array

### 4. Present Component Selection

Display:

"**Component Selection for Threat Analysis**

**System:** {systemName}

**Analysis Progress:** {componentsAnalyzed.length} of {components.length} components analyzed

**Analyzed Components:** ✅
{list-analyzed-components-with-checkmarks}

**Remaining Components:**
{list-remaining-components-with-numbers}

**Select a component to analyze:**

Enter the number of the component you want to analyze for threats using the STRIDE methodology."

### 5. Collect Component Selection

Wait for user to select a component by number.

**Validation:**
- Ensure selected number is valid (1 to remaining.length)
- Ensure selected component is not already in componentsAnalyzed

**IF invalid selection:**
"Invalid selection. Please choose a component number from the list above."
Return to selection prompt.

### 6. Set Current Component

Once valid component selected, extract component details:
- Component name
- Component type
- Component technology
- Component description

Display confirmation:

"**Component Selected for Analysis**

**Component:** {component-name}
**Type:** {component-type}
**Technology:** {component-technology}
**Description:** {component-description}

We'll now perform a systematic STRIDE analysis to identify potential threats to this component.

**STRIDE Categories:**
- **S**poofing - Identity verification threats
- **T**ampering - Data/code integrity threats
- **R**epudiation - Audit and logging threats
- **I**nformation Disclosure - Confidentiality threats
- **D**enial of Service - Availability threats
- **E**levation of Privilege - Authorization threats

Proceeding to STRIDE analysis..."

### 7. Update Frontmatter

Update {outputFile} frontmatter:

```yaml
---
stepsCompleted: [1, 2, 3]
lastStep: 'select-component'
systemName: '{system-name}'
businessCriticality: '{criticality}'
components: [...existing-components...]
componentsAnalyzed: [...existing-analyzed-components...]
currentComponent: '{selected-component-name}'
workflowComplete: false
date: '{date}'
user_name: '{user_name}'
---
```

**CRITICAL:** Update `currentComponent` with the selected component name.

### 8. Route to STRIDE Analysis

Immediately load, read entire file, then execute {nextStepFile} to begin STRIDE threat analysis for the selected component.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Component list displayed with analysis status
- Progress tracking accurate (X of Y analyzed)
- User selects component successfully
- Frontmatter updated with currentComponent
- Routed to STRIDE analysis (step 4)
- OR routed to summary if all components analyzed

### ❌ SYSTEM FAILURE:

- Not checking if all components analyzed
- Proceeding without component selection
- Not updating currentComponent in frontmatter
- Allowing analysis of already-analyzed component
- Not displaying progress accurately

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN a component is selected (OR all components are analyzed) will you update frontmatter and immediately load, read entire file, then execute the appropriate next step file ({nextStepFile} for analysis or {summaryStepFile} if complete).
