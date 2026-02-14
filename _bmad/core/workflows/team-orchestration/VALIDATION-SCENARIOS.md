# Team Orchestration - Validation Scenarios

**Generated:** 2024-01-11
**Purpose:** Validate cross-module party mode integration through realistic scenario simulations

---

## Scenario 1: Data Breach Incident → Crisis → Notification

### Trigger
A security analyst discovers unauthorized access to a database containing customer PII. Initial investigation suggests ~50,000 records may have been accessed.

### Expected Workflow Chain
`incident-to-crisis-notification` chain:
1. Incident Response (Mode B) → 2. Crisis Response → 3. Legal Notification

### Simulation Walkthrough

#### Step 1: Incident Response Activation

**Phoenix (Incident Commander) initiates:**
```
Mode B - Guided Incident Response activated
Severity: HIGH (PII potentially affected)
```

**Cross-Module Trigger Detected (step-03b-cross-module.md):**
```
✓ Personal data affected → YES
✓ Customer data affected → YES
✓ Public disclosure likely → LIKELY
✓ Regulatory notification → YES (GDPR, CCPA)

RECOMMENDATION: Activate incident-war-room preset
```

**Party Mode Activation:**
- Phoenix (Incident Commander) - Technical containment lead
- Covenant (Counsel) - Regulatory assessment
- Giuseppe (Communications) - Stakeholder messaging
- Vector (OSINT) - External exposure monitoring

#### Step 2: Parallel Crisis Response Activation

**Crisis Response Planning (step-02a-cross-module.md) triggered:**
```
Cross-Module Assessment:
✓ Cybersecurity dimension: Active incident
✓ Legal dimension: GDPR notification potentially required
✓ Intelligence dimension: External monitoring needed
✓ Communications dimension: Public disclosure likely

RECOMMENDATION: Activate crisis-response-party preset
```

**Coordination Protocol Established:**
- Shared timeline: `{output_folder}/incident-{id}/timeline.md`
- War room log: `{output_folder}/incident-{id}/war-room-log.md`
- Sync cadence: Every 2 hours

#### Step 3: Legal Notification Assessment

**Covenant (Counsel) assessment:**
```
GDPR Article 33 Assessment:
- Breach involves personal data: YES
- Data subjects identifiable: YES
- Likely risk to rights/freedoms: HIGH

Notification deadline: 72 hours from discovery
Current status: Hour 4 of 72
Action required: Draft notification to supervisory authority
```

**Handoff Documentation:**
```
FROM: Phoenix (Cybersec)
TO: Covenant (Legal)
Artifact: data-impact-assessment.md
Contains:
- Records affected: ~50,000
- Data types: Name, email, address, phone
- Access method: SQL injection
- Duration: Unknown (investigating)
```

### Validation Checklist

| Check | Status | Notes |
|-------|--------|-------|
| step-03b-cross-module.md invoked at appropriate time | ✓ | After severity determination |
| Correct preset recommended | ✓ | incident-war-room |
| GDPR deadline identified | ✓ | 72 hours tracked |
| Bidirectional link to crisis-response working | ✓ | Parallel activation |
| Shared artifacts established | ✓ | Timeline, war room log |
| All required agents engaged | ✓ | Phoenix, Covenant, Giuseppe, Vector |

### Scenario 1 Result: **PASS**

---

## Scenario 2: Strategic Decision with Security and Legal Implications

### Trigger
Company considering acquiring a SaaS startup. Decision requires evaluation of:
- Strategic fit
- Security posture of target
- Legal/regulatory implications
- Integration risks

### Expected Workflow
Strategic Decision Workshop → step-05b-risk-validation → Continue to implementation

### Simulation Walkthrough

#### Step 1: Strategic Decision Workshop Initiation

**Facilitator initiates 8-step strategic decision workshop:**
- Step 1: Decision Framing - "Acquire SaaS startup for $50M"
- Step 2: Evidence Gathering - Market analysis, financials
- Step 3: Stakeholder Analysis - Board, employees, customers
- Step 4: Perspective Carousel - All 8 archetypes weigh in
- Step 5: Debate & Synthesis - Options crystallized

#### Step 2: Risk Validation (step-05b-risk-validation.md)

**After Step 5, Facilitator offers:**
```
"Before we move to ethics review, I recommend validating through
cross-module risk lenses. This decision has:
- Security implications (target's data handling)
- Legal implications (regulatory, contracts)
- Intelligence needs (due diligence on target)"

Recommend: strategic-decision-validated preset
```

**Cross-Module Validation Team:**
- Sun Tzu (Master Strategist) - Strategic framework
- Cicero (Debate Coach) - Challenge conclusions
- Bastion (Security Architect) - Security assessment
- Covenant (Counsel) - Legal compliance
- Vector (OSINT Lead) - External intelligence

