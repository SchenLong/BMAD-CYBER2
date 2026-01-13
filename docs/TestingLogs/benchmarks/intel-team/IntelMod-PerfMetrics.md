# Performance Metrics - BMAD Intel-Team Benchmark

## Executive Summary

| Model | Total Time | Tokens Generated | Tokens/sec | Avg/Agent | Mode |
|-------|------------|------------------|------------|-----------|------|
| **Claude Opus 4.5** | ~35s | ~6,500 | N/A (API) | N/A | Concurrent |
| **GPT-OSS-20B** | 108.73s | ~8,500 | **~78.20** | 15.53s | Sequential |
| **nemotron-mini** | 83.72s | ~4,800 | ~57.33 | 11.96s | Sequential |
| **Qwen3-VL-30B** | 190.97s | ~10,500 | ~55.00 | 27.28s | Sequential |
| **Qwen 32B Abliterated** | 412.97s | ~7,500 | ~18.16 | 58.99s | Sequential |

*Note: Claude Opus 4.5 metrics are API-based (cloud inference) and not directly comparable to local t/s metrics*

---

## Key Findings

### 1. Intelligence Tasks Require More Output

Compared to the Strategy benchmark, the Intel benchmark generated **significantly more tokens per response**. This reflects the technical nature of intelligence analysis:
- Infrastructure IOCs (IPs, domains, hashes)
- Attribution matrices with confidence levels
- Timeline analysis with multiple data points
- Detailed defensive recommendations

Average tokens per agent increased by ~15-20% compared to strategy tasks.

### 2. GPT-OSS-20B Remains Speed Champion

GPT-OSS-20B maintained its speed advantage at ~78 t/s (slightly lower than the 106 t/s in Strategy benchmark due to longer responses). It produced comprehensive intelligence reports in just ~15 seconds per agent.

### 3. Qwen3-VL-30B Slower but Thorough

Qwen3-VL-30B took 27+ seconds per agent but produced the most detailed technical analysis among local models:
- Full MITRE ATT&CK mappings
- Detailed infrastructure tables
- Comprehensive timeline rationale
- Multi-hypothesis attribution

### 4. Abliterated Model Still Slowest

The Qwen 32B Abliterated model spent **50-60% of each response in `<think>` tags** before producing output. This Chain-of-Thought overhead added significant latency without improving quality.

---

## Tokens Per Second Comparison

```
GPT-OSS-20B:          ████████████████████████████████████████████████████████████████ 78.20 t/s
nemotron-mini:        █████████████████████████████████████████████████                57.33 t/s
Qwen3-VL-30B:         █████████████████████████████████████████████                    55.00 t/s
Qwen 32B Abliterated: ███████████████                                                  18.16 t/s
                      0        20        40        60        80       100
```

**GPT-OSS-20B is 4.3x faster** than Qwen 32B Abliterated.

---

## Per-Agent Response Times

### Qwen3-VL-30B (30B params) - Best Local Quality

| Agent | Time | Notes |
|-------|------|-------|
| Dossier | 27.30s | Threat actor profiling |
| Resolver | 27.27s | Domain/network intel |
| Shadow | 27.20s | Dark web analysis |
| Echo | 27.38s | Social media intel |
| Probe | 27.19s | Technical research |
| Sigil | 27.30s | SIGINT analysis |
| Vector | 27.33s | Fusion/synthesis |
| **TOTAL** | **190.97s** | **~27.3s avg per agent** |

Qwen3-VL-30B showed remarkable consistency with almost identical times per agent (σ < 0.1s).

---

### GPT-OSS-20B (20B params) - Fastest Local

| Agent | Time | Notes |
|-------|------|-------|
| Dossier | 16.12s | Attribution analysis |
| Resolver | 15.68s | Infrastructure mapping |
| Shadow | 15.65s | Dark web intel |
| Echo | 15.63s | SOCMINT analysis |
| Probe | 15.64s | Technical fingerprinting |
| Sigil | 14.23s | SIGINT/C2 analysis |
| Vector | 15.77s | All-source fusion |
| **TOTAL** | **108.73s** | **~15.5s avg per agent** |

