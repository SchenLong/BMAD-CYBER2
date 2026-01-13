# BMAD-CYBERSEC Sensitive Data Risk Remediation Plan v2.0

**Created:** 2026-01-11
**Updated:** 2026-01-11 (v2.0 - Local LLM Support)
**Status:** REVISED - Incorporates Local LLM Capability
**Priority:** MEDIUM (reduced from HIGH due to local LLM option)

---

## Executive Summary

This revised remediation plan accounts for the **Local LLM Provider System** now implemented in BMAD-CYBERSEC. The ability to route sensitive workflows to local LLMs (Ollama, LM Studio, vLLM, llama.cpp) **fundamentally changes the risk landscape** by enabling on-premise processing where data never leaves the organization's infrastructure.

### Key Change: Local LLM = Corporate Data Safeguard

```
BEFORE: All data → Anthropic Claude API → Third-party infrastructure
AFTER:  Sensitive data → Local LLM (localhost) → Stays on-premise
        General data → Claude API → Cloud (with user awareness)
```

### Revised Risk Assessment

| Scenario | Before Local LLM | After Local LLM |
|----------|------------------|-----------------|
| Confidential security data | 🔴 HIGH - Cloud exposure | 🟢 LOW - Use Ollama |
| Attorney-client privilege | 🔴 CRITICAL - Privilege waiver | 🟡 MEDIUM - Local option available |
| PII processing | 🔴 HIGH - Compliance risk | 🟢 LOW - Local processing |
| Trade secrets | 🔴 HIGH - Third-party exposure | 🟢 LOW - Air-gapped option |
| Active breach response | 🔴 CRITICAL - Victim data | 🟢 LOW - Offline capable |

### Revised Remediation Priorities

| Priority | Before | After | Reason |
|----------|--------|-------|--------|
| Data Classification | P1 CRITICAL | P2 HIGH | Local LLM removes urgency |
| Agent Data Rules | P1 CRITICAL | P3 MEDIUM | Provider routing handles risk |
| Audit Logging | P2 HIGH | P2 HIGH | Still valuable for governance |
| User Guidance | P2 HIGH | P1 HIGH | Critical for provider selection |
| Provider Routing | N/A | P1 CRITICAL | **NEW**: Enable module-specific routing |

---

## Revised Architecture

### Current System Architecture

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
│   (SECURE)      │ │   (SECURE)      │ │   (EXTERNAL)    │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • Ollama        │ │ • LM Studio     │ │ • Claude ⚠️     │
│ • vLLM          │ │ • llama.cpp     │ │ • OpenAI ⚠️     │
│                 │ │                 │ │ • Groq ⚠️       │
│ 🔒 ON-PREMISE   │ │ 🔒 ON-PREMISE   │ │ ☁️ CLOUD        │
│ NO DATA EGRESS  │ │ NO DATA EGRESS  │ │ DATA EGRESS     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Recommended Configuration

**Enable module-specific routing in `_bmad/_config/llm-config.yaml`:**

```yaml
# SECURITY-FOCUSED MODULE ROUTING
module_overrides:
  # HIGH RISK MODULES → LOCAL LLM (data stays on-premise)
  cybersec-team: ollama      # Security data, vulnerabilities, incidents
  intel-team: ollama         # Intelligence operations, target data
  legal-team: ollama         # Attorney-client privilege protection

  # MEDIUM RISK MODULES → LOCAL LLM (recommended)
  strategy-team: ollama      # Trade secrets, competitive intelligence

  # LOW RISK MODULES → CLOUD OK (better quality, optional)
  bmm: claude                # Software development (no sensitive data)
  bmgd: claude               # Game development (no sensitive data)
  cis: claude                # Creative content (generally safe)
  bmb: claude                # Framework building (no sensitive data)
  core: claude               # Project management (user choice)
```

---

## Revised Phase Plan

### Phase 0: Provider Routing Configuration (NEW - IMMEDIATE)

**Priority:** P1 CRITICAL
**Effort:** 1-2 hours
**Impact:** Immediate risk reduction

#### 0.1 Enable Module-Specific Routing

**File:** `_bmad/_config/llm-config.yaml`

**Change from:**
```yaml
module_overrides:
  # strategy-team: claude    # Keep executive decisions on Claude
  # legal-team: claude       # Legal advice stays on Claude
  # cybersec-team: ollama    # Security analysis on local
  # bmm: ollama              # Dev workflows on local
```

