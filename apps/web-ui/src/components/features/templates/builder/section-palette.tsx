/**
 * Section Palette Component
 * Story 7.4: Custom Template Builder
 *
 * Displays available sections that can be added to the template.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTemplateBuilderStore } from '@/stores/template-builder-store';
import { BuiltInSectionType, FieldDefinition } from '@/stores/template-builder-store';
import { toast } from '@/components/ui/toast';

interface Section {
  id: string;
  name: string;
  description: string;
  type: 'built-in' | 'custom';
  builtInType?: BuiltInSectionType;
  required: boolean;
  fields: FieldDefinition[];
}

interface SectionPaletteProps {
  sections: Section[];
}

export function SectionPalette({ sections }: SectionPaletteProps) {
  const { addSection, template } = useTemplateBuilderStore();

  const handleAddSection = (section: Section) => {
    // Check if section already exists
    const exists = template.sections.some(
      (s) => s.builtInType === section.builtInType || s.name === section.name
    );

    if (exists) {
      toast({
        type: 'warning',
        title: 'Section Already Added',
        message: `"${section.name}" is already in your template.`,
      });
      return;
    }

    addSection({
      type: section.type,
      name: section.name,
      description: section.description,
      required: section.required,
      builtInType: section.builtInType,
      fields: section.fields,
    });

    toast({
      type: 'success',
      title: 'Section Added',
      message: `"${section.name}" has been added to your template.`,
    });
  };

  const getSectionColor = (type: string) => {
    const colors: Record<string, string> = {
      'executive-summary': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      'methodology': 'bg-green-500/10 text-green-700 dark:text-green-400',
      'data-collection': 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      'analysis': 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      'findings': 'bg-red-500/10 text-red-700 dark:text-red-400',
      'risks': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      'recommendations': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      'appendices': 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  };

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isInTemplate = template.sections.some(
          (s) => s.builtInType === section.builtInType || s.name === section.name
        );

        return (
          <Card
            key={section.id}
            className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
              isInTemplate ? 'opacity-50' : ''
            }`}
          >
            <CardHeader className="p-3 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {section.name}
                  </CardTitle>
                  {section.description && (
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {section.description}
                    </CardDescription>
                  )}
                </div>
                <Badge className={getSectionColor(section.id)} variant="secondary">
                  {section.fields.length} fields
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Button
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() => handleAddSection(section)}
                disabled={isInTemplate}
              >
                {isInTemplate ? (
                  'Added'
                ) : (
                  <>
                    <Plus className="mr-1 h-3 w-3" />
                    Add Section
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default SectionPalette;