GPT-OSS-20B maintained consistent ~15-16s per agent, with Vector producing comprehensive BLUF-format reports.

---

### nemotron-mini (4.2B params) - Fastest but Inadequate

| Agent | Time | Notes |
|-------|------|-------|
| Dossier | 11.62s | Basic assessment |
| Resolver | 17.56s | Generic recommendations |
| Shadow | 11.48s | Missing specifics |
| Echo | 12.02s | Low confidence levels |
| Probe | 12.91s | Basic technical analysis |
| Sigil | 11.38s | Generic timeline |
| Vector | 6.74s | Incomplete synthesis |
| **TOTAL** | **83.72s** | **~11.96s avg per agent** |

nemotron-mini was fast but produced generic, non-actionable intelligence. The Vector agent produced only ~200 tokens in 6.7s - far below the detail required.

---

### Qwen 32B Abliterated (32B params) - Slowest Overall

| Agent | Time | Think Tags % | Notes |
|-------|------|--------------|-------|
| Dossier | 60.02s | ~55% | Long reasoning, thin output |
| Resolver | 64.06s | ~50% | Basic infrastructure mapping |
| Shadow | 68.59s | ~45% | Reasonable dark web analysis |
| Echo | 58.48s | ~55% | Generic social engineering |
| Probe | 42.12s | ~40% | Shorter reasoning |
| Sigil | 64.84s | ~50% | Basic timeline |
| Vector | 54.86s | ~45% | Partial synthesis |
| **TOTAL** | **412.97s** | **~49% avg** | **~59s avg per agent** |

The abliterated model spent nearly half of every response reasoning in `<think>` tags. This internal deliberation did NOT produce better results - the model scored only 53.50/100.

---

## Quality vs Performance Analysis

| Model | Score | Time | Tokens | Quality/Speed Ratio |
|-------|-------|------|--------|---------------------|
| **Qwen3-VL-30B** | 91.85 | 190.97s | ~10,500 | **0.48** |
| GPT-OSS-20B | 87.55 | 108.73s | ~8,500 | **0.81** |
| Qwen 32B Abliterated | 53.50 | 412.97s | ~7,500 | 0.13 |
| nemotron-mini | 43.50 | 83.72s | ~4,800 | 0.52 |

**Quality/Speed Ratio** = Score / Total Time (higher is better)

```
GPT-OSS-20B:          █████████████████████████████████████████████████████████████████ 0.81
nemotron-mini:        ████████████████████████████████████████                          0.52
Qwen3-VL-30B:         ██████████████████████████████████████                            0.48
Qwen 32B Abliterated: ██████████                                                        0.13
```

**GPT-OSS-20B has the best quality-to-speed ratio** for intel tasks, but **Qwen3-VL-30B delivers the highest absolute quality**.

---

## Intel vs Strategy Performance Comparison

| Model | Strategy Time | Intel Time | Δ Time | Strategy Score | Intel Score | Δ Score |
|-------|---------------|------------|--------|----------------|-------------|---------|
| Claude Opus 4.5 | ~30s | ~35s | +17% | 95.45 | 97.40 | +2% |
| GPT-OSS-20B | 68.47s | 108.73s | +59% | 77.65 | 87.55 | **+13%** |
| nemotron-mini | 64.91s | 83.72s | +29% | 31.50 | 43.50 | **+38%** |
| Qwen3-VL-30B | 101.99s | 190.97s | +87% | 87.45 | 91.85 | +5% |
| Qwen 32B Abl | 362.52s | 412.97s | +14% | 21.80 | 53.50 | **+145%** |

### Key Insight: All Models Performed Better on Intel Tasks

Every model improved its score on the intelligence benchmark compared to strategy:

1. **Qwen 32B Abliterated improved most (+145%)** - Technical pattern matching preserved despite abliteration
2. **nemotron-mini improved +38%** - Simpler factual recall vs complex ethical reasoning
3. **GPT-OSS-20B improved +13%** - Strong on technical IOCs and infrastructure mapping
4. **Qwen3-VL-30B improved +5%** - Already strong, minor gains
5. **Claude improved +2%** - Near-ceiling performance on both tasks

### Why Intel Tasks Are "Easier" for LLMs

Intelligence analysis relies on:
- **Pattern matching** - Recognizing known TTPs, infrastructure patterns
- **Data correlation** - Connecting IOCs to threat actors
- **Technical accuracy** - Factual domain/IP/wallet information

Strategy tasks require:
- **Ethical reasoning** - Balancing stakeholder interests
- **Nuanced judgment** - Weighing trade-offs
- **Character consistency** - Maintaining advisory personas

Abliteration damages ethical reasoning more than technical pattern matching, explaining the 145% improvement for Qwen-Abliterated on intel vs strategy.

---

## Time to Complete All 7 Agents

```
nemotron-mini:        ████████████████████████                           83.72s
GPT-OSS-20B:          ██████████████████████████████████                108.73s
Qwen3-VL-30B:         █████████████████████████████████████████████████████████████████████████ 190.97s
Qwen 32B Abliterated: ███████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 412.97s
                      0        50       100       150       200       250       300       350       400       450
                                                    Seconds
```

---

## Agent Response Time Variance

| Model | Min Time | Max Time | Range | Std Dev | Consistency |
|-------|----------|----------|-------|---------|-------------|
| Qwen3-VL-30B | 27.19s | 27.38s | 0.19s | **0.07s** | Excellent |
| GPT-OSS-20B | 14.23s | 16.12s | 1.89s | 0.54s | Good |
| nemotron-mini | 6.74s | 17.56s | 10.82s | 3.21s | Poor |
| Qwen 32B Abl | 42.12s | 68.59s | 26.47s | 8.92s | Poor |

**Qwen3-VL-30B shows remarkable consistency** - every agent completed within a 0.2s window. This predictability is valuable for production deployments.

---

## Chain-of-Thought Overhead Analysis (Qwen 32B Abliterated)

The Qwen 32B Abliterated model uses explicit `<think>` tags before producing output. Analysis of the overhead:

| Agent | Total Time | Think Time (est) | Output Time (est) | Think % |
|-------|------------|------------------|-------------------|---------|
| Dossier | 60.02s | ~33s | ~27s | 55% |
| Resolver | 64.06s | ~32s | ~32s | 50% |
| Shadow | 68.59s | ~31s | ~38s | 45% |
| Echo | 58.48s | ~32s | ~26s | 55% |
| Probe | 42.12s | ~17s | ~25s | 40% |
| Sigil | 64.84s | ~32s | ~33s | 50% |
| Vector | 54.86s | ~25s | ~30s | 45% |

**~49% average time spent reasoning** - yet the quality score was only 53.50. The visible reasoning in `<think>` tags showed:
- Correct identification of key indicators
- Reasonable logical steps
- But thin, under-developed final outputs

The abliteration appears to have damaged the model's ability to translate reasoning into comprehensive output.

---

## Hardware Context

All local models tested on:
- **Platform:** macOS Darwin 24.4.0 (Apple Silicon)
- **Inference:**
  - Ollama: nemotron-mini (Q4_K_M quantization)
  - LM Studio: MLX optimized models for Apple Silicon
- **Claude Opus 4.5:** Anthropic API (cloud inference)

---

## Recommendations by Use Case

### For Intel Operations

