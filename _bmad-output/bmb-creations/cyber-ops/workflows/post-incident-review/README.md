# Post-Incident Review

## Purpose

Collaborative multi-agent retrospective to analyze completed security incidents, extract lessons learned, and improve incident response capabilities. Led by Phoenix (Incident Commander) with Trace (forensic evidence) and Cipher (threat context).

## Trigger

**Lead Agents:** Phoenix (incident-commander) + Trace (forensic-investigator) + Cipher (threat-analyst)
**Invocation:** Via Party Mode - `/bmad:core:workflows:party-mode`
**Participants:** incident-commander, forensic-investigator, threat-analyst

## Key Steps

1. **Incident Summary & Context** (Phoenix-led)
   - Review incident timeline and response actions
   - Document incident classification and severity
   - Identify all stakeholders and responders
   - Gather incident response artifacts

2. **Forensic Evidence Review** (Trace-led)
   - Present forensic findings and root cause analysis
   - Document attack vectors and tactics
   - Review evidence quality and gaps
   - Assess attacker sophistication

3. **Threat Intelligence Integration** (Cipher-led)
   - Provide threat actor attribution (if possible)
   - Map incident to MITRE ATT&CK framework
   - Identify similar incidents and trends
   - Document evolving threat landscape

4. **Response Effectiveness Analysis** (Collaborative)
   - Evaluate detection capabilities
   - Assess containment effectiveness
   - Review communication effectiveness
   - Identify response time bottlenecks
   - Document what worked well

5. **Gap Identification** (Collaborative)
   - Identify missed detection opportunities
   - Document tool and capability gaps
   - Assess training and preparedness gaps
   - Review process and playbook deficiencies

6. **Lessons Learned Documentation**
   - Capture key insights from all perspectives
   - Document defensive failures and successes
   - Identify systemic issues vs. one-time problems
   - Prioritize improvements by impact

7. **Preventive Measures & Recommendations**
   - Technical remediation (patches, hardening, controls)
   - Process improvements (playbooks, procedures)
   - Tool and capability investments
   - Training and awareness needs
   - Monitoring and detection enhancements

8. **Action Plan Development**
   - Assign ownership for improvements
   - Establish timelines and milestones
   - Define success criteria
   - Schedule follow-up reviews

## Expected Output

**Primary Artifact:** Post-Incident Review Report

**Format:** Markdown document saved to `{output_folder}/operations/incidents/post-mortems/`

**Contents:**
- Incident Summary
- Timeline of Events (high-level)
- Forensic Findings Summary
- Threat Intelligence Context
- Response Effectiveness Analysis
- What Went Well
- What Went Wrong
- Lessons Learned
- Root Cause Analysis
- Preventive Measures & Recommendations
- Action Plan (with owners and timelines)

**Supporting Artifacts:**
- Detailed action item tracker
- Technical remediation checklist
- Process improvement documentation
- Training needs assessment

## Collaboration Pattern

**Multi-Agent (Party Mode):**
- Phoenix (incident-commander) - Response coordination and overall effectiveness
- Trace (forensic-investigator) - Technical evidence and root cause
- Cipher (threat-analyst) - Threat context and attribution

**Workflow Coordination:** Structured review with each agent contributing domain expertise.

## Use Cases

1. **Major Incident Retrospective** - Post-mortem after significant security events
2. **Incident Response Process Improvement** - Quarterly IR process reviews
3. **Board/Executive Briefing** - Communicate incident lessons to leadership
4. **Tabletop Exercise Debriefs** - Review IR drill performance
5. **Continuous Improvement** - Regular retrospectives for minor incidents

## Implementation Notes

This Party Mode workflow facilitates structured retrospectives. Implementation should:

- Support asynchronous agent contributions
- Facilitate blameless post-mortem culture
- Generate action item tracking
- Enable trend analysis across multiple incidents
- Integrate forensic and threat intel findings

## Integration with Agents

**No direct agent menu item** - Invoked via Party Mode:

```bash
/bmad:core:workflows:party-mode
# Select: incident-commander, forensic-investigator, threat-analyst
# Purpose: Post-Incident Review
```

Or invoked by Phoenix agent after incident closure.
