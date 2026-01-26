# BMAD User Onboarding Journey

> **Version:** 1.0
> **Last Updated:** 2026-01-26
> **Audience:** New BMAD users at any experience level

---

## Welcome to BMAD

This guide takes you from first installation to productive daily use. Follow the journey at your own pace, achieving quick wins along the way.

---

## Your Onboarding Path

```
Day 1          Week 1           Week 2-4         Ongoing
  │              │                 │               │
  ▼              ▼                 ▼               ▼
┌─────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐
│ Install │──│ Explore  │──│  Advanced   │──│  Master  │
│ & Setup │  │ & Learn  │  │   Usage     │  │  & Grow  │
└─────────┘  └──────────┘  └─────────────┘  └──────────┘
```

---

## Phase 1: Day 1 - Installation & First Steps

### Goals
- [ ] Install BMAD successfully
- [ ] Run your first agent
- [ ] Understand basic concepts
- [ ] Complete your first workflow

### Step 1.1: Installation (15 minutes)

**Prerequisites:**
- Node.js 18+ installed
- Claude Code or compatible AI IDE
- Terminal access

**Install BMAD:**
```bash
# Clone the repository
git clone https://github.com/your-org/bmad-cyber2.git
cd bmad-cyber2

# Install dependencies
npm install

# Run the installer
bmad install
```

**During Installation:**
1. Select your modules (start with Core + BMM)
2. Set your output folder preferences
3. Configure language settings

**Verification:**
```bash
# Verify installation
bmad --version

# List available agents
bmad agents

# List available workflows
bmad workflows
```

**Checkpoint:** You should see a list of available agents and workflows.

---

### Step 1.2: Understanding Core Concepts (20 minutes)

**Key Terminology:**

| Term | Definition |
|------|------------|
| **Agent** | Specialized AI persona with specific expertise |
| **Workflow** | Multi-step process combining agents and tasks |
| **Module** | Package of related agents and workflows |
| **Party Mode** | Multi-agent collaborative discussion |
| **Abdul** | Master project manager for coordination |

**Module Structure:**
```
_bmad/
├── core/           # Always installed
│   ├── agents/     # Abdul, BMAD Master
│   └── workflows/  # Party Mode, etc.
├── bmm/            # Product development
├── cybersec-team/  # Security operations
└── [other modules]
```

**How It Works:**
1. You invoke an agent or workflow
2. The agent accesses its specialized knowledge
3. Output is saved to your configured folder
4. Abdul coordinates multi-agent tasks

---

### Step 1.3: Your First Agent Interaction (10 minutes)

**Try the BMAD Master:**
```bash
# Start BMAD Master for system overview
/bmad:bmad-master
```

Ask: "What modules are installed and what can I do with them?"

**Try Abdul (Project Manager):**
```bash
/bmad:core:agents:abdul
```

Ask: "Help me understand my options for starting a new project"

**Checkpoint:** You've had conversations with two agents.

---

### Step 1.4: Your First Workflow (15 minutes)

**Run the Brainstorming Workflow:**
```bash
/bmad:core:workflows:brainstorming
```

**Follow the prompts to:**
1. Define a topic (e.g., "Ideas for a mobile app")
2. Select brainstorming technique
3. Generate ideas with agent facilitation
4. Review the output

**Checkpoint:** You have a brainstorming output file.

---

### Day 1 Summary

| Achievement | Status |
|-------------|--------|
| BMAD installed | [ ] |
| Ran first agent | [ ] |
| Understand key concepts | [ ] |
| Completed first workflow | [ ] |

**Time invested:** ~1 hour
**You're ready for:** Week 1 exploration

---

## Phase 2: Week 1 - Explore & Learn

### Goals
- [ ] Try 3-5 different agents
- [ ] Complete 2-3 workflows
- [ ] Use Party Mode for the first time
- [ ] Create your first project artifact

### Day 2-3: Explore Your Modules

**If you have BMM (Product Development):**

Try the Product Manager:
```bash
/bmm:pm
```
Ask: "I want to build a task management app. Help me create a product brief."

Try the Architect:
```bash
/bmm:architect
```
Ask: "Design a simple architecture for a REST API with user authentication"

**If you have Cybersec-Team:**

Try the Security Architect:
```bash
/bmad:cybersec-team:agents:security-architect
```
Ask: "What security considerations should I have for a new web application?"

