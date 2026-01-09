---
name: 'step-08-findings-remediation'
description: 'Consolidated findings and remediation guidance'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/web-app-security-testing'
thisStepFile: '{workflow_path}/steps/step-08-findings-remediation.md'
outputFile: '{output_folder}/security/web-app-security-testing-{project_name}.md'
---

# Step 8: Findings Summary & Remediation

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Compile findings from all previous sections

## FINDINGS CONSOLIDATION SEQUENCE:

### 1. Findings Compilation

"Let's consolidate all findings from the assessment.

**Review Each Section:**
1. Authentication (AUTH-xxx)
2. Authorization (AUTHZ-xxx)
3. Input Validation (INJ-xxx)
4. Session Management (SESS-xxx)
5. Business Logic (BL-xxx)

**Severity Classification (CVSS-based):**
- **Critical (9.0-10.0)**: Immediate exploitation, full compromise
- **High (7.0-8.9)**: Serious impact, readily exploitable
- **Medium (4.0-6.9)**: Moderate impact, requires conditions
- **Low (0.1-3.9)**: Limited impact, difficult to exploit
- **Informational**: Best practice deviation, no direct risk

Let me compile the findings we've documented. Please confirm or add any I may have missed."

### 2. OWASP Top 10 Mapping

"Mapping findings to OWASP Top 10 (2021):

| OWASP Category | Findings | Status |
|----------------|----------|--------|
| A01: Broken Access Control | | |
| A02: Cryptographic Failures | | |
| A03: Injection | | |
| A04: Insecure Design | | |
| A05: Security Misconfiguration | | |
| A06: Vulnerable Components | | |
| A07: Auth Failures | | |
| A08: Data Integrity Failures | | |
| A09: Logging Failures | | |
| A10: SSRF | | |

Which categories have findings?"

### 3. Risk Prioritization

"Let's prioritize findings for remediation.

**Priority Factors:**
1. Severity (CVSS score)
2. Exploitability (how easy to exploit)
3. Business impact (data, reputation, financial)
4. Attack surface exposure
5. Remediation complexity

**Priority Categories:**
- **P1 - Immediate**: Fix before go-live or within 24-48 hours
- **P2 - Short-term**: Fix within 1-2 weeks
- **P3 - Medium-term**: Fix within 30 days
- **P4 - Long-term**: Plan for next release cycle

How should we prioritize the findings?"

### 4. Remediation Guidance

"Providing remediation for critical findings.

**For Each Finding, I'll Cover:**
- Root cause
- Remediation approach
- Code example (if applicable)
- Verification steps
- Defense in depth recommendations

Let's start with the highest priority findings. Which should we address first?"

### 5. Common Remediation Patterns

"Standard remediation guidance by vulnerability type:

**SQL Injection:**
- Use parameterized queries/prepared statements
- ORM with proper escaping
- Input validation as defense-in-depth

**XSS:**
- Context-aware output encoding
- Content-Security-Policy headers
- Sanitize HTML with trusted libraries

**IDOR:**
- Implement proper authorization checks
- Use indirect object references
- Verify ownership on every access

**CSRF:**
- Anti-CSRF tokens in all forms
- SameSite cookie attribute
- Verify origin/referer headers

**Session Issues:**
- Regenerate session on login
- Set secure cookie attributes
- Implement proper logout

Which findings need detailed remediation guidance?"

### 6. Generate Executive Summary

"Let's create the executive summary.

**Summary Components:**
- Overall risk rating
- Finding statistics by severity
- Key risk areas
- Immediate actions required
- Long-term recommendations

What's the overall assessment outcome?"

### 7. Document Final Report

Update {outputFile} with complete report:

```markdown
## 8. Findings & Remediation

### 8.1 Executive Summary
**Overall Risk Rating:** [Critical/High/Medium/Low]

**Finding Statistics:**
| Severity | Count |
|----------|-------|
| Critical | |
| High | |
| Medium | |
| Low | |
| Informational | |

**Key Findings:**
1. [Most critical finding]
2. [Second critical finding]
3. [Third critical finding]

### 8.2 OWASP Top 10 Coverage
| Category | Findings | Status |
|----------|----------|--------|
| A01: Broken Access Control | | |
| A02: Cryptographic Failures | | |
| A03: Injection | | |
| A04: Insecure Design | | |
| A05: Security Misconfiguration | | |
| A06: Vulnerable Components | | |
| A07: Auth Failures | | |
| A08: Data Integrity Failures | | |
| A09: Logging Failures | | |
| A10: SSRF | | |

### 8.3 Prioritized Findings

#### Critical
| ID | Finding | CVSS | Priority | Remediation |
|----|---------|------|----------|-------------|
| | | | P1 | |

#### High
| ID | Finding | CVSS | Priority | Remediation |
|----|---------|------|----------|-------------|
| | | | P2 | |

#### Medium
[Medium severity findings]

#### Low
[Low severity findings]

### 8.4 Remediation Roadmap
**Immediate (24-48 hours):**
- [ ] [Action item]

**Short-term (1-2 weeks):**
- [ ] [Action item]

**Medium-term (30 days):**
- [ ] [Action item]

**Long-term:**
- [ ] [Action item]

### 8.5 Detailed Remediation Guidance

#### [Finding ID]: [Title]
**Severity:** [Critical/High/Medium/Low]
**CVSS:** [Score]

**Description:**
[Detailed description]

**Root Cause:**
[Why this vulnerability exists]

**Remediation:**
[Step-by-step fix]

**Code Example:**
```[language]
// Secure implementation
```

**Verification:**
[How to verify the fix]

### 8.6 Recommendations
1. [Strategic recommendation]
2. [Process improvement]
3. [Training need]

### 8.7 Conclusion
[Assessment conclusion and next steps]

---
## Assessment Metadata
- **Tester:** {user_name}
- **Date Range:** [Start] - [End]
- **Methodology:** OWASP Testing Guide v4.2
- **Status:** Complete
```

### 8. Finalization

"**Web Application Security Assessment Complete**

**Summary:**
- Total findings: [Count]
- Critical: [Count] | High: [Count] | Medium: [Count] | Low: [Count]
- Top risk: [Primary concern]
- Immediate actions: [Count] items

**Next Steps:**
1. Review report with development team
2. Begin P1 remediation immediately
3. Schedule retest after fixes
4. Implement ongoing security testing

Your assessment document has been saved.

Need anything else?"

## MENU

Display: [E] Export Report [R] Review Specific Section [A] Add Finding [D] Dismiss Agent

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to:
```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: complete
```

Workflow complete. Offer to export or start new assessment.
