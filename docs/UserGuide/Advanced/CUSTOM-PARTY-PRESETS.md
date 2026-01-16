# Custom Party Presets Guide

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** Advanced users, module developers

---

## Overview

Party Mode enables multi-agent collaboration where specialized AI personas work together on complex problems. Party Presets are pre-configured agent groups optimized for specific scenarios. This guide shows you how to create custom presets tailored to your organization's needs.

---

## Prerequisites

Before creating custom presets:

- [ ] Understanding of available agents across modules (see `_bmad/_config/agent-manifest.csv`)
- [ ] Familiarity with party mode usage (see [Party Mode Guide](../PARTY-MODE-GUIDE.md))
- [ ] Clear use case that benefits from multi-agent collaboration
- [ ] Write access to `_bmad/core/workflows/party-mode/presets/`

---

## Preset Architecture

### File Location

Party mode presets are defined in:
```
_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml
```

### Preset Structure

Each preset contains:

| Component | Purpose | Required |
|-----------|---------|----------|
| `name` | Display name | Yes |
| `description` | What the preset does | Yes |
| `use_when` | Scenario trigger | Yes |
| `agents` | Participant roster | Yes |
| `recommended_for` | Specific use cases | Recommended |
| `artifacts_needed` | Input requirements | Recommended |
| `expected_outputs` | Deliverables | Recommended |

---

## Step-by-Step Creation

### Step 1: Identify the Use Case

Before defining a preset, answer these questions:

1. **What problem does this solve?**
   - Example: "We need security, legal, and compliance perspectives on architecture decisions"

2. **Why do multiple agents help?**
   - Different expertise areas
   - Adversarial review (one challenges, another defends)
   - Parallel analysis from different angles

3. **What failure mode does this prevent?**
   - Example: "Prevents shipping features with undiscovered compliance gaps"

4. **When should users invoke this preset?**
   - Example: "Before any architecture decision affecting user data"

### Step 2: Select the Agents

Browse available agents:

```bash
# View all agents
cat _bmad/_config/agent-manifest.csv

# Filter by module
grep "cybersec-team" _bmad/_config/agent-manifest.csv
grep "legal-team" _bmad/_config/agent-manifest.csv
grep "strategy-team" _bmad/_config/agent-manifest.csv
```

**Agent Selection Guidelines:**

| Principle | Description |
|-----------|-------------|
| Diversity | Choose agents with different perspectives |
| Relevance | Each agent should have clear value for the scenario |
| Balance | Avoid overloading with too many agents (3-5 optimal) |
| Synergy | Agents should complement, not duplicate each other |

### Step 3: Define Agent Roles

For each agent in your preset, specify their role in this specific context:

```yaml
agents:
  - module: cybersec-team
    agent: security-architect
    name: "Bastion"
    role: "Reviews architecture for security vulnerabilities and attack vectors"

  - module: legal-team
    agent: europa
    name: "Europa"
    role: "Evaluates GDPR compliance and data protection requirements"

  - module: strategy-team
    agent: the-realist
    name: "Bismarck"
    role: "Assesses practical implementation challenges and resource constraints"
```

**Role Guidelines:**
- Be specific to this preset's context
- Explain what unique perspective this agent brings
- Use active verbs (reviews, evaluates, challenges, proposes)

### Step 4: Write the Preset Definition

Add your preset to `cross-module-groups.yaml`:

```yaml
presets:
  # ... existing presets ...

  your-preset-id:
    name: "Your Preset Display Name"
    description: "Brief description of what this preset accomplishes"

    use_when: "Scenario description - when should users choose this preset?"

    recommended_for:
      - "Specific use case 1"
      - "Specific use case 2"
      - "Specific use case 3"

    agents:
      - module: module-name
        agent: agent-id
        name: "Display Name"
        role: "Their specific role in this collaboration"

      - module: another-module
        agent: another-agent
        name: "Another Name"
        role: "Their specific role in this collaboration"

      - module: third-module
        agent: third-agent
        name: "Third Name"
        role: "Their specific role in this collaboration"

    artifacts_needed:
      - "architecture.md (required)"
      - "prd.md (optional but helpful)"
      - "threat-model.yaml (if available)"

    expected_outputs:
      - "review-findings.md"
      - "recommendations.md"
      - "action-items.md"

    # Optional additional context
    failure_mode_addressed: "What bad outcome does this prevent?"

    timeline_constraints:
      - "Best completed before sprint planning"
      - "Allow 2-3 hours for thorough review"
```

### Step 5: Add to Preset Index

Update the quick reference index at the bottom of the file:

```yaml
preset_index:
  by_scenario:
    # ... existing entries ...
    your_scenario: "your-preset-id"

  by_module_combination:
    # ... existing entries ...
    cybersec_legal_strategy: ["your-preset-id", "other-related-preset"]

  by_urgency:
    # ... existing entries ...
    high: ["incident-war-room", "your-preset-id"]  # if applicable
```

---

## Complete Preset Template