**Change to:**
```yaml
module_overrides:
  # HIGH-RISK: Route to local LLM for data protection
  cybersec-team: ollama      # Security data stays local
  intel-team: ollama         # Intelligence data stays local
  legal-team: ollama         # Protect attorney-client privilege
  strategy-team: ollama      # Protect trade secrets

  # LOW-RISK: Can use cloud for quality (optional)
  # bmm: claude              # Uncomment for cloud processing
  # bmgd: claude             # Uncomment for cloud processing
  # cis: claude              # Uncomment for cloud processing
```

#### 0.2 Verify Local LLM Availability

**Script:** Check that Ollama is running and has required models

```bash
#!/bin/bash
# verify-local-llm.sh

echo "=== Verifying Local LLM Setup ==="

# Check Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"

    # Check for recommended models
    MODELS=$(curl -s http://localhost:11434/api/tags | jq -r '.models[].name')
    echo "   Available models: $MODELS"

    if echo "$MODELS" | grep -q "nemotron-mini\|mistral\|llama"; then
        echo "✅ Suitable model available"
    else
        echo "⚠️  Consider pulling a model: ollama pull nemotron-mini"
    fi
else
    echo "❌ Ollama not running - Start with: ollama serve"
    echo "   High-risk modules will fall back to Claude (cloud)!"
fi
```

#### 0.3 Update Documentation

Add to `docs/LLM-PROVIDER-SYSTEM.md`:

```markdown
## Security Recommendation: Module Routing

For organizations handling sensitive data, we recommend routing high-risk modules
to local LLMs:

| Module | Recommended Provider | Reason |
|--------|---------------------|--------|
| cybersec-team | ollama (local) | Security data, vulnerabilities |
| intel-team | ollama (local) | Intelligence operations |
| legal-team | ollama (local) | Attorney-client privilege |
| strategy-team | ollama (local) | Trade secrets, M&A data |

**To enable:** Uncomment the `module_overrides` section in `_bmad/_config/llm-config.yaml`
```

---

### Phase 1: Simplified Documentation (Reduced Scope)

**Priority:** P2 HIGH
**Effort:** 2-3 hours (reduced from 4-6)
**Impact:** User awareness of provider choice

#### 1.1 Create Provider Selection Guide

**File:** `docs/DATA-SENSITIVITY-GUIDE.md` (simplified from original policy)

```markdown
# BMAD-CYBERSEC Data Sensitivity & Provider Selection Guide

## Quick Reference: When to Use Local vs Cloud LLM

### 🔒 USE LOCAL LLM (Ollama/LM Studio) FOR:

| Data Type | Examples | Why Local |
|-----------|----------|-----------|
| Security incidents | Breach data, IOCs, victim info | Data stays on-premise |
| Vulnerability details | CVEs, exploit paths, targets | No external exposure |
| Intelligence data | Target profiles, campaigns | Privacy/legal protection |
| Legal matters | Contracts, disputes, privilege | Privilege protection |
| Trade secrets | M&A, competitive intel | Corporate confidentiality |
| PII | Customer data, employee records | Compliance (GDPR, HIPAA) |

**How:** Module routing automatically uses Ollama for cybersec/intel/legal/strategy

### ☁️ CLOUD LLM (Claude) IS FINE FOR:

| Data Type | Examples | Why Cloud OK |
|-----------|----------|--------------|
| Public information | Framework research, best practices | No sensitivity |
| Generic development | Code without secrets, architecture | No PII |
| Creative content | Brainstorming, presentations | No confidential data |
| Training/education | Learning, methodology development | Synthetic data only |

### 🔄 Provider Commands

```bash
# Check current provider
.claude/hooks/llm-provider-manager.sh get

# Switch to local for current session
.claude/hooks/llm-provider-manager.sh set ollama

# Switch back to cloud
.claude/hooks/llm-provider-manager.sh set claude

# See all provider health
.claude/hooks/llm-provider-manager.sh health-all
```

## Automatic Module Routing

When `module_overrides` is configured in `llm-config.yaml`:

```
cybersec-team workflows → Ollama (local) → Data stays on-premise
intel-team workflows    → Ollama (local) → Data stays on-premise
legal-team workflows    → Ollama (local) → Data stays on-premise
strategy-team workflows → Ollama (local) → Data stays on-premise

