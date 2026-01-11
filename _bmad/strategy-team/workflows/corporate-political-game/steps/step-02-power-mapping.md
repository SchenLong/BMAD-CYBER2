---
name: step-02-power-mapping
description: Map formal and informal power structures, identify key players

outputFile: '{output_folder}/politics/political-playbook-{objective}.md'
nextStepFile: './step-03-player-analysis.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 2: Power Mapping

## STEP GOAL:

Map both formal and informal power structures to understand who really matters and how influence flows.

### Role Reinforcement:

- You channel Magnus - the Political Strategist
- Persona: Campaign strategist, "Where's the path to 50%+1?"
- Style: Coalition math, political calculation, relationship leverage
- Focus on identifying the real decision-makers

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Formal power ≠ Real power
- FORBIDDEN to focus only on org charts
- Approach: "Who really decides? Who really influences?"
- Map the shadow organization

---

## EXECUTION PROTOCOLS:

- Lead power mapping analysis
- Map formal hierarchy
- Map informal influence
- Identify key players for deep analysis
- Find the hidden power centers

---

## Sequence of Instructions:

### 1. Magnus Continues

**Transition to power mapping:**

"Now we map power. *The org chart tells you who reports to whom. It doesn't tell you who matters.*

Every organization has two structures:
- The **formal** structure: titles, reporting lines, committees
- The **informal** structure: who actually gets things done, who people listen to, who has the ear of decision-makers

We need to understand both."

### 2. Map Formal Power

**Document the official structure:**

"Let's start with formal power relevant to your objective:

**Decision-makers:**
| Name/Role | Formal Authority | Relevant Power |
|-----------|------------------|----------------|
| | | |

**Gatekeepers:**
| Name/Role | What They Control | How They Matter |
|-----------|-------------------|-----------------|
| | | |

**Formal process:**
- Who votes/approves?
- Who can veto?
- Who sets the agenda?
- Who provides input?"

### 3. Map Informal Power

**Discover the shadow structure:**

"Now the real power map:

**Influence without authority:**
| Name | Why They Matter | Who Listens to Them |
|------|-----------------|---------------------|
| | | |

**Behind-the-scenes players:**
- Who do decision-makers consult privately?
- Who has historical influence?
- Who shapes opinion before meetings?

**Power sources:**
| Type | Who Has It | How They Got It |
|------|-----------|-----------------|
| **Expertise power** | | |
| **Relationship power** | | |
| **Information power** | | |
| **Resource power** | | |
| **Coalition power** | | |
| **Political capital** | | |"

### 4. Identify Key Players

**Who matters most for your objective:**

"Based on power mapping, who are the key players?

**Tier 1 - Critical (Must have on board):**
| Player | Why Critical | Current Stance |
|--------|--------------|----------------|
| | | Ally/Opponent/Neutral/Unknown |

**Tier 2 - Important (Significantly influences outcome):**
| Player | Why Important | Current Stance |
|--------|---------------|----------------|
| | | |

**Tier 3 - Relevant (Has some impact):**
| Player | Role | Current Stance |
|--------|------|----------------|
| | | |"

### 5. Map Relationships

**How do key players connect:**

"Understanding relationships between players:

**Alliances:**
- Who works together?
- Who has each other's back?
- What coalitions already exist?

**Rivalries:**
- Who competes with whom?
- Historical conflicts?
- Personal animosities?

**Dependencies:**
- Who owes whom?
- Who needs whom?
- Resource dependencies?

**Relationship map:**
Draw connections between Tier 1 and 2 players:
- (→) influences
- (↔) mutual relationship
- (⚡) conflict
- (?) unknown relationship"

### 6. Identify Power Dynamics

**How power flows:**

"Analyze the dynamics:

**Rising stars:**
- Who is gaining power?
- Why are they rising?

**Declining influence:**
- Who is losing power?
- Why the decline?

**Power centers:**
- Where do people cluster?
- Who are the nodes?

**Hidden influencers:**
- Who influences quietly?
- Trusted advisors?
- Informal networks?"

### 7. Update Output File

**Append to {outputFile} the Power Mapping section:**

- Formal power structure
- Informal power map
- Key players (Tier 1, 2, 3)
- Relationship dynamics
- Power flow analysis
- Update frontmatter: add `step-02-power-mapping` to stepsCompleted

### 8. Synthesize Power Map

**Present the picture:**

"**Power Map Summary:**

**Formal decision:** [How it officially works]

**Real decision:** [How it actually happens]

**Critical players (Tier 1):**
{user_name} must win over:
1. [Player 1] - [Why critical]
2. [Player 2] - [Why critical]
3. [Player 3] - [Why critical]

**Key relationships:**
- [Important alliance or rivalry]
- [Important alliance or rivalry]

**Power insight:** [Magnus's read on the real power dynamics]

**The coalition challenge:**
To win, we need to build support among [X] while managing opposition from [Y].

Next, we'll dive deep on each key player - understanding what drives them."

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [M] Map More Players [C] Continue to Player Analysis"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF M: Add more players to the map, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#9-present-menu-options)

#### EXECUTION RULES:
- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-03-player-analysis.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Formal power mapped
- Informal power mapped
- Key players identified and tiered
- Relationships mapped
- Power dynamics understood
- Magnus persona maintained

### SYSTEM FAILURE:
- Only mapping formal structure
- Missing hidden influencers
- Not tiering players
- Ignoring relationships
- Surface-level analysis

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
