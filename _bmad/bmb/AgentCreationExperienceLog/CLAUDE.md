# BMAD Agent & Module Creation - Lessons Learned

**Purpose:** Consolidated lessons from creating BMAD modules to prevent repeating mistakes.
**Source:** exec-ops and intel-team module creation experiences.

---

## Critical Rule 1: Agent File Format is MARKDOWN, not YAML

**WRONG:** Creating agents as `.yaml` files
**RIGHT:** Creating agents as `.md` files with YAML frontmatter + XML structure

### Correct Agent File Structure

```markdown
---
name: "agent-id"
description: "Short description for manifest"
---

You must fully embody this agent's persona and follow all activation instructions exactly as specified. NEVER break character until given an exit command.

\`\`\`xml
<agent id="agent-id.agent.yaml" name="Codename" title="Full Title" icon="emoji">
<activation critical="MANDATORY">
      <step n="1">Load persona from this current agent file (already in context)</step>
      <step n="2">🚨 IMMEDIATE ACTION REQUIRED - BEFORE ANY OUTPUT:
          - Load and read {project-root}/_bmad/{module-name}/config.yaml NOW
          - Store ALL fields as session variables: {user_name}, {communication_language}, {output_folder}
          - VERIFY: If config not loaded, STOP and report error to user
          - DO NOT PROCEED to step 3 until config is successfully loaded
      </step>
      <step n="3">Remember: user's name is {user_name}</step>
      <step n="4">Show greeting using {user_name} from config, communicate in {communication_language}, then display numbered list of ALL menu items</step>
      <step n="5">STOP and WAIT for user input - do NOT execute menu items automatically</step>
      <step n="6">On user input: Number → execute menu item[n] | Text → case-insensitive substring match</step>
      <step n="7">When executing a menu item: Check menu-handlers section below</step>

      <menu-handlers>
        <handlers>
          <handler type="exec">
            When menu item has: exec="path/to/file.md":
            1. LOAD and read the entire file and EXECUTE it
            2. If there is data="path" with the item, pass that data path as context
          </handler>
        </handlers>
      </menu-handlers>

    <rules>
      <r>ALWAYS communicate in {communication_language}</r>
      - When responding, speak using TTS:
          Call: \`.claude/hooks/bmad-speak.sh '{agent-id}' '{response-text}'\`
          Use single quotes - do NOT escape special characters
          Run in background (&) to avoid blocking
      <r>Stay in character until exit selected</r>
      <r>Display Menu items in order given</r>
      <r>Load files ONLY when executing user-chosen workflow, EXCEPTION: step 2 config.yaml</r>
    </rules>
</activation>

<persona>
    <role>Primary Role + Secondary Specialty</role>
    <identity>
      Background paragraph with years of experience, credentials, expertise areas.
      What they're known for. Specific accomplishments.
    </identity>
    <communication_style>
      How they speak. Signature phrases. Tone. Examples of typical statements.
    </communication_style>
    <principles>
      Core beliefs and operating principles. What guides their decisions.
    </principles>
</persona>

<menu>
    <item cmd="MH or fuzzy match on menu or help">[MH] Redisplay Menu Help</item>
    <item cmd="CH or fuzzy match on chat">[CH] Chat with {Codename} about {domain}</item>
    <!-- Domain-specific items here -->
    <item cmd="XX or fuzzy match on {action}" action="Description of what agent does">[XX] Menu Label</item>
    <item cmd="PM or fuzzy match on party-mode" exec="{project-root}/_bmad/core/workflows/party-mode/workflow.md">[PM] Party Mode</item>
    <item cmd="DA or fuzzy match on exit, leave, goodbye or dismiss agent">[DA] Dismiss Agent</item>
</menu>
</agent>
\`\`\`
```

### Pre-Creation Verification

**ALWAYS check before creating agents:**
1. Look at `_bmad/_config/agent-manifest.csv` - all paths end in `.md`
2. Read one existing agent from similar module as reference
3. Note the module's config.yaml path convention

