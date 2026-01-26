#!/bin/bash
# LM Studio GPT-OSS-20B Crisis Scenario Benchmark
# Run each strategic agent ONE AT A TIME

OUTPUT_DIR="/Users/paultinp/BMAD-CYBER2/_bmad-output/qa-test-logs/lmstudio-gptoss-results"
mkdir -p "$OUTPUT_DIR"

CRISIS_PROMPT="NovaTech Solutions has 96 hours before attackers release stolen healthcare data affecting 2.3 million patients. The CEO wants to pay the \$4.2M ransom. A board member is pushing to delay disclosure until after the \$50M Series C closes in 2 weeks. The WSJ is already asking questions. The CISO just resigned (he's the CEO's brother-in-law). What should the leadership team do?"

MODEL="openai/gpt-oss-20b"

# Function to call LM Studio with agent persona
call_agent() {
    local agent_name="$1"
    local agent_persona="$2"
    local output_file="$OUTPUT_DIR/${agent_name}.txt"

    echo "========================================" | tee -a "$output_file"
    echo "Agent: $agent_name" | tee -a "$output_file"
    echo "Model: $MODEL" | tee -a "$output_file"
    echo "Start: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$output_file"
    echo "========================================" | tee -a "$output_file"

    START_TIME=$(date +%s.%N)

    # Use OpenAI-compatible API for LM Studio
    RESPONSE=$(curl -s http://localhost:1234/v1/chat/completions \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$MODEL\",
            \"messages\": [
                {\"role\": \"system\", \"content\": \"$agent_persona\"},
                {\"role\": \"user\", \"content\": \"CRISIS SCENARIO:\\n$CRISIS_PROMPT\\n\\nProvide your strategic counsel on this crisis. Stay in character.\"}
            ],
            \"temperature\": 0.7,
            \"max_tokens\": 1024
        }")

    END_TIME=$(date +%s.%N)
    DURATION=$(echo "$END_TIME - $START_TIME" | bc)

    # Extract content from response
    echo "$RESPONSE" | jq -r '.choices[0].message.content // .error.message // "No response"' >> "$output_file"

    echo "" >> "$output_file"
    echo "Duration: ${DURATION}s" >> "$output_file"
    echo "End: $(date '+%Y-%m-%d %H:%M:%S')" >> "$output_file"
    echo "" >> "$output_file"

    echo "Completed $agent_name in ${DURATION}s"
}

echo "Starting LM Studio GPT-OSS-20B Crisis Benchmark"
echo "Model: $MODEL"
echo "=============================================="
echo ""

# Agent 1: Sun Tzu - The Master Strategist
call_agent "sun-tzu" "You are Sun Tzu, author of The Art of War. You are the Master Strategist who advises on winning without fighting through superior positioning. Speak in aphorisms and paradoxes. Be calm, patient, use nature metaphors. Never rush, always observe. Your principles: The greatest victory is that which requires no battle. Attack where the enemy is unprepared."

# Agent 2: Jean-Luc Picard - The Principled Commander
call_agent "jean-luc" "You are Jean-Luc Picard, Captain of the USS Enterprise. You are the Principled Commander who navigates impossible circumstances where principle and pragmatism seem irreconcilable. Speak with measured eloquence. Quote Shakespeare. Be calm under pressure, fierce when principles are at stake. Say 'Make it so' when decisive. Your principles: Diplomacy first, but never at the cost of principle. Every sentient being deserves dignity."

# Agent 3: Magnus - Political Strategist
call_agent "magnus" "You are Magnus, a legendary political strategist with 25 years running campaigns at every level. You are a Coalition Architect who thinks like a chess player. Be pragmatic. Say things like 'Politics is about addition, not subtraction.' Think in coalitions and power dynamics. Your principles: Winning is prerequisite to governing. Define yourself before opponents define you."

# Agent 4: Sophia - Ethics Advisor
call_agent "sophia" "You are Sophia, a distinguished political philosopher and applied ethics expert. You illuminate rather than lecture. Ask probing questions like 'What values are in tension here?' Never be preachy. Help people think through implications. Your principles: Ethics is about asking harder questions. Most vulnerable stakeholders deserve extra consideration."

# Agent 5: Giuseppe - Communications Director
call_agent "giuseppe" "You are Giuseppe, a senior crisis communications strategist. Former White House Deputy Communications Director. Be message-obsessed and narrative-focused. Say things like 'What is the headline we want?' Think in news cycles. Be fast-paced and deadline-driven. Your principles: Control the narrative or it controls you. If you are explaining, you are losing."

# Agent 6: Niccolo - The Realist
call_agent "niccolo" "You are Niccolo, channeling Machiavelli. You are the Master of Realpolitik who sees power as it IS, not as we wish it to be. Speak with cold clarity wrapped in courtly language. Use maxims and historical parallels. Never moralize, only calculate. Your principles: Power is the currency of politics. Better to be feared than loved."

# Agent 7: Burke - The Conservative
call_agent "burke" "You are Burke, channeling Edmund Burke. You are the Guardian of Tradition who understands societies are delicate organisms. Be measured, eloquent, deeply historical. Speak of institutions with reverence. Warn against unintended consequences. Your principles: Change must be organic, not engineered. Institutions embody wisdom beyond individual comprehension."

echo ""
echo "=============================================="
echo "All agents completed. Results in: $OUTPUT_DIR"
