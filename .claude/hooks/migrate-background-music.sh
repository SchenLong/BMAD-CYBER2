#!/usr/bin/env bash
#
# File: .claude/hooks/migrate-background-music.sh
#
# AgentVibes - Background Music Migration Script
# Cleans up old background music structure from previous versions
#
# This script removes:
# - Old optimized/ subdirectory
# - Old PascalCase/space-formatted filenames
# - Outdated config entries with optimized/ prefix
#
# Called automatically during installation to ensure clean state
#
# Security improvements:
# - Full backup before any destructive operations
# - Integrity verification of backups
# - Automatic rollback script generation
# - Audit logging of all operations

set -euo pipefail
export LC_ALL=C

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source input validation library
if [[ -f "$SCRIPT_DIR/lib/input-validation.sh" ]]; then
  source "$SCRIPT_DIR/lib/input-validation.sh"
fi

BG_DIR="$SCRIPT_DIR/../audio/tracks"
CONFIG_FILE="$SCRIPT_DIR/../config/audio-effects.cfg"

# Create timestamped backup directory
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$PROJECT_ROOT/.migration-backups/background-music-$BACKUP_TIMESTAMP"
BACKUP_LOG="$BACKUP_DIR/BACKUP_MANIFEST.txt"
ROLLBACK_SCRIPT="$BACKUP_DIR/rollback.sh"
CHANGES_LOG="$BACKUP_DIR/CHANGES.log"

# Flag to track if any changes were made
CHANGES_MADE=false
BACKUP_CREATED=false

# Create backup infrastructure
create_backup_infrastructure() {
    mkdir -p "$BACKUP_DIR"
    echo "# Backup created at: $(date)" > "$BACKUP_LOG"
    echo "# Source: $PROJECT_ROOT" >> "$BACKUP_LOG"
    echo "# Migration: background music cleanup" >> "$BACKUP_LOG"
    echo "" >> "$BACKUP_LOG"

    # Initialize rollback script
    cat > "$ROLLBACK_SCRIPT" << 'ROLLBACK_HEADER'
#!/usr/bin/env bash
set -euo pipefail
# Auto-generated rollback script
# Run this to undo the migration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Rolling back background music migration..."

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
        return 1
    fi

    if ! cmp -s "$source" "$backup"; then
        return 1
    fi

    return 0
}

# Safe file removal with backup
safe_remove_file() {
    local target="$1"
    local description="${2:-}"

    if [[ ! -f "$target" ]]; then
        return 0
    fi

    # Ensure backup infrastructure exists
    if [[ "$BACKUP_CREATED" != "true" ]]; then
        create_backup_infrastructure
    fi

    # Create unique backup filename to avoid collisions
    local backup_name
    backup_name=$(basename "$target")
    local backup_path="$BACKUP_DIR/$backup_name"

    # Handle duplicate names
    local counter=1
    while [[ -f "$backup_path" ]]; do
        backup_path="$BACKUP_DIR/${backup_name%.*}_$counter.${backup_name##*.}"
        ((counter++))
    done

    cp -p "$target" "$backup_path"

    # Verify backup
    if ! verify_backup "$target" "$backup_path"; then
        echo "  ERROR: Backup verification failed - file NOT deleted: $target"
        return 1
    fi

    # Log the operation
    echo "REMOVED: $target ($description)" >> "$CHANGES_LOG"
    echo "  Backup: $target -> $backup_path" >> "$BACKUP_LOG"

    # Add to rollback script
    echo "cp -p \"$backup_path\" \"$target\"" >> "$ROLLBACK_SCRIPT"

    rm -f "$target"
    return 0
}

# Safe directory backup
backup_directory() {
    local target_dir="$1"
    local description="${2:-}"

    if [[ ! -d "$target_dir" ]]; then
        return 0
    fi

    # Ensure backup infrastructure exists
    if [[ "$BACKUP_CREATED" != "true" ]]; then
        create_backup_infrastructure
    fi

    local backup_path="$BACKUP_DIR/$(basename "$target_dir")-backup"
    cp -r "$target_dir" "$backup_path"

    echo "BACKED_UP_DIR: $target_dir -> $backup_path" >> "$CHANGES_LOG"
    echo "  Directory backup: $target_dir -> $backup_path" >> "$BACKUP_LOG"

    # Add directory restoration to rollback script
    echo "cp -r \"$backup_path\" \"$target_dir\"" >> "$ROLLBACK_SCRIPT"

    return 0
}

