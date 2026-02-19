/**
 * Template Canvas Component
 * Story 7.4: Custom Template Builder
 *
 * Canvas area where sections are arranged and reordered.
 * Features drag-and-drop reordering using @dnd-kit.
 */

'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit2,
} from 'lucide-react';
import { useTemplateBuilderStore, TemplateSection } from '@/stores/template-builder-store';
import { toast } from '@/components/ui/toast';

interface TemplateCanvasProps {
  readOnly?: boolean;
}

interface SortableSectionProps {
  section: TemplateSection;
  onToggle: () => void;
  isExpanded: boolean;
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SortableSection({
  section,
  onToggle,
  isExpanded,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const { removeSection, updateSection } = useTemplateBuilderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const [editDescription, setEditDescription] = useState(section.description || '');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast({
        type: 'error',
        title: 'Validation Error',
        message: 'Section name is required',
      });
      return;
    }

    updateSection(section.id, {
      name: editName,
      description: editDescription || undefined,
    });

    toast({
      type: 'success',
      title: 'Section Updated',
      message: `"${editName}" has been updated`,
    });

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(section.name);
    setEditDescription(section.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    removeSection(section.id);
    toast({
      type: 'info',
      title: 'Section Removed',
      message: `"${section.name}" has been removed from your template`,
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <button
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
                  {...attributes}
                  {...listeners}
                  aria-label={`Drag to reorder ${section.name}`}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>

                {/* Keyboard Navigation Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMoveUp();
                    }}
                    disabled={index === 0}
                    aria-label={`Move ${section.name} up`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMoveDown();
                    }}
                    disabled={index === totalCount - 1}
                    aria-label={`Move ${section.name} down`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{section.name}</CardTitle>
                    <Badge variant={section.type === 'built-in' ? 'default' : 'secondary'}>
                      {section.type}
                    </Badge>
                    {section.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                  </div>
                  {section.description && (
                    <CardDescription className="text-sm mt-1">
                      {section.description}
                    </CardDescription>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CollapsibleContent>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  {/* Section Fields */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Fields</h4>
                      <span className="text-xs text-muted-foreground">
                        {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {section.fields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center justify-between p-2 bg-accent/50 rounded"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium">{field.label}</span>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {field.type}
                              </Badge>
                              {field.required && (
                                <span className="text-xs text-muted-foreground">Required</span>
                              )}
                              {field.validation && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                  Validated
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {section.fields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No fields defined
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Edit Mode */}
                  {isEditing ? (
                    <div className="space-y-3 pt-2 border-t">
                      <div>
                        <Label htmlFor={`edit-name-${section.id}`} className="text-sm">Section Name</Label>
                        <Input
                          id={`edit-name-${section.id}`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-desc-${section.id}`} className="text-sm">Description</Label>
                        <Input
                          id={`edit-desc-${section.id}`}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Actions */
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        aria-label={`Edit ${section.name}`}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Section
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={handleDelete}
                        aria-label={`Remove ${section.name}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </CollapsibleTrigger>
      </Collapsible>
    </div>
  );
}

export function TemplateCanvas({ readOnly = false }: TemplateCanvasProps) {
  const { template, reorderSections, toggleSectionExpanded, ui } = useTemplateBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = template.sections.findIndex((s) => s.id === active.id);
      const newIndex = template.sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(template.sections, oldIndex, newIndex);
      reorderSections(newSections);
    }
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <GripVertical className="h-4 w-4" />
          Drag sections to reorder
        </div>
      )}

      {readOnly ? (
        <div className="space-y-4">
          {template.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{section.name}</CardTitle>
                    {section.description && (
                      <CardDescription>{section.description}</CardDescription>
                    )}
                  </div>
                  <Badge variant={section.type === 'built-in' ? 'default' : 'secondary'}>
                    {section.type}
                  </Badge>
                </div>
              </CardHeader>
              {section.fields.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {section.fields.map((field) => (
                      <div key={field.id} className="text-sm">
                        <span className="font-medium">{field.label}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <span className="text-xs text-muted-foreground ml-2">Required</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={template.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {template.sections.map((section, index) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onToggle={() => toggleSectionExpanded(section.id)}
                  isExpanded={ui.expandedSections.has(section.id)}
                  index={index}
                  totalCount={template.sections.length}
                  onMoveUp={() => {
                    if (index > 0) {
                      const newSections = arrayMove(template.sections, index, index - 1);
                      reorderSections(newSections);
                    }
                  }}
                  onMoveDown={() => {
                    if (index < template.sections.length - 1) {
                      const newSections = arrayMove(template.sections, index, index + 1);
                      reorderSections(newSections);
                    }
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default TemplateCanvas;
