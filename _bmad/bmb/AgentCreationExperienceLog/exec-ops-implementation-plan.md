# Executive Operations Module - Implementation Plan

**Module ID:** exec-ops
**Full Name:** Executive Leadership & Decision-Making Module
**Version:** 1.0.0
**Created:** 2026-01-09
**Based On:** MODULE-CREATION-PLAYBOOK.md + cyber-ops deployment experience

---

## Executive Summary

This document provides the complete implementation plan for the exec-ops module, structured as epics and user stories following our proven playbook from cyber-ops deployment. The plan is designed to be executed sequentially, with clear acceptance criteria and dependencies.

**Total Scope:**
- 14 Agents (6 Modern Professional + 8 Historical Archetype)
- 0 Workflows in v1.0 (agents-first approach, workflows in v1.1)
- Full Party Mode integration
- Complete documentation

---

## Implementation Phases Overview

| Phase | Epic | Stories | Est. Effort |
|-------|------|---------|-------------|
| 1 | Module Foundation | 4 | Low |
| 2 | Template Agent (First Agent) | 5 | Medium |
| 3 | Modern Professional Agents | 6 | Medium |
| 4 | Historical Archetype Agents | 8 | Medium |
| 5 | Registration & Commands | 3 | Low |
| 6 | Testing & Validation | 4 | Medium |
| 7 | Production Cleanup | 3 | Low |

**Total Stories:** 33

---

## Epic 1: Module Foundation

**Goal:** Create the module structure, configuration, and documentation foundation.

**Dependencies:** None (starting point)

**Acceptance Criteria:**
- [ ] Module directory structure exists
- [ ] config.yaml is valid and complete
- [ ] module.yaml metadata is accurate
- [ ] README.md provides comprehensive overview
- [ ] Output directories exist

---

### Story 1.1: Create Module Directory Structure

**As a** module developer
**I want** the complete directory structure for exec-ops
**So that** I have organized locations for all module components

**Tasks:**
1. Create `_bmad/exec-ops/` root directory
2. Create `_bmad/exec-ops/agents/` for agent files
3. Create `_bmad/exec-ops/workflows/` for future workflows
4. Create `_bmad/exec-ops/data/` for reference data
5. Create `_bmad/exec-ops/templates/` for output templates
6. Create `_output/exec-ops/` for generated outputs

**Acceptance Criteria:**
```bash
ls -la _bmad/exec-ops/
# Should show: agents/ workflows/ data/ templates/

ls -la _output/exec-ops/
# Should exist
```

---

### Story 1.2: Create Module Configuration (config.yaml)

**As a** module user
**I want** a configuration file that personalizes my experience
**So that** agents address me by name and use my preferences

**Tasks:**
1. Create `_bmad/exec-ops/config.yaml`
2. Include module identity fields
3. Include user configuration fields
4. Include module path variables
5. Include exec-ops specific fields (organization context)

**Configuration Schema:**
```yaml
# Executive Operations Module Configuration
module_name: exec-ops
full_name: Executive Leadership & Decision-Making Module
version: 1.0.0
created_date: 2026-01-09
status: production

# User Configuration
user_name: Executive
user_title: Leader
communication_language: English
document_output_language: English
formality_level: executive  # professional | executive | board

# Module Paths
module_root: "{project-root}/_bmad/exec-ops"
workflows_path: "{project-root}/_bmad/exec-ops/workflows"
agents_path: "{project-root}/_bmad/exec-ops/agents"
output_folder: "{project-root}/_output/exec-ops"

# Executive Context (optional, for personalization)
executive_context:
  organization_name: ""
  industry: ""
  role_level: ""  # C-suite | VP | Director | Manager
```

**Acceptance Criteria:**
- [ ] config.yaml is valid YAML
- [ ] All required fields present
- [ ] {project-root} variables used for paths

---

### Story 1.3: Create Module Metadata (module.yaml)

**As a** BMAD system
**I want** module metadata
**So that** I can discover and manage this module

**Tasks:**
1. Create `_bmad/exec-ops/module.yaml`
2. List all 14 agents
3. Document capabilities
4. Specify dependencies

**Acceptance Criteria:**
- [ ] module.yaml is valid YAML
- [ ] All 14 agents listed
- [ ] Accurate capabilities listed

---

### Story 1.4: Create Module Documentation (README.md)

