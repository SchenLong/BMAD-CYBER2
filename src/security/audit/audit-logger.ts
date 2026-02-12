// BMAD Tamper-Evident Audit Logger
// Epic 1 - Story 1.4: Complete Audit Logging Implementation
// Cryptographically secure audit trail with tamper detection

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

// Export SecurityLevel enum used by dependent modules
export enum SecurityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

// Type alias for compatibility with existing code
export type AuditLogger = TamperEvidentAuditLogger;

export interface AuditEvent {
  id?: string | undefined;
  eventId?: string | undefined;
  timestamp: Date;
  userId?: string | undefined;
  action: string;
  resource: string;
  outcome: "success" | "failure" | "warning" | "started" | "pending";
  details: Record<string, any>;
  sourceIP?: string | undefined;
  userAgent?: string | undefined;
  sessionId?: string | undefined;
  severity?: "low" | "medium" | "high" | "critical" | undefined;
  securityLevel?: SecurityLevel | undefined;
  category?: "authentication" | "authorization" | "data_access" | "configuration" | "security" | undefined;
  eventType?: string | undefined;
}

export interface AuditLogEntry extends AuditEvent {
  hash: string;
  previousHash: string;
  signature: string;
  merkleRoot?: string;
  blockIndex: number;
}

export interface ComplianceControlEntry {
  controlId: string;
  title: string;
  framework: string;
  description: string;
  eventCount: number;
  failureCount: number;
  status: "COMPLIANT" | "NEEDS_REVIEW" | "NON_COMPLIANT";
  sampleEvents: Array<{ id: string; action: string; outcome: string; timestamp: string }>;
}

export interface ComplianceAnomaly {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  count: number;
}

export interface ComplianceReportOutput {
  reportId: string;
  generatedAt: string;
  timeRange: { start: string; end: string };
  framework: string;
  summary: {
    totalEvents: number;
    anomalyCount: number;
    controlsAssessed: number;
    overallAssessment: "COMPLIANT" | "NEEDS_REVIEW" | "NON_COMPLIANT";
  };
  controls: ComplianceControlEntry[];
  anomalies: ComplianceAnomaly[];
}

// Retention periods in days by audit event category
export const RETENTION_DAYS: Record<string, number> = {
  security: 2555,      // ~7 years
  test: 1095,          // ~3 years
  authentication: 365, // 1 year
  authorization: 365,  // 1 year
  configuration: 365,  // 1 year
  data_access: 365,    // 1 year
  default: 90          // 90 days for general/validation events
};

// Default rotation size threshold in bytes (10 MB)
export const DEFAULT_ROTATION_SIZE = 10 * 1024 * 1024;

export interface RotationResult {
  rotated: boolean;
  archivePath?: string;
  entriesArchived?: number;
  entriesPurged?: number;
  newLogPath?: string;
  lastHash?: string;
}

export class TamperEvidentAuditLogger {
  private logPath: string;
  private privateKey: string;
  private currentHash: string = "";
  private blockIndex: number = 0;
  private logBuffer: AuditLogEntry[] = [];
  private readonly maxBufferSize = 100;
  private rotationSizeThreshold: number = DEFAULT_ROTATION_SIZE;

  constructor(logPath: string, privateKey: string) {
    if (!privateKey || privateKey.trim().length === 0) {
      throw new Error(
        "Audit logger requires a non-empty private key for HMAC signing. " +
        "Set AUDIT_PRIVATE_KEY environment variable or pass a key to the constructor."
      );
    }
    this.logPath = logPath;
    this.privateKey = privateKey;
    this.initializeLogger();
  }

