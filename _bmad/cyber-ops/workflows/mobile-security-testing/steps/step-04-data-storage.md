---

name: 'step-04-data-storage'
description: 'Data storage security assessment'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/mobile-security-testing'

# File References

thisStepFile: '{workflow_path}/steps/step-04-data-storage.md'
nextStepFile: '{workflow_path}/steps/step-05-network-security.md'
outputFile: '{output_folder}/security/mobile-security-testing-{project_name}.md'

---

# Step 4: Data Storage Security

## STEP GOAL:

To assess how the app stores sensitive data locally and identify data leakage risks.

## DATA STORAGE SEQUENCE:

### 1. iOS Data Storage

"Let's examine iOS data storage:

**Storage Locations:**

| Location | Path | Sensitive Data |
|----------|------|----------------|
| Documents | /Documents/ | ? |
| Library | /Library/ | ? |
| Caches | /Library/Caches/ | ? |
| Preferences | /Library/Preferences/ | ? |
| Keychain | Secure Enclave | ? |
| CoreData | /Documents/*.sqlite | ? |

**Keychain Analysis:**
```bash
objection -g app.bundle explore
ios keychain dump
```

What data is stored locally on iOS?"

### 2. Android Data Storage

"Let's examine Android data storage:

**Storage Locations:**

| Location | Path | Sensitive Data |
|----------|------|----------------|
| SharedPrefs | /shared_prefs/ | ? |
| SQLite | /databases/ | ? |
| Internal | /files/ | ? |
| External | /sdcard/Android/data/ | ? |
| Cache | /cache/ | ? |

**Database Analysis:**
```bash
adb shell
run-as com.package.name
sqlite3 database.db
.tables
SELECT * FROM sensitive_table;
```

What data is stored locally on Android?"

### 3. Sensitive Data Categories

"Let's identify sensitive data:

**Data Classification:**

| Data Type | Found | Location | Encrypted |
|-----------|-------|----------|-----------|
| Credentials | ? | ? | ? |
| Session tokens | ? | ? | ? |
| PII (personal) | ? | ? | ? |
| Financial | ? | ? | ? |
| Health data | ? | ? | ? |
| Biometric | ? | ? | ? |
| API keys | ? | ? | ? |

What sensitive data categories are present?"

### 4. Encryption Assessment

"Let's assess data encryption:

**Encryption Status:**

| Storage | Encrypted | Key Storage | Algorithm |
|---------|-----------|-------------|-----------|
| SQLite DBs | ? | ? | ? |
| Preferences | ? | ? | ? |
| Files | ? | ? | ? |
| Keychain/Keystore | ? | N/A | ? |

**iOS Keychain:**
- Using kSecAttrAccessible appropriately?
- Biometric protection enabled?

**Android Keystore:**
- Using Android Keystore provider?
- Hardware-backed keys?

How is sensitive data encrypted?"

### 5. Backup Security

"Let's check backup exposure:

**iOS Backup:**

| Check | Status | Risk |
|-------|--------|------|
| iTunes backup | ? | Data in backup |
| iCloud backup | ? | Cloud exposure |
| Excluded from backup | ? | Best practice |

**Android Backup:**

| Check | Status | Risk |
|-------|--------|------|
| allowBackup="false" | ? | ADB backup |
| Auto-backup rules | ? | Cloud exposure |
| Encrypted backups | ? | Best practice |

Is sensitive data excluded from backups?"

### 6. Data Leakage Vectors

"Let's check data leakage:

**Leakage Vectors:**

| Vector | Vulnerable | Finding |
|--------|------------|---------|
| Clipboard | ? | ? |
| Screenshots | ? | ? |
| App switcher | ? | ? |
| Logs | ? | ? |
| Crash reports | ? | ? |
| Analytics | ? | ? |
| Third-party SDKs | ? | ? |

Are there data leakage risks?"

### 7. Document Data Storage

Update Section 4 of {outputFile}:

```markdown
## 4. Data Storage Security

### 4.1 iOS Storage Analysis

| Location | Contents | Encrypted | Risk |
|----------|----------|-----------|------|
| [User data] | | | |

**Keychain Findings:**
[Keychain analysis results]

### 4.2 Android Storage Analysis

| Location | Contents | Encrypted | Risk |
|----------|----------|-----------|------|
| [User data] | | | |

**Keystore Usage:**
[Keystore analysis results]

### 4.3 Sensitive Data Inventory

| Data Type | Storage | Encryption | Compliance |
|-----------|---------|------------|------------|
| [User data] | | | |

### 4.4 Encryption Assessment

| Storage | Algorithm | Key Management | Adequate |
|---------|-----------|----------------|----------|
| [User data] | | | |

### 4.5 Backup Security

**iOS:** [Findings]
**Android:** [Findings]

### 4.6 Data Leakage Assessment

| Vector | Finding | Severity |
|--------|---------|----------|
| [User data] | | |

### 4.7 Data Storage Findings

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]
```

### 8. Confirmation and Next Step

"**Data Storage Analysis Complete**

I've analyzed:
- Local storage locations
- Sensitive data classification
- Encryption implementation
- Backup security
- Data leakage vectors

Next, we'll assess network communication security.

Ready to proceed to network security?"

## MENU

Display: **Data Storage Complete - Select an Option:** [C] Continue to Network Security [R] Review/Revise Findings

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN data storage is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4]`, then immediately load, read entire file, then execute `{nextStepFile}`.
