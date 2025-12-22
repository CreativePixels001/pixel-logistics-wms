/* ===================================
   Pi-Trip - Dashboard JavaScript
   Trip Management Functions
   ================================== */

// Load user data
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    initializeDashboard();
});

// ===================================
// Load User Data
// ===================================

function loadUserData() {
    const user = localStorage.getItem('piTripUser') || sessionStorage.getItem('piTripUser');
    
    if (user) {
        const userData = JSON.parse(user);
        document.getElementById('userName').textContent = userData.name || 'Rider';
    } else {
        // Redirect to login if not authenticated
        // window.location.href = 'auth/login.html';
    }
}

// ===================================
// Initialize Dashboard
// ===================================

function initializeDashboard() {
    console.log('Dashboard initialized');
    
    // Check if there are no trips and show empty state
    const tripsGrid = document.getElementById('tripsGrid');
    if (tripsGrid && tripsGrid.children.length === 0) {
        document.querySelector('.empty-state').style.display = 'block';
    }
}

// ===================================
// Trip Filters
// ===================================

function filterTrips(status) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter trip cards
    const tripCards = document.querySelectorAll('.trip-card');
    
    tripCards.forEach(card => {
        if (status === 'all') {
            card.style.display = 'flex';
        } else {
            const cardStatus = card.dataset.status;
            if (cardStatus === status) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    // Show empty state if no trips match
    const visibleTrips = Array.from(tripCards).filter(card => card.style.display !== 'none');
    const emptyState = document.querySelector('.empty-state');
    
    if (visibleTrips.length === 0) {
        emptyState.style.display = 'block';
        emptyState.querySelector('h2').textContent = `No ${status} trips`;
        emptyState.querySelector('p').textContent = status === 'upcoming' 
            ? 'Plan your next adventure!' 
            : status === 'ongoing' 
            ? 'No trips currently in progress' 
            : 'No completed trips yet';
    } else {
        emptyState.style.display = 'none';
    }
}

// ===================================
// Live Tracking
// ===================================

function openLiveTracking(tripId) {
    console.log('Opening live tracking for trip:', tripId);
    showNotification('Live tracking opening... 🗺️', 'info');
    
    // In a real app, this would open a map view with real-time location
    setTimeout(() => {
        // window.location.href = `live-tracking.html?trip=${tripId}`;
        showNotification('Live tracking feature coming soon!', 'success');
    }, 500);
}

// ===================================
// Trip Details
// ===================================

function openTripDetails(tripId) {
    console.log('Opening trip details:', tripId);
    showNotification('Loading trip details...', 'info');
    
    // In a real app, this would open trip details page
    setTimeout(() => {
        // window.location.href = `trip-details.html?id=${tripId}`;
        showNotification('Trip details page coming soon!', 'success');
    }, 500);
}

// ===================================
// Invite Friends
// ===================================

function inviteFriends(tripId) {
    console.log('Inviting friends to trip:', tripId);
    
    const phone = prompt('Enter friend\'s phone number or email:');
    
    if (phone) {
        showNotification(`Invitation sent to ${phone}! 📧`, 'success');
        // In a real app, this would send actual invitation
    }
}

// ===================================
// Continue Planning
// ===================================

function continuePlanning(tripId) {
    console.log('Continuing planning for trip:', tripId);
    showNotification('Redirecting to trip planner...', 'info');
    
    // In a real app, this would resume the wizard with saved data
    setTimeout(() => {
        window.location.href = 'trip-wizard.html';
    }, 1000);
}

// ===================================
// View Trip Memories
// ===================================

function viewTripMemories(tripId) {
    console.log('Viewing memories for trip:', tripId);
    showNotification('Loading trip memories... 📸', 'info');
    
    // In a real app, this would open photo gallery and trip journal
    setTimeout(() => {
        // window.location.href = `trip-memories.html?id=${tripId}`;
        showNotification('Trip memories page coming soon!', 'success');
    }, 500);
}

// ===================================
// Share Trip
// ===================================

function shareTrip(tripId) {
    console.log('Sharing trip:', tripId);
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'My Pi-Trip Adventure',
            text: 'Check out my amazing road trip!',
            url: window.location.href
        }).then(() => {
            showNotification('Trip shared successfully!', 'success');
        }).catch((error) => {
            console.log('Share failed:', error);
        });
    } else {
        // Fallback - copy link
        const link = `${window.location.origin}/trip/${tripId}`;
        navigator.clipboard.writeText(link).then(() => {
            showNotification('Trip link copied to clipboard!', 'success');
        });
    }
}

// ===================================
// Trip Menu
// ===================================

function showTripMenu(event, tripId) {
    event.stopPropagation();
    
    const options = [
        'View Details',
        'Edit Trip',
        'Invite Friends',
        'Download Itinerary',
        'Delete Trip'
    ];
    
    // Simple prompt-based menu (in real app, use modal)
    const choice = prompt(`Trip Menu:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nEnter choice (1-${options.length}):`);
    
    if (choice) {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < options.length) {
            handleTripMenuAction(tripId, options[index]);
        }
    }
}

function handleTripMenuAction(tripId, action) {
    console.log(`Action: ${action} for trip: ${tripId}`);
    
    switch (action) {
        case 'View Details':
            openTripDetails(tripId);
            break;
        case 'Edit Trip':
            showNotification('Edit feature coming soon!', 'info');
            break;
        case 'Invite Friends':
            inviteFriends(tripId);
            break;
        case 'Download Itinerary':
            showNotification('Downloading itinerary... 📄', 'success');
            break;
        case 'Delete Trip':
            if (confirm('Are you sure you want to delete this trip?')) {
                showNotification('Trip deleted successfully', 'success');
                // In real app, remove from backend and UI
            }
            break;
    }
}

// ===================================
// Mobile Menu Toggle
// ===================================

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navActions = document.querySelector('.nav-actions');
    
    if (navMenu && navActions) {
        const isVisible = navMenu.style.display === 'flex';
        navMenu.style.display = isVisible ? 'none' : 'flex';
        navActions.style.display = isVisible ? 'none' : 'flex';
    }
}

// ===================================
// Logout
// ===================================

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('piTripUser');
        sessionStorage.removeItem('piTripUser');
        showNotification('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ===================================
// Notifications
// ===================================

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '90px',
        right: '20px',
        padding: '1rem 1.5rem',
        background: type === 'success' ? '#000' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: '#fff',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: '9999',
        fontWeight: '600',
        fontSize: '0.875rem',
        maxWidth: '400px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===================================
// Export Functions
// ===================================

window.filterTrips = filterTrips;
window.openLiveTracking = openLiveTracking;
window.openTripDetails = openTripDetails;
window.inviteFriends = inviteFriends;
window.continuePlanning = continuePlanning;
window.viewTripMemories = viewTripMemories;
window.shareTrip = shareTrip;
window.showTripMenu = showTripMenu;
window.toggleMobileMenu = toggleMobileMenu;
window.logout = logout;

console.log('%c Pi-Trip Dashboard 📊', 'font-size: 20px; font-weight: bold; color: #000;');
