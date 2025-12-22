/* ========================================
   PTM Confirmation Page - JavaScript
   ======================================== */

let bookingData = null;

// Initialize confirmation page
function initializeConfirmationPage() {
    // Get confirmed booking data
    const confirmedBooking = sessionStorage.getItem('confirmedBooking');
    
    if (!confirmedBooking) {
        // Try to get from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('booking');
        
        if (bookingId) {
            // Try to load from localStorage
            const bookings = JSON.parse(localStorage.getItem('ptm_bookings') || '[]');
            bookingData = bookings.find(b => b.bookingId === bookingId);
        }
        
        if (!bookingData) {
            alert('❌ Booking not found. Redirecting to home...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
    } else {
        bookingData = JSON.parse(confirmedBooking);
    }
    
    console.log('✅ Booking Data:', bookingData);
    
    // Populate confirmation details
    populateConfirmationDetails();
    
    // Launch confetti
    launchConfetti();
    
    // Send confirmation email (simulate)
    sendConfirmationEmail();
}

// Populate confirmation details
function populateConfirmationDetails() {
    if (!bookingData) return;
    
    document.getElementById('customerEmail').textContent = bookingData.email;
    document.getElementById('confirmBookingId').textContent = bookingData.bookingId;
    document.getElementById('confirmTripName').textContent = bookingData.tripName;
    document.getElementById('confirmTravelDate').textContent = formatDate(bookingData.travelDate);
    document.getElementById('confirmTravelers').textContent = `${bookingData.travelers} person${bookingData.travelers > 1 ? 's' : ''}`;
    document.getElementById('confirmAmount').textContent = '₹' + bookingData.pricing.total.toLocaleString('en-IN');
    document.getElementById('confirmPaymentMethod').textContent = getPaymentMethodName(bookingData.paymentMethod);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Get payment method name
function getPaymentMethodName(method) {
    const methods = {
        'upi': 'UPI',
        'card': 'Credit/Debit Card',
        'netbanking': 'Net Banking',
        'wallet': 'Wallet'
    };
    return methods[method] || 'UPI';
}

// Copy booking ID
function copyBookingId() {
    const bookingId = bookingData.bookingId;
    
    navigator.clipboard.writeText(bookingId)
        .then(() => {
            const btn = event.target.closest('.btn-copy');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied!
            `;
            
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
            
            console.log('[COPIED] Booking ID:', bookingId);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy booking ID');
        });
}

// Download voucher
function downloadVoucher() {
    console.log('[VOUCHER] Downloading voucher...');
    
    // In production, generate PDF using jsPDF or call backend API
    alert(`BOOKING VOUCHER\n\nDownloading voucher for:\n\nBooking ID: ${bookingData.bookingId}\nTrip: ${bookingData.tripName}\nAmount: ₹${bookingData.pricing.total.toLocaleString('en-IN')}\n\nThis feature will generate a professional PDF voucher in production.`);
    
    // Simulate download
    console.log('Voucher data:', {
        bookingId: bookingData.bookingId,
        tripName: bookingData.tripName,
        customerName: bookingData.fullName,
        travelDate: bookingData.travelDate,
        travelers: bookingData.travelers,
        amount: bookingData.pricing.total,
        paymentId: bookingData.paymentId
    });
}

// Share booking
function shareBooking() {
    const shareText = `I just booked "${bookingData.tripName}" with Pixel Trip!\n\nBooking ID: ${bookingData.bookingId}\nTravel Date: ${formatDate(bookingData.travelDate)}\n\nBook your trip: ${window.location.origin}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Trip Booked - Pixel Trip',
            text: shareText,
            url: window.location.origin
        })
        .then(() => console.log('[SUCCESS] Shared successfully'))
        .catch(err => console.log('Share cancelled'));
    } else {
        // Fallback - WhatsApp share
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Send confirmation email (simulate)
function sendConfirmationEmail() {
    console.log('[EMAIL] Sending confirmation email...');
    
    // In production, call backend API
    /*
    fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bookingId: bookingData.bookingId,
            email: bookingData.email,
            customerName: bookingData.fullName,
            tripDetails: bookingData
        })
    });
    */
    
    setTimeout(() => {
        console.log('[SUCCESS] Confirmation email sent to:', bookingData.email);
    }, 1000);
}

// Confetti animation
function launchConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#000000', '#262626', '#404040', '#525252', '#737373'];
    
    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 8 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let activeParticles = 0;
        
        particles.forEach(p => {
            if (p.y < canvas.height) {
                activeParticles++;
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
                
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.vy += 0.1; // gravity
            }
        });
        
        if (activeParticles > 0) {
            requestAnimationFrame(animate);
        } else {
            // Remove canvas after animation
            setTimeout(() => {
                canvas.style.opacity = '0';
                setTimeout(() => canvas.remove(), 500);
            }, 500);
        }
    }
    
    animate();
}

// Analytics tracking
function trackConfirmationEvent() {
    console.log('[ANALYTICS] Tracking confirmation event');
    
    const eventData = {
        booking_id: bookingData.bookingId,
        trip_name: bookingData.tripName,
        amount: bookingData.pricing.total,
        travelers: bookingData.travelers,
        payment_method: bookingData.paymentMethod
    };
    
    console.log('Event data:', eventData);
    
    // In production, send to Google Analytics
    // gtag('event', 'purchase', { ...eventData });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeConfirmationPage();
    trackConfirmationEvent();
});

// Prevent back navigation
window.addEventListener('popstate', (e) => {
    // Prevent going back to payment page
    if (confirm('Do you want to go back to home page?')) {
        window.location.href = 'index.html';
    } else {
        window.history.pushState(null, '', window.location.href);
    }
});

// Add initial history state
window.history.pushState(null, '', window.location.href);

console.log('[INIT] Confirmation Page Initialized');
console.log('[SUCCESS] Booking Confirmed:', bookingData?.bookingId);
