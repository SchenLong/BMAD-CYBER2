---
name: 'step-02-parallel-collection'
description: 'Parallel collection by Probe, Echo, Shadow, and Proxy agents'
estimated_duration: '5 minutes (parallel)'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/flash-assessment'
thisStepFile: '{workflow_path}/steps/step-02-parallel-collection.md'
nextStepFile: '{workflow_path}/steps/step-03-synthesis.md'
prevStepFile: '{workflow_path}/steps/step-01-triage.md'

# Agent Configuration - PARALLEL EXECUTION
executing_agents:
  - technical-researcher      # Probe
  - social-media-analyst      # Echo
  - dark-web-analyst          # Shadow
  - corporate-intel-specialist # Proxy
orchestrator: osint-lead  # Vector coordinates
---

# Step 2: Parallel Collection

## STEP GOAL

Execute rapid, parallel OSINT collection across four domains: Technical, Social, Dark Web, and Corporate. Each agent works simultaneously to maximize coverage within the time budget.

## EXECUTION TIME: ~5 minutes (parallel)

## EXECUTION MODEL

```
           Vector (Orchestrator)
                    │
    ┌───────────────┼───────────────┐
    │       ┌───────┼───────┐       │
    ▼       ▼       ▼       ▼       │
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ PROBE │ │ ECHO  │ │SHADOW │ │LEDGER │
│  5min │ │  5min │ │  5min │ │  5min │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    │         │         │         │
    └─────────┴────┬────┴─────────┘
                   ▼
          Collected Intelligence
```

**Note**: In practice, execute each agent's collection sequentially but keep each to ~5 minutes. The "parallel" model means each agent operates independently without waiting for others' results.

---

## PROBE (Technical Researcher) Collection

### Agent: technical-researcher

### Codename: Probe

### Time Budget: 5 minutes

### Collection Tasks

#### 1. Domain/IP Analysis (if applicable)

```
Quick checks:
- WHOIS lookup (registrant, dates, privacy)
- DNS records (A, MX, TXT, NS)
- Reverse DNS
- IP geolocation
- ASN identification
```

#### 2. Technology Fingerprinting

```
Identify:
- Web technologies (if domain)
- Server software
- CMS/framework
- Cloud provider indicators
- CDN usage
```

#### 3. Service Enumeration

```
Quick scan for:
- Open ports (common: 22, 80, 443, 8080)
- Service banners
- SSL/TLS certificate details
- API endpoints visible
```

#### 4. Quick Vulnerability Indicators

```
Check for:
- Exposed admin panels
- Directory listing enabled
- Sensitive files (.git, .env, backup)
- Outdated software versions
```

### Output Format

```markdown
## TECHNICAL FINDINGS (Probe)

### Infrastructure
- **Registrar:** [value]
- **Hosting:** [provider]
- **IP:** [address]
- **Location:** [geo]

### Technology Stack
- [technology 1]
- [technology 2]

### Exposure Indicators
- [ ] Admin panel exposed
- [ ] Sensitive files found
- [ ] Outdated software
- [ ] Misconfigurations

### Risk Indicators
[List any immediate concerns]
```

---

## ECHO (Social Media Analyst) Collection

### Agent: social-media-analyst

### Codename: Echo

### Time Budget: 5 minutes

### Collection Tasks

#### 1. Username Enumeration

```
Check platforms:
- Twitter/X
- LinkedIn
- GitHub
- Instagram
- Facebook
- Reddit
- TikTok
- YouTube
- Discord (servers)
- Telegram (if username)
```

#### 2. Profile Discovery

```
For each found account:
- Account age indicator
- Follower/following counts
- Bio/description
- Profile image
- Linked accounts
```

#### 3. Network Snapshot

```
Quick capture:
- Notable connections
- Group memberships
- Organizational affiliations
- Verified status
```

#### 4. Recent Activity Scan

```
Last 30 days:
- Posting frequency
- Content themes
- Engagement patterns
- Location indicators
```

### Output Format

