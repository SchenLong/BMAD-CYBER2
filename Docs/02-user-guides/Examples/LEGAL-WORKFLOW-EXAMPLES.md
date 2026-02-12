# Legal Workflow Examples

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Module:** legal-team
> **Agents:** 13 specialized legal professionals
> **Jurisdictions:** USA, EU, Spain, Estonia

---

## Overview

The Legal Team provides multi-jurisdictional legal advisory capabilities. All workflows begin with `legal-matter-intake` for proper routing, or can be invoked directly when the matter type is known.

**Disclaimer**: These examples are for illustrative purposes only and do not constitute legal advice. Always consult qualified legal counsel for actual legal matters.

---

## Example 1: Legal Matter Intake

### Scenario

A new legal matter arises and you need to determine the appropriate specialist and workflow.

### Invocation

```
/bmad:legal-team:workflows:legal-matter-intake
```

### Workflow Steps

**Step 1: Welcome & Classification**

```
Counsel (General Counsel) initiates:

"Welcome to Legal Intake. I'll help route your matter
to the appropriate specialist.

What type of legal matter do you have?

1. Contract (drafting, review, negotiation)
2. Corporate (formation, governance, M&A)
3. Employment/Labor
4. Intellectual Property
5. Real Estate/Property
6. Tax Planning
7. Dispute/Litigation
8. Regulatory/Compliance
9. Cross-Border/International
10. Other/Unsure"

User selects: 1 (Contract)
```

**Step 2: Jurisdiction Determination**

```
Counsel asks:

"Which jurisdiction(s) apply to this contract?

1. United States (federal or state)
2. European Union (single or multiple member states)
3. Spain specifically
4. Estonia specifically
5. Multiple jurisdictions
6. Unsure - help me determine"

User selects: 5 (Multiple - US and EU)
```

**Step 3: Urgency Assessment**

```
Counsel evaluates:

"What is the urgency level?

1. Immediate (signing within 48 hours)
2. Urgent (within 1 week)
3. Standard (2-4 weeks)
4. No deadline"

User selects: 2 (Urgent)
```

**Step 4: Party Identification**

```
Counsel gathers:

"Please identify the parties:

Your organization: [User provides]
Counterparty(ies): [User provides]
Your role: [Buyer/Seller/Licensor/Licensee/etc.]"
```

**Step 5: Document Collection**

```
Counsel requests:

"Please provide:
- [ ] Draft contract (if exists)
- [ ] Term sheet or key terms
- [ ] Previous correspondence
- [ ] Related agreements"
```

**Step 6: Specialist Routing**

```
Counsel determines:

Based on your matter:
├── Primary Specialist: Covenant (Contract Specialist)
├── Jurisdictional Support:
│   ├── Liberty (US aspects)
│   └── Europa (EU aspects)
├── Recommended Workflow: contract-review
└── Estimated Duration: 4-6 hours

Shall I route to this team? [Y/N]
```

### Sample Output: Matter Brief

```markdown
# LEGAL MATTER BRIEF

## Matter ID: LM-2026-0847
## Date: 2026-01-16

---

### CLASSIFICATION
- **Type**: Contract Review
- **Subtype**: SaaS Agreement
- **Urgency**: Urgent (1 week deadline)
- **Jurisdictions**: USA (Delaware), EU (GDPR considerations)

### PARTIES
| Role | Entity | Jurisdiction |
|------|--------|--------------|
| Licensor | [Client] | Delaware, USA |
| Licensee | Acme GmbH | Germany |

### DOCUMENTS RECEIVED
- [ ] Draft SaaS Agreement (v2.1)
- [ ] Data Processing Addendum
- [ ] Previous negotiation emails

### SPECIALIST ASSIGNMENT
| Role | Specialist | Focus |
|------|------------|-------|
| Lead | Covenant | Contract terms, structure |
| US Law | Liberty | Delaware choice of law |
| EU Law | Europa | GDPR compliance, DPA |

### KEY ISSUES IDENTIFIED (PRELIMINARY)
1. Cross-border data transfer provisions
2. Liability caps (US vs EU expectations differ)
3. Termination rights and data return

### NEXT STEPS
1. Covenant to review draft (2 hours)
2. Europa to assess GDPR compliance (1 hour)
3. Liberty to review US-specific terms (1 hour)
4. Consolidated memo with recommendations

---

*Intake by: Counsel (General Counsel)*
*Routed to: Covenant, Liberty, Europa*
```

