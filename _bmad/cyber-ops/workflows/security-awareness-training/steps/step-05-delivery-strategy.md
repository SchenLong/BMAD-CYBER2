---

name: 'step-05-delivery-strategy'
description: 'Plan training delivery, LMS integration, scheduling, and enrollment management'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-awareness-training'

# File References

thisStepFile: '{workflow_path}/steps/step-05-delivery-strategy.md'
nextStepFile: '{workflow_path}/steps/step-06-metrics-measurement.md'
outputFile: '{output_folder}/security/security-awareness-program-{project_name}.md'

---

# Step 5: Delivery Strategy

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on delivery logistics and implementation
- FORBIDDEN to discuss metrics yet
- Help user create practical delivery plan

## STEP GOAL:

To plan the delivery mechanisms, scheduling, enrollment processes, and communication strategies for rolling out the security awareness training program.

## DELIVERY STRATEGY SEQUENCE:

### 1. Delivery Platform

"Let's confirm your delivery infrastructure:

**Platform Options:**
- Learning Management System (LMS): [Existing? Which one?]
- Security awareness vendor platform (KnowBe4, Proofpoint, etc.)
- Custom internal platform
- Hybrid approach

**Key Requirements:**
- Automated enrollment
- Completion tracking
- Compliance reporting
- Integration capabilities (HRIS, SSO)

What's your delivery platform situation?"

### 2. Enrollment Strategy

"Let's design enrollment and assignment:

**Enrollment Triggers:**
| Trigger | Courses Assigned | Timeline |
|---------|------------------|----------|
| New Hire | Onboarding bundle | Day 1-7 |
| Role Change | Role-specific track | Within 14 days |
| Annual Refresh | Core curriculum | Anniversary |
| Phishing Failure | Remedial training | Within 24-48 hrs |
| Policy Update | Updated module | Within 30 days |

**Assignment Methods:**
- Automatic via HRIS integration
- Manager-initiated
- Self-enrollment for optional content
- Event-triggered (phishing click, incident)

How do you want to handle enrollment?"

### 3. Scheduling Approach

"Let's plan the training schedule:

**Mandatory vs. Optional:**
- Which content is mandatory?
- Deadlines and grace periods?
- Consequences for non-completion?

**Time Considerations:**
- Can employees complete during work hours?
- Mobile accessibility for field workers?
- Multiple short sessions or single longer ones?

**Annual Calendar:**

| Quarter | Focus Area | Key Activities |
|---------|------------|----------------|
| Q1 | [Theme] | [Trainings, Campaigns] |
| Q2 | [Theme] | [Trainings, Campaigns] |
| Q3 | [Theme] | [Trainings, Campaigns] |
| Q4 | [Theme] | [Trainings, Campaigns] |

What scheduling approach works best?"

### 4. Communication Plan

"Let's plan program communications:

**Launch Communications:**
- Executive sponsorship message
- Program introduction email
- Manager briefing
- FAQ document

**Ongoing Communications:**
- Assignment notifications
- Reminder escalations
- Completion acknowledgments
- Monthly security tips
- Recognition/leaderboards

**Escalation for Non-Completion:**
| Day | Action | To Whom |
|-----|--------|---------|
| 0 | Assignment notification | Employee |
| 7 | First reminder | Employee |
| 14 | Second reminder | Employee + Manager |
| 21 | Final warning | Employee + Manager + HR |
| 30 | Non-compliance flag | HR process |

What communication approach fits your culture?"

### 5. Rollout Plan

"Let's plan the program rollout:

**Rollout Options:**
1. **Big Bang**: Everyone at once
   - Pros: Immediate coverage, unified message
   - Cons: Support burden, technical risk

2. **Phased by Department**: One group at a time
   - Pros: Manageable support, iterate
   - Cons: Longer to full coverage

3. **Pilot + Scale**: Small pilot, then expand
   - Pros: Validate approach, gather feedback
   - Cons: Delayed full implementation

**Recommended for your size ([X] employees):**
[Based on workforce size, recommend approach]

What rollout approach do you prefer?"

### 6. Document Delivery Strategy

Update Section 6 of {outputFile}:

```markdown
## 6. Delivery Strategy

### 6.1 Delivery Platform

**Primary Platform:** [LMS/Vendor name]
**Capabilities:**
- [Feature list]

**Integrations:**
- HRIS: [System]
- SSO: [Provider]
- Reporting: [Destination]

### 6.2 Enrollment Strategy

| Trigger | Assignment | Timeline | Owner |
|---------|------------|----------|-------|
| New Hire | Onboarding bundle | Day 1-7 | HR/IT |
| Annual | Core refresh | Anniversary | Automated |
| Phishing Fail | Remedial module | 24-48 hrs | Security |
| [User data] | | | |

### 6.3 Training Calendar

| Quarter | Theme | Training Content | Phishing Campaigns |
|---------|-------|------------------|-------------------|
| Q1 | | | |
| Q2 | | | |
| Q3 | | | |
| Q4 | | | |

### 6.4 Communication Plan

**Launch (Week 1):**
| Day | Communication | Channel | Owner |
|-----|--------------|---------|-------|
| [User data] | | | |

**Ongoing:**
[Regular communication cadence]

### 6.5 Escalation Matrix

| Days Overdue | Action | Recipients |
|--------------|--------|------------|
| 7 | First reminder | Employee |
| 14 | Second reminder | Employee + Manager |
| 21 | Final warning | Employee + Manager |
| 30 | Non-compliance flag | HR |

### 6.6 Rollout Plan

**Phase 1: Pilot**
- Target group: [Department/size]
- Duration: [X weeks]
- Success criteria: [Metrics]

**Phase 2: Expansion**
- Groups: [Rollout order]
- Timeline: [Dates]

**Phase 3: Full Deployment**
- Target date: [Date]
- All employees enrolled
```

### 7. Confirmation and Next Step

"**Delivery Strategy Complete**

I've documented:
- Platform and infrastructure confirmed
- Enrollment automation planned
- Communication plan established
- Rollout approach defined

Next, we'll define metrics and measurement.

Ready to proceed to metrics and measurement?"

## MENU

Display: **Delivery Strategy Complete - Select an Option:** [C] Continue to Metrics & Measurement [R] Review/Revise Strategy

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 6 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN delivery strategy is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
