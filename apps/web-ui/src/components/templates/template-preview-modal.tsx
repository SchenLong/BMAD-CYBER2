/**
 * Template Preview Modal Component
 * Story 7.1: Template Selector
 *
 * Modal dialog showing template structure and sections
 * with sample data preview.
 */

'use client'

import { Check, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Template } from '@/types/template'

interface TemplatePreviewModalProps {
  /** Template to preview */
  template: Template | null
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Callback when template is selected from preview */
  onSelectTemplate?: (template: Template) => void
  /** Whether this is the user's default template */
  isDefault?: boolean
}

/**
 * Template preview modal component
 */
export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onSelectTemplate,
  isDefault = false,
}: TemplatePreviewModalProps) {
  if (!template) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        showCloseButton={true}
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple/10 text-purple">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">{template.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Template content */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-4 py-4">
            {/* Template metadata */}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium">Format:</span>
                <span className="uppercase">{template.format}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium">Sections:</span>
                <span>{template.sections.length}</span>
              </div>
              {template.estimatedTime && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="font-medium">Est. time:</span>
                  <span>{template.estimatedTime}</span>
                </div>
              )}
              {isDefault && (
                <div className="flex items-center gap-1.5 text-purple">
                  <span className="font-medium">Your default</span>
                </div>
              )}
            </div>

            {/* Template sections */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Template Structure</h3>
              <div className="space-y-2">
                {template.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                      'border-border bg-card',
                    )}
                  >
                    {/* Section number */}
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple/10 text-purple text-xs font-semibold">
                      {index + 1}
                    </div>

                    {/* Section content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground">{section.title}</h4>
                        {section.required && (
                          <span className="text-xs text-muted-foreground">(required)</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>

                      {/* Sample data for this section */}
                      {template.preview.sampleData[section.id] && (
                        <div className="mt-2 rounded bg-muted/50 p-2 text-xs text-muted-foreground">
                          {typeof template.preview.sampleData[section.id] === 'string' ? (
                            <p className="whitespace-pre-wrap">{template.preview.sampleData[section.id] as string}</p>
                          ) : (
                            <span>{JSON.stringify(template.preview.sampleData[section.id], null, 2)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample output preview */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Sample Output Preview</h3>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                  {(() => {
                    const lines = [`# ${template.name}`, '']
                    template.sections.forEach((s, i) => {
                      const sample = template.preview.sampleData[s.id]
                      const content = typeof sample === 'string' ? sample : JSON.stringify(sample, null, 2)
                      lines.push(`## ${i + 1}. ${s.title}`, '', content || '[Content will be generated from your data]', '')
                    })
                    return lines.join('\n')
                  })()}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onSelectTemplate && (
            <Button onClick={() => onSelectTemplate(template)} className="min-w-[140px]">
              <Check className="h-4 w-4 mr-1.5" />
              Use Template
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
