#!/usr/bin/env bash
# ============================================================================
# BMAD LLM Provider Manager
# ============================================================================
# Centralized management of LLM providers for BMAD framework
# Mirrors the TTS provider-manager pattern for consistency
#
# Usage:
#   llm-provider-manager.sh get              - Show active provider
#   llm-provider-manager.sh set <provider>   - Set provider (project scope)
#   llm-provider-manager.sh set <provider> global - Set provider (global)
#   llm-provider-manager.sh list             - List all available providers
#   llm-provider-manager.sh config [provider] - Get provider config as JSON
#   llm-provider-manager.sh health [provider] - Check provider health
#   llm-provider-manager.sh info [provider]  - Show detailed provider info
# ============================================================================

set -euo pipefail

# Source input validation library for security
SCRIPT_DIR_VAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR_VAL/lib/input-validation.sh" ]]; then
  source "$SCRIPT_DIR_VAL/lib/input-validation.sh"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Find project root (search up for _bmad directory)
find_project_root() {
    local current_dir="${PWD}"
    while [[ "$current_dir" != "/" ]]; do
        if [[ -d "$current_dir/_bmad" ]]; then
            echo "$current_dir"
            return 0
        fi
        current_dir=$(dirname "$current_dir")
    done
    # Fallback to script location's parent
    echo "$(dirname "$(dirname "$SCRIPT_DIR")")"
}

PROJECT_ROOT=$(find_project_root)
LLM_CONFIG="$PROJECT_ROOT/_bmad/_config/llm-config.yaml"
PROVIDER_FILE="$PROJECT_ROOT/.claude/llm-provider.txt"
GLOBAL_PROVIDER_FILE="$HOME/.claude/llm-provider.txt"

# ============================================================================
# Core Functions
# ============================================================================

# Get active provider with fallback chain
# Supports: get_active_provider [module] [agent]
# Priority: agent_override > module_override > project_override > global_override > config_default
get_active_provider() {
    local module="${1:-}"
    local agent="${2:-}"

    # 1. Check for agent-specific override (highest priority for granular control)
    if [[ -n "$module" ]] && [[ -n "$agent" ]] && [[ -f "$LLM_CONFIG" ]]; then
        local agent_key="$module/$agent"
        local agent_provider
        agent_provider=$(sed -n '/^agent_overrides:/,/^[a-z]/p' "$LLM_CONFIG" | \
            grep "^  $agent_key:" 2>/dev/null | cut -d: -f2 | tr -d '[:space:]' | sed 's/#.*//' || true)
        if [[ -n "$agent_provider" ]]; then
            echo "$agent_provider"
            return 0
        fi
    fi

    # 2. Check for module-specific override in config
    if [[ -n "$module" ]] && [[ -f "$LLM_CONFIG" ]]; then
        local module_provider
        module_provider=$(sed -n '/^module_overrides:/,/^[a-z]/p' "$LLM_CONFIG" | \
            grep "^  $module:" 2>/dev/null | cut -d: -f2 | tr -d '[:space:]' | sed 's/#.*//' || true)
        if [[ -n "$module_provider" ]]; then
            echo "$module_provider"
            return 0
        fi
    fi

    # 3. Check runtime override (project-local)
    if [[ -f "$PROVIDER_FILE" ]]; then
        head -1 "$PROVIDER_FILE" | tr -d '[:space:]'
        return 0
    fi

    # 4. Check global override
    if [[ -f "$GLOBAL_PROVIDER_FILE" ]]; then
        head -1 "$GLOBAL_PROVIDER_FILE" | tr -d '[:space:]'
        return 0
    fi

    # 5. Read from central config
    if [[ -f "$LLM_CONFIG" ]]; then
        grep "^active_provider:" "$LLM_CONFIG" | cut -d: -f2 | tr -d '[:space:]'
        return 0
    fi

    # 6. Default fallback
    echo "claude"
}

