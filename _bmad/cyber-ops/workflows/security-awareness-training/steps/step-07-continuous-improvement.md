---

name: 'step-07-continuous-improvement'
description: 'Plan program maturity roadmap, lessons learned, and annual planning'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-awareness-training'

# File References

thisStepFile: '{workflow_path}/steps/step-07-continuous-improvement.md'
outputFile: '{output_folder}/security/security-awareness-program-{project_name}.md'

---

# Step 7: Continuous Improvement Plan

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus on continuous improvement and program evolution
- This is the FINAL step - ensure comprehensive summary
- Help user plan for long-term program success

## STEP GOAL:

To create a continuous improvement plan including maturity progression, feedback mechanisms, annual planning cycles, and long-term program evolution.

## CONTINUOUS IMPROVEMENT SEQUENCE:

### 1. Program Maturity Model

"Let's assess and plan your program maturity:

**Maturity Levels:**

**Level 1 - Initial:**
- Ad-hoc training
- No formal program
- Reactive to incidents
- No metrics

**Level 2 - Developing:**
- Annual compliance training
- Basic phishing tests
- Manual tracking
- Limited metrics

**Level 3 - Defined:**
- Structured curriculum
- Regular phishing campaigns
- Automated enrollment
- Basic KPIs tracked
- Manager involvement

**Level 4 - Managed:**
- Role-based training
- Progressive phishing difficulty
- Behavior change measurement
- Department accountability
- Continuous content updates

**Level 5 - Optimizing:**
- Adaptive learning paths
- Real-time risk scoring
- Gamification and engagement
- Security culture integration
- Predictive analytics
- Industry benchmarking

Based on our program design, where do you assess your current/target maturity?"

### 2. Feedback Mechanisms

"Let's establish feedback loops:

**User Feedback:**
- Post-training surveys (after each module)
- Phishing simulation feedback
- Annual program survey
- Focus groups (quarterly)

**Stakeholder Feedback:**
- Manager effectiveness reviews
- HR partnership check-ins
- Executive sponsor updates
- Compliance/audit feedback

**Performance Feedback:**
- Metric trend analysis
- Incident correlation
- Benchmark comparison
- A/B testing results

How will you collect and act on feedback?"

### 3. Annual Planning Cycle

"Let's define your annual planning cycle:

**Q4 - Annual Review & Planning:**
- Review year's metrics
- Analyze program effectiveness
- Gather stakeholder input
- Plan next year's themes
- Budget planning

**Q1 - Content Refresh:**
- Update core curriculum
- Refresh phishing templates
- Address new threat trends
- Launch new initiatives

**Q2 - Mid-Year Assessment:**
- Review first-half metrics
- Adjust campaigns if needed
- Address struggling groups
- Plan fall activities

**Q3 - Preparation & Innovation:**
- Test new approaches
- Pilot new content
- Security awareness month planning
- Benchmark analysis

What annual cycle fits your organization?"

### 4. Improvement Initiatives

"Let's identify improvement opportunities:

**Short-term Improvements (Next 6 months):**
- [Based on current gaps identified]
- Process efficiency gains
- Content updates
- Tool optimization

**Medium-term Enhancements (6-12 months):**
- Advanced capabilities
- New training tracks
- Deeper integrations
- Expanded metrics

**Long-term Evolution (12+ months):**
- Culture transformation
- Adaptive learning
- Advanced analytics
- Industry leadership

What improvements would have the most impact?"

### 5. Document Continuous Improvement

Update Section 8 of {outputFile}:

