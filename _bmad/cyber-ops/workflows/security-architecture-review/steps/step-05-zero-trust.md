---

name: 'step-05-zero-trust'
description: 'Validate architecture alignment with zero-trust security principles'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-architecture-review'

# File References

thisStepFile: '{workflow_path}/steps/step-05-zero-trust.md'
nextStepFile: '{workflow_path}/steps/step-06-recommendations.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{output_folder}/planning/architecture/security-review-{project_name}.md'

---

# Step 5: Zero-Trust Validation

## STEP GOAL:

To validate the architecture against zero-trust security principles, identify where the architecture relies on implicit trust, and assess maturity toward a "never trust, always verify" security model.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Architect (Bastion persona) specializing in zero-trust architecture
- ✅ If you already have been given a name, communication_style and identity, continue to use those while playing this role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in zero-trust principles, microsegmentation, and identity-centric security
- ✅ User brings architecture knowledge and implementation constraints
- ✅ Together we assess zero-trust maturity and identify trust boundaries
- ✅ Maintain collaborative, analytical, forward-looking tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on zero-trust principle validation
- 🚫 FORBIDDEN to jump ahead to recommendations (that's Step 6)
- 💬 Approach: Validate against each principle, identify implicit trust, assess maturity
- 📋 Reference NIST SP 800-207 (Zero Trust Architecture) where applicable

## EXECUTION PROTOCOLS:

- 🎯 Assess architecture against 7 core zero-trust principles
- 💾 Document zero-trust assessment in new section before Section 5 (Risk Matrix)
- 📖 Update frontmatter `stepsCompleted` to include 5 before loading next step
- 🚫 FORBIDDEN to recommend specific controls here (that's Step 6)

## CONTEXT BOUNDARIES:

- Available context: Architecture, threats, controls, attack surface analysis
- Focus: Validate zero-trust alignment and identify implicit trust
- Limits: Don't assume zero-trust implementation without user confirmation
- Dependencies: Benefits from understanding existing controls

## ZERO-TRUST VALIDATION SEQUENCE:

### 1. Initialize Zero-Trust Validation

"**Zero-Trust Architecture Validation**

Zero-trust security is based on \"never trust, always verify\" - assuming breach and verifying every access request regardless of location. Let's validate your architecture against zero-trust principles to identify where you rely on implicit trust.

**7 Core Zero-Trust Principles (NIST SP 800-207):**

1. **Verify Explicitly** - Always authenticate and authorize based on all available data points
2. **Least Privilege Access** - Limit user access with Just-In-Time and Just-Enough-Access (JIT/JEA)
3. **Assume Breach** - Minimize blast radius and segment access
4. **Inspect and Log Everything** - Comprehensive monitoring, logging, and analytics
5. **Device Security** - Secure and monitor all devices accessing resources
6. **Network Segmentation** - Micro-segmentation and Zero Trust Network Access (ZTNA)
7. **Continuous Verification** - Constantly reevaluate trust based on user, device, and context

We'll assess each principle for your architecture."

### 2. Principle 1: Verify Explicitly

"**Principle 1: Verify Explicitly**

Zero-trust requires explicit verification for every access request using all available data.

**Assessment Questions:**

1. **Authentication Everywhere**: Is authentication required for all components (not just perimeter)?
2. **Multi-Factor Authentication**: Where is MFA enforced? Are there exceptions?
3. **Contextual Access Control**: Do you use device health, location, risk score in access decisions?
4. **Service-to-Service Authentication**: Do backend services authenticate to each other, or trust internal network?
5. **Continuous Authentication**: Are sessions re-verified, or is authentication one-time at login?

**Common Gaps:**
- Internal services trust network location (no authentication)
- MFA only at perimeter, not for internal resource access
- No device posture checks before granting access
- Long-lived sessions without re-verification

**Your Architecture:**

For each component, how is explicit verification implemented? Where do you rely on implicit trust (e.g., \"it came from internal network so it's trusted\")?"

[Collect user responses]

### 3. Principle 2: Least Privilege Access

"**Principle 2: Least Privilege Access**

Users and services should have minimum necessary permissions for their function.

**Assessment Questions:**

1. **Role-Based Access Control (RBAC)**: Are permissions role-based with minimal privileges?
2. **Just-In-Time Access (JIT)**: Can you grant temporary elevated access that expires?
3. **Just-Enough-Access (JEA)**: Are permissions scoped to specific resources, not broad?
4. **Default Deny**: Is default policy deny-all with explicit allows?
5. **Permission Reviews**: Are access permissions regularly reviewed and pruned?

**Common Gaps:**
- Users have more permissions than needed \"just in case\"
- Service accounts with overly broad permissions
- Long-lived credentials instead of temporary
- No regular access reviews

**Your Architecture:**

How is least privilege enforced? Are there users/services with excessive permissions?"

[Collect user responses]

### 4. Principle 3: Assume Breach

"**Principle 3: Assume Breach**

Design assumes attackers are already inside the network; limit lateral movement and blast radius.

**Assessment Questions:**

1. **Microsegmentation**: Are workloads segmented so compromise of one doesn't give access to all?
2. **Lateral Movement Prevention**: Can an attacker who compromises one service easily access others?
3. **Blast Radius Containment**: If a component is compromised, what's the maximum damage?
4. **Internal TLS/Encryption**: Is traffic encrypted internally, not just at perimeter?
5. **Least Privilege Network**: Do firewall rules allow only necessary flows, not broad network access?

**Common Gaps:**
- Flat network where all services can reach all others
- No encryption for internal traffic (only external)
- Single compromise leads to full environment access
- Overly permissive firewall rules

**Your Architecture:**

If I compromise [pick a component], what can I access? How is lateral movement restricted?"

[Collect user responses]

### 5. Principle 4: Inspect and Log Everything

"**Principle 4: Inspect and Log Everything**

Comprehensive visibility into all access, data flows, and user activity.

**Assessment Questions:**

1. **Comprehensive Logging**: Are all authentication, authorization, and data access events logged?
2. **Centralized Logging**: Are logs aggregated centrally and protected from tampering?
3. **Real-Time Monitoring**: Are suspicious activities detected in real-time?
4. **Traffic Inspection**: Is internal traffic inspected (not just trusted because it's internal)?
5. **User and Entity Behavior Analytics (UEBA)**: Do you detect anomalous behavior patterns?

**Common Gaps:**
- Incomplete logging (missing authorization decisions, data access)
- Logs stored locally (attacker can delete)
- No real-time alerting on suspicious activity
- Internal traffic not inspected (encrypted tunnels hide attacks)

**Your Architecture:**

What's logged? How quickly would you detect an ongoing attack? Can you reconstruct what an attacker did?"

[Collect user responses]

### 6. Principle 5: Device Security

"**Principle 5: Device Security**

All devices accessing resources must be secure and monitored.

**Assessment Questions:**

1. **Device Inventory**: Do you maintain inventory of all devices accessing resources?
2. **Device Health Checks**: Are devices verified as compliant before granting access (patched, antivirus, encrypted)?
3. **BYOD Policy**: How are personal devices secured if accessing company resources?
4. **Mobile Device Management (MDM)**: Are mobile devices managed and monitored?
5. **Device-Based Conditional Access**: Can you block access from non-compliant devices?

**Common Gaps:**
- No device health verification before granting access
- BYOD devices accessing resources without security controls
- No visibility into device posture
- Mobile devices not managed

**Your Architecture:**

How do you verify device security before granting access? Can unmanaged/unpatched devices access resources?"

[Collect user responses]

### 7. Principle 6: Network Segmentation

"**Principle 6: Network Segmentation (Microsegmentation)**

Network segmented into small zones with granular access controls.

**Assessment Questions:**

1. **Microsegmentation**: Are workloads segmented beyond traditional network perimeter?
2. **Zero Trust Network Access (ZTNA)**: Do you use identity-based access instead of network location?
3. **Software-Defined Perimeter (SDP)**: Are resources hidden until user authenticates?
4. **East-West Traffic Controls**: Are there firewalls/controls between internal services, not just north-south?
5. **Network Location Irrelevance**: Is access granted based on identity, not network location?

**Common Gaps:**
- Perimeter-based security (once inside, everything accessible)
- VPN gives broad network access instead of specific resources
- No segmentation between internal services
- Network location used as security control (\"internal network is trusted\")

**Your Architecture:**

Is network location used to determine trust? What segmentation exists between components?"

[Collect user responses]

### 8. Principle 7: Continuous Verification

"**Principle 7: Continuous Verification**

Trust is never static; continuously reevaluate and adapt based on risk signals.

**Assessment Questions:**

1. **Continuous Assessment**: Are access decisions continuously reevaluated, not just at login?
2. **Risk-Based Authentication**: Does authentication strength adapt based on risk (location, behavior, resource sensitivity)?
3. **Anomaly Detection**: Are abnormal behaviors detected and access restricted?
4. **Session Management**: Are sessions short-lived and revocable?
5. **Dynamic Policy Updates**: Can policies be updated in real-time based on threat intelligence?

**Common Gaps:**
- Authentication only at login, then unlimited session duration
- No re-verification when accessing sensitive resources
- Unable to revoke access in real-time
- Static policies that don't adapt to risk

**Your Architecture:**

How often is trust reverified? Can you revoke access dynamically if risk increases?"

[Collect user responses]

### 9. Zero-Trust Maturity Assessment

"**Zero-Trust Maturity Assessment**

Based on your responses, let's assess maturity for each principle:

**Maturity Levels:**
- **Level 1 - Traditional**: Perimeter-based security, implicit trust inside network
- **Level 2 - Initial**: Some zero-trust concepts (MFA, basic segmentation)
- **Level 3 - Advanced**: Strong zero-trust implementation across multiple principles
- **Level 4 - Optimal**: Comprehensive zero-trust with continuous verification and automation

I'll assess maturity for each principle based on what you've described..."

### 10. Document Zero-Trust Assessment

Insert new section in {outputFile} after Section 4 (before Risk Matrix section):

```markdown
## 4b. Zero-Trust Architecture Validation

**Reference Framework:** NIST SP 800-207 - Zero Trust Architecture

---

### Principle-by-Principle Assessment

#### 1. Verify Explicitly

**Current State:**
[Describe how explicit verification is implemented or lacking]

**Maturity Level:** [Level 1-4]

**Gaps:**
- [Gap 1]
- [Gap 2]

**Implicit Trust Identified:**
[Where architecture relies on implicit trust instead of explicit verification]

---

#### 2. Least Privilege Access

**Current State:**
[Describe least privilege implementation]

**Maturity Level:** [Level 1-4]

**Gaps:**
- [Gap 1]
- [Gap 2]

**Excessive Permissions:**
[Users/services with more access than needed]

---

#### 3. Assume Breach

**Current State:**
[Describe breach assumption and containment measures]

**Maturity Level:** [Level 1-4]

**Gaps:**
- [Gap 1]
- [Gap 2]

**Blast Radius Analysis:**
[If component X is compromised, attacker can access: ...]

---

#### 4. Inspect and Log Everything

**Current State:**
[Describe logging and monitoring coverage]

**Maturity Level:** [Level 1-4]

**Gaps:**
- [Gap 1]
- [Gap 2]

**Visibility Gaps:**
[What's not logged or monitored]

---

#### 5. Device Security

**Current State:**
[Describe device security controls]

**Maturity Level:** [Level 1-4]

**Gaps:**
- [Gap 1]
- [Gap 2]

**Unmanaged Devices:**
[Devices that can access resources without security validation]

---

#### 6. Network Segmentation

**Current State:**
[Describe segmentation architecture]

**Maturity Level:** [Level 1-4]

**Gaps:**
- [Gap 1]
- [Gap 2]

**Trust Boundaries:**
[Where network location is used as security control]

---

#### 7. Continuous Verification

**Current State:**
[Describe continuous verification mechanisms]

**Maturity Level:** [Level 1-4]

**Gaps:**
- [Gap 1]
- [Gap 2]

**Static Trust Issues:**
[Where trust is granted once and not reverified]

---

### Overall Zero-Trust Maturity

**Maturity Score:** [Average or weighted score]

**Summary:**
[2-3 sentences on overall zero-trust posture]

**Top 5 Zero-Trust Priorities:**
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]
4. [Priority 4]
5. [Priority 5]

---
```

Update frontmatter in {outputFile}:
- Add 5 to `stepsCompleted` array: `stepsCompleted: [1, 2, 3, 4, 5]`
- Set `lastStep: 'zero-trust'`
- Add `zeroTrustMaturity: [calculated level]`

### 11. Present MENU OPTIONS

Display: **Select an Option:** [C] Continue to Recommendations

#### Menu Handling Logic:

- IF C: Save zero-trust assessment to {outputFile}, update frontmatter `stepsCompleted: [1, 2, 3, 4, 5]`, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#11-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu options

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN 'C' is selected AND zero-trust validation is complete across all 7 principles AND documented in Section 4b of {outputFile}, will you then:

1. Update frontmatter in {outputFile}: `stepsCompleted: [1, 2, 3, 4, 5]`, `lastStep: 'zero-trust'`
2. Load, read entire file, then execute {nextStepFile} to begin recommendations and remediation

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All 7 zero-trust principles assessed
- Maturity level assigned for each principle
- Implicit trust boundaries identified
- Gaps documented for each principle
- Overall maturity score calculated
- Top priorities for zero-trust improvement identified
- Zero-trust assessment documented in Section 4b
- User validated assessment completeness
- Frontmatter updated with step 5 completion

### ❌ SYSTEM FAILURE:

- Skipping zero-trust principles
- Not identifying implicit trust boundaries
- Generic assessment without specific gaps
- Missing maturity level assignments
- Not documenting assessment in output file
- Proceeding without user validation
- Not updating frontmatter before loading next step

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
