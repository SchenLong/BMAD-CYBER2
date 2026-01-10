---
name: 'phase-02-technical-intelligence'
description: 'Model analysis, infrastructure analysis, code and research review for AI entities'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-ai'
thisStepFile: '{workflow_path}/steps/phase-02-technical-intelligence.md'
nextStepFile: '{workflow_path}/steps/phase-03-digital-infrastructure.md'
prevStepFile: '{workflow_path}/steps/phase-01-campaign-initialization.md'

# Agent Configuration
executing_agent: technical-researcher
agent_codename: Probe
---

# Phase 2: Technical Intelligence

## PHASE GOAL

Conduct comprehensive technical analysis of the AI entity including model architecture, capabilities, infrastructure, code repositories, and research publications. This phase produces the foundational technical assessment.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Probe**, Technical Researcher
- You specialize in technical intelligence and deep system analysis
- You assess AI capabilities, architectures, and vulnerabilities
- You analyze code, papers, and technical documentation

### Analysis Protocol
- Analyze published papers and technical reports
- Review model documentation and capabilities
- Assess infrastructure and compute resources
- Examine code repositories and contributions
- Document technical vulnerabilities

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Model Analysis

Analyze AI model characteristics:

```
MODEL ANALYSIS
==============

Model Identification:
| Field | Value | Source |
|-------|-------|--------|
| Model Name | [name] | [source] |
| Version | [version] | [source] |
| Release Date | [date] | [source] |
| Model Family | [family] | [source] |
| Developer | [organization] | [source] |

Architecture Assessment:
| Characteristic | Value | Confidence | Source |
|----------------|-------|------------|--------|
| Model Type | [transformer/MoE/hybrid/etc] | [H/M/L] | [source] |
| Parameter Count | [count] | [H/M/L] | [source] |
| Context Window | [tokens] | [H/M/L] | [source] |
| Hidden Dimensions | [dimensions] | [H/M/L] | [source] |
| Attention Heads | [count] | [H/M/L] | [source] |
| Layers | [count] | [H/M/L] | [source] |
| Vocabulary Size | [size] | [H/M/L] | [source] |

Training Methodology:
| Aspect | Details | Source |
|--------|---------|--------|
| Pre-training approach | [description] | [source] |
| Fine-tuning methods | [RLHF/SFT/DPO/etc] | [source] |
| Training data scale | [tokens/examples] | [source] |
| Training duration | [GPU hours/days] | [source] |
| Compute requirements | [GPUs/TPUs] | [source] |

Multimodal Capabilities:
| Modality | Supported | Capabilities | Source |
|----------|-----------|--------------|--------|
| Text | [Y/N] | [generation/understanding] | [source] |
| Images | [Y/N] | [input/output] | [source] |
| Audio | [Y/N] | [speech/music] | [source] |
| Video | [Y/N] | [understanding/generation] | [source] |
| Code | [Y/N] | [generation/execution] | [source] |

□ Architecture documented: [Y/N]
□ Training methodology known: [Y/N]
□ Multimodal capabilities assessed: [Y/N]
```

### 2. Capability Assessment

Evaluate model capabilities and performance:

```
CAPABILITY ASSESSMENT
=====================

Benchmark Performance:
| Benchmark | Score | Ranking | Date | Source |
|-----------|-------|---------|------|--------|
| MMLU | [score] | [rank vs competitors] | [date] | [source] |
| HumanEval | [score] | [rank] | [date] | [source] |
| MATH | [score] | [rank] | [date] | [source] |
| GSM8K | [score] | [rank] | [date] | [source] |
| HellaSwag | [score] | [rank] | [date] | [source] |
| WinoGrande | [score] | [rank] | [date] | [source] |
| ARC | [score] | [rank] | [date] | [source] |
| TruthfulQA | [score] | [rank] | [date] | [source] |
| [domain-specific] | [score] | [rank] | [date] | [source] |

Emergent Abilities:
| Ability | Observed | Evidence | Source |
|---------|----------|----------|--------|
| Chain-of-thought reasoning | [Y/N] | [description] | [source] |
| In-context learning | [Y/N] | [description] | [source] |
| Tool use | [Y/N] | [description] | [source] |
| Function calling | [Y/N] | [description] | [source] |
| Code execution | [Y/N] | [description] | [source] |
| Multi-step planning | [Y/N] | [description] | [source] |
| Self-reflection | [Y/N] | [description] | [source] |

Comparative Analysis:
| Capability | vs Competitor A | vs Competitor B | vs Competitor C |
|------------|-----------------|-----------------|-----------------|
| Reasoning | [better/equal/worse] | [comparison] | [comparison] |
| Coding | [comparison] | [comparison] | [comparison] |
| Math | [comparison] | [comparison] | [comparison] |
| Creative writing | [comparison] | [comparison] | [comparison] |
| Instruction following | [comparison] | [comparison] | [comparison] |
| Safety | [comparison] | [comparison] | [comparison] |

Known Limitations:
| Limitation | Description | Severity | Source |
|------------|-------------|----------|--------|
| [hallucination patterns] | [description] | [H/M/L] | [source] |
| [knowledge cutoff] | [description] | [severity] | [source] |
| [reasoning failures] | [description] | [severity] | [source] |
| [bias patterns] | [description] | [severity] | [source] |

□ Benchmarks collected: [count]
□ Comparative analysis complete: [Y/N]
□ Limitations documented: [count]
```