```markdown
## 8. Continuous Improvement Plan

### 8.1 Current Maturity Assessment

**Current Level:** [1-5]
**Target Level (12 months):** [1-5]
**Target Level (24 months):** [1-5]

### 8.2 Maturity Progression Roadmap

| Timeline | Target Level | Key Capabilities to Add |
|----------|--------------|------------------------|
| Current | Level [X] | Baseline |
| 6 months | Level [X] | [Specific capabilities] |
| 12 months | Level [X] | [Specific capabilities] |
| 24 months | Level [X] | [Specific capabilities] |

### 8.3 Feedback Mechanisms

| Feedback Type | Method | Frequency | Owner | Action Process |
|---------------|--------|-----------|-------|----------------|
| User Survey | Post-training | Per module | Security | Quarterly review |
| Focus Groups | Meeting | Quarterly | Security | Incorporate feedback |
| Metrics Review | Analysis | Monthly | Security | Adjust tactics |
| [User data] | | | | |

### 8.4 Annual Planning Calendar

| Quarter | Focus | Key Activities |
|---------|-------|----------------|
| Q1 | Content Refresh | Update curriculum, new threats |
| Q2 | Mid-Year Review | Assess progress, adjust |
| Q3 | Innovation | Pilot new approaches |
| Q4 | Annual Planning | Review, plan, budget |

### 8.5 Improvement Roadmap

**Phase 1: Foundation (Months 1-6)**
| Initiative | Impact | Effort | Owner | Target Date |
|------------|--------|--------|-------|-------------|
| [User data] | | | | |

**Phase 2: Enhancement (Months 7-12)**
| Initiative | Impact | Effort | Owner | Target Date |
|------------|--------|--------|-------|-------------|
| [User data] | | | | |

**Phase 3: Evolution (Year 2+)**
| Initiative | Impact | Effort | Owner | Target Date |
|------------|--------|--------|-------|-------------|
| [User data] | | | | |

### 8.6 Success Criteria

| Milestone | Metric | Target | Date |
|-----------|--------|--------|------|
| [User data] | | | |

### 8.7 Next Review Date

**Quarterly Review:** [Date]
**Annual Assessment:** [Date]
```

### 6. Finalize Document

"Let me complete the Executive Summary:

Update Section 1 of {outputFile}:

```markdown
## 1. Executive Summary

This Security Awareness Training Program establishes a comprehensive approach to reducing human-layer security risk for {project_name}.

**Program Scope:**
- [X] employees across [X] departments
- Compliance requirements: [Frameworks]
- Primary threats addressed: [List]

**Key Components:**
- Core curriculum: [X] modules
- Role-based tracks: [X] specialized tracks
- Phishing simulation: [Frequency] campaigns
- Delivery via: [Platform]

**Success Metrics:**
- Target phishing click rate: [X]%
- Target report rate: [X]%
- Target training completion: [X]%

**Program Maturity:**
- Current level: [X]
- 12-month target: [X]

**Next Steps:**
1. [Immediate action]
2. [Week 1 priorities]
3. [Month 1 goals]
```

### 7. Workflow Complete

"**Security Awareness Training Workflow Complete!**

I've finalized your comprehensive Security Awareness Training Program including:

**Documented Deliverables:**
1. Executive Summary
2. Program Overview with current state
3. Human Risk Assessment
4. Training Content Design
5. Phishing Simulation Strategy
6. Delivery Strategy
7. Metrics & Measurement Framework
8. Continuous Improvement Plan

**Immediate Actions:**
- Secure executive sponsorship
- Configure training platform
- Develop/source content
- Plan pilot deployment
- Schedule launch communications

Your complete program is saved at:
`{outputFile}`

Would you like help with any specific area, or shall we conclude?"

## FINAL MENU

Display: **Workflow Complete - Select an Option:** [E] Export/Review Final Document [Q] Ask Questions [D] Done - Conclude Workflow

#### Menu Handling Logic:

- IF E: Display complete document or provide export guidance
- IF Q: Answer questions about any section
- IF D: Mark workflow complete, update frontmatter with `workflowComplete: true` and `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`

---

## CRITICAL STEP COMPLETION NOTE

This is the FINAL step. When user selects 'D' (Done):
1. Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`
2. Add `workflowComplete: true` to frontmatter
3. Add `completedDate: [current date]` to frontmatter
4. Congratulate user on completing the security awareness program

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