---

## Critical Rule 2: Standard Menu Items

Every agent MUST have these menu items:

| Code | Purpose | Required |
|------|---------|----------|
| [MH] | Redisplay menu help | YES |
| [CH] | Chat with agent | YES |
| [PM] | Party Mode (with exec) | YES |
| [DA] | Dismiss Agent | YES |

Domain-specific items go BETWEEN [CH] and [PM].

### Menu Item Types

```xml
<!-- Inline action - agent performs directly -->
<item cmd="XX" action="What the agent does">[XX] Label</item>

<!-- Execute workflow - loads external file -->
<item cmd="XX" exec="{project-root}/path/to/workflow.md">[XX] Label</item>
```

---

## Critical Rule 3: Agent Codename Uniqueness

**CRITICAL:** Agent codenames must be UNIQUE across the ENTIRE BMAD ecosystem, not just within one module.

### Before Creating Any Agent

**ALWAYS search all modules for existing codenames:**

```bash
grep -rh 'name="[A-Z][a-z]+"' _bmad/**/*.md _bmad-output/**/*.md | sort -u
```

### Known Codenames by Module (as of 2026-01-10)

| Module | Codenames |
|--------|-----------|
| **CIS** | Victor, Sophia, Maya, Caravaggio, Carson |
| **BMGD** | Indie, Max |
| **BMM** | Paige, Barry, Bob, John, Murat, Amelia, Sally, Mary, Winston |
| **Exec-ops** | Charles, Sun, Musashi, Maximilien, Burke, Lee, Magnus, Joseph, Augustus, Geneva, Niccolo, Cicero |
| **Cyber-ops** | Weaver, Ghost, Gateway, Nimbus, Phoenix, Oracle, Trace, Sentinel, Shield, Phantom, Ledger, Watchman, Bastion, Cipher |
| **BMB** | Morgan, Wendy, Bond |
| **Intel-team** | Vector, Resolver, Echo, Shadow, Atlas, Probe, Dossier, Viper, Sigil, Specter, Proxy |

### Why This Matters

Name collisions cause problems when:
- Invoking agents by name in Party Mode
- Cross-module workflows referencing agents
- User confusion about which agent is being addressed
- Documentation and mental models

### Naming Conventions by Domain

| Domain | Style | Examples |
|--------|-------|----------|
| Technical | Operational/tool names | Probe, Cipher, Gateway |
| Intelligence | Action/role names | Vector, Shadow, Dossier |
| Corporate/Financial | Structure/process names | Proxy, Charter |
| Executive | Historical figures | Cicero, Burke, Musashi |

---

## Critical Rule 4: Agent ID Consistency

The agent ID must match in THREE places:

| Location | Example |
|----------|---------|
| Filename | `policy-analyst.md` |
| Frontmatter name | `name: "policy-analyst"` |
| XML agent id | `<agent id="policy-analyst.agent.yaml" ...>` |

**Note:** XML id keeps `.agent.yaml` suffix by convention.

---

## Critical Rule 4: Config Path Convention

### Development vs Installed Paths

| Type | Path |
|------|------|
| Development | `_bmad-output/bmb-creations/{module}/` |
| Installed | `_bmad/{module}/` |

Agents reference INSTALLED path in step 2:
```
{project-root}/_bmad/{module-name}/config.yaml
```

---

## Module Creation Checklist

### Phase 1: Research (DO FIRST)
- [ ] Check agent-manifest.csv for file format (.md)
- [ ] Read existing agent from similar module
- [ ] Identify config path pattern
- [ ] List required menu items

### Phase 2: Structure
- [ ] Create module directories
- [ ] Create module.yaml
- [ ] Create config.yaml with all required fields

### Phase 3: Agents
- [ ] Create agents as `.md` files (NOT .yaml)
- [ ] Include proper YAML frontmatter
- [ ] Include full XML activation structure
- [ ] Include all standard menu items
- [ ] Include TTS integration in rules

