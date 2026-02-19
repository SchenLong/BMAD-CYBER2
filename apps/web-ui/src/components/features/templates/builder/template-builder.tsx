/**
 * Template Builder Component
 * Story 7.4: Custom Template Builder
 *
 * Main component for building custom templates.
 * Features:
 * - Drag-and-drop section reordering
 * - Built-in and custom sections
 * - Branding customization
 * - Template preview
 */

'use client';

import React, { useState } from 'react';
import { useTemplateBuilderStore, BUILT_IN_SECTIONS } from '@/stores/template-builder-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Save,
  X,
  Eye,
  Edit3,
  Palette,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import SectionPalette from './section-palette';
import TemplateCanvas from './template-canvas';
import BrandingPanel from './branding-panel';
import PreviewPane from './preview-pane';
import CustomSectionModal from './custom-section-modal';

interface TemplateBuilderProps {
  templateId?: string;
  onSave?: (template: any) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export function TemplateBuilder({
  templateId,
  onSave,
  onCancel,
  readOnly = false,
}: TemplateBuilderProps) {
  const {
    template,
    ui,
    setTemplateName,
    setTemplateDescription,
    setView,
    setShowBrandingPanel,
    setShowCustomSectionModal,
    resetTemplate,
    validateTemplate,
  } = useTemplateBuilderStore();

  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveErrors, setShowSaveErrors] = useState(false);

  const handleSave = async () => {
    const validation = validateTemplate();

    if (!validation.valid) {
      setErrors(validation.errors);
      setShowSaveErrors(true);
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      // Save to API
      const response = await fetch(
        templateId ? `/api/templates/${templateId}` : '/api/templates',
        {
          method: templateId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: template.name,
            description: template.description,
            sections: template.sections.map((s) => ({
              ...s,
              position: undefined, // Will be set by server
            })),
            sectionOrder: template.sections.map((s) => s.id),
            branding: template.branding,
            settings: template.settings,
            isPublic: false,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (data.error) {
          setErrors([data.error]);
          setShowSaveErrors(true);
          setIsSaving(false);
          return;
        }
      }

      const result = await response.json();
      onSave?.(result.template);
    } catch (error) {
      setErrors(['Failed to save template. Please try again.']);
      setShowSaveErrors(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      template.name ||
      template.description ||
      template.sections.length > 0
    ) {
      if (
        confirm(
          'You have unsaved changes. Are you sure you want to cancel?'
        )
      ) {
        resetTemplate();
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  const hasSections = template.sections.length > 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                {templateId ? 'Edit Template' : 'Create New Template'}
              </h1>
              {hasSections && (
                <Badge variant="secondary">
                  {template.sections.length} {template.sections.length === 1 ? 'section' : 'sections'}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {readOnly ? (
                <Button variant="outline" onClick={onCancel}>
                  Close
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving || !hasSections}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Template'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Template Name & Description */}
          {!readOnly && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  placeholder="My Custom Assessment Template"
                  value={template.name}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  placeholder="A custom template for security assessments"
                  value={template.description}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Save Errors Alert */}
      {showSaveErrors && errors.length > 0 && (
        <div className="container mx-auto px-4 py-2">
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {ui.view === 'preview' ? (
          <PreviewPane
            onEdit={() => setView('builder')}
            templateId={templateId}
            onSave={onSave}
          />
        ) : (
          <div className="flex h-full">
            {/* Sidebar - Section Palette */}
            {!readOnly && (
              <aside className="w-72 border-r bg-card overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Sections
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag sections to the canvas
                  </p>
                </div>

                <Tabs defaultValue="built-in" className="flex-1 flex flex-col">
                  <div className="px-4 pt-4">
                    <TabsList className="w-full">
                      <TabsTrigger value="built-in" className="flex-1">
                        Built-in
                      </TabsTrigger>
                      <TabsTrigger value="custom" className="flex-1">
                        Custom
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="built-in" className="flex-1 overflow-hidden p-4 pt-2">
                    <ScrollArea className="h-full">
                      <SectionPalette
                        sections={Object.entries(BUILT_IN_SECTIONS).map(([key, value]) => ({
                          id: key,
                          name: value.name,
                          description: value.description,
                          type: 'built-in' as const,
                          builtInType: key as any,
                          required: false,
                          fields: value.fields,
                        }))}
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="custom" className="flex-1 overflow-hidden p-4 pt-2">
                    <div className="space-y-4">
                      <Button
                        onClick={() => setShowCustomSectionModal(true)}
                        className="w-full"
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Custom Section
                      </Button>

                      <ScrollArea className="h-[calc(100%-3rem)]">
                        {/* Custom sections would be listed here */}
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No custom sections yet. Create one to get started.
                        </p>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </aside>
            )}

            {/* Canvas - Template Sections */}
            <main className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-6">
                {!hasSections ? (
                  <Card className="max-w-md mx-auto mt-20">
                    <CardHeader>
                      <CardTitle>Start Building Your Template</CardTitle>
                      <CardDescription>
                        Add sections from the palette to begin creating your custom template
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center text-muted-foreground">
                        <GripVertical className="h-8 w-8 mr-2" />
                        <span>Drag sections here</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Template Sections</h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBrandingPanel(!ui.showBrandingPanel)}
                        >
                          <Palette className="mr-2 h-4 w-4" />
                          Branding
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setView('preview')}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    </div>

                    {/* Branding Panel */}
                    {ui.showBrandingPanel && <BrandingPanel />}

                    {/* Template Canvas */}
                    <TemplateCanvas readOnly={readOnly} />
                  </div>
                )}
              </div>
            </main>
          </div>
        )}
      </div>

      {/* Custom Section Modal */}
      <CustomSectionModal />
    </div>
  );
}

export default TemplateBuilder;