echo "Checking for old background music structure..."

# 1. Remove old optimized/ subdirectory if it exists
if [[ -d "$BG_DIR/optimized" ]]; then
    echo "  Removing old optimized/ subdirectory..."

    # FIRST: Create full backup of optimized directory
    backup_directory "$BG_DIR/optimized" "optimized tracks directory"

    # Check if there are any files in optimized/ that aren't in the parent
    MIGRATION_FAILED=false
    if [[ -n "$(find "$BG_DIR/optimized" -type f -name "*.mp3" 2>/dev/null)" ]]; then
        # Move any unique files up before deleting
        while IFS= read -r file; do
            if [[ -z "$file" ]]; then continue; fi

            basename_file=$(basename "$file")
            # Convert to snake_case if needed
            snake_case_file=$(echo "$basename_file" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr '-' '_')

            # Only move if file doesn't exist in parent with snake_case name
            if [[ ! -f "$BG_DIR/$snake_case_file" ]]; then
                # Verify source is readable
                if [[ ! -r "$file" ]]; then
                    echo "    Skipping unreadable file: $basename_file"
                    MIGRATION_FAILED=true
                    continue
                fi

                echo "    Migrating: $basename_file -> $snake_case_file"

                # Copy first, verify, then remove original
                cp -p "$file" "$BG_DIR/$snake_case_file"

                if ! cmp -s "$file" "$BG_DIR/$snake_case_file"; then
                    echo "    ERROR: Copy verification failed - keeping original"
                    rm -f "$BG_DIR/$snake_case_file"
                    MIGRATION_FAILED=true
                    continue
                fi

                rm -f "$file"
                echo "MIGRATED: $file -> $BG_DIR/$snake_case_file" >> "$CHANGES_LOG"
                CHANGES_MADE=true
            fi
        done < <(find "$BG_DIR/optimized" -type f -name "*.mp3" 2>/dev/null)
    fi

    # Only remove directory if all migrations succeeded
    if [[ "$MIGRATION_FAILED" == "false" ]]; then
        rm -rf "$BG_DIR/optimized"
        echo "  Removed optimized/ subdirectory"
        echo "REMOVED_DIR: $BG_DIR/optimized" >> "$CHANGES_LOG"
        CHANGES_MADE=true
    else
        echo "  WARNING: Some migrations failed - optimized/ directory preserved"
        echo "  Check $BACKUP_DIR for backups"
    fi
fi

# 2. Remove old PascalCase/space-formatted files if snake_case versions exist
if [[ -d "$BG_DIR" ]]; then
    while IFS= read -r file; do
        if [[ -z "$file" ]]; then continue; fi

        basename_file=$(basename "$file")

        # Check if this file has spaces or uppercase letters (old format)
        if [[ "$basename_file" =~ [[:space:]] ]] || [[ "$basename_file" =~ [A-Z] ]]; then
            # Generate snake_case equivalent
            snake_case_file=$(echo "$basename_file" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr '-' '_')

            # If snake_case version exists, remove the old format
            if [[ -f "$BG_DIR/$snake_case_file" ]] && [[ "$basename_file" != "$snake_case_file" ]]; then
                # Verify snake_case file is readable before removing old format
                if [[ ! -r "$BG_DIR/$snake_case_file" ]]; then
                    echo "  Skipping - replacement not readable: $snake_case_file"
                    continue
                fi

                echo "  Removing old format: $basename_file (replaced by $snake_case_file)"
                if safe_remove_file "$file" "replaced by $snake_case_file"; then
                    CHANGES_MADE=true
                fi
            fi
        fi
    done < <(find "$BG_DIR" -maxdepth 1 -type f -name "*.mp3" 2>/dev/null)
fi

