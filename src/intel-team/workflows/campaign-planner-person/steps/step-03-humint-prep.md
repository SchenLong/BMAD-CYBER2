---
name: 'step-03-humint-prep'
description: 'Develop social engineering approaches and elicitation strategies'
estimated_duration: '15-20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-person'
thisStepFile: '{workflow_path}/steps/step-03-humint-prep.md'
nextStepFile: '{workflow_path}/steps/step-04-collection.md'
prevStepFile: '{workflow_path}/steps/step-02-pivot-mapping.md'

# Agent Configuration
executing_agent: humint-specialist
agent_codename: Viper
---

# Step 3: HUMINT Preparation

## STEP GOAL

Analyze the subject's psychology, communication patterns, and vulnerabilities to develop effective social engineering strategies. Create pretext scenarios and elicitation frameworks for potential direct engagement (if authorized).

## EXECUTION TIME: ~15-20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Viper**, HUMINT Specialist
- You develop social engineering approaches
- You create psychologically-informed engagement strategies
- You design elicitation techniques

### Step-Specific Rules
- Only develop approaches if HUMINT is authorized in Step 1
- If HUMINT not authorized, create passive psychological profile only
- All strategies must be legally and ethically defensible
- Document approaches for operational review

### Authorization Check

```
HUMINT AUTHORIZATION STATUS
===========================

From Step 1 Collection Management Plan:
□ HUMINT Authorized: [Yes/No]
□ Active Engagement Authorized: [Yes/No]
□ Contact with Subject: [Authorized/Not Authorized]
□ Contact with Associates: [Authorized/Not Authorized]

If NOT Authorized:
→ Complete psychological profiling only (Sections 1-2)
→ Skip pretext development (Sections 3-5)
→ Proceed to Step 4 for passive collection only

If Authorized:
→ Complete full HUMINT preparation
→ All sections apply
```

---

## HUMINT PREPARATION SEQUENCE

### 1. Psychological Profile

Build understanding of subject's psychology:

```
PSYCHOLOGICAL PROFILE
=====================

Personality Assessment (from content analysis):

Big Five Traits (estimated):
| Trait | Assessment | Evidence |
|-------|------------|----------|
| Openness | [High/Med/Low] | [behavioral evidence] |
| Conscientiousness | [High/Med/Low] | [behavioral evidence] |
| Extraversion | [High/Med/Low] | [behavioral evidence] |
| Agreeableness | [High/Med/Low] | [behavioral evidence] |
| Neuroticism | [High/Med/Low] | [behavioral evidence] |

Communication Style:
□ Direct vs Indirect: [assessment]
□ Formal vs Casual: [assessment]
□ Emotional vs Logical: [assessment]
□ Verbose vs Concise: [assessment]
□ Responsive vs Reserved: [assessment]

Decision-Making Patterns:
□ Impulsive vs Deliberate: [assessment]
□ Risk tolerance: [High/Med/Low]
□ Authority responsiveness: [Compliant/Questioning/Resistant]
□ Group vs Individual decision-maker: [assessment]

Trust Indicators:
- What they value: [evidence-based list]
- What they're skeptical of: [evidence-based list]
- Trust signals observed: [patterns]
```

### 2. Rapport Hooks & Vulnerabilities

Identify points of connection and potential leverage:

```
RAPPORT HOOKS
=============

Shared Interest Opportunities:
| Interest/Topic | Evidence | Rapport Potential | Approach |
|----------------|----------|-------------------|----------|
| [interest] | [where observed] | [High/Med/Low] | [how to leverage] |
| [interest] | [where observed] | [potential] | [approach] |
| [interest] | [where observed] | [potential] | [approach] |

Professional Rapport Hooks:
□ Industry knowledge: [topics they engage with]
□ Professional challenges: [problems they discuss]
□ Career aspirations: [goals mentioned]
□ Achievements to acknowledge: [accomplishments to reference]

Personal Rapport Hooks:
□ Hobbies/Recreation: [activities]
□ Family/Relationships: [appropriate references only]
□ Travel experiences: [locations]
□ Entertainment preferences: [media, sports, etc]

VULNERABILITY ASSESSMENT
========================

Potential Pressure Points (use ethically):
| Vulnerability Type | Indicator | Ethical Use Case |
|-------------------|-----------|------------------|
| Professional insecurity | [evidence] | [legitimate investigation context] |
| Financial pressure | [evidence] | [fraud investigation context] |
| Reputation sensitivity | [evidence] | [verification context] |
| Information-sharing tendency | [evidence] | [elicitation context] |
| Ego/Recognition need | [evidence] | [rapport building] |

Triggers to Avoid:
- [Topic/approach likely to cause defensive reaction]
- [Topic/approach likely to cause defensive reaction]
- [Topic/approach likely to cause defensive reaction]

Sensitivity Areas:
- [Area where subject may be protective/evasive]
- [Area where subject may be protective/evasive]
```

### 3. Pretext Development (If HUMINT Authorized)

Design cover stories for engagement:

```
PRETEXT SCENARIOS
=================

⚠️ SECTION ONLY APPLICABLE IF HUMINT AUTHORIZED IN STEP 1

Pretext 1: [Professional/Business Context]
------------------------------------------
Cover Identity: [Role to adopt]
Approach Vector: [How contact would be made]
Credibility Elements:
- [Why they would believe this pretext]
- [Supporting elements needed]
Conversation Objective: [What intelligence to gather]
Exit Strategy: [How to disengage cleanly]
Risk Assessment: [What could go wrong]

Pretext 2: [Social/Community Context]
-------------------------------------
Cover Identity: [Role to adopt]
Approach Vector: [How contact would be made]
Credibility Elements:
- [Why they would believe this pretext]
- [Supporting elements needed]
Conversation Objective: [What intelligence to gather]
Exit Strategy: [How to disengage cleanly]
Risk Assessment: [What could go wrong]

Pretext 3: [Information Seeker Context]
---------------------------------------
Cover Identity: [Role to adopt - researcher, journalist, student, etc]
Approach Vector: [How contact would be made]
Credibility Elements:
- [Why they would believe this pretext]
- [Supporting elements needed]
Conversation Objective: [What intelligence to gather]
Exit Strategy: [How to disengage cleanly]
Risk Assessment: [What could go wrong]

PRETEXT INFRASTRUCTURE REQUIREMENTS:
□ Email accounts needed: [list]
□ Social profiles needed: [list]
□ Documentation needed: [list]
□ Background story elements: [list]
□ Verification-resistant details: [list]
```

### 4. Elicitation Techniques (If HUMINT Authorized)

Design information extraction approaches:

```
ELICITATION FRAMEWORK
=====================

⚠️ SECTION ONLY APPLICABLE IF HUMINT AUTHORIZED IN STEP 1

Target Information (linked to PIRs):
| PIR | Information Needed | Elicitation Approach |
|-----|-------------------|---------------------|
| PIR-1 | [specific info] | [technique] |
| PIR-2 | [specific info] | [technique] |
| PIR-3 | [specific info] | [technique] |
| PIR-4 | [specific info] | [technique] |

Elicitation Techniques to Employ:

1. Flattery & Recognition
   - Acknowledge their expertise in: [area]
   - Ask for their opinion on: [topic]
   - Compliment their work on: [achievement]

2. Deliberate Provocation
   - Express mild disagreement on: [topic]
   - Challenge conventional view on: [subject]
   - Purpose: Trigger defensive elaboration

3. Naïve Questioning
   - Feign ignorance about: [topic they know well]
   - Ask basic questions that require detailed explanation
   - Purpose: Get them teaching/explaining

4. Quid Pro Quo
   - Offer information about: [topic of interest to them]
   - Share relevant experience in: [area]
   - Purpose: Establish reciprocity norm

5. Assumed Knowledge
   - Reference something as if commonly known
   - Imply awareness of situation
   - Purpose: Get confirmation or correction

Question Frameworks:
- Open-ended starters: [example questions]
- Follow-up probes: [example questions]
- Confirmation questions: [example questions]
- Pivot questions: [example questions]
```

### 5. Engagement Playbook (If HUMINT Authorized)

Create tactical engagement guide:

```
ENGAGEMENT PLAYBOOK
===================

⚠️ SECTION ONLY APPLICABLE IF HUMINT AUTHORIZED IN STEP 1

PHASE 1: Initial Contact
-------------------------
Timing: [Best time based on activity patterns]
Channel: [Email/Social DM/Phone/In-person]
Opening: [Exact opening line/message]
Tone: [Professional/Casual/Friendly/Urgent]

Conversation Flow:
1. Opening → [establish context]
2. Rapport building → [shared interest/hook]
3. Bridge to topic → [natural transition]
4. Information gathering → [elicitation]
5. Graceful exit → [closing]

PHASE 2: Follow-Up (if needed)
------------------------------
Timing: [Wait period]
Justification: [Reason for follow-up]
Secondary objectives: [what else to gather]

CONTINGENCY RESPONSES:

If suspicious/resistant:
→ [Approach to defuse]
→ [Exit strategy]

If overly eager/talkative:
→ [How to guide conversation]
→ [Extraction technique]

If requests verification:
→ [Verification elements prepared]
→ [Fallback if challenged]

If no response:
→ [Wait period]
→ [Alternative approach]
→ [When to abandon]

RED LINES (Do not cross):
□ Never threaten or coerce
□ Never impersonate law enforcement/government
□ Never promise things that won't be delivered
□ Never access systems/accounts without authorization
□ Document all interactions
```

---

## HUMINT PREPARATION OUTPUT

```markdown
## HUMINT PREPARATION SUMMARY

### Psychological Profile
**Personality Type:** [brief description]
**Communication Preference:** [style]
**Trust Triggers:** [what builds trust]
**Sensitivity Areas:** [what to avoid]

### Rapport Strategy
**Primary Hook:** [best connection point]
**Secondary Hooks:** [backup approaches]
**Vulnerabilities Identified:** [count] (documented for ethical use)

### HUMINT Authorization Status
**Direct Contact Authorized:** [Yes/No]
**Pretext Development:** [Complete/Not Applicable]
**Elicitation Framework:** [Complete/Not Applicable]

### Engagement Readiness
[If HUMINT Authorized:]
- Pretexts developed: [count]
- Elicitation techniques selected: [count]
- Playbook complete: [Yes/No]
- Infrastructure needed: [list or "Ready"]

[If HUMINT Not Authorized:]
- Psychological profile: Complete
- Passive collection guidance: Ready
- No active engagement planned

### Ready for Collection
Psychological understanding complete. Proceed to coordinated collection phase.
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:
- [ ] Psychological profile complete
- [ ] Rapport hooks identified
- [ ] Vulnerabilities documented (for ethical use)
- [ ] (If authorized) Pretexts developed
- [ ] (If authorized) Elicitation framework ready
- [ ] (If authorized) Engagement playbook complete

---

## MENU OPTIONS

**[C] Continue** - Proceed to collection execution (Step 4)
**[P] Profile** - Expand psychological analysis
**[E] Elicitation** - Refine elicitation techniques
**[R] Risk** - Review engagement risks

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-collection.md`
