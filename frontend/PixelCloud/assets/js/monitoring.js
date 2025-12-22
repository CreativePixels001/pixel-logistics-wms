/**
 * PixelCloud - Monitoring Charts
 * Real-time server monitoring with Chart.js
 */

let cpuChart, ramChart, diskChart, networkChart;

// Initialize all monitoring charts
function initMonitoringCharts() {
    if (document.getElementById('cpuChart')) {
        cpuChart = createLineChart('cpuChart', 'CPU Usage', '%', '#000');
        ramChart = createLineChart('ramChart', 'RAM Usage', 'GB', '#333');
        diskChart = createLineChart('diskChart', 'Disk I/O', 'MB/s', '#555');
        networkChart = createLineChart('networkChart', 'Network Traffic', 'Mbps', '#777');
        
        // Start real-time updates
        setInterval(updateMonitoringCharts, 5000);
    }
}

// Create a line chart
function createLineChart(canvasId, label, unit, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Generate initial mock data (24 hours, 1 data point per hour)
    const labels = [];
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
        labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        
        // Generate realistic mock data with some variation
        let value;
        if (label.includes('CPU')) {
            value = 20 + Math.random() * 40 + Math.sin(i / 4) * 15; // 20-60% with wave pattern
        } else if (label.includes('RAM')) {
            value = 3 + Math.random() * 2 + Math.sin(i / 3) * 0.5; // 3-5 GB
        } else if (label.includes('Disk')) {
            value = 10 + Math.random() * 30; // 10-40 MB/s
        } else {
            value = 50 + Math.random() * 100; // 50-150 Mbps
        }
        data.push(value.toFixed(2));
    }

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#000',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#333',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(2) + ' ' + unit;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        maxTicksLimit: 8,
                        color: '#666'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e0e0e0',
                        borderDash: [5, 5]
                    },
                    ticks: {
                        color: '#666',
                        callback: function(value) {
                            return value.toFixed(0) + ' ' + unit;
                        }
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Update charts with new data points (simulated real-time)
function updateMonitoringCharts() {
    const charts = [
        { chart: cpuChart, range: [20, 60], wave: true },
        { chart: ramChart, range: [3, 5], wave: true },
        { chart: diskChart, range: [10, 40], wave: false },
        { chart: networkChart, range: [50, 150], wave: false }
    ];

    charts.forEach((item, index) => {
        if (!item.chart) return;

        // Add new data point
        const now = new Date();
        const timeLabel = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Generate new value
        const [min, max] = item.range;
        let newValue = min + Math.random() * (max - min);
        if (item.wave) {
            newValue += Math.sin(Date.now() / 10000) * ((max - min) / 4);
        }

        // Update chart
        item.chart.data.labels.push(timeLabel);
        item.chart.data.datasets[0].data.push(newValue.toFixed(2));

        // Keep only last 24 data points
        if (item.chart.data.labels.length > 24) {
            item.chart.data.labels.shift();
            item.chart.data.datasets[0].data.shift();
        }

        item.chart.update('none'); // Update without animation for smooth real-time feel
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMonitoringCharts);
} else {
    initMonitoringCharts();
}