  private async initializeLogger(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.logPath), { recursive: true });
      
      // Load last hash if log exists
      const lastEntry = await this.getLastLogEntry();
      if (lastEntry) {
        this.currentHash = lastEntry.hash;
        this.blockIndex = lastEntry.blockIndex + 1;
      }
    } catch (error) {
      console.error("Failed to initialize audit logger:", error);
    }
  }

  public async logEvent(event: AuditEvent): Promise<void> {
    const logEntry = await this.createLogEntry(event);
    
    // Add to buffer
    this.logBuffer.push(logEntry);
    
    // Write immediately for critical events
    if (event.severity === "critical") {
      await this.flushBuffer();
    } else if (this.logBuffer.length >= this.maxBufferSize) {
      await this.flushBuffer();
    }
    
    // Real-time SIEM forwarding for high/critical events
    if (event.severity && ["high", "critical"].includes(event.severity)) {
      await this.forwardToSiem(logEntry);
    }
  }

  private async createLogEntry(event: AuditEvent): Promise<AuditLogEntry> {
    const entryData = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      blockIndex: this.blockIndex++
    };

    // Create hash chain
    const dataToHash = JSON.stringify(entryData) + this.currentHash;
    const hash = crypto.createHash("sha256").update(dataToHash).digest("hex");
    
    // Create digital signature
    const signature = this.signData(dataToHash);
    
    const logEntry: AuditLogEntry = {
      ...entryData,
      hash,
      previousHash: this.currentHash,
      signature
    };

    this.currentHash = hash;
    return logEntry;
  }

  private signData(data: string): string {
    return crypto.createHmac("sha256", this.privateKey).update(data).digest("hex");
  }

  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      const count = this.logBuffer.length;
      const logData = `${this.logBuffer.map(entry => JSON.stringify(entry)).join("\n")}\n`;
      await fs.appendFile(this.logPath, logData);

      // Clear buffer after successful write
      this.logBuffer = [];

      console.log(`Flushed ${count} audit entries to ${this.logPath}`);
    } catch (error) {
      console.error("Failed to flush audit log buffer:", error);
      throw error;
    }
  }

  private async getLastLogEntry(): Promise<AuditLogEntry | null> {
    try {
      const logContent = await fs.readFile(this.logPath, "utf-8");
      const lines = logContent.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      return lastLine ? JSON.parse(lastLine) : null;
    } catch (error) {
      return null;
    }
  }

  private async forwardToSiem(_entry: AuditLogEntry): Promise<void> {
    // SIEM forwarding would be implemented here
    // For now, this is a stub - actual implementation would use SiemIntegration
    // with proper configuration
    console.log("SIEM forwarding: Would forward audit entry to SIEM");
  }

  public async verifyIntegrity(startDate?: Date, endDate?: Date): Promise<boolean> {
    try {
      const logs = await this.getLogEntries(startDate, endDate);
      let previousHash = "";

      for (const entry of logs) {
        // Verify chain linkage
        if (entry.previousHash !== previousHash) {
          console.error(`Chain linkage broken for entry ${entry.id}: expected previousHash=${previousHash}, got ${entry.previousHash}`);
          return false;
        }

        // Reconstruct hash the same way as createLogEntry:
        // entryData = { ...event, id, timestamp, blockIndex } (no hash/previousHash/signature/merkleRoot)
        const { hash, previousHash: _prevHash, signature, merkleRoot, ...entryData } = entry;
        const dataToHash = JSON.stringify(entryData) + previousHash;
        const expectedHash = crypto.createHash("sha256")
          .update(dataToHash)
          .digest("hex");

        if (entry.hash !== expectedHash) {
          console.error(`Hash verification failed for entry ${entry.id}`);
          return false;
        }

        // Verify HMAC signature
        if (!this.verifySignature(entry)) {
          console.error(`Signature verification failed for entry ${entry.id}`);
          return false;
        }

        previousHash = entry.hash;
      }

      return true;
    } catch (error) {
      console.error("Integrity verification failed:", error);
      return false;
    }
  }

  private verifySignature(entry: AuditLogEntry): boolean {
    try {
      if (!this.privateKey) {
        return false;
      }
      if (!entry.signature) {
        return false;
      }

      // Reconstruct the data exactly as it was signed in createLogEntry:
      // entryData = { ...event, id, timestamp, blockIndex } (no hash/previousHash/signature/merkleRoot)
      const { hash, previousHash, signature, merkleRoot, ...entryData } = entry;
      const dataToVerify = JSON.stringify(entryData) + previousHash;

      const expectedSignature = crypto.createHmac("sha256", this.privateKey)
        .update(dataToVerify).digest("hex");

      // Timing-safe comparison to prevent timing attacks
      const expected = Buffer.from(expectedSignature, "hex");
      const actual = Buffer.from(signature, "hex");
      if (expected.length !== actual.length) {
        return false;
      }
      return crypto.timingSafeEqual(expected, actual);
    } catch (error) {
      return false;
    }
  }

  private async getLogEntries(startDate?: Date, endDate?: Date): Promise<AuditLogEntry[]> {
    const logContent = await fs.readFile(this.logPath, "utf-8");
    const entries = logContent.trim().split("\n")
      .filter(line => line.trim())
      .map(line => JSON.parse(line) as AuditLogEntry);
    
    if (!startDate && !endDate) {
      return entries;
    }
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      if (startDate && entryDate < startDate) return false;
      if (endDate && entryDate > endDate) return false;
      return true;
    });
  }

  public async generateComplianceReport(
    options: {
      startDate?: Date;
      endDate?: Date;
      framework?: "soc2" | "iso27001" | "both";
    } = {}
  ): Promise<ComplianceReportOutput> {
    const { startDate, endDate, framework = "both" } = options;

    let entries: AuditLogEntry[] = [];
    try {
      entries = await this.getLogEntries(startDate, endDate);
    } catch {
      // Empty log — produce report with 0 events
    }

    const reportId = crypto.randomUUID();
    const generatedAt = new Date().toISOString();
    const entryTimestamp = entries.length > 0 ? entries[0]!.timestamp : generatedAt;
    const startStr = startDate?.toISOString() || (typeof entryTimestamp === "string" ? entryTimestamp : entryTimestamp.toISOString());
    const timeRange = {
      start: startStr,
      end: endDate?.toISOString() || generatedAt
    };

    // Categorize events by SOC 2 / ISO 27001 controls
    const controlEvents = this.mapEventsToControls(entries);

    // Build controls array
    const controls: ComplianceControlEntry[] = [];

    if (framework === "soc2" || framework === "both") {
      controls.push(
        this.buildControlEntry("CC6.1", "Logical Access Controls", "soc2",
          controlEvents.accessEvents, "Agent access grants/denials, RBAC checks, auth events"),
        this.buildControlEntry("CC7.2", "System Monitoring", "soc2",
          controlEvents.monitoringEvents, "Hook executions, validator triggers, audit entries"),
        this.buildControlEntry("CC8.1", "Change Management", "soc2",
          controlEvents.changeEvents, "Config changes, file modifications, schema validations")
      );
    }

    if (framework === "iso27001" || framework === "both") {
      controls.push(
        this.buildControlEntry("A.9", "Access Control", "iso27001",
          controlEvents.accessEvents, "RBAC events, agent authorization"),
        this.buildControlEntry("A.12", "Operations Security", "iso27001",
          controlEvents.monitoringEvents, "Hook execution, monitoring"),
        this.buildControlEntry("A.14", "System Acquisition", "iso27001",
          controlEvents.validationEvents, "Validator events, schema checks")
      );
    }

    // Detect anomalies
    const anomalies = this.detectAnomalies(entries, startDate, endDate);

    // Build summary
    const summary = {
      totalEvents: entries.length,
      anomalyCount: anomalies.length,
      controlsAssessed: controls.length,
      overallAssessment: (anomalies.some(a => a.severity === "critical")
        ? "NEEDS_REVIEW"
        : anomalies.length > 0 ? "NEEDS_REVIEW" : "COMPLIANT") as "COMPLIANT" | "NEEDS_REVIEW" | "NON_COMPLIANT"
    };

    return {
      reportId,
      generatedAt,
      timeRange,
      framework,
      summary,
      controls,
      anomalies
    };
  }

  private mapEventsToControls(entries: AuditLogEntry[]): {
    accessEvents: AuditLogEntry[];
    monitoringEvents: AuditLogEntry[];
    changeEvents: AuditLogEntry[];
    validationEvents: AuditLogEntry[];
  } {
    const accessEvents: AuditLogEntry[] = [];
    const monitoringEvents: AuditLogEntry[] = [];
    const changeEvents: AuditLogEntry[] = [];
    const validationEvents: AuditLogEntry[] = [];

    for (const entry of entries) {
      const cat = entry.category;
      const action = entry.action || "";

      if (cat === "authentication" || cat === "authorization" || cat === "data_access") {
        accessEvents.push(entry);
      }
      if (cat === "security" || action.includes("hook") || action.includes("monitor") || action.includes("audit")) {
        monitoringEvents.push(entry);
      }
      if (cat === "configuration" || action.includes("config") || action.includes("schema") || action.includes("change")) {
        changeEvents.push(entry);
      }
      if (action.includes("validat") || action.includes("schema") || action.includes("check")) {
        validationEvents.push(entry);
      }
    }

    return { accessEvents, monitoringEvents, changeEvents, validationEvents };
  }

  private buildControlEntry(
    controlId: string,
    title: string,
    framework: string,
    events: AuditLogEntry[],
    description: string
  ): ComplianceControlEntry {
    const failureCount = events.filter(e => e.outcome === "failure").length;
    const totalCount = events.length;
    const status: "COMPLIANT" | "NEEDS_REVIEW" | "NON_COMPLIANT" =
      totalCount === 0 ? "NEEDS_REVIEW" :
      failureCount > totalCount * 0.1 ? "NON_COMPLIANT" :
      failureCount > 0 ? "NEEDS_REVIEW" : "COMPLIANT";

    return {
      controlId,
      title,
      framework,
      description,
      eventCount: totalCount,
      failureCount,
      status,
      sampleEvents: events.slice(0, 5).map(e => ({
        id: e.id || e.eventId || "unknown",
        action: e.action,
        outcome: e.outcome,
        timestamp: typeof e.timestamp === "string" ? e.timestamp : e.timestamp.toISOString()
      }))
    };
  }

  private detectAnomalies(
    entries: AuditLogEntry[],
    startDate?: Date,
    endDate?: Date
  ): ComplianceAnomaly[] {
    const anomalies: ComplianceAnomaly[] = [];

    // 1. High RBAC denial rate
    const denials = entries.filter(e =>
      (e.category === "authorization" || e.category === "authentication") && e.outcome === "failure"
    );
    if (denials.length > 10) {
      anomalies.push({
        type: "high_denial_rate",
        severity: "high",
        description: `${denials.length} access denials detected in period`,
        count: denials.length
      });
    }

    // 2. Broken hash chains (integrity issues)
    let chainBreaks = 0;
    for (let i = 1; i < entries.length; i++) {
      if (entries[i]!.previousHash !== entries[i - 1]!.hash) {
        chainBreaks++;
      }
    }
    if (chainBreaks > 0) {
      anomalies.push({
        type: "integrity_issue",
        severity: "critical",
        description: `${chainBreaks} hash chain break(s) detected — possible tampering`,
        count: chainBreaks
      });
    }

    // 3. Time gaps (periods with zero events)
    if (entries.length > 1 && startDate && endDate) {
      const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      if (totalHours > 24 && entries.length < totalHours / 24) {
        anomalies.push({
          type: "event_gap",
          severity: "medium",
          description: `Low event density: ${entries.length} events over ${Math.round(totalHours)} hours`,
          count: entries.length
        });
      }
    }

    return anomalies;
  }

  public setRotationSizeThreshold(bytes: number): void {
    this.rotationSizeThreshold = bytes;
  }

  public async rotateLog(): Promise<RotationResult> {
    // Flush any pending entries before rotation
    await this.flushBuffer();

    // Check if log file exists
    let fileSize = 0;
    try {
      const stats = await fs.stat(this.logPath);
      fileSize = stats.size;
    } catch {
      return { rotated: false };
    }

    // Check size threshold
    if (fileSize < this.rotationSizeThreshold) {
      // Still check retention even if size threshold not met
      const purged = await this.enforceRetention();
      if (purged > 0) {
        return { rotated: false, entriesPurged: purged };
      }
      return { rotated: false };
    }

    // Read current log entries
    const entries = await this.getLogEntries();
    if (entries.length === 0) {
      return { rotated: false };
    }

    // Record the last hash for chain continuity
    const lastEntry = entries[entries.length - 1]!;
    const lastHash = lastEntry.hash;

    // Generate archive filename with ISO timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logDir = path.dirname(this.logPath);
    const logBase = path.basename(this.logPath, path.extname(this.logPath));
    const logExt = path.extname(this.logPath);
    const archivePath = path.join(logDir, `${logBase}-${timestamp}${logExt}`);

    // Rename current log to archive
    await fs.rename(this.logPath, archivePath);

    // Create new empty log file — chain continues from lastHash
    await fs.writeFile(this.logPath, "");
    this.currentHash = lastHash;
    // blockIndex continues incrementing (no reset)

    // Enforce retention on archived segments
    const purged = await this.enforceRetention();

    return {
      rotated: true,
      archivePath,
      entriesArchived: entries.length,
      entriesPurged: purged,
      newLogPath: this.logPath,
      lastHash
    };
  }

  public async enforceRetention(): Promise<number> {
    const logDir = path.dirname(this.logPath);
    const logBase = path.basename(this.logPath, path.extname(this.logPath));
    const logExt = path.extname(this.logPath);
    const now = Date.now();
    let totalPurged = 0;

    try {
      const files = await fs.readdir(logDir);
      // Find archived log segments (e.g., audit-2026-02-11T10-30-00-000Z.log)
      const archivePattern = new RegExp(`^${logBase}-\\d{4}-\\d{2}-\\d{2}T.*${logExt.replace(".", "\\.")}$`);
      const archiveFiles = files.filter(f => archivePattern.test(f));

      for (const archiveFile of archiveFiles) {
        const archivePath = path.join(logDir, archiveFile);
        const purged = await this.purgeExpiredEntries(archivePath, now);
        totalPurged += purged;
      }
    } catch {
      // Directory read failure is non-fatal for retention
    }

    return totalPurged;
  }

  private async purgeExpiredEntries(archivePath: string, now: number): Promise<number> {
    try {
      const content = await fs.readFile(archivePath, "utf-8");
      const lines = content.trim().split("\n").filter(l => l.trim());
      if (lines.length === 0) {
        await fs.unlink(archivePath);
        return 0;
      }

      const entries: AuditLogEntry[] = lines.map(l => JSON.parse(l));
      const retained: AuditLogEntry[] = [];

      for (const entry of entries) {
        const category = entry.category || "default";
        const retentionDays = RETENTION_DAYS[category] ?? RETENTION_DAYS.default ?? 90;
        const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
        const entryTime = new Date(entry.timestamp).getTime();

        if (now - entryTime < retentionMs) {
          retained.push(entry);
        }
      }

      const purged = entries.length - retained.length;

      if (retained.length === 0) {
        // All entries expired — remove archive file
        await fs.unlink(archivePath);
      } else if (purged > 0) {
        // Rewrite archive with only retained entries
        const retainedData = `${retained.map(e => JSON.stringify(e)).join("\n")}\n`;
        await fs.writeFile(archivePath, retainedData);
      }

      return purged;
    } catch {
      return 0;
    }
  }
}

