/**
 * Dashboard Analytics Module - Phase 9
 * Interactive charts and KPI visualizations for the WMS Dashboard
 */

class DashboardAnalytics {
  constructor() {
    this.charts = {};
    this.refreshInterval = null;
    this.animationDuration = 750;
  }

  /**
   * Initialize all dashboard charts
   */
  init() {
    this.initInventoryChart();
    this.initOperationsChart();
    this.initUtilizationChart();
    this.initOrderStatusChart();
    this.updateKPIMetrics();
    
    // Auto-refresh every 30 seconds
    this.startAutoRefresh(30000);
  }

  /**
   * Inventory Levels Overview Chart (Mixed Chart)
   */
  initInventoryChart() {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return;

    const data = {
      labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F'],
      datasets: [{
        type: 'bar',
        label: 'Current Inventory',
        data: [12500, 19800, 15600, 21200, 18400, 14900],
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 1,
        yAxisID: 'y',
      }, {
        type: 'bar',
        label: 'Capacity',
        data: [20000, 25000, 20000, 25000, 22000, 20000],
        backgroundColor: 'rgba(156, 163, 175, 0.4)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 1,
        yAxisID: 'y',
      }, {
        type: 'line',
        label: 'Utilization %',
        data: [62.5, 79.2, 78.0, 84.8, 83.6, 74.5],
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y1',
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    };

    const config = {
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              usePointStyle: true,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 13 },
            bodyFont: { size: 12 },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (context.datasetIndex === 2) {
                    label += context.parsed.y.toFixed(1) + '%';
                  } else {
                    label += context.parsed.y.toLocaleString() + ' units';
                  }
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Units',
              font: { size: 11 }
            },
            ticks: {
              callback: function(value) {
                return (value / 1000) + 'K';
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Utilization %',
              font: { size: 11 }
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            max: 100
          }
        },
        animation: {
          duration: this.animationDuration
        }
      }
    };

    this.charts.inventory = new Chart(ctx, config);
  }

  /**
   * Weekly Operations Chart (Line Chart)
   */
  initOperationsChart() {
    const ctx = document.getElementById('operationsChart');
    if (!ctx) return;

    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Receipts',
        data: [145, 128, 167, 152, 189, 98, 45],
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      }, {
        label: 'Shipments',
        data: [138, 142, 159, 148, 175, 112, 67],
        borderColor: 'rgb(75, 85, 99)',
        backgroundColor: 'rgba(75, 85, 99, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      }, {
        label: 'Put-aways',
        data: [156, 134, 171, 145, 182, 105, 52],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      }]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              usePointStyle: true,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count',
              font: { size: 11 }
            }
          }
        },
        animation: {
          duration: this.animationDuration
        }
      }
    };

    this.charts.operations = new Chart(ctx, config);
  }

  /**
   * Space Utilization Chart (Doughnut Chart)
   */
  initUtilizationChart() {
    const ctx = document.getElementById('utilizationChart');
    if (!ctx) return;

    const data = {
      labels: ['Occupied', 'Reserved', 'Available', 'Maintenance'],
      datasets: [{
        data: [68, 12, 17, 3],
        backgroundColor: [
          'rgba(0, 0, 0, 0.9)',
          'rgba(55, 65, 81, 0.9)',
          'rgba(107, 114, 128, 0.9)',
          'rgba(209, 213, 219, 0.9)'
        ],
        borderColor: [
          'rgb(0, 0, 0)',
          'rgb(55, 65, 81)',
          'rgb(107, 114, 128)',
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
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              padding: 15,
              usePointStyle: true,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return label + ': ' + value + '%';
              }
            }
          }
        },
        cutout: '60%',
        animation: {
          duration: this.animationDuration
        }
      }
    };

    this.charts.utilization = new Chart(ctx, config);
  }

  /**
   * Order Status Distribution Chart (Pie Chart)
   */
  initOrderStatusChart() {
    const ctx = document.getElementById('orderStatusChart');
    if (!ctx) return;

    const data = {
      labels: ['Open', 'In Progress', 'Staged', 'Shipped', 'Cancelled'],
      datasets: [{
        data: [45, 28, 15, 108, 4],
        backgroundColor: [
          'rgba(0, 0, 0, 0.9)',
          'rgba(31, 41, 55, 0.9)',
          'rgba(75, 85, 99, 0.9)',
          'rgba(107, 114, 128, 0.9)',
          'rgba(156, 163, 175, 0.9)'
        ],
        borderColor: [
          'rgb(0, 0, 0)',
          'rgb(31, 41, 55)',
          'rgb(75, 85, 99)',
          'rgb(107, 114, 128)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 2,
      }]
    };

    const config = {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              padding: 12,
              usePointStyle: true,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return label + ': ' + value + ' (' + percentage + '%)';
              }
            }
          }
        },
        animation: {
          duration: this.animationDuration
        }
      }
    };

    this.charts.orderStatus = new Chart(ctx, config);
  }

  /**
   * Update KPI Metrics with animation
   */
  updateKPIMetrics() {
    const metrics = [
      { selector: '.stat-card:nth-child(1) .stat-value', value: 147, duration: 1000 },
      { selector: '.stat-card:nth-child(2) .stat-value', value: 23, duration: 800 },
      { selector: '.stat-card:nth-child(3) .stat-value', value: 1284, duration: 1200 },
      { selector: '.stat-card:nth-child(4) .stat-value', value: 8, duration: 600 }
    ];

    metrics.forEach(metric => {
      const element = document.querySelector(metric.selector);
      if (element) {
        this.animateValue(element, 0, metric.value, metric.duration);
      }
    });
  }

  /**
   * Animate numeric value
   */
  animateValue(element, start, end, duration) {
    const startTime = Date.now();
    const range = end - start;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(start + range * easeOutQuad);
      
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        element.textContent = end.toLocaleString();
      }
    };

    requestAnimationFrame(updateValue);
  }

  /**
   * Refresh all charts with new data
   */
  refreshCharts() {
    // Simulate data refresh
    Object.keys(this.charts).forEach(key => {
      const chart = this.charts[key];
      if (chart && chart.data && chart.data.datasets) {
        chart.data.datasets.forEach(dataset => {
          if (dataset.data) {
            dataset.data = dataset.data.map(value => {
              const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
              return Math.round(value * (1 + variance));
            });
          }
        });
        chart.update('active');
      }
    });

    this.updateKPIMetrics();
    
    if (window.notify) {
      notify.success('Dashboard metrics refreshed', 2000);
    }
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh(interval) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      this.refreshCharts();
    }, interval);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Destroy all charts
   */
  destroy() {
    this.stopAutoRefresh();
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key].destroy();
      }
    });
    this.charts = {};
  }
}

// Initialize dashboard analytics when DOM is ready
let dashboardAnalytics;

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the dashboard page
  if (document.getElementById('inventoryChart')) {
    dashboardAnalytics = new DashboardAnalytics();
    dashboardAnalytics.init();

    // Add refresh button handler
    const refreshBtn = document.querySelector('.btn-primary[onclick*="Refresh"]');
    if (refreshBtn) {
      refreshBtn.onclick = function() {
        dashboardAnalytics.refreshCharts();
      };
    }
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
  if (dashboardAnalytics) {
    dashboardAnalytics.destroy();
  }
});
