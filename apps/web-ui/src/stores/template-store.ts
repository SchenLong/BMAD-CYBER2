/**
 * Template Store
 * Story 7.1: Template Selector
 *
 * State management for template selection, preferences,
 * and available templates registry.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Template, TemplatePreferences, TemplateSelection } from '@/types/template'
import { BUILTIN_TEMPLATES } from '@/lib/templates/builtin-templates'
import { loadTemplatePreferences, saveTemplatePreferences } from '@/lib/templates/template-storage'

/**
 * Default template preferences
 */
const defaultPreferences: TemplatePreferences = {
  defaultTemplateId: null,
  alwaysUseDefault: false,
  recentTemplates: [],
}

/**
 * Load preferences from localStorage on init
 */
const initialPreferences: TemplatePreferences = {
  ...defaultPreferences,
  ...loadTemplatePreferences(),
}

/**
 * Template store state interface
 */
interface TemplateState {
  // Available templates
  availableTemplates: Template[]

  // User preferences
  preferences: TemplatePreferences

  // Selection state
  selection: TemplateSelection

  // Actions - Template Management
  loadTemplates: (templates: Template[]) => void
  addTemplate: (template: Template) => void
  removeTemplate: (templateId: string) => void
  getTemplateById: (templateId: string) => Template | undefined

  // Actions - Selection
  selectTemplate: (template: Template) => void
  clearSelection: () => void
  openPreview: (template: Template) => void
  closePreview: () => void

  // Actions - Preferences
  setDefaultTemplate: (templateId: string | null) => void
  setAlwaysUseDefault: (alwaysUse: boolean) => void
  addToRecent: (templateId: string) => void
  clearRecent: () => void

  // Actions - Load/Save
  loadPreferences: (prefs: Partial<TemplatePreferences>) => void
  exportPreferences: () => TemplatePreferences
}

/**
 * Template store with immer middleware for immutable updates
 */
export const useTemplateStore = create<TemplateState>()(
  immer((set, get) => ({
    // Initial state
    availableTemplates: BUILTIN_TEMPLATES,
    preferences: initialPreferences,
    selection: {
      selectedTemplate: null,
      isPreviewOpen: false,
      previewTemplate: null,
    },

    // Template Management Actions
    loadTemplates: (templates) =>
      set((state) => {
        state.availableTemplates = [...BUILTIN_TEMPLATES, ...templates]
      }),

    addTemplate: (template) =>
      set((state) => {
        // Avoid duplicates
        const exists = state.availableTemplates.some((t) => t.id === template.id)
        if (!exists) {
          state.availableTemplates.push(template)
        }
      }),

    removeTemplate: (templateId) =>
      set((state) => {
        state.availableTemplates = state.availableTemplates.filter(
          (t) => t.id !== templateId && t.category !== 'built-in',
        )
        // Clear from selection if removed
        if (state.selection.selectedTemplate?.id === templateId) {
          state.selection.selectedTemplate = null
        }
        if (state.selection.previewTemplate?.id === templateId) {
          state.selection.previewTemplate = null
        }
        // Clear from preferences if it was the default
        if (state.preferences.defaultTemplateId === templateId) {
          state.preferences.defaultTemplateId = null
        }
        // Remove from recent templates
        state.preferences.recentTemplates = state.preferences.recentTemplates.filter(
          (id) => id !== templateId,
        )
      }),

    getTemplateById: (templateId) => {
      return get().availableTemplates.find((t) => t.id === templateId)
    },

    // Selection Actions
    selectTemplate: (template) =>
      set((state) => {
        state.selection.selectedTemplate = template
        // Add to recent templates
        const recent = state.preferences.recentTemplates
        const filtered = recent.filter((id) => id !== template.id)
        state.preferences.recentTemplates = [template.id, ...filtered].slice(0, 5)
        saveTemplatePreferences(state.preferences)
      }),

    clearSelection: () =>
      set((state) => {
        state.selection.selectedTemplate = null
      }),

    openPreview: (template) =>
      set((state) => {
        state.selection.previewTemplate = template
        state.selection.isPreviewOpen = true
      }),

    closePreview: () =>
      set((state) => {
        state.selection.isPreviewOpen = false
      }),

    // Preferences Actions
    setDefaultTemplate: (templateId) =>
      set((state) => {
        state.preferences.defaultTemplateId = templateId
        saveTemplatePreferences(state.preferences)
      }),

    setAlwaysUseDefault: (alwaysUse) =>
      set((state) => {
        state.preferences.alwaysUseDefault = alwaysUse
        saveTemplatePreferences(state.preferences)
      }),

    addToRecent: (templateId) =>
      set((state) => {
        const recent = state.preferences.recentTemplates
        const filtered = recent.filter((id) => id !== templateId)
        state.preferences.recentTemplates = [templateId, ...filtered].slice(0, 5)
        saveTemplatePreferences(state.preferences)
      }),

    clearRecent: () =>
      set((state) => {
        state.preferences.recentTemplates = []
        saveTemplatePreferences(state.preferences)
      }),

    // Load/Save Actions
    loadPreferences: (prefs) =>
      set((state) => {
        state.preferences = { ...state.preferences, ...prefs }
      }),

    exportPreferences: () => {
      return get().preferences
    },
  })),
)

// Selector hooks for common use cases
export function useAvailableTemplates() {
  return useTemplateStore((state) => state.availableTemplates)
}

export function useBuiltinTemplates() {
  return useTemplateStore((state) =>
    state.availableTemplates.filter((t) => t.category === 'built-in'),
  )
}

export function useTemplateSelection() {
  return useTemplateStore((state) => ({
    selectedTemplate: state.selection.selectedTemplate,
    selectTemplate: state.selectTemplate,
    clearSelection: state.clearSelection,
  }))
}

export function useTemplatePreview() {
  return useTemplateStore((state) => ({
    isOpen: state.selection.isPreviewOpen,
    template: state.selection.previewTemplate,
    openPreview: state.openPreview,
    closePreview: state.closePreview,
  }))
}

export function useTemplatePreferences() {
  return useTemplateStore((state) => ({
    preferences: state.preferences,
    setDefaultTemplate: state.setDefaultTemplate,
    setAlwaysUseDefault: state.setAlwaysUseDefault,
    recentTemplates: state.preferences.recentTemplates,
  }))
}
