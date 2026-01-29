# Cybersec Team Workflows

Comprehensive security operations workflows for vulnerability assessment, incident response, compliance, and security architecture.

---

## Quick Start

```bash
# Start incident response
/cybersec-team:incident-commander

# Run a threat model
/cybersec-team:workflows:threat-modeling

# Prepare for compliance audit
/cybersec-team:workflows:compliance-audit-prep
```

---

## Workflow Categories

### Incident & Crisis Response

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Incident Response Playbook** | `/incident-response-playbook` | 7-19 | IR Playbook or live response guidance |

**Incident Response Playbook** is a dual-mode workflow:
- **Mode A (Playbook Creation)**: Design comprehensive IR playbooks for your organization
- **Mode B (Guided Execution)**: Step-by-step guidance during active security incidents

**Frameworks**: NIST IR (SP 800-61), MITRE ATT&CK
**Compliance Support**: GDPR, PCI-DSS, HIPAA, SOC 2, ISO 27001

**When to use**:
- Building organizational IR capabilities from scratch
- Responding to an active security incident
- Meeting compliance requirements for incident response
- Training security teams on IR procedures

---

### Security Assessment & Testing

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Web Application Security Testing** | `/web-app-security-testing` | 8 | Penetration test report |
| **Mobile Security Testing** | `/mobile-security-testing` | 9 | Mobile app security assessment |
| **Network Assessment** | `/network-assessment` | 8 | Network penetration test report |
| **Infrastructure Security Testing** | `/infrastructure-security-testing` | 9 | Infrastructure security report |
| **Cloud Security Assessment** | `/cloud-security-assessment` | 9 | Cloud security posture report |
| **Blockchain Security Assessment** | `/blockchain-security-assessment` | 9 | Smart contract audit report |

**Web Application Security Testing**
- OWASP Top 10 vulnerability assessment
- Authentication and authorization testing
- Session management analysis
- Input validation and injection testing
- Business logic testing
- API security assessment

**Frameworks**: OWASP Testing Guide, OWASP Top 10, ASVS, WSTG

**Mobile Security Testing**
- Static analysis (SAST) and dynamic analysis (DAST)
- Binary protection analysis
- Local data storage security
- Network communication security
- Platform-specific security controls

**Frameworks**: OWASP MSTG, MASVS

**Network Assessment**
- External and internal network testing
- Active Directory security assessment
- Network segmentation analysis
- Vulnerability scanning and validation
- Privilege escalation and lateral movement analysis

**Frameworks**: PTES, NIST SP 800-115, OSSTMM

**Cloud Security Assessment**
- IAM and identity governance review
- Network security configuration
- Data protection and encryption assessment
- Logging and monitoring validation
- Multi-cloud security review

**Frameworks**: CIS Benchmarks (AWS/Azure/GCP), CSA CCM, Well-Architected Framework

---

### Architecture & Design

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Threat Modeling** | `/threat-modeling` | 11 | STRIDE-based threat model |
| **Security Architecture Review** | `/security-architecture-review` | 8 | Architecture security assessment |

**Threat Modeling (STRIDE)**
Systematic identification of security threats using STRIDE methodology:
- **S**poofing - Identity authentication threats
- **T**ampering - Data integrity threats
- **R**epudiation - Non-repudiation threats
- **I**nformation Disclosure - Confidentiality threats
- **D**enial of Service - Availability threats
- **E**levation of Privilege - Authorization threats

**When to use**:
- Early in system design phase
- Before major architecture changes
- Security requirements generation
- Risk-based security planning

**Security Architecture Review**
- Zero-trust validation
- Attack surface analysis
- Cloud security review (AWS/Azure/GCP)
- Control effectiveness assessment
- STRIDE-based threat analysis

**Frameworks**: STRIDE, NIST CSF, CIS Controls, OWASP ASVS, Zero Trust

---

### Compliance & Governance

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Compliance Audit Preparation** | `/compliance-audit-prep` | 10 | Audit-ready compliance package |
| **Vulnerability Management** | `/vulnerability-management` | 8 | VM program documentation |
| **Virtual CISO Consulting** | `/virtual-ciso-consulting` | 11 | vCISO engagement document |

