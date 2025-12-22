/* ========================================
   PTM Booking Flow - JavaScript
   ======================================== */

// Trip pricing and configuration
const tripConfig = {
    'RAJ-001': {
        name: 'Royal Rajasthan Circuit',
        basePrice: 35999,
        maxTravelers: 15,
        minTravelers: 1,
        gstRate: 0.05
    },
    'KER-001': {
        name: 'Kerala Backwaters & Beaches',
        basePrice: 28999,
        maxTravelers: 12,
        minTravelers: 1,
        gstRate: 0.05
    },
    'GOA-001': {
        name: 'Goa Beach Escape',
        basePrice: 15999,
        maxTravelers: 20,
        minTravelers: 1,
        gstRate: 0.05
    }
};

// Get current trip ID from URL or default
function getCurrentTripId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'RAJ-001';
}

const currentTrip = tripConfig[getCurrentTripId()] || tripConfig['RAJ-001'];
let travelerCount = 2;

// Update traveler count
function updateTravelers(change) {
    const newCount = travelerCount + change;
    
    if (newCount < currentTrip.minTravelers || newCount > currentTrip.maxTravelers) {
        return;
    }
    
    travelerCount = newCount;
    document.getElementById('travelerCount').textContent = travelerCount;
    updatePriceBreakdown();
}

// Calculate and update price breakdown
function updatePriceBreakdown() {
    const baseTotal = currentTrip.basePrice * travelerCount;
    const gst = Math.round(baseTotal * currentTrip.gstRate);
    const total = baseTotal + gst;
    
    document.getElementById('breakdown-count').textContent = travelerCount;
    document.getElementById('breakdown-base').textContent = baseTotal.toLocaleString('en-IN');
    document.getElementById('breakdown-gst').textContent = gst.toLocaleString('en-IN');
    document.getElementById('breakdown-total').textContent = total.toLocaleString('en-IN');
    
    return { baseTotal, gst, total };
}

