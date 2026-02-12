# Cybersecurity Workflow Examples

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Module:** cybersec-team
> **Agents:** 15 specialized security professionals

---

## Overview

This guide provides detailed walkthrough examples for the most commonly used cybersecurity workflows. Each example includes realistic scenarios, sample inputs, expected outputs, and best practices.

---

## Example 1: Incident Response Playbook

### Scenario

Your SOC has detected unusual data exfiltration patterns from a production database server. Initial triage suggests potential compromise.

### Invocation

```
/bmad:cybersec-team:workflows:incident-response-playbook
```

### Workflow Steps

**Step 1: Incident Classification**

```
User Input: "Potential data exfiltration from prod-db-01. Anomalous outbound
traffic to external IP 203.0.113.45. ~500GB transferred over 48 hours."

Phoenix (Incident Commander) classifies as:
- Incident Type: Data Exfiltration
- Severity: HIGH (production data, significant volume)
- NIST Phase: Detection & Analysis
```

**Step 2: Initial Containment**

```
Phoenix coordinates immediate actions:
- [ ] Isolate prod-db-01 from network (preserve running state)
- [ ] Block outbound traffic to 203.0.113.45 at firewall
- [ ] Capture volatile memory before any changes
- [ ] Preserve logs: database, OS, network, authentication
- [ ] Identify scope: other systems communicating with external IP?
```

**Step 3: Evidence Collection**

```
Trace (Forensic Investigator) guides evidence preservation:
- Memory acquisition using winpmem/LiME
- Disk image with write-blocker (dd or FTK Imager)
- Network captures (pcap) from span port
- Authentication logs (AD, database)
- Chain of custody documentation initiated
```

**Step 4: Analysis Phase**

```
Cipher (Threat Analyst) performs:
- IOC extraction from memory and disk
- Malware triage (any persistence mechanisms?)
- MITRE ATT&CK mapping:
  * T1048 - Exfiltration Over Alternative Protocol
  * T1071 - Application Layer Protocol
  * T1567 - Exfiltration Over Web Service
- Timeline reconstruction
```

**Step 5: Eradication & Recovery**

```
Phoenix coordinates:
- Remove persistence mechanisms
- Patch exploitation vector
- Credential rotation (all database accounts)
- Rebuild from known-good backup if needed
- Validate integrity before reconnection
```

### Sample Output: Incident Report

```markdown
# INCIDENT REPORT: IR-2026-0042

## Executive Summary
On 2026-01-14, SOC detected anomalous data exfiltration from prod-db-01
to external IP 203.0.113.45. Investigation revealed compromised service
account credentials used to stage and exfiltrate customer data.

## Timeline
- 2026-01-12 03:14 UTC - Initial access via exposed API endpoint
- 2026-01-12 04:22 UTC - Privilege escalation to db_admin account
- 2026-01-12 - 2026-01-14 - Staged exfiltration (12 sessions, ~500GB)
- 2026-01-14 15:30 UTC - SOC alert triggered
- 2026-01-14 15:45 UTC - Containment initiated

## Impact Assessment
- Data Affected: Customer PII (estimated 2.3M records)
- Systems Affected: prod-db-01, staging-api-gateway
- Business Impact: HIGH - Regulatory notification required

## Root Cause
Exposed debug endpoint in API gateway allowed authentication bypass.
Combined with weak service account password (unchanged for 18 months).

## Recommendations
1. Immediate: Rotate all service account credentials
2. Short-term: Implement API gateway security review
3. Long-term: Deploy database activity monitoring (DAM)

## Regulatory Notifications
- GDPR: 72-hour notification required (Customer PII)
- State breach notification: Per jurisdiction requirements
```

---

## Example 2: Threat Modeling (STRIDE)

### Scenario

You're designing a new payment processing microservice and need to identify security threats before implementation.

### Invocation

```
/bmad:cybersec-team:workflows:threat-modeling
```

### Workflow Steps

**Step 1: System Description**