### 3. Training Data Analysis

Assess training data and data pipeline:

```
TRAINING DATA ANALYSIS
======================

Known Data Sources:
| Source Type | Datasets | Scale | Source |
|-------------|----------|-------|--------|
| Web crawl | [CommonCrawl, etc] | [tokens/size] | [source] |
| Books | [datasets] | [scale] | [source] |
| Code | [GitHub, etc] | [scale] | [source] |
| Scientific papers | [datasets] | [scale] | [source] |
| Proprietary data | [if known] | [scale] | [source] |
| Synthetic data | [methods] | [scale] | [source] |

Data Curation:
| Aspect | Approach | Details | Source |
|--------|----------|---------|--------|
| Deduplication | [method] | [effectiveness] | [source] |
| Quality filtering | [method] | [criteria] | [source] |
| Toxicity filtering | [method] | [thresholds] | [source] |
| PII removal | [method] | [approach] | [source] |
| Copyright handling | [approach] | [details] | [source] |

RLHF/Alignment Data:
| Component | Details | Source |
|-----------|---------|--------|
| Human feedback collection | [method] | [source] |
| Preference data scale | [size] | [source] |
| Reward model architecture | [details] | [source] |
| Constitutional AI rules | [if applicable] | [source] |
| Red team methodology | [approach] | [source] |

Data Controversies:
| Issue | Status | Response | Source |
|-------|--------|----------|--------|
| [copyright concerns] | [ongoing/resolved] | [company response] | [source] |
| [privacy issues] | [status] | [response] | [source] |
| [bias allegations] | [status] | [response] | [source] |

□ Data sources identified: [count]
□ Curation methods documented: [Y/N]
□ Controversies tracked: [count]
```

### 4. Infrastructure Analysis

Assess compute and infrastructure:

```
INFRASTRUCTURE ANALYSIS
=======================

Compute Resources:
| Resource | Details | Scale | Source |
|----------|---------|-------|--------|
| GPU type | [H100/A100/TPU] | [count] | [source] |
| Training cluster | [provider/custom] | [capacity] | [source] |
| Training time | [duration] | [cost estimate] | [source] |
| Cloud provider | [AWS/GCP/Azure/custom] | [usage] | [source] |

Training Infrastructure:
| Component | Details | Source |
|-----------|---------|--------|
| Distributed training framework | [framework] | [source] |
| Parallelism strategy | [data/model/pipeline] | [source] |
| Checkpointing approach | [details] | [source] |
| Fault tolerance | [approach] | [source] |

Serving Infrastructure:
| Component | Details | Source |
|-----------|---------|--------|
| Inference hardware | [GPU/TPU type] | [source] |
| Serving framework | [vLLM/TensorRT/custom] | [source] |
| Geographic distribution | [regions] | [source] |
| Latency targets | [ms] | [source] |
| Throughput capacity | [requests/second] | [source] |

Cloud Footprint:
| Provider | Services Used | Evidence | Source |
|----------|---------------|----------|--------|
| AWS | [services] | [job posts, DNS] | [source] |
| GCP | [services] | [evidence] | [source] |
| Azure | [services] | [evidence] | [source] |
| Custom/On-prem | [details] | [evidence] | [source] |

Cost Estimates:
| Category | Estimate | Basis | Confidence |
|----------|----------|-------|------------|
| Training cost | [$X million] | [calculation] | [H/M/L] |
| Inference cost/query | [$X] | [calculation] | [H/M/L] |
| Annual compute spend | [$X] | [inference] | [H/M/L] |

□ Compute resources mapped: [Y/N]
□ Cloud providers identified: [count]
□ Cost estimates developed: [Y/N]
```

### 5. Code & Research Analysis

Analyze open source code and publications:

```
CODE & RESEARCH ANALYSIS
========================

GitHub Repositories:
| Repository | Stars | Forks | Last Update | Content |
|------------|-------|-------|-------------|---------|
| [org/repo] | [count] | [count] | [date] | [description] |

Code Analysis:
| Repository | Key Findings | Security Notes |
|------------|--------------|----------------|
| [repo] | [architecture, techniques] | [vulnerabilities, exposures] |

Research Publications:
| Paper | Venue | Date | Key Contributions |
|-------|-------|------|-------------------|
| [title] | [arXiv/NeurIPS/ICML] | [date] | [findings] |

Patent Filings:
| Patent | Filing Date | Status | Technology Area |
|--------|-------------|--------|-----------------|
| [patent #/title] | [date] | [pending/granted] | [area] |

Technical Blog Posts:
| Title | Date | Key Insights |
|-------|------|--------------|
| [title] | [date] | [technical details revealed] |

Conference Presentations:
| Event | Date | Speaker | Topic |
|-------|------|---------|-------|
| [conference] | [date] | [presenter] | [key reveals] |

Citation Analysis:
| Paper | Citations | Impact | Key Citations By |
|-------|-----------|--------|-----------------|
| [paper] | [count] | [field influence] | [notable citers] |

□ Repositories analyzed: [count]
□ Papers reviewed: [count]
□ Patents tracked: [count]
```

