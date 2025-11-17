/**
 * DLT WMS Charts Library - Modern Professional Edition
 * Enhanced data visualization with creative professional design
 */

// Modern Chart.js Configuration with Animations
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800,
    easing: 'easeInOutQuart'
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 16,
        font: {
          family: "'Inter', sans-serif",
          size: 12,
          weight: '500'
        },
        boxWidth: 10,
        boxHeight: 10
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      padding: 14,
      titleFont: {
        size: 14,
        weight: '600'
      },
      bodyFont: {
        size: 13
      },
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      boxPadding: 6
    }
  }
};

// Professional Grayscale Color Palettes with Gradients
const colors = {
  primary: '#000000',
  secondary: '#2d3748',
  tertiary: '#4a5568',
  quaternary: '#718096',
  light: '#a0aec0',
  lighter: '#cbd5e0',
  lightest: '#e2e8f0',
  white: '#ffffff',
  
  // Modern grayscale schemes
  scheme1: ['#1a202c', '#2d3748', '#4a5568', '#718096', '#a0aec0'],
  scheme2: ['#000000', '#1c1c1c', '#383838', '#545454', '#707070', '#8c8c8c', '#a8a8a8'],
  scheme3: ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1'],
  
  // Gradient definitions for modern look
  gradient: {
    dark: ['rgba(0, 0, 0, 0.9)', 'rgba(45, 55, 72, 0.6)'],
    medium: ['rgba(74, 85, 104, 0.8)', 'rgba(113, 128, 150, 0.4)'],
    light: ['rgba(160, 174, 192, 0.6)', 'rgba(226, 232, 240, 0.3)'],
    accent: ['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.1)']
  }
};

// Helper function to create gradient
function createGradient(ctx, colorArray, direction = 'vertical') {
  const gradient = direction === 'vertical' 
    ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
    : ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
  
  gradient.addColorStop(0, colorArray[0]);
  gradient.addColorStop(1, colorArray[1]);
  return gradient;
}

// Check if dark theme is active
function isDarkTheme() {
  return document.body.classList.contains('dark-theme');
}

// Get theme-aware colors
function getThemeColors() {
  if (isDarkTheme()) {
    return {
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      grid: 'rgba(255, 255, 255, 0.08)',
      background: '#0f172a',
      border: 'rgba(255, 255, 255, 0.1)',
      cardBg: '#1e293b'
    };
  }
  return {
    text: '#1a202c',
    textSecondary: '#718096',
    grid: 'rgba(0, 0, 0, 0.06)',
    background: '#ffffff',
    border: 'rgba(0, 0, 0, 0.08)',
    cardBg: '#ffffff'
  };
}

// Update chart theme when theme changes
function updateChartTheme(chart) {
  const themeColors = getThemeColors();
  
  if (chart.options.scales) {
    Object.keys(chart.options.scales).forEach(scaleKey => {
      const scale = chart.options.scales[scaleKey];
      if (scale.ticks) scale.ticks.color = themeColors.text;
      if (scale.grid) scale.grid.color = themeColors.grid;
    });
  }
  
  if (chart.options.plugins.legend) {
    chart.options.plugins.legend.labels.color = themeColors.text;
  }
  
  if (chart.options.plugins.title) {
    chart.options.plugins.title.color = themeColors.text;
  }
  
  chart.update('none');
}

