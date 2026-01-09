---
name: 'step-01-init'
description: 'Initialize web application security testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/web-app-security-testing'
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-reconnaissance.md'
continueStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/security/web-app-security-testing-{project_name}.md'
---

# Step 1: Web Application Security Testing Initialization

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style

## CONTINUATION CHECK

IF {outputFile} exists: Load and execute {continueStepFile}
IF NOT: Continue with fresh initialization below

## INITIALIZATION SEQUENCE:

### 1. Testing Welcome

"Welcome to the Web Application Security Testing workflow. I'm Weaver, your web application security specialist.

This comprehensive assessment covers:
- OWASP Top 10 vulnerabilities
- Authentication and session management
- Injection vulnerabilities (SQL, XSS, Command)
- Access control and authorization
- Business logic flaws
- Client-side security
- API security

Let's define your testing scope."

### 2. Application Information

"Please provide application details:

**Target Application:**
- Application URL(s)
- Technology stack (frontend/backend)
- Authentication method
- API endpoints (REST/GraphQL)

**Environment:**
- Production / Staging / Development
- Test accounts provided?
- Rate limiting in place?

What's your target application?"

### 3. Testing Scope

"What should we focus on?

**Testing Areas:**
- [ ] Full OWASP Top 10
- [ ] Authentication/Authorization
- [ ] Input validation/Injection
- [ ] Session management
- [ ] Business logic
- [ ] API security
- [ ] Client-side security

**Constraints:**
- Automated scanning allowed?
- Destructive testing allowed?
- Time constraints?

What's in scope?"

### 4. Document Testing Scope

Create {outputFile}:

```markdown
---
project_name: {project_name}
assessment_type: web-app-security-testing
stepsCompleted: [1]
created_date: {current_date}
status: in_progress
---

# Web Application Security Testing: {project_name}

## 1. Testing Overview

### 1.1 Target Application
[Application details]

### 1.2 Testing Scope
[Scope definition]

### 1.3 Testing Methodology
OWASP Testing Guide v4.2

---

## 2. Reconnaissance
[Step 2]

## 3. Authentication Testing
[Step 3]

## 4. Authorization Testing
[Step 4]

## 5. Input Validation
[Step 5]

## 6. Session Management
[Step 6]

## 7. Business Logic
[Step 7]

## 8. Findings & Remediation
[Step 8]
```

### 5. Confirmation

"**Scope Defined**

Ready to proceed to reconnaissance?"

## MENU

Display: [C] Continue to Reconnaissance [R] Review/Revise Scope

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1]`, then execute {nextStepFile}.
