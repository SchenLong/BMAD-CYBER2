---
name: 'step-03-infrastructure-signals'
description: 'Email server configuration, DNS leak opportunities, network topology, CDN/proxy identification'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/signal-landscape'
thisStepFile: '{workflow_path}/steps/step-03-infrastructure-signals.md'
nextStepFile: '{workflow_path}/steps/step-04-geographic-mapping.md'
prevStepFile: '{workflow_path}/steps/step-02-technical-vulnerability.md'

# Agent Configuration
executing_agent: domain-intel-specialist
agent_codename: Resolver
---

# Step 3: Infrastructure Signal Points

## STEP GOAL

Analyze target's network infrastructure to identify signal collection points including email server configurations, DNS leak opportunities, network topology, and CDN/proxy identification for interception opportunities.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Resolver**, Domain Intel Specialist
- You specialize in infrastructure analysis and domain intelligence
- You identify network collection points and traffic paths
- You assess interception opportunities at infrastructure level

### Analysis Protocol

- Analyze email server configurations
- Identify DNS leak opportunities
- Map network topology
- Identify CDN and proxy infrastructure
- Document collection points

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Email Server Configuration

Analyze email infrastructure:

```
EMAIL SERVER CONFIGURATION
==========================

MX Record Analysis:
| Domain | Priority | MX Server | IP Address | Provider |
|--------|----------|-----------|------------|----------|
| [domain] | 10 | [server] | [IP] | [provider] |
| [domain] | 20 | [server] | [IP] | [backup] |

Mail Server Details:
| Server | Software | Version | Open Relay | TLS | STARTTLS |
|--------|----------|---------|------------|-----|----------|
| [server] | [Postfix/Exchange/etc] | [version] | [Y/N] | [Y/N] | [Y/N] |

Email Security Records:
| Record Type | Configuration | Strength | Gap |
|-------------|---------------|----------|-----|
| SPF | [policy] | [strict/soft] | [weaknesses] |
| DKIM | [selector, key] | [key size] | [weaknesses] |
| DMARC | [policy] | [reject/quarantine/none] | [weaknesses] |
| MTA-STS | [policy] | [enforce/testing] | [weaknesses] |
| BIMI | [present?] | N/A | N/A |

Email Flow Analysis:
| Flow | Path | Encryption | Collection Point |
|------|------|------------|------------------|
| Inbound | Internet → MX → Mailbox | [encryption] | [opportunity] |
| Outbound | Mailbox → MTA → Internet | [encryption] | [opportunity] |
| Internal | User → User | [encryption] | [opportunity] |
| Mobile | App → Server | [encryption] | [opportunity] |

Email Provider Analysis (if hosted):
| Provider | Security Features | Admin Access | Legal Process |
|----------|-------------------|--------------|---------------|
| Google Workspace | [features] | [who] | [requirements] |
| Microsoft 365 | [features] | [who] | [requirements] |
| Protonmail | [features] | [who] | [requirements] |
| [other] | [features] | [who] | [requirements] |

Email Collection Opportunities:
| Opportunity | Method | Feasibility | Legal Requirement |
|-------------|--------|-------------|-------------------|
| Transit intercept | [where in flow] | [H/M/L] | [warrant/order] |
| Server access | [method] | [feasibility] | [requirement] |
| Account compromise | [method] | [feasibility] | [ethics] |
| Metadata only | [source] | [feasibility] | [requirement] |

Email Infrastructure Gaps:
| Gap | Risk | Collection Implication |
|-----|------|----------------------|
| [missing security] | [H/M/L] | [what's possible] |

□ Email servers analyzed: [count]
□ Security gaps: [count]
□ Collection points: [count]
```

### 2. DNS Leak Opportunities

Identify DNS intelligence opportunities:

