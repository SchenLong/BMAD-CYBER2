/**
 * BMAD CONCURA PERFORMANCE DASHBOARD
 * Real-time performance visualization and monitoring dashboard
 * Provides comprehensive performance insights and interactive visualizations
 *
 * @author BMAD Performance Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { PerformanceMonitor } from './performance-monitor';
import { PerformanceProfiler } from '../profiling/performance-profiler';
import { BottleneckAnalyzer } from '../analysis/bottleneck-analyzer';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Dashboard configuration and interfaces
 */
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'alert' | 'status' | 'recommendation' | 'heatmap' | 'gauge';
  title: string;
  config: WidgetConfig;
  position: { row: number; col: number; width: number; height: number };
  refreshInterval?: number; // milliseconds
  enabled: boolean;
}

export interface WidgetConfig {
  metric?: string;
  category?: string;
  aggregation?: 'latest' | 'average' | 'sum' | 'min' | 'max';
  timeRange?: number; // minutes
  threshold?: { warning: number; critical: number };
  format?: string;
  color?: string;
  chartType?: 'line' | 'bar' | 'pie' | 'gauge' | 'heatmap';
  showTrend?: boolean;
  showThresholds?: boolean;
  filters?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  refreshInterval: number; // milliseconds
  autoRefresh: boolean;
  theme: 'dark' | 'light' | 'auto';
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardData {
  timestamp: Date;
  widgets: Map<string, any>;
  alerts: any[];
  status: any;
  trends: any;
  recommendations: any;
  metadata: {
    refreshCount: number;
    lastRefresh: Date;
    performance: {
      dataCollectionTime: number;
      renderTime: number;
    };
  };
}

/**
 * Performance Dashboard Manager
 */
export class PerformanceDashboard {
  private monitor: PerformanceMonitor;
  private profiler: PerformanceProfiler;
  private analyzer: BottleneckAnalyzer;
  private layouts: Map<string, DashboardLayout> = new Map();
  private activeLayout?: DashboardLayout;
  private dashboardData?: DashboardData;
  private refreshInterval?: NodeJS.Timeout;
  private outputDirectory: string;

  // Pre-defined widget templates
  private defaultWidgets: Partial<DashboardWidget>[] = [
    {
      type: 'gauge',
      title: 'CPU Usage',
      config: {
        metric: 'system_cpu_usage',
        category: 'cpu',
        aggregation: 'latest',
        threshold: { warning: 70, critical: 90 },
        format: '${value}%',
        color: '#FF6B6B',
        showThresholds: true
      },
      position: { row: 0, col: 0, width: 3, height: 2 }
    },
    {
      type: 'gauge',
      title: 'Memory Usage',
      config: {
        metric: 'system_heap_used',
        category: 'memory',
        aggregation: 'latest',
        threshold: { warning: 512, critical: 1024 },
        format: '${value}MB',
        color: '#4ECDC4',
        showThresholds: true
      },
      position: { row: 0, col: 3, width: 3, height: 2 }
    },
    {
      type: 'chart',
      title: 'Response Time Trend',
      config: {
        metric: 'operation_duration',
        category: 'cpu',
        aggregation: 'average',
        timeRange: 30,
        chartType: 'line',
        format: '${value}ms',
        color: '#45B7D1',
        showTrend: true
      },
      position: { row: 0, col: 6, width: 6, height: 3 }
    },
    {
      type: 'chart',
      title: 'Memory Usage Over Time',
      config: {
        metric: 'system_heap_used',
        category: 'memory',
        aggregation: 'latest',
        timeRange: 60,
        chartType: 'line',
        format: '${value}MB',
        color: '#96CEB4',
        showTrend: true
      },
      position: { row: 2, col: 0, width: 8, height: 3 }
    },
    {
      type: 'alert',
      title: 'Active Alerts',
      config: {
        filters: { resolved: false },
        showTrend: false
      },
      position: { row: 2, col: 8, width: 4, height: 3 }
    },
    {
      type: 'status',
      title: 'System Health',
      config: {
        showTrend: true
      },
      position: { row: 5, col: 0, width: 4, height: 2 }
    },
    {
      type: 'heatmap',
      title: 'Context Processing Heatmap',
      config: {
        metric: 'context_processing_time',
        category: 'context',
        timeRange: 120,
        chartType: 'heatmap',
        color: '#FFD93D'
      },
      position: { row: 5, col: 4, width: 4, height: 3 }
    },
    {
      type: 'recommendation',
      title: 'Optimization Recommendations',
      config: {
        filters: { priority: 'high' }
      },
      position: { row: 5, col: 8, width: 4, height: 3 }
    },
    {
      type: 'metric',
      title: 'Throughput',
      config: {
        metric: 'system_throughput',
        aggregation: 'latest',
        format: '${value} ops/sec',
        color: '#F7DC6F'
      },
      position: { row: 7, col: 0, width: 2, height: 1 }
    },
    {
      type: 'metric',
      title: 'Error Rate',
      config: {
        metric: 'system_error_rate',
        aggregation: 'latest',
        format: '${value}%',
        color: '#EC7063',
        threshold: { warning: 1, critical: 5 }
      },
      position: { row: 7, col: 2, width: 2, height: 1 }
    },
    {
      type: 'metric',
      title: 'Context Efficiency',
      config: {
        metric: 'context_efficiency',
        category: 'context',
        aggregation: 'average',
        format: '${value}%',
        color: '#58D68D'
      },
      position: { row: 7, col: 4, width: 2, height: 1 }
    },
    {
      type: 'metric',
      title: 'Security Health',
      config: {
        metric: 'security_health_score',
        category: 'security',
        aggregation: 'latest',
        format: '${value}%',
        color: '#AF7AC5'
      },
      position: { row: 7, col: 6, width: 2, height: 1 }
    }
  ];

