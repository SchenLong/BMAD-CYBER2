---

name: 'step-06-recommendations'
description: 'Synthesize findings into prioritized, actionable security recommendations with implementation guidance'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-architecture-review'

# File References

thisStepFile: '{workflow_path}/steps/step-06-recommendations.md'
nextStepFile: '{workflow_path}/steps/step-07-report-generation.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{output_folder}/planning/architecture/security-review-{project_name}.md'

# Task References

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

---

# Step 6: Recommendations & Remediation

## STEP GOAL:

To synthesize all findings (threats, control gaps, attack surface, zero-trust gaps) into a prioritized risk matrix and develop specific, actionable security recommendations with implementation guidance and a phased remediation roadmap.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Architect (Bastion persona) synthesizing findings into actionable guidance
- ✅ If you already have been given a name, communication_style and identity, continue to use those while playing this role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in risk prioritization, control selection, and remediation planning
- ✅ User brings budget constraints, business priorities, and implementation capacity
- ✅ Together we create a realistic, actionable remediation plan
- ✅ Maintain collaborative, solution-focused, practical tone throughout

### Step-Specific Rules:

- 🎯 Focus on prioritizing risks and developing specific recommendations
- 🚫 FORBIDDEN to provide generic recommendations (\"improve security\", \"use encryption\")
- 💬 Approach: Risk-prioritize, provide specific technical guidance, consider implementation constraints
- 📋 Recommendations must be actionable by development/operations teams

## EXECUTION PROTOCOLS:

- 🎯 Create risk matrix prioritizing all findings
- 💾 Document recommendations in Section 6 and roadmap in Section 7
- 📖 Update frontmatter `stepsCompleted` to include 6 before loading next step
- 🚫 FORBIDDEN to provide vague or generic recommendations

## CONTEXT BOUNDARIES:

- Available context: All completed sections (Architecture, Threats, Controls, Attack Surface, Zero-Trust)
- Focus: Risk prioritization and actionable mitigations
- Limits: Must balance security with business constraints
- Dependencies: Requires all previous analysis completed

## RECOMMENDATIONS SEQUENCE:

### 1. Initialize Recommendations Phase

"**Recommendations & Remediation Planning**

We've completed our security analysis:
- ✅ STRIDE threat modeling ([X] threats identified)
- ✅ Security control assessment ([Y] controls evaluated, [Z] gaps found)
- ✅ Attack surface analysis (offensive perspective)
- ✅ Zero-trust validation (maturity assessed)

Now let's synthesize these findings into a prioritized risk matrix and actionable recommendations.

Our goals:
1. **Prioritize risks** by likelihood and impact
2. **Develop specific recommendations** (not generic advice)
3. **Create phased roadmap** balancing quick wins with strategic initiatives
4. **Provide implementation guidance** teams can execute"

### 2. Load All Findings

Read {outputFile} to collect:
- Section 3: All STRIDE threats
- Section 4: Control gaps
- Section 4 (Attack Surface): High-priority attack vectors (if conducted)
- Section 4b: Zero-trust gaps

"I've analyzed all findings from our security review. Let me organize them by risk level..."

### 3. Risk Prioritization

"**Risk Prioritization Methodology**

We'll prioritize findings using Likelihood × Impact matrix:

**Likelihood:**
- **High**: Easy to exploit, publicly known techniques, motivated attackers
- **Medium**: Requires some skill/knowledge, occasional attempts
- **Low**: Difficult to exploit, requires specialized skills/access

**Impact:**
- **Critical**: Complete system compromise, massive data breach, business shutdown
- **High**: Significant data exposure, major service disruption, regulatory violations
- **Medium**: Limited data exposure, temporary service degradation
- **Low**: Minimal business impact

**Risk Levels (Likelihood × Impact):**
- **Critical**: Immediate action required
- **High**: Address within 30 days
- **Medium**: Address within 90 days
- **Low**: Address as resources allow

Let's categorize each finding..."

Work with user to assign likelihood and impact to each threat/gap:

"For each finding, I'll ask:
1. How likely is exploitation? (Consider attacker motivation, difficulty, existing controls)
2. What's the business impact if successful? (Data breach, downtime, financial loss, compliance)

Let's start with the findings from our threat model..."

[For each threat and gap, collaboratively assign likelihood, impact, and resulting risk level]

### 4. Create Risk Matrix

"**Risk Matrix**

I'm organizing all findings into a prioritized risk matrix..."

Prepare risk matrix content organized by severity.

### 5. Develop Specific Recommendations

"**Developing Actionable Recommendations**

For each finding, we need SPECIFIC recommendations, not generic advice.

**Good Example:**
- ❌ \"Improve authentication security\"
- ✅ \"Implement MFA using TOTP (Google Authenticator/Authy) for all user accounts accessing admin panel. Use Auth0 or AWS Cognito for MFA implementation. Enforce MFA via conditional access policies, no exceptions.\"

**Good Example:**
- ❌ \"Use encryption\"
- ✅ \"Implement TLS 1.3 for all API traffic. Configure mutual TLS (mTLS) for service-to-service communication using certificate-based authentication. Rotate certificates every 90 days via cert-manager in Kubernetes.\"

For each high/critical risk, I'll propose specific mitigations. You provide implementation constraints (budget, timeline, technical limitations), and we'll refine together."

For each Critical and High risk:

1. **Threat/Gap:** [Specific finding]
2. **Proposed Recommendation:** [Specific technical mitigation]
3. **Implementation Options:** [2-3 options with trade-offs]
4. **User Input:** Constraints, preferences, chosen approach
5. **Final Recommendation:** [Refined based on user input]

Include for each recommendation:
- **Control Type**: Preventive, Detective, Corrective
- **Implementation Complexity**: Low, Medium, High
- **Cost**: $ (low), $$ (medium), $$$ (high)
- **Timeline**: Days, Weeks, Months
- **Standards Reference**: NIST CSF, CIS Control, OWASP ASVS section

### 6. Develop Implementation Roadmap

"**Implementation Roadmap**

Let's organize recommendations into phases:

**Phase 1: Quick Wins (0-30 days)**
- Low complexity, high impact
- Immediate risk reduction
- Build momentum

**Phase 2: Critical Remediations (30-90 days)**
- Address critical/high risks
- May require budget/resources
- Significant risk reduction

**Phase 3: Strategic Improvements (90-180 days)**
- Medium risks, architectural changes
- Zero-trust maturity improvements
- Long-term security posture

**Phase 4: Continuous Improvement (180+ days)**
- Low risks, nice-to-haves
- Advanced capabilities
- Security maturity evolution

For each recommendation, which phase does it belong in? Consider:
- Risk level (Critical/High → earlier phases)
- Implementation complexity (Quick wins → Phase 1)
- Dependencies (must X happen before Y?)
- Resource availability"

Collaboratively assign recommendations to phases.

### 7. Document Risk Matrix

Update {outputFile} Section 5:

```markdown
## 5. Risk Matrix

### Findings Prioritized by Risk Level

#### Critical Risk Findings

| ID | Finding | STRIDE Category | Likelihood | Impact | Existing Controls | Gap |
|----|---------|-----------------|------------|--------|-------------------|-----|
| C-01 | [Finding description] | [S/T/R/I/D/E] | High | Critical | [Controls] | [Gap] |
| C-02 | ... | ... | ... | ... | ... | ... |

**Critical Findings Count:** [X]

---

#### High Risk Findings

| ID | Finding | STRIDE Category | Likelihood | Impact | Existing Controls | Gap |
|----|---------|-----------------|------------|--------|-------------------|-----|
| H-01 | [Finding description] | [S/T/R/I/D/E] | High | High | [Controls] | [Gap] |
| H-02 | ... | ... | ... | ... | ... | ... |

**High Findings Count:** [X]

---

#### Medium Risk Findings

| ID | Finding | STRIDE Category | Likelihood | Impact | Existing Controls | Gap |
|----|---------|-----------------|------------|--------|-------------------|-----|
| M-01 | [Finding description] | [S/T/R/I/D/E] | Medium | Medium | [Controls] | [Gap] |
| M-02 | ... | ... | ... | ... | ... | ... |

**Medium Findings Count:** [X]

---

#### Low Risk Findings

[Summary of low-risk findings - detailed list in appendix if needed]

**Low Findings Count:** [X]

---

### Risk Summary

**Total Findings:** [Count]
- **Critical:** [Count] - Immediate action required
- **High:** [Count] - Address within 30 days
- **Medium:** [Count] - Address within 90 days
- **Low:** [Count] - Address as resources allow

---
```

### 8. Document Detailed Recommendations

Update {outputFile} Section 6:

```markdown
## 6. Detailed Recommendations

### Critical Risk Mitigations

#### [Finding ID]: [Finding Title]

**Current State:**
[What exists now that creates this risk]

**Risk:**
- **Likelihood:** High
- **Impact:** Critical
- **Risk Level:** CRITICAL

**Recommendation:**
[Specific, actionable mitigation - NOT generic]

**Implementation Guidance:**
- **Approach:** [Step-by-step technical guidance]
- **Technologies/Tools:** [Specific tools/products/services]
- **Configuration:** [Specific settings, code examples if applicable]
- **Testing:** [How to validate the control works]

**Control Selection Rationale:**
[Why this control addresses the threat, reference to standards]

**Implementation Details:**
- **Complexity:** [Low/Medium/High]
- **Estimated Cost:** [$/$$/$$$ ]
- **Timeline:** [X days/weeks/months]
- **Team:** [Who implements: DevOps, Security, Development]
- **Dependencies:** [Prerequisites or related work]

**Standards Compliance:**
- NIST CSF: [Function.Category]
- CIS Control: [Control number]
- OWASP ASVS: [Section] (if applicable)

---

[Repeat for all Critical findings]

### High Risk Mitigations

[Same structure as Critical, for all High findings]

### Medium Risk Mitigations

[Same structure, potentially more concise for Medium findings]

### Low Risk Mitigations

[Summary or brief recommendations for Low findings]

---
```

### 9. Document Implementation Roadmap

Update {outputFile} Section 7:

```markdown
## 7. Implementation Roadmap

### Phased Remediation Plan

#### Phase 1: Quick Wins (0-30 Days)

**Objective:** Achieve immediate risk reduction with low-complexity changes

**Recommendations:**
1. **[Recommendation Title]** ([Finding ID])
   - **Action:** [Specific action]
   - **Owner:** [Team/Role]
   - **Effort:** [X days/hours]
   - **Priority:** [1-5 within phase]

[Repeat for all Phase 1 items]

**Phase 1 Success Metrics:**
- [X] Critical findings addressed
- [Y] Quick security improvements deployed
- Risk reduction: [Estimated %]

---

#### Phase 2: Critical Remediations (30-90 Days)

**Objective:** Address all critical and high-priority risks

**Recommendations:**
1. **[Recommendation Title]** ([Finding ID])
   - **Action:** [Specific action]
   - **Owner:** [Team/Role]
   - **Effort:** [X weeks]
   - **Dependencies:** [If any]
   - **Priority:** [1-5 within phase]

[Repeat for all Phase 2 items]

**Phase 2 Success Metrics:**
- All Critical findings mitigated
- [X%] of High findings addressed
- Zero-trust maturity improvement: [Level X → Level Y]

---

#### Phase 3: Strategic Improvements (90-180 Days)

**Objective:** Implement architectural security improvements and address medium risks

**Recommendations:**
1. **[Recommendation Title]** ([Finding ID])
   - **Action:** [Specific action]
   - **Owner:** [Team/Role]
   - **Effort:** [X months]
   - **Dependencies:** [If any]
   - **Priority:** [1-5 within phase]

[Repeat for all Phase 3 items]

**Phase 3 Success Metrics:**
- Medium risks addressed
- Zero-trust architecture maturity: [Target level]
- Security architecture modernized

---

#### Phase 4: Continuous Improvement (180+ Days)

**Objective:** Achieve advanced security maturity and address remaining low-risk findings

**Recommendations:**
[List Phase 4 items]

**Phase 4 Success Metrics:**
- All identified findings addressed
- Continuous security improvement process established
- Industry-leading security posture achieved

---

### Roadmap Summary

**Timeline:** [Total duration]
**Total Recommendations:** [Count]
**Estimated Total Cost:** [$/$$/$$$ range]
**Risk Reduction:** [Estimated % reduction in overall risk]

**Critical Success Factors:**
1. [Factor 1]
2. [Factor 2]
3. [Factor 3]

**Resource Requirements:**
- Security team: [Time commitment]
- Development team: [Time commitment]
- Infrastructure/DevOps: [Time commitment]
- Budget: [Estimated total]

---
```

Update frontmatter in {outputFile}:
- Add 6 to `stepsCompleted` array: `stepsCompleted: [1, 2, 3, 4, 5, 6]`
- Set `lastStep: 'recommendations'`
- Add `criticalFindings: [count]`
- Add `highFindings: [count]`
- Add `totalRecommendations: [count]`

### 10. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Final Report

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with prompt: "Review our recommendations for completeness and actionability. Are they specific enough? Do they address root causes? Are there better alternatives? Challenge the implementation approach and timelines."
- IF P: Execute {partyModeWorkflow} with prompt: "Invite Sentinel (compliance expert) to validate recommendations against compliance requirements, or Phoenix (incident response) to review from operational resilience perspective."
- IF C: Verify recommendations are specific and actionable, save to {outputFile}, update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN 'C' is selected AND risk matrix is complete AND recommendations are specific (not generic) AND roadmap is phased AND documented in Sections 5, 6, 7 of {outputFile}, will you then:

1. Update frontmatter in {outputFile}: `stepsCompleted: [1, 2, 3, 4, 5, 6]`, `lastStep: 'recommendations'`
2. Load, read entire file, then execute {nextStepFile} to generate final executive summary and complete report

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All findings prioritized by risk (Critical/High/Medium/Low)
- Risk matrix created with likelihood and impact
- Specific recommendations for all Critical/High findings (not generic)
- Implementation guidance includes: approach, tools, configuration, testing
- Recommendations reference security standards (NIST, CIS, OWASP)
- Phased roadmap created (4 phases with timelines)
- Cost and effort estimates provided
- User validated recommendations are actionable
- Frontmatter updated with step 6 completion

### ❌ SYSTEM FAILURE:

- Generic recommendations (\"use encryption\", \"improve security\")
- Missing risk prioritization
- No implementation guidance
- No standards references
- Missing phased roadmap
- Recommendations not specific to architecture
- Proceeding without user validation
- Not updating frontmatter before loading next step

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