```yaml
  compliance-architecture-review:
    name: "Compliance Architecture Review"
    description: "Multi-perspective review of system architecture for security and regulatory compliance"

    use_when: "Before finalizing architecture decisions that affect user data, authentication, or regulatory scope"

    recommended_for:
      - "New system architecture review before implementation"
      - "Major refactoring affecting data flows"
      - "Adding new data collection or processing capabilities"
      - "Expanding to new geographic regions (GDPR, CCPA, etc.)"
      - "Pre-audit architecture validation"

    agents:
      - module: cybersec-team
        agent: security-architect
        name: "Bastion"
        role: "Security architecture review - identifies vulnerabilities, attack surfaces, and security gaps"

      - module: legal-team
        agent: europa
        name: "Europa"
        role: "EU regulatory compliance - GDPR requirements, data protection impact assessment"

      - module: legal-team
        agent: liberty
        name: "Liberty"
        role: "US regulatory compliance - CCPA, HIPAA, SOC2 requirements"

      - module: strategy-team
        agent: the-realist
        name: "Bismarck"
        role: "Practical implementation assessment - resource constraints, timeline feasibility"

    artifacts_needed:
      - "architecture.md (required) - System architecture document"
      - "data-flow-diagram.md (required) - How data moves through the system"
      - "prd.md (optional) - Product requirements for context"
      - "existing-compliance-docs.md (optional) - Current compliance certifications"

    expected_outputs:
      - "compliance-review-findings.md - Consolidated findings from all reviewers"
      - "security-gaps.md - Security vulnerabilities and remediation priorities"
      - "regulatory-requirements.md - Compliance requirements by jurisdiction"
      - "implementation-recommendations.md - Practical next steps"

    failure_mode_addressed: "Prevents shipping systems with undiscovered compliance gaps that could result in regulatory fines, data breaches, or costly remediation"

    timeline_constraints:
      - "Complete before architecture finalization"
      - "Allow 3-4 hours for thorough cross-functional review"
      - "Schedule follow-up session if major issues found"

    discussion_format:
      - "Bastion presents security assessment first"
      - "Europa and Liberty add regulatory overlay"
      - "Bismarck provides reality check on implementation"
      - "Round-robin discussion of key findings"
      - "Consensus on priorities and next steps"
```

---

## Preset Categories

Organize your presets by common patterns:

### Security & Architecture

```yaml
# Pattern: Technical expert + adversarial reviewer + compliance
security-review-team:
  agents:
    - security-architect     # Presents architecture
    - threat-analyst         # Challenges from adversary perspective
    - compliance-specialist  # Regulatory overlay
```

### Crisis & Incident Response

```yaml
# Pattern: Technical response + communications + legal protection
incident-war-room:
  agents:
    - incident-responder     # Technical containment
    - communications-director # Stakeholder messaging
    - counsel                # Legal risk mitigation
```

### Strategic Decision Making

```yaml
# Pattern: Multiple strategic philosophies + practical assessment
strategic-decision-validated:
  agents:
    - the-master-strategist  # Long-term vision
    - the-conservative       # Risk assessment
    - the-realist            # Implementation feasibility
```

### Cross-Functional Review

```yaml
# Pattern: Domain expert + adjacent domain + business context
product-security-launch:
  agents:
    - product-manager        # Feature requirements
    - security-architect     # Security requirements
    - legal-counsel          # Compliance requirements
```

---

## Best Practices

### Agent Selection

1. **3-5 agents optimal** - Too few lacks diversity, too many creates noise
2. **Include at least one "challenger"** - Someone to push back on assumptions
3. **Balance technical and business** - Pure technical teams miss context
4. **Consider communication styles** - Mix direct and diplomatic voices

### Role Definition

1. **Be specific** - "Reviews security" is vague; "Identifies authentication vulnerabilities" is specific
2. **Avoid overlap** - Each agent should have unique value
3. **Define interaction** - Who presents first? Who challenges?

### Use Case Clarity

1. **Concrete scenarios** - Not "when you need help" but "before finalizing data schemas"
2. **Trigger conditions** - What makes this preset appropriate?
3. **Anti-patterns** - When should users NOT use this preset?

### Expected Outputs

1. **Specific artifacts** - Name the files that will be produced
2. **Clear ownership** - Which agent produces which output?
3. **Actionable deliverables** - Findings should lead to next steps

---

## Testing Your Preset

### Manual Testing Checklist

- [ ] YAML syntax is valid
- [ ] All referenced agents exist in manifest
- [ ] Agent names match manifest entries
- [ ] Roles are specific and non-overlapping
- [ ] Use cases are clear and actionable
- [ ] Artifacts needed are realistic
- [ ] Expected outputs are specific

### Validation Commands

```bash
# Validate YAML syntax
python -c "import yaml; yaml.safe_load(open('_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'))"

# Check all agents exist
for agent in $(grep "agent:" cross-module-groups.yaml | awk '{print $2}'); do
  grep -q "$agent" _bmad/_config/agent-manifest.csv || echo "Missing: $agent"
done
```

### Test Invocation

```bash
# Invoke your preset through party mode
# In Claude Code, use Abdul or direct skill invocation:
# /bmad:core:workflows:party-mode
# Then select your preset
```

