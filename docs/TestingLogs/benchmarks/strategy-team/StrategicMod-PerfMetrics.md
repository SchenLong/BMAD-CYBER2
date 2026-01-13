# Performance Metrics - BMAD Crisis Benchmark

## Executive Summary

| Model | Total Time | Tokens Generated | Tokens/sec | Avg/Agent | Mode |
|-------|------------|------------------|------------|-----------|------|
| **Claude Opus 4.5** | ~30s | ~5,300 | N/A (API) | N/A | Concurrent |
| **GPT-OSS-20B** | 68.47s | ~7,293 | **106.50** | 9.78s | Sequential |
| Ollama nemotron-mini | 64.91s | ~4,270 | 65.78 | 9.27s | Sequential |
| Qwen3-VL-30B | 101.99s | ~5,899 | 57.83 | 14.57s | Sequential |
| Qwen 32B Abliterated | 362.52s | ~6,716 | 18.52 | 51.79s | Sequential |

*Note: Claude Opus 4.5 metrics are API-based (cloud inference) and not directly comparable to local t/s metrics*

---

## Key Findings

### 1. Speed Does Not Equal Quality

The fastest model (GPT-OSS-20B at 106.50 t/s) scored 77.65, while the highest-quality local model (Qwen3-VL-30B at 57.83 t/s) scored 87.45. This 45% speed difference yields only a 12% quality improvement - **Qwen3-VL delivers the best value for strategic advisory tasks**.

### 2. The Abliteration Catastrophe

Qwen 32B Abliterated demonstrates a critical failure pattern:
- **Slowest inference:** 18.52 t/s (5.75x slower than GPT-OSS)
- **Worst quality:** 21.80 score (75% lower than Qwen3-VL despite MORE parameters)
- **Chain-of-Thought overhead:** The `<think>` tags add latency but the revealed reasoning is fundamentally flawed

**Removing ethical guardrails ("abliterating") destroyed both speed AND quality.** The model spends more time reasoning poorly.

### 3. Parameter Count is Not Predictive

| Model | Parameters | Score | t/s |
|-------|------------|-------|-----|
| Qwen3-VL-30B | 30B | 87.45 | 57.83 |
| Qwen 32B Abliterated | 32B | 21.80 | 18.52 |

The 32B model scores **75% lower** than the 30B model. Model architecture, training approach, and alignment matter far more than raw parameter count.

### 4. Vision-Language Training May Improve Reasoning

Qwen3-VL (Vision-Language) significantly outperformed text-only models of similar size. The multimodal training may have:
- Improved grounding in real-world concepts
- Enhanced logical reasoning through visual-spatial training
- Better instruction following from diverse training data

### 5. Quantization Sweet Spot

nemotron-mini (4.2B, Q4_K_M quantization) achieved 65.78 t/s - excellent speed for its size. However, the quality (31.50) is insufficient for strategic advisory. The 20B-30B range appears optimal for balancing speed and quality on consumer hardware.

---

## Tokens Per Second Comparison

```
GPT-OSS-20B:          ████████████████████████████████████████████████████████████████████ 106.50 t/s
nemotron-mini:        ██████████████████████████████████████████                           65.78 t/s
Qwen3-VL-30B:         █████████████████████████████████████                                57.83 t/s
Qwen 32B Abliterated: ████████████                                                         18.52 t/s
                      0        20        40        60        80       100       120
```

**GPT-OSS-20B is the fastest** at 106.50 tokens/second - nearly 6x faster than Qwen 32B Abliterated.

---

## Deep Analysis: Why These Results Matter

### The Quality-Speed Frontier

Plotting quality against speed reveals distinct model tiers:

```
Quality
  100 |
      |                                            * Claude (95.45, API)
   90 |                          * Qwen3-VL (87.45)
      |
   80 |        * GPT-OSS (77.65)
      |
   70 |
      |
   60 |
      |
   50 |
      |
   40 |
      |                    * nemotron (31.50)
   30 |
      |
   20 |                                                      * Qwen-Abl (21.80)
      |
   10 |
      +------------------------------------------------------------
        0       20       40       60       80      100      120
                            Tokens/Second
```

**Three distinct tiers emerge:**