// Dashboard Charts - Modern Professional Designs
const DashboardCharts = {
  
  // Modern Inventory Levels Chart with Gradient Bars
  inventoryLevels: function(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const themeColors = getThemeColors();
    const canvasContext = ctx.getContext('2d');
    
    // Create gradients for bars
    const gradient1 = canvasContext.createLinearGradient(0, 0, 0, 400);
    gradient1.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient1.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    
    const gradient2 = canvasContext.createLinearGradient(0, 0, 0, 400);
    gradient2.addColorStop(0, 'rgba(113, 128, 150, 0.7)');
    gradient2.addColorStop(1, 'rgba(113, 128, 150, 0.3)');
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Raw Materials', 'Finished Goods', 'Work in Progress', 'Spare Parts', 'Packaging'],
        datasets: [{
          label: 'Current Stock',
          data: [12500, 8200, 3400, 1800, 2100],
          backgroundColor: gradient1,
          borderColor: '#000000',
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false
        }, {
          label: 'Minimum Required',
          data: [10000, 6000, 2500, 1500, 1800],
          backgroundColor: gradient2,
          borderColor: '#718096',
          borderWidth: 0,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        ...chartDefaults,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: themeColors.textSecondary,
              font: {
                size: 11,
                weight: '500'
              },
              callback: function(value) {
                return value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value;
              }
            },
            grid: {
              color: themeColors.grid,
              drawBorder: false
            },
            border: {
              display: false
            }
          },
          x: {
            ticks: {
              color: themeColors.text,
              font: {
                size: 11,
                weight: '500'
              }
            },
            grid: {
              display: false
            },
            border: {
              display: false
            }
          }
        },
        plugins: {
          ...chartDefaults.plugins,
          legend: {
            ...chartDefaults.plugins.legend,
            labels: {
              ...chartDefaults.plugins.legend.labels,
              color: themeColors.text
            }
          }
        }
      }
    });
    
    return chart;
  },
  
  // Modern Operations Trend with Smooth Curves and Area Fill
  operationsTrend: function(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const themeColors = getThemeColors();
    const canvasContext = ctx.getContext('2d');
    
    // Create gradient fills
    const receiptGradient = canvasContext.createLinearGradient(0, 0, 0, 350);
    receiptGradient.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
    receiptGradient.addColorStop(1, 'rgba(0, 0, 0, 0.01)');
    
    const shipmentGradient = canvasContext.createLinearGradient(0, 0, 0, 350);
    shipmentGradient.addColorStop(0, 'rgba(74, 85, 104, 0.20)');
    shipmentGradient.addColorStop(1, 'rgba(74, 85, 104, 0.01)');
    
    const putawayGradient = canvasContext.createLinearGradient(0, 0, 0, 350);
    putawayGradient.addColorStop(0, 'rgba(160, 174, 192, 0.15)');
    putawayGradient.addColorStop(1, 'rgba(160, 174, 192, 0.01)');
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Receipts',
          data: [245, 198, 287, 312, 265, 189, 145],
          borderColor: '#000000',
          backgroundColor: receiptGradient,
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#000000',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#000000',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }, {
          label: 'Shipments',
          data: [198, 234, 256, 289, 245, 178, 123],
          borderColor: '#4a5568',
          backgroundColor: shipmentGradient,
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#4a5568',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#4a5568',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }, {
          label: 'Putaways',
          data: [156, 187, 213, 245, 198, 145, 112],
          borderColor: '#a0aec0',
          backgroundColor: putawayGradient,
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#a0aec0',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#a0aec0',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        ...chartDefaults,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: themeColors.textSecondary,
              font: {
                size: 11,
                weight: '500'
              }
            },
            grid: {
              color: themeColors.grid,
              drawBorder: false
            },
            border: {
              display: false
            }
          },
          x: {
            ticks: {
              color: themeColors.text,
              font: {
                size: 11,
                weight: '500'
              }
            },
            grid: {
              color: themeColors.grid,
              drawBorder: false
            },
            border: {
              display: false
            }
          }
        },
        plugins: {
          ...chartDefaults.plugins,
          legend: {
            ...chartDefaults.plugins.legend,
            labels: {
              ...chartDefaults.plugins.legend.labels,
              color: themeColors.text
            }
          }
        }
      }
    });
    
    return chart;
  },
  
  // Modern Doughnut Chart with Center Text
  warehouseUtilization: function(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const themeColors = getThemeColors();
    
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Occupied', 'Reserved', 'Available', 'Damaged'],
        datasets: [{
          data: [65, 15, 18, 2],
          backgroundColor: [
            '#1a202c',
            '#4a5568',
            '#a0aec0',
            '#e2e8f0'
          ],
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: '#ffffff',
          spacing: 2
        }]
      },
      options: {
        ...chartDefaults,
        cutout: '70%',
        plugins: {
          ...chartDefaults.plugins,
          legend: {
            ...chartDefaults.plugins.legend,
            position: 'bottom',
            labels: {
              ...chartDefaults.plugins.legend.labels,
              color: themeColors.text,
              padding: 16,
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    return {
                      text: `${label}: ${value}%`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      hidden: false,
                      index: i,
                      fontColor: themeColors.text
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: function(chart) {
          const width = chart.width;
          const height = chart.height;
          const ctx = chart.ctx;
          ctx.restore();
          
          const fontSize = (height / 160).toFixed(2);
          ctx.font = "bold " + fontSize + "em Inter, sans-serif";
          ctx.textBaseline = "middle";
          ctx.fillStyle = themeColors.text;
          
          const text = "65%";
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2 - 10;
          
          ctx.fillText(text, textX, textY);
          
          ctx.font = fontSize * 0.5 + "em Inter, sans-serif";
          ctx.fillStyle = themeColors.textSecondary;
          const subtext = "Utilized";
          const subtextX = Math.round((width - ctx.measureText(subtext).width) / 2);
          const subtextY = height / 2 + 15;
          
          ctx.fillText(subtext, subtextX, subtextY);
          ctx.save();
        }
      }]
    });
    
    return chart;
  },
  
  // Modern Order Status Distribution with Polar Area
  orderStatus: function(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const themeColors = getThemeColors();
    
    const chart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: ['Pending', 'Picking', 'Packing', 'Shipped', 'On Hold'],
        datasets: [{
          data: [45, 78, 34, 156, 12],
          backgroundColor: [
            'rgba(26, 32, 44, 0.75)',
            'rgba(74, 85, 104, 0.75)',
            'rgba(113, 128, 150, 0.75)',
            'rgba(160, 174, 192, 0.75)',
            'rgba(226, 232, 240, 0.75)'
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverBorderWidth: 3
        }]
      },
      options: {
        ...chartDefaults,
        scales: {
          r: {
            ticks: {
              display: false,
              backdropColor: 'transparent'
            },
            grid: {
              color: themeColors.grid
            },
            pointLabels: {
              color: themeColors.text,
              font: {
                size: 11,
                weight: '500'
              }
            }
          }
        },
        plugins: {
          ...chartDefaults.plugins,
          legend: {
            ...chartDefaults.plugins.legend,
            position: 'bottom',
            labels: {
              ...chartDefaults.plugins.legend.labels,
              color: themeColors.text,
              padding: 12,
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    return {
                      text: `${label}: ${value}`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      hidden: false,
                      index: i,
                      fontColor: themeColors.text
                    };
                  });
                }
                return [];
              }
            }
          }
        }
      }
    });
    
    return chart;
  }
};