---

## Example 2: Contract Review

### Scenario

Review a software licensing agreement with a EU counterparty, identifying risks and recommending modifications.

### Invocation

```
/bmad:legal-team:workflows:contract-review
```

### Workflow Steps

**Step 1: Document Analysis**

```
Covenant (Contract Specialist) reviews structure:

Document: Software License Agreement
├── Parties: Defined clearly
├── Term: 3 years, auto-renewal
├── Scope: Enterprise license, unlimited users
├── Territory: Worldwide
├── Governing Law: Delaware, USA
├── Dispute Resolution: Arbitration (AAA)
├── Data Processing: Separate DPA referenced
└── Annexes: SLA, Security Standards, Pricing
```

**Step 2: Risk Identification**

```
Covenant identifies issues by severity:

┌────────────────────────────────────────────────────────────────────┐
│ RISK ANALYSIS: Software License Agreement                         │
├──────────────┬─────────────────────────────────────────────────────┤
│ HIGH RISK    │                                                     │
├──────────────┼─────────────────────────────────────────────────────┤
│ Section 8.1  │ Unlimited indemnification for IP claims             │
│              │ → Recommend: Cap at 2x annual fees                  │
├──────────────┼─────────────────────────────────────────────────────┤
│ Section 9.2  │ Liability cap excludes "direct damages"             │
│              │ → Recommend: Include direct damages in cap          │
├──────────────┼─────────────────────────────────────────────────────┤
│ Section 14   │ Unilateral termination without cause (them only)    │
│              │ → Recommend: Mutual termination rights              │
├──────────────┼─────────────────────────────────────────────────────┤
│ MEDIUM RISK  │                                                     │
├──────────────┼─────────────────────────────────────────────────────┤
│ Section 5.3  │ Audit rights too broad (unlimited, any time)        │
│              │ → Recommend: Once per year, 30 days notice          │
├──────────────┼─────────────────────────────────────────────────────┤
│ Section 11.2 │ IP ownership of customizations unclear              │
│              │ → Recommend: Explicitly assign to client            │
├──────────────┼─────────────────────────────────────────────────────┤
│ Section 12.1 │ No SLA breach remedies specified                    │
│              │ → Recommend: Service credits, termination rights    │
├──────────────┼─────────────────────────────────────────────────────┤
│ LOW RISK     │                                                     │
├──────────────┼─────────────────────────────────────────────────────┤
│ Section 3.2  │ Force majeure list incomplete                       │
│              │ → Recommend: Add pandemic, cyber attacks            │
├──────────────┼─────────────────────────────────────────────────────┤
│ Section 7.4  │ Invoice dispute period short (5 days)               │
│              │ → Recommend: Extend to 30 days                      │
└──────────────┴─────────────────────────────────────────────────────┘
```

**Step 3: Jurisdictional Analysis**

```
Europa (EU Counsel) reviews:

GDPR Compliance Assessment:
├── Controller/Processor status: Correctly identified ✓
├── Standard Contractual Clauses: Missing ✗
│   → Required for US-EU data transfers
├── Sub-processor provisions: Present but incomplete
│   → Add prior approval requirement
├── Data subject rights: Not addressed
│   → Add cooperation clause
└── Data breach notification: 72 hours stated ✓

Recommendation: DPA requires significant enhancement for GDPR compliance.
```

**Step 4: Commercial Terms Analysis**

```
Covenant assesses business impact:

Pricing Structure:
├── Fixed annual fee: $250,000
├── Overage charges: $50/user/month above 500
├── Price escalation: CPI + 3% annually
│   → Recommend: Cap at CPI + 2%
│
Payment Terms:
├── Net 30 standard
├── Late payment: 1.5%/month
│   → Recommend: Reduce to 1%
│
Renewal Terms:
├── Auto-renewal: 1 year periods
├── Non-renewal notice: 90 days
│   → Recommend: 60 days
```

### Sample Output: Contract Review Memo