bmm workflows           → Claude (cloud) → External processing
bmgd workflows          → Claude (cloud) → External processing
cis workflows           → Claude (cloud) → External processing
```

## Override for Specific Sessions

Even with module routing, you can override for a single session:

```bash
# Force local LLM for everything in this session
.claude/hooks/llm-provider-manager.sh set ollama

# Force cloud for everything (e.g., need higher quality)
.claude/hooks/llm-provider-manager.sh set claude
```
```

#### 1.2 Update Root README Security Section

**Modify existing section in README.md:**

```markdown
## 🔐 Data Sensitivity & Privacy

BMAD-CYBERSEC supports **multiple LLM providers** including local options that keep your data on-premise.

### Provider Options

| Provider Type | Data Location | Use For |
|---------------|---------------|---------|
| **Local (Ollama, LM Studio)** | Your machine | Sensitive data, compliance |
| **Cloud (Claude, OpenAI)** | External API | General use, quality priority |

### Recommended Configuration

High-risk modules (cybersec-team, intel-team, legal-team, strategy-team) can be automatically routed to local LLMs:

```bash
# Enable in _bmad/_config/llm-config.yaml:
module_overrides:
  cybersec-team: ollama    # Security data stays local
  intel-team: ollama       # Intelligence data stays local
  legal-team: ollama       # Legal privilege protected
  strategy-team: ollama    # Trade secrets protected
```

See [LLM Provider System](docs/LLM-PROVIDER-SYSTEM.md) and [Data Sensitivity Guide](docs/DATA-SENSITIVITY-GUIDE.md) for details.
```

---

### Phase 2: Agent Provider Awareness (NEW - Replaces Data Rules)

**Priority:** P3 MEDIUM
**Effort:** 4-6 hours (reduced from 8-12)
**Impact:** Agents inform users of provider being used

Instead of complex data classification rules, agents should simply inform users which provider is active.

#### 2.1 Provider Awareness Rule (Simpler than Data Sensitivity Rule)

**Add to all 79 agents:**

```xml
<r critical="PROVIDER-AWARENESS">🔐 PROVIDER AWARENESS: At the start of any session involving potentially sensitive data, inform the user which LLM provider is active. If using a cloud provider (Claude, OpenAI, Groq) for high-risk modules (cybersec-team, intel-team, legal-team, strategy-team), remind the user they can switch to local LLM with: `.claude/hooks/llm-provider-manager.sh set ollama`. For truly sensitive operations, recommend verifying local provider is active before proceeding.</r>
```

This is much simpler than the original data classification rule because:
- The provider routing handles the actual risk mitigation
- The agent just needs to inform, not block or classify
- Users can easily switch if needed

#### 2.2 High-Risk Module Additional Rule

**Add to cybersec-team, intel-team, legal-team, strategy-team agents only:**

```xml
<r critical="LOCAL-LLM-RECOMMENDED">⚠️ SENSITIVE MODULE: This module typically processes sensitive data. For maximum data protection, verify you are using a local LLM provider (Ollama, LM Studio) before providing confidential information. Check with: `.claude/hooks/llm-provider-manager.sh get`. If using cloud provider, data will be transmitted to external APIs.</r>
```

---

### Phase 3: Simplified Workflow Modifications (Reduced Scope)

**Priority:** P4 LOW
**Effort:** 2-4 hours (reduced from 6-8)
**Impact:** Provider status in workflow outputs

Instead of complex classification steps, workflows just need to record which provider was used.

#### 3.1 Provider Status in Output Frontmatter

Add to workflow output templates:

```yaml
---
# ... existing frontmatter ...
processing:
  llm_provider: "{active_provider}"
  provider_type: "local|cloud"
  data_locality: "on-premise|external"
  timestamp: "{ISO-8601}"
---
```

#### 3.2 Simplified Output Footer

```markdown
---

## Processing Information

**LLM Provider:** {provider_name}
**Data Locality:** {on-premise | external (cloud)}
**Generated:** {timestamp}

{if cloud provider}
⚠️ This document was generated using cloud LLM ({provider_name}).
Input data was transmitted to external infrastructure.
{/if}

{if local provider}
🔒 This document was generated using local LLM ({provider_name}).
All data remained on-premise.
{/if}
```

---

### Phase 4: Audit Logging (Unchanged Priority)

**Priority:** P2 HIGH
**Effort:** 4-6 hours
**Impact:** Governance and compliance tracking

