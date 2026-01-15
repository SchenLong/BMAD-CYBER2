# BMAD Glossary

Definitions of terms, acronyms, and concepts used in BMAD-CYBER2.

---

## A

### Abdul
The Master Project Manager agent in the core module. Serves as the cross-module orchestrator and primary point of contact for project coordination.

### Agent
A specialized AI persona with defined expertise, capabilities, and personality. Agents are the primary units of work in BMAD, each designed for specific domains.

### AES-256-GCM
Advanced Encryption Standard with 256-bit key in Galois/Counter Mode. Used for token encryption in BMAD authentication.

### Agentic Security
Security measures designed to protect AI agents from manipulation attacks including prompt injection and jailbreaking.

### Artifact
Any output produced by a workflow or agent, such as documents, reports, or analysis results.

### Audit Log
Tamper-evident log file that records all significant operations for compliance and forensics.

---

## B

### BMAD
Build, Manage, and Deploy - The overall framework methodology.

### BMB (BMAD Module Builder)
Module for creating custom agents, workflows, and modules.

### BMGD (BMAD Game Development)
Module specialized for game development workflows.

### BMM (BMAD Methodology)
Core software development module with agents for product management, architecture, development, and testing.

---

## C

### C2 (Command and Control)
Infrastructure used by attackers to communicate with compromised systems. Term used in threat intelligence.

### CIS (Creative Innovation Suite)
Module for creative problem-solving, brainstorming, and innovation.

### Claude
Anthropic's AI model that powers BMAD agents when using the default provider.

### Compliance Framework
Regulatory standards that organizations must follow (e.g., GDPR, HIPAA, PCI-DSS, SOC2).

### Cross-Module
Operations or data exchange that span multiple BMAD modules.

### Cybersec-Team
Module containing cybersecurity specialists for security architecture, threat analysis, penetration testing, and incident response.

---

## D

### DAN (Do Anything Now)
A type of jailbreak prompt attempting to bypass AI safety guidelines.

### Data Classification
System for categorizing data by sensitivity: Public, Internal, Confidential, Restricted.

### Decision Framework
Standardized templates for making cross-module decisions with consistent criteria.

### DREAD
Threat modeling methodology: Damage, Reproducibility, Exploitability, Affected Users, Discoverability.

---

## E

### Escalation Protocol
Procedures for escalating issues across module boundaries based on severity.

### Evidence Standards
Requirements for documentation quality to support legal proceedings.

---

## F

### File Integrity
Verification system using SHA-256 hashes and GPG signatures to detect tampering with framework files.

### Fork Bomb
Malicious command that replicates itself to exhaust system resources: `:(){ :|:& };:`

---

## G

### GDPR
General Data Protection Regulation - EU privacy law requiring specific handling of personal data.

### GPG (GNU Privacy Guard)
Encryption software used for signing file integrity manifests.

### Guardrail
Security mechanism that prevents dangerous operations. Can be "soft" (prompt-based) or "hard" (code-enforced).

---

## H

### Hard Guardrail
Security validator implemented as code that executes before operations. Cannot be bypassed by prompt injection.

### Hash Chain
Cryptographic linking of log entries where each entry includes the hash of the previous entry for tamper detection.

### HIPAA
Health Insurance Portability and Accountability Act - US law governing health information privacy.

### Hook
Code that executes at specific points in tool operation (PreToolUse, SessionStart, UserPromptSubmit).

### HUMINT
Human Intelligence - Intelligence gathered through interpersonal contact.

---

## I

### IBAN
International Bank Account Number - Bank account identifier format.

### Intel-Team
Intelligence operations module with OSINT specialists, threat analysts, and field operatives.

### IOC (Indicators of Compromise)
Technical artifacts that indicate a security breach (IP addresses, domains, file hashes).

---

## J

### Jailbreak
Attempt to manipulate an AI system to bypass its safety guidelines.

### JSON Schema
Standard format for defining data structure validation rules.

---

## L

### Legal-Team
Module containing legal specialists for various jurisdictions and practice areas.

### LLM (Large Language Model)
AI models like Claude that power BMAD agents.

### Luhn Algorithm
Checksum formula used to validate credit card numbers.

---

## M

### Manifest
File containing hashes of protected files, used for integrity verification.

### MITRE ATT&CK
Framework cataloging adversary tactics and techniques.

