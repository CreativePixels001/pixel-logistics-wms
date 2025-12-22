/* ===================================
   Pi-Trip - Main JavaScript
   Landing Page Functionality
   ================================== */

// Demo Routes Data
const routes = [
    {
        id: 'MLH-001',
        title: 'Manali to Leh Highway',
        description: 'World\'s highest motorable road. Experience breathtaking Himalayan passes, stunning landscapes, and the thrill of high-altitude riding.',
        distance: '475 km',
        duration: '10 Days',
        difficulty: 'hard',
        category: 'mountains',
        badge: 'Epic Ride',
        highlights: ['5 High Passes', '18,380 ft Altitude', '12 Verified Stops'],
        riders: '2.4K',
        rating: 4.9
    },
    {
        id: 'MGO-001',
        title: 'Mumbai to Goa Coastal Highway',
        description: 'Scenic coastal route with beautiful beaches, winding roads, and amazing sunset views. Perfect for beginners and weekend riders.',
        distance: '580 km',
        duration: '3 Days',
        difficulty: 'easy',
        category: 'coastal',
        badge: 'Popular',
        highlights: ['8 Beach Stops', 'Sea Level Roads', '24 Verified Stops'],
        riders: '5.2K',
        rating: 4.8
    },
    {
        id: 'GT-001',
        title: 'Delhi - Agra - Jaipur Circuit',
        description: 'India\'s famous Golden Triangle. Explore magnificent forts, palaces, and UNESCO World Heritage sites on smooth highways.',
        distance: '720 km',
        duration: '7 Days',
        difficulty: 'medium',
        category: 'heritage',
        badge: 'Heritage',
        highlights: ['8 UNESCO Sites', 'Smooth Highways', '30 Verified Stops'],
        riders: '3.8K',
        rating: 4.7
    },
    {
        id: 'RDS-001',
        title: 'Rajasthan Desert Explorer',
        description: 'Ride through the Thar Desert, explore royal forts, and experience authentic Rajasthani culture. Jaipur-Jodhpur-Jaisalmer loop.',
        distance: '850 km',
        duration: '8 Days',
        difficulty: 'medium',
        category: 'desert',
        badge: 'Adventure',
        highlights: ['Desert Safari', '6 Royal Forts', '22 Verified Stops'],
        riders: '1.9K',
        rating: 4.6
    },
    {
        id: 'BCC-001',
        title: 'Bangalore to Coorg Coffee Trail',
        description: 'Perfect weekend getaway through coffee plantations and misty hills. Scenic roads with minimal traffic.',
        distance: '265 km',
        duration: '2 Days',
        difficulty: 'easy',
        category: 'mountains',
        badge: 'Weekend',
        highlights: ['Coffee Estates', 'Hill Views', '14 Verified Stops'],
        riders: '4.5K',
        rating: 4.8
    },
    {
        id: 'NEL-001',
        title: 'Northeast India Grand Loop',
        description: 'Ultimate adventure through all seven sister states. Experience diverse cultures, pristine landscapes, and unexplored roads.',
        distance: '2,400 km',
        duration: '14 Days',
        difficulty: 'hard',
        category: 'mountains',
        badge: 'Epic Ride',
        highlights: ['7 States', 'Mountain Passes', '45 Verified Stops'],
        riders: '890',
        rating: 4.9
    }
];

// ===================================
// DOM Ready
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// ===================================
// Initialize Application
// ===================================

function initializeApp() {
    // Initialize category filters
    initCategoryFilters();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize intersection observer for animations
    initScrollAnimations();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
    
    console.log('Pi-Trip initialized successfully!');
}

// ===================================
// Mobile Menu Toggle
// ===================================

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navActions = document.querySelector('.nav-actions');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navMenu && navActions) {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        navActions.style.display = navActions.style.display === 'flex' ? 'none' : 'flex';
        menuToggle.classList.toggle('active');
    }
}

