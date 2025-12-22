// Logistics Dashboard JavaScript
// Handles stats, activity feed, and data management

const LogisticsDashboard = {
    // Local storage keys
    STORAGE_KEY: 'pixelaudit_logistics_audits',
    
    // Initialize dashboard
    init() {
        this.loadStats();
        this.loadActivity();
        console.log('✅ Logistics Dashboard initialized');
    },
    
    // Load statistics from localStorage
    loadStats() {
        const audits = this.getAudits();
        
        // Calculate stats
        const total = audits.length;
        const pending = audits.filter(a => a.status === 'pending').length;
        const completed = audits.filter(a => a.status === 'completed').length;
        const activeDrivers = this.getUniqueDrivers(audits).length;
        
        // Update UI
        document.getElementById('totalAudits').textContent = total;
        document.getElementById('pendingAudits').textContent = pending;
        document.getElementById('completedAudits').textContent = completed;
        document.getElementById('activeDrivers').textContent = activeDrivers;
        
        // Calculate month-over-month change
        const completedChange = this.calculateMonthChange(audits);
        const changeElement = document.getElementById('completedChange');
        if (completedChange > 0) {
            changeElement.textContent = `+${completedChange}% this month`;
            changeElement.className = 'stat-change up';
        } else if (completedChange < 0) {
            changeElement.textContent = `${completedChange}% this month`;
            changeElement.className = 'stat-change down';
        } else {
            changeElement.textContent = 'No change this month';
            changeElement.className = 'stat-change';
        }
        
        // Update total change message
        const totalChange = document.getElementById('totalChange');
        if (total > 0) {
            totalChange.textContent = `${total} audits created`;
            totalChange.className = 'stat-change up';
        } else {
            totalChange.textContent = 'Start your first audit';
            totalChange.className = 'stat-change';
        }
    },
    
    // Load recent activity
    loadActivity() {
        const audits = this.getAudits();
        const recentAudits = audits.slice(-10).reverse(); // Last 10, newest first
        
        const activityFeed = document.getElementById('activityFeed');
        
        if (recentAudits.length === 0) {
            // Keep empty state
            return;
        }
        
        // Build activity HTML
        let html = '';
        recentAudits.forEach(audit => {
            const icon = this.getActivityIcon(audit.category, audit.status);
            const timeAgo = this.getTimeAgo(audit.createdAt);
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        ${icon}
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">
                            <strong>${audit.templateName}</strong> audit ${this.getStatusText(audit.status)} 
                            for <strong>${audit.clientName}</strong>
                        </div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        });
        
        activityFeed.innerHTML = html;
    },
    
    // Get audits from localStorage
    getAudits() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    // Get unique drivers from audits
    getUniqueDrivers(audits) {
        const drivers = audits.map(a => a.auditorName).filter(Boolean);
        return [...new Set(drivers)];
    },
    
    // Calculate month-over-month completion change
    calculateMonthChange(audits) {
        const now = new Date();
        const thisMonth = audits.filter(a => {
            const date = new Date(a.createdAt);
            return date.getMonth() === now.getMonth() && 
                   date.getFullYear() === now.getFullYear() &&
                   a.status === 'completed';
        }).length;
        
        const lastMonth = audits.filter(a => {
            const date = new Date(a.createdAt);
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
            return date.getMonth() === lastMonthDate.getMonth() && 
                   date.getFullYear() === lastMonthDate.getFullYear() &&
                   a.status === 'completed';
        }).length;
        
        if (lastMonth === 0) return 0;
        return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    },
    
    // Get activity icon based on category and status
    getActivityIcon(category, status) {
        const icons = {
            warehouse: '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
            driver: '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
            vehicle: '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
            trip: '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
        };
        return icons[category] || icons.warehouse;
    },
    
    // Get status text
    getStatusText(status) {
        const texts = {
            pending: 'is pending review',
            completed: 'was completed',
            in_progress: 'is in progress',
            assigned: 'was assigned'
        };
        return texts[status] || 'was created';
    },
    
    // Get time ago text
    getTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return date.toLocaleDateString();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LogisticsDashboard;
}
