# Threat Assessment

## Purpose

Provides comprehensive threat intelligence briefings including MITRE ATT&CK mapping, adversary profiling, and threat landscape analysis. Led by Cipher (Threat Analyst) to help organizations understand their threat environment and prioritize defenses.

## Trigger

**Agent:** Cipher (threat-analyst)
**Menu Code:** TA (Threat Assessment)
**Full Command:** `/bmad:cyber-ops:agents:threat-analyst` then select TA

## Key Steps

1. **Context Collection**
   - Gather organization profile (industry, size, geography, tech stack)
   - Understand critical assets and data
   - Review historical incident data if available

2. **Threat Landscape Analysis**
   - Identify relevant threat actor groups
   - Analyze current threat trends for industry vertical
   - Review recent campaigns and TTPs

3. **MITRE ATT&CK Mapping**
   - Map relevant tactics and techniques to organization
   - Identify likely attack paths and kill chains
   - Highlight high-priority techniques for defense

4. **Adversary Profiling**
   - Profile threat actors likely to target organization
   - Document motivations, capabilities, resources
   - Assess threat actor sophistication levels

5. **Intelligence Synthesis**
   - Correlate threat data from multiple sources
   - Identify emerging threats and vulnerabilities
   - Assess organizational exposure to threats

6. **Defensive Prioritization**
   - Recommend defensive priorities based on threat profile
   - Map threats to required security controls
   - Provide actionable threat hunting queries

7. **Briefing Generation**
   - Create executive and technical threat briefings
   - Generate MITRE ATT&CK heat maps
   - Document intelligence sources and confidence levels

## Expected Output

**Primary Artifact:** Threat Intelligence Briefing

**Format:** Markdown document saved to `{output_folder}/planning/threat-models/`

**Contents:**
- Executive Summary (threat landscape overview)
- Threat Actor Profiles (APT groups, cybercriminal networks)
- MITRE ATT&CK Heatmap (prioritized tactics/techniques)
- Threat Scenarios (likely attack vectors)
- Defensive Recommendations
- Threat Hunting Guidance
- Intelligence Sources & Confidence Levels

## Collaboration Pattern

**Primary Agent:** Cipher (threat-analyst)

**Optional Collaboration:**
- Phoenix (incident-commander) - For incident correlation analysis
- Bastion (security-architect) - For defensive architecture recommendations

## Use Cases

1. **Annual Threat Landscape Review** - Update organizational threat model
2. **Pre-Pentest Intelligence** - Inform penetration test scenarios
3. **Incident Context Development** - Understand attacker TTPs during active incidents
4. **Security Program Planning** - Prioritize security investments based on threats
5. **Board/Executive Briefings** - Communicate threat environment to leadership

## Implementation Notes

This workflow requires access to threat intelligence feeds and MITRE ATT&CK framework data. The workflow should:

- Guide conversational intelligence gathering
- Support integration with threat intel platforms (if available)
- Generate visual MITRE ATT&CK heat maps
- Provide threat hunting query templates
- Save structured briefing documents

## Integration with Agents

**Agent Menu Update Required:**

In `agents/threat-analyst.md`, update the TA menu item:
```xml
<item cmd="TA or fuzzy match on threat-assessment" exec="{project-root}/_bmad/cyber-ops/workflows/threat-assessment/workflow.md">[TA] Conduct threat intelligence briefing</item>
```
