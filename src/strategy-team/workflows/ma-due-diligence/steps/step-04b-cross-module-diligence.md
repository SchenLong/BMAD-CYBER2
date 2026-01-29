---
name: step-04b-cross-module-diligence
description: Cross-module security and legal due diligence - brings in Cybersec and Legal expertise for comprehensive M&A evaluation

outputFile: '{output_folder}/decisions/ma-due-diligence-{target}.md'
nextStepFile: './step-05-risk-identification.md'
previousStepFile: './step-04-operational-diligence.md'

# Cross-module integration
partyModePresetsFile: '{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'
recommendedPreset: 'm-and-a-diligence-board'
---

# Step 4b: Cross-Module Security & Legal Due Diligence

## STEP GOAL:

Conduct specialized security and legal due diligence that goes beyond standard operational assessment. This cross-module step brings in dedicated expertise from cybersec-team and legal-team to identify technical risks, compliance exposures, and deal-structuring considerations.

### When to Invoke:

This step should be offered after Step 4 (Operational Diligence) when ANY of:
- Target has significant technology assets or IT infrastructure
- Target handles personal data (GDPR, CCPA, HIPAA considerations)
- Target operates in regulated industry
- Acquisition includes intellectual property
- Target has cloud/SaaS components
- Cybersecurity posture is material to deal value
- Cross-border elements require multi-jurisdictional legal review

---

## EXECUTION PROTOCOLS:

### 1. Introduction to Cross-Module Diligence

**M&A Advisor introduction:**

"Before we move to comprehensive risk identification, I'm recommending we conduct specialized cross-module due diligence.

Standard operational DD covers technology and legal at a high level, but for deals with significant:
- **Technology risk** - Security architecture, data practices, technical debt
- **Legal complexity** - Multi-jurisdiction, IP, regulatory compliance

We should bring in dedicated expertise from our Security and Legal teams."

### 2. Activate Cross-Module Team

**Load the m-and-a-diligence-board preset:**

"Activating cross-module M&A diligence team:

**Bastion** (Security Architect, cybersec-team)
- Will conduct security architecture review
- Assess data protection practices
- Identify cyber risk exposure

**Sentinel** (Compliance Guardian, cybersec-team)
- Will assess compliance posture
- Review security certifications
- Identify regulatory gaps

**Covenant** (Contract Specialist, legal-team)
- Will review key contracts for deal implications
- Assess change-of-control provisions
- Identify legal deal structure considerations

**Sun Tzu** (Master Strategist, strategy-team)
- Will synthesize findings into strategic implications
- Assess competitive advantage sustainability
- Identify value at risk"

### 3. Security Due Diligence (Bastion)

**Bastion's security assessment:**

"**Bastion here.** Let me sketch out the security architecture of the target...

**Security Architecture Review:**

| Component | Current State | Risk Level | Remediation Cost |
|-----------|--------------|------------|------------------|
| Network security | [Mature/Developing/Immature] | [L/M/H/Critical] | [$estimate] |
| Identity & access | [Mature/Developing/Immature] | [L/M/H/Critical] | [$estimate] |
| Data protection | [Mature/Developing/Immature] | [L/M/H/Critical] | [$estimate] |
| Application security | [Mature/Developing/Immature] | [L/M/H/Critical] | [$estimate] |
| Endpoint security | [Mature/Developing/Immature] | [L/M/H/Critical] | [$estimate] |
| Cloud security | [Mature/Developing/Immature] | [L/M/H/Critical] | [$estimate] |
| Incident response | [Mature/Developing/Immature] | [L/M/H/Critical] | [$estimate] |

**Critical Security Findings:**
1. [Finding with impact]
2. [Finding with impact]
3. [Finding with impact]

**Security Debt Estimate:** $[range]

**Breach History:**
- Previous incidents: [Y/N - details if Y]
- Regulatory fines: [Y/N - amount if Y]
- Ongoing investigations: [Y/N]

**Security Integration Complexity:**
- Compatible with acquirer security stack: [Y/N/Partial]
- Expected integration timeline: [estimate]
- Key security dependencies to maintain: [list]

