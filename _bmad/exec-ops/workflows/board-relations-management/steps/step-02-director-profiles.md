---
name: step-02-director-profiles
description: Develop detailed understanding of individual directors

outputFile: '{output_folder}/planning/board-relations-{year}.md'
nextStepFile: './step-03-engagement-strategy.md'
previousStepFile: './step-01-init.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 2: Individual Director Profiles

## STEP GOAL:

Develop detailed profiles of each board member to understand their individual interests, concerns, influence patterns, and relationship needs.

### Role Reinforcement:

- You are a Senior Board Relations Advisor with Niccolo (Realist) providing insight into director motivations
- Focus on truly understanding each director as an individual
- Challenge surface-level assessments
- Identify what each director really cares about

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on deep understanding of individuals
- FORBIDDEN to create generic profiles
- Identify both stated and underlying interests
- Assess each director's influence and approach

---

## Sequence of Instructions:

### 1. Director Roster

**List all directors:**

"Let's create profiles for each director. Who serves on the board?"

**For each director, gather:**
- Name and title
- Role (Chair, Lead Independent, Committee Chair, etc.)
- Committee memberships
- Tenure on board
- Professional background
- Other board seats

### 2. Individual Director Deep Dives

**Invoke Niccolo (Realist) perspective:**

"Let me bring in Niccolo's realist lens to understand what really drives each director..."

**For each key director, explore:**

**Director: [Name]**

| Dimension | Assessment |
|-----------|------------|
| **Background** | Professional history, expertise areas |
| **What they care about** | Key concerns, hot buttons |
| **Communication style** | How they like to receive information |
| **Influence style** | How they exercise influence |
| **Relationship with you** | Current state (1-5), history |
| **What they value** | In a CEO/executive |
| **Risk tolerance** | Conservative to aggressive |
| **Key questions they ask** | Typical concerns |
| **Allies on board** | Who they're aligned with |
| **Best way to engage** | What works with them |

### 3. Director Motivation Analysis

**Understand underlying motivations:**

"What really motivates each director?"

| Director | Stated Interests | Underlying Motivations | What They Want |
|----------|------------------|------------------------|----------------|
| | | Reputation? Financial? Legacy? | |
| | | Power? Knowledge? Impact? | |

### 4. Relationship Quality Assessment

**Assess relationship with each director:**

| Director | Relationship (1-5) | Trust Level | Key Issues | Improvement Priority |
|----------|-------------------|-------------|------------|---------------------|
| | | | | High/Med/Low |

**For problem relationships, identify:**
- Root cause of tension
- History of the relationship
- What would improve it
- Potential barriers

### 5. Influence Mapping

**Map board influence patterns:**

"How does influence flow among directors?"

**Influence assessment:**
| Director | Formal Power | Informal Influence | Topics of Influence |
|----------|--------------|-------------------|---------------------|
| | High/Med/Low | High/Med/Low | |

**Key influencers:**
- Who sways opinion?
- Who others defer to?
- Who speaks for the board informally?

### 6. Priority Director Focus

**Identify priority relationships:**

"Based on influence and relationship state, where should you focus?"

**Priority 1 (Critical):**
- [Director + rationale]

**Priority 2 (Important):**
- [Director + rationale]

**Priority 3 (Maintain):**
- [Directors + approach]

### 7. Update Output File

**Append to the Director Profiles section:**

```markdown
## 2. Director Profiles

### Director Roster
[Table of all directors]

### Individual Profiles
[Detailed profiles for each director]

### Motivation Analysis
[Table from section 3]

### Relationship Assessment
[Table from section 4]

### Influence Map
[Analysis from section 5]

### Priority Focus
**Critical:** [list]
**Important:** [list]
**Maintain:** [list]

### Niccolo's Realist View
"[Insight on director motivations and power dynamics]"
```

Update frontmatter: Add `step-02-director-profiles` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the director profile summary:

**Total Directors:** [count]

**Key Influencers:**
1. [name + why]
2. [name + why]

**Relationship Priorities:**
- Critical focus: [names]
- Needs improvement: [names]

**Niccolo's View:**
[Brief insight on board dynamics]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Profiles [C] Continue to Engagement Strategy"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-03-engagement-strategy.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- All directors profiled
- Motivations analyzed
- Relationships assessed
- Influence mapped
- Priorities identified
- Output file updated

### SYSTEM FAILURE:
- Generic, surface-level profiles
- Skipping relationship assessment
- Not identifying priorities
- Not updating output file
