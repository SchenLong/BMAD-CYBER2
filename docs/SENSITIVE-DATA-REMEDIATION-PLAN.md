# BMAD-CYBERSEC Sensitive Data Risk Remediation Plan

**Created:** 2026-01-11
**Status:** DRAFT - For Review
**Source:** Sensitive Data Risk Assessment (2026-01-11)
**Priority:** HIGH

---

## Executive Summary

This remediation plan addresses the findings from the Sensitive Data Risk Assessment dated January 11, 2026. The assessment identified significant gaps in data handling, classification, and protection capabilities within the BMAD-CYBERSEC framework.

### Key Findings Addressed

| Finding | Severity | Remediation Priority |
|---------|----------|---------------------|
| No Data Classification System | CRITICAL | P1 |
| No Automatic Redaction | CRITICAL | P1 |
| No Audit Trail Control | HIGH | P2 |
| No Confidential Mode | CRITICAL | P1 |
| No Output Encryption Guidance | HIGH | P2 |
| No Data Minimization | CRITICAL | P1 |
| Missing User Guidance | HIGH | P2 |

### What We CAN Address (Framework-Level)

1. **Documentation & Guidance** - User warnings, classification guidelines, best practices
2. **Workflow Modifications** - Add data classification steps, redaction prompts, audit hooks
3. **Agent Rules** - Add data sensitivity rules to all agents (similar to prompt injection rules)
4. **Templates** - Create redaction templates, classification schemes, anonymization guides
5. **Configuration** - Add sensitivity settings to module configs

### What We CANNOT Address (Infrastructure-Level)

1. **Anthropic API Data Retention** - Requires enterprise agreement with Anthropic
2. **Encrypted Storage** - Requires user's infrastructure (BitLocker, FileVault, etc.)
3. **Local LLM Processing** - Requires self-hosted LLM infrastructure
4. **BAA/DPA Agreements** - Requires legal/business engagement with Anthropic

---

## Remediation Phases

### Phase 1: Critical Documentation & Warnings (Week 1)

#### 1.1 Create Data Sensitivity Policy Document

**Location:** `docs/DATA-SENSITIVITY-POLICY.md`

**Content Requirements:**
- Data classification levels (Public, Internal, Confidential, Restricted)
- Per-module sensitivity ratings
- DO/DON'T use cases with examples
- Legal/compliance implications
- User responsibility acknowledgment

**Acceptance Criteria:**
- [ ] Document created with all classification levels
- [ ] All 8 modules mapped to sensitivity levels
- [ ] Clear examples for each DO/DON'T scenario
- [ ] Legal disclaimer included

#### 1.2 Add Module-Level Warnings

**Files to Update:**
- `_bmad/cybersec-team/README.md` - Add HIGH RISK warning
- `_bmad/intel-team/README.md` - Add HIGH RISK warning
- `_bmad/strategy-team/README.md` - Add MEDIUM-HIGH warning
- `_bmad/legal-team/README.md` - Add MEDIUM warning + privilege waiver note

**Warning Template:**
```markdown
> **DATA SENSITIVITY WARNING**
>
> This module processes potentially sensitive data that is transmitted to Anthropic's Claude API.
>
> **Risk Level:** [HIGH/MEDIUM-HIGH/MEDIUM]
>
> **DO NOT USE FOR:**
> - [List prohibited use cases]
>
> **REQUIRED BEFORE USE:**
> - [ ] Review docs/DATA-SENSITIVITY-POLICY.md
> - [ ] Anonymize/redact sensitive data per guidelines
> - [ ] Verify compliance with your organization's data policies
```

#### 1.3 Update Root README.md

Add prominent security section near top:

```markdown
## Security & Data Sensitivity Notice

BMAD-CYBERSEC workflows transmit data to Anthropic's Claude API. Before using with sensitive data:

1. **Read:** [Data Sensitivity Policy](docs/DATA-SENSITIVITY-POLICY.md)
2. **Classify:** Determine your data's sensitivity level
3. **Anonymize:** Apply appropriate redaction per guidelines
4. **Verify:** Ensure compliance with your organization's policies

See [Section 10](#recommended-safeguards) for detailed guidance.
```

---

### Phase 2: Data Classification System (Week 2)

#### 2.1 Create Classification Schema

**Location:** `_bmad/core/data/classification-schema.yaml`

```yaml
# Data Classification Schema for BMAD-CYBERSEC

classification_levels:
  public:
    level: 0
    color: "green"
    description: "Information intended for public disclosure"
    handling: "No restrictions"
    examples:
      - "Published security frameworks (NIST, OWASP)"
      - "Generic best practices"
      - "Public company information"

  internal:
    level: 1
    color: "yellow"
    description: "Internal organizational information"
    handling: "Use discretion, anonymize specifics"
    examples:
      - "Aggregated security metrics (no specifics)"
      - "General architecture patterns"
      - "Anonymized incident statistics"

  confidential:
    level: 2
    color: "orange"
    description: "Sensitive business/security information"
    handling: "REQUIRES anonymization before processing"
    examples:
      - "Security findings (anonymized)"
      - "Strategic plans (generalized)"
      - "Vulnerability assessments (no specific targets)"

  restricted:
    level: 3
    color: "red"
    description: "Highly sensitive - DO NOT PROCESS"
    handling: "DO NOT use with BMAD workflows"
    examples:
      - "Active breach data with PII"
      - "Customer personal information"
      - "Attorney-client privileged communications"
      - "Classified/export-controlled information"
      - "Unredacted vulnerability details"

module_defaults:
  cybersec-team:
    typical_level: "confidential"
    max_safe_level: "internal"
    warning: "Security data often contains sensitive specifics - always anonymize"

  intel-team:
    typical_level: "confidential"
    max_safe_level: "internal"
    warning: "Intelligence operations may involve PII - strict anonymization required"

  strategy-team:
    typical_level: "confidential"
    max_safe_level: "internal"
    warning: "Strategic discussions may contain trade secrets - generalize specifics"

  legal-team:
    typical_level: "restricted"
    max_safe_level: "public"
    warning: "CRITICAL: Attorney-client privilege may be waived - avoid real legal matters"

  bmm:
    typical_level: "internal"
    max_safe_level: "confidential"
    warning: "Source code may contain secrets - review before processing"

  bmgd:
    typical_level: "internal"
    max_safe_level: "confidential"
    warning: "Game designs may be trade secrets - use discretion"

  cis:
    typical_level: "public"
    max_safe_level: "internal"
    warning: "Creative content generally safe"

  bmb:
    typical_level: "public"
    max_safe_level: "internal"
    warning: "Framework building generally safe"
```

#### 2.2 Add Classification Step to Workflows

Create a shared classification prompt to be included in high-risk workflows:

**Location:** `_bmad/core/workflows/_shared/steps/data-classification-check.md`

