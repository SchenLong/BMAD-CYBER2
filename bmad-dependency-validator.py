#!/usr/bin/env python3
"""
BMAD Dependency Management System Validator
Validates the complete dependency management implementation
Designed by Winston (Architect) for Epic 3: Story 3.2
"""

import os
import yaml
import sys
from pathlib import Path

class BMADDependencyValidator:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.validation_results = {
            "overall_status": "unknown",
            "components": {},
            "errors": [],
            "warnings": []
        }

    def validate_all(self):
        """Run complete validation suite"""
        print("🔍 BMAD Dependency Management System Validation")
        print("=" * 60)

        self.validate_core_files()
        self.validate_configuration_schemas()
        self.validate_specialized_teams()
        self.determine_overall_status()
        self.generate_validation_report()

        return self.validation_results

    def validate_core_files(self):
        """Validate presence of core implementation files"""
        print("\n📁 Validating Core Implementation Files...")

        required_files = [
            "bmad-dependency-manager.js",
            "bmad-version-compatibility.js",
            "bmad-circular-detection.js",
            "package-registry-manager.js",
            "dependencies.yaml",
            "BMAD-DEPENDENCY-MANAGEMENT-GUIDE.md"
        ]

        component_result = {"status": "pass", "files_found": [], "missing_files": []}

        for filename in required_files:
            file_path = self.project_root / filename
            if file_path.exists():
                component_result["files_found"].append(filename)
                print(f"  ✅ {filename}")
            else:
                component_result["missing_files"].append(filename)
                component_result["status"] = "fail"
                self.validation_results["errors"].append(f"Missing required file: {filename}")
                print(f"  ❌ {filename} - MISSING")

        self.validation_results["components"]["core_files"] = component_result

    def validate_configuration_schemas(self):
        """Validate configuration schemas"""
        print("\n📋 Validating Configuration Schemas...")

        component_result = {"status": "pass"}

        deps_file = self.project_root / "dependencies.yaml"
        if deps_file.exists():
            try:
                deps_config = yaml.safe_load(deps_file.read_text())
                required_sections = ["package", "bmad_core", "runtime"]
                missing_sections = [s for s in required_sections if s not in deps_config]

                if missing_sections:
                    component_result["status"] = "warning"
                    self.validation_results["warnings"].append(
                        f"dependencies.yaml missing sections: {', '.join(missing_sections)}"
                    )

                print("  ✅ dependencies.yaml schema validated")
            except Exception as e:
                component_result["status"] = "fail"
                self.validation_results["errors"].append(f"Invalid dependencies.yaml: {e}")
                print("  ❌ dependencies.yaml validation failed")

        self.validation_results["components"]["configuration_schemas"] = component_result

    def validate_specialized_teams(self):
        """Validate specialized teams configuration"""
        print("\n👥 Validating Specialized Teams Support...")

        component_result = {"status": "pass", "teams": {}}

        teams = ["cybersec-team", "intel-team", "legal-team", "strategy-team"]

        for team in teams:
            example_file = self.project_root / f"{team}-module.yaml.example"
            if example_file.exists():
                component_result["teams"][team] = "configured"
                print(f"  ✅ {team} configuration found")
            else:
                component_result["teams"][team] = "missing"
                print(f"  ⚠️  {team} configuration missing")

        self.validation_results["components"]["specialized_teams"] = component_result

    def determine_overall_status(self):
        """Determine overall validation status"""
        if self.validation_results["errors"]:
            self.validation_results["overall_status"] = "fail"
        elif self.validation_results["warnings"]:
            self.validation_results["overall_status"] = "warning"
        else:
            self.validation_results["overall_status"] = "pass"

    def generate_validation_report(self):
        """Generate validation report"""
        print("\n" + "=" * 60)
        print("📊 VALIDATION REPORT")
        print("=" * 60)

        status = self.validation_results["overall_status"]
        status_emoji = {"pass": "✅", "warning": "⚠️", "fail": "❌"}

        print(f"\nOverall Status: {status_emoji[status]} {status.upper()}")

        if self.validation_results["errors"]:
            print(f"\n❌ Errors:")
            for error in self.validation_results["errors"]:
                print(f"  • {error}")

        if self.validation_results["warnings"]:
            print(f"\n⚠️  Warnings:")
            for warning in self.validation_results["warnings"]:
                print(f"  • {warning}")

        print(f"\n🔄 Integration Readiness:")
        if status == "pass":
            print("  ✅ System is ready for integration with Amelia's framework")
        elif status == "warning":
            print("  ⚠️  System has minor issues but can be integrated with caution")
        else:
            print("  ❌ System has critical issues that must be resolved before integration")


def main():
    project_root = sys.argv[1] if len(sys.argv) > 1 else "."
    validator = BMADDependencyValidator(project_root)
    results = validator.validate_all()

    if results["overall_status"] == "fail":
        sys.exit(1)
    elif results["overall_status"] == "warning":
        sys.exit(2)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()