---
name: 'phase-03-digital-infrastructure'
description: 'Corporate domain portfolio, API endpoints, CDN/edge, cloud footprint, development environments'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-ai'
thisStepFile: '{workflow_path}/steps/phase-03-digital-infrastructure.md'
nextStepFile: '{workflow_path}/steps/phase-04-corporate-structure.md'
prevStepFile: '{workflow_path}/steps/phase-02-technical-intelligence.md'

# Agent Configuration
executing_agent: domain-intel-specialist
agent_codename: Resolver
---

# Phase 3: Digital Infrastructure

## PHASE GOAL

Map the AI entity's complete digital infrastructure including corporate domains, API endpoints, CDN and edge infrastructure, cloud service footprint, and development/staging environments.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Resolver**, Domain Intelligence Specialist
- You specialize in DOMINT and infrastructure mapping
- You trace digital footprints through DNS, certificates, and network analysis
- You identify cloud providers and service architectures

### Analysis Protocol

- Map corporate domain portfolio
- Identify API endpoints and services
- Analyze CDN and edge infrastructure
- Assess cloud service footprint
- Discover development and staging environments

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Corporate Domain Portfolio

Map all domains associated with the entity:

```
CORPORATE DOMAIN PORTFOLIO
==========================

Primary Domains:
| Domain | Registrar | Registration | Expiration | Status |
|--------|-----------|--------------|------------|--------|
| [primary.ai] | [registrar] | [date] | [date] | [active] |
| [company.com] | [registrar] | [date] | [date] | [status] |

Domain Categories:
| Category | Domains | Purpose |
|----------|---------|---------|
| Corporate | [list] | Main website, careers |
| Product | [list] | API, applications |
| Developer | [list] | Docs, developer portal |
| Marketing | [list] | Campaigns, landing pages |
| Research | [list] | Papers, demos |
| Internal | [list] | Tools, admin |

WHOIS Analysis:
| Domain | Registrant | Organization | Privacy |
|--------|------------|--------------|---------|
| [domain] | [registrant] | [org] | [Y/N] |

Domain Age Analysis:
| Domain | Age | First Seen | Intelligence Value |
|--------|-----|------------|-------------------|
| [domain] | [years] | [date] | [planning timeline] |

Recently Registered:
| Domain | Registration Date | Purpose (Inferred) |
|--------|-------------------|-------------------|
| [domain] | [date] | [new product/expansion] |

□ Total domains discovered: [count]
□ Domain categories mapped: [count]
□ Recent registrations: [count]
```

### 2. API Endpoints & Services

Identify and map API infrastructure:

```
API ENDPOINTS & SERVICES
========================

Production APIs:
| Endpoint | Purpose | Version | Rate Limits | Authentication |
|----------|---------|---------|-------------|----------------|
| api.[domain]/v1/ | Main API | v1 | [limits] | [API key/OAuth] |
| [endpoint] | [purpose] | [version] | [limits] | [auth] |

API Documentation:
| Documentation URL | Completeness | Sensitive Info |
|-------------------|--------------|----------------|
| [docs URL] | [full/partial] | [internal details exposed] |

API Endpoint Discovery:
| Method | Endpoints Found | Notes |
|--------|-----------------|-------|
| Documentation | [count] | [public docs] |
| Subdomain enumeration | [count] | [hidden endpoints] |
| JavaScript analysis | [count] | [client-side calls] |
| API response analysis | [count] | [referenced endpoints] |

Discovered Endpoints:
| Endpoint | Method | Purpose | Security |
|----------|--------|---------|----------|
| /chat/completions | POST | Chat API | [API key] |
| /embeddings | POST | Embeddings | [auth type] |
| /models | GET | Model list | [auth type] |
| /files | POST | File upload | [auth type] |
| [endpoint] | [method] | [purpose] | [security] |

Webhook/Callback URLs:
| URL Pattern | Purpose | Security Assessment |
|-------------|---------|---------------------|
| [pattern] | [purpose] | [assessment] |

□ API endpoints documented: [count]
□ Documentation analyzed: [Y/N]
□ Hidden endpoints discovered: [count]
```

### 3. CDN & Edge Infrastructure

Analyze content delivery and edge infrastructure:

```
CDN & EDGE INFRASTRUCTURE
=========================

CDN Providers:
| Provider | Evidence | Domains Served |
|----------|----------|----------------|
| Cloudflare | [headers, DNS] | [domains] |
| Fastly | [evidence] | [domains] |
| Akamai | [evidence] | [domains] |
| CloudFront | [evidence] | [domains] |
| [custom] | [evidence] | [domains] |

Edge Locations:
| Region | Evidence | Purpose |
|--------|----------|---------|
| [region] | [inference method] | [serving, training] |

SSL/TLS Configuration:
| Domain | Certificate Authority | Grade | Issues |
|--------|----------------------|-------|--------|
| [domain] | [CA] | [A/B/C/F] | [vulnerabilities] |

Certificate Transparency:
| Domain | Certificates Found | Subdomains Revealed |
|--------|-------------------|---------------------|
| [domain] | [count] | [list] |

WAF/Protection:
| Domain | WAF Provider | Configuration |
|--------|--------------|---------------|
| [domain] | [provider] | [observed rules] |

□ CDN providers identified: [count]
□ Edge locations mapped: [count]
□ SSL configurations assessed: [count]
```

### 4. Cloud Service Footprint

Map cloud provider usage:

```
CLOUD SERVICE FOOTPRINT
=======================

Cloud Provider Analysis:
| Provider | Services | Evidence | Scale Indicators |
|----------|----------|----------|------------------|
| AWS | [S3, EC2, SageMaker] | [DNS, job posts] | [scale clues] |
| GCP | [services] | [evidence] | [scale] |
| Azure | [services] | [evidence] | [scale] |
| Oracle Cloud | [services] | [evidence] | [scale] |

AWS Footprint:
| Service | Evidence | Exposure Risk |
|---------|----------|---------------|
| S3 buckets | [bucket names] | [public/private] |
| EC2 regions | [IP ranges] | [geographic spread] |
| CloudFront | [distributions] | [configuration] |
| Lambda | [evidence] | [API integration] |

GCP Footprint:
| Service | Evidence | Exposure Risk |
|---------|----------|---------------|
| GCS buckets | [bucket names] | [access level] |
| TPU usage | [evidence] | [training scale] |
| Vertex AI | [evidence] | [model serving] |
| Cloud Run | [evidence] | [API hosting] |

Azure Footprint:
| Service | Evidence | Exposure Risk |
|---------|----------|---------------|
| Blob Storage | [containers] | [access level] |
| Azure OpenAI | [evidence] | [partnership] |
| AKS | [evidence] | [container orchestration] |

Public Cloud Resources:
| Resource | URL/Identifier | Content | Risk |
|----------|----------------|---------|------|
| S3 bucket | [bucket.s3.amazonaws.com] | [contents] | [exposure] |
| GCS bucket | [bucket.storage.googleapis.com] | [contents] | [exposure] |
| [resource] | [identifier] | [content] | [risk] |

□ Cloud providers identified: [count]
□ Public resources found: [count]
□ Scale indicators documented: [Y/N]
```

### 5. Development & Staging Environments

Identify non-production environments:

```
DEVELOPMENT & STAGING ENVIRONMENTS
==================================

Subdomain Discovery:
| Subdomain | Purpose | Status | Exposure Risk |
|-----------|---------|--------|---------------|
| dev.[domain] | Development | [active] | [H/M/L] |
| staging.[domain] | Staging | [status] | [risk] |
| beta.[domain] | Beta testing | [status] | [risk] |
| api-dev.[domain] | Dev API | [status] | [risk] |
| test.[domain] | Testing | [status] | [risk] |
| sandbox.[domain] | Sandbox | [status] | [risk] |
| internal.[domain] | Internal tools | [status] | [risk] |

Environment Analysis:
| Environment | Security | Differences from Prod | Intelligence Value |
|-------------|----------|----------------------|-------------------|
| [environment] | [auth required?] | [versions, features] | [preview of upcoming] |

Exposed Internal Tools:
| Tool | URL | Purpose | Access Level |
|------|-----|---------|--------------|
| [tool] | [URL] | [purpose] | [public/auth required] |

CI/CD Indicators:
| Indicator | Evidence | Tool/Platform |
|-----------|----------|---------------|
| GitHub Actions | [repo analysis] | [workflows] |
| Jenkins | [subdomain/headers] | [configuration] |
| CircleCI | [evidence] | [details] |
| [other] | [evidence] | [details] |

Version Control Exposure:
| Repository | Access Level | Sensitive Content |
|------------|--------------|-------------------|
| [repo] | [public/private] | [internal code, configs] |

□ Non-production environments: [count]
□ Internal tools exposed: [count]
□ CI/CD systems identified: [count]
```

