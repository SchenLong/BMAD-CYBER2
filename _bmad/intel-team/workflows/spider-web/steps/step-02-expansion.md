---
name: 'step-02-expansion'
description: 'Execute expansion across domain, technical, and social vectors'
estimated_duration: '15-30 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/spider-web'
thisStepFile: '{workflow_path}/steps/step-02-expansion.md'
nextStepFile: '{workflow_path}/steps/step-03-correlation.md'
prevStepFile: '{workflow_path}/steps/step-01-seed-analysis.md'

# Agent Configuration
executing_agents:
  - domain-intel-specialist      # Resolver
  - technical-researcher         # Probe
  - social-media-analyst         # Echo
  - corporate-intel-specialist   # Proxy
orchestrator: osint-lead         # Vector coordinates
---

# Step 2: Network Expansion

## STEP GOAL

Execute systematic expansion from seed node across all identified vectors. Each specialist agent expands in their domain while maintaining connection to the central network.

## EXECUTION TIME: ~15-30 minutes

## EXPANSION MODEL

```
                         SEED NODE
                             │
    ┌────────────────────────┼────────────────────────┐
    │           ┌────────────┼────────────┐           │
    ▼           ▼            ▼            ▼           │
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│RESOLVER │ │  PROBE  │ │  ECHO   │ │  PROXY  │      │
│ Domain  │ │Technical│ │ Social  │ │Corporate│      │
│Expansion│ │Expansion│ │Expansion│ │Expansion│      │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘      │
     │           │           │           │           │
     └───────────┴───────────┴───────────┘           │
                             │                       │
                             ▼                       │
                    EXPANDED NETWORK ────────────────┘
```

---

## RESOLVER (Domain Intelligence) Expansion

### Agent: domain-intel-specialist
### Codename: Resolver
### Focus: Domain, DNS, Infrastructure relationships

### Expansion Tasks

#### 1. WHOIS Intelligence
```
For each domain in scope:
□ Current WHOIS record
  - Registrant name/org
  - Admin contact
  - Tech contact
  - Registrar
  - Creation/expiration dates

□ Historical WHOIS (if available)
  - Previous owners
  - Registration changes
  - Privacy service history

□ Registrant correlation
  - Other domains with same registrant
  - Email pattern matching
  - Organization matching
```

#### 2. DNS Expansion
```
□ A/AAAA Records
  - IP addresses → add as nodes
  - Historical IPs

□ MX Records
  - Mail servers → infrastructure links
  - Email service providers

□ NS Records
  - Name servers → hosting relationships

□ TXT Records
  - SPF → authorized senders
  - DKIM → email infrastructure
  - Verification records → third-party services

□ CNAME Records
  - Aliases → related services

□ Subdomain Enumeration
  - Common subdomains (www, mail, api, dev, staging)
  - Certificate transparency
  - DNS brute force (if authorized)
```

#### 3. Certificate Intelligence
```
□ SSL/TLS Certificates
  - Subject Alternative Names (SANs) → related domains
  - Issuer information
  - Certificate transparency logs
  - Historical certificates
```

### Output: New Nodes Discovered

```markdown
## RESOLVER EXPANSION RESULTS

### New Nodes Discovered: [count]

| Node ID | Type | Value | Relationship to Seed | Confidence |
|---------|------|-------|---------------------|------------|
| N002 | Domain | related.com | Same registrant | HIGH |
| N003 | IP | 1.2.3.4 | Hosts seed domain | HIGH |
| N004 | Email | admin@seed.com | WHOIS contact | MEDIUM |

### Relationships Established

| Source | Target | Relationship | Evidence |
|--------|--------|--------------|----------|
| N001 | N002 | Same owner | WHOIS registrant match |
| N001 | N003 | Hosted on | DNS A record |
```

---

## PROBE (Technical) Expansion

### Agent: technical-researcher
### Codename: Probe
### Focus: Infrastructure, services, code relationships

