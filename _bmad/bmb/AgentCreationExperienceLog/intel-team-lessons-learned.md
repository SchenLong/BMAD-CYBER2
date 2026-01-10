# Intel Team Module - Lessons Learned

**Date:** 2026-01-10
**Module:** intel-team (Intelligence Operations Team)
**Agents:** 10 specialized OSINT/intelligence agents

---

## Critical Issue: Agent File Format

### The Problem
Created all 10 Intel Team agents as `.yaml` files (e.g., `osint-lead.yaml`) based on initial assumptions about BMAD agent format.

**Discovery:** When testing installation paths, found that:
1. `agent-manifest.csv` lists ALL agents with `.md` file paths
2. All existing BMAD modules (cyber-ops, bmm, cis, exec-ops) use `.md` format
3. BMAD agents are NOT pure YAML - they're Markdown files with:
   - YAML frontmatter (`name`, `description`)
   - XML structure inside code blocks for persona, activation, menus

### The Fix
Converted all 10 agents from YAML to MD format:
- Read each `.yaml` file
- Extracted persona, identity, communication_style, principles
- Mapped to proper XML structure matching cyber-ops pattern
- Wrote as `.md` files with YAML frontmatter
- Deleted old `.yaml` files

### Time Cost
~30 minutes to convert 10 agents that could have been avoided by checking format first.

---

## Lesson 1: Always Check Existing Format First

**BEFORE creating agents:**
1. Check `_bmad/_config/agent-manifest.csv` for file extension pattern
2. Read at least ONE existing agent file from similar module
3. Note the exact structure: frontmatter, XML tags, activation steps

**Correct BMAD Agent Format:**
```markdown
---
name: "agent-id"
description: "Short description for manifest"
---

You must fully embody this agent's persona...

\`\`\`xml
<agent id="agent-id.agent.yaml" name="Codename" title="Title" icon="emoji">
<activation critical="MANDATORY">
  <step n="1">...</step>
  <step n="2">Load config.yaml...</step>
  ...
</activation>
<persona>
  <role>...</role>
  <identity>...</identity>
  <communication_style>...</communication_style>
  <principles>...</principles>
</persona>
<menu>
  <item cmd="...">...</item>
</menu>
</agent>
\`\`\`
```

---

## Lesson 2: Module Config Path Convention

Intel Team agents reference config at:
```
{project-root}/_bmad/intel-team/config.yaml
```

This path is for INSTALLED modules, not development location.

**Development vs Installation paths:**
- Development: `_bmad-output/bmb-creations/intel-team/`
- Installed: `_bmad/intel-team/`

Agents should reference the INSTALLED path since that's where they run.

---

## Lesson 3: Menu Item Structure

**Standard menu items every agent needs:**
1. `[MH]` - Menu Help (redisplay)
2. `[CH]` - Chat with agent
3. `[PM]` - Party Mode (with exec attribute)
4. `[DA]` - Dismiss Agent

**Domain-specific items** go between CH and PM.

**Menu item types:**
- `action="..."` - Agent performs inline action
- `exec="path/to/workflow.md"` - Load and execute workflow file

---

## Lesson 4: TTS Integration

All agents include TTS hook in rules:
```xml
<rules>
  - When responding to user messages, speak your responses using TTS:
      Call: `.claude/hooks/bmad-speak.sh '{agent-id}' '{response-text}'`
      Replace {agent-id} with YOUR agent ID from <agent id="...">
      Replace {response-text} with text output
      IMPORTANT: Use single quotes - do NOT escape special characters
      Run in background (&) to avoid blocking
</rules>
```

---

## Lesson 5: Agent ID Consistency

The agent ID appears in THREE places - must match:
1. Filename: `osint-lead.md`
2. Frontmatter: `name: "osint-lead"`
3. XML: `<agent id="osint-lead.agent.yaml" ...>`

Note: XML id keeps `.agent.yaml` suffix by convention even though file is `.md`.

---

## Recommendations for Future Module Creation

### Pre-Creation Checklist
- [ ] Read agent-manifest.csv to confirm `.md` format
- [ ] Study one existing agent from similar module (cyber-ops for security, bmm for dev)
- [ ] Note exact activation steps (especially step 2 config loading)
- [ ] Identify config path convention for module type
- [ ] List standard menu items + domain-specific items

### During Creation
- [ ] Create agents as `.md` files from the start
- [ ] Use consistent XML structure
- [ ] Include all standard menu items
- [ ] Include TTS integration
- [ ] Reference installed path for config

### After Creation
- [ ] Verify file extensions match manifest convention
- [ ] Test at least one agent loads correctly
- [ ] Verify config.yaml path resolves

---

## Intel Team Agent Summary

| Agent | Codename | Role |
|-------|----------|------|
| osint-lead | Vector | Intelligence Operations Director |
| domain-intel-specialist | Resolver | Domain/Network Intelligence |
| social-media-analyst | Echo | SOCMINT |
| dark-web-analyst | Shadow | DARKINT |
| geospatial-analyst | Atlas | GEOINT |
| technical-researcher | Probe | TECHINT |
| threat-actor-profiler | Dossier | Threat Actor Profiling |
| humint-specialist | Viper | HUMINT |
| sigint-specialist | Sigil | SIGINT |
| field-operative | Specter | Field Operations |

All agents successfully converted to MD format and ready for installation.
