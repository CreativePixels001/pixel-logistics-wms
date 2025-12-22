// Success page JavaScript - Display policy confirmation and details
document.addEventListener('DOMContentLoaded', function() {
    loadPolicyData();
});

function loadPolicyData() {
    try {
        // Get policy data from sessionStorage
        const policyData = JSON.parse(sessionStorage.getItem('policyData'));
        
        if (!policyData) {
            console.error('No policy data found');
            window.location.href = 'index.html';
            return;
        }

        // Populate policy details
        populatePolicyDetails(policyData);
        
        // Log success
        console.log('Policy created successfully:', policyData);
        
    } catch (error) {
        console.error('Error loading policy data:', error);
        alert('Error loading policy details. Please contact support.');
    }
}

function populatePolicyDetails(policyData) {
    // Insurer and Plan
    document.getElementById('successInsurer').textContent = policyData.insurerName || 'Health Insurance Company';
    document.getElementById('successPlan').textContent = policyData.planName || 'Health Protection Plan';
    
    // Insurer logo initials
    const insurerName = policyData.insurerName || 'SH';
    const initials = insurerName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('successLogo').textContent = initials;
    
    // Policy Number
    document.getElementById('policyNumber').textContent = policyData.policyNumber || 'POL-XXXX-XXXX';
    
    // Policy Holder
    const calculatorData = JSON.parse(sessionStorage.getItem('calculatorData')) || {};
    document.getElementById('holderName').textContent = calculatorData.fullName || policyData.holderName || 'Policy Holder';
    
    // Sum Insured
    const coverage = policyData.coverageAmount || calculatorData.sumInsured || 500000;
    document.getElementById('sumInsured').textContent = formatCurrency(coverage);
    
    // Policy Period
    const startDate = policyData.startDate ? new Date(policyData.startDate) : new Date();
    const endDate = policyData.endDate ? new Date(policyData.endDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.getElementById('policyPeriod').textContent = `${formatDate(startDate)} to ${formatDate(endDate)}`;
    
    // Premium Paid
    const premium = policyData.premium?.totalPremium || policyData.totalPremium || 0;
    document.getElementById('premiumPaid').textContent = formatCurrency(premium);
    
    // Transaction Details
    document.getElementById('transactionId').textContent = policyData.transactionId || 'TXN-XXXX-XXXX';
    
    const paymentDate = policyData.paymentDate ? new Date(policyData.paymentDate) : new Date();
    document.getElementById('paymentDate').textContent = formatDate(paymentDate);
    
    const paymentMethod = policyData.paymentMethod || 'Online Payment';
    document.getElementById('paymentMethod').textContent = formatPaymentMethod(paymentMethod);
}

function formatCurrency(amount) {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} Lakh`;
    } else {
        return `₹${amount.toLocaleString('en-IN')}`;
    }
}

function formatDate(date) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

function formatPaymentMethod(method) {
    const methodMap = {
        'upi': 'UPI Payment',
        'card': 'Credit/Debit Card',
        'netbanking': 'Net Banking',
        'wallet': 'Digital Wallet'
    };
    return methodMap[method.toLowerCase()] || method;
}

function downloadPolicy() {
    // Get policy data
    const policyData = JSON.parse(sessionStorage.getItem('policyData'));
    
    if (!policyData) {
        alert('Policy data not found. Please contact support.');
        return;
    }
    
    // Show loading message
    showNotification('Generating policy document...', 'info');
    
    // Simulate PDF generation (in production, this would call a backend API)
    setTimeout(() => {
        generatePolicyPDF(policyData);
    }, 1500);
}

function generatePolicyPDF(policyData) {
    // In production, this would call an API to generate a real PDF
    // For now, we'll create a simple HTML-based document
    
    const calculatorData = JSON.parse(sessionStorage.getItem('calculatorData')) || {};
    const applicationData = JSON.parse(sessionStorage.getItem('applicationData')) || {};
    
    // Create printable content
    const printWindow = window.open('', '_blank');
    const policyDocument = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Policy Document - ${policyData.policyNumber}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #000;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .policy-number {
                    background: #f0f0f0;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: center;
                    font-size: 20px;
                    font-weight: bold;
                    border-left: 4px solid #000;
                }
                .section {
                    margin: 30px 0;
                }
                .section h2 {
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .detail-row {
                    display: flex;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
                .detail-label {
                    font-weight: bold;
                    width: 40%;
                }
                .detail-value {
                    width: 60%;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 2px solid #000;
                    font-size: 12px;
                    text-align: center;
                }
                @media print {
                    body {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">PIXEL SAFE</div>
                <h1>Health Insurance Policy</h1>
            </div>
            
            <div class="policy-number">
                Policy Number: ${policyData.policyNumber}
            </div>
            
            <div class="section">
                <h2>Policy Holder Details</h2>
                <div class="detail-row">
                    <div class="detail-label">Name:</div>
                    <div class="detail-value">${calculatorData.fullName || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${calculatorData.email || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${calculatorData.phone || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Age:</div>
                    <div class="detail-value">${calculatorData.age || 'N/A'} years</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Policy Details</h2>
                <div class="detail-row">
                    <div class="detail-label">Insurer:</div>
                    <div class="detail-value">${policyData.insurerName}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Plan Name:</div>
                    <div class="detail-value">${policyData.planName}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sum Insured:</div>
                    <div class="detail-value">${formatCurrency(policyData.coverageAmount)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Policy Type:</div>
                    <div class="detail-value">${calculatorData.policyType === 'individual' ? 'Individual' : 'Family Floater'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Policy Period:</div>
                    <div class="detail-value">${formatDate(new Date(policyData.startDate))} to ${formatDate(new Date(policyData.endDate))}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">ACTIVE</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Premium Details</h2>
                <div class="detail-row">
                    <div class="detail-label">Base Premium:</div>
                    <div class="detail-value">₹${(policyData.premium?.basePremium || 0).toLocaleString('en-IN')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">GST (18%):</div>
                    <div class="detail-value">₹${(policyData.premium?.gst || 0).toLocaleString('en-IN')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><strong>Total Premium:</strong></div>
                    <div class="detail-value"><strong>₹${(policyData.premium?.totalPremium || 0).toLocaleString('en-IN')}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Payment Mode:</div>
                    <div class="detail-value">Annual</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Payment Status:</div>
                    <div class="detail-value">PAID</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Transaction Details</h2>
                <div class="detail-row">
                    <div class="detail-label">Transaction ID:</div>
                    <div class="detail-value">${policyData.transactionId}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Payment Date:</div>
                    <div class="detail-value">${formatDate(new Date(policyData.paymentDate))}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Payment Method:</div>
                    <div class="detail-value">${formatPaymentMethod(policyData.paymentMethod)}</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Important Information</h2>
                <ul>
                    <li>This policy is subject to terms and conditions as mentioned in the policy document.</li>
                    <li>Free look period: 15 days from the date of policy issuance.</li>
                    <li>All claims are subject to policy terms and conditions.</li>
                    <li>For any queries, please contact our customer support at 1800-XXX-XXXX</li>
                    <li>Keep this document safe for future reference.</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>This is a computer-generated document and does not require a signature.</p>
                <p>Issued on: ${formatDate(new Date())}</p>
                <p>© ${new Date().getFullYear()} Pixel Safe Insurance. All rights reserved.</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(policyDocument);
    printWindow.document.close();
    
    // Auto-print after content loads
    printWindow.onload = function() {
        printWindow.print();
        showNotification('Policy document generated successfully!', 'success');
    };
}

function sendEmail() {
    const policyData = JSON.parse(sessionStorage.getItem('policyData'));
    const calculatorData = JSON.parse(sessionStorage.getItem('calculatorData'));
    
    if (!calculatorData || !calculatorData.email) {
        alert('Email address not found. Please contact support.');
        return;
    }
    
    // Show loading
    showNotification('Sending policy details to ' + calculatorData.email + '...', 'info');
    
    // Simulate email sending (in production, this would call a backend API)
    setTimeout(() => {
        // In production, make API call to backend to send email
        // For now, just show success message
        showNotification('Policy details sent successfully to ' + calculatorData.email, 'success');
        
        console.log('Email would be sent to:', calculatorData.email);
        console.log('Policy details:', policyData);
    }, 2000);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Clear session storage when leaving success page (optional)
window.addEventListener('beforeunload', function(e) {
    // Uncomment below to clear session storage when user leaves
    // sessionStorage.clear();
});
