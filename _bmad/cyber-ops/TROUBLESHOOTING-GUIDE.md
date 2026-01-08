# BMAD Module Troubleshooting Quick Reference

**Purpose:** Fast solutions to common module and agent issues

**Created:** 2026-01-09
**Module:** cyber-ops (applies to all BMAD modules)

---

## Quick Diagnosis Flow

```
Agent command not working?
    ↓
├─ Command not found? → Check Section 1
├─ Config won't load? → Check Section 2
├─ Agent breaks character? → Check Section 3
├─ Menu items don't work? → Check Section 4
└─ Workflow not found? → Check Section 5
```

---

## Section 1: Command Not Found

### Symptom
```
User: /security-architect
CLI: No matching command found
```

### Quick Fix (30 seconds)

```bash
# 1. Verify command wrapper exists
ls .claude/commands/bmad/cyber-ops/agents/security-architect.md

# 2. If missing, create it:
cat > .claude/commands/bmad/cyber-ops/agents/security-architect.md << 'EOF'
---
name: 'security-architect'
description: 'security-architect agent'
---

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from @_bmad/cyber-ops/agents/security-architect.md
2. READ its entire contents
3. Execute ALL activation steps
4. Follow persona precisely
5. Stay in character
</agent-activation>
EOF

# 3. Restart Claude Code CLI
```

### Detailed Diagnosis

**Check 1: Command wrapper exists?**
```bash
ls -la .claude/commands/bmad/{module-id}/agents/{agent-id}.md
```
- **Missing?** → Create command wrapper (see Quick Fix)
- **Exists?** → Proceed to Check 2

**Check 2: Agent registered in manifest?**
```bash
grep "{agent-id}" _bmad/_config/agent-manifest.csv
```
- **Missing?** → Add to manifest:
  ```bash
  echo "{module-id},{agent-id},{Display Name},{icon},{description}" >> _bmad/_config/agent-manifest.csv
  ```
- **Exists?** → Proceed to Check 3

**Check 3: Naming matches exactly?**
```bash
# These must ALL match:
# - Agent file: _bmad/{module}/agents/security-architect.md
# - Command file: .claude/commands/bmad/{module}/agents/security-architect.md
# - Manifest: {module},security-architect,...

# Check for mismatches:
diff <(basename _bmad/{module}/agents/{agent}.md .md) \
     <(basename .claude/commands/bmad/{module}/agents/{agent}.md .md)
```
- **Mismatch?** → Rename files to match
- **Match?** → Proceed to Check 4

**Check 4: CLI needs restart?**
```bash
# Close and reopen Claude Code CLI
# Then try command again
```

---

## Section 2: Config Won't Load

### Symptom
```
Agent greeting shows: "Hello, {user_name}" (literal text)
or
Error: "Cannot load config.yaml"
```

### Quick Fix (60 seconds)

```bash
# 1. Verify config exists
ls _bmad/{module-id}/config.yaml

# 2. If missing, create minimal config:
cat > _bmad/{module-id}/config.yaml << 'EOF'
module_name: {module-id}
user_name: User
communication_language: English
output_folder: /Users/you/project/_output/{module-id}
module_root: /Users/you/project/_bmad/{module-id}
agents_path: /Users/you/project/_bmad/{module-id}/agents
workflows_path: /Users/you/project/_bmad/{module-id}/workflows
EOF

# 3. Test agent again
```

### Detailed Diagnosis

**Check 1: Config file exists?**
```bash
ls -la _bmad/{module-id}/config.yaml
```
- **Missing?** → Create config (see Quick Fix)
- **Exists?** → Proceed to Check 2

**Check 2: Config path correct in agent?**
```bash
grep "config.yaml" _bmad/{module}/agents/{agent}.md

# Should show:
# {project-root}/_bmad/{module-id}/config.yaml
```
- **Wrong path?** → Fix in agent activation step 2
- **Correct?** → Proceed to Check 3

**Check 3: Config YAML valid?**
```bash
# Try parsing YAML (if you have yq or python):
python3 -c "import yaml; yaml.safe_load(open('_bmad/{module}/config.yaml'))"

# Or visual inspection:
cat _bmad/{module}/config.yaml
```
- **Invalid YAML?** → Fix syntax errors (indentation, colons, quotes)
- **Valid?** → Proceed to Check 4

**Check 4: Required fields present?**
```yaml
# Minimum required fields:
user_name: {value}
communication_language: {value}
output_folder: {value}
```
- **Missing fields?** → Add them
- **All present?** → Issue is elsewhere (check agent activation logic)

