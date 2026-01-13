# BMAD-CYBERSEC Data Sensitivity: Technical Implementation Plan

**Created:** 2026-01-11
**Updated:** 2026-01-11 (v2.1 - User Choice Emphasis)
**Status:** Technical Specification - REVISED
**Estimated Effort:** 15-25 hours across 6 phases (reduced from 40-60)
**Scope:** 79 agents, 141 workflows, 9 modules

---

## IMPORTANT: User Choice is Paramount

> **This plan has been revised to account for the Local LLM Provider System.**
>
> BMAD-CYBERSEC now supports routing sensitive modules to local LLMs (Ollama, LM Studio, vLLM, llama.cpp) where **data never leaves the organization's infrastructure**.
>
> **Key Principle: USER CHOICE**
> - Users **always** decide whether to use local or cloud LLM
> - Module routing is a **recommendation**, not a requirement
> - Users can override any default at any time
> - The system **informs** users about provider options, never **forces** them
>
> This fundamentally changes the risk landscape:
> - **Before:** All data → Cloud API → Complex classification/blocking required
> - **After:** User chooses → Local LLM option available → Informed decision

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phase 0: Provider Routing (IMMEDIATE)](#2-phase-0-provider-routing-immediate)
3. [Phase 1: Documentation (Simplified)](#3-phase-1-documentation-simplified)
4. [Phase 2: Agent Provider Awareness](#4-phase-2-agent-provider-awareness)
5. [Phase 3: Workflow Provider Status](#5-phase-3-workflow-provider-status)
6. [Phase 4: Audit Logging with Provider Info](#6-phase-4-audit-logging-with-provider-info)
7. [Phase 5: Lessons Learned Update](#7-phase-5-lessons-learned-update)
8. [Removed/Simplified Items](#8-removedsimplified-items)
9. [Execution Scripts](#9-execution-scripts)
10. [Testing & Validation](#10-testing--validation)

---

## 1. Architecture Overview

### Current System with Local LLM Support

```
┌─────────────────────────────────────────────────────────────────┐
│                        BMAD Agents (78)                         │
│  strategy-team | cybersec-team | intel-team | legal-team | etc  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │  LLM Provider     │
                    │  Manager          │
                    │  (llm-config.yaml)│
                    └─────────┬─────────┘
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   LOCAL LLMs    │ │   LOCAL LLMs    │ │   CLOUD APIs    │
│   🔒 SECURE     │ │   🔒 SECURE     │ │   ⚠️ EXTERNAL   │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • Ollama        │ │ • LM Studio     │ │ • Claude        │
│   :11434        │ │   :1234         │ │ • OpenAI        │
│ • vLLM          │ │ • llama.cpp     │ │ • Groq          │
│   :8000         │ │   :8080         │ │ • Together      │
│                 │ │                 │ │                 │
│ NO DATA EGRESS  │ │ NO DATA EGRESS  │ │ DATA EGRESS     │
│ 127.0.0.1 ONLY  │ │ 127.0.0.1 ONLY  │ │ INTERNET        │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Provider Options (User's Choice)

| Module | Risk Level | Recommended Provider | User Can Choose |
|--------|------------|---------------------|-----------------|
| cybersec-team | HIGH | ollama (local) | Local OR Cloud |
| intel-team | HIGH | ollama (local) | Local OR Cloud |
| legal-team | HIGH | ollama (local) | Local OR Cloud |
| strategy-team | MEDIUM-HIGH | ollama (local) | Local OR Cloud |
| bmm | LOW | claude (cloud) | Local OR Cloud |
| bmgd | LOW | claude (cloud) | Local OR Cloud |
| cis | LOW | claude (cloud) | Local OR Cloud |
| bmb | LOW | claude (cloud) | Local OR Cloud |

> **Note:** Users can switch providers at any time using:
> `.claude/hooks/llm-provider-manager.sh set <provider>`

### Key Files

| File | Purpose |
|------|---------|
| `_bmad/_config/llm-config.yaml` | Central provider configuration |
| `.claude/hooks/llm-provider-manager.sh` | Provider management commands |
| `docs/LLM-PROVIDER-SYSTEM.md` | Provider system documentation |

---

## 2. Phase 0: Provider Routing (OPTIONAL BUT RECOMMENDED)

**Priority:** P1 CRITICAL (for organizations with compliance requirements)
**Effort:** 1-2 hours
**Impact:** Provides sensible defaults while preserving user choice

### 2.1 Configure Module-Specific Routing (Optional)

> **User Choice Principle:** Module routing sets **defaults** that users can override at any time.
> This is a convenience feature, not a restriction.

**File:** `_bmad/_config/llm-config.yaml`

**Current state (commented out):**
```yaml
module_overrides:
  # strategy-team: claude    # Keep executive decisions on Claude
  # legal-team: claude       # Legal advice stays on Claude
  # cybersec-team: ollama    # Security analysis on local
  # bmm: ollama              # Dev workflows on local
```

**Recommended configuration (if desired):**
```yaml
# OPTIONAL MODULE ROUTING DEFAULTS
# Sets recommended providers - users can ALWAYS override
module_overrides:
  # HIGH RISK → LOCAL LLM RECOMMENDED (user can still choose cloud)
  cybersec-team: ollama      # Security data - local recommended
  intel-team: ollama         # Intelligence data - local recommended
  legal-team: ollama         # Legal data - local recommended
  strategy-team: ollama      # Strategic data - local recommended

  # LOW RISK → CLOUD DEFAULT (user can choose local if preferred)
  # bmm: claude              # Software dev - cloud default
  # bmgd: claude             # Game dev - cloud default
  # cis: claude              # Creative - cloud default
  # bmb: claude              # Framework - cloud default
```

> **Important:** Even with module routing configured, users can override for any session:
> ```bash
> .claude/hooks/llm-provider-manager.sh set claude  # Use cloud even for high-risk modules
> .claude/hooks/llm-provider-manager.sh set ollama  # Use local even for low-risk modules
> ```

### 2.2 Verify Local LLM Availability

**Pre-requisite check script:**

```bash
#!/bin/bash
# verify-local-llm-ready.sh
# Run this before enabling module routing

echo "=== BMAD Local LLM Readiness Check ==="
echo ""

# Check 1: Ollama running
echo "1. Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama is running on :11434"
    MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | head -3)
    echo "   Models available: $MODELS"
else
    echo "   ❌ Ollama NOT running"
    echo "   → Start with: ollama serve"
    echo "   → Pull model: ollama pull nemotron-mini"
fi

# Check 2: Config file exists
echo ""
echo "2. Checking config file..."
if [ -f "_bmad/_config/llm-config.yaml" ]; then
    ACTIVE=$(grep "^active_provider:" _bmad/_config/llm-config.yaml | cut -d: -f2 | tr -d ' ')
    echo "   ✅ Config exists, active_provider: $ACTIVE"
else
    echo "   ❌ Config file not found"
fi

# Check 3: Provider manager available
echo ""
echo "3. Checking provider manager..."
if [ -f ".claude/hooks/llm-provider-manager.sh" ]; then
    echo "   ✅ Provider manager available"
    echo "   Commands:"
    echo "     .claude/hooks/llm-provider-manager.sh get"
    echo "     .claude/hooks/llm-provider-manager.sh set ollama"
    echo "     .claude/hooks/llm-provider-manager.sh health-all"
else
    echo "   ❌ Provider manager not found"
fi

echo ""
echo "=== Readiness Summary ==="
echo "If Ollama is running with a model, you can enable module routing."
```

### 2.3 Test Module Routing

After enabling, verify routing works:

```bash
# Check current provider
.claude/hooks/llm-provider-manager.sh get

# Test that cybersec-team would use ollama
# (Module overrides only apply when module is active)

# Verify health of all providers
.claude/hooks/llm-provider-manager.sh health-all
```

---

## 3. Phase 1: Documentation (Simplified)

**Priority:** P2 HIGH
**Effort:** 2-3 hours (reduced from 4-6)
**Impact:** User awareness of provider selection

### 3.1 Create Provider Selection Guide

**File:** `docs/DATA-SENSITIVITY-GUIDE.md`

This replaces the complex DATA-SENSITIVITY-POLICY.md with a simpler provider-focused guide:

```markdown
# BMAD-CYBERSEC Data Sensitivity & Provider Selection Guide

## Quick Reference: Local vs Cloud LLM

### 🔒 USE LOCAL LLM (Ollama/LM Studio) FOR:

| Data Type | Why Local |
|-----------|-----------|
| Security incidents | Breach data, IOCs stay on-premise |
| Vulnerability details | No external exposure of CVEs/targets |
| Intelligence data | Privacy/legal protection for targets |
| Legal matters | Protect attorney-client privilege |
| Trade secrets | Corporate confidentiality maintained |
| PII/Customer data | GDPR, HIPAA, CCPA compliance |

**Automatic:** With module routing enabled, cybersec/intel/legal/strategy use Ollama

### ☁️ CLOUD LLM (Claude) IS FINE FOR:

| Data Type | Why Cloud OK |
|-----------|--------------|
| Public information | No sensitivity concerns |
| Generic development | Code without secrets |
| Creative content | No confidential data |
| Training/education | Synthetic data only |

### 🔄 Provider Commands

```bash
# Check current provider
.claude/hooks/llm-provider-manager.sh get

# Temporary switch to local
.claude/hooks/llm-provider-manager.sh set ollama

# Temporary switch to cloud
.claude/hooks/llm-provider-manager.sh set claude

# Check all provider health
.claude/hooks/llm-provider-manager.sh health-all

# Clear override (use config default)
.claude/hooks/llm-provider-manager.sh clear
```

## Module Routing (When Configured)

When `module_overrides` is enabled in `_bmad/_config/llm-config.yaml`:

| Module | Provider | Data Location |
|--------|----------|---------------|
| cybersec-team | Ollama | 🔒 On-premise |
| intel-team | Ollama | 🔒 On-premise |
| legal-team | Ollama | 🔒 On-premise |
| strategy-team | Ollama | 🔒 On-premise |
| bmm | Claude | ☁️ Cloud |
| bmgd | Claude | ☁️ Cloud |
| cis | Claude | ☁️ Cloud |
| bmb | Claude | ☁️ Cloud |

## Session Override

Even with module routing, override for current session:

```bash
# Force ALL modules to local (maximum security)
.claude/hooks/llm-provider-manager.sh set ollama

# Force ALL modules to cloud (maximum quality)
.claude/hooks/llm-provider-manager.sh set claude
```

## Decision Tree

```
Is data sensitive (PII, security, legal, strategic)?
    │
    ├─ YES → Is module routing enabled?
    │         │
    │         ├─ YES → ✅ Automatic (local LLM)
    │         │
    │         └─ NO → Run: .claude/hooks/llm-provider-manager.sh set ollama
    │
    └─ NO → ✅ Cloud OK (default behavior)
```

## Verification

Before processing sensitive data, verify provider:

```bash
# Check what provider is active
.claude/hooks/llm-provider-manager.sh get

# Expected output for sensitive work:
# Active provider: ollama
# Type: local
# Data locality: on-premise
```
```

### 3.2 Update Root README.md Security Section

**Add/update this section in README.md:**

```markdown
---

## 🔐 Data Sensitivity & Privacy

BMAD-CYBERSEC supports **multiple LLM providers** including local options for sensitive data.

### Provider Options

| Provider Type | Data Location | Best For |
|---------------|---------------|----------|
| **Local** (Ollama, LM Studio) | Your machine | Sensitive data, compliance |
| **Cloud** (Claude, OpenAI) | External API | Quality, general use |

### Recommended: Enable Module Routing

Route high-risk modules to local LLM automatically:

```yaml
# In _bmad/_config/llm-config.yaml, uncomment:
module_overrides:
  cybersec-team: ollama    # Security data stays local
  intel-team: ollama       # Intelligence data stays local
  legal-team: ollama       # Legal privilege protected
  strategy-team: ollama    # Trade secrets protected
```

### Quick Commands

```bash
# Check current provider
.claude/hooks/llm-provider-manager.sh get

# Switch to local for sensitive work
.claude/hooks/llm-provider-manager.sh set ollama

# Check all provider health
.claude/hooks/llm-provider-manager.sh health-all
```

See [LLM Provider System](docs/LLM-PROVIDER-SYSTEM.md) and [Data Sensitivity Guide](docs/DATA-SENSITIVITY-GUIDE.md).

---
```

### 3.3 Update LLM-PROVIDER-SYSTEM.md

Add security recommendation section (if not present):

```markdown
## Security Recommendation: Module Routing

For organizations handling sensitive data, enable automatic routing of high-risk modules to local LLMs.

### Enable in `_bmad/_config/llm-config.yaml`:

```yaml
module_overrides:
  cybersec-team: ollama    # Security assessments, incidents
  intel-team: ollama       # Intelligence operations
  legal-team: ollama       # Attorney-client privilege
  strategy-team: ollama    # Trade secrets, M&A
```

### Risk Mitigation

| Risk | Cloud Provider | Local Provider |
|------|----------------|----------------|
| Data egress | ⚠️ YES | ✅ NO |
| Third-party access | ⚠️ YES | ✅ NO |
| Compliance (GDPR/HIPAA) | ⚠️ Requires BAA | ✅ On-premise |
| Attorney-client privilege | ⚠️ May be waived | ✅ Protected |
| Trade secret exposure | ⚠️ Risk | ✅ Protected |
```

---

## 4. Phase 2: Agent Provider Awareness

**Priority:** P3 MEDIUM
**Effort:** 4-6 hours (reduced from 8-12)
**Impact:** Agents inform users of active provider

### 4.1 Simplified Provider Awareness Rule

Instead of complex data classification rules, add a simple provider awareness rule to all 79 agents. **This rule informs users of their options without forcing any choice.**

**Rule for ALL agents:**

```xml
<r critical="PROVIDER-AWARENESS">🔐 PROVIDER AWARENESS: At session start, inform the user which LLM provider is currently active. Provide the user with information about their provider options:
- **Local providers** (Ollama, LM Studio, vLLM): Data stays on-premise
- **Cloud providers** (Claude, OpenAI, Groq): Data transmitted externally
The user can switch providers at any time: `.claude/hooks/llm-provider-manager.sh set <provider>`. The choice between local and cloud is ALWAYS the user's decision based on their needs and preferences.</r>
```

### 4.2 High-Risk Module Additional Rule

**Add to cybersec-team, intel-team, legal-team, strategy-team agents only:**

```xml
<r critical="LOCAL-LLM-OPTION">ℹ️ SENSITIVE MODULE NOTE: This module may process sensitive data. For operations involving confidential information, you have the option to use a local LLM provider where data stays on-premise. Check current provider: `.claude/hooks/llm-provider-manager.sh get`. Switch if desired: `.claude/hooks/llm-provider-manager.sh set ollama`. The choice is yours based on your data sensitivity requirements.</r>
```

### 4.3 Agent Update Script (Simplified)

**File:** `scripts/add-provider-awareness-rules.py`

```python
#!/usr/bin/env python3
"""
Add provider awareness rules to all BMAD agents.
Simplified version - only adds provider awareness, not complex data classification.
"""

import re
from pathlib import Path
from datetime import datetime
import shutil

BASE_DIR = Path("_bmad")
BACKUP_DIR = Path("_bmad-backup") / datetime.now().strftime("%Y%m%d_%H%M%S")

# Base rule for all agents - emphasizes user choice
PROVIDER_RULE = '''<r critical="PROVIDER-AWARENESS">🔐 PROVIDER AWARENESS: At session start, inform the user which LLM provider is currently active. Provide the user with information about their provider options:
- **Local providers** (Ollama, LM Studio, vLLM): Data stays on-premise
- **Cloud providers** (Claude, OpenAI, Groq): Data transmitted externally
The user can switch providers at any time: `.claude/hooks/llm-provider-manager.sh set <provider>`. The choice between local and cloud is ALWAYS the user's decision based on their needs and preferences.</r>'''

# Additional rule for high-risk modules - informative, not restrictive
HIGH_RISK_RULE = '''<r critical="LOCAL-LLM-OPTION">ℹ️ SENSITIVE MODULE NOTE: This module may process sensitive data. For operations involving confidential information, you have the option to use a local LLM provider where data stays on-premise. Check current provider: `.claude/hooks/llm-provider-manager.sh get`. Switch if desired: `.claude/hooks/llm-provider-manager.sh set ollama`. The choice is yours based on your data sensitivity requirements.</r>'''

HIGH_RISK_MODULES = ["cybersec-team", "intel-team", "legal-team", "strategy-team"]

def backup_file(filepath: Path):
    """Create backup before modification."""
    backup_path = BACKUP_DIR / filepath.relative_to(BASE_DIR)
    backup_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(filepath, backup_path)

def has_rule(content: str, rule_type: str) -> bool:
    """Check if agent already has the specified rule."""
    return f'critical="{rule_type}"' in content

def insert_after_security_rules(content: str, rule: str) -> str:
    """Insert rule after existing security rules."""
    # Find after EXTERNAL CONTENT MANIPULATION PROTECTION
    pattern = r'(critical="SECURITY".*?EXTERNAL CONTENT MANIPULATION PROTECTION.*?</r>)'
    match = re.search(pattern, content, re.DOTALL)

    if match:
        insert_pos = match.end()
        return content[:insert_pos] + "\n      " + rule + content[insert_pos:]

    # Fallback: after <rules>
    rules_match = re.search(r'(<rules>)', content)
    if rules_match:
        insert_pos = rules_match.end()
        return content[:insert_pos] + "\n      " + rule + content[insert_pos:]

    return content

def process_agent(filepath: Path, module: str):
    """Process a single agent file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # Add provider awareness rule if missing
    if not has_rule(content, "PROVIDER-AWARENESS"):
        backup_file(filepath)
        content = insert_after_security_rules(content, PROVIDER_RULE)
        modified = True
        print(f"  ✅ Added PROVIDER-AWARENESS to {filepath.name}")

    # Add high-risk module rule if applicable (informative only)
    if module in HIGH_RISK_MODULES and not has_rule(content, "LOCAL-LLM-OPTION"):
        if not modified:
            backup_file(filepath)
        content = insert_after_security_rules(content, HIGH_RISK_RULE)
        modified = True
        print(f"  ✅ Added LOCAL-LLM-OPTION to {filepath.name}")

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    else:
        print(f"  ⏭️  Skipped {filepath.name} (rules present)")

def main():
    print("=== BMAD Provider Awareness Rule Injection ===\n")

    modules = ["core", "cybersec-team", "intel-team", "strategy-team",
               "legal-team", "bmm", "bmgd", "bmb", "cis"]

    for module in modules:
        agents_dir = BASE_DIR / module / "agents"
        if not agents_dir.exists():
            continue

        print(f"📁 {module}...")
        for agent_file in agents_dir.glob("*.md"):
            process_agent(agent_file, module)

    print(f"\n✅ Complete. Backups in: {BACKUP_DIR}")

if __name__ == "__main__":
    main()
```

---

## 5. Phase 3: Workflow Provider Status

**Priority:** P4 LOW
**Effort:** 2-4 hours (reduced from 6-8)
**Impact:** Provider info in workflow outputs

### 5.1 Add Provider Status to Output Frontmatter

When workflows generate output documents, include provider information:

```yaml
---
# ... existing frontmatter ...
processing:
  llm_provider: "ollama"           # or "claude", etc.
  provider_type: "local"           # or "cloud"
  data_locality: "on-premise"      # or "external"
  generated_at: "2026-01-11T10:30:00Z"
---
```

### 5.2 Output Footer Template

**File:** `_bmad/core/templates/output-footer-with-provider.md`

```markdown
---

## Processing Information

| Field | Value |
|-------|-------|
| **LLM Provider** | {provider_name} |
| **Provider Type** | {local/cloud} |
| **Data Locality** | {on-premise/external} |
| **Generated** | {timestamp} |

{if provider_type == "cloud"}
> ☁️ **Cloud Processing**
>
> This document was generated using a cloud LLM ({provider_name}).
> Input data was transmitted to external infrastructure per user choice.
> Alternative option: `.claude/hooks/llm-provider-manager.sh set ollama`
{/if}

{if provider_type == "local"}
> 🔒 **Local Processing**
>
> This document was generated using local LLM ({provider_name}) per user choice.
> All data remained on-premise. No external transmission occurred.
> Alternative option: `.claude/hooks/llm-provider-manager.sh set claude`
{/if}

---
*Generated by BMAD-CYBERSEC | Provider: {provider_name}*
```

### 5.3 Workflow Update (Minimal)

For workflows that may process sensitive data, add provider information at initialization:

```markdown
### Provider Information

Current LLM provider:
```bash
.claude/hooks/llm-provider-manager.sh get
```

**Your options:**
- **Local LLM** (data stays on your machine): `.claude/hooks/llm-provider-manager.sh set ollama`
- **Cloud LLM** (data sent to API): `.claude/hooks/llm-provider-manager.sh set claude`

The choice is yours based on your data sensitivity requirements.
```

---

## 6. Phase 4: Audit Logging with Provider Info

**Priority:** P2 HIGH
**Effort:** 4-6 hours
**Impact:** Governance and compliance tracking

### 6.1 Enhanced Audit Entry with Provider

**File:** `_bmad/core/templates/audit-log-entry.yaml`

```yaml
# BMAD Workflow Audit Log Entry
# Version: 2.0 (with provider tracking)

audit_entry:
  entry_id: "{uuid}"
  timestamp: "{ISO-8601}"

  user:
    identifier: "{hash-of-username}"
    session_id: "{session-uuid}"

  workflow:
    module: "{module-name}"
    workflow_name: "{workflow-name}"
    started_at: "{ISO-8601}"
    completed_at: "{ISO-8601}"
    status: "{completed|aborted|error}"

  # NEW: Provider tracking
  llm_provider:
    active_provider: "ollama"      # Provider used
    provider_type: "local"         # local or cloud
    data_locality: "on-premise"    # on-premise or external
    module_routing_active: true    # Was module routing configured?
    provider_verified: true        # Did user verify before sensitive work?
    fallback_used: false           # Did fallback chain activate?

  # Simplified data tracking (provider handles risk)
  data_handling:
    used_local_llm: true
    cloud_api_called: false
    data_egress_occurred: false

  execution:
    steps_completed: [1, 2, 3]
    duration_seconds: 1234

  outputs:
    files_generated:
      - path: "{relative-path}"
        provider_used: "ollama"
```

### 6.2 Module Config Audit Section

**Add to each module's config.yaml:**

```yaml
# Audit Configuration
audit:
  enabled: true
  log_location: "{output_folder}/audit-logs"
  retention_days: 90

  # Provider tracking (v2.0)
  track_provider: true
  log_provider_switches: true
  alert_on_cloud_for_sensitive: true

  # Events to log
  log_events:
    workflow_start: true
    workflow_complete: true
    provider_info: true
    errors: true
```

---

## 7. Phase 5: Lessons Learned Update

**Priority:** P3 MEDIUM
**Effort:** 1-2 hours

### 7.1 Add Lesson 15 (Revised for Local LLM)

**Add to:** `_bmad/bmb/ExperienceAcquired/LessonsLearned.md`

```markdown
### Lesson 15: Provider Selection for Data Sensitivity

**Context:** BMAD-CYBERSEC supports multiple LLM providers:
- **Local providers** (Ollama, LM Studio, vLLM, llama.cpp): Data stays on-premise
- **Cloud providers** (Claude, OpenAI, Groq, Together): Data transmitted externally

**User Choice:** Users can choose to route modules to their preferred provider:

```yaml
# _bmad/_config/llm-config.yaml (optional configuration)
module_overrides:
  cybersec-team: ollama    # Security data - local recommended
  intel-team: ollama       # Intelligence data - local recommended
  legal-team: ollama       # Legal data - local recommended
  strategy-team: ollama    # Strategic data - local recommended
```

**Agent Rule:** All agents should include provider awareness rule to:
- Inform users of active provider at session start
- Present both local and cloud options with their characteristics
- Provide switch commands for BOTH directions
- **Never force a provider choice - the decision is always the user's**

**Key Principle:** User choice is paramount. The Local LLM Provider System provides an **option**
for data protection. Users decide whether to use local or cloud based on their requirements.

**Provider Commands (User's Toolkit):**
```bash
.claude/hooks/llm-provider-manager.sh get       # Check active provider
.claude/hooks/llm-provider-manager.sh set ollama  # Switch to local
.claude/hooks/llm-provider-manager.sh set claude  # Switch to cloud
.claude/hooks/llm-provider-manager.sh health-all  # Check all providers
```

**User Awareness:** The system informs users about:
1. Which provider is currently active
2. What the data locality implications are
3. How to switch providers if they wish

**User Responsibility:** Users make informed decisions about provider selection
based on their data sensitivity requirements and organizational policies.

---

*Lesson 15 (Provider Selection for Data Sensitivity) Added: 2026-01-XX*
*Supersedes original complex data classification approach*
```

---

## 8. Removed/Simplified Items

The following items from the original plan are **no longer needed** due to local LLM capability:

| Original Item | Status | Reason |
|---------------|--------|--------|
| Complex 4-tier classification system | **REMOVED** | Provider routing handles risk |
| classification-schema.yaml | **REMOVED** | Not needed with auto-routing |
| step-00-data-classification.md | **REMOVED** | Provider check is simpler |
| Extensive anonymization guides | **REMOVED** | Local LLM removes need |
| DATA-SENSITIVITY-POLICY.md (lengthy) | **REPLACED** | Simple provider guide instead |
| Classification acknowledgments | **REMOVED** | Provider choice is sufficient |
| Restricted data blocking | **SIMPLIFIED** | Local LLM allows all data |
| Complex DATA-HANDLING rules | **SIMPLIFIED** | Provider awareness only |
| 15 workflow step-00 additions | **REDUCED** | Just provider status |
| Module README complex warnings | **SIMPLIFIED** | Provider info only |

### Effort Savings

| Area | Original | Revised | Saved |
|------|----------|---------|-------|
| Documentation | 4-6h | 2-3h | 2-3h |
| Classification System | 4-6h | 0h | 4-6h |
| Agent Rules | 8-12h | 4-6h | 4-6h |
| Workflow Modifications | 6-8h | 2-4h | 4h |
| Audit Logging | 6-8h | 4-6h | 2h |
| User Guidance | 4-6h | (in Phase 1) | 4-6h |
| **TOTAL** | **40-60h** | **15-25h** | **20-35h** |

---

## 9. Execution Scripts

### 9.1 Implementation Verification Script (Revised)

**File:** `scripts/verify-data-sensitivity-v2.sh`

```bash
#!/bin/bash
# Verify data sensitivity implementation (v2.1 - User Choice focused)

echo "=== BMAD Data Sensitivity v2.1 Verification ==="
echo "=== (User Choice Emphasis)                   ==="
echo ""

PASS=0
WARN=0
INFO=0

# Check 1: Local LLM available as an OPTION
echo "1. Local LLM Availability (User Option)..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama running - local option AVAILABLE"
    ((PASS++))
else
    echo "   ℹ️  Ollama not running - local option not currently available"
    echo "      Users can start it with: ollama serve"
    ((INFO++))
fi

# Check 2: Cloud LLM available as an OPTION
echo ""
echo "2. Cloud LLM Availability (User Option)..."
if [ -n "$ANTHROPIC_API_KEY" ] || [ -f "$HOME/.anthropic/api_key" ]; then
    echo "   ✅ Claude API available - cloud option AVAILABLE"
    ((PASS++))
else
    echo "   ℹ️  Claude API key not detected (may be configured elsewhere)"
    ((INFO++))
fi

# Check 3: Provider manager allows CHOICE
echo ""
echo "3. Provider Manager (User Choice Tool)..."
if [ -x ".claude/hooks/llm-provider-manager.sh" ]; then
    echo "   ✅ Provider manager executable"
    echo "      Users can switch with:"
    echo "        .claude/hooks/llm-provider-manager.sh set ollama  (local)"
    echo "        .claude/hooks/llm-provider-manager.sh set claude  (cloud)"
    ((PASS++))
else
    echo "   ❌ Provider manager not found/executable"
    ((WARN++))
fi

# Check 4: Module routing (OPTIONAL)
echo ""
echo "4. Module Routing Configuration (Optional Defaults)..."
if grep -q "^  cybersec-team:" "_bmad/_config/llm-config.yaml" 2>/dev/null; then
    echo "   ℹ️  Module routing configured (provides defaults, users can override)"
    ((INFO++))
else
    echo "   ℹ️  Module routing not configured (users choose per-session)"
    ((INFO++))
fi

# Check 5: Documentation
echo ""
echo "5. User Documentation..."
if [ -f "docs/LLM-PROVIDER-SYSTEM.md" ]; then
    echo "   ✅ LLM-PROVIDER-SYSTEM.md exists"
    ((PASS++))
else
    echo "   ⚠️  LLM-PROVIDER-SYSTEM.md not found"
    ((WARN++))
fi

# Check 6: Agent provider awareness rules
echo ""
echo "6. Agent Provider Awareness (Informational Rules)..."
for module in cybersec-team intel-team legal-team strategy-team; do
    rule_count=$(grep -l "PROVIDER-AWARENESS\|LOCAL-LLM-OPTION" _bmad/$module/agents/*.md 2>/dev/null | wc -l)
    agent_count=$(ls _bmad/$module/agents/*.md 2>/dev/null | wc -l)
    if [ "$rule_count" -eq "$agent_count" ] && [ "$agent_count" -gt 0 ]; then
        echo "   ✅ $module: $rule_count/$agent_count agents inform users of options"
        ((PASS++))
    else
        echo "   ℹ️  $module: $rule_count/$agent_count agents have awareness rules"
        ((INFO++))
    fi
done

# Summary
echo ""
echo "=== SUMMARY ==="
echo "Core Checks Passed: $PASS"
echo "Warnings: $WARN"
echo "Informational: $INFO"
echo ""

echo "=== USER CHOICE VERIFICATION ==="
echo ""
echo "Key Principle: Users ALWAYS choose between Local and Cloud LLM"
echo ""
echo "✓ Users can check current provider:"
echo "    .claude/hooks/llm-provider-manager.sh get"
echo ""
echo "✓ Users can switch to local:"
echo "    .claude/hooks/llm-provider-manager.sh set ollama"
echo ""
echo "✓ Users can switch to cloud:"
echo "    .claude/hooks/llm-provider-manager.sh set claude"
echo ""

if [ $WARN -eq 0 ]; then
    echo "✅ User choice infrastructure ready!"
else
    echo "⚠️  Some items need attention. See warnings above."
fi
```

---

## 10. Testing & Validation

### 10.1 Test Plan (Revised)

| Test ID | Description | Steps | Expected |
|---------|-------------|-------|----------|
| T1 | Ollama health | `curl localhost:11434/api/tags` | Models listed |
| T2 | Provider check | `.claude/hooks/llm-provider-manager.sh get` | Shows active provider |
| T3 | Provider switch | `set ollama` then `get` | Shows ollama |
| T4 | Module routing | Enable routing, start cybersec workflow | Uses ollama |
| T5 | Agent awareness | Start agent, check for provider info | Agent mentions provider |
| T6 | Audit logging | Complete workflow, check audit-logs/ | Log entry with provider |

### 10.2 Validation Checklist (User Choice Focused)

```markdown
# Data Sensitivity v2.1 Validation - User Choice Emphasis

**Date:** ___________
**Validator:** ___________

## User Choice Infrastructure
- [ ] Users can access local LLM (Ollama available)
- [ ] Users can access cloud LLM (Claude available)
- [ ] Provider manager script allows switching BOTH directions
- [ ] Users can check current provider (.../llm-provider-manager.sh get)

## Provider Switching (Core Requirement)
- [ ] Switch to local works: .../llm-provider-manager.sh set ollama
- [ ] Switch to cloud works: .../llm-provider-manager.sh set claude
- [ ] User choice persists for session
- [ ] Clear override works: .../llm-provider-manager.sh clear

## Optional Configuration
- [ ] Module routing available (if organization wants defaults)
- [ ] Module routing is OPTIONAL, not required
- [ ] Users can override any module routing

## Documentation
- [ ] LLM-PROVIDER-SYSTEM.md documents both options
- [ ] User choice is emphasized, not forced
- [ ] Both local and cloud options presented equally

## Agent Rules (Informational Only)
- [ ] Agents inform users of current provider
- [ ] Agents present BOTH options (local and cloud)
- [ ] Rules do NOT force or block any provider choice

## Audit
- [ ] Audit logs capture which provider USER CHOSE
- [ ] No blocking or restriction based on provider

## Key Principle Verification
- [ ] User can ALWAYS choose local
- [ ] User can ALWAYS choose cloud
- [ ] System INFORMS but never FORCES

**Implementation Complete:** YES / NO
**User Choice Preserved:** YES / NO
```

---

## Summary: Revised Implementation

### Phase Overview

| Phase | Description | Effort | Priority |
|-------|-------------|--------|----------|
| **0** | Enable Provider Routing | 1-2h | P1 CRITICAL |
| **1** | Documentation (Provider Guide) | 2-3h | P2 HIGH |
| **2** | Agent Provider Awareness | 4-6h | P3 MEDIUM |
| **3** | Workflow Provider Status | 2-4h | P4 LOW |
| **4** | Audit Logging with Provider | 4-6h | P2 HIGH |
| **5** | Lessons Learned Update | 1-2h | P3 MEDIUM |

**Total: 15-25 hours** (reduced from 40-60)

### Key Message

> **User choice is paramount. The Local LLM Provider System provides options, not restrictions.**
>
> Complex data classification, blocking, and anonymization are replaced by simple provider choice.
> Users can select local LLM when they want data to stay on-premise, or cloud LLM when they prefer.
> The system informs; the user decides.

### Immediate Actions

1. **Verify Ollama available** as a local option (5 min)
2. **Optionally configure module routing** in `llm-config.yaml` (5 min)
3. **Test provider switching** - ensure users can choose either option (10 min)

---

*Document Version: 2.1*
*Updated: 2026-01-11*
*Status: Revised for User Choice & Local LLM Support*
*Key Principle: User always chooses between Local and Cloud LLM*
*Supersedes: Version 1.0 (cloud-only approach), Version 2.0 (local-LLM-focused)*
