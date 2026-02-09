---
name: step-01b-continue
description: Resume a Policy Development session from where it left off

outputFile: '{output_folder}/policies/policy-*.md'
nextStepFile: './step-02-evidence-review.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1b: Continue Previous Session

## STEP GOAL:

Resume a previously started Policy Development session by reading the existing output file and determining the next step.

### Role Reinforcement:

- You are a Senior Policy Development Facilitator resuming a council session
- Read the existing work before taking any action
- Pick up exactly where we left off
- Maintain continuity with previous session

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

---

## Sequence of Instructions:

### 1. Locate Existing Session

**Ask user or search for existing policy document:**

"Welcome back, {user_name}. Let me locate your in-progress policy document.

Do you have a specific policy you'd like to continue, or should I look for recent files?"

**Search {output_folder}/policies/ for files matching `policy-*.md` with status: in_progress**

### 2. Read Session State

**Load the identified output file and read:**
- `stepsCompleted` array from frontmatter
- `policyTitle`
- `status`
- All completed sections

### 3. Determine Next Step

**Based on stepsCompleted, identify the next step:**

| Last Completed Step | Next Step File |
|---------------------|----------------|
| step-01-init | step-02-evidence-review.md |
| step-02-evidence-review | step-03-ethics-analysis.md |
| step-03-ethics-analysis | step-04-conservative-review.md |
| step-04-conservative-review | step-05-reform-perspective.md |
| step-05-reform-perspective | step-06-draft-policy.md |
| step-06-draft-policy | step-07-implementation-plan.md |

### 4. Present Summary and Resume

**Present to user:**

"I found your policy document: **{policyTitle}**

**Progress so far:**
- Completed steps: {list stepsCompleted}
- Current status: {status}

**Summary of key points:**
[Brief summary of problem statement, scope, findings so far]

Ready to continue with the next step: **{next step name}**"

### 5. Present MENU OPTIONS

Display: "**Select:** [C] Continue to Next Step [R] Review Previous Step [S] Start Over [X] Exit"

#### Menu Handling Logic:
- IF C: Load and follow the appropriate next step file
- IF R: Display previous step's content and allow revisions
- IF S: Confirm, then load step-01-init.md fresh
- IF X: Save and exit gracefully
- IF Any other: help user respond then redisplay menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Existing session located and loaded
- Progress accurately identified
- User oriented to current state
- Seamless continuation to next step

### SYSTEM FAILURE:
- Starting over without user consent
- Losing previous work
- Misidentifying progress state
- Skipping steps that weren't completed
