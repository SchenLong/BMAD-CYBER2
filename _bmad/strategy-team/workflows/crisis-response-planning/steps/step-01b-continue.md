---
name: step-01b-continue
description: Resume a Crisis Response Planning session from where it left off

outputFile: '{output_folder}/crisis/crisis-response-*.md'
nextStepFile: './step-02-immediate-actions.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Previous Session

## STEP GOAL:

Resume a previously started Crisis Response Planning session by reading the existing output file and determining the next step.

### Role Reinforcement:

- You are a Senior Crisis Management Facilitator resuming an active response
- Read the existing work before taking any action
- Pick up exactly where we left off
- Maintain continuity with previous session
- Re-orient the user to current crisis state

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Locate Existing Session

**Ask user or search for existing crisis response:**

"Welcome back, {user_name}. Let me locate your in-progress crisis response plan.

Do you have a specific crisis response you'd like to continue, or should I look for recent files?"

**Search {output_folder}/crisis/ for files matching `crisis-response-*.md` with status: active or in_progress**

### 2. Read Session State

**Load the identified output file and read:**
- `stepsCompleted` array from frontmatter
- `crisisTitle`
- `severity`
- `status`
- All completed sections

### 3. Determine Next Step

**Based on stepsCompleted, identify the next step:**

| Last Completed Step | Next Step File |
|---------------------|----------------|
| step-01-init | step-02-immediate-actions.md |
| step-02-immediate-actions | step-03-stakeholder-comms.md |
| step-03-stakeholder-comms | step-04-media-strategy.md |
| step-04-media-strategy | step-05-political-dimension.md |
| step-05-political-dimension | step-06-recovery-path.md |

### 4. Present Summary and Resume

**Present to user:**

"I found your crisis response plan for: **{crisisTitle}**

**Severity Level:** {severity}
**Status:** {status}

**Progress so far:**
- Completed steps: {list stepsCompleted}

**Key Context:**
- Crisis type: [summary]
- Stakeholders affected: [summary]
- Current phase: [assessment/response/recovery]

**Actions taken so far:**
[Brief summary of key actions documented]

Ready to continue with the next step: **{next step name}**"

### 5. Check for Updates

**Ask:**
"Before we continue, has anything changed since we last worked on this?
- New information emerged?
- Situation escalated or de-escalated?
- New stakeholders affected?

If yes, we may need to update our assessment first."

### 6. Present MENU OPTIONS

Display: "**Select:** [C] Continue to Next Step [U] Update Assessment [R] Review Previous Step [X] Exit"

#### Menu Handling Logic:
- IF C: Load and follow the appropriate next step file
- IF U: Return to step-01-init to update assessment with new information
- IF R: Display previous step's content and allow revisions
- IF X: Save and exit gracefully
- IF Any other: help user respond then redisplay menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Existing session located and loaded
- Progress accurately identified
- User oriented to current crisis state
- Changes since last session captured
- Seamless continuation to next step

### SYSTEM FAILURE:
- Starting over without user consent
- Losing previous work
- Misidentifying progress state
- Skipping steps that weren't completed
- Not checking for situation changes