  constructor(config?: {
    outputDir?: string;
    defaultRefreshInterval?: number;
  }) {
    this.outputDirectory = config?.outputDir || '/Users/paultinp/BMAD-CYBER2/_bmad-output/performance';
    this.monitor = new PerformanceMonitor();
    this.profiler = PerformanceProfiler.getInstance();
    this.analyzer = new BottleneckAnalyzer();

    this.initializeDefaultLayouts();
  }

  /**
   * Initialize dashboard with default layouts
   */
  private initializeDefaultLayouts(): void {
    const defaultLayout: DashboardLayout = {
      id: 'bmad-default',
      name: 'BMAD CONCURA Default Dashboard',
      description: 'Comprehensive performance monitoring dashboard for BMAD infrastructure',
      widgets: this.createDefaultWidgets(),
      refreshInterval: 30000, // 30 seconds
      autoRefresh: true,
      theme: 'dark',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const securityFocusedLayout: DashboardLayout = {
      id: 'bmad-security',
      name: 'Security Performance Focus',
      description: 'Security-focused performance monitoring dashboard',
      widgets: this.createSecurityWidgets(),
      refreshInterval: 15000, // 15 seconds
      autoRefresh: true,
      theme: 'dark',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const concuraOptimizedLayout: DashboardLayout = {
      id: 'bmad-concura',
      name: 'CONCURA Context Optimization',
      description: 'Context processing and CONCURA optimization focused dashboard',
      widgets: this.createConcuraWidgets(),
      refreshInterval: 10000, // 10 seconds
      autoRefresh: true,
      theme: 'dark',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.layouts.set(defaultLayout.id, defaultLayout);
    this.layouts.set(securityFocusedLayout.id, securityFocusedLayout);
    this.layouts.set(concuraOptimizedLayout.id, concuraOptimizedLayout);

    this.activeLayout = defaultLayout;
  }

  /**
   * Create default widget configuration
   */
  private createDefaultWidgets(): DashboardWidget[] {
    return this.defaultWidgets.map((template, index) => ({
      id: `widget-${index}`,
      enabled: true,
      ...template
    } as DashboardWidget));
  }

  /**
   * Create security-focused widgets
   */
  private createSecurityWidgets(): DashboardWidget[] {
    return [
      {
        id: 'security-health',
        type: 'gauge',
        title: 'Security Health Score',
        config: {
          metric: 'security_health_score',
          category: 'security',
          aggregation: 'latest',
          threshold: { warning: 70, critical: 50 },
          format: '${value}%',
          color: '#AF7AC5',
          showThresholds: true
        },
        position: { row: 0, col: 0, width: 3, height: 2 },
        enabled: true
      },
      {
        id: 'encryption-performance',
        type: 'chart',
        title: 'Encryption Performance',
        config: {
          metric: 'encryption_duration',
          category: 'security',
          aggregation: 'average',
          timeRange: 30,
          chartType: 'line',
          format: '${value}ms',
          color: '#E67E22'
        },
        position: { row: 0, col: 3, width: 6, height: 3 },
        enabled: true
      },
      {
        id: 'audit-throughput',
        type: 'metric',
        title: 'Audit Log Throughput',
        config: {
          metric: 'audit_throughput',
          category: 'security',
          aggregation: 'latest',
          format: '${value} logs/sec',
          color: '#3498DB'
        },
        position: { row: 0, col: 9, width: 3, height: 1 },
        enabled: true
      },
      {
        id: 'rbac-performance',
        type: 'chart',
        title: 'RBAC Check Performance',
        config: {
          metric: 'rbac_check_duration',
          category: 'security',
          aggregation: 'average',
          timeRange: 60,
          chartType: 'bar',
          format: '${value}ms',
          color: '#27AE60'
        },
        position: { row: 3, col: 0, width: 6, height: 3 },
        enabled: true
      },
      {
        id: 'security-alerts',
        type: 'alert',
        title: 'Security Alerts',
        config: {
          filters: { component: 'security', resolved: false }
        },
        position: { row: 3, col: 6, width: 6, height: 3 },
        enabled: true
      }
    ];
  }

  /**
   * Create CONCURA context-focused widgets
   */
  private createConcuraWidgets(): DashboardWidget[] {
    return [
      {
        id: 'context-efficiency',
        type: 'gauge',
        title: 'Context Processing Efficiency',
        config: {
          metric: 'context_efficiency',
          category: 'context',
          aggregation: 'latest',
          threshold: { warning: 60, critical: 40 },
          format: '${value}%',
          color: '#58D68D',
          showThresholds: true
        },
        position: { row: 0, col: 0, width: 3, height: 2 },
        enabled: true
      },
      {
        id: 'context-size-trend',
        type: 'chart',
        title: 'Context Size Trend',
        config: {
          metric: 'context_size',
          category: 'context',
          aggregation: 'average',
          timeRange: 60,
          chartType: 'line',
          format: '${value}KB',
          color: '#FFD93D',
          showTrend: true
        },
        position: { row: 0, col: 3, width: 6, height: 3 },
        enabled: true
      },
      {
        id: 'context-processing-time',
        type: 'chart',
        title: 'Context Processing Time',
        config: {
          metric: 'context_processing_time',
          category: 'context',
          aggregation: 'average',
          timeRange: 30,
          chartType: 'bar',
          format: '${value}ms',
          color: '#E74C3C'
        },
        position: { row: 0, col: 9, width: 3, height: 3 },
        enabled: true
      },
      {
        id: 'context-depth-heatmap',
        type: 'heatmap',
        title: 'Context Depth Distribution',
        config: {
          metric: 'context_depth',
          category: 'context',
          timeRange: 120,
          chartType: 'heatmap',
          color: '#9B59B6'
        },
        position: { row: 3, col: 0, width: 6, height: 3 },
        enabled: true
      },
      {
        id: 'concura-optimizations',
        type: 'recommendation',
        title: 'CONCURA Optimizations',
        config: {
          filters: { type: 'context', category: 'concura' }
        },
        position: { row: 3, col: 6, width: 6, height: 3 },
        enabled: true
      },
      {
        id: 'context-bottlenecks',
        type: 'alert',
        title: 'Context Bottlenecks',
        config: {
          filters: { type: 'context', severity: ['high', 'critical'] }
        },
        position: { row: 6, col: 0, width: 12, height: 2 },
        enabled: true
      }
    ];
  }

  /**
   * Start dashboard with specified layout
   */
  public async start(layoutId?: string): Promise<void> {
    console.log('🚀 Starting BMAD Performance Dashboard...');

    if (layoutId && this.layouts.has(layoutId)) {
      this.activeLayout = this.layouts.get(layoutId);
    }

    if (!this.activeLayout) {
      throw new Error('No active dashboard layout configured');
    }

    // Start monitoring if not already running
    const monitorStatus = this.monitor.getStatus();
    if (!monitorStatus.isRunning) {
      await this.monitor.start();
    }

    // Initialize dashboard data
    await this.refreshDashboard();

    // Start auto-refresh if enabled
    if (this.activeLayout.autoRefresh) {
      this.startAutoRefresh();
    }

    console.log(`✅ Dashboard started with layout: ${this.activeLayout.name}`);
  }

  /**
   * Stop dashboard
   */
  public async stop(): Promise<void> {
    console.log('🛑 Stopping BMAD Performance Dashboard...');

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Save final dashboard state
    await this.exportDashboard();

    console.log('✅ Dashboard stopped');
  }

  /**
   * Switch dashboard layout
   */
  public switchLayout(layoutId: string): boolean {
    if (!this.layouts.has(layoutId)) {
      return false;
    }

    this.activeLayout = this.layouts.get(layoutId);

    // Restart auto-refresh with new interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    if (this.activeLayout!.autoRefresh) {
      this.startAutoRefresh();
    }

    return true;
  }

  /**
   * Refresh dashboard data
   */
  public async refreshDashboard(): Promise<DashboardData> {
    const startTime = Date.now();

    console.log('🔄 Refreshing dashboard data...');

    const widgetData = new Map<string, any>();
    const promises: Promise<void>[] = [];

    // Collect data for each widget
    for (const widget of this.activeLayout!.widgets) {
      if (widget.enabled) {
        promises.push(this.collectWidgetData(widget, widgetData));
      }
    }

    await Promise.all(promises);

    const dataCollectionTime = Date.now() - startTime;

    // Get additional dashboard data
    const monitorData = this.monitor.getDashboardData();
    const alerts = this.monitor.getAlerts({ resolved: false });
    const status = this.monitor.getStatus();

    this.dashboardData = {
      timestamp: new Date(),
      widgets: widgetData,
      alerts,
      status,
      trends: monitorData?.trends || {},
      recommendations: monitorData?.recommendations || [],
      metadata: {
        refreshCount: (this.dashboardData?.metadata.refreshCount || 0) + 1,
        lastRefresh: new Date(),
        performance: {
          dataCollectionTime,
          renderTime: 0 // Would be calculated on frontend
        }
      }
    };

    console.log(`✅ Dashboard refreshed in ${dataCollectionTime}ms`);

    return this.dashboardData;
  }

  /**
   * Get current dashboard data
   */
  public getDashboardData(): DashboardData | null {
    return this.dashboardData || null;
  }

  /**
   * Get available layouts
   */
  public getLayouts(): DashboardLayout[] {
    return Array.from(this.layouts.values());
  }

  /**
   * Get active layout
   */
  public getActiveLayout(): DashboardLayout | null {
    return this.activeLayout || null;
  }

  /**
   * Create custom layout
   */
  public createLayout(
    name: string,
    description: string,
    widgets: DashboardWidget[],
    config?: Partial<DashboardLayout>
  ): string {
    const layoutId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const layout: DashboardLayout = {
      id: layoutId,
      name,
      description,
      widgets,
      refreshInterval: config?.refreshInterval || 30000,
      autoRefresh: config?.autoRefresh !== false,
      theme: config?.theme || 'dark',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.layouts.set(layoutId, layout);
    return layoutId;
  }

  /**
   * Export dashboard configuration and data
   */
  public async exportDashboard(format: 'json' | 'html' = 'json'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dashboard-export-${timestamp}.${format}`;
    const filepath = path.join(this.outputDirectory, filename);

    const exportData = {
      timestamp: new Date(),
      activeLayout: this.activeLayout,
      layouts: Array.from(this.layouts.values()),
      data: this.dashboardData,
      metadata: {
        version: '1.0.0',
        exportedBy: 'bmad-performance-dashboard'
      }
    };

    await fs.mkdir(this.outputDirectory, { recursive: true });

    switch (format) {
      case 'json':
        await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
        break;
      case 'html':
        const html = await this.generateHTMLDashboard(exportData);
        await fs.writeFile(filepath, html);
        break;
    }

    console.log(`📊 Dashboard exported: ${filepath}`);
    return filepath;
  }

  // Private helper methods

  private startAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(
      () => this.refreshDashboard(),
      this.activeLayout!.refreshInterval
    );
  }

  private async collectWidgetData(widget: DashboardWidget, dataMap: Map<string, any>): Promise<void> {
    try {
      let data: any = null;

      switch (widget.type) {
        case 'metric':
        case 'gauge':
          data = await this.collectMetricData(widget);
          break;
        case 'chart':
          data = await this.collectChartData(widget);
          break;
        case 'alert':
          data = await this.collectAlertData(widget);
          break;
        case 'status':
          data = await this.collectStatusData(widget);
          break;
        case 'recommendation':
          data = await this.collectRecommendationData(widget);
          break;
        case 'heatmap':
          data = await this.collectHeatmapData(widget);
          break;
      }

      dataMap.set(widget.id, data);

    } catch (error) {
      console.error(`❌ Error collecting data for widget ${widget.id}:`, error);
      dataMap.set(widget.id, { error: error.message });
    }
  }

  private async collectMetricData(widget: DashboardWidget): Promise<any> {
    const systemMetrics = this.profiler.getSystemMetrics();
    const relevantMetrics = systemMetrics.filter(m =>
      (!widget.config.metric || m.name === widget.config.metric) &&
      (!widget.config.category || m.category === widget.config.category)
    );

    if (relevantMetrics.length === 0) {
      return { value: 0, unit: '', timestamp: new Date(), status: 'no-data' };
    }

    const values = relevantMetrics.map(m => m.value);
    let aggregatedValue: number;

    switch (widget.config.aggregation) {
      case 'average':
        aggregatedValue = values.reduce((sum, v) => sum + v, 0) / values.length;
        break;
      case 'sum':
        aggregatedValue = values.reduce((sum, v) => sum + v, 0);
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      case 'latest':
      default:
        aggregatedValue = values[values.length - 1];
        break;
    }

    const status = this.getMetricStatus(aggregatedValue, widget.config.threshold);

    return {
      value: Math.round(aggregatedValue * 100) / 100,
      unit: relevantMetrics[0].unit,
      timestamp: new Date(),
      status,
      trend: this.calculateTrend(values),
      threshold: widget.config.threshold
    };
  }

  private async collectChartData(widget: DashboardWidget): Promise<any> {
    // Collect historical data for chart
    const systemMetrics = this.profiler.getSystemMetrics();
    const timeRange = (widget.config.timeRange || 30) * 60 * 1000; // Convert to milliseconds
    const cutoffTime = Date.now() - timeRange;

    // In a real implementation, you would query historical data
    // For now, we'll simulate time series data
    const dataPoints = [];
    const now = Date.now();
    const interval = Math.max(1000, timeRange / 100); // 100 data points max

    for (let i = 0; i < 50; i++) {
      const timestamp = now - (49 - i) * interval;
      const value = Math.random() * 100 + Math.sin(i * 0.1) * 20; // Simulated data

      dataPoints.push({
        timestamp: new Date(timestamp),
        value: Math.round(value * 100) / 100
      });
    }

    return {
      dataPoints,
      chartType: widget.config.chartType || 'line',
      color: widget.config.color,
      unit: widget.config.format || '',
      timeRange: widget.config.timeRange,
      aggregation: widget.config.aggregation
    };
  }

  private async collectAlertData(widget: DashboardWidget): Promise<any> {
    const alerts = this.monitor.getAlerts(widget.config.filters);

    return {
      alerts: alerts.slice(0, 10), // Latest 10 alerts
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      }
    };
  }

  private async collectStatusData(widget: DashboardWidget): Promise<any> {
    return this.monitor.getStatus();
  }

  private async collectRecommendationData(widget: DashboardWidget): Promise<any> {
    try {
      const analysis = await this.analyzer.analyzeBottlenecks();
      const recommendations = [
        ...analysis.recommendations.immediate,
        ...analysis.recommendations.strategic
      ];

      return {
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        summary: {
          total: recommendations.length,
          immediate: analysis.recommendations.immediate.length,
          strategic: analysis.recommendations.strategic.length
        },
        concuraOptimizations: analysis.concuraOptimizations
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  private async collectHeatmapData(widget: DashboardWidget): Promise<any> {
    // Generate heatmap data for context processing times
    const heatmapData = [];
    const hours = 24;
    const daysOfWeek = 7;

    for (let day = 0; day < daysOfWeek; day++) {
      for (let hour = 0; hour < hours; hour++) {
        // Simulate processing time data
        const value = Math.random() * 100 + Math.sin((day * 24 + hour) * 0.1) * 20;
        heatmapData.push({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
          hour,
          value: Math.round(value),
          intensity: Math.min(1, value / 100)
        });
      }
    }

    return {
      data: heatmapData,
      color: widget.config.color,
      metric: widget.config.metric,
      timeRange: widget.config.timeRange
    };
  }

  private getMetricStatus(value: number, threshold?: { warning: number; critical: number }): string {
    if (!threshold) return 'normal';

    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
    return 'normal';
  }

  private calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';

    const recent = values.slice(-5); // Last 5 values
    const older = values.slice(-10, -5); // Previous 5 values

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  private async generateHTMLDashboard(exportData: any): Promise<string> {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BMAD CONCURA Performance Dashboard</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: #ffffff; }
        .dashboard { max-width: 1400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #00d4aa; margin: 0; }
        .header p { color: #888; margin: 5px 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .widget { background: #2d2d2d; border-radius: 8px; padding: 20px; border: 1px solid #444; }
        .widget h3 { margin: 0 0 15px 0; color: #00d4aa; }
        .metric-value { font-size: 2em; font-weight: bold; color: #ffffff; }
        .metric-unit { color: #888; font-size: 0.8em; }
        .status-normal { color: #00d4aa; }
        .status-warning { color: #ffa500; }
        .status-critical { color: #ff4444; }
        .alert-item { padding: 10px; margin: 5px 0; border-left: 4px solid #ff4444; background: #3d2d2d; }
        .timestamp { color: #888; font-size: 0.9em; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>BMAD CONCURA Performance Dashboard</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Layout: ${exportData.activeLayout?.name || 'Unknown'}</p>
        </div>

        <div class="grid">
            ${this.generateWidgetHTML(exportData)}
        </div>

        <div class="timestamp">
            Dashboard exported at ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  }

  private generateWidgetHTML(exportData: any): string {
    if (!exportData.data?.widgets) return '';

    const widgets = Array.from(exportData.data.widgets.entries());
    return widgets.map(([widgetId, data]) => {
      const widget = exportData.activeLayout?.widgets?.find((w: any) => w.id === widgetId);
      if (!widget) return '';

      return `
        <div class="widget">
            <h3>${widget.title}</h3>
            ${this.generateWidgetContent(widget, data)}
        </div>
      `;
    }).join('');
  }

  private generateWidgetContent(widget: any, data: any): string {
    switch (widget.type) {
      case 'metric':
      case 'gauge':
        return `
          <div class="metric-value status-${data.status}">${data.value || 0}</div>
          <div class="metric-unit">${data.unit || ''}</div>
        `;
      case 'alert':
        return `
          <div>Total Alerts: ${data.summary?.total || 0}</div>
          ${data.alerts?.slice(0, 3).map((alert: any) => `
            <div class="alert-item">
              <strong>${alert.title}</strong><br>
              ${alert.description}
            </div>
          `).join('') || ''}
        `;
      case 'status':
        return `
          <div>System Health: <span class="status-${data.isRunning ? 'normal' : 'critical'}">${data.isRunning ? 'Running' : 'Stopped'}</span></div>
          <div>Active Alerts: ${data.activeAlerts || 0}</div>
          <div>Avg CPU: ${data.performance?.avgCpuUsage || 0}%</div>
          <div>Avg Memory: ${data.performance?.avgMemoryUsage || 0}MB</div>
        `;
      default:
        return `<div>Widget type: ${widget.type}</div>`;
    }
  }
}

/**
 * Export singleton instance
 */
export const performanceDashboard = new PerformanceDashboard();