# Web Application Security Testing Workflow

## Overview

A comprehensive 8-step workflow for web application penetration testing following OWASP Testing Guide v4.2 and OWASP Top 10 (2021). Covers authentication, authorization, injection vulnerabilities, session management, and business logic flaws.

## Workflow Structure

```
web-app-security-testing/
├── workflow.md
├── README.md
├── steps/
│   ├── step-01-init.md
│   ├── step-01b-continue.md
│   ├── step-02-reconnaissance.md
│   ├── step-03-authentication.md
│   ├── step-04-authorization.md
│   ├── step-05-input-validation.md
│   ├── step-06-session-management.md
│   ├── step-07-business-logic.md
│   └── step-08-findings-remediation.md
└── templates/
    └── webapp-pentest-template.md
```

## Coverage

### OWASP Top 10 (2021)

- **A01: Broken Access Control** - IDOR, privilege escalation, path traversal
- **A02: Cryptographic Failures** - Weak encryption, exposed secrets
- **A03: Injection** - SQL, XSS, Command, LDAP, XML
- **A04: Insecure Design** - Business logic flaws
- **A05: Security Misconfiguration** - Headers, error handling, defaults
- **A06: Vulnerable Components** - Outdated libraries, known CVEs
- **A07: Auth Failures** - Credential attacks, session management
- **A08: Data Integrity Failures** - Deserialization, CI/CD
- **A09: Logging Failures** - Insufficient monitoring
- **A10: SSRF** - Server-Side Request Forgery

### Testing Areas

- **Reconnaissance**: Technology fingerprinting, endpoint mapping
- **Authentication**: Credential handling, MFA, OAuth/SSO
- **Authorization**: IDOR, privilege escalation, access control
- **Input Validation**: SQL injection, XSS, command injection, SSRF
- **Session Management**: Cookies, tokens, CSRF, session lifecycle
- **Business Logic**: Workflow bypass, race conditions, abuse scenarios

## Tools Supported

- Burp Suite Professional
- OWASP ZAP
- SQLMap
- Nikto
- Nuclei
- ffuf
- httpx
- Custom scripts

## Related Agents

- **Weaver** (Web App Security): Primary agent for this workflow
- **Gateway** (API Security): For API-focused testing
- **Spectre** (Pentest): For exploitation and deeper testing
- **Ghost** (Social Engineer): For phishing component testing

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial workflow |
