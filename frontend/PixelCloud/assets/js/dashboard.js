// PixelCloud Dashboard - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initSidebarNavigation();
    initMobileSidebar();
    initRealTimeUpdates();
    initQuickActions();
    initActivityFeed();
});

/**
 * Sidebar Navigation
 */
function initSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section with fade effect
            contentSections.forEach(section => {
                if (section.id === targetSection + '-section') {
                    section.style.opacity = '0';
                    section.classList.add('active');
                    setTimeout(() => {
                        section.style.opacity = '1';
                        section.style.transition = 'opacity 0.3s ease-in-out';
                    }, 10);
                } else {
                    section.classList.remove('active');
                }
            });
            
            // Close mobile sidebar
            if (window.innerWidth < 992) {
                document.getElementById('dashboardSidebar').classList.remove('show');
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

/**
 * Mobile Sidebar Toggle
 */
function initMobileSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('dashboardSidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 992) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        }
    });
}

/**
 * Real-time Updates Simulation
 */
function initRealTimeUpdates() {
    // Simulate real-time metric updates
    setInterval(() => {
        updateServerMetrics();
        updateStatCards();
    }, 5000); // Update every 5 seconds
}

function updateServerMetrics() {
    const metrics = document.querySelectorAll('.metric strong');
    
    metrics.forEach(metric => {
        const currentValue = parseInt(metric.textContent);
        if (!isNaN(currentValue)) {
            // Random fluctuation ±5%
            const change = Math.floor(Math.random() * 10) - 5;
            const newValue = Math.max(0, Math.min(100, currentValue + change));
            metric.textContent = newValue + '%';
            
            // Update color based on value
            if (newValue > 80) {
                metric.classList.add('text-danger');
                metric.classList.remove('text-warning');
            } else if (newValue > 60) {
                metric.classList.add('text-warning');
                metric.classList.remove('text-danger');
            } else {
                metric.classList.remove('text-warning', 'text-danger');
            }
        }
    });
}

function updateStatCards() {
    // Randomly update some stat values for demo
    const statValues = document.querySelectorAll('.stat-value');
    if (Math.random() > 0.7) { // 30% chance to update
        const randomStat = statValues[Math.floor(Math.random() * statValues.length)];
        const currentValue = parseInt(randomStat.textContent);
        if (!isNaN(currentValue) && currentValue < 100) {
            // Add subtle animation
            randomStat.style.transform = 'scale(1.1)';
            setTimeout(() => {
                randomStat.style.transform = 'scale(1)';
                randomStat.style.transition = 'transform 0.3s ease';
            }, 200);
        }
    }
}

/**
 * Quick Actions
 */
function initQuickActions() {
    // Add click handlers to all quick action buttons
    const quickActionButtons = document.querySelectorAll('.quick-action-card, .btn');
    
    quickActionButtons.forEach(button => {
        if (!button.hasAttribute('data-bs-toggle') && !button.hasAttribute('onclick')) {
            button.addEventListener('click', function(e) {
                if (this.textContent.includes('Generate SSL')) {
                    showInfo('Opening SSL Certificate Generator...');
                } else if (this.textContent.includes('Backup')) {
                    showInfo('Starting backup process...');
                } else if (this.textContent.includes('Monitor')) {
                    showInfo('Opening monitoring dashboard...');
                }
            });
        }
    });
}

/**
 * Activity Feed Animation
 */
function initActivityFeed() {
    // Simulate new activity items
    setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance
            addActivityItem();
        }
    }, 15000); // Check every 15 seconds
}

function addActivityItem() {
    const activities = [
        { icon: 'ssl', text: 'SSL certificate auto-renewed for <strong>example.com</strong>' },
        { icon: 'backup', text: 'Automated backup completed for <strong>database-server</strong>' },
        { icon: 'server', text: 'Server <strong>prod-server-01</strong> restarted successfully' },
        { icon: 'domain', text: 'DNS record updated for <strong>testsite.com</strong>' }
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const activityList = document.querySelector('.activity-list');
    
    if (activityList) {
        const newItem = document.createElement('div');
        newItem.className = 'activity-item';
        newItem.style.opacity = '0';
        newItem.innerHTML = `
            <div class="activity-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <div class="activity-content">
                <p class="mb-0 small">${activity.text}</p>
                <small class="text-muted">Just now</small>
            </div>
        `;
        
        // Add to top of list
        activityList.insertBefore(newItem, activityList.firstChild);
        
        // Fade in animation
        setTimeout(() => {
            newItem.style.opacity = '1';
            newItem.style.transition = 'opacity 0.5s ease-in-out';
        }, 100);
        
        // Keep only last 10 items
        const items = activityList.querySelectorAll('.activity-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
        
        // Show notification
        showInfo('New activity: ' + activity.text.replace(/<\/?strong>/g, ''));
    }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format uptime
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

/**
 * Format time ago
 */
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return "Just now";
}

