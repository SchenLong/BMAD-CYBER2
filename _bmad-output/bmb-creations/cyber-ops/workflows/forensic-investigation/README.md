# Forensic Investigation

## Purpose

Conducts digital forensic investigations including evidence collection, preservation, analysis, and timeline reconstruction. Led by Trace (Forensic Investigator) with coordination from Phoenix for incident context and Cipher for threat attribution.

## Trigger

**Agent:** Trace (forensic-investigator)
**Menu Code:** FI (Forensic Investigation)
**Full Command:** `/bmad:cyber-ops:agents:forensic-investigator` then select FI

## Key Steps

1. **Investigation Initiation**
   - Define investigation scope and objectives
   - Understand incident context from Phoenix agent
   - Establish chain of custody requirements
   - Identify evidence sources (disk, memory, network, logs, cloud)

2. **Evidence Identification & Preservation**
   - Create forensic images of affected systems
   - Collect volatile data (memory dumps, active connections)
   - Preserve log files and network captures
   - Document evidence collection procedures
   - Maintain chain of custody documentation

3. **Evidence Analysis**
   - **Disk Forensics:** File system analysis, deleted file recovery, artifact extraction
   - **Memory Forensics:** Process analysis, malware detection, credential extraction
   - **Network Forensics:** Traffic analysis, lateral movement tracking, C2 identification
   - **Log Analysis:** Timeline correlation, user activity tracking, system events

4. **Timeline Reconstruction**
   - Build comprehensive incident timeline
   - Correlate events across multiple evidence sources
   - Identify initial compromise vector
   - Map attacker actions and lateral movement

5. **Artifact Analysis**
   - Analyze malware samples and tools
   - Extract IOCs (indicators of compromise)
   - Document attacker TTPs
   - Identify persistence mechanisms

6. **Threat Attribution** (Optional)
   - Collaborate with Cipher agent for threat intel
   - Match TTPs to known threat actors
   - Assess attribution confidence level
   - Document threat actor profiles

7. **Findings Documentation**
   - Generate forensic analysis report
   - Document evidence with chain of custody
   - Create executive summary
   - Provide remediation recommendations

## Expected Output

**Primary Artifact:** Forensic Investigation Report

**Format:** Markdown document saved to `{output_folder}/operations/forensics/`

**Contents:**
- Executive Summary
- Investigation Scope & Methodology
- Evidence Inventory (with chain of custody)
- Timeline of Events (detailed chronology)
- Technical Analysis Findings
- IOC List (hashes, IPs, domains, file paths)
- Attacker TTP Documentation
- Attribution Assessment (if applicable)
- Remediation Recommendations
- Lessons Learned

**Supporting Artifacts:**
- Chain of custody forms
- Evidence collection logs
- Technical analysis worksheets
- Timeline visualization
- IOC packages (STIX/CSV format)

## Collaboration Pattern

**Primary Agent:** Trace (forensic-investigator)

**Standard Collaboration:**
- Phoenix (incident-commander) - For incident context and coordination
- Cipher (threat-analyst) - For threat attribution and TTP analysis

**Workflow Coordination:** Typically invoked by Phoenix during incident response or as standalone investigation.

## Use Cases

1. **Post-Breach Investigation** - Determine scope and impact after security incident
2. **Malware Analysis** - Reverse engineer and document malicious software
3. **Legal Evidence Collection** - Forensically sound evidence for legal proceedings
4. **Insider Threat Investigation** - User activity analysis and data exfiltration
5. **Compliance Investigation** - Document security events for regulatory requirements

## Implementation Notes

Forensic investigation requires rigorous evidence handling and documentation. Implementation should:

- Support multiple evidence types (disk, memory, network, cloud)
- Provide chain of custody templates
- Guide timeline reconstruction methodology
- Generate IOC extraction checklists
- Support evidence documentation standards (ISO/IEC 27037)
- Integrate with forensic tools (if accessible)

## Integration with Agents

**Agent Menu Update Required:**

In `agents/forensic-investigator.md`, update the FI menu item:
```xml
<item cmd="FI or fuzzy match on forensic-investigation" exec="{project-root}/_bmad/cyber-ops/workflows/forensic-investigation/workflow.md">[FI] Conduct digital forensic investigation</item>
```
