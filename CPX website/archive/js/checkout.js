/* ===================================================================
 * Checkout - Payment Processing Logic
 *
 * ------------------------------------------------------------------- */

// Stripe configuration
// Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE';
let stripe, elements, cardElement;

// Tax rate
const TAX_RATE = 0.18; // 18% GST

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    initializeStripe();
    setupEventListeners();
});

/**
 * Load product details from session storage
 */
function loadProductDetails() {
    const productData = sessionStorage.getItem('selectedProduct');
    
    if (!productData) {
        // No product selected, redirect to studio
        alert('Please select a product first');
        window.location.href = 'studio.html';
        return;
    }
    
    const product = JSON.parse(productData);
    
    // Update product info
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productDescription').textContent = 'Enterprise license with full access';
    
    // Update pricing
    document.getElementById('onetimePrice').textContent = `$${product.price.toLocaleString()}`;
    document.getElementById('monthlyPrice').textContent = `$${product.monthlyPrice}/mo`;
    
    const annualPrice = product.monthlyPrice * 12 * 0.8; // 20% discount
    document.getElementById('annualPrice').textContent = `$${annualPrice.toLocaleString()}/yr`;
    
    // Calculate and display totals
    updatePricing();
}

/**
 * Initialize Stripe
 */
function initializeStripe() {
    // Initialize Stripe
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    elements = stripe.elements();
    
    // Create card element
    cardElement = elements.create('card', {
        style: {
            base: {
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                '::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)'
                }
            },
            invalid: {
                color: '#ef4444'
            }
        }
    });
    
    cardElement.mount('#card-element');
    
    // Handle real-time validation errors
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Pricing plan change
    const pricingRadios = document.querySelectorAll('input[name="pricingPlan"]');
    pricingRadios.forEach(radio => {
        radio.addEventListener('change', updatePricing);
    });
    
    // Form submission
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', handleSubmit);
}

/**
 * Update pricing based on selected plan
 */
function updatePricing() {
    const productData = JSON.parse(sessionStorage.getItem('selectedProduct'));
    const selectedPlan = document.querySelector('input[name="pricingPlan"]:checked').value;
    
    let subtotal;
    
    switch(selectedPlan) {
        case 'onetime':
            subtotal = productData.price;
            break;
        case 'monthly':
            subtotal = productData.monthlyPrice;
            break;
        case 'annual':
            subtotal = productData.monthlyPrice * 12 * 0.8; // 20% discount
            break;
    }
    
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('grandTotal').textContent = `$${total.toFixed(2)}`;
}

/**
 * Handle form submission
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    const submitButton = document.getElementById('submit-button');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoader = submitButton.querySelector('.btn-loader');
    
    // Disable submit button
    submitButton.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    
    try {
        // Get form data
        const formData = {
            email: document.getElementById('email').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            company: document.getElementById('company').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
            country: document.getElementById('country').value
        };
        
        const productData = JSON.parse(sessionStorage.getItem('selectedProduct'));
        const selectedPlan = document.querySelector('input[name="pricingPlan"]:checked').value;
        
        // Calculate amount
        let amount;
        switch(selectedPlan) {
            case 'onetime':
                amount = productData.price;
                break;
            case 'monthly':
                amount = productData.monthlyPrice;
                break;
            case 'annual':
                amount = productData.monthlyPrice * 12 * 0.8;
                break;
        }
        
        const totalAmount = (amount + (amount * TAX_RATE)) * 100; // Convert to cents
        
        // Create payment intent on server
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: totalAmount,
                product: productData.key,
                plan: selectedPlan,
                customer: formData
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }
        
        const { clientSecret } = await response.json();
        
        // Confirm card payment
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    address: {
                        line1: formData.address,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.zipCode,
                        country: formData.country
                    }
                }
            }
        });
        
        if (result.error) {
            // Show error
            showError(result.error.message);
            submitButton.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        } else {
            // Payment successful
            handlePaymentSuccess(result.paymentIntent);
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        showError('An error occurred. Please try again.');
        submitButton.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('card-errors');
    errorDiv.textContent = message;
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Handle successful payment
 */
function handlePaymentSuccess(paymentIntent) {
    // Store payment info
    sessionStorage.setItem('paymentIntent', JSON.stringify(paymentIntent));
    
    // Redirect to success page
    window.location.href = 'payment-success.html';
}

/**
 * Demo mode - bypass Stripe for testing
 * Remove this in production
 */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Demo mode enabled');
    
    // Override initialize Stripe for demo
    initializeStripe = function() {
        console.log('Stripe initialization skipped in demo mode');
        
        // Create fake card element
        const cardElementDiv = document.getElementById('card-element');
        cardElementDiv.innerHTML = `
            <div style="padding: 1rem; color: rgba(255,255,255,0.5);">
                <p style="margin: 0;">💳 Demo Mode - Enter any card details</p>
                <p style="margin: 0.5rem 0 0; font-size: 1.3rem;">Card: 4242 4242 4242 4242</p>
            </div>
        `;
    };
    
    // Override submit handler
    handleSubmit = async function(event) {
        event.preventDefault();
        
        const submitButton = document.getElementById('submit-button');
        const btnText = submitButton.querySelector('.btn-text');
        const btnLoader = submitButton.querySelector('.btn-loader');
        
        submitButton.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate fake payment intent
        const paymentIntent = {
            id: 'pi_demo_' + Date.now(),
            amount: parseFloat(document.getElementById('grandTotal').textContent.replace('$', '').replace(',', '')) * 100,
            status: 'succeeded',
            created: Date.now() / 1000
        };
        
        handlePaymentSuccess(paymentIntent);
    };
}
