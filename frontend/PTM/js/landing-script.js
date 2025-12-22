/* ========================================
   PTM Landing Page - JavaScript
   ======================================== */

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navActions = document.querySelector('.nav-actions');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    navMenu.classList.toggle('active');
    navActions.classList.toggle('active');
    toggle.classList.toggle('active');
}

// Search Trips
function searchTrips() {
    const destination = document.getElementById('searchDestination').value;
    const duration = document.getElementById('searchDuration').value;
    const budget = document.getElementById('searchBudget').value;
    
    console.log('Searching trips:', { destination, duration, budget });
    
    // Show loading state
    const btn = document.querySelector('.btn-search');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/></svg> Searching...';
    btn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        // In production, navigate to search results
        window.location.href = `destinations.html?dest=${encodeURIComponent(destination)}&duration=${duration}&budget=${budget}`;
    }, 800);
}

// Filter by Category
function filterByCategory(category) {
    console.log('Filtering by category:', category);
    window.location.href = `destinations.html?category=${category}`;
}

// View Trip Details
function viewTrip(tripId) {
    console.log('Viewing trip:', tripId);
    window.location.href = `trip-details.html?id=${tripId}`;
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Trip Card Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.trip-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Feature Cards Animation
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Category Cards Animation
document.querySelectorAll('.category-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
    observer.observe(card);
});

// Search on Enter Key
document.getElementById('searchDestination')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchTrips();
    }
});

// Add spinning animation for loading
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

// Trip Data (Placeholder - In production, fetch from API)
const tripsData = [
    {
        id: 'RAJ-001',
        name: 'Royal Rajasthan Circuit',
        category: 'heritage',
        duration: 7,
        price: 35999,
        destination: 'Rajasthan',
        image: '/images/rajasthan.jpg',
        rating: 4.8
    },
    {
        id: 'KER-001',
        name: 'Kerala Backwaters & Beaches',
        category: 'beaches',
        duration: 5,
        price: 28999,
        destination: 'Kerala',
        image: '/images/kerala.jpg',
        rating: 4.9
    },
    {
        id: 'MAN-001',
        name: 'Manali Snow Adventure',
        category: 'mountains',
        duration: 6,
        price: 22499,
        destination: 'Himachal Pradesh',
        image: '/images/manali.jpg',
        rating: 4.7
    },
    {
        id: 'GOA-001',
        name: 'Goa Beach Escape',
        category: 'beaches',
        duration: 4,
        price: 15999,
        destination: 'Goa',
        image: '/images/goa.jpg',
        rating: 4.6
    },
    {
        id: 'LAD-001',
        name: 'Ladakh: Land of High Passes',
        category: 'adventure',
        duration: 8,
        price: 42999,
        destination: 'Ladakh',
        image: '/images/ladakh.jpg',
        rating: 4.9
    },
    {
        id: 'VAR-001',
        name: 'Varanasi Sacred Journey',
        category: 'pilgrimage',
        duration: 3,
        price: 12999,
        destination: 'Uttar Pradesh',
        image: '/images/varanasi.jpg',
        rating: 4.8
    }
];

// Store trips data in sessionStorage for other pages
sessionStorage.setItem('ptmTrips', JSON.stringify(tripsData));

console.log('✅ PTM Landing Page Initialized');
console.log('🗺️ Loaded', tripsData.length, 'trips');
