/**
 * BMAD Matrix Visualization Engine
 * Epic 2: Package Management System - Story 2.4
 *
 * Advanced visualization engine for compatibility matrices with interactive charts,
 * heatmaps, network graphs, and real-time data exploration capabilities.
 *
 * @version 2.4.0
 * @author BMAD Development Team
 * @license MIT
 * @security OWASP A+ Compliant
 */

const crypto = require('crypto');
const EventEmitter = require('events');

/**
 * Matrix Visualization Engine
 * Creates interactive visualizations for compatibility matrix data
 */
class MatrixVisualization extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            // Visualization configuration
            visualization: {
                theme: options.theme || 'professional', // professional, modern, classic, dark
                colorScheme: options.colorScheme || 'compatibility', // compatibility, security, performance
                interactivity: options.interactivity !== false,
                animations: options.animations !== false,
                exportFormats: options.exportFormats || ['svg', 'png', 'pdf', 'json']
            },

            // Chart configuration
            charts: {
                defaultWidth: options.defaultWidth || 800,
                defaultHeight: options.defaultHeight || 600,
                margin: options.margin || { top: 40, right: 40, bottom: 40, left: 40 },
                fontSize: options.fontSize || 12,
                fontFamily: options.fontFamily || 'Arial, sans-serif'
            },

            // Heatmap configuration
            heatmap: {
                cellSize: options.cellSize || 30,
                cellSpacing: options.cellSpacing || 2,
                showLabels: options.showLabels !== false,
                showValues: options.showValues !== false,
                gradientSteps: options.gradientSteps || 10
            },

            // Network graph configuration
            network: {
                nodeSize: options.nodeSize || 10,
                linkStrength: options.linkStrength || 0.5,
                chargeStrength: options.chargeStrength || -300,
                simulation: options.simulation !== false,
                clustering: options.clustering !== false
            }
        };

        // Color palettes
        this.colorPalettes = {
            compatibility: {
                high: '#4CAF50',      // Green for high compatibility
                medium: '#FF9800',    // Orange for medium compatibility
                low: '#F44336',       // Red for low compatibility
                none: '#9E9E9E',      // Gray for no data
                gradient: ['#F44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50']
            },
            security: {
                secure: '#4CAF50',
                warning: '#FF9800',
                critical: '#F44336',
                unknown: '#9E9E9E',
                gradient: ['#F44336', '#FF5722', '#FF9800', '#FFC107', '#4CAF50']
            },
            performance: {
                fast: '#4CAF50',
                moderate: '#FF9800',
                slow: '#F44336',
                unknown: '#9E9E9E',
                gradient: ['#F44336', '#FF9800', '#FFEB3B', '#CDDC39', '#4CAF50']
            },
            modern: {
                primary: '#6366F1',
                secondary: '#8B5CF6',
                accent: '#06B6D4',
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                gradient: ['#EF4444', '#F59E0B', '#FBBF24', '#34D399', '#10B981']
            }
        };

        // Visualization templates
        this.templates = {
            // Executive dashboard template
            executive: {
                layout: 'grid',
                components: [
                    { type: 'summary_cards', position: { x: 0, y: 0, w: 4, h: 1 } },
                    { type: 'compatibility_heatmap', position: { x: 0, y: 1, w: 2, h: 2 } },
                    { type: 'trend_chart', position: { x: 2, y: 1, w: 2, h: 1 } },
                    { type: 'risk_distribution', position: { x: 2, y: 2, w: 2, h: 1 } }
                ]
            },

            // Technical analysis template
            technical: {
                layout: 'tabs',
                tabs: [
                    {
                        name: 'Compatibility Matrix',
                        components: [
                            { type: 'detailed_heatmap', position: { x: 0, y: 0, w: 4, h: 3 } },
                            { type: 'filters', position: { x: 4, y: 0, w: 1, h: 3 } }
                        ]
                    },
                    {
                        name: 'Dependency Network',
                        components: [
                            { type: 'network_graph', position: { x: 0, y: 0, w: 4, h: 3 } },
                            { type: 'network_controls', position: { x: 4, y: 0, w: 1, h: 3 } }
                        ]
                    },
                    {
                        name: 'Timeline Analysis',
                        components: [
                            { type: 'timeline_chart', position: { x: 0, y: 0, w: 5, h: 2 } },
                            { type: 'version_details', position: { x: 0, y: 2, w: 5, h: 1 } }
                        ]
                    }
                ]
            },

            // Security focus template
            security: {
                layout: 'grid',
                components: [
                    { type: 'security_overview', position: { x: 0, y: 0, w: 4, h: 1 } },
                    { type: 'vulnerability_heatmap', position: { x: 0, y: 1, w: 2, h: 2 } },
                    { type: 'security_trends', position: { x: 2, y: 1, w: 2, h: 1 } },
                    { type: 'risk_packages', position: { x: 2, y: 2, w: 2, h: 1 } }
                ]
            }
        };

        // Chart generators
        this.chartGenerators = new Map();
        this.initializeChartGenerators();
    }

    /**
     * Initialize chart generators
     */
    initializeChartGenerators() {
        // Heatmap generator
        this.chartGenerators.set('heatmap', (data, options) => {
            return this.generateHeatmapSVG(data, options);
        });

        // Network graph generator
        this.chartGenerators.set('network', (data, options) => {
            return this.generateNetworkSVG(data, options);
        });

        // Timeline chart generator
        this.chartGenerators.set('timeline', (data, options) => {
            return this.generateTimelineSVG(data, options);
        });

        // Bar chart generator
        this.chartGenerators.set('bar_chart', (data, options) => {
            return this.generateBarChartSVG(data, options);
        });

        // Line chart generator
        this.chartGenerators.set('line_chart', (data, options) => {
            return this.generateLineChartSVG(data, options);
        });

        // Pie chart generator
        this.chartGenerators.set('pie_chart', (data, options) => {
            return this.generatePieChartSVG(data, options);
        });

        // Scatter plot generator
        this.chartGenerators.set('scatter_plot', (data, options) => {
            return this.generateScatterPlotSVG(data, options);
        });
    }

    /**
     * Generate comprehensive visualization suite
     * @param {Object} matrixData - Compatibility matrix data
     * @param {Object} options - Visualization options
     * @returns {Object} Complete visualization suite
     */
    async generateVisualizationSuite(matrixData, options = {}) {
        const visualizationId = crypto.randomUUID();

        try {
            this.emit('visualization:started', { visualizationId, matrixId: matrixData.id });

            const suite = {
                id: visualizationId,
                matrixId: matrixData.id,
                generatedAt: new Date().toISOString(),
                template: options.template || 'technical',

                // Core visualizations
                heatmap: await this.generateCompatibilityHeatmap(matrixData, options),
                network: await this.generateDependencyNetwork(matrixData, options),
                timeline: await this.generateVersionTimeline(matrixData, options),

                // Analysis charts
                charts: {
                    compatibilityDistribution: await this.generateCompatibilityDistribution(matrixData, options),
                    securityAnalysis: await this.generateSecurityAnalysis(matrixData, options),
                    performanceAnalysis: await this.generatePerformanceAnalysis(matrixData, options),
                    trendAnalysis: await this.generateTrendAnalysis(matrixData, options)
                },

                // Interactive components
                interactive: {
                    filters: this.generateFilterControls(matrixData),
                    search: this.generateSearchInterface(matrixData),
                    drillDown: this.generateDrillDownInterface(matrixData)
                },

                // Dashboard layouts
                dashboards: {
                    executive: await this.generateExecutiveDashboard(matrixData, options),
                    technical: await this.generateTechnicalDashboard(matrixData, options),
                    security: await this.generateSecurityDashboard(matrixData, options)
                },

                // Export data
                exports: {
                    svg: await this.generateSVGExports(matrixData, options),
                    png: await this.generatePNGExports(matrixData, options),
                    pdf: await this.generatePDFExports(matrixData, options),
                    json: this.generateJSONExport(matrixData),
                    csv: this.generateCSVExport(matrixData)
                },

                // Metadata
                metadata: {
                    theme: this.config.visualization.theme,
                    colorScheme: this.config.visualization.colorScheme,
                    chartCount: 0, // Will be calculated
                    totalElements: 0, // Will be calculated
                    interactivityEnabled: this.config.visualization.interactivity
                }
            };

            // Calculate metadata
            suite.metadata.chartCount = this.countCharts(suite);
            suite.metadata.totalElements = this.countElements(suite);

            this.emit('visualization:completed', {
                visualizationId,
                matrixId: matrixData.id,
                chartCount: suite.metadata.chartCount
            });

            return suite;

        } catch (error) {
            this.emit('visualization:error', {
                visualizationId,
                matrixId: matrixData.id,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Generate compatibility heatmap
     * @param {Object} matrixData - Matrix data
     * @param {Object} options - Heatmap options
     * @returns {Object} Heatmap visualization
     */
    async generateCompatibilityHeatmap(matrixData, options = {}) {
        const heatmapData = this.prepareHeatmapData(matrixData);
        const palette = this.colorPalettes[this.config.visualization.colorScheme];

        const svg = this.generateHeatmapSVG(heatmapData, {
            width: options.width || this.config.charts.defaultWidth,
            height: options.height || this.config.charts.defaultHeight,
            colorPalette: palette,
            showLabels: options.showLabels !== false,
            showLegend: options.showLegend !== false,
            cellSpacing: this.config.heatmap.cellSpacing,
            fontSize: this.config.charts.fontSize
        });

        return {
            type: 'heatmap',
            title: 'Package Compatibility Matrix',
            data: heatmapData,
            svg: svg,
            interactive: this.config.visualization.interactivity ? {
                onClick: 'showPackageDetails',
                onHover: 'showCompatibilityScore',
                zoom: true,
                pan: true
            } : null,
            metadata: {
                packages: heatmapData.packages.length,
                environments: heatmapData.environments.length,
                maxCompatibility: Math.max(...heatmapData.values.flat()),
                minCompatibility: Math.min(...heatmapData.values.flat())
            }
        };
    }

    /**
     * Generate dependency network visualization
     * @param {Object} matrixData - Matrix data
     * @param {Object} options - Network options
     * @returns {Object} Network visualization
     */
    async generateDependencyNetwork(matrixData, options = {}) {
        const networkData = this.prepareDependencyNetworkData(matrixData);

        const svg = this.generateNetworkSVG(networkData, {
            width: options.width || this.config.charts.defaultWidth,
            height: options.height || this.config.charts.defaultHeight,
            nodeSize: this.config.network.nodeSize,
            linkStrength: this.config.network.linkStrength,
            showLabels: options.showLabels !== false,
            clustering: this.config.network.clustering
        });

        return {
            type: 'network',
            title: 'Package Dependency Network',
            data: networkData,
            svg: svg,
            interactive: this.config.visualization.interactivity ? {
                onClick: 'showNodeDetails',
                onHover: 'highlightConnections',
                drag: true,
                zoom: true
            } : null,
            metadata: {
                nodes: networkData.nodes.length,
                links: networkData.links.length,
                clusters: networkData.clusters.length,
                maxDegree: Math.max(...networkData.nodes.map(n => n.degree))
            }
        };
    }

    /**
     * Generate version timeline visualization
     * @param {Object} matrixData - Matrix data
     * @param {Object} options - Timeline options
     * @returns {Object} Timeline visualization
     */
    async generateVersionTimeline(matrixData, options = {}) {
        const timelineData = this.prepareTimelineData(matrixData);

        const svg = this.generateTimelineSVG(timelineData, {
            width: options.width || this.config.charts.defaultWidth * 1.5,
            height: options.height || this.config.charts.defaultHeight,
            showMilestones: options.showMilestones !== false,
            showVersions: options.showVersions !== false,
            timeRange: options.timeRange || 'auto'
        });

        return {
            type: 'timeline',
            title: 'Package Version Timeline',
            data: timelineData,
            svg: svg,
            interactive: this.config.visualization.interactivity ? {
                onClick: 'showVersionDetails',
                onHover: 'showReleaseInfo',
                brush: true,
                zoom: true
            } : null,
            metadata: {
                packages: timelineData.packages.length,
                timeRange: timelineData.timeRange,
                majorReleases: timelineData.milestones.filter(m => m.type === 'major').length,
                securityUpdates: timelineData.milestones.filter(m => m.type === 'security').length
            }
        };
    }

    /**
     * Generate compatibility distribution chart
     * @param {Object} matrixData - Matrix data
     * @param {Object} options - Chart options
     * @returns {Object} Distribution chart
     */
    async generateCompatibilityDistribution(matrixData, options = {}) {
        const distributionData = this.prepareDistributionData(matrixData);

        const svg = this.generateBarChartSVG(distributionData, {
            width: options.width || this.config.charts.defaultWidth * 0.7,
            height: options.height || this.config.charts.defaultHeight * 0.7,
            title: 'Compatibility Score Distribution',
            xLabel: 'Compatibility Score Range',
            yLabel: 'Number of Package-Environment Combinations',
            colorPalette: this.colorPalettes[this.config.visualization.colorScheme]
        });

        return {
            type: 'bar_chart',
            title: 'Compatibility Distribution',
            data: distributionData,
            svg: svg,
            insights: this.analyzeDistribution(distributionData),
            metadata: {
                totalCombinations: distributionData.values.reduce((sum, val) => sum + val, 0),
                averageCompatibility: distributionData.averageScore,
                highCompatibilityPercentage: distributionData.highCompatibilityPercentage
            }
        };
    }

    /**
     * Generate security analysis visualization
     * @param {Object} matrixData - Matrix data
     * @param {Object} options - Chart options
     * @returns {Object} Security analysis chart
     */
    async generateSecurityAnalysis(matrixData, options = {}) {
        const securityData = this.prepareSecurityData(matrixData);

        const charts = {
            vulnerabilityHeatmap: this.generateHeatmapSVG(securityData.vulnerabilityMatrix, {
                title: 'Security Vulnerability Heatmap',
                colorPalette: this.colorPalettes.security,
                width: this.config.charts.defaultWidth * 0.8,
                height: this.config.charts.defaultHeight * 0.6
            }),

            riskDistribution: this.generatePieChartSVG(securityData.riskDistribution, {
                title: 'Security Risk Distribution',
                colorPalette: this.colorPalettes.security,
                width: this.config.charts.defaultWidth * 0.6,
                height: this.config.charts.defaultHeight * 0.6
            }),

            vulnerabilityTrends: this.generateLineChartSVG(securityData.vulnerabilityTrends, {
                title: 'Vulnerability Trends Over Time',
                xLabel: 'Time',
                yLabel: 'Number of Vulnerabilities',
                width: this.config.charts.defaultWidth * 0.8,
                height: this.config.charts.defaultHeight * 0.5
            })
        };

        return {
            type: 'security_analysis',
            title: 'Security Analysis Dashboard',
            charts: charts,
            data: securityData,
            alerts: this.generateSecurityAlerts(securityData),
            recommendations: this.generateSecurityRecommendations(securityData),
            metadata: {
                totalVulnerabilities: securityData.totalVulnerabilities,
                criticalPackages: securityData.criticalPackages.length,
                securityScore: securityData.overallSecurityScore
            }
        };
    }

    /**
     * Generate executive dashboard
     * @param {Object} matrixData - Matrix data
     * @param {Object} options - Dashboard options
     * @returns {Object} Executive dashboard
     */
    async generateExecutiveDashboard(matrixData, options = {}) {
        const template = this.templates.executive;

        const dashboard = {
            type: 'executive_dashboard',
            title: 'Package Compatibility Executive Summary',
            layout: template.layout,
            components: {},
            summary: this.generateExecutiveSummary(matrixData),
            kpis: this.generateKPIs(matrixData)
        };

        // Generate each component
        for (const component of template.components) {
            dashboard.components[component.type] = await this.generateDashboardComponent(
                component.type,
                matrixData,
                { position: component.position, ...options }
            );
        }

        return dashboard;
    }

    /**
     * Generate heatmap SVG
     * @param {Object} data - Heatmap data
     * @param {Object} options - SVG options
     * @returns {string} SVG markup
     */
    generateHeatmapSVG(data, options = {}) {
        const {
            width = 800,
            height = 600,
            colorPalette = this.colorPalettes.compatibility,
            showLabels = true,
            showLegend = true,
            cellSpacing = 2,
            fontSize = 12
        } = options;

        const margin = this.config.charts.margin;
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        const cellWidth = (plotWidth - (data.columns.length - 1) * cellSpacing) / data.columns.length;
        const cellHeight = (plotHeight - (data.rows.length - 1) * cellSpacing) / data.rows.length;

        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

        // Add styles
        svg += `<style>
            .heatmap-cell { stroke: #fff; stroke-width: 1; }
            .heatmap-label { font-family: ${this.config.charts.fontFamily}; font-size: ${fontSize}px; text-anchor: middle; }
            .heatmap-title { font-family: ${this.config.charts.fontFamily}; font-size: ${fontSize + 4}px; font-weight: bold; text-anchor: middle; }
        </style>`;

        // Title
        if (options.title) {
            svg += `<text x="${width / 2}" y="20" class="heatmap-title">${options.title}</text>`;
        }

        // Create color scale
        const minValue = Math.min(...data.values.flat());
        const maxValue = Math.max(...data.values.flat());
        const colorScale = this.createColorScale(minValue, maxValue, colorPalette.gradient);

        // Draw heatmap cells
        let g = `<g transform="translate(${margin.left}, ${margin.top})">`;

        for (let i = 0; i < data.rows.length; i++) {
            for (let j = 0; j < data.columns.length; j++) {
                const value = data.values[i][j];
                const color = this.getColor(value, colorScale);
                const x = j * (cellWidth + cellSpacing);
                const y = i * (cellHeight + cellSpacing);

                g += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}"
                      fill="${color}" class="heatmap-cell"
                      data-row="${data.rows[i]}" data-col="${data.columns[j]}" data-value="${value}">`;

                if (this.config.visualization.interactivity) {
                    g += `<title>${data.rows[i]} × ${data.columns[j]}: ${value.toFixed(2)}</title>`;
                }

                g += `</rect>`;

                // Add value labels if requested
                if (options.showValues && cellWidth > 30 && cellHeight > 20) {
                    g += `<text x="${x + cellWidth / 2}" y="${y + cellHeight / 2 + 4}" class="heatmap-label" fill="${this.getContrastColor(color)}">
                          ${value.toFixed(2)}
                          </text>`;
                }
            }
        }

        g += '</g>';
        svg += g;

        // Add axis labels
        if (showLabels) {
            // Row labels
            let rowLabels = `<g transform="translate(${margin.left - 10}, ${margin.top})">`;
            for (let i = 0; i < data.rows.length; i++) {
                const y = i * (cellHeight + cellSpacing) + cellHeight / 2;
                rowLabels += `<text x="0" y="${y + 4}" class="heatmap-label" text-anchor="end">${data.rows[i]}</text>`;
            }
            rowLabels += '</g>';
            svg += rowLabels;

            // Column labels
            let colLabels = `<g transform="translate(${margin.left}, ${margin.top - 10})">`;
            for (let j = 0; j < data.columns.length; j++) {
                const x = j * (cellWidth + cellSpacing) + cellWidth / 2;
                colLabels += `<text x="${x}" y="0" class="heatmap-label" transform="rotate(-45, ${x}, 0)">${data.columns[j]}</text>`;
            }
            colLabels += '</g>';
            svg += colLabels;
        }

        // Add legend
        if (showLegend) {
            const legendWidth = 200;
            const legendHeight = 20;
            const legendX = width - margin.right - legendWidth;
            const legendY = height - margin.bottom + 10;

            svg += this.generateColorLegend(legendX, legendY, legendWidth, legendHeight, colorScale, minValue, maxValue);
        }

        svg += '</svg>';
        return svg;
    }

    /**
     * Generate network SVG
     * @param {Object} data - Network data
     * @param {Object} options - SVG options
     * @returns {string} SVG markup
     */
    generateNetworkSVG(data, options = {}) {
        const {
            width = 800,
            height = 600,
            nodeSize = 10,
            showLabels = true
        } = options;

        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

        // Add styles
        svg += `<style>
            .network-node { stroke: #fff; stroke-width: 2; }
            .network-link { stroke: #999; stroke-opacity: 0.6; }
            .network-label { font-family: ${this.config.charts.fontFamily}; font-size: 10px; text-anchor: middle; pointer-events: none; }
        </style>`;

        // Position nodes using force layout simulation (simplified)
        const positions = this.calculateNetworkLayout(data.nodes, data.links, width, height);

        // Draw links
        let links = '<g class="links">';
        for (const link of data.links) {
            const source = positions[link.source];
            const target = positions[link.target];
            const strokeWidth = Math.sqrt(link.value || 1);

            links += `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}"
                      class="network-link" stroke-width="${strokeWidth}"/>`;
        }
        links += '</g>';
        svg += links;

        // Draw nodes
        let nodes = '<g class="nodes">';
        for (let i = 0; i < data.nodes.length; i++) {
            const node = data.nodes[i];
            const pos = positions[i];
            const radius = nodeSize * (node.size || 1);
            const color = node.color || this.colorPalettes[this.config.visualization.colorScheme].primary;

            nodes += `<circle cx="${pos.x}" cy="${pos.y}" r="${radius}" fill="${color}" class="network-node">`;

            if (this.config.visualization.interactivity) {
                nodes += `<title>${node.id}: ${node.group || 'Package'}</title>`;
            }

            nodes += '</circle>';

            // Add labels
            if (showLabels) {
                nodes += `<text x="${pos.x}" y="${pos.y + radius + 12}" class="network-label">${node.id}</text>`;
            }
        }
        nodes += '</g>';
        svg += nodes;

        svg += '</svg>';
        return svg;
    }

    /**
     * Prepare heatmap data from matrix
     * @param {Object} matrixData - Matrix data
     * @returns {Object} Formatted heatmap data
     */
    prepareHeatmapData(matrixData) {
        const packages = Array.from(matrixData.compatibility.packageMatrix.keys());
        const environments = new Set();

        // Collect all environments
        for (const [packageName, packageMatrix] of matrixData.compatibility.packageMatrix) {
            for (const [version, environmentMatrix] of packageMatrix) {
                for (const [environment] of environmentMatrix) {
                    environments.add(environment);
                }
            }
        }

        const envArray = Array.from(environments);
        const values = [];

        // Build compatibility matrix
        for (const packageName of packages) {
            const packageMatrix = matrixData.compatibility.packageMatrix.get(packageName);
            const packageRow = [];

            for (const env of envArray) {
                let maxCompatibility = 0;

                // Find highest compatibility across all versions for this environment
                for (const [version, environmentMatrix] of packageMatrix) {
                    const compatibility = environmentMatrix.get(env);
                    if (compatibility && compatibility.score > maxCompatibility) {
                        maxCompatibility = compatibility.score;
                    }
                }

                packageRow.push(maxCompatibility);
            }

            values.push(packageRow);
        }

        return {
            rows: packages,
            columns: envArray,
            values: values
        };
    }

    /**
     * Create color scale for values
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {Array} colors - Color gradient
     * @returns {Function} Color scale function
     */
    createColorScale(min, max, colors) {
        const range = max - min;
        const steps = colors.length - 1;

        return (value) => {
            if (value <= min) return colors[0];
            if (value >= max) return colors[colors.length - 1];

            const normalizedValue = (value - min) / range;
            const stepIndex = Math.floor(normalizedValue * steps);
            const stepProgress = (normalizedValue * steps) - stepIndex;

            if (stepIndex >= steps) return colors[colors.length - 1];

            // Interpolate between colors
            return this.interpolateColor(colors[stepIndex], colors[stepIndex + 1], stepProgress);
        };
    }

    /**
     * Interpolate between two colors
     * @param {string} color1 - First color (hex)
     * @param {string} color2 - Second color (hex)
     * @param {number} factor - Interpolation factor (0-1)
     * @returns {string} Interpolated color
     */
    interpolateColor(color1, color2, factor) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);

        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

        return this.rgbToHex(r, g, b);
    }

    /**
     * Convert hex to RGB
     * @param {string} hex - Hex color
     * @returns {Object} RGB object
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to hex
     * @param {number} r - Red component
     * @param {number} g - Green component
     * @param {number} b - Blue component
     * @returns {string} Hex color
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Get contrasting color for text
     * @param {string} backgroundColor - Background color
     * @returns {string} Contrasting text color
     */
    getContrastColor(backgroundColor) {
        const rgb = this.hexToRgb(backgroundColor);
        if (!rgb) return '#000000';

        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    /**
     * Get current visualization metrics
     * @returns {Object} Visualization metrics
     */
    getMetrics() {
        return {
            version: '2.4.0',
            activeVisualizations: 0, // Would track active visualizations
            supportedChartTypes: Array.from(this.chartGenerators.keys()),
            colorPalettes: Object.keys(this.colorPalettes),
            templates: Object.keys(this.templates),
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { MatrixVisualization };