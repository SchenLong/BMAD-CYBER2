---

name: 'step-03-dynamic-analysis'
description: 'Dynamic runtime analysis of mobile application'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/mobile-security-testing'

# File References

thisStepFile: '{workflow_path}/steps/step-03-dynamic-analysis.md'
nextStepFile: '{workflow_path}/steps/step-04-data-storage.md'
outputFile: '{output_folder}/security/mobile-security-testing-{project_name}.md'

---

# Step 3: Dynamic Analysis

## STEP GOAL:

To perform runtime dynamic analysis including Frida hooking, traffic interception, and behavior monitoring.

## DYNAMIC ANALYSIS SEQUENCE:

### 1. Runtime Environment Setup

"Let's set up for dynamic analysis:

**iOS Setup:**
- Device jailbroken with Frida installed
- SSL Kill Switch or similar for cert pinning bypass
- Cycript for runtime exploration

**Android Setup:**
- Device rooted or use Frida gadget
- Magisk for root management
- Frida server running

**Proxy Setup:**
- Burp Suite/mitmproxy configured
- CA cert installed on device
- Traffic routing configured

What's your runtime environment status?"

### 2. Certificate Pinning Bypass

"Let's handle certificate pinning:

**iOS Bypass Methods:**

| Method | Tool | Status |
|--------|------|--------|
| SSL Kill Switch | Cydia | ? |
| Frida script | objection | ? |
| Custom hook | Frida | ? |

**Android Bypass Methods:**

| Method | Tool | Status |
|--------|------|--------|
| Network Security Config | Android 7+ | ? |
| Frida script | objection | ? |
| Xposed module | TrustMeAlready | ? |

**objection bypass:**
```bash
objection -g com.app.name explore
ios sslpinning disable
android sslpinning disable
```

Was certificate pinning bypassed?"

### 3. Method Hooking

"Let's hook critical methods:

**Common Hooks:**

```javascript
// iOS - Hook sensitive method
Interceptor.attach(ObjC.classes.ClassName['- methodName'].implementation, {
    onEnter: function(args) {
        console.log('Called with: ' + args[2]);
    },
    onLeave: function(retval) {
        console.log('Returns: ' + retval);
    }
});

// Android - Hook sensitive method
Java.perform(function() {
    var ClassName = Java.use('com.app.ClassName');
    ClassName.methodName.implementation = function(arg) {
        console.log('Called with: ' + arg);
        return this.methodName(arg);
    };
});
```

**Target Functions:**
- [ ] Authentication methods
- [ ] Crypto operations
- [ ] Root/jailbreak detection
- [ ] SSL pinning
- [ ] Token handling

What methods should we hook?"

### 4. Root/Jailbreak Detection Bypass

"Let's bypass device detection:

**Detection Bypass:**

| Detection Type | Bypass Method | Status |
|----------------|---------------|--------|
| File checks | Frida hook | ? |
| Process checks | Frida hook | ? |
| Library checks | Frida hook | ? |
| SafetyNet/Play Integrity | Magisk Hide | ? |

**objection bypass:**
```bash
android root disable
ios jailbreak disable
```

Was detection successfully bypassed?"

### 5. Traffic Analysis

"Let's analyze network traffic:

**Traffic Capture:**

| Endpoint | Method | Auth | Sensitive Data |
|----------|--------|------|----------------|
| [URL] | [GET/POST] | [Type] | [Yes/No] |

**Analysis Points:**
- [ ] HTTPS enforcement
- [ ] Certificate validation
- [ ] Sensitive data in requests
- [ ] Token handling
- [ ] API versioning
- [ ] Error message disclosure

What traffic patterns were observed?"

### 6. Runtime Behavior

"Let's observe runtime behavior:

**Behavior Analysis:**

| Behavior | Observed | Security Impact |
|----------|----------|-----------------|
| Clipboard access | ? | Data leakage |
| Screenshot prevention | ? | UI leakage |
| Background behavior | ? | Data exposure |
| Debug logging | ? | Information disclosure |
| Crash handling | ? | Stack trace leak |

**Logging Check:**
```bash
# iOS
idevicesyslog | grep AppName

# Android
adb logcat | grep -i "package.name"
```

What runtime behaviors were observed?"

### 7. Document Dynamic Analysis

Update Section 3 of {outputFile}:

```markdown
## 3. Dynamic Analysis

### 3.1 Runtime Environment

| Component | Status | Notes |
|-----------|--------|-------|
| [User data] | | |

### 3.2 Certificate Pinning

**Pinning Implemented:** [Yes/No]
**Bypass Method:** [Method used]
**Bypass Difficulty:** [Easy/Medium/Hard]

### 3.3 Method Hooking Results

| Method | Finding | Severity |
|--------|---------|----------|
| [User data] | | |

### 3.4 Detection Bypass

| Detection Type | Bypassed | Method |
|----------------|----------|--------|
| [User data] | | |

### 3.5 Traffic Analysis

| Finding | Endpoint | Severity |
|---------|----------|----------|
| [User data] | | |

### 3.6 Runtime Behavior

| Behavior | Finding | Severity |
|----------|---------|----------|
| [User data] | | |

### 3.7 Dynamic Analysis Findings

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]
```

### 8. Confirmation and Next Step

"**Dynamic Analysis Complete**

I've analyzed:
- Certificate pinning and bypass
- Method hooking for sensitive functions
- Root/jailbreak detection bypass
- Network traffic patterns
- Runtime behavior

Next, we'll assess data storage security.

Ready to proceed to data storage analysis?"

## MENU

Display: **Dynamic Analysis Complete - Select an Option:** [C] Continue to Data Storage [R] Review/Revise Findings

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN dynamic analysis is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3]`, then immediately load, read entire file, then execute `{nextStepFile}`.