```
DNS LEAK OPPORTUNITIES
======================

DNS Infrastructure:
| Domain | Authoritative NS | Registrar | DNSSEC |
|--------|------------------|-----------|--------|
| [domain] | [nameservers] | [registrar] | [Y/N] |

Zone Transfer Test:
| Nameserver | AXFR Status | Data Obtained |
|------------|-------------|---------------|
| [ns1] | [allowed/denied] | [records if allowed] |
| [ns2] | [status] | [data] |

DNS Record Analysis:
| Record Type | Entries | Intelligence Value |
|-------------|---------|-------------------|
| A | [count] | [infrastructure map] |
| AAAA | [count] | [IPv6 presence] |
| CNAME | [count] | [service relationships] |
| TXT | [count] | [verification records, SPF] |
| SRV | [count] | [service discovery] |
| MX | [count] | [email infrastructure] |

Subdomain Discovery:
| Subdomain | Purpose | IP/CNAME | Exposure |
|-----------|---------|----------|----------|
| mail.[domain] | Email | [IP] | [notes] |
| vpn.[domain] | VPN | [IP] | [notes] |
| dev.[domain] | Development | [IP] | [notes] |
| staging.[domain] | Staging | [IP] | [notes] |
| api.[domain] | API | [IP] | [notes] |
| [other] | [purpose] | [IP] | [notes] |

DNS Query Patterns (if observable):
| Query Type | Target | Frequency | Intelligence |
|------------|--------|-----------|--------------|
| [type] | [domain] | [pattern] | [what it reveals] |

DNS Collection Points:
| Point | Method | Feasibility | Data Obtained |
|-------|--------|-------------|---------------|
| Recursive DNS | ISP/provider access | [H/M/L] | Query history |
| Authoritative logs | Server access | [feasibility] | Zone queries |
| DNS over HTTPS | Provider access | [feasibility] | Encrypted queries |
| Passive DNS | Commercial feeds | [feasibility] | Historical data |

DNS Security Gaps:
| Gap | Implication | Collection Opportunity |
|-----|-------------|----------------------|
| No DNSSEC | Spoofing possible | [redirect attacks] |
| DNS over UDP | Query visible | [passive collection] |
| Internal DNS exposed | Network structure | [topology mapping] |

□ DNS infrastructure: [mapped]
□ Subdomains: [count discovered]
□ Collection points: [count]
```

### 3. Network Topology Analysis

Map network topology:

```
NETWORK TOPOLOGY ANALYSIS
=========================

IP Address Space:
| ASN | Organization | IP Ranges | Purpose |
|-----|--------------|-----------|---------|
| [ASN] | [org name] | [CIDRs] | [corporate/hosting] |

Routing Analysis:
| Destination | Path (ASN hops) | Bottlenecks | Collection Points |
|-------------|-----------------|-------------|-------------------|
| [main site] | [AS path] | [key hops] | [potential intercept] |
| [email] | [AS path] | [key hops] | [potential intercept] |

Network Perimeter:
| Component | IP/Range | Purpose | Exposure |
|-----------|----------|---------|----------|
| Firewall | [IP] | Perimeter | [visible?] |
| Load balancer | [IP] | Web traffic | [type] |
| VPN concentrator | [IP] | Remote access | [type] |
| Proxy | [IP] | Outbound | [type] |

Internal Network Indicators:
| Indicator | Evidence | Internal Range |
|-----------|----------|----------------|
| RFC1918 leakage | [where found] | [10.x, 172.x, 192.168.x] |
| Internal hostnames | [DNS leaks] | [naming convention] |
| Split-horizon DNS | [evidence] | [internal vs external] |

Transit Providers:
| Provider | ASN | Relationship | Collection Access |
|----------|-----|--------------|-------------------|
| [ISP 1] | [ASN] | Transit | [legal process] |
| [ISP 2] | [ASN] | Transit | [legal process] |
| [Peering] | [ASN] | Peer | [access] |

Traceroute Intelligence:
| Target | Key Hops | IXPs | Collection Potential |
|--------|----------|------|---------------------|
| [target] | [significant hops] | [exchange points] | [intercept feasibility] |

Network Collection Opportunities:
| Point | Location | Method | Feasibility |
|-------|----------|--------|-------------|
| Transit intercept | [ISP] | Legal process | [H/M/L] |
| IXP tap | [exchange] | Legal process | [feasibility] |
| Backbone access | [provider] | Legal process | [feasibility] |
| Endpoint access | [target] | [method] | [feasibility] |

□ Network mapped: [Y/N]
□ Transit providers: [count]
□ Collection points: [count]
```

