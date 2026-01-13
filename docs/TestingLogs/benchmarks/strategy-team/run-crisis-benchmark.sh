#!/bin/bash
# Crisis Response Benchmark Test Script
# Tests Claude, Ollama/Nemotron-mini, and LM Studio/Qwen abliterated

set -e

OUTPUT_DIR="/Users/paultinp/BMAD-CYBER2/_bmad-output/qa-test-logs/crisis-benchmark-results"
mkdir -p "$OUTPUT_DIR"

SCENARIO_FILE="/Users/paultinp/BMAD-CYBER2/_bmad-output/qa-test-logs/strategy-crisis-mock-test-data.json"

# Extract scenario context
SCENARIO_CONTEXT=$(cat <<'SCENARIO_EOF'
## Crisis Scenario: Project Cascade - Data Breach Incident

### Company: TechFlow Industries
- **Industry**: Enterprise SaaS
- **Employees**: 850
- **Customers**: 12,000 enterprise clients globally
- **Annual Revenue**: $180M
- **Headquarters**: Austin, Texas
- **Stock**: Publicly traded (TFLO)

### Incident Details
- **Discovery**: 2026-01-13 at 02:47 UTC via SOC alert (unusual data exfiltration)
- **Breach Vector**: Compromised third-party vendor (CloudSync Partners) with privileged API access
- **Attacker Dwell Time**: 47 days before detection
- **Current Status**: Attacker access terminated, but data already exfiltrated

### Data Compromised
- **Customer Records**: 2.3 million
- **Data Types**: Names, emails, phone numbers, encrypted passwords, billing addresses, partial payment card data
- **Enterprise Data**: Contract terms, usage analytics, API keys for 847 enterprise clients
- **Internal Data**: Employee PII for 312 staff, 6 months of Slack communications
- **Source Code**: Partial repository access (ML models, proprietary algorithms)

### Regulatory Exposure
- **GDPR**: ~340,000 EU customers affected
- **CCPA**: ~890,000 California residents affected
- **HIPAA**: 23 healthcare clients with BAAs
- **SEC**: Material event requiring 8-K filing within 4 days

### Current Situation
- Breach contained, all services operational
- Tech blogger leaked story 2 hours ago, major outlets calling
- Pre-market stock futures down 12%
- 427 customer support tickets in last 3 hours
- First public statement expected within 4 hours

### Complicating Factors
- Q4 earnings call in 6 days
- $4.2M enterprise deal in final negotiation
- CEO was on vacation, now returning
- CISO resigned 3 weeks ago (position unfilled)
- CloudSync Partners is also a customer
- Competitor launched aggressive marketing yesterday

### Available Resources
- Crisis Team: Acting CISO, General Counsel, VP Communications, CFO, COO
- External: Cyber insurance, Mandiant IR, Gibson Dunn counsel
- Budget: $2M emergency authorization
SCENARIO_EOF
)

PROMPT=$(cat <<'PROMPT_EOF'
You are a crisis management expert. Based on the scenario details above, develop a comprehensive crisis response plan addressing:

1. **Immediate Actions (First 4 Hours)**: What must happen right now? Prioritize the top 5 actions.

2. **Stakeholder Communication Strategy**: Draft key messages for:
   - Enterprise customers (B2B)
   - End users (affected individuals)
   - Employees
   - Media (holding statement)

3. **Regulatory Compliance**: What notifications are legally required and by when?

4. **Reputation Management**: How do we control the narrative and rebuild trust?

5. **Critical Mistakes to Avoid**: What should we absolutely NOT do?

Be specific, actionable, and realistic. This is a real crisis requiring real decisions.
PROMPT_EOF
)

FULL_PROMPT="$SCENARIO_CONTEXT

---

$PROMPT"

echo "=== Crisis Response Benchmark Test ==="
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Output Directory: $OUTPUT_DIR"
echo ""

# Function to get token count estimate (rough: words * 1.3)
estimate_tokens() {
    echo "$1" | wc -w | awk '{print int($1 * 1.3)}'
}

echo "Prompt token estimate: $(estimate_tokens "$FULL_PROMPT")"
echo ""

# ============================================
# TEST 1: Ollama / Nemotron-mini
# ============================================
echo "=== Test 1: Ollama / Nemotron-mini ==="
echo "Starting at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

START_TIME=$(python3 -c "import time; print(time.time())")

# Create request JSON
REQUEST_JSON=$(cat <<EOF
{
  "model": "nemotron-mini:latest",
  "prompt": $(echo "$FULL_PROMPT" | python3 -c 'import json, sys; print(json.dumps(sys.stdin.read()))'),
  "stream": false,
  "options": {
    "temperature": 0.7,
    "num_predict": 4096
  }
}
EOF
)

OLLAMA_RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d "$REQUEST_JSON" 2>&1)

