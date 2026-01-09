---
name: 'step-06-wireless'
description: 'Wireless network security testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/network-assessment'
thisStepFile: '{workflow_path}/steps/step-06-wireless.md'
nextStepFile: '{workflow_path}/steps/step-07-segmentation.md'
outputFile: '{output_folder}/security/network-assessment-{project_name}.md'
---

# Step 6: Wireless Security Testing

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide wireless testing if in scope

## SCOPE CHECK

"Is wireless security testing in scope for this assessment?

If NO: Select [S] to skip to segmentation testing.
If YES: Continue with wireless testing below."

## WIRELESS TESTING SEQUENCE:

### 1. Wireless Reconnaissance

"Let's discover wireless networks.

**Discovery Methods:**
- Passive scanning (monitor mode)
- Active probing
- Beacon analysis
- Hidden SSID detection

**Tools:**
```bash
# Airmon-ng for monitor mode
airmon-ng start wlan0

# Airodump for discovery
airodump-ng wlan0mon

# Kismet for comprehensive discovery
kismet
```

**Key Information:**
- SSID names
- BSSID (MAC addresses)
- Channel usage
- Encryption types
- Client associations

What wireless networks have you discovered?"

### 2. Encryption Analysis

"Let's analyze wireless encryption.

**Encryption Types:**
- **Open**: No encryption (critical)
- **WEP**: Deprecated, easily cracked
- **WPA Personal**: PSK-based, crackable
- **WPA2 Personal**: PSK-based, stronger
- **WPA2/WPA3 Enterprise**: 802.1X, certificate-based

**Weaknesses to Test:**
- WEP still in use?
- Weak WPA/WPA2 passphrases?
- WPS enabled?
- PMKID capture possible?

What encryption methods are in use?"

### 3. WPA/WPA2 Testing

"For WPA/WPA2 networks:

**Handshake Capture:**
```bash
# Capture handshake
airodump-ng -c <channel> --bssid <bssid> -w capture wlan0mon

# Deauth to force handshake (if authorized)
aireplay-ng -0 5 -a <bssid> wlan0mon
```

**PMKID Attack:**
```bash
# Capture PMKID (no client needed)
hcxdumptool -i wlan0mon -o pmkid.pcapng --enable_status=1
```

**Password Cracking:**
```bash
# Hashcat for cracking
hashcat -m 22000 capture.hc22000 wordlist.txt

# Aircrack-ng
aircrack-ng -w wordlist.txt capture.cap
```

What handshake captures or cracking attempts have you made?"

### 4. WPS Testing

"Testing Wi-Fi Protected Setup.

**WPS Vulnerabilities:**
- PIN brute force (Reaver)
- Pixie Dust attack
- WPS lockout bypass

**Commands:**
```bash
# Check for WPS
wash -i wlan0mon

# Reaver attack
reaver -i wlan0mon -b <bssid> -vv

# Pixie Dust
reaver -i wlan0mon -b <bssid> -K 1
```

Is WPS enabled on any networks?"

### 5. Rogue Access Point Detection

"Let's check for rogue APs.

**Detection Methods:**
- Unauthorized SSIDs
- MAC address analysis
- Signal strength mapping
- Corporate policy comparison

**Evil Twin Detection:**
- Duplicate SSIDs
- Different BSSIDs
- Unexpected channels

Have you identified any rogue access points?"

### 6. Enterprise Wireless (802.1X)

"For enterprise wireless environments:

**EAP Methods to Test:**
- EAP-TLS (certificate-based)
- PEAP/MSCHAPv2 (password-based)
- EAP-TTLS

**Attacks:**
- Evil twin with captive portal
- Credential harvesting
- Certificate impersonation
- RADIUS server testing

**Tools:**
- hostapd-wpe
- eaphammer
- WiFi-Pumpkin

What enterprise wireless testing have you performed?"

### 7. Client-Side Wireless Attacks

"Testing wireless client security.

**Client Vulnerabilities:**
- Probe request analysis
- KARMA attacks
- Client isolation bypass
- Captive portal bypass

**Tools:**
```bash
# Probe request capture
airodump-ng wlan0mon

# WiFi Pineapple / eaphammer
# For authorized client testing
```

What client-side testing have you done?"

### 8. Document Wireless Findings

Append to {outputFile} Section 6:

```markdown
## 6. Wireless Security Testing

### 6.1 Wireless Networks Discovered
| SSID | BSSID | Channel | Encryption | Clients | Notes |
|------|-------|---------|------------|---------|-------|
| | | | | | |

### 6.2 Encryption Analysis
| SSID | Encryption | Weakness | Risk |
|------|------------|----------|------|
| | | | |

### 6.3 WPA/WPA2 Testing
| SSID | Handshake | Cracked | Password Strength |
|------|-----------|---------|-------------------|
| | | | |

### 6.4 WPS Status
| SSID | WPS Enabled | Vulnerable | Notes |
|------|-------------|------------|-------|
| | | | |

### 6.5 Rogue Access Points
| SSID | BSSID | Reason | Risk |
|------|-------|--------|------|
| | | | |

### 6.6 Enterprise Wireless
[802.1X testing results]

### 6.7 Wireless Findings
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| WIFI-001 | | | |
```

### 9. Confirmation

"**Wireless Security Testing Complete**

**Summary:**
- Networks discovered: [count]
- Encryption weaknesses: [count]
- Credentials obtained: [count]
- Rogue APs found: [count]

Ready to proceed to segmentation testing?"

## MENU

Display: [C] Continue to Segmentation Testing [R] Review/Add Findings [S] Skip (N/A)

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then execute {nextStepFile}.
