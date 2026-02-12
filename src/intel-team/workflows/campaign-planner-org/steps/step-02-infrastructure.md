---
name: 'step-02-infrastructure'
description: 'Domain portfolio, email infrastructure, cloud services, certificate analysis'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-org'
thisStepFile: '{workflow_path}/steps/step-02-infrastructure.md'
nextStepFile: '{workflow_path}/steps/step-03-technology.md'
prevStepFile: '{workflow_path}/steps/step-01-initialization.md'

# Agent Configuration
executing_agent: domain-intel-specialist
agent_codename: Resolver
---

# Phase 2: Digital Infrastructure Mapping

## STEP GOAL

Map the organization's complete digital infrastructure including domain portfolio, email systems, cloud services, and hosting. Identify all digital assets that could provide intelligence value or represent potential vulnerabilities.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Resolver**, Domain Intelligence Specialist
- You specialize in DNS, domain, and network infrastructure analysis
- You enumerate and map digital assets comprehensively
- You identify infrastructure patterns and relationships

### Collection Protocol

- Enumerate all domains associated with the organization
- Map DNS records and infrastructure
- Identify email systems and security posture
- Discover cloud services and hosting
- Analyze SSL/TLS certificates

---

## COLLECTION EXECUTION SEQUENCE

### 1. Domain Portfolio Enumeration

Discover all domains associated with the organization:

```
DOMAIN PORTFOLIO ENUMERATION
============================

Primary Domain(s):
| Domain | Purpose | Status | Discovery Method |
|--------|---------|--------|------------------|
| [domain.com] | Corporate site | Active | Known/Seed |

Discovered Domains:
| Domain | Purpose | Relationship | Discovery Method |
|--------|---------|--------------|------------------|
| [domain2.com] | Product site | Owned | WHOIS correlation |
| [domain3.com] | Regional site | Subsidiary | Certificate SAN |
| [domain4.io] | Developer portal | Owned | Certificate transparency |

□ Domain discovery methods used:
  - WHOIS registrant correlation: [count found]
  - Certificate transparency logs: [count found]
  - Reverse IP lookup: [count found]
  - DNS zone enumeration: [count found]
  - Web crawling (linked domains): [count found]
  - Brand/trademark variations: [count found]
  - Historical DNS: [count found]

Domain Pattern Analysis:
□ Naming conventions observed: [patterns]
□ TLD preferences: [.com, .io, regional TLDs]
□ Product/brand domains: [list]
□ Regional domains: [list]
□ Development/staging domains: [list]

DOMAIN SUMMARY:
Total domains discovered: [count]
Primary domains: [count]
Product domains: [count]
Regional domains: [count]
Development domains: [count]
Inactive/parked: [count]
```

### 2. DNS Record Analysis

Analyze DNS records for infrastructure mapping:

```
DNS RECORD ANALYSIS
===================

For each primary domain:

DOMAIN: [domain.com]

A/AAAA Records:
| Subdomain | IP Address | Type | Provider | Location |
|-----------|------------|------|----------|----------|
| www | [IP] | A | [provider] | [location] |
| mail | [IP] | A | [provider] | [location] |
| [other] | [IP] | A/AAAA | [provider] | [location] |

MX Records:
| Priority | Mail Server | Provider | Security |
|----------|-------------|----------|----------|
| 10 | [server] | [provider] | [SPF/DKIM/DMARC status] |

NS Records:
| Name Server | Provider | Notes |
|-------------|----------|-------|
| [ns] | [provider] | [observations] |

TXT Records:
| Record Type | Value | Intelligence |
|-------------|-------|--------------|
| SPF | [value] | [authorized senders] |
| DKIM | [value] | [email security] |
| DMARC | [value] | [policy] |
| Verification | [value] | [third-party services] |
| Other | [value] | [notes] |

CNAME Records:
| Subdomain | Target | Service/Purpose |
|-----------|--------|-----------------|
| [sub] | [target] | [service identified] |

Subdomain Enumeration:
| Subdomain | IP/CNAME | Purpose | Notes |
|-----------|----------|---------|-------|
| www | [target] | Main site | |
| mail | [target] | Email | |
| vpn | [target] | VPN | Security relevant |
| api | [target] | API | Development |
| dev | [target] | Development | Potentially sensitive |
| staging | [target] | Staging | Potentially sensitive |
| admin | [target] | Admin panel | High value |
| portal | [target] | Portal | User-facing |
| [other] | [target] | [purpose] | [notes] |

DNS INTELLIGENCE SUMMARY:
- Unique IPs discovered: [count]
- Subdomains found: [count]
- Third-party services identified: [list]
- Security posture observations: [summary]
```

