# Intel Team: Proxy Agent Creation - Lessons Learned

**Date:** 2026-01-10
**Module:** intel-team
**Agent Created:** Proxy (Corporate Intelligence Specialist)

## Context

During workflow testing of the Flash Assessment workflow, a gap was identified: no agent was collecting corporate registry or business entity verification data. This was identified by the user after testing the workflow against a real target (blackunicorn.tech).

## Gap Identified

The Flash Assessment workflow had parallel collection from:
- Probe (Technical)
- Echo (Social)
- Shadow (Dark Web)

**Missing:** Corporate/entity validation through:
- Business registries
- Tax authority records
- Company formation databases
- VAT registration verification
- Director/officer filings

## Resolution

Created a new agent: **Corporate Intelligence Specialist**

### Original Name Conflict

**CRITICAL LESSON:** Initially named the agent "Ledger" - this name was already taken by the `blockchain-security-expert` agent in the `cyber-ops` module.

### Name Validation Process

Searched all modules for existing agent codenames:
```bash
grep -r 'name="[A-Z][a-z]+"' _bmad/**/*.md
```

**Existing names across BMAD ecosystem (as of 2026-01-10):**

| Module | Codenames |
|--------|-----------|
| **CIS** | Victor, Sophia, Maya, Caravaggio, Carson |
| **BMGD** | Indie, Max |
| **BMM** | Paige, Barry, Bob, John, Murat, Amelia, Sally, Mary, Winston |
| **Exec-ops** | Charles, Sun, Musashi, Maximilien, Burke, Lee, Magnus, Joseph, Augustus, Geneva, Niccolo, Cicero |
| **Cyber-ops** | Weaver, Ghost, Gateway, Nimbus, Phoenix, Oracle, Trace, Sentinel, Shield, Phantom, **Ledger**, Watchman, Bastion, Cipher |
| **BMB** | Morgan, Wendy, Bond |
| **Intel-team** | Vector, Resolver, Echo, Shadow, Atlas, Probe, Dossier, Viper, Sigil, Specter |

### Final Name Selection

Renamed to **"Proxy"** - fits the corporate intelligence theme:
- Proxy voting in corporate governance
- Nominee/proxy directors hide beneficial owners
- The agent's core function is revealing who hides behind proxies

## Files Updated

1. `intel-team/agents/corporate-intel-specialist.md` - New agent file
2. `intel-team/workflows/flash-assessment/workflow.md` - Added Proxy to parallel agents
3. `intel-team/workflows/flash-assessment/steps/step-02-parallel-collection.md` - Added Proxy collection tasks
4. `intel-team/workflows/flash-assessment/steps/step-03-synthesis.md` - Added corporate findings to synthesis
5. `intel-team/README.md` - Updated agent count to 11, added Proxy to roster

## Key Takeaway

**ALWAYS validate agent codenames against the full BMAD ecosystem roster before finalizing.**

The codename collision between intel-team's "Ledger" and cyber-ops's "Ledger" could have caused confusion when:
- Invoking agents by name in Party Mode
- Cross-module workflows referencing agents
- Documentation and user mental models

## Recommended Practice

Before creating any new agent:

1. Search all modules for existing codenames:
   ```bash
   grep -rh 'name="[A-Z][a-z]+"' _bmad/**/*.md _bmad-output/**/*.md | sort -u
   ```

2. Maintain a central roster document (or add to module.yaml specifications)

3. For thematic names, consider the agent's core function:
   - Technical agents: operational/tool names (Probe, Cipher, Gateway)
   - Intelligence agents: action/role names (Vector, Shadow, Dossier)
   - Corporate/financial: structure/process names (Proxy, Escrow, Charter)

## Agent Specification: Proxy

```xml
<agent id="corporate-intel-specialist.agent.yaml" name="Proxy" title="Corporate Intelligence Specialist" icon="📊">
```

**Background:** 16-year career spanning FinCEN, SEC Enforcement, corporate investigations

**Expertise:**
- Global business registry analysis
- Beneficial ownership tracing (UBO identification)
- Shell company detection
- Sanctions/PEP screening
- Financial statement analysis
- Corporate structure mapping

**Knowledge Base Includes:**
- Registry sources by region (EU, North America, Offshore, APAC)
- Financial data sources (SEC EDGAR, credit reports, sanctions lists)
- Red flag indicators for corporate opacity

---

*Experience logged for future agent creation reference.*
