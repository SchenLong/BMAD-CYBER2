/**
 * EPIC 2 PACKAGE MANAGEMENT - DASHBOARD MODULE EXPORTS
 * Unified exports for health monitoring dashboard system
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.5
 */

// Core Dashboard Components
export {
  InteractiveHealthDashboard,
  default as HealthDashboard
} from './health-dashboard';

// Dashboard Configuration Interfaces
export type {
  DashboardConfig,
  VisualizationConfig,
  TimeRangeConfig,
  TimeRangeOption,
  LayoutConfig,
  GridPosition,
  GridSize,
  StyleConfig,
  ColorPalette,
  StatusColors,
  GradientConfig,
  FontConfig,
  BorderConfig,
  SpacingConfig,
  AnimationConfig,
  TransitionConfig,
  InteractionConfig,
  HoverConfig,
  TooltipConfig,
  HighlightConfig,
  ClickConfig,
  ClickAction,
  ZoomConfig,
  PanConfig,
  SelectionConfig,
  BrushConfig,
  AggregationConfig,
  AlertDisplayConfig,
  AlertGroupingConfig,
  AlertFilterConfig,
  NotificationConfig,
  EmailNotificationConfig,
  ThemeConfig,
  ThemeDefinition,
  ColorScheme,
  FontScheme,
  SpacingScheme,
  ExportConfig,
  ExportFormat,
  ExportQuality,
  SchedulingConfig,
  RealTimeConfig,
  WebSocketConfig,
  FilterConfig,
  FilterOption
} from './health-dashboard';

// Dashboard State Interfaces
export type {
  DashboardState,
  DashboardData,
  LayoutState,
  WidgetState,
  DashboardWidget,
  WidgetComponent,
  TimeRange
} from './health-dashboard';

// Type Definitions
export type {
  VisualizationType,
  AggregationFunction,
  FilterType,
  AlertSeverity
} from './health-dashboard';

// Widget Components
export { MetricCardWidget } from './widgets/metric-card';
export { LineChartWidget } from './widgets/line-chart';
export { StatusIndicatorWidget } from './widgets/status-indicator';
export { GaugeWidget } from './widgets/gauge';
export { TableWidget } from './widgets/table';
export { HeatmapWidget } from './widgets/heatmap';
export { TimelineWidget } from './widgets/timeline';

// Dashboard Utilities
export { DashboardBuilder } from './utils/dashboard-builder';
export { WidgetFactory } from './utils/widget-factory';
export { ThemeManager } from './utils/theme-manager';
export { ExportManager } from './utils/export-manager';
export { LayoutManager } from './utils/layout-manager';

// Visualization Libraries Integration
export { ChartJSIntegration } from './integrations/chartjs';
export { D3Integration } from './integrations/d3';
export { PlotlyIntegration } from './integrations/plotly';

// Constants and Presets
export const DASHBOARD_CONSTANTS = {
  DEFAULT_REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_WIDGETS_PER_DASHBOARD: 50,
  DEFAULT_GRID_COLUMNS: 12,
  DEFAULT_WIDGET_HEIGHT: 4,
  MIN_WIDGET_WIDTH: 2,
  MIN_WIDGET_HEIGHT: 2,
  MAX_ALERT_DISPLAY: 10,
  EXPORT_TIMEOUT: 30000,
  WEBSOCKET_RECONNECT_DELAY: 5000,
  ANIMATION_DURATION: 300,
  TOOLTIP_DELAY: 500
} as const;

export const WIDGET_TYPES = {
  METRIC_CARD: 'metric_card',
  LINE_CHART: 'line_chart',
  AREA_CHART: 'area_chart',
  BAR_CHART: 'bar_chart',
  PIE_CHART: 'pie_chart',
  GAUGE: 'gauge',
  HEATMAP: 'heatmap',
  TABLE: 'table',
  STATUS_INDICATOR: 'status_indicator',
  TIMELINE: 'timeline',
  NETWORK_GRAPH: 'network_graph',
  TREE_MAP: 'tree_map',
  SANKEY: 'sankey',
  RADAR_CHART: 'radar_chart',
  SCATTER_PLOT: 'scatter_plot'
} as const;

export const CHART_COLORS = {
  PRIMARY: '#007acc',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',
  GRADIENT_BLUE: ['#007acc', '#0056b3'],
  GRADIENT_GREEN: ['#28a745', '#1e7e34'],
  GRADIENT_RED: ['#dc3545', '#bd2130'],
  STATUS_PALETTE: {
    healthy: '#28a745',
    warning: '#ffc107',
    critical: '#dc3545',
    unknown: '#6c757d',
    degraded: '#fd7e14'
  }
} as const;

