// API Configuration
const API_BASE = 'http://localhost:5001/api';

// State
let renewalData = null;
let selectedPaymentMethod = 'card';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadRenewalData();
    setupFormValidation();
});

// Load Renewal Data
function loadRenewalData() {
    const storedData = sessionStorage.getItem('renewalData');
    
    if (!storedData) {
        alert('No renewal data found. Redirecting to My Policies...');
        window.location.href = 'my-policies.html';
        return;
    }
    
    renewalData = JSON.parse(storedData);
    displayRenewalSummary();
}

// Display Renewal Summary
function displayRenewalSummary() {
    // Display policy details
    document.getElementById('policyNumber').textContent = renewalData.policyNumber;
    document.getElementById('planName').textContent = renewalData.plan;
    document.getElementById('insuredPerson').textContent = renewalData.insuredPerson;
    document.getElementById('coverAmount').textContent = '₹' + formatNumber(renewalData.coverAmount);
    
    // Calculate pricing
    const basePremium = renewalData.premium;
    const eligibleForNCB = renewalData.eligibleForNCB;
    const discount = eligibleForNCB ? Math.round(basePremium * 0.20) : 0;
    const premiumAfterDiscount = basePremium - discount;
    const gst = Math.round(premiumAfterDiscount * 0.18);
    const total = premiumAfterDiscount + gst;
    
    // Display pricing
    document.getElementById('basePremium').textContent = '₹' + formatNumber(basePremium);
    
    if (eligibleForNCB) {
        document.getElementById('ncbBanner').style.display = 'block';
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discountAmount').textContent = '-₹' + formatNumber(discount);
    }
    
    document.getElementById('gstAmount').textContent = '₹' + formatNumber(gst);
    document.getElementById('totalAmount').textContent = '₹' + formatNumber(total);
    
    // Store total for payment processing
    renewalData.totalAmount = total;
}

// Select Payment Method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    event.target.closest('.payment-method').classList.add('selected');
    
    // Show/hide appropriate forms
    document.getElementById('cardForm').style.display = method === 'card' ? 'block' : 'none';
    document.getElementById('upiForm').style.display = method === 'upi' ? 'block' : 'none';
    document.getElementById('netbankingForm').style.display = method === 'netbanking' ? 'block' : 'none';
}

// Setup Form Validation
function setupFormValidation() {
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Expiry date formatting
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV - numbers only
    const cardCVVInput = document.getElementById('cardCVV');
    if (cardCVVInput) {
        cardCVVInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// Validate Payment Details
function validatePaymentDetails() {
    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;
        const cardName = document.getElementById('cardName').value;
        
        if (!cardNumber || cardNumber.length < 16) {
            alert('Please enter a valid card number');
            return false;
        }
        
        if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
            alert('Please enter a valid expiry date (MM/YY)');
            return false;
        }
        
        // Validate expiry is in future
        const [month, year] = cardExpiry.split('/').map(num => parseInt(num));
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            alert('Card has expired');
            return false;
        }
        
        if (!cardCVV || cardCVV.length < 3) {
            alert('Please enter a valid CVV');
            return false;
        }
        
        if (!cardName || cardName.trim().length < 3) {
            alert('Please enter cardholder name');
            return false;
        }
    } else if (selectedPaymentMethod === 'upi') {
        const upiId = document.getElementById('upiId').value;
        
        if (!upiId || !upiId.match(/^[\w.\-]+@[\w]+$/)) {
            alert('Please enter a valid UPI ID (e.g., yourname@upi)');
            return false;
        }
    } else if (selectedPaymentMethod === 'netbanking') {
        const bank = document.getElementById('bankSelect').value;
        
        if (!bank) {
            alert('Please select your bank');
            return false;
        }
    }
    
    return true;
}

// Process Payment
async function processPayment() {
    if (!validatePaymentDetails()) {
        return;
    }
    
    // Show loading state
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Processing...';
    button.disabled = true;
    
    try {
        // Prepare payment data
        const paymentData = {
            policyNumber: renewalData.policyNumber,
            amount: renewalData.totalAmount,
            paymentMethod: selectedPaymentMethod,
            renewalDetails: {
                plan: renewalData.plan,
                coverAmount: renewalData.coverAmount,
                premium: renewalData.premium,
                eligibleForNCB: renewalData.eligibleForNCB
            }
        };
        
        // Add payment method specific details
        if (selectedPaymentMethod === 'card') {
            paymentData.cardDetails = {
                number: document.getElementById('cardNumber').value.replace(/\s/g, ''),
                expiry: document.getElementById('cardExpiry').value,
                cvv: document.getElementById('cardCVV').value,
                name: document.getElementById('cardName').value
            };
        } else if (selectedPaymentMethod === 'upi') {
            paymentData.upiId = document.getElementById('upiId').value;
        } else if (selectedPaymentMethod === 'netbanking') {
            paymentData.bank = document.getElementById('bankSelect').value;
        }
        
        // In production, this would call the actual payment API
        // const response = await fetch(`${API_BASE}/payments/renewal`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(paymentData)
        // });
        // const result = await response.json();
        
        // Simulate payment processing
        await simulatePaymentProcessing();
        
        // Store success data
        const successData = {
            policyNumber: renewalData.policyNumber,
            plan: renewalData.plan,
            amount: renewalData.totalAmount,
            paymentMethod: getPaymentMethodName(selectedPaymentMethod),
            transactionId: generateTransactionId(),
            timestamp: new Date().toISOString(),
            renewalPeriod: '1 Year',
            newExpiryDate: calculateNewExpiryDate()
        };
        
        sessionStorage.setItem('renewalSuccessData', JSON.stringify(successData));
        sessionStorage.removeItem('renewalData');
        
        // Redirect to success page
        window.location.href = 'renewal-success.html';
        
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Simulate Payment Processing
function simulatePaymentProcessing() {
    return new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
}

// Generate Transaction ID
function generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REN${timestamp}${random}`;
}

// Calculate New Expiry Date
function calculateNewExpiryDate() {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    return nextYear.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Get Payment Method Name
function getPaymentMethodName(method) {
    const names = {
        'card': 'Credit/Debit Card',
        'upi': 'UPI',
        'netbanking': 'Net Banking'
    };
    return names[method] || method;
}

// Utility Functions
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}
