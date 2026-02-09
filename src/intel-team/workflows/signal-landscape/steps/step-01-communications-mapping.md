---
name: 'step-01-communications-mapping'
description: 'Communication platforms, device identification, encryption assessment, pattern analysis, RF opportunities'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/signal-landscape'
thisStepFile: '{workflow_path}/steps/step-01-communications-mapping.md'
nextStepFile: '{workflow_path}/steps/step-02-technical-vulnerability.md'
prevStepFile: null

# Agent Configuration
executing_agent: sigint-specialist
agent_codename: Sigil
---

# Step 1: Communications Mapping

## STEP GOAL

Map all known communication platforms, identify devices, assess encryption usage, analyze communication patterns, and identify RF emission opportunities for signals intelligence collection planning.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Sigil**, SIGINT Specialist
- You specialize in signals intelligence and electronic surveillance
- You map communication patterns and identify collection opportunities
- You assess encryption and security measures

### Analysis Protocol
- Identify all communication platforms used
- Document known devices
- Assess encryption and security posture
- Analyze communication patterns
- Identify RF collection opportunities

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Communication Platform Identification

Map all known communication platforms:

```
COMMUNICATION PLATFORM IDENTIFICATION
=====================================

Personal Communications:
| Platform | Usage Confirmed | Account ID | Encryption | Activity Level |
|----------|-----------------|------------|------------|----------------|
| SMS/Phone | [Y/N] | [number if known] | [none/carrier] | [H/M/L] |
| iMessage | [Y/N] | [identifier] | [E2E] | [activity] |
| WhatsApp | [Y/N] | [identifier] | [E2E default] | [activity] |
| Signal | [Y/N] | [identifier] | [E2E] | [activity] |
| Telegram | [Y/N] | [identifier] | [optional E2E] | [activity] |
| Email (personal) | [Y/N] | [address] | [varies] | [activity] |

Professional Communications:
| Platform | Usage Confirmed | Identifier | Encryption | Activity Level |
|----------|-----------------|------------|------------|----------------|
| Email (work) | [Y/N] | [address] | [TLS/S/MIME] | [H/M/L] |
| Slack | [Y/N] | [workspace] | [enterprise] | [activity] |
| Teams | [Y/N] | [org] | [MS 365] | [activity] |
| Zoom | [Y/N] | [ID] | [E2E option] | [activity] |
| WebEx | [Y/N] | [ID] | [enterprise] | [activity] |

Social Media Communications:
| Platform | Usage Confirmed | Profile | DM Usage | Encryption |
|----------|-----------------|---------|----------|------------|
| Twitter/X | [Y/N] | [handle] | [suspected] | [none] |
| Instagram | [Y/N] | [handle] | [suspected] | [E2E DMs] |
| LinkedIn | [Y/N] | [profile] | [suspected] | [none] |
| Facebook | [Y/N] | [profile] | [Messenger E2E opt] | [varies] |

Specialized/Alternative:
| Platform | Usage Confirmed | Purpose | Encryption | Notes |
|----------|-----------------|---------|------------|-------|
| Discord | [Y/N] | [gaming/community] | [none] | [servers] |
| Reddit | [Y/N] | [interests] | [none] | [chats] |
| Snapchat | [Y/N] | [social] | [ephemeral] | [stories] |
| TikTok | [Y/N] | [social] | [none] | [DMs] |

Platform Priority for Collection:
| Rank | Platform | Volume | Encryption Weakness | Feasibility |
|------|----------|--------|---------------------|-------------|
| 1 | [platform] | [H/M/L] | [assessment] | [H/M/L] |
| 2 | [platform] | [volume] | [weakness] | [feasibility] |
| 3 | [platform] | [volume] | [weakness] | [feasibility] |

□ Platforms identified: [count]
□ Primary platforms: [list]
□ Encrypted platforms: [count]
```

### 2. Device Identification

Document known devices:

