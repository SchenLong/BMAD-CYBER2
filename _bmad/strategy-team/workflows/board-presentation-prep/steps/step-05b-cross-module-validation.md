---
name: step-05b-cross-module-validation
description: Cross-module risk validation for board presentations - brings in Security, Legal, and Intel perspectives to catch blind spots before board

outputFile: '{output_folder}/presentations/presentation-outline-{topic}.md'
nextStepFile: './step-06-deck-outline.md'
previousStepFile: './step-05-archetype-review.md'

# Cross-module integration
partyModePresetsFile: '{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'
recommendedPreset: 'board-presentation-validation'
---

# Step 5b: Cross-Module Board Presentation Validation

## STEP GOAL:

Validate board presentation content through cross-module lenses to prevent embarrassment, legal exposure, or security incidents. Boards ask hard questions - ensure your presentation can withstand scrutiny from security, legal, and intelligence perspectives.

### When to Invoke:

This step should be offered after Step 5 (Archetype Review) when ANY of:
- Presentation includes technology or security claims
- Presentation involves market analysis or competitive intelligence
- Presentation makes financial projections or commitments
- Presentation discusses regulatory or compliance matters
- Presentation involves M&A, partnerships, or strategic initiatives
- Board includes members with technical, legal, or security backgrounds

---

## EXECUTION PROTOCOLS:

### 1. Introduction to Cross-Module Validation

**Facilitator introduction:**

"Before we build your deck, I recommend cross-module validation.

Boards often include members with expertise in:
- **Security** - CISOs or tech executives who spot security gaps
- **Legal** - General counsels who flag compliance issues
- **Market Intelligence** - Strategists who challenge market assumptions

Let me have our cross-module experts review your presentation to catch issues before your board does."

### 2. Offer Validation

**Present the option:**

"{user_name}, do you want cross-module validation of your presentation content?

This typically takes 10-15 minutes and often catches:
- Security claims that don't hold up to scrutiny
- Legal exposure in commitments or projections
- Market assumptions that can be challenged
- Competitive statements with IP implications

**Select:**
[V] Validate - run cross-module review
[S] Skip - proceed to deck outline"

**IF S: Skip to Continue**
**IF V: Continue with validation**

### 3. Activate Cross-Module Team

**Load the board-presentation-validation team:**

"Activating cross-module validation team:

**Bastion** (Security Architect, cybersec-team)
- Will review security-related claims
- Check technology statements for accuracy
- Flag potential security exposures

**Covenant** (Contract Specialist, legal-team)
- Will review for legal exposure
- Check commitments for enforceability
- Flag regulatory compliance issues

**Augustus** (Policy Analyst, strategy-team)
- Will challenge evidence quality
- Check projection methodology
- Ensure claims are defensible

**Vector** (Intelligence Director, intel-team)
- Will validate market intelligence
- Check competitive claims
- Flag information disclosure risks"

### 4. Security Validation (Bastion)

**Bastion's review:**

"**Bastion here.** Let me review the security dimensions of this presentation...

**Security Claims Review:**

| Claim/Statement | Accuracy | Risk | Recommendation |
|-----------------|----------|------|----------------|
| [Technology claim] | [Accurate/Overstated/Incorrect] | [L/M/H] | [adjust/remove/add caveat] |
| [Security posture] | [Accurate/Overstated/Incorrect] | [L/M/H] | [adjust/remove/add caveat] |
| [Data/metrics] | [Accurate/Overstated/Incorrect] | [L/M/H] | [adjust/remove/add caveat] |

**Information Disclosure Review:**
- Sensitive information exposed: [Y/N - what]
- Competitive intelligence risk: [L/M/H]
- Could adversaries use this information? [assessment]

**Board Q&A Risk:**
If a tech-savvy board member asks about [topic], can you defend the claim?

**Recommended Adjustments:**
1. [Specific adjustment]
2. [Specific adjustment]"

### 5. Legal Validation (Covenant)

**Covenant's review:**

"**Covenant here.** Let me review for legal exposure...

**Commitment Review:**

| Commitment/Projection | Legal Risk | Issue | Recommendation |
|----------------------|------------|-------|----------------|
| [Financial projection] | [L/M/H] | [potential liability] | [caveat/remove/reframe] |
| [Timeline commitment] | [L/M/H] | [potential liability] | [caveat/remove/reframe] |
| [Partnership mention] | [L/M/H] | [confidentiality/NDA] | [caveat/remove/reframe] |

**Regulatory Compliance:**
- Statements within regulatory bounds: [Y/N]
- Forward-looking statement disclaimer needed: [Y/N]
- Material non-public information risk: [assessment]

**Contractual Considerations:**
- References to partners/vendors: [appropriate/needs review]
- Competitive statements: [defensible/risky]
- IP implications: [clear/needs caveat]

**Required Legal Language:**
1. [Disclaimer or caveat to add]
2. [Disclaimer or caveat to add]

**Board Q&A Risk:**
If a board member with legal background asks about [topic], potential exposure is [assessment]."

