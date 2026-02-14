# Threat Model Template

**Version**: 1.0.0
**Date**: 2026-02-13
**Purpose**: Standardized template for conducting threat modeling using STRIDE methodology
**ASVS A04 Reference**: A04-101, A04-102, A04-103

---

## Template Metadata

```yaml
threat_model:
  name: "[Component/System Name]"
  version: "1.0.0"
  date: "[YYYY-MM-DD]"
  methodology: "STRIDE"
  reviewer: "[Name/Role]"
  status: "[DRAFT | REVIEWED | APPROVED]"
```

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Asset Identification](#2-asset-identification)
3. [Trust Boundaries](#3-trust-boundaries)
4. [STRIDE Analysis](#4-stride-analysis)
5. [Security Controls Mapping](#5-security-controls-mapping)
6. [Risk Assessment](#6-risk-assessment)
7. [OWASP Control Mapping](#7-owasp-control-mapping)

---

## 1. System Overview

### 1.1 Component Description

**Component Name**: `[Component Name]`

**Purpose**: `[Brief description of what this component does]`

**Technology Stack**: `[Languages, frameworks, libraries]`

**Data Types Handled**:

- `[ ]` PII (Personally Identifiable Information)
- `[ ]` Authentication credentials
- `[ ]` Encryption keys
- `[ ]` Financial data
- `[ ]` Health information
- `[ ]` Other: `[specify]`

### 1.2 External Dependencies

| Dependency | Type | Trust Level | Notes |
|------------|------|-------------|-------|
| `[API Name]` | REST/SDK | External/Untrusted | `[Notes]` |
| `[Library]` | npm package | Third-party | `[Notes]` |
| `[Service]` | Internal service | Trusted | `[Notes]` |

---

## 2. Asset Identification

### 2.1 Information Assets

| Asset ID | Asset Name | Classification | Owner | Location |
|----------|------------|----------------|-------|----------|
| IA-001 | `[Asset Name]` | `[PUBLIC | INTERNAL | CONFIDENTIAL | RESTRICTED]` | `[Owner]` | `[Location]` |
| IA-002 | `[Asset Name]` | `[Classification]` | `[Owner]` | `[Location]` |

### 2.2 Software Assets

| Asset ID | Asset Name | Version | Exposure |
|----------|------------|---------|----------|
| SA-001 | `[Component/File]` | `[Version]` | `[External/ Internal]` |
| SA-002 | `[Component/File]` | `[Version]` | `[Exposure]` |

---

## 3. Trust Boundaries

### 3.1 Trust Zones

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNTRUSTED ZONE                                │
│  (External users, internet, third-party APIs)                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼ TRUST BOUNDARY 1
┌─────────────────────────────────────────────────────────────────┐
│                    DMZ / PERIMETER                               │
│  (API gateway, load balancers, edge services)                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼ TRUST BOUNDARY 2
┌─────────────────────────────────────────────────────────────────┐
│                    TRUSTED ZONE                                  │
│  (Application servers, internal services)                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼ TRUST BOUNDARY 3
┌─────────────────────────────────────────────────────────────────┐
│                    HIGH SECURITY ZONE                            │
│  (Database, key storage, audit logs)                             │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow Diagram

```
[External Actor]
      │
      ▼ (request)
┌─────────────────┐
│ [Entry Point]   │ ──► [Validation Layer]
└────────┬────────┘
         │
         ▼ (validated)
┌─────────────────┐
│ [Processing]    │ ──► [Business Logic]
└────────┬────────┘
         │
         ▼ (processed)
┌─────────────────┐
│ [Storage]       │
└─────────────────┘
```

---

## 4. STRIDE Analysis

### 4.1 STRIDE Categories Reference

| Category | Description | Example Threats |
|----------|-------------|-----------------|
| **S**poofing | Impersonation of users or systems | Credential theft, session hijacking |
| **T**ampering | Unauthorized modification of data | SQL injection, data corruption |
| **R**epudiation | Denial of actions | Insufficient logging, audit trail gaps |
| **I**nformation Disclosure | Exposure of sensitive data | Data breach, API leaks |
| **D**enial of Service | System unavailability | Resource exhaustion, flooding |
| **E**levation of Privilege | Gaining unauthorized access | Privilege escalation, authorization bypass |

### 4.2 Component STRIDE Matrix

| STRIDE Category | Threat ID | Description | Attack Scenario | Likelihood | Impact | Risk |
|-----------------|-----------|-------------|-----------------|------------|--------|------|
| **Spoofing** | S-001 | `[Threat description]` | `[Attack scenario]` | `[High/Med/Low]` | `[High/Med/Low]` | `[Risk Level]` |
| | S-002 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| **Tampering** | T-001 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| | T-002 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| **Repudiation** | R-001 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| | R-002 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| **Info Disclosure** | I-001 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| | I-002 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| **Denial of Service** | D-001 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| | D-002 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| **Elevation** | E-001 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |
| | E-002 | `[Threat description]` | `[Attack scenario]` | `[Likelihood]` | `[Impact]` | `[Risk]` |

### 4.3 Detailed Threat Analysis

For each identified threat, provide:

#### Threat ID: [S-001]

**Category**: Spoofing

**Description**:

```
[Detailed threat description]
```

**Attack Scenario**:

1. Attacker `[step 1]`
2. Attacker `[step 2]`
3. Attacker `[step 3]`
4. `[Impact]`

**Prerequisites**:

- `[Required condition 1]`
- `[Required condition 2]`

**Indicators**:

- `[Detection indicator 1]`
- `[Detection indicator 2]`

---

## 5. Security Controls Mapping

### 5.1 Controls by Threat

Map identified security controls to each threat:

| Threat ID | Control ID | Control Type | Status | Notes |
|-----------|------------|--------------|--------|-------|
| S-001 | CTRL-001 | Preventive | ✅ Implemented | `[Notes]` |
| S-001 | CTRL-002 | Detective | ⚠️ Partial | `[Notes]` |
| T-001 | CTRL-003 | Preventive | ✅ Implemented | `[Notes]` |
| I-001 | CTRL-004 | Corrective | 🔄 Planned | `[Notes]`

**Control Types**:

- **Preventive**: Stops threat from occurring
- **Detective**: Identifies threat occurrence
- **Corrective**: Responds to threat after occurrence
- **Compensating**: Alternative control when primary not feasible

### 5.2 Control Catalog

| Control ID | Control Name | Type | Implementation |
|------------|--------------|------|-----------------|
| CTRL-001 | `[Control Name]` | `[Type]` | `[Implementation details]` |
| CTRL-002 | `[Control Name]` | `[Type]` | `[Implementation details]` |

---

## 6. Risk Assessment

### 6.1 Risk Scoring

Use CVSS 3.1 or qualitative scoring:

| Threat ID | CVSS Score | CVSS Vector | Severity | Status |
|-----------|------------|-------------|----------|--------|
| S-001 | `[0.0-10.0]` | `CVSS:3.1/[Vector]` | `[CRITICAL/HIGH/MEDIUM/LOW]` | `[MITIGATED/CONFIRMED/ACCEPTED]` |
| T-001 | `[Score]` | `CVSS:3.1/[Vector]` | `[Severity]` | `[Status]`

### 6.2 Risk Treatment

| Risk ID | Risk Level | Treatment Strategy | Owner | Target Date |
|---------|------------|-------------------|-------|-------------|
| S-001 | `[High/Med/Low]` | `[Mitigate/Accept/Transfer/Avoid]` | `[Owner]` | `[Date]` |
| T-001 | `[Risk Level]` | `[Strategy]` | `[Owner]` | `[Date]`

**Treatment Strategies**:

- **Mitigate**: Implement controls to reduce risk
- **Accept**: Acknowledge risk with business justification
- **Transfer**: Shift risk to third party (insurance, vendor)
- **Avoid**: Change design to eliminate risk

### 6.3 Residual Risk

After implementing controls:

| Severity | Count | Percentage |
|----------|-------|------------|
| CRITICAL (9.0-10.0) | `[Count]` | `[Percent]%` |
| HIGH (7.0-8.9) | `[Count]` | `[Percent]%` |
| MEDIUM (4.0-6.9) | `[Count]` | `[Percent]%` |
| LOW (0.1-3.9) | `[Count]` | `[Percent]%` |

---

## 7. OWASP Control Mapping

### 7.1 OWASP Top 10 2021 Mapping

| OWASP ID | Category | Threats Addressed | Controls |
|----------|----------|-------------------|----------|
| A01 | Broken Access Control | `[S-001, E-001]` | `[CTRL-001, CTRL-002]` |
| A02 | Cryptographic Failures | `[I-001]` | `[CTRL-003]` |
| A03 | Injection | `[T-001, T-002]` | `[CTRL-004, CTRL-005]` |
| A04 | Insecure Design | `[All]` | `[All]` |
| A05 | Security Misconfiguration | `[T-003, I-002]` | `[CTRL-006]` |
| A06 | Vulnerable Components | `[T-004]` | `[CTRL-007]` |
| A07 | Authentication Failures | `[S-002, S-003]` | `[CTRL-008, CTRL-009]` |
| A08 | Data Integrity Failures | `[T-005]` | `[CTRL-010]` |
| A09 | Logging Failures | `[R-001, R-002]` | `[CTRL-011]` |
| A10 | SSRF | `[I-003, D-001]` | `[CTRL-012]` |

### 7.2 OWASP ASVS v4.0 Mapping

| ASVS ID | Requirement | Threats Addressed | Verification |
|---------|-------------|-------------------|--------------|
| V1-001 | Security architecture documented | All | ✅ This document |
| V1-002 | Threat modeling documented | All | ✅ This document |
| V1-003 | Secure design patterns used | All | ✅ Section 7 |

---

## Appendix A: STRIDE Methodology Guide

### A.1 Spoofing (S)

**Focus**: Identity verification, authentication

**Key Questions**:

- Can an attacker impersonate a user or system?
- Are credentials properly protected?
- Is authentication enforced at trust boundaries?

**Common Controls**:

- Multi-factor authentication
- Strong password policies
- Certificate-based authentication
- Anti-automation controls

### A.2 Tampering (T)

**Focus**: Data/code integrity

**Key Questions**:

- Can data be modified in transit or at rest?
- Are integrity checks in place?
- Is configuration protected?

**Common Controls**:

- Encryption in transit (TLS)
- Digital signatures
- Checksums/HMACs
- Immutable audit logs

### A.3 Repudiation (R)

**Focus**: Non-repudiation, audit trails

**Key Questions**:

- Can actions be denied?
- Are logs tamper-proof?
- Is there sufficient audit detail?

**Common Controls**:

- Comprehensive logging
- Tamper-evident log storage
- Digital signatures on critical actions
- User attribution

### A.4 Information Disclosure (I)

**Focus**: Data confidentiality

**Key Questions**:

- Is sensitive data protected?
- Can data leak through error messages?
- Is access control enforced?

**Common Controls**:

- Encryption at rest and in transit
- Input validation
- Output encoding
- Access controls

### A.5 Denial of Service (D)

**Focus**: Availability

**Key Questions**:

- Can resources be exhausted?
- Are there rate limits?
- Is the system resilient to floods?

**Common Controls**:

- Rate limiting
- Resource quotas
- Circuit breakers
- Graceful degradation

### A.6 Elevation of Privilege (E)

**Focus**: Authorization

**Key Questions**:

- Can privilege escalation occur?
- Is least privilege enforced?
- Are all endpoints protected?

**Common Controls**:

- Role-based access control
- Principle of least privilege
- Input validation
- Secure defaults

---

## Appendix B: CVSS 3.1 Scoring Guide

### B.1 Base Score Metrics

| Metric | Values | Weight |
|--------|--------|--------|
| Attack Vector (AV) | Network (N), Adjacent (A), Local (L), Physical (P) | 0.85 - 0.20 |
| Attack Complexity (AC) | Low (L), High (H) | 0.77 - 0.44 |
| Privileges Required (PR) | None (N), Low (L), High (H) | 0.85 - 0.50 |
| User Interaction (UI) | None (N), Required (R) | 0.85 - 0.62 |
| Scope (S) | Changed (C), Unchanged (U) | 1.0 - 1.0 |
| Confidentiality (C) | High (H), Low (L), None (N) | 0.56 - 0.0 |
| Integrity (I) | High (H), Low (L), None (N) | 0.56 - 0.0 |
| Availability (A) | High (H), Low (L), None (N) | 0.56 - 0.0 |

### B.2 Severity Ratings

| Score Range | Severity |
|-------------|----------|
| 9.0 - 10.0 | CRITICAL |
| 7.0 - 8.9 | HIGH |
| 4.0 - 6.9 | MEDIUM |
| 0.1 - 3.9 | LOW |
| 0.0 | NONE |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-13 | Security Team | Initial template (A04-101, A04-102, A04-103) |

---

**ASVS A04-101 Compliance**: ✅ STRIDE categories documented
**ASVS A04-102 Compliance**: ✅ Security controls mapped per threat
**ASVS A04-103 Compliance**: ✅ Architecture reviewed against OWASP
