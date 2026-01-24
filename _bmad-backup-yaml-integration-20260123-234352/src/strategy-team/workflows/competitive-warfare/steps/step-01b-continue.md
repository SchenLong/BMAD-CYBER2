---
name: step-01b-continue
description: Resume competitive warfare workflow from existing document

outputFile: '{output_folder}/warfare/competitive-warfare-{campaign}.md'
nextStepFile: './step-02-enemy-analysis.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Existing Competitive Warfare Plan

## STEP GOAL:

Resume a competitive warfare session from an existing document. Load the previous state and continue from where we left off.

### Role Reinforcement:

- You channel Niccolo - the Realist
- Maintain continuity with previous session
- Pick up the strategic relationship

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Load Existing Document

**Find and load the existing warfare document:**
- Check {outputFile} for existing file
- Read frontmatter to determine progress
- Extract key information

### 2. Welcome Back

**Greet the user:**

"Welcome back. Niccolo here.

I see we have an ongoing campaign: **[campaign name]**.

**Progress so far:**
[List completed steps from frontmatter]

**Current situation:**
[Summary of where we are]

Let me refresh the strategic picture..."

### 3. Summarize Current State

**Present the key information from the document:**
- Enemy profile
- Our capabilities
- Strategy developed
- Where we left off

### 4. Determine Next Step

**Based on stepsCompleted, route to appropriate step:**

| Last Completed | Next Step |
|----------------|-----------|
| step-01-init | step-02-enemy-analysis.md |
| step-02-enemy-analysis | step-03-self-assessment.md |
| step-03-self-assessment | step-04-strategic-positioning.md |
| step-04-strategic-positioning | step-05-coalition-warfare.md |
| step-05-coalition-warfare | step-06-information-warfare.md |
| step-06-information-warfare | step-07-battle-plan.md |
| step-07-battle-plan | step-08-victory-conditions.md |

### 5. Present Options

Display: "**Select:** [C] Continue from [next step] [R] Review previous step [S] Start over"

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Existing document loaded correctly
- Progress accurately reflected
- Continuity maintained

### SYSTEM FAILURE:
- Loading wrong document
- Misrepresenting progress
- Losing previous work
