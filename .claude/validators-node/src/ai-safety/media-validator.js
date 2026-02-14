/**
 * BMAD Validators - Media Validator (TPI-18, TPI-19, TPI-20, TPI-21)
 * ===================================================================
 * PreToolUse hook on Read — scans media files (images, audio, SVG) for
 * injection payloads in metadata before they enter the LLM context.
 *
 * Constraint: Claude Code's Read tool sends image content directly to
 * the model — we cannot OCR images in a hook subprocess. Defenses are
 * metadata-based and heuristic rather than content-based.
 *
 * Capabilities:
 * - TPI-18: Image metadata injection scanning (EXIF, PNG text chunks, XMP)
 * - TPI-19: Image file validation & heuristics (magic numbers, polyglot)
 * - TPI-20: Audio metadata scanning (ID3v2, WAV RIFF, OGG Vorbis) + SVG
 * - TPI-21: Multimodal context warnings (untrusted source detection)
 *
 * Exit Codes (P1-8 graduated):
 * - 0: ALLOW (no findings, non-media file, or INFO-only)
 * - 1: SOFT_BLOCK / WARN (WARNING findings)
 * - 2: HARD_BLOCK (CRITICAL findings — SVG script, polyglot)
 *
 * Performance: Only first 64KB of file header is read for metadata.
 *
 * Reference: TPI-CROWDSTRIKE Implementation Plan, Stories TPI-18..21
 */
import * as fs from 'fs';
import * as path from 'path';
import { AuditLogger, getProjectDir, getToolInputFromStdinSync, } from '../common/index.js';
import { analyzeContent } from './prompt-injection.js';
import { EXIT_CODES } from '../types/index.js';
const VALIDATOR_NAME = 'media_validator';
// Maximum bytes to read from file header for metadata extraction
const MAX_HEADER_BYTES = 64 * 1024; // 64KB
// =============================================================================
// MEDIA FILE DETECTION
// =============================================================================
/** Image extensions that trigger metadata scanning. */
const IMAGE_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.tiff', '.tif',
    '.bmp', '.webp', '.svg', '.ico', '.heic', '.heif',
]);
/** Audio extensions that trigger metadata scanning. */
const AUDIO_EXTENSIONS = new Set([
    '.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac',
]);
/** All media extensions combined. */
const MEDIA_EXTENSIONS = new Set([
    ...IMAGE_EXTENSIONS,
    ...AUDIO_EXTENSIONS,
]);
const MAGIC_SIGNATURES = [
    { format: 'JPEG', bytes: [0xFF, 0xD8, 0xFF], offset: 0 },
    { format: 'PNG', bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 },
    { format: 'GIF', bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 },
    { format: 'BMP', bytes: [0x42, 0x4D], offset: 0 },
    { format: 'TIFF_LE', bytes: [0x49, 0x49, 0x2A, 0x00], offset: 0 },
    { format: 'TIFF_BE', bytes: [0x4D, 0x4D, 0x00, 0x2A], offset: 0 },
    { format: 'WebP', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, extraBytes: [0x57, 0x45, 0x42, 0x50], extraOffset: 8 },
    { format: 'ICO', bytes: [0x00, 0x00, 0x01, 0x00], offset: 0 },
];
/** Executable signatures for polyglot detection. */
const EXECUTABLE_SIGNATURES = [
    { format: 'ELF', bytes: [0x7F, 0x45, 0x4C, 0x46], offset: 0 },
    { format: 'PE', bytes: [0x4D, 0x5A], offset: 0 },
    { format: 'Mach-O_32', bytes: [0xFE, 0xED, 0xFA, 0xCE], offset: 0 },
    { format: 'Mach-O_64', bytes: [0xFE, 0xED, 0xFA, 0xCF], offset: 0 },
    { format: 'Mach-O_32_rev', bytes: [0xCE, 0xFA, 0xED, 0xFE], offset: 0 },
    { format: 'Mach-O_64_rev', bytes: [0xCF, 0xFA, 0xED, 0xFE], offset: 0 },
];
// =============================================================================
// EXTENSION/FORMAT MAPPING
// =============================================================================
const EXTENSION_TO_FORMAT = {
    '.jpg': ['JPEG'],
    '.jpeg': ['JPEG'],
    '.png': ['PNG'],
    '.gif': ['GIF'],
    '.bmp': ['BMP'],
    '.tiff': ['TIFF_LE', 'TIFF_BE'],
    '.tif': ['TIFF_LE', 'TIFF_BE'],
    '.webp': ['WebP'],
    '.ico': ['ICO'],
};
// =============================================================================
// SVG SCANNING PATTERNS (TPI-18, TPI-20)
// =============================================================================
/** SVG event handlers that indicate script execution. */
const SVG_EVENT_HANDLERS = [
    'onload', 'onclick', 'onerror', 'onmouseover', 'onmouseout',
    'onmousedown', 'onmouseup', 'onmousemove', 'onfocus', 'onblur',
    'onkeydown', 'onkeyup', 'onkeypress', 'onchange', 'onsubmit',
    'onreset', 'onselect', 'onabort', 'onresize', 'onscroll',
    'onunload', 'onbegin', 'onend', 'onrepeat', 'onactivate',
];
/** SVG dangerous attributes/protocols. */
const SVG_DANGEROUS_ATTRS = [
    /xlink:href\s*=\s*["']javascript:/i,
    /href\s*=\s*["']javascript:/i,
    /@import\s+url\s*\(/i,
    /url\s*\(\s*["']?javascript:/i,
];
// =============================================================================
// XML ENTITY EXPANSION (P1-11, BYPASS-6)
// =============================================================================
/**
 * Expand XML entity declarations in SVG content.
 * Resolves <!ENTITY> declarations and expands &entity; references
 * so hidden payloads like <!ENTITY payload "ignore all instructions">&payload;
 * are detected.
 */
export function expandXmlEntities(content) {
    const entities = new Map();
    // Extract entity declarations
    const entityRegex = /<!ENTITY\s+(\w+)\s+"([^"]*)"\s*>/gi;
    let entityMatch;
    while ((entityMatch = entityRegex.exec(content)) !== null) {
        entities.set(entityMatch[1] ?? '', entityMatch[2] ?? '');
    }
    // Also handle single-quoted entities
    const entityRegex2 = /<!ENTITY\s+(\w+)\s+'([^']*)'\s*>/gi;
    while ((entityMatch = entityRegex2.exec(content)) !== null) {
        entities.set(entityMatch[1] ?? '', entityMatch[2] ?? '');
    }
    if (entities.size === 0)
        return content;
    // Expand entity references (with depth limit to prevent recursive bombs)
    let expanded = content;
    const MAX_EXPANSIONS = 100;
    let expansionCount = 0;
    for (const [name, value] of entities) {
        const ref = new RegExp(`&${name};`, 'g');
        const matches = expanded.match(ref);
        if (matches) {
            expansionCount += matches.length;
            if (expansionCount > MAX_EXPANSIONS)
                break; // Prevent entity expansion bomb
            expanded = expanded.replace(ref, value);
        }
    }
    return expanded;
}
// =============================================================================
// MEDIA FILE TYPE DETECTION
// =============================================================================
/**
 * Check if file path has a media extension.
 */
export function isMediaFile(filePath) {
    if (!filePath || typeof filePath !== 'string')
        return false;
    const ext = path.extname(filePath).toLowerCase();
    return MEDIA_EXTENSIONS.has(ext);
}
/**
 * Check if file is an SVG.
 */
export function isSvgFile(filePath) {
    if (!filePath || typeof filePath !== 'string')
        return false;
    return path.extname(filePath).toLowerCase() === '.svg';
}
/**
 * Check if file is an audio file.
 */
export function isAudioFile(filePath) {
    if (!filePath || typeof filePath !== 'string')
        return false;
    const ext = path.extname(filePath).toLowerCase();
    return AUDIO_EXTENSIONS.has(ext);
}
/**
 * Check if file is an image file (non-SVG).
 */
export function isImageFile(filePath) {
    if (!filePath || typeof filePath !== 'string')
        return false;
    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext) && ext !== '.svg';
}
// =============================================================================
// FILE HEADER READER
// =============================================================================
/**
 * Read file header bytes for metadata extraction.
 * Uses fs.openSync()+fs.readSync()+fs.closeSync() — NOT fs.readFileSync()
 * which would load entire large images into memory.
 *
 * @returns Buffer of first MAX_HEADER_BYTES, or null if cannot read.
 */