# Set active provider
set_active_provider() {
    local provider="$1"
    local scope="${2:-project}"  # project or global

    # Validate provider exists in config
    if [[ -f "$LLM_CONFIG" ]]; then
        if ! grep -q "^  $provider:" "$LLM_CONFIG"; then
            echo -e "${RED}Error: Unknown provider '$provider'${NC}"
            echo "Use 'llm-provider-manager.sh list' to see available providers"
            return 1
        fi
    fi

    if [[ "$scope" == "global" ]]; then
        mkdir -p "$(dirname "$GLOBAL_PROVIDER_FILE")"
        echo "$provider" > "$GLOBAL_PROVIDER_FILE"
        echo -e "${GREEN}LLM provider set to: ${BOLD}$provider${NC} (global scope)"
    else
        mkdir -p "$(dirname "$PROVIDER_FILE")"
        echo "$provider" > "$PROVIDER_FILE"
        echo -e "${GREEN}LLM provider set to: ${BOLD}$provider${NC} (project scope)"
    fi
}

# Clear runtime override (revert to config default)
clear_override() {
    local scope="${1:-project}"

    if [[ "$scope" == "global" ]]; then
        if [[ -f "$GLOBAL_PROVIDER_FILE" ]]; then
            rm "$GLOBAL_PROVIDER_FILE"
            echo -e "${GREEN}Cleared global provider override${NC}"
        else
            echo "No global override to clear"
        fi
    else
        if [[ -f "$PROVIDER_FILE" ]]; then
            rm "$PROVIDER_FILE"
            echo -e "${GREEN}Cleared project provider override${NC}"
        else
            echo "No project override to clear"
        fi
    fi

    echo -e "Active provider is now: ${BOLD}$(get_active_provider)${NC}"
}

# List available providers
list_providers() {
    echo -e "${BOLD}Available LLM Providers${NC}"
    echo "========================"

    if [[ -f "$LLM_CONFIG" ]]; then
        # Extract provider names from config (only from providers: section)
        local providers
        providers=$(sed -n '/^providers:/,/^[a-z_]*:/p' "$LLM_CONFIG" | \
            grep -E "^  [a-z]+:$" | \
            sed 's/://g' | tr -d ' ')

        local active
        active=$(get_active_provider)

        while IFS= read -r provider; do
            if [[ "$provider" == "$active" ]]; then
                echo -e "  ${GREEN}* $provider${NC} ${CYAN}(active)${NC}"
            else
                echo "    $provider"
            fi
        done <<< "$providers"
    else
        echo "  - claude (default)"
        echo "  - ollama"
        echo "  - vllm"
        echo "  - lmstudio"
        echo "  - llamacpp"
        echo "  - openai"
        echo "  - groq"
        echo "  - together"
    fi

    echo ""
    echo -e "${BOLD}Override Status:${NC}"
    if [[ -f "$PROVIDER_FILE" ]]; then
        echo -e "  Project: ${YELLOW}$(cat "$PROVIDER_FILE")${NC}"
    else
        echo "  Project: (none)"
    fi
    if [[ -f "$GLOBAL_PROVIDER_FILE" ]]; then
        echo -e "  Global:  ${YELLOW}$(cat "$GLOBAL_PROVIDER_FILE")${NC}"
    else
        echo "  Global:  (none)"
    fi
}

# Get provider config as JSON (for programmatic use)
get_provider_config() {
    local provider="${1:-$(get_active_provider)}"

    if [[ ! -f "$LLM_CONFIG" ]]; then
        echo "{\"provider\":\"$provider\",\"error\":\"Config file not found\"}"
        return 1
    fi

    # Extract provider section
    local in_section=false
    local section=""
    while IFS= read -r line; do
        if [[ "$line" =~ ^"  $provider:" ]]; then
            in_section=true
            section="$line"$'\n'
        elif [[ "$in_section" == true ]]; then
            if [[ "$line" =~ ^"  "[a-z]+:$ ]] || [[ "$line" =~ ^[a-z_]+: ]]; then
                break
            fi
            section+="$line"$'\n'
        fi
    done < "$LLM_CONFIG"

    if [[ -z "$section" ]]; then
        echo "{\"provider\":\"$provider\",\"error\":\"Provider not found\"}"
        return 1
    fi

    # Parse key fields (use || true to handle missing fields gracefully)
    local type base_url model api_format description
    type=$(echo "$section" | grep "type:" | head -1 | cut -d: -f2 | tr -d '[:space:]"' || true)
    base_url=$(echo "$section" | grep "base_url:" | head -1 | cut -d'"' -f2 || true)
    model=$(echo "$section" | grep "model:" | head -1 | cut -d'"' -f2 || true)
    api_format=$(echo "$section" | grep "api_format:" | head -1 | cut -d: -f2 | tr -d '[:space:]' || true)
    description=$(echo "$section" | grep "description:" | head -1 | cut -d'"' -f2 || true)

    # Build JSON
    echo "{\"provider\":\"$provider\",\"type\":\"$type\",\"base_url\":\"$base_url\",\"model\":\"$model\",\"api_format\":\"${api_format:-native}\",\"description\":\"$description\"}"
}

