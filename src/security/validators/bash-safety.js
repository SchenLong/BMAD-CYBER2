// BMAD Security Validator - Bash Safety
// Protects against command injection attacks
const { execSync } = require("child_process");

class BashSafetyValidator {
  constructor() {
    // Dangerous command patterns
    this.dangerousPatterns = [
      /(\||&|;|`|\$\(|\$\{)/,  // Command chaining operators
      /(rm\s+-rf|del\s+\/|format\s+c:)/i,  // Destructive commands
      /(curl|wget|nc|netcat)\s+/i,  // Network commands
      /(chmod|chown|passwd|sudo)/i,  // Permission commands
      /(\.\.|\/etc\/|\/bin\/|\/usr\/)/,  // Path traversal
      /(eval|exec|system)\s*\(/i,  // Code execution
    ];

    this.allowedCommands = new Set([
      "ls", "pwd", "echo", "cat", "head", "tail", "grep", "find"
    ]);
  }

  validate(input) {
    if (\!input || typeof input \!== "string") {
      return { isValid: false, error: "Invalid input type" };
    }

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          error: `Dangerous command pattern detected: ${pattern}`,
          severity: "HIGH"
        };
      }
    }

    // Extract command from input
    const command = input.trim().split(" ")[0];
    
    // Check if command is in allowed list
    if (\!this.allowedCommands.has(command)) {
      return {
        isValid: false,
        error: `Command not in allowlist: ${command}`,
        severity: "MEDIUM"
      };
    }

    return { isValid: true, command };
  }

  sanitize(input) {
    // Remove dangerous characters
    return input
      .replace(/[|&;`${}]/g, "")
      .replace(/\.\./g, "")
      .trim();
  }
}

module.exports = new BashSafetyValidator();
