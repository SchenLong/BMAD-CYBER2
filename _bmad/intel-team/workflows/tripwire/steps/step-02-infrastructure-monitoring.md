---
name: 'step-02-infrastructure-monitoring'
description: 'Domain change alerts, DNS modification detection, certificate changes, new subdomain discovery'
estimated_duration: '10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/tripwire'
thisStepFile: '{workflow_path}/steps/step-02-infrastructure-monitoring.md'
nextStepFile: '{workflow_path}/steps/step-03-corporate-monitoring.md'
prevStepFile: '{workflow_path}/steps/step-01-monitoring-strategy.md'

# Agent Configuration
executing_agent: domain-intel-specialist
agent_codename: Resolver
---

# Step 2: Infrastructure Monitoring

## STEP GOAL

Configure comprehensive infrastructure monitoring including domain change alerts, DNS modification detection, SSL/TLS certificate monitoring, and new subdomain discovery.

## EXECUTION TIME: ~10 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Resolver**, Domain Intelligence Specialist
- You specialize in technical infrastructure intelligence
- You configure monitoring for domain and DNS changes
- You detect infrastructure pivots and suspicious modifications

### Monitoring Protocol
- Identify all infrastructure to monitor
- Configure domain and DNS alerts
- Set up certificate monitoring
- Establish subdomain discovery
- Document detection mechanisms

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Infrastructure Inventory

Catalog infrastructure to monitor:

```
INFRASTRUCTURE INVENTORY
========================

Primary Domains:
| Domain | Registrar | Expiry | DNS Provider | Status |
|--------|-----------|--------|--------------|--------|
| [domain.com] | [registrar] | [date] | [provider] | [active] |
| [domain.org] | [registrar] | [date] | [provider] | [status] |
| [domain.net] | [registrar] | [date] | [provider] | [status] |

Subdomains Known:
| Subdomain | Purpose | IP Address | Status |
|-----------|---------|------------|--------|
| www.[domain] | Main site | [IP] | [active] |
| mail.[domain] | Email | [IP] | [active] |
| api.[domain] | API endpoint | [IP] | [active] |
| dev.[domain] | Development | [IP] | [status] |
| staging.[domain] | Staging | [IP] | [status] |

IP Address Range:
| IP/Range | Purpose | Owner | Location |
|----------|---------|-------|----------|
| [IP address] | Web server | [owner] | [geo] |
| [IP range] | Corporate | [owner] | [geo] |
| [IP address] | Cloud infra | [provider] | [geo] |

Certificate Inventory:
| Domain | Issuer | Expiry | Type | Status |
|--------|--------|--------|------|--------|
| [domain] | [Let's Encrypt/etc] | [date] | [DV/OV/EV] | [valid] |
| [subdomain] | [issuer] | [date] | [type] | [status] |

Related Domains (Similar Names):
| Domain | Relationship | Owner | Monitor? |
|--------|--------------|-------|----------|
| [typosquat] | Potential phishing | [unknown] | [Y/N] |
| [similar] | Brand confusion | [owner] | [Y/N] |

□ Primary domains: [count]
□ Subdomains: [count]
□ IP addresses: [count]
□ Certificates: [count]
□ Related domains: [count]
```

### 2. Domain Change Monitoring

Configure domain change alerts:

```
DOMAIN CHANGE MONITORING
========================

WHOIS Monitoring:
| Field | Monitor | Alert Threshold | Priority |
|-------|---------|-----------------|----------|
| Registrant | Y | Any change | P2 HIGH |
| Admin contact | Y | Any change | P3 MEDIUM |
| Tech contact | Y | Any change | P4 LOW |
| Registrar | Y | Transfer detected | P2 HIGH |
| Name servers | Y | Any change | P2 HIGH |
| Expiry date | Y | < 30 days | P3 MEDIUM |
| Status flags | Y | Any change | P3 MEDIUM |

Domain Status Alert Conditions:
| Status | Current | Alert If Changes To | Priority |
|--------|---------|---------------------|----------|
| clientDeleteProhibited | [Y/N] | Removed | P2 HIGH |
| clientTransferProhibited | [Y/N] | Removed | P2 HIGH |
| clientUpdateProhibited | [Y/N] | Removed | P3 MEDIUM |
| serverHold | [N] | Added | P1 CRITICAL |
| pendingDelete | [N] | Added | P1 CRITICAL |

Domain Expiry Alerts:
| Domain | Current Expiry | Alert Thresholds |
|--------|----------------|------------------|
| [domain] | [date] | 90, 30, 14, 7, 1 days |

New Domain Detection:
| Pattern | Monitor For | Alert Priority |
|---------|-------------|----------------|
| [company]-* | New registrations | P3 MEDIUM |
| *[company]* | Typosquatting | P2 HIGH |
| [brand]* | Brand abuse | P2 HIGH |

Monitoring Tools/Services:
| Tool | Purpose | Frequency | Cost |
|------|---------|-----------|------|
| DomainTools | WHOIS history | Real-time | $$ |
| SecurityTrails | DNS changes | Daily | $$ |
| Custom script | WHOIS polling | Hourly | Free |
| Certificate Transparency | Cert issuance | Real-time | Free |

□ WHOIS monitoring: [configured]
□ Status alerts: [set]
□ Expiry alerts: [configured]
□ New domain detection: [active]
```

### 3. DNS Modification Detection

Configure DNS change detection:

```
DNS MODIFICATION DETECTION
==========================

DNS Record Baseline:
| Domain | Record Type | Current Value | Last Changed |
|--------|-------------|---------------|--------------|
| [domain] | A | [IP address] | [date] |
| [domain] | AAAA | [IPv6] | [date] |
| [domain] | MX | [mail server] | [date] |
| [domain] | NS | [nameservers] | [date] |
| [domain] | TXT | [SPF, DKIM, etc] | [date] |
| [domain] | CNAME | [alias] | [date] |
| [domain] | SOA | [serial] | [date] |

DNS Change Alert Rules:
| Record Type | Change Type | Alert Priority | Response |
|-------------|-------------|----------------|----------|
| A | IP change | P3 MEDIUM | Verify legitimacy |
| NS | Nameserver change | P2 HIGH | Verify immediately |
| MX | Mail server change | P2 HIGH | Check for hijacking |
| TXT | SPF/DKIM change | P3 MEDIUM | Email security check |
| CNAME | Redirect change | P3 MEDIUM | Verify destination |
| New record | Any type added | P4 LOW | Document and assess |
| Deleted record | Any type removed | P3 MEDIUM | Impact assessment |

DNS Hijacking Indicators:
| Indicator | Detection Method | Priority |
|-----------|------------------|----------|
| NS pointing to unknown server | Baseline comparison | P1 CRITICAL |
| A record to unexpected IP | GeoIP + ASN check | P2 HIGH |
| MX to external unknown server | Domain reputation | P2 HIGH |
| SPF allows unexpected senders | TXT record parsing | P3 MEDIUM |
| DNSSEC removed | DNSSEC status check | P2 HIGH |

DNS Monitoring Frequency:
| Check Type | Frequency | Tool |
|------------|-----------|------|
| A record lookup | Every 15 min | Script |
| Full DNS baseline | Every 6 hours | SecurityTrails |
| DNSSEC validation | Daily | dnsviz.net |
| Propagation check | On change detected | whatsmydns.net |

Nameserver Monitoring:
| Nameserver | Provider | Status | Failover |
|------------|----------|--------|----------|
| ns1.[provider] | [provider] | [active] | [backup] |
| ns2.[provider] | [provider] | [active] | [backup] |

□ Baseline captured: [Y/N]
□ Alert rules: [count]
□ Hijacking detection: [configured]
□ Monitoring frequency: [set]
```

### 4. Certificate Monitoring

Configure SSL/TLS certificate monitoring:

```
CERTIFICATE MONITORING
======================

Certificate Transparency Log Monitoring:
| Domain | Pattern | Monitor For | Alert Priority |
|--------|---------|-------------|----------------|
| [domain] | Exact match | New certs issued | P4 LOW |
| *.[domain] | Wildcard | Subdomain certs | P4 LOW |
| [*company*] | Brand match | Phishing certs | P3 MEDIUM |

Certificate Alerts:
| Event | Priority | Description |
|-------|----------|-------------|
| New cert issued | P4 LOW | Certificate Transparency detection |
| Unexpected issuer | P3 MEDIUM | Different CA than usual |
| Short validity | P3 MEDIUM | < 30 days validity |
| Revoked | P2 HIGH | Certificate revoked |
| Expiry warning | P3 MEDIUM | < 30 days to expiry |
| Expiry imminent | P2 HIGH | < 7 days to expiry |
| Expired | P1 CRITICAL | Certificate expired |
| Misissued | P2 HIGH | Cert for domain we own, by unauthorized party |

Certificate Details to Monitor:
| Field | Current Value | Alert On Change |
|-------|---------------|-----------------|
| Issuer | [CA name] | Different issuer |
| Validity period | [dates] | Unusual duration |
| Subject | [domain] | Different domain |
| SANs | [alt names] | New or removed |
| Key type | [RSA/ECDSA] | Algorithm change |
| Key size | [2048/4096] | Size reduction |

CT Log Sources:
| Source | Coverage | Latency |
|--------|----------|---------|
| crt.sh | Comprehensive | Near real-time |
| Google CT | Google-seen certs | Real-time |
| Censys | Full internet | Hourly |

Certificate Expiry Tracking:
| Domain | Certificate | Expiry Date | Days Left | Alert |
|--------|-------------|-------------|-----------|-------|
| [domain] | [CN] | [date] | [count] | [Y/N] |

Phishing Certificate Detection:
| Pattern | Examples | Alert Priority |
|---------|----------|----------------|
| Lookalike | [company]-login.com | P2 HIGH |
| Typosquat | [cmpany].com | P2 HIGH |
| Combosquat | [company]-secure.com | P2 HIGH |
| Subdomain abuse | [company].evil.com | P3 MEDIUM |

□ CT monitoring: [configured]
□ Expiry tracking: [active]
□ Phishing detection: [enabled]
□ Alert rules: [set]
```

### 5. Subdomain Discovery

Configure continuous subdomain discovery:

```
SUBDOMAIN DISCOVERY
===================

Discovery Methods:
| Method | Tool | Frequency | Coverage |
|--------|------|-----------|----------|
| CT log parsing | crt.sh API | Daily | All certs issued |
| DNS brute force | amass/subfinder | Weekly | Common names |
| Passive DNS | SecurityTrails | Daily | Historical |
| Web scraping | Custom | Daily | Linked resources |
| DNS zone transfer | dig axfr | Daily | If permitted |

Known Subdomain Baseline:
| Subdomain | First Seen | Purpose | Status |
|-----------|------------|---------|--------|
| www | [date] | Main site | Active |
| mail | [date] | Email | Active |
| api | [date] | API | Active |
| [subdomain] | [date] | [purpose] | [status] |

New Subdomain Alert Rules:
| Discovery Source | Alert Priority | Action |
|------------------|----------------|--------|
| CT log | P4 LOW | Document, assess |
| Active scan | P3 MEDIUM | Investigate purpose |
| Third party report | P3 MEDIUM | Verify ownership |

Subdomain Classification:
| Type | Examples | Priority | Notes |
|------|----------|----------|-------|
| Production | www, api, app | Monitor | Critical services |
| Development | dev, staging, test | Watch | Potential exposures |
| Internal | vpn, internal, admin | Alert | Should not be public |
| Historical | old, legacy, archive | Low | May expose data |
| Suspicious | unknown purpose | Investigate | Verify legitimacy |

Subdomain Takeover Monitoring:
| Indicator | Check Method | Priority |
|-----------|--------------|----------|
| Dangling CNAME | DNS + HTTP check | P2 HIGH |
| Expired service | Service response | P2 HIGH |
| Unclaimed S3 bucket | AWS check | P2 HIGH |
| Unclaimed Azure blob | Azure check | P2 HIGH |
| GitHub Pages unclaimed | GitHub check | P3 MEDIUM |

Discovery Schedule:
| Task | Frequency | Automated |
|------|-----------|-----------|
| CT log check | Continuous | Yes |
| Passive DNS | Daily | Yes |
| Active enumeration | Weekly | Yes |
| Full audit | Monthly | Manual |

□ Discovery methods: [configured]
□ Baseline documented: [Y/N]
□ Alert rules: [set]
□ Takeover monitoring: [enabled]
```