**If you have Strategy-Team:**

Try the Master Strategist:
```bash
/bmad:strategy-team:agents:the-master-strategist
```
Ask: "Analyze the competitive landscape for project management tools"

**Checkpoint:** You've tried agents from multiple domains.

---

### Day 4-5: Workflow Deep Dive

**BMM Workflows to Try:**

1. **Create a Product Brief:**
```bash
/bmm:create-product-brief
```
Follow the guided process to create a complete product brief.

2. **Create Architecture:**
```bash
/bmm:create-architecture
```
Design system architecture with AI guidance.

**Core Workflows to Try:**

1. **Party Mode:**
```bash
/bmad:core:workflows:party-mode
```
Assemble multiple agents for a collaborative discussion.

2. **Project Status:**
```bash
/bmad:core:workflows:project-status
```
Generate a project status dashboard.

---

### Day 6-7: Party Mode Mastery

**Understanding Party Mode:**

Party Mode assembles multiple agents for collaborative discussion. It's like having a team meeting with specialists.

**Your First Party Mode Session:**
```bash
/bmad:core:workflows:party-mode
```

1. **Select a preset** (e.g., "Strategic Planning")
2. **Or manually select agents** from different modules
3. **Define the discussion topic**
4. **Facilitate the conversation**

**Example Scenario:**
- Topic: "Should we pivot our product strategy?"
- Agents: Product Manager + Strategist + Market Analyst
- Output: Multi-perspective analysis

**Party Mode Tips:**
- Start with 2-3 agents, add more as needed
- Let agents build on each other's points
- Summarize key insights at the end

**Checkpoint:** You've run a successful Party Mode session.

---

### Week 1 Summary

| Achievement | Status |
|-------------|--------|
| Tried 3-5 agents | [ ] |
| Completed 2-3 workflows | [ ] |
| Used Party Mode | [ ] |
| Created project artifact | [ ] |

**Time invested:** 3-5 hours total
**You're ready for:** Advanced usage

---

## Phase 3: Weeks 2-4 - Advanced Usage

### Goals
- [ ] Build a complete project with BMAD
- [ ] Master cross-module workflows
- [ ] Customize your workflow
- [ ] Integrate with your existing tools

### Week 2: Complete Project Flow

**Project Challenge:** Build a complete product specification

**Day 1-2: Discovery Phase**
```bash
# Start with business analysis
/bmm:analyst

# Create product brief
/bmm:create-product-brief
```

**Day 3-4: Planning Phase**
```bash
# Create PRD
/bmm:create-prd

# Design architecture
/bmm:create-architecture
```

**Day 5-7: Specification Phase**
```bash
# Create epics and stories
/bmm:create-epics-and-stories

# Review with Party Mode
/bmad:core:workflows:party-mode
```

**Checkpoint:** You have a complete product specification package.

---

### Week 3: Cross-Module Mastery

**Combine Modules for Powerful Workflows:**

**Security-Aware Development (BMM + Cybersec):**
```bash
# 1. Create architecture
/bmm:create-architecture

# 2. Threat model with Cybersec
/bmad:cybersec-team:workflows:threat-modeling

# 3. Review security requirements
/bmad:cybersec-team:agents:security-architect
```

**Strategic Product Planning (BMM + Strategy):**
```bash
# 1. Competitive analysis
/bmad:strategy-team:agents:the-master-strategist

# 2. Product strategy
/bmm:pm

# 3. Multi-perspective review
/bmad:core:workflows:party-mode
```

**Intelligence-Driven Security (Intel + Cybersec):**
```bash
# 1. Threat landscape analysis
/bmad:intel-team:agents:threat-actor-profiler

# 2. Security architecture
/bmad:cybersec-team:agents:security-architect

# 3. Incident response planning
/bmad:cybersec-team:workflows:incident-response-playbook
```

---

### Week 4: Customization & Integration

**Customize Your Experience:**

1. **Configure Output Folders:**
   Edit module configs in `_bmad/[module]/module.yaml`

2. **Set Up Favorites:**
   Create aliases for frequently used workflows

3. **Integrate with Git:**
   - Commit BMAD outputs to version control
   - Track changes to specifications

**Advanced Techniques:**

**1. Chained Workflows:**
Use output from one workflow as input to another:
```bash
# Create brief, then immediately create PRD
/bmm:create-product-brief
# Use the brief to...
/bmm:create-prd
```