export function readFileHeader(filePath, maxBytes = MAX_HEADER_BYTES) {
    try {
        if (!fs.existsSync(filePath))
            return null;
        const stats = fs.statSync(filePath);
        if (!stats.isFile())
            return null;
        const bytesToRead = Math.min(stats.size, maxBytes);
        const buffer = Buffer.alloc(bytesToRead);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, bytesToRead, 0);
        fs.closeSync(fd);
        return buffer;
    }
    catch {
        return null;
    }
}
// =============================================================================
// MAGIC NUMBER VALIDATION (TPI-19)
// =============================================================================
/**
 * Detect the actual format of a file from its magic number.
 */
export function detectMagicFormat(buffer) {
    for (const sig of MAGIC_SIGNATURES) {
        if (buffer.length < sig.offset + sig.bytes.length)
            continue;
        let matches = true;
        for (let i = 0; i < sig.bytes.length; i++) {
            if (buffer[sig.offset + i] !== sig.bytes[i]) {
                matches = false;
                break;
            }
        }
        if (matches && sig.extraBytes && sig.extraOffset !== undefined) {
            if (buffer.length < sig.extraOffset + sig.extraBytes.length)
                continue;
            for (let i = 0; i < sig.extraBytes.length; i++) {
                if (buffer[sig.extraOffset + i] !== sig.extraBytes[i]) {
                    matches = false;
                    break;
                }
            }
        }
        if (matches)
            return sig.format;
    }
    return null;
}
/**
 * Check if buffer starts with an executable signature (polyglot detection).
 */
export function detectExecutableSignature(buffer) {
    for (const sig of EXECUTABLE_SIGNATURES) {
        if (buffer.length < sig.offset + sig.bytes.length)
            continue;
        let matches = true;
        for (let i = 0; i < sig.bytes.length; i++) {
            if (buffer[sig.offset + i] !== sig.bytes[i]) {
                matches = false;
                break;
            }
        }
        if (matches)
            return sig.format;
    }
    return null;
}
/**
 * Validate magic number matches extension (TPI-19 AC2).
 */
