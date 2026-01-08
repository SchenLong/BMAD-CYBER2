# Cyber-Ops Module

**Module Name:** cyber-ops
**Full Name:** Cybersecurity Operations Module
**Version:** 1.0.0
**Created:** 2026-01-08
**Status:** Production Ready

---

## Module Overview

The **Cyber-Ops Module** provides enterprise-grade cybersecurity workflows for security operations teams, security architects, and incident responders. This module implements industry-standard frameworks including NIST, STRIDE, and MITRE ATT&CK to deliver comprehensive security capabilities.

## Module Purpose

To provide structured, repeatable, and collaborative workflows that:
- Guide security teams through complex security operations
- Implement industry best practices and compliance frameworks
- Generate professional documentation for stakeholders and auditors
- Support multi-session execution for time-intensive security work
- Integrate threat intelligence and security frameworks

## Workflows Included

### 1. Incident Response Playbook (19 files)

**Path:** `workflows/incident-response-playbook/`
**Status:** ✅ Production Ready
**Purpose:** Dual-mode workflow for creating incident response playbooks AND guiding real-time incident response

**Key Features:**
- **Mode A:** Create custom incident response playbooks (8-section NIST-compliant documents)
- **Mode B:** Real-time guided incident response with forensic evidence collection
- 10 incident types supported (ransomware, data breach, DDoS, etc.)
- MITRE ATT&CK framework integration
- Auto-generated incident IDs (INC-YYYY-NNN format)
- Chain of custody documentation
- Sidecar file timeline tracking
- Regulatory compliance guidance (GDPR, PCI-DSS, HIPAA)
- Party Mode with 4 expert agents (Bastion, Trace, Cipher, General)

**Estimated Duration:**
- Mode A (Playbook Creation): 3-4 hours
- Mode B (Incident Response): Varies by incident (hours to days)

**Output Documents:**
- Mode A: Comprehensive 8-section incident response playbook
- Mode B: Complete 9-section incident report with timeline

**Invocation:**
```
/bmad:cyber-ops:workflows:incident-response-playbook
```

---

### 2. Security Architecture Review (8 files)

**Path:** `workflows/security-architecture-review/`
**Status:** ✅ Production Ready
**Purpose:** Comprehensive security architecture assessment using STRIDE threat modeling and zero-trust validation

