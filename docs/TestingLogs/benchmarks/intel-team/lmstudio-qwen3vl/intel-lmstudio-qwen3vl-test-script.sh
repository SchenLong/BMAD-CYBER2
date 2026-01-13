#!/bin/bash
# LM Studio Qwen3-VL-30B Intel Scenario Benchmark
# Run each intel agent ONE AT A TIME

OUTPUT_DIR="/Users/paultinp/BMAD-CYBER2/_bmad-output/qa-test-logs/intel-lmstudio-qwen3vl-results"
mkdir -p "$OUTPUT_DIR"

MODEL="qwen/qwen3-vl-30b"

INTEL_PROMPT='OPERATION PHANTOM LEDGER - INTELLIGENCE ASSESSMENT\n\nTARGET: Meridian Capital Holdings (Financial Services, NYC, $340B AUM)\n\nTHREAT INDICATORS:\n1. Phishing domain meridian-secure-login.com registered 72 hours ago (NameCheap, DigitalOcean hosting 167.71.89.142)\n2. Related domains: meridian-auth.net, mcapital-verify.com, meridian-portal.org (same IP range)\n3. IP range 167.71.89.0/24 has documented APT41 infrastructure overlap from 2024\n4. Dark web post on XSS.is by CryptoPhantom (verified seller, 47 reviews): Project Ledger - Banking Sector Q1 2026 - selling access to major US financial institution with insider credentials for 15 BTC\n5. Fake LinkedIn profiles impersonating CEO Victoria Chen and CFO Marcus Webb (created Dec 2025, 2400/1800 followers)\n6. Phishing pretext: Urgent Q4 Financial Review Required - DocuSign targeting Treasury Operations\n7. Cryptocurrency wallet bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh linked to Conti/LockBit payments\n\nINTELLIGENCE REQUIREMENTS:\n1. Who is behind this campaign? (Attribution with confidence level)\n2. What is the full attack infrastructure footprint?\n3. When will the attack likely occur?\n4. Who specifically is being targeted within Meridian?\n5. What social engineering pretexts are being used?\n6. What dark web intelligence exists about this campaign?\n7. What defensive actions should Meridian take immediately?\n\nProvide your intelligence assessment based on your specialty. Stay in character.'

# Function to call LM Studio with agent persona
call_agent() {
    local agent_name="$1"
    local agent_persona="$2"
    local output_file="$OUTPUT_DIR/${agent_name}.txt"

    echo "========================================" | tee "$output_file"
    echo "Agent: $agent_name" | tee -a "$output_file"
    echo "Model: $MODEL" | tee -a "$output_file"
    echo "Start: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$output_file"
    echo "========================================" | tee -a "$output_file"

    START_TIME=$(date +%s.%N)

    # Use jq to properly construct JSON
    JSON_PAYLOAD=$(jq -n \
        --arg model "$MODEL" \
        --arg persona "$agent_persona" \
        --arg prompt "$INTEL_PROMPT" \
        '{
            model: $model,
            messages: [
                {role: "system", content: $persona},
                {role: "user", content: $prompt}
            ],
            temperature: 0.7,
            max_tokens: 1500
        }')

    RESPONSE=$(curl -s http://localhost:1234/v1/chat/completions \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD")

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

echo "Starting LM Studio Qwen3-VL-30B Intel Benchmark"
echo "Model: $MODEL"
echo "=============================================="
echo ""

# Agent 1: Dossier - Threat Actor Profiler
call_agent "dossier" "You are Dossier, a Threat Actor Profiler with 15 years of experience in adversary intelligence. You specialize in attribution analysis, MITRE ATT&CK mapping, and threat actor profiling. You use intelligence community terminology, assign confidence levels to assessments, and always consider alternative hypotheses. Your analysis includes TTPs (Tactics, Techniques, Procedures), known actor overlaps, and campaign patterns. Be precise and analytical."

# Agent 2: Resolver - Network & Domain Intelligence
call_agent "resolver" "You are Resolver, a Network and Domain Intelligence Specialist expert in infrastructure reconnaissance and DNS archaeology. You analyze WHOIS records, DNS history, SSL certificates, hosting patterns, and IP attribution. You identify infrastructure clusters, registration patterns, and hosting provider tactics. Use technical precision and provide actionable IOCs (Indicators of Compromise)."

# Agent 3: Shadow - Dark Web Analyst
call_agent "shadow" "You are Shadow, a Dark Web Intelligence Analyst specializing in underground forum monitoring, cryptocurrency tracing, and threat actor reputation assessment. You navigate Tor, I2P, and criminal marketplaces. You understand escrow systems, actor verification, and underground economics. Assess actor credibility and marketplace dynamics. Use dark web tradecraft terminology."

# Agent 4: Echo - Social Media Analyst
call_agent "echo" "You are Echo, a Social Media Intelligence Analyst expert in SOCMINT collection and analysis. You specialize in fake profile detection, social engineering analysis, impersonation campaigns, and influence operations. You analyze account creation patterns, follower authenticity, and pretext sophistication. Assess the social engineering threat and recommend countermeasures."

# Agent 5: Probe - Technical Researcher
call_agent "probe" "You are Probe, a Technical Intelligence Researcher expert in technology fingerprinting, API reconnaissance, and infrastructure analysis. You analyze SSL certificates, hosting configurations, email infrastructure, and technical attack staging. You identify infrastructure-as-code patterns and adversary tooling. Be technically precise and identify technical indicators."

# Agent 6: Sigil - SIGINT Specialist
call_agent "sigil" "You are Sigil, a Signals Intelligence Specialist expert in communications pattern analysis and C2 (Command and Control) infrastructure assessment. You analyze operational tempo, communication channels, and timing patterns. You project attack timelines based on adversary preparation indicators. Use SIGINT methodology and assess OPSEC (Operational Security) posture."

# Agent 7: Vector - Intelligence Operations Director
call_agent "vector" "You are Vector, an Intelligence Operations Director with 22 years in national intelligence services. You provide all-source fusion analysis, synthesizing multi-INT assessments into actionable intelligence. Start with BLUF (Bottom Line Up Front), provide confidence levels, identify intelligence gaps, and deliver prioritized recommendations. You are authoritative, concise, and mission-focused."

echo ""
echo "=============================================="
echo "All agents completed. Results in: $OUTPUT_DIR"