// Reports Module Charts
const ReportCharts = {
  
  // Monthly Receiving Volume (Stacked Bar Chart)
  monthlyReceiving: function(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const themeColors = getThemeColors();
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'PO Receipts',
          data: [1200, 1350, 1100, 1450, 1600, 1550, 1700, 1650, 1800, 1750, 1900, 2000],
          backgroundColor: colors.scheme1[0]
        }, {
          label: 'RMA Returns',
          data: [200, 180, 220, 190, 210, 230, 195, 215, 225, 240, 235, 250],
          backgroundColor: colors.scheme1[2]
        }, {
          label: 'Transfers',
          data: [150, 170, 160, 180, 175, 190, 185, 200, 195, 210, 205, 220],
          backgroundColor: colors.scheme1[4]
        }]
      },
      options: {
        ...chartDefaults,
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              color: themeColors.text
            },
            grid: {
              color: themeColors.grid
            }
          },
          x: {
            stacked: true,
            ticks: {
              color: themeColors.text
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          ...chartDefaults.plugins,
          title: {
            display: true,
            text: 'Monthly Receiving Volume',
            color: themeColors.text,
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    });
    
    return chart;
  },
  
  // Picking Accuracy Trend (Line Chart with Area)
  pickingAccuracy: function(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const themeColors = getThemeColors();
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
        datasets: [{
          label: 'Accuracy Rate (%)',
          data: [96.5, 97.2, 96.8, 98.1, 97.5, 98.4, 98.9, 99.1],
          borderColor: '#000000',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2
        }, {
          label: 'Target (98%)',
          data: [98, 98, 98, 98, 98, 98, 98, 98],
          borderColor: '#666666',
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false,
          pointRadius: 0
        }]
      },
      options: {
        ...chartDefaults,
        scales: {
          y: {
            min: 95,
            max: 100,
            ticks: {
              color: themeColors.text,
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: themeColors.grid
            }
          },
          x: {
            ticks: {
              color: themeColors.text
            },
            grid: {
              color: themeColors.grid
            }
          }
        },
        plugins: {
          ...chartDefaults.plugins,
          title: {
            display: true,
            text: 'Picking Accuracy Trend',
            color: themeColors.text,
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    });
    
    return chart;
  },
  
  // Cycle Count Variance (Horizontal Bar Chart)
  cycleCountVariance: function(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const themeColors = getThemeColors();
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F'],
        datasets: [{
          label: 'Variance Count',
          data: [23, 15, 8, 32, 12, 19],
          backgroundColor: function(context) {
            const value = context.parsed.x;
            // All grayscale - darker for higher variance
            return value > 25 ? '#000000' : value > 15 ? '#333333' : '#666666';
          },
          borderColor: themeColors.border,
          borderWidth: 1
        }]
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: themeColors.text
            },
            grid: {
              color: themeColors.grid
            }
          },
          y: {
            ticks: {
              color: themeColors.text
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          ...chartDefaults.plugins,
          title: {
            display: true,
            text: 'Cycle Count Variance by Zone',
            color: themeColors.text,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          }
        }
      }
    });
    
    return chart;
  },
  
  // Shipment Performance (Mixed Chart)
  shipmentPerformance: function(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const themeColors = getThemeColors();
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          type: 'bar',
          label: 'Shipments',
          data: [450, 520, 480, 550],
          backgroundColor: '#000000',
          borderColor: '#333333',
          borderWidth: 1,
          yAxisID: 'y'
        }, {
          type: 'line',
          label: 'On-Time %',
          data: [94, 96, 95, 97],
          borderColor: '#666666',
          backgroundColor: 'rgba(102, 102, 102, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          yAxisID: 'y1',
          pointRadius: 5
        }]
      },
      options: {
        ...chartDefaults,
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            ticks: {
              color: themeColors.text
            },
            grid: {
              color: themeColors.grid
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            min: 90,
            max: 100,
            ticks: {
              color: themeColors.text,
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              display: false
            }
          },
          x: {
            ticks: {
              color: themeColors.text
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          ...chartDefaults.plugins,
          title: {
            display: true,
            text: 'Shipment Volume & On-Time Performance',
            color: themeColors.text,
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    });
    
    return chart;
  }
};