```markdown
# CONTRACT REVIEW MEMORANDUM

## Document: Software License Agreement (Acme Software v2.1)
## Client: [Client Name]
## Date: 2026-01-16

---

## EXECUTIVE SUMMARY

This agreement contains several provisions requiring modification before
execution. **HIGH RISK** items include uncapped indemnification, excluded
liability categories, and asymmetric termination rights. GDPR compliance
is incomplete and requires DPA enhancement.

**Recommendation**: Do not execute without addressing HIGH RISK items.

---

## RISK SUMMARY

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Commercial | 1 | 2 | 2 | 5 |
| Legal/Liability | 2 | 1 | 0 | 3 |
| Regulatory | 1 | 1 | 0 | 2 |
| Operational | 0 | 2 | 1 | 3 |
| **Total** | **4** | **6** | **3** | **13** |

---

## HIGH PRIORITY MODIFICATIONS (Must Address)

### 1. Section 8.1 - Indemnification
**Current**: Licensee shall indemnify Licensor for all claims...
**Issue**: Unlimited exposure for IP infringement claims
**Recommended Language**:
> "Licensee's indemnification obligations under this Section 8.1
> shall not exceed two (2) times the annual License Fees paid or
> payable in the twelve (12) months preceding the claim."

### 2. Section 9.2 - Liability Exclusions
**Current**: "...excluding direct damages..."
**Issue**: Carves out most meaningful damages from cap
**Recommended Language**:
> Delete "excluding direct damages" and replace with:
> "The limitations in this Section 9 shall apply to all damages
> including direct, indirect, and consequential damages."

### 3. Section 14 - Termination
**Current**: Licensor may terminate for convenience with 90 days notice
**Issue**: Asymmetric right creates business continuity risk
**Recommended Language**:
> "Either party may terminate this Agreement for convenience upon
> one hundred eighty (180) days prior written notice."

### 4. GDPR Compliance - Data Processing Addendum
**Current**: References DPA but incomplete
**Issue**: Missing SCCs, insufficient sub-processor controls
**Recommended Action**:
> Replace existing DPA with enhanced version including:
> - EU Standard Contractual Clauses (Module 2)
> - Prior approval for sub-processor changes
> - Data subject rights cooperation
> - Security incident response procedures

---

## MEDIUM PRIORITY MODIFICATIONS (Should Address)

[Detailed recommendations for each medium-risk item...]

---

## LOW PRIORITY MODIFICATIONS (Consider)

[Detailed recommendations for each low-risk item...]

---

## NEGOTIATION STRATEGY

**Tier 1 (Non-negotiable)**:
- Indemnification cap
- Liability scope
- Mutual termination rights
- GDPR compliance

**Tier 2 (Strong preference)**:
- Audit limitations
- IP ownership clarity
- SLA remedies

**Tier 3 (Nice to have)**:
- Force majeure expansion
- Invoice dispute period
- Price escalation cap

---

## RECOMMENDED NEXT STEPS

1. [ ] Share marked-up agreement with counterparty
2. [ ] Schedule negotiation call for HIGH items
3. [ ] Prepare enhanced DPA for GDPR compliance
4. [ ] Internal approval for Tier 1 fallback positions

---

*Review by: Covenant (Contract Specialist)*
*Contributing: Europa (EU Compliance), Liberty (US Law)*
*Date: 2026-01-16*
```

---

## Example 3: Corporate Formation (Multi-Jurisdictional)

### Scenario

Establishing a corporate structure for a SaaS business serving US and EU customers.

### Invocation

```
/bmad:legal-team:workflows:corporate-formation
```

### Workflow Steps

**Step 1: Business Profile**

```
Counsel gathers requirements:

Business Type: SaaS platform
Founders: 2 (US citizens)
Target Markets: USA, EU, UK
Funding: Seeking Series A ($5-10M)
Team: Remote, contractors in 5 countries
IP: Software, 2 pending patents
Special Considerations: VC-friendly structure needed
```

**Step 2: Jurisdictional Analysis**

```
Team provides options:

Liberty (US): "Delaware C-Corp is standard for VC-funded startups.
Familiar to investors, established case law, no state tax for
out-of-state operations."

Europa (EU): "Consider Ireland or Netherlands for EU subsidiary.
Ireland offers 12.5% corporate rate, English-speaking, common law.
Netherlands has extensive treaty network."

Baltic (Estonia): "Estonia e-Residency enables EU company without
physical presence. 0% corporate tax on retained earnings.
Digital-native infrastructure."
```

**Step 3: Structure Recommendation**