---

## Advanced Patterns

### Dynamic Agent Selection

For presets where agents vary based on context:

```yaml
dynamic-review-team:
  name: "Dynamic Review Team"
  description: "Automatically selects agents based on artifact type"

  agent_selection_rules:
    - condition: "artifact contains 'security'"
      include: ["security-architect", "threat-analyst"]
    - condition: "artifact contains 'legal' or 'compliance'"
      include: ["counsel", "europa"]
    - condition: "artifact contains 'architecture'"
      include: ["architect", "security-architect"]

  minimum_agents: 3
  maximum_agents: 5
```

### Staged Presets

For multi-phase collaboration:

```yaml
phased-architecture-review:
  name: "Phased Architecture Review"
  description: "Three-stage review process"

  phases:
    - phase: 1
      name: "Technical Review"
      agents: ["architect", "security-architect"]
      duration: "1 hour"
      output: "technical-findings.md"

    - phase: 2
      name: "Compliance Review"
      agents: ["counsel", "europa"]
      input: "technical-findings.md"
      duration: "1 hour"
      output: "compliance-findings.md"

    - phase: 3
      name: "Strategic Synthesis"
      agents: ["the-master-strategist", "the-realist"]
      input: ["technical-findings.md", "compliance-findings.md"]
      duration: "30 minutes"
      output: "final-recommendations.md"
```

### Adversarial Presets

For red team / blue team dynamics:

```yaml
adversarial-security-review:
  name: "Adversarial Security Review"
  description: "Red team challenges blue team's architecture"

  teams:
    red_team:
      role: "Attack the proposed architecture"
      agents: ["threat-analyst", "dark-web-analyst"]

    blue_team:
      role: "Defend and improve the architecture"
      agents: ["security-architect", "incident-responder"]

  format:
    - "Blue team presents architecture"
    - "Red team identifies attack vectors"
    - "Blue team proposes mitigations"
    - "Red team challenges mitigations"
    - "Synthesis of improvements"
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Preset not found | Not in YAML file | Add to `cross-module-groups.yaml` |
| Agent not loading | Wrong agent ID | Verify against `agent-manifest.csv` |
| Wrong agent persona | Name mismatch | Ensure `name` matches agent's display name |
| Outputs not generated | Missing artifact paths | Define `expected_outputs` clearly |
| Agents talking past each other | Roles too vague | Make roles more specific |
| Session too long | Too many agents | Reduce to 3-5 most essential |

---

## Example Presets by Domain

### For Security Teams

```yaml
threat-model-validation:
  agents:
    - threat-analyst       # Threat identification
    - security-architect   # Control recommendations
    - field-operative      # Physical security perspective
```

### For Legal Teams

```yaml
contract-risk-review:
  agents:
    - covenant             # Contract specialist
    - counsel              # General legal oversight
    - tribute              # Tax implications
```

### For Strategy Teams

```yaml
competitive-analysis:
  agents:
    - the-master-strategist  # Strategic positioning
    - the-conservative       # Risk assessment
    - the-technocrat         # Technical feasibility
```

### For Product Teams (BMM)

```yaml
prd-validation:
  agents:
    - pm                     # Product requirements
    - architect              # Technical feasibility
    - security-architect     # Security requirements
```

### For Cross-Module

```yaml
incident-response-full:
  agents:
    - incident-responder     # Technical response (cybersec)
    - counsel                # Legal protection (legal)
    - communications-director # External messaging (strategy)
    - osint-lead             # Threat intelligence (intel)
```

---

## Related Documentation

- [Party Mode Guide](../PARTY-MODE-GUIDE.md)
- [Custom Agent Creation](./CUSTOM-AGENT-CREATION.md)
- [Custom Workflow Creation](./CUSTOM-WORKFLOW-CREATION.md)
- [Party Mode Examples](../Examples/PARTY-MODE-EXAMPLES.md)

---

## Appendix: Full Preset Schema

```yaml
preset-id:                           # Unique identifier (kebab-case)
  name: string                       # Display name (required)
  description: string                # Brief description (required)
  use_when: string                   # Scenario trigger (required)

  recommended_for:                   # Specific use cases (recommended)
    - string
    - string

  agents:                            # Participant roster (required)
    - module: string                 # Module containing agent
      agent: string                  # Agent ID from manifest
      name: string                   # Display name
      role: string                   # Role in this preset

  artifacts_needed:                  # Input requirements (recommended)
    - string

  expected_outputs:                  # Deliverables (recommended)
    - string

  failure_mode_addressed: string     # What this prevents (optional)

  timeline_constraints:              # Timing guidance (optional)
    - string

  discussion_format:                 # How collaboration flows (optional)
    - string

  # Advanced options
  agent_selection_rules:             # Dynamic selection (optional)
    - condition: string
      include: [string]

  phases:                            # Staged execution (optional)
    - phase: number
      name: string
      agents: [string]
      duration: string
      output: string

  teams:                             # Adversarial setup (optional)
    team_name:
      role: string
      agents: [string]
```
