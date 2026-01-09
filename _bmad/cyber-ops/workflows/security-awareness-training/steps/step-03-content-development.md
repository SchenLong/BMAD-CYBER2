---

name: 'step-03-content-development'
description: 'Design training modules, role-based content, and compliance-specific materials'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-awareness-training'

# File References

thisStepFile: '{workflow_path}/steps/step-03-content-development.md'
nextStepFile: '{workflow_path}/steps/step-04-phishing-simulation.md'
outputFile: '{output_folder}/security/security-awareness-program-{project_name}.md'

---

# Step 3: Training Content Development

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on content design and curriculum planning
- FORBIDDEN to discuss phishing simulations yet
- Help user design engaging, targeted content

## STEP GOAL:

To design a comprehensive training curriculum with modules addressing identified risks, role-based content for high-risk populations, and compliance-specific materials.

## CONTENT DEVELOPMENT SEQUENCE:

### 1. Core Curriculum Design

"Let's design your core training curriculum:

**Foundational Modules (All Employees):**

1. **Security Basics** (15-20 min)
   - Why security matters
   - Common threats overview
   - Personal responsibility

2. **Phishing Recognition** (20-30 min)
   - Email red flags
   - URL inspection
   - Attachment safety
   - Reporting procedures

3. **Password Security** (10-15 min)
   - Strong password creation
   - Password manager usage
   - MFA importance

4. **Data Protection** (15-20 min)
   - Classification basics
   - Handling sensitive data
   - Sharing guidelines

5. **Physical Security** (10 min)
   - Clean desk policy
   - Visitor procedures
   - Device security

6. **Incident Reporting** (10 min)
   - What to report
   - How to report
   - No-blame culture

Which modules are most critical for your organization?
Any topics you'd add or remove?"

### 2. Role-Based Content

"Let's create specialized content for high-risk groups:

**Executive Track:**
- BEC/CEO fraud scenarios
- Secure travel practices
- High-profile target awareness
- Decision-making under social pressure

**Finance Track:**
- Wire fraud detection
- Payment verification procedures
- Vendor impersonation
- Invoice manipulation

**HR Track:**
- W-2/tax scam awareness
- Candidate impersonation
- Employee data protection
- Social engineering red flags

**IT Track:**
- Privileged access responsibility
- Supply chain attacks
- Credential management
- Technical social engineering

**New Hire Track:**
- Onboarding security basics
- Company-specific policies
- Reporting culture introduction
- Early phishing test preparation

Which role-based tracks do you need?"

### 3. Content Format Selection

"Let's choose content formats:

**Format Options:**

| Format | Pros | Cons | Best For |
|--------|------|------|----------|
| Video | Engaging, consistent | Costly, hard to update | Core concepts |
| Interactive | High retention | Development time | Phishing practice |
| Written | Easy to update | Lower engagement | Policies, references |
| Live Training | Q&A, discussion | Scheduling, scaling | High-risk groups |
| Microlearning | Quick, frequent | Surface-level | Reinforcement |
| Gamification | Engagement, competition | Complexity | Ongoing motivation |

What formats work best for your culture and infrastructure?"

### 4. Compliance Mapping

"Let's map content to compliance requirements:

Based on your requirements (from Step 1):

| Requirement | Training Topic | Frequency | Documentation |
|-------------|----------------|-----------|---------------|
| PCI-DSS | Cardholder data handling | Annual | Completion records |
| HIPAA | PHI protection | Annual | Training attestation |
| SOC 2 | Security awareness | Annual | Completion evidence |
| GDPR | Data subject rights | Annual | Training records |

Which compliance requirements need specific training mapping?"

### 5. Document Content Plan

Update Section 4 of {outputFile}:

```markdown
## 4. Training Content Design

### 4.1 Core Curriculum

| Module | Duration | Format | Audience | Frequency |
|--------|----------|--------|----------|-----------|
| Security Basics | 20 min | Video + Quiz | All | Annual + Onboarding |
| Phishing Recognition | 25 min | Interactive | All | Annual + Refreshers |
| Password Security | 15 min | Video | All | Annual |
| Data Protection | 20 min | Video + Quiz | All | Annual |
| Physical Security | 10 min | Video | All | Annual |
| Incident Reporting | 10 min | Video | All | Onboarding |

### 4.2 Role-Based Training Tracks

| Track | Audience | Modules | Duration | Frequency |
|-------|----------|---------|----------|-----------|
| Executive | C-suite, VPs | BEC, Travel, High-profile | 45 min | Quarterly |
| Finance | AP/AR, Treasury | Wire fraud, Payment | 30 min | Quarterly |
| [User data] | | | | |

### 4.3 Content Formats

**Primary Formats:**
- [Format choices with rationale]

**Delivery Platform:**
- [LMS or platform selection]

### 4.4 Compliance Mapping

| Framework | Requirement | Training Module | Evidence Type |
|-----------|-------------|-----------------|---------------|
| [User data] | | | |

### 4.5 Content Development Timeline

| Phase | Content | Owner | Target Date |
|-------|---------|-------|-------------|
| [User data] | | | |

### 4.6 Localization Requirements

[Languages, regional considerations]
```

### 6. Confirmation and Next Step

"**Training Content Design Complete**

I've documented:
- Core curriculum with [X] modules
- [X] role-based training tracks
- Content formats selected
- Compliance mapping completed

Next, we'll design your phishing simulation strategy.

Ready to proceed to phishing simulation planning?"

## MENU

Display: **Content Design Complete - Select an Option:** [C] Continue to Phishing Simulation [R] Review/Revise Content Plan

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 4 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN content development is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