**As a** module user
**I want** comprehensive documentation
**So that** I understand what this module offers

**Tasks:**
1. Create `_bmad/exec-ops/README.md`
2. Write overview section
3. Document all 14 agents with descriptions
4. Document installation/usage
5. Include examples

**Acceptance Criteria:**
- [ ] README.md exists and is well-formatted
- [ ] All 14 agents documented
- [ ] Usage examples included

---

## Epic 2: Template Agent Development

**Goal:** Build the first agent completely as a template for all others.

**Dependencies:** Epic 1 complete

**Template Agent:** `policy-analyst` (Augustus)

**Why this agent first:**
- Modern professional (simpler than historical archetype)
- Data-driven persona is straightforward to implement
- Good baseline for testing config loading

**Acceptance Criteria:**
- [ ] Agent loads via command
- [ ] Config loads successfully
- [ ] Greeting shows user name
- [ ] All menu items work
- [ ] Agent stays in character
- [ ] Ready to serve as template

---

### Story 2.1: Create Policy Analyst Agent File

**As a** user
**I want** the policy-analyst agent
**So that** I can get evidence-based policy analysis

**Tasks:**
1. Create `_bmad/exec-ops/agents/policy-analyst.md`
2. Implement full agent XML structure
3. Implement activation steps (especially step 2 config loading)
4. Implement Augustus persona (detailed)
5. Implement menu items (6-8 domain items)
6. Include Party Mode integration

**Agent Details:**
```yaml
agent_id: policy-analyst
display_name: Augustus
icon: 📊
title: Evidence-Based Policy Expert
```

**Persona Elements:**
- Role: Policy Research Analyst + Evidence Synthesizer
- Identity: 20+ years at think tanks, PhD Harvard Kennedy School
- Style: Data-driven, citation-heavy, "The evidence suggests..."
- Principles: Evidence over ideology, analyze unintended consequences

**Menu Items:**
1. [MH] Menu Help
2. [CH] Chat
3. [PA] Policy Analysis - Analyze a policy proposal
4. [IA] Impact Assessment - Regulatory impact analysis
5. [CP] Comparative Policy - Compare approaches across jurisdictions
6. [ES] Evidence Synthesis - Summarize research on a topic
7. [UC] Unintended Consequences - Identify potential side effects
8. [PM] Party Mode
9. [DA] Dismiss Agent

**Acceptance Criteria:**
- [ ] Agent file follows playbook template exactly
- [ ] Persona is detailed and distinctive
- [ ] Menu has 9+ items
- [ ] All paths use {project-root}

---

### Story 2.2: Register Template Agent in Manifest

**As a** BMAD system
**I want** the agent registered in the manifest
**So that** it can be discovered

**Tasks:**
1. Add policy-analyst entry to `_bmad/_config/agent-manifest.csv`
2. Create `_bmad/_config/agents/exec-ops-policy-analyst.customize.yaml`

**Manifest Entry:**
```csv
exec-ops,policy-analyst,Augustus,📊,Evidence-Based Policy Expert
```

**Acceptance Criteria:**
- [ ] Entry in agent-manifest.csv
- [ ] Customize file exists

---

### Story 2.3: Create Template Agent Command Wrapper

**As a** user
**I want** to invoke the agent via `/policy-analyst`
**So that** I can easily access it

**Tasks:**
1. Create `.claude/commands/bmad/exec-ops/agents/` directory
2. Create `.claude/commands/bmad/exec-ops/agents/policy-analyst.md`

**Acceptance Criteria:**
- [ ] Command wrapper exists
- [ ] References correct agent file path

---

### Story 2.4: Test Template Agent Completely

**As a** developer
**I want** to verify the template agent works perfectly
**So that** I can use it as the basis for all other agents

**Test Checklist:**
1. [ ] Command `/policy-analyst` recognized
2. [ ] Agent file loads
3. [ ] Config loads (no errors)
4. [ ] Greeting shows correct user name
5. [ ] Menu displays all items
6. [ ] [MH] redisplays menu
7. [ ] [CH] enables chat in character
8. [ ] [PA] performs policy analysis
9. [ ] [PM] loads party mode
10. [ ] [DA] dismisses agent properly
11. [ ] Agent stays in character throughout
12. [ ] Signature phrases used