```
DEVICE IDENTIFICATION
=====================

Mobile Devices:
| Device | Type | OS | Carrier | Number/IMEI | Encryption |
|--------|------|-----|---------|-------------|------------|
| Primary phone | [iPhone/Android] | [version] | [carrier] | [if known] | [status] |
| Secondary phone | [type] | [OS] | [carrier] | [number] | [status] |
| Tablet | [type] | [OS] | [carrier if cell] | [identifier] | [status] |
| Smartwatch | [type] | [OS] | [cell?] | [identifier] | [status] |

Computer Devices:
| Device | Type | OS | Location | Network | Encryption |
|--------|------|-----|----------|---------|------------|
| Work laptop | [make/model] | [OS] | [office/mobile] | [corporate] | [FDE?] |
| Personal laptop | [make/model] | [OS] | [home] | [home ISP] | [FDE?] |
| Work desktop | [make/model] | [OS] | [office] | [corporate] | [FDE?] |
| Home desktop | [make/model] | [OS] | [home] | [home ISP] | [FDE?] |

IoT/Smart Devices (Home):
| Device | Type | Connectivity | Data Potential | Security |
|--------|------|--------------|----------------|----------|
| Smart speakers | [Alexa/Google/etc] | [WiFi] | [audio/queries] | [H/M/L] |
| Smart TV | [brand] | [WiFi] | [viewing] | [security] |
| Smart thermostat | [brand] | [WiFi] | [presence] | [security] |
| Security cameras | [brand] | [WiFi/cell] | [video/audio] | [security] |
| Smart locks | [brand] | [connectivity] | [access] | [security] |

Vehicle Systems:
| Vehicle | Connected Services | Telematics | Data Potential |
|---------|-------------------|------------|----------------|
| [vehicle] | [OnStar/etc] | [Y/N] | [location, calls] |

Device Fingerprints (from traffic):
| Fingerprint | Likely Device | Confidence | Source |
|-------------|---------------|------------|--------|
| [user agent/signature] | [device type] | [H/M/L] | [how obtained] |

Device Summary:
| Category | Count | Primary Collection Targets |
|----------|-------|---------------------------|
| Mobile | [count] | [devices] |
| Computer | [count] | [devices] |
| IoT | [count] | [devices] |
| Vehicle | [count] | [vehicles] |

□ Devices identified: [total count]
□ Device fingerprints: [count]
□ Primary targets: [devices]
```

### 3. Encryption Assessment

Assess encryption and security posture:

```
ENCRYPTION ASSESSMENT
=====================

Platform Encryption Analysis:
| Platform | Encryption Type | Key Exchange | Metadata Exposure | Weakness |
|----------|-----------------|--------------|-------------------|----------|
| [platform] | [E2E/TLS/none] | [method] | [what's visible] | [vulnerability] |

Device Encryption Status:
| Device | Full Disk | Biometric | PIN/Password | Remote Wipe | Assessment |
|--------|-----------|-----------|--------------|-------------|------------|
| [device] | [Y/N] | [type] | [complexity] | [enabled] | [overall] |

VPN/Proxy Usage:
| Indicator | Evidence | Provider | Impact on Collection |
|-----------|----------|----------|---------------------|
| VPN detected | [how known] | [if identified] | [traffic hidden] |
| Proxy usage | [evidence] | [type] | [impact] |
| Tor usage | [evidence] | N/A | [high impact] |

Security Practices Observed:
| Practice | Observed | Confidence | Collection Impact |
|----------|----------|------------|-------------------|
| Password manager | [Y/N] | [H/M/L] | [credential difficulty] |
| 2FA usage | [Y/N] | [confidence] | [account access] |
| Security keys | [Y/N] | [confidence] | [phishing resistance] |
| Encrypted email | [Y/N] | [confidence] | [content access] |
| Encrypted cloud | [Y/N] | [confidence] | [storage access] |

Encryption Weakness Assessment:
| Weakness | Platform/Device | Exploitability | Collection Opportunity |
|----------|-----------------|----------------|----------------------|
| Metadata exposure | [platform] | [H/M/L] | [what can be collected] |
| Key escrow | [platform] | [legal access] | [opportunity] |
| Endpoint vulnerability | [device] | [exploitability] | [opportunity] |
| User behavior | [pattern] | [social eng.] | [opportunity] |

Overall Security Posture:
| Category | Rating | Key Vulnerabilities |
|----------|--------|---------------------|
| Communication security | [1-10] | [top weakness] |
| Device security | [1-10] | [top weakness] |
| Operational security | [1-10] | [top weakness] |
| **Overall** | **[1-10]** | **[summary]** |

□ Encryption mapped: [platforms/devices]
□ Weaknesses identified: [count]
□ Security rating: [overall]
```