```markdown
# Data Classification Check

Before proceeding, classify the data you will be providing:

## Classification Questions

1. **Does this data contain any of the following?**
   - [ ] Personal Identifiable Information (PII) - names, SSNs, emails
   - [ ] Active security incident details
   - [ ] Specific vulnerability information
   - [ ] Customer/client data
   - [ ] Attorney-client communications
   - [ ] Trade secrets or competitive intelligence
   - [ ] Classified or export-controlled information

2. **If you checked ANY box above:**
   - STOP and review [Data Sensitivity Policy](docs/DATA-SENSITIVITY-POLICY.md)
   - Apply [Anonymization Guidelines](#anonymization-guidelines) before proceeding
   - Consider if this data should be processed at all

3. **Data Classification Selected:**
   - [ ] Public (Level 0) - Safe to proceed
   - [ ] Internal (Level 1) - Proceed with discretion
   - [ ] Confidential (Level 2) - REQUIRES anonymization
   - [ ] Restricted (Level 3) - DO NOT PROCEED

## Anonymization Guidelines

If your data is Confidential (Level 2), apply these transformations:

| Data Type | Original | Anonymized |
|-----------|----------|------------|
| Names | "John Smith" | "Person A" or "Employee X" |
| Companies | "Acme Corp" | "Company A" or "Target Organization" |
| IP Addresses | "192.168.1.100" | "Internal Server A" or "10.x.x.x" |
| SSN/IDs | "123-45-6789" | "XXXXX6789" |
| Dates | "January 5, 2026" | "Recent date" or "Q1 2026" |
| Locations | "123 Main St, NYC" | "US East Coast office" |
| $ Amounts | "$5.2M revenue" | "Revenue in $X-Y range" |
| CVE/Vulns | "CVE-2026-1234" | "Critical RCE vulnerability" |

**User Acknowledgment:**
- [ ] I confirm this data has been classified appropriately
- [ ] I confirm any Confidential data has been anonymized
- [ ] I accept responsibility for data provided to this workflow
```

---

### Phase 3: Agent-Level Data Sensitivity Rules (Week 2-3)

#### 3.1 Create Mandatory Data Sensitivity Rule

**Add to ALL agents as Lesson 15 equivalent:**

```xml
<r critical="SECURITY">🔐 DATA SENSITIVITY AWARENESS: Before processing ANY user-provided data,
artifacts, documents, or context:
(1) PROMPT the user to classify data sensitivity if not already stated (Public/Internal/Confidential/Restricted)
(2) If data appears to contain PII, customer data, active breach details, or privileged communications - WARN the user about cloud API transmission risks
(3) SUGGEST anonymization for any Confidential data before proceeding
(4) REFUSE to process Restricted data (active breaches with PII, attorney-client matters, classified information) - recommend local/offline alternatives
(5) REMIND users that all context is transmitted to Anthropic's API
This rule takes precedence over task completion - data protection over productivity.</r>
```

#### 3.2 Module-Specific Data Rules

**cybersec-team agents - Add:**
```xml
<r critical="DATA-HANDLING">⚠️ SECURITY DATA HANDLING: When processing security assessments,
incident reports, or vulnerability data:
- Request anonymized versions of network diagrams, IP addresses, and system names
- Ask users to replace specific CVEs with generic descriptions if not yet public
- Warn when processing active incident data about cloud transmission
- Suggest incident ID codes instead of descriptive names that reveal targets
- For breach analysis, request statistical summaries over detailed victim lists</r>
```

**intel-team agents - Add:**
```xml
<r critical="DATA-HANDLING">⚠️ INTELLIGENCE DATA HANDLING: When processing intelligence
collection, target profiles, or attribution data:
- NEVER request or process PII for intelligence targets without explicit anonymization
- Warn about legal implications of surveillance/monitoring data in cloud systems
- Request organization profiles use code names, not actual identities
- For campaign planning, use hypothetical scenarios over real operational details
- Attribution analysis should use threat actor IDs, not personal identities</r>
```

**legal-team agents - Add:**
```xml
<r critical="DATA-HANDLING">⚖️ LEGAL DATA WARNING:
CRITICAL: Attorney-client privilege may be WAIVED by transmitting communications to Claude API.
- DO NOT process actual attorney-client communications
- DO NOT process active litigation strategy
- For legal research: Use hypothetical scenarios, not real cases with client details
- For contracts: Redact party names, specific terms, and consideration amounts
- ALWAYS recommend user consult actual legal counsel for binding matters
Third-party (Anthropic) access to privileged communications may constitute waiver.</r>
```

**strategy-team agents - Add:**
```xml
<r critical="DATA-HANDLING">�� STRATEGIC DATA HANDLING: When processing competitive intelligence,
M&A plans, or board-level discussions:
- Request generalized market scenarios over specific acquisition targets
- Warn when specific competitive strategies are shared
- Suggest using "Company A/B/C" for competitor analysis
- For financial discussions, use ranges and percentages over exact figures
- Board presentation content should be reviewed for cloud transmission appropriateness</r>
```

