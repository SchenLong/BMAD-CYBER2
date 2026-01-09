---

name: 'step-02-static-analysis'
description: 'Static analysis of mobile app binary'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/mobile-security-testing'

# File References

thisStepFile: '{workflow_path}/steps/step-02-static-analysis.md'
nextStepFile: '{workflow_path}/steps/step-03-dynamic-analysis.md'
outputFile: '{output_folder}/security/mobile-security-testing-{project_name}.md'

---

# Step 2: Static Analysis

## STEP GOAL:

To perform static analysis on the mobile app binary including decompilation, code review, and binary protection assessment.

## STATIC ANALYSIS SEQUENCE:

### 1. Binary Extraction

"Let's extract and analyze the app binary:

**iOS (IPA):**
- Extract from App Store (clutch/frida-ios-dump) or use provided IPA
- Unzip and examine app bundle
- Check for PIE, ARC, stack canaries

**Android (APK):**
- Download from Play Store (apkpull) or use provided APK
- Unzip and examine contents
- Analyze AndroidManifest.xml

What binary do you have for analysis?"

### 2. Decompilation

"Let's decompile the application:

**Android:**
```bash
# Decompile APK
apktool d app.apk
jadx -d output app.apk
```

**iOS:**
```bash
# Class dump
class-dump -H app.app
# Or use Hopper/Ghidra
```

**Review Areas:**
- Source code structure
- Hardcoded secrets
- API endpoints
- Crypto implementations

What did decompilation reveal?"

### 3. Hardcoded Secrets

"Let's check for hardcoded secrets:

**Search Patterns:**

| Secret Type | Pattern | Found |
|-------------|---------|-------|
| API Keys | `api[_-]?key`, `apikey` | ? |
| AWS Keys | `AKIA[A-Z0-9]` | ? |
| Private Keys | `BEGIN.*PRIVATE KEY` | ? |
| Passwords | `password`, `passwd`, `pwd` | ? |
| Tokens | `token`, `bearer`, `jwt` | ? |
| URLs | `http://`, internal domains | ? |

**Tools:**
- grep/ripgrep for patterns
- truffleHog, gitleaks
- MobSF automated scan

Any hardcoded secrets discovered?"

### 4. Binary Protections (iOS)

"Let's check iOS binary protections:

**Protection Checks:**

| Protection | Status | Risk if Missing |
|------------|--------|-----------------|
| PIE (ASLR) | ? | Memory attacks |
| ARC | ? | Memory corruption |
| Stack Canaries | ? | Buffer overflow |
| Encrypted | ? | Easy disassembly |
| Bitcode | ? | N/A |

**Command:**
```bash
otool -hv app
otool -Iv app | grep stack
```

What protections are present?"

### 5. Binary Protections (Android)

"Let's check Android protections:

**Protection Checks:**

| Protection | Status | Risk if Missing |
|------------|--------|-----------------|
| Obfuscation | ? | Easy reverse engineering |
| Root detection | ? | Tampering |
| Debuggable flag | ? | Runtime manipulation |
| Backup allowed | ? | Data extraction |
| Native libs protected | ? | Native code attacks |

**Manifest Flags:**
```xml
android:debuggable="false"
android:allowBackup="false"
```

What protections are present?"

### 6. Third-Party Libraries

"Let's identify third-party components:

**Library Analysis:**

| Library | Version | Known Vulns | License |
|---------|---------|-------------|---------|
| [Library] | [Ver] | [CVE count] | [License] |

**Tools:**
- `gradle dependencies` (Android)
- CocoaPods/SPM analysis (iOS)
- OWASP Dependency-Check
- Retire.js (for hybrid)

What libraries were identified?"

### 7. Document Static Analysis

Update Section 2 of {outputFile}:

```markdown
## 2. Static Analysis

### 2.1 Binary Information

**iOS:**
| Field | Value |
|-------|-------|
| Binary Name | |
| Architecture | |
| Min iOS | |
| Encrypted | |

**Android:**
| Field | Value |
|-------|-------|
| Package | |
| Target SDK | |
| Min SDK | |
| Signing | |

### 2.2 Hardcoded Secrets

| Secret Type | Location | Risk |
|-------------|----------|------|
| [User data] | | |

### 2.3 Binary Protections

**iOS:**
| Protection | Status | Finding |
|------------|--------|---------|
| [User data] | | |

**Android:**
| Protection | Status | Finding |
|------------|--------|---------|
| [User data] | | |

### 2.4 Third-Party Libraries

| Library | Version | Vulnerabilities |
|---------|---------|-----------------|
| [User data] | | |

### 2.5 Static Analysis Findings

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]
```

### 8. Confirmation and Next Step

"**Static Analysis Complete**

I've analyzed:
- Binary extraction and structure
- Decompiled code for secrets
- Binary protection mechanisms
- Third-party library vulnerabilities

Next, we'll perform dynamic runtime analysis.

Ready to proceed to dynamic analysis?"

## MENU

Display: **Static Analysis Complete - Select an Option:** [C] Continue to Dynamic Analysis [R] Review/Revise Findings

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN static analysis is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2]`, then immediately load, read entire file, then execute `{nextStepFile}`.