export const DEFAULT_THEMES = {
  LIGHT: {
    name: 'light',
    colors: {
      background: '#ffffff',
      surface: '#f8f9fa',
      primary: '#007acc',
      secondary: '#6c757d',
      accent: '#17a2b8',
      text: '#212529',
      border: '#dee2e6'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Georgia, serif',
      monospace: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      }
    },
    spacing: {
      unit: 4,
      scale: [0, 4, 8, 16, 24, 32, 48, 64, 96, 128]
    }
  },
  DARK: {
    name: 'dark',
    colors: {
      background: '#1a1a1a',
      surface: '#2d2d2d',
      primary: '#4da6ff',
      secondary: '#999999',
      accent: '#66d9ff',
      text: '#ffffff',
      border: '#404040'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Georgia, serif',
      monospace: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      }
    },
    spacing: {
      unit: 4,
      scale: [0, 4, 8, 16, 24, 32, 48, 64, 96, 128]
    }
  }
} as const;

export const PREDEFINED_LAYOUTS = {
  OVERVIEW: {
    name: 'System Overview',
    description: 'High-level system health overview',
    widgets: [
      { type: 'metric_card', position: { x: 0, y: 0 }, size: { width: 3, height: 2 } },
      { type: 'status_indicator', position: { x: 3, y: 0 }, size: { width: 3, height: 2 } },
      { type: 'gauge', position: { x: 6, y: 0 }, size: { width: 3, height: 2 } },
      { type: 'line_chart', position: { x: 0, y: 2 }, size: { width: 6, height: 4 } },
      { type: 'table', position: { x: 6, y: 2 }, size: { width: 6, height: 4 } }
    ]
  },
  PERFORMANCE: {
    name: 'Performance Monitoring',
    description: 'Detailed performance metrics and trends',
    widgets: [
      { type: 'line_chart', position: { x: 0, y: 0 }, size: { width: 6, height: 3 } },
      { type: 'area_chart', position: { x: 6, y: 0 }, size: { width: 6, height: 3 } },
      { type: 'heatmap', position: { x: 0, y: 3 }, size: { width: 6, height: 3 } },
      { type: 'gauge', position: { x: 6, y: 3 }, size: { width: 3, height: 3 } },
      { type: 'metric_card', position: { x: 9, y: 3 }, size: { width: 3, height: 3 } }
    ]
  },
  SECURITY: {
    name: 'Security Dashboard',
    description: 'Security metrics and compliance status',
    widgets: [
      { type: 'status_indicator', position: { x: 0, y: 0 }, size: { width: 4, height: 2 } },
      { type: 'pie_chart', position: { x: 4, y: 0 }, size: { width: 4, height: 2 } },
      { type: 'bar_chart', position: { x: 8, y: 0 }, size: { width: 4, height: 2 } },
      { type: 'timeline', position: { x: 0, y: 2 }, size: { width: 8, height: 3 } },
      { type: 'table', position: { x: 8, y: 2 }, size: { width: 4, height: 3 } }
    ]
  },
  ALERTS: {
    name: 'Alert Management',
    description: 'Alert status and incident tracking',
    widgets: [
      { type: 'metric_card', position: { x: 0, y: 0 }, size: { width: 3, height: 2 } },
      { type: 'timeline', position: { x: 3, y: 0 }, size: { width: 9, height: 2 } },
      { type: 'table', position: { x: 0, y: 2 }, size: { width: 12, height: 4 } }
    ]
  }
} as const;

export const TIME_RANGE_PRESETS = {
  LAST_HOUR: { label: 'Last Hour', duration: 3600000, granularity: '1m' },
  LAST_4_HOURS: { label: 'Last 4 Hours', duration: 14400000, granularity: '5m' },
  LAST_24_HOURS: { label: 'Last 24 Hours', duration: 86400000, granularity: '15m' },
  LAST_7_DAYS: { label: 'Last 7 Days', duration: 604800000, granularity: '1h' },
  LAST_30_DAYS: { label: 'Last 30 Days', duration: 2592000000, granularity: '6h' },
  LAST_90_DAYS: { label: 'Last 90 Days', duration: 7776000000, granularity: '1d' }
} as const;

export const METRIC_FORMATTERS = {
  PERCENTAGE: (value: number) => `${value.toFixed(1)}%`,
  BYTES: (value: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    return `${value.toFixed(1)} ${units[i]}`;
  },
  DURATION: (value: number) => {
    if (value < 1000) return `${value}ms`;
    if (value < 60000) return `${(value / 1000).toFixed(1)}s`;
    if (value < 3600000) return `${(value / 60000).toFixed(1)}m`;
    return `${(value / 3600000).toFixed(1)}h`;
  },
  NUMBER: (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  },
  CURRENCY: (value: number) => `$${value.toFixed(2)}`,
  RATE: (value: number) => `${value.toFixed(2)}/s`
} as const;