```
Counsel synthesizes:

Recommended Structure:
┌─────────────────────────────────────────────────────────────────┐
│                 [Founders]                                      │
│                     ↓                                           │
│         ┌─────────────────────────┐                            │
│         │    Parent Co, Inc.      │  ← Delaware C-Corp         │
│         │    (US Parent)          │    (VC investment here)    │
│         └───────────┬─────────────┘                            │
│                     │                                           │
│      ┌──────────────┼──────────────┐                           │
│      ↓              ↓              ↓                           │
│  ┌────────┐   ┌────────────┐   ┌────────────┐                 │
│  │ US Sub │   │ Ireland Sub│   │ Estonia OU │                 │
│  │ (ops)  │   │ (EU sales) │   │ (optional) │                 │
│  └────────┘   └────────────┘   └────────────┘                 │
│                                                                 │
│  IP Strategy: Hold IP in Delaware parent, license to subs     │
│  Transfer Pricing: Arm's length royalty arrangements          │
└─────────────────────────────────────────────────────────────────┘
```

**Step 4: Formation Steps**

```
Counsel provides roadmap:

Phase 1: Delaware Parent (Week 1-2)
├── [ ] File Certificate of Incorporation
├── [ ] Adopt bylaws
├── [ ] Issue founder shares (83(b) elections)
├── [ ] Establish board (founders + 1 independent)
├── [ ] Open business bank account
├── [ ] Apply for EIN
└── [ ] Equity incentive plan setup

Phase 2: Ireland Subsidiary (Week 3-4)
├── [ ] Reserve company name with CRO
├── [ ] Draft constitution
├── [ ] Appoint directors (1 EEA resident required)
├── [ ] Register for corporation tax
├── [ ] Intercompany agreements
└── [ ] GDPR compliance structure

Phase 3: Operational Setup (Week 5-6)
├── [ ] Transfer pricing documentation
├── [ ] IP license agreements
├── [ ] Employment/contractor agreements
├── [ ] Bank account setup (each entity)
└── [ ] Compliance calendar established
```

### Sample Output: Formation Package

```markdown
# CORPORATE FORMATION PLAN

## Project: [Company Name] Structure
## Date: 2026-01-16

---

## RECOMMENDED STRUCTURE

### Parent Entity
| Attribute | Value |
|-----------|-------|
| Entity | [Company Name], Inc. |
| Jurisdiction | Delaware, USA |
| Type | C Corporation |
| Purpose | Holding company, IP owner, US operations |
| Investment | Series A to be raised here |

### EU Subsidiary
| Attribute | Value |
|-----------|-------|
| Entity | [Company Name] Europe Limited |
| Jurisdiction | Ireland |
| Type | Private Limited Company |
| Purpose | EU sales, EU customer contracts, GDPR entity |
| Parent Ownership | 100% by Delaware parent |

---

## RATIONALE

**Delaware C-Corp**:
- VC standard structure (97% of VC-backed companies)
- Flexible equity arrangements (common, preferred, options)
- Well-developed corporate law
- Court of Chancery for disputes
- No state income tax on out-of-state revenue

**Ireland Subsidiary**:
- 12.5% corporate tax rate
- EU market access
- English-speaking, common law
- Strong tech industry presence
- GDPR-compliant contracting entity

---

## IP STRATEGY

1. **IP Ownership**: All IP owned by Delaware parent
2. **License to Subs**: Non-exclusive license to Ireland sub
3. **Royalty Rate**: [X]% of revenue (transfer pricing compliant)
4. **R&D Location**: Costs incurred by parent for US tax benefits

---

## ESTIMATED COSTS

| Item | Cost (USD) |
|------|------------|
| Delaware incorporation | $500 |
| Delaware annual franchise tax | $400/year |
| Registered agent (DE) | $150/year |
| Ireland incorporation | $2,500 |
| Ireland annual compliance | $3,000/year |
| Legal fees (formation) | $15,000 |
| Transfer pricing study | $5,000 |
| **Total Year 1** | **~$26,500** |

---

## TIMELINE

| Week | Milestone |
|------|-----------|
| 1 | Delaware filing, founder equity |
| 2 | Bylaws, board, bank account |
| 3 | Ireland reservation, constitution |
| 4 | Ireland registration, directors |
| 5 | Intercompany agreements |
| 6 | Compliance calendar, go-live |

---

## DOCUMENTS TO BE PREPARED

### Delaware
- [ ] Certificate of Incorporation
- [ ] Bylaws
- [ ] Stockholder Agreement
- [ ] Founder Restricted Stock Purchase Agreements
- [ ] 83(b) Elections
- [ ] Board Consents
- [ ] Equity Incentive Plan

### Ireland
- [ ] Constitution
- [ ] Director consents
- [ ] Registered office agreement
- [ ] Intercompany license agreement
- [ ] Intercompany services agreement

### Ongoing
- [ ] Transfer pricing policy
- [ ] Compliance calendar
- [ ] Annual report reminders

---

*Prepared by: Counsel (General Counsel)*
*Contributing: Liberty (Delaware), Europa (Ireland), Tribute (Tax)*
```