# Show detailed provider info
show_provider_info() {
    local provider="${1:-$(get_active_provider)}"

    echo -e "${BOLD}Provider: $provider${NC}"
    echo "-----------------------------------"

    if [[ ! -f "$LLM_CONFIG" ]]; then
        echo "Config file not found: $LLM_CONFIG"
        return 1
    fi

    # Extract provider section (from "  provider:" to next "  provider:" or section end)
    local in_section=false
    while IFS= read -r line; do
        if [[ "$line" =~ ^"  $provider:" ]]; then
            in_section=true
            echo -e "${CYAN}${line#  }${NC}"
        elif [[ "$in_section" == true ]]; then
            # Stop at next top-level provider or section
            if [[ "$line" =~ ^"  "[a-z]+:$ ]] || [[ "$line" =~ ^[a-z_]+: ]]; then
                break
            fi
            # Display the line (remove leading spaces)
            local display_line="${line#    }"
            if [[ "$display_line" =~ ^[a-z_]+: ]]; then
                echo -e "${CYAN}  $display_line${NC}"
            else
                echo "  $display_line"
            fi
        fi
    done < "$LLM_CONFIG"
}

# Check if provider is available (server responding)
check_provider_health() {
    local provider="${1:-$(get_active_provider)}"
    local verbose="${2:-}"

    echo -e "${BOLD}Checking health: $provider${NC}"

    case "$provider" in
        claude)
            echo -e "  ${GREEN}OK${NC} - Claude (native via Claude Code)"
            return 0
            ;;
        ollama)
            if curl -s --connect-timeout 2 "http://localhost:11434/api/tags" > /dev/null 2>&1; then
                echo -e "  ${GREEN}OK${NC} - Ollama server running"
                if [[ -n "$verbose" ]]; then
                    echo "  Models available:"
                    curl -s "http://localhost:11434/api/tags" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sed 's/^/    - /'
                fi
                return 0
            else
                echo -e "  ${RED}NOT RUNNING${NC} - Start with: ollama serve"
                return 1
            fi
            ;;
        vllm)
            if curl -s --connect-timeout 2 "http://localhost:8000/v1/models" > /dev/null 2>&1; then
                echo -e "  ${GREEN}OK${NC} - vLLM server running"
                return 0
            else
                echo -e "  ${RED}NOT RUNNING${NC} - Start vLLM server on port 8000"
                return 1
            fi
            ;;
        lmstudio)
            if curl -s --connect-timeout 2 "http://localhost:1234/v1/models" > /dev/null 2>&1; then
                echo -e "  ${GREEN}OK${NC} - LM Studio server running"
                return 0
            else
                echo -e "  ${RED}NOT RUNNING${NC} - Start LM Studio local server"
                return 1
            fi
            ;;
        llamacpp)
            if curl -s --connect-timeout 2 "http://localhost:8080/health" > /dev/null 2>&1; then
                echo -e "  ${GREEN}OK${NC} - llama.cpp server running"
                return 0
            else
                echo -e "  ${RED}NOT RUNNING${NC} - Start llama.cpp server"
                return 1
            fi
            ;;
        openai)
            # Just check if API key is set
            if [[ -n "${OPENAI_API_KEY:-}" ]]; then
                echo -e "  ${GREEN}OK${NC} - OpenAI API key configured"
                return 0
            else
                echo -e "  ${YELLOW}WARNING${NC} - OPENAI_API_KEY not set"
                return 1
            fi
            ;;
        groq)
            if [[ -n "${GROQ_API_KEY:-}" ]]; then
                echo -e "  ${GREEN}OK${NC} - Groq API key configured"
                return 0
            else
                echo -e "  ${YELLOW}WARNING${NC} - GROQ_API_KEY not set"
                return 1
            fi
            ;;
        together)
            if [[ -n "${TOGETHER_API_KEY:-}" ]]; then
                echo -e "  ${GREEN}OK${NC} - Together API key configured"
                return 0
            else
                echo -e "  ${YELLOW}WARNING${NC} - TOGETHER_API_KEY not set"
                return 1
            fi
            ;;
        *)
            echo -e "  ${YELLOW}UNKNOWN${NC} - No health check for provider: $provider"
            return 1
            ;;
    esac
}

