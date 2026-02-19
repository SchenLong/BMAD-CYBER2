/**
 * GET /api/auth/mfa/qr
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Generates a QR code image from a URL (for TOTP setup).
 */

import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');

    if (!data) {
      return NextResponse.json(
        { error: 'Missing data parameter' },
        { status: 400 }
      );
    }

    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(data, {
      type: 'png',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Return as image
    return new NextResponse(qrBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300', // 5 minutes
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