// ===================================
// Category Filters
// ===================================

function initCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Filter routes
            const category = button.dataset.category;
            filterRoutes(category);
        });
    });
}

function filterRoutes(category) {
    const routeCards = document.querySelectorAll('.route-card');
    
    routeCards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            const cardCategory = card.dataset.category;
            if (cardCategory === category) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// ===================================
// Search Functionality
// ===================================

function searchRoutes() {
    const searchFrom = document.getElementById('searchFrom').value.trim();
    const searchTo = document.getElementById('searchTo').value.trim();
    const searchDuration = document.getElementById('searchDuration').value;
    
    // For now, just show an alert (will be replaced with actual search logic)
    if (!searchFrom || !searchTo) {
        showNotification('Please enter both starting point and destination', 'warning');
        return;
    }
    
    // Demo: Show notification
    showNotification(`Searching routes from ${searchFrom} to ${searchTo}...`, 'info');
    
    // In a real app, this would make an API call
    setTimeout(() => {
        showNotification('Found 12 routes! Scroll down to view.', 'success');
        // Smooth scroll to routes section
        document.getElementById('routes').scrollIntoView({ behavior: 'smooth' });
    }, 1000);
}

// ===================================
// View Route Details
// ===================================

function viewRoute(from, to, distance, duration, category) {
    console.log('🚗 viewRoute called with:', { from, to, distance, duration, category });
    
    // Create trip title for matching database
    const title = `${from} to ${to}`;
    console.log('📍 Trip title:', title);
    
    // Store route data for itinerary page
    const routeData = {
        from: from,
        to: to,
        title: title,
        distance: distance,
        duration: duration,
        category: category,
        timestamp: Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem('selectedRoute', JSON.stringify(routeData));
    console.log('💾 Saved to localStorage:', routeData);
    
    // Navigate to trip details page
    const url = 'trip-details.html?id=' + encodeURIComponent(title);
    console.log('🔗 Navigating to:', url);
    window.location.href = url;
}

// ===================================
// Smooth Scrolling
// ===================================

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Scroll to section
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                if (window.innerWidth <= 768 && navMenu.style.display === 'flex') {
                    toggleMobileMenu();
                }
            }
        });
    });
}

// ===================================
// Navbar Scroll Effect
// ===================================

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// ===================================
// Scroll Animations
// ===================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe route cards
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach(card => observer.observe(card));
    
    // Observe feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => observer.observe(card));
    
    // Observe step cards
    const stepCards = document.querySelectorAll('.step-card');
    stepCards.forEach(card => observer.observe(card));
}

// ===================================
// Notifications
// ===================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification
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
        animation: 'slideIn 0.3s ease-out',
        opacity: '0',
        transform: 'translateX(100%)'
    });
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Utility Functions
// ===================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format number with K/M suffix
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ===================================
// Route Data Export (for future use)
// ===================================

window.piTripData = {
    routes,
    getRouteById: (id) => routes.find(r => r.id === id),
    getRoutesByCategory: (category) => routes.filter(r => r.category === category),
    getPopularRoutes: () => routes.sort((a, b) => parseFloat(b.riders) - parseFloat(a.riders)).slice(0, 3),
    getTopRatedRoutes: () => routes.sort((a, b) => b.rating - a.rating).slice(0, 3)
};

// ===================================
// Console Welcome Message
// ===================================

console.log(`
%c Pi-Trip 🏍️
%c Plan Together. Ride Together.
%c Powered by Pi AI • Part of Pixel Ecosystem

`, 
'font-size: 24px; font-weight: bold; color: #000;',
'font-size: 14px; color: #666;',
'font-size: 12px; color: #999;'
);

// ===================================
// Export Functions for Global Access
// ===================================

window.toggleMobileMenu = toggleMobileMenu;
window.searchRoutes = searchRoutes;
window.viewRoute = viewRoute;
window.showNotification = showNotification;
