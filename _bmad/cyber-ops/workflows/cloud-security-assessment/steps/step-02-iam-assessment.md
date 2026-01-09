---

name: 'step-02-iam-assessment'
description: 'Review IAM policies, roles, service accounts, and least privilege implementation'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-02-iam-assessment.md'
nextStepFile: '{workflow_path}/steps/step-03-network-security.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'

---

# Step 2: IAM Security Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on IAM/identity security assessment
- FORBIDDEN to discuss network security yet
- Adapt questions based on cloud provider(s) in scope

## STEP GOAL:

To assess identity and access management security including IAM policies, roles, service accounts, privilege escalation risks, and least privilege implementation.

## IAM ASSESSMENT SEQUENCE:

### 1. Root/Admin Account Security

"Let's begin with your most privileged accounts:

**Root/Global Admin Security:**

| Check | AWS | Azure | GCP | Status |
|-------|-----|-------|-----|--------|
| MFA enabled on root | Root account | Global Admin | Org Admin | ? |
| Root usage monitoring | CloudTrail | Azure AD logs | Cloud Audit | ? |
| Root access keys | None exist | N/A | None exist | ? |
| Break-glass procedures | Documented | Documented | Documented | ? |

How are your root/global admin accounts secured?"

### 2. User and Group Management

"Let's review identity management:

**User Account Hygiene:**
- How many human users have cloud access?
- Are identities federated from IdP (Okta, Azure AD, Google)?
- How often are access reviews conducted?
- What's your offboarding process?

**Group-Based Access:**
- Are permissions assigned to groups vs individuals?
- How are group memberships managed?
- Are there nested groups creating hidden permissions?

What's your current identity management approach?"

### 3. Service Account/Role Analysis

"Let's examine non-human identities:

**Service Accounts / Service Principals / Service Accounts:**

| Provider | Type | Key Questions |
|----------|------|---------------|
| AWS | IAM Roles, Service Accounts | Cross-account roles? Instance profiles? |
| Azure | Service Principals, Managed Identities | App registrations? Secret management? |
| GCP | Service Accounts, Workload Identity | Key file usage? Impersonation? |

**Assessment Areas:**
- How many service accounts exist?
- Are there unused/orphaned service accounts?
- Are service account keys rotated?
- Are workload identities used where possible?

Tell me about your service account landscape."

### 4. Permission Analysis

"Let's analyze permission configurations:

**Overly Permissive Policies:**

| Risk Pattern | Description | Check Method |
|--------------|-------------|--------------|
| Wildcard resources | `Resource: "*"` | Policy review |
| Wildcard actions | `Action: "*"` | Policy review |
| Admin policies | AdministratorAccess, Owner | Policy attachment |
| Inline policies | Per-user custom policies | Console/CLI review |

**AWS Specific:**
- Any policies with `"Effect": "Allow", "Action": "*", "Resource": "*"`?
- S3 bucket policies allowing public access?
- Cross-account trust policies?

**Azure Specific:**
- Users with Owner/Contributor at subscription level?
- Custom RBAC roles?
- Privileged Identity Management (PIM) usage?

**GCP Specific:**
- Primitive roles (Owner, Editor) still in use?
- Custom roles defined?
- IAM conditions used?

What permission patterns concern you most?"

### 5. Privilege Escalation Paths

"Let's identify privilege escalation risks:

**Common Escalation Paths:**

| Provider | Risk | Example |
|----------|------|---------|
| AWS | PassRole abuse | Attaching admin role to Lambda |
| AWS | STS abuse | AssumeRole to higher privileges |
| Azure | Custom role creation | Creating Owner-equivalent role |
| GCP | setIamPolicy | Granting self more permissions |

**Questions:**
- Can regular users create IAM policies/roles?
- Can users attach policies to themselves?
- Are there paths from low-privilege to high-privilege?

Have you assessed privilege escalation paths?"

### 6. Document IAM Assessment

Update Section 3 of {outputFile}:

```markdown
## 3. IAM Security Assessment

### 3.1 Root/Admin Account Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Root MFA | [Pass/Fail] | [Details] | [H/M/L] |
| Root access keys | [Pass/Fail] | [Details] | [H/M/L] |
| Root usage alerts | [Pass/Fail] | [Details] | [H/M/L] |
| Break-glass documented | [Pass/Fail] | [Details] | [H/M/L] |

### 3.2 Identity Management

**Federation Status:** [Federated/Local/Hybrid]
**Identity Provider:** [IdP name]

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| SSO/Federation | [Pass/Fail] | [Details] | [H/M/L] |
| Access reviews | [Pass/Fail] | [Details] | [H/M/L] |
| Offboarding process | [Pass/Fail] | [Details] | [H/M/L] |
| Group-based access | [Pass/Fail] | [Details] | [H/M/L] |

### 3.3 Service Accounts

**Service Account Count:** [Number]

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Unused accounts | [Pass/Fail] | [Details] | [H/M/L] |
| Key rotation | [Pass/Fail] | [Details] | [H/M/L] |
| Workload identity | [Pass/Fail] | [Details] | [H/M/L] |
| Least privilege | [Pass/Fail] | [Details] | [H/M/L] |

### 3.4 Permission Analysis

| Finding | Severity | Affected Resources | Recommendation |
|---------|----------|-------------------|----------------|
| [User data] | | | |

### 3.5 Privilege Escalation Risks

| Risk Path | Status | Impact | Mitigation |
|-----------|--------|--------|------------|
| [User data] | | | |

### 3.6 IAM Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top IAM Recommendations:**
1. [Highest priority]
2. [Second priority]
3. [Third priority]
```

### 7. Confirmation and Next Step

"**IAM Assessment Complete**

I've documented the IAM security assessment including:
- Root/admin account security
- Identity management practices
- Service account analysis
- Permission review
- Privilege escalation assessment

Next, we'll assess network security controls.

Ready to proceed to network security?"

## MENU

Display: **IAM Assessment Complete - Select an Option:** [C] Continue to Network Security [R] Review/Revise Assessment

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 3 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN IAM assessment is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
