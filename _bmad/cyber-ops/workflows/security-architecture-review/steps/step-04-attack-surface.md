---

name: 'step-04-attack-surface'
description: 'Optional step to collaborate with Ghost agent for offensive security perspective on attack surface'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-architecture-review'

# File References

thisStepFile: '{workflow_path}/steps/step-04-attack-surface.md'
nextStepFile: '{workflow_path}/steps/step-05-zero-trust.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{output_folder}/planning/architecture/security-review-{project_name}.md'

# Task References

partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

---

# Step 4: Attack Surface Analysis (Optional)

## STEP GOAL:

To optionally enhance the security assessment with an offensive security perspective by collaborating with Ghost agent (penetration tester) to identify attack vectors, exploitation paths, and practical attack scenarios that might not be obvious from defensive analysis alone.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Architect (Bastion persona) facilitating offensive perspective
- ✅ If you already have been given a name, communication_style and identity, continue to use those while playing this role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring defensive security expertise; Ghost brings offensive/exploitation expertise
- ✅ User brings architecture knowledge and operational context
- ✅ Together we identify real-world attack paths
- ✅ Maintain collaborative, security-focused, practical tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on attack surface analysis and exploitation perspectives
- 🚫 FORBIDDEN to jump ahead to zero-trust or recommendations
- 💬 Approach: Offer Ghost collaboration, facilitate if accepted, skip if declined
- 📋 This step is OPTIONAL - user chooses whether to invoke

## EXECUTION PROTOCOLS:

- 🎯 Present option to collaborate with Ghost agent for offensive perspective
- 💾 If Ghost collaboration occurs, document findings in Section 4 addendum
- 📖 Update frontmatter `stepsCompleted` to include 4 before loading next step
- 🚫 FORBIDDEN to force Ghost collaboration - user must opt in

## CONTEXT BOUNDARIES:

- Available context: Architecture Overview (Section 2), Threat Model (Section 3), Control Assessment (Section 4)
- Focus: Offensive security perspective on exploitability and attack paths
- Limits: Don't assume attack scenarios without offensive security validation
- Dependencies: Benefits from completed control assessment

## ATTACK SURFACE ANALYSIS SEQUENCE:

### 1. Present Attack Surface Analysis Option

"**Attack Surface Analysis - Offensive Perspective**

We've completed defensive threat modeling (STRIDE) and control assessment. Now I can optionally bring in Ghost, our penetration testing specialist, to provide an offensive security perspective.

**Ghost can help identify:**

- **Exploit chains**: Multi-step attack paths combining vulnerabilities
- **Realistic attack scenarios**: How real adversaries would target this architecture
- **Attack surface hotspots**: Components most likely to be targeted
- **Bypass techniques**: Ways to circumvent existing controls
- **Lateral movement paths**: How attackers move through the architecture after initial compromise
- **High-value targets**: Critical assets from an attacker's perspective

**Trade-offs:**

- **Value**: Offensive perspective often reveals attack paths defensive analysts miss
- **Cost**: Adds time to the review (15-30 minutes typically)
- **Best for**: Internet-facing systems, high-value assets, compliance requirements (PCI-DSS, SOC 2)

Would you like to bring Ghost into this review for an offensive security perspective?"

### 2. Branch Based on User Choice

#### Option A: User Accepts Ghost Collaboration

If user chooses to involve Ghost:

"**Initiating Ghost Collaboration**

I'll bring Ghost into the conversation with context about:
- Your architecture (components, data flows, tech stack)
- Identified STRIDE threats
- Existing security controls and gaps

Ghost will provide penetration testing perspective on exploitability and attack paths.

Let's begin..."

Execute Party Mode:

**Party Mode Prompt for Ghost:**

"Ghost, we're conducting a security architecture review for {project_name}. I need your offensive security expertise to analyze the attack surface.

**Context:**

**Architecture Summary:**
[Load and summarize from Section 2: key components, boundaries, tech stack]

**Identified Threats:**
[Load and summarize from Section 3: high-priority threats from STRIDE analysis]

**Control Gaps:**
[Load and summarize from Section 4: critical control gaps]

**Your Mission:**

1. **Attack Surface Mapping**: Identify the most attractive entry points for real-world attackers
2. **Exploit Chains**: Show how an attacker could chain vulnerabilities for high-impact attacks
3. **Bypass Techniques**: For existing controls, how would you bypass them?
4. **Lateral Movement**: After initial compromise, what lateral movement paths exist?
5. **Crown Jewels**: What are the highest-value targets (data, systems, credentials)?
6. **Realistic Scenarios**: Describe 2-3 realistic attack scenarios with step-by-step exploitation

