/**
 * Branding Panel Component
 * Story 7.4: Custom Template Builder
 *
 * Panel for customizing template branding options:
 * - Logo upload
 * - Header color
 * - Font selection
 * - Cover image
 * - Footer text
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HEADER_COLOR_PRESETS,
  FONT_OPTIONS,
  TemplateFont,
} from '@/stores/template-builder-store';
import { useTemplateBuilderStore } from '@/stores/template-builder-store';
import { Upload, X, Palette, Loader2 } from 'lucide-react';

/**
 * Upload response from the secure upload API
 */
interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  type: string;
}

/**
 * Upload error response
 */
interface UploadErrorResponse {
  error: string;
  maxSize?: number;
  actualSize?: number;
  receivedType?: string;
}

/**
 * Validates file type for client-side pre-check
 */
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const ALLOWED_COVER_TYPES = ['image/png', 'image/jpeg'];
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB

export function BrandingPanel() {
  const { template, setLogoUrl, setHeaderColor, setFont, setCoverImage, setFooterText } =
    useTemplateBuilderStore();

  const [logoPreview, setLogoPreview] = useState<string | undefined>(template.branding.logoUrl);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(template.branding.coverImage);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Upload file to secure API endpoint
   */
  const uploadFile = useCallback(async (file: File, type: 'logo' | 'cover'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData: UploadErrorResponse = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Client-side validation (pre-check before upload)
    if (file.size > MAX_LOGO_SIZE) {
      setUploadError('Logo file size must be less than 2MB');
      return;
    }

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setUploadError('Logo must be PNG, JPG, or SVG format');
      return;
    }

    setIsUploadingLogo(true);

    try {
      // Upload to secure API
      const url = await uploadFile(file, 'logo');

      if (url) {
        // Create preview from the uploaded file
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
          setLogoUrl(url); // Store URL reference, not base64
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Client-side validation (pre-check before upload)
    if (file.size > MAX_COVER_SIZE) {
      setUploadError('Cover image file size must be less than 5MB');
      return;
    }

    if (!ALLOWED_COVER_TYPES.includes(file.type)) {
      setUploadError('Cover image must be PNG or JPG format');
      return;
    }

    setIsUploadingCover(true);

    try {
      // Upload to secure API
      const url = await uploadFile(file, 'cover');

      if (url) {
        // Create preview from the uploaded file
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverPreview(reader.result as string);
          setCoverImage(url); // Store URL reference, not base64
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeLogo = () => {
    setLogoPreview(undefined);
    setLogoUrl('');
  };

  const removeCover = () => {
    setCoverPreview(undefined);
    setCoverImage('');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <CardTitle>Branding Options</CardTitle>
        </div>
        <CardDescription>
          Customize the visual appearance of your template
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Error Display */}
        {uploadError && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {uploadError}
          </div>
        )}

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            {isUploadingLogo ? (
              <div className="w-32 h-16 border rounded-lg flex items-center justify-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : logoPreview ? (
              <div className="relative w-32 h-16 border rounded-lg overflow-hidden bg-background">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={removeLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-16 border-2 border-dashed rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">No logo</span>
              </div>
            )}
            <div>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                disabled={isUploadingLogo}
                className="hidden"
                id="logo-upload"
              />
              <Label htmlFor="logo-upload">
                <Button variant="outline" size="sm" asChild disabled={isUploadingLogo}>
                  <span>
                    {isUploadingLogo ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Logo
                  </span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, or SVG (max 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Header Color */}
        <div className="space-y-2">
          <Label>Header Color</Label>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={template.branding.headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={template.branding.headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              placeholder="#1e40af"
              className="flex-1 font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {HEADER_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setHeaderColor(preset.value)}
                className="w-8 h-8 rounded border-2 transition-transform hover:scale-110"
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-2">
          <Label>Font</Label>
          <Select
            value={template.branding.font}
            onValueChange={(value) => setFont(value as TemplateFont)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: getFontFamily(font.value) }}>
                    {font.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          <div className="space-y-3">
            {isUploadingCover ? (
              <div className="w-full max-w-sm h-32 border rounded-lg flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : coverPreview ? (
              <div className="relative w-full max-w-sm h-32 border rounded-lg overflow-hidden bg-background">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeCover}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-sm h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                <span className="text-sm text-muted-foreground">No cover image</span>
              </div>
            )}
            <div>
              <Input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleCoverUpload}
                disabled={isUploadingCover}
                className="hidden"
                id="cover-upload"
              />
              <Label htmlFor="cover-upload">
                <Button variant="outline" size="sm" asChild disabled={isUploadingCover}>
                  <span>
                    {isUploadingCover ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Cover
                  </span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                PNG or JPG (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="space-y-2">
          <Label>Footer Text</Label>
          <Input
            value={template.branding.footerText || ''}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Confidential - Your Company Name"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            This text will appear at the bottom of each page
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getFontFamily(font: TemplateFont): string {
  const fontMap: Record<TemplateFont, string> = {
    [TemplateFont.INTER]: 'Inter, sans-serif',
    [TemplateFont.ROBOTO]: 'Roboto, sans-serif',
    [TemplateFont.OPEN_SANS]: 'Open Sans, sans-serif',
    [TemplateFont.LATO]: 'Lato, sans-serif',
  };
  return fontMap[font];
}

export default BrandingPanel;