export function validateMagicNumber(filePath, buffer) {
    const findings = [];
    const ext = path.extname(filePath).toLowerCase();
    // Only validate image files (not audio — audio magic numbers handled separately)
    if (!IMAGE_EXTENSIONS.has(ext) || ext === '.svg')
        return findings;
    // Check for executable signatures first (polyglot detection, TPI-19 AC3)
    const execFormat = detectExecutableSignature(buffer);
    if (execFormat) {
        findings.push({
            category: 'media_validation',
            pattern_name: 'polyglot_executable',
            severity: 'CRITICAL',
            match: `Executable signature: ${execFormat}`,
            description: `File with ${ext} extension contains ${execFormat} executable signature — possible polyglot file`,
        });
        return findings; // Critical — don't check further
    }
    // Detect actual format
    const actualFormat = detectMagicFormat(buffer);
    const expectedFormats = EXTENSION_TO_FORMAT[ext];
    if (expectedFormats && actualFormat) {
        if (!expectedFormats.includes(actualFormat)) {
            findings.push({
                category: 'media_validation',
                pattern_name: 'extension_content_mismatch',
                severity: 'WARNING',
                match: `Extension: ${ext}, Actual: ${actualFormat}`,
                description: `File extension ${ext} does not match actual format ${actualFormat} — possible format confusion attack`,
            });
        }
    }
    return findings;
}
/**
 * Validate file size bounds (TPI-19 AC4).
 */
export function validateFileSize(filePath) {
    const findings = [];
    try {
        const stats = fs.statSync(filePath);
        if (stats.size < 100) {
            findings.push({
                category: 'media_validation',
                pattern_name: 'suspiciously_small_file',
                severity: 'WARNING',
                match: `Size: ${stats.size} bytes`,
                description: `Image file is unusually small (${stats.size} bytes) — may not contain valid image data`,
            });
        }
        if (stats.size > 50 * 1024 * 1024) { // 50MB
            findings.push({
                category: 'media_validation',
                pattern_name: 'oversized_file',
                severity: 'WARNING',
                match: `Size: ${(stats.size / (1024 * 1024)).toFixed(1)}MB`,
                description: `Image file exceeds 50MB — unusually large, may indicate malicious content`,
            });
        }
    }
    catch {
        // Cannot stat — skip size check
    }
    return findings;
}
// =============================================================================
// EXIF METADATA EXTRACTION (TPI-18)
// =============================================================================
/**
 * EXIF IFD tag IDs for text-containing fields.
 */
const EXIF_TEXT_TAGS = {
    0x010E: 'ImageDescription',
    0x013B: 'Artist',
    0x8298: 'Copyright',
    0x9286: 'UserComment',
    0x9C9B: 'XPTitle',
    0x9C9C: 'XPComment',
    0x9C9E: 'XPKeywords',
    0x9C9F: 'XPSubject',
};
/**
 * Extract text fields from JPEG EXIF data.
 * Scans for APP1 marker (0xFFE1) and parses IFD entries for text tags.
 */
export function extractJpegExifText(buffer) {
    const results = [];
    // Find APP1 marker (EXIF)
    let offset = 2; // Skip SOI marker (FF D8)
    while (offset < buffer.length - 4) {
        if (buffer[offset] !== 0xFF)
            break;
        const marker = buffer[offset + 1];
        const segmentLength = buffer.readUInt16BE(offset + 2);
        if (marker === 0xE1) { // APP1 — EXIF
            // Check for "Exif\0\0" header
            if (offset + 10 < buffer.length) {
                const exifHeader = buffer.toString('ascii', offset + 4, offset + 8);
                if (exifHeader === 'Exif') {
                    const tiffStart = offset + 10; // After "Exif\0\0"
                    const exifData = extractIfdTextFields(buffer, tiffStart);
                    results.push(...exifData);
                }
            }
            break; // Only process first APP1
        }
        // Skip to next marker
        offset += 2 + segmentLength;
    }
    return results;
}
/**
 * Parse IFD entries to extract text fields.
 * Handles both little-endian and big-endian TIFF byte order.
 */
function extractIfdTextFields(buffer, tiffStart) {
    const results = [];
    if (tiffStart + 8 > buffer.length)
        return results;
    // Determine byte order
    const byteOrder = buffer.readUInt16BE(tiffStart);
    const isLE = byteOrder === 0x4949; // "II" = little-endian
    const readUint16 = (off) => isLE ? buffer.readUInt16LE(off) : buffer.readUInt16BE(off);
    const readUint32 = (off) => isLE ? buffer.readUInt32LE(off) : buffer.readUInt32BE(off);
    try {
        // Get IFD0 offset
        const ifdOffset = readUint32(tiffStart + 4);
        const ifdStart = tiffStart + ifdOffset;
        if (ifdStart + 2 > buffer.length)
            return results;
        const entryCount = readUint16(ifdStart);
        for (let i = 0; i < entryCount && i < 100; i++) { // Cap at 100 entries
            const entryOffset = ifdStart + 2 + (i * 12);
            if (entryOffset + 12 > buffer.length)
                break;
            const tag = readUint16(entryOffset);
            const type = readUint16(entryOffset + 2);
            const count = readUint32(entryOffset + 4);
            const tagName = EXIF_TEXT_TAGS[tag];
            if (!tagName)
                continue;
            // Type 2 = ASCII, Type 7 = UNDEFINED (UserComment), Type 1 = BYTE (XP*)
            if (type !== 2 && type !== 7 && type !== 1)
                continue;
            let valueStr = '';
            const dataSize = count;
            if (dataSize <= 4) {
                // Value stored inline
                valueStr = buffer.toString('utf8', entryOffset + 8, entryOffset + 8 + dataSize);
            }
            else {
                // Value stored at offset from TIFF start
                const valueOffset = readUint32(entryOffset + 8);
                const absOffset = tiffStart + valueOffset;
                if (absOffset + dataSize <= buffer.length) {
                    // XP* tags are UTF-16LE
                    if (tag >= 0x9C9B && tag <= 0x9C9F) {
                        valueStr = buffer.toString('utf16le', absOffset, absOffset + dataSize);
                    }
                    else if (type === 7 && tag === 0x9286) {
                        // UserComment: first 8 bytes are character code, rest is text
                        const textStart = absOffset + 8;
                        if (textStart < absOffset + dataSize) {
                            valueStr = buffer.toString('utf8', textStart, absOffset + dataSize);
                        }
                    }
                    else {
                        valueStr = buffer.toString('utf8', absOffset, absOffset + dataSize);
                    }
                }
            }
            // Clean null bytes and trim
            valueStr = valueStr.replace(/\0/g, '').trim();
            if (valueStr.length > 0) {
                results.push({ field: tagName, value: valueStr });
            }
        }
    }
    catch {
        // Malformed EXIF — skip gracefully
    }
    return results;
}
// =============================================================================
// PNG TEXT CHUNK EXTRACTION (TPI-18)
// =============================================================================
/**
 * Extract text from PNG tEXt, iTXt, and zTXt chunks.
 * PNG chunks: [4-byte length][4-byte type][data][4-byte CRC]
 */
