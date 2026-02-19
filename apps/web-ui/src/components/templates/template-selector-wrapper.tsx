/**
 * Template Selector Wrapper Component
 * Story 7.1: Template Selector - Task 6: Integration Points
 *
 * Wrapper component for integrating template selection into
 * workflow completion and report generation flows.
 */

'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TemplateSelector } from './template-selector'
import { useTemplateSelection } from '@/stores/template-store'
import type { Template } from '@/types/template'

interface TemplateSelectorWrapperProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal is closed without selection */
  onClose: () => void
  /** Callback when a template is selected */
  onTemplateSelected: (template: Template) => void
  /** Title for the modal */
  title?: string
  /** Description for the modal */
  description?: string
  /** Whether to allow skipping template selection */
  allowSkip?: boolean
  /** Context message for why template is being selected */
  context?: string
}

/**
 * Integration wrapper for template selection in various flows
 *
 * Usage examples:
 *
 * // Workflow completion flow
 * <TemplateSelectorWrapper
 *   isOpen={showTemplateSelector}
 *   onClose={() => setShowTemplateSelector(false)}
 *   onTemplateSelected={(template) => applyTemplateToOutput(template, workflowOutput)}
 *   title="Format Your Results"
 *   description="Choose how you'd like to format your workflow output"
 *   context="Your workflow has completed successfully. Select a template to format your results."
 * />
 *
 * // Report generation flow
 * <TemplateSelectorWrapper
 *   isOpen={showTemplateSelector}
 *   onClose={() => setShowTemplateSelector(false)}
 *   onTemplateSelected={(template) => generateReport(template)}
 *   title="Generate Report"
 *   description="Select a template for your report"
 *   context="Your data is ready. Choose a template to generate your report."
 * />
 */
export function TemplateSelectorWrapper({
  isOpen,
  onClose,
  onTemplateSelected,
  title = 'Select Output Template',
  description = 'Choose a template to format your output',
  allowSkip = true,
  context,
}: TemplateSelectorWrapperProps) {
  const { selectedTemplate, clearSelection } = useTemplateSelection()
  const [pendingSelection, setPendingSelection] = useState<Template | null>(null)

  // Handle template selection from the selector
  const handleTemplateSelected = useCallback((template: Template) => {
    setPendingSelection(template)
  }, [])

  // Confirm selection and close
  const handleConfirmSelection = useCallback(() => {
    if (pendingSelection) {
      onTemplateSelected(pendingSelection)
      clearSelection()
      setPendingSelection(null)
      onClose()
    }
  }, [pendingSelection, onTemplateSelected, clearSelection, onClose])

  // Handle skip
  const handleSkip = useCallback(() => {
    clearSelection()
    setPendingSelection(null)
    onClose()
  }, [clearSelection, onClose])

  // Update pending selection when template is selected in store
  if (selectedTemplate && !pendingSelection) {
    setPendingSelection(selectedTemplate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
          {context && (
            <div className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2">
              {context}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <TemplateSelector
            onTemplateSelected={handleTemplateSelected}
            allowSkip={false}
            className="-mx-2"
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border gap-2">
          {allowSkip && (
            <Button variant="ghost" onClick={handleSkip}>
              Skip for now
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              clearSelection()
              setPendingSelection(null)
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={!pendingSelection}
            className="min-w-[120px]"
          >
            {pendingSelection ? `Use ${pendingSelection.name}` : 'Select Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook for template selection in workflow completion flow
 */
export function useWorkflowTemplateSelection() {
  const [isOpen, setIsOpen] = useState(false)
  const [workflowData, setWorkflowData] = useState<unknown>(null)

  const openTemplateSelector = useCallback((data: unknown) => {
    setWorkflowData(data)
    setIsOpen(true)
  }, [])

  const closeTemplateSelector = useCallback(() => {
    setIsOpen(false)
    setWorkflowData(null)
  }, [])

  const handleTemplateSelected = useCallback((template: Template) => {
    // This will be called when user confirms template selection
    // The parent component should provide the actual handler
    return { template, workflowData }
  }, [workflowData])

  return {
    isOpen,
    openTemplateSelector,
    closeTemplateSelector,
    handleTemplateSelected,
    workflowData,
  }
}

/**
 * Hook for template selection in report generation flow
 */
export function useReportTemplateSelection() {
  const [isOpen, setIsOpen] = useState(false)
  const [reportData, setReportData] = useState<unknown>(null)

  const openTemplateSelector = useCallback((data: unknown) => {
    setReportData(data)
    setIsOpen(true)
  }, [])

  const closeTemplateSelector = useCallback(() => {
    setIsOpen(false)
    setReportData(null)
  }, [])

  const handleTemplateSelected = useCallback((template: Template) => {
    // This will be called when user confirms template selection
    // The parent component should provide the actual handler
    return { template, reportData }
  }, [reportData])

  return {
    isOpen,
    openTemplateSelector,
    closeTemplateSelector,
    handleTemplateSelected,
    reportData,
  }
}
