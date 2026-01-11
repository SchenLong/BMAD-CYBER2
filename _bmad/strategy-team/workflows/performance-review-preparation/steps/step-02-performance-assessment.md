---
name: step-02-performance-assessment
description: Evaluate results, behaviors, and impact

outputFile: '{output_folder}/planning/performance-review-{employee}.md'
nextStepFile: './step-03-feedback-calibration.md'
previousStepFile: './step-01-init.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 2: Performance Assessment

## STEP GOAL:

Conduct a thorough, evidence-based assessment of the employee's performance across results, behaviors, and overall impact.

### Role Reinforcement:

- You are a Senior Executive Coach with Augustus (Policy Analyst) providing evidence-based rigor
- Focus on objective, evidence-based assessment
- Balance achievements with development areas
- Maintain developmental, not punitive tone

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on evidence, not assumptions
- FORBIDDEN to assess without specific examples
- Balance positive and constructive feedback
- Assess against stated goals and expectations

---

## Sequence of Instructions:

### 1. Results Assessment

**Invoke Augustus (Policy Analyst) perspective:**

"Let me bring in Augustus's evidence-based approach to assess results..."

**Assess goal achievement:**

| Goal | Result | Rating | Evidence |
|------|--------|--------|----------|
| [Goal 1] | Met/Exceeded/Below | 1-5 | [specific evidence] |
| [Goal 2] | | | |
| [Goal 3] | | | |

**KPI performance:**
| Metric | Target | Actual | Rating |
|--------|--------|--------|--------|
| | | | 1-5 |

**Overall results rating:** [1-5]

### 2. Behavior Assessment

**Assess how results were achieved:**

"Let's assess how the employee achieved their results - the behaviors demonstrated:"

| Competency/Behavior | Rating | Evidence |
|---------------------|--------|----------|
| Leadership | 1-5 | [examples] |
| Collaboration | | |
| Communication | | |
| Problem-solving | | |
| Initiative | | |
| [Role-specific] | | |

**Key strengths (top 3):**
1. [strength + evidence]
2. [strength + evidence]
3. [strength + evidence]

**Development areas (top 3):**
1. [area + evidence]
2. [area + evidence]
3. [area + evidence]

### 3. Impact Assessment

**Assess broader impact:**

"Let's assess the broader impact this person has had:"

| Impact Area | Assessment | Examples |
|-------------|------------|----------|
| Team performance | Positive/Neutral/Negative | |
| Stakeholder relationships | | |
| Organizational contribution | | |
| Culture contribution | | |
| Innovation/improvement | | |

### 4. Trend Analysis

**Assess performance trajectory:**

"How has performance trended over the review period?"

**Trajectory:** [Improving / Steady / Declining]

**Quarter-by-quarter (or relevant periods):**
| Period | Performance | Notable Events |
|--------|-------------|----------------|
| Q1/Early | | |
| Q2/Mid | | |
| Q3/Q4/Late | | |

**Pattern observations:**
- What's driving the trajectory?
- Any external factors?
- Any inflection points?

### 5. 360 Input Synthesis (if available)

**Synthesize feedback from others:**

"Let's synthesize feedback from other sources:"

**Common themes - Strengths:**
- [theme from multiple sources]

**Common themes - Development:**
- [theme from multiple sources]

**Outlier feedback:**
- [feedback that differs from pattern]

**Self-assessment alignment:**
- Where does self-assessment align with others?
- Where are gaps between self-view and others' view?

### 6. Overall Assessment

**Summarize overall assessment:**

"Let's summarize the overall assessment:"

| Dimension | Rating (1-5) |
|-----------|--------------|
| Results/What | |
| Behaviors/How | |
| Impact | |
| **Overall** | |

**Rating definitions:**
- 5: Exceptional - far exceeds expectations
- 4: Exceeds - consistently above expectations
- 3: Meets - fully meets expectations
- 2: Below - partially meets, improvement needed
- 1: Unacceptable - significant improvement needed

**Summary narrative:**
[2-3 sentence overall assessment]

### 7. Update Output File

**Append to the Performance Assessment section:**

```markdown
## 2. Performance Assessment

### Results Assessment
[Tables from section 1]
**Overall Results:** [rating]/5

### Behavior Assessment
[Table from section 2]
**Key Strengths:**
1. [list]

**Development Areas:**
1. [list]

### Impact Assessment
[Table from section 3]

### Trajectory
**Trend:** [direction]
[Analysis from section 4]

### 360 Input Synthesis
[Summary from section 5]

### Overall Assessment
| Dimension | Rating |
|-----------|--------|
| Results | /5 |
| Behaviors | /5 |
| Impact | /5 |
| **Overall** | /5 |

**Summary:** [narrative]

### Augustus's Evidence-Based View
"[Assessment perspective]"
```

Update frontmatter: Add `step-02-performance-assessment` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the performance assessment summary:

**Overall Rating:** [X/5]

**Results:** [rating] - [brief summary]
**Behaviors:** [rating] - [brief summary]
**Impact:** [rating] - [brief summary]

**Key Strengths:**
1. [strength]
2. [strength]

**Development Areas:**
1. [area]
2. [area]

**Trajectory:** [direction]

**Augustus's View:**
[Brief evidence-based perspective]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Assessment [C] Continue to Feedback Calibration"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-03-feedback-calibration.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Goals assessed with evidence
- Behaviors evaluated with examples
- Impact assessed
- Trajectory analyzed
- 360 feedback synthesized (if available)
- Overall rating determined
- Output file updated

### SYSTEM FAILURE:
- Assessment without specific evidence
- Skipping behavior assessment
- Not analyzing trajectory
- Not updating output file
