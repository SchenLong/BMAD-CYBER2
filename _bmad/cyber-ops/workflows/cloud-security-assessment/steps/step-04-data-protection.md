---

name: 'step-04-data-protection'
description: 'Assess encryption at rest/in transit, key management, and data classification'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-04-data-protection.md'
nextStepFile: '{workflow_path}/steps/step-05-logging-monitoring.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'

---

# Step 4: Data Protection Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on data protection assessment
- FORBIDDEN to discuss logging/monitoring yet

## STEP GOAL:

To assess data protection controls including encryption at rest, encryption in transit, key management, data classification, and sensitive data handling.

## DATA PROTECTION SEQUENCE:

### 1. Encryption at Rest

"Let's assess encryption at rest:

**Storage Encryption:**

| Service Type | Provider | Encryption Options |
|--------------|----------|-------------------|
| Object Storage | AWS S3 | SSE-S3, SSE-KMS, SSE-C |
| Object Storage | Azure Blob | Microsoft-managed, Customer-managed |
| Object Storage | GCP GCS | Google-managed, Customer-managed, CSEK |
| Block Storage | EBS/Managed Disk/PD | Default encryption, CMK |
| Databases | RDS/Azure SQL/Cloud SQL | TDE, CMK encryption |

**Questions:**
- Is all storage encrypted at rest?
- Are customer-managed keys (CMK) used for sensitive data?
- Any unencrypted storage detected?
- Are EBS/disk snapshots encrypted?

What's your encryption at rest status?"

### 2. Encryption in Transit

"Let's verify encryption in transit:

**Transit Encryption:**

| Control | Description | Check |
|---------|-------------|-------|
| TLS minimum version | TLS 1.2+ required | ? |
| Certificate management | Auto-renewal, ACM/Key Vault | ? |
| Internal traffic | VPC/VNet internal encryption | ? |
| API encryption | HTTPS enforced | ? |
| Database connections | SSL/TLS required | ? |

**Questions:**
- Is TLS 1.2+ enforced everywhere?
- Are certificates properly managed?
- Is internal service communication encrypted?
- Any unencrypted database connections?

How is encryption in transit implemented?"

### 3. Key Management

"Let's review key management:

**KMS Assessment:**

| Provider | KMS Service | Key Questions |
|----------|-------------|---------------|
| AWS | AWS KMS | Key policies, rotation, grants |
| Azure | Azure Key Vault | Access policies, soft delete, HSM |
| GCP | Cloud KMS | IAM, rotation, protection levels |

**Key Management Controls:**

| Control | Best Practice | Status |
|---------|---------------|--------|
| Key rotation | Automatic annual rotation | ? |
| Key access logging | All access logged | ? |
| Separation of duties | Key admins ≠ data users | ? |
| Deletion protection | Soft delete, recovery | ? |
| Cross-account access | Minimized, documented | ? |

What's your key management approach?"

### 4. Data Classification

"Let's understand data classification:

**Data Classification Levels:**

| Level | Description | Examples | Controls |
|-------|-------------|----------|----------|
| Public | No impact if disclosed | Marketing materials | Basic |
| Internal | Business impact if disclosed | Internal docs | Encryption |
| Confidential | Significant impact | Customer data, PII | CMK, access controls |
| Restricted | Severe impact | PHI, PCI, secrets | HSM, strict access |

**Questions:**
- Do you have a data classification policy?
- Is data tagged/labeled by classification?
- Are controls enforced based on classification?
- How is sensitive data identified?

How do you classify and tag data?"

### 5. Sensitive Data Protection

"Let's assess sensitive data handling:

**Sensitive Data Types:**

| Data Type | Regulatory | Storage Locations | Protection |
|-----------|------------|-------------------|------------|
| PII | GDPR, CCPA | [Where stored?] | [Controls] |
| PHI | HIPAA | [Where stored?] | [Controls] |
| PCI | PCI-DSS | [Where stored?] | [Controls] |
| Secrets | N/A | [Where stored?] | [Controls] |

**Additional Controls:**

| Control | Purpose | Status |
|---------|---------|--------|
| DLP | Prevent data exfiltration | ? |
| Tokenization | Reduce PCI scope | ? |
| Masking | Non-production data | ? |
| Access logging | Sensitive data access | ? |

What sensitive data exists and how is it protected?"

### 6. Document Data Protection Assessment

Update Section 5 of {outputFile}:

```markdown
## 5. Data Protection Assessment

### 5.1 Encryption at Rest

| Service | Encryption Status | Key Type | Finding | Risk |
|---------|-------------------|----------|---------|------|
| [User data] | | | | |

**Unencrypted Resources:** [Count and details]

### 5.2 Encryption in Transit

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| TLS 1.2+ minimum | [Pass/Fail] | [Details] | [H/M/L] |
| Certificate management | [Pass/Fail] | [Details] | [H/M/L] |
| Internal encryption | [Pass/Fail] | [Details] | [H/M/L] |
| Database SSL | [Pass/Fail] | [Details] | [H/M/L] |

### 5.3 Key Management

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Key rotation | [Pass/Fail] | [Details] | [H/M/L] |
| Access logging | [Pass/Fail] | [Details] | [H/M/L] |
| Separation of duties | [Pass/Fail] | [Details] | [H/M/L] |
| Deletion protection | [Pass/Fail] | [Details] | [H/M/L] |

**Key Inventory:**
| Key ID | Purpose | Rotation | Access |
|--------|---------|----------|--------|
| [User data] | | | |

### 5.4 Data Classification

**Classification Policy:** [Exists/Partial/None]
**Data Tagging:** [Implemented/Partial/None]

| Classification Level | Data Types | Controls Applied |
|---------------------|------------|------------------|
| [User data] | | |

### 5.5 Sensitive Data Handling

| Data Type | Locations | Protection Controls | Gaps |
|-----------|-----------|--------------------|----|
| [User data] | | | |

### 5.6 Data Protection Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Data Protection Recommendations:**
1. [Highest priority]
2. [Second priority]
3. [Third priority]
```

### 7. Confirmation and Next Step

"**Data Protection Assessment Complete**

I've documented the data protection assessment including:
- Encryption at rest coverage
- Encryption in transit controls
- Key management practices
- Data classification approach
- Sensitive data handling

Next, we'll assess logging and monitoring.

Ready to proceed to logging and monitoring?"

## MENU

Display: **Data Protection Complete - Select an Option:** [C] Continue to Logging & Monitoring [R] Review/Revise Assessment

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 5 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN data protection assessment is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
