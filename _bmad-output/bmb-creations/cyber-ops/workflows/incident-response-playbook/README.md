# Incident Response Playbook

## Purpose

Guides organizations through structured incident response using the PICERL methodology (Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned). Led by Phoenix (Incident Commander) with collaboration from Trace (Forensics) and Cipher (Threat Intel).

## Trigger

**Agent:** Phoenix (incident-commander)
**Menu Code:** IR (Incident Response)
**Full Command:** `/bmad:cyber-ops:agents:incident-commander` then select IR

## Key Steps

1. **Preparation Phase**
   - Review incident response plan readiness
   - Verify contact lists and escalation paths
   - Confirm tool availability and access

2. **Identification Phase**
   - Gather initial incident details (type, severity, scope)
   - Classify incident (malware, breach, DoS, insider threat, etc.)
   - Assess initial impact and affected systems
   - Determine incident severity (P0/P1/P2/P3/P4)

3. **Containment Planning**
   - Develop containment strategy (short-term and long-term)
   - Identify systems to isolate or monitor
   - Plan evidence preservation approach
   - Coordinate with Trace agent for forensic needs

4. **Eradication Strategy**
   - Identify root cause and attack vectors
   - Develop remediation steps
   - Plan system hardening and patching
   - Coordinate threat intelligence with Cipher agent

5. **Recovery Planning**
   - Define system restoration priorities
   - Develop validation and monitoring plan
   - Plan phased restoration approach
   - Establish return-to-normal criteria

6. **Lessons Learned**
   - Document incident timeline
   - Identify response strengths and gaps
   - Recommend process improvements
   - Update runbooks and playbooks

7. **Communications Management**
   - Draft internal communications
   - Prepare external notifications (if required)
   - Coordinate with legal/PR/compliance teams
   - Document all stakeholder communications

## Expected Output

**Primary Artifact:** Incident Response Playbook Document

**Format:** Markdown document saved to `{output_folder}/operations/incidents/`

**Contents:**
- Incident Summary & Classification
- PICERL Execution Plan
  - Containment Strategy
  - Eradication Steps
  - Recovery Plan
- Timeline of Actions
- Communications Log
- Evidence Preservation Notes
- Lessons Learned & Recommendations

**Secondary Artifacts:**
- Stakeholder communication templates
- System restoration checklists
- Post-incident review report

## Collaboration Pattern

**Primary Agent:** Phoenix (incident-commander)

**Automatic Collaboration:**
- Trace (forensic-investigator) - For evidence collection and forensic analysis
- Cipher (threat-analyst) - For threat context and TTP identification
- Bastion (security-architect) - For remediation architecture guidance (if needed)

**Workflow Orchestration:** Phoenix coordinates multi-agent response through Party Mode or direct invocations.

## Use Cases

1. **Active Incident Response** - Real-time guidance during security incidents
2. **Incident Response Drill Planning** - Tabletop exercise scenario development
3. **Post-Mortem Analysis** - Structured review of past incidents
4. **Playbook Development** - Create incident-type-specific response playbooks
5. **Crisis Management** - Coordinate complex multi-system incidents

## Implementation Notes

This workflow requires real-time decision support and multi-agent coordination. Implementation should:

- Support different incident types (malware, breach, DoS, insider, etc.)
- Provide severity-based response templates
- Enable dynamic agent collaboration during execution
- Track action items and responsibilities
- Generate timeline documentation
- Support evidence chain-of-custody tracking

## Integration with Agents

**Agent Menu Update Required:**

In `agents/incident-commander.md`, update the IR menu item:
```xml
<item cmd="IR or fuzzy match on incident-response" exec="{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook/workflow.md">[IR] Execute incident response playbook (PICERL)</item>
```
