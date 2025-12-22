// Payment Page JavaScript

let paymentData = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadPaymentData();
    setupEventListeners();
});

function loadPaymentData() {
    // Get payment data from sessionStorage
    const storedData = sessionStorage.getItem('paymentData');
    
    if (storedData) {
        paymentData = JSON.parse(storedData);
        updatePaymentSummary();
    } else {
        alert('No payment data found. Please start from the calculator.');
        window.location.href = 'calculator-health.html';
    }
}

function updatePaymentSummary() {
    const quote = paymentData.selectedQuote || {};
    const premium = paymentData.premium || quote.premium || {};
    
    // Update insurer and plan
    document.getElementById('paymentLogo').textContent = quote.logo || 'SH';
    document.getElementById('paymentInsurer').textContent = quote.insurerName || paymentData.insurerName || 'Star Health Insurance';
    document.getElementById('paymentPlan').textContent = quote.planName || paymentData.planName || 'Health Insurance Plan';
    
    // Update coverage and policy holder
    document.getElementById('paymentCoverage').textContent = formatCurrency(paymentData.coverageAmount);
    document.getElementById('paymentName').textContent = paymentData.clientData?.fullName || paymentData.fullName || '-';
    
    // Update premium breakdown
    const basePremium = premium.base || premium.basePremium || 0;
    const addonsCost = premium.addons || 0;
    const gst = premium.gst || 0;
    const total = premium.total || premium.totalPremium || 0;
    
    document.getElementById('paymentBase').textContent = '₹' + basePremium.toLocaleString('en-IN');
    document.getElementById('paymentAddons').textContent = '₹' + addonsCost.toLocaleString('en-IN');
    document.getElementById('paymentGst').textContent = '₹' + gst.toLocaleString('en-IN');
    document.getElementById('paymentTotal').textContent = '₹' + total.toLocaleString('en-IN');
    document.getElementById('payAmount').textContent = total.toLocaleString('en-IN');
}

function formatCurrency(amount) {
    const crores = Math.floor(amount / 10000000);
    const lakhs = Math.floor((amount % 10000000) / 100000);
    
    if (crores > 0) {
        return lakhs > 0 ? `₹${crores}.${lakhs} Cr` : `₹${crores} Cr`;
    }
    return `₹${lakhs} Lakh`;
}

function setupEventListeners() {
    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
    
    // Pay now button
    document.getElementById('payNowBtn').addEventListener('click', processPayment);
}

async function processPayment() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Show processing overlay
    const overlay = document.getElementById('processingOverlay');
    overlay.style.display = 'flex';
    
    // Simulate payment processing steps
    await animateProcessingSteps();
    
    // Create policy in database
    await createPolicy(selectedMethod);
}

async function animateProcessingSteps() {
    const steps = document.querySelectorAll('.processing-steps .step');
    
    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        steps[i].classList.add('active');
        
        if (i < steps.length - 1) {
            steps[i].innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                ${steps[i].querySelector('span').textContent}
            `;
        }
    }
}

async function createPolicy(paymentMethod) {
    const quote = paymentData.selectedQuote || {};
    const premium = paymentData.premium || quote.premium || {};
    
    // Calculate policy dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    // Prepare policy data
    const policyData = {
        clientId: paymentData.clientId,
        insuranceType: 'health',
        policyType: 'new',
        insurerName: quote.insurerName || paymentData.insurerName || 'Star Health Insurance',
        planName: quote.planName || paymentData.planName || 'Health Insurance Plan',
        coverageAmount: paymentData.coverageAmount,
        premium: {
            basePremium: premium.base || premium.basePremium || 0,
            gst: premium.gst || 0,
            totalPremium: premium.total || premium.totalPremium || 0
        },
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        tenure: 1,
        paymentMode: 'annual',
        paymentStatus: 'paid',
        paymentMethod: paymentMethod,
        paymentDate: new Date().toISOString(),
        transactionId: 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase(),
        status: 'active',
        nominee: paymentData.clientData?.nominee || {
            name: paymentData.formValues?.nomineeName || '',
            relationship: paymentData.formValues?.nomineeRelationship || '',
            dateOfBirth: paymentData.formValues?.nomineeDob || ''
        },
        clientName: paymentData.clientData?.fullName || paymentData.fullName,
        clientEmail: paymentData.clientData?.email || paymentData.email,
        clientPhone: paymentData.clientData?.phone || paymentData.phone
    };
    
    try {
        const response = await fetch('http://localhost:5001/api/v1/pis/policies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(policyData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store policy data for success page
            const successData = {
                policy: result.data,
                client: paymentData.clientData,
                payment: {
                    method: paymentMethod,
                    transactionId: policyData.transactionId,
                    amount: policyData.premium.totalPremium,
                    date: new Date().toISOString()
                }
            };
            
            sessionStorage.setItem('policySuccess', JSON.stringify(successData));
            
            // Wait a bit more for dramatic effect
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Redirect to success page
            window.location.href = 'success-health.html';
        } else {
            throw new Error(result.message || 'Failed to create policy');
        }
        
    } catch (error) {
        console.error('Error creating policy:', error);
        document.getElementById('processingOverlay').style.display = 'none';
        alert('Payment processed but there was an error creating your policy. Please contact support with your transaction ID: ' + policyData.transactionId);
    }
}