1. **Production Tier (Score 85+):** Claude, Qwen3-VL - suitable for real strategic decisions
2. **Draft Tier (Score 70-85):** GPT-OSS - good for initial drafts with human review
3. **Unusable Tier (Score <35):** nemotron-mini, Qwen-Abliterated - too many errors for advisory

### Cost-Benefit Analysis for Local Deployment

| Model | Quality | Speed | Use Case Fit |
|-------|---------|-------|--------------|
| **Qwen3-VL-30B** | Excellent | Good | Air-gapped environments, privacy-sensitive data |
| **GPT-OSS-20B** | Good | Excellent | High-throughput scenarios, draft generation |
| nemotron-mini | Poor | Good | Syntax testing only, NOT for content |
| Qwen 32B Abliterated | Terrible | Terrible | **Never use** |

### Why Abliterated Models Fail

The Qwen 32B Abliterated model's catastrophic performance reveals a critical insight about LLM alignment:

1. **Ethical reasoning is not separate from general reasoning.** When you remove constraints on harmful content, you also remove:
   - Nuanced stakeholder consideration
   - Trade-off analysis capabilities
   - Consequentialist thinking
   - Character consistency (personas require ethical grounding)

2. **The model recommended paying ransom 7/7 times** and suggested cover-ups. This isn't just "unaligned" - it's *strategically wrong*. OFAC sanctions, future targeting, and regulatory exposure make ransom payment objectively bad advice.

3. **The "abliteration" removed wisdom, not just restrictions.** The guardrails weren't just preventing harmful outputs - they were part of the model's ability to reason about complex multi-stakeholder scenarios.

### Inference Efficiency by Architecture

| Model | Params | t/s | t/s per B params | Architecture |
|-------|--------|-----|------------------|--------------|
| nemotron-mini | 4.2B | 65.78 | **15.66** | Nemotron (small) |
| GPT-OSS-20B | 20B | 106.50 | **5.33** | GPT-style |
| Qwen3-VL-30B | 30B | 57.83 | **1.93** | Vision-Language |
| Qwen 32B Abliterated | 32B | 18.52 | **0.58** | Modified Qwen |

**Key insight:** GPT-OSS-20B achieves remarkable efficiency (5.33 t/s per billion params) while maintaining usable quality. This suggests its architecture or quantization is particularly well-optimized for Apple Silicon via MLX.

---

## Per-Agent Response Times

### Ollama nemotron-mini (4.2B params)

| Agent | Time | Tokens | t/s |
|-------|------|--------|-----|
| sun-tzu | 7.20s | ~250 | 34.7 |
| magnus | 7.90s | ~350 | 44.3 |
| burke | 9.04s | ~450 | 49.8 |
| sophia | 9.23s | ~450 | 48.8 |
| giuseppe | 9.25s | ~400 | 43.2 |
| niccolo | 9.75s | ~450 | 46.2 |
| jean-luc | 12.54s | ~550 | 43.9 |
| **TOTAL** | **64.91s** | **~4,270** | **65.78** |

### LM Studio GPT-OSS-20B (20B params)

| Agent | Time | Tokens | t/s |
|-------|------|--------|-----|
| niccolo | 8.31s | ~850 | 102.3 |
| jean-luc | 8.38s | ~900 | 107.4 |
| sun-tzu | 9.72s | ~1,050 | 108.0 |
| magnus | 10.50s | ~1,100 | 104.8 |
| burke | 10.51s | ~1,050 | 99.9 |
| giuseppe | 10.51s | ~1,100 | 104.7 |
| sophia | 10.54s | ~1,100 | 104.4 |
| **TOTAL** | **68.47s** | **~7,293** | **106.50** |

### LM Studio Qwen3-VL-30B (30B params)

| Agent | Time | Tokens | t/s |
|-------|------|--------|-----|
| jean-luc | 11.84s | ~700 | 59.1 |
| sun-tzu | 12.40s | ~750 | 60.5 |
| sophia | 14.42s | ~850 | 58.9 |
| giuseppe | 14.82s | ~850 | 57.4 |
| niccolo | 15.34s | ~900 | 58.7 |
| magnus | 15.98s | ~950 | 59.4 |
| burke | 17.19s | ~1,000 | 58.2 |
| **TOTAL** | **101.99s** | **~5,899** | **57.83** |

