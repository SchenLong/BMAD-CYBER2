---
name: 'step-06-mitigation'
description: 'Define security controls and mitigation strategies for each threat with prioritization and ownership'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/threat-modeling'

# File References
thisStepFile: '{workflow_path}/steps/step-06-mitigation.md'
nextStepFile: '{workflow_path}/steps/step-07-loop-decision.md'
outputFile: '{output_folder}/threat-model-{project_name}.md'

# Task References
brainstormingTask: '{project-root}/_bmad/core/tasks/brainstorming.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6: Mitigation Strategies

## STEP GOAL:

To define security controls and mitigation strategies for each identified threat, prioritize implementation, assign ownership, estimate effort, and document residual risk.

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

- 🎯 Focus ONLY on mitigation strategy definition
- 🚫 FORBIDDEN to implement controls in this step (planning only)
- 💬 Guide systematic mitigation planning for each threat
- 🚫 DO NOT proceed without defining mitigations for all high-priority threats

## EXECUTION PROTOCOLS:

- 🎯 Guide mitigation strategy definition for each threat
- 💾 Document controls, priorities, ownership, and effort
- 📖 Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- Threats and risk assessments from steps 4 and 5
- currentComponent set in frontmatter
- This is mitigation planning, not implementation
- Focus on actionable, specific controls

## MITIGATION STRATEGY PROCESS:

### 1. Initialize Mitigation Planning

Load {outputFile} to review threats and risk assessments for `currentComponent`.

Display:

"**Mitigation Strategy Development**

**Component:** {currentComponent}

For each threat, we'll define:

1. **Security Controls** - Specific measures to prevent/detect/respond to the threat
2. **Priority** - When should this be implemented? (P0/P1/P2/P3)
3. **Ownership** - Who is responsible for implementation?
4. **Effort Estimate** - How much work is required?
5. **Residual Risk** - What risk remains after mitigation?

We'll prioritize high-risk threats (score ≥ 6) first.

**High-Priority Threats:** {count-of-threats-with-score-6-or-higher}"

### 2. Explain Mitigation Principles

"**Mitigation Strategy Principles**

**Defense in Depth:**
Apply multiple layers of security controls so if one fails, others still protect.

**Control Types:**
- **Preventive** - Stop the threat from occurring (e.g., input validation, authentication)
- **Detective** - Identify when a threat is occurring (e.g., logging, monitoring, alerts)
- **Corrective** - Respond and recover from a threat (e.g., incident response, backups)

**Priority Levels:**

- **P0 (Critical)**: Must fix before release/deployment
  - Critical risk (score 9)
  - Blocks security approval
  - Example: SQL injection in production API

- **P1 (High)**: Fix within current sprint/release cycle
  - High risk (score 6)
  - Should not ship without mitigation
  - Example: Missing authentication on admin endpoints

- **P2 (Medium)**: Fix within current planning period (quarter)
  - Medium risk (score 3-4)
  - Address in normal backlog prioritization
  - Example: Weak password policy

- **P3 (Low)**: Fix when convenient
  - Low risk (score 1-2)
  - Technical debt, security hardening
  - Example: Missing security headers

**Effort Estimates:**
- **Small (S)**: < 1 day (e.g., add rate limiting to existing middleware)
- **Medium (M)**: 1-3 days (e.g., implement MFA)
- **Large (L)**: 1-2 weeks (e.g., encryption at rest for database)
- **X-Large (XL)**: > 2 weeks (e.g., complete authentication system redesign)"

### 3. Define Mitigations for High-Priority Threats First

"**High-Priority Threat Mitigation (Risk Score ≥ 6)**

We'll address the {count} critical and high-risk threats first:

{list-high-priority-threats}

Let's define mitigation strategies for each."

For each high-priority threat (score ≥ 6):

"**Threat: {Threat-ID}**

**Description:** {threat-description}
**Risk Score:** {risk-score} ({Risk-Level})

**Define Mitigation Strategy:**

**1. Security Controls**

What specific security controls will mitigate this threat?

Consider:
- Preventive controls (authentication, authorization, input validation, encryption)
- Detective controls (logging, monitoring, anomaly detection)
- Corrective controls (incident response, backups, rollback)

Examples:
- Implement input validation and parameterized queries (prevents SQL injection)
- Add rate limiting and CAPTCHA (prevents brute force)
- Enable audit logging with tamper protection (detects unauthorized access)
- Implement TLS 1.3 for all API communications (prevents MITM)

Describe security controls for {Threat-ID}:"

Collect security controls description.

"**2. Priority**

Given the risk score of {risk-score}, what is the implementation priority?

- P0 (Critical) - Must fix before release
- P1 (High) - Fix in current sprint
- P2 (Medium) - Fix in current quarter
- P3 (Low) - Fix when convenient

Select priority (P0/P1/P2/P3):"

Collect priority.

"**3. Ownership**

Who is responsible for implementing this mitigation?

Examples:
- Backend Team
- Security Team
- DevOps Team
- Frontend Team
- External Vendor

Assign ownership:"

Collect ownership.

"**4. Effort Estimate**

