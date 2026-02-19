/**
 * Secure File Upload API Route
 * Epic 7: Enterprise Templates
 * Story 7.4: Custom Template Builder
 *
 * POST   /api/templates/upload - Upload template branding assets (logo, cover image)
 *
 * Security:
 * - Authentication required
 * - Server-side file size validation
 * - MIME type validation (not just extension)
 * - SVG sanitization to remove scripts
 * - Secure file storage with unique names
 * - Returns URL reference instead of base64 data
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

/**
 * Allowed MIME types for logo uploads
 */
const LOGO_ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
];

/**
 * Allowed MIME types for cover image uploads
 */
const COVER_ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
];

/**
 * Maximum file sizes (in bytes)
 */
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload directory for template assets
 */
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'templates');

/**
 * Magic numbers for file type validation
 * Ensures the actual file content matches the declared MIME type
 */
const MAGIC_NUMBERS: Record<string, Buffer> = {
  'image/png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'image/jpeg': Buffer.from([0xff, 0xd8, 0xff]),
  'image/svg+xml': Buffer.from([0x3c, 0x3f, 0x78, 0x6d, 0x6c]), // Starts with <?xml
  // SVG may also start without XML declaration
  'image/svg+xml-alt': Buffer.from([0x3c, 0x73, 0x76, 0x67]), // Starts with <svg
};

/**
 * Validate file content using magic numbers
 */
function validateFileContent(buffer: Buffer, mimeType: string): boolean {
  const magicNumber = MAGIC_NUMBERS[mimeType];

  if (!magicNumber) {
    // For SVG, check alternate magic number
    if (mimeType === 'image/svg+xml') {
      const altMagic = MAGIC_NUMBERS['image/svg+xml-alt'];
      if (altMagic && buffer.slice(0, 4).equals(altMagic)) {
        return true;
      }
      // Also check if file contains SVG tag (more lenient check)
      const content = buffer.toString('utf-8', 0, Math.min(100, buffer.length));
      return content.includes('<svg') || content.includes('<?xml');
    }
    return true; // Allow if no magic number defined
  }

  // Check if the file starts with the expected magic number
  return buffer.slice(0, magicNumber.length).equals(magicNumber);
}

/**
 * Sanitize SVG content to remove potential XSS payloads
 * This is a basic sanitization - for production, consider using a library like sanitize-html
 */
function sanitizeSVG(content: string): string {
  let sanitized = content;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove on* event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  // Remove javascript: protocol in href/src attributes
  sanitized = sanitized.replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, "href=''");
  sanitized = sanitized.replace(/src\s*=\s*["']\s*javascript:[^"']*["']/gi, "src=''");

  // Remove embedded JavaScript in CDATA sections
  // Note: Using non-dotAll compatible pattern (workaround for ES target)
  sanitized = sanitized.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');

  // Remove foreignObject elements which can contain HTML/JS
  // Note: Using non-dotAll compatible pattern (workaround for ES target)
  sanitized = sanitized.replace(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/g, '');

  return sanitized;
}

/**
 * Generate a secure filename
 */
function generateSecureFilename(originalName: string, mimeType: string): string {
  const uuid = randomUUID();
  const timestamp = Date.now();

  // Determine extension from MIME type (more secure than using original extension)
  let extension = '';
  switch (mimeType) {
    case 'image/png':
      extension = '.png';
      break;
    case 'image/jpeg':
      extension = '.jpg';
      break;
    case 'image/svg+xml':
      extension = '.svg';
      break;
    default:
      // Fallback to original extension if available
      const parts = originalName.split('.');
      extension = parts.length > 1 ? '.' + parts.pop() : '';
  }

  return `${timestamp}-${uuid}${extension}`;
}

/**
 * POST /api/templates/upload
 * Upload a template branding asset (logo or cover image)
 */
export async function POST(request: Request) {
  try {
    // Validate session
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'logo' or 'cover'

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type parameter
    if (fileType !== 'logo' && fileType !== 'cover') {
      return NextResponse.json(
        { error: 'Invalid file type. Must be "logo" or "cover"' },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = fileType === 'logo' ? MAX_LOGO_SIZE : MAX_COVER_SIZE;
    const maxSizeMB = maxSize / (1024 * 1024);

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
          maxSize,
          actualSize: file.size,
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    const allowedMimeTypes = fileType === 'logo' ? LOGO_ALLOWED_MIME_TYPES : COVER_ALLOWED_MIME_TYPES;

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
          receivedType: file.type,
        },
        { status: 400 }
      );
    }

    // Read file content for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file content using magic numbers
    if (!validateFileContent(buffer, file.type)) {
      return NextResponse.json(
        {
          error: 'File content does not match the declared file type',
          declaredType: file.type,
        },
        { status: 400 }
      );
    }

    // For SVG files, sanitize the content
    let finalBuffer = buffer;
    if (file.type === 'image/svg+xml') {
      const svgContent = buffer.toString('utf-8');
      const sanitized = sanitizeSVG(svgContent);

      // Check if sanitization changed the file significantly (potential threat removed)
      if (sanitized.length < svgContent.length * 0.5) {
        return NextResponse.json(
          {
            error: 'SVG file contains potentially dangerous content and was rejected',
          },
          { status: 400 }
        );
      }

      finalBuffer = Buffer.from(sanitized, 'utf-8');
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate secure filename
    const filename = generateSecureFilename(file.name, file.type);
    const filepath = join(UPLOAD_DIR, filename);

    // Write file to disk
    await writeFile(filepath, finalBuffer);

    // Generate the URL that will be stored in the database
    // Use relative path for portability
    const fileUrl = `/uploads/templates/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename,
      size: finalBuffer.length,
      type: file.type,
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}