### 6. Evidence Quality Validation (Augustus)

**Augustus's review:**

"**Augustus here.** Let me review the evidence quality...

**Evidence Assessment:**

| Claim | Evidence Quality | Source | Defensibility |
|-------|-----------------|--------|---------------|
| [Market size claim] | [Strong/Moderate/Weak] | [source] | [High/Medium/Low] |
| [Growth projection] | [Strong/Moderate/Weak] | [source] | [High/Medium/Low] |
| [Competitive position] | [Strong/Moderate/Weak] | [source] | [High/Medium/Low] |

**Methodology Review:**
- Projection assumptions: [reasonable/aggressive/speculative]
- Comparisons: [fair/cherry-picked/misleading]
- Metrics: [standard/custom - explained?]

**Defensibility Score:** [1-10]

**Questions Board May Ask:**
1. '[Likely challenging question]'
2. '[Likely challenging question]'
3. '[Likely challenging question]'

**Recommended Strengthening:**
1. [Add supporting evidence for...]
2. [Caveat the claim about...]
3. [Prepare backup slide for...]"

### 7. Intelligence Validation (Vector)

**Vector's review:**

"**Vector here.** Let me validate the intelligence dimensions...

**Market Intelligence Review:**

| Intelligence Claim | Verification | Confidence | Risk |
|-------------------|--------------|------------|------|
| [Competitor statement] | [Verified/Unverified/Disputed] | [H/M/L] | [exposure] |
| [Market trend] | [Verified/Unverified/Disputed] | [H/M/L] | [exposure] |
| [Customer insight] | [Verified/Unverified/Disputed] | [H/M/L] | [exposure] |

**Competitive Intelligence Risks:**
- Statements competitors could challenge: [list]
- Potential for competitive retaliation: [assessment]
- Information that reveals our strategy: [assessment]

**Source Protection:**
- Are sources adequately protected? [Y/N]
- Could board discussion expose sources? [Y/N]

**Recommended Intelligence Caveats:**
1. [Caveat for claim about...]
2. [Caveat for claim about...]"

### 8. Synthesize Cross-Module Validation

**Facilitator synthesis:**

"Let me synthesize the cross-module validation:

**Validation Summary:**

| Domain | Issues Found | Critical? | Action Required |
|--------|-------------|-----------|-----------------|
| Security | [count] | [Y/N] | [summary] |
| Legal | [count] | [Y/N] | [summary] |
| Evidence | [count] | [Y/N] | [summary] |
| Intelligence | [count] | [Y/N] | [summary] |

**Critical Adjustments Required:**
1. [Must-fix issue]
2. [Must-fix issue]

**Recommended Adjustments:**
1. [Should-fix issue]
2. [Should-fix issue]

**Required Disclaimers/Caveats:**
1. [Legal disclaimer]
2. [Forward-looking statement caveat]

**Additional Q&A Prep:**
Add these questions to your Q&A preparation:
1. '[Question from security angle]'
2. '[Question from legal angle]'
3. '[Question from evidence angle]'

**Overall Presentation Risk Score:** [Low/Moderate/High]

**Ready for Board:** [Yes/Yes with adjustments/Not yet]"

### 9. Update Output File

**Append to {outputFile}:**

```markdown
## 5b. Cross-Module Validation

### Security Review (Bastion)
**Claims Reviewed:** [count]
**Issues Found:** [count]
**Key Adjustments:** [list]

### Legal Review (Covenant)
**Commitments Reviewed:** [count]
**Exposure Risk:** [L/M/H]
**Required Disclaimers:** [list]

### Evidence Review (Augustus)
**Defensibility Score:** [1-10]
**Weak Areas:** [list]
**Strengthening Needed:** [list]

### Intelligence Review (Vector)
**Claims Verified:** [count]
**Confidence Issues:** [list]
**Source Protection:** [status]

### Validation Summary
| Domain | Risk | Action |
|--------|------|--------|
[summary table]

### Required Changes
1. [Critical change]
2. [Critical change]

### Additional Q&A Prep
1. [New question]
2. [New question]
```

Update frontmatter: add `step-05b-cross-module-validation` to stepsCompleted

### 10. Menu Options

**Present options:**

"{user_name}, cross-module validation is complete.

**Select:**
[D] Discuss specific findings with experts
[P] Party Mode - Full validation board discussion
[A] Apply recommended adjustments to content
[C] Continue to Deck Outline"

### 11. Continue to Deck Outline

When user selects [C], load and follow {nextStepFile} (step-06-deck-outline.md) with validation findings incorporated.

---

## SUCCESS METRICS:

- All four cross-module perspectives provided input
- Security claims validated for accuracy
- Legal exposure identified with mitigations
- Evidence quality assessed with defensibility score
- Intelligence claims verified
- Required adjustments clearly documented
- Additional Q&A prep questions provided

## FAILURE INDICATORS:

- Only surface-level review
- Missing critical legal disclaimers
- Not identifying security claim risks
- Not challenging evidence quality
- Proceeding with high-risk content unaddressed