How much effort is required to implement this mitigation?

- Small (S): < 1 day
- Medium (M): 1-3 days
- Large (L): 1-2 weeks
- X-Large (XL): > 2 weeks

Select effort (S/M/L/XL):"

Collect effort estimate.

"**5. Residual Risk**

After implementing the mitigation, what risk remains?

Consider:
- Is the threat completely eliminated?
- Is there still some exploitability under certain conditions?
- Are there implementation challenges that may leave gaps?

Describe residual risk:"

Collect residual risk description.

Display summary:

"**Mitigation Strategy for {Threat-ID}:**
- Controls: {controls}
- Priority: {priority}
- Owner: {owner}
- Effort: {effort}
- Residual Risk: {residual-risk}"

Repeat for all high-priority threats.

### 4. Define Mitigations for Medium and Low Priority Threats

"**Medium and Low Priority Threat Mitigation (Risk Score < 6)**

{count} medium and low-risk threats remain. Let's define mitigation strategies for these as well."

For each medium/low priority threat:

Follow same process as high-priority threats (sections 1-5), but streamline if user requests:

"For medium/low threats, you can provide abbreviated mitigation strategies or handle multiple threats at once if they share similar controls."

Repeat until all threats have mitigation strategies defined.

### 5. Summarize Mitigation Plan

"**Mitigation Plan Summary for {currentComponent}**

**Total Threats with Mitigations:** {threat-count}

**By Priority:**
- P0 (Critical): {count} mitigations - {effort-total}
- P1 (High): {count} mitigations - {effort-total}
- P2 (Medium): {count} mitigations - {effort-total}
- P3 (Low): {count} mitigations - {effort-total}

**By Team/Owner:**
{group-mitigations-by-owner-with-counts}

**Implementation Roadmap:**

**Phase 1 (Immediate)** - P0 mitigations:
{list-P0-mitigations}

**Phase 2 (Current Sprint)** - P1 mitigations:
{list-P1-mitigations}

**Phase 3 (Current Quarter)** - P2 mitigations:
{list-P2-mitigations}

**Phase 4 (Backlog)** - P3 mitigations:
{list-P3-mitigations}"

### 6. Append Section 5 to Threat Model Document

Update {outputFile} by appending:

```markdown

---

## 5. Mitigation Strategies

### 5.1 Component: {currentComponent}

#### Mitigation Plan

| Threat ID | Risk Score | Security Controls | Priority | Owner | Effort | Residual Risk |
|-----------|------------|------------------|----------|-------|--------|---------------|
{mitigation-plan-table-rows}

#### Implementation Roadmap

**Phase 1: Critical (P0) - Must Complete Before Release**

{list-P0-mitigations-with-details}

**Estimated Total Effort:** {P0-effort-sum}

---

**Phase 2: High (P1) - Complete in Current Sprint**

{list-P1-mitigations-with-details}

**Estimated Total Effort:** {P1-effort-sum}

---

**Phase 3: Medium (P2) - Complete in Current Quarter**

{list-P2-mitigations-with-details}

**Estimated Total Effort:** {P2-effort-sum}

---

**Phase 4: Low (P3) - Backlog**

{list-P3-mitigations-with-details}

**Estimated Total Effort:** {P3-effort-sum}

---

#### Mitigation Notes

{any-additional-context-assumptions-or-dependencies}

---
```

### 7. Update Frontmatter

Update {outputFile} frontmatter:

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5, 6]
lastStep: 'mitigation'
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

### 8. Present MENU OPTIONS

Display: **Select an Option:** [B] Brainstorming [P] Party Mode [W] Web-Browsing [C] Continue to Loop Decision

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options
- Use menu handling logic section below

#### Menu Handling Logic:

- IF B: Execute {brainstormingTask} with prompt: "Help me brainstorm additional security controls or alternative mitigation strategies for the threats in {currentComponent}. Are there industry best practices we should consider?"
- IF P: Execute {partyModeWorkflow} with focus: "Review the mitigation strategies for {currentComponent} - are the controls effective? Are priorities and effort estimates realistic? Are there better approaches?"
- IF W: Web-Browsing - Guide user: "What would you like to research? Examples: Best practices for {specific-threat} mitigation, security control implementations, industry standards (NIST, OWASP)"
- IF C: Verify all threats have mitigation strategies, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options)

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All threats have mitigation strategies defined
- Security controls are specific and actionable
- Priorities assigned (P0/P1/P2/P3)
- Ownership assigned to teams/individuals
- Effort estimates provided (S/M/L/XL)
- Residual risk documented
- Implementation roadmap created
- Section 5 appended to threat model document
- Frontmatter updated with step 6 complete
- Ready to proceed to loop decision (step 7)

### ❌ SYSTEM FAILURE:

- Skipping threats in mitigation planning
- Vague or non-actionable controls
- Not assigning priorities or ownership
- Missing effort estimates
- Not documenting residual risk
- Proceeding without completing all mitigations
- Not updating document with mitigation strategies

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected AND all threats have mitigation strategies documented in the threat model will you load, read entire file, then execute {nextStepFile} to determine if more components need analysis.