---

## Section 3: Agent Breaks Character

### Symptom
- Agent responds generically
- No distinctive personality
- Doesn't use signature phrases
- Reverts to "helpful assistant"

### Quick Fix (5 minutes)

Open agent file and enhance persona:

```markdown
<persona>
    <role>Specific Professional Role + Expertise Area</role>
    <identity>
      [Title] with [X+] years doing [specific work]. Has [specific achievements].
      [Certifications]. Expert in [areas 1, 2, 3].
      [Unique background detail that informs approach].
    </identity>
    <communication_style>
      [How they think]. [Signature phrase 1]. [Signature phrase 2].
      [Mental model they use]. [Quirk or habit]. [How they approach problems].
    </communication_style>
    <principles>
      [Belief 1 - one sentence explaining why].
      [Belief 2].
      [Belief 3].
      [Belief 4 - guide for decisions].
    </principles>
</persona>
```

**Add signature phrases:**
```
Examples:
- "Let me sketch this out..."
- "Where's the trust boundary here?"
- "Every layer tells a story"
- "What happens when this component fails?"
```

### Detailed Diagnosis

**Check 1: Persona detailed enough?**
```bash
# Count lines in persona section
grep -A 30 "<persona>" _bmad/{module}/agents/{agent}.md | wc -l
```
- **< 15 lines?** → Too generic, expand persona
- **> 15 lines?** → Likely detailed enough

**Check 2: Has signature phrases?**
```bash
# Look for quoted phrases in communication_style
grep -A 10 "communication_style" _bmad/{module}/agents/{agent}.md | grep '"'
```
- **None found?** → Add 3-5 signature phrases
- **Found?** → Good, but ensure they're distinctive

**Check 3: Activation enforces character?**
```bash
grep "Stay in character" _bmad/{module}/agents/{agent}.md
grep "NEVER break character" _bmad/{module}/agents/{agent}.md
```
- **Missing?** → Add to activation rules
- **Present?** → Good

**Check 4: Testing properly?**
- Test with domain-specific questions
- Agent should respond with expertise, not generic help
- Should use signature phrases naturally
- Should reference principles when relevant

---

## Section 4: Menu Items Don't Work

### Symptom
- Select menu item, nothing happens
- Workflow doesn't load
- Generic response instead of action

### Quick Fix (2 minutes)

Check menu item syntax:

```xml
<!-- For inline actions: -->
<item cmd="SR or fuzzy match on security"
      action="Detailed description of what to do">
  [SR] Security Review
</item>

<!-- For workflow execution: -->
<item cmd="TM or fuzzy match on threat"
      exec="{project-root}/_bmad/{module}/workflows/threat-modeling/workflow.md">
  [TM] Threat Modeling
</item>
```

**Common errors:**
- Missing `action` or `exec` attribute
- Wrong path in `exec`
- Not using `{project-root}` variable

### Detailed Diagnosis

**Check 1: Menu item has action or exec?**
```bash
# Every item (except MH, CH, DA) needs action OR exec
grep -A 1 "<item" _bmad/{module}/agents/{agent}.md

# Look for:
# action="..."  OR  exec="..."
```
- **Missing both?** → Add `action` or `exec` attribute
- **Has one?** → Proceed to Check 2

**Check 2: Workflow path correct?**
```bash
# Extract exec path from menu item
grep 'exec=' _bmad/{module}/agents/{agent}.md

# Verify file exists at that path
ls _bmad/{module}/workflows/{workflow-name}/workflow.md
```
- **File missing?** → Create workflow or fix path
- **File exists?** → Proceed to Check 3

**Check 3: Using {project-root} variable?**
```bash
# Check if paths use variable
grep 'exec="{project-root}' _bmad/{module}/agents/{agent}.md
```
- **Not using variable?** → Update paths to use `{project-root}`
- **Using variable?** → Should work

**Check 4: Menu handlers configured?**
```bash
# Verify menu-handlers section exists
grep -A 20 "menu-handlers" _bmad/{module}/agents/{agent}.md
```
- **Missing?** → Add menu-handlers section from template
- **Present?** → Should work

---

## Section 5: Workflow Not Found

### Symptom
```
Error: Cannot find workflow file
or
Workflow path not resolving
```

### Quick Fix (1 minute)