```
User Input: "New payment processing service. Accepts credit card data
from mobile app, tokenizes with Stripe, stores transaction metadata in
PostgreSQL, sends webhooks to merchant systems."

Bastion (Security Architect) confirms scope:
- Components: Mobile App → API Gateway → Payment Service → Stripe API
- Data flows: Card data, tokens, transaction metadata, webhooks
- Trust boundaries: Mobile (untrusted), Internal services, External (Stripe)
```

**Step 2: STRIDE Analysis**

```
Bastion applies STRIDE to each component:

┌─────────────────────────────────────────────────────────────────────┐
│ COMPONENT: API Gateway                                              │
├─────────┬───────────────────────────────────────────────────────────┤
│ Spoofing │ Attacker impersonates mobile app                        │
│          │ → Mitigation: mTLS, API key rotation, device binding    │
├─────────┼───────────────────────────────────────────────────────────┤
│ Tampering│ Request modification in transit                         │
│          │ → Mitigation: TLS 1.3, request signing, integrity checks│
├─────────┼───────────────────────────────────────────────────────────┤
│ Repudiation │ User denies making transaction                       │
│          │ → Mitigation: Audit logging, transaction receipts       │
├─────────┼───────────────────────────────────────────────────────────┤
│ Info     │ Card data exposure in logs/errors                       │
│ Disclosure│ → Mitigation: PCI DSS logging, data masking           │
├─────────┼───────────────────────────────────────────────────────────┤
│ Denial   │ API flooding, resource exhaustion                       │
│ of Service│ → Mitigation: Rate limiting, WAF, circuit breakers    │
├─────────┼───────────────────────────────────────────────────────────┤
│ Elevation│ Bypass authorization to access other users' data        │
│ of Priv  │ → Mitigation: IDOR checks, attribute-based access ctrl │
└─────────┴───────────────────────────────────────────────────────────┘
```

**Step 3: Data Flow Diagram Threat Analysis**

```
Bastion identifies threats at each boundary crossing:

[Mobile App] ──DFD1──> [API Gateway] ──DFD2──> [Payment Service]
                                                      │
                                              ──DFD3──> [Stripe API]
                                                      │
                                              ──DFD4──> [PostgreSQL]
                                                      │
                                              ──DFD5──> [Webhook Target]

DFD1 Threats: Credential theft, session hijacking, MITM
DFD2 Threats: Injection, authorization bypass, logic flaws
DFD3 Threats: API key exposure, response manipulation
DFD4 Threats: SQL injection, data breach, backup exposure
DFD5 Threats: Webhook spoofing, replay attacks, SSRF
```

**Step 4: Risk Prioritization**

```
High Priority (Must fix before launch):
1. Card data in logs (PCI DSS violation)
2. Missing rate limiting (availability risk)
3. IDOR vulnerability in transaction lookup

Medium Priority (Address within 30 days):
4. Webhook signature validation
5. Audit log completeness
6. Error message information disclosure

Low Priority (Track for future):
7. Advanced device fingerprinting
8. Behavioral analytics
```

### Sample Output: Threat Model Document

```markdown
# THREAT MODEL: Payment Processing Service v1.0

## System Overview
[Architecture diagram placeholder]

## Trust Boundaries
1. Internet → API Gateway (TLS termination)
2. API Gateway → Internal Services (mTLS)
3. Internal → External APIs (Stripe, webhooks)

## STRIDE Analysis Summary
| Component | S | T | R | I | D | E | Total Threats |
|-----------|---|---|---|---|---|---|---------------|
| API Gateway | 3 | 2 | 2 | 3 | 2 | 2 | 14 |
| Payment Service | 1 | 3 | 2 | 4 | 1 | 3 | 14 |
| Database | 1 | 2 | 1 | 4 | 2 | 2 | 12 |
| **Total** | **5** | **7** | **5** | **11** | **5** | **7** | **40** |

## High-Priority Mitigations
1. **Implement structured logging** - Exclude card data, mask PII
2. **Deploy rate limiting** - 100 req/min per user, 1000 req/min per IP
3. **Add IDOR checks** - Verify user ownership for all transaction lookups

## Security Requirements (Derived)
- SR-001: All card data must be tokenized before logging
- SR-002: Rate limiting must be enforced at gateway level
- SR-003: All API endpoints must validate user authorization
- [Continue for all identified controls...]

## Residual Risks
- Advanced persistent threats (APT) - Accept with monitoring
- Zero-day in Stripe API - Accept (vendor responsibility)
```

