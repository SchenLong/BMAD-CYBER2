---
name: 'audit-report-template'
description: 'Standard blockchain security audit report template'
version: '1.0'
---

# Smart Contract Security Audit Report

## Document Information

| Field | Value |
|-------|-------|
| **Protocol Name** | {project_name} |
| **Audit Date** | {audit_date} |
| **Auditor** | {user_name}, Claude (Ledger) |
| **Commit Hash** | [Commit] |
| **Report Version** | 1.0 |

---

## Executive Summary

### Overview

[Brief description of the protocol and its purpose]

### Scope

| Contract | Address/File | LoC |
|----------|--------------|-----|
| | | |

### Key Findings

| Severity | Count |
|----------|-------|
| Critical | |
| High | |
| Medium | |
| Low | |
| Informational | |

### Risk Assessment

**Overall Risk Level:** [Critical/High/Medium/Low]

**Key Risks Identified:**
1. [Risk 1]
2. [Risk 2]
3. [Risk 3]

---

## Findings

### Critical

#### C-01: [Finding Title]

**Severity:** Critical
**Status:** [Open/Fixed/Acknowledged]
**Location:** [Contract.sol:Function:Line]

**Description:**
[Detailed description of the vulnerability]

**Impact:**
[What could happen if exploited]

**Proof of Concept:**
```solidity
// Attack code or steps
```

**Recommendation:**
[How to fix]

**Team Response:**
[Protocol team's response]

---

### High

#### H-01: [Finding Title]

**Severity:** High
**Status:** [Open/Fixed/Acknowledged]
**Location:** [Contract.sol:Function:Line]

**Description:**
[Description]

**Impact:**
[Impact]

**Recommendation:**
[Fix]

---

### Medium

#### M-01: [Finding Title]

**Severity:** Medium
**Status:** [Open/Fixed/Acknowledged]
**Location:** [Location]

**Description:**
[Description]

**Recommendation:**
[Fix]

---

### Low

#### L-01: [Finding Title]

**Severity:** Low
**Location:** [Location]

**Description:**
[Description]

**Recommendation:**
[Fix]

---

### Informational

#### I-01: [Finding Title]

**Location:** [Location]

**Description:**
[Description]

**Suggestion:**
[Improvement]

---

## Appendix

### A. Methodology

**Review Process:**
1. Manual code review
2. Automated analysis
3. Attack vector modeling
4. Documentation review

**Tools Used:**
- Slither
- Mythril
- Custom scripts

### B. Severity Definitions

| Severity | Definition |
|----------|------------|
| Critical | Direct fund loss or protocol takeover possible |
| High | Significant risk to funds or core functionality |
| Medium | Moderate risk with exploitation barriers |
| Low | Minor issues or best practice violations |
| Informational | Suggestions and improvements |

### C. Disclaimer

This audit represents a point-in-time review of the specified code. It does not guarantee security and should not be taken as an endorsement of the protocol.
