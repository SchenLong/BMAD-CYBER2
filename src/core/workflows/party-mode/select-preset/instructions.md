# Select Party Mode Preset - Instructions

<critical>The workflow execution engine is governed by: {project-root}/src/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: select-preset/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Load presets and present options">
<action>Load {presets_file}</action>
<action>Parse all preset definitions</action>

<output>
# Cross-Module Party Mode Presets

Select a pre-configured team for your collaboration session:

---

**1. Security Review Team**

- Winston (Architect) + Bastion (Security Architect) + Cipher (Threat Analyst)
- Use for: Architecture security review, threat modeling

**2. Incident Response War Room**

- Phoenix (Incident Commander) + Vector (Intel Lead) + Giuseppe (Comms) + Counsel (Legal)
- Use for: Active security incidents, breach response

**3. Compliance Audit Team**

- Europa (GDPR) + Sentinel (Security Controls) + Murat (Testing/Evidence)
- Use for: Audit preparation, compliance assessment

**4. Strategic Advisory Board**

- Sun Tzu (Strategy) + Magnus (Politics) + Counsel (Legal) + John (Product)
- Use for: Major strategic decisions, M&A, pivots

**5. Game Launch Team**

- Samus Shepard (Game Design) + Counsel (Legal) + Giuseppe (Comms)
- Use for: Game release preparation, monetization review

**6. Threat Intelligence Fusion**

- Vector (Intel) + Dossier (Profiler) + Cipher (Threat) + Trace (Forensics)
- Use for: APT analysis, attribution, threat hunting

**7. Product Security Launch**

- John (PM) + Bastion (Security) + Ghost (Pen Test) + Murat (QA)
- Use for: Pre-release security validation

**8. Legal Risk Assessment Team**

- Counsel + Europa + Advocate + Augustus (Policy)
- Use for: Multi-jurisdiction risk analysis, expansion

---
</output>

<ask>Select a preset (1-8), or describe your scenario for a custom recommendation:

<action>Store response as user_selection</action>
</step>

<step n="2" goal="Process selection">
<check if="user_selection is number 1-8">
  <action>Map number to preset_id:
    1 = security-review-team
    2 = incident-war-room
    3 = compliance-audit-team
    4 = strategic-advisors
    5 = game-launch-team
    6 = threat-intel-fusion
    7 = product-security-launch
    8 = legal-risk-team
  </action>
  <action>Load selected preset details</action>
  <action>Goto step 3</action>
</check>

<check if="user_selection is text description">
  <action>Analyze description for keywords</action>
  <action>Match against preset_index.by_scenario</action>
  <action>Recommend best matching preset</action>

  <output>Based on your description, I recommend:

**{recommended_preset.name}**
{recommended_preset.description}

**Agents:**
{{#each recommended_preset.agents}}

- {name} ({role})
{{/each}}
</output>

  <ask>Use this preset? [Y/N/Other]:</ask>
  <check if="Y">
    <action>Set selected_preset to recommended_preset</action>
    <action>Goto step 3</action>
  </check>
  <check if="N or Other">
    <action>Return to step 1</action>
  </check>
</check>

</step>

<step n="3" goal="Confirm preset and gather context">
<output>
=== SELECTED PRESET ===

**{selected_preset.name}**
{selected_preset.description}

**Agents to join:**
{{#each selected_preset.agents}}

- **{name}** ({module}:{agent})
  Role: {role}
{{/each}}

**When to use:**
{selected_preset.use_when}

**Artifacts needed:**
{{#each selected_preset.artifacts_needed}}

- {artifact}
{{/each}}

**Expected outputs:**
{{#each selected_preset.expected_outputs}}

- {output}
{{/each}}

---
</output>

<ask>Would you like to:

1. **Start Party Mode** with this team now
2. **Add/remove agents** before starting
3. **Provide context** for the discussion first
4. **Choose different preset**
5. **Cancel**

Choice [1-5]:</ask>
<action>Store as action_choice</action>
</step>

<step n="4" goal="Execute choice">
<check if="action_choice == 1">
  <output>Starting Party Mode with {selected_preset.name}...

**Pre-selected agents:**
{{#each selected_preset.agents}}

- {name} from {module}
{{/each}}

Initiating discussion...</output>

  <action>Set party_mode_agents to selected_preset.agents</action>
  <action>Load and follow{party_mode_workflow} with pre-selected agents</action>
</check>

<check if="action_choice == 2">
  <output>Current team:</output>
  <action>List all agents in preset with numbers</action>

  <ask>Enter agent names to ADD (comma-separated), or prefix with - to REMOVE:
Example: "penetration-tester" to add, "-cipher" to remove

Modifications:</ask>

  <action>Parse modifications</action>
  <action>Update agent list</action>
  <action>Return to step 3 with updated list</action>
</check>

<check if="action_choice == 3">
  <ask>Provide context for the discussion:

What topic or situation should the team address?

Context:</ask>
  <action>Store as discussion_context</action>

  <output>Context captured. The team will focus on:
"{discussion_context}"

Starting Party Mode...</output>

  <action>Load and follow{party_mode_workflow} with pre-selected agents and context</action>
</check>

<check if="action_choice == 4">
  <action>Return to step 1</action>
</check>

<check if="action_choice == 5">
  <output>Preset selection cancelled.</output>
  <action>Exit workflow</action>
</check>
</step>

</workflow>