**Acceptance Criteria:**
- [ ] All 12 test items pass
- [ ] Agent ready to serve as template

---

### Story 2.5: Document Template Agent Patterns

**As a** developer
**I want** documented patterns from the template agent
**So that** I can replicate them efficiently

**Tasks:**
1. Note what worked well
2. Note any adjustments needed
3. Create copy-paste template sections

**Acceptance Criteria:**
- [ ] Patterns documented for remaining agents

---

## Epic 3: Modern Professional Agents (5 remaining)

**Goal:** Build the remaining 5 modern professional agents using the template.

**Dependencies:** Epic 2 complete (template agent working)

**Agents:**
1. `political-strategist` - Magnus
2. `debate-coach` - Cicero
3. `stakeholder-mediator` - Geneva
4. `ethics-advisor` - Sophia
5. `communications-director` - Joseph

**Approach:** Build each agent, register, create wrapper, test - in sequence.

---

### Story 3.1: Build Political Strategist (Magnus)

**Agent Details:**
```yaml
agent_id: political-strategist
display_name: Magnus
icon: ♟️
title: Campaign & Political Strategy
```

**Tasks:**
1. Create agent file from template
2. Implement Magnus persona
3. Register in manifest
4. Create customize file
5. Create command wrapper
6. Test all functionality

**Acceptance Criteria:**
- [ ] Agent loads and works
- [ ] Stays in character as chess-player strategist
- [ ] All menu items functional

---

### Story 3.2: Build Debate Coach (Cicero)

**Agent Details:**
```yaml
agent_id: debate-coach
display_name: Cicero
icon: 🎭
title: Argumentation & Rhetoric Master
```

**Tasks:** Same pattern as 3.1

**Acceptance Criteria:**
- [ ] Socratic style evident
- [ ] Challenges assumptions
- [ ] Uses rhetoric principles

---

### Story 3.3: Build Stakeholder Mediator (Geneva)

**Agent Details:**
```yaml
agent_id: stakeholder-mediator
display_name: Geneva
icon: 🤝
title: Negotiation & Consensus Builder
```

**Tasks:** Same pattern as 3.1

**Acceptance Criteria:**
- [ ] Bridge-builder persona evident
- [ ] Interest-based negotiation focus
- [ ] Relentlessly optimistic tone

---

### Story 3.4: Build Ethics Advisor (Sophia)

**Agent Details:**
```yaml
agent_id: ethics-advisor
display_name: Sophia
icon: ⚖️
title: Political Ethics & Values Counsel
```

**Tasks:** Same pattern as 3.1

**Acceptance Criteria:**
- [ ] Never preachy
- [ ] Illuminates trade-offs
- [ ] Probes moral questions

---

### Story 3.5: Build Communications Director (Joseph)

**Agent Details:**
```yaml
agent_id: communications-director
display_name: Joseph
icon: 📢
title: Public Messaging & Media Strategy
```

**Tasks:** Same pattern as 3.1

**Acceptance Criteria:**
- [ ] Message-obsessed persona
- [ ] Thinks in news cycles
- [ ] "If you're explaining, you're losing"

---

### Story 3.6: Verify All Modern Professional Agents

**Tasks:**
1. Test all 6 modern agents load
2. Test all agents stay in character
3. Test Party Mode with modern agents
4. Document any issues

**Acceptance Criteria:**
- [ ] All 6 agents functional
- [ ] Party Mode works with all 6

---

## Epic 4: Historical Archetype Agents (8 agents)

**Goal:** Build all 8 historical archetype agents.

**Dependencies:** Epic 3 complete

**Agents:**
1. `the-realist` - Niccolo (Machiavelli)
2. `the-liberator` - Charles (Lincoln/de Gaulle)
3. `the-revolutionary` - Maximilien (Robespierre)
4. `the-conservative` - Burke
5. `the-technocrat` - Lee
6. `the-strategist-warrior` - Musashi
7. `the-master-strategist` - Sun
8. `the-principled-commander` - Jean-Luc

**Key Difference:** Historical archetypes include `<inherent_biases>` section in persona.

---

### Story 4.1: Build The Realist (Niccolo)

**Agent Details:**
```yaml
agent_id: the-realist
display_name: Niccolo
icon: 🦊
title: The Realist - Master of Realpolitik
```

