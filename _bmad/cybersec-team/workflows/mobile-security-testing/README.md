# Mobile Security Testing Workflow

## Overview

A comprehensive 8-step workflow for mobile application security testing covering iOS and Android platforms following OWASP Mobile Testing Guide (MSTG) and Mobile Top 10.

## Workflow Structure

```
mobile-security-testing/
├── workflow.md
├── README.md
├── steps/
│   ├── step-01-init.md
│   ├── step-01b-continue.md
│   ├── step-02-static-analysis.md
│   ├── step-03-dynamic-analysis.md
│   ├── step-04-data-storage.md
│   ├── step-05-network-security.md
│   ├── step-06-authentication.md
│   ├── step-07-platform-specific.md
│   └── step-08-findings-remediation.md
└── templates/
    └── mobile-pentest-template.md
```

## Coverage

- **Static Analysis**: Binary protections, hardcoded secrets, decompilation
- **Dynamic Analysis**: Runtime hooking, cert pinning bypass, traffic interception
- **Data Storage**: Keychain/Keystore, local databases, encryption
- **Network**: TLS, certificate pinning, API security
- **Authentication**: Biometrics, sessions, authorization
- **Platform-Specific**: iOS/Android unique vulnerabilities

## Tools Supported

- Frida, objection
- jadx, apktool, class-dump
- Burp Suite, mitmproxy
- MobSF
- Ghidra, Hopper

## Related Agents

- **Phantom** (Mobile Security): Primary agent
- **Weaver** (Web App): Hybrid app testing
- **Gateway** (API): Mobile API security

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial workflow |
