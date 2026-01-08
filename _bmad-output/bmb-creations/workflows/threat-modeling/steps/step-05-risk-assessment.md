---
name: 'step-05-risk-assessment'
description: 'Assess likelihood and impact for each identified threat and calculate risk scores'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/threat-modeling'

# File References
thisStepFile: '{workflow_path}/steps/step-05-risk-assessment.md'
nextStepFile: '{workflow_path}/steps/step-06-mitigation.md'
outputFile: '{output_folder}/threat-model-{project_name}.md'

# Task References
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 5: Risk Assessment

## STEP GOAL:

To assess the likelihood and impact of each identified threat, calculate risk scores, and prioritize threats for mitigation based on risk levels.

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

- 🎯 Focus ONLY on risk assessment (likelihood × impact)
- 🚫 FORBIDDEN to define mitigations in this step (that's step 6)
- 💬 Guide systematic risk rating for each threat
- 🚫 DO NOT proceed without assessing all identified threats

## EXECUTION PROTOCOLS:

- 🎯 Guide likelihood and impact assessment for each threat
- 💾 Calculate and document risk scores
- 📖 Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- Threats identified in step 4 (STRIDE analysis)
- currentComponent set in frontmatter
- This is risk quantification, not mitigation planning
- All threats must be assessed

## RISK ASSESSMENT PROCESS:

### 1. Initialize Risk Assessment

Load {outputFile} to review threats identified in Section 3 for `currentComponent`.

Display:

"**Risk Assessment**

**Component:** {currentComponent}

We identified {threat-count} threats in the STRIDE analysis. Now we'll assess each threat's risk level by evaluating:

**Likelihood** - How likely is this threat to be exploited?
**Impact** - What would be the business/security impact if exploited?

**Risk Score** = Likelihood × Impact

This helps us prioritize which threats need immediate attention.

Let's begin the assessment."

### 2. Explain Risk Rating Scales

"**Risk Rating Scales**

**Likelihood (Probability of Exploitation):**

- **Low (1)**: Difficult to exploit
  - Requires specialized skills, insider access, or rare conditions
  - Strong existing controls make exploitation unlikely
  - Example: Requires physical access to production servers

- **Medium (2)**: Moderately difficult to exploit
  - Requires some technical skill or specific conditions
  - Some existing controls but gaps exist
  - Example: Requires valid user credentials to exploit

- **High (3)**: Easy to exploit
  - Requires minimal skill or effort
  - No significant barriers to exploitation
  - Commonly exploited in the wild
  - Example: Publicly accessible endpoint with no authentication

**Impact (Business/Security Consequence):**

- **Low (1)**: Limited impact
  - Affects individual users or minor functionality
  - Minimal data exposure (non-sensitive)
  - Quick recovery possible
  - Example: Temporary unavailability of non-critical feature

- **Medium (2)**: Significant impact
  - Affects multiple users or important functionality
  - Exposure of some sensitive data
  - Moderate recovery effort
  - Regulatory/compliance concerns
  - Example: Exposure of customer PII for subset of users

- **High (3)**: Severe impact
  - Affects entire system or critical business operations
  - Exposure of highly sensitive data (credentials, financial, health)
  - Severe financial, legal, or reputational damage
  - Long recovery time
  - Example: Complete database compromise with all customer data

**Risk Score Matrix:**

| Impact → <br> Likelihood ↓ | Low (1) | Medium (2) | High (3) |
|---------------------------|---------|------------|----------|
| **Low (1)**               | 1 (Low) | 2 (Low)    | 3 (Med)  |
| **Medium (2)**            | 2 (Low) | 4 (Med)    | 6 (High) |
| **High (3)**              | 3 (Med) | 6 (High)   | 9 (Critical) |

**Risk Levels:**
- **1-2**: Low Risk - Address in normal development cycle
- **3-4**: Medium Risk - Address within current planning period
- **6**: High Risk - Address urgently, prioritize in backlog
- **9**: Critical Risk - Address immediately, may block release"

### 3. Assess Each Threat

For each threat identified in Section 3 (STRIDE analysis):

"**Assess Threat: {Threat-ID}**

**Threat:** {threat-description}

**Attack Scenario:** {attack-scenario}

**Question 1: Likelihood**

How likely is this threat to be exploited?

Consider:
- How difficult is it to exploit?
- What skills/access are required?
- Are there existing security controls?
- Has this been exploited in similar systems?

Rate likelihood (1=Low, 2=Medium, 3=High):"

Collect likelihood rating (1-3).

"**Question 2: Impact**

What would be the impact if this threat were successfully exploited?

Consider:
- What data could be compromised?
- What systems/functions would be affected?
- What would be the business consequences?
- Are there regulatory/compliance implications?
- What is the recovery effort?

Rate impact (1=Low, 2=Medium, 3=High):"

Collect impact rating (1-3).

**Calculate Risk Score:**

Risk Score = Likelihood × Impact

Determine Risk Level:
- 1-2: Low
- 3-4: Medium
- 6: High
- 9: Critical

Display:

"**Risk Assessment for {Threat-ID}:**
- Likelihood: {likelihood-rating} ({Low/Medium/High})
- Impact: {impact-rating} ({Low/Medium/High})
- **Risk Score: {risk-score}**
- **Risk Level: {Low/Medium/High/Critical}**"

Repeat for all threats.

### 4. Summarize Risk Assessment

After assessing all threats, display summary:

"**Risk Assessment Summary for {currentComponent}**

**Total Threats Assessed:** {threat-count}

**By Risk Level:**
- 🔴 Critical (9): {count} threats
- 🟠 High (6): {count} threats
- 🟡 Medium (3-4): {count} threats
- 🟢 Low (1-2): {count} threats

**Critical and High Priority Threats:**
{list-threats-with-risk-score-6-or-9}

These high-priority threats will require immediate mitigation strategies."

### 5. Append Section 4 to Threat Model Document

Update {outputFile} by appending:

```markdown

---

## 4. Risk Assessment

### 4.1 Component: {currentComponent}

#### Risk Assessment Matrix

| Threat ID | Threat Description | Likelihood | Impact | Risk Score | Risk Level | Priority |
|-----------|-------------------|------------|--------|------------|------------|----------|
{threat-risk-assessment-table-rows}

#### Risk Summary

**Total Threats:** {total-count}

**Risk Distribution:**
- 🔴 Critical (Score 9): {critical-count}
- 🟠 High (Score 6): {high-count}
- 🟡 Medium (Score 3-4): {medium-count}
- 🟢 Low (Score 1-2): {low-count}

**High-Priority Threats (Score ≥ 6):**

{list-high-priority-threats-with-details}

**Risk Assessment Notes:**

{any-additional-context-or-assumptions-made-during-assessment}

---
```

### 6. Update Frontmatter

Update {outputFile} frontmatter:

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5]
lastStep: 'risk-assessment'
systemName: '{system-name}'
businessCriticality: '{criticality}'
components: [...existing...]
componentsAnalyzed: [...existing...]
currentComponent: '{current-component-name}'
workflowComplete: false
date: '{date}'
user_name: '{user_name}'
---
```

### 7. Present MENU OPTIONS

Display: **Select an Option:** [P] Party Mode [C] Continue to Mitigation Strategies

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options
- Use menu handling logic section below

#### Menu Handling Logic:

- IF P: Execute {partyModeWorkflow} with focus: "Review the risk assessment for {currentComponent} - are the likelihood and impact ratings accurate? Should any risk scores be adjusted?"
- IF C: Verify all threats have been assessed, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#7-present-menu-options)

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All threats assessed with likelihood and impact ratings
- Risk scores calculated (Likelihood × Impact)
- Risk levels assigned (Low/Medium/High/Critical)
- High-priority threats identified and highlighted
- Section 4 appended to threat model document
- Frontmatter updated with step 5 complete
- Ready to proceed to mitigation strategies (step 6)

### ❌ SYSTEM FAILURE:

- Skipping threats in assessment
- Not collecting likelihood and impact ratings
- Incorrect risk score calculations
- Not prioritizing high-risk threats
- Proceeding without completing all assessments
- Not updating document with risk findings

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected AND all threats are risk-assessed in the threat model will you load, read entire file, then execute {nextStepFile} to begin mitigation strategy development.