**Persona Focus:**
- Machiavelli merged with Bismarck
- Cold clarity, courtly language
- Never moralizes, only calculates
- Documented biases: dismissive of idealism, cynical

**Acceptance Criteria:**
- [ ] Speaks in maxims and historical parallels
- [ ] Realpolitik perspective evident
- [ ] Biases section implemented

---

### Story 4.2: Build The Liberator (Charles)

**Agent Details:**
```yaml
agent_id: the-liberator
display_name: Charles
icon: 🕊️
title: The Liberator - Moral Transformer
```

**Persona Focus:**
- Lincoln merged with de Gaulle
- Moral authority, unity through justice
- Folksy/military wisdom
- Biases: too patient, assumes triumph of reason

**Acceptance Criteria:**
- [ ] Parables and stories style
- [ ] Moral authority perspective
- [ ] Biases documented

---

### Story 4.3: Build The Revolutionary (Maximilien)

**Agent Details:**
```yaml
agent_id: the-revolutionary
display_name: Maximilien
icon: ✊
title: The Revolutionary - Agent of Change
```

**Persona Focus:**
- Robespierre focus (with Che undertones)
- Passionate, uncompromising
- "Reform props up unjust systems"
- Biases: dismisses incremental progress, purity tests

**Acceptance Criteria:**
- [ ] Revolutionary fervor evident
- [ ] Challenges status quo
- [ ] Appropriately intense but corporate-safe

---

### Story 4.4: Build The Conservative (Burke)

**Agent Details:**
```yaml
agent_id: the-conservative
display_name: Burke
icon: 🏛️
title: The Conservative - Guardian of Tradition
```

**Persona Focus:**
- Edmund Burke merged with Metternich
- Prudence, accumulated wisdom
- "Reform that we may preserve"
- Biases: may defend unjust traditions

**Acceptance Criteria:**
- [ ] Eloquent, deeply historical
- [ ] Warns of unintended consequences
- [ ] Respects institutions

---

### Story 4.5: Build The Technocrat (Lee)

**Agent Details:**
```yaml
agent_id: the-technocrat
display_name: Lee
icon: ⚙️
title: The Technocrat - Builder of Systems
```

**Persona Focus:**
- Lee Kuan Yew merged with Deng Xiaoping
- Blunt, data-driven, results-focused
- "Meritocracy is non-negotiable"
- Biases: may undervalue democracy, sees engineering solutions

**Acceptance Criteria:**
- [ ] Speaks in metrics and outcomes
- [ ] Impatient with ideology
- [ ] Corporate-appropriate authoritarianism

---

### Story 4.6: Build The Strategist-Warrior (Musashi)

**Agent Details:**
```yaml
agent_id: the-strategist-warrior
display_name: Musashi
icon: ⚔️
title: The Strategist-Warrior - Master of Timing
```

**Persona Focus:**
- Miyamoto Musashi, Book of Five Rings
- Sparse, observational
- "The way is in training"
- Biases: anti-dogmatic, individualistic

**Acceptance Criteria:**
- [ ] Short, penetrating observations
- [ ] Combat metaphors (business-appropriate)
- [ ] Perceives what cannot be seen

---

### Story 4.7: Build The Master Strategist (Sun)

**Agent Details:**
```yaml
agent_id: the-master-strategist
display_name: Sun
icon: 🐉
title: The Master Strategist - Supreme Strategist
```

**Persona Focus:**
- Sun Tzu, Art of War
- Aphorisms and paradoxes
- "Win without fighting"
- Biases: over-emphasizes deception, adversarial framing

**Acceptance Criteria:**
- [ ] Nature metaphors (water, wind)
- [ ] Grand strategic perspective
- [ ] Patient, observational

---

### Story 4.8: Build The Principled Commander (Jean-Luc)

**Agent Details:**
```yaml
agent_id: the-principled-commander
display_name: Jean-Luc
icon: 🖖
title: The Principled Commander - Diplomat Captain
```

**Persona Focus:**
- Captain Jean-Luc Picard
- "Make it so" - decisive when needed
- Quotes Shakespeare, philosophy
- Biases: too diplomatic, assumes good faith

**Acceptance Criteria:**
- [ ] Picard's distinctive voice
- [ ] Principled leadership
- [ ] Warmth and humanity

---

## Epic 5: Registration & Command Structure

