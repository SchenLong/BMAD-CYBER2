# BMAD-CYBER Installation Flow Analysis

## Current State vs Ideal State Comparison

---

## 🔴 ACTUAL INSTALLATION FLOW (Current State)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CURRENT INSTALLATION PROCESS                         │
│                        (What Users Experience Today)                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ 1. CLONE REPOSITORY  │
│    git clone ...     │
│    cd BMAD-CYBER2    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 2. NPM INSTALL       │
│    npm install       │
│                      │
│ ┌──────────────────┐ │
│ │ postinstall hook │ │
│ │ runs npm build   │ │
│ └──────────────────┘ │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 3. MANUAL TOKEN GEN  │
│                      │
│ node _bmad/core/     │
│   security/          │
│   generate-token.js  │
│                      │
│ ┌──────────────────┐ │
│ │ Prompts:         │ │
│ │ • Name (req)     │ │
│ │ • Email (opt)    │ │
│ │ • Role (select)  │ │
│ │ • Validity (hrs) │ │
│ └──────────────────┘ │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 4. SET ENVIRONMENT   │
│                      │
│ export BMAD_AUTH_    │
│   TOKEN="<token>"    │
│                      │
│ (or add to .bashrc)  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│ 5. READY TO USE                              │
│                                              │
│ ⚠️  ALL MODULES PRE-INSTALLED (from git)     │
│                                              │
│ Available modules (no selection offered):    │
│ ├── core (always loaded)                     │
│ ├── intel-team (11 agents)                   │
│ ├── cybersec-team (15 agents)                │
│ ├── legal-team (11 agents)                   │
│ ├── strategy-team (14 agents)                │
│ ├── bmm (product development)                │
│ ├── bmgd (game development)                  │
│ ├── bmb (module builder)                     │
│ └── cis (compliance & standards)             │
└──────────────────────────────────────────────┘
```

### What's Missing in Current Flow:

| Step | Missing Feature | Impact |
|------|-----------------|--------|
| 1 | No integrity verification prompt | Users may skip GPG verification |
| 2 | No interactive module selection | All modules installed by default |
| 2 | No LLM configuration wizard | Users must manually configure |
| 2 | No PGP key generation | No user-specific signing capability |
| 2 | No security module selection | All security features bundled |
| 3 | Token gen is separate step | Not part of unified installer |
| 4 | Manual env setup | Error-prone, no persistence |
| - | No progress visualization | Users don't see what's happening |
| - | No health check at end | No verification of success |

---

## 🟢 IDEAL INSTALLATION FLOW (Proposed)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IDEAL INSTALLATION PROCESS                          │
│                    (What Users Should Experience)                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ 1. NPM GLOBAL INSTALL│
│                      │
│ npm install -g       │
│   @bmad/cli          │
│                      │
│ (or npx @bmad/cli)   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 2. INITIALIZATION COMMAND                                                    │
│                                                                              │
│    bmad init                                                                 │
│    (or: npx @bmad/cli init)                                                  │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 3. WELCOME & VERIFICATION                                                    │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │  ╭─────────────────────────────────────────────────────────────────────╮ │ │
│ │  │                                                                     │ │ │
│ │  │    ██████╗██╗   ██╗██████╗ ███████╗██████╗                          │ │ │
│ │  │   ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗                         │ │ │
│ │  │   ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝                         │ │ │
│ │  │   ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗                         │ │ │
│ │  │   ╚██████╗   ██║   ██████╔╝███████╗██║  ██║                         │ │ │
│ │  │    ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝                         │ │ │
│ │  │                                                                     │ │ │
│ │  │   Operations Framework                                              │ │ │
│ │  │                                                                     │ │ │
│ │  │   Welcome to BMAD-CYBER! Let's set up your environment.             │ │ │
│ │  │                                                                     │ │ │
│ │  ╰─────────────────────────────────────────────────────────────────────╯ │ │
│ │                                                                          │ │
│ │  ◉ Verifying package signature...                                        │ │
│ │    ✓ GPG signature valid (Key: 5528FA32356DA698)                         │ │
│ │    ✓ SHA-256 checksums verified (247 files)                              │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 4. USER PROFILE SETUP                                                        │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                          │ │
│ │  ? What is your name? ____________________________                       │ │
│ │                                                                          │ │
│ │  ? What is your email? (optional) ____________________________           │ │
│ │                                                                          │ │
│ │  ? What is your primary role?                                            │ │
│ │    ● Admin (default) ◄────────────────────────────────────────────────── │ │
│ │    ○ Security Lead                                                       │ │
│ │    ○ Security Analyst                                                    │ │
│ │    ○ Intelligence Analyst                                                │ │
│ │    ○ Developer                                                           │ │
│ │    ○ Product Manager                                                     │ │
│ │    ○ Viewer                                                              │ │
│ │                                                                          │ │
│ │  ? Organization/Team (optional) ____________________________             │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 5. MODULE SELECTION                                                          │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                          │ │
│ │  Select modules to install (space to toggle, enter to confirm):          │ │
│ │                                                                          │ │
│ │  REQUIRED:                                                               │ │
│ │  ☑ core           BMAD Core Framework (always installed)                 │ │
│ │                                                                          │ │
│ │  RECOMMENDED FOR YOUR ROLE (Admin):                                      │ │
│ │  ☑ cybersec-team  Cybersecurity Operations (15 agents)                   │ │
│ │  ☑ intel-team     Intelligence Operations (11 agents)                    │ │
│ │                                                                          │ │
│ │  OPTIONAL:                                                               │ │
│ │  ☐ legal-team     Legal Advisory Team (11 agents)                        │ │
│ │  ☐ strategy-team  Strategic Advisory (14 agents)                         │ │
│ │  ☐ bmm            Product Development & Agile Workflows                  │ │
│ │  ☐ cis            Compliance & Standards (OWASP, GDPR, SOC2...)          │ │
│ │  ☐ bmgd           Game Development & Design Tools                        │ │
│ │  ☐ bmb            Module Builder Tools                                   │ │
│ │                                                                          │ │
│ │  ─────────────────────────────────────────────────────────────────────── │ │
│ │  Selected: 3 modules | Estimated size: ~3.1 MB | Agents: 27              │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 5b. SECURITY MODULES SELECTION                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                          │ │
│ │  Select security features (space to toggle, enter to confirm):           │ │
│ │                                                                          │ │
│ │  ESSENTIAL (Recommended):                                                │ │
│ │  ☑ Authentication & Authorization    Token-based auth, session mgmt      │ │
│ │  ☑ Security Validators               6 guards (bash, secrets, PII...)    │ │
│ │                                                                          │ │
│ │  STANDARD:                                                               │ │
│ │  ☑ Audit Logging                     Activity tracking, compliance logs  │ │
│ │  ☑ Session Hooks                     Security event handlers             │ │
│ │                                                                          │ │
│ │  ADVANCED:                                                               │ │
│ │  ☐ AI Safety Guards                  Prompt injection, jailbreak detect  │ │
│ │  ☐ Observability & Telemetry         Anomaly detection, confidence       │ │
│ │  ☐ Resource Management               Rate limiting, memory/CPU limits    │ │
│ │                                                                          │ │
│ │  ENTERPRISE:                                                             │ │
│ │  ☐ Compliance & Archival             S3 storage, GPG signing, retention  │ │
│ │  ☐ Supply Chain Verification         Manifest integrity checking         │ │
│ │  ☐ Advanced RBAC                     Custom roles, permission hierarchy  │ │
│ │                                                                          │ │
│ │  EXPERIMENTAL (⚠️ Beta):                                                 │ │
│ │  ☐ Package Management                Module install/update system        │ │
│ │  ☐ Performance Profiling             Execution metrics, optimization     │ │
│ │                                                                          │ │
│ │  ─────────────────────────────────────────────────────────────────────── │ │
│ │  Selected: 4 security modules | API Config: Enabled                      │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 6. LLM PROVIDER CONFIGURATION                                                │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                          │ │
│ │  ? Select your primary LLM provider:                                     │ │
│ │                                                                          │ │
│ │  CLOUD PROVIDERS:                                                        │ │
│ │    ● Claude (via Claude Code CLI) - Recommended                          │ │
│ │    ○ OpenAI - GPT-4 and variants                                         │ │
│ │    ○ Groq Cloud - Ultra-fast inference                                   │ │
│ │    ○ Together AI - Serverless inference                                  │ │
│ │                                                                          │ │
│ │  LOCAL PROVIDERS (Privacy-focused, no API costs):                        │ │
│ │    ○ Ollama - Popular local LLM runtime                                  │ │
│ │    ○ vLLM - High-performance local serving                               │ │
│ │    ○ LM Studio - GUI-based local LLM                                     │ │
│ │    ○ llama.cpp - Direct llama.cpp server                                 │ │
│ │                                                                          │ │
│ │  CUSTOM:                                                                 │ │
│ │    ○ Custom endpoint - Enter your own URL and model                      │ │
│ │                                                                          │ │
│ │  ─────────────────────────────────────────────────────────────────────── │ │
│ │                                                                          │ │
│ │  [If LOCAL provider selected (Ollama/vLLM/LM Studio/llama.cpp):]         │ │
│ │                                                                          │ │
│ │  ? Enter base URL (default: http://localhost:11434):                     │ │
│ │    > http://localhost:11434                                              │ │
│ │                                                                          │ │
│ │  ? Detecting available models...                                         │ │
│ │    Available models:                                                     │ │
│ │    ○ nemotron-mini (4.1 GB) - Fast, general purpose                      │ │
│ │    ● mistral (4.1 GB) - Balanced performance                             │ │
│ │    ○ codellama (3.8 GB) - Code-focused                                   │ │
│ │    ○ mixtral (26 GB) - High quality, more resources                      │ │
│ │    ○ qwen2.5 (4.7 GB) - Multi-language support                           │ │
│ │    ○ deepseek-coder-v2 (8.9 GB) - Advanced coding                        │ │
│ │    ○ [Enter custom model name] ___________________________               │ │
│ │                                                                          │ │
│ │  ─────────────────────────────────────────────────────────────────────── │ │
│ │                                                                          │ │
│ │  [If "Custom endpoint" selected:]                                        │ │
│ │                                                                          │ │
│ │  ? Enter API endpoint URL:                                               │ │
│ │    > https://my-custom-llm.example.com/v1                                │ │
│ │                                                                          │ │
│ │  ? Enter model name:                                                     │ │
│ │    > my-custom-model-v2                                                  │ │
│ │                                                                          │ │
│ │  ? API key required? (Y/n) Y                                             │ │
│ │  ? Enter API key (will be stored securely): **************************** │ │
│ │                                                                          │ │
│ │  ─────────────────────────────────────────────────────────────────────── │ │
│ │                                                                          │ │
│ │  ? Test connection now? (Y/n) _                                          │ │
│ │    ✓ Connection successful! Response time: 142ms                         │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 7. SECURITY CONFIGURATION                                                    │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                          │ │
│ │  ═══════════════════════════════════════════════════════════════════     │ │
│ │   SECURITY SETUP                                                         │ │
│ │  ═══════════════════════════════════════════════════════════════════     │ │
│ │                                                                          │ │
│ │  AUTHENTICATION TOKEN                                                    │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │  ? Token validity period:                                                │ │
│ │    ○ 24 hours (high security)                                            │ │
│ │    ● 7 days (recommended)                                                │ │
│ │    ○ 30 days (convenience)                                               │ │
│ │    ○ Custom: ___ hours                                                   │ │
│ │                                                                          │ │
│ │  ✓ Token generated: eyJhbG...                                            │ │
│ │  ✓ Saved to: ~/.bmad-token                                               │ │
│ │                                                                          │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │                                                                          │ │
│ │  PGP KEY GENERATION (for signing your work)                              │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │  ? Generate a personal PGP key for signing files? (Y/n)                  │ │
│ │                                                                          │ │
│ │    ℹ This allows you to:                                                 │ │
│ │    • Sign agent configurations you create                                │ │
│ │    • Verify integrity of your modifications                              │ │
│ │    • Establish cryptographic identity for contributions                  │ │
│ │                                                                          │ │
│ │  [If Yes:]                                                               │ │
│ │  ? Key algorithm:                                                        │ │
│ │    ● RSA-4096 (recommended)                                              │ │
│ │    ○ Ed25519 (modern, faster)                                            │ │
│ │                                                                          │ │
│ │  ? Key expiration:                                                       │ │
│ │    ○ 1 year                                                              │ │
│ │    ● 2 years (recommended)                                               │ │
│ │    ○ 5 years                                                             │ │
│ │    ○ Never expires                                                       │ │
│ │                                                                          │ │
│ │  ? Passphrase (leave blank for no passphrase): ********                  │ │
│ │  ? Confirm passphrase: ********                                          │ │
│ │                                                                          │ │
│ │  ⠋ Generating RSA-4096 key pair...                                       │ │
│ │  ✓ Key pair generated!                                                   │ │
│ │    • Public key:  ~/.bmad/keys/user-public.asc                           │ │
│ │    • Private key: ~/.bmad/keys/user-private.asc (encrypted)              │ │
│ │    • Fingerprint: B4A2 1F89 ... 7C3E 9D12                                │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 8. MODULE-SPECIFIC CONFIGURATION                                             │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                          │ │
│ │  Configuring: cybersec-team (Cybersecurity Operations)                   │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │  ? Where should cybersec-team save outputs?                              │ │
│ │    Default: _bmad-output/cybersec-team                                   │ │
│ │    > _bmad-output/cybersec-team                                          │ │
│ │                                                                          │ │
│ │  ? Default threat severity classification:                               │ │
│ │    ○ CVSS 3.1 (industry standard)                                        │ │
│ │    ● Internal scale (Critical/High/Medium/Low/Info)                      │ │
│ │    ○ Custom                                                              │ │
│ │                                                                          │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │                                                                          │ │
│ │  Configuring: intel-team (Intelligence Operations)                       │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │  ? Where should intel-team save outputs?                                 │ │
│ │    Default: _bmad-output/intel-team                                      │ │
│ │    > _bmad-output/intel-team                                             │ │
│ │                                                                          │ │
│ │  ? Which compliance frameworks are relevant?                             │ │
│ │    ☑ OWASP Top 10                                                        │ │
│ │    ☑ GDPR                                                                │ │
│ │    ☐ HIPAA                                                               │ │
│ │    ☐ SOC 2                                                               │ │
│ │    ☐ PCI-DSS                                                             │ │
│ │    ☐ ISO 27001                                                           │ │
│ │                                                                          │ │
│ │  ? Default classification level:                                         │ │
│ │    ● Unclassified                                                        │ │
│ │    ○ Confidential                                                        │ │
│ │    ○ Secret                                                              │ │
│ │    ○ Top Secret                                                          │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 9. INSTALLATION EXECUTION                                                    │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                          │ │
│ │  Installing BMAD-CYBER Framework...                                      │ │
│ │                                                                          │ │
│ │  Phase 1/6: Pre-validation                                               │ │
│ │  ████████████████████████████████████████ 100%                           │ │
│ │  ✓ System requirements verified                                          │ │
│ │  ✓ BMAD core validated                                                   │ │
│ │  ✓ Module packages verified                                              │ │
│ │                                                                          │ │
│ │  Phase 2/6: Dependency Resolution                                        │ │
│ │  ████████████████████████████████████████ 100%                           │ │
│ │  ✓ Dependency graph built                                                │ │
│ │  ✓ No conflicts detected                                                 │ │
│ │                                                                          │ │
│ │  Phase 3/6: Backup Creation                                              │ │
│ │  ████████████████████████████████████████ 100%                           │ │
│ │  ✓ System snapshot created: backup-2026-01-26-1234                       │ │
│ │                                                                          │ │
│ │  Phase 4/6: Installing Modules                                           │ │
│ │  ████████████████████░░░░░░░░░░░░░░░░░░░░ 45%                            │ │
│ │  ├── core ✓                                                              │ │
│ │  ├── cybersec-team ✓                                                     │ │
│ │  └── intel-team ⠋ Installing agents...                                   │ │
│ │                                                                          │ │
│ │  Phase 5/6: File Signing                                                 │ │
│ │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Pending                        │ │
│ │                                                                          │ │
│ │  Phase 6/6: Post-validation                                              │ │
│ │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Pending                        │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 10. FILE SIGNING (if PGP key generated)                                      │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                          │ │
│ │  Signing configuration files...                                          │ │
│ │                                                                          │ │
│ │  ✓ Signed: _bmad/_config/llm-config.yaml                                 │ │
│ │  ✓ Signed: _bmad/core/security/auth-config.yaml                          │ │
│ │  ✓ Signed: _bmad/cybersec-team/module.yaml                               │ │
│ │  ✓ Signed: _bmad/intel-team/module.yaml                                  │ │
│ │                                                                          │ │
│ │  Generating manifest...                                                  │ │
│ │  ✓ Created: .bmad/user-manifest.sha256                                   │ │
│ │  ✓ Signed:  .bmad/user-manifest.sha256.asc                               │ │
│ │                                                                          │ │
│ │  ℹ Your configuration files are now cryptographically signed.            │ │
│ │    Any modifications will be detected during integrity checks.           │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 11. HEALTH CHECK & COMPLETION                                                │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                          │ │
│ │  ═══════════════════════════════════════════════════════════════════     │ │
│ │   INSTALLATION COMPLETE                                                  │ │
│ │  ═══════════════════════════════════════════════════════════════════     │ │
│ │                                                                          │ │
│ │  Health Check Results:                                                   │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │  ✓ Core framework loaded                                                 │ │
│ │  ✓ 3 modules installed (27 agents, 35 workflows)                         │ │
│ │  ✓ 4 security modules enabled                                            │ │
│ │  ✓ Authentication configured                                             │ │
│ │  ✓ LLM provider connected (Claude)                                       │ │
│ │  ✓ File signatures verified                                              │ │
│ │  ✓ All integrity checks passed                                           │ │
│ │                                                                          │ │
│ │  Summary:                                                                │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │  │ Module          │ Agents │ Workflows │ Status │                       │ │
│ │  ├─────────────────┼────────┼───────────┼────────┤                       │ │
│ │  │ core            │      4 │         8 │   ✓    │                       │ │
│ │  │ cybersec-team   │     15 │        18 │   ✓    │                       │ │
│ │  │ intel-team      │     11 │        12 │   ✓    │                       │ │
│ │  └─────────────────┴────────┴───────────┴────────┘                       │ │
│ │                                                                          │ │
│ │  Security Features:                                                      │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │  │ Feature                    │ Status │                                 │ │
│ │  ├────────────────────────────┼────────┤                                 │ │
│ │  │ Authentication             │   ✓    │                                 │ │
│ │  │ Security Validators (6)    │   ✓    │                                 │ │
│ │  │ Audit Logging              │   ✓    │                                 │ │
│ │  │ Session Hooks              │   ✓    │                                 │ │
│ │  └────────────────────────────┴────────┘                                 │ │
│ │                                                                          │ │
│ │  Quick Start (in Claude Code):                                           │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │                                                                          │ │
│ │    # Invoke a cybersec agent                                             │ │
│ │    /bmad:cybersec-team:agents:security-architect                         │ │
│ │                                                                          │ │
│ │    # Just ask Abdul!                                                     │ │
│ │    /bmad:core:agents:abdul                                               │ │
│ │                                                                          │ │
│ │    # Start Party Mode (multi-agent collaboration)                        │ │
│ │    /bmad:core:workflows:party-mode                                       │ │
│ │                                                                          │ │
│ │  ─────────────────────────────────────────────────────────────────────   │ │
│ │  BMAD Method: https://github.com/bmad-code-org/BMAD-METHOD               │ │
│ │  BMAD-CYBER: https://github.com/SchenLong/BMAD-CYBERSEC                  │ │
│ │  Vibecoded with Claude by blackunicorn.tech                              │ │
│ │                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 SIDE-BY-SIDE COMPARISON

```
┌────────────────────────────┬────────────────────────────────────────────────┐
│      ACTUAL (Current)      │              IDEAL (Proposed)                  │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  1. git clone              │  1. npm install -g @bmad/cli                   │
│     └─ Manual              │     └─ Single command                          │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  2. npm install            │  2. bmad init                                  │
│     └─ Builds TypeScript   │     └─ Launches interactive wizard             │
│     └─ No interaction      │                                                │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  ❌ No GPG verification    │  3. Auto GPG verification                      │
│     prompt                 │     └─ Validates package signature             │
│                            │     └─ Checks file integrity                   │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  ❌ No user profile setup  │  4. User profile setup                         │
│                            │     └─ Name, email, role                       │
│                            │     └─ Admin as default role                   │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  ❌ All modules installed  │  5. Interactive module selection               │
│     by default             │     └─ Core always required                    │
│                            │     └─ Role-based recommendations              │
│                            │     └─ Clear descriptions + sizes              │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  ❌ No security module     │  5b. Security modules selection                │
│     selection              │      └─ Essential (auth, validators)           │
│                            │      └─ Standard (audit, hooks)                │
│                            │      └─ Advanced (AI safety, telemetry)        │
│                            │      └─ Enterprise (archival, RBAC)            │
│                            │      └─ Beta features warned                   │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  ❌ No LLM setup wizard    │  6. LLM provider configuration                 │
│     (manual YAML editing)  │     └─ Cloud vs Local providers                │
│                            │     └─ Custom endpoint + model input           │
│                            │     └─ Auto-detect local models                │
│                            │     └─ Connection testing                      │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  3. Manual token gen       │  7. Security configuration                     │
│     (separate command)     │     └─ Integrated token generation             │
│                            │     └─ Optional PGP key generation             │
│                            │     └─ Key algorithm + expiration              │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  4. Manual env export      │  8. Module-specific configuration              │
│     (copy-paste token)     │     └─ Per-module questions                    │
│                            │     └─ Output folder selection                 │
│                            │     └─ Framework preferences                   │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  ❌ No progress display    │  9. Installation execution                     │
│                            │     └─ 6-phase progress bar                    │
│                            │     └─ Real-time status updates                │
│                            │     └─ Rollback on failure                     │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  ❌ No file signing        │  10. File signing                              │
│     for user configs       │      └─ Sign config files with user key        │
│                            │      └─ Generate user manifest                 │
│                            │      └─ Enable integrity verification          │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  ❌ No health check        │  11. Health check & completion                 │
│                            │      └─ Verify all modules loaded              │
│                            │      └─ Test agent registration                │
│                            │      └─ Security features summary              │
│                            │      └─ Quick start commands                   │
│                            │                                                │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                │
│  5. Ready (with all        │  ✓ Ready (with selected modules)               │
│     modules, no choice)    │                                                │
│                            │                                                │
└────────────────────────────┴────────────────────────────────────────────────┘
```

---

## 🛡️ SECURITY MODULES DETAIL

### Available Security Features (Can Be Selected During Install)

| Tier | Module | Description | Default |
|------|--------|-------------|---------|
| **Essential** | Authentication & Authorization | Token-based auth, session management | ✅ On |
| **Essential** | Security Validators | 6 guards (bash safety, secrets, PII, env, repo, prod) | ✅ On |
| **Standard** | Audit Logging | Activity tracking, compliance logs, encryption | ✅ On |
| **Standard** | Session Hooks | Security event handlers, startup checks | ✅ On |
| **Advanced** | AI Safety Guards | Prompt injection detection, jailbreak detection | ☐ Off |
| **Advanced** | Observability & Telemetry | Anomaly detection, confidence tracking | ☐ Off |
| **Advanced** | Resource Management | Rate limiting, memory/CPU limits, recursion guard | ☐ Off |
| **Enterprise** | Compliance & Archival | S3 storage, GPG signing, 7-year retention | ☐ Off |
| **Enterprise** | Supply Chain Verification | Manifest integrity, package validation | ☐ Off |
| **Enterprise** | Advanced RBAC | Custom roles, permission hierarchy, inheritance | ☐ Off |
| **Beta** ⚠️ | Package Management | Module install/update/rollback system | ☐ Off |
| **Beta** ⚠️ | Performance Profiling | Execution metrics, optimization hints | ☐ Off |

### Security Validators Included

| Validator | Purpose |
|-----------|---------|
| Bash Safety Guard | Blocks dangerous commands (rm -rf, chmod 777, etc.) |
| Environment Protection | Prevents access to sensitive files (.env, credentials) |
| Outside Repository Guard | Prevents directory escape attacks |
| Production Guard | Blocks accidental production changes |
| Secret Guard | Detects hardcoded credentials, API keys |
| PII Guard | Detects SSN, credit cards, IBAN, national IDs |

---

## 🔧 IMPLEMENTATION STATUS

### Existing Components (Can Be Leveraged)

| Component | Location | Status |
|-----------|----------|--------|
| 6-phase installer structure | `src/utility/tools/installer/bin/install.js` | ⚠️ Stubbed |
| Package Registry CLI | `src/utility/tools/installer/lib/registry/package-registry-cli.js` | ✅ Working |
| Token generation | `_bmad/core/security/generate-token.js` | ✅ Working |
| GPG signing scripts | `_bmad/core/security/sign-manifest.sh` | ✅ Working |
| GPG verification | `_bmad/core/security/verify-integrity.sh` | ✅ Working |
| LLM config structure | `_bmad/_config/llm-config.yaml` | ✅ Working |
| LLM provider manager | `.claude/hooks/llm-provider-manager.sh` | ✅ Working |
| Module manifests | `_bmad/*/module.yaml` | ✅ Complete |
| Inquirer.js integration | registry-cli | ✅ Available |
| Audit logging | `_bmad/framework/audit/` | ✅ Working |
| Validators suite | `_bmad/framework/validators/` | ✅ Working |
| Hook system | `_bmad/framework/hooks/` | ✅ Working |
| RBAC system | `_bmad/framework/auth/` | ✅ Working |

### Missing Components (Need Implementation)

| Component | Priority | Complexity | Notes |
|-----------|----------|------------|-------|
| Interactive module selection UI | 🔴 High | Medium | Use inquirer.js |
| Security module selection UI | 🔴 High | Medium | New screen 5b |
| LLM provider wizard | 🔴 High | Medium | With custom endpoint support |
| User PGP key generation | 🟡 Medium | Low | gpg --gen-key wrapper |
| User config file signing | 🟡 Medium | Low | Extend sign-manifest.sh |
| Installation progress UI | 🟡 Medium | Low | ora/cli-progress |
| Post-install health check | 🟡 Medium | Medium | Verify agent + security loading |
| Unified `bmad init` command | 🔴 High | High | Orchestrate all steps |
| YAML→MD converter logic | 🟡 Medium | Medium | Currently stubbed |
| Global agent registry | 🟡 Medium | Medium | Track installed agents |

---

## 📋 RECOMMENDED IMPLEMENTATION ORDER

```
Phase 1: Core Installer Wizard
├── 1.1 Create unified `bmad init` entry point
├── 1.2 Implement interactive module selection (inquirer.js)
├── 1.3 Add security module selection screen
├── 1.4 Integrate existing token generation
└── 1.5 Add progress visualization (ora)

Phase 2: LLM Configuration
├── 2.1 LLM provider selection wizard
├── 2.2 Local LLM detection (Ollama, LM Studio, vLLM, llama.cpp)
├── 2.3 Custom endpoint + model input
├── 2.4 Connection testing
└── 2.5 Config file generation

Phase 3: Security Enhancements
├── 3.1 User PGP key generation wizard
├── 3.2 Config file signing on install
├── 3.3 User manifest generation
└── 3.4 Integrity verification integration

Phase 4: Post-Install Experience
├── 4.1 Health check implementation (modules + security)
├── 4.2 Quick start guide display
├── 4.3 First-run tutorial option
└── 4.4 Shell completion setup
```

---

## 🎯 KEY DECISION POINTS FOR USER

During ideal installation, users make these choices:

1. **Role Selection** → Admin by default, determines module recommendations
2. **Module Selection** → Which agent teams to install
3. **Security Module Selection** → Which security features to enable
4. **LLM Provider** → Claude, Ollama, OpenAI, Custom, etc.
5. **Custom Model** → Can type in any model name for local providers
6. **Token Validity** → 24h, 7d, 30d, custom
7. **PGP Key Generation** → Yes/No
8. **Key Algorithm** → RSA-4096 or Ed25519
9. **Key Expiration** → 1y, 2y, 5y, never
10. **Per-Module Config** → Output folders, classification levels, preferences

---

## 📁 Files Referenced

- [install.js](src/utility/tools/installer/bin/install.js) - Main installer
- [package-registry-cli.js](src/utility/tools/installer/lib/registry/package-registry-cli.js) - Registry CLI
- [generate-token.js](_bmad/core/security/generate-token.js) - Token generation
- [llm-config.yaml](_bmad/_config/llm-config.yaml) - LLM configuration
- [auth-config.yaml](_bmad/core/security/auth-config.yaml) - Auth configuration
- [sign-manifest.sh](_bmad/core/security/sign-manifest.sh) - GPG signing
- [verify-integrity.sh](_bmad/core/security/verify-integrity.sh) - Integrity verification
- [audit/index.ts](_bmad/framework/audit/index.ts) - Audit logging
- [validators/index.ts](_bmad/framework/validators/index.ts) - Security validators
- [hooks/index.ts](_bmad/framework/hooks/index.ts) - Hook system