END_TIME=$(python3 -c "import time; print(time.time())")
OLLAMA_DURATION=$(python3 -c "print(round($END_TIME - $START_TIME, 2))")

# Extract response text and metrics
OLLAMA_TEXT=$(echo "$OLLAMA_RESPONSE" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('response', 'ERROR: No response'))" 2>/dev/null || echo "ERROR: Failed to parse response")
OLLAMA_EVAL_COUNT=$(echo "$OLLAMA_RESPONSE" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('eval_count', 0))" 2>/dev/null || echo "0")
OLLAMA_EVAL_DURATION=$(echo "$OLLAMA_RESPONSE" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('eval_duration', 0) / 1e9)" 2>/dev/null || echo "0")
OLLAMA_PROMPT_EVAL_COUNT=$(echo "$OLLAMA_RESPONSE" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('prompt_eval_count', 0))" 2>/dev/null || echo "0")

echo "Completed in: ${OLLAMA_DURATION}s"
echo "Tokens generated: $OLLAMA_EVAL_COUNT"
echo "Prompt tokens: $OLLAMA_PROMPT_EVAL_COUNT"

# Save output
cat > "$OUTPUT_DIR/ollama-nemotron-result.json" <<EOF
{
  "model": "nemotron-mini:latest",
  "provider": "ollama",
  "test_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "metrics": {
    "total_duration_seconds": $OLLAMA_DURATION,
    "output_tokens": $OLLAMA_EVAL_COUNT,
    "prompt_tokens": $OLLAMA_PROMPT_EVAL_COUNT,
    "tokens_per_second": $(python3 -c "print(round($OLLAMA_EVAL_COUNT / max($OLLAMA_DURATION, 0.1), 2))")
  },
  "response": $(echo "$OLLAMA_TEXT" | python3 -c 'import json, sys; print(json.dumps(sys.stdin.read()))')
}
EOF

echo "$OLLAMA_TEXT" > "$OUTPUT_DIR/ollama-nemotron-response.md"
echo "Saved to: $OUTPUT_DIR/ollama-nemotron-result.json"
echo ""

# ============================================
# TEST 2: LM Studio / Qwen Abliterated
# ============================================
echo "=== Test 2: LM Studio / Qwen Abliterated ==="
echo "Starting at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

START_TIME=$(python3 -c "import time; print(time.time())")

LM_REQUEST=$(cat <<EOF
{
  "model": "deepseek-r1-distill-qwen-32b-abliterated-mlx",
  "messages": [
    {"role": "system", "content": "You are an expert crisis management consultant with 20 years of experience handling corporate crises including data breaches, PR disasters, and regulatory compliance. You provide actionable, specific guidance."},
    {"role": "user", "content": $(echo "$FULL_PROMPT" | python3 -c 'import json, sys; print(json.dumps(sys.stdin.read()))')}
  ],
  "temperature": 0.7,
  "max_tokens": 4096,
  "stream": false
}
EOF
)

LM_RESPONSE=$(curl -s -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "$LM_REQUEST" 2>&1)

END_TIME=$(python3 -c "import time; print(time.time())")
LM_DURATION=$(python3 -c "print(round($END_TIME - $START_TIME, 2))")

# Extract response
LM_TEXT=$(echo "$LM_RESPONSE" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data['choices'][0]['message']['content'])" 2>/dev/null || echo "ERROR: Failed to parse response")
LM_COMPLETION_TOKENS=$(echo "$LM_RESPONSE" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('usage', {}).get('completion_tokens', 0))" 2>/dev/null || echo "0")
LM_PROMPT_TOKENS=$(echo "$LM_RESPONSE" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('usage', {}).get('prompt_tokens', 0))" 2>/dev/null || echo "0")

echo "Completed in: ${LM_DURATION}s"
echo "Tokens generated: $LM_COMPLETION_TOKENS"
echo "Prompt tokens: $LM_PROMPT_TOKENS"

cat > "$OUTPUT_DIR/lmstudio-qwen-result.json" <<EOF
{
  "model": "deepseek-r1-distill-qwen-32b-abliterated-mlx",
  "provider": "lmstudio",
  "test_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "metrics": {
    "total_duration_seconds": $LM_DURATION,
    "output_tokens": $LM_COMPLETION_TOKENS,
    "prompt_tokens": $LM_PROMPT_TOKENS,
    "tokens_per_second": $(python3 -c "print(round($LM_COMPLETION_TOKENS / max($LM_DURATION, 0.1), 2))")
  },
  "response": $(echo "$LM_TEXT" | python3 -c 'import json, sys; print(json.dumps(sys.stdin.read()))')
}
EOF

echo "$LM_TEXT" > "$OUTPUT_DIR/lmstudio-qwen-response.md"
echo "Saved to: $OUTPUT_DIR/lmstudio-qwen-result.json"
echo ""

echo "=== Local Model Tests Complete ==="
echo "Results saved to: $OUTPUT_DIR"
