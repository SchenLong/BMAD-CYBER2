---

name: 'step-06-metrics-measurement'
description: 'Define KPIs, reporting dashboards, and behavior change measurement'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-awareness-training'

# File References

thisStepFile: '{workflow_path}/steps/step-06-metrics-measurement.md'
nextStepFile: '{workflow_path}/steps/step-07-continuous-improvement.md'
outputFile: '{output_folder}/security/security-awareness-program-{project_name}.md'

---

# Step 6: Metrics & Measurement

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on metrics definition and measurement
- FORBIDDEN to discuss future program improvements yet
- Help user establish meaningful, measurable KPIs

## STEP GOAL:

To define key performance indicators (KPIs), reporting mechanisms, and behavior change measurement strategies that demonstrate program effectiveness.

## METRICS & MEASUREMENT SEQUENCE:

### 1. KPI Categories

"Let's define your program metrics across categories:

**Participation Metrics (Activity):**
- Training completion rate
- On-time completion rate
- Voluntary content engagement
- Assessment participation

**Knowledge Metrics (Learning):**
- Assessment scores (pre/post)
- Knowledge retention over time
- Quiz pass rates

**Behavior Metrics (Application):**
- Phishing click rate
- Phishing report rate
- Repeat offender rate
- Time to report suspicious emails

**Impact Metrics (Results):**
- Security incident reduction
- Human-caused breach reduction
- Risk score improvement
- Compliance audit results

Which categories are most important for your stakeholders?"

### 2. Primary KPIs

"Let's define your primary KPIs:

**Recommended Primary KPIs:**

| KPI | Definition | Baseline | Target | Reporting |
|-----|------------|----------|--------|-----------|
| Phishing Click Rate | % who click simulated phish | [From Step 2] | <5% | Monthly |
| Phishing Report Rate | % who report simulated phish | [From Step 2] | >50% | Monthly |
| Training Completion | % completing mandatory training | [Current] | >95% | Monthly |
| Repeat Offender Rate | % who fail multiple simulations | New metric | <2% | Quarterly |
| Assessment Pass Rate | % passing knowledge tests | New metric | >80% | Per training |

What targets make sense for your organization?"

### 3. Secondary Metrics

"Let's add supporting metrics:

**Operational Metrics:**
- Average time to complete training
- Help desk tickets (training-related)
- Mobile vs desktop completion
- Department completion rankings

**Engagement Metrics:**
- Voluntary training uptake
- Security portal visits
- Newsletter open rates
- Tip adoption rates

**Trend Metrics:**
- Month-over-month click rate change
- Year-over-year improvement
- New hire vs tenured comparison
- Department risk score trends

Which secondary metrics would provide useful insights?"

### 4. Reporting Framework

"Let's design your reporting structure:

**Operational Dashboard (Weekly/Real-time):**
- Current campaign status
- Outstanding training assignments
- Recent phishing results
- Escalation queue

**Management Report (Monthly):**
- KPI scorecard
- Trend analysis
- Department comparison
- Risk highlights
- Recommendations

**Executive Report (Quarterly):**
- High-level KPIs
- Year-over-year comparison
- Risk reduction impact
- Program ROI indicators
- Compliance status

**Compliance Report (As needed):**
- Completion evidence
- Assessment records
- Policy acknowledgments

What reporting cadence do your stakeholders need?"

### 5. Behavior Change Measurement

"Let's plan how to measure real behavior change:

**Beyond Phishing Clicks:**
- Do users report faster over time?
- Are help desk "is this legit?" queries increasing?
- Are users questioning unusual requests?
- Are data handling violations decreasing?

**Qualitative Indicators:**
- Manager observations
- Culture survey results
- Focus group feedback
- Anecdotal success stories

**Attribution:**
How will you attribute improvements to the program vs other factors?"

### 6. Document Metrics Framework

Update Section 7 of {outputFile}:

```markdown
## 7. Metrics & Measurement

### 7.1 Primary KPIs

| KPI | Definition | Baseline | 6-Month Target | 12-Month Target |
|-----|------------|----------|----------------|-----------------|
| Phishing Click Rate | % clicking simulated phish | | | |
| Phishing Report Rate | % reporting suspicious emails | | | |
| Training Completion | % mandatory completion | | | |
| Repeat Offender Rate | % failing 2+ simulations | | | |
| Assessment Pass Rate | % passing knowledge tests | | | |

### 7.2 Secondary Metrics

| Metric | Purpose | Frequency | Owner |
|--------|---------|-----------|-------|
| [User data] | | | |

### 7.3 Reporting Schedule

| Report | Audience | Frequency | Format | Owner |
|--------|----------|-----------|--------|-------|
| Operations Dashboard | Security Team | Real-time | Dashboard | Security |
| Monthly Report | Management | Monthly | PDF/Deck | Security |
| Executive Summary | Leadership | Quarterly | Executive Brief | CISO |
| Compliance Evidence | Auditors | As needed | Export | Compliance |

### 7.4 Dashboard Specifications

**Primary Dashboard Elements:**
- [Visualization list]

### 7.5 Behavior Change Indicators

**Quantitative:**
- [Measurable indicators]

**Qualitative:**
- [Observable indicators]

### 7.6 Attribution Methodology

[How you'll connect program activities to outcomes]
```

### 7. Confirmation and Next Step

"**Metrics & Measurement Complete**

I've documented:
- Primary KPIs with baselines and targets
- Supporting metrics framework
- Reporting cadence for all stakeholders
- Behavior change measurement approach

Next, we'll plan for continuous improvement.

Ready to proceed to continuous improvement planning?"

## MENU

Display: **Metrics Complete - Select an Option:** [C] Continue to Continuous Improvement [R] Review/Revise Metrics

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 7 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN metrics framework is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