---

## Example 4: Contract Drafting

### Scenario

Draft a SaaS subscription agreement for a B2B software product.

### Invocation

```
/bmad:legal-team:workflows:contract-drafting
```

### Workflow Steps

**Step 1: Requirements Gathering**

```
Covenant collects:

Product: B2B project management SaaS
Pricing Model: Per-seat subscription (monthly/annual)
Target Customers: SMB (10-500 employees)
Contract Value: $1,000 - $50,000 annually
Jurisdiction: US-based customers primarily
Special Terms:
- Free trial (14 days)
- Self-service signup
- Enterprise tier with custom terms
```

**Step 2: Template Selection**

```
Covenant recommends:

Template: Standard SaaS Subscription Agreement
├── Self-service terms for SMB (clickwrap)
├── Enterprise addendum available
├── GDPR DPA (for EU customers)
└── Security exhibit (SOC 2 Type II reference)
```

**Step 3: Drafting**

```
Covenant produces sections:

1. Definitions
2. License Grant and Restrictions
3. Customer Responsibilities
4. Fees and Payment
5. Term and Termination
6. Data Protection
7. Confidentiality
8. Representations and Warranties
9. Indemnification
10. Limitation of Liability
11. General Provisions
```

### Sample Output: Contract Excerpt

```markdown
# SAAS SUBSCRIPTION AGREEMENT

## [Company Name] Terms of Service
### Effective Date: [Date]

---

## 1. DEFINITIONS

**"Authorized Users"** means Customer's employees and contractors
who are authorized by Customer to access the Service.

**"Customer Data"** means all data uploaded, entered, or provided
by Customer or its Authorized Users to the Service.

**"Service"** means the cloud-based project management software
provided by [Company] and described at [URL].

**"Subscription Term"** means the period during which Customer
has paid access to the Service, as specified in an Order Form.

---

## 2. LICENSE GRANT AND RESTRICTIONS

### 2.1 License Grant
Subject to Customer's compliance with this Agreement and payment
of applicable Fees, [Company] grants Customer a limited,
non-exclusive, non-transferable license to access and use the
Service during the Subscription Term.

### 2.2 Use Restrictions
Customer shall not:
(a) sublicense, sell, or transfer the Service to third parties;
(b) modify, reverse engineer, or create derivative works;
(c) use the Service to develop a competing product;
(d) exceed the licensed number of Authorized Users;
(e) use the Service for any unlawful purpose.

---

## 4. FEES AND PAYMENT

### 4.1 Fees
Customer shall pay the fees specified in the applicable Order
Form or as displayed during online signup ("Fees").

### 4.2 Payment Terms
(a) **Monthly subscriptions**: Charged at the beginning of each
    billing period. No refunds for partial months.
(b) **Annual subscriptions**: Charged annually in advance.
    Refunds available within first 30 days only.

### 4.3 Taxes
Fees exclude applicable taxes. Customer is responsible for all
taxes except those based on [Company]'s net income.

### 4.4 Late Payment
Late payments accrue interest at 1% per month or the maximum
rate permitted by law, whichever is less.

---

## 9. INDEMNIFICATION

### 9.1 [Company] Indemnification
[Company] shall defend Customer against claims that the Service
infringes third-party intellectual property rights, provided:
(a) Customer notifies [Company] promptly;
(b) [Company] has sole control of defense and settlement;
(c) Customer provides reasonable cooperation.

**Exclusions**: This indemnity does not cover claims arising from:
(i) Customer's modification of the Service;
(ii) combination with non-[Company] products;
(iii) Customer's continued use after notice of infringement.

**Cap**: [Company]'s indemnification obligations shall not exceed
the Fees paid in the twelve (12) months preceding the claim.

---

## 10. LIMITATION OF LIABILITY

### 10.1 Exclusion of Consequential Damages
NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
CONSEQUENTIAL, OR PUNITIVE DAMAGES, REGARDLESS OF THE CAUSE OF
ACTION OR WHETHER ADVISED OF THE POSSIBILITY.

### 10.2 Liability Cap
EXCEPT FOR BREACHES OF SECTION 2.2 (USE RESTRICTIONS) OR
SECTION 7 (CONFIDENTIALITY), EACH PARTY'S TOTAL LIABILITY
SHALL NOT EXCEED THE FEES PAID IN THE TWELVE (12) MONTHS
PRECEDING THE CLAIM.

---

## EXHIBITS

- **Exhibit A**: Service Level Agreement
- **Exhibit B**: Data Processing Addendum
- **Exhibit C**: Security Standards

---

*Drafted by: Covenant (Contract Specialist)*
*Reviewed by: Liberty (US Law)*
*Version: 1.0*
```