# Check all providers
check_all_health() {
    echo -e "${BOLD}LLM Provider Health Check${NC}"
    echo "=========================="
    echo ""

    local providers="claude ollama vllm lmstudio llamacpp openai groq together"
    for provider in $providers; do
        check_provider_health "$provider" 2>/dev/null || true
    done
}

# Show usage help
show_help() {
    echo -e "${BOLD}BMAD LLM Provider Manager${NC}"
    echo ""
    echo "Usage: llm-provider-manager.sh <command> [options]"
    echo ""
    echo -e "${BOLD}Commands:${NC}"
    echo "  get [module] [agent]   Show active provider (for module and/or agent)"
    echo "  set <provider>         Set active provider (project scope)"
    echo "  set <provider> global  Set active provider (global scope)"
    echo "  clear [scope]          Clear runtime override (project or global)"
    echo "  list                   List all available providers"
    echo "  config [provider]      Get provider configuration as JSON"
    echo "  info [provider]        Show detailed provider information"
    echo "  health [provider]      Check if provider server is running"
    echo "  health-all             Check all providers"
    echo "  help                   Show this help message"
    echo ""
    echo -e "${BOLD}Examples:${NC}"
    echo "  llm-provider-manager.sh list"
    echo "  llm-provider-manager.sh set ollama"
    echo "  llm-provider-manager.sh get                              # Global default"
    echo "  llm-provider-manager.sh get cybersec-team                # Module level"
    echo "  llm-provider-manager.sh get cybersec-team forensic-investigator  # Agent level"
    echo "  llm-provider-manager.sh health ollama"
    echo ""
    echo -e "${BOLD}Priority (highest to lowest):${NC}"
    echo "  1. agent_overrides (per-agent in config)"
    echo "  2. module_overrides (per-module in config)"
    echo "  3. Project override (.claude/llm-provider.txt)"
    echo "  4. Global override (~/.claude/llm-provider.txt)"
    echo "  5. active_provider (config default)"
    echo ""
    echo -e "${BOLD}Configuration:${NC}"
    echo "  Central config: $LLM_CONFIG"
    echo "  Project override: $PROVIDER_FILE"
    echo "  Global override: $GLOBAL_PROVIDER_FILE"
}

# ============================================================================
# Main Command Handler
# ============================================================================

case "${1:-help}" in
    get)
        get_active_provider "${2:-}" "${3:-}"
        ;;
    set)
        if [[ -z "${2:-}" ]]; then
            echo -e "${RED}Error: Provider name required${NC}"
            echo "Usage: llm-provider-manager.sh set <provider> [global]"
            exit 1
        fi
        set_active_provider "$2" "${3:-project}"
        ;;
    clear)
        clear_override "${2:-project}"
        ;;
    list)
        list_providers
        ;;
    config)
        get_provider_config "${2:-}"
        ;;
    info)
        show_provider_info "${2:-}"
        ;;
    health)
        check_provider_health "${2:-}" "${3:-}"
        ;;
    health-all)
        check_all_health
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
