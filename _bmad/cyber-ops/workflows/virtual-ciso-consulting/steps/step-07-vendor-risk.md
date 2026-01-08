---
name: 'step-07-vendor-risk'
description: 'Design vendor/third-party risk assessment framework and program'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/virtual-ciso-consulting'
thisStepFile: '{workflow_path}/steps/step-07-vendor-risk.md'
nextStepFile: '{workflow_path}/steps/step-08-advisory.md'
outputFile: '{output_folder}/vciso/{client_name}/vciso-engagement-{client_name}.md'
---

# Step 7: Vendor/Third-Party Risk Program

## STEP GOAL:

To design a comprehensive vendor risk management program including assessment framework, tier classification, questionnaires, and ongoing monitoring processes.

## VENDOR RISK PROGRAM PROCESS:

### 1. Vendor Inventory

Create current vendor inventory:
- Vendor name
- Service provided
- Data access level (none/limited/moderate/extensive)
- Criticality to business (low/medium/high/critical)
- Contract end date
- Current security assessment status

### 2. Vendor Tier Classification

Design 4-tier classification system:

**Tier 1 (Critical):**
- Extensive access to sensitive data
- Critical business function dependency
- Assessment: Comprehensive (annual)
- Requirements: SOC 2 Type II + penetration testing

**Tier 2 (High):**
- Moderate data access
- Important business function
- Assessment: Standard (annual)
- Requirements: SOC 2 or ISO 27001

**Tier 3 (Medium):**
- Limited data access
- Non-critical function
- Assessment: Questionnaire (biennial)
- Requirements: Basic security controls

**Tier 4 (Low):**
- No data access
- Low business impact
- Assessment: Self-attestation
- Requirements: Minimal

Classify all current vendors.

### 3. Risk Assessment Framework

Design assessment process:

**Pre-Contract Assessment:**
- Security questionnaire
- Compliance validation
- Reference checks
- Contract security terms

**Ongoing Assessment:**
- Annual security reviews
- SOC 2 report review
- Incident notification monitoring
- Compliance attestation updates

**Assessment Criteria:**
- Data protection practices
- Access controls
- Encryption standards
- Incident response capability
- Compliance certifications
- Business continuity plans
- Subcontractor management

### 4. Assessment Templates

Create vendor assessment templates:
- Tier 1 comprehensive questionnaire (100+ questions)
- Tier 2 standard questionnaire (50-75 questions)
- Tier 3 basic questionnaire (25-30 questions)
- Tier 4 self-attestation form

### 5. Contract Security Requirements

Define security clauses for vendor contracts:
- Data protection obligations
- Audit rights
- Incident notification (within 24 hours)
- Insurance requirements
- Right to terminate
- Data return/destruction
- Subcontractor approval

### 6. Ongoing Monitoring

Design monitoring process:
- Quarterly risk reviews for Tier 1
- Annual reviews for Tier 2-3
- Incident tracking (all vendors)
- Compliance expiration tracking
- Contract renewal security reviews

### 7. Append Section 7

Update {outputFile} with:
- Current vendor inventory with tier assignments
- Vendor tier classification framework
- Risk assessment process and criteria
- Assessment templates (all tiers)
- Contract security requirements
- Ongoing monitoring schedule
- Vendor risk dashboard design

### 8. Update Frontmatter

```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
lastStep: 'vendor-risk'
totalVendors: {count}
tier1Vendors: {count}
```

### 9. Present MENU

Display: **[C] Continue to Ongoing Advisory & Finalization**

Load {nextStepFile}

---

## ✅ SUCCESS:

- Vendor inventory complete with classifications
- 4-tier framework designed
- Assessment templates created
- Contract security requirements defined
- Monitoring process established
- Section 7 appended