### 4. Communication Pattern Analysis

Analyze communication patterns:

```
COMMUNICATION PATTERN ANALYSIS
==============================

Temporal Patterns:
| Time Period | Activity Level | Primary Platforms | Notes |
|-------------|---------------|-------------------|-------|
| Weekday morning | [H/M/L] | [platforms] | [patterns] |
| Weekday afternoon | [level] | [platforms] | [patterns] |
| Weekday evening | [level] | [platforms] | [patterns] |
| Weekend | [level] | [platforms] | [patterns] |
| Late night | [level] | [platforms] | [patterns] |

Peak Activity Windows:
| Rank | Time Window | Platform | Activity Type |
|------|-------------|----------|---------------|
| 1 | [time range] | [platform] | [type] |
| 2 | [time range] | [platform] | [type] |
| 3 | [time range] | [platform] | [type] |

Geographic Patterns:
| Location | Times | Platforms Used | Network |
|----------|-------|----------------|---------|
| Home | [when] | [platforms] | [home ISP] |
| Office | [when] | [platforms] | [corporate] |
| Travel | [frequency] | [platforms] | [cell/hotel] |
| Other venues | [patterns] | [platforms] | [public WiFi] |

Communication Relationships:
| Contact Type | Volume | Frequency | Platforms | Priority |
|--------------|--------|-----------|-----------|----------|
| Work colleagues | [H/M/L] | [daily/weekly] | [platforms] | [collection priority] |
| Family | [volume] | [frequency] | [platforms] | [priority] |
| Friends | [volume] | [frequency] | [platforms] | [priority] |
| Unknown/New | [volume] | [frequency] | [platforms] | [priority] |

Traffic Analysis Potential:
| Analysis Type | Feasibility | Value | Method |
|---------------|-------------|-------|--------|
| Contact mapping | [H/M/L] | [H/M/L] | [metadata analysis] |
| Frequency analysis | [feasibility] | [value] | [method] |
| Location correlation | [feasibility] | [value] | [method] |
| Timing analysis | [feasibility] | [value] | [method] |

Anomaly Indicators:
| Pattern | Normal | Anomaly Trigger | Significance |
|---------|--------|-----------------|--------------|
| Activity hours | [normal range] | [deviation] | [what it might mean] |
| Platform usage | [normal] | [change] | [significance] |
| Volume | [normal] | [spike/drop] | [significance] |
| New contacts | [normal rate] | [acceleration] | [significance] |

□ Patterns documented: [count]
□ Peak windows: [identified]
□ Anomaly triggers: [defined]
```

### 5. RF Collection Opportunities

Identify RF emission opportunities:

```
RF COLLECTION OPPORTUNITIES
===========================

Cellular Emissions:
| Device | Carrier | Frequency Bands | Cell Tower Access | IMSI Potential |
|--------|---------|-----------------|-------------------|----------------|
| [phone] | [carrier] | [bands] | [tower locations] | [H/M/L] |

WiFi Emissions:
| Location | Network Names | Encryption | Probe Requests | Collection |
|----------|---------------|------------|----------------|------------|
| Home | [SSIDs] | [WPA2/3] | [devices probing] | [feasibility] |
| Office | [SSIDs] | [enterprise] | [probing] | [feasibility] |
| Frequented venues | [SSIDs] | [varies] | [probing] | [feasibility] |

Bluetooth Emissions:
| Device | Always On | Discoverable | Beacon Tracking | Collection |
|--------|-----------|--------------|-----------------|------------|
| Phone | [Y/N] | [Y/N] | [feasibility] | [method] |
| Watch | [Y/N] | [discoverable] | [feasibility] | [method] |
| Earbuds | [Y/N] | [discoverable] | [feasibility] | [method] |

Other RF Emissions:
| Type | Device | Frequency | Range | Collection Potential |
|------|--------|-----------|-------|---------------------|
| Wireless keyboard/mouse | [if present] | [freq] | [range] | [keystroke capture] |
| Wireless display | [if present] | [freq] | [range] | [video capture] |
| Baby monitor/cameras | [if present] | [freq] | [range] | [audio/video] |
| Garage door | [if present] | [freq] | [range] | [presence] |

Collection Position Requirements:
| Target | Required Proximity | Equipment | Cover/Concealment |
|--------|-------------------|-----------|-------------------|
| Cellular | [distance] | [equipment] | [requirements] |
| WiFi | [distance] | [equipment] | [requirements] |
| Bluetooth | [distance] | [equipment] | [requirements] |
| Other | [distance] | [equipment] | [requirements] |

RF Collection Priority:
| Rank | Target | Feasibility | Value | Equipment Needed |
|------|--------|-------------|-------|------------------|
| 1 | [target] | [H/M/L] | [H/M/L] | [equipment] |
| 2 | [target] | [feasibility] | [value] | [equipment] |
| 3 | [target] | [feasibility] | [value] | [equipment] |

□ RF opportunities: [count]
□ Equipment requirements: [identified]
□ Position requirements: [documented]
```

### 6. Communications Mapping Summary

Compile communications findings:

```
COMMUNICATIONS MAPPING SUMMARY
==============================

Platform Summary:
| Category | Platforms | Primary | Encrypted | Collection Priority |
|----------|-----------|---------|-----------|---------------------|
| Personal | [count] | [main] | [count] | [H/M/L] |
| Professional | [count] | [main] | [count] | [priority] |
| Social | [count] | [main] | [count] | [priority] |

Device Summary:
| Category | Count | Primary Targets | Security Level |
|----------|-------|-----------------|----------------|
| Mobile | [count] | [devices] | [H/M/L] |
| Computer | [count] | [devices] | [level] |
| IoT | [count] | [devices] | [level] |

Encryption Posture:
| Assessment | Details |
|------------|---------|
| Overall rating | [1-10] |
| Key weakness | [description] |
| Collection impact | [assessment] |

Communication Patterns:
| Pattern | Detail |
|---------|--------|
| Peak activity | [times] |
| Primary network | [platform] |
| Key relationships | [types] |

RF Opportunities:
| Priority | Target | Method |
|----------|--------|--------|
| 1 | [target] | [collection method] |
| 2 | [target] | [method] |
| 3 | [target] | [method] |

HANDOFF TO PROBE (Step 2):
- Primary platforms: [list for technical analysis]
- Devices to assess: [list]
- Cloud services: [identified services]
- API endpoints: [if applicable]
- IoT targets: [for vulnerability assessment]
```

---

## STEP 1 OUTPUT

```markdown
## COMMUNICATIONS MAPPING COMPLETE

### Platform Summary
- Personal platforms: [count]
- Professional platforms: [count]
- Social platforms: [count]
- Encrypted platforms: [count]

### Device Summary
- Mobile devices: [count]
- Computers: [count]
- IoT devices: [count]
- Vehicles: [count]

### Security Posture
- Overall rating: [1-10]
- Encryption usage: [H/M/L]
- Key vulnerabilities: [list]

### Communication Patterns
- Peak activity: [time windows]
- Primary platform: [platform]
- Activity level: [H/M/L]

### RF Opportunities
- Cellular: [feasibility]
- WiFi: [feasibility]
- Bluetooth: [feasibility]

### Next Step
Step 2: Technical Vulnerability Assessment (Probe)
Focus: [services, protocols, APIs, cloud, IoT]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] Platforms mapped
- [ ] Devices identified
- [ ] Encryption assessed
- [ ] Patterns analyzed
- [ ] RF opportunities documented
- [ ] Handoff prepared for Probe

---

## MENU OPTIONS

**[C] Continue** - Proceed to technical vulnerability assessment (Step 2)
**[P] Platforms** - Deeper platform analysis
**[D] Devices** - Extended device investigation
**[E] Encryption** - Detailed encryption assessment

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-technical-vulnerability.md`