**Compliance Audit Preparation**
Supports 20+ compliance frameworks:
- **US**: NIST 800-53, SOC 2, PCI-DSS, HIPAA, FedRAMP, CMMC
- **EU**: GDPR, NIS2, Cyber Resilience Act, DORA, AI Act
- **Global**: ISO 27001/27017/27018, CIS Controls, CSA STAR
- **Industry**: SWIFT CSP, NERC CIP, TISAX

**Deliverables**:
- Gap assessment with remediation priorities
- Evidence inventory and collection plan
- Control mapping to framework requirements
- Audit readiness checklist

**Virtual CISO Consulting**
Comprehensive vCISO engagement including:
- Strategic security planning and roadmaps
- Budget optimization with ROI framework
- Security maturity assessment
- Governance framework design
- Board/executive reporting templates
- Vendor risk management program

---

### Security Awareness

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Security Awareness Training** | `/security-awareness-training` | 7 | Awareness program design |

Design and implement security awareness programs:
- Risk assessment and threat analysis
- Training content development
- Phishing simulation design
- Delivery strategy planning
- Metrics and measurement framework
- Continuous improvement roadmap

**Frameworks**: NIST 800-50, SANS Security Awareness, ISO 27001 A.7.2.2

---

## Available Agents

The cybersec-team module includes 15 specialized agents:

| Agent | Codename | Specialty |
|-------|----------|-----------|
| **incident-commander** | Phoenix | Crisis management, breach response coordination |
| **blue-team-lead** | Shield | Detection engineering, defensive coordination |
| **forensic-investigator** | Trace | Evidence collection, chain of custody |
| **soc-analyst** | Watchman | SIEM analysis, alert triage, detection rules |
| **threat-analyst** | Hunter | Threat intelligence, adversary tracking |
| **security-architect** | Bastion | Security design, architecture review |
| **penetration-tester** | Spectre | Offensive testing, exploitation |
| **compliance-guardian** | Sentinel | Compliance frameworks, audit preparation |
| **web-app-security-expert** | Weaver | OWASP, web application security |
| **api-security-expert** | Gateway | API security, OAuth/OIDC |
| **mobile-security-expert** | Phantom | Mobile app security (iOS/Android) |
| **cloud-security-specialist** | Nimbus | Cloud security (AWS/Azure/GCP) |
| **blockchain-security-expert** | Ledger | Smart contracts, DeFi security |
| **llm-ai-security-expert** | Oracle | AI/ML security, prompt injection |
| **social-engineer** | Mirage | Social engineering, human factors |

---

## Workflow Execution

### Starting a Workflow

1. **Via Agent Menu**: Invoke the relevant agent and select from the workflow menu
   ```bash
   /cybersec-team:incident-commander
   # Then select from the menu options
   ```

2. **Direct Workflow**: Start a workflow directly
   ```bash
   /cybersec-team:workflows:threat-modeling
   ```

### Workflow Architecture

All cybersec-team workflows use **step-file architecture**:
- Sequential execution of discrete steps
- State tracking in output file frontmatter
- Menu-driven navigation with user input checkpoints
- Append-only document building

### Output Artifacts

Workflows generate professional deliverables saved to your configured output folder:
- Security assessment reports
- Compliance documentation packages
- Incident response playbooks
- Threat models with mitigation recommendations

---

## Common Use Cases

### Pre-Deployment Security Review
1. Run **Threat Modeling** during design phase
2. Execute **Security Architecture Review** before deployment
3. Conduct **Web Application Security Testing** or relevant assessment

### Compliance Preparation
1. Start with **Compliance Audit Preparation** for gap assessment
2. Use **Vulnerability Management** to establish ongoing VM program
3. Engage **Virtual CISO Consulting** for strategic planning

### Incident Response Capability Building
1. Create playbooks with **Incident Response Playbook** (Mode A)
2. Train team on procedures
3. Use **Incident Response Playbook** (Mode B) during actual incidents

### Security Program Development
1. **Virtual CISO Consulting** for strategic roadmap
2. **Security Awareness Training** for human layer
3. Assessment workflows for technical validation
