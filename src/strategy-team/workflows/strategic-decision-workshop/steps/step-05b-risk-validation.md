---
name: step-05b-risk-validation
description: Cross-module risk and compliance validation for strategic decisions - brings in Security, Legal, and Intelligence perspectives

outputFile: '{output_folder}/decisions/decision-brief-{topic}.md'
nextStepFile: './step-06-ethics-check.md'
previousStepFile: './step-05-debate-synthesis.md'

# Cross-module integration
partyModePresetsFile: '{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'
recommendedPreset: 'strategic-decision-validated'
---

# Step 5b: Risk & Compliance Validation (Cross-Module)

## STEP GOAL:

Before proceeding to ethics check and final decision, validate the options through cross-module lenses: Security implications (Bastion), Legal compliance (Covenant), and External intelligence context (Vector).

### When to Invoke:

This step should be offered after Step 5 (Debate & Synthesis) when ANY of:
- Decision has security/data implications
- Decision affects regulatory compliance
- Decision requires external market/threat intelligence
- Decision will be presented to board or external stakeholders
- High-stakes decision with significant risk exposure

---

## EXECUTION PROTOCOLS:

### 1. Introduction to Risk Validation

**Facilitator introduction:**

"Before we move to ethics review, I'm recommending we validate these options through our cross-module risk lenses.

Strategic decisions often have implications beyond the strategic domain:
- **Security risks** that the Strategy team may not fully see
- **Legal/compliance requirements** that could constrain or enable options
- **External intelligence** that could change our assumptions

Let me bring in our cross-module experts for a quick validation pass."

### 2. Activate Cross-Module Team

**Load the strategic-decision-validated preset:**

"Activating cross-module validation team:

**Bastion** (Security Architect, cybersec-team)
- Will assess security implications of each option
- Identifies data risks, system vulnerabilities, security costs

**Covenant** (Counsel, legal-team)
- Will assess legal/regulatory compliance
- Identifies contractual, liability, and regulatory risks

**Vector** (OSINT Lead, intel-team)
- Will provide external intelligence context
- Validates market assumptions, identifies external threats

Each will review the options from Step 5 and provide their validation."

### 3. Security Validation (Bastion)

**Bastion's assessment:**

"**Bastion here.** Reviewing from security architecture perspective:

**Option A: [Name]**
- Security implications: [assessment]
- Data risks: [High/Medium/Low] - [explanation]
- System requirements: [what would need to change]
- Security cost estimate: [rough order of magnitude]
- Security recommendation: [Support/Caution/Oppose]

**Option B: [Name]**
- Security implications: [assessment]
- Data risks: [High/Medium/Low] - [explanation]
- System requirements: [what would need to change]
- Security cost estimate: [rough order of magnitude]
- Security recommendation: [Support/Caution/Oppose]

**Option C: [Name]** (if applicable)
- [Same structure]

**Security Red Flags:**
- [ ] [Any critical security concerns]
- [ ] [Any compliance requirements (SOC2, ISO27001, etc.)]

**Security Questions for Decision Makers:**
1. [Question that could change the security calculus]
2. [Question about acceptable risk level]"

### 4. Legal/Compliance Validation (Covenant)

**Covenant's assessment:**

"**Covenant here.** Reviewing from legal and compliance perspective:

**Option A: [Name]**
- Regulatory compliance: [assessment by jurisdiction]
- Contractual implications: [existing contract impacts]
- Liability exposure: [High/Medium/Low] - [explanation]
- Legal requirements: [what must be done for this option]
- Legal recommendation: [Support/Caution/Oppose]

**Option B: [Name]**
- Regulatory compliance: [assessment]
- Contractual implications: [assessment]
- Liability exposure: [High/Medium/Low] - [explanation]
- Legal requirements: [what must be done]
- Legal recommendation: [Support/Caution/Oppose]

**Option C: [Name]** (if applicable)
- [Same structure]

**Legal Red Flags:**
- [ ] [Any regulatory blockers]
- [ ] [Any mandatory requirements not yet addressed]

