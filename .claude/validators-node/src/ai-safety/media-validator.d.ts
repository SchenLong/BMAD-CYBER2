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
/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { type Severity } from '../types/index.js';
export interface MediaFinding {
    category: string;
    pattern_name: string;
    severity: Severity;
    match?: string;
    description: string;
    field?: string;
}
/**
 * Expand XML entity declarations in SVG content.
 * Resolves <!ENTITY> declarations and expands &entity; references
 * so hidden payloads like <!ENTITY payload "ignore all instructions">&payload;
 * are detected.
 */
export declare function expandXmlEntities(content: string): string;
/**
 * Check if file path has a media extension.
 */
export declare function isMediaFile(filePath: string): boolean;
/**
 * Check if file is an SVG.
 */
export declare function isSvgFile(filePath: string): boolean;
/**
 * Check if file is an audio file.
 */
export declare function isAudioFile(filePath: string): boolean;
/**
 * Check if file is an image file (non-SVG).
 */
export declare function isImageFile(filePath: string): boolean;
/**
 * Read file header bytes for metadata extraction.
 * Uses fs.openSync()+fs.readSync()+fs.closeSync() — NOT fs.readFileSync()
 * which would load entire large images into memory.
 *
 * @returns Buffer of first MAX_HEADER_BYTES, or null if cannot read.
 */
export declare function readFileHeader(filePath: string, maxBytes?: number): Buffer | null;
/**
 * Detect the actual format of a file from its magic number.
 */
export declare function detectMagicFormat(buffer: Buffer): string | null;
/**
 * Check if buffer starts with an executable signature (polyglot detection).
 */
export declare function detectExecutableSignature(buffer: Buffer): string | null;
/**
 * Validate magic number matches extension (TPI-19 AC2).
 */
export declare function validateMagicNumber(filePath: string, buffer: Buffer): MediaFinding[];
/**
 * Validate file size bounds (TPI-19 AC4).
 */
export declare function validateFileSize(filePath: string): MediaFinding[];
/**
 * Extract text fields from JPEG EXIF data.
 * Scans for APP1 marker (0xFFE1) and parses IFD entries for text tags.
 */
export declare function extractJpegExifText(buffer: Buffer): Array<{
    field: string;
    value: string;
}>;
/**
 * Extract text from PNG tEXt, iTXt, and zTXt chunks.
 * PNG chunks: [4-byte length][4-byte type][data][4-byte CRC]
 */
export declare function extractPngTextChunks(buffer: Buffer): Array<{
    field: string;
    value: string;
}>;
/**
 * Extract text from XMP metadata embedded in file.
 * Simple regex scan for common XMP text fields.
 */
export declare function extractXmpText(content: string): Array<{
    field: string;
    value: string;
}>;
/**
 * Extract text from MP3 ID3v2 tags.
 * ID3v2 header: "ID3" + version(2) + flags(1) + size(4)
 * Frame: ID(4) + size(4) + flags(2) + data
 */
export declare function extractId3v2Text(buffer: Buffer): Array<{
    field: string;
    value: string;
}>;
/**
 * Extract text from WAV RIFF INFO chunks.
 * RIFF header: "RIFF" + size(4) + "WAVE"
 * INFO chunk: "LIST" + size(4) + "INFO" + sub-chunks
 */
export declare function extractWavInfoText(buffer: Buffer): Array<{
    field: string;
    value: string;
}>;
/**
 * Extract text from OGG Vorbis comments.
 * OGG page header: "OggS" + various fields
 * Vorbis comment header: packet type 3, "vorbis"
 */
export declare function extractOggVorbisText(buffer: Buffer): Array<{
    field: string;
    value: string;
}>;
/**
 * Scan SVG file content for injection vectors.
 * SVG is XML-based and can contain scripts, event handlers,
 * foreign objects, and JavaScript protocol URIs.
 */
export declare function scanSvgContent(content: string): MediaFinding[];
/**
 * Scan image metadata for injection payloads.
 * Extracts text from EXIF, PNG chunks, and XMP, then runs analyzeContent().
 */
export declare function scanImageMetadata(filePath: string, buffer: Buffer): MediaFinding[];
/**
 * Scan audio metadata for injection payloads.
 */
export declare function scanAudioMetadata(filePath: string, buffer: Buffer): MediaFinding[];
interface MediaSessionState {
    untrusted_image_count: number;
    image_loads: Array<{
        path: string;
        timestamp: number;
        untrusted: boolean;
    }>;
}
/**
 * Check if file is from an untrusted source.
 */
export declare function isUntrustedSource(filePath: string): boolean;
/**
 * Track image load in session state.
 */
export declare function trackImageLoad(filePath: string, untrusted: boolean): MediaSessionState;
/**
 * Generate context warnings for media from untrusted sources (TPI-21).
 */
export declare function generateContextWarnings(filePath: string): MediaFinding[];
/**
 * Map finding severity to exit code (P1-8 graduated).
 */
export declare function severityToExitCode(severity: Severity): number;
/**
 * Compute highest severity from findings.
 */
export declare function computeHighestSeverity(findings: MediaFinding[]): Severity;
/**
 * Scan a media file for all threat vectors.
 * Exported for testing.
 */
export declare function scanMediaFile(filePath: string): {
    exitCode: number;
    findings: MediaFinding[];
    severity: Severity;
};
/**
 * Main entry point — called from bin/media-validator.js.
 */
export declare function main(): void;
export {};
