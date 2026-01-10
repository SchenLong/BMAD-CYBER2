---
workflow_id: counter-intel-audit
name: 'Counter-Intelligence Audit'
description: 'Turn intelligence capabilities inward to assess organization own exposure, vulnerabilities, and operational security gaps'
version: '1.0.0'
module: intel-team

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/counter-intel-audit'
steps_path: '{workflow_path}/steps'
output_path: '{output_folder}/intel-reports/counter-intel-audit'

# Workflow Configuration
primary_agent: field-operative
primary_codename: Specter
classification: 'DEFENSIVE / COUNTER-INTELLIGENCE'
estimated_duration: '60-90 minutes'

# Step Files
steps:
  - name: 'Physical Security Assessment'
    file: '{steps_path}/step-01-physical-security.md'
    agent: field-operative
    codename: Specter
    description: 'Facility exposure, personnel identification risk, surveillance vulnerability, access control gaps'

  - name: 'Electronic Security Assessment'
    file: '{steps_path}/step-02-electronic-security.md'
    agent: sigint-specialist
    codename: Sigil
    description: 'Communications security, RF emission exposure, network security posture, device security'

  - name: 'Digital Footprint Assessment'
    file: '{steps_path}/step-03-digital-footprint.md'
    agent: social-media-analyst
    codename: Echo
    description: 'Corporate social presence, employee exposure, information leakage, reputation vulnerabilities'

  - name: 'Corporate Exposure Assessment'
    file: '{steps_path}/step-04-corporate-exposure.md'
    agent: corporate-intel-specialist
    codename: Proxy
    description: 'Corporate registry exposure, officer personal data, beneficial ownership visibility, financial filing leakage'

  - name: 'Underground Exposure Assessment'
    file: '{steps_path}/step-05-underground-exposure.md'
    agent: dark-web-analyst
    codename: Shadow
    description: 'Credential exposure, data breach impact, threat actor interest, targeting indicators'

  - name: 'Risk Synthesis & Remediation'
    file: '{steps_path}/step-06-risk-synthesis.md'
    agent: osint-lead
    codename: Vector
    description: 'Prioritize vulnerabilities, develop remediation roadmap, quick wins identification, long-term recommendations'

# Output Configuration
output_format: 'markdown'
---

# Counter-Intelligence Audit

## PURPOSE

Turn intelligence capabilities inward to assess an organization's own exposure, vulnerabilities, and operational security gaps. This workflow identifies what adversaries can learn about the organization through OSINT and recommends remediation actions.

## WHEN TO USE

- Organizational security assessment
- Pre-engagement security posture review
- Merger/acquisition due diligence (own exposure)
- Executive protection planning
- Incident response (understanding exposure)
- Annual security review
- Post-breach exposure assessment
- Competitive intelligence defense
- Supply chain security evaluation

## TARGET TYPES

| Type | Description | Key Analysis |
|------|-------------|--------------|
| Corporation | Company assessment | Full exposure audit |
| Government Agency | Agency assessment | Public exposure review |
| Executive | Individual protection | Personal exposure |
| Facility | Physical location | Site security |
| Brand | Reputation | Digital presence |

## AGENTS INVOLVED

| Agent | Codename | Role in Workflow |
|-------|----------|------------------|
| field-operative | Specter | Physical security assessment |
| sigint-specialist | Sigil | Electronic security assessment |
| social-media-analyst | Echo | Digital footprint assessment |
| corporate-intel-specialist | Proxy | Corporate exposure assessment |
| dark-web-analyst | Shadow | Underground exposure assessment |
| osint-lead | Vector | Risk synthesis and remediation |

## WORKFLOW STRUCTURE