### Expansion Tasks

#### 1. IP/Infrastructure Analysis
```
For each IP discovered:
□ Reverse DNS
  - Other domains on same IP
  - PTR records

□ IP Range Analysis
  - Adjacent IPs
  - Same /24 network
  - ASN membership

□ Service Enumeration
  - Open ports
  - Running services
  - Version information
```

#### 2. Technology Fingerprinting
```
□ Web Technologies
  - CMS/Framework
  - JavaScript libraries
  - Analytics/tracking

□ Third-party Services
  - CDN provider
  - Email service
  - Cloud infrastructure
  - Payment processors

□ API Discovery
  - Documented APIs
  - Hidden endpoints
  - GraphQL/REST patterns
```

#### 3. Code Repository Analysis
```
□ GitHub/GitLab Search
  - Organization repositories
  - User repositories
  - Contributor networks

□ Commit Analysis
  - Email addresses in commits
  - Collaborator identification
  - Related projects

□ Dependency Analysis
  - Packages used
  - Custom dependencies
  - Forked projects
```

### Output: New Nodes Discovered

```markdown
## PROBE EXPANSION RESULTS

### New Nodes Discovered: [count]

| Node ID | Type | Value | Relationship to Seed | Confidence |
|---------|------|-------|---------------------|------------|
| N005 | Service | api.seed.com | API endpoint | HIGH |
| N006 | GitHub | github.com/seedorg | Organization repo | HIGH |
| N007 | Person | dev@seed.com | Git commit author | MEDIUM |

### Relationships Established

| Source | Target | Relationship | Evidence |
|--------|--------|--------------|----------|
| N001 | N005 | Operates | Subdomain of seed |
| N006 | N007 | Contributor | Git history |
```

---

## ECHO (Social) Expansion

### Agent: social-media-analyst
### Codename: Echo
### Focus: Social presence, human network, online activity

### Expansion Tasks

#### 1. Platform Enumeration
```
□ Major Platforms
  - LinkedIn (company + employees)
  - Twitter/X
  - Facebook (company page)
  - Instagram
  - YouTube

□ Professional Networks
  - Crunchbase
  - AngelList
  - Glassdoor

□ Technical Communities
  - Stack Overflow
  - Reddit
  - Discord servers
  - Slack communities
```

#### 2. Account Discovery
```
For usernames/emails found:
□ Username enumeration across platforms
  - Exact matches
  - Common variations
  - Historical handles

□ Profile Analysis
  - Bio information
  - Linked accounts
  - Contact information
  - Location indicators
```

#### 3. Network Mapping
```
□ Connection Analysis
  - Followers/following
  - Mutual connections
  - Group memberships
  - Tagged relationships

□ Organizational Mapping
  - Employee identification
  - Role/title extraction
  - Reporting relationships
  - Department structure
```

#### 4. Activity Analysis
```
□ Content Patterns
  - Posting frequency
  - Topics/interests
  - Engagement patterns
  - Cross-posting behavior
```

### Output: New Nodes Discovered

```markdown
## ECHO EXPANSION RESULTS

### New Nodes Discovered: [count]

| Node ID | Type | Value | Relationship to Seed | Confidence |
|---------|------|-------|---------------------|------------|
| N008 | Person | John Smith | CEO of seed org | HIGH |
| N009 | Account | @seedcompany | Twitter account | HIGH |
| N010 | Person | Jane Doe | Employee | MEDIUM |

### Relationships Established

| Source | Target | Relationship | Evidence |
|--------|--------|--------------|----------|
| N001 | N008 | Leadership | LinkedIn CEO title |
| N008 | N010 | Manages | LinkedIn connection + titles |
| N009 | N001 | Official account | Bio states company |
```

---

## PROXY (Corporate Intelligence) Expansion

### Agent: corporate-intel-specialist
### Codename: Proxy
### Focus: Corporate structure, ownership, affiliations, registrations

### Expansion Tasks

