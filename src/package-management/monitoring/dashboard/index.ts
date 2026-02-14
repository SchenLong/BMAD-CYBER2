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

// Widget Components - Mock implementations for TypeScript
export class MetricCardWidget {}
export class LineChartWidget {}
export class StatusIndicatorWidget {}
export class GaugeWidget {}
export class TableWidget {}
export class HeatmapWidget {}
export class TimelineWidget {}

// Dashboard Utilities - Mock implementations for TypeScript
export class DashboardBuilder {}
export class WidgetFactory {}
export class ThemeManager {}
export class ExportManager {}
export class LayoutManager {}

// Visualization Libraries Integration - Mock implementations for TypeScript
export class ChartJSIntegration {}
export class D3Integration {}
export class PlotlyIntegration {}

// Constants and Presets
export const DASHBOARD_CONSTANTS = {
  DEFAULT_REFRESH_INTERVAL: 30000,
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

export const TIME_RANGE_PRESETS = {
  LAST_HOUR: { label: 'Last Hour', duration: 3600000, granularity: '1m' },
  LAST_4_HOURS: { label: 'Last 4 Hours', duration: 14400000, granularity: '5m' },
  LAST_24_HOURS: { label: 'Last 24 Hours', duration: 86400000, granularity: '15m' },
  LAST_7_DAYS: { label: 'Last 7 Days', duration: 604800000, granularity: '1h' },
  LAST_30_DAYS: { label: 'Last 30 Days', duration: 2592000000, granularity: '6h' },
  LAST_90_DAYS: { label: 'Last 90 Days', duration: 7776000000, granularity: '1d' }
} as const;

export const METRIC_FORMATTERS = {
  PERCENTAGE: (value: number): string => `${value.toFixed(1)}%`,
  BYTES: (value: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    return `${value.toFixed(1)} ${units[i]}`;
  },
  DURATION: (value: number): string => {
    if (value < 1000) return `${value}ms`;
    if (value < 60000) return `${(value / 1000).toFixed(1)}s`;
    if (value < 3600000) return `${(value / 60000).toFixed(1)}m`;
    return `${(value / 3600000).toFixed(1)}h`;
  },
  NUMBER: (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  },
  CURRENCY: (value: number): string => `$${value.toFixed(2)}`,
  RATE: (value: number): string => `${value.toFixed(2)}/s`
} as const;
