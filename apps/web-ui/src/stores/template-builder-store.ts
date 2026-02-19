/**
 * Template Builder Store
 * Story 7.4: Custom Template Builder
 *
 * State management for the custom template builder UI.
 * Manages template sections, branding, and builder state.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

// Enable Immer MapSet plugin for Set/Map support
enableMapSet();

/**
 * Built-in section types available in the template builder
 */
export enum BuiltInSectionType {
  EXECUTIVE_SUMMARY = 'executive-summary',
  METHODOLOGY = 'methodology',
  DATA_COLLECTION = 'data-collection',
  ANALYSIS = 'analysis',
  FINDINGS = 'findings',
  RISKS = 'risks',
  RECOMMENDATIONS = 'recommendations',
  APPENDICES = 'appendices',
}

/**
 * Field types for custom section fields
 */
export enum FieldDataType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  LIST = 'list',
  CODE = 'code',
  RICH_TEXT = 'rich-text',
}

/**
 * Built-in section definitions with default fields
 */
export const BUILT_IN_SECTIONS: Record<
  BuiltInSectionType,
  { name: string; description: string; fields: FieldDefinition[] }
> = {
  [BuiltInSectionType.EXECUTIVE_SUMMARY]: {
    name: 'Executive Summary',
    description: 'High-level overview of the assessment or project',
    fields: [
      {
        id: 'overview',
        label: 'Overview',
        type: FieldDataType.TEXTAREA,
        required: true,
      },
      {
        id: 'key-findings',
        label: 'Key Findings',
        type: FieldDataType.LIST,
        required: true,
      },
      {
        id: 'executive-summary',
        label: 'Executive Summary',
        type: FieldDataType.TEXTAREA,
        required: true,
      },
    ],
  },
  [BuiltInSectionType.METHODOLOGY]: {
    name: 'Methodology',
    description: 'Approach and tools used for the assessment',
    fields: [
      {
        id: 'approach',
        label: 'Approach',
        type: FieldDataType.TEXTAREA,
        required: true,
      },
      {
        id: 'tools-used',
        label: 'Tools Used',
        type: FieldDataType.LIST,
        required: true,
      },
      {
        id: 'scope',
        label: 'Scope',
        type: FieldDataType.TEXTAREA,
        required: false,
      },
    ],
  },
  [BuiltInSectionType.DATA_COLLECTION]: {
    name: 'Data Collection',
    description: 'Sources and timestamps of data collection',
    fields: [
      {
        id: 'sources',
        label: 'Data Sources',
        type: FieldDataType.LIST,
        required: true,
      },
      {
        id: 'collection-period',
        label: 'Collection Period',
        type: FieldDataType.TEXT,
        required: true,
      },
      {
        id: 'methodology',
        label: 'Collection Methodology',
        type: FieldDataType.TEXTAREA,
        required: false,
      },
    ],
  },
  [BuiltInSectionType.ANALYSIS]: {
    name: 'Analysis',
    description: 'Techniques and processing methods used',
    fields: [
      {
        id: 'techniques',
        label: 'Analysis Techniques',
        type: FieldDataType.LIST,
        required: true,
      },
      {
        id: 'processing',
        label: 'Data Processing',
        type: FieldDataType.TEXTAREA,
        required: false,
      },
    ],
  },
  [BuiltInSectionType.FINDINGS]: {
    name: 'Findings',
    description: 'Detailed results and discoveries',
    fields: [
      {
        id: 'summary',
        label: 'Findings Summary',
        type: FieldDataType.TEXTAREA,
        required: true,
      },
      {
        id: 'detailed-findings',
        label: 'Detailed Findings',
        type: FieldDataType.RICH_TEXT,
        required: false,
      },
      {
        id: 'evidence',
        label: 'Supporting Evidence',
        type: FieldDataType.LIST,
        required: false,
      },
    ],
  },
  [BuiltInSectionType.RISKS]: {
    name: 'Risks',
    description: 'Risk assessment and severity levels',
    fields: [
      {
        id: 'risk-summary',
        label: 'Risk Summary',
        type: FieldDataType.TEXTAREA,
        required: true,
      },
      {
        id: 'risk-levels',
        label: 'Risk Levels',
        type: FieldDataType.LIST,
        required: true,
      },
      {
        id: 'mitigation',
        label: 'Mitigation Strategies',
        type: FieldDataType.LIST,
        required: false,
      },
    ],
  },
  [BuiltInSectionType.RECOMMENDATIONS]: {
    name: 'Recommendations',
    description: 'Action items and next steps',
    fields: [
      {
        id: 'priority-recommendations',
        label: 'Priority Recommendations',
        type: FieldDataType.LIST,
        required: true,
      },
      {
        id: 'additional-recommendations',
        label: 'Additional Recommendations',
        type: FieldDataType.LIST,
        required: false,
      },
      {
        id: 'timeline',
        label: 'Implementation Timeline',
        type: FieldDataType.TEXTAREA,
        required: false,
      },
    ],
  },
  [BuiltInSectionType.APPENDICES]: {
    name: 'Appendices',
    description: 'Raw data, additional artifacts, and supplementary materials',
    fields: [
      {
        id: 'raw-data',
        label: 'Raw Data',
        type: FieldDataType.TEXTAREA,
        required: false,
      },
      {
        id: 'artifacts',
        label: 'Additional Artifacts',
        type: FieldDataType.LIST,
        required: false,
      },
    ],
  },
};

