/* ===================================================================
 * Stripe Payment Configuration
 * Test Mode - Use Stripe test keys
 * ------------------------------------------------------------------- */

// Stripe Test Mode Configuration
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_51QRzHQSHWExample123456789', // Replace with actual test key
    testMode: true,
    currency: 'usd',
    locale: 'en'
};

// Initialize Stripe
let stripe;
let elements;
let cardElement;
let paymentIntentId;

/**
 * Initialize Stripe Elements
 */
async function initializeStripe() {
    try {
        // Load Stripe.js
        stripe = Stripe(STRIPE_CONFIG.publishableKey);
        
        // Create Elements instance
        elements = stripe.elements();
        
        // Create card element with styling
        const style = {
            base: {
                fontSize: '16px',
                color: '#0a0a0a',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                '::placeholder': {
                    color: '#999999'
                },
                padding: '12px'
            },
            invalid: {
                color: '#ff4444',
                iconColor: '#ff4444'
            }
        };
        
        // Create and mount card element
        cardElement = elements.create('card', { 
            style: style,
            hidePostalCode: false
        });
        
        cardElement.mount('#card-element');
        
        // Handle real-time validation errors
        cardElement.on('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
                displayError.style.display = 'block';
            } else {
                displayError.textContent = '';
                displayError.style.display = 'none';
            }
        });
        
        console.log('✅ Stripe initialized successfully');
        
    } catch (error) {
        console.error('❌ Stripe initialization failed:', error);
        showError('Failed to initialize payment system. Please refresh the page.');
    }
}

/**
 * Create Payment Intent on the server
 */
async function createPaymentIntent(amount, currency = 'usd') {
    try {
        // In production, this would call your backend API
        // For demo, we'll simulate the response
        
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency,
                metadata: {
                    product: document.getElementById('productTitle').textContent,
                    plan: getSelectedPlan()
                }
            })
        }).catch(() => {
            // Simulate server response for demo
            return {
                ok: true,
                json: async () => ({
                    clientSecret: 'pi_test_secret_' + Math.random().toString(36).substring(7),
                    paymentIntentId: 'pi_' + Math.random().toString(36).substring(7)
                })
            };
        });
        
        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        paymentIntentId = data.paymentIntentId;
        
        return data.clientSecret;
        
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

/**
 * Process payment
 */
async function processPayment(event) {
    event.preventDefault();
    
    // Show loading state
    const submitButton = document.getElementById('submitPayment');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Processing...';
    
    try {
        // Validate form
        if (!validateCheckoutForm()) {
            throw new Error('Please fill in all required fields correctly');
        }
        
        // Get billing details
        const billingDetails = getBillingDetails();
        
        // Get total amount
        const total = parseFloat(document.getElementById('totalAmount').textContent.replace('$', '').replace(',', ''));
        
        // Create payment intent
        showProgress('Creating secure payment session...');
        const clientSecret = await createPaymentIntent(total);
        
        // Confirm card payment
        showProgress('Processing payment...');
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: billingDetails
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (paymentIntent.status === 'succeeded') {
            // Payment successful
            await handleSuccessfulPayment(paymentIntent);
        } else {
            throw new Error('Payment was not completed. Please try again.');
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        showError(error.message || 'Payment failed. Please try again.');
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
    } finally {
        hideProgress();
    }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(paymentIntent) {
    try {
        // Save order details
        const orderData = {
            orderId: 'ORD-' + Date.now(),
            paymentIntentId: paymentIntent.id,
            product: document.getElementById('productTitle').textContent,
            plan: getSelectedPlan(),
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            customerEmail: document.getElementById('email').value,
            customerName: document.getElementById('name').value,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
        
        // Store order in session
        sessionStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Send confirmation email (backend API call)
        await sendConfirmationEmail(orderData);
        
        // Show success message
        showSuccessMessage();
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
            window.location.href = 'payment-success.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error handling payment success:', error);
        // Payment succeeded but confirmation failed
        // Still redirect to success page
        setTimeout(() => {
            window.location.href = 'payment-success.html';
        }, 2000);
    }
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(orderData) {
    try {
        await fetch('/api/send-confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        // Don't throw - email is nice to have but not critical
    }
}

/**
 * Get billing details from form
 */
function getBillingDetails() {
    return {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone')?.value || '',
        address: {
            line1: document.getElementById('address')?.value || '',
            city: document.getElementById('city')?.value || '',
            state: document.getElementById('state')?.value || '',
            postal_code: document.getElementById('zip')?.value || '',
            country: document.getElementById('country')?.value || 'US'
        }
    };
}

/**
 * Get selected pricing plan
 */
function getSelectedPlan() {
    const plans = document.querySelectorAll('input[name="pricing-plan"]');
    for (let plan of plans) {
        if (plan.checked) {
            return plan.value;
        }
    }
    return 'one-time';
}

/**
 * Validate checkout form
 */
function validateCheckoutForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!name) {
        showError('Please enter your name');
        return false;
    }
    
    if (!email || !isValidEmail(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    return true;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('payment-error') || createErrorElement();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Create error element if it doesn't exist
 */
function createErrorElement() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'payment-error';
    errorDiv.style.cssText = `
        background: #ff4444;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        margin: 1rem 0;
        display: none;
        text-align: center;
        font-weight: 500;
    `;
    
    const form = document.querySelector('.checkout-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    return errorDiv;
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        background: #4CAF50;
        color: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        min-width: 300px;
    `;
    
    successDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 1rem;">✅</div>
        <h2 style="margin: 0 0 0.5rem 0; font-size: 24px;">Payment Successful!</h2>
        <p style="margin: 0; opacity: 0.9;">Redirecting to confirmation page...</p>
    `;
    
    document.body.appendChild(successDiv);
}

/**
 * Show progress message
 */
function showProgress(message) {
    let progressDiv = document.getElementById('payment-progress');
    
    if (!progressDiv) {
        progressDiv = document.createElement('div');
        progressDiv.id = 'payment-progress';
        progressDiv.style.cssText = `
            background: #2196F3;
            color: white;
            padding: 1rem;
            border-radius: 4px;
            margin: 1rem 0;
            text-align: center;
            display: none;
        `;
        
        const form = document.querySelector('.checkout-form');
        form.insertBefore(progressDiv, form.firstChild);
    }
    
    progressDiv.textContent = message;
    progressDiv.style.display = 'block';
}

/**
 * Hide progress message
 */
function hideProgress() {
    const progressDiv = document.getElementById('payment-progress');
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeStripe();
    
    // Attach payment form handler
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', processPayment);
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeStripe,
        processPayment,
        validateCheckoutForm,
        isValidEmail
    };
}
