---
name: 'step-05-input-validation'
description: 'Input validation and injection vulnerability testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/web-app-security-testing'
thisStepFile: '{workflow_path}/steps/step-05-input-validation.md'
nextStepFile: '{workflow_path}/steps/step-06-session-management.md'
outputFile: '{output_folder}/security/web-app-security-testing-{project_name}.md'
---

# Step 5: Input Validation Testing

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide injection testing methodically

## INPUT VALIDATION TESTING SEQUENCE:

### 1. SQL Injection Testing

"Let's test for SQL injection vulnerabilities.

**Common Injection Points:**
- Search fields
- Login forms
- URL parameters
- Hidden form fields
- Cookie values
- HTTP headers

**Basic Detection:**
- Single quote: `'`
- Boolean tests: `' OR '1'='1`
- Error-based: `' AND 1=CONVERT(int,@@version)--`
- Time-based: `' WAITFOR DELAY '0:0:5'--`
- UNION: `' UNION SELECT NULL,NULL--`

**Tools Suggested:**
- sqlmap for automated testing
- Burp Suite Intruder

What SQL injection testing have you performed?"

### 2. Cross-Site Scripting (XSS)

"Now let's test for XSS vulnerabilities.

**XSS Types:**
- **Reflected**: Input immediately reflected in response
- **Stored**: Input stored and displayed later
- **DOM-based**: Client-side JavaScript manipulation

**Test Payloads:**
- Basic: `<script>alert(1)</script>`
- Event handlers: `<img src=x onerror=alert(1)>`
- SVG: `<svg onload=alert(1)>`
- Encoded: `%3Cscript%3Ealert(1)%3C/script%3E`

**Injection Points:**
- Form fields
- URL parameters
- User-generated content
- File names
- Error messages with user input

What XSS vulnerabilities have you discovered?"

### 3. Command Injection

"Testing for OS command injection.

**High-Risk Functions:**
- File operations
- Image processing
- PDF generation
- System utilities
- Backup/export functions

**Test Payloads:**
- Semicolon: `; whoami`
- Pipe: `| id`
- Backticks: `` `id` ``
- Newline: `%0a id`
- Command substitution: `$(whoami)`

**Detection:**
- Time-based: `; sleep 5`
- Out-of-band: DNS/HTTP callbacks

What command injection testing have you done?"

### 4. Server-Side Request Forgery (SSRF)

"Let's check for SSRF vulnerabilities.

**SSRF Indicators:**
- URL parameters for fetching content
- Webhook configurations
- PDF/image generators from URLs
- Import from URL features

**Test Targets:**
- Internal IPs: `http://127.0.0.1`
- Cloud metadata: `http://169.254.169.254/`
- Internal services: `http://localhost:8080`
- File protocol: `file:///etc/passwd`

**Bypass Techniques:**
- URL encoding
- Redirect chains
- DNS rebinding
- IPv6 addresses

What SSRF testing results do you have?"

### 5. XML/XXE Testing

"For applications processing XML:

**XXE Payloads:**
```xml
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM \"file:///etc/passwd\">
]>
<root>&xxe;</root>
```

**Blind XXE:**
- Out-of-band data exfiltration
- Error-based extraction

**SVG XXE:**
- Image upload accepting SVG files

Have you tested any XML processing endpoints?"

### 6. Template Injection

"Testing for server-side template injection.

**Detection Payloads:**
- `{{7*7}}` → 49
- `${7*7}` → 49
- `<%= 7*7 %>` → 49
- `#{7*7}` → 49

**Common Frameworks:**
- Jinja2: `{{config}}`
- Twig: `{{_self.env}}`
- Freemarker: `${object.class}`

What template injection testing have you performed?"

### 7. Document Input Validation Findings

Append to {outputFile} Section 5:

```markdown
## 5. Input Validation Testing

### 5.1 SQL Injection
| Parameter | Location | Payload | Result | Severity |
|-----------|----------|---------|--------|----------|
| | | | | |

### 5.2 Cross-Site Scripting
| Type | Location | Payload | Context | Severity |
|------|----------|---------|---------|----------|
| Reflected | | | | |
| Stored | | | | |
| DOM | | | | |

### 5.3 Command Injection
| Endpoint | Parameter | Payload | Result |
|----------|-----------|---------|--------|
| | | | |

### 5.4 SSRF
| Feature | Target | Result | Impact |
|---------|--------|--------|--------|
| | | | |

### 5.5 XXE
[XML processing findings]

### 5.6 Template Injection
[SSTI findings]

### 5.7 Input Validation Findings
| ID | Vulnerability | Type | Severity | Status |
|----|---------------|------|----------|--------|
| INJ-001 | | | | |
```

### 8. Confirmation

"**Input Validation Testing Complete**

**Findings:**
- SQL Injection: [Count]
- XSS: [Count]
- Command Injection: [Count]
- SSRF: [Count]
- Other: [Count]

Highest severity finding: [Finding description]

Ready to proceed to session management testing?"

## MENU

Display: [C] Continue to Session Management [R] Review/Add Injection Findings [E] Exploit Specific Finding

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5]`, then execute {nextStepFile}.
