---

name: 'step-01-init'
description: 'Initialize mobile security testing and define scope'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/mobile-security-testing'

# File References

thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-static-analysis.md'
continueStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/security/mobile-security-testing-{project_name}.md'

---

# Step 1: Mobile Security Testing Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

## CONTINUATION CHECK

Before proceeding, check if {outputFile} exists:

- IF EXISTS: Load, read entire file, and then execute {continueStepFile}
- IF NOT EXISTS: Continue with fresh testing initialization below

## INITIALIZATION SEQUENCE:

### 1. Testing Welcome

"Welcome to the Mobile Security Testing workflow. I'm Phantom, your mobile security specialist.

This comprehensive assessment covers:
- OWASP Mobile Top 10 vulnerabilities
- Platform-specific security (iOS/Android)
- Static analysis (binary, decompilation)
- Dynamic analysis (runtime, traffic)
- Data storage security
- Network communication security
- Authentication mechanisms

Let's begin by understanding your testing scope."

### 2. Platform Selection

"What mobile platform(s) are we testing?

**Platform:**
- [ ] iOS
- [ ] Android
- [ ] Cross-platform (React Native, Flutter, etc.)
- [ ] Hybrid (Cordova, Ionic)

**App Type:**
- [ ] Native application
- [ ] Hybrid application
- [ ] PWA (Progressive Web App)

Which platform(s) should we focus on?"

### 3. App Information

"Please provide app information:

**iOS App:**
- App Store URL or IPA file
- Bundle ID
- Minimum iOS version
- Jailbreak detection present?

**Android App:**
- Play Store URL or APK file
- Package name
- Target SDK version
- Root detection present?

**Additional Info:**
- Backend API endpoints
- Authentication method (OAuth, custom, biometric)
- Push notification service

What's your app information?"

### 4. Testing Environment

"Let's set up the testing environment:

**Test Devices:**

| Platform | Device | OS Version | Jailbroken/Rooted |
|----------|--------|------------|-------------------|
| iOS | [Model] | [Version] | [Yes/No] |
| Android | [Model] | [Version] | [Yes/No] |

**Tools Available:**
- [ ] Frida
- [ ] objection
- [ ] jadx/apktool
- [ ] Burp Suite/mitmproxy
- [ ] MobSF
- [ ] Ghidra/Hopper

What testing environment do you have?"

### 5. Testing Scope

"What should we focus on?

**Testing Areas:**
- [ ] Full OWASP Mobile Top 10
- [ ] Authentication/Authorization
- [ ] Data Storage
- [ ] Network Communication
- [ ] Binary Protections
- [ ] Platform-specific issues
- [ ] API Security (mobile backend)

**Constraints:**
- Time limit?
- Specific features to focus on?
- Known areas of concern?

What's your testing focus?"

### 6. Document Testing Scope

Create {outputFile} with initial structure:

```markdown
---
project_name: {project_name}
assessment_type: mobile-security-testing
stepsCompleted: [1]
created_date: {current_date}
last_updated: {current_date}
tester: {user_name}
platform: [User specified]
status: in_progress
---

# Mobile Security Testing Report: {project_name}

## 1. Testing Overview

### 1.1 Application Information

| Field | iOS | Android |
|-------|-----|---------|
| App Name | | |
| Package/Bundle ID | | |
| Version | | |
| Min OS Version | | |

### 1.2 Testing Environment

| Platform | Device | OS | Jailbroken/Rooted |
|----------|--------|----|--------------------|
| [User data] | | | |

### 1.3 Testing Scope

[User specified scope and focus areas]

### 1.4 Tools Used

[List of testing tools]

---

## 2. Static Analysis

[To be completed in Step 2]

## 3. Dynamic Analysis

[To be completed in Step 3]

## 4. Data Storage Security

[To be completed in Step 4]

## 5. Network Security

[To be completed in Step 5]

## 6. Authentication & Session

[To be completed in Step 6]

## 7. Platform-Specific Issues

[To be completed in Step 7]

## 8. Findings Summary & Remediation

[To be completed in Step 8]
```

### 7. Confirmation and Next Step

"**Testing Scope Defined**

I've documented your mobile security testing scope:
- Platform: [Summary]
- App: [Summary]
- Focus areas: [Summary]

Next, we'll perform static analysis on the app binary.

Ready to proceed to static analysis?"

## MENU

Display: **Initialization Complete - Select an Option:** [C] Continue to Static Analysis [R] Review/Revise Scope

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 1 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN scope is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
