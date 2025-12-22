/* ========================================
   PTM Payment Flow - JavaScript
   ======================================== */

let selectedPaymentMethod = 'upi';
let bookingData = null;

// Initialize payment page
function initializePaymentPage() {
    // Get booking data from session
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    
    if (!pendingBooking) {
        alert('❌ No booking found. Please start from trip details page.');
        window.location.href = 'index.html';
        return;
    }
    
    bookingData = JSON.parse(pendingBooking);
    console.log('📋 Booking Data:', bookingData);
    
    // Populate summary
    populateBookingSummary();
}

// Populate booking summary
function populateBookingSummary() {
    if (!bookingData) return;
    
    document.getElementById('summaryTripName').textContent = bookingData.tripName;
    document.getElementById('summaryBookingId').textContent = bookingData.bookingId;
    document.getElementById('summaryTravelDate').textContent = formatDate(bookingData.travelDate);
    document.getElementById('summaryTravelers').textContent = `${bookingData.travelers} person${bookingData.travelers > 1 ? 's' : ''}`;
    
    document.getElementById('summaryBaseAmount').textContent = '₹' + bookingData.pricing.baseTotal.toLocaleString('en-IN');
    document.getElementById('summaryGST').textContent = '₹' + bookingData.pricing.gst.toLocaleString('en-IN');
    document.getElementById('summaryTotal').textContent = '₹' + bookingData.pricing.total.toLocaleString('en-IN');
    document.getElementById('payButtonAmount').textContent = bookingData.pricing.total.toLocaleString('en-IN');
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Select payment method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update radio buttons
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    const radio = event.currentTarget.querySelector('input[type="radio"]');
    radio.checked = true;
    
    // Show/hide card form
    const cardForm = document.getElementById('cardDetailsForm');
    if (method === 'card') {
        cardForm.classList.add('show');
    } else {
        cardForm.classList.remove('show');
    }
    
    console.log('💳 Payment method selected:', method);
}

// Process payment
function processPayment() {
    if (!bookingData) {
        alert('❌ Booking data not found');
        return;
    }
    
    console.log('💰 Processing payment...');
    console.log('Payment Method:', selectedPaymentMethod);
    console.log('Amount:', bookingData.pricing.total);
    
    // Update button state
    const payBtn = event.target;
    const originalText = payBtn.innerHTML;
    payBtn.disabled = true;
    payBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10"/>
        </svg>
        Processing Payment...
    `;
    
    // In production, integrate with Cashfree Payment Gateway
    // This is a simulation
    setTimeout(() => {
        // Simulate payment processing
        simulatePaymentGateway();
    }, 1500);
}

// Simulate payment gateway (Cashfree integration in production)
function simulatePaymentGateway() {
    console.log('🏦 Redirecting to payment gateway...');
    
    // In production, use Cashfree SDK:
    /*
    const cashfree = new Cashfree({
        mode: "production" // or "sandbox"
    });
    
    const paymentSessionId = await createPaymentSession();
    
    cashfree.checkout({
        paymentSessionId: paymentSessionId,
        returnUrl: "https://pixeltrip.in/payment-success.html",
    });
    */
    
    // For demo, simulate success after 2 seconds
    setTimeout(() => {
        handlePaymentSuccess();
    }, 2000);
}

// Handle payment success
function handlePaymentSuccess() {
    console.log('✅ Payment successful!');
    
    // Update booking data
    bookingData.status = 'CONFIRMED';
    bookingData.paymentMethod = selectedPaymentMethod;
    bookingData.paymentId = 'PAY_' + Date.now().toString().slice(-10);
    bookingData.paidAt = new Date().toISOString();
    
    // Store confirmed booking
    sessionStorage.setItem('confirmedBooking', JSON.stringify(bookingData));
    
    // Clear pending booking
    sessionStorage.removeItem('pendingBooking');
    
    // Save to localStorage for persistence
    const bookings = JSON.parse(localStorage.getItem('ptm_bookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('ptm_bookings', JSON.stringify(bookings));
    
    // Redirect to confirmation page
    window.location.href = `confirmation.html?booking=${bookingData.bookingId}`;
}

// Handle payment failure
function handlePaymentFailure(error) {
    console.error('❌ Payment failed:', error);
    
    alert(`❌ Payment Failed\n\n${error.message || 'Please try again or contact support.'}`);
    
    // Reset button
    const payBtn = document.querySelector('.btn-pay');
    payBtn.disabled = false;
    payBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Retry Payment
    `;
}

// Create payment session (Backend API call in production)
async function createPaymentSession() {
    // In production, call your backend API:
    /*
    const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bookingId: bookingData.bookingId,
            amount: bookingData.pricing.total,
            customerDetails: {
                name: bookingData.fullName,
                email: bookingData.email,
                phone: bookingData.phone
            }
        })
    });
    
    const data = await response.json();
    return data.payment_session_id;
    */
    
    return 'session_' + Date.now();
}

// Card number formatting
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    input.value = formattedValue;
}

// Expiry date formatting
function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    input.value = value;
}

// Add event listeners for card form
document.addEventListener('DOMContentLoaded', () => {
    const cardForm = document.getElementById('cardDetailsForm');
    
    if (cardForm) {
        const cardNumberInput = cardForm.querySelector('input[placeholder*="1234"]');
        const expiryInput = cardForm.querySelector('input[placeholder*="MM/YY"]');
        
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => formatCardNumber(e.target));
        }
        
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => formatExpiryDate(e.target));
        }
    }
    
    // Initialize page
    initializePaymentPage();
});

// Cancel payment and go back
function cancelPayment() {
    if (confirm('⚠️ Are you sure you want to cancel this payment?')) {
        window.history.back();
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to cancel
    if (e.key === 'Escape') {
        cancelPayment();
    }
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

// Analytics tracking
function trackPaymentEvent(action, data) {
    console.log('📊 Payment Event:', action, data);
    
    // In production, send to analytics
    // gtag('event', action, { ...data });
}

trackPaymentEvent('payment_page_view', {
    booking_id: bookingData?.bookingId,
    amount: bookingData?.pricing.total
});

// Prevent accidental page refresh
window.addEventListener('beforeunload', (e) => {
    if (bookingData && bookingData.status === 'PENDING_PAYMENT') {
        e.preventDefault();
        e.returnValue = 'Payment in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
});

console.log('✅ Payment Flow Initialized');
console.log('💳 Selected Method:', selectedPaymentMethod);