**Goal:** Ensure all 14 agents are properly registered and accessible.

**Dependencies:** Epics 3 & 4 complete

---

### Story 5.1: Complete Agent Manifest Registration

**Tasks:**
1. Verify all 14 agents in `_bmad/_config/agent-manifest.csv`
2. Verify no duplicates
3. Verify consistent formatting

**Expected Entries:**
```csv
exec-ops,policy-analyst,Augustus,📊,Evidence-Based Policy Expert
exec-ops,political-strategist,Magnus,♟️,Campaign & Political Strategy
exec-ops,debate-coach,Cicero,🎭,Argumentation & Rhetoric Master
exec-ops,stakeholder-mediator,Geneva,🤝,Negotiation & Consensus Builder
exec-ops,ethics-advisor,Sophia,⚖️,Political Ethics & Values Counsel
exec-ops,communications-director,Joseph,📢,Public Messaging & Media Strategy
exec-ops,the-realist,Niccolo,🦊,The Realist - Master of Realpolitik
exec-ops,the-liberator,Charles,🕊️,The Liberator - Moral Transformer
exec-ops,the-revolutionary,Maximilien,✊,The Revolutionary - Agent of Change
exec-ops,the-conservative,Burke,🏛️,The Conservative - Guardian of Tradition
exec-ops,the-technocrat,Lee,⚙️,The Technocrat - Builder of Systems
exec-ops,the-strategist-warrior,Musashi,⚔️,The Strategist-Warrior - Master of Timing
exec-ops,the-master-strategist,Sun,🐉,The Master Strategist - Supreme Strategist
exec-ops,the-principled-commander,Jean-Luc,🖖,The Principled Commander - Diplomat Captain
```

**Acceptance Criteria:**
- [ ] 14 entries present
- [ ] No duplicates
- [ ] Valid CSV format

---

### Story 5.2: Complete Customization Files

**Tasks:**
1. Verify all 14 customize files exist
2. Ensure consistent format
3. Agent-specific settings where appropriate

**Files Required:**
```
_bmad/_config/agents/exec-ops-policy-analyst.customize.yaml
_bmad/_config/agents/exec-ops-political-strategist.customize.yaml
... (all 14)
```

**Acceptance Criteria:**
- [ ] 14 customize files exist
- [ ] All valid YAML

---

### Story 5.3: Complete Command Wrappers

**Tasks:**
1. Verify all 14 command wrappers exist
2. Verify correct paths in each
3. Test each command works

**Files Required:**
```
.claude/commands/bmad/exec-ops/agents/policy-analyst.md
.claude/commands/bmad/exec-ops/agents/political-strategist.md
... (all 14)
```

**Acceptance Criteria:**
- [ ] 14 command wrappers exist
- [ ] All reference correct agent file paths
- [ ] All commands discoverable

---

## Epic 6: Testing & Validation

**Goal:** Comprehensive testing of the complete module.

**Dependencies:** Epic 5 complete

---

### Story 6.1: Individual Agent Testing

**Tasks:**
For each of the 14 agents:
1. [ ] Invoke via command
2. [ ] Verify config loads
3. [ ] Verify greeting personalized
4. [ ] Verify menu displays
5. [ ] Test 2-3 menu items
6. [ ] Verify stays in character
7. [ ] Verify dismiss works

**Acceptance Criteria:**
- [ ] All 14 agents pass individual testing

---

### Story 6.2: Party Mode Integration Testing

**Tasks:**
1. Start Party Mode from one agent
2. Call multiple exec-ops agents by name
3. Verify each responds in character
4. Test collaborative scenario (decision workshop)
5. Test Modern + Historical agents together

**Test Scenarios:**
- "Let's consult Niccolo and Burke about this organizational change"
- "Get Magnus and Cicero to debate this strategic move"
- "What would Sun and Musashi advise about timing?"

**Acceptance Criteria:**
- [ ] Party Mode loads from any agent
- [ ] All agents accessible in Party Mode
- [ ] Multi-agent scenarios work
- [ ] Agents maintain distinct personas

---

### Story 6.3: Configuration Testing

**Tasks:**
1. Change user_name in config → verify agents use new name
2. Change communication_language → verify language changes
3. Change formality_level → verify tone adjusts
4. Test output_folder paths

**Acceptance Criteria:**
- [ ] Config changes reflected in agent behavior

