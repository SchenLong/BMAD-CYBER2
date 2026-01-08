---
agentName: 'compliance-guardian'
agentType: 'expert'
agentFile: '/Users/paultinp/BMAD-CYBERSEC/_bmad/cyber/agents/compliance-guardian.md'
validationDate: '2026-01-08'
stepsCompleted:
  - v-01-load-review.md
  - v-02a-validate-metadata.md
  - v-02b-validate-persona.md
  - v-02c-validate-menu.md
  - v-02d-validate-structure.md
---

# Validation Report: compliance-guardian

## Agent Overview

**Name:** Sentinel
**Type:** Expert Agent
**Title:** Risk & Regulatory Compliance
**File:** /Users/paultinp/BMAD-CYBERSEC/_bmad/cyber/agents/compliance-guardian.md

---

## Validation Findings

### Metadata Validation

**Status:** ⚠️ WARNING

**Checks:**
- [x] id: kebab-case, no spaces - ✅ `compliance-guardian.agent.yaml`
- [x] name: clear display name - ✅ `Sentinel`
- [x] title: concise function description - ✅ `Risk & Regulatory Compliance`
- [x] icon: appropriate emoji/symbol - ✅ `📋`
- [ ] module: correct format - ⚠️ **MISSING** - No module property found
- [ ] hasSidecar: matches actual usage - ⚠️ **MISSING** - No hasSidecar property found

**Findings:**

1. **✅ PASS - id format:** The agent id `compliance-guardian.agent.yaml` follows kebab-case convention correctly.

2. **✅ PASS - name property:** The persona name `Sentinel` is distinct from the title and provides a clear identity for the agent.

3. **✅ PASS - title property:** `Risk & Regulatory Compliance` is an appropriate professional title that describes the agent's function.

4. **✅ PASS - icon property:** The `📋` (clipboard) emoji appropriately represents compliance and documentation work.

5. **⚠️ WARNING - module property MISSING:** According to BMAD standards, all agents should have a `module` property. Since this is part of a cybersecurity module, it should likely be:
   ```yaml
   module: cyber
   ```

6. **⚠️ WARNING - hasSidecar property MISSING:** The metadata should include `hasSidecar` property. For expert agents with workflows, this should typically be `true`. For this agent:
   ```yaml
   hasSidecar: false  # or true if sidecar folder exists
   ```

**Recommendation:** Add the missing metadata properties to the YAML frontmatter:
```yaml
---
name: "compliance-guardian"
description: "Risk & Regulatory Compliance Expert specializing in GRC, audit, and control frameworks"
module: cyber
hasSidecar: false
---
```

### Persona Validation

**Status:** ✅ PASS

**Checks:**
- [x] role: specific, not generic - ✅ Clear and specific
- [x] identity: defines who agent is - ✅ Well-defined background
- [x] communication_style: speech patterns only - ✅ Pure speech patterns
- [x] principles: first principle activates expert knowledge - ✅ Strong expert activation

**Findings:**

1. **✅ PASS - role property:**
   ```
   Risk & Regulatory Compliance Expert + Auditor
   ```
   - Clear, specific role combining compliance and audit expertise
   - No bleed from identity, communication_style, or principles
   - Concise and focused

2. **✅ PASS - identity property:**
   ```
   Senior GRC professional with 14+ years in highly regulated industries including finance,
   healthcare, and government. Former Big 4 auditor turned CISO advisor. Expert in NIST CSF,
   SOC 2, PCI-DSS, HIPAA, GDPR, and emerging AI regulations. CISM, CRISC, CISA certified.
   Has guided organizations through dozens of audits and regulatory examinations.
   ```
   - **Excellent background establishment** with specific years of experience
   - **Strong credibility markers**: Big 4 auditor, multiple certifications (CISM, CRISC, CISA)
   - **Domain expertise clearly defined**: Multiple frameworks (NIST CSF, SOC 2, PCI-DSS, HIPAA, GDPR)
   - **Real-world experience quantified**: "dozens of audits and regulatory examinations"
   - No overlap with role, communication_style, or principles

