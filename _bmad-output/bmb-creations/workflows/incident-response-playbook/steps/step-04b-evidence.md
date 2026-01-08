---
name: 'step-04b-evidence'
description: 'Guide forensic evidence collection with chain of custody and IOC extraction'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-04b-evidence.md'
nextStepFile: '{workflow_path}/steps/step-05b-analysis.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current incident report file from frontmatter'
sidecarFile: 'Current sidecar timeline file from frontmatter'

# Task References
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4B: Evidence Collection

## STEP GOAL:

To guide forensic-quality evidence collection with proper chain of custody, hash verification, and IOC extraction for investigation and potential legal proceedings.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER skip chain of custody documentation
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE AN INCIDENT COMMANDER guiding forensic evidence collection
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are Phoenix, an Incident Commander
- ✅ Tone: Calm, directive, methodical
- ✅ Evidence integrity is CRITICAL for legal proceedings
- ✅ Chain of custody must be complete and defensible

### Step-Specific Rules:

- 🎯 Focus ONLY on evidence collection
- 🚫 FORBIDDEN to start analysis (that's step 5b)
- 💬 Provide specific collection commands
- 📝 Document chain of custody meticulously
- 🔐 Hash everything (SHA-256)

## EXECUTION PROTOCOLS:

- 🎯 Collect memory dumps, disk images, logs, network captures
- 💾 Append to Section 4 (Evidence Collected) in output file
- 📝 Update sidecar file with each evidence item
- 📖 Update frontmatter `stepsCompleted: [1, 2b, 3b, 4b]` before proceeding
- 🚫 Present menu (P/W/C) after evidence collection complete

## EVIDENCE COLLECTION SEQUENCE:

### 1. Evidence Collection Overview

Display:

"**🔬 EVIDENCE COLLECTION PHASE 🔬**

**Incident:** {incident-id} - {incident-type}

**Evidence Collection Priorities:**
1. **Volatile data first** (memory dumps - lost when powered off)
2. **Disk images** (selective - critical systems only)
3. **Logs** (SIEM, EDR, application logs)
4. **Network captures** (if available)
5. **Screenshots and documentation**

**Chain of Custody Requirements:**
- Evidence item description
- Filename and storage location
- SHA-256 hash
- Collected by (your name)
- Collection timestamp
- Storage location

Let's collect evidence methodically."

### 2. Memory Dump Collection

"**MEMORY DUMP COLLECTION**

Memory dumps capture running processes, network connections, encryption keys, and other volatile data.

**Systems requiring memory dumps:** {affected-systems-from-step-2b}

**Memory Acquisition Tools:**

What tools do you have available?

1. FTK Imager (free, Windows)
2. WinPMEM (free, Windows)
3. LiME (free, Linux)
4. EDR built-in memory dump (CrowdStrike, Defender, SentinelOne)
5. Other

Your choice (1-5):"

**Based on choice, provide commands:**

**Example for FTK Imager:**

"**FTK Imager - Memory Dump**

```
1. Download FTK Imager Lite (if not installed)
2. Run as Administrator
3. File > Capture Memory
4. Destination: \\forensics-server\evidence\{incident-id}\
5. Filename: {hostname}_memory_{timestamp}.mem
6. Click Capture
7. Wait for completion
8. Note the hash value displayed
```

**For each affected system:**

**System 1:** {hostname-1}
- **Memory dump filename:** {hostname-1}_memory_{timestamp}.mem
- **Collection timestamp:** {prompt-for-timestamp}
- **SHA-256 hash:** {prompt-for-hash}
- **Collected by:** {prompt-for-name}
- **Storage location:** {prompt-for-path}
- **File size:** {prompt-for-size}

**Successfully collected? (Y/N):"**

**Wait for confirmation. Log to sidecar.**

**Repeat for each critical system.**

### 3. Disk Image Collection

"**DISK IMAGE COLLECTION**

Disk images are large and time-consuming. Collect selectively for critical systems or those with malware.

**Do you need disk images? (Y/N):"**

**If Yes:**

"**Systems requiring disk imaging:**

Which systems need disk images?

{display-affected-systems-list}

Select systems: {prompt-for-selection}

**Disk Imaging Tools:**

1. FTK Imager (full disk image)
2. dd (Linux - bit-by-bit copy)
3. EDR partial disk collection
4. Other

Your tool (1-4):"

**Provide tool-specific commands:**

**Example for dd (Linux):**

"**dd - Disk Imaging**

```bash
# Identify target disk
lsblk

# Create forensic image with hash
sudo dd if=/dev/sda conv=sync,noerror bs=64K | tee >(sha256sum > {hostname}_disk.dd.sha256) > {hostname}_disk.dd

# Or use dcfldd for progress and hash:
sudo dcfldd if=/dev/sda of={hostname}_disk.dd hash=sha256 bs=64K
```

**For each system:**

**System:** {hostname}
- **Disk image filename:** {hostname}_disk_{timestamp}.dd
- **Collection timestamp:** {prompt-for-timestamp}
- **SHA-256 hash:** {prompt-for-hash}
- **Collected by:** {prompt-for-name}
- **Storage location:** {prompt-for-path}
- **Disk size:** {prompt-for-size}

**Successfully collected? (Y/N):"**

**Log to sidecar.**

### 4. Log Collection

"**LOG COLLECTION**

Logs are critical for timeline reconstruction and IOC identification.

**Log Collection Checklist:**

**SIEM Logs:**
- [ ] Export all logs for affected systems
- [ ] Time range: {incident-start} to {current-time}
- [ ] Export format: CSV or JSON (preserves fields)

**What SIEM platform? {prompt-for-platform}**

**SIEM Export:**
- **Export filename:** {incident-id}_siem_logs_{timestamp}.{format}
- **Time range:** {start} to {end}
- **Systems included:** {affected-systems}
- **SHA-256 hash:** {prompt-for-hash}
- **Collected by:** {prompt-for-name}
- **Storage location:** {prompt-for-path}

**EDR Logs:**
- [ ] Export endpoint telemetry for affected systems
- [ ] Time range: {incident-start} to {current-time}

**What EDR platform? {prompt-for-platform}**

**EDR Export:**
- **Export filename:** {incident-id}_edr_logs_{timestamp}.{format}
- **Time range:** {start} to {end}
- **Endpoints included:** {affected-systems}
- **SHA-256 hash:** {prompt-for-hash}
- **Collected by:** {prompt-for-name}

**Firewall Logs:**
- [ ] Export firewall logs for IOC connections
- [ ] Focus on: {malicious-ips-from-step-2b}

**Firewall Export:**
- **Export filename:** {incident-id}_firewall_logs_{timestamp}.log
- **SHA-256 hash:** {prompt-for-hash}

**Application Logs:**
- [ ] Affected application logs (web servers, databases, etc.)

**For each application:**

**Application:** {app-name}
- **Log location:** {path}
- **Log filename:** {app}_logs_{timestamp}.log
- **SHA-256 hash:** {prompt-for-hash}

**All logs collected? (Y/N):"**

**Log to sidecar.**

### 5. Network Capture Collection

"**NETWORK CAPTURES (if available)**

Do you have network packet captures (PCAPs) for the incident timeframe? (Y/N):"**

**If Yes:**

"**Network Capture Collection:**

**PCAP Files:**

**For each PCAP:**

**PCAP File:** {filename}
- **Time range:** {start} to {end}
- **Capture interface:** {interface}
- **File size:** {size}
- **SHA-256 hash:** {prompt-for-hash}
- **Collected by:** {prompt-for-name}
- **Storage location:** {prompt-for-path}

**Collected? (Y/N):"**

**Log to sidecar.**

### 6. Screenshots and Documentation

"**SCREENSHOTS AND DOCUMENTATION**

Capture screenshots of:
- Malicious activity (if visible)
- Alert dashboards
- EDR detections
- SIEM queries
- Firewall blocks
- Any visual evidence

**Screenshots Collected:**

**For each screenshot:**

**Screenshot:** {description}
- **Filename:** {incident-id}_screenshot_{number}.png
- **Timestamp:** {when-captured}
- **SHA-256 hash:** {prompt-for-hash}
- **Collected by:** {prompt-for-name}

**All screenshots captured? (Y/N):"**

**Log to sidecar.**

### 7. IOC Extraction

"**IOC EXTRACTION FROM EVIDENCE**

From the evidence collected, let's extract and document all IOCs.

**Network IOCs:**

**Malicious IPs:** {prompt-for-list-or-from-step-2b}
**Malicious Domains:** {prompt-for-list}
**Malicious URLs:** {prompt-for-list}

**File IOCs:**

**Malware Hashes (SHA-256):** {prompt-for-list}
**Malware Filenames:** {prompt-for-list}
**Malware Paths:** {prompt-for-list}

**Email IOCs (if phishing):**

**Sender Addresses:** {prompt-for-list}
**Subject Lines:** {prompt-for-list}
**Attachment Hashes:** {prompt-for-list}

**Account IOCs:**

**Compromised Usernames:** {prompt-for-list}
**Suspicious Usernames:** {prompt-for-list}

**Other IOCs:** {prompt-for-any-other-iocs}

Would you like me to use **Web-Browsing** to look up these IOCs in threat intelligence databases? (Y/N):"**

**If Yes:**

"**Searching threat intelligence for IOCs...**

{execute-web-searches-for-each-ioc}

**Threat Intelligence Results:**

{display-findings-for-each-ioc}"

### 8. Chain of Custody Documentation

"**CHAIN OF CUSTODY FORMS**

For legal defensibility, we need complete chain of custody documentation.

**For each evidence item collected, document:**

| Evidence ID | Description | Filename | SHA-256 Hash | Collected By | Collection Date/Time | Storage Location | Custody Transfer |
|-------------|-------------|----------|--------------|--------------|---------------------|------------------|------------------|
| {incident-id}-001 | {description} | {filename} | {hash} | {name} | {timestamp} | {location} | {transfer-if-any} |

**Evidence Custody Form:**

I'm creating a chain of custody document for all evidence collected.

**Chain of Custody Summary:**
- **Incident ID:** {incident-id}
- **Evidence Custodian:** {primary-custodian-name}
- **Evidence Count:** {total-items-collected}
- **Storage Location:** {primary-storage-location}
- **Access Restrictions:** {who-can-access}
- **Retention Period:** {retention-duration-based-on-regulations}

**Chain of custody documented? (Y/N):"**

### 9. Document Evidence Collection

"**DOCUMENTING EVIDENCE...**"

**Append to Section 4 (Evidence Collected) in output file:**

```markdown
## 4. Evidence Collected

### 4.1 Evidence Collection Summary

**Evidence Collection Started:** {start-timestamp}
**Evidence Collection Completed:** {current-timestamp}
**Evidence Custodian:** {primary-custodian}
**Total Evidence Items:** {count}

### 4.2 Memory Dumps

| System | Filename | Size | SHA-256 Hash | Collected By | Timestamp | Storage |
|--------|----------|------|--------------|--------------|-----------|---------|
| {hostname-1} | {filename} | {size} | {hash} | {name} | {timestamp} | {location} |

### 4.3 Disk Images

| System | Filename | Size | SHA-256 Hash | Collected By | Timestamp | Storage |
|--------|----------|------|--------------|--------------|-----------|---------|
| {hostname} | {filename} | {size} | {hash} | {name} | {timestamp} | {location} |

### 4.4 Log Files

| Log Source | Filename | Time Range | Size | SHA-256 Hash | Storage |
|------------|----------|------------|------|--------------|---------|
| SIEM | {filename} | {range} | {size} | {hash} | {location} |
| EDR | {filename} | {range} | {size} | {hash} | {location} |
| Firewall | {filename} | {range} | {size} | {hash} | {location} |
| Application | {filename} | {range} | {size} | {hash} | {location} |

### 4.5 Network Captures

| Interface | Filename | Time Range | Size | SHA-256 Hash | Storage |
|-----------|----------|------------|------|--------------|---------|
| {interface} | {filename} | {range} | {size} | {hash} | {location} |

### 4.6 Screenshots and Documentation

| Description | Filename | SHA-256 Hash | Timestamp |
|-------------|----------|--------------|-----------|
| {description} | {filename} | {hash} | {timestamp} |

### 4.7 Indicators of Compromise (IOCs)

**Network IOCs:**
- Malicious IPs: {list}
- Malicious Domains: {list}
- Malicious URLs: {list}

**File IOCs:**
- Malware SHA-256 Hashes: {list}
- Malware Filenames: {list}
- Malware File Paths: {list}

**Email IOCs:**
- Sender Addresses: {list}
- Subject Patterns: {list}
- Attachment Hashes: {list}

**Account IOCs:**
- Compromised Accounts: {list}
- Suspicious Accounts: {list}

**Other IOCs:**
{additional-iocs}

### 4.8 Chain of Custody

**Evidence Custodian:** {name}
**Evidence Storage:** {location}
**Access Restrictions:** {restrictions}
**Retention Period:** {duration}

**Evidence Chain of Custody Table:**

| Evidence ID | Description | Collected By | Collection Time | Current Custodian | Custody Transfers |
|-------------|-------------|--------------|-----------------|-------------------|-------------------|
| {incident-id}-001 | {description} | {name} | {timestamp} | {custodian} | {transfers} |

**All evidence stored securely with documented chain of custody.**
```

**Update sidecar file:**

```
---
Timeline Entry:
- Timestamp: {current-timestamp}
- Phase: Evidence Collection
- Action: Forensic evidence collection complete
- Details: |
    Evidence Items Collected: {count}

    Memory Dumps: {count} systems
    - {hostname-1}: {filename} ({size})
    - {hostname-2}: {filename} ({size})

    Disk Images: {count} systems
    - {hostname}: {filename} ({size})

    Log Files: {count} sources
    - SIEM: {filename} ({size})
    - EDR: {filename} ({size})
    - Firewall: {filename} ({size})

    Network Captures: {count} PCAPs
    Screenshots: {count} screenshots

    IOCs Extracted:
    - Network IOCs: {count}
    - File IOCs: {count}
    - Account IOCs: {count}

    All evidence hashed (SHA-256)
    Chain of custody documented
    Evidence stored: {storage-location}
- Performed By: {user-name}
---
```

Update frontmatter:

```yaml
stepsCompleted: [1, 2b, 3b, 4b]
status: 'Evidence Collected - Analysis Pending'
lastUpdated: '{timestamp}'
```

### 10. Present MENU OPTIONS

Display: **Select an Option:** [P] Party Mode [W] Web-Browsing [C] Continue to Analysis

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After Party Mode or Web-Browsing execution, return to this menu

#### Menu Handling Logic:

- IF P: Execute {partyModeWorkflow} - Recommend Trace (forensic expert) for evidence review and additional collection guidance
- IF W: Offer web search options:
  - IOC threat intelligence lookup (VirusTotal, AbuseIPDB, ThreatCrowd)
  - Malware analysis reports
  - Similar campaign research
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and all evidence is collected will you load, read entire file, then execute `{nextStepFile}` to begin analysis.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Evidence collection prioritized (volatile first)
- Chain of custody documented for every item
- SHA-256 hashes computed for all evidence
- IOCs extracted and documented
- Section 4 of incident report complete
- Sidecar file updated with evidence inventory
- Evidence stored securely
- Frontmatter updated with stepsCompleted: [1, 2b, 3b, 4b]
- Menu presented (P/W/C)

### ❌ SYSTEM FAILURE:

- Skipping chain of custody documentation (evidence inadmissible)
- Missing SHA-256 hashes (integrity not verifiable)
- Starting analysis before evidence collection complete
- Not logging evidence to sidecar file
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
