---

name: 'step-04-phishing-simulation'
description: 'Design phishing campaign strategy, templates, and escalation procedures'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-awareness-training'

# File References

thisStepFile: '{workflow_path}/steps/step-04-phishing-simulation.md'
nextStepFile: '{workflow_path}/steps/step-05-delivery-strategy.md'
outputFile: '{output_folder}/security/security-awareness-program-{project_name}.md'

---

# Step 4: Phishing Simulation Strategy

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on phishing simulation planning
- FORBIDDEN to discuss delivery logistics yet
- Help user design ethical, effective phishing program

## STEP GOAL:

To design a comprehensive phishing simulation strategy including campaign types, difficulty progression, response procedures, and ethical considerations.

## PHISHING SIMULATION SEQUENCE:

### 1. Campaign Strategy Overview

"Let's design your phishing simulation approach:

**Simulation Objectives:**
1. Measure susceptibility baseline
2. Reinforce training with realistic scenarios
3. Identify users needing additional support
4. Track improvement over time

**Key Decisions:**
- Frequency: How often will you run simulations?
- Coverage: All users or targeted populations?
- Difficulty: Single difficulty or progressive?
- Response: What happens when users click?

What's your philosophy on phishing simulations?"

### 2. Campaign Types

"Let's plan different campaign types:

**By Difficulty:**

| Level | Characteristics | Example |
|-------|-----------------|---------|
| Easy | Obvious red flags, generic content | "Nigerian prince" style |
| Medium | Some red flags, relevant topics | Fake IT password reset |
| Hard | Minimal red flags, personalized | Spoofed exec, current events |
| Advanced | Highly targeted, multi-stage | BEC simulation |

**By Theme:**

| Theme | Target Risk | Best For |
|-------|-------------|----------|
| IT/Password Reset | Credential theft | All users |
| Package Delivery | Malware delivery | All users |
| HR/Benefits | PII exposure | All users |
| Finance/Invoice | BEC/Wire fraud | Finance teams |
| Executive/CEO | Authority compliance | All users |
| Current Events | Opportunistic attacks | All users |
| Vendor/Partner | Supply chain | Procurement, IT |

Which campaign types align with your threat landscape?"

### 3. Frequency and Cadence

"Let's establish simulation frequency:

**Recommended Cadence:**
- Monthly: Good for building habits, may cause fatigue
- Bi-monthly: Balanced approach
- Quarterly: Minimum for compliance, allows recovery
- Random: Unpredictable but harder to track trends

**Considerations:**
- Workforce size: [From Step 1]
- Testing fatigue concerns
- Resource availability
- Baseline needs

**Phased Approach Example:**
- Month 1: Easy baseline (all users)
- Month 2: Medium difficulty
- Month 3: Targeted hard tests
- Month 4: Review and retrain
- Repeat with progression

What frequency works for your organization?"

### 4. Response Procedures

"Let's define what happens when users interact with simulations:

**On Click (Failed):**
- Immediate teachable moment landing page?
- Just-in-time training assignment?
- Manager notification (first offense)?
- Progressive consequences?

**Response Options:**
| Response Type | First Click | Repeat Offender | Chronic |
|---------------|-------------|-----------------|---------|
| Teachable Moment | Landing page | Landing page | Manager alert |
| Training | Micro-module | Full module | Live training |
| Notification | None | User + Manager | HR involvement |
| Tracking | Record only | Flag for support | Performance plan |

**On Report (Passed):**
- Positive acknowledgment?
- Gamification points?
- Recognition program?

What response approach fits your culture?"

### 5. Ethical Considerations

"Let's address ethical phishing practices:

**Best Practices:**
- No punitive consequences for first failures
- Focus on education, not embarrassment
- Avoid overly manipulative scenarios (personal tragedy, etc.)
- Clearly communicate that program exists (not which emails)
- Protect individual results from public disclosure
- Support struggling users, don't shame them

**Legal Considerations:**
- Check local laws on employee monitoring
- Include in acceptable use policy
- Ensure HR/Legal approval
- Document consent mechanisms

Any specific ethical concerns for your organization?"

### 6. Document Phishing Strategy

Update Section 5 of {outputFile}:

```markdown
## 5. Phishing Simulation Strategy

### 5.1 Campaign Objectives

[Program goals for phishing simulations]

### 5.2 Campaign Calendar

| Month | Campaign Type | Difficulty | Target Population | Theme |
|-------|---------------|------------|-------------------|-------|
| [User data] | | | | |

### 5.3 Difficulty Progression

| Level | When Used | Characteristics | Success Criteria |
|-------|-----------|-----------------|------------------|
| Easy | Baseline, new hires | Obvious red flags | <30% click rate |
| Medium | Standard tests | Some indicators | <15% click rate |
| Hard | Advanced users | Minimal flags | <10% click rate |
| Targeted | High-risk roles | Role-specific | <5% click rate |

### 5.4 Response Procedures

**On Click/Failure:**
| Offense | Immediate Response | Follow-up | Escalation |
|---------|-------------------|-----------|------------|
| First | [Action] | [Training] | None |
| Second | [Action] | [Training] | [Notification] |
| Chronic | [Action] | [Training] | [HR Process] |

**On Report/Success:**
[Recognition approach]

### 5.5 Campaign Templates

| Template Name | Theme | Difficulty | Target |
|---------------|-------|------------|--------|
| [User data] | | | |

### 5.6 Ethical Guidelines

- [List of ethical boundaries]
- [Consent mechanisms]
- [Data protection measures]

### 5.7 Platform/Tool

**Phishing Platform:** [Tool name]
**Features Used:** [List]
**Integration:** [LMS, reporting, etc.]
```

### 7. Confirmation and Next Step

"**Phishing Simulation Strategy Complete**

I've documented:
- Campaign types and themes
- Frequency and cadence plan
- Response procedures for click/report
- Ethical guidelines

Next, we'll plan the overall training delivery strategy.

Ready to proceed to delivery strategy?"

## MENU

Display: **Phishing Strategy Complete - Select an Option:** [C] Continue to Delivery Strategy [R] Review/Revise Strategy

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 5 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN phishing strategy is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