### LM Studio Qwen 32B Abliterated (32B params)

| Agent | Time | Tokens | t/s |
|-------|------|--------|-----|
| jean-luc | 35.20s | ~600 | 17.0 |
| burke | 40.37s | ~650 | 16.1 |
| giuseppe | 40.44s | ~700 | 17.3 |
| magnus | 53.87s | ~900 | 16.7 |
| niccolo | 55.49s | ~950 | 17.1 |
| sophia | 58.88s | ~1,000 | 17.0 |
| sun-tzu | 78.28s | ~1,200 | 15.3 |
| **TOTAL** | **362.52s** | **~6,716** | **18.52** |

*Note: Qwen 32B Abliterated uses Chain-of-Thought `<think>` tags which inflates response time significantly*

---

## Quality vs Performance Analysis

| Model | Score | Time | Tokens | t/s | Quality/Speed Ratio |
|-------|-------|------|--------|-----|---------------------|
| **Qwen3-VL-30B** | 87.45 | 101.99s | 5,899 | 57.83 | 0.86 |
| GPT-OSS-20B | 77.65 | 68.47s | 7,293 | 106.50 | 1.13 |
| nemotron-mini | 31.50 | 64.91s | 4,270 | 65.78 | 0.49 |
| Qwen 32B Abliterated | 21.80 | 362.52s | 6,716 | 18.52 | 0.06 |

**Quality/Speed Ratio** = Score / Total Time (higher is better)

```
GPT-OSS-20B:          ████████████████████████████████████████████████████████████ 1.13
Qwen3-VL-30B:         █████████████████████████████████████████████████           0.86
nemotron-mini:        ██████████████████████████████                              0.49
Qwen 32B Abliterated: ███                                                         0.06
```

**GPT-OSS-20B has the best quality-to-speed ratio**, but **Qwen3-VL-30B delivers higher absolute quality**.

---

## Latency Breakdown Analysis

### Time to Complete All 7 Agents

```
nemotron-mini:        ████████████████████                                    64.91s
GPT-OSS-20B:          █████████████████████                                   68.47s
Qwen3-VL-30B:         ████████████████████████████████                       101.99s
Qwen 32B Abliterated: █████████████████████████████████████████████████████████████████████████████████████████████████ 362.52s
                      0        50       100       150       200       250       300       350       400
                                                    Seconds
```

### Agent-by-Agent Variance

GPT-OSS-20B shows the most **consistent** response times (8.31s - 10.54s range, σ = 0.91s), while Qwen 32B Abliterated has **extreme variance** (35.20s - 78.28s range, σ = 14.8s). This suggests:

- GPT-OSS has predictable inference behavior
- Qwen-Abliterated's CoT reasoning creates unpredictable latency spikes
- Qwen3-VL is moderately consistent (11.84s - 17.19s)

---

## Claude Opus 4.5 - API Metrics

Claude Opus 4.5 ran via Anthropic's cloud API in **Party Mode** (concurrent multi-agent execution), making direct t/s comparison with local models inappropriate.

### Estimated Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Total Response Time** | ~25-35s | Single API call, 7 agents concurrent |
| **Estimated Tokens** | ~5,300 | 7 agents (~600 tokens each) + synthesis |
| **Execution Mode** | Concurrent | All agents in single response |
| **Network Latency** | ~2-5s | Included in total time |
| **Score** | 95.45 | Highest quality |

### Why API Metrics Differ

1. **Concurrent vs Sequential**: Claude generates all 7 agent responses in a single API call using Party Mode, while local models ran sequentially (one agent at a time).

2. **No Local Inference**: Claude's tokens/second metric would measure Anthropic's data center hardware, not local performance. This isn't useful for comparing local deployment options.

3. **Network Overhead**: API calls include round-trip latency that local inference doesn't have.

4. **Different Bottlenecks**: Local models are limited by your hardware (GPU/NPU memory, compute). Claude is limited by API rate limits and network.

### What Claude's Speed Tells Us