---

## Example 5: Tax Planning

### Scenario

Optimizing tax structure for international expansion.

### Invocation

```
/bmad:legal-team:workflows:tax-planning
```

### Workflow Overview

**Step 1: Current Structure Analysis**

```
Tribute (Tax Specialist) reviews:

Current Setup:
├── Single Delaware LLC (disregarded for tax)
├── Owners: 2 US individuals (50/50)
├── Revenue: $2M (growing 100% YoY)
├── Expenses: $1.5M
├── Net Income: $500K (pass-through to owners)
│
Tax Burden (Current):
├── Federal: ~$185K (37% bracket)
├── State (CA): ~$66K (13.3%)
├── Self-employment: ~$30K
└── Total: ~$281K (56% effective rate)
```

**Step 2: Optimization Recommendations**

```
Tribute proposes:

Option 1: S-Corp Election
├── Reasonable salary: $150K each
├── Remaining as distributions: $100K
├── SE tax savings: ~$15K
└── Net benefit: ~$15K/year

Option 2: Convert to C-Corp (for growth)
├── Retain earnings for expansion
├── 21% corporate rate on retained
├── QBI deduction considerations
└── Best if planning VC funding

Option 3: International Structuring
├── Ireland holding for EU expansion
├── Transfer pricing on IP license
├── Deferral of foreign earnings
└── Requires $5M+ revenue to justify complexity
```

### Sample Output: Tax Strategy Memo

```markdown
# TAX PLANNING MEMORANDUM

## Client: [Company Name]
## Date: 2026-01-16

---

## EXECUTIVE SUMMARY

Current effective tax rate of 56% can be reduced through
entity restructuring. Recommended: S-Corp election for
immediate savings; consider C-Corp conversion if pursuing
VC funding in next 12-18 months.

---

## RECOMMENDATIONS

### Immediate (This Quarter)
1. **Elect S-Corp status** (Form 2553)
   - Estimated annual savings: $15,000
   - Implementation complexity: Low
   - Deadline: Within 75 days of year start

### Medium-term (Next 12 Months)
2. **Establish retirement plan** (Solo 401(k))
   - Additional deduction: Up to $66,000/person
   - Tax deferral on retirement savings

### If Pursuing VC Funding
3. **Convert to C-Corporation**
   - Required for institutional investment
   - QSBS eligibility for founder gains exclusion
   - Must hold shares 5+ years for full benefit

---

## COMPLIANCE REQUIREMENTS

- [ ] Update payroll for reasonable salaries
- [ ] File Form 2553 by [date]
- [ ] Adjust estimated tax payments
- [ ] Review contractor vs. employee classification

---

*Prepared by: Tribute (Tax Specialist)*
*Disclaimer: Consult your tax advisor before implementation*
```

---

## Workflow Combinations

### Contract Lifecycle

```
1. legal-matter-intake (route to contracts)
2. contract-drafting (create agreement)
3. contract-review (internal review)
4. → Negotiation with counterparty
5. contract-review (final version)
```

### Corporate Expansion

```
1. corporate-formation (establish entities)
2. tax-planning (optimize structure)
3. cross-border-matter (coordinate jurisdictions)
```

### Dispute Preparation

```
1. legal-matter-intake (classify dispute)
2. dispute-strategy (develop approach)
3. → Party Mode: litigation-war-room (if escalating)
```

---

## See Also

- [Strategy Workflow Examples](STRATEGY-WORKFLOW-EXAMPLES.md) - For M&A strategy
- [Intel Workflow Examples](INTEL-WORKFLOW-EXAMPLES.md) - For due diligence support
- [Party Mode Examples](PARTY-MODE-EXAMPLES.md) - For `legal-risk-team` preset
- [Workflow Chaining Guide](../WORKFLOW-CHAINING-GUIDE.md) - Combining workflows
