#!/usr/bin/env node
/**
 * Daily Evidence Verification Cron Job
 * Runs automated verification of all evidence manifests
 *
 * Compliance: NIST AU-9, AU-10, SOC 2 CC7.2
 *
 * Usage:
 *   node daily-evidence-verification.js [--manifest-dir <path>] [--alert-email <email>]
 *
 * Cron setup (run daily at 2 AM):
 *   0 2 * * * /usr/bin/node /path/to/daily-evidence-verification.js >> /var/log/evidence-verification.log 2>&1
 *
 * @module daily-evidence-verification
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyEvidence, generateVerificationReport, registerAlertHandler } from '../evidence-integrity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default manifest directory
const DEFAULT_MANIFEST_DIR = path.resolve(__dirname, '../../../../docs/ValidationLog');
const LOG_FILE = path.resolve(__dirname, '../../../../logs/evidence-verification.log');

// Alert storage for batch processing
const alerts = [];

/**
 * Find all manifest files in a directory recursively
 */
function findManifests(dir, manifests = []) {
    if (!fs.existsSync(dir)) {
        return manifests;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            findManifests(fullPath, manifests);
        } else if (entry.name.endsWith('-manifest.json') || entry.name === 'manifest.json') {
            manifests.push(fullPath);
        }
    }

    return manifests;
}

/**
 * Log verification result
 */
function logResult(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}`;

    console.log(logLine);

    // Append to log file
    try {
        const logDir = path.dirname(LOG_FILE);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(LOG_FILE, logLine + '\n');
    } catch (err) {
        console.error(`Failed to write log: ${err.message}`);
    }
}

/**
 * Send alert (placeholder - integrate with actual alerting system)
 */
function sendAlert(alert) {
    alerts.push(alert);
    logResult(`ALERT: ${alert.type} - ${JSON.stringify(alert)}`, 'CRITICAL');

    // In production, integrate with:
    // - Email (nodemailer)
    // - Slack webhook
    // - PagerDuty
    // - SIEM system
}

/**
 * Generate daily verification report
 */
function generateDailyReport(results) {
    const report = {
        runDate: new Date().toISOString(),
        totalManifests: results.length,
        passed: results.filter(r => r.result.valid).length,
        failed: results.filter(r => !r.result.valid).length,
        errors: results.filter(r => r.result.status === 'ERROR').length,
        tampered: results.filter(r => r.result.status === 'TAMPERED').length,
        alerts: alerts.length,
        details: results.map(r => ({
            manifest: r.manifest,
            status: r.result.status,
            filesChecked: r.result.details.filesChecked,
            filesPassed: r.result.details.filesPassed,
            filesFailed: r.result.details.filesFailed,
            errors: r.result.errors
        }))
    };

    return report;
}

/**
 * Main verification routine
 */
async function runDailyVerification(manifestDir = DEFAULT_MANIFEST_DIR) {
    logResult('='.repeat(60));
    logResult('Daily Evidence Verification Starting');
    logResult(`Manifest Directory: ${manifestDir}`);
    logResult('='.repeat(60));

    // Register alert handler
    registerAlertHandler(sendAlert);

    // Find all manifests
    const manifests = findManifests(manifestDir);
    logResult(`Found ${manifests.length} manifest files`);

    if (manifests.length === 0) {
        logResult('No manifests found - verification complete', 'WARN');
        return { success: true, manifests: 0 };
    }

    const results = [];

    // Verify each manifest
    for (const manifestPath of manifests) {
        logResult(`Verifying: ${manifestPath}`);

        try {
            const result = await verifyEvidence(manifestPath);
            results.push({ manifest: manifestPath, result });

            if (result.valid) {
                logResult(`  ✓ PASSED - ${result.details.filesChecked} files verified`);
            } else {
                logResult(`  ✗ FAILED - ${result.status}: ${result.errors.join(', ')}`, 'ERROR');
            }
        } catch (err) {
            logResult(`  ✗ ERROR - ${err.message}`, 'ERROR');
            results.push({
                manifest: manifestPath,
                result: {
                    valid: false,
                    status: 'ERROR',
                    errors: [err.message],
                    details: { filesChecked: 0 }
                }
            });
        }
    }

    // Generate and save daily report
    const report = generateDailyReport(results);

    const reportPath = path.join(
        manifestDir,
        `verification-report-${new Date().toISOString().split('T')[0]}.json`
    );

    try {
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        logResult(`Report saved: ${reportPath}`);
    } catch (err) {
        logResult(`Failed to save report: ${err.message}`, 'ERROR');
    }

    // Summary
    logResult('='.repeat(60));
    logResult('Daily Verification Summary');
    logResult(`  Total Manifests: ${report.totalManifests}`);
    logResult(`  Passed: ${report.passed}`);
    logResult(`  Failed: ${report.failed}`);
    logResult(`  Tampered: ${report.tampered}`);
    logResult(`  Alerts: ${report.alerts}`);
    logResult('='.repeat(60));

    // Return exit code based on results
    const success = report.failed === 0 && report.tampered === 0;
    return { success, report };
}

// CLI execution
if (process.argv[1] === __filename) {
    const args = process.argv.slice(2);
    let manifestDir = DEFAULT_MANIFEST_DIR;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--manifest-dir' && args[i + 1]) {
            manifestDir = path.resolve(args[i + 1]);
            i++;
        }
    }

    runDailyVerification(manifestDir)
        .then(({ success }) => {
            process.exit(success ? 0 : 1);
        })
        .catch(err => {
            console.error(`Fatal error: ${err.message}`);
            process.exit(2);
        });
}

export { runDailyVerification, findManifests, generateDailyReport };