/**
 * Field definition for custom section fields
 */
export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldDataType;
  required: boolean;
  defaultValue?: string | number | string[];
  validation?: FieldValidation;
  placeholder?: string;
}

/**
 * Validation rules for field definitions
 */
export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customValidation?: string;
}

/**
 * Template section in the builder
 */
export interface TemplateSection {
  id: string;
  type: 'built-in' | 'custom';
  name: string;
  description?: string;
  required: boolean;
  position: number;
  builtInType?: BuiltInSectionType;
  fields: FieldDefinition[];
}

/**
 * Branding options for the template
 */
export interface TemplateBranding {
  logoUrl?: string;
  headerColor: string;
  font: TemplateFont;
  coverImage?: string;
  footerText?: string;
}

/**
 * Available font options
 */
export enum TemplateFont {
  INTER = 'inter',
  ROBOTO = 'roboto',
  OPEN_SANS = 'open-sans',
  LATO = 'lato',
}

/**
 * Template settings
 */
export interface TemplateSettings {
  onePage?: boolean;
  includeToc?: boolean;
  includePageNumbers?: boolean;
}

/**
 * Complete template state
 */
export interface TemplateState {
  id?: string; // Existing template ID if editing
  name: string;
  description: string;
  sections: TemplateSection[];
  branding: TemplateBranding;
  settings: TemplateSettings;
}

/**
 * Builder UI state
 */
export interface BuilderUIState {
  view: 'builder' | 'preview';
  selectedSectionId: string | null;
  isDragging: boolean;
  expandedSections: Set<string>;
  showCustomSectionModal: boolean;
  showBrandingPanel: boolean;
}

/**
 * Combined store state
 */
interface TemplateBuilderState {
  template: TemplateState;
  ui: BuilderUIState;