#### Step 3: Security Validation (Bastion)

```
SECURITY ASSESSMENT:

Option A: Full Acquisition
- Security implications: Inherit target's security posture
- Data risks: HIGH - Target handles sensitive customer data
- System requirements: Full security audit before close
- Security cost estimate: $500K for remediation
- Security recommendation: CAUTION - due diligence critical

Security Red Flags:
✗ Target has no SOC 2 certification
✗ No documented security policies found
✓ No known breaches

Questions for Decision Makers:
1. Are we prepared to invest in security remediation?
2. What is acceptable timeline for security maturity?
```

#### Step 4: Legal Validation (Covenant)

```
LEGAL ASSESSMENT:

Option A: Full Acquisition
- Regulatory compliance: Target handles EU data, GDPR applies
- Contractual implications: Data processing agreements need review
- Liability exposure: HIGH - inheriting any compliance gaps
- Legal requirements: Full contract assignment review needed
- Legal recommendation: CAUTION - significant due diligence required

Legal Red Flags:
⚠ Target's terms of service may not support acquisition
⚠ Data processing agreements may need renegotiation

Required Actions:
1. Comprehensive contract audit
2. GDPR compliance assessment
3. IP ownership verification
```

#### Step 5: Intelligence Validation (Vector)

```
INTELLIGENCE ASSESSMENT:

External Intelligence:
- Target company appears financially stable
- No adverse media coverage found
- Competitors may also be interested (time pressure)

Due Diligence Findings:
- Founders have clean backgrounds
- No regulatory actions against company
- Customer sentiment: Generally positive

Intelligence Gaps:
⚠ Unable to verify all customer references
⚠ Technical architecture not fully visible

External Factors to Monitor:
1. Competitor acquisition interest
2. Regulatory environment changes in target markets
```

#### Step 6: Synthesis

```
CROSS-MODULE VALIDATION SUMMARY:

| Option | Security | Legal | Intel | Overall |
|--------|----------|-------|-------|---------|
| Full Acquisition | ⚠ | ⚠ | ✓ | CAUTION |
| Acqui-hire Only | ✓ | ✓ | ✓ | SUPPORT |
| Pass | ✓ | ✓ | ✓ | SUPPORT |

Critical Issues Identified:
1. Security posture needs significant investment
2. GDPR compliance gap is material risk
3. Time pressure from competitor interest

Conditions for Full Acquisition Success:
- Escrow for security remediation ($500K minimum)
- GDPR compliance plan with 6-month deadline
- Representation warranty on no undisclosed breaches
```

### Validation Checklist

| Check | Status | Notes |
|-------|--------|-------|
| step-05b-risk-validation.md offered at right point | ✓ | After Step 5 Debate |
| Correct preset recommended | ✓ | strategic-decision-validated |
| All three domains provided assessment | ✓ | Security, Legal, Intel |
| Options validated against cross-module criteria | ✓ | Matrix completed |
| Critical issues clearly documented | ✓ | 3 issues identified |
| Conditions for success documented | ✓ | 3 conditions |

### Scenario 2 Result: **PASS**

---

## Scenario 3: Contract Review with Compliance Implications

### Trigger
Legal team receives a vendor agreement for a cloud data processing service. Contract involves:
- Processing of customer PII
- Multi-year commitment
- Standard vendor terms (vendor paper)

### Expected Workflow
Contract Review → step-05b-compliance-validation → Jurisdiction review

### Simulation Walkthrough

#### Step 1: Contract Review Steps 1-5

**Covenant (Contract Specialist) executes:**
- Step 1: Contract Upload - Vendor data processing agreement
- Step 2: Governing Law - California law, US jurisdiction
- Step 3: Structure Review - Standard vendor template
- Step 4: Substantive Terms - Core obligations reviewed
- Step 5: Risk Allocation - Liability caps, indemnities assessed

#### Step 2: Compliance Validation (step-05b-compliance-validation.md)

**After Step 5 Risk Allocation, Covenant offers:**
```
"Before jurisdiction review, I recommend compliance validation.

This contract involves:
- Data processing (GDPR, CCPA applicable)
- Technology vendor (SOC 2 requirements)
- Multi-year commitment (policy alignment critical)

Recommend: contract-review-party preset"
```

**Cross-Module Validation Team:**
- Covenant (Counsel) - Legal analysis
- Sentinel (Compliance Guardian) - Security compliance
- Augustus (Policy Analyst) - Policy alignment

#### Step 3: Security Compliance Validation (Sentinel)

