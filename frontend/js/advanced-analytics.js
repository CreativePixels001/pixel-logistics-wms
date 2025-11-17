/**
 * Advanced Analytics Module - Phase 9 (Remaining 30%)
 * Chart export, drill-down, custom date ranges, and advanced visualizations
 */

class AdvancedAnalytics {
  constructor() {
    this.charts = {};
    this.drillDownData = {};
    this.dateRanges = {
      start: null,
      end: null,
      compareStart: null,
      compareEnd: null
    };
  }

  /**
   * Initialize advanced analytics features
   */
  init() {
    this.setupChartExport();
    this.setupDateRangePicker();
    this.initAdvancedCharts();
    this.setupChartClickHandlers();
  }

  /**
   * Setup chart export functionality
   */
  setupChartExport() {
    // Add export buttons to all chart cards
    const chartCards = document.querySelectorAll('.card:has(canvas)');
    
    chartCards.forEach(card => {
      const header = card.querySelector('.card-header');
      if (!header) return;

      // Check if export button already exists
      if (header.querySelector('.chart-export-btn')) return;

      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn btn-sm btn-secondary chart-export-btn';
      exportBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export
      `;
      exportBtn.style.marginLeft = 'auto';
      
      const canvas = card.querySelector('canvas');
      if (canvas) {
        exportBtn.addEventListener('click', () => {
          this.exportChartAsImage(canvas, header.querySelector('.card-title')?.textContent || 'chart');
        });
      }

      // Add to header
      if (!header.querySelector('.btn')) {
        header.appendChild(exportBtn);
      } else {
        header.querySelector('.card-title').insertAdjacentElement('afterend', exportBtn);
      }
    });
  }

  /**
   * Export chart as PNG image
   */
  exportChartAsImage(canvas, chartName) {
    if (!canvas) return;

    try {
      // Create download link
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${chartName.replace(/\s+/g, '_')}_${new Date().getTime()}.png`;
      link.href = url;
      link.click();

      if (window.notify) {
        notify.success('Chart exported successfully!', 3000);
      }
    } catch (error) {
      console.error('Export failed:', error);
      if (window.notify) {
        notify.error('Failed to export chart');
      }
    }
  }

  /**
   * Setup date range picker with modern dropdown
   */
  setupDateRangePicker() {
    const toggleBtn = document.getElementById('dateRangeToggle');
    const dropdown = document.getElementById('dateRangeDropdown');
    const dateStart = document.getElementById('dateRangeStart');
    const dateEnd = document.getElementById('dateRangeEnd');
    const applyBtn = document.getElementById('applyDateRange');
    const compareBtn = document.getElementById('comparePeriodBtn');
    const customRange = document.getElementById('customDateRange');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const label = document.getElementById('dateRangeLabel');

    if (!toggleBtn || !dropdown) return;

    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    if (dateStart) dateStart.value = thirtyDaysAgo.toISOString().split('T')[0];
    if (dateEnd) dateEnd.value = today.toISOString().split('T')[0];

    this.dateRanges.start = thirtyDaysAgo.toISOString().split('T')[0];
    this.dateRanges.end = today.toISOString().split('T')[0];

    // Toggle dropdown
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== toggleBtn) {
        dropdown.style.display = 'none';
      }
    });

    // Preset buttons
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const preset = btn.dataset.preset;
        
        if (preset === 'custom') {
          customRange.style.display = 'block';
        } else {
          customRange.style.display = 'none';
          
          const end = new Date();
          let start = new Date();

          switch(preset) {
            case '7':
              start.setDate(end.getDate() - 7);
              break;
            case '30':
              start.setDate(end.getDate() - 30);
              break;
            case '90':
              start.setDate(end.getDate() - 90);
              break;
            case 'today':
              start = new Date();
              break;
            case 'yesterday':
              start.setDate(end.getDate() - 1);
              end.setDate(end.getDate() - 1);
              break;
          }

          if (dateStart) dateStart.value = start.toISOString().split('T')[0];
          if (dateEnd) dateEnd.value = end.toISOString().split('T')[0];
        }
      });
    });

    // Apply button
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const start = dateStart?.value;
        const end = dateEnd?.value;

        if (!start || !end) {
          if (window.notify) notify.error('Please select both start and end dates');
          return;
        }

        if (new Date(start) > new Date(end)) {
          if (window.notify) notify.error('Start date must be before end date');
          return;
        }

        this.dateRanges.start = start;
        this.dateRanges.end = end;

        // Update label
        const activePreset = document.querySelector('.preset-btn.active');
        if (activePreset && activePreset.dataset.preset !== 'custom') {
          label.textContent = activePreset.textContent;
        } else {
          const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          label.textContent = `${startDate} - ${endDate}`;
        }

        dropdown.style.display = 'none';
        
        if (window.notify) {
          const hideLoader = notify.loading('Updating charts...');
          setTimeout(() => {
            hideLoader();
            notify.success('Date range applied successfully!');
            // Refresh all charts
            if (window.dashboardAnalytics) dashboardAnalytics.refreshCharts();
            if (window.reportsAnalytics) reportsAnalytics.refreshCharts();
          }, 800);
        }
      });
    }

    // Compare button
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        this.showComparePeriodModal();
        dropdown.style.display = 'none';
      });
    }
  }

  /**
   * Apply date range filter (legacy method - kept for compatibility)
   */
  applyDateRange() {
    const start = document.getElementById('dateRangeStart')?.value;
    const end = document.getElementById('dateRangeEnd')?.value;

    if (!start || !end) {
      if (window.notify) {
        notify.error('Please select both start and end dates');
      }
      return;
    }

    if (new Date(start) > new Date(end)) {
      if (window.notify) {
        notify.error('Start date must be before end date');
      }
      return;
    }

    this.dateRanges.start = start;
    this.dateRanges.end = end;

    if (window.notify) {
      const hideLoader = notify.loading('Updating charts...');
      setTimeout(() => {
        hideLoader();
        notify.success(`Date range applied: ${start} to ${end}`, 3000);
      }, 800);
    }

    // Refresh all charts with new date range
    this.refreshChartsWithDateRange(start, end);
  }

  /**
   * Show compare period modal
   */
  showComparePeriodModal() {
    if (window.notify) {
      notify.prompt(
        'Enter comparison period (e.g., "Previous Month", "Last Year")',
        (value) => {
          if (value) {
            notify.info(`Comparison period: ${value}`, 3000);
            this.enableComparisonMode(value);
          }
        },
        'Previous Month'
      );
    }
  }

  /**
   * Enable comparison mode
   */
  enableComparisonMode(period) {
    // Add comparison datasets to charts
    if (window.notify) {
      notify.success(`Comparison mode enabled: ${period}`, 4000);
    }
  }

  /**
   * Refresh charts with date range
   */
  refreshChartsWithDateRange(start, end) {
    // Update chart data based on date range
    // This would normally fetch from API
    console.log('Refreshing charts for period:', start, 'to', end);
  }

  /**
   * Initialize advanced chart types
   */
  initAdvancedCharts() {
    this.initScatterChart();
    this.initRadarChart();
    this.initGaugeCharts();
  }

  /**
   * Scatter Plot - Correlation Analysis
   */
  initScatterChart() {
    const ctx = document.getElementById('scatterChart');
    if (!ctx) return;

    const data = {
      datasets: [{
        label: 'Warehouse Efficiency',
        data: [
          { x: 85, y: 92 },
          { x: 78, y: 88 },
          { x: 92, y: 95 },
          { x: 88, y: 91 },
          { x: 75, y: 85 },
          { x: 95, y: 98 },
          { x: 82, y: 89 },
          { x: 90, y: 94 },
          { x: 87, y: 90 },
          { x: 80, y: 87 }
        ],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgb(0, 0, 0)',
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    };

    const config = {
      type: 'scatter',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: function(context) {
                return `Accuracy: ${context.parsed.x}%, Speed: ${context.parsed.y}%`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Picking Accuracy %'
            },
            min: 70,
            max: 100
          },
          y: {
            title: {
              display: true,
              text: 'Processing Speed %'
            },
            min: 80,
            max: 100
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            this.handleScatterClick(elements[0]);
          }
        }
      }
    };

    this.charts.scatter = new Chart(ctx, config);
  }

  /**
   * Radar Chart - Multi-dimensional Analysis
   */
  initRadarChart() {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;

    const data = {
      labels: ['Receiving', 'Put-away', 'Picking', 'Packing', 'Shipping', 'Quality'],
      datasets: [{
        label: 'This Week',
        data: [92, 88, 95, 90, 87, 94],
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }, {
        label: 'Last Week',
        data: [85, 82, 90, 88, 85, 89],
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        borderColor: 'rgb(107, 114, 128)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    };

    const config = {
      type: 'radar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        }
      }
    };

    this.charts.radar = new Chart(ctx, config);
  }

  /**
   * Gauge Charts - Real-time KPIs
   */
  initGaugeCharts() {
    const ctx = document.getElementById('gaugeChart');
    if (!ctx) return;

    // Create semi-doughnut for gauge effect
    const data = {
      labels: ['Performance', 'Remaining'],
      datasets: [{
        data: [87, 13],
        backgroundColor: [
          'rgba(0, 0, 0, 0.9)',
          'rgba(229, 231, 235, 0.3)'
        ],
        borderColor: [
          'rgb(0, 0, 0)',
          'rgb(209, 213, 219)'
        ],
        borderWidth: 2,
      }]
    };

    const config = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        circumference: 180,
        rotation: -90,
        cutout: '75%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      },
      plugins: [{
        id: 'gaugeText',
        afterDraw: (chart) => {
          const { ctx, chartArea: { width, height } } = chart;
          ctx.save();
          
          const value = chart.data.datasets[0].data[0];
          ctx.font = 'bold 32px Arial';
          ctx.fillStyle = '#111827';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${value}%`, width / 2, height * 0.7);
          
          ctx.font = '14px Arial';
          ctx.fillStyle = '#6b7280';
          ctx.fillText('Overall Performance', width / 2, height * 0.85);
          
          ctx.restore();
        }
      }]
    };

    this.charts.gauge = new Chart(ctx, config);
  }

  /**
   * Setup chart click handlers for drill-down
   */
  setupChartClickHandlers() {
    // Add click handlers to existing charts
    const chartElements = {
      'inventoryChart': this.showInventoryDrillDown.bind(this),
      'operationsChart': this.showOperationsDrillDown.bind(this),
      'receivingChart': this.showReceivingDrillDown.bind(this)
    };

    Object.keys(chartElements).forEach(chartId => {
      const canvas = document.getElementById(chartId);
      if (canvas) {
        canvas.style.cursor = 'pointer';
        canvas.addEventListener('click', (event) => {
          const chart = Chart.getChart(canvas);
          if (chart) {
            const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
            if (elements.length > 0) {
              chartElements[chartId](elements[0]);
            }
          }
        });
      }
    });
  }

  /**
   * Show inventory drill-down modal
   */
  showInventoryDrillDown(element) {
    const chart = Chart.getChart(element.element.$context.chart.canvas);
    const datasetIndex = element.datasetIndex;
    const dataIndex = element.index;
    const label = chart.data.labels[dataIndex];
    const value = chart.data.datasets[datasetIndex].data[dataIndex];

    this.showDrillDownModal('Inventory Details', label, {
      'Current Stock': value.toLocaleString() + ' units',
      'Capacity': '25,000 units',
      'Utilization': '84.8%',
      'Top Items': 'Widget A, Widget B, Widget C',
      'Slow Moving': '12 items',
      'Last Count': '2 days ago'
    });
  }

  /**
   * Show operations drill-down modal
   */
  showOperationsDrillDown(element) {
    const chart = Chart.getChart(element.element.$context.chart.canvas);
    const datasetIndex = element.datasetIndex;
    const dataIndex = element.index;
    const label = chart.data.labels[dataIndex];
    const dataset = chart.data.datasets[datasetIndex].label;
    const value = chart.data.datasets[datasetIndex].data[dataIndex];

    this.showDrillDownModal(`${dataset} - ${label}`, dataset, {
      'Total Count': value,
      'Average per Hour': Math.round(value / 8),
      'Peak Hour': '2:00 PM - 3:00 PM',
      'Lowest Hour': '6:00 AM - 7:00 AM',
      'Workers Assigned': Math.floor(Math.random() * 10) + 5,
      'Completion Rate': '98.5%'
    });
  }

  /**
   * Show receiving drill-down modal
   */
  showReceivingDrillDown(element) {
    const chart = Chart.getChart(element.element.$context.chart.canvas);
    const datasetIndex = element.datasetIndex;
    const dataIndex = element.index;
    const label = chart.data.labels[dataIndex];
    const value = chart.data.datasets[datasetIndex].data[dataIndex];

    this.showDrillDownModal('Receiving Details', label, {
      'Total Receipts': value.toLocaleString(),
      'ASN Receipts': Math.round(value * 0.7),
      'Blind Receipts': Math.round(value * 0.3),
      'Avg Items per Receipt': '24.5',
      'Discrepancy Rate': '2.1%',
      'Processing Time': '1.4 hours'
    });
  }

  /**
   * Generic drill-down modal
   */
  showDrillDownModal(title, subtitle, data) {
    // Create modal HTML
    const modalHTML = `
      <div class="analytics-modal-overlay" id="drillDownModal">
        <div class="analytics-modal">
          <div class="analytics-modal-header">
            <div>
              <h3 class="analytics-modal-title">${title}</h3>
              <p class="analytics-modal-subtitle">${subtitle}</p>
            </div>
            <button class="analytics-modal-close" onclick="document.getElementById('drillDownModal').remove()">
              &times;
            </button>
          </div>
          <div class="analytics-modal-body">
            <div class="drill-down-grid">
              ${Object.keys(data).map(key => `
                <div class="drill-down-item">
                  <div class="drill-down-label">${key}</div>
                  <div class="drill-down-value">${data[key]}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="analytics-modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('drillDownModal').remove()">
              Close
            </button>
            <button class="btn btn-primary" onclick="window.notify && window.notify.info('Detailed report coming soon!')">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existing = document.getElementById('drillDownModal');
    if (existing) existing.remove();

    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add click outside to close
    setTimeout(() => {
      const modal = document.getElementById('drillDownModal');
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    }, 100);
  }

  /**
   * Handle scatter chart click
   */
  handleScatterClick(element) {
    const value = element.element.$context.raw;
    this.showDrillDownModal('Worker Performance Analysis', 'Efficiency Metrics', {
      'Picking Accuracy': value.x + '%',
      'Processing Speed': value.y + '%',
      'Combined Score': Math.round((value.x + value.y) / 2) + '%',
      'Tasks Completed': Math.floor(Math.random() * 50) + 100,
      'Error Rate': (100 - value.x).toFixed(1) + '%',
      'Ranking': '#' + (Math.floor(Math.random() * 10) + 1)
    });
  }

  /**
   * Destroy all charts
   */
  destroy() {
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key].destroy();
      }
    });
    this.charts = {};
  }
}

// Initialize advanced analytics when DOM is ready
let advancedAnalytics;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize on pages with charts
  if (document.querySelector('canvas[id$="Chart"]')) {
    advancedAnalytics = new AdvancedAnalytics();
    
    // Wait for other analytics to initialize first
    setTimeout(() => {
      advancedAnalytics.init();
    }, 500);
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
  if (advancedAnalytics) {
    advancedAnalytics.destroy();
  }
});