  // Template actions
  setTemplateName: (name: string) => void;
  setTemplateDescription: (description: string) => void;
  addSection: (section: Omit<TemplateSection, 'id' | 'position'>) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<TemplateSection>) => void;
  reorderSections: (sections: TemplateSection[]) => void;
  addFieldToSection: (sectionId: string, field: FieldDefinition) => void;
  removeFieldFromSection: (sectionId: string, fieldId: string) => void;
  updateFieldInSection: (
    sectionId: string,
    fieldId: string,
    updates: Partial<FieldDefinition>
  ) => void;

  // Branding actions
  setBranding: (branding: Partial<TemplateBranding>) => void;
  setLogoUrl: (url: string) => void;
  setHeaderColor: (color: string) => void;
  setFont: (font: TemplateFont) => void;
  setCoverImage: (url: string) => void;
  setFooterText: (text: string) => void;

  // Settings actions
  setSettings: (settings: Partial<TemplateSettings>) => void;

  // UI actions
  setView: (view: 'builder' | 'preview') => void;
  setSelectedSection: (sectionId: string | null) => void;
  toggleSectionExpanded: (sectionId: string) => void;
  setDragging: (isDragging: boolean) => void;
  setShowCustomSectionModal: (show: boolean) => void;
  setShowBrandingPanel: (show: boolean) => void;

  // Reset actions
  resetTemplate: () => void;
  loadTemplate: (template: Partial<TemplateState>) => void;

  // Validation
  validateTemplate: () => { valid: boolean; errors: string[] };
}

/**
 * Default branding values
 */
const defaultBranding: TemplateBranding = {
  headerColor: '#1e40af', // Default blue
  font: TemplateFont.INTER,
  footerText: '',
};

/**
 * Default settings values
 */
const defaultSettings: TemplateSettings = {
  onePage: false,
  includeToc: true,
  includePageNumbers: true,
};

/**
 * Create the template builder store
 */
export const useTemplateBuilderStore = create<
  TemplateBuilderState,
  [['zustand/immer', never]]
