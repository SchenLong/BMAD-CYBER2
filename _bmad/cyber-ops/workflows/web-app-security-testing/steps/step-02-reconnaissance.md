---
name: 'step-02-reconnaissance'
description: 'Web application reconnaissance and information gathering'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/web-app-security-testing'
thisStepFile: '{workflow_path}/steps/step-02-reconnaissance.md'
nextStepFile: '{workflow_path}/steps/step-03-authentication.md'
outputFile: '{output_folder}/security/web-app-security-testing-{project_name}.md'
---

# Step 2: Web Application Reconnaissance

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Ask questions, gather information, then document

## RECONNAISSANCE SEQUENCE:

### 1. Technology Fingerprinting

"Let's map the application's technology stack.

**Web Server & Frameworks:**
- Server headers (Apache, Nginx, IIS)?
- Application framework (React, Angular, Vue, Django, Rails)?
- Backend technology (PHP, Node.js, Java, .NET)?
- CMS or platform (WordPress, Drupal, custom)?

**What technologies have you identified or want me to probe for?"

### 2. Application Mapping

"Now let's map the attack surface.

**Endpoint Discovery:**
- Authenticated vs unauthenticated areas
- API endpoints (REST, GraphQL, SOAP)
- File upload functionality
- Admin/management interfaces
- Password reset/account recovery
- Search functionality
- User input forms

**URL Structure:**
- Parameter patterns
- Hidden directories (robots.txt, sitemap.xml)
- Backup files (.bak, .old, .swp)

What endpoints and functionality should we document?"

### 3. Authentication Mechanisms

"Let's document authentication entry points.

**Login Mechanisms:**
- Username/password forms
- OAuth/OIDC providers
- SAML/SSO integration
- API key authentication
- Certificate-based auth
- Multi-factor authentication

**Account Features:**
- Registration
- Password reset
- Account lockout behavior
- Session management

What authentication methods does the application use?"

### 4. Security Headers Analysis

"Let's check security header configuration.

**Headers to Analyze:**
- Content-Security-Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

Have you captured any header responses to review?"

### 5. Document Reconnaissance

Append to {outputFile} Section 2:

```markdown
## 2. Reconnaissance

### 2.1 Technology Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Web Server | | |
| Application Framework | | |
| Backend Language | | |
| Database | | |
| CDN/WAF | | |

### 2.2 Attack Surface
**Authenticated Areas:**
[List]

**API Endpoints:**
[List with methods]

**High-Value Targets:**
[Priority endpoints for testing]

### 2.3 Authentication Mechanisms
[Authentication types and entry points]

### 2.4 Security Headers
| Header | Value | Status |
|--------|-------|--------|
| Content-Security-Policy | | |
| X-Frame-Options | | |
| Strict-Transport-Security | | |
| X-Content-Type-Options | | |

### 2.5 Reconnaissance Notes
[Additional observations]
```

### 6. Confirmation

"**Reconnaissance Complete**

**Identified:**
- [Technology summary]
- [Endpoint count] endpoints mapped
- [Authentication types] authentication mechanisms
- [Security header status]

Ready to proceed to authentication testing?"

## MENU

Display: [C] Continue to Authentication Testing [R] Review/Add Reconnaissance Data [T] Run Additional Tooling

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2]`, then execute {nextStepFile}.
