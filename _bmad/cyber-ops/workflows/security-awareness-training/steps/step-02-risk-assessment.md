---

name: 'step-02-risk-assessment'
description: 'Identify human-targeted threats, high-risk departments, and establish baseline metrics'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-awareness-training'

# File References

thisStepFile: '{workflow_path}/steps/step-02-risk-assessment.md'
nextStepFile: '{workflow_path}/steps/step-03-content-development.md'
outputFile: '{output_folder}/security/security-awareness-program-{project_name}.md'

---

# Step 2: Human Risk Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on risk assessment and threat identification
- FORBIDDEN to discuss content development yet
- Help user identify highest-risk populations and threats

## STEP GOAL:

To identify human-targeted threats relevant to the organization, determine high-risk user populations, and establish baseline metrics for measuring program effectiveness.

## RISK ASSESSMENT SEQUENCE:

### 1. Threat Landscape Analysis

"Let's identify the human-targeted threats most relevant to your organization:

**Common Human-Targeted Attack Types:**

1. **Phishing Attacks**
   - Credential harvesting
   - Malware delivery
   - Business email compromise (BEC)

2. **Social Engineering**
   - Pretexting (fake scenarios)
   - Vishing (voice phishing)
   - Smishing (SMS phishing)
   - Physical social engineering

3. **Data Handling Risks**
   - Accidental data exposure
   - Improper sharing/classification
   - Shadow IT usage

4. **Credential Risks**
   - Password reuse
   - Credential sharing
   - Weak authentication

5. **Insider Threats**
   - Malicious insiders
   - Negligent behavior
   - Departing employees

Based on your industry and past incidents, which threats pose the highest risk?"

### 2. High-Risk Population Identification

"Let's identify populations requiring focused attention:

**Typically High-Risk Groups:**

| Population | Risk Factors | Priority |
|------------|--------------|----------|
| Executives | BEC targets, high-value access, less training | Very High |
| Finance/Accounting | Wire fraud, payment manipulation | Very High |
| HR | PII access, W-2 scams | High |
| IT/Admin | Privileged access, tech overconfidence | High |
| New Employees | Unfamiliar with policies, social pressure | High |
| Remote Workers | Physical security, network risks | Medium-High |
| Customer Service | Social engineering exposure | Medium |
| General Staff | Volume target for phishing | Medium |

Which groups in your organization need priority focus?
Are there any unique high-risk roles specific to your business?"

### 3. Baseline Metrics Collection

"Let's establish baseline metrics to measure improvement:

**If you have existing data:**
- Current phishing click rate: [X]%
- Reporting rate (users who report phish): [X]%
- Training completion rate: [X]%
- Incident frequency (human-caused): [X]/month

**If starting fresh:**
We'll establish baselines through:
- Initial phishing simulation campaign
- Pre-training knowledge assessment
- Current incident data review

What baseline data do you have available?"

### 4. Risk Scoring

"Let's prioritize training focus by risk:

| Population | Threat Exposure | Access Level | Current Awareness | Risk Score |
|------------|-----------------|--------------|-------------------|------------|
| [Group 1] | High/Med/Low | High/Med/Low | High/Med/Low | [1-10] |

**Risk Score Formula:**
Threat Exposure (1-3) x Access Level (1-3) x Inverse Awareness (1-3) = Risk Score (1-27)

Let's score your key populations..."

### 5. Document Risk Assessment

Update Section 3 of {outputFile}:

```markdown
## 3. Human Risk Assessment

### 3.1 Threat Landscape

| Threat Type | Relevance | Recent Incidents | Training Priority |
|-------------|-----------|------------------|-------------------|
| [User data] | | | |

### 3.2 High-Risk Populations

| Population | Size | Risk Factors | Risk Score | Priority |
|------------|------|--------------|------------|----------|
| [User data] | | | | |

### 3.3 Baseline Metrics

| Metric | Current Value | Target | Data Source |
|--------|---------------|--------|-------------|
| Phishing Click Rate | | | |
| Phishing Report Rate | | | |
| Training Completion | | | |
| Security Incidents | | | |

### 3.4 Risk Matrix

[Visual or tabular representation of population vs threat risk]

### 3.5 Priority Focus Areas

1. [Highest priority population + threat combination]
2. [Second priority]
3. [Third priority]
```

### 6. Confirmation and Next Step

"**Human Risk Assessment Complete**

I've documented:
- Relevant threat landscape for your organization
- High-risk populations identified and scored
- Baseline metrics established
- Priority focus areas defined

Next, we'll design training content targeted to these risks.

Ready to proceed to content development?"

## MENU

Display: **Risk Assessment Complete - Select an Option:** [C] Continue to Content Development [R] Review/Revise Assessment

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 3 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN risk assessment is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
