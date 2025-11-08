/**
 * Chart Renderer (V2)
 * Integrates Chart.js for professional data visualization
 * Supports 6 chart types with professional styling
 */

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'radar';

  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
      fill?: boolean;
      tension?: number; // For line charts
    }>;
  };

  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        display?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
      title?: {
        display?: boolean;
        text?: string;
      };
      tooltip?: {
        enabled?: boolean;
      };
    };
    scales?: {
      x?: {
        display?: boolean;
        grid?: { display?: boolean };
      };
      y?: {
        display?: boolean;
        grid?: { display?: boolean };
        beginAtZero?: boolean;
      };
    };
  };
}

export interface ChartTheme {
  name: string;
  colors: string[]; // Color palette for datasets
  gridColor: string;
  textColor: string;
  backgroundColor: string;
}

/**
 * Chart Renderer
 * Generates Chart.js configurations and HTML/JS for data visualization
 */
export class ChartRenderer {
  // Professional color palettes for charts
  private themes: Record<string, ChartTheme> = {
    corporate: {
      name: 'Corporate',
      colors: [
        '#1A365D', // Deep blue
        '#2B6CB0', // Sky blue
        '#4299E1', // Light blue
        '#63B3ED', // Lighter blue
        '#90CDF4', // Pale blue
        '#BEE3F8'  // Very pale blue
      ],
      gridColor: 'rgba(0, 0, 0, 0.1)',
      textColor: '#1F2937',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    tech: {
      name: 'Tech',
      colors: [
        '#6B21A8', // Deep purple
        '#9333EA', // Vivid purple
        '#A855F7', // Light purple
        '#C084FC', // Lighter purple
        '#E9D5FF', // Pale purple
        '#10B981'  // Emerald accent
      ],
      gridColor: 'rgba(107, 33, 168, 0.1)',
      textColor: '#111827',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    creative: {
      name: 'Creative',
      colors: [
        '#DC2626', // Red
        '#FB923C', // Orange
        '#FBBF24', // Yellow
        '#34D399', // Green
        '#60A5FA', // Blue
        '#A78BFA'  // Purple
      ],
      gridColor: 'rgba(0, 0, 0, 0.1)',
      textColor: '#1F2937',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    finance: {
      name: 'Finance',
      colors: [
        '#065F46', // Forest green
        '#10B981', // Emerald
        '#34D399', // Light green
        '#6EE7B7', // Pale green
        '#A7F3D0', // Very pale green
        '#F59E0B'  // Gold accent
      ],
      gridColor: 'rgba(6, 95, 70, 0.1)',
      textColor: '#111827',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }
  };

  /**
   * Generate Chart.js configuration
   */
  generateConfig(
    chartConfig: ChartConfig,
    themeName: string = 'corporate'
  ): ChartConfig {
    const theme = this.themes[themeName] || this.themes.corporate;

    // Apply theme colors to datasets
    const datasets = chartConfig.data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || (
        chartConfig.type === 'pie' || chartConfig.type === 'doughnut'
          ? theme.colors
          : theme.colors[index % theme.colors.length]
      ),
      borderColor: dataset.borderColor || theme.colors[index % theme.colors.length],
      borderWidth: dataset.borderWidth || 2,
      fill: dataset.fill !== undefined ? dataset.fill : false,
      tension: dataset.tension || (chartConfig.type === 'line' ? 0.4 : 0)
    }));

    // Default professional options
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            font: {
              size: 14,
              family: "'Open Sans', sans-serif"
            },
            padding: 12,
            color: theme.textColor
          }
        },
        title: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14,
            family: "'Open Sans', sans-serif"
          },
          bodyFont: {
            size: 12,
            family: "'Open Sans', sans-serif"
          },
          padding: 12,
          cornerRadius: 4
        }
      },
      scales: chartConfig.type !== 'pie' && chartConfig.type !== 'doughnut' ? {
        x: {
          display: true,
          grid: {
            display: false,
            color: theme.gridColor
          },
          ticks: {
            font: {
              size: 12,
              family: "'Open Sans', sans-serif"
            },
            color: theme.textColor
          }
        },
        y: {
          display: true,
          grid: {
            display: true,
            color: theme.gridColor
          },
          ticks: {
            font: {
              size: 12,
              family: "'Open Sans', sans-serif"
            },
            color: theme.textColor
          },
          beginAtZero: true
        }
      } : undefined
    };

    return {
      ...chartConfig,
      data: {
        ...chartConfig.data,
        datasets
      },
      options: {
        ...defaultOptions,
        ...chartConfig.options
      }
    };
  }

  /**
   * Generate HTML for chart
   */
  generateHTML(
    chartId: string,
    chartConfig: ChartConfig,
    width: number = 800,
    height: number = 400
  ): string {
    return `
<div class="chart-container" style="position: relative; width: ${width}px; height: ${height}px; margin: 0 auto;">
  <canvas id="${chartId}"></canvas>
</div>`;
  }

  /**
   * Generate JavaScript for chart initialization
   */
  generateJS(
    chartId: string,
    chartConfig: ChartConfig,
    themeName: string = 'corporate'
  ): string {
    const config = this.generateConfig(chartConfig, themeName);

    return `
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
<script>
(function() {
  const ctx = document.getElementById('${chartId}').getContext('2d');
  new Chart(ctx, ${JSON.stringify(config, null, 2)});
})();
</script>`;
  }

  /**
   * Generate complete chart HTML with script
   */
  generateComplete(
    chartId: string,
    chartConfig: ChartConfig,
    themeName: string = 'corporate',
    width: number = 800,
    height: number = 400
  ): string {
    return `
${this.generateHTML(chartId, chartConfig, width, height)}
${this.generateJS(chartId, chartConfig, themeName)}`;
  }

  /**
   * Validate chart data
   */
  validateChartData(chartConfig: ChartConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if data exists
    if (!chartConfig.data || !chartConfig.data.labels || !chartConfig.data.datasets) {
      errors.push('Chart data is incomplete (missing labels or datasets)');
      return { valid: false, errors, warnings };
    }

    // Check labels
    if (chartConfig.data.labels.length === 0) {
      errors.push('Chart has no labels');
    }

    // Check datasets
    if (chartConfig.data.datasets.length === 0) {
      errors.push('Chart has no datasets');
    }

    // Validate each dataset
    chartConfig.data.datasets.forEach((dataset, index) => {
      if (!dataset.data || dataset.data.length === 0) {
        errors.push(`Dataset ${index} has no data`);
      }

      if (dataset.data.length !== chartConfig.data.labels.length) {
        warnings.push(
          `Dataset ${index} data length (${dataset.data.length}) ` +
          `doesn't match labels length (${chartConfig.data.labels.length})`
        );
      }

      // Check for non-numeric data
      const hasNonNumeric = dataset.data.some(val => typeof val !== 'number');
      if (hasNonNumeric) {
        errors.push(`Dataset ${index} contains non-numeric values`);
      }
    });

    // Chart type specific validation
    if (chartConfig.type === 'pie' || chartConfig.type === 'doughnut') {
      if (chartConfig.data.datasets.length > 1) {
        warnings.push(`${chartConfig.type} charts typically use only one dataset`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get available themes
   */
  getThemes(): ChartTheme[] {
    return Object.values(this.themes);
  }

  /**
   * Get theme by name
   */
  getTheme(name: string): ChartTheme | undefined {
    return this.themes[name];
  }

  /**
   * Extract chart data from text (AI-assisted)
   */
  async extractChartDataFromText(text: string): Promise<ChartConfig | null> {
    // This would use Gemini to extract structured data from text
    // For now, return null (implement later with Gemini integration)
    return null;
  }

  /**
   * Suggest chart type based on data
   */
  suggestChartType(data: {
    labels: string[];
    datasetCount: number;
    hasTimeData: boolean;
    hasCategoricalData: boolean;
  }): ChartConfig['type'] {
    // Time series data → line chart
    if (data.hasTimeData) {
      return 'line';
    }

    // Single dataset with categories → pie/doughnut
    if (data.datasetCount === 1 && data.hasCategoricalData && data.labels.length <= 8) {
      return 'doughnut';
    }

    // Multiple datasets → bar chart
    if (data.datasetCount > 1) {
      return 'bar';
    }

    // Default: bar chart
    return 'bar';
  }

  /**
   * Create sample chart for testing
   */
  createSampleChart(type: ChartConfig['type']): ChartConfig {
    const samples: Record<ChartConfig['type'], ChartConfig> = {
      bar: {
        type: 'bar',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Revenue',
              data: [65, 59, 80, 81]
            },
            {
              label: 'Profit',
              data: [28, 48, 40, 55]
            }
          ]
        }
      },
      line: {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Growth',
              data: [12, 19, 25, 32, 38, 45],
              fill: true
            }
          ]
        }
      },
      pie: {
        type: 'pie',
        data: {
          labels: ['Product A', 'Product B', 'Product C', 'Product D'],
          datasets: [
            {
              label: 'Market Share',
              data: [35, 28, 22, 15]
            }
          ]
        }
      },
      doughnut: {
        type: 'doughnut',
        data: {
          labels: ['Desktop', 'Mobile', 'Tablet'],
          datasets: [
            {
              label: 'Traffic',
              data: [55, 35, 10]
            }
          ]
        }
      },
      scatter: {
        type: 'scatter',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Correlation',
              data: [10, 20, 30, 25, 15, 35] as any
            }
          ]
        }
      },
      radar: {
        type: 'radar',
        data: {
          labels: ['Speed', 'Quality', 'Cost', 'Reliability', 'Support'],
          datasets: [
            {
              label: 'Product A',
              data: [80, 90, 70, 85, 75]
            },
            {
              label: 'Product B',
              data: [70, 85, 85, 80, 80]
            }
          ]
        }
      }
    };

    return samples[type];
  }
}

// Singleton instance
export const chartRenderer = new ChartRenderer();