#### 1. Entity Verification & Structure
```
For organization nodes:
□ Business registry lookup
  - Registration status
  - Incorporation date
  - Jurisdiction
  - Registered address

□ Corporate structure
  - Parent company
  - Subsidiaries
  - Holding companies
  - Joint ventures

□ Beneficial ownership
  - Named directors/officers
  - Significant shareholders
  - Ultimate Beneficial Owners (UBOs)
  - Control chains
```

#### 2. Officer/Director Network
```
□ Director Discovery
  - Named officers/directors
  - Board members
  - Company secretaries
  - Registered agents

□ Cross-Directorship Analysis
  - Other companies same directors serve
  - Historical directorships
  - Network of associated entities

□ Officer Background
  - Other corporate roles
  - Previous positions
  - Professional credentials
```

#### 3. Corporate Relationships
```
□ Affiliate Network
  - Suppliers/vendors (if public)
  - Partners (press releases, etc.)
  - Customers (case studies, etc.)

□ Investment Relationships
  - Investors (if disclosed)
  - Portfolio companies
  - Joint venture partners

□ Regulatory Relationships
  - Industry licenses
  - Government contracts
  - Regulatory filings
```

#### 4. Financial Intelligence
```
□ Public Financial Data
  - Annual reports (if public)
  - SEC/regulatory filings
  - Credit ratings
  - Bankruptcy/liens

□ Corporate Actions
  - M&A activity
  - Name changes
  - Restructuring events
  - Litigation (civil cases)
```

### Output: New Nodes Discovered

```markdown
## PROXY EXPANSION RESULTS

### New Nodes Discovered: [count]

| Node ID | Type | Value | Relationship to Seed | Confidence |
|---------|------|-------|---------------------|------------|
| N011 | Company | Parent Corp LLC | Parent company | HIGH |
| N012 | Person | Jane Director | Board member | HIGH |
| N013 | Company | Subsidiary Inc | Subsidiary | MEDIUM |
| N014 | Company | Partner Corp | Business partner | LOW |

### Relationships Established

| Source | Target | Relationship | Evidence |
|--------|--------|--------------|----------|
| N011 | N001 | Owns | Corporate registry |
| N001 | N013 | Parent of | Corporate registry |
| N012 | N001 | Director of | Registry filing |
| N012 | N014 | Also director | Cross-reference |

### Corporate Intelligence Notes
- [Key finding about ownership structure]
- [Key finding about related entities]
- [Red flags or concerns identified]
```

---

## EXPANSION TRACKING

### Progress Dashboard

```
EXPANSION STATUS
================
Depth Level: [1/2/3]
Nodes Discovered: [count] / [max]
Time Elapsed: [time] / [budget]

AGENT STATUS:
□ Resolver: [Complete/In Progress/Pending]
□ Probe: [Complete/In Progress/Pending]
□ Echo: [Complete/In Progress/Pending]
□ Proxy: [Complete/In Progress/Pending]

SCOPE CHECK:
□ Within node limit: [Yes/No]
□ Within time budget: [Yes/No]
□ Within geographic scope: [Yes/No]
```

### Iteration Decision

After first expansion pass:

**Continue to Depth 2?**
- [ ] High-value nodes discovered that warrant expansion
- [ ] Within scope limits
- [ ] Time budget allows

**Stop expansion if:**
- Node limit reached
- Time budget exhausted
- Diminishing returns (few new nodes)
- Scope boundary reached

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] All HIGH priority vectors expanded
- [ ] MEDIUM priority vectors expanded (if time allows)
- [ ] All new nodes documented
- [ ] Relationships recorded
- [ ] Scope limits checked

---

## MENU OPTIONS

**[C] Continue** - Proceed to correlation (Step 3)
**[E] Expand More** - Another iteration at next depth
**[S] Stop** - End expansion, move to synthesis
**[R] Review** - Review discovered nodes before continuing

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-correlation.md`
