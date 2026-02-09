---
name: 'step-03-technology'
description: 'Tech stack, code repositories, API surface, security indicators'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-org'
thisStepFile: '{workflow_path}/steps/step-03-technology.md'
nextStepFile: '{workflow_path}/steps/step-04-corporate.md'
prevStepFile: '{workflow_path}/steps/step-02-infrastructure.md'

# Agent Configuration
executing_agent: technical-researcher
agent_codename: Probe
---

# Phase 3: Technology & Security Posture

## STEP GOAL

Identify the organization's technology stack, development practices, API surface, and security indicators. This intelligence informs understanding of technical capabilities, potential vulnerabilities, and collection opportunities.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Probe**, Technical Researcher
- You specialize in technology fingerprinting and technical analysis
- You identify development practices and security posture
- You discover APIs, code repositories, and technical footprint

### Collection Protocol
- Fingerprint web technologies and frameworks
- Discover public code repositories
- Map API surfaces and documentation
- Analyze job postings for technology clues
- Assess security posture indicators

---

## COLLECTION EXECUTION SEQUENCE

### 1. Web Technology Fingerprinting

Identify technologies powering web properties:

```
WEB TECHNOLOGY FINGERPRINTING
=============================

SITE: [primary website]

Frontend Technologies:
| Technology | Version | Evidence |
|------------|---------|----------|
| JavaScript Framework | [React/Vue/Angular/etc] | [detection method] |
| CSS Framework | [Bootstrap/Tailwind/etc] | [detection method] |
| UI Library | [Material/Ant/etc] | [detection method] |

Backend Technologies:
| Technology | Version | Evidence |
|------------|---------|----------|
| Web Server | [nginx/Apache/IIS] | [headers] |
| Application Framework | [Django/Rails/etc] | [indicators] |
| Programming Language | [Python/Ruby/Node/etc] | [indicators] |

CMS/Platforms:
| Platform | Version | Evidence |
|----------|---------|----------|
| [WordPress/Drupal/etc] | [version] | [detection method] |

Third-Party Services:
| Service | Purpose | Evidence |
|---------|---------|----------|
| [Google Analytics] | Analytics | [script inclusion] |
| [Intercom] | Support | [widget] |
| [Stripe] | Payments | [integration] |
| [Auth0] | Authentication | [SDK] |
| [Other] | [purpose] | [evidence] |

[Repeat for other significant web properties]

TECHNOLOGY STACK SUMMARY:
Primary Stack: [e.g., React + Node.js + PostgreSQL]
Secondary Stack: [if different systems]
Notable Technologies: [anything unusual or security-relevant]
```

### 2. Code Repository Analysis

Search for public code repositories:

```
CODE REPOSITORY ANALYSIS
========================

GitHub Organization Search:
| Organization | Repos | Stars | Recent Activity |
|--------------|-------|-------|-----------------|
| [org name] | [count] | [total] | [last commit date] |

Notable Repositories:
| Repository | Description | Stars | Language | Security Relevance |
|------------|-------------|-------|----------|-------------------|
| [repo] | [description] | [count] | [lang] | [relevance] |

Repository Intelligence:
□ Public repositories: [count]
□ Total contributors: [count]
□ Primary languages: [list]
□ Active development: [Y/N]
□ Open issues: [count]
□ Security-relevant repos: [list]

Contributor Analysis:
| Username | Commits | Email Pattern | Real Name |
|----------|---------|---------------|-----------|
| [user] | [count] | [email if visible] | [name if visible] |

Sensitive Content Screening:
| Finding | Repository | File/Location | Risk Level |
|---------|------------|---------------|------------|
| API keys | [repo] | [file] | CRITICAL |
| Credentials | [repo] | [file] | CRITICAL |
| Internal URLs | [repo] | [file] | HIGH |
| Config files | [repo] | [file] | MEDIUM |
| Employee info | [repo] | [file] | MEDIUM |

Other Platforms:
□ GitLab: [organization name if found]
□ Bitbucket: [organization name if found]
□ SourceForge: [project if found]
□ npm/PyPI/RubyGems: [packages if found]

CODE INTELLIGENCE SUMMARY:
- Open source footprint: [Large/Moderate/Small/None]
- Development activity: [Active/Moderate/Low]
- Sensitive data exposure: [Y/N, severity]
- Key technologies revealed: [list]
```

### 3. API Surface Mapping

Discover and document API endpoints:

```
API SURFACE MAPPING
===================

Public API Discovery:
| API Name | Base URL | Documentation | Auth Type |
|----------|----------|---------------|-----------|
| [name] | [URL] | [doc URL] | [OAuth/API Key/etc] |

API Documentation Sources:
□ Public documentation: [URLs]
□ Developer portal: [URL if exists]
□ Swagger/OpenAPI: [URL if exposed]
□ GraphQL playground: [URL if exposed]

Discovered Endpoints:
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| /api/v1/users | GET | User list | Yes |
| /api/v1/[other] | [method] | [purpose] | [Y/N] |

API Intelligence:
□ API maturity: [v1, v2, etc - indicates development history]
□ Rate limiting: [observed/not observed]
□ Authentication methods: [list]
□ CORS configuration: [observations]

GraphQL Analysis (if applicable):
□ Introspection enabled: [Y/N]
□ Schema obtained: [Y/N]
□ Notable queries/mutations: [list]

WebSocket/Real-time:
□ WebSocket endpoints: [list]
□ Server-Sent Events: [list]
□ Long-polling endpoints: [list]

API SECURITY OBSERVATIONS:
- Exposed without auth: [list if any]
- Version information leaked: [observations]
- Error handling: [verbose/minimal]
- Security headers: [present/missing]
```