---

## Example 3: Penetration Testing (Web Application)

### Scenario

Pre-launch security assessment for a new SaaS application before going to production.

### Invocation

```
/bmad:cybersec-team:workflows:web-app-security-testing
```

### Workflow Steps

**Step 1: Scope Definition**

```
User Input: "SaaS HR application. Test environment at
https://staging.hrapp.example.com. Credentials provided.
Focus on OWASP Top 10. Exclude production systems."

Ghost (Penetration Tester) confirms:
- Target: staging.hrapp.example.com
- Scope: Full application + API endpoints
- Out of scope: Production, third-party integrations
- Authorization: Written permission documented
```

**Step 2: Reconnaissance**

```
Ghost performs:
- Technology fingerprinting: React frontend, Node.js backend, PostgreSQL
- Endpoint enumeration: 47 API endpoints discovered
- Authentication flows: OAuth2 + session cookies
- Input vectors: 23 forms, 12 file upload points, 8 search functions
```

**Step 3: Vulnerability Assessment**

```
Ghost tests OWASP Top 10:

┌──────────────────────────────────────────────────────────────────────┐
│ OWASP Top 10 Assessment Results                                     │
├───────────────────┬────────────────────────────────────────────────┬─┤
│ Category          │ Finding                                        │S│
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A01:2021 Broken   │ IDOR in /api/employees/{id}/documents         │H│
│ Access Control    │ Any user can access other users' documents     │ │
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A02:2021 Crypto   │ Password hashes use MD5 (deprecated)          │H│
│ Failures          │ Session tokens have insufficient entropy       │M│
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A03:2021 Injection│ SQL injection in /api/reports/custom          │C│
│                   │ XSS in employee notes field (stored)           │H│
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A04:2021 Insecure │ Default admin:admin credentials work          │C│
│ Design            │ No account lockout after failed attempts       │M│
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A05:2021 Security │ Verbose error messages expose stack traces    │M│
│ Misconfiguration  │ Directory listing enabled on /uploads          │M│
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A06:2021 Vuln     │ Node.js outdated (known CVEs)                 │H│
│ Components        │ React 16.x with known XSS vulnerabilities      │M│
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A07:2021 Auth     │ Password reset token valid indefinitely        │H│
│ Failures          │ Session doesn't invalidate on logout           │M│
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A08:2021 Integrity│ No SRI for CDN scripts                        │L│
│ Failures          │ Unsigned npm packages in use                   │M│
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A09:2021 Logging  │ No security event logging implemented         │M│
│ & Monitoring      │ Failed login attempts not recorded             │M│
├───────────────────┼────────────────────────────────────────────────┼─┤
│ A10:2021 SSRF     │ Profile image URL fetcher vulnerable          │H│
│                   │ Internal network accessible via image proxy    │ │
└───────────────────┴────────────────────────────────────────────────┴─┘

Severity: C=Critical, H=High, M=Medium, L=Low
```

**Step 4: Exploitation (Proof of Concept)**

```
Ghost demonstrates impact:

Critical Finding: SQL Injection
Endpoint: POST /api/reports/custom
Payload: {"query": "' UNION SELECT username,password,email FROM users--"}
Impact: Full database access including PII and credentials

Critical Finding: IDOR Document Access
Original: GET /api/employees/42/documents/1
Modified: GET /api/employees/1/documents/1 (admin's documents)
Impact: Access to any employee's confidential documents
```

### Sample Output: Penetration Test Report