// Initialize all charts on a page
function initializeCharts(module) {
  const charts = [];
  
  if (module === 'dashboard') {
    charts.push(DashboardCharts.inventoryLevels('inventoryChart'));
    charts.push(DashboardCharts.operationsTrend('operationsChart'));
    charts.push(DashboardCharts.warehouseUtilization('utilizationChart'));
    charts.push(DashboardCharts.orderStatus('orderStatusChart'));
  } else if (module === 'reports') {
    charts.push(ReportCharts.monthlyReceiving('receivingChart'));
    charts.push(ReportCharts.pickingAccuracy('accuracyChart'));
    charts.push(ReportCharts.cycleCountVariance('varianceChart'));
    charts.push(ReportCharts.shipmentPerformance('shipmentChart'));
  }
  
  return charts.filter(chart => chart !== null);
}

// Listen for theme changes and update charts
document.addEventListener('DOMContentLoaded', function() {
  // Store charts globally for theme updates
  window.activeCharts = [];
  
  // Override the theme toggle function to update charts
  const originalToggleTheme = window.toggleTheme;
  window.toggleTheme = function() {
    if (originalToggleTheme) {
      originalToggleTheme();
    }
    
    // Update all active charts
    setTimeout(() => {
      window.activeCharts.forEach(chart => {
        if (chart && typeof chart.update === 'function') {
          updateChartTheme(chart);
        }
      });
      // Update heat map on theme change
      if (typeof initializeWarehouseHeatMap === 'function') {
        initializeWarehouseHeatMap();
      }
    }, 100);
  };
});

