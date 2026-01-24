#!/usr/bin/env python3
"""
BMAD Agent Validator v2.0.0
Comprehensive validation tooling for BMAD agent distribution pipeline
Designed by Winston (The Master Strategist) for Story 2.2
"""

import yaml
import json
import jsonschema
import argparse
import sys
import os
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import re
from dataclasses import dataclass
from enum import Enum
import hashlib
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

class Severity(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class ValidationError:
    rule_id: str
    severity: Severity
    message: str
    file_path: str
    line: Optional[int] = None
    column: Optional[int] = None
    fix_suggestion: Optional[str] = None

@dataclass
class ValidationResult:
    file_path: str
    is_valid: bool
    errors: List[ValidationError]
    warnings: List[ValidationError]
    quality_score: float
    validation_time: float

class BMADAgentValidator:
    """Main validator class for BMAD agents"""

    def __init__(self, schema_path: Optional[str] = None, strict_mode: bool = False):
        self.strict_mode = strict_mode
        self.schema_path = schema_path or self._find_schema_path()
        self.schema = self._load_schema()
        self.validation_rules = self._load_validation_rules()

    def _find_schema_path(self) -> str:
        """Find the schema file in common locations"""
        possible_paths = [
            "bmad-agent-schema.yaml",
            "schemas/bmad-agent-schema.yaml",
            "/usr/local/share/bmad/schemas/bmad-agent-schema.yaml"
        ]

        for path in possible_paths:
            if os.path.exists(path):
                return path

        raise FileNotFoundError("BMAD agent schema file not found")

    def _load_schema(self) -> Dict[str, Any]:
        """Load JSON schema from YAML file"""
        try:
            with open(self.schema_path, 'r') as f:
                schema_yaml = yaml.safe_load(f)
            return schema_yaml
        except Exception as e:
            raise RuntimeError(f"Failed to load schema: {e}")

    def _load_validation_rules(self) -> Dict[str, Any]:
        """Load validation rules configuration"""
        rules_path = "bmad-validation-rules.yaml"
        try:
            with open(rules_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            print(f"Warning: Validation rules file not found at {rules_path}")
            return {}

    def validate_agent_file(self, file_path: str) -> ValidationResult:
        """Validate a single agent YAML file"""
        start_time = time.time()
        errors = []
        warnings = []

        try:
            # Load YAML file
            with open(file_path, 'r') as f:
                agent_data = yaml.safe_load(f)
        except yaml.YAMLError as e:
            error = ValidationError(
                rule_id="STR_001",
                severity=Severity.CRITICAL,
                message=f"Invalid YAML syntax: {e}",
                file_path=file_path,
                fix_suggestion="Check YAML formatting and indentation"
            )
            errors.append(error)
            return ValidationResult(
                file_path=file_path,
                is_valid=False,
                errors=errors,
                warnings=warnings,
                quality_score=0.0,
                validation_time=time.time() - start_time
            )

        # Structural validation
        errors.extend(self._validate_structure(agent_data, file_path))

        # Schema validation
        errors.extend(self._validate_schema(agent_data, file_path))

        # Semantic validation
        warnings.extend(self._validate_semantics(agent_data, file_path))

        # Security validation
        security_issues = self._validate_security(agent_data, file_path)
        errors.extend([e for e in security_issues if e.severity in [Severity.CRITICAL, Severity.HIGH]])
        warnings.extend([e for e in security_issues if e.severity in [Severity.MEDIUM, Severity.LOW]])

        # Quality validation
        quality_issues = self._validate_quality(agent_data, file_path)
        warnings.extend(quality_issues)

        # Calculate quality score
        quality_score = self._calculate_quality_score(agent_data, errors, warnings)

        is_valid = len([e for e in errors if e.severity in [Severity.CRITICAL, Severity.HIGH]]) == 0

        return ValidationResult(
            file_path=file_path,
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            quality_score=quality_score,
            validation_time=time.time() - start_time
        )

    def _validate_structure(self, agent_data: Dict[str, Any], file_path: str) -> List[ValidationError]:
        """Validate basic structure requirements"""
        errors = []

        # Check required top-level sections - Handle both formats
        if 'agent' not in agent_data:
            errors.append(ValidationError(
                rule_id="STR_002",
                severity=Severity.CRITICAL,
                message="Missing required top-level 'agent' section",
                file_path=file_path,
                fix_suggestion="Add 'agent:' as the root element"
            ))
            return errors

        agent = agent_data['agent']

        # Check if this is extracted format (persona at root) or new format (persona under agent)
        if 'persona' in agent_data:
            # Extracted format: agent.metadata, but persona/activation/etc at root
            required_agent_sections = ['metadata']
            root_sections = ['persona', 'activation', 'menu', 'rules', 'menu_handlers', 'extraction']

            # Check for extracted format sections at root level
            for section in root_sections:
                if section not in agent_data:
                    errors.append(ValidationError(
                        rule_id="STR_002",
                        severity=Severity.CRITICAL,
                        message=f"Missing required section: {section} (extracted format)",
                        file_path=file_path,
                        fix_suggestion=f"Add the '{section}:' section at root level"
                    ))
        else:
            # New format: everything under agent
            required_agent_sections = ['metadata', 'persona', 'activation', 'menu', 'rules', 'menu_handlers', 'extraction']

        # Check required sections under agent
        for section in required_agent_sections:
            if section not in agent:
                errors.append(ValidationError(
                    rule_id="STR_002",
                    severity=Severity.CRITICAL,
                    message=f"Missing required section: agent.{section}",
                    file_path=file_path,
                    fix_suggestion=f"Add the '{section}:' section to agent definition"
                ))

        return errors

    def _validate_schema(self, agent_data: Dict[str, Any], file_path: str) -> List[ValidationError]:
        """Validate against JSON schema"""
        errors = []

        try:
            jsonschema.validate(instance=agent_data, schema=self.schema)
        except jsonschema.ValidationError as e:
            errors.append(ValidationError(
                rule_id="STR_003",
                severity=Severity.CRITICAL,
                message=f"Schema validation failed: {e.message}",
                file_path=file_path,
                fix_suggestion="Ensure all fields match the required schema format"
            ))
        except jsonschema.SchemaError as e:
            errors.append(ValidationError(
                rule_id="STR_003",
                severity=Severity.CRITICAL,
                message=f"Invalid schema: {e.message}",
                file_path=file_path
            ))

        return errors

    def _validate_semantics(self, agent_data: Dict[str, Any], file_path: str) -> List[ValidationError]:
        """Validate semantic consistency"""
        warnings = []

        if 'agent' not in agent_data:
            return warnings

        # Handle both schema formats
        if 'activation' in agent_data['agent']:
            # New format: everything under agent
            agent = agent_data['agent']
            activation = agent.get('activation', {})
            menu = agent.get('menu', [])
            menu_handlers = agent.get('menu_handlers', [])
        else:
            # Extracted format: metadata under agent, rest at root
            agent = agent_data['agent']
            activation = agent_data.get('activation', {})
            menu = agent_data.get('menu', [])
            menu_handlers = agent_data.get('menu_handlers', [])

        # Check activation step sequence
        if 'steps' in activation:
            steps = activation['steps']
            expected_number = 1

            for step in steps:
                if 'number' in step and step['number'] != expected_number:
                    warnings.append(ValidationError(
                        rule_id="SEM_003",
                        severity=Severity.MEDIUM,
                        message=f"Activation step sequence gap: expected {expected_number}, got {step['number']}",
                        file_path=file_path,
                        fix_suggestion="Ensure activation steps are sequential starting from 1"
                    ))
                expected_number += 1

        # Check menu handler coverage
        if menu and menu_handlers:

            exec_items = [item for item in menu if 'exec' in item]
            handler_content = ' '.join([h.get('content', '') for h in menu_handlers])

            if exec_items and 'exec=' not in handler_content:
                warnings.append(ValidationError(
                    rule_id="SEM_002",
                    severity=Severity.MEDIUM,
                    message="Menu items with 'exec' attribute found but no exec handler defined",
                    file_path=file_path,
                    fix_suggestion="Add menu_handlers entry for handling 'exec' attributes"
                ))

        return warnings

    def _validate_security(self, agent_data: Dict[str, Any], file_path: str) -> List[ValidationError]:
        """Validate security requirements"""
        issues = []

        if 'agent' not in agent_data:
            return issues

        agent = agent_data['agent']

        # Check for required security rules
        if 'rules' in agent:
            rules_content = ' '.join([rule.get('content', '') for rule in agent['rules']])

            if 'PROMPT INJECTION PROTECTION' not in rules_content:
                issues.append(ValidationError(
                    rule_id="SEC_001",
                    severity=Severity.CRITICAL,
                    message="Missing required prompt injection protection rule",
                    file_path=file_path,
                    fix_suggestion="Add prompt injection protection rule to the rules section"
                ))

            if 'EXTERNAL CONTENT MANIPULATION PROTECTION' not in rules_content:
                issues.append(ValidationError(
                    rule_id="SEC_001",
                    severity=Severity.CRITICAL,
                    message="Missing required external content protection rule",
                    file_path=file_path,
                    fix_suggestion="Add external content manipulation protection rule"
                ))

        # Scan for dangerous patterns
        dangerous_patterns = [
            (r'\brm\s+-rf\b', 'Dangerous file deletion command'),
            (r'\bsudo\b', 'Privilege escalation attempt'),
            (r'\beval\s*\(', 'Code evaluation security risk'),
            (r'\bexec\s*\(', 'Code execution security risk')
        ]

        # Check all text content
        content_to_scan = []
        if 'persona' in agent:
            content_to_scan.extend(agent['persona'].values())
        if 'menu' in agent:
            for item in agent['menu']:
                if 'action' in item:
                    content_to_scan.append(item['action'])

        for content in content_to_scan:
            if isinstance(content, str):
                for pattern, description in dangerous_patterns:
                    if re.search(pattern, content, re.IGNORECASE):
                        issues.append(ValidationError(
                            rule_id="SEC_002",
                            severity=Severity.HIGH,
                            message=f"Security risk detected: {description}",
                            file_path=file_path,
                            fix_suggestion="Remove or secure the dangerous pattern"
                        ))

        return issues

    def _validate_quality(self, agent_data: Dict[str, Any], file_path: str) -> List[ValidationError]:
        """Validate quality metrics"""
        warnings = []

        if 'agent' not in agent_data:
            return warnings

        agent = agent_data['agent']

        # Check description length
        if 'metadata' in agent and 'description' in agent['metadata']:
            desc = agent['metadata']['description']
            if len(desc) < 10:
                warnings.append(ValidationError(
                    rule_id="QUA_001",
                    severity=Severity.MEDIUM,
                    message=f"Description too short ({len(desc)} characters, minimum 10)",
                    file_path=file_path,
                    fix_suggestion="Expand description with more details about agent capabilities"
                ))

        # Check menu item count
        if 'menu' in agent:
            menu_count = len(agent['menu'])
            if menu_count < 5:
                warnings.append(ValidationError(
                    rule_id="QUA_002",
                    severity=Severity.LOW,
                    message=f"Few menu items ({menu_count}, recommended minimum 5)",
                    file_path=file_path,
                    fix_suggestion="Consider adding more menu options for better usability"
                ))

        return warnings

    def _calculate_quality_score(self, agent_data: Dict[str, Any], errors: List[ValidationError], warnings: List[ValidationError]) -> float:
        """Calculate overall quality score (0-100)"""
        base_score = 100.0

        # Deduct points for errors and warnings
        for error in errors:
            if error.severity == Severity.CRITICAL:
                base_score -= 25
            elif error.severity == Severity.HIGH:
                base_score -= 15
            elif error.severity == Severity.MEDIUM:
                base_score -= 5

        for warning in warnings:
            if warning.severity == Severity.MEDIUM:
                base_score -= 3
            elif warning.severity == Severity.LOW:
                base_score -= 1

        # Bonus points for completeness
        if 'agent' in agent_data:
            agent = agent_data['agent']

            # Persona completeness bonus
            if 'persona' in agent:
                persona = agent['persona']
                if all(key in persona for key in ['role', 'identity', 'communication_style', 'principles']):
                    base_score += 5

            # Menu variety bonus
            if 'menu' in agent and len(agent['menu']) >= 8:
                base_score += 3

            # Security compliance bonus
            if 'rules' in agent and len(agent['rules']) >= 5:
                base_score += 2

        return max(0.0, min(100.0, base_score))

    def validate_package(self, package_dir: str, recursive: bool = True, parallel: bool = True) -> List[ValidationResult]:
        """Validate all agent files in a package directory"""
        agent_files = []

        if recursive:
            for root, dirs, files in os.walk(package_dir):
                for file in files:
                    if file.endswith('.agent.yaml'):
                        agent_files.append(os.path.join(root, file))
        else:
            for file in os.listdir(package_dir):
                if file.endswith('.agent.yaml'):
                    agent_files.append(os.path.join(package_dir, file))

        if not agent_files:
            print(f"No agent files found in {package_dir}")
            return []

        if parallel and len(agent_files) > 1:
            return self._validate_parallel(agent_files)
        else:
            return [self.validate_agent_file(file_path) for file_path in agent_files]

    def _validate_parallel(self, file_paths: List[str], max_workers: int = 4) -> List[ValidationResult]:
        """Validate multiple files in parallel"""
        results = []

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_file = {
                executor.submit(self.validate_agent_file, file_path): file_path
                for file_path in file_paths
            }

            for future in as_completed(future_to_file):
                file_path = future_to_file[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    results.append(ValidationResult(
                        file_path=file_path,
                        is_valid=False,
                        errors=[ValidationError(
                            rule_id="VAL_001",
                            severity=Severity.CRITICAL,
                            message=f"Validation failed: {e}",
                            file_path=file_path
                        )],
                        warnings=[],
                        quality_score=0.0,
                        validation_time=0.0
                    ))

        return sorted(results, key=lambda x: x.file_path)

class ReportGenerator:
    """Generate validation reports in various formats"""

    @staticmethod
    def generate_json_report(results: List[ValidationResult], output_path: str):
        """Generate JSON validation report"""
        report_data = {
            "validation_summary": {
                "total_files": len(results),
                "valid_files": len([r for r in results if r.is_valid]),
                "files_with_errors": len([r for r in results if not r.is_valid]),
                "total_errors": sum(len(r.errors) for r in results),
                "total_warnings": sum(len(r.warnings) for r in results),
                "average_quality_score": sum(r.quality_score for r in results) / len(results) if results else 0.0,
                "total_validation_time": sum(r.validation_time for r in results)
            },
            "file_results": []
        }

        for result in results:
            file_data = {
                "file_path": result.file_path,
                "is_valid": result.is_valid,
                "quality_score": result.quality_score,
                "validation_time": result.validation_time,
                "errors": [
                    {
                        "rule_id": error.rule_id,
                        "severity": error.severity.value,
                        "message": error.message,
                        "line": error.line,
                        "column": error.column,
                        "fix_suggestion": error.fix_suggestion
                    }
                    for error in result.errors
                ],
                "warnings": [
                    {
                        "rule_id": warning.rule_id,
                        "severity": warning.severity.value,
                        "message": warning.message,
                        "line": warning.line,
                        "column": warning.column,
                        "fix_suggestion": warning.fix_suggestion
                    }
                    for warning in result.warnings
                ]
            }
            report_data["file_results"].append(file_data)

        with open(output_path, 'w') as f:
            json.dump(report_data, f, indent=2)

    @staticmethod
    def generate_console_report(results: List[ValidationResult]):
        """Generate console-friendly validation report"""
        print("\n" + "="*80)
        print("🐉 BMAD AGENT VALIDATION REPORT")
        print("="*80)

        total_files = len(results)
        valid_files = len([r for r in results if r.is_valid])
        total_errors = sum(len(r.errors) for r in results)
        total_warnings = sum(len(r.warnings) for r in results)
        avg_quality = sum(r.quality_score for r in results) / len(results) if results else 0

        print(f"\n📊 SUMMARY:")
        print(f"  Total Files:       {total_files}")
        print(f"  Valid Files:       {valid_files}")
        print(f"  Files with Errors: {total_files - valid_files}")
        print(f"  Total Errors:      {total_errors}")
        print(f"  Total Warnings:    {total_warnings}")
        print(f"  Average Quality:   {avg_quality:.1f}/100")

        if total_errors == 0 and total_warnings == 0:
            print("\n🎉 ALL AGENTS PASS VALIDATION!")
        else:
            print(f"\n📋 DETAILED RESULTS:")

            for result in results:
                status = "✅" if result.is_valid else "❌"
                print(f"\n{status} {result.file_path}")
                print(f"   Quality Score: {result.quality_score:.1f}/100")

                if result.errors:
                    print("   🚨 ERRORS:")
                    for error in result.errors:
                        print(f"      {error.severity.value.upper()}: {error.message}")
                        if error.fix_suggestion:
                            print(f"         Fix: {error.fix_suggestion}")

                if result.warnings:
                    print("   ⚠️  WARNINGS:")
                    for warning in result.warnings:
                        print(f"      {warning.severity.value.upper()}: {warning.message}")
                        if warning.fix_suggestion:
                            print(f"         Fix: {warning.fix_suggestion}")

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="BMAD Agent Validator v2.0.0 - Validate BMAD agent files",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Validate single agent command
    validate_parser = subparsers.add_parser('agent', help='Validate single agent file')
    validate_parser.add_argument('file_path', help='Path to agent YAML file')
    validate_parser.add_argument('--schema-file', help='Custom schema file path')
    validate_parser.add_argument('--strict', action='store_true', help='Enable strict validation mode')
    validate_parser.add_argument('--output-format', choices=['console', 'json', 'yaml'], default='console', help='Output format')
    validate_parser.add_argument('--output-file', help='Output file path (for non-console formats)')

    # Validate package command
    package_parser = subparsers.add_parser('package', help='Validate entire package')
    package_parser.add_argument('package_dir', help='Path to package directory')
    package_parser.add_argument('--schema-file', help='Custom schema file path')
    package_parser.add_argument('--strict', action='store_true', help='Enable strict validation mode')
    package_parser.add_argument('--recursive', action='store_true', default=True, help='Validate subdirectories')
    package_parser.add_argument('--parallel', action='store_true', default=True, help='Parallel validation')
    package_parser.add_argument('--output-format', choices=['console', 'json', 'yaml'], default='console', help='Output format')
    package_parser.add_argument('--output-file', help='Output file path (for non-console formats)')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    try:
        validator = BMADAgentValidator(
            schema_path=getattr(args, 'schema_file', None),
            strict_mode=getattr(args, 'strict', False)
        )

        if args.command == 'agent':
            result = validator.validate_agent_file(args.file_path)
            results = [result]
        elif args.command == 'package':
            results = validator.validate_package(
                args.package_dir,
                recursive=args.recursive,
                parallel=args.parallel
            )

        # Generate report
        if args.output_format == 'console':
            ReportGenerator.generate_console_report(results)
        elif args.output_format == 'json':
            output_file = args.output_file or 'validation-report.json'
            ReportGenerator.generate_json_report(results, output_file)
            print(f"Report saved to: {output_file}")

        # Exit with non-zero code if validation failed
        if any(not result.is_valid for result in results):
            sys.exit(1)
        else:
            sys.exit(0)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()