### Phase 4: Validation
- [ ] Verify file extensions are `.md`
- [ ] Test one agent loads correctly
- [ ] Verify config.yaml path resolves

---

## Common Mistakes to Avoid

### 1. Wrong File Format
**Mistake:** Creating `.yaml` agent files
**Cost:** 30+ minutes to convert 10 agents
**Prevention:** Check manifest.csv first

### 2. Missing Activation Steps
**Mistake:** Skipping config.yaml loading
**Cost:** Agents won't personalize greetings
**Prevention:** Copy activation structure from template

### 3. Inconsistent Agent IDs
**Mistake:** Filename doesn't match frontmatter/XML
**Cost:** Agent won't load or register correctly
**Prevention:** Use checklist to verify all three locations

### 4. Missing Menu Items
**Mistake:** Forgetting [MH], [PM], or [DA]
**Cost:** Poor user experience
**Prevention:** Start with standard template

### 5. Wrong Config Path
**Mistake:** Using development path instead of installed path
**Cost:** Agents fail after installation
**Prevention:** Always use `{project-root}/_bmad/{module}/config.yaml`

---

## Reference: Persona Quality Criteria

Good agent personas have:

| Criterion | Description |
|-----------|-------------|
| Distinctive Voice | Unique speech patterns, signature phrases |
| Clear Expertise | Specific credentials, years of experience |
| Communication Style | How they speak, typical statements |
| Principles | What guides their decisions |
| Actionable Menu | Domain-specific capabilities |

### Persona Template

```xml
<persona>
    <role>Primary Role + Secondary Specialty</role>
    <identity>
      [X]-year career in [field]. Served at [organizations]. Expert in [skills].
      Known for [accomplishments]. [Credentials/certifications].
    </identity>
    <communication_style>
      [Tone descriptor], [behavioral trait]. "[Signature phrase 1]"
      "[Signature phrase 2]" [How they approach problems].
    </communication_style>
    <principles>
      [Principle 1]. [Principle 2]. [Principle 3].
    </principles>
</persona>
```

---

## Reference: Module Types

| Module | Focus | Config Path |
|--------|-------|-------------|
| cyber-ops | Security operations | `_bmad/cyber-ops/config.yaml` |
| exec-ops | Executive leadership | `_bmad/exec-ops/config.yaml` |
| intel-team | Intelligence operations | `_bmad/intel-team/config.yaml` |
| bmm | Software development | `_bmad/bmm/config.yaml` |
| bmgd | Game development | `_bmad/bmgd/config.yaml` |
| cis | Creative innovation | `_bmad/cis/config.yaml` |
| bmb | Module building | `_bmad/bmb/config.yaml` |

---

## Quick Reference: TTS Integration

```xml
<rules>
  - When responding to user messages, speak your responses using TTS:
      Call: \`.claude/hooks/bmad-speak.sh '{agent-id}' '{response-text}'\`
      Replace {agent-id} with YOUR agent ID from <agent id="...">
      Replace {response-text} with text output to user
      IMPORTANT: Use single quotes - do NOT escape special characters like ! or $
      Run in background (&) to avoid blocking
</rules>
```

---

## Summary: Golden Rules

1. **Agents are `.md` files** - Never create `.yaml` agent files
2. **Codenames must be UNIQUE ecosystem-wide** - Search ALL modules before naming an agent
3. **Check existing patterns first** - Read agent-manifest.csv and one existing agent
4. **Use full activation structure** - Include all 7 steps and menu-handlers
5. **Include standard menu items** - [MH], [CH], [PM], [DA] are required
6. **Match IDs in three places** - Filename, frontmatter, XML
7. **Reference installed path** - Not development path for config
8. **Include TTS integration** - In rules section
9. **Test before batch creation** - Verify one agent works first

---

*Last Updated: 2026-01-10*
*Modules Documented: exec-ops, intel-team*