export function extractPngTextChunks(buffer) {
    const results = [];
    // Skip PNG signature (8 bytes)
    let offset = 8;
    while (offset + 8 < buffer.length) {
        if (offset + 4 > buffer.length)
            break;
        const chunkLength = buffer.readUInt32BE(offset);
        const chunkType = buffer.toString('ascii', offset + 4, offset + 8);
        const dataStart = offset + 8;
        const dataEnd = dataStart + chunkLength;
        if (dataEnd > buffer.length)
            break;
        if (chunkType === 'tEXt') {
            // tEXt: keyword\0text
            const data = buffer.subarray(dataStart, dataEnd);
            const nullIdx = data.indexOf(0);
            if (nullIdx > 0) {
                const keyword = data.toString('ascii', 0, nullIdx);
                const text = data.toString('utf8', nullIdx + 1);
                if (text.trim().length > 0) {
                    results.push({ field: keyword, value: text.trim() });
                }
            }
        }
        else if (chunkType === 'iTXt') {
            // iTXt: keyword\0compressionFlag\0compressionMethod\0languageTag\0translatedKeyword\0text
            const data = buffer.subarray(dataStart, dataEnd);
            const nullIdx = data.indexOf(0);
            if (nullIdx > 0) {
                const keyword = data.toString('ascii', 0, nullIdx);
                // Find the text after the 4th null byte
                let nullCount = 0;
                let textStart = nullIdx + 1;
                for (let i = nullIdx + 1; i < data.length; i++) {
                    if (data[i] === 0) {
                        nullCount++;
                        if (nullCount >= 3) { // After compressionFlag, compressionMethod, lang, translatedKw
                            textStart = i + 1;
                            break;
                        }
                    }
                }
                const text = data.toString('utf8', textStart);
                if (text.trim().length > 0) {
                    results.push({ field: keyword, value: text.trim() });
                }
            }
        }
        else if (chunkType === 'zTXt') {
            // zTXt: keyword\0compressionMethod\0compressedText
            // We can't decompress without zlib, but log the keyword
            const data = buffer.subarray(dataStart, dataEnd);
            const nullIdx = data.indexOf(0);
            if (nullIdx > 0) {
                const keyword = data.toString('ascii', 0, nullIdx);
                results.push({ field: keyword, value: '[compressed text chunk]' });
            }
        }
        // Skip to next chunk (length + type + data + CRC)
        offset = dataEnd + 4;
    }
    return results;
}
// =============================================================================
// XMP EXTRACTION (TPI-18)
// =============================================================================
/**
 * Extract text from XMP metadata embedded in file.
 * Simple regex scan for common XMP text fields.
 */
export function extractXmpText(content) {
    const results = [];
    const xmpPatterns = [
        { field: 'dc:description', regex: /<dc:description[^>]*>(?:<rdf:Alt[^>]*>)?(?:<rdf:li[^>]*>)?([\s\S]*?)(?:<\/rdf:li>)?(?:<\/rdf:Alt>)?<\/dc:description>/i },
        { field: 'dc:title', regex: /<dc:title[^>]*>(?:<rdf:Alt[^>]*>)?(?:<rdf:li[^>]*>)?([\s\S]*?)(?:<\/rdf:li>)?(?:<\/rdf:Alt>)?<\/dc:title>/i },
        { field: 'dc:creator', regex: /<dc:creator[^>]*>(?:<rdf:Seq[^>]*>)?(?:<rdf:li[^>]*>)?([\s\S]*?)(?:<\/rdf:li>)?(?:<\/rdf:Seq>)?<\/dc:creator>/i },
        { field: 'dc:rights', regex: /<dc:rights[^>]*>(?:<rdf:Alt[^>]*>)?(?:<rdf:li[^>]*>)?([\s\S]*?)(?:<\/rdf:li>)?(?:<\/rdf:Alt>)?<\/dc:rights>/i },
        { field: 'xmp:Description', regex: /<xmp:Description[^>]*>([\s\S]*?)<\/xmp:Description>/i },
    ];
    for (const { field, regex } of xmpPatterns) {
        const match = regex.exec(content);
        if (match && match[1]) {
            const value = match[1].replace(/<[^>]*>/g, '').trim();
            if (value.length > 0) {
                results.push({ field, value });
            }
        }
    }
    return results;
}
// =============================================================================
// AUDIO METADATA EXTRACTION (TPI-20)
// =============================================================================
/**
 * Extract text from MP3 ID3v2 tags.
 * ID3v2 header: "ID3" + version(2) + flags(1) + size(4)
 * Frame: ID(4) + size(4) + flags(2) + data
 */
