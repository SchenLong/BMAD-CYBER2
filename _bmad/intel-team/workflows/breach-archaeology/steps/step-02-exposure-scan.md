---
name: 'step-02-exposure-scan'
description: 'Execute comprehensive breach and exposure scanning across all sources'
estimated_duration: '15-20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/breach-archaeology'
thisStepFile: '{workflow_path}/steps/step-02-exposure-scan.md'
nextStepFile: '{workflow_path}/steps/step-03-threat-correlation.md'
prevStepFile: '{workflow_path}/steps/step-01-target-setup.md'

# Agent Configuration
executing_agents:
  - dark-web-analyst        # Shadow - breach databases, dark web
  - technical-researcher    # Probe - technical exposure
  - domain-intel-specialist # Resolver - infrastructure exposure
primary_agent: dark-web-analyst
---

# Step 2: Exposure Scan

## STEP GOAL

Execute comprehensive scanning across all breach databases, dark web sources, and technical exposure points to build complete exposure inventory.

## EXECUTION TIME: ~15-20 minutes

## SCAN COORDINATION

```
        Shadow (Lead)
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Shadow  │ │  Probe  │ │Resolver │
│ Breach  │ │Technical│ │ Infra   │
│ DBs     │ │Exposure │ │Exposure │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     └───────────┴─────┬─────┘
                       ▼
              Exposure Inventory
```

---

## SHADOW: Breach Database Scanning

### Agent: dark-web-analyst
### Codename: Shadow
### Focus: Breach databases, dark web sources, paste sites

### Scan Categories

#### 1. Major Breach Databases
```
Query each selector against:

□ Have I Been Pwned (HIBP)
  - Email breaches
  - Pastes
  - Password exposure indicator

□ DeHashed (if available)
  - Email search
  - Username search
  - Name search
  - IP search (if applicable)

□ Intelligence X
  - Email selectors
  - Domain selectors
  - Username selectors

□ Leak-Lookup Services
  - Aggregate search
  - Historical data

For each hit, document:
- Breach name
- Breach date
- Data types exposed
- Record count (if available)
- Breach source/attribution
```

#### 2. Paste Site Analysis
```
Search paste sites for selectors:

□ Pastebin (and mirrors)
□ GitHub Gists
□ Ghostbin
□ JustPaste.it
□ PrivateBin instances

Document:
- Paste URL
- Date posted
- Context of exposure
- Data visible
- Associated data (what else in paste)
```

#### 3. Dark Web Forum Search
```
Check for mentions in:

□ Hacker forums (RaidForums successors, etc.)
□ Carding forums
□ Data trading communities
□ Ransomware leak sites

Document:
- Forum/site name
- Thread/post reference
- Date of mention
- Context (sale, trade, dump)
- Threat actor handle
```

#### 4. Underground Marketplaces
```
Search for:

□ Credential listings
□ PII listings
□ Database offerings mentioning target
□ Corporate data sales

Document:
- Marketplace name
- Listing details
- Price (if visible)
- Seller reputation
- Data preview/description
```

#### 5. Telegram/Discord Channels
```
Search data trading channels for:

□ Breach announcements
□ Combo list mentions
□ Targeted dumps
□ Domain mentions

Document:
- Channel name
- Message date
- Context
- Data description
```

### Shadow Output Format

```markdown
## BREACH DATABASE FINDINGS (Shadow)

### Confirmed Breaches

| # | Breach Name | Date | Selector | Data Types | Records | Severity |
|---|-------------|------|----------|------------|---------|----------|
| 1 | [Name] | [Date] | [which selector hit] | email, password | [count] | HIGH |
| 2 | [Name] | [Date] | [selector] | email only | [count] | LOW |

### Paste Site Exposures

| Source | Date | URL | Data Visible | Context |
|--------|------|-----|--------------|---------|
| Pastebin | [Date] | [URL] | [types] | [context] |

### Dark Web Mentions

| Forum/Site | Date | Context | Threat Actor | Severity |
|------------|------|---------|--------------|----------|
| [Name] | [Date] | [context] | [handle] | [level] |

### Credential Summary
- **Total breaches:** [count]
- **Password exposed:** [Yes/No/Hashed]
- **Password variations found:** [count]
- **Most recent breach:** [name, date]
- **Oldest breach:** [name, date]
```

---

## PROBE: Technical Exposure Scanning

### Agent: technical-researcher
### Codename: Probe
### Focus: Code repositories, technical leaks, API exposure

### Scan Categories

#### 1. Code Repository Search
```
Search for selectors in:

□ GitHub (code, commits, gists)
□ GitLab
□ Bitbucket
□ SourceForge

Look for:
- Hardcoded credentials
- Configuration files
- API keys
- Database connection strings
- Internal documentation
- Email addresses in commits
```

