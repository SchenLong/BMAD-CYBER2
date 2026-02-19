/**
 * Template Selector Component
 * Story 7.1: Template Selector
 *
 * Main template selection interface displaying available templates
 * in a grid layout with filtering and selection capabilities.
 */

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Search, Filter, Star, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TemplateCard } from './template-card'
import { TemplatePreviewModal } from './template-preview-modal'
import { useBuiltinTemplates, useTemplateSelection, useTemplatePreferences, useTemplatePreview, useTemplateStore } from '@/stores/template-store'
import type { Template } from '@/types/template'

interface TemplateSelectorProps {
  /** Callback when a template is selected */
  onTemplateSelected?: (template: Template) => void
  /** Allow skipping template selection */
  allowSkip?: boolean
  /** Callback when skipped */
  onSkip?: () => void
  /** Optional className for styling */
  className?: string
}

/**
 * Template filter categories
 */
type FilterCategory = 'all' | 'built-in' | 'custom' | 'enterprise'

export function TemplateSelector({
  onTemplateSelected,
  allowSkip = true,
  onSkip,
  className,
}: TemplateSelectorProps) {
  const builtinTemplates = useBuiltinTemplates()
  const { selectedTemplate, selectTemplate, clearSelection } = useTemplateSelection()
  const { preferences, setDefaultTemplate, setAlwaysUseDefault } = useTemplatePreferences()
  const { isOpen: isPreviewOpen, template: previewTemplate, openPreview, closePreview } = useTemplatePreview()
  const { loadTemplates } = useTemplateStore()
  const availableTemplates = useTemplateStore((state) => state.availableTemplates)

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all')
  const filterButtonRef = useRef<HTMLDivElement>(null)
  const [isLoadingCustom, setIsLoadingCustom] = useState(true)
  const [customTemplatesError, setCustomTemplatesError] = useState<string | null>(null)

  // Combine built-in and custom templates
  const templates = availableTemplates

  // Close filter menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilterMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  // Load default template on mount if preferences exist
  useEffect(() => {
    if (preferences.defaultTemplateId && preferences.alwaysUseDefault) {
      const defaultTemplate = templates.find((t) => t.id === preferences.defaultTemplateId)
      if (defaultTemplate) {
        selectTemplate(defaultTemplate)
      }
    }
  }, [preferences.defaultTemplateId, preferences.alwaysUseDefault, templates, selectTemplate])

  // Fetch custom templates on mount
  useEffect(() => {
    const fetchCustomTemplates = async () => {
      setIsLoadingCustom(true)
      setCustomTemplatesError(null)

      try {
        const response = await fetch('/api/templates?includePublic=true')

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated - silently continue with built-in templates only
            setCustomTemplatesError(null)
          } else {
            throw new Error('Failed to fetch custom templates')
          }
          setIsLoadingCustom(false)
          return
        }

        const data = await response.json()

        // Transform custom templates to match Template interface
        const customTemplates: Template[] = data.templates.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          category: 'custom' as const,
          format: 'markdown' as const,
          icon: 'FileText',
          estimatedTime: 'Custom',
          tags: ['custom'],
          sections: (t.sections || []).map((s: any) => ({
            id: s.id,
            title: s.name,
            description: s.description || '',
            required: s.required,
            fields: s.fields?.map((f: any) => ({
              id: f.id,
              label: f.label,
              type: f.type,
              required: f.required,
              options: f.options,
              defaultValue: f.defaultValue,
            })),
          })),
          preview: {
            thumbnail: 'templates/custom.svg',
            sampleData: {},
            previewSections: [],
          },
        }))

        // Load custom templates into the store
        loadTemplates(customTemplates)
      } catch (error) {
        console.error('Error fetching custom templates:', error)
        setCustomTemplatesError('Failed to load custom templates')
      } finally {
        setIsLoadingCustom(false)
      }
    }

    fetchCustomTemplates()
  }, [loadTemplates])

  // Filter templates based on search and category
  const filteredTemplates = templates.filter((template) => {
    // Category filter
    if (activeCategory !== 'all' && template.category !== activeCategory) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    return true
  })

  // Grid layout configuration for arrow key navigation
  const gridCols = 3
  const focusedIndexRef = useRef<{ rowIndex: number; colIndex: number }>({ rowIndex: 0, colIndex: 0 })

  // Handle arrow key focus between cards
  const handleFocusCard = useCallback((rowIndex: number, colIndex: number) => {
    // Calculate the index in the filtered templates
    const targetIndex = rowIndex * gridCols + colIndex
    if (targetIndex >= 0 && targetIndex < filteredTemplates.length) {
      focusedIndexRef.current = { rowIndex, colIndex }
      // Dispatch event to the specific card
      window.dispatchEvent(new CustomEvent('focusTemplateCard', { detail: { rowIndex, colIndex } }))
    }
  }, [filteredTemplates.length])

  // Handle template selection
  const handleSelectTemplate = (template: Template) => {
    selectTemplate(template)
    onTemplateSelected?.(template)
  }

  // Handle preview
  const handlePreview = (template: Template) => {
    openPreview(template)
  }

  // Handle selecting template from preview
  const handleSelectFromPreview = (template: Template) => {
    handleSelectTemplate(template)
    closePreview()
  }

  // Handle setting as default
  const handleSetAsDefault = () => {
    if (selectedTemplate) {
      setDefaultTemplate(selectedTemplate.id)
      setAlwaysUseDefault(true)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Select Output Template</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a template to format your output for stakeholders
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search templates"
            />
          </div>

          {/* Category filter button with dropdown */}
          <div className="relative" ref={filterButtonRef}>
            <Button
              variant="outline"
              size="default"
              className="shrink-0"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              aria-expanded={showFilterMenu}
              aria-haspopup="listbox"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {activeCategory !== 'all' && (
                <span className="ml-2 h-2 w-2 rounded-full bg-purple" />
              )}
            </Button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 z-10 min-w-[200px] rounded-lg border bg-card shadow-lg">
                <div className="p-1" role="listbox">
                  {[
                    { value: 'all', label: 'All Templates' },
                    { value: 'built-in', label: 'Built-in' },
                    { value: 'custom', label: 'Custom' },
                    { value: 'enterprise', label: 'Enterprise' },
                  ].map((category) => (
                    <button
                      key={category.value}
                      role="option"
                      aria-selected={activeCategory === category.value}
                      onClick={() => {
                        setActiveCategory(category.value as FilterCategory)
                        setShowFilterMenu(false)
                      }}
                      className={cn(
                        'w-full flex items-center justify-between rounded-md px-3 py-2 text-sm',
                        activeCategory === category.value
                          ? 'bg-purple/10 text-purple'
                          : 'text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {category.label}
                      {activeCategory === category.value && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Default template indicator */}
        {preferences.defaultTemplateId && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple" />
              <span className="text-sm text-muted-foreground">
                Default template:{' '}
                {templates.find((t) => t.id === preferences.defaultTemplateId)?.name || 'None'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setDefaultTemplate(null)
                setAlwaysUseDefault(false)
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Templates grid */}
      {isLoadingCustom ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading custom templates...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Built-in Templates Section */}
          {activeCategory === 'all' || activeCategory === 'built-in' ? (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Built-in Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates
                  .filter((t) => t.category === 'built-in')
                  .map((template, index) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      isDefault={preferences.defaultTemplateId === template.id}
                      onSelect={handleSelectTemplate}
                      onPreview={handlePreview}
                      rowIndex={Math.floor(index / gridCols)}
                      colIndex={index % gridCols}
                      totalCols={gridCols}
                      onFocusCard={handleFocusCard}
                    />
                  ))}
              </div>
            </div>
          ) : null}

          {/* Custom Templates Section */}
          {activeCategory === 'all' || activeCategory === 'custom' ? (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Custom Templates
                {customTemplatesError && (
                  <span className="ml-2 text-xs text-destructive">{customTemplatesError}</span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates
                  .filter((t) => t.category === 'custom')
                  .map((template, index) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      isDefault={preferences.defaultTemplateId === template.id}
                      onSelect={handleSelectTemplate}
                      onPreview={handlePreview}
                      rowIndex={Math.floor(index / gridCols)}
                      colIndex={index % gridCols}
                      totalCols={gridCols}
                      onFocusCard={handleFocusCard}
                    />
                  ))}
                {filteredTemplates.filter((t) => t.category === 'custom').length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>No custom templates found.</p>
                    <p className="text-sm mt-1">Create a custom template to get started.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Enterprise Templates Section */}
          {activeCategory === 'all' || activeCategory === 'enterprise' ? (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Enterprise Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates
                  .filter((t) => t.category === 'enterprise')
                  .map((template, index) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      isDefault={preferences.defaultTemplateId === template.id}
                      onSelect={handleSelectTemplate}
                      onPreview={handlePreview}
                      rowIndex={Math.floor(index / gridCols)}
                      colIndex={index % gridCols}
                      totalCols={gridCols}
                      onFocusCard={handleFocusCard}
                    />
                  ))}
                {filteredTemplates.filter((t) => t.category === 'enterprise').length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>No enterprise templates available.</p>
                    <p className="text-sm mt-1">Upgrade to Enterprise for access.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* No results */}
      {!isLoadingCustom && filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found matching your criteria.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setSearchQuery('')
              setActiveCategory('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Footer with skip option */}
      {allowSkip && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {selectedTemplate ? (
              <span className="text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple" />
                {selectedTemplate.name} selected
              </span>
            ) : (
              'Select a template to continue'
            )}
          </div>
          <div className="flex gap-2">
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            )}
            {selectedTemplate && !preferences.alwaysUseDefault && (
              <Button variant="outline" size="sm" onClick={handleSetAsDefault}>
                <Star className="h-4 w-4 mr-1.5" />
                Always use this template
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={isPreviewOpen}
        onClose={closePreview}
        onSelectTemplate={handleSelectFromPreview}
        isDefault={preferences.defaultTemplateId === previewTemplate?.id}
      />
    </div>
  )
}