```
INPUT: Organization Identifiers + Scope Definition
                    |
                    v
+-------------------------------------------------------------+
| STEP 1: PHYSICAL SECURITY ASSESSMENT            ~15 min     |
| Agent: Specter (field-operative)                            |
|-------------------------------------------------------------|
| - Facility exposure analysis                                 |
| - Personnel identification risk                              |
| - Surveillance vulnerability                                 |
| - Access control gaps                                        |
| - Physical OpSec assessment                                  |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 2: ELECTRONIC SECURITY ASSESSMENT          ~15 min     |
| Agent: Sigil (sigint-specialist)                            |
|-------------------------------------------------------------|
| - Communications security                                    |
| - RF emission exposure                                       |
| - Network security posture                                   |
| - Device security assessment                                 |
| - Encryption practices                                       |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 3: DIGITAL FOOTPRINT ASSESSMENT            ~15 min     |
| Agent: Echo (social-media-analyst)                          |
|-------------------------------------------------------------|
| - Corporate social presence                                  |
| - Employee exposure                                          |
| - Information leakage                                        |
| - Reputation vulnerabilities                                 |
| - Social engineering surface                                 |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 4: CORPORATE EXPOSURE ASSESSMENT           ~15 min     |
| Agent: Proxy (corporate-intel-specialist)                   |
|-------------------------------------------------------------|
| - Corporate registry information exposure                    |
| - Officer/director personal data exposure                    |
| - Beneficial ownership visibility                            |
| - Subsidiary/affiliate disclosure gaps                       |
| - Financial filing information leakage                       |
| - Competitive intelligence vulnerabilities                   |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 5: UNDERGROUND EXPOSURE ASSESSMENT         ~15 min     |
| Agent: Shadow (dark-web-analyst)                            |
|-------------------------------------------------------------|
| - Credential exposure                                        |
| - Data breach impact                                         |
| - Threat actor interest                                      |
| - Targeting indicators                                       |
| - Access for sale                                            |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 6: RISK SYNTHESIS & REMEDIATION            ~15 min     |
| Agent: Vector (osint-lead)                                  |
|-------------------------------------------------------------|
| - Prioritize vulnerabilities                                 |
| - Develop remediation roadmap                                |
| - Quick wins identification                                  |
| - Long-term recommendations                                  |
| - Final assessment report                                    |
+-------------------------------------------------------------+
                    |
                    v
OUTPUT: Counter-Intelligence Assessment Report
```

## KEY DELIVERABLES

1. **Vulnerability Inventory** - Prioritized list of exposures
2. **Risk Heat Map** - Visual risk assessment
3. **Remediation Roadmap** - Phased action plan
4. **Quick Wins List** - Immediate actions
5. **Monitoring Recommendations** - Ongoing surveillance
6. **Executive Summary** - Leadership briefing

## INPUT REQUIREMENTS

- **Required**:
  - Organization name
  - Primary domain(s)
  - Scope definition (what to assess)

- **Optional**:
  - Key personnel list
  - Facility locations
  - Known external assets
  - Previous assessment results
  - Specific concerns to address

## DATA SOURCES

| Source Type | Examples | Data Available |
|-------------|----------|----------------|
| Public Records | Corporate registries, filings | Entity data, officers |
| Social Media | LinkedIn, Twitter, Facebook | Employee exposure |
| Technical | Shodan, Censys, DNS | Infrastructure exposure |
| Underground | Breach databases, forums | Credential exposure |
| Physical | Imagery, mapping | Facility exposure |

## RISK CATEGORIES

| Category | What We Assess | Impact Level |
|----------|----------------|--------------|
| Physical | Facility/personnel | HIGH |
| Electronic | Communications/networks | HIGH |
| Digital | Social/web presence | MEDIUM-HIGH |
| Corporate | Registry/filings | MEDIUM |
| Underground | Breaches/targeting | HIGH |

## LEGAL & ETHICAL NOTES

- Assessment uses only publicly available data
- All sources are legitimate OSINT
- No penetration testing or active probing
- Results are confidential to client
- Findings support defensive purposes only

## INITIATION

To begin this workflow, load and execute:
`{workflow_path}/steps/step-01-physical-security.md`

---

**Workflow Version:** 1.0.0
**Created:** 2026-01-10
**Module:** intel-team