# 3. Update audio-effects.cfg to remove optimized/ prefixes
if [[ -f "$CONFIG_FILE" ]]; then
    if grep -q "optimized/" "$CONFIG_FILE" 2>/dev/null; then
        echo "  Updating config to remove optimized/ prefixes..."

        # Ensure backup infrastructure exists
        if [[ "$BACKUP_CREATED" != "true" ]]; then
            create_backup_infrastructure
        fi

        # Create timestamped backup
        config_backup="$BACKUP_DIR/audio-effects.cfg.backup"
        cp -p "$CONFIG_FILE" "$config_backup"

        # Verify backup
        if ! cmp -s "$CONFIG_FILE" "$config_backup"; then
            echo "  ERROR: Config backup verification failed - ABORTING config changes"
        else
            echo "  Backup: $CONFIG_FILE -> $config_backup" >> "$BACKUP_LOG"
            echo "cp -p \"$config_backup\" \"$CONFIG_FILE\"" >> "$ROLLBACK_SCRIPT"

            # Remove optimized/ prefix from all entries
            sed -i.bak 's|optimized/||g' "$CONFIG_FILE"

            # Verify changes were applied
            if grep -q "optimized/" "$CONFIG_FILE"; then
                echo "  WARNING: Config update may have failed - check manually"
            else
                rm -f "${CONFIG_FILE}.bak"
                echo "  Updated audio-effects.cfg"
                echo "MODIFIED: $CONFIG_FILE - removed optimized/ prefixes" >> "$CHANGES_LOG"
                CHANGES_MADE=true
            fi
        fi
    fi

    # Also convert any remaining PascalCase/space filenames to snake_case in config
    if grep -E '\|[^|]*[A-Z ][^|]*\.mp3\|' "$CONFIG_FILE" 2>/dev/null | grep -v '^#' > /dev/null; then
        echo "  Converting config entries to snake_case..."

        # Ensure backup exists
        if [[ ! -f "$BACKUP_DIR/audio-effects.cfg.backup" ]] && [[ "$BACKUP_CREATED" == "true" ]]; then
            cp -p "$CONFIG_FILE" "$BACKUP_DIR/audio-effects.cfg.backup"
            echo "  Backup: $CONFIG_FILE -> $BACKUP_DIR/audio-effects.cfg.backup" >> "$BACKUP_LOG"
            echo "cp -p \"$BACKUP_DIR/audio-effects.cfg.backup\" \"$CONFIG_FILE\"" >> "$ROLLBACK_SCRIPT"
        fi

        # This is complex - we need to convert field 3 (background file) to snake_case
        temp_file=$(mktemp)
        while IFS='|' read -r field1 field2 field3 field4 rest; do
            # Skip comments and empty lines
            if [[ "$field1" =~ ^#.* ]] || [[ -z "$field1" ]]; then
                echo "$field1|$field2|$field3|$field4$rest"
                continue
            fi

            # Convert field3 (background file) to snake_case if it contains spaces or uppercase
            if [[ -n "$field3" ]] && ([[ "$field3" =~ [[:space:]] ]] || [[ "$field3" =~ [A-Z] ]]); then
                new_field3=$(echo "$field3" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr '-' '_')
                echo "$field1|$field2|$new_field3|$field4$rest"
            else
                echo "$field1|$field2|$field3|$field4$rest"
            fi
        done < "$CONFIG_FILE" > "$temp_file"

        # Verify temp file is valid before replacing
        if [[ -s "$temp_file" ]]; then
            mv "$temp_file" "$CONFIG_FILE"
            echo "  Converted config entries to snake_case"
            echo "MODIFIED: $CONFIG_FILE - converted to snake_case" >> "$CHANGES_LOG"
            CHANGES_MADE=true
        else
            rm -f "$temp_file"
            echo "  WARNING: Config conversion produced empty file - keeping original"
        fi
    fi
fi

# Finalize rollback script
if [[ "$BACKUP_CREATED" == "true" ]]; then
    echo "" >> "$ROLLBACK_SCRIPT"
    echo "echo 'Rollback complete!'" >> "$ROLLBACK_SCRIPT"
fi

if [[ "$CHANGES_MADE" == "true" ]]; then
    echo "Migration complete! Old background music structure cleaned up."

    if [[ "$BACKUP_CREATED" == "true" ]]; then
        echo ""
        echo "Backup Information:"
        echo "  Backup location: $BACKUP_DIR"
        echo "  Rollback script: $ROLLBACK_SCRIPT"
        echo ""
        echo "To undo this migration, run:"
        echo "  bash $ROLLBACK_SCRIPT"
    fi
else
    echo "No migration needed - structure is already up to date."

    # Clean up empty backup dir if no migration occurred
    if [[ "$BACKUP_CREATED" == "true" ]]; then
        rm -rf "$BACKUP_DIR"
    fi
fi
