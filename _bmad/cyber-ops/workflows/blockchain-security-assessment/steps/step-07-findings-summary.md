---

name: 'step-07-findings-summary'
description: 'Compile and prioritize all security findings'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/blockchain-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-07-findings-summary.md'
nextStepFile: '{workflow_path}/steps/step-08-remediation.md'
outputFile: '{output_folder}/security/blockchain-security-assessment-{project_name}.md'

---

# Step 7: Findings Summary

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on consolidating and prioritizing findings
- FORBIDDEN to discuss detailed remediation yet
- Use industry-standard severity classifications

## STEP GOAL:

To compile all findings from previous sections, assign severity ratings, and create a prioritized findings summary.

## FINDINGS SUMMARY SEQUENCE:

### 1. Severity Classification

"Let's use standard severity classifications:

**Severity Levels:**

| Severity | Definition | Examples |
|----------|------------|----------|
| Critical | Immediate fund loss/theft possible | Reentrancy, access control bypass |
| High | Significant risk to funds or protocol | Oracle manipulation, centralization |
| Medium | Moderate risk with exploitation barriers | Missing validations, gas griefing |
| Low | Minor issues, best practice violations | Code quality, documentation |
| Informational | Suggestions for improvement | Optimization, style |

Let's categorize all findings from our assessment."

### 2. Critical Findings Compilation

"Let's compile CRITICAL findings:

**From Smart Contract Review (Section 2):**
[List critical findings]

**From Access Control (Section 3):**
[List critical findings]

**From Economic Security (Section 4):**
[List critical findings]

**From DeFi Vulnerabilities (Section 5):**
[List critical findings]

**From Infrastructure (Section 6):**
[List critical findings]

What critical findings should be highlighted?"

### 3. High Findings Compilation

"Let's compile HIGH severity findings:

**From all sections:**
[Compile high findings with location references]

Review each high finding for accuracy."

### 4. Medium/Low Findings

"Let's compile MEDIUM and LOW findings:

**Medium Findings:**
[Compile medium findings]

**Low Findings:**
[Compile low findings]

**Informational:**
[Compile informational items]

Any findings to reclassify?"

### 5. Risk Score Calculation

"Let's calculate overall risk score:

**Scoring Formula:**
- Critical: 25 points each
- High: 10 points each
- Medium: 3 points each
- Low: 1 point each

**Risk Rating:**
| Score | Rating |
|-------|--------|
| 0-10 | Low Risk |
| 11-30 | Moderate Risk |
| 31-60 | High Risk |
| 60+ | Critical Risk |

Let me calculate your protocol's risk score."

### 6. Attack Scenario Analysis

"Let's document key attack scenarios:

**Top Attack Scenarios:**

| Scenario | Prerequisites | Impact | Likelihood |
|----------|---------------|--------|------------|
| [Attack 1] | [Requirements] | [Impact] | [H/M/L] |
| [Attack 2] | [Requirements] | [Impact] | [H/M/L] |
| [Attack 3] | [Requirements] | [Impact] | [H/M/L] |

Which attack scenarios are most concerning?"

### 7. Document Findings Summary

Update Section 7 of {outputFile}:

```markdown
## 7. Findings Summary

### 7.1 Executive Summary

**Assessment Date:** {current_date}
**Protocol:** {project_name}
**Platform:** [Platform(s)]

**Overall Risk Rating:** [Low/Moderate/High/Critical]
**Risk Score:** [X] points

| Severity | Count | Remediated |
|----------|-------|------------|
| Critical | [X] | 0 |
| High | [X] | 0 |
| Medium | [X] | 0 |
| Low | [X] | 0 |
| Informational | [X] | 0 |
| **Total** | [X] | 0 |

### 7.2 Critical Findings

| ID | Finding | Location | Impact | CVSS |
|----|---------|----------|--------|------|
| C-01 | [Finding] | [Contract/Function] | [Impact] | [Score] |

**C-01: [Finding Title]**
- **Description:** [Detailed description]
- **Location:** [Contract:Function:Line]
- **Impact:** [What can happen]
- **Recommendation:** [Brief fix]

### 7.3 High Findings

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| H-01 | [Finding] | [Location] | [Impact] |

**H-01: [Finding Title]**
- **Description:** [Detailed description]
- **Location:** [Contract:Function:Line]
- **Impact:** [What can happen]
- **Recommendation:** [Brief fix]

### 7.4 Medium Findings

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| M-01 | [Finding] | [Location] | [Impact] |

### 7.5 Low Findings

| ID | Finding | Location |
|----|---------|----------|
| L-01 | [Finding] | [Location] |

### 7.6 Informational

| ID | Finding | Location |
|----|---------|----------|
| I-01 | [Finding] | [Location] |

### 7.7 Attack Scenarios

**Scenario 1: [Attack Name]**
- Prerequisites: [What attacker needs]
- Attack Flow: [Step by step]
- Impact: [Funds at risk]
- Likelihood: [High/Medium/Low]

### 7.8 Findings by Category

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Smart Contract | | | | |
| Access Control | | | | |
| Economic | | | | |
| DeFi-Specific | | | | |
| Infrastructure | | | | |

### 7.9 Key Statistics

- **Total Contracts Reviewed:** [Count]
- **Lines of Code:** [Count]
- **Total Findings:** [Count]
- **Findings per 1000 LoC:** [Ratio]
```

### 8. Confirmation and Next Step

"**Findings Summary Complete**

I've compiled all findings:
- [X] Critical findings requiring immediate attention
- [X] High findings with significant risk
- [X] Medium findings to address
- [X] Low and informational items

Overall Risk Rating: [Rating]
Total Findings: [Count]

Next, we'll create the remediation roadmap.

Ready to proceed to remediation planning?"

## MENU

Display: **Findings Summary Complete - Select an Option:** [C] Continue to Remediation [R] Review/Revise Findings

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 7 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN findings are documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
