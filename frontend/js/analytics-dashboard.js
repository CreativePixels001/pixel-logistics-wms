// ===================================
// ADVANCED ANALYTICS DASHBOARD JS
// ===================================

// Configuration
const REFRESH_INTERVAL = 30000; // 30 seconds
const ACTIVITY_UPDATE_INTERVAL = 5000; // 5 seconds

// Global state
let charts = {};
let refreshTimer = null;
let activityTimer = null;

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    startRealTimeUpdates();
    simulateActivityFeed();
});

// ===================================
// CHART INITIALIZATION
// ===================================

function initializeCharts() {
    
    // Order Trends Chart (Line)
    const orderTrendsCtx = document.getElementById('orderTrendsChart');
    if (orderTrendsCtx) {
        charts.orderTrends = new Chart(orderTrendsCtx, {
            type: 'line',
            data: {
                labels: generateDateLabels(7),
                datasets: [{
                    label: 'Orders',
                    data: [1420, 1580, 1650, 1720, 1890, 1750, 1847],
                    borderColor: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 3
                }, {
                    label: 'Target',
                    data: [1500, 1500, 1500, 1500, 1500, 1500, 1500],
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                },
                parsing: false,
                normalized: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#111827',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8
                    },
                    decimation: {
                        enabled: true,
                        algorithm: 'lttb'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        },
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Performance Radar Chart
    const performanceRadarCtx = document.getElementById('performanceRadarChart');
    if (performanceRadarCtx) {
        charts.performanceRadar = new Chart(performanceRadarCtx, {
            type: 'radar',
            data: {
                labels: ['Accuracy', 'Speed', 'Efficiency', 'Quality', 'Safety', 'Compliance'],
                datasets: [{
                    label: 'Current',
                    data: [95, 88, 92, 90, 96, 94],
                    borderColor: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#000',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }, {
                    label: 'Target',
                    data: [90, 85, 85, 85, 95, 90],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        },
                        grid: {
                            color: '#f3f4f6'
                        },
                        angleLines: {
                            color: '#e5e7eb'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Order Status Chart (Doughnut)
    const orderStatusCtx = document.getElementById('orderStatusChart');
    if (orderStatusCtx) {
        charts.orderStatus = new Chart(orderStatusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending'],
                datasets: [{
                    data: [1256, 406, 185],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Inventory Category Chart (Bar)
    const inventoryCategoryCtx = document.getElementById('inventoryCategoryChart');
    if (inventoryCategoryCtx) {
        charts.inventoryCategory = new Chart(inventoryCategoryCtx, {
            type: 'bar',
            data: {
                labels: ['Electronics', 'Apparel', 'Food', 'Tools', 'Books'],
                datasets: [{
                    label: 'Value ($M)',
                    data: [2.8, 1.9, 1.5, 1.3, 0.9],
                    backgroundColor: '#3b82f6',
                    borderRadius: 6,
                    barThickness: 32
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value + 'M';
                            }
                        },
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Zone Performance Chart (Horizontal Bar)
    const zonePerformanceCtx = document.getElementById('zonePerformanceChart');
    if (zonePerformanceCtx) {
        charts.zonePerformance = new Chart(zonePerformanceCtx, {
            type: 'bar',
            data: {
                labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'],
                datasets: [{
                    label: 'Efficiency %',
                    data: [95, 88, 92, 85, 90],
                    backgroundColor: function(context) {
                        const value = context.parsed.x;
                        if (value >= 90) return '#10b981';
                        if (value >= 80) return '#f59e0b';
                        return '#ef4444';
                    },
                    borderRadius: 6,
                    barThickness: 24
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Throughput Chart (Mixed)
    const throughputCtx = document.getElementById('throughputChart');
    if (throughputCtx) {
        charts.throughput = new Chart(throughputCtx, {
            type: 'bar',
            data: {
                labels: ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'],
                datasets: [{
                    label: 'Orders Processed',
                    data: [45, 89, 156, 189, 245, 198, 123, 67],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 6
                }, {
                    label: 'Capacity',
                    data: [250, 250, 250, 250, 250, 250, 250, 250],
                    type: 'line',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Accuracy Trends Chart (Line with Area)
    const accuracyCtx = document.getElementById('accuracyChart');
    if (accuracyCtx) {
        charts.accuracy = new Chart(accuracyCtx, {
            type: 'line',
            data: {
                labels: generateDateLabels(14),
                datasets: [{
                    label: 'Accuracy %',
                    data: [98.5, 98.8, 99.1, 98.7, 99.0, 99.3, 99.2, 99.5, 99.1, 99.4, 99.2, 99.6, 99.3, 99.2],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        min: 98,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// ===================================
// REAL-TIME UPDATES
// ===================================

function startRealTimeUpdates() {
    // Update KPIs
    updateKPIs();
    
    // Set up auto-refresh
    refreshTimer = setInterval(() => {
        updateKPIs();
        updateCharts();
    }, REFRESH_INTERVAL);
}

function updateKPIs() {
    // Simulate real-time KPI updates
    const ordersToday = document.getElementById('ordersToday');
    if (ordersToday) {
        const currentValue = parseInt(ordersToday.textContent.replace(/,/g, ''));
        const newValue = currentValue + Math.floor(Math.random() * 10);
        animateValue(ordersToday, currentValue, newValue, 1000);
    }
    
    const fulfillmentRate = document.getElementById('fulfillmentRate');
    if (fulfillmentRate) {
        const variation = (Math.random() - 0.5) * 0.2;
        const newValue = (99.2 + variation).toFixed(1);
        fulfillmentRate.textContent = newValue + '%';
    }
}

function updateCharts() {
    // Update order trends chart
    if (charts.orderTrends) {
        const lastValue = charts.orderTrends.data.datasets[0].data.slice(-1)[0];
        const newValue = lastValue + Math.floor((Math.random() - 0.5) * 100);
        
        charts.orderTrends.data.labels.shift();
        charts.orderTrends.data.labels.push(getToday());
        
        charts.orderTrends.data.datasets[0].data.shift();
        charts.orderTrends.data.datasets[0].data.push(newValue);
        
        charts.orderTrends.update('none');
    }
}

function refreshDashboard() {
    // Show loading state
    const cards = document.querySelectorAll('.kpi-card');
    cards.forEach(card => card.classList.add('loading'));
    
    // Simulate data refresh
    setTimeout(() => {
        updateKPIs();
        updateCharts();
        cards.forEach(card => card.classList.remove('loading'));
        showNotification('Dashboard refreshed successfully', 'success');
    }, 800);
}

// ===================================
// ACTIVITY FEED
// ===================================

function simulateActivityFeed() {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    
    const activities = [
        { type: 'success', icon: 'check', message: 'Order #ORD-24567 completed', time: '2 min ago' },
        { type: 'warning', icon: 'alert', message: 'Low stock alert: SKU-789 (12 units)', time: '5 min ago' },
        { type: 'info', icon: 'package', message: 'Receiving started: ASN-98765', time: '8 min ago' },
        { type: 'success', icon: 'truck', message: 'Shipment dispatched: SHP-45678', time: '12 min ago' },
        { type: 'info', icon: 'user', message: 'New user logged in: John Smith', time: '15 min ago' },
        { type: 'warning', icon: 'clock', message: 'Dock 3 approaching capacity', time: '18 min ago' },
        { type: 'success', icon: 'check', message: 'Cycle count completed: Zone A', time: '22 min ago' },
        { type: 'info', icon: 'package', message: 'Putaway completed: 145 units', time: '25 min ago' }
    ];
    
    // Initialize feed
    updateActivityFeed(activities);
    
    // Simulate new activities
    activityTimer = setInterval(() => {
        addNewActivity(activities);
    }, ACTIVITY_UPDATE_INTERVAL);
}

function updateActivityFeed(activities) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    
    feed.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon activity-icon-${activity.type}">
                ${getActivityIcon(activity.icon)}
            </div>
            <div class="activity-content">
                <p class="activity-message">${activity.message}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

function addNewActivity(activities) {
    const newActivities = [
        { type: 'success', icon: 'check', message: `Order #ORD-${Math.floor(Math.random() * 90000) + 10000} completed`, time: 'Just now' },
        { type: 'info', icon: 'package', message: 'Picking started: Pick wave #' + Math.floor(Math.random() * 1000), time: 'Just now' },
        { type: 'success', icon: 'truck', message: 'Shipment dispatched: SHP-' + Math.floor(Math.random() * 90000), time: 'Just now' }
    ];
    
    const randomActivity = newActivities[Math.floor(Math.random() * newActivities.length)];
    activities.unshift(randomActivity);
    
    if (activities.length > 8) {
        activities.pop();
    }
    
    updateActivityFeed(activities);
}

function getActivityIcon(type) {
    const icons = {
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',
        truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
    };
    return icons[type] || icons.check;
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function generateDateLabels(days) {
    const labels = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return labels;
}

function getToday() {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current).toLocaleString();
    }, 16);
}

function updateDashboard() {
    const timeRange = document.getElementById('timeRangeFilter').value;
    const warehouse = document.getElementById('warehouseFilter').value;
    
    refreshDashboard();
}

function exportDashboard() {
    showNotification('Preparing dashboard export...', 'info');
    
    setTimeout(() => {
        window.print();
    }, 500);
}

function showNotification(message, type = 'info') {
    // Simple notification - can be enhanced with a proper notification system
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (refreshTimer) clearInterval(refreshTimer);
    if (activityTimer) clearInterval(activityTimer);
});
