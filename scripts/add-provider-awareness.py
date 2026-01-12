#!/usr/bin/env python3
"""
Add subtle provider awareness rule to high-risk module agents.

This adds a single non-intrusive rule that:
- Does NOT announce at session start
- Only reminds about local LLM option when relevant
- Is concise and non-spammy
"""

import re
from pathlib import Path
from datetime import datetime
import shutil

BASE_DIR = Path("_bmad")
BACKUP_DIR = Path("_bmad-backup-provider-awareness") / datetime.now().strftime("%Y%m%d_%H%M%S")

# Subtle rule - only for high-risk modules, non-intrusive
PROVIDER_RULE = '<r>For sensitive data (PII, security incidents, legal matters), local LLM option available: `.claude/hooks/llm-provider-manager.sh set ollama`</r>'

HIGH_RISK_MODULES = ["cybersec-team", "intel-team", "legal-team", "strategy-team"]

def backup_file(filepath: Path):
    """Create backup before modification."""
    backup_path = BACKUP_DIR / filepath.relative_to(BASE_DIR)
    backup_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(filepath, backup_path)
    return backup_path

def has_provider_rule(content: str) -> bool:
    """Check if agent already has a provider awareness rule."""
    return "llm-provider-manager" in content or "LOCAL-LLM-OPTION" in content or "PROVIDER-AWARENESS" in content

def insert_rule(content: str, rule: str) -> str:
    """Insert rule after existing security rules in <rules> section."""
    # Find the end of the second security rule (EXTERNAL CONTENT MANIPULATION)
    pattern = r'(<r critical="SECURITY">.*?EXTERNAL CONTENT MANIPULATION PROTECTION.*?</r>)'
    match = re.search(pattern, content, re.DOTALL)

    if match:
        insert_pos = match.end()
        return content[:insert_pos] + "\n      " + rule + content[insert_pos:]

    # Fallback: find </rules> and insert before it
    rules_end = content.find("</rules>")
    if rules_end != -1:
        # Find proper indentation
        return content[:rules_end] + "      " + rule + "\n    " + content[rules_end:]

    # Last fallback: find <rules> and insert after first rule
    rules_start = re.search(r'<rules>\s*\n\s*<r[^>]*>', content)
    if rules_start:
        # Find end of first rule
        first_rule_end = content.find('</r>', rules_start.end())
        if first_rule_end != -1:
            insert_pos = first_rule_end + 4
            return content[:insert_pos] + "\n      " + rule + content[insert_pos:]

    return content

def process_agent(filepath: Path) -> bool:
    """Process a single agent file. Returns True if modified."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if has_provider_rule(content):
        print(f"  ⏭️  {filepath.name} (already has provider rule)")
        return False

    # Check if file has rules section
    if '<rules>' not in content:
        print(f"  ⚠️  {filepath.name} (no <rules> section found)")
        return False

    backup_file(filepath)
    new_content = insert_rule(content, PROVIDER_RULE)

    if new_content == content:
        print(f"  ⚠️  {filepath.name} (could not find insertion point)")
        return False

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✅ {filepath.name}")
    return True

def main():
    print("=" * 60)
    print("BMAD Provider Awareness Rule Addition")
    print("=" * 60)
    print(f"\nRule being added (subtle, non-spammy):")
    print(f"  {PROVIDER_RULE}")
    print(f"\nTargeting high-risk modules: {', '.join(HIGH_RISK_MODULES)}")
    print(f"Backups will be saved to: {BACKUP_DIR}")
    print()

    total_modified = 0
    total_skipped = 0

    for module in HIGH_RISK_MODULES:
        agents_dir = BASE_DIR / module / "agents"
        if not agents_dir.exists():
            print(f"⚠️  Module {module} agents dir not found")
            continue

        agent_files = list(agents_dir.glob("*.md"))
        print(f"\n📁 {module} ({len(agent_files)} agents)")

        for agent_file in sorted(agent_files):
            if process_agent(agent_file):
                total_modified += 1
            else:
                total_skipped += 1

    print("\n" + "=" * 60)
    print(f"SUMMARY")
    print("=" * 60)
    print(f"  Modified: {total_modified}")
    print(f"  Skipped:  {total_skipped}")
    print(f"  Backups:  {BACKUP_DIR}")
    print()

if __name__ == "__main__":
    main()