### 6. Infrastructure Monitoring Summary

Compile monitoring configuration:

```
INFRASTRUCTURE MONITORING SUMMARY
=================================

Coverage:
| Asset Type | Count | Monitored | Alert Rules |
|------------|-------|-----------|-------------|
| Primary domains | [count] | [count] | [count rules] |
| Subdomains | [count] | [count] | [count rules] |
| IP addresses | [count] | [count] | [count rules] |
| Certificates | [count] | [count] | [count rules] |

Monitoring Frequency:
| Check Type | Frequency | Tool |
|------------|-----------|------|
| DNS lookup | 15 min | [tool] |
| WHOIS check | Daily | [tool] |
| CT log scan | Continuous | [tool] |
| Subdomain discovery | Daily/Weekly | [tool] |

Alert Summary:
| Priority | Alert Types | Count |
|----------|-------------|-------|
| P1 CRITICAL | [types] | [count] |
| P2 HIGH | [types] | [count] |
| P3 MEDIUM | [types] | [count] |
| P4 LOW | [types] | [count] |

Detection Capabilities:
| Threat | Detection Method | Confidence |
|--------|------------------|------------|
| Domain hijacking | NS + registrar change | High |
| DNS poisoning | Record baseline diff | High |
| Cert abuse | CT + expiry monitoring | Medium |
| Subdomain takeover | Dangling CNAME check | High |
| Typosquatting | Similar domain monitoring | Medium |

HANDOFF TO PROXY (Step 3):
- Monitored domains: [list for corporate context]
- Infrastructure ownership: [for corporate correlation]
- Alert integration: [channel configuration]
- Related entities: [for corporate registry checks]
```

---

## STEP 2 OUTPUT

```markdown
## INFRASTRUCTURE MONITORING COMPLETE

### Asset Coverage
- Primary domains: [count]
- Subdomains: [count]
- IP addresses: [count]
- Certificates: [count]

### Monitoring Configuration
- DNS checks: [frequency]
- WHOIS monitoring: [active]
- CT log scanning: [continuous]
- Subdomain discovery: [frequency]

### Alert Rules
- Domain changes: [count rules]
- DNS modifications: [count rules]
- Certificate events: [count rules]
- New subdomains: [count rules]

### Detection Capabilities
- Domain hijacking: [enabled]
- DNS changes: [enabled]
- Cert monitoring: [enabled]
- Subdomain takeover: [enabled]

### Next Step
Step 3: Corporate Registry Monitoring (Proxy)
Focus: [officer changes, filings, M&A, structure]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] Infrastructure inventory complete
- [ ] Domain monitoring configured
- [ ] DNS alerts established
- [ ] Certificate monitoring active
- [ ] Subdomain discovery running
- [ ] Handoff prepared for Proxy

---

## MENU OPTIONS

**[C] Continue** - Proceed to corporate monitoring (Step 3)
**[D] DNS** - Detailed DNS configuration
**[S] Subdomains** - Extended subdomain enumeration
**[T] Certificates** - Certificate monitoring details

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-corporate-monitoring.md`