### 6. Vulnerability Assessment

Document known vulnerabilities and weaknesses:

```
VULNERABILITY ASSESSMENT
========================

Prompt Injection:
| Vulnerability | Severity | Status | Source |
|---------------|----------|--------|--------|
| Direct injection | [H/M/L] | [patched/unpatched] | [source] |
| Indirect injection | [severity] | [status] | [source] |
| System prompt extraction | [severity] | [status] | [source] |
| Context manipulation | [severity] | [status] | [source] |

Jailbreak Techniques:
| Technique | Effectiveness | Patch Status | Source |
|-----------|---------------|--------------|--------|
| [DAN variants] | [H/M/L] | [status] | [source] |
| [Roleplay attacks] | [effectiveness] | [status] | [source] |
| [Token manipulation] | [effectiveness] | [status] | [source] |
| [Multi-turn attacks] | [effectiveness] | [status] | [source] |

Safety Filter Bypasses:
| Bypass Type | Status | Details | Source |
|-------------|--------|---------|--------|
| [category bypass] | [working/patched] | [method] | [source] |

API Security:
| Issue | Severity | Status | Source |
|-------|----------|--------|--------|
| Rate limiting | [adequate/weak] | [details] | [source] |
| Authentication | [status] | [issues] | [source] |
| Data leakage | [risk level] | [evidence] | [source] |

Bug Bounty Findings:
| Finding | Severity | Status | Bounty |
|---------|----------|--------|--------|
| [vulnerability] | [H/M/L] | [fixed/pending] | [$X] |

□ Injection vulnerabilities: [count]
□ Jailbreaks documented: [count]
□ API issues: [count]
```

### 7. Technical Intelligence Summary

Compile technical findings:

```
TECHNICAL INTELLIGENCE SUMMARY
==============================

Model Profile:
| Attribute | Value | Confidence |
|-----------|-------|------------|
| Architecture | [type] | [H/M/L] |
| Parameters | [count] | [confidence] |
| Context | [tokens] | [confidence] |
| Capabilities | [summary] | [confidence] |
| Known limitations | [summary] | [confidence] |

Technical Capabilities Assessment:
| Capability | Rating | Evidence Basis |
|------------|--------|----------------|
| Overall performance | [1-10] | [benchmarks] |
| Reasoning | [1-10] | [evidence] |
| Coding | [1-10] | [evidence] |
| Safety/alignment | [1-10] | [evidence] |
| Multimodal | [1-10] | [evidence] |

Infrastructure Profile:
| Component | Details | Confidence |
|-----------|---------|------------|
| Training compute | [scale] | [H/M/L] |
| Cloud providers | [list] | [H/M/L] |
| Serving infrastructure | [details] | [H/M/L] |
| Cost structure | [estimate] | [H/M/L] |

Vulnerability Summary:
| Category | Count | Severity Distribution |
|----------|-------|----------------------|
| Prompt injection | [count] | [H/M/L breakdown] |
| Jailbreaks | [count] | [distribution] |
| API issues | [count] | [distribution] |

Collection Gaps:
| Gap | Priority | Recommended Action |
|-----|----------|-------------------|
| [gap] | [H/M/L] | [action] |

HANDOFF TO RESOLVER (Phase 3):
- Primary domains: [list]
- API endpoints: [list]
- Cloud services: [list]
- CDN/proxy indicators: [list]
```

---

## PHASE 2 OUTPUT

```markdown
## TECHNICAL INTELLIGENCE COMPLETE

### Model Summary
- Architecture: [type]
- Parameters: [count]
- Capabilities: [key capabilities]
- Performance: [benchmark summary]

### Infrastructure Summary
- Training: [compute profile]
- Serving: [infrastructure]
- Cloud: [providers]

### Vulnerability Summary
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

### Key Findings
1. [Most significant technical finding]
2. [Second finding]
3. [Third finding]

### Collection Gaps
- [Gap 1]
- [Gap 2]

### Next Phase
Phase 3: Digital Infrastructure (Resolver)
Focus: [domains, APIs, cloud footprint]
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 3:
- [ ] Model architecture analyzed
- [ ] Capabilities assessed
- [ ] Infrastructure mapped
- [ ] Code/research reviewed
- [ ] Vulnerabilities documented
- [ ] Handoff prepared for Resolver

---

## MENU OPTIONS

**[C] Continue** - Proceed to digital infrastructure analysis (Phase 3)
**[M] Model** - Deeper model analysis
**[V] Vulnerabilities** - Extended vulnerability research
**[R] Research** - Additional paper/code analysis

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/phase-03-digital-infrastructure.md`