// Helper Functions
export const createDefaultDashboardConfig = (): DashboardConfig => ({
  refreshInterval: DASHBOARD_CONSTANTS.DEFAULT_REFRESH_INTERVAL,
  retentionPeriod: 86400000, // 24 hours
  visualizations: [],
  alerts: {
    maxVisible: DASHBOARD_CONSTANTS.MAX_ALERT_DISPLAY,
    autoHide: true,
    hideDelay: 5000,
    grouping: {
      enabled: true,
      by: ['category', 'severity'],
      maxPerGroup: 3
    },
    filtering: {
      severities: ['warning', 'critical'],
      categories: [],
      timeRange: 3600000
    },
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
      email: {
        enabled: false,
        recipients: [],
        template: 'default',
        throttle: 300000
      }
    }
  },
  themes: {
    default: 'light',
    available: [DEFAULT_THEMES.LIGHT, DEFAULT_THEMES.DARK],
    customizable: true
  },
  export: {
    formats: [
      { type: 'png', mimeType: 'image/png', extension: '.png', options: {} },
      { type: 'pdf', mimeType: 'application/pdf', extension: '.pdf', options: {} },
      { type: 'json', mimeType: 'application/json', extension: '.json', options: {} }
    ],
    quality: {
      dpi: 300,
      compression: 0.8,
      vectorized: true
    },
    scheduling: {
      enabled: false,
      frequencies: ['daily', 'weekly', 'monthly'],
      recipients: [],
      template: 'standard'
    }
  },
  realTime: {
    enabled: true,
    updateInterval: 5000,
    bufferSize: 1000,
    compression: true,
    websocket: {
      url: 'ws://localhost:8080/dashboard',
      reconnect: true,
      maxRetries: 5,
      retryDelay: DASHBOARD_CONSTANTS.WEBSOCKET_RECONNECT_DELAY
    }
  },
  filters: [
    {
      id: 'timeRange',
      type: 'select',
      field: 'timeRange',
      label: 'Time Range',
      options: Object.entries(TIME_RANGE_PRESETS).map(([key, preset]) => ({
        label: preset.label,
        value: key.toLowerCase()
      }))
    },
    {
      id: 'severity',
      type: 'multiselect',
      field: 'severity',
      label: 'Alert Severity',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Critical', value: 'critical' }
      ]
    },
    {
      id: 'component',
      type: 'multiselect',
      field: 'component',
      label: 'Components',
      options: [
        { label: 'System', value: 'system' },
        { label: 'Application', value: 'application' },
        { label: 'Database', value: 'database' },
        { label: 'Network', value: 'network' },
        { label: 'Security', value: 'security' }
      ]
    }
  ]
});

export const createVisualizationConfig = (
  id: string,
  type: VisualizationType,
  overrides: Partial<VisualizationConfig> = {}
): VisualizationConfig => ({
  id,
  type,
  title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Widget`,
  metrics: [],
  timeRange: {
    default: { start: Date.now() - 3600000, end: Date.now() },
    options: Object.values(TIME_RANGE_PRESETS),
    customEnabled: true,
    autoRefresh: true
  },
  layout: {
    position: { x: 0, y: 0 },
    size: { width: 4, height: 3 },
    responsive: true,
    resizable: true,
    draggable: true
  },
  style: {
    colors: {
      primary: Object.values(CHART_COLORS.GRADIENT_BLUE),
      secondary: Object.values(CHART_COLORS.GRADIENT_GREEN),
      accent: Object.values(CHART_COLORS.GRADIENT_RED),
      status: CHART_COLORS.STATUS_PALETTE,
      gradients: [
        { name: 'blue', colors: CHART_COLORS.GRADIENT_BLUE, direction: '45deg' },
        { name: 'green', colors: CHART_COLORS.GRADIENT_GREEN, direction: '45deg' }
      ]
    },
    fonts: {
      family: DEFAULT_THEMES.LIGHT.fonts.primary,
      sizes: { small: 12, medium: 14, large: 16 },
      weights: { normal: 400, bold: 600 },
      lineHeights: { normal: 1.4, heading: 1.2 }
    },
    borders: {
      radius: 8,
      width: 1,
      style: 'solid',
      colors: { default: '#dee2e6', focus: '#007acc' }
    },
    spacing: {
      padding: 16,
      margin: 8,
      gap: 12
    },
    animations: {
      duration: DASHBOARD_CONSTANTS.ANIMATION_DURATION,
      easing: 'ease-in-out',
      enabled: true,
      transitions: [
        { property: 'opacity', duration: 200, easing: 'ease-out' },
        { property: 'transform', duration: 300, easing: 'ease-in-out' }
      ]
    }
  },
  interactions: {
    hover: {
      enabled: true,
      tooltip: {
        enabled: true,
        template: 'default',
        position: 'auto',
        delay: DASHBOARD_CONSTANTS.TOOLTIP_DELAY
      },
      highlight: {
        enabled: true,
        color: '#007acc',
        opacity: 0.1
      }
    },
    click: {
      enabled: true,
      actions: []
    },
    zoom: {
      enabled: true,
      minLevel: 0.1,
      maxLevel: 10,
      wheelSensitivity: 1
    },
    pan: {
      enabled: true,
      direction: 'both',
      momentum: true
    },
    selection: {
      enabled: true,
      mode: 'single',
      brush: {
        enabled: false,
        color: '#007acc',
        opacity: 0.2
      }
    }
  },
  aggregation: {
    function: 'avg',
    window: '5m',
    alignment: 'start'
  },
  ...overrides
});