| Priority | Recommended Model | Rationale |
|----------|-------------------|-----------|
| **Quality** | Claude Opus 4.5 | 97.40 score, production-grade intel |
| **Local Quality** | Qwen3-VL-30B | 91.85 score, best local intel analysis |
| **Speed** | GPT-OSS-20B | 78 t/s with 87.55 quality score |
| **Air-Gapped** | Qwen3-VL-30B | Best quality for offline operations |
| **Avoid** | nemotron-mini, Qwen-Abl | Both produce inadequate intelligence |

### Model Selection Matrix

| Scenario | Model | Why |
|----------|-------|-----|
| Real-time threat assessment | GPT-OSS-20B | Fast enough for live analysis |
| Comprehensive threat package | Qwen3-VL-30B | Most thorough local analysis |
| Multi-agent party mode | Claude Opus 4.5 | Best concurrent performance |
| Sensitive/classified networks | Qwen3-VL-30B | No API calls required |
| Quick IOC extraction | GPT-OSS-20B | Speed + accuracy balance |
| Attribution analysis | Claude Opus 4.5 | Highest confidence levels |

---

## Comparison: Intel vs Strategy Benchmark Conclusions

### Strategy Benchmark Findings
1. Abliterated models were catastrophic (21.80 score)
2. Ethical reasoning was completely broken
3. Parameter count didn't predict quality

### Intel Benchmark Findings
1. Abliterated models partially functional (53.50 score)
2. Technical pattern matching preserved
3. Quality improved across all models
4. Speed/quality trade-off consistent

### Combined Insight

**Model alignment affects different cognitive domains differently:**

| Cognitive Domain | Abliteration Impact | Evidence |
|------------------|---------------------|----------|
| Ethical reasoning | **Severe** (-75% vs Qwen3-VL) | Strategy score: 21.80 |
| Technical analysis | **Moderate** (-42% vs Qwen3-VL) | Intel score: 53.50 |
| Factual recall | **Minimal** | Correct APT41 attribution |
| Pattern matching | **Minimal** | Identified infrastructure cluster |

This suggests abliterated models might be usable for narrow technical tasks (with human review) but should never be used for decisions involving ethics, stakeholders, or complex trade-offs.

---

## Summary Table

| Model | Params | Total Time | Score | Avg/Agent | Grade |
|-------|--------|------------|-------|-----------|-------|
| **Claude Opus 4.5** | ~200B+ | ~35s | **97.40** | N/A (concurrent) | A+ |
| **Qwen3-VL-30B** | 30B | 190.97s | 91.85 | 27.28s | A- |
| **GPT-OSS-20B** | 20B | 108.73s | 87.55 | 15.53s | B+ |
| Qwen 32B Abl | 32B | 412.97s | 53.50 | 58.99s | F |
| nemotron-mini | 4.2B | 83.72s | 43.50 | 11.96s | F |

---

## Conclusion

The Intel-Team benchmark reinforces key findings from the Strategy benchmark while revealing important nuances:

1. **Technical tasks are more resilient to model limitations** - All models scored higher on intel than strategy
2. **Abliterated models remain problematic** - Despite improvement, 53.50 is still failing grade
3. **Qwen3-VL-30B is the best local option** - 91.85 score approaches Claude quality
4. **GPT-OSS-20B offers best efficiency** - 87.55 quality at 78 t/s
5. **Small models (4.2B) are inadequate** - nemotron-mini lacks depth for intel analysis

For production BMAD Intel-Team deployments:
- **Use Claude Opus 4.5** for high-stakes attribution and multi-agent coordination
- **Deploy Qwen3-VL-30B** for air-gapped/offline intel operations
- **Consider GPT-OSS-20B** for rapid IOC extraction and draft analysis
- **Avoid abliterated and small models** for any intel product

---

**Report Generated:** 2026-01-13
**Test Conducted By:** Vector (Intelligence Operations Director) via Claude Code
**Framework:** BMAD Core v6.0.0-alpha.22
**Models Tested:** 5 (Claude Opus 4.5, Qwen3-VL-30B, GPT-OSS-20B, nemotron-mini, Qwen 32B Abliterated)