// Warehouse Heat Map Visualization
function initializeWarehouseHeatMap() {
  const container = document.getElementById('warehouseHeatMap');
  if (!container) return;
  
  const isDark = isDarkTheme();
  
  // Generate warehouse zones - 6 rows x 8 columns = 48 zones
  const zones = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const types = ['Electronics', 'Furniture', 'Raw Materials', 'Finished Goods', 'Perishables', 'Chemicals'];
  
  rows.forEach((row, rowIndex) => {
    for (let col = 1; col <= 8; col++) {
      // Generate realistic capacity values
      const baseCapacity = 30 + Math.random() * 65; // 30-95%
      const capacity = Math.round(baseCapacity);
      
      zones.push({
        id: `${row}${col}`,
        name: `Zone ${row}${col}`,
        capacity: capacity,
        row: rowIndex,
        col: col - 1,
        type: types[rowIndex]
      });
    }
  });
  
  // Get monochrome color based on capacity
  function getCapacityColor(capacity) {
    // Pure black/white opacity-based gradient
    const opacity = capacity / 100; // 0 to 1
    return `rgba(0, 0, 0, ${opacity})`;
  }
  
  // Build heat map HTML with minimal monochrome design
  let html = `
    <style>
      .heatmap-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        height: 100%;
      }
      .heatmap-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;
        flex: 1;
      }
      .heatmap-cell {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 3px;
        padding: 8px 6px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: all 0.15s ease;
        cursor: pointer;
        position: relative;
        min-height: 50px;
      }
      .heatmap-cell:hover {
        transform: scale(1.05);
        border-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 10;
      }
      .heatmap-cell-id {
        font-size: 11px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 2px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
      .heatmap-cell-capacity {
        font-size: 13px;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
      .heatmap-legend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 10px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: ${isDark ? '#e2e8f0' : '#4b5563'};
      }
      .legend-gradient {
        display: flex;
        gap: 2px;
      }
      .legend-color {
        width: 24px;
        height: 16px;
        border-radius: 2px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
      body.dark-theme .heatmap-cell {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.1);
      }
      body.dark-theme .heatmap-cell:hover {
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      }
      body.dark-theme .heatmap-legend {
        border-top-color: rgba(255, 255, 255, 0.1);
      }
      body.dark-theme .legend-item {
        color: #e2e8f0;
      }
    </style>
    <div class="heatmap-container">
      <div class="heatmap-grid">
  `;
  
  zones.forEach(zone => {
    const color = getCapacityColor(zone.capacity);
    const textColor = zone.capacity > 50 ? '#ffffff' : '#000000';
    html += `
      <div class="heatmap-cell" style="background: ${color};" 
           title="${zone.name} - ${zone.type}: ${zone.capacity}% capacity"
           onclick="notify.info('${zone.name}: ${zone.capacity}% capacity')">
        <div class="heatmap-cell-id" style="color: ${textColor}; text-shadow: ${zone.capacity > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'};">${zone.id}</div>
        <div class="heatmap-cell-capacity" style="color: ${textColor}; text-shadow: ${zone.capacity > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'};">${zone.capacity}%</div>
      </div>
    `;
  });
  
  html += `
      </div>
      <div class="heatmap-legend">
        <span style="font-size: 10px; font-weight: 600; margin-right: 8px;">CAPACITY:</span>
        <div class="legend-gradient">
          <div class="legend-color" style="background: rgba(0, 0, 0, 0.2);" title="20%"></div>
          <div class="legend-color" style="background: rgba(0, 0, 0, 0.4);" title="40%"></div>
          <div class="legend-color" style="background: rgba(0, 0, 0, 0.6);" title="60%"></div>
          <div class="legend-color" style="background: rgba(0, 0, 0, 0.8);" title="80%"></div>
          <div class="legend-color" style="background: rgba(0, 0, 0, 1.0);" title="100%"></div>
        </div>
        <div style="display: flex; gap: 12px; margin-left: 8px;">
          <span style="font-size: 10px;">0%</span>
          <span style="font-size: 10px;">100%</span>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}