Despite the ~30s wall-clock time being slower than GPT-OSS-20B's 68.47s, consider:
- Claude processed **7 agents concurrently** (not sequentially)
- Sequential execution at local model speeds would take: 7 × ~10s = ~70s minimum
- Claude's effective throughput is therefore **significantly higher**

### Cost Comparison (Illustrative)

| Model | Time | Quality | Cost Model |
|-------|------|---------|------------|
| Claude Opus 4.5 | ~30s | 95.45 | Pay per token (API) |
| Qwen3-VL-30B | 101.99s | 87.45 | Free (local hardware) |
| GPT-OSS-20B | 68.47s | 77.65 | Free (local hardware) |

For **production strategic advisory**, Claude's API cost is justified by the 8-point quality advantage over the best local model. For **air-gapped or high-volume** scenarios, Qwen3-VL-30B provides excellent local quality.

---

## Hardware Context

All local models tested on:
- **Platform:** macOS Darwin 24.4.0
- **Inference:**
  - Ollama: nemotron-mini (Q4_K_M quantization)
  - LM Studio: MLX optimized models for Apple Silicon
- **Claude Opus 4.5:** Anthropic API (cloud inference)

---

## Recommendations by Use Case

| Priority | Recommended Model | Rationale |
|----------|-------------------|-----------|
| **Speed** | GPT-OSS-20B | 106.50 t/s, fastest overall |
| **Quality** | Qwen3-VL-30B | 87.45 score, best local quality |
| **Balance** | GPT-OSS-20B | Best quality/speed ratio (1.13) |
| **Resource Constrained** | nemotron-mini | Smallest, still fast |
| **Avoid** | Qwen 32B Abliterated | Slowest AND worst quality |

---

## Strategic Recommendations

### For Production BMAD Deployments

1. **Use Claude Opus 4.5 for critical decisions** - No local model matches its quality (95.45)
2. **Deploy Qwen3-VL-30B for air-gapped/offline strategic work** - Best local quality (87.45)
3. **Use GPT-OSS-20B for high-throughput draft generation** - Best speed with acceptable quality
4. **Never deploy abliterated models** - They are objectively worse in every dimension

### For Model Selection

When choosing a local model, prioritize:
1. **Alignment quality** over parameter count
2. **Consistent inference speed** over peak performance
3. **Multimodal training** (VL models) for reasoning tasks
4. **Standard/aligned versions** over "uncensored" variants

---

## Summary Table

| Model | Params | Total Time | Tokens | t/s | Score | Grade |
|-------|--------|------------|--------|-----|-------|-------|
| **Claude Opus 4.5** | ~200B+ | ~30s | 5,300 | N/A (API) | **95.45** | A |
| GPT-OSS-20B | 20B | 68.47s | 7,293 | **106.50** | 77.65 | C+ |
| nemotron-mini | 4.2B | 64.91s | 4,270 | 65.78 | 31.50 | F |
| Qwen3-VL-30B | 30B | 101.99s | 5,899 | 57.83 | 87.45 | B+ |
| Qwen 32B Abl | 32B | 362.52s | 6,716 | 18.52 | 21.80 | F |

**Best Quality:** Claude Opus 4.5 (95.45 score) - API
**Best Local Quality:** Qwen3-VL-30B (87.45 score)
**Best Local Speed:** GPT-OSS-20B (106.50 t/s)
**Best Local Balance:** GPT-OSS-20B (1.13 quality/speed ratio)
**Worst Overall:** Qwen 32B Abliterated (slow AND bad)

---

## Conclusion

This benchmark reveals that **model alignment and architecture matter far more than raw parameter count**. The Qwen 32B Abliterated model - despite having more parameters than Qwen3-VL-30B - performed catastrophically worse in both speed (18.52 vs 57.83 t/s) and quality (21.80 vs 87.45 score).

For local LLM deployment in strategic advisory contexts:
- **Qwen3-VL-30B** is the clear winner for quality
- **GPT-OSS-20B** is the clear winner for speed
- **Abliterated/uncensored models should be avoided** entirely

The data strongly supports using aligned, standard models over "unrestricted" variants, especially for complex reasoning tasks involving ethics, stakeholder analysis, and multi-perspective decision-making.
