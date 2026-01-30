/**
 * BMAD-CYBER2 Evidence Integrity Module
 * Provides tamper detection for evidence files in the validation system.
 *
 * Security Features:
 * - SHA256 file hashing
 * - Directory manifest generation
 * - Tamper verification
 * - Self-verifying manifests
 *
 * @module evidence-integrity
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const HASH_ALGORITHM = 'sha256';
const ENCODING = 'hex';
const BUFFER_SIZE = 64 * 1024; // 64KB buffer for streaming

/**
 * Calculate SHA256 hash of a file
 * Uses streaming for memory efficiency with large files
 *
 * @param {string} filePath - Absolute or relative path to the file
 * @returns {Promise<string>} SHA256 hash in hexadecimal format
 * @throws {Error} If file doesn't exist or cannot be read
 */
export async function hashFile(filePath) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${absolutePath}`);
    }

    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${absolutePath}`);
    }

    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(HASH_ALGORITHM);
        const stream = fs.createReadStream(absolutePath, { highWaterMark: BUFFER_SIZE });

        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest(ENCODING)));
        stream.on('error', (err) => reject(new Error(`Failed to hash file: ${err.message}`)));
    });
}

/**
 * Calculate SHA256 hash of a file synchronously
 * Use for smaller files or when async is not needed
 *
 * @param {string} filePath - Absolute or relative path to the file
 * @returns {string} SHA256 hash in hexadecimal format
 */
