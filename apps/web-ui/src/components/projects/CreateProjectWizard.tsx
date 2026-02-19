'use client';

/**
 * Project Creation Wizard Component
 * Epic 6: Project Management System
 * Story 6.3: Project Creation Wizard
 *
 * Multi-step wizard for creating new projects with:
 * - Step 1: Project type selection
 * - Step 2: Basic information
 * - Step 3: Type-specific details
 * - Step 4: Review and create
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Shield, AlertTriangle, Search, ClipboardCheck, GraduationCap, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PROJECT_TYPE_CONFIG, type ProjectType, type AssessmentType } from '@/lib/types/projects';
import type { DateRange } from 'react-day-picker';

const WIZARD_STEPS = [
  { id: 'type', title: 'Project Type', description: 'Choose the type of project' },
  { id: 'basic', title: 'Basic Information', description: 'Enter project details' },
  { id: 'details', title: 'Project Details', description: 'Provide specific information' },
  { id: 'review', title: 'Review', description: 'Review and create' },
] as const;

type WizardStep = typeof WIZARD_STEPS[number]['id'];

interface CreateProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (project: any) => void;
}

export function CreateProjectWizard({ open, onOpenChange, onSuccess }: CreateProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    projectType: ProjectType | '';
    name: string;
    description: string;
    startDate?: Date;
    targetEndDate?: Date;
    assessmentType?: AssessmentType | '';
    incidentSeverity?: 'critical' | 'high' | 'medium' | 'low' | '';
    affectedSystems?: number;
  }>({
    projectType: '',
    name: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      projectType: '',
      name: '',
      description: '',
    });
    setCurrentStep('type');
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleNext = async () => {
    setError(null);

    // Validation
    if (currentStep === 'type' && !formData.projectType) {
      setError('Please select a project type');
      return;
    }

    if (currentStep === 'basic') {
      if (!formData.name.trim()) {
        setError('Project name is required');
        return;
      }
      if (formData.name.length < 3) {
        setError('Project name must be at least 3 characters');
        return;
      }
    }

    // Move to next step
    const stepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    if (stepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStep(WIZARD_STEPS[stepIndex + 1].id);
    }
  };

  const handleBack = () => {
    const stepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(WIZARD_STEPS[stepIndex - 1].id);
    }
    setError(null);
  };

  const handleCreate = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          projectType: formData.projectType,
          startDate: formData.startDate,
          targetEndDate: formData.targetEndDate,
          ...(formData.projectType === 'security-assessment' && {
            assessmentType: formData.assessmentType || 'penetration-test',
          }),
          ...(formData.projectType === 'incident-response' && {
            incidentSeverity: formData.incidentSeverity || undefined,
            affectedSystems: formData.affectedSystems,
          }),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project');
      }

      onSuccess?.(result.project);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const currentStepConfig = WIZARD_STEPS[currentStepIndex];

  const getProjectTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'security-assessment': return Shield;
      case 'incident-response': return AlertTriangle;
      case 'investigation': return Search;
      case 'advisory': return Lightbulb;
      case 'compliance': return ClipboardCheck;
      case 'training': return GraduationCap;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Step {currentStepIndex + 1} of {WIZARD_STEPS.length}: {currentStepConfig.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between gap-2 py-4">
          {WIZARD_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index <= currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index + 1}
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Step content */}
        <div className="py-4">
          {currentStep === 'type' && (
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(PROJECT_TYPE_CONFIG) as ProjectType[]).map((type) => {
                const config = PROJECT_TYPE_CONFIG[type];
                const Icon = getProjectTypeIcon(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, projectType: type })}
                    className={cn(
                      'flex flex-col items-start gap-2 p-4 rounded-lg border-2 text-left transition-colors',
                      formData.projectType === type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{config.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {currentStep === 'basic' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the project (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date: Date | undefined) => setFormData({ ...formData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Target End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.targetEndDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.targetEndDate ? format(formData.targetEndDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.targetEndDate}
                        onSelect={(date: Date | undefined) => setFormData({ ...formData, targetEndDate: date })}
                        initialFocus
                        disabled={(date) => formData.startDate ? date < formData.startDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'details' && (
            <div className="space-y-4">
              {formData.projectType === 'security-assessment' && (
                <div className="space-y-2">
                  <Label htmlFor="assessmentType">Assessment Type</Label>
                  <Select
                    value={formData.assessmentType}
                    onValueChange={(value) => setFormData({ ...formData, assessmentType: value as AssessmentType })}
                  >
                    <SelectTrigger id="assessmentType">
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="penetration-test">Penetration Test</SelectItem>
                      <SelectItem value="vulnerability-scan">Vulnerability Scan</SelectItem>
                      <SelectItem value="red-team">Red Team</SelectItem>
                      <SelectItem value="blue-team">Blue Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.projectType === 'incident-response' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="severity">Initial Severity</Label>
                    <Select
                      value={formData.incidentSeverity}
                      onValueChange={(value) => setFormData({ ...formData, incidentSeverity: value as any })}
                    >
                      <SelectTrigger id="severity">
                        <SelectValue placeholder="Select severity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="affectedSystems">Affected Systems</Label>
                    <Input
                      id="affectedSystems"
                      type="number"
                      min="0"
                      placeholder="Number of affected systems"
                      value={formData.affectedSystems ?? ''}
                      onChange={(e) => setFormData({ ...formData, affectedSystems: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                </>
              )}

              {formData.projectType && !['security-assessment', 'incident-response'].includes(formData.projectType) && (
                <div className="text-sm text-muted-foreground">
                  No additional details required for {PROJECT_TYPE_CONFIG[formData.projectType as ProjectType].name}.
                </div>
              )}
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Project Summary</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type:</dt>
                    <dd className="font-medium">{PROJECT_TYPE_CONFIG[formData.projectType as ProjectType]?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="font-medium">{formData.name}</dd>
                  </div>
                  {formData.description && (
                    <div className="flex flex-col gap-1">
                      <dt className="text-muted-foreground">Description:</dt>
                      <dd className="text-right">{formData.description}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Start Date:</dt>
                    <dd>{formData.startDate ? format(formData.startDate, 'PPP') : 'Not set'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Target End:</dt>
                    <dd>{formData.targetEndDate ? format(formData.targetEndDate, 'PPP') : 'Not set'}</dd>
                  </div>
                  {formData.projectType === 'security-assessment' && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Assessment Type:</dt>
                      <dd className="capitalize">{formData.assessmentType || 'Penetration Test'}</dd>
                    </div>
                  )}
                  {formData.projectType === 'incident-response' && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Severity:</dt>
                        <dd className="capitalize">{formData.incidentSeverity || 'Not set'}</dd>
                      </div>
                      {formData.affectedSystems !== undefined && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Affected Systems:</dt>
                          <dd>{formData.affectedSystems}</dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStep !== 'type' && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
          )}
          {currentStep === 'review' ? (
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