The audit logging remains valuable for tracking:
- Which provider was used for each workflow
- When users switched between local and cloud
- Compliance evidence that sensitive data used local LLM

#### 4.1 Enhanced Audit Entry with Provider Info

```yaml
audit_entry:
  # ... existing fields ...

  llm_provider:
    active_provider: "ollama"
    provider_type: "local"
    data_locality: "on-premise"
    provider_verified: true
    fallback_used: false

  data_protection:
    used_local_llm: true
    cloud_api_called: false
    data_egress: false
```

---

### Phase 5: Lessons Learned Update

**Priority:** P3 MEDIUM
**Effort:** 1-2 hours

#### 5.1 Add Lesson 15 (Revised)

```markdown
### Lesson 15: Provider Selection for Data Sensitivity

**Context:** BMAD-CYBERSEC supports multiple LLM providers including local options
(Ollama, LM Studio, vLLM) that keep data on-premise and cloud options (Claude, OpenAI)
that transmit data to external APIs.

**Best Practice:** Route high-risk modules to local LLM providers by default:

```yaml
# _bmad/_config/llm-config.yaml
module_overrides:
  cybersec-team: ollama    # Security data
  intel-team: ollama       # Intelligence data
  legal-team: ollama       # Legal privilege
  strategy-team: ollama    # Trade secrets
```

**Agent Rule:** All agents should include provider awareness rule to inform users
of active provider and offer switch option for sensitive operations.

**Verification:** Use `.claude/hooks/llm-provider-manager.sh get` to verify
provider before processing sensitive data.

**DO NOT:** Process highly sensitive data (PII, active breaches, privileged
communications) through cloud providers without explicit user acknowledgment.

---

*Lesson 15 (Provider Selection for Data Sensitivity) Added: 2026-01-XX*
```

---

## Removed/Simplified Items

The following items from the original plan are **no longer needed** or significantly reduced:

| Original Item | Status | Reason |
|---------------|--------|--------|
| Complex 4-tier classification system | **REMOVED** | Provider routing handles risk |
| step-00-data-classification.md | **REMOVED** | Not needed with auto-routing |
| Extensive anonymization guides | **SIMPLIFIED** | Local LLM removes need |
| Classification acknowledgments | **REMOVED** | Provider choice is sufficient |
| Restricted data blocking | **SIMPLIFIED** | Local LLM allows all data |
| Module-specific data handling rules (complex) | **SIMPLIFIED** | Provider awareness only |
| 15 workflow modifications | **REDUCED** | Provider status only |
| DATA-SENSITIVITY-POLICY.md (lengthy) | **REPLACED** | Simpler provider guide |

---

## Revised Implementation Summary

### New Effort Estimate: 15-25 hours (reduced from 40-60)

| Phase | Description | Effort | Priority |
|-------|-------------|--------|----------|
| **0** | Provider Routing Configuration | 1-2h | P1 CRITICAL |
| **1** | Documentation (Provider Guide) | 2-3h | P2 HIGH |
| **2** | Agent Provider Awareness Rules | 4-6h | P3 MEDIUM |
| **3** | Simplified Workflow Updates | 2-4h | P4 LOW |
| **4** | Audit Logging (with provider info) | 4-6h | P2 HIGH |
| **5** | Lessons Learned Update | 1-2h | P3 MEDIUM |

### Immediate Actions (Do Now)

1. **Enable module_overrides** in `llm-config.yaml` (5 minutes)
2. **Verify Ollama is running** with suitable model (5 minutes)
3. **Test high-risk workflow** routes to Ollama (10 minutes)

### Success Criteria

| Metric | Target |
|--------|--------|
| High-risk modules route to local LLM | 100% |
| Users informed of active provider | All sessions |
| Audit logs record provider used | All workflows |
| Documentation updated | Complete |

---

## Conclusion

The Local LLM Provider System transforms BMAD-CYBERSEC's data sensitivity posture:

**Before:** Complex classification, blocking, anonymization required
**After:** Route sensitive modules to local LLM, data never leaves premises

The original 40-60 hour remediation is reduced to **15-25 hours** with better protection through architectural safeguards rather than procedural controls.

**Key Message:** For sensitive data, use local LLM. The infrastructure protects you.

---

*Document Version: 2.0*
*Supersedes: SENSITIVE-DATA-REMEDIATION-PLAN.md (v1.0)*
*Status: Revised for Local LLM Support*
