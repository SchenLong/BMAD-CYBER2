/**
 * Custom Section Modal Component
 * Story 7.4: Custom Template Builder
 *
 * Modal for creating custom sections with field definitions.
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { useTemplateBuilderStore, FieldDataType, FieldDefinition } from '@/stores/template-builder-store';
import { toast } from '@/components/ui/toast';

export function CustomSectionModal() {
  const {
    ui,
    setShowCustomSectionModal,
    addSection,
  } = useTemplateBuilderStore();

  const [sectionName, setSectionName] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [newField, setNewField] = useState<Partial<FieldDefinition>>({
    label: '',
    type: FieldDataType.TEXT,
    required: false,
    validation: {},
  });

  const [showValidationOptions, setShowValidationOptions] = useState(false);

  const resetForm = () => {
    setSectionName('');
    setSectionDescription('');
    setIsRequired(false);
    setFields([]);
    setNewField({
      label: '',
      type: FieldDataType.TEXT,
      required: false,
      validation: {},
    });
    setShowValidationOptions(false);
  };

  const handleClose = () => {
    resetForm();
    setShowCustomSectionModal(false);
  };

  const handleAddField = () => {
    if (!newField.label?.trim()) {
      toast({
        type: 'error',
        title: 'Validation Error',
        message: 'Field label is required',
      });
      return;
    }

    // Clean up empty validation values
    const validation = {
      ...(newField.validation?.minLength && { minLength: newField.validation.minLength }),
      ...(newField.validation?.maxLength && { maxLength: newField.validation.maxLength }),
      ...(newField.validation?.pattern && { pattern: newField.validation.pattern }),
      ...(newField.validation?.min !== undefined && { min: newField.validation.min }),
      ...(newField.validation?.max !== undefined && { max: newField.validation.max }),
    };

    const field: FieldDefinition = {
      id: `field-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      label: newField.label,
      type: newField.type || FieldDataType.TEXT,
      required: newField.required || false,
      placeholder: newField.placeholder,
      validation: Object.keys(validation).length > 0 ? validation : undefined,
    };

    setFields([...fields, field]);
    setNewField({
      label: '',
      type: FieldDataType.TEXT,
      required: false,
      validation: {},
    });
    setShowValidationOptions(false);
  };

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  const handleCreateSection = () => {
    if (!sectionName.trim()) {
      toast({
        type: 'error',
        title: 'Validation Error',
        message: 'Section name is required',
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        type: 'error',
        title: 'Validation Error',
        message: 'Add at least one field to the section',
      });
      return;
    }

    addSection({
      type: 'custom',
      name: sectionName,
      description: sectionDescription || undefined,
      required: isRequired,
      fields,
    });

    toast({
      type: 'success',
      title: 'Section Created',
      message: `"${sectionName}" has been added to your template`,
    });

    handleClose();
  };

  const getFieldTypeLabel = (type: FieldDataType) => {
    const labels: Record<FieldDataType, string> = {
      [FieldDataType.TEXT]: 'Text',
      [FieldDataType.TEXTAREA]: 'Textarea',
      [FieldDataType.NUMBER]: 'Number',
      [FieldDataType.DATE]: 'Date',
      [FieldDataType.LIST]: 'List',
      [FieldDataType.CODE]: 'Code',
      [FieldDataType.RICH_TEXT]: 'Rich Text',
    };
    return labels[type];
  };

  return (
    <Dialog open={ui.showCustomSectionModal} onOpenChange={setShowCustomSectionModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Section</DialogTitle>
          <DialogDescription>
            Define a custom section with your own fields for the template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-name">Section Name *</Label>
              <Input
                id="section-name"
                placeholder="e.g., Client Information"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="section-description">Description</Label>
              <Textarea
                id="section-description"
                placeholder="Brief description of this section"
                value={sectionDescription}
                onChange={(e) => setSectionDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label htmlFor="required">Make this section required</Label>
            </div>
          </div>

          {/* Field Builder */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Fields</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Define the fields that will be part of this section
              </p>
            </div>

            {/* Add New Field Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add Field</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="field-label">Label *</Label>
                    <Input
                      id="field-label"
                      placeholder="e.g., Full Name"
                      value={newField.label}
                      onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-type">Type *</Label>
                    <Select
                      value={newField.type}
                      onValueChange={(value) => setNewField({ ...newField, type: value as FieldDataType })}
                    >
                      <SelectTrigger id="field-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FieldDataType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {getFieldTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="field-placeholder">Placeholder (optional)</Label>
                  <Input
                    id="field-placeholder"
                    placeholder="e.g., Enter the full name"
                    value={newField.placeholder}
                    onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                  />
                </div>

                {/* Validation Options */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowValidationOptions(!showValidationOptions)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    aria-expanded={showValidationOptions}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showValidationOptions ? 'rotate-180' : ''}`}
                    />
                    Validation Options
                  </button>

                  {showValidationOptions && (
                    <div className="pl-6 space-y-3 pt-2 border-l-2 border-muted">
                      {/* Text-based validation */}
                      {(newField.type === FieldDataType.TEXT ||
                        newField.type === FieldDataType.TEXTAREA ||
                        newField.type === FieldDataType.RICH_TEXT) && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="min-length">Min Length</Label>
                              <Input
                                id="min-length"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={newField.validation?.minLength ?? ''}
                                onChange={(e) =>
                                  setNewField({
                                    ...newField,
                                    validation: {
                                      ...newField.validation,
                                      minLength: e.target.value ? parseInt(e.target.value) : undefined,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="max-length">Max Length</Label>
                              <Input
                                id="max-length"
                                type="number"
                                min="1"
                                placeholder="No limit"
                                value={newField.validation?.maxLength ?? ''}
                                onChange={(e) =>
                                  setNewField({
                                    ...newField,
                                    validation: {
                                      ...newField.validation,
                                      maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="pattern">Pattern (Regex)</Label>
                            <Input
                              id="pattern"
                              placeholder="e.g., ^[a-zA-Z]+$"
                              value={newField.validation?.pattern ?? ''}
                              onChange={(e) =>
                                setNewField({
                                  ...newField,
                                  validation: {
                                    ...newField.validation,
                                    pattern: e.target.value || undefined,
                                  },
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Regular expression pattern for validation
                            </p>
                          </div>
                        </>
                      )}

                      {/* Number-based validation */}
                      {newField.type === FieldDataType.NUMBER && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="min-value">Min Value</Label>
                            <Input
                              id="min-value"
                              type="number"
                              placeholder="No limit"
                              value={newField.validation?.min ?? ''}
                              onChange={(e) =>
                                setNewField({
                                  ...newField,
                                  validation: {
                                    ...newField.validation,
                                    min: e.target.value ? parseFloat(e.target.value) : undefined,
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="max-value">Max Value</Label>
                            <Input
                              id="max-value"
                              type="number"
                              placeholder="No limit"
                              value={newField.validation?.max ?? ''}
                              onChange={(e) =>
                                setNewField({
                                  ...newField,
                                  validation: {
                                    ...newField.validation,
                                    max: e.target.value ? parseFloat(e.target.value) : undefined,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* No validation available message */}
                      {![FieldDataType.TEXT, FieldDataType.TEXTAREA, FieldDataType.RICH_TEXT, FieldDataType.NUMBER].includes(
                        newField.type as FieldDataType
                      ) && (
                        <p className="text-xs text-muted-foreground">
                          No validation options available for {getFieldTypeLabel(newField.type as FieldDataType)} fields
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="field-required"
                      checked={newField.required}
                      onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                    />
                    <Label htmlFor="field-required">Required field</Label>
                  </div>
                  <Button onClick={handleAddField} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Field List */}
            {fields.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  Fields ({fields.length})
                </h4>
                <div className="space-y-2">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{field.label}</span>
                        {field.validation && (
                          <div className="flex gap-1 mt-1">
                            {field.validation.minLength && (
                              <span className="text-xs text-muted-foreground">
                                min: {field.validation.minLength}
                              </span>
                            )}
                            {field.validation.maxLength && (
                              <span className="text-xs text-muted-foreground">
                                max: {field.validation.maxLength}
                              </span>
                            )}
                            {field.validation.min !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                min: {field.validation.min}
                              </span>
                            )}
                            {field.validation.max !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                max: {field.validation.max}
                              </span>
                            )}
                            {field.validation.pattern && (
                              <span className="text-xs text-muted-foreground">
                                pattern
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getFieldTypeLabel(field.type)}
                      </Badge>
                      {field.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                      {field.validation && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                          Validated
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => handleRemoveField(field.id)}
                        aria-label={`Remove field ${field.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateSection} disabled={!sectionName.trim() || fields.length === 0}>
            Create Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CustomSectionModal;
