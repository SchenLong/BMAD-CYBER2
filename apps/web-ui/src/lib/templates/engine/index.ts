/**
 * Template Engine Index
 * Story 7.5: Template Rendering Engine
 */

// Main renderer
export {
  TemplateRenderer,
  getTemplateRenderer,
  renderTemplate,
  exportTemplate,
} from './template-renderer'

// Data mapper
export {
  mapDataFromOutput,
  createTemplateMapping,
  expandArrayData,
  validateOutputFields,
  getValueWithFallbacks,
  flattenObject,
} from './data-mapper'

// Cache
export {
  RenderCache,
  getRenderCache,
  resetRenderCache,
  memoizeRender,
  DEFAULT_CACHE_CONFIG,
} from '../cache/render-cache'