```markdown
## SOCIAL FINDINGS (Echo)

### Accounts Found
| Platform | Handle | Status | Notes |
|----------|--------|--------|-------|
| Twitter | @handle | Active | Verified |
| LinkedIn | /in/name | Active | 500+ connections |
| GitHub | username | Active | 50 repos |

### Profile Summary
- **Primary platform:** [platform]
- **Activity level:** [high/medium/low]
- **Network size:** [estimate]

### Notable Findings
[List any immediate concerns or interesting discoveries]

### Authenticity Indicators
- [ ] Consistent persona
- [ ] Account age appropriate
- [ ] Organic network growth
```

---

## SHADOW (Dark Web Analyst) Collection

### Agent: dark-web-analyst

### Codename: Shadow

### Time Budget: 5 minutes

### Collection Tasks

#### 1. Breach Database Check

```
Query for:
- Email in known breaches
- Username in dumps
- Domain breach history
- Password exposure (yes/no only)
```

#### 2. Paste Site Scan

```
Search:
- Pastebin and alternatives
- Code sharing sites
- Leaked data repositories
```

#### 3. Forum Mention Search

```
Quick scan:
- Hacker forums (surface mentions)
- Dark web marketplace references
- Underground community mentions
```

#### 4. Credential Exposure Check

```
Identify:
- Number of breaches
- Types of data exposed
- Recency of exposure
- Password reuse indicators
```

### Output Format

```markdown
## DARK WEB FINDINGS (Shadow)

### Breach Exposure
| Breach | Date | Data Types | Severity |
|--------|------|------------|----------|
| [name] | [date] | email, password | HIGH |
| [name] | [date] | email only | LOW |

### Exposure Summary
- **Total breaches:** [count]
- **Most recent:** [date]
- **Password exposed:** [yes/no]
- **PII exposed:** [types]

### Underground Mentions
- [ ] Forum mentions found
- [ ] Marketplace listings
- [ ] Paste site hits
- [ ] Active targeting indicators

### Risk Assessment
[Immediate concerns about exposure]
```

---

## LEDGER (Corporate Intelligence Specialist) Collection

### Agent: corporate-intel-specialist

### Codename: Proxy

### Time Budget: 5 minutes

### Collection Tasks

#### 1. Entity Verification

```
Quick checks:
- Business registry lookup (jurisdiction-appropriate)
- Company name verification
- Registration status (active/dissolved/suspended)
- Incorporation date
- Registered address
```

#### 2. Officer/Director Search

```
Identify:
- Named directors/officers
- Registered agent
- Signatory authority
- Recent changes in management
```

#### 3. Corporate Structure Indicators

```
Quick assessment:
- Parent company (if any)
- Subsidiary indicators
- Related entities
- Holding structure clues
```

#### 4. Financial/Regulatory Footprint

```
Check for:
- VAT/Tax registration
- Industry licenses
- Regulatory filings
- Government contracts
- Sanctions screening (quick)
```

### Output Format

```markdown
## CORPORATE FINDINGS (Proxy)

### Entity Status
- **Legal Name:** [registered name]
- **Registration #:** [if found]
- **Jurisdiction:** [country/state]
- **Status:** [Active/Inactive/Unknown]
- **Incorporated:** [date if found]

### Officers/Directors
| Name | Role | Since |
|------|------|-------|
| [name] | [role] | [date] |

### Corporate Structure
- **Parent:** [if identified]
- **Subsidiaries:** [if identified]
- **Related Entities:** [if identified]

### Registry Source
- **Source:** [registry name]
- **URL:** [if public]
- **Last Updated:** [date]

### Red Flags
- [ ] No registry record found
- [ ] Recently incorporated
- [ ] Registered agent only (no physical address)
- [ ] Frequent name/structure changes
- [ ] Jurisdiction mismatch

### Risk Indicators
[List any immediate corporate concerns]
```

---

## COLLECTION COMPLETION

### Aggregation Checklist

Before proceeding to synthesis:

- [ ] **Probe** technical collection complete
- [ ] **Echo** social collection complete
- [ ] **Shadow** dark web collection complete
- [ ] **Proxy** corporate collection complete

### Time Check

If over time budget:

- Note incomplete sections
- Proceed with available data
- Flag gaps in synthesis

---

## NEXT STEP

Upon completion of all four collections, load and follow: `{workflow_path}/steps/step-03-synthesis.md`

Vector will synthesize all findings into the Flash Assessment Report.