### 4. Job Posting Analysis

Analyze job postings for technology clues:

```
JOB POSTING ANALYSIS
====================

Current Openings Analysis:
| Position | Technologies Mentioned | Team/Department |
|----------|----------------------|-----------------|
| [title] | [tech list] | [team] |

Technology Stack Inferred:
| Technology | Evidence | Confidence |
|------------|----------|------------|
| [tech] | [which job posting] | [H/M/L] |

Security Team Indicators:
□ Security positions open: [Y/N]
□ Security team size (inferred): [estimate]
□ Security maturity indicators: [observations]

Development Practices Inferred:
□ Agile/Scrum references: [Y/N]
□ CI/CD tools mentioned: [list]
□ Cloud expertise required: [which clouds]
□ Compliance mentions: [SOC2, ISO, etc]

HIRING INTELLIGENCE:
- Growth areas: [technologies being hired for]
- Gaps indicated: [areas with many openings]
- Maturity level: [startup/growth/enterprise]
```

### 5. Security Posture Assessment

Evaluate observable security indicators:

```
SECURITY POSTURE ASSESSMENT
===========================

Web Security Headers:
| Header | Status | Value |
|--------|--------|-------|
| Content-Security-Policy | [Present/Missing] | [value] |
| X-Frame-Options | [Present/Missing] | [value] |
| X-Content-Type-Options | [Present/Missing] | [value] |
| Strict-Transport-Security | [Present/Missing] | [value] |
| X-XSS-Protection | [Present/Missing] | [value] |
| Referrer-Policy | [Present/Missing] | [value] |
| Permissions-Policy | [Present/Missing] | [value] |

TLS/SSL Assessment:
| Metric | Status |
|--------|--------|
| TLS Version | [1.2/1.3] |
| Certificate Grade | [A+/A/B/C/F] |
| Perfect Forward Secrecy | [Y/N] |
| HSTS Preload | [Y/N] |

Security Program Indicators:
□ Bug bounty program: [Y/N, platform]
□ Security.txt: [Y/N]
□ Responsible disclosure: [Y/N, contact]
□ SOC 2 mentioned: [Y/N]
□ ISO 27001 mentioned: [Y/N]
□ GDPR compliance stated: [Y/N]

Vulnerability Indicators:
| Observation | Risk Level | Notes |
|-------------|------------|-------|
| [finding] | [H/M/L] | [context] |

SECURITY RATING:
Overall Posture: [Strong/Moderate/Weak]
Key Concerns: [list top 3]
Strengths: [list notable positives]
```

### 6. Technology Intelligence Summary

Compile technology findings:

```
TECHNOLOGY INTELLIGENCE SUMMARY
===============================

Technology Profile:
| Category | Primary Technologies |
|----------|---------------------|
| Frontend | [list] |
| Backend | [list] |
| Infrastructure | [list] |
| Databases | [list] |
| Analytics | [list] |
| Security | [list] |

Development Maturity:
| Indicator | Assessment |
|-----------|------------|
| Open source presence | [Active/Moderate/None] |
| CI/CD practices | [Advanced/Basic/Unknown] |
| Security practices | [Mature/Developing/Minimal] |
| Documentation | [Comprehensive/Partial/Minimal] |

PIR Contribution:
| PIR | Technology Contribution | Status |
|-----|------------------------|--------|
| PIR-1 | [contribution] | [status] |
| PIR-2 | [contribution] | [status] |
| PIR-3 | [contribution] | [status] |
| PIR-4 | [contribution] | [status] |

High-Value Technical Findings:
1. [Most significant finding]
2. [Second most significant]
3. [Third most significant]

Handoff to Proxy (Phase 4):
- Corporate entities to investigate: [from job postings, repos]
- Key personnel leads: [from contributors, job contacts]
- Subsidiary indicators: [from multi-org repos]
```

---

## PHASE 3 OUTPUT

```markdown
## TECHNOLOGY ASSESSMENT SUMMARY

### Technology Stack
- Frontend: [primary technologies]
- Backend: [primary technologies]
- Cloud: [providers]
- Key Third-Parties: [list]

### Development Footprint
- Public repos: [count]
- Primary languages: [list]
- Development activity: [assessment]
- Sensitive exposures: [Y/N]

### API Surface
- Public APIs: [count]
- Documentation: [available/partial/none]
- Security concerns: [list if any]

### Security Posture
- Overall rating: [Strong/Moderate/Weak]
- Bug bounty: [Y/N]
- Key vulnerabilities: [list if any]
- Compliance indicators: [list]

### Key Findings
1. [Most significant]
2. [Second most significant]
3. [Third most significant]

### Ready for Corporate Analysis
Technology assessment complete. Proceed to corporate structure analysis.
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 4:
- [ ] Web technologies fingerprinted
- [ ] Code repositories analyzed
- [ ] API surface mapped
- [ ] Job postings analyzed
- [ ] Security posture assessed
- [ ] Technology profile compiled
- [ ] Corporate leads identified for Proxy

---

## MENU OPTIONS

**[C] Continue** - Proceed to corporate analysis (Phase 4)
**[R] Repository** - Deeper code repository analysis
**[A] API** - Detailed API exploration
**[S] Security** - Extended security assessment

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-corporate.md`