Focus on practical, high-impact attack paths rather than theoretical vulnerabilities. Assume a motivated attacker with intermediate skills and publicly available tools.

What attack vectors and exploitation paths concern you most?"

[Execute {partyModeWorkflow} with Ghost agent]

After Ghost collaboration completes:

"**Ghost Findings Integration**

Ghost identified [X] attack scenarios and [Y] high-priority attack vectors. Let me document these in our security review."

Update {outputFile} by adding to Section 4:

```markdown
### Attack Surface Analysis (Offensive Perspective)

**Conducted with:** Ghost (Penetration Testing Specialist)
**Date:** [Current date]

#### Attack Surface Hotspots

[List components identified as high-priority targets with exploitation potential]

#### Identified Attack Vectors

**[Attack Vector Name]:**
- **Entry Point:** [Where attacker gains initial access]
- **Exploitation Path:** [Step-by-step attack sequence]
- **Outcome:** [What attacker achieves]
- **Difficulty:** [Skill level required]
- **Existing Controls Bypassed:** [How controls are circumvented]

[Repeat for all identified attack vectors]

#### Exploit Chain Analysis

**Scenario [N]: [Attack Scenario Name]**
1. **Initial Access:** [How attacker gets in]
2. **Persistence:** [How attacker maintains access]
3. **Privilege Escalation:** [How attacker gains elevated privileges]
4. **Lateral Movement:** [How attacker moves through architecture]
5. **Objective:** [What attacker ultimately achieves]

[Repeat for all realistic attack scenarios]

#### Lateral Movement Paths

[Document paths attackers could use to move between compromised components]

#### High-Value Targets (Crown Jewels)

1. **[Asset/Component Name]**
   - **Value:** [Why attackers target this]
   - **Attack Difficulty:** [Ease of compromise]
   - **Protection Level:** [Current defenses]

[Repeat for all crown jewels]

#### Ghost's Recommendations

[Key offensive security insights and prioritized attack vectors to address]

---
```

#### Option B: User Declines Ghost Collaboration

If user chooses to skip Ghost collaboration:

"**Skipping Attack Surface Analysis**

Understood. We'll proceed directly to zero-trust validation without the offensive security perspective.

Note: If you want to add this analysis later, you can resume this workflow and Ghost can be brought in at that time."

Add brief note to {outputFile} Section 4:

```markdown
### Attack Surface Analysis

**Status:** Skipped (user opted to proceed without offensive security perspective)

_Note: This optional analysis can be added later by resuming the workflow._

---
```

### 3. Update Frontmatter

Update frontmatter in {outputFile}:
- Add 4 to `stepsCompleted` array: `stepsCompleted: [1, 2, 3, 4]`
- Set `lastStep: 'attack-surface'`
- Add `ghostCollaboration: [true/false]`

### 4. Present MENU OPTIONS

Display: **Select an Option:** [C] Continue to Zero-Trust Validation

#### Menu Handling Logic:

- IF C: Save attack surface analysis (if conducted) to {outputFile}, update frontmatter `stepsCompleted: [1, 2, 3, 4]`, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#4-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu options

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN 'C' is selected AND attack surface analysis is complete (or explicitly skipped) AND documented in {outputFile}, will you then:

1. Update frontmatter in {outputFile}: `stepsCompleted: [1, 2, 3, 4]`, `lastStep: 'attack-surface'`
2. Load, read entire file, then execute {nextStepFile} to begin zero-trust validation

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- User presented with clear option to involve Ghost
- If Ghost involved: Party Mode executed with proper context
- If Ghost involved: Attack scenarios and exploit chains documented
- If Ghost skipped: Documented as skipped in output file
- Attack surface analysis section added to Section 4
- User choice respected (no forcing collaboration)
- Frontmatter updated with step 4 completion

### ❌ SYSTEM FAILURE:

- Not offering Ghost collaboration option
- Forcing Ghost involvement without user choice
- Insufficient context provided to Ghost if collaboration occurs
- Not documenting Ghost findings if collaboration occurs
- Not documenting skip status if collaboration declined
- Proceeding to next step without completing this step
- Not updating frontmatter before loading next step

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