```markdown
# PENETRATION TEST REPORT
## Application: HR SaaS Platform (Staging)

### Executive Summary
Testing identified **2 Critical**, **6 High**, **8 Medium**, and
**2 Low** severity vulnerabilities. The application is **NOT ready
for production** in its current state. Critical SQL injection and
access control flaws allow complete compromise.

### Critical Findings (Require Immediate Remediation)

#### CRIT-001: SQL Injection in Custom Reports
- **Location**: POST /api/reports/custom
- **CVSS**: 9.8 (Critical)
- **Evidence**: [Screenshot of extracted credentials]
- **Remediation**: Use parameterized queries exclusively

#### CRIT-002: Default Administrator Credentials
- **Location**: Admin login (/admin)
- **CVSS**: 9.1 (Critical)
- **Evidence**: Logged in with admin:admin
- **Remediation**: Force password change on first login

### High Severity Findings
[Detailed findings with evidence and remediation...]

### Remediation Priority
1. **Immediate (Before Production)**: CRIT-001, CRIT-002, HIGH-001-003
2. **Within 30 Days**: HIGH-004-006, MED-001-004
3. **Within 90 Days**: MED-005-008, LOW-001-002

### Methodology
Testing performed per OWASP Testing Guide v4.2 and PTES.
Tools: Burp Suite Pro, SQLMap, Nikto, custom scripts.

### Appendices
- A: Full vulnerability details
- B: Evidence screenshots
- C: Remediation guidance
- D: Retest requirements
```

---

## Example 4: Compliance Audit Preparation

### Scenario

Preparing for SOC 2 Type II audit scheduled in 3 months.

### Invocation

```
/bmad:cybersec-team:workflows:compliance-audit-prep
```

### Workflow Steps

**Step 1: Framework Selection**

```
User Input: "SOC 2 Type II audit in 90 days. First-time audit.
SaaS product with customer data. AWS infrastructure."

Sentinel (Compliance Guardian) confirms:
- Framework: SOC 2 Type II
- Trust Service Criteria: Security, Availability, Confidentiality
- Audit period: 6 months (to be established)
```

**Step 2: Gap Assessment**

```
Sentinel assesses current state against SOC 2 criteria:

┌────────────────────────────────────────────────────────────────────┐
│ SOC 2 READINESS ASSESSMENT                                         │
├───────────────────┬──────────┬──────────┬──────────────────────────┤
│ Control Area      │ Required │ In Place │ Gap                      │
├───────────────────┼──────────┼──────────┼──────────────────────────┤
│ CC1: Control Env  │ 5        │ 2        │ 3 controls missing       │
│ CC2: Communication│ 3        │ 1        │ 2 controls missing       │
│ CC3: Risk Assess  │ 4        │ 2        │ 2 controls missing       │
│ CC4: Monitoring   │ 3        │ 0        │ 3 controls missing       │
│ CC5: Control Acts │ 4        │ 3        │ 1 control missing        │
│ CC6: Logical/Phys │ 8        │ 5        │ 3 controls missing       │
│ CC7: System Ops   │ 4        │ 2        │ 2 controls missing       │
│ CC8: Change Mgmt  │ 3        │ 2        │ 1 control missing        │
│ CC9: Risk Mitigat │ 2        │ 1        │ 1 control missing        │
├───────────────────┼──────────┼──────────┼──────────────────────────┤
│ TOTAL             │ 36       │ 18       │ 18 gaps (50% ready)      │
└───────────────────┴──────────┴──────────┴──────────────────────────┘
```

**Step 3: Evidence Collection Roadmap**

```
Sentinel creates evidence requirements:

Week 1-4: Establish foundational controls
- [ ] Document security policies (InfoSec, Acceptable Use, SDLC)
- [ ] Implement change management process
- [ ] Configure centralized logging (CloudWatch → SIEM)
- [ ] Deploy vulnerability scanning (weekly schedule)

Week 5-8: Build evidence trail
- [ ] Start collecting access review evidence (monthly reviews)
- [ ] Document incident response procedures
- [ ] Implement background check process
- [ ] Configure automated compliance monitoring

Week 9-12: Audit preparation
- [ ] Compile evidence packages per control
- [ ] Conduct internal audit / readiness assessment
- [ ] Address findings from internal review
- [ ] Prepare audit logistics (access, contacts, schedules)
```