// Singleton instance
let auditLogger: TamperEvidentAuditLogger;

export function getAuditLogger(): TamperEvidentAuditLogger {
  if (!auditLogger) {
    const logPath = process.env.AUDIT_LOG_PATH || "/var/log/bmad/audit.log";
    const privateKey = process.env.AUDIT_PRIVATE_KEY;
    if (!privateKey || privateKey.trim().length === 0) {
      throw new Error(
        "AUDIT_PRIVATE_KEY environment variable is required. " +
        "Set a non-empty secret key for HMAC-based audit log signing."
      );
    }
    auditLogger = new TamperEvidentAuditLogger(logPath, privateKey);
  }
  return auditLogger;
}

// Convenience logging functions
export const auditLog = {
  auth: (action: string, details: any, outcome: "success" | "failure" = "success") =>
    getAuditLogger().logEvent({
      action,
      resource: "authentication",
      category: "authentication",
      severity: outcome === "failure" ? "high" : "medium",
      outcome,
      details
    } as AuditEvent),
    
  access: (resource: string, action: string, details: any, userId?: string) =>
    getAuditLogger().logEvent({
      userId,
      action,
      resource,
      category: "data_access",
      severity: "medium",
      outcome: "success",
      details
    } as AuditEvent),
    
  security: (action: string, details: any, severity: "low" | "medium" | "high" | "critical" = "high") =>
    getAuditLogger().logEvent({
      action,
      resource: "security_system",
      category: "security",
      severity,
      outcome: "warning",
      details
    } as AuditEvent),
    
  config: (action: string, details: any, userId?: string) =>
    getAuditLogger().logEvent({
      userId,
      action,
      resource: "system_configuration",
      category: "configuration",
      severity: "high",
      outcome: "success",
      details
    } as AuditEvent)
};