### 4. CDN and Proxy Identification

Identify CDN and proxy infrastructure:

```
CDN AND PROXY IDENTIFICATION
============================

CDN Analysis:
| Service | Domains Protected | IP Ranges | Bypass Possible |
|---------|-------------------|-----------|-----------------|
| Cloudflare | [domains] | [ranges] | [origin exposed?] |
| Akamai | [domains] | [ranges] | [origin exposed?] |
| AWS CloudFront | [domains] | [ranges] | [origin exposed?] |
| Fastly | [domains] | [ranges] | [origin exposed?] |

CDN Security Features:
| Feature | CDN | Status | Collection Impact |
|---------|-----|--------|-------------------|
| WAF | [CDN] | [enabled] | [traffic filtering] |
| DDoS protection | [CDN] | [enabled] | [traffic analysis] |
| Bot detection | [CDN] | [enabled] | [automation blocked] |
| SSL/TLS | [CDN] | [termination point] | [where decrypted] |

Origin Server Discovery:
| Method | Result | Origin IP | Confidence |
|--------|--------|-----------|------------|
| Historical DNS | [checked] | [IP if found] | [H/M/L] |
| Certificate search | [checked] | [IP if found] | [confidence] |
| Subdomain scan | [checked] | [IP if found] | [confidence] |
| Email headers | [checked] | [IP if found] | [confidence] |
| Error messages | [checked] | [IP if found] | [confidence] |

Proxy Analysis:
| Proxy Type | Evidence | Purpose | Collection Impact |
|------------|----------|---------|-------------------|
| Forward proxy | [evidence] | Outbound traffic | [user attribution] |
| Reverse proxy | [evidence] | Web protection | [origin hidden] |
| VPN gateway | [evidence] | Remote access | [traffic encrypted] |
| SOCKS proxy | [evidence] | Various | [traffic routing] |

Traffic Flow Through CDN:
| Traffic Type | Path | Encryption | Collection Point |
|--------------|------|------------|------------------|
| Web requests | User → CDN → Origin | [E2E TLS?] | [CDN edge] |
| API calls | App → CDN → API | [encryption] | [CDN edge] |
| Websockets | User → CDN → Server | [encryption] | [CDN edge] |

CDN/Proxy Collection Opportunities:
| Opportunity | Method | Legal Path | Feasibility |
|-------------|--------|------------|-------------|
| CDN logs | Provider cooperation | [process] | [H/M/L] |
| Origin access | Direct connection | [method] | [feasibility] |
| Edge intercept | CDN cooperation | [process] | [feasibility] |
| Cache analysis | [method] | [access] | [feasibility] |

□ CDN identified: [Y/N]
□ Origin discovered: [Y/N]
□ Collection points: [count]
```

### 5. Traffic Interception Points

Identify potential interception points:

```
TRAFFIC INTERCEPTION POINTS
===========================

Internet Exchange Points:
| IXP | Location | Members | Collection Access |
|-----|----------|---------|-------------------|
| [IXP name] | [city] | [target's ISP?] | [legal path] |

Submarine Cables (if applicable):
| Cable | Landing Point | Operator | Collection |
|-------|---------------|----------|------------|
| [cable] | [location] | [operator] | [feasibility] |

Data Center Locations:
| Provider | Location | Purpose | Collection Access |
|----------|----------|---------|-------------------|
| [DC provider] | [city/address] | [hosting] | [legal path] |

ISP Collection Points:
| ISP | Relationship | CALEA Compliant | Collection Point |
|-----|--------------|-----------------|------------------|
| [ISP] | Transit | [Y/N] | [capability] |

Cloud Provider Points:
| Provider | Region | Service | Collection Path |
|----------|--------|---------|-----------------|
| [AWS/Azure/GCP] | [region] | [service] | [legal process] |

Interception Priority Matrix:
| Point | Data Access | Feasibility | Legal Path | Priority |
|-------|-------------|-------------|------------|----------|
| [point 1] | [what's accessible] | [H/M/L] | [requirements] | [1-10] |
| [point 2] | [data] | [feasibility] | [requirements] | [priority] |
| [point 3] | [data] | [feasibility] | [requirements] | [priority] |

Legal Process Requirements:
| Collection Type | Authority Required | Process | Timeline |
|-----------------|-------------------|---------|----------|
| Content intercept | [warrant type] | [process] | [typical time] |
| Metadata only | [authority] | [process] | [timeline] |
| Stored data | [subpoena/warrant] | [process] | [timeline] |
| Real-time | [court order] | [process] | [timeline] |

□ Interception points: [count]
□ Legal paths: [documented]
□ Priorities assigned: [Y/N]
```

