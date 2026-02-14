# Select Team Orchestration Template - Instructions

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: select-template/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Present orchestration templates">
<output>
# Team Orchestration Templates

Select a pre-built orchestration template for multi-module project execution.

---

## Available Templates

### 1. Secure Software Development
**Modules:** BMM + Cybersec-Team + Legal-Team
**Best for:** Fintech, healthcare, enterprise software

**Flow:**
```
PRD → Threat Model → Compliance Check → Architecture →
Security Review → Stories → Implementation with Security Gates
```

**Phase Gates:** Pre-Architecture, Pre-Implementation (secure), Pre-Release (secure)

---

### 2. Incident Response Coordination
**Modules:** Cybersec-Team + Intel-Team + Legal-Team + Strategy-Team
**Best for:** Security incidents, data breaches

**Flow:**
```
Detection → Attribution + Legal (parallel) →
Communications → Eradication → Lessons Learned
```

**Features:** Timeline tracking, GDPR deadlines, War Room mode

---

### 3. Strategic Product Decision
**Modules:** BMM + Strategy-Team + Legal-Team
**Best for:** Build vs buy, M&A, market entry

**Flow:**
```
Research → Strategic Analysis → Legal Risk →
Decision Workshop → Implementation Roadmap
```

**Features:** Multi-perspective analysis, 14 strategic advisors

---

### 4. Compliance-First Software
**Modules:** Legal-Team + BMM + Cybersec-Team
**Best for:** GDPR, HIPAA, PCI-DSS, SOC 2 projects

**Flow:**
```
Compliance Requirements → Architecture → Controls Mapping →
Implementation → Audit Prep → Penetration Test
```

**Features:** Control traceability, audit evidence collection

---

## Utility Workflows

### Phase Gate Check
Validate readiness for phase transitions with artifact and signoff checks.

### Conflict Resolution
Resolve conflicts between teams during orchestration.

---
</output>

<ask>Select a template or utility:

1. **Secure Software** - Security-integrated development
2. **Incident Response** - Coordinated incident handling
3. **Strategic Decision** - Multi-perspective decision making
4. **Compliance-First** - Regulated industry development
5. **Phase Gate** - Check phase transition readiness
6. **Conflict Resolution** - Resolve team conflicts
7. **Describe scenario** - Get recommendation

Choice [1-7]:</ask>
<action>Store as template_choice</action>
</step>

<step n="2" goal="Process selection">
<check if="template_choice == 1">
  <output>Invoking Secure Software Development orchestration...</output>
  <action>Load and follow{templates.secure-software.path}</action>
</check>

<check if="template_choice == 2">
  <output>Invoking Incident Response Coordination orchestration...</output>
  <action>Load and follow{templates.incident-response.path}</action>
</check>

<check if="template_choice == 3">
  <output>Invoking Strategic Decision orchestration...</output>
  <action>Load and follow{templates.strategic-decision.path}</action>
</check>

<check if="template_choice == 4">
  <output>Invoking Compliance-First Development orchestration...</output>
  <action>Load and follow{templates.compliance-first.path}</action>
</check>

<check if="template_choice == 5">
  <output>Invoking Phase Gate check...</output>
  <action>Load and follow{phase_gate}</action>
</check>

<check if="template_choice == 6">
  <output>Invoking Conflict Resolution...</output>
  <action>Load and follow{conflict_resolution}</action>
</check>

<check if="template_choice == 7">
  <ask>Describe your project scenario:

- What are you building/doing?
- What teams/expertise do you need?
- Any specific constraints (regulatory, timeline, etc.)?

Scenario:</ask>
  <action>Store as scenario_description</action>
  <action>Goto step 3</action>
</check>
</step>

<step n="3" goal="Recommend template based on scenario">
<action>Analyze scenario_description for keywords:

security, threat, vulnerability → secure-software
incident, breach, attack, compromised → incident-response
decision, strategy, buy, build, m&a, acquisition → strategic-decision
compliance, gdpr, hipaa, pci, audit, regulated → compliance-first
</action>

<output>
## Recommended Template

Based on your scenario, I recommend:

**{recommended_template.name}**

**Why:**
{recommendation_reason}

**Modules Involved:**
{recommended_template.modules}

**Key Features:**
{{#each recommended_template.features}}
- {feature}
{{/each}}

---
</output>

<ask>Use this template?

1. **Yes** - Start {recommended_template.name}
2. **No** - Choose different template
3. **Customize** - Modify for my needs

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <action>Load and followrecommended template</action>
</check>

<check if="choice == 2">
  <action>Return to step 1</action>
</check>

<check if="choice == 3">
  <ask>What customizations do you need?

- Add/remove modules?
- Skip certain phases?
- Different phase gates?

Customizations:</ask>
  <action>Store customizations</action>
  <output>Starting {recommended_template.name} with customizations noted.

The template will be adjusted during execution.</output>
  <action>Load and followrecommended template with customization context</action>
</check>
</step>

</workflow>