```
SECURITY COMPLIANCE ASSESSMENT:

Applicable Frameworks:
✓ SOC 2 Type II (required for data processors)
✓ GDPR (EU customer data)
✓ CCPA (California customer data)

Security Clause Assessment:
| Requirement | Present | Adequate | Gap |
|-------------|---------|----------|-----|
| Data encryption (transit) | ✓ | ✓ | None |
| Data encryption (rest) | ✓ | ⚠ | "Industry standard" vague |
| Access controls | ✓ | ✓ | None |
| Audit rights | ✗ | - | MISSING - Critical |
| Incident notification | ✓ | ⚠ | 72h exceeds our policy |
| Subprocessor controls | ✗ | - | MISSING - Critical |
| Data retention/deletion | ✓ | ⚠ | Deletion timeline unclear |

Vendor Security Assessment:
- SOC 2 report: ✓ Available (Type I only)
- ISO 27001: ✗ Not certified
- Security questionnaire: Pending

COMPLIANCE RECOMMENDATION: NEEDS MODIFICATION

Required Additions:
1. Add audit rights clause
2. Add subprocessor notification/approval clause
3. Tighten incident notification to 24 hours
4. Define encryption standards explicitly
```

#### Step 4: Policy Alignment Validation (Augustus)

```
POLICY ALIGNMENT ASSESSMENT:

Applicable Policies:
✓ Vendor Management Policy
✓ Data Classification Policy
✓ Information Security Policy

Policy Alignment:
| Policy Area | Status | Gap |
|-------------|--------|-----|
| Vendor due diligence | ⚠ | SOC 2 Type II required |
| Data handling | ⚠ | Explicit data classification needed |
| Security requirements | ⚠ | Our standards > contract terms |
| Subcontractor approval | ✗ | Missing approval rights |
| Exit/transition | ✓ | Adequate provisions |
| Monitoring/oversight | ⚠ | No audit rights |

Governance Requirements:
- Approval level: Executive (>$100K annual value)
- Review frequency: Annual
- Exit planning: Required before execution

POLICY RECOMMENDATION: NEEDS ADJUSTMENT
```

#### Step 5: Synthesis

```
COMPLIANCE VALIDATION SUMMARY:

| Domain | Status | Priority Issues |
|--------|--------|-----------------|
| Security Compliance | ⚠ | Audit rights, subprocessors |
| Policy Alignment | ⚠ | Due diligence, approval |
| Legal Requirements | ✓ | Adequate |

Combined Gap Analysis:
| Gap | Source | Priority | Action |
|-----|--------|----------|--------|
| No audit rights | Security/Policy | CRITICAL | Add clause |
| No subprocessor approval | Security/Policy | HIGH | Add clause |
| SOC 2 Type I only | Security | HIGH | Require Type II |
| Incident notification 72h | Security | MEDIUM | Negotiate 24h |
| Vague encryption standard | Security | MEDIUM | Define explicitly |

Contract Readiness: MODIFICATIONS REQUIRED BEFORE EXECUTION

Pre-Execution Checklist:
□ Audit rights clause added
□ Subprocessor approval clause added
□ SOC 2 Type II report received
□ Incident notification negotiated to 24h
□ Executive approval obtained
```

### Validation Checklist

| Check | Status | Notes |
|-------|--------|-------|
| step-05b-compliance-validation.md offered at right point | ✓ | After Step 5 Risk |
| Correct preset recommended | ✓ | contract-review-party |
| Both Security and Policy assessed | ✓ | Sentinel + Augustus |
| Compliance frameworks identified | ✓ | SOC 2, GDPR, CCPA |
| Gaps clearly documented | ✓ | 5 gaps with priority |
| Actionable checklist generated | ✓ | 5 items |

### Scenario 3 Result: **PASS**

---

## Summary

| Scenario | Description | Chain/Step Tested | Result |
|----------|-------------|-------------------|--------|
| 1 | Data Breach Incident | incident-to-crisis-notification chain | ✓ PASS |
| 2 | M&A Strategic Decision | step-05b-risk-validation | ✓ PASS |
| 3 | Vendor Contract Review | step-05b-compliance-validation | ✓ PASS |

### Key Validations Confirmed

1. **Cross-module activation triggers work correctly**
   - Proper conditions identified
   - Right presets recommended
   - Handoff points clear

2. **Party mode presets integrate properly**
   - All agents engaged appropriately
   - Roles clear and distinct
   - Outputs structured correctly

3. **Workflow chains coordinate effectively**
   - Shared artifacts established
   - Timeline tracking works
   - Sync protocols clear

4. **Decision frameworks applied correctly**
   - Risk prioritization used
   - Evidence standards maintained
   - Approval workflows clear

### Implementation Ready: **YES**