```bash
# 1. Check workflow exists
ls _bmad/{module}/workflows/{workflow-name}/workflow.md

# 2. If missing directory:
mkdir -p _bmad/{module}/workflows/{workflow-name}

# 3. Create minimal workflow.md:
cat > _bmad/{module}/workflows/{workflow-name}/workflow.md << 'EOF'
# {Workflow Name}

## Overview
{Description}

## Steps
1. {Step 1}
2. {Step 2}
EOF

# 4. Update menu item path to match
```

### Detailed Diagnosis

**Check 1: Workflow file exists?**
```bash
ls -la _bmad/{module}/workflows/{workflow-name}/workflow.md
```
- **Missing?** → Create workflow or fix menu path
- **Exists?** → Proceed to Check 2

**Check 2: Path matches menu item?**
```bash
# Get path from menu
grep 'exec=.*{workflow-name}' _bmad/{module}/agents/{agent}.md

# Compare to actual location
ls _bmad/{module}/workflows/

# Ensure names match exactly (case-sensitive)
```
- **Mismatch?** → Rename workflow or update path
- **Match?** → Proceed to Check 3

**Check 3: Variable resolution working?**
```bash
# Path should use: {project-root}/_bmad/{module}/workflows/...
# Not hardcoded: /Users/you/project/_bmad/...

grep 'exec=' _bmad/{module}/agents/{agent}.md | grep '{project-root}'
```
- **Hardcoded path?** → Change to use `{project-root}`
- **Variable used?** → Should work

---

## Section 6: Party Mode Issues

### Symptom
- Party Mode command doesn't work
- Can't find party-mode workflow

### Quick Fix (30 seconds)

```bash
# 1. Verify BMAD core installed
ls _bmad/core/workflows/party-mode/workflow.md

# 2. Check menu item path
grep "party-mode" _bmad/{module}/agents/{agent}.md

# Should show:
# exec="{project-root}/_bmad/core/workflows/party-mode/workflow.md"
```

### Detailed Diagnosis

**Check 1: BMAD core present?**
```bash
ls -la _bmad/core/
```
- **Missing?** → Install BMAD core
- **Exists?** → Proceed to Check 2

**Check 2: Party Mode workflow exists?**
```bash
ls _bmad/core/workflows/party-mode/workflow.md
```
- **Missing?** → Reinstall BMAD core or check installation
- **Exists?** → Proceed to Check 3

**Check 3: Path correct in menu?**
```bash
grep 'party-mode' _bmad/{module}/agents/{agent}.md

# Should be:
# exec="{project-root}/_bmad/core/workflows/party-mode/workflow.md"
```
- **Wrong path?** → Update to correct path
- **Correct?** → Should work

---

## Section 7: Variable Not Replacing

### Symptom
```
Output path is literally: {output_folder}/report.md
or
Agent says: "Hello, {user_name}"
```

### Quick Fix (2 minutes)

**In agent activation step 2:**
```xml
<step n="2">🚨 IMMEDIATE ACTION REQUIRED - BEFORE ANY OUTPUT:
    - Load and read {project-root}/_bmad/{module}/config.yaml NOW
    - Store ALL fields as session variables: {user_name}, {communication_language}, {output_folder}
    - VERIFY: If config not loaded, STOP and report error
    - DO NOT PROCEED until config loaded and variables stored
</step>
```