3. **✅ PASS - communication_style property:**
   ```
   Policy-focused, citation-heavy. Bridges technical and business language effortlessly.
   "Per NIST 800-53 control AC-2..." "The regulatory exposure here is..." "Let me map this
   to our control framework..." "What's the business justification for this risk acceptance?"
   Always quantifies risk in business terms.
   ```
   - **Pure speech patterns** - describes HOW the agent talks
   - **Excellent use of example phrases** showing actual speech patterns
   - **No behavioral verbs** - focuses on verbal style only
   - **Passes the "reading aloud test"** - sounds like describing a voice
   - No overlap with role, identity, or principles

4. **✅ PASS - principles with expert activation:**
   ```
   - Compliance is the floor, not the ceiling - it's where you start, not where you stop
   - Risk must be quantified to be managed - vague fears don't get budget
   - Controls without evidence are assumptions waiting to fail an audit
   - Business context determines acceptable risk - security serves the mission
   - Document decisions and rationale - your future auditor will thank you
   ```
   - **Strong unique philosophy** that distinguishes this agent
   - **First principle sets expert mindset**: "Compliance is the floor, not the ceiling" establishes expert positioning
   - **Each principle is a belief, not a task**
   - **Passes the "obvious test"**: These are NOT generic compliance duties
   - **Business-focused risk mindset** throughout
   - **5 focused, actionable principles**
   - No overlap with role, identity, or communication_style

**Overall Persona Assessment:**

The compliance-guardian persona is **exceptionally well-crafted** and demonstrates strong adherence to BMAD standards:

- **Clear field separation**: Each field serves its distinct purpose without blurring
- **Expert activation**: The principles establish a seasoned GRC professional mindset
- **Unique character**: The "compliance is the floor" philosophy differentiates this agent
- **Credible identity**: 14+ years, Big 4 background, multiple certifications
- **Authentic voice**: Citation-heavy, policy-focused speech patterns

**No issues found in persona structure.**

### Menu Validation

**Status:** ⚠️ WARNING

**Checks:**
- [x] Menu items present - ✅ 9 menu items found
- [ ] Standard BMAD YAML format - ⚠️ Uses XML format instead
- [x] Command codes are unique - ✅ All codes unique
- [x] Command descriptions clear - ✅ Clear and actionable
- [ ] Proper handler types - ⚠️ Mixed terminology

**Menu Items Found:**
1. `[MH]` Redisplay Menu Help
2. `[CH]` Chat with Sentinel about compliance and risk
3. `[RA]` Conduct comprehensive risk analysis - `workflow="todo"`
4. `[CA]` Perform compliance gap assessment - `workflow="todo"`
5. `[CM]` Control framework mapping - `action="..."`
6. `[RR]` Risk register development - `action="..."`
7. `[PR]` Policy documentation review - `action="..."`
8. `[VR]` Vendor risk assessment - `action="..."`
9. `[PM]` Consult with cybersec expert team - `exec="{project-root}/..."`
10. `[DA]` Dismiss Agent

**Findings:**

1. **⚠️ WARNING - XML format vs YAML:** The agent uses XML-style `<menu><item>` structure instead of standard BMAD YAML menu format. This appears to be a design choice for this module.

2. **⚠️ WARNING - Mixed handler terminology:**
   - `workflow="todo"` (should be `exec: 'todo'`)
   - `action="..."` (correct for inline actions)
   - `exec="..."` (correct for workflows)

3. **✅ PASS - Domain-appropriate commands:** Menu includes relevant compliance operations:
   - Risk analysis and quantification
   - Compliance gap assessment
   - Control framework mapping
   - Risk register development
   - Policy review
   - Vendor risk assessment

4. **✅ PASS - Command codes:** All unique, no conflicts with reserved codes (MH, CH, PM, DA)

5. **✅ PASS - Fuzzy matching:** All items include proper fuzzy match patterns

**Recommendation:** If XML format is intentional for cyber module, this is acceptable. Otherwise, consider migrating to standard YAML menu format for consistency.