**Security Deal Considerations:**
- Recommend security representation in purchase agreement
- Suggest escrow for security remediation
- Consider cyber insurance adequacy"

### 4. Compliance Due Diligence (Sentinel)

**Sentinel's compliance assessment:**

"**Sentinel here.** Let me map this to our control framework...

**Compliance Posture Assessment:**

| Framework | Applicable | Current Status | Gap Remediation |
|-----------|------------|----------------|-----------------|
| SOC 2 | [Y/N] | [Certified/In Progress/None] | [timeline/cost] |
| ISO 27001 | [Y/N] | [Certified/In Progress/None] | [timeline/cost] |
| GDPR | [Y/N] | [Compliant/Partial/Non-compliant] | [timeline/cost] |
| HIPAA | [Y/N] | [Compliant/Partial/Non-compliant] | [timeline/cost] |
| PCI-DSS | [Y/N] | [Certified/In Progress/None] | [timeline/cost] |
| SOX | [Y/N] | [Compliant/Partial/Non-compliant] | [timeline/cost] |
| [Industry-specific] | [Y/N] | [Status] | [timeline/cost] |

**Data Processing Assessment:**
- Personal data categories processed: [list]
- Data subject locations: [jurisdictions]
- Data transfer mechanisms: [SCCs, BCRs, adequacy, etc.]
- Data retention practices: [compliant/gap]
- Subject rights processes: [mature/developing/none]

**Regulatory Exposure:**
- Active regulatory inquiries: [Y/N]
- Compliance violations history: [summary]
- Upcoming regulatory requirements: [list]

**Compliance Integration Requirements:**
- Must maintain certifications: [which]
- Compliance training needed: [scope]
- Policy harmonization: [effort estimate]

**Business Justification for Risk Acceptance:**
Any compliance gaps requiring risk acceptance should be documented and priced into the deal."

### 5. Legal Due Diligence (Covenant)

**Covenant's legal assessment:**

"**Covenant here.** Let me review the key contractual landscape...

**Contract Review Summary:**

