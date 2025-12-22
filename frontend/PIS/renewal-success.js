// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadSuccessData();
});

// Load Success Data
function loadSuccessData() {
    const storedData = sessionStorage.getItem('renewalSuccessData');
    
    if (!storedData) {
        // If no data, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    const successData = JSON.parse(storedData);
    displaySuccessDetails(successData);
    
    // Track renewal completion
    trackRenewalCompletion(successData);
}

// Display Success Details
function displaySuccessDetails(data) {
    document.getElementById('policyNumber').textContent = data.policyNumber;
    document.getElementById('planName').textContent = data.plan;
    document.getElementById('amountPaid').textContent = '₹' + formatNumber(data.amount);
    document.getElementById('paymentMethod').textContent = data.paymentMethod;
    document.getElementById('expiryDate').textContent = data.newExpiryDate;
    document.getElementById('transactionId').textContent = data.transactionId;
}

// Track Renewal Completion
async function trackRenewalCompletion(data) {
    try {
        // In production, this would send analytics/tracking data
        console.log('Renewal completed:', {
            policyNumber: data.policyNumber,
            amount: data.amount,
            timestamp: data.timestamp
        });
        
        // Example API call:
        // await fetch('http://localhost:5001/api/analytics/renewal', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         policyNumber: data.policyNumber,
        //         amount: data.amount,
        //         timestamp: data.timestamp,
        //         paymentMethod: data.paymentMethod
        //     })
        // });
        
    } catch (error) {
        console.error('Error tracking renewal:', error);
    }
}

// Download Policy
function downloadPolicy() {
    const data = JSON.parse(sessionStorage.getItem('renewalSuccessData'));
    
    if (!data) {
        alert('Policy data not found');
        return;
    }
    
    // In production, this would trigger actual PDF download
    alert(`Downloading renewed policy ${data.policyNumber}...\n\nYour policy document will be available shortly!\n\nYou can also download it anytime from "My Policies".`);
    
    // Example of actual implementation:
    // window.location.href = `http://localhost:5001/api/policies/${data.policyNumber}/download`;
    
    // Or generate PDF client-side (requires library like jsPDF):
    // generatePolicyPDF(data);
}

// Generate Policy PDF (placeholder)
function generatePolicyPDF(data) {
    // This would use a library like jsPDF to generate the PDF
    // Example implementation:
    /*
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Policy Renewal Certificate', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Policy Number: ${data.policyNumber}`, 20, 40);
    doc.text(`Plan: ${data.plan}`, 20, 50);
    doc.text(`Amount: ₹${formatNumber(data.amount)}`, 20, 60);
    doc.text(`Valid Until: ${data.newExpiryDate}`, 20, 70);
    
    doc.save(`policy-${data.policyNumber}.pdf`);
    */
}

// Utility Functions
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}