#### 3.3 Update Agent Files

**Files to Modify (78 agents across 8 modules):**

Create a script/checklist to add the base data sensitivity rule to all agents:

```bash
# Agent update tracking
_bmad/core/agents/*.md (2 agents)
_bmad/cybersec-team/agents/*.md (15 agents) + cybersec-specific rule
_bmad/intel-team/agents/*.md (11 agents) + intel-specific rule
_bmad/strategy-team/agents/*.md (14 agents) + strategy-specific rule
_bmad/legal-team/agents/*.md (13 agents) + legal-specific rule
_bmad/bmm/agents/*.md (9 agents)
_bmad/bmgd/agents/*.md (6 agents)
_bmad/bmb/agents/*.md (3 agents)
_bmad/cis/agents/*.md (5 agents)
```

---

### Phase 4: Workflow Modifications (Week 3-4)

#### 4.1 High-Risk Workflows to Modify

**Priority 1 - Add Classification Check Step:**

| Module | Workflow | Current Steps | Add Step |
|--------|----------|---------------|----------|
| cybersec-team | incident-response | 8 | step-00-data-classification |
| cybersec-team | vulnerability-management | 7 | step-00-data-classification |
| cybersec-team | security-architecture-review | 6 | step-00-data-classification |
| intel-team | breach-archaeology | 6 | step-00-data-classification |
| intel-team | campaign-planner-person | 7 | step-00-data-classification |
| intel-team | campaign-planner-org | 7 | step-00-data-classification |
| intel-team | counter-intel-audit | 5 | step-00-data-classification |
| strategy-team | competitive-warfare | 6 | step-00-data-classification |
| strategy-team | crisis-response-planning | 5 | step-00-data-classification |
| legal-team | contract-review | 4 | step-00-data-classification |

#### 4.2 Create Step-00 Template

**Location:** `_bmad/core/workflows/_shared/steps/step-00-data-classification.md`

Content: Include the classification check from Phase 2.2 plus workflow-specific warnings.

#### 4.3 Add Output Sensitivity Marking

Modify workflow output templates to include classification footer:

```markdown
---
## Document Classification

**Classification:** [PUBLIC/INTERNAL/CONFIDENTIAL]
**Generated:** {timestamp}
**Workflow:** {workflow-name}
**Data Handling:** This document was generated from [ANONYMIZED/ORIGINAL] input data

⚠️ **Retention Notice:** Review and delete when no longer needed per your data retention policy.
```

---

### Phase 5: Audit & Logging Framework (Week 4)

#### 5.1 Create Audit Log Template

**Location:** `_bmad/core/templates/audit-log-entry.yaml`

```yaml
# BMAD Workflow Audit Log Entry Template

audit_entry:
  timestamp: "{ISO-8601-timestamp}"
  session_id: "{uuid}"

  user:
    identifier: "{anonymized-user-id or hash}"  # Never store actual usernames

  workflow:
    module: "{module-name}"
    workflow: "{workflow-name}"
    version: "{workflow-version}"

  data_classification:
    declared_level: "{public|internal|confidential}"
    anonymization_applied: true|false
    pii_warning_shown: true|false
    user_acknowledged: true|false

  execution:
    started: "{timestamp}"
    completed: "{timestamp}"
    status: "{completed|aborted|error}"
    steps_completed: [1, 2, 3]

  outputs:
    files_generated:
      - path: "{relative-path}"
        classification: "{level}"

  notes: "{any special circumstances}"
```

#### 5.2 Add Logging Hook to Workflows

Add to `_bmad/core/workflows/_shared/workflow-hooks.md`:

```markdown
## Audit Logging Hook

When `audit_logging: true` in workflow config:

1. **On Workflow Start:**
   - Generate session_id
   - Record start timestamp
   - Log data classification selection

2. **On Each Step Completion:**
   - Record step number and status
   - Note any data sensitivity warnings shown

3. **On Workflow Completion:**
   - Record end timestamp and status
   - List output files with classifications
   - Save audit entry to `{output_folder}/audit-logs/{YYYY-MM}/{session_id}.yaml`

4. **Audit Log Location:**
   - Logs stored in: `{output_folder}/audit-logs/`
   - Retention: User-configurable (default: 90 days)
   - Format: YAML for human readability
```

#### 5.3 Config Addition

Add to each module's `config.yaml`:

```yaml
audit:
  enabled: true
  log_location: "{output_folder}/audit-logs"
  retention_days: 90
  include_data_classification: true
  anonymize_user_id: true
```

---

### Phase 6: User Guidance & Training (Week 4-5)

#### 6.1 Create User Guide

**Location:** `docs/SECURE-USAGE-GUIDE.md`

**Sections:**
1. Understanding Cloud AI Data Risks
2. Data Classification Quick Reference
3. Anonymization Techniques by Data Type
4. Module-Specific Guidance
5. Safe vs. Unsafe Use Cases
6. Pre-Flight Checklist for Sensitive Work
7. Incident Response (if sensitive data was processed)
8. FAQ

#### 6.2 Create Quick Reference Card

**Location:** `docs/DATA-SENSITIVITY-QUICKREF.md`

One-page reference for:
- Classification levels (visual table)
- Anonymization cheat sheet
- DO/DON'T quick list
- Emergency contacts/procedures

#### 6.3 Update GETTING-STARTED.md

Add security orientation section:

```markdown
## Before You Begin: Data Security

BMAD-CYBERSEC transmits all workflow data to Anthropic's Claude API. Before your first workflow:

1. **Read:** [Data Sensitivity Policy](DATA-SENSITIVITY-POLICY.md) (5 min)
2. **Review:** [Secure Usage Guide](SECURE-USAGE-GUIDE.md) (15 min)
3. **Bookmark:** [Quick Reference Card](DATA-SENSITIVITY-QUICKREF.md)

**First-Time Setup:**
- [ ] I understand data is transmitted to cloud API
- [ ] I know my organization's data classification policy
- [ ] I can identify PII and sensitive data
- [ ] I know when NOT to use these workflows
```

---

### Phase 7: Lessons Learned Update (Week 5)

#### 7.1 Add Lesson 15: Mandatory Data Sensitivity Awareness

**Location:** `_bmad/bmb/ExperienceAcquired/LessonsLearned.md`

```markdown
### Lesson 15: Mandatory Data Sensitivity Awareness Rule

**Error:** Agents and workflows processing user data without explicit data classification
or sensitivity awareness, leading to potential exposure of confidential information through
cloud API transmission.

**Impact:**
- PII, trade secrets, or privileged communications sent to third-party API
- Compliance violations (GDPR, HIPAA, attorney-client privilege)
- No audit trail of what data was processed
- Users unaware of cloud transmission implications
- Reputational and legal risk for organizations

**Prevention:** ALL agents MUST include the data sensitivity awareness rule in their
`<rules>` section, and high-risk workflows MUST include a data classification check step.

[Full rule text and implementation details...]
```

---

## Implementation Tracking

### Phase Completion Checklist

| Phase | Description | Target | Status |
|-------|-------------|--------|--------|
| 1 | Critical Documentation & Warnings | Week 1 | NOT STARTED |
| 2 | Data Classification System | Week 2 | NOT STARTED |
| 3 | Agent-Level Data Rules | Week 2-3 | NOT STARTED |
| 4 | Workflow Modifications | Week 3-4 | NOT STARTED |
| 5 | Audit & Logging Framework | Week 4 | NOT STARTED |
| 6 | User Guidance & Training | Week 4-5 | NOT STARTED |
| 7 | Lessons Learned Update | Week 5 | NOT STARTED |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Agents with data sensitivity rule | 100% (78/78) | Grep for rule text |
| High-risk workflows with classification step | 100% (10/10) | Manual audit |
| Documentation completeness | 100% | Checklist completion |
| User acknowledgment mechanism | Implemented | Workflow testing |
| Audit logging capability | Implemented | Test log generation |

