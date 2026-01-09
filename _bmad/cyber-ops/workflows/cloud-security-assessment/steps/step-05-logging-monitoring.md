---

name: 'step-05-logging-monitoring'
description: 'Assess CloudTrail/Activity Logs, SIEM integration, and alerting configuration'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-05-logging-monitoring.md'
nextStepFile: '{workflow_path}/steps/step-06-compute-security.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'

---

# Step 5: Logging & Monitoring Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on logging and monitoring assessment
- FORBIDDEN to discuss compute security yet

## STEP GOAL:

To assess logging and monitoring capabilities including cloud-native audit logs, SIEM integration, security alerting, and incident detection.

## LOGGING & MONITORING SEQUENCE:

### 1. Cloud Audit Logging

"Let's assess audit logging:

**Cloud Audit Services:**

| Provider | Service | Key Settings |
|----------|---------|--------------|
| AWS | CloudTrail | Multi-region, org trail, S3 integrity |
| Azure | Activity Log | Subscription-wide, diagnostic settings |
| GCP | Cloud Audit Logs | Admin, Data Access, System Event |

**CloudTrail/Activity Log Assessment:**

| Control | Best Practice | Status |
|---------|---------------|--------|
| Enabled all regions | Multi-region trail | ? |
| Management events | All read/write | ? |
| Data events | S3/Lambda/DynamoDB | ? |
| Log integrity | Validation enabled | ? |
| Secure storage | Encrypted, immutable | ? |
| Retention | Minimum 90 days, ideally 1 year | ? |

Is audit logging comprehensively configured?"

### 2. Service-Level Logging

"Let's review service-level logs:

**Service Logs:**

| Service Type | Log Type | Status |
|--------------|----------|--------|
| Load Balancers | Access logs | ? |
| WAF | Request logs | ? |
| VPC | Flow logs | ? |
| DNS | Query logs | ? |
| Databases | Audit/slow query logs | ? |
| Lambda/Functions | Execution logs | ? |
| API Gateway | Access logs | ? |
| S3/Storage | Access logs | ? |

**Questions:**
- Which service logs are enabled?
- Where are logs stored?
- What's the retention period?
- Are there gaps in logging coverage?

What service-level logging is in place?"

### 3. SIEM Integration

"Let's assess SIEM integration:

**SIEM/Security Analytics:**

| Aspect | Question | Answer |
|--------|----------|--------|
| Platform | What SIEM is used? (Splunk, Sentinel, etc.) | ? |
| Ingestion | Are cloud logs ingested? | ? |
| Coverage | Which log sources? | ? |
| Latency | Real-time or batched? | ? |
| Correlation | Cross-cloud correlation? | ? |

**Cloud-Native Security Services:**

| Provider | Service | Enabled |
|----------|---------|---------|
| AWS | GuardDuty | ? |
| AWS | Security Hub | ? |
| Azure | Microsoft Defender for Cloud | ? |
| Azure | Microsoft Sentinel | ? |
| GCP | Security Command Center | ? |
| GCP | Chronicle | ? |

How are logs aggregated and analyzed?"

### 4. Security Alerting

"Let's review alerting configuration:

**Alert Categories:**

| Category | Examples | Alerting |
|----------|----------|----------|
| Auth failures | Root login, failed MFA | ? |
| Privilege escalation | IAM policy changes | ? |
| Resource exposure | Security group changes, S3 public | ? |
| Suspicious activity | Unusual API calls, new regions | ? |
| Data exfiltration | Large downloads, S3 access | ? |

**Alerting Infrastructure:**

| Control | Status | Details |
|---------|--------|---------|
| Alert rules defined | ? | [Count] |
| Alert destinations | ? | [Email, Slack, PagerDuty] |
| Escalation process | ? | [Defined/Not defined] |
| Alert fatigue management | ? | [Tuning approach] |
| Response procedures | ? | [Documented/Not] |

What security alerts are configured?"

### 5. Log Protection

"Let's verify log security:

**Log Protection Controls:**

| Control | Purpose | Status |
|---------|---------|--------|
| Encryption | Logs encrypted at rest | ? |
| Access control | Limited admin access | ? |
| Immutability | Cannot be modified/deleted | ? |
| Cross-account | Logs in separate account | ? |
| Retention lock | Enforced retention | ? |

Are logs protected from tampering?"

### 6. Document Logging Assessment

Update Section 6 of {outputFile}:

```markdown
## 6. Logging & Monitoring Assessment

### 6.1 Cloud Audit Logging

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Multi-region enabled | [Pass/Fail] | [Details] | [H/M/L] |
| Management events | [Pass/Fail] | [Details] | [H/M/L] |
| Data events | [Pass/Fail] | [Details] | [H/M/L] |
| Log integrity | [Pass/Fail] | [Details] | [H/M/L] |
| Secure storage | [Pass/Fail] | [Details] | [H/M/L] |
| Retention | [Details] | [Finding] | [H/M/L] |

### 6.2 Service-Level Logging

| Service | Log Type | Enabled | Retention | SIEM Integrated |
|---------|----------|---------|-----------|-----------------|
| [User data] | | | | |

**Logging Gaps:**
[Services without logging]

### 6.3 SIEM Integration

**SIEM Platform:** [Platform name]
**Cloud Log Sources Integrated:** [Count/list]

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Log ingestion | [Pass/Fail] | [Details] | [H/M/L] |
| Real-time processing | [Pass/Fail] | [Details] | [H/M/L] |
| Cross-cloud correlation | [Pass/Fail] | [Details] | [H/M/L] |

**Cloud-Native Security Tools:**
| Tool | Status | Findings Integration |
|------|--------|---------------------|
| [User data] | | |

### 6.4 Security Alerting

| Alert Category | Rules Defined | Destination | Response Procedure |
|----------------|---------------|-------------|-------------------|
| [User data] | | | |

**Missing Alert Categories:**
[Critical alerts not configured]

### 6.5 Log Protection

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Encryption | [Pass/Fail] | [Details] | [H/M/L] |
| Access control | [Pass/Fail] | [Details] | [H/M/L] |
| Immutability | [Pass/Fail] | [Details] | [H/M/L] |
| Cross-account storage | [Pass/Fail] | [Details] | [H/M/L] |

### 6.6 Logging Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Logging Recommendations:**
1. [Highest priority]
2. [Second priority]
3. [Third priority]
```

### 7. Confirmation and Next Step

"**Logging & Monitoring Assessment Complete**

I've documented:
- Cloud audit logging configuration
- Service-level logging coverage
- SIEM integration status
- Security alerting rules
- Log protection controls

Next, we'll assess compute security.

Ready to proceed to compute security?"

## MENU

Display: **Logging Assessment Complete - Select an Option:** [C] Continue to Compute Security [R] Review/Revise Assessment

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 6 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN logging assessment is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