### 6. Network Topology

Map network infrastructure:

```
NETWORK TOPOLOGY
================

IP Range Analysis:
| Range | ASN | Owner | Purpose |
|-------|-----|-------|---------|
| [IP range] | [ASN] | [organization] | [inferred purpose] |

DNS Infrastructure:
| Component | Provider | Configuration |
|-----------|----------|---------------|
| Authoritative NS | [provider] | [nameservers] |
| DNS hosting | [provider] | [configuration] |
| DNSSEC | [enabled/disabled] | [status] |

Email Infrastructure:
| Component | Details | Security |
|-----------|---------|----------|
| MX records | [providers] | [configuration] |
| SPF | [record] | [validity] |
| DKIM | [selectors] | [strength] |
| DMARC | [policy] | [enforcement] |

BGP/ASN Analysis:
| ASN | Organization | Prefixes | Relationships |
|-----|--------------|----------|---------------|
| [ASN] | [org] | [count] | [upstream/peers] |

Hosting Relationships:
| Host | Provider | Regions | Purpose |
|------|----------|---------|---------|
| [hostname] | [provider] | [locations] | [purpose] |

□ IP ranges mapped: [count]
□ DNS infrastructure documented: [Y/N]
□ Email security assessed: [Y/N]
```

### 7. Digital Infrastructure Summary

Compile infrastructure findings:

```
DIGITAL INFRASTRUCTURE SUMMARY
==============================

Domain Portfolio:
| Category | Count | Key Domains |
|----------|-------|-------------|
| Corporate | [count] | [primary] |
| Product | [count] | [primary] |
| Developer | [count] | [primary] |
| Internal | [count] | [primary] |
| **TOTAL** | **[count]** | - |

API Landscape:
| API Type | Endpoints | Documentation |
|----------|-----------|---------------|
| Production | [count] | [Y/N] |
| Development | [count] | [Y/N] |
| Internal | [count] | [Y/N] |

Cloud Footprint:
| Provider | Primary Use | Scale Estimate |
|----------|-------------|----------------|
| [provider] | [purpose] | [scale] |

Infrastructure Security Assessment:
| Area | Rating | Key Issues |
|------|--------|------------|
| Domain security | [1-10] | [issues] |
| API security | [1-10] | [issues] |
| Cloud security | [1-10] | [issues] |
| Email security | [1-10] | [issues] |

Critical Findings:
| Finding | Severity | Category |
|---------|----------|----------|
| [finding] | [H/M/L] | [domain/API/cloud] |

HANDOFF TO PROXY (Phase 4):
- Entity domains: [list for corporate registry lookup]
- Officer/director names: [if discovered in WHOIS]
- Subsidiaries: [if discovered]
- Cloud/hosting providers: [for contract/partnership analysis]
```

---

## PHASE 3 OUTPUT

```markdown
## DIGITAL INFRASTRUCTURE COMPLETE

### Domain Portfolio
- Total domains: [count]
- Corporate: [count]
- Product: [count]
- Developer: [count]

### API Infrastructure
- Production endpoints: [count]
- Documentation: [quality assessment]
- Security: [assessment]

### Cloud Footprint
- Primary provider: [provider]
- Secondary: [provider]
- Scale estimate: [assessment]

### Key Findings
1. [Most significant infrastructure finding]
2. [Second finding]
3. [Third finding]

### Security Concerns
- [Concern 1]
- [Concern 2]

### Next Phase
Phase 4: Corporate Structure & Funding (Proxy)
Focus: [corporate structure, funding, regulatory]
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 4:

- [ ] Domain portfolio mapped
- [ ] API endpoints documented
- [ ] CDN/edge infrastructure analyzed
- [ ] Cloud footprint assessed
- [ ] Dev/staging environments discovered
- [ ] Handoff prepared for Proxy

---

## MENU OPTIONS

**[C] Continue** - Proceed to corporate structure analysis (Phase 4)
**[D] Domains** - Deeper domain enumeration
**[A] API** - Extended API analysis
**[S] Security** - Infrastructure security deep dive

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/phase-04-corporate-structure.md`
