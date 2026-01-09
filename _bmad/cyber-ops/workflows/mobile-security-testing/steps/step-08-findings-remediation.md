---

name: 'step-08-findings-remediation'
description: 'Compile findings and create remediation roadmap'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/mobile-security-testing'

# File References

thisStepFile: '{workflow_path}/steps/step-08-findings-remediation.md'
outputFile: '{output_folder}/security/mobile-security-testing-{project_name}.md'

---

# Step 8: Findings Summary & Remediation

## STEP GOAL:

To compile all findings, prioritize by severity, and create actionable remediation guidance.

## FINDINGS SEQUENCE:

### 1. Severity Classification

"Let's classify all findings:

**OWASP Mobile Top 10 Mapping:**

| Category | Findings | Severity |
|----------|----------|----------|
| M1: Improper Platform Usage | | |
| M2: Insecure Data Storage | | |
| M3: Insecure Communication | | |
| M4: Insecure Authentication | | |
| M5: Insufficient Cryptography | | |
| M6: Insecure Authorization | | |
| M7: Client Code Quality | | |
| M8: Code Tampering | | |
| M9: Reverse Engineering | | |
| M10: Extraneous Functionality | | |

Let's map findings to OWASP categories."

### 2. Critical Findings

"Let's compile CRITICAL findings:

**From all testing phases:**
[Compile critical findings]

These require immediate attention before release."

### 3. Risk Score

"Let's calculate risk score:

**Scoring:**
- Critical: 25 points
- High: 10 points
- Medium: 3 points
- Low: 1 point

**Overall Risk:** [Score] = [Rating]

What's the overall risk posture?"

### 4. Remediation Priority

"Let's prioritize remediation:

**Priority Framework:**

| Priority | Timeline | Findings |
|----------|----------|----------|
| P0 - Emergency | Before release | [Criticals] |
| P1 - Urgent | Within 1 week | [High] |
| P2 - Standard | Within 1 month | [Medium] |
| P3 - Improvement | Next release | [Low] |

How should we prioritize?"

### 5. Remediation Guidance

"Let's provide remediation code:

**Common Fixes:**

**Secure Storage (iOS):**
```swift
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    kSecAttrAccount as String: "key",
    kSecValueData as String: data
]
SecItemAdd(query as CFDictionary, nil)
```

**Secure Storage (Android):**
```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val encryptedPrefs = EncryptedSharedPreferences.create(
    context, "secret_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

What specific fixes are needed?"

### 6. Document Findings

Update Section 8 of {outputFile}:

```markdown
## 8. Findings Summary & Remediation

### 8.1 Executive Summary

**Application:** {project_name}
**Platform(s):** [iOS/Android/Both]
**Test Date:** {current_date}

**Overall Risk Rating:** [Critical/High/Medium/Low]
**Risk Score:** [X] points

| Severity | Count | Remediated |
|----------|-------|------------|
| Critical | | 0 |
| High | | 0 |
| Medium | | 0 |
| Low | | 0 |
| **Total** | | 0 |

### 8.2 OWASP Mobile Top 10 Mapping

| Category | Findings | Status |
|----------|----------|--------|
| M1: Improper Platform Usage | | |
| M2: Insecure Data Storage | | |
| M3: Insecure Communication | | |
| M4: Insecure Authentication | | |
| M5: Insufficient Cryptography | | |
| M6: Insecure Authorization | | |
| M7: Client Code Quality | | |
| M8: Code Tampering | | |
| M9: Reverse Engineering | | |
| M10: Extraneous Functionality | | |

### 8.3 Critical Findings

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| C-01 | [Finding] | [Location] | [Impact] |

### 8.4 High Findings

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| H-01 | [Finding] | [Location] | [Impact] |

### 8.5 Medium/Low Findings

| ID | Finding | Severity | Location |
|----|---------|----------|----------|
| M-01 | [Finding] | Medium | [Location] |
| L-01 | [Finding] | Low | [Location] |

### 8.6 Remediation Roadmap

**P0 - Before Release:**
| Finding | Fix | Effort |
|---------|-----|--------|
| | | |

**P1 - Within 1 Week:**
| Finding | Fix | Effort |
|---------|-----|--------|
| | | |

**P2 - Within 1 Month:**
| Finding | Fix | Effort |
|---------|-----|--------|
| | | |

### 8.7 Code Remediation Examples

**[Finding Category]:**
```swift/kotlin
// Remediation code
```

### 8.8 Verification Checklist

| Finding | Fixed | Tested | Verified |
|---------|-------|--------|----------|
| C-01 | ⬜ | ⬜ | ⬜ |

### 8.9 Appendix

**Tools Used:**
- [List of tools]

**Test Devices:**
- [List of devices]

**Methodology:**
- OWASP Mobile Security Testing Guide (MSTG)
- OWASP Mobile Top 10
```

### 7. Workflow Complete

"**Mobile Security Testing Complete!**

I've completed comprehensive mobile security testing including:

1. Static Analysis
2. Dynamic Analysis
3. Data Storage Security
4. Network Security
5. Authentication & Session
6. Platform-Specific Issues
7. Findings & Remediation

**Summary:**
- Total findings: [X]
- Critical/High requiring immediate action: [X]
- Overall risk rating: [Rating]

**Next Steps:**
1. Fix P0 findings before release
2. Implement P1 fixes within week
3. Schedule re-test after fixes
4. Consider bug bounty program

Your complete report is saved at:
`{outputFile}`"

## FINAL MENU

Display: **Testing Complete - Select an Option:** [E] Export Report [Q] Ask Questions [D] Done

#### Menu Handling Logic:

- IF E: Export guidance
- IF Q: Answer questions
- IF D: Mark complete, update frontmatter

---

## CRITICAL STEP COMPLETION NOTE

This is the FINAL step. When user selects 'D':
1. Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]`
2. Add `workflowComplete: true`
3. Add `completedDate: [current date]`
