# Risk Analysis

## Purpose

Conducts comprehensive cybersecurity risk assessments including asset inventory, threat analysis, vulnerability assessment, risk quantification, and mitigation prioritization. Led by Sentinel (Compliance Guardian) with collaboration from Cipher (threat data) and Bastion (control assessment).

## Trigger

**Agent:** Sentinel (compliance-guardian)
**Menu Code:** RA (Risk Analysis)
**Full Command:** `/bmad:cyber-ops:agents:compliance-guardian` then select RA

## Key Steps

1. **Asset Inventory & Classification**
   - Identify critical assets (systems, data, processes)
   - Classify assets by business value and sensitivity
   - Document asset dependencies
   - Establish asset owners and stakeholders

2. **Threat Identification**
   - Collaborate with Cipher agent for threat landscape
   - Identify relevant threat actors and scenarios
   - Document threat sources (external, internal, environmental)
   - Map threats to assets

3. **Vulnerability Assessment**
   - Identify technical vulnerabilities (systems, applications, network)
   - Assess process and organizational vulnerabilities
   - Review third-party and supply chain risks
   - Document vulnerability sources and evidence

4. **Control Assessment**
   - Inventory existing security controls
   - Collaborate with Bastion agent for architecture controls
   - Assess control effectiveness and coverage
   - Identify control gaps

5. **Risk Calculation**
   - Calculate likelihood of threat exploitation
   - Assess impact of successful attacks
   - Quantify risk (qualitative or quantitative methods)
   - Create risk matrix (likelihood × impact)

6. **Risk Prioritization**
   - Rank risks by severity (Critical/High/Medium/Low)
   - Consider business context and risk appetite
   - Identify quick wins vs. strategic remediation
   - Document risk treatment decisions (accept, mitigate, transfer, avoid)

7. **Mitigation Recommendations**
   - Develop risk treatment plans
   - Prioritize mitigation actions
   - Estimate effort and resources
   - Define success criteria and timelines

8. **Risk Register Creation**
   - Document all identified risks
   - Track risk treatment status
   - Assign ownership and accountability
   - Establish review cadence

## Expected Output

**Primary Artifact:** Risk Assessment Report

**Format:** Markdown document saved to `{output_folder}/planning/risk-assessments/`

**Contents:**
- Executive Summary
- Risk Assessment Methodology
- Asset Inventory & Classification
- Threat Landscape Overview
- Risk Matrix (visual heat map)
- Risk Register (prioritized list of risks)
- Control Gap Analysis
- Mitigation Recommendations
- Risk Treatment Plan
- Monitoring & Review Plan

**Supporting Artifacts:**
- Detailed risk register (spreadsheet/database format)
- Risk heat map visualization
- Control assessment matrix
- Mitigation tracking plan

## Collaboration Pattern

**Primary Agent:** Sentinel (compliance-guardian)

**Required Collaboration:**
- Cipher (threat-analyst) - For threat landscape and probability assessment
- Bastion (security-architect) - For control effectiveness and mitigation design

## Use Cases

1. **Annual Risk Assessment** - Comprehensive organizational risk review
2. **New Project Risk Evaluation** - Assess security risks before project initiation
3. **Vendor Risk Assessment** - Third-party and supply chain risk analysis
4. **Merger & Acquisition Due Diligence** - Security risk assessment of acquisition targets
5. **Regulatory Compliance** - Risk assessments for SOC2, ISO 27001, NIST requirements

## Implementation Notes

Risk analysis requires structured methodology and collaborative input. Implementation should:

- Support qualitative and quantitative risk analysis methods
- Provide risk calculation templates (likelihood × impact)
- Generate risk heat map visualizations
- Track risk register updates over time
- Support multiple risk frameworks (NIST 800-30, ISO 27005, FAIR)

## Integration with Agents

**Agent Menu Update Required:**

In `agents/compliance-guardian.md`, update the RA menu item:
```xml
<item cmd="RA or fuzzy match on risk-analysis" exec="{project-root}/_bmad/cyber-ops/workflows/risk-analysis/workflow.md">[RA] Conduct comprehensive risk analysis</item>
```