---

## Risk Acceptance

### Residual Risks After Remediation

Even after implementing all phases, the following risks remain:

| Risk | Severity | Mitigation | Owner |
|------|----------|------------|-------|
| User bypasses classification | MEDIUM | Training, clear warnings | User |
| Anthropic data retention | HIGH | Requires enterprise agreement | Legal/Business |
| Output file security | MEDIUM | User must implement encryption | User |
| Accidental sensitive data | MEDIUM | Classification prompts reduce but don't eliminate | User/Framework |

### Recommendations Beyond Framework

1. **Enterprise Agreement:** Organizations processing sensitive data should establish DPA/BAA with Anthropic
2. **Encryption:** Implement disk encryption (BitLocker, FileVault) on systems running BMAD
3. **Network Security:** Consider VPN/proxy for API traffic if required by policy
4. **Training:** Formal data handling training for BMAD users
5. **Alternative:** For Restricted data, consider self-hosted LLM alternatives

---

## Appendix A: Files to Create

| File | Purpose | Phase |
|------|---------|-------|
| `docs/DATA-SENSITIVITY-POLICY.md` | Main policy document | 1 |
| `docs/SECURE-USAGE-GUIDE.md` | Detailed user guide | 6 |
| `docs/DATA-SENSITIVITY-QUICKREF.md` | One-page reference | 6 |
| `_bmad/core/data/classification-schema.yaml` | Classification definitions | 2 |
| `_bmad/core/workflows/_shared/steps/data-classification-check.md` | Shared step | 2 |
| `_bmad/core/workflows/_shared/steps/step-00-data-classification.md` | Workflow step | 4 |
| `_bmad/core/templates/audit-log-entry.yaml` | Audit template | 5 |
| `_bmad/core/workflows/_shared/workflow-hooks.md` | Logging hooks | 5 |

## Appendix B: Files to Modify

| File | Changes | Phase |
|------|---------|-------|
| `README.md` | Add security notice section | 1 |
| `_bmad/*/README.md` (8 files) | Add module warnings | 1 |
| `_bmad/*/agents/*.md` (78 files) | Add data sensitivity rule | 3 |
| `_bmad/*/config.yaml` (8 files) | Add audit config | 5 |
| `docs/GETTING-STARTED.md` | Add security orientation | 6 |
| `_bmad/bmb/ExperienceAcquired/LessonsLearned.md` | Add Lesson 15 | 7 |

## Appendix C: Workflows Requiring Classification Step

| Module | Workflow | Risk Level |
|--------|----------|------------|
| cybersec-team | incident-response | CRITICAL |
| cybersec-team | vulnerability-management | CRITICAL |
| cybersec-team | security-architecture-review | HIGH |
| cybersec-team | threat-modeling | HIGH |
| cybersec-team | compliance-audit-prep | HIGH |
| intel-team | breach-archaeology | CRITICAL |
| intel-team | campaign-planner-person | CRITICAL |
| intel-team | campaign-planner-org | CRITICAL |
| intel-team | counter-intel-audit | CRITICAL |
| intel-team | doppelganger-hunt | HIGH |
| strategy-team | competitive-warfare | HIGH |
| strategy-team | crisis-response-planning | HIGH |
| strategy-team | board-presentation-prep | MEDIUM |
| legal-team | contract-review | HIGH |
| legal-team | dispute-strategy | HIGH |

---

*Document Version: 1.0*
*Next Review: After Phase 7 Completion*
*Owner: Security/Compliance Team*