// Handle booking form submission
function handleBooking(event) {
    console.log('[BOOKING] Form submitted');
    event.preventDefault();
    
    console.log('[BOOKING] Event prevented, processing...');
    
    // Get form data
    const formData = {
        tripId: getCurrentTripId(),
        tripName: currentTrip.name,
        travelDate: document.getElementById('travelDate').value,
        travelers: travelerCount,
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        pricing: updatePriceBreakdown()
    };
    
    console.log('[BOOKING] Form data collected:', formData);
    
    // Validate travel date
    const selectedDate = new Date(formData.travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('[BOOKING] Validating date:', selectedDate, 'vs', today);
    
    if (selectedDate < today) {
        alert('Please select a future date for your trip');
        console.log('[BOOKING] Date validation failed');
        return;
    }
    
    console.log('[BOOKING] Date validation passed');
    
    // Store booking data
    sessionStorage.setItem('pendingBooking', JSON.stringify(formData));
    
    console.log('[BOOKING] Data stored in sessionStorage');
    console.log('[BOOKING] Booking Data:', formData);
    
    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    console.log('[BOOKING] Submit button found:', submitBtn);
    
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10"/>
        </svg>
        Processing...
    `;
    
    console.log('[BOOKING] Button updated, starting redirect timer');
    
    // Simulate API call to create booking
    setTimeout(() => {
        console.log('[BOOKING] Timer completed, generating booking ID');
        
        // Generate booking ID
        const bookingId = 'BK-' + Date.now().toString().slice(-6);
        formData.bookingId = bookingId;
        formData.status = 'PENDING_PAYMENT';
        formData.createdAt = new Date().toISOString();
        
        sessionStorage.setItem('pendingBooking', JSON.stringify(formData));
        
        console.log('[SUCCESS] Booking created:', bookingId);
        console.log('[REDIRECT] Redirecting to payment page...');
        
        // Redirect to payment page
        window.location.href = `payment.html?booking=${bookingId}`;
    }, 1000);
}

// Initialize date picker with minimum date
function initializeDatePicker() {
    const dateInput = document.getElementById('travelDate');
    if (dateInput) {
        // Set minimum date to 7 days from now
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 7);
        dateInput.min = minDate.toISOString().split('T')[0];
        
        // Set default date to 15 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 15);
        dateInput.value = defaultDate.toISOString().split('T')[0];
    }
}

// Phone number formatting
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('91')) {
        value = value.substring(2);
    }
    
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    if (value.length > 5) {
        value = value.substring(0, 5) + ' ' + value.substring(5);
    }
    
    input.value = value ? '+91 ' + value : '';
}

// Add phone formatting on input
document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => formatPhoneNumber(e.target));
        phoneInput.addEventListener('focus', (e) => {
            if (!e.target.value) {
                e.target.value = '+91 ';
            }
        });
    }
    
    // Initialize
    initializeDatePicker();
    updatePriceBreakdown();
});

// Add to favorites
function addToFavorites() {
    const favorites = JSON.parse(localStorage.getItem('ptm_favorites') || '[]');
    const tripId = getCurrentTripId();
    
    if (!favorites.includes(tripId)) {
        favorites.push(tripId);
        localStorage.setItem('ptm_favorites', JSON.stringify(favorites));
        console.log('❤️ Added to favorites');
        alert('✅ Trip added to your favorites!');
    } else {
        alert('ℹ️ This trip is already in your favorites');
    }
}

// Share trip
function shareTrip() {
    const tripId = getCurrentTripId();
    const url = `${window.location.origin}/trip-details.html?id=${tripId}`;
    
    if (navigator.share) {
        navigator.share({
            title: currentTrip.name,
            text: `Check out this amazing trip: ${currentTrip.name}`,
            url: url
        })
        .then(() => console.log('✅ Shared successfully'))
        .catch((err) => console.log('❌ Share failed:', err));
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(url)
            .then(() => alert('✅ Link copied to clipboard!'))
            .catch(() => alert('❌ Failed to copy link'));
    }
}

// Contact agent
function contactAgent() {
    const phone = '+918888888888';
    const message = encodeURIComponent(`Hi! I'm interested in the ${currentTrip.name} trip. Can you help me with booking?`);
    
    if (confirm('📞 Would you like to contact our travel agent on WhatsApp?')) {
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
}

// Download itinerary
function downloadItinerary() {
    console.log('📄 Downloading itinerary...');
    
    // In production, generate PDF using library like jsPDF
    alert(`📄 Itinerary Download\n\nThis feature will download a detailed PDF itinerary for ${currentTrip.name}.\n\nIntegrate jsPDF or similar library in production.`);
}

// Request custom quote
function requestCustomQuote() {
    const formData = {
        tripId: getCurrentTripId(),
        tripName: currentTrip.name,
        requestedAt: new Date().toISOString()
    };
    
    console.log('💬 Custom quote requested:', formData);
    
    alert(`💬 Custom Quote Request\n\nThank you for your interest! Our travel experts will contact you within 24 hours to create a personalized itinerary.\n\nTrip: ${currentTrip.name}\n\nYou can also WhatsApp us at +91 888-888-8888`);
}

// View similar trips
function viewSimilarTrips() {
    window.location.href = 'destinations.html?category=heritage';
}

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
}

// Add real-time validation
document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    if (emailInput) {
        emailInput.addEventListener('blur', (e) => {
            if (e.target.value && !validateEmail(e.target.value)) {
                e.target.style.borderColor = 'var(--gray-500)';
                // Show error message in production
            } else {
                e.target.style.borderColor = 'var(--gray-300)';
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('blur', (e) => {
            if (e.target.value && !validatePhone(e.target.value)) {
                e.target.style.borderColor = 'var(--gray-500)';
            } else {
                e.target.style.borderColor = 'var(--gray-300)';
            }
        });
    }
});

// Analytics tracking
function trackBookingEvent(action) {
    console.log('📊 Analytics Event:', {
        category: 'Booking',
        action: action,
        label: currentTrip.name,
        value: currentTrip.basePrice
    });
    
    // In production, send to Google Analytics
    // gtag('event', action, { ... });
}

// Track page view
trackBookingEvent('view_trip_details');

// Add scroll animations for itinerary
const itineraryObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const itineraryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, itineraryObserverOptions);

document.querySelectorAll('.itinerary-day').forEach((day, index) => {
    day.style.opacity = '0';
    day.style.transform = 'translateY(20px)';
    day.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    itineraryObserver.observe(day);
});

// Add spinning animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('✅ Booking Flow Initialized');
console.log('🗺️ Current Trip:', currentTrip.name);
console.log('💰 Base Price: ₹' + currentTrip.basePrice.toLocaleString('en-IN'));