export function extractId3v2Text(buffer) {
    const results = [];
    // Check ID3v2 header
    if (buffer.length < 10)
        return results;
    if (buffer.toString('ascii', 0, 3) !== 'ID3')
        return results;
    // ID3v2 text frame IDs we care about
    const textFrames = {
        'TIT2': 'Title',
        'TPE1': 'Artist',
        'TALB': 'Album',
        'COMM': 'Comment',
        'USLT': 'Lyrics',
        'TIT3': 'Subtitle',
        'TCOM': 'Composer',
        'TCOP': 'Copyright',
        'TEXT': 'Lyricist',
    };
    // Calculate tag size (synchsafe integer)
    const tagSize = (((buffer[6] ?? 0) & 0x7F) << 21) |
        (((buffer[7] ?? 0) & 0x7F) << 14) |
        (((buffer[8] ?? 0) & 0x7F) << 7) |
        (((buffer[9] ?? 0) & 0x7F));
    const tagEnd = Math.min(10 + tagSize, buffer.length);
    let offset = 10;
    while (offset + 10 < tagEnd) {
        const frameId = buffer.toString('ascii', offset, offset + 4);
        if (frameId === '\0\0\0\0')
            break; // Padding
        const frameSize = buffer.readUInt32BE(offset + 4);
        if (frameSize <= 0 || frameSize > tagEnd - offset - 10)
            break;
        const frameDataStart = offset + 10;
        const frameDataEnd = frameDataStart + frameSize;
        if (frameId in textFrames && frameDataEnd <= buffer.length) {
            // Text frames start with encoding byte
            const encoding = buffer[frameDataStart];
            let text = '';
            if (encoding === 0) {
                // ISO-8859-1
                text = buffer.toString('latin1', frameDataStart + 1, frameDataEnd);
            }
            else if (encoding === 1) {
                // UTF-16 with BOM
                text = buffer.toString('utf16le', frameDataStart + 3, frameDataEnd);
            }
            else if (encoding === 3) {
                // UTF-8
                text = buffer.toString('utf8', frameDataStart + 1, frameDataEnd);
            }
            else {
                // Fallback
                text = buffer.toString('utf8', frameDataStart + 1, frameDataEnd);
            }
            text = text.replace(/\0/g, '').trim();
            if (text.length > 0) {
                const fieldName = textFrames[frameId];
                if (fieldName) {
                    results.push({ field: fieldName, value: text });
                }
            }
        }
        offset = frameDataEnd;
    }
    return results;
}
/**
 * Extract text from WAV RIFF INFO chunks.
 * RIFF header: "RIFF" + size(4) + "WAVE"
 * INFO chunk: "LIST" + size(4) + "INFO" + sub-chunks
 */
export function extractWavInfoText(buffer) {
    const results = [];
    // Check RIFF/WAVE header
    if (buffer.length < 12)
        return results;
    if (buffer.toString('ascii', 0, 4) !== 'RIFF')
        return results;
    if (buffer.toString('ascii', 8, 12) !== 'WAVE')
        return results;
    const infoChunkIds = {
        'INAM': 'Title',
        'IART': 'Artist',
        'ICMT': 'Comment',
        'ICOP': 'Copyright',
        'IGNR': 'Genre',
        'ISFT': 'Software',
    };
    // Find LIST/INFO chunk
    let offset = 12;
    while (offset + 8 < buffer.length) {
        const chunkId = buffer.toString('ascii', offset, offset + 4);
        const chunkSize = buffer.readUInt32LE(offset + 4);
        if (chunkId === 'LIST' && offset + 12 < buffer.length) {
            const listType = buffer.toString('ascii', offset + 8, offset + 12);
            if (listType === 'INFO') {
                // Parse INFO sub-chunks
                let infoOffset = offset + 12;
                const infoEnd = Math.min(offset + 8 + chunkSize, buffer.length);
                while (infoOffset + 8 < infoEnd) {
                    const subId = buffer.toString('ascii', infoOffset, infoOffset + 4);
                    const subSize = buffer.readUInt32LE(infoOffset + 4);
                    const subDataEnd = Math.min(infoOffset + 8 + subSize, buffer.length);
                    if (subId in infoChunkIds) {
                        const text = buffer.toString('utf8', infoOffset + 8, subDataEnd).replace(/\0/g, '').trim();
                        if (text.length > 0) {
                            const fieldName = infoChunkIds[subId];
                            if (fieldName) {
                                results.push({ field: fieldName, value: text });
                            }
                        }
                    }
                    // Align to even boundary
                    infoOffset = subDataEnd + (subSize % 2);
                }
                break;
            }
        }
        // Skip to next chunk (aligned to even boundary)
        offset += 8 + chunkSize + (chunkSize % 2);
    }
    return results;
}
/**
 * Extract text from OGG Vorbis comments.
 * OGG page header: "OggS" + various fields
 * Vorbis comment header: packet type 3, "vorbis"
 */
