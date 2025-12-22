/* ===================================================================
 * Success Page - Order & Download Logic
 *
 * ------------------------------------------------------------------- */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadOrderDetails();
    generateLicenseKey();
});

/**
 * Load order details from session
 */
function loadOrderDetails() {
    const paymentIntent = sessionStorage.getItem('paymentIntent');
    const productData = sessionStorage.getItem('selectedProduct');
    
    if (!paymentIntent || !productData) {
        // No order data, redirect to studio
        console.warn('No order data found');
        window.location.href = 'studio.html';
        return;
    }
    
    const payment = JSON.parse(paymentIntent);
    const product = JSON.parse(productData);
    
    // Update order details
    document.getElementById('orderId').textContent = payment.id;
    document.getElementById('productName').textContent = product.title;
    document.getElementById('amountPaid').textContent = `$${(payment.amount / 100).toFixed(2)}`;
}

/**
 * Generate license key
 */
function generateLicenseKey() {
    const productData = JSON.parse(sessionStorage.getItem('selectedProduct'));
    if (!productData) return;
    
    // Generate a pseudo-random license key
    const segments = [];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
    
    for (let i = 0; i < 4; i++) {
        let segment = '';
        for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }
    
    const licenseKey = segments.join('-');
    
    // Store license key
    sessionStorage.setItem('licenseKey', licenseKey);
    
    // Display license key
    const codeElement = document.querySelector('.license-key code');
    codeElement.textContent = licenseKey;
}

/**
 * Copy license key to clipboard
 */
function copyLicenseKey() {
    const licenseKey = sessionStorage.getItem('licenseKey');
    
    if (!licenseKey) {
        alert('License key not available');
        return;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(licenseKey).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy license key');
    });
}

/**
 * Download product
 */
async function downloadProduct() {
    const productData = JSON.parse(sessionStorage.getItem('selectedProduct'));
    const paymentIntent = JSON.parse(sessionStorage.getItem('paymentIntent'));
    const licenseKey = sessionStorage.getItem('licenseKey');
    
    if (!productData || !paymentIntent) {
        alert('Order information not found');
        return;
    }
    
    const downloadBtn = document.getElementById('downloadBtn');
    const btnText = downloadBtn.querySelector('span');
    const btnIcon = downloadBtn.querySelector('svg');
    
    // Disable button
    downloadBtn.disabled = true;
    btnText.textContent = 'Preparing Download...';
    
    try {
        // Generate download token
        const response = await fetch('/api/generate-download-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paymentIntentId: paymentIntent.id,
                productKey: productData.key,
                licenseKey: licenseKey
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate download token');
        }
        
        const { downloadUrl } = await response.json();
        
        // Start download
        btnText.textContent = 'Downloading...';
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${productData.key}-v1.0.0.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update button
        setTimeout(() => {
            btnText.textContent = 'Download Complete';
            btnIcon.innerHTML = '<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
            
            setTimeout(() => {
                downloadBtn.disabled = false;
                btnText.textContent = 'Download Again';
                btnIcon.innerHTML = '<path d="M12 3v13m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
            }, 3000);
        }, 1500);
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to start download. Please contact support.');
        
        downloadBtn.disabled = false;
        btnText.textContent = 'Try Again';
    }
}

/**
 * Demo mode - provide direct download for testing
 */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Demo mode enabled');
    
    // Override download function for demo
    downloadProduct = async function() {
        const productData = JSON.parse(sessionStorage.getItem('selectedProduct'));
        
        if (!productData) {
            alert('Product information not found');
            return;
        }
        
        const downloadBtn = document.getElementById('downloadBtn');
        const btnText = downloadBtn.querySelector('span');
        const btnIcon = downloadBtn.querySelector('svg');
        
        downloadBtn.disabled = true;
        btnText.textContent = 'Preparing Download...';
        
        // Simulate download delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        btnText.textContent = 'Downloading...';
        
        // In demo mode, redirect to project folder
        const productUrls = {
            'tms': '/frontend/index.html',
            'wms': '/wms-frontend/index.html',
            'pms': '#',
            'pts': '#'
        };
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show demo message
        alert(`Demo Mode: In production, this would download ${productData.key.toUpperCase()}-v1.0.0.zip\n\nFor now, we'll open the live demo.`);
        
        if (productUrls[productData.key] && productUrls[productData.key] !== '#') {
            window.open(productUrls[productData.key], '_blank');
        }
        
        // Update button
        btnText.textContent = 'Download Complete';
        btnIcon.innerHTML = '<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        
        setTimeout(() => {
            downloadBtn.disabled = false;
            btnText.textContent = 'Download Again';
            btnIcon.innerHTML = '<path d="M12 3v13m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        }, 3000);
    };
}

/**
 * Send confirmation email (backend integration)
 */
function sendConfirmationEmail() {
    const productData = JSON.parse(sessionStorage.getItem('selectedProduct'));
    const paymentIntent = JSON.parse(sessionStorage.getItem('paymentIntent'));
    const licenseKey = sessionStorage.getItem('licenseKey');
    
    // This would be handled by backend in production
    fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'customer@example.com', // Would come from payment form
            product: productData,
            payment: paymentIntent,
            licenseKey: licenseKey
        })
    }).catch(err => {
        console.warn('Email sending skipped in demo mode:', err);
    });
}

// Send email on page load
sendConfirmationEmail();