export function hashFileSync(filePath) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${absolutePath}`);
    }

    const content = fs.readFileSync(absolutePath);
    return crypto.createHash(HASH_ALGORITHM).update(content).digest(ENCODING);
}

/**
 * Hash all files in a directory recursively
 * Returns a manifest object with file paths as keys
 *
 * @param {string} dirPath - Path to the directory
 * @param {Object} options - Configuration options
 * @param {string[]} options.exclude - Glob patterns to exclude
 * @param {boolean} options.includeHidden - Include hidden files (default: false)
 * @returns {Promise<Object>} Manifest of all file hashes
 */
export async function hashDirectory(dirPath, options = {}) {
    const absolutePath = path.resolve(dirPath);
    const { exclude = [], includeHidden = false } = options;

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Directory not found: ${absolutePath}`);
    }

    const stats = fs.statSync(absolutePath);
    if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${absolutePath}`);
    }

    const manifest = {};
    await walkDirectory(absolutePath, absolutePath, manifest, { exclude, includeHidden });

    return manifest;
}

/**
 * Recursively walk directory and hash files
 * @private
 */
async function walkDirectory(rootPath, currentPath, manifest, options) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(rootPath, fullPath);

        // Skip hidden files if not included
        if (!options.includeHidden && entry.name.startsWith('.')) {
            continue;
        }

        // Check exclusions
        if (shouldExclude(relativePath, options.exclude)) {
            continue;
        }

        if (entry.isDirectory()) {
            await walkDirectory(rootPath, fullPath, manifest, options);
        } else if (entry.isFile()) {
            try {
                const stats = fs.statSync(fullPath);
                const hash = await hashFile(fullPath);

                manifest[relativePath] = {
                    hash,
                    size: stats.size,
                    modified: stats.mtime.toISOString()
                };
            } catch (err) {
                console.warn(`Warning: Could not hash ${relativePath}: ${err.message}`);
            }
        }
    }
}

/**
 * Check if path should be excluded based on patterns
 * @private
 */
function shouldExclude(filePath, patterns) {
    for (const pattern of patterns) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(filePath)) {
            return true;
        }
    }
    return false;
}

/**
 * Create an evidence manifest file for a directory
 * The manifest includes all file hashes and a self-verification hash
 *
 * @param {string} dirPath - Directory to create manifest for
 * @param {string} outputPath - Path to write the manifest JSON
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} The created manifest object
 */
export async function createEvidenceManifest(dirPath, outputPath, options = {}) {
    const absoluteDirPath = path.resolve(dirPath);
    const absoluteOutputPath = path.resolve(outputPath);

    const files = await hashDirectory(absoluteDirPath, options);

    // Sort files for consistent ordering
    const sortedFiles = {};
    Object.keys(files).sort().forEach(key => {
        sortedFiles[key] = files[key];
    });

    // Calculate manifest hash (self-verification)
    const filesJson = JSON.stringify(sortedFiles, null, 2);
    const manifestHash = crypto.createHash(HASH_ALGORITHM).update(filesJson).digest(ENCODING);

    const manifest = {
        created: new Date().toISOString(),
        algorithm: HASH_ALGORITHM,
        rootPath: path.relative(path.dirname(absoluteOutputPath), absoluteDirPath) || '.',
        fileCount: Object.keys(sortedFiles).length,
        files: sortedFiles,
        manifestHash
    };

    const outputDir = path.dirname(absoluteOutputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(absoluteOutputPath, JSON.stringify(manifest, null, 2), 'utf8');

    return manifest;
}

/**
 * Verify evidence files against a saved manifest
 *
 * @param {string} manifestPath - Path to the manifest JSON file
 * @returns {Promise<Object>} Verification result
 */
export async function verifyEvidence(manifestPath) {
    const absoluteManifestPath = path.resolve(manifestPath);

    const result = {
        valid: true,
        status: 'VERIFIED',
        errors: [],
        details: {
            manifestPath: absoluteManifestPath,
            verifiedAt: new Date().toISOString(),
            filesChecked: 0,
            filesPassed: 0,
            filesFailed: 0,
            filesMissing: 0,
            filesNew: 0,
            changedFiles: [],
            missingFiles: [],
            manifestIntegrity: false
        }
    };

    if (!fs.existsSync(absoluteManifestPath)) {
        result.valid = false;
        result.status = 'ERROR';
        result.errors.push(`Manifest not found: ${absoluteManifestPath}`);
        return result;
    }

    let manifest;
    try {
        const content = fs.readFileSync(absoluteManifestPath, 'utf8');
        manifest = JSON.parse(content);
    } catch (err) {
        result.valid = false;
        result.status = 'ERROR';
        result.errors.push(`Failed to parse manifest: ${err.message}`);
        return result;
    }

    // Verify manifest self-hash
    const filesJson = JSON.stringify(manifest.files, null, 2);
    const calculatedManifestHash = crypto.createHash(HASH_ALGORITHM).update(filesJson).digest(ENCODING);

    if (calculatedManifestHash !== manifest.manifestHash) {
        result.valid = false;
        result.status = 'TAMPERED';
        result.errors.push('Manifest has been tampered with - self-verification failed');
        result.details.manifestIntegrity = false;
    } else {
        result.details.manifestIntegrity = true;
    }

    const manifestDir = path.dirname(absoluteManifestPath);
    const rootPath = path.resolve(manifestDir, manifest.rootPath || '.');

    for (const [relativePath, fileData] of Object.entries(manifest.files)) {
        result.details.filesChecked++;
        const fullPath = path.join(rootPath, relativePath);

        if (!fs.existsSync(fullPath)) {
            result.valid = false;
            result.status = 'TAMPERED';
            result.details.filesMissing++;
            result.details.missingFiles.push(relativePath);
            result.errors.push(`Missing file: ${relativePath}`);
            continue;
        }

        try {
            const currentHash = await hashFile(fullPath);
            const stats = fs.statSync(fullPath);

            if (currentHash !== fileData.hash) {
                result.valid = false;
                result.status = 'TAMPERED';
                result.details.filesFailed++;
                result.details.changedFiles.push({
                    path: relativePath,
                    expectedHash: fileData.hash,
                    actualHash: currentHash,
                    expectedSize: fileData.size,
                    actualSize: stats.size
                });
                result.errors.push(`Hash mismatch: ${relativePath}`);
            } else {
                result.details.filesPassed++;
            }
        } catch (err) {
            result.valid = false;
            result.status = 'ERROR';
            result.errors.push(`Failed to verify ${relativePath}: ${err.message}`);
        }
    }

    return result;
}

/**
 * Generate a verification report in human-readable format
 */
export function generateVerificationReport(result) {
    const lines = [
        '═══════════════════════════════════════════════════════════════',
        '                EVIDENCE INTEGRITY VERIFICATION REPORT          ',
        '═══════════════════════════════════════════════════════════════',
        '',
        `Status: ${result.status}`,
        `Verified: ${result.details.verifiedAt}`,
        `Manifest: ${result.details.manifestPath}`,
        '',
        '───────────────────────────────────────────────────────────────',
        `Files Checked:  ${result.details.filesChecked}`,
        `Files Passed:   ${result.details.filesPassed}`,
        `Files Failed:   ${result.details.filesFailed}`,
        `Files Missing:  ${result.details.filesMissing}`,
        `Manifest OK:    ${result.details.manifestIntegrity ? 'YES' : 'NO'}`,
        ''
    ];

    if (result.errors.length > 0) {
        lines.push('───────────────────────────────────────────────────────────────');
        lines.push('ERRORS:');
        result.errors.forEach((err, i) => {
            lines.push(`  ${i + 1}. ${err}`);
        });
        lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`              ${result.valid ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}              `);
    lines.push('═══════════════════════════════════════════════════════════════');

    return lines.join('\n');
}

/**
 * Quick hash verification for a single file
 */
export async function verifyFileHash(filePath, expectedHash) {
    try {
        const actualHash = await hashFile(filePath);
        return actualHash.toLowerCase() === expectedHash.toLowerCase();
    } catch {
        return false;
    }
}

/**
 * Calculate hash of a string
 */
export function hashString(content) {
    return crypto.createHash(HASH_ALGORITHM).update(content, 'utf8').digest(ENCODING);
}

export default {
    hashFile,
    hashFileSync,
    hashDirectory,
    hashString,
    createEvidenceManifest,
    verifyEvidence,
    verifyFileHash,
    generateVerificationReport,
    HASH_ALGORITHM
};