export function extractOggVorbisText(buffer) {
    const results = [];
    // Search for Vorbis comment header (type 3 + "vorbis")
    const vorbisCommentMarker = Buffer.from([0x03, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73]);
    let markerIdx = -1;
    for (let i = 0; i < buffer.length - vorbisCommentMarker.length; i++) {
        if (buffer.compare(vorbisCommentMarker, 0, vorbisCommentMarker.length, i, i + vorbisCommentMarker.length) === 0) {
            markerIdx = i;
            break;
        }
    }
    if (markerIdx === -1)
        return results;
    try {
        let offset = markerIdx + 7;
        // Vendor string length (32-bit LE)
        if (offset + 4 > buffer.length)
            return results;
        const vendorLen = buffer.readUInt32LE(offset);
        offset += 4 + vendorLen;
        // Comment count
        if (offset + 4 > buffer.length)
            return results;
        const commentCount = buffer.readUInt32LE(offset);
        offset += 4;
        const targetFields = new Set(['TITLE', 'ARTIST', 'COMMENT', 'DESCRIPTION', 'ALBUM', 'COPYRIGHT']);
        for (let i = 0; i < commentCount && i < 100; i++) { // Cap at 100
            if (offset + 4 > buffer.length)
                break;
            const commentLen = buffer.readUInt32LE(offset);
            offset += 4;
            if (offset + commentLen > buffer.length)
                break;
            const comment = buffer.toString('utf8', offset, offset + commentLen);
            offset += commentLen;
            const eqIdx = comment.indexOf('=');
            if (eqIdx > 0) {
                const key = comment.substring(0, eqIdx).toUpperCase();
                const value = comment.substring(eqIdx + 1).trim();
                if (targetFields.has(key) && value.length > 0) {
                    results.push({ field: key, value });
                }
            }
        }
    }
    catch {
        // Malformed OGG — skip
    }
    return results;
}
// =============================================================================
// SVG SCANNING (TPI-18, TPI-20)
// =============================================================================
/**
 * Scan SVG file content for injection vectors.
 * SVG is XML-based and can contain scripts, event handlers,
 * foreign objects, and JavaScript protocol URIs.
 */