### 3. Email Infrastructure Analysis

Analyze email systems and security:

```
EMAIL INFRASTRUCTURE ANALYSIS
=============================

Mail Exchange Analysis:
| Domain | MX Provider | Security Features |
|--------|-------------|-------------------|
| [domain] | [provider] | [SPF/DKIM/DMARC] |

Email Provider Identification:
□ Primary email provider: [Google Workspace/Microsoft 365/Self-hosted/Other]
□ Email security gateway: [if identified]
□ Additional email services: [list]

Email Security Posture:
| Security Control | Status | Configuration |
|------------------|--------|---------------|
| SPF | [Present/Absent] | [policy: -all, ~all, ?all] |
| DKIM | [Present/Absent] | [selector info if available] |
| DMARC | [Present/Absent] | [policy: none/quarantine/reject] |
| MTA-STS | [Present/Absent] | [policy] |
| DANE | [Present/Absent] | [status] |

Email Address Patterns:
□ Observed format: [first.last@, flast@, firstl@, etc]
□ Role-based addresses found: [info@, support@, sales@, etc]
□ Key personnel addresses: [if discovered]

Email Intelligence Value:
- Email security rating: [Strong/Moderate/Weak]
- Spoofing resistance: [High/Medium/Low]
- Phishing susceptibility indicators: [observations]
```

### 4. Hosting and Cloud Infrastructure

Identify hosting providers and cloud services:

```
HOSTING AND CLOUD INFRASTRUCTURE
================================

Web Hosting:
| Domain/Service | Provider | Type | Location |
|----------------|----------|------|----------|
| [domain] | [AWS/Azure/GCP/etc] | [dedicated/shared/CDN] | [region] |

Cloud Service Providers:
□ Primary cloud: [provider]
□ Secondary cloud: [provider if multi-cloud]
□ CDN provider: [Cloudflare/Akamai/Fastly/etc]

Cloud Service Discovery:
| Service Type | Provider | Evidence |
|--------------|----------|----------|
| Compute (IaaS) | [provider] | [IP ranges, hostnames] |
| Storage (Blob) | [provider] | [S3 buckets, Azure blobs] |
| Database | [provider] | [if exposed] |
| Serverless | [provider] | [API Gateway, Lambda URLs] |
| Kubernetes | [provider] | [cluster indicators] |

Third-Party SaaS:
| Service | Purpose | Evidence |
|---------|---------|----------|
| [Salesforce] | CRM | [subdomain, DNS] |
| [Zendesk] | Support | [subdomain, DNS] |
| [Slack] | Communication | [DNS records] |
| [Other] | [purpose] | [discovery method] |

IP Range Analysis:
| Range | Owner | Purpose |
|-------|-------|---------|
| [CIDR] | [org/provider] | [hosting/office/etc] |

CLOUD INTELLIGENCE SUMMARY:
- Primary cloud provider: [provider]
- Multi-cloud: [Y/N]
- CDN usage: [Y/N, provider]
- SaaS footprint: [count services]
- Potential misconfigurations: [if observed]
```

### 5. SSL/TLS Certificate Analysis

Analyze certificates for intelligence:

```
SSL/TLS CERTIFICATE ANALYSIS
============================

Certificate Inventory:
| Domain | Issuer | Validity | SANs |
|--------|--------|----------|------|
| [domain] | [Let's Encrypt/DigiCert/etc] | [dates] | [count] |

Certificate Transparency Mining:
□ Total certificates found: [count]
□ Date range: [earliest to latest]
□ Issuers used: [list]

Subject Alternative Names (SANs) Discovery:
| Certificate | SANs Found | New Domains Discovered |
|-------------|------------|------------------------|
| [cert ID] | [count] | [list new domains] |

Intelligence from Certificates:
□ Internal hostnames revealed: [list]
□ Development/staging systems: [list]
□ Product/service names: [list]
□ Organizational structure hints: [observations]

Certificate Security Assessment:
| Metric | Assessment |
|--------|------------|
| Certificate validity | [Good/Expiring Soon/Expired] |
| Key strength | [2048/4096 RSA, ECC] |
| Protocol support | [TLS versions] |
| Revocation checking | [OCSP/CRL status] |
```

### 6. Infrastructure Intelligence Summary

Compile infrastructure findings:

```
INFRASTRUCTURE INTELLIGENCE SUMMARY
====================================

Digital Asset Inventory:
| Asset Type | Count | Primary Provider |
|------------|-------|------------------|
| Domains | [count] | N/A |
| Subdomains | [count] | N/A |
| IP Addresses | [count] | [primary hosting] |
| Cloud Services | [count] | [primary cloud] |
| SaaS Applications | [count] | Various |

PIR Contribution:
| PIR | Infrastructure Contribution | Status |
|-----|----------------------------|--------|
| PIR-1 | [how infrastructure informs PIR] | [Partial/Complete/N/A] |
| PIR-2 | [how infrastructure informs PIR] | [Partial/Complete/N/A] |
| PIR-3 | [how infrastructure informs PIR] | [Partial/Complete/N/A] |
| PIR-4 | [how infrastructure informs PIR] | [Partial/Complete/N/A] |

High-Value Targets Identified:
1. [asset and why it's high-value]
2. [asset and why it's high-value]
3. [asset and why it's high-value]

Security Observations:
- [observation 1]
- [observation 2]
- [observation 3]

Handoff to Probe (Phase 3):
- Technology analysis targets: [list]
- API endpoints discovered: [list]
- Development resources: [list]
```

---

## PHASE 2 OUTPUT

```markdown
## DIGITAL INFRASTRUCTURE SUMMARY

### Domain Portfolio
- Total domains: [count]
- Primary domain: [domain]
- Notable domains: [list key ones]

### DNS Infrastructure
- Name servers: [provider]
- Subdomains discovered: [count]
- Key subdomains: [list security-relevant ones]

### Email Infrastructure
- Provider: [provider]
- Security rating: [Strong/Moderate/Weak]
- DMARC policy: [policy]

### Cloud & Hosting
- Primary cloud: [provider]
- CDN: [provider]
- SaaS footprint: [count] services

### Certificate Intelligence
- Certificates analyzed: [count]
- New domains from SANs: [count]
- Internal hostnames revealed: [Y/N]

### Security Observations
1. [Key security finding]
2. [Key security finding]
3. [Key security finding]

### Ready for Technology Analysis
Infrastructure mapping complete. Proceed to technology assessment.
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 3:

- [ ] All known domains enumerated
- [ ] DNS records analyzed
- [ ] Email infrastructure mapped
- [ ] Cloud services identified
- [ ] Certificates analyzed
- [ ] Security observations documented
- [ ] Technology targets identified for Probe

---

## MENU OPTIONS

**[C] Continue** - Proceed to technology assessment (Phase 3)
**[E] Expand** - Additional domain/infrastructure discovery
**[D] Deep Dive** - Detailed analysis of specific asset
**[V] Verify** - Validate specific findings

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-technology.md`
