/**
 * Reports Analytics Module - Phase 9
 * Advanced charting and reporting for the WMS Reports page
 */

class ReportsAnalytics {
  constructor() {
    this.charts = {};
    this.animationDuration = 750;
    this.currentCategory = null;
  }

  /**
   * Initialize all report charts
   */
  init() {
    this.initReceivingChart();
    this.initAccuracyChart();
    this.initProductivityChart();
    this.initCycleCountChart();
    this.setupReportGenerator();
  }

  /**
   * Monthly Receiving Volume Chart (Bar + Line)
   */
  initReceivingChart() {
    const ctx = document.getElementById('receivingChart');
    if (!ctx) return;

    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        type: 'bar',
        label: 'Receipts',
        data: [1250, 1180, 1450, 1320, 1580, 1690, 1820, 1750, 1890, 1960, 2100, 1850],
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 1,
        yAxisID: 'y',
      }, {
        type: 'line',
        label: 'Avg Processing Time (hrs)',
        data: [2.4, 2.2, 2.0, 1.9, 1.8, 1.7, 1.6, 1.7, 1.5, 1.4, 1.3, 1.4],
        borderColor: 'rgb(75, 85, 99)',
        backgroundColor: 'rgba(75, 85, 99, 0.1)',
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
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (context.datasetIndex === 1) {
                    label += context.parsed.y.toFixed(1) + ' hours';
                  } else {
                    label += context.parsed.y.toLocaleString() + ' receipts';
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
              text: 'Number of Receipts',
              font: { size: 11 }
            },
            beginAtZero: true
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Processing Time (hours)',
              font: { size: 11 }
            },
            grid: {
              drawOnChartArea: false,
            },
            beginAtZero: true
          }
        },
        animation: {
          duration: this.animationDuration
        }
      }
    };

    this.charts.receiving = new Chart(ctx, config);
  }

  /**
   * Picking Accuracy Trend Chart (Line)
   */
  initAccuracyChart() {
    const ctx = document.getElementById('accuracyChart');
    if (!ctx) return;

    const data = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
      datasets: [{
        label: 'Picking Accuracy',
        data: [96.5, 97.2, 96.8, 98.1, 98.5, 97.9, 98.8, 99.2],
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }, {
        label: 'Target (98%)',
        data: [98, 98, 98, 98, 98, 98, 98, 98],
        borderColor: 'rgb(107, 114, 128)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
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
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(1) + '%';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            min: 94,
            max: 100,
            title: {
              display: true,
              text: 'Accuracy %',
              font: { size: 11 }
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        animation: {
          duration: this.animationDuration
        }
      }
    };

    this.charts.accuracy = new Chart(ctx, config);
  }

  /**
   * Worker Productivity Chart (Horizontal Bar)
   */
  initProductivityChart() {
    const ctx = document.getElementById('productivityChart');
    if (!ctx) return;

    const data = {
      labels: ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown', 'David Wilson', 'Lisa Anderson'],
      datasets: [{
        label: 'Tasks Completed',
        data: [156, 142, 138, 129, 125, 118],
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 1,
      }]
    };

    const config = {
      type: 'bar',
      data: data,
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: function(context) {
                return 'Tasks: ' + context.parsed.x;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tasks Completed This Week',
              font: { size: 11 }
            }
          }
        },
        animation: {
          duration: this.animationDuration
        }
      }
    };

    this.charts.productivity = new Chart(ctx, config);
  }

  /**
   * Cycle Count Variance Chart (Bar)
   */
  initCycleCountChart() {
    const ctx = document.getElementById('cycleCountChart');
    if (!ctx) return;

    const data = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [{
        label: 'Counts Performed',
        data: [45, 52, 48, 55, 50, 58],
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 1,
        yAxisID: 'y',
      }, {
        label: 'Variance Rate %',
        data: [3.2, 2.8, 2.5, 2.1, 1.9, 1.6],
        type: 'line',
        borderColor: 'rgb(75, 85, 99)',
        backgroundColor: 'rgba(75, 85, 99, 0.1)',
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
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Counts Performed',
              font: { size: 11 }
            },
            beginAtZero: true
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Variance Rate %',
              font: { size: 11 }
            },
            grid: {
              drawOnChartArea: false,
            },
            beginAtZero: true,
            max: 5
          }
        },
        animation: {
          duration: this.animationDuration
        }
      }
    };

    this.charts.cycleCount = new Chart(ctx, config);
  }

  /**
   * Setup report generator form
   */
  setupReportGenerator() {
    const form = document.getElementById('reportForm');
    if (!form) return;

    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dateToInput = document.getElementById('reportDateTo');
    const dateFromInput = document.getElementById('reportDateFrom');

    if (dateToInput) {
      dateToInput.value = today.toISOString().split('T')[0];
    }
    if (dateFromInput) {
      dateFromInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    }

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateReport();
    });
  }

  /**
   * Generate report
   */
  generateReport() {
    const reportType = document.getElementById('reportType').value;
    const dateFrom = document.getElementById('reportDateFrom').value;
    const dateTo = document.getElementById('reportDateTo').value;
    const format = document.getElementById('reportFormat').value;

    if (!reportType || !dateFrom || !dateTo) {
      if (window.notify) {
        notify.error('Please fill in all required fields');
      }
      return;
    }

    const reportName = document.getElementById('reportType').selectedOptions[0].text;

    if (window.notify) {
      const hideLoader = notify.loading('Generating report...');
      
      setTimeout(() => {
        hideLoader();
        notify.success(`${reportName} generated successfully!`, 5000, {
          actionText: 'Download',
          action: () => {
            this.downloadReport(reportType, format);
          }
        });
      }, 1500);
    }
  }

  /**
   * Download report (simulated)
   */
  downloadReport(reportType, format) {
    if (window.notify) {
      notify.info(`Downloading report as ${format.toUpperCase()}...`, 2000);
    }
    console.log('Downloading report:', reportType, 'in format:', format);
  }

  /**
   * Show report category
   */
  showReportCategory(category) {
    this.currentCategory = category;
    const reportTypeSelect = document.getElementById('reportType');
    
    if (reportTypeSelect) {
      // Filter options based on category
      const categoryMap = {
        'receiving': ['asn-discrepancy', 'receipt-summary', 'receiving-performance'],
        'inventory': ['inventory-position', 'stock-valuation', 'expiry-report'],
        'quality': ['inspection-summary', 'rejection-analysis'],
        'performance': ['warehouse-kpi', 'user-productivity']
      };

      const relevantOptions = categoryMap[category];
      if (relevantOptions && relevantOptions.length > 0) {
        reportTypeSelect.value = relevantOptions[0];
      }

      // Scroll to form
      document.getElementById('reportGenerator').scrollIntoView({ behavior: 'smooth' });
    }

    if (window.notify) {
      const categoryNames = {
        'receiving': 'Receiving Reports',
        'inventory': 'Inventory Reports',
        'quality': 'Quality Reports',
        'performance': 'Performance Reports'
      };
      notify.info(`${categoryNames[category]} selected`, 2000);
    }
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

// Initialize reports analytics when DOM is ready
let reportsAnalytics;

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the reports page
  if (document.getElementById('receivingChart')) {
    reportsAnalytics = new ReportsAnalytics();
    reportsAnalytics.init();
  }
});

// Global function for report category buttons
function showReportCategory(category) {
  if (reportsAnalytics) {
    reportsAnalytics.showReportCategory(category);
  }
}

// Clean up on page unload
window.addEventListener('beforeunload', function() {
  if (reportsAnalytics) {
    reportsAnalytics.destroy();
  }
});