export function scanSvgContent(content) {
    const findings = [];
    // Expand XML entities first (P1-11, BYPASS-6)
    const expanded = expandXmlEntities(content);
    // Check for <script> tags (CRITICAL)
    if (/<script[\s>]/i.test(expanded)) {
        findings.push({
            category: 'svg_injection',
            pattern_name: 'svg_script_tag',
            severity: 'CRITICAL',
            match: '<script>',
            description: 'SVG contains <script> tag — direct script execution vector',
        });
    }
    // Check for <foreignObject> (WARNING)
    if (/<foreignObject[\s>]/i.test(expanded)) {
        findings.push({
            category: 'svg_injection',
            pattern_name: 'svg_foreign_object',
            severity: 'WARNING',
            match: '<foreignObject>',
            description: 'SVG contains <foreignObject> element — can embed arbitrary HTML',
        });
    }
    // Check for event handlers (CRITICAL)
    for (const handler of SVG_EVENT_HANDLERS) {
        const regex = new RegExp(`\\b${handler}\\s*=`, 'i');
        if (regex.test(expanded)) {
            findings.push({
                category: 'svg_injection',
                pattern_name: 'svg_event_handler',
                severity: 'CRITICAL',
                match: handler,
                description: `SVG contains ${handler} event handler — script execution vector`,
            });
            break; // One finding is enough
        }
    }
    // Check for javascript: protocol (CRITICAL)
    for (const regex of SVG_DANGEROUS_ATTRS) {
        if (regex.test(expanded)) {
            findings.push({
                category: 'svg_injection',
                pattern_name: 'svg_javascript_protocol',
                severity: 'CRITICAL',
                match: regex.source,
                description: 'SVG contains javascript: protocol URI — script execution vector',
            });
            break;
        }
    }
    // Check for <use> referencing external SVGs
    if (/<use[^>]+xlink:href\s*=\s*["']https?:/i.test(expanded) ||
        /<use[^>]+href\s*=\s*["']https?:/i.test(expanded)) {
        findings.push({
            category: 'svg_injection',
            pattern_name: 'svg_external_reference',
            severity: 'WARNING',
            match: '<use href="http...">',
            description: 'SVG references external resource via <use> element',
        });
    }
    // Check for CSS @import with external references
    if (/@import\s+url\s*\(\s*["']?https?:/i.test(expanded)) {
        findings.push({
            category: 'svg_injection',
            pattern_name: 'svg_css_import',
            severity: 'WARNING',
            match: '@import url()',
            description: 'SVG contains CSS @import with external URL',
        });
    }
    // Also run injection analysis on the expanded text content
    const analysisResult = analyzeContent(expanded);
    if (analysisResult.should_block) {
        findings.push({
            category: 'svg_injection',
            pattern_name: 'svg_text_injection',
            severity: analysisResult.highest_severity,
            description: `SVG text content contains injection patterns (${analysisResult.findings.length} findings)`,
        });
    }
    return findings;
}
// =============================================================================
// IMAGE METADATA SCANNING (TPI-18)
// =============================================================================
/**
 * Scan image metadata for injection payloads.
 * Extracts text from EXIF, PNG chunks, and XMP, then runs analyzeContent().
 */
export function scanImageMetadata(filePath, buffer) {
    const findings = [];
    const ext = path.extname(filePath).toLowerCase();
    let textFields = [];
    // Extract text based on format
    if (ext === '.jpg' || ext === '.jpeg') {
        textFields = extractJpegExifText(buffer);
    }
    else if (ext === '.png') {
        textFields = extractPngTextChunks(buffer);
    }
    // XMP can be in any format — search buffer as string
    const headerStr = buffer.toString('utf8', 0, Math.min(buffer.length, MAX_HEADER_BYTES));
    if (headerStr.includes('<x:xmpmeta') || headerStr.includes('<rdf:RDF')) {
        const xmpFields = extractXmpText(headerStr);
        textFields.push(...xmpFields);
    }
    // Analyze each extracted text field for injection
    for (const { field, value } of textFields) {
        if (value === '[compressed text chunk]')
            continue; // Skip compressed
        const result = analyzeContent(value);
        if (result.should_block) {
            findings.push({
                category: 'image_metadata_injection',
                pattern_name: 'metadata_injection',
                severity: 'WARNING',
                field,
                match: value.slice(0, 100),
                description: `Injection pattern detected in ${field} metadata field`,
            });
        }
    }
    return findings;
}
// =============================================================================
// AUDIO METADATA SCANNING (TPI-20)
// =============================================================================
/**
 * Scan audio metadata for injection payloads.
 */
export function scanAudioMetadata(filePath, buffer) {
    const findings = [];
    const ext = path.extname(filePath).toLowerCase();
    let textFields = [];
    if (ext === '.mp3') {
        textFields = extractId3v2Text(buffer);
    }
    else if (ext === '.wav') {
        textFields = extractWavInfoText(buffer);
    }
    else if (ext === '.ogg') {
        textFields = extractOggVorbisText(buffer);
    }
    // Analyze each extracted text field for injection
    for (const { field, value } of textFields) {
        const result = analyzeContent(value);
        if (result.should_block) {
            findings.push({
                category: 'audio_metadata_injection',
                pattern_name: 'audio_metadata_injection',
                severity: 'WARNING',
                field,
                match: value.slice(0, 100),
                description: `Injection pattern detected in audio ${field} metadata field`,
            });
        }
    }
    return findings;
}
// =============================================================================
// UNTRUSTED SOURCE DETECTION (TPI-21)
// =============================================================================
/** Paths that indicate untrusted source. */
const UNTRUSTED_PATH_INDICATORS = [
    /\/Downloads\//i,
    /\/tmp\//i,
    /\/temp\//i,
    /\/Temp\//i,
    /\/Desktop\//i,
    /\/\.Trash\//i,
    /\/cache\//i,
    /\/Cache\//i,
];
/** Session image load counter file. */
const IMAGE_LOAD_COUNTER_FILE = '.media_session_state.json';
/**
 * Check if file is from an untrusted source.
 */
export function isUntrustedSource(filePath) {
    const normalized = filePath.replace(/\\/g, '/');
    // Check path indicators
    for (const pattern of UNTRUSTED_PATH_INDICATORS) {
        if (pattern.test(normalized))
            return true;
    }
    // Check if outside project directory
    try {
        const projectDir = getProjectDir();
        if (!normalized.startsWith(projectDir.replace(/\\/g, '/'))) {
            return true;
        }
    }
    catch {
        // If we can't determine project dir, consider it untrusted
        return true;
    }
    return false;
}
/**
 * Get session media state file path.
 */
function getMediaSessionStatePath() {
    const projectDir = getProjectDir();
    return path.join(projectDir, '.claude', 'logs', IMAGE_LOAD_COUNTER_FILE);
}
/**
 * Track image load in session state.
 */
export function trackImageLoad(filePath, untrusted) {
    const statePath = getMediaSessionStatePath();
    let state = { untrusted_image_count: 0, image_loads: [] };
    try {
        if (fs.existsSync(statePath)) {
            state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
        }
    }
    catch {
        state = { untrusted_image_count: 0, image_loads: [] };
    }
    if (untrusted) {
        state.untrusted_image_count++;
    }
    state.image_loads.push({
        path: filePath,
        timestamp: Date.now(),
        untrusted,
    });
    // Keep only last 50 entries
    if (state.image_loads.length > 50) {
        state.image_loads = state.image_loads.slice(-50);
    }
    try {
        const dir = path.dirname(statePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
    }
    catch {
        // Non-fatal
    }
    return state;
}
/**
 * Generate context warnings for media from untrusted sources (TPI-21).
 */
export function generateContextWarnings(filePath) {
    const findings = [];
    const untrusted = isUntrustedSource(filePath);
    const isSvg = isSvgFile(filePath);
    // Track load
    const sessionState = trackImageLoad(filePath, untrusted);
    if (untrusted) {
        if (isSvg) {
            // SVG from untrusted source — escalated to WARNING
            findings.push({
                category: 'multimodal_context',
                pattern_name: 'untrusted_svg',
                severity: 'WARNING',
                match: filePath,
                description: 'SVG file from untrusted source — visual and script content cannot be fully verified',
            });
        }
        else {
            // Image from untrusted source — INFO
            findings.push({
                category: 'multimodal_context',
                pattern_name: 'untrusted_image',
                severity: 'INFO',
                match: filePath,
                description: 'Image from untrusted source — visual content cannot be verified for injection payloads',
            });
        }
    }
    // Bulk image loading warning (>10 untrusted in session)
    if (sessionState.untrusted_image_count > 10) {
        findings.push({
            category: 'multimodal_context',
            pattern_name: 'bulk_untrusted_images',
            severity: 'WARNING',
            match: `${sessionState.untrusted_image_count} untrusted images`,
            description: `${sessionState.untrusted_image_count} images from untrusted sources in this session — possible multimodal injection campaign`,
        });
    }
    return findings;
}
// =============================================================================
// SEVERITY MAPPING
// =============================================================================
/**
 * Map finding severity to exit code (P1-8 graduated).
 */
export function severityToExitCode(severity) {
    switch (severity) {
        case 'CRITICAL':
            return EXIT_CODES.HARD_BLOCK;
        case 'WARNING':
        case 'BLOCKED':
            return EXIT_CODES.SOFT_BLOCK;
        case 'INFO':
        default:
            return EXIT_CODES.ALLOW;
    }
}
/**
 * Compute highest severity from findings.
 */
export function computeHighestSeverity(findings) {
    const severityOrder = {
        'INFO': 0,
        'WARNING': 1,
        'BLOCKED': 2,
        'CRITICAL': 3,
    };
    let highest = 'INFO';
    for (const f of findings) {
        if (severityOrder[f.severity] > severityOrder[highest]) {
            highest = f.severity;
        }
    }
    return highest;
}
// =============================================================================
// MAIN VALIDATOR
// =============================================================================
/**
 * Scan a media file for all threat vectors.
 * Exported for testing.
 */
export function scanMediaFile(filePath) {
    // Not a media file — skip (no overhead on normal reads)
    if (!isMediaFile(filePath)) {
        return { exitCode: EXIT_CODES.ALLOW, findings: [], severity: 'INFO' };
    }
    const allFindings = [];
    // SVG files — scan as text (TPI-18, TPI-20)
    if (isSvgFile(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const svgFindings = scanSvgContent(content);
            allFindings.push(...svgFindings);
        }
        catch {
            // Cannot read SVG — skip
        }
        // Context warnings for SVG
        const contextFindings = generateContextWarnings(filePath);
        allFindings.push(...contextFindings);
        const severity = computeHighestSeverity(allFindings);
        return { exitCode: severityToExitCode(severity), findings: allFindings, severity };
    }
    // Binary media files — read header
    const buffer = readFileHeader(filePath);
    if (!buffer || buffer.length === 0) {
        // Cannot read or empty file — allow (graceful handling)
        const contextFindings = generateContextWarnings(filePath);
        const severity = computeHighestSeverity(contextFindings);
        return { exitCode: severityToExitCode(severity), findings: contextFindings, severity };
    }
    // TPI-19: File validation (magic number, size, polyglot)
    if (isImageFile(filePath)) {
        const magicFindings = validateMagicNumber(filePath, buffer);
        allFindings.push(...magicFindings);
        const sizeFindings = validateFileSize(filePath);
        allFindings.push(...sizeFindings);
    }
    // TPI-18: Image metadata scanning
    if (isImageFile(filePath)) {
        const metadataFindings = scanImageMetadata(filePath, buffer);
        allFindings.push(...metadataFindings);
    }
    // TPI-20: Audio metadata scanning
    if (isAudioFile(filePath)) {
        const audioFindings = scanAudioMetadata(filePath, buffer);
        allFindings.push(...audioFindings);
    }
    // TPI-21: Context warnings
    const contextFindings = generateContextWarnings(filePath);
    allFindings.push(...contextFindings);
    const severity = computeHighestSeverity(allFindings);
    return { exitCode: severityToExitCode(severity), findings: allFindings, severity };
}
/**
 * Main entry point — called from bin/media-validator.js.
 */
export function main() {
    try {
        const { tool_input } = getToolInputFromStdinSync();
        // Extract file_path from Read tool input
        const filePath = tool_input.file_path;
        if (!filePath || typeof filePath !== 'string') {
            // No file path — skip (not a Read operation we can scan)
            process.exit(EXIT_CODES.ALLOW);
        }
        const { exitCode, findings, severity } = scanMediaFile(filePath);
        if (findings.length > 0) {
            // Audit log all findings
            const relativePath = filePath.replace(getProjectDir() + '/', '');
            AuditLogger.logSync(VALIDATOR_NAME, severity === 'INFO' ? 'INFO' : 'WARNING', {
                media_file: relativePath,
                finding_count: findings.length,
                highest_severity: severity,
                findings_summary: findings.slice(0, 5).map((f) => ({
                    category: f.category,
                    pattern: f.pattern_name,
                    severity: f.severity,
                })),
            }, severity);
        }
        if (exitCode === EXIT_CODES.HARD_BLOCK) {
            AuditLogger.logBlocked(VALIDATOR_NAME, `CRITICAL media threat detected`, filePath, { finding_count: findings.length, severity });
            process.stderr.write(`[BMAD] BLOCKED: CRITICAL threat detected in media file: ${filePath}\n`);
        }
        else if (exitCode === EXIT_CODES.SOFT_BLOCK) {
            process.stderr.write(`[BMAD] WARNING: Suspicious content in media file: ${filePath} (${findings.length} finding(s), severity: ${severity})\n`);
        }
        process.exit(exitCode);
    }
    catch (err) {
        // Fail-closed: genuine errors exit(2) (P1-6)
        process.stderr.write(`[BMAD] media-validator error: ${err}\n`);
        process.exit(EXIT_CODES.HARD_BLOCK);
    }
}
//# sourceMappingURL=media-validator.js.map