---
name: 'step-01-init'
description: 'Initialize network security assessment'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/network-assessment'
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-reconnaissance.md'
continueStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/security/network-assessment-{project_name}.md'
---

# Step 1: Network Security Assessment Initialization

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style

## CONTINUATION CHECK

IF {outputFile} exists: Load and execute {continueStepFile}
IF NOT: Continue with fresh initialization below

## INITIALIZATION SEQUENCE:

### 1. Assessment Welcome

"Welcome to the Network Security Assessment workflow. I'm Cipher, your network security specialist.

This comprehensive assessment covers:
- Network reconnaissance and discovery
- Port scanning and service enumeration
- Vulnerability identification
- Network service exploitation
- Wireless security (if applicable)
- Network segmentation testing
- Privilege escalation vectors

Let's define your assessment scope."

### 2. Network Information

"Please provide network details:

**Target Network(s):**
- IP ranges (CIDR notation)
- Excluded IPs/ranges
- Critical systems to handle carefully

**Environment:**
- Production / Staging / Lab
- Network type (Corporate, Cloud, Hybrid)
- Known network devices (firewalls, routers, switches)

**Access:**
- Testing position (internal/external)
- VPN access provided?
- Credentials for authenticated testing?

What's your target network?"

### 3. Assessment Scope

"What should we focus on?

**Testing Areas:**
- [ ] External perimeter testing
- [ ] Internal network assessment
- [ ] Wireless security
- [ ] Network segmentation
- [ ] VPN security
- [ ] Network device security
- [ ] Active Directory (if Windows environment)

**Constraints:**
- Aggressive scanning allowed?
- Exploitation authorized?
- Time windows/blackout periods?
- Notification requirements?

What's in scope?"

### 4. Rules of Engagement

"Let's clarify the rules of engagement:

**Authorization:**
- Written authorization obtained?
- Emergency contacts?
- Escalation procedures?

**Boundaries:**
- DoS/availability impact acceptable?
- Data exfiltration testing allowed?
- Social engineering combined?
- Physical access testing?

Please confirm your authorization level and boundaries."

### 5. Document Assessment Scope

Create {outputFile}:

```markdown
---
project_name: {project_name}
assessment_type: network-security-assessment
stepsCompleted: [1]
created_date: {current_date}
status: in_progress
---

# Network Security Assessment: {project_name}

## 1. Assessment Overview

### 1.1 Target Network
[Network ranges and details]

### 1.2 Assessment Scope
[Scope definition]

### 1.3 Rules of Engagement
[Authorization and boundaries]

### 1.4 Testing Methodology
PTES (Penetration Testing Execution Standard)
OWASP Testing Guide (for network services)

---

## 2. Reconnaissance
[Step 2]

## 3. Port Scanning & Enumeration
[Step 3]

## 4. Vulnerability Assessment
[Step 4]

## 5. Network Service Testing
[Step 5]

## 6. Wireless Security
[Step 6]

## 7. Segmentation Testing
[Step 7]

## 8. Findings & Remediation
[Step 8]
```

### 6. Confirmation

"**Scope Defined**

Ready to proceed to network reconnaissance?"

## MENU

Display: [C] Continue to Reconnaissance [R] Review/Revise Scope

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1]`, then execute {nextStepFile}.