### 6. Infrastructure Signals Summary

Compile infrastructure findings:

```
INFRASTRUCTURE SIGNALS SUMMARY
==============================

Email Infrastructure:
| Component | Status | Collection Opportunity |
|-----------|--------|----------------------|
| Mail servers | [count/type] | [primary method] |
| Security gaps | [count] | [what's exploitable] |
| Transit encryption | [status] | [intercept feasibility] |

DNS Intelligence:
| Component | Status | Collection Opportunity |
|-----------|--------|----------------------|
| Subdomains | [count discovered] | [infrastructure map] |
| Zone security | [DNSSEC status] | [manipulation risk] |
| Query access | [feasibility] | [pattern analysis] |

Network Topology:
| Component | Status | Collection Opportunity |
|-----------|--------|----------------------|
| Transit providers | [count] | [legal access] |
| IXP presence | [count] | [backbone access] |
| Routing paths | [mapped] | [intercept points] |

CDN/Proxy:
| Component | Status | Collection Opportunity |
|-----------|--------|----------------------|
| CDN protection | [Y/N - provider] | [edge access] |
| Origin exposure | [discovered?] | [direct access] |
| Traffic paths | [mapped] | [collection points] |

Top Infrastructure Collection Points:
| Rank | Point | Method | Data Access | Priority |
|------|-------|--------|-------------|----------|
| 1 | [point] | [method] | [data] | [H/M/L] |
| 2 | [point] | [method] | [data] | [priority] |
| 3 | [point] | [method] | [data] | [priority] |

HANDOFF TO ATLAS (Step 4):
- Physical locations: [data centers, offices, ISPs]
- Geographic spread: [countries/regions]
- Cell tower data: [carrier information]
- WiFi environments: [known networks]
- Collection positions: [for geographic planning]
```

---

## STEP 3 OUTPUT

```markdown
## INFRASTRUCTURE SIGNALS COMPLETE

### Email Infrastructure
- Mail servers: [count]
- Security gaps: [count]
- Collection feasibility: [H/M/L]

### DNS Intelligence
- Subdomains discovered: [count]
- Zone security: [status]
- Query access: [feasibility]

### Network Topology
- Transit providers: [count]
- IXPs identified: [count]
- Routing mapped: [Y/N]

### CDN/Proxy
- CDN protected: [Y/N]
- Origin exposed: [Y/N]
- Edge collection: [feasibility]

### Top Collection Points
1. [Point 1] - [method]
2. [Point 2] - [method]
3. [Point 3] - [method]

### Next Step
Step 4: Geographic Signal Mapping (Atlas)
Focus: [physical locations, cell coverage, WiFi, positions]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:

- [ ] Email infrastructure analyzed
- [ ] DNS opportunities identified
- [ ] Network topology mapped
- [ ] CDN/proxy assessed
- [ ] Interception points documented
- [ ] Handoff prepared for Atlas

---

## MENU OPTIONS

**[C] Continue** - Proceed to geographic mapping (Step 4)
**[E] Email** - Extended email analysis
**[D] DNS** - Deeper DNS investigation
**[N] Network** - Extended network mapping

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-geographic-mapping.md`
