---

name: 'step-03-network-security'
description: 'Assess VPC design, security groups, NACLs, WAF, and DDoS protection'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-03-network-security.md'
nextStepFile: '{workflow_path}/steps/step-04-data-protection.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'

---

# Step 3: Network Security Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on network security assessment
- FORBIDDEN to discuss data protection yet
- Adapt terminology based on cloud provider(s)

## STEP GOAL:

To assess cloud network security including VPC/VNet architecture, security groups, network ACLs, WAF configuration, DDoS protection, and network traffic controls.

## NETWORK SECURITY SEQUENCE:

### 1. Network Architecture Review

"Let's review your network architecture:

**VPC/VNet Design:**

| Provider | Network Construct | Key Questions |
|----------|-------------------|---------------|
| AWS | VPC | How many VPCs? Public/private subnets? |
| Azure | VNet | Hub-spoke or flat? Peering? |
| GCP | VPC | Shared VPC? Subnet regions? |

**Architecture Patterns:**
- Single VPC or multi-VPC?
- Workload segmentation approach?
- Production/non-production separation?
- Internet egress design (NAT Gateway, etc.)?

Describe your network architecture."

### 2. Security Groups / NSGs / Firewall Rules

"Let's examine your firewall rules:

**Common Issues:**

| Issue | Description | Risk |
|-------|-------------|------|
| 0.0.0.0/0 ingress | Any source allowed | Critical |
| Wide port ranges | Ports 1-65535 open | High |
| SSH/RDP from any | Admin ports exposed | Critical |
| Unused rules | Forgotten access | Medium |
| Default allow | No explicit deny | High |

**Questions:**
- Are security groups reviewed regularly?
- Any rules allowing all traffic (0.0.0.0/0)?
- SSH (22) or RDP (3389) from internet?
- Management ports restricted to bastion/VPN?

What security group patterns are you using?"

### 3. Network Segmentation

"Let's assess network segmentation:

**Segmentation Controls:**

| Control Type | Provider | Implementation |
|--------------|----------|----------------|
| NACLs | AWS | Subnet-level stateless filtering |
| NSG | Azure | Subnet and NIC-level |
| Firewall Rules | GCP | VPC-wide, priority-based |
| Firewall Service | AWS/Azure/GCP | Managed firewall appliance |

**Questions:**
- Is east-west traffic filtered?
- Are workloads segmented by sensitivity?
- Are there micro-segmentation controls?
- Can production reach non-production?

How is network segmentation implemented?"

### 4. Web Application Firewall (WAF)

"Let's review WAF configuration:

**WAF Assessment:**

| Check | Description | Status |
|-------|-------------|--------|
| WAF enabled | Web apps protected | ? |
| Rule sets | OWASP/managed rules | ? |
| Custom rules | App-specific protection | ? |
| Logging | Request logging enabled | ? |
| Bypass prevention | No direct backend access | ? |

**Provider-Specific:**
- AWS: AWS WAF with ALB/CloudFront/API Gateway
- Azure: Azure WAF with Application Gateway/Front Door
- GCP: Cloud Armor with Cloud Load Balancing

Is WAF deployed for internet-facing applications?"

### 5. DDoS Protection

"Let's assess DDoS protection:

**DDoS Controls:**

| Provider | Basic | Advanced |
|----------|-------|----------|
| AWS | Shield Standard (free) | Shield Advanced |
| Azure | Basic (free) | DDoS Protection Standard |
| GCP | Built-in | Cloud Armor |

**Questions:**
- What DDoS protection tier is enabled?
- Are critical workloads protected?
- Is there a DDoS response plan?
- Are rate limiting controls in place?

What's your DDoS protection posture?"

### 6. Egress Controls

"Let's examine outbound traffic controls:

**Egress Assessment:**

| Control | Purpose | Status |
|---------|---------|--------|
| NAT Gateway | Controlled internet egress | ? |
| VPC endpoints | AWS service access without internet | ? |
| Private Link | Azure/GCP private connectivity | ? |
| Egress filtering | Block unauthorized destinations | ? |
| DNS controls | Prevent DNS exfiltration | ? |

How do you control outbound traffic?"

### 7. Document Network Assessment

Update Section 4 of {outputFile}:

```markdown
## 4. Network Security Assessment

### 4.1 Network Architecture

**VPC/VNet Count:** [Number]
**Architecture Pattern:** [Hub-spoke/Flat/Segmented]

| Network | Environment | CIDR | Public Subnets | Private Subnets |
|---------|-------------|------|----------------|-----------------|
| [User data] | | | | |

### 4.2 Security Groups / Firewall Rules

| Finding | Severity | Affected Resource | Recommendation |
|---------|----------|-------------------|----------------|
| [User data] | | | |

**Overly Permissive Rules:**
[Count and details]

**Admin Access Exposure:**
[SSH/RDP findings]

### 4.3 Network Segmentation

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Subnet segmentation | [Pass/Fail] | [Details] | [H/M/L] |
| East-west filtering | [Pass/Fail] | [Details] | [H/M/L] |
| Environment isolation | [Pass/Fail] | [Details] | [H/M/L] |
| Micro-segmentation | [Pass/Fail] | [Details] | [H/M/L] |

### 4.4 Web Application Firewall

| Application | WAF Enabled | Rule Set | Logging | Status |
|-------------|-------------|----------|---------|--------|
| [User data] | | | | |

### 4.5 DDoS Protection

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| DDoS protection tier | [Details] | [Finding] | [H/M/L] |
| Critical app coverage | [Pass/Fail] | [Details] | [H/M/L] |
| Response plan | [Pass/Fail] | [Details] | [H/M/L] |

### 4.6 Egress Controls

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| NAT Gateway/Instance | [Details] | [Finding] | [H/M/L] |
| Private endpoints | [Pass/Fail] | [Details] | [H/M/L] |
| Egress filtering | [Pass/Fail] | [Details] | [H/M/L] |

### 4.7 Network Security Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Network Recommendations:**
1. [Highest priority]
2. [Second priority]
3. [Third priority]
```

### 8. Confirmation and Next Step

"**Network Security Assessment Complete**

I've documented the network security assessment including:
- Network architecture review
- Security group analysis
- Segmentation controls
- WAF configuration
- DDoS protection
- Egress controls

Next, we'll assess data protection controls.

Ready to proceed to data protection?"

## MENU

Display: **Network Assessment Complete - Select an Option:** [C] Continue to Data Protection [R] Review/Revise Assessment

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 4 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN network assessment is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