**Key Features:**
- STRIDE threat modeling (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
- Security control assessment with gap analysis
- Attack surface analysis with Ghost agent collaboration (optional)
- Zero-trust principle validation (7 principles)
- Risk prioritization matrix (Critical/High/Medium/Low)
- Specific, actionable recommendations with phased roadmap
- Multi-session continuation support
- Party Mode collaboration (Ghost, Sentinel agents)

**Estimated Duration:** 4-6 hours (varies by architecture complexity)

**Output Documents:**
- 7-section Security Architecture Review Report
- Executive summary for stakeholders
- Technical recommendations for dev/ops teams

**Invocation:**
```
/bmad:cyber-ops:workflows:security-architecture-review
```

---

### 3. Threat Modeling (11 files)

**Path:** `workflows/threat-modeling/`
**Status:** ✅ Production Ready
**Purpose:** Systematic STRIDE-based threat modeling for system designs with risk assessment and mitigation strategies

**Key Features:**
- System decomposition and component identification
- Iterative component analysis (analyze multiple components systematically)
- Complete STRIDE threat identification for each component
- Risk assessment with Likelihood × Impact scoring
- Security controls with P0-P3 prioritization
- Ownership assignment and effort estimation
- Residual risk documentation
- Aggregate findings across all components
- Implementation roadmap with phasing
- Security architecture recommendations
- Multi-session continuation support

**Estimated Duration:** 2-8 hours (depends on number of components)

**Output Documents:**
- 6-section Threat Model Document
  1. System Overview
  2. System Decomposition
  3. STRIDE Threat Analysis (per component)
  4. Risk Assessment (per component)
  5. Mitigation Strategies (per component)
  6. Summary and Recommendations

**Invocation:**
```
/bmad:cyber-ops:workflows:threat-modeling
```

---

## Module Architecture

### Directory Structure

```
_bmad/cyber-ops/
├── README.md                           # This file
├── config.yaml                         # Module configuration
├── workflows/
│   ├── incident-response-playbook/
│   │   ├── workflow.md
│   │   ├── data/                       # 3 CSV files
│   │   ├── templates/                  # 2 template files
│   │   └── steps/                      # 14 step files
│   ├── security-architecture-review/
│   │   ├── workflow.md
│   │   ├── templates/                  # 1 template file
│   │   └── steps/                      # 8 step files
│   └── threat-modeling/
│       ├── workflow.md
│       └── steps/                      # 9 step files
└── agents/                             # (Future: cyber-specific agents)
```

### Workflow Architecture Standards

All cyber-ops workflows follow BMAD workflow architecture:

- **Step-File Architecture:** Micro-file design with just-in-time loading
- **Sequential Enforcement:** No skipping steps or optimizing sequences
- **Frontmatter State Tracking:** Progress tracked via `stepsCompleted` array
- **Multi-Session Continuation:** `step-01b-continue.md` handles workflow resumption
- **Progressive Document Building:** Append sections as workflow progresses
- **Menu-Driven Interaction:** User-controlled navigation with tool integration
- **Tool Integration:** Party Mode, Advanced Elicitation, Brainstorming, Web-Browsing

---

## Framework Integration

### NIST Cybersecurity Framework
- **Incident Response:** Full NIST IR lifecycle (Preparation, Detection & Analysis, Containment/Eradication/Recovery, Post-Incident)
- **Risk Assessment:** NIST SP 800-30 risk prioritization
- **Zero-Trust:** NIST SP 800-207 Zero Trust Architecture

### MITRE ATT&CK
- 12 tactics mapped in Incident Response Playbook
- Technique identification during incident analysis
- IOC documentation with ATT&CK technique references

### STRIDE Methodology
- Microsoft threat modeling framework
- Systematic threat identification across 6 categories
- Used in both Security Architecture Review and Threat Modeling

### Regulatory Compliance
- **GDPR:** 72-hour breach notification timeline
- **PCI-DSS:** Payment card incident requirements
- **HIPAA:** Healthcare data breach procedures
- **SOC 2:** Security incident documentation
- **ISO 27001:** Incident management alignment

---

## Prerequisites

### System Requirements
- BMAD framework installed
- Claude API access (Sonnet 4.5 recommended)
- File I/O permissions
- Sufficient context window (workflows range 4K-15K tokens)

### User Knowledge Requirements

**For Incident Response Playbook:**
- Basic incident response concepts
- Familiarity with your organization's systems
- Understanding of incident types relevant to your environment

**For Security Architecture Review:**
- Understanding of system architecture being reviewed
- Ability to describe data flows and trust boundaries
- Knowledge of existing security controls

**For Threat Modeling:**
- System design knowledge
- Understanding of STRIDE categories (training provided in workflow)
- Ability to assess likelihood and impact

### Optional Enhancements
- Architecture diagrams (PNG, PDF, PlantUML)
- Existing security documentation
- Compliance requirements context
- Previous assessments or audits

---

## Installation

### Option 1: Module Installer (Recommended)
```bash
# When module installer is available
/bmad:install:cyber-ops
```

### Option 2: Manual Installation

1. **Verify module location:**
```bash
ls -la {project-root}/_bmad/cyber-ops/
```

2. **Verify workflows exist:**
```bash
ls -la {project-root}/_bmad/cyber-ops/workflows/
```

3. **Create config.yaml** (if not exists):
```yaml
module_name: cyber-ops
version: 1.0.0
project_name: your-project-name
output_folder: {project-root}/_output/cyber-ops
user_name: Your Name
communication_language: English
document_output_language: English
```

### Option 3: From BMB Creations (Development)

If workflows are still in staging:
```bash
cp -r _bmad-output/bmb-creations/workflows/* _bmad/cyber-ops/workflows/
```

---

## Usage

### Quick Start

1. **Choose a workflow based on your need:**
   - Need to prepare incident playbooks? → Incident Response Playbook (Mode A)
   - Responding to active incident? → Incident Response Playbook (Mode B)
   - Reviewing system architecture? → Security Architecture Review
   - Modeling threats in system design? → Threat Modeling

2. **Invoke the workflow:**
```
/bmad:cyber-ops:workflows:[workflow-name]
```

3. **Follow step-by-step guidance:**
   - Workflows are highly prescriptive
   - Read each step completely before acting
   - Use menus to access Party Mode, Web-Browsing, etc.
   - Progress is automatically saved

4. **Use continuation for long sessions:**
   - All workflows support multi-session execution
   - Simply re-invoke the workflow to continue where you left off

### Common Usage Patterns

**Pattern 1: Preparation (Peacetime)**
```
1. Run Incident Response Playbook (Mode A) for each incident type
2. Create library of playbooks
3. Conduct tabletop exercises using playbooks
```

**Pattern 2: Active Incident (Wartime)**
```
1. Invoke Incident Response Playbook (Mode B)
2. Follow guided response procedures
3. Generate incident report for stakeholders
```

**Pattern 3: Architecture Security**
```
1. Run Security Architecture Review for existing systems
2. Run Threat Modeling for new system designs
3. Implement recommendations
4. Re-assess after changes
```

**Pattern 4: Continuous Security**
```
1. Annual Security Architecture Review for all critical systems
2. Threat Modeling for all new features/services
3. Quarterly playbook updates
4. Post-incident playbook refinement
```

---

## Best Practices

### Workflow Execution
1. **Allocate sufficient time** - Don't rush security work
2. **Use multi-session support** - Take breaks, workflows preserve state
3. **Leverage collaboration tools:**
   - Party Mode for expert perspectives
   - Web-Browsing for current threat intelligence
   - Advanced Elicitation for quality assurance
4. **Be thorough over fast** - Security gaps are expensive

### Documentation Quality
1. **Be specific** - "Implement TLS 1.3" not "use encryption"
2. **Include context** - Why is this a threat? What's the business impact?
3. **Provide evidence** - Link to CVEs, security advisories, standards
4. **Make it actionable** - Recommendations should be implementable

### Collaboration
1. **Involve Ghost agent** (Security Architecture Review) for offensive perspective
2. **Use Party Mode** when stuck or need creative approaches
3. **Share outputs** with stakeholders (executive summaries included)
4. **Update workflows** based on lessons learned

---

## Integration Points

### BMAD Core Tools
- **Party Mode:** Multi-agent collaboration
  - Bastion (Security Architect)
  - Ghost (Penetration Tester)
  - Trace (Forensics Expert)
  - Cipher (Cryptography/Secure Comms)
  - Sentinel (Compliance/Governance)
- **Advanced Elicitation:** Adversarial quality review
- **Brainstorming:** Creative threat/mitigation discovery
- **Web-Browsing:** Threat intelligence, CVE lookups, best practices

### LLM Features
- **File I/O:** Diagram reading, report generation
- **Sidecar Files:** Timeline tracking (Incident Response Mode B)
- **Frontmatter:** State management for continuation

### External Systems (Future)
- SIEM integration for automated incident data
- Ticketing system integration (Jira, ServiceNow)
- Threat intelligence feeds
- Vulnerability scanners

---

## Metrics and KPIs

### Workflow Adoption
- Number of playbooks created
- Number of incidents handled with workflow
- Number of architecture reviews completed
- Number of threat models created

### Security Posture Improvement
- Average time to contain incidents (before/after playbooks)
- Number of critical findings per architecture review
- Percentage of critical findings remediated
- Mean time to remediate (MTTR) improvement

### Quality Metrics
- Stakeholder satisfaction with documentation
- Audit findings reduction
- Compliance gap closure rate

---

## Troubleshooting

### Workflow Won't Continue
**Symptom:** Workflow doesn't resume where you left off
**Solution:** Check frontmatter in output document for `stepsCompleted` array

### Menu Options Not Working
**Symptom:** Party Mode or Web-Browsing doesn't launch
**Solution:** Verify BMAD core tools are installed and accessible

### Output Document Issues
**Symptom:** Document not generating or incomplete
**Solution:** Check output_folder path in config.yaml, verify write permissions

### Context Window Issues
**Symptom:** Workflow performance degraded or errors
**Solution:** Use Claude Sonnet 4.5 (200K context), break into smaller sessions

---

## Roadmap

### Version 1.1 (Planned)
- [ ] Additional incident types (supply chain, insider threat)
- [ ] SIEM integration for automated data population
- [ ] Playbook versioning and change tracking
- [ ] Metrics dashboard for security KPIs

### Version 2.0 (Future)
- [ ] Multi-organization support (MSSP use cases)
- [ ] Ticketing system integration
- [ ] Threat intelligence feed integration
- [ ] Automated vulnerability mapping

---

## Support

### Documentation
- Workflow-specific README files in each workflow directory
- Workflow planning documents (`workflow-plan-*.md`)
- Step-by-step guidance within workflows

### Getting Help
- Review workflow plan documents for design decisions
- Consult agent personas (Bastion, Ghost, Trace) for domain expertise
- Use Advanced Elicitation within workflows for quality review

### Reporting Issues
- Document specific step where issue occurred
- Include frontmatter from output document
- Describe expected vs actual behavior

---

## Contributors

**Created By:** BMAD Framework + Claude Sonnet 4.5
**Workflow Architect:** workflow-builder (create-workflow)
**Expert Agents:**
- Bastion (Security Architecture, IR Planning)
- Ghost (Offensive Security, Attack Surface)
- Trace (Digital Forensics, Evidence)
- Cipher (Cryptography, Secure Communications)
- Sentinel (Compliance, Governance)

---

## License

Part of the BMAD (BMAD Makes Amazing Development) Framework.

---

## Version History

### v1.0.0 (2026-01-08)
- ✅ Initial release
- ✅ 3 production-ready workflows
- ✅ 38 total workflow files
- ✅ ~25,000 lines of workflow code
- ✅ NIST, STRIDE, MITRE ATT&CK integration
- ✅ Multi-session continuation support
- ✅ Party Mode integration with 5 expert agents

---

**Module Status:** Production Ready ✅
**Total Workflows:** 3
**Total Files:** 38
**Total Lines:** ~25,000
**Frameworks:** NIST, STRIDE, MITRE ATT&CK, Zero-Trust
**Compliance:** GDPR, PCI-DSS, HIPAA, SOC 2, ISO 27001

**Ready for enterprise cybersecurity operations.**
