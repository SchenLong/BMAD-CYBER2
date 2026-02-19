-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_finding_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "findingId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "finding_history_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_finding_history" ("changedAt", "changedBy", "field", "findingId", "id", "newValue", "notes", "oldValue") SELECT "changedAt", "changedBy", "field", "findingId", "id", "newValue", "notes", "oldValue" FROM "finding_history";
DROP TABLE "finding_history";
ALTER TABLE "new_finding_history" RENAME TO "finding_history";
CREATE INDEX "finding_history_findingId_idx" ON "finding_history"("findingId");
CREATE INDEX "finding_history_changedAt_idx" ON "finding_history"("changedAt");
CREATE TABLE "new_timeline_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT,
    "contributor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "timeline_events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_timeline_events" ("contributor", "createdAt", "description", "id", "phase", "projectId", "severity", "title") SELECT "contributor", "createdAt", "description", "id", "phase", "projectId", "severity", "title" FROM "timeline_events";
DROP TABLE "timeline_events";
ALTER TABLE "new_timeline_events" RENAME TO "timeline_events";
CREATE INDEX "timeline_events_projectId_idx" ON "timeline_events"("projectId");
CREATE INDEX "timeline_events_phase_idx" ON "timeline_events"("phase");
CREATE INDEX "timeline_events_createdAt_idx" ON "timeline_events"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