>(
  immer((set, get) => ({
    // Initial state
    template: {
      name: '',
      description: '',
      sections: [],
      branding: defaultBranding,
      settings: defaultSettings,
    },
    ui: {
      view: 'builder',
      selectedSectionId: null,
      isDragging: false,
      expandedSections: new Set(),
      showCustomSectionModal: false,
      showBrandingPanel: false,
    },

    // Template actions
    setTemplateName: (name) =>
      set((state) => {
        state.template.name = name;
      }),

    setTemplateDescription: (description) =>
      set((state) => {
        state.template.description = description;
      }),

    addSection: (section) =>
      set((state) => {
        const newSection: TemplateSection = {
          ...section,
          id: `section-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          position: state.template.sections.length,
        };
        state.template.sections.push(newSection);
        // Auto-expand the new section
        state.ui.expandedSections.add(newSection.id);
      }),

    removeSection: (sectionId) =>
      set((state) => {
        state.template.sections = state.template.sections
          .filter((s) => s.id !== sectionId)
          .map((s, idx) => ({ ...s, position: idx }));
        if (state.ui.selectedSectionId === sectionId) {
          state.ui.selectedSectionId = null;
        }
        state.ui.expandedSections.delete(sectionId);
      }),

    updateSection: (sectionId, updates) =>
      set((state) => {
        const section = state.template.sections.find((s) => s.id === sectionId);
        if (section) {
          Object.assign(section, updates);
        }
      }),

    reorderSections: (sections) =>
      set((state) => {
        state.template.sections = sections.map((s, idx) => ({ ...s, position: idx }));
      }),

    addFieldToSection: (sectionId, field) =>
      set((state) => {
        const section = state.template.sections.find((s) => s.id === sectionId);
        if (section) {
          section.fields.push({
            ...field,
            id: field.id || `field-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          });
        }
      }),

    removeFieldFromSection: (sectionId, fieldId) =>
      set((state) => {
        const section = state.template.sections.find((s) => s.id === sectionId);
        if (section) {
          section.fields = section.fields.filter((f) => f.id !== fieldId);
        }
      }),

    updateFieldInSection: (sectionId, fieldId, updates) =>
      set((state) => {
        const section = state.template.sections.find((s) => s.id === sectionId);
        if (section) {
          const field = section.fields.find((f) => f.id === fieldId);
          if (field) {
            Object.assign(field, updates);
          }
        }
      }),

    // Branding actions
    setBranding: (branding) =>
      set((state) => {
        Object.assign(state.template.branding, branding);
      }),

    setLogoUrl: (url) =>
      set((state) => {
        state.template.branding.logoUrl = url;
      }),

    setHeaderColor: (color) =>
      set((state) => {
        state.template.branding.headerColor = color;
      }),

    setFont: (font) =>
      set((state) => {
        state.template.branding.font = font;
      }),

    setCoverImage: (url) =>
      set((state) => {
        state.template.branding.coverImage = url;
      }),

    setFooterText: (text) =>
      set((state) => {
        state.template.branding.footerText = text;
      }),

    // Settings actions
    setSettings: (settings) =>
      set((state) => {
        Object.assign(state.template.settings, settings);
      }),

    // UI actions
    setView: (view) =>
      set((state) => {
        state.ui.view = view;
      }),

    setSelectedSection: (sectionId) =>
      set((state) => {
        state.ui.selectedSectionId = sectionId;
      }),

    toggleSectionExpanded: (sectionId) =>
      set((state) => {
        if (state.ui.expandedSections.has(sectionId)) {
          state.ui.expandedSections.delete(sectionId);
        } else {
          state.ui.expandedSections.add(sectionId);
        }
      }),

    setDragging: (isDragging) =>
      set((state) => {
        state.ui.isDragging = isDragging;
      }),

    setShowCustomSectionModal: (show) =>
      set((state) => {
        state.ui.showCustomSectionModal = show;
      }),

    setShowBrandingPanel: (show) =>
      set((state) => {
        state.ui.showBrandingPanel = show;
      }),

    // Reset actions
    resetTemplate: () =>
      set((state) => {
        state.template = {
          name: '',
          description: '',
          sections: [],
          branding: { ...defaultBranding },
          settings: { ...defaultSettings },
        };
        state.ui.selectedSectionId = null;
        state.ui.expandedSections.clear();
      }),

    loadTemplate: (template) =>
      set((state) => {
        state.template = {
          ...state.template,
          ...template,
          branding: { ...defaultBranding, ...template.branding },
          settings: { ...defaultSettings, ...template.settings },
        };
      }),

    // Validation
    validateTemplate: () => {
      const errors: string[] = [];
      const { template } = get();

      // Validate template name
      if (!template.name.trim()) {
        errors.push('Template name is required');
      } else if (template.name.length > 100) {
        errors.push('Template name must be 100 characters or less');
      }

      // Validate sections
      if (template.sections.length === 0) {
        errors.push('Template must have at least one section');
      }

      // Validate section names are unique
      const sectionNames = new Set<string>();
      for (const section of template.sections) {
        if (sectionNames.has(section.name)) {
          errors.push(`Section "${section.name}" is duplicated`);
        }
        sectionNames.add(section.name);

        // Validate section fields
        for (const field of section.fields) {
          if (!field.label.trim()) {
            errors.push(`Field in section "${section.name}" is missing a label`);
          }
        }
      }

      // Validate header color
      if (!/^#[0-9A-Fa-f]{6}$/.test(template.branding.headerColor)) {
        errors.push('Header color must be a valid hex color');
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
  }))
);

/**
 * Color palette options for header colors
 */
export const HEADER_COLOR_PRESETS = [
  { name: 'Navy Blue', value: '#1e40af' },
  { name: 'Royal Blue', value: '#2563eb' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Dark Red', value: '#991b1b' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Dark Gray', value: '#374151' },
  { name: 'Black', value: '#000000' },
  { name: 'Slate', value: '#475569' },
];

/**
 * Font options with display names
 */
export const FONT_OPTIONS = [
  { value: TemplateFont.INTER, label: 'Inter' },
  { value: TemplateFont.ROBOTO, label: 'Roboto' },
  { value: TemplateFont.OPEN_SANS, label: 'Open Sans' },
  { value: TemplateFont.LATO, label: 'Lato' },
];