**Legal Questions for Decision Makers:**
1. [Question about risk tolerance]
2. [Question about jurisdiction or contract specifics]

**Disclaimer:** This is strategic guidance, not legal advice. Formal legal review required before implementation."

### 5. Intelligence Validation (Vector)

**Vector's assessment:**

"**Vector here.** Providing external intelligence context:

**Market/Competitive Intelligence:**
- Current landscape: [relevant external context]
- Competitor moves: [if relevant to decision]
- Market timing: [any time-sensitive factors]

**Option A: [Name]**
- External support: [what external evidence supports this]
- External risks: [what external factors could undermine this]
- Intelligence confidence: [High/Medium/Low] on key assumptions

**Option B: [Name]**
- External support: [what external evidence supports this]
- External risks: [what external factors could undermine this]
- Intelligence confidence: [High/Medium/Low] on key assumptions

**Option C: [Name]** (if applicable)
- [Same structure]

**Intelligence Gaps:**
- [ ] [Information we don't have that would be valuable]
- [ ] [Assumptions we couldn't validate]

**External Factors to Monitor:**
1. [Factor that could change the calculus]
2. [Factor with known timeline]"

### 6. Synthesize Cross-Module Validation

**Facilitator synthesis:**

"Let me synthesize the cross-module validation:

**Validation Summary Matrix:**

| Option | Security | Legal | Intelligence | Overall |
|--------|----------|-------|--------------|---------|
| Option A | [✓/⚠/✗] | [✓/⚠/✗] | [✓/⚠/✗] | [score] |
| Option B | [✓/⚠/✗] | [✓/⚠/✗] | [✓/⚠/✗] | [score] |
| Option C | [✓/⚠/✗] | [✓/⚠/✗] | [✓/⚠/✗] | [score] |

Legend: ✓ = Supports, ⚠ = Caution, ✗ = Opposes

**Critical Issues Identified:**
1. [Any blocking issues from any domain]
2. [Any issues that must be resolved before decision]

**Conditions for Success:**
For each viable option, these conditions must be met:
- Option A requires: [conditions]
- Option B requires: [conditions]

**Updated Risk Assessment:**
Based on cross-module input, the risk profile has [changed/not changed]:
- [Updated risk assessment]"

### 7. Decision Impact

**User engagement:**

"{user_name}, the cross-module validation has [confirmed/modified/challenged] our options:

**Key Changes from Validation:**
1. [Any options eliminated or elevated]
2. [Any new conditions added]
3. [Any assumptions invalidated]

**Questions for you:**
1. Does this validation change your thinking on any option?
2. Are there any red flags you'd like to explore further?
3. Are you comfortable proceeding to ethics review?

**Select:**
[D] Discuss specific concerns with cross-module team
[R] Request deeper analysis on specific option
[P] Party Mode - Full discussion with all validators
[C] Continue to Ethics Check with validation incorporated"

### 8. Update Output File

**Append to {outputFile}:**

```markdown
## Cross-Module Risk Validation

### Security Assessment (Bastion)
[Security validation content]

### Legal/Compliance Assessment (Covenant)
[Legal validation content]

### Intelligence Assessment (Vector)
[Intelligence validation content]

### Validation Summary
| Option | Security | Legal | Intel | Overall |
|--------|----------|-------|-------|---------|
| [options and ratings] |

### Critical Issues
[List any blocking issues]

### Conditions for Success
[List conditions per option]

### Validation Impact on Decision
[How validation changed the analysis]
```

Update frontmatter: add `step-05b-risk-validation` to stepsCompleted

### 9. Proceed to Ethics Check

When user selects [C], load and execute {nextStepFile} (step-06-ethics-check.md) with cross-module validation context incorporated.

---

## SUCCESS METRICS:

- All three domains (Security, Legal, Intelligence) provided assessment
- Each option validated against cross-module criteria
- Critical issues clearly identified
- Conditions for success documented
- User understands how validation affects options
- Output file updated with validation content

## FAILURE INDICATORS:

- Proceeding without addressing critical issues
- Dismissing cross-module input without consideration
- Not documenting validation in decision brief
- Missing obvious security/legal/intel implications
