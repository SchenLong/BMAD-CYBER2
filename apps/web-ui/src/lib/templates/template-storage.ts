/**
 * Template Storage Utility
 * Story 7.1: Template Selector
 *
 * LocalStorage persistence for template preferences.
 */

import type { TemplatePreferences } from '@/types/template'

const STORAGE_KEY = 'bmad-template-preferences'

/**
 * Load template preferences from localStorage
 */
export function loadTemplatePreferences(): Partial<TemplatePreferences> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}

    const parsed = JSON.parse(stored)
    return {
      defaultTemplateId: parsed.defaultTemplateId || null,
      alwaysUseDefault: parsed.alwaysUseDefault || false,
      recentTemplates: parsed.recentTemplates || [],
    }
  } catch (error) {
    console.error('Failed to load template preferences:', error)
    return {}
  }
}

/**
 * Save template preferences to localStorage
 */
export function saveTemplatePreferences(preferences: TemplatePreferences): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.error('Failed to save template preferences:', error)
  }
}

/**
 * Clear template preferences from localStorage
 */
export function clearTemplatePreferences(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear template preferences:', error)
  }
}