**2. Abdul Orchestration:**
Let Abdul manage complex multi-step tasks:
```bash
/bmad:core:agents:abdul
```
"Coordinate a complete security assessment: threat model, architecture review, and recommendations"

**3. Preset Party Modes:**
Use pre-configured team assemblies:
```bash
/bmad:core:workflows:select-preset
```

---

### Weeks 2-4 Summary

| Achievement | Status |
|-------------|--------|
| Complete project built | [ ] |
| Cross-module workflow | [ ] |
| Customized setup | [ ] |
| Integrated with tools | [ ] |

**Time invested:** 5-10 hours total
**You're ready for:** Mastery and contribution

---

## Phase 4: Ongoing - Master & Grow

### Goals
- [ ] Develop personal best practices
- [ ] Contribute improvements
- [ ] Train others
- [ ] Stay current with updates

### Develop Your Workflow

**Daily BMAD Habits:**

| Time | Activity |
|------|----------|
| Morning | Check project status with Abdul |
| Working | Use relevant agents for current tasks |
| End of day | Document progress, plan tomorrow |

**Weekly Review:**
- What agents were most useful?
- Which workflows need improvement?
- Any new use cases discovered?

---

### Best Practices

**DO:**
- Start with clear objectives
- Use Party Mode for complex decisions
- Save and version control outputs
- Let agents complete their full analysis
- Combine perspectives from multiple agents

**DON'T:**
- Rush through agent responses
- Ignore agent recommendations
- Use security/legal agents without proper context
- Skip the discovery phase
- Forget to review AI-generated content

---

### Common Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| Too many agents at once | Start with 2-3, add as needed |
| Skipping discovery | Always start with analysis |
| Ignoring agent expertise | Trust domain specialists |
| Not saving outputs | Configure output folders |
| Working in isolation | Use Party Mode for review |

---

### Measuring Success

**Beginner Metrics (Month 1):**
- [ ] 10+ agent interactions
- [ ] 5+ completed workflows
- [ ] 1+ complete project artifact

**Intermediate Metrics (Month 2-3):**
- [ ] Cross-module workflow mastery
- [ ] Custom workflow developed
- [ ] Team member trained

**Advanced Metrics (Month 3+):**
- [ ] Contributing improvements
- [ ] Complex multi-agent orchestration
- [ ] Integrated into daily workflow

---

### Getting Help

**Resources:**
- `/help` - Built-in help system
- `Docs/` - Full documentation
- `Docs/02-user-guides/` - User guides
- Issues - GitHub issue tracker

**Community:**
- Ask Abdul for guidance
- Use BMAD Master for system questions
- Check workflow README files

---

## Quick Reference

### Essential Commands

```bash
# List agents
bmad agents

# List workflows
bmad workflows

# Get help
/help

# Start Abdul
/bmad:core:agents:abdul

# Start Party Mode
/bmad:core:workflows:party-mode

# Check project status
/bmad:core:workflows:project-status
```

### Workflow Shortcuts

| Task | Workflow |
|------|----------|
| Brainstorm ideas | `/bmad:core:workflows:brainstorming` |
| Create product brief | `/bmm:create-product-brief` |
| Design architecture | `/bmm:create-architecture` |
| Security review | `/bmad:cybersec-team:workflows:security-architecture-review` |
| Strategic decision | `/bmad:strategy-team:workflows:strategic-decision-workshop` |

---

## Your Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│                    BMAD MASTERY PATH                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BEGINNER          INTERMEDIATE         ADVANCED            │
│  ─────────         ────────────         ────────            │
│                                                             │
│  □ Install         □ Complete project   □ Custom workflows  │
│  □ First agent     □ Cross-module       □ Train others      │
│  □ First workflow  □ Party Mode master  □ Contribute        │
│  □ Core concepts   □ Customization      □ Integration       │
│                                                             │
│  Week 1            Weeks 2-4            Month 2+            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Congratulations!

You now have a clear path from BMAD beginner to power user. Remember:

1. **Start small** - Master one module before adding more
2. **Practice daily** - Regular use builds expertise
3. **Experiment** - Try different agent combinations
4. **Document** - Save what works for you
5. **Share** - Help others on their journey

Welcome to the BMAD community!

---

*Document generated: 2026-01-26*
*Location: Docs/02-user-guides/USER-ONBOARDING-JOURNEY.md*
