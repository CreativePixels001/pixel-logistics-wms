/* ========================================
   PTM Agent Dashboard - JavaScript
   ======================================== */

// Dashboard Data
const dashboardData = {
    stats: {
        totalBookings: 127,
        revenue: 420000,
        activeCustomers: 89,
        avgRating: 4.8
    },
    recentBookings: [],
    upcomingTrips: []
};

// Initialize Dashboard
function initDashboard() {
    console.log('🎯 Initializing PTM Agent Dashboard...');
    loadDashboardData();
    initCharts();
    startAutoRefresh();
}

// Load Dashboard Data
function loadDashboardData() {
    // In production, fetch from API
    // For now, data is already in the HTML
    console.log('📊 Dashboard data loaded');
}

// View Booking Details
function viewBooking(bookingId) {
    console.log('📋 Viewing booking:', bookingId);
    window.location.href = `booking-details.html?id=${bookingId}`;
}

// Create New Booking
function createNewBooking() {
    console.log('➕ Creating new booking');
    window.location.href = 'create-booking.html';
}

// Add Customer
function addCustomer() {
    console.log('👤 Adding new customer');
    window.location.href = 'add-customer.html';
}

// Create Trip
function createTrip() {
    console.log('🗺️ Creating new trip');
    window.location.href = 'create-trip.html';
}

// View Reports
function viewReports() {
    console.log('📈 Viewing reports');
    window.location.href = 'analytics.html';
}

// Toggle Notifications
function toggleNotifications() {
    console.log('🔔 Toggling notifications');
    // In production, show notifications dropdown
    alert('Notifications:\n\n• New booking from Rajesh Sharma\n• Payment received: ₹47,997\n• Trip starting tomorrow: Goa Beach Escape');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('👋 Logging out...');
        sessionStorage.clear();
        localStorage.removeItem('ptmAuthToken');
        window.location.href = '../index.html';
    }
}

// Initialize Charts (Placeholder - Add Chart.js in production)
function initCharts() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Simple bar chart visualization
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 300;
    
    // Draw placeholder chart
    ctx.fillStyle = '#e5e5e5';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Chart visualization coming soon', canvas.width / 2, canvas.height / 2);
    ctx.fillText('(Integrate Chart.js for production)', canvas.width / 2, canvas.height / 2 + 20);
    
    console.log('📊 Charts initialized');
}

// Auto Refresh (Every 30 seconds)
function startAutoRefresh() {
    setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard data...');
        loadDashboardData();
    }, 30000);
}

// Real-time Updates Simulation
function simulateRealtimeUpdates() {
    setInterval(() => {
        // Simulate new notification
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            const currentCount = parseInt(notificationBadge.textContent);
            if (Math.random() > 0.8) {
                notificationBadge.textContent = currentCount + 1;
            }
        }
    }, 60000); // Every minute
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

// Search Bookings
function searchBookings(query) {
    console.log('🔍 Searching bookings:', query);
    const rows = document.querySelectorAll('#recentBookingsTable tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter by Status
function filterByStatus(status) {
    console.log('🔽 Filtering by status:', status);
    const rows = document.querySelectorAll('#recentBookingsTable tr');
    
    rows.forEach(row => {
        if (status === 'all') {
            row.style.display = '';
        } else {
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge && statusBadge.classList.contains(status)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Export Data
function exportData(format) {
    console.log('📤 Exporting data as:', format);
    
    if (format === 'csv') {
        exportAsCSV();
    } else if (format === 'pdf') {
        exportAsPDF();
    }
}

function exportAsCSV() {
    // Simple CSV export
    const headers = ['Booking ID', 'Customer', 'Trip', 'Date', 'Amount', 'Status'];
    const rows = [
        ['BK-2501', 'Rajesh Sharma', 'Goa Beach Escape', 'Dec 15, 2025', '47997', 'Confirmed'],
        ['BK-2500', 'Priya Kapoor', 'Royal Rajasthan Circuit', 'Dec 20, 2025', '71998', 'Pending Payment'],
        // Add more rows...
    ];
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${Date.now()}.csv`;
    a.click();
    
    console.log('✅ CSV exported');
}

function exportAsPDF() {
    console.log('📄 PDF export requires library integration');
    alert('PDF export coming soon!\n\nIntegrate jsPDF or similar library for production.');
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Quick search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        console.log('⌨️ Quick search triggered');
        // Focus search input (add search input in production)
    }
    
    // Ctrl/Cmd + N: New booking
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewBooking();
    }
});

// Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// Add mobile menu button (for mobile view)
if (window.innerWidth <= 768) {
    const topBar = document.querySelector('.top-bar-left');
    const menuBtn = document.createElement('button');
    menuBtn.className = 'btn-icon mobile-menu-btn';
    menuBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
    `;
    menuBtn.onclick = toggleSidebar;
    topBar.insertBefore(menuBtn, topBar.firstChild);
}

// Performance Monitoring
function monitorPerformance() {
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('⚡ Page load time:', loadTime + 'ms');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    simulateRealtimeUpdates();
    monitorPerformance();
    
    console.log('✅ PTM Agent Dashboard Ready');
    console.log('💼 Agent: Ashish Kumar');
    console.log('📊 Stats:', dashboardData.stats);
});

// Service Worker Registration (for offline support - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('🔧 Service Worker registered'))
            .catch(err => console.log('❌ SW registration failed:', err));
    });
}

// WebSocket Connection (for real-time updates - optional)
function connectWebSocket() {
    // In production, connect to WebSocket server
    // const ws = new WebSocket('ws://localhost:4000/ws');
    // ws.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
    //     handleRealtimeUpdate(data);
    // };
    console.log('🔌 WebSocket integration available for real-time updates');
}

// Handle Real-time Updates
function handleRealtimeUpdate(data) {
    switch(data.type) {
        case 'NEW_BOOKING':
            console.log('🆕 New booking received:', data.payload);
            // Update UI
            break;
        case 'PAYMENT_RECEIVED':
            console.log('💰 Payment received:', data.payload);
            // Update UI
            break;
        case 'TRIP_UPDATE':
            console.log('🗺️ Trip updated:', data.payload);
            // Update UI
            break;
    }
}

// Analytics Tracking
function trackEvent(category, action, label) {
    console.log('📈 Event tracked:', { category, action, label });
    
    // In production, send to Google Analytics or similar
    // gtag('event', action, {
    //     event_category: category,
    //     event_label: label
    // });
}

// Error Handling
window.addEventListener('error', (event) => {
    console.error('❌ Error:', event.error);
    // In production, send to error tracking service (Sentry, etc.)
});

// Print Dashboard
function printDashboard() {
    window.print();
}

// Share Dashboard
function shareDashboard() {
    if (navigator.share) {
        navigator.share({
            title: 'PTM Dashboard',
            text: 'Check out my PTM dashboard stats!',
            url: window.location.href
        });
    } else {
        console.log('📱 Share API not supported');
    }
}

console.log('🚀 PTM Dashboard Script Loaded');
