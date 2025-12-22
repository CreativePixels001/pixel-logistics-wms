/**
 * Ecosystem Flow - Product Modals & Payment System
 */

let selectedPlan = null;
let currentSlide = 0;
let currentTMSSlide = 0;
let currentAdvocateSlide = 0;

const pricingData = {
    professional: {
        name: 'Professional Plan',
        price: 1999,
        tax: 0.18
    },
    enterprise: {
        name: 'Enterprise Plan',
        price: 4999,
        tax: 0.18
    }
};

// Carousel Functions
function changeSlide(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

// Open Product Detail Modal
function openProductModal(product) {
    if (product === 'wms') {
        const modal = document.getElementById('productModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentSlide = 0; // Reset carousel
    } else if (product === 'tms') {
        const modal = document.getElementById('tmsModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentTMSSlide = 0; // Reset carousel
    } else if (product === 'advocate') {
        const modal = document.getElementById('advocateModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentAdvocateSlide = 0; // Reset carousel
    }
}

// Close Product Detail Modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// TMS Modal Functions
function closeTMSModal() {
    const modal = document.getElementById('tmsModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function changeTMSSlide(direction) {
    const modal = document.getElementById('tmsModal');
    const slides = modal.querySelectorAll('.carousel-slide');
    const dots = modal.querySelectorAll('.dot');
    
    slides[currentTMSSlide].classList.remove('active');
    dots[currentTMSSlide].classList.remove('active');
    
    currentTMSSlide = (currentTMSSlide + direction + slides.length) % slides.length;
    
    slides[currentTMSSlide].classList.add('active');
    dots[currentTMSSlide].classList.add('active');
}

function goToTMSSlide(index) {
    const modal = document.getElementById('tmsModal');
    const slides = modal.querySelectorAll('.carousel-slide');
    const dots = modal.querySelectorAll('.dot');
    
    slides[currentTMSSlide].classList.remove('active');
    dots[currentTMSSlide].classList.remove('active');
    
    currentTMSSlide = index;
    
    slides[currentTMSSlide].classList.add('active');
    dots[currentTMSSlide].classList.add('active');
}

function openTMSPricing() {
    closeTMSModal();
    setTimeout(() => {
        const pricingModal = document.getElementById('pricingModal');
        pricingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 300);
}

// Advocate Modal Functions
function closeAdvocateModal() {
    const modal = document.getElementById('advocateModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function changeAdvocateSlide(direction) {
    const modal = document.getElementById('advocateModal');
    const slides = modal.querySelectorAll('.carousel-slide');
    const dots = modal.querySelectorAll('.dot');
    
    slides[currentAdvocateSlide].classList.remove('active');
    dots[currentAdvocateSlide].classList.remove('active');
    
    currentAdvocateSlide = (currentAdvocateSlide + direction + slides.length) % slides.length;
    
    slides[currentAdvocateSlide].classList.add('active');
    dots[currentAdvocateSlide].classList.add('active');
}

function goToAdvocateSlide(index) {
    const modal = document.getElementById('advocateModal');
    const slides = modal.querySelectorAll('.carousel-slide');
    const dots = modal.querySelectorAll('.dot');
    
    slides[currentAdvocateSlide].classList.remove('active');
    dots[currentAdvocateSlide].classList.remove('active');
    
    currentAdvocateSlide = index;
    
    slides[currentAdvocateSlide].classList.add('active');
    dots[currentAdvocateSlide].classList.add('active');
}

function openAdvocatePricing() {
    closeAdvocateModal();
    setTimeout(() => {
        const pricingModal = document.getElementById('pricingModal');
        pricingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 300);
}

// View Demo - Opens product login/landing page
function viewDemo(product) {
    if (product === 'wms') {
        // Open WMS landing page
        window.location.href = '../frontend/WMS/landing.html';
    } else if (product === 'tms') {
        // Open TMS dashboard
        window.location.href = '../frontend/TMS/tms-dashboard.html';
    } else if (product === 'advocate') {
        // Open Advocate dashboard
        window.location.href = '../frontend/AMS/dashboard.html';
    }
}

// Open Pricing Modal
function openPricing(product) {
    closeProductModal();
    setTimeout(() => {
        const pricingModal = document.getElementById('pricingModal');
        pricingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 300);
}

// Close Pricing Modal
function closePricing() {
    const pricingModal = document.getElementById('pricingModal');
    pricingModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Proceed to Payment
function proceedToPayment(plan) {
    selectedPlan = plan;
    const planData = pricingData[plan];
    
    // Update payment modal with plan details
    const planNameElement = document.getElementById('paymentPlanName');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    const subtotal = planData.price;
    const tax = subtotal * planData.tax;
    const total = subtotal + tax;
    
    planNameElement.textContent = `${planData.name} - $${subtotal.toLocaleString()}`;
    subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Close pricing and open payment
    closePricing();
    setTimeout(() => {
        const paymentModal = document.getElementById('paymentModal');
        paymentModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 300);
}

// Close Payment Modal
function closePayment() {
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Process Payment
function processPayment() {
    // Validate form (basic validation)
    const inputs = document.querySelectorAll('.payment-form input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ff0000';
        } else {
            input.style.borderColor = '#e0e0e0';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Show processing message
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Processing...</span>';
    btn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // In production, this would call your payment gateway API
        alert('Payment gateway integration will be implemented here.\n\nFor now, this is a placeholder for the payment processing flow.\n\nNext step: Redirect to download page with license key.');
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        // Close payment modal
        closePayment();
        
        // TODO: Redirect to download page
        // window.location.href = 'download.html?order=' + orderId;
    }, 2000);
}

// Handle payment method selection
document.addEventListener('DOMContentLoaded', function() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
    
    // Add click handler to solution cards
    const solutionCards = document.querySelectorAll('.solution-card');
    solutionCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.3s ease';
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
});

// Close modals on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
        closePricing();
        closePayment();
    }
});