---

### Story 6.4: Documentation Verification

**Tasks:**
1. README.md is comprehensive
2. All 14 agents documented
3. Usage examples work
4. No placeholder content

**Acceptance Criteria:**
- [ ] Documentation complete and accurate

---

## Epic 7: Production Cleanup

**Goal:** Remove build artifacts and prepare for production release.

**Dependencies:** Epic 6 complete (all tests pass)

---

### Story 7.1: Remove Build Artifacts

**Tasks:**
```bash
# Remove any completion markers
rm -f _bmad/exec-ops/*-COMPLETE.md
rm -f _bmad/exec-ops/*-SUMMARY.md

# Remove staging folder if used
rm -rf _bmad-output/bmb-creations/exec-ops

# Remove planning artifacts (optional - may keep)
# rm -rf _bmad-output/planning/exec-ops-*
```

**Acceptance Criteria:**
- [ ] No build artifacts in _bmad/exec-ops/
- [ ] Staging folder cleaned

---

### Story 7.2: Final Verification

**Tasks:**
1. Count agent files (should be 14)
2. Count command wrappers (should be 14)
3. Count manifest entries (should be 14)
4. Count customize files (should be 14)
5. Verify no placeholder content
6. Verify no TODO comments

**Verification Commands:**
```bash
ls _bmad/exec-ops/agents/*.md | wc -l  # Should be 14
ls .claude/commands/bmad/exec-ops/agents/*.md | wc -l  # Should be 14
grep -c "^exec-ops," _bmad/_config/agent-manifest.csv  # Should be 14
ls _bmad/_config/agents/exec-ops-*.customize.yaml | wc -l  # Should be 14
```

**Acceptance Criteria:**
- [ ] All counts match (14)
- [ ] No incomplete content

---

### Story 7.3: Git Commit & Tag Release

**Tasks:**
1. Stage all production files
2. Create meaningful commit message
3. Tag release v1.0.0

**Commands:**
```bash
# Stage files
git add _bmad/exec-ops/
git add .claude/commands/bmad/exec-ops/
git add _bmad/_config/agent-manifest.csv
git add _bmad/_config/agents/exec-ops-*.customize.yaml

# Commit
git commit -m "Add exec-ops module - Executive Leadership & Decision-Making

- 14 agents deployed (6 Modern + 8 Historical Archetypes)
- Full Party Mode integration
- Complete documentation
- All tests passing
- Ready for production use

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Tag
git tag -a "exec-ops-v1.0.0" -m "exec-ops v1.0.0 production release"
```

**Acceptance Criteria:**
- [ ] Clean commit
- [ ] Tagged v1.0.0

---

## Success Metrics

### Module Success Criteria
- [ ] All 14 agents load successfully via commands
- [ ] All agents maintain distinct personas throughout sessions
- [ ] Config loads correctly with user personalization
- [ ] All menu items function (inline and workflow)
- [ ] Party Mode integration enables multi-agent collaboration
- [ ] Documentation is comprehensive
- [ ] No build artifacts in production

### Agent Quality Criteria (per agent)
- [ ] Distinctive voice and personality
- [ ] Actionable executive-level advice
- [ ] References appropriate frameworks naturally
- [ ] Stays in character under challenging prompts
- [ ] Produces board-ready output when requested (where applicable)

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Agents too generic | Medium | High | Detailed personas with specific backgrounds, signature phrases |
| Historical agents too academic | Medium | Medium | Balance wisdom with practical application |
| 14 agents overwhelming | Low | Medium | Clear categorization, good Party Mode integration |
| Config loading issues | Low | High | Test thoroughly with template agent first |
| Command conflicts | Low | Medium | Use exec-ops- prefix if needed |

---

## Next Steps

1. **Approve this plan** → Confirm stories and priorities
2. **Execute Epic 1** → Create module foundation
3. **Build template agent (Epic 2)** → Policy Analyst (Augustus)
4. **Iterate through remaining epics** → Build, register, test each agent
5. **Comprehensive testing (Epic 6)** → Validate complete module
6. **Production release (Epic 7)** → Clean and commit

---

**Plan Status:** Ready for Approval
**Estimated Total Effort:** 4-6 hours focused work
**Author:** John (PM Agent) + Claude Opus 4.5
**Date:** 2026-01-09
