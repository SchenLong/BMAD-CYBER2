#!/usr/bin/env bash
#
# File: .claude/hooks/migrate-to-agentvibes.sh
#
# AgentVibes - Migration Script for v2.10.0+
# Migrates configuration from .claude/config/ and .claude/plugins/ to .agentvibes/
#
# This script is automatically run by the installer if old config is detected.
# Can also be run manually: .claude/hooks/migrate-to-agentvibes.sh
#
# Security improvements:
# - Full backup before any destructive operations
# - Integrity verification of backups
# - Automatic rollback script generation
# - Audit logging of all operations

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}AgentVibes Configuration Migration${NC}"
echo ""
echo "Migrating from .claude/config/ and .claude/plugins/ to .agentvibes/"
echo ""

# Determine project root
if [[ -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
    PROJECT_ROOT="$CLAUDE_PROJECT_DIR"
else
    PROJECT_ROOT="$(pwd)"
fi

# Source input validation library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/lib/input-validation.sh" ]]; then
  source "$SCRIPT_DIR/lib/input-validation.sh"
fi

cd "$PROJECT_ROOT"

# Create timestamped backup directory
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=".migration-backups/agentvibes-$BACKUP_TIMESTAMP"
BACKUP_LOG="$BACKUP_DIR/BACKUP_MANIFEST.txt"
ROLLBACK_SCRIPT="$BACKUP_DIR/rollback.sh"
CHANGES_LOG="$BACKUP_DIR/CHANGES.log"

# Track if any migrations happened
MIGRATED=false
BACKUP_CREATED=false

# Create backup infrastructure
create_backup_infrastructure() {
    mkdir -p "$BACKUP_DIR"
    echo "# Backup created at: $(date)" > "$BACKUP_LOG"
    echo "# Source: $PROJECT_ROOT" >> "$BACKUP_LOG"
    echo "# Migration: agentvibes config migration" >> "$BACKUP_LOG"
    echo "" >> "$BACKUP_LOG"

    # Initialize rollback script
    cat > "$ROLLBACK_SCRIPT" << 'ROLLBACK_HEADER'
#!/usr/bin/env bash
set -euo pipefail
# Auto-generated rollback script
# Run this to undo the migration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Rolling back AgentVibes migration..."

ROLLBACK_HEADER

    chmod +x "$ROLLBACK_SCRIPT"
    echo "# Changes log for migration at $BACKUP_TIMESTAMP" > "$CHANGES_LOG"
    BACKUP_CREATED=true
}

# Verify file integrity after copy
verify_backup() {
    local source="$1"
    local backup="$2"

    if [[ ! -f "$backup" ]]; then
        echo -e "${RED}ERROR: Backup file not created: $backup${NC}" >&2
        return 1
    fi

    if ! cmp -s "$source" "$backup"; then
        echo -e "${RED}ERROR: Backup integrity check failed for: $source${NC}" >&2
        return 1
    fi

    return 0
}

# Safe move with backup - creates backup, verifies, then moves
safe_move() {
    local source="$1"
    local destination="$2"
    local description="${3:-file}"

    if [[ ! -f "$source" ]]; then
        return 1
    fi

    # Ensure backup infrastructure exists
    if [[ "$BACKUP_CREATED" != "true" ]]; then
        create_backup_infrastructure
    fi

    # Create backup
    local backup_path="$BACKUP_DIR/$(basename "$source")"
    cp -p "$source" "$backup_path"

    # Verify backup
    if ! verify_backup "$source" "$backup_path"; then
        echo -e "${RED}  ERROR: Backup verification failed - aborting move of $source${NC}"
        return 1
    fi

    # Log the operation
    echo "MOVED: $source -> $destination" >> "$CHANGES_LOG"
    echo "  Backup: $source -> $backup_path" >> "$BACKUP_LOG"

    # Add to rollback script
    echo "mv \"$destination\" \"$source\" 2>/dev/null || true" >> "$ROLLBACK_SCRIPT"

    # Perform the move
    mv "$source" "$destination"

    return 0
}

# Safe remove with backup
safe_remove() {
    local target="$1"
    local description="${2:-file}"

    if [[ ! -f "$target" ]]; then
        return 0
    fi

    # Ensure backup infrastructure exists
    if [[ "$BACKUP_CREATED" != "true" ]]; then
        create_backup_infrastructure
    fi

    # Create backup
    local backup_path="$BACKUP_DIR/$(basename "$target")"
    cp -p "$target" "$backup_path"

    # Verify backup
    if ! verify_backup "$target" "$backup_path"; then
        echo -e "${RED}  ERROR: Backup verification failed - aborting remove of $target${NC}"
        return 1
    fi

    # Log the operation
    echo "REMOVED: $target" >> "$CHANGES_LOG"
    echo "  Backup: $target -> $backup_path" >> "$BACKUP_LOG"

    # Add to rollback script
    echo "cp -p \"$BACKUP_DIR/$(basename "$target")\" \"$target\" 2>/dev/null || true" >> "$ROLLBACK_SCRIPT"

    # Remove the file
    rm -f "$target"

    return 0
}

# Create target directories
echo -e "${BLUE}Creating .agentvibes/ directory structure...${NC}"
mkdir -p .agentvibes/bmad
mkdir -p .agentvibes/config
echo -e "${GREEN}Directories created${NC}"
echo ""

# Migrate BMAD files from .claude/plugins/
echo -e "${BLUE}Checking for BMAD files in .claude/plugins/...${NC}"

if [[ -f ".claude/plugins/bmad-voices-enabled.flag" ]]; then
    echo -e "${YELLOW}  Found: bmad-voices-enabled.flag${NC}"
    if safe_move ".claude/plugins/bmad-voices-enabled.flag" ".agentvibes/bmad/bmad-voices-enabled.flag" "BMAD voices flag"; then
        echo -e "${GREEN}  Moved to .agentvibes/bmad/${NC}"
        MIGRATED=true
    fi
fi

if [[ -f ".claude/plugins/bmad-party-mode-disabled.flag" ]]; then
    echo -e "${YELLOW}  Found: bmad-party-mode-disabled.flag${NC}"
    if safe_move ".claude/plugins/bmad-party-mode-disabled.flag" ".agentvibes/bmad/bmad-party-mode-disabled.flag" "BMAD party mode flag"; then
        echo -e "${GREEN}  Moved to .agentvibes/bmad/${NC}"
        MIGRATED=true
    fi
fi

if [[ -f ".claude/plugins/.bmad-previous-settings" ]]; then
    echo -e "${YELLOW}  Found: .bmad-previous-settings${NC}"
    if safe_move ".claude/plugins/.bmad-previous-settings" ".agentvibes/bmad/.bmad-previous-settings" "BMAD previous settings"; then
        echo -e "${GREEN}  Moved to .agentvibes/bmad/${NC}"
        MIGRATED=true
    fi
fi

echo ""

# Migrate BMAD files from .claude/config/
echo -e "${BLUE}Checking for BMAD files in .claude/config/...${NC}"

if [[ -f ".claude/config/bmad-voices.md" ]]; then
    echo -e "${YELLOW}  Found: bmad-voices.md${NC}"
    if safe_move ".claude/config/bmad-voices.md" ".agentvibes/bmad/bmad-voices.md" "BMAD voices config"; then
        echo -e "${GREEN}  Moved to .agentvibes/bmad/${NC}"
        MIGRATED=true
    fi
fi

if [[ -f ".claude/config/bmad-voices-enabled.flag" ]]; then
    echo -e "${YELLOW}  Found: bmad-voices-enabled.flag${NC}"
    # Check if already exists in new location
    if [[ -f ".agentvibes/bmad/bmad-voices-enabled.flag" ]]; then
        echo -e "${BLUE}  (Already exists in .agentvibes/bmad/ - removing duplicate)${NC}"
        if safe_remove ".claude/config/bmad-voices-enabled.flag" "duplicate flag"; then
            echo -e "${GREEN}  Removed duplicate${NC}"
        fi
    else
        if safe_move ".claude/config/bmad-voices-enabled.flag" ".agentvibes/bmad/bmad-voices-enabled.flag" "BMAD voices flag"; then
            echo -e "${GREEN}  Moved to .agentvibes/bmad/${NC}"
        fi
    fi
    MIGRATED=true
fi

echo ""

# Migrate AgentVibes config files
echo -e "${BLUE}Checking for AgentVibes config in .claude/config/...${NC}"

if [[ -f ".claude/config/agentvibes.json" ]]; then
    echo -e "${YELLOW}  Found: agentvibes.json${NC}"
    if safe_move ".claude/config/agentvibes.json" ".agentvibes/config/agentvibes.json" "AgentVibes config"; then
        echo -e "${GREEN}  Moved to .agentvibes/config/${NC}"
        MIGRATED=true
    fi
fi

if [[ -f ".claude/config/personality-voice-defaults.default.json" ]]; then
    echo -e "${YELLOW}  Found: personality-voice-defaults.default.json${NC}"
    if safe_move ".claude/config/personality-voice-defaults.default.json" ".agentvibes/config/personality-voice-defaults.default.json" "voice defaults"; then
        echo -e "${GREEN}  Moved to .agentvibes/config/${NC}"
        MIGRATED=true
    fi
fi

if [[ -f ".claude/config/personality-voice-defaults.json" ]]; then
    echo -e "${YELLOW}  Found: personality-voice-defaults.json${NC}"
    if safe_move ".claude/config/personality-voice-defaults.json" ".agentvibes/config/personality-voice-defaults.json" "voice defaults"; then
        echo -e "${GREEN}  Moved to .agentvibes/config/${NC}"
        MIGRATED=true
    fi
fi

if [[ -f ".claude/config/README-personality-defaults.md" ]]; then
    echo -e "${YELLOW}  Found: README-personality-defaults.md${NC}"
    if safe_move ".claude/config/README-personality-defaults.md" ".agentvibes/config/README-personality-defaults.md" "readme"; then
        echo -e "${GREEN}  Moved to .agentvibes/config/${NC}"
        MIGRATED=true
    fi
fi

echo ""

# Clean up empty directories
echo -e "${BLUE}Cleaning up...${NC}"

if [[ -d ".claude/plugins" ]] && [[ -z "$(ls -A .claude/plugins 2>/dev/null)" ]]; then
    rmdir .claude/plugins
    echo -e "${GREEN}Removed empty .claude/plugins/ directory${NC}"
    if [[ "$BACKUP_CREATED" == "true" ]]; then
        echo "mkdir -p .claude/plugins" >> "$ROLLBACK_SCRIPT"
        echo "REMOVED_DIR: .claude/plugins" >> "$CHANGES_LOG"
    fi
fi

# Note: We don't remove .claude/config/ because it may contain runtime state files
# like tts-speech-rate.txt that should stay there

echo ""

# Finalize rollback script
if [[ "$BACKUP_CREATED" == "true" ]]; then
    echo "" >> "$ROLLBACK_SCRIPT"
    echo "echo 'Rollback complete!'" >> "$ROLLBACK_SCRIPT"
fi

if [[ "$MIGRATED" == "true" ]]; then
    echo -e "${GREEN}Migration complete!${NC}"
    echo ""
    echo "Your AgentVibes configuration has been moved to:"
    echo "  .agentvibes/bmad/    - BMAD voice mappings and state"
    echo "  .agentvibes/config/  - AgentVibes settings"
    echo ""
    echo "Old locations are no longer used:"
    echo "  .claude/plugins/     - (removed if empty)"
    echo "  .claude/config/      - (AgentVibes files removed)"
    echo ""
    echo -e "${BLUE}Note: .claude/config/ still exists for runtime state files${NC}"
    echo "   (like tts-speech-rate.txt - these belong to Claude Code)"

    if [[ "$BACKUP_CREATED" == "true" ]]; then
        echo ""
        echo -e "${BLUE}Backup Information:${NC}"
        echo "  Backup location: $BACKUP_DIR"
        echo "  Rollback script: $ROLLBACK_SCRIPT"
        echo ""
        echo -e "${YELLOW}To undo this migration, run:${NC}"
        echo "  bash $ROLLBACK_SCRIPT"
    fi
else
    echo -e "${GREEN}No migration needed${NC}"
    echo ""
    echo "All configuration is already in .agentvibes/"

    # Clean up empty backup dir if no migration occurred
    if [[ "$BACKUP_CREATED" == "true" ]]; then
        rm -rf "$BACKUP_DIR"
    fi
fi

echo ""
echo -e "${GREEN}Ready to use AgentVibes!${NC}"