### Module
Collection of related agents and workflows for a specific domain (e.g., cybersec-team, bmm).

### Module Override
Configuration to route a specific module's requests to a particular LLM provider.

---

## N

### NIST CSF
National Institute of Standards and Technology Cybersecurity Framework.

---

## O

### Ollama
Local LLM runtime that can be used as an alternative provider.

### OSINT
Open Source Intelligence - Intelligence gathered from publicly available sources.

### Override
Environment variable that allows bypassing a security guardrail for a single operation.

---

## P

### Party Mode
Multi-agent collaboration feature allowing specialists from different modules to work together.

### PCI-DSS
Payment Card Industry Data Security Standard.

### PII (Personally Identifiable Information)
Data that can identify an individual (SSN, names, addresses).

### Preset
Pre-configured team of agents for Party Mode, optimized for specific scenarios.

### PreToolUse
Hook point that executes before a tool operation.

### Prompt Injection
Attack attempting to manipulate AI behavior through embedded instructions.

---

## R

### RBAC (Role-Based Access Control)
Security model where permissions are assigned to roles, and roles are assigned to users.

### Role
Named set of permissions (e.g., admin, developer, security_analyst).

### RSA
Cryptographic algorithm used for GPG signing.

---

## S

### Schema
Formal definition of data structure and validation rules.

### Session
Individual interaction period with BMAD, bounded by start and end.

### SHA-256
Secure Hash Algorithm producing 256-bit hash values.

### SIGINT
Signals Intelligence - Intelligence gathered from electronic signals.

### Soft Guardrail
Security guidance embedded in agent prompts. Can potentially be bypassed by sophisticated attacks.

### SOC2
Service Organization Control 2 - Audit standard for service organizations.

### STRIDE
Threat modeling methodology: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.

### Strategy-Team
Module with strategic advisors based on historical leadership archetypes.

---

## T

### TLP (Traffic Light Protocol)
System for sharing intelligence: CLEAR, GREEN, AMBER, AMBER+STRICT, RED.

### Token
Encrypted credential containing user identity and permissions.

### Traceability
Ability to track an artifact's origin, modifications, and relationships.

---

## U

### UUID
Universally Unique Identifier - 128-bit identifier format.

---

## V

### Validator
Python script that validates operations against security rules.

### vLLM
High-performance local LLM inference engine.

---

## W

### Workflow
Structured sequence of steps to accomplish a specific task.

### War Room
Intensive Party Mode configuration for crisis response.

---

## Y

### YOLO Mode
Workflow execution mode that skips confirmations. Disabled by default for safety.

---

## Acronym Quick Reference

| Acronym | Meaning |
|---------|---------|
| AES | Advanced Encryption Standard |
| BMB | BMAD Module Builder |
| BMGD | BMAD Game Development |
| BMM | BMAD Methodology |
| C2 | Command and Control |
| CIS | Creative Innovation Suite |
| DAN | Do Anything Now |
| GDPR | General Data Protection Regulation |
| GPG | GNU Privacy Guard |
| HIPAA | Health Insurance Portability and Accountability Act |
| HUMINT | Human Intelligence |
| IBAN | International Bank Account Number |
| IOC | Indicators of Compromise |
| LLM | Large Language Model |
| NIST CSF | NIST Cybersecurity Framework |
| OSINT | Open Source Intelligence |
| PCI-DSS | Payment Card Industry Data Security Standard |
| PII | Personally Identifiable Information |
| RBAC | Role-Based Access Control |
| RSA | Rivest-Shamir-Adleman |
| SHA | Secure Hash Algorithm |
| SIGINT | Signals Intelligence |
| SOC2 | Service Organization Control 2 |
| STRIDE | Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege |
| TLP | Traffic Light Protocol |
| UUID | Universally Unique Identifier |
| YOLO | You Only Live Once |

---

## Related Documentation

- [GETTING-STARTED.md](GETTING-STARTED.md) - Initial setup
- [MODULES-OVERVIEW.md](MODULES-OVERVIEW.md) - Module descriptions
- [AGENTS-REFERENCE.md](AGENTS-REFERENCE.md) - Agent catalog
- [WORKFLOWS-REFERENCE.md](WORKFLOWS-REFERENCE.md) - Workflow reference
- [SECURITY-OVERVIEW.md](SECURITY-OVERVIEW.md) - Security architecture
