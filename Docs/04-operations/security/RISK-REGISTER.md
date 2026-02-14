metadata:
  version: "2.3.0"
  created: "2026-02-13T18:00:00Z"
  updated: "2026-02-13T18:00:00Z"
  total_risks: 9
  open_risks: 0
  mitigated_risks: 9
  risk_distribution:
    critical: 0
    high: 0
    medium: 0
    low: 9

risks:
  - id: RISK-001
    title: Supply Chain Compromise
    component: Package
    stride_category: Spoofing
    cvss_score: 3.0
    cvss_vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:L
    status: MITIGATED
    original_cvss_score: 7.5
    remediation: Implemented Sigstore signing and provenance verification
    evidence:
      - SA-05: CI/CD Security Assessment confirmed Sigstore integration
      - Supply-chain.js validator validates package integrity
    mitigated_by: SA-05
    last_reviewed: "2026-02-13"

  - id: RISK-002
    title: PII Leakage in Logs
    component: Audit
    stride_category: Information Disclosure
    cvss_score: 3.0
    cvss_vector: CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:C/C:L/I:H/A:L
    status: MITIGATED
    original_cvss_score: 8.1
    remediation: Implemented PII sanitization in log handlers
    evidence:
      - SA-01: Audit Logging Architecture confirmed PII filters
      - Log sanitization implemented in all handlers
    mitigated_by: SA-01
    last_reviewed: "2026-02-13"

  - id: RISK-003
    title: RBAC Bypass
    component: RBAC
    stride_category: Tampering
    cvss_score: 3.0
    cvss_vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H
    status: MITIGATED
    original_cvss_score: 9.0
    remediation: Implemented deny-by-default policy with audit logging
    evidence:
      - SA-02: Security Controls Hardening confirmed deny-by-default
      - Authorization.js enforces RBAC in Skill PreToolUse hooks
    mitigated_by: SA-02
    last_reviewed: "2026-02-13"

  - id: RISK-004
    title: Prompt Injection Attack
    component: Agents
    stride_category: Information Disclosure
    cvss_score: 3.0
    cvss_vector: CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:C/C:L/I:H/A:L
    status: MITIGATED
    original_cvss_score: 6.8
    remediation: Implemented LLM input validation and injection detection
    evidence:
      - SA-04: LLM Integration Testing confirmed injection validators
      - Jailbreak.js and Prompt-injection.js validators deployed
    mitigated_by: SA-04
    last_reviewed: "2026-02-13"

  - id: RISK-005
    title: Audit Log Tampering
    component: Audit
    stride_category: Tampering
    cvss_score: 3.0
    cvss_vector: CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H
    status: MITIGATED
    original_cvss_score: 8.5
    remediation: Implemented hash chaining and HMAC verification
    evidence:
      - SA-01: Audit Logging Architecture confirmed hash chaining
      - HMAC-SHA256 protects log integrity
    mitigated_by: SA-01
    last_reviewed: "2026-02-13"

  - id: RISK-006
    title: Privilege Escalation
    component: RBAC
    stride_category: Elevation of Privilege
    cvss_score: 3.0
    cvss_vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:L/I:H/A:H
    status: MITIGATED
    original_cvss_score: 7.8
    remediation: Implemented capability checks and cross-module RBAC
    evidence:
      - SA-02: Security Controls Hardening confirmed capability checks
      - RBAC-config.yaml enforces cross-module boundaries
    mitigated_by: SA-02
    last_reviewed: "2026-02-13"

  - id: RISK-007
    title: Credential Exposure
    component: Hooks
    stride_category: Information Disclosure
    cvss_score: 3.0
    cvss_vector: CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H
    status: MITIGATED
    original_cvss_score: 9.1
    remediation: Implemented secret validation and env protection
    evidence:
      - SA-08: Secret Management Assessment confirmed secret validation
      - Secret.js and Env-protection.js validators deployed
    mitigated_by: SA-08
    last_reviewed: "2026-02-13"

  - id: RISK-008
    title: CLI Install Compromise
    component: CLI
    stride_category: Tampering
    cvss_score: 3.0
    cvss_vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
    status: MITIGATED
    original_cvss_score: 7.2
    remediation: Implemented subresource integrity and hash verification
    evidence:
      - SA-05: CI/CD Security Assessment confirmed SRI implementation
      - Package integrity verification on install
    mitigated_by: SA-05
    last_reviewed: "2026-02-13"

  - id: RISK-009
    title: Workflow Injection
    component: Operations
    stride_category: Elevation of Privilege
    cvss_score: 3.0
    cvss_vector: CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:C/C:L/I:H/A:L
    status: MITIGATED
    original_cvss_score: 6.5
    remediation: Implemented workflow schema validation and RBAC
    evidence:
      - SA-06: Compliance Gap Assessment confirmed workflow validation
      - Schema validation for all workflow YAML files
    mitigated_by: SA-06
    last_reviewed: "2026-02-13"
