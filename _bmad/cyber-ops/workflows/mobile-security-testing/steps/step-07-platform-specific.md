---

name: 'step-07-platform-specific'
description: 'Platform-specific security issues for iOS and Android'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/mobile-security-testing'

# File References

thisStepFile: '{workflow_path}/steps/step-07-platform-specific.md'
nextStepFile: '{workflow_path}/steps/step-08-findings-remediation.md'
outputFile: '{output_folder}/security/mobile-security-testing-{project_name}.md'

---

# Step 7: Platform-Specific Issues

## STEP GOAL:

To assess platform-specific security issues unique to iOS and Android.

## PLATFORM-SPECIFIC SEQUENCE:

### 1. iOS-Specific Security

"Let's check iOS-specific issues:

**iOS Security Checks:**

| Check | Status | Risk |
|-------|--------|------|
| URL Scheme handling | ? | Hijacking |
| Universal Links | ? | Phishing |
| Pasteboard access | ? | Data leakage |
| App Extension security | ? | Data sharing |
| Widget security | ? | Data exposure |
| App Clips | ? | Limited scope |
| Handoff/Continuity | ? | Cross-device |

**URL Scheme Analysis:**
```xml
<!-- Info.plist -->
<key>CFBundleURLTypes</key>
```

What iOS-specific issues were found?"

### 2. iOS Inter-Process Communication

"Let's check iOS IPC:

**IPC Mechanisms:**

| Mechanism | Used | Security |
|-----------|------|----------|
| URL Schemes | ? | ? |
| Universal Links | ? | ? |
| App Groups | ? | ? |
| Keychain Sharing | ? | ? |
| UIPasteboard | ? | ? |

**Vulnerabilities:**
- URL scheme collision?
- Deep link injection?
- Data leakage via pasteboard?

Are IPC mechanisms secure?"

### 3. Android-Specific Security

"Let's check Android-specific issues:

**Android Security Checks:**

| Check | Status | Risk |
|-------|--------|------|
| Exported components | ? | Unauthorized access |
| Intent filters | ? | Intent injection |
| Content providers | ? | Data exposure |
| Pending intents | ? | Intent hijacking |
| WebView security | ? | XSS/Injection |
| Deep links | ? | Link hijacking |

**Manifest Analysis:**
```xml
android:exported="true"
```

What Android-specific issues were found?"

### 4. Android Component Security

"Let's analyze Android components:

**Component Analysis:**

| Component | Exported | Protected | Risk |
|-----------|----------|-----------|------|
| Activities | ? | ? | ? |
| Services | ? | ? | ? |
| Receivers | ? | ? | ? |
| Providers | ? | ? | ? |

**Testing:**
```bash
# List exported activities
adb shell dumpsys package com.app | grep -A5 "Activity"

# Launch exported activity
adb shell am start -n com.app/.ExportedActivity
```

Are components properly protected?"

### 5. WebView Security

"Let's assess WebView security:

**WebView Checks:**

| Check | Status | Risk |
|-------|--------|------|
| JavaScript enabled | ? | XSS |
| File access | ? | Local file read |
| Mixed content | ? | MITM |
| JS interfaces | ? | Bridge exploitation |
| Cookie handling | ? | Session theft |

**iOS WKWebView:**
```swift
webView.configuration.preferences.javaScriptEnabled
```

**Android WebView:**
```java
webView.getSettings().setJavaScriptEnabled(true)
webView.addJavascriptInterface(...)
```

What WebView issues were found?"

### 6. Clipboard/Pasteboard

"Let's check clipboard security:

**Clipboard Analysis:**

| Check | Status | Finding |
|-------|--------|---------|
| Sensitive data copied | ? | ? |
| Clipboard persistence | ? | ? |
| Clipboard clearing | ? | ? |
| Universal clipboard (iOS) | ? | ? |

Are clipboard operations secure?"

### 7. Document Platform Issues

Update Section 7 of {outputFile}:

```markdown
## 7. Platform-Specific Issues

### 7.1 iOS-Specific Security

| Issue | Finding | Severity |
|-------|---------|----------|
| [User data] | | |

**URL Scheme Analysis:**
[URL scheme findings]

**IPC Security:**
[IPC findings]

### 7.2 Android-Specific Security

| Issue | Finding | Severity |
|-------|---------|----------|
| [User data] | | |

**Component Analysis:**
| Component | Exported | Protection | Risk |
|-----------|----------|------------|------|
| [User data] | | | |

### 7.3 WebView Security

**iOS WebView:**
| Check | Finding | Severity |
|-------|---------|----------|
| [User data] | | |

**Android WebView:**
| Check | Finding | Severity |
|-------|---------|----------|
| [User data] | | |

### 7.4 Clipboard Security

| Platform | Finding | Severity |
|----------|---------|----------|
| [User data] | | |

### 7.5 Platform-Specific Findings

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]
```

### 8. Confirmation and Next Step

"**Platform-Specific Analysis Complete**

I've analyzed:
- iOS-specific security issues
- iOS IPC mechanisms
- Android component security
- Android-specific vulnerabilities
- WebView security
- Clipboard/pasteboard issues

Next, we'll compile findings and create remediation.

Ready to proceed to findings summary?"

## MENU

Display: **Platform Analysis Complete - Select an Option:** [C] Continue to Findings/Remediation [R] Review/Revise Findings

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN platform analysis is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`, then immediately load, read entire file, then execute `{nextStepFile}`.
