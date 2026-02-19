/**
 * Template Card Component
 * Story 7.1: Template Selector
 *
 * Displays a single template as a card with name, description,
 * preview thumbnail, and action buttons.
 */

'use client'

import { useRef, useEffect } from 'react'
import { FileText, Code, Star, Eye, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Template } from '@/types/template'

interface TemplateCardProps {
  /** Template to display */
  template: Template
  /** Whether this template is currently selected */
  isSelected?: boolean
  /** Whether this is the user's default template */
  isDefault?: boolean
  /** Callback when template is selected */
  onSelect: (template: Template) => void
  /** Callback when preview is requested */
  onPreview: (template: Template) => void
  /** Optional className for styling */
  className?: string
  /** Row index for arrow key navigation */
  rowIndex?: number
  /** Column index for arrow key navigation */
  colIndex?: number
  /** Total columns for arrow key navigation */
  totalCols?: number
  /** Callback to focus another card via arrow keys */
  onFocusCard?: (rowIndex: number, colIndex: number) => void
}

/**
 * Map template icon identifiers to Lucide icons
 */
function getTemplateIcon(icon?: string) {
  switch (icon) {
    case 'FileText':
    case 'executive-brief':
      return FileText
    case 'Code':
    case 'technical-report':
      return Code
    default:
      return FileText
  }
}

/**
 * Template card component with hover effects and selection state
 */
export function TemplateCard({
  template,
  isSelected = false,
  isDefault = false,
  onSelect,
  onPreview,
  className,
  rowIndex = 0,
  colIndex = 0,
  totalCols = 3,
  onFocusCard,
}: TemplateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const IconComponent = getTemplateIcon(template.icon)

  // Focus this card when requested via arrow navigation
  useEffect(() => {
    if (onFocusCard && cardRef.current) {
      const handleFocusRequest = (e: CustomEvent<{ rowIndex: number; colIndex: number }>) => {
        if (e.detail.rowIndex === rowIndex && e.detail.colIndex === colIndex) {
          cardRef.current?.focus()
        }
      }
      window.addEventListener('focusTemplateCard', handleFocusRequest as EventListener)
      return () => {
        window.removeEventListener('focusTemplateCard', handleFocusRequest as EventListener)
      }
    }
  }, [rowIndex, colIndex, onFocusCard])

  return (
    <Card
      ref={cardRef}
      className={cn(
        // Base card styling
        'group relative overflow-hidden transition-all duration-300',
        // Background and border
        'bg-card border-border',
        // Hover states
        'hover:border-purple/30 hover:shadow-lg hover:shadow-purple/5',
        // Selected state
        isSelected && 'border-purple bg-purple/5 shadow-lg shadow-purple/10',
        className,
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(template)
        } else if (onFocusCard) {
          // Arrow key navigation
          let newRow = rowIndex
          let newCol = colIndex
          if (e.key === 'ArrowRight') {
            newCol = colIndex + 1
          } else if (e.key === 'ArrowLeft') {
            newCol = colIndex - 1
          } else if (e.key === 'ArrowDown') {
            newRow = rowIndex + 1
          } else if (e.key === 'ArrowUp') {
            newRow = rowIndex - 1
          } else {
            return
          }
          e.preventDefault()
          onFocusCard(newRow, newCol)
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${template.name} template`}
    >
      {/* Selected indicator badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-purple px-2 py-1 text-xs font-medium text-white">
          <Check className="h-3 w-3" />
          Selected
        </div>
      )}

      {/* Default template badge */}
      {isDefault && !isSelected && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          <Star className="h-3 w-3" />
          Default
        </div>
      )}

      <CardHeader className="pb-4">
        {/* Icon and title row */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
              isSelected ? 'bg-purple text-white' : 'bg-muted text-muted-foreground group-hover:bg-purple/10 group-hover:text-purple',
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground truncate">
              {template.name}
            </CardTitle>
            {template.estimatedTime && (
              <p className="text-xs text-muted-foreground mt-0.5">{template.estimatedTime}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <CardDescription className="text-sm text-secondary leading-relaxed line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Preview thumbnail placeholder */}
        <div
          className={cn(
            'flex aspect-video w-full items-center justify-center rounded-lg border transition-colors',
            isSelected ? 'border-purple/30 bg-purple/5' : 'border-border bg-muted/30 group-hover:border-purple/20',
          )}
        >
          <div className="text-center p-4">
            <FileText className={cn('h-8 w-8 mx-auto mb-2 opacity-50', isSelected && 'text-purple/50')} />
            <p className="text-xs text-muted-foreground">
              {template.sections.length} sections
            </p>
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        {/* Preview button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => onPreview(template)}
          aria-label={`Preview ${template.name} template`}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          Preview
        </Button>

        {/* Use Template button */}
        <Button
          variant={isSelected ? 'default' : 'secondary'}
          size="sm"
          className="flex-1"
          onClick={() => onSelect(template)}
          aria-label={`Use ${template.name} template`}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              Selected
            </>
          ) : (
            'Use Template'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