| Contract Category | Count | Key Issues | Deal Impact |
|-------------------|-------|------------|-------------|
| Customer contracts | [#] | [CoC clauses, termination rights] | [risk level] |
| Supplier contracts | [#] | [Critical dependencies, assignability] | [risk level] |
| Employment agreements | [#] | [Retention terms, non-competes] | [risk level] |
| IP licenses | [#] | [Transferability, restrictions] | [risk level] |
| Partnership agreements | [#] | [Exclusivity, CoC provisions] | [risk level] |
| Real estate leases | [#] | [Assignability, early termination] | [risk level] |

**Change of Control Provisions:**
- Contracts requiring consent: [count]
- Contracts with termination rights: [count]
- Material relationships at risk: [list]

**Intellectual Property Assessment:**
- IP ownership clarity: [Clear/Disputed/Unknown]
- Key IP assets: [list]
- IP encumbrances: [list]
- Employee IP assignment: [status]

**Litigation & Disputes:**
- Active litigation: [count with summary]
- Threatened claims: [count]
- Contingent liabilities: [$estimate]

**Regulatory Clearances Required:**
- Antitrust/competition: [Y/N - jurisdiction]
- Foreign investment: [Y/N - jurisdiction]
- Industry-specific: [list]

**Deal Structure Considerations:**
- Recommended reps & warranties: [list]
- Suggested indemnities: [list]
- Escrow recommendations: [$amount for what]
- Conditions precedent: [list]"

### 6. Strategic Synthesis (Sun Tzu)

**Sun Tzu's strategic view:**

"**Sun Tzu here.** Let me observe the terrain we've mapped...

'Know the enemy and know yourself; in a hundred battles you will never be in peril.'

**Strategic Implications of Cross-Module Findings:**

**Security as Competitive Advantage:**
- Is security a differentiator? [Y/N - how]
- Does security posture affect customer trust? [assessment]
- What happens if breach occurs post-acquisition? [risk]

**Compliance as Market Access:**
- Which certifications are market requirements? [list]
- What's the competitive cost of compliance gaps? [assessment]
- Are compliance investments value-additive? [Y/N]

**Legal Position Strength:**
- IP moat assessment: [Strong/Moderate/Weak]
- Contract defensibility: [assessment]
- Litigation exposure materiality: [assessment]

**Value at Risk Summary:**

| Risk Category | Potential Value Impact | Probability | Expected Value Adjustment |
|---------------|----------------------|-------------|---------------------------|
| Security remediation | $[range] | [%] | $[adjustment] |
| Compliance gaps | $[range] | [%] | $[adjustment] |
| Contract risks | $[range] | [%] | $[adjustment] |
| IP concerns | $[range] | [%] | $[adjustment] |
| Litigation | $[range] | [%] | $[adjustment] |
| **Total** | | | **$[total adjustment]** |

**Strategic Recommendation:**
[Proceed/Proceed with Conditions/Reconsider/Walk Away]

**Key Conditions for Proceeding:**
1. [Condition]
2. [Condition]
3. [Condition]"

### 7. Synthesize Cross-Module Input

**M&A Advisor synthesis:**

"Let me synthesize the cross-module diligence findings:

**Cross-Module Due Diligence Summary:**

| Domain | Risk Level | Value Impact | Recommendation |
|--------|------------|--------------|----------------|
| Security Architecture | [L/M/H/Critical] | $[estimate] | [action] |
| Compliance Posture | [L/M/H/Critical] | $[estimate] | [action] |
| Legal/Contractual | [L/M/H/Critical] | $[estimate] | [action] |
| IP Position | [L/M/H/Critical] | $[estimate] | [action] |

**Deal Price Adjustment Recommendation:** $[amount] reduction or escrow

**Critical Deal Conditions:**
1. [Must-have condition]
2. [Must-have condition]
3. [Must-have condition]

**Integration Planning Inputs:**
- Day 1 security priorities: [list]
- Compliance maintenance requirements: [list]
- Contract consent process: [list]

**Overall Cross-Module Assessment:** [Favorable/Manageable/Concerning/Deal-Threatening]"

### 8. Update Output File

**Append to {outputFile}:**

```markdown
## 4b. Cross-Module Security & Legal Due Diligence

### Security Due Diligence (Bastion)
**Architecture Assessment:**
[Security assessment tables]

**Security Debt:** $[estimate]
**Key Findings:** [list]
**Integration Complexity:** [assessment]

### Compliance Due Diligence (Sentinel)
**Compliance Posture:**
[Compliance tables]

**Key Gaps:** [list]
**Regulatory Exposure:** [assessment]

### Legal Due Diligence (Covenant)
**Contract Landscape:**
[Contract summary]

**Change of Control Impact:** [summary]
**IP Position:** [assessment]
**Deal Structure Recommendations:** [list]

### Strategic Synthesis (Sun Tzu)
**Value at Risk:** $[total]
**Strategic Recommendation:** [recommendation]
**Key Conditions:** [list]

### Cross-Module Summary
| Domain | Risk | Value Impact | Action |
|--------|------|--------------|--------|
[summary table]

**Overall Assessment:** [rating]
**Deal Adjustment:** [recommendation]
```

Update frontmatter: add `step-04b-cross-module-diligence` to stepsCompleted

### 9. Menu Options

**Present options:**

"{user_name}, the cross-module due diligence is complete.

**Select:**
[D] Discuss specific findings with cross-module team
[P] Party Mode - Full M&A diligence board discussion
[E] Generate detailed diligence report
[C] Continue to Risk Identification (incorporating cross-module findings)"

### 10. Continue to Risk Identification

When user selects [C], load and execute {nextStepFile} (step-05-risk-identification.md) with cross-module findings feeding into the risk assessment.

---

## SUCCESS METRICS:

- All four cross-module perspectives provided input
- Security architecture assessed with cost estimates
- Compliance posture mapped to applicable frameworks
- Key contracts reviewed for deal implications
- Value at risk quantified
- Deal structure recommendations provided
- Strategic synthesis with clear recommendation

## FAILURE INDICATORS:

- Skipping security or legal review for material deals
- Not quantifying value impact of findings
- Missing critical compliance frameworks
- Not identifying change of control provisions
- Proceeding without addressing deal-threatening findings
