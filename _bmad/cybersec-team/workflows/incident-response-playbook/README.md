# Incident Response Playbook Workflow

## Overview

A comprehensive dual-mode workflow for incident response that supports both playbook creation (Mode A) and guided incident execution (Mode B). Follows NIST SP 800-61 and integrates MITRE ATT&CK framework for threat classification.

## Workflow Structure

```
incident-response-playbook/
├── workflow.md
├── README.md
└── steps/
    ├── step-01-init.md
    ├── step-01b-continue.md
    ├── step-02-preparation.md
    ├── step-03-detection.md
    ├── step-04-analysis.md
    ├── step-05-containment.md
    ├── step-06-eradication.md
    ├── step-07-recovery.md
    ├── step-08-lessons-learned.md
    └── [mode-specific steps]
```

## Dual-Mode Operation

### Mode A: Playbook Creation
- Create organization-specific incident response playbooks
- Define procedures for different incident types
- Establish escalation paths and communication templates
- Build runbooks for common scenarios

### Mode B: Guided Execution
- Execute real-time incident response
- Follow established playbook procedures
- Document timeline and evidence
- Generate post-incident reports

## Coverage

- **Preparation**: IR team setup, tools, communication plans
- **Detection & Analysis**: Alert triage, IOC identification, scope assessment
- **Containment**: Short-term and long-term containment strategies
- **Eradication**: Malware removal, system hardening
- **Recovery**: Service restoration, monitoring
- **Post-Incident**: Lessons learned, playbook updates

## Frameworks

- NIST SP 800-61 Rev 2 (Incident Handling)
- MITRE ATT&CK Framework
- SANS Incident Handler's Handbook

## Compliance Support

- GDPR (72-hour notification)
- PCI DSS (immediate notification)
- HIPAA (60-day notification)
- SOC 2 / ISO 27001

## Related Agents

- **Phoenix** (Incident Commander): Primary agent for this workflow
- **Trace** (Forensic Investigator): For evidence collection
- **Cipher** (Threat Analyst): For threat intelligence
- **Watchman** (SOC Analyst): For detection and monitoring

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial workflow |