### Sample Output: Audit Readiness Checklist

```markdown
# SOC 2 TYPE II AUDIT READINESS CHECKLIST

## Pre-Audit Tasks (Complete by Day -30)

### Documentation Ready
- [ ] Security policies approved by management
- [ ] Organizational chart with security responsibilities
- [ ] Risk assessment documented and current
- [ ] Vendor management policy and assessments

### Technical Controls
- [ ] MFA enabled for all users (evidence of 100% adoption)
- [ ] Encryption at rest and in transit (certificates, configs)
- [ ] Access reviews completed (last 6 months)
- [ ] Vulnerability scans with remediation evidence

### Process Evidence
- [ ] Change management tickets (sample of 20)
- [ ] Incident response tests (tabletop exercise records)
- [ ] Business continuity tests (DR test results)
- [ ] Security awareness training completion (100%)

## Audit Week Logistics
- Point of contact: [Security Lead]
- Evidence repository: [SharePoint/Confluence link]
- System access: [Auditor credentials prepared]
- Interview schedule: [Calendar link]
```

---

## Example 5: vCISO Consulting Engagement

### Scenario

Startup seeking strategic security guidance without full-time CISO.

### Invocation

```
/bmad:cybersec-team:workflows:virtual-ciso-consulting
```

### Workflow Overview

**Initial Assessment Phase**

```
Bastion leads security program assessment:

1. Current State Analysis
   - Existing security controls inventory
   - Policy and procedure review
   - Technology stack security posture
   - Team capabilities assessment

2. Risk Assessment
   - Business risk identification
   - Threat landscape for industry
   - Regulatory requirements mapping
   - Third-party risk evaluation

3. Gap Analysis
   - Security maturity scoring (CMMI-based)
   - Priority recommendations
   - Resource requirements
```

**Strategic Roadmap Phase**

```
Bastion develops security strategy:

Year 1 Priorities:
- Q1: Foundation (policies, basic controls)
- Q2: Detection (logging, monitoring)
- Q3: Response (IR procedures, testing)
- Q4: Optimization (metrics, continuous improvement)

Budget Recommendations:
- Security tools: $XX,XXX
- Training: $XX,XXX
- Consulting: $XX,XXX
- Contingency: $XX,XXX
```

**Ongoing Advisory**

```
Monthly deliverables:
- Security metrics dashboard
- Vulnerability management report
- Policy update recommendations
- Incident review (if applicable)
- Board-ready executive summary

Quarterly deliverables:
- Risk register update
- Security roadmap progress
- Budget review and planning
- Team development recommendations
```

---

## Workflow Combinations

### Security Architecture + Threat Modeling

```
For new system designs, combine:
1. security-architecture-review (high-level design)
2. threat-modeling (detailed threat analysis)
3. web-app-security-testing (validation before launch)
```

### Incident Response + Intelligence

```
For sophisticated threats, combine:
1. incident-response-playbook (containment)
2. attribution-chain (Intel team - threat actor ID)
3. counter-intel-audit (assess organizational exposure)
```

---

## Best Practices

1. **Always document scope** before starting any security workflow
2. **Preserve evidence** properly - chain of custody matters
3. **Communicate findings** at appropriate levels (technical vs. executive)
4. **Track remediation** - findings without fixes provide no value
5. **Integrate with development** - security is everyone's responsibility

---

## See Also

- [Intel Workflow Examples](INTEL-WORKFLOW-EXAMPLES.md) - For threat intelligence
- [Party Mode Examples](PARTY-MODE-EXAMPLES.md) - For `incident-war-room` preset
- [Workflow Selection Guide](../WORKFLOW-SELECTION-GUIDE.md) - Decision trees
- [Workflow Chaining Guide](../WORKFLOW-CHAINING-GUIDE.md) - Combining workflows