**Ensure this step:**
1. Loads config FIRST
2. Stores variables BEFORE greeting
3. Is BLOCKING (won't proceed without success)

### Detailed Diagnosis

**Check 1: Activation step 2 exists?**
```bash
grep -A 5 'step n="2"' _bmad/{module}/agents/{agent}.md
```
- **Missing?** → Add step 2 with config loading
- **Exists?** → Proceed to Check 2

**Check 2: Step 2 loads config?**
```bash
grep -A 5 'step n="2"' _bmad/{module}/agents/{agent}.md | grep "config.yaml"
```
- **Doesn't mention config?** → Update step 2 to load config
- **Mentions config?** → Proceed to Check 3

**Check 3: Step 2 stores variables?**
```bash
grep -A 5 'step n="2"' _bmad/{module}/agents/{agent}.md | grep "Store.*variables"
```
- **Doesn't store?** → Add explicit variable storage instruction
- **Stores?** → Proceed to Check 4

**Check 4: Variables used with correct syntax?**
```bash
# Variables should be: {variable_name}
# NOT: ${variable_name}
# NOT: $variable_name
# NOT: {variable-name}

grep '{user_name}' _bmad/{module}/agents/{agent}.md
```
- **Wrong syntax?** → Fix variable syntax
- **Correct syntax?** → Should work

---

## Common Issues Matrix

| Symptom | Most Likely Cause | Quick Fix | Section |
|---------|-------------------|-----------|---------|
| Command not found | Missing wrapper | Create `.claude/commands/.../agent.md` | 1 |
| Config error | Missing config.yaml | Create `config.yaml` | 2 |
| Generic responses | Weak persona | Enhance persona details | 3 |
| Menu doesn't work | Missing action/exec | Add action or exec attribute | 4 |
| Workflow not loading | Wrong path | Fix exec path in menu | 5 |
| Variables literal | Step 2 not loading | Fix activation step 2 | 7 |
| Can't find agent file | Path mismatch | Check {project-root} usage | 1,4,5 |
| Agent breaks character | No enforcement | Add "stay in character" rules | 3 |

---

## Diagnostic Commands Cheat Sheet

```bash
# Verify complete installation
ls _bmad/{module}/{agents,workflows,config.yaml,module.yaml}
ls .claude/commands/bmad/{module}/agents/
grep "^{module}," _bmad/_config/agent-manifest.csv
ls _bmad/_config/agents/{module}-*.customize.yaml

# Count agents (should all match)
ls _bmad/{module}/agents/*.md | wc -l
ls .claude/commands/bmad/{module}/agents/*.md | wc -l
grep -c "^{module}," _bmad/_config/agent-manifest.csv

# Test YAML validity
python3 -c "import yaml; yaml.safe_load(open('_bmad/{module}/config.yaml'))"

# Find path issues
grep -r "{project-root}" _bmad/{module}/agents/
grep -r "exec=" _bmad/{module}/agents/

# Verify file permissions
find _bmad/{module} -type f ! -perm -644
find .claude/commands/bmad/{module} -type f ! -perm -644

# Check for typos in agent IDs
diff <(ls _bmad/{module}/agents/ | sed 's/.md//') \
     <(ls .claude/commands/bmad/{module}/agents/ | sed 's/.md//')
```

---

## Emergency Recovery

### If Everything is Broken

**Step 1: Verify core structure exists**
```bash
# Check each essential directory
for dir in _bmad/{module}/{agents,workflows} \
           .claude/commands/bmad/{module}/agents \
           _bmad/_config/agents; do
  [ -d "$dir" ] && echo "✓ $dir" || echo "✗ MISSING: $dir"
done
```

**Step 2: Rebuild from single working agent**
```bash
# Pick one agent that works
# Copy it as template:
cp _bmad/{module}/agents/working-agent.md _bmad/{module}/agents/new-agent.md
cp .claude/commands/bmad/{module}/agents/working-agent.md \
   .claude/commands/bmad/{module}/agents/new-agent.md

# Update IDs in both files
# Test: /new-agent
```

**Step 3: Check module creation playbook**
```bash
# Reference the playbook for complete rebuild steps:
cat _bmad/cyber-ops/MODULE-CREATION-PLAYBOOK.md
```

---

## Prevention Checklist

Before deploying new agent:

- [ ] Agent file exists in `_bmad/{module}/agents/`
- [ ] Command wrapper exists in `.claude/commands/bmad/{module}/agents/`
- [ ] Entry added to `agent-manifest.csv`
- [ ] Customize file created in `_bmad/_config/agents/`
- [ ] Activation step 2 loads config
- [ ] Persona has 3+ signature phrases
- [ ] Menu has 6-12 items
- [ ] All paths use `{project-root}`
- [ ] Tested in CLI: `/{agent-id}`
- [ ] Config variables replace correctly
- [ ] Agent stays in character
- [ ] All menu items tested

---

## Getting Help

**First Steps:**
1. Check this guide
2. Check MODULE-CREATION-PLAYBOOK.md
3. Review working examples in other modules

**If Still Stuck:**
1. Compare your agent to a working agent
2. Use diagnostic commands above
3. Check git history for changes
4. Start fresh from template

**Documentation:**
- Module Creation Playbook: `_bmad/cyber-ops/MODULE-CREATION-PLAYBOOK.md`
- Module README: `_bmad/{module}/README.md`
- BMAD Core Documentation: `_bmad/core/README.md`

---

**Version:** 1.0.0
**Created:** 2026-01-09
**Module:** cyber-ops (applicable to all BMAD modules)
**Purpose:** Fast troubleshooting reference