#### 2. Cloud Storage Exposure
```
Check for exposed:

□ S3 buckets (with domain keywords)
□ Azure blobs
□ Google Cloud Storage
□ Elasticsearch instances
□ MongoDB instances
```

#### 3. Technical Documentation Leaks
```
Search for:

□ Internal wikis indexed by Google
□ Exposed Confluence pages
□ Leaked technical documentation
□ API documentation with credentials
```

#### 4. Certificate Transparency
```
Search CT logs for:

□ Email addresses in certificates
□ Internal hostnames exposed
□ Development environment certificates
```

### Probe Output Format

```markdown
## TECHNICAL EXPOSURE FINDINGS (Probe)

### Code Repository Leaks

| Repository | Type | Exposure | Date Found | Severity |
|------------|------|----------|------------|----------|
| [repo URL] | API key | [description] | [date] | HIGH |
| [repo URL] | Email | [description] | [date] | LOW |

### Cloud Storage Exposure

| Service | Identifier | Data Type | Access Level | Severity |
|---------|------------|-----------|--------------|----------|
| S3 | [bucket] | [type] | [public/auth] | [level] |

### Other Technical Exposure

| Source | Exposure Type | Details | Severity |
|--------|---------------|---------|----------|
| [source] | [type] | [details] | [level] |
```

---

## RESOLVER: Infrastructure Exposure

### Agent: domain-intel-specialist
### Codename: Resolver
### Focus: Domain breaches, email infrastructure, DNS exposure

### Scan Categories

#### 1. Domain Breach Correlation
```
For each domain selector:

□ Check for domain-wide breaches
□ Correlate with known corporate breaches
□ Identify third-party service breaches affecting domain
```

#### 2. Email Infrastructure Exposure
```
Check for:

□ Email server misconfigurations
□ SPF/DKIM/DMARC failures
□ Open relay indicators
□ Historical email server compromises
```

#### 3. DNS History Analysis
```
Look for:

□ Historical DNS hijacking
□ Domain expiration incidents
□ Nameserver compromises
□ Suspicious DNS changes
```

#### 4. Certificate Issues
```
Check for:

□ Expired certificates that were exploited
□ Misissued certificates
□ Certificate transparency anomalies
```

### Resolver Output Format

```markdown
## INFRASTRUCTURE EXPOSURE FINDINGS (Resolver)

### Domain-Level Breaches

| Domain | Breach | Date | Impact | Severity |
|--------|--------|------|--------|----------|
| [domain] | [breach name] | [date] | [description] | [level] |

### Email Infrastructure Issues

| Issue | Domain | Details | Risk Level |
|-------|--------|---------|------------|
| [issue type] | [domain] | [details] | [level] |

### DNS/Certificate Issues

| Issue Type | Date | Details | Exploitation Evidence |
|------------|------|---------|----------------------|
| [type] | [date] | [details] | [yes/no/unknown] |
```

---

## EXPOSURE AGGREGATION

### Combined Exposure Inventory

After all agents complete scanning, aggregate:

```markdown
## AGGREGATE EXPOSURE INVENTORY

### By Data Type

| Data Type | Breaches | Most Recent | Severity |
|-----------|----------|-------------|----------|
| Email addresses | [count] | [date] | LOW |
| Passwords (plaintext) | [count] | [date] | CRITICAL |
| Passwords (hashed) | [count] | [date] | HIGH |
| Personal info (PII) | [count] | [date] | HIGH |
| Financial data | [count] | [date] | CRITICAL |
| Corporate data | [count] | [date] | HIGH |
| API keys/tokens | [count] | [date] | CRITICAL |

### By Source Type

| Source | Exposures | Last Activity |
|--------|-----------|---------------|
| Major breaches | [count] | [date] |
| Paste sites | [count] | [date] |
| Dark web | [count] | [date] |
| Code repos | [count] | [date] |
| Infrastructure | [count] | [date] |

### Timeline Summary

| Year | Breaches | Most Significant |
|------|----------|------------------|
| 2024 | [count] | [breach name] |
| 2023 | [count] | [breach name] |
| 2022 | [count] | [breach name] |
| Earlier | [count] | [breach name] |
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] All breach databases queried
- [ ] Paste sites searched
- [ ] Dark web sources checked
- [ ] Technical exposure scanned
- [ ] Infrastructure exposure reviewed
- [ ] All findings documented

---

## MENU OPTIONS

**[C] Continue** - Proceed to threat correlation (Step 3)
**[R] Rescan** - Additional queries on specific sources
**[D] Detail** - Expand detail on specific findings
**[E] Export** - Export raw findings

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-threat-correlation.md`
