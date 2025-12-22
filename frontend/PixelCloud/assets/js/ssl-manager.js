/**
 * PixelCloud SSL Certificate Manager
 * Based on your friend's SSL automation system
 * Supports HTTP-01 and DNS-01 validation methods
 */

document.addEventListener('DOMContentLoaded', function() {
    initSSLManager();
});

/**
 * Initialize SSL Manager
 */
function initSSLManager() {
    // Certificate type selection
    const certTypeCards = document.querySelectorAll('.cert-type-card');
    const dnsSection = document.getElementById('dnsVerificationSection');
    const domainInput = document.getElementById('sslDomain');
    
    certTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Update active state
            certTypeCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide DNS verification for wildcard
            if (radio.value === 'wildcard') {
                dnsSection.style.display = 'block';
                updateCNAMEValue();
            } else {
                dnsSection.style.display = 'none';
            }
        });
    });
    
    // Update CNAME value when domain changes
    if (domainInput) {
        domainInput.addEventListener('input', updateCNAMEValue);
    }
    
    // CNAME Verification
    const verifyCNAMEBtn = document.getElementById('verifyCNAME');
    if (verifyCNAMEBtn) {
        verifyCNAMEBtn.addEventListener('click', verifyCNAME);
    }
    
    // Generate SSL Button
    const generateBtn = document.getElementById('generateSSLBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateSSL);
    }
    
    // Initialize first card as active
    if (certTypeCards.length > 0) {
        certTypeCards[0].classList.add('active');
    }
}

/**
 * Update CNAME Value
 */
function updateCNAMEValue() {
    const domain = document.getElementById('sslDomain').value.trim();
    const cnameValueSpan = document.getElementById('cnameValue');
    
    if (domain && cnameValueSpan) {
        cnameValueSpan.textContent = `_acme-challenge.${domain}.acme.dvswad.com`;
    }
}

/**
 * Verify CNAME Record
 */
async function verifyCNAME() {
    const domain = document.getElementById('sslDomain').value.trim();
    const statusSpan = document.getElementById('verificationStatus');
    const verifyBtn = document.getElementById('verifyCNAME');
    
    if (!domain) {
        showError('Please enter a domain name first');
        return;
    }
    
    // Show loading
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Verifying...';
    statusSpan.innerHTML = '<span class="text-muted">Checking DNS records...</span>';
    
    // Simulate DNS verification (in production, this would query DNS)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock verification result (80% success rate for demo)
    const isVerified = Math.random() > 0.2;
    
    if (isVerified) {
        statusSpan.innerHTML = '<span class="text-success">✓ Verified</span>';
        statusSpan.classList.add('text-success');
        showSuccess('CNAME record verified successfully!');
    } else {
        statusSpan.innerHTML = '<span class="text-danger">✗ Not Found</span>';
        statusSpan.classList.remove('text-success');
        showError('CNAME record not found. Please add it to your DNS provider and wait a few minutes for propagation.');
    }
    
    // Reset button
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Verify CNAME';
}

/**
 * Generate SSL Certificate
 * Simulates the SSL generation process with real-time progress updates
 */
async function generateSSL() {
    const domain = document.getElementById('sslDomain').value.trim();
    const certType = document.querySelector('input[name="certType"]:checked').value;
    const generateBtn = document.getElementById('generateSSLBtn');
    const progressSection = document.getElementById('sslProgress');
    const progressBar = progressSection.querySelector('.progress-bar');
    const logsDiv = document.getElementById('sslLogs');
    
    // Validation
    if (!domain || !isValidDomain(domain)) {
        showError('Please enter a valid domain name');
        return;
    }
    
    // For wildcard, verify CNAME first
    if (certType === 'wildcard') {
        const verificationStatus = document.getElementById('verificationStatus');
        if (!verificationStatus.classList.contains('text-success')) {
            showWarning('Please verify CNAME record before generating wildcard certificate');
            return;
        }
    }
    
    // Disable button and show progress
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    progressSection.style.display = 'block';
    logsDiv.innerHTML = '';
    progressBar.classList.remove('bg-success');
    progressBar.classList.add('progress-bar-striped', 'progress-bar-animated');
    
    try {
        // Simulate SSL generation process (will connect to Socket.IO backend in production)
        const steps = certType === 'wildcard'
            ? [
                { progress: 10, message: 'Initializing ACME client...', delay: 500 },
                { progress: 20, message: 'Verifying DNS-01 challenge...', delay: 1000 },
                { progress: 35, message: 'CNAME record verified successfully', delay: 800 },
                { progress: 50, message: `Requesting wildcard certificate for *.${domain}...`, delay: 1500 },
                { progress: 65, message: 'Completing DNS-01 validation...', delay: 1200 },
                { progress: 80, message: 'Downloading certificate files (cert.pem, privkey.pem)...', delay: 800 },
                { progress: 90, message: 'Installing certificate on server...', delay: 600 },
                { progress: 95, message: 'Reloading nginx configuration...', delay: 400 },
                { progress: 100, message: '✓ Wildcard SSL certificate generated successfully!', delay: 300 }
            ]
            : [
                { progress: 15, message: 'Initializing ACME client...', delay: 500 },
                { progress: 30, message: 'Creating .well-known/acme-challenge directory...', delay: 600 },
                { progress: 45, message: 'HTTP-01 challenge file created', delay: 700 },
                { progress: 60, message: `Requesting certificate for ${domain}...`, delay: 1200 },
                { progress: 75, message: 'Validating domain ownership via HTTP-01...', delay: 1000 },
                { progress: 85, message: 'Downloading certificate files (fullchain.pem, privkey.pem)...', delay: 600 },
                { progress: 95, message: 'Installing certificate on nginx...', delay: 500 },
                { progress: 100, message: '✓ SSL certificate generated successfully!', delay: 300 }
            ];
        
        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            updateProgress(progressBar, logsDiv, step.progress, step.message);
        }
        
        // Success notification
        setTimeout(() => {
            showSuccess(`SSL certificate for ${domain} generated successfully! Certificate will auto-renew 30 days before expiry.`);
            bootstrap.Modal.getInstance(document.getElementById('generateSSLModal')).hide();
            
            // Reset modal
            setTimeout(() => {
                progressSection.style.display = 'none';
                progressBar.style.width = '0%';
                progressBar.textContent = '0%';
                logsDiv.innerHTML = '';
                document.getElementById('sslDomain').value = '';
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate Certificate';
            }, 500);
        }, 1000);
        
    } catch (error) {
        updateProgress(progressBar, logsDiv, 100, '✗ Error: ' + error.message, true);
        showError('Failed to generate SSL certificate: ' + error.message);
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Certificate';
    }
}

/**
 * Update Progress Bar and Logs
 */
function updateProgress(progressBar, logsDiv, percent, message, isError = false) {
    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';
    
    if (percent === 100 && !isError) {
        progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
        progressBar.classList.add('bg-success');
    }
    
    if (isError) {
        progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
        progressBar.classList.add('bg-danger');
    }
    
    const timestamp = new Date().toLocaleTimeString();
    const logClass = isError ? 'text-danger fw-bold' : (percent === 100 ? 'text-success fw-bold' : 'text-dark');
    const logEntry = document.createElement('div');
    logEntry.className = `mb-1 ${logClass}`;
    logEntry.innerHTML = `<span class="text-muted">[${timestamp}]</span> ${message}`;
    logsDiv.appendChild(logEntry);
    logsDiv.scrollTop = logsDiv.scrollHeight;
}

/**
 * Validate Domain Name
 */
function isValidDomain(domain) {
    const regex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return regex.test(domain);
}

/**
 * Download Certificate (attached to download buttons)
 */
function downloadCertificate(domain) {
    showInfo(`Downloading certificate files for ${domain}...`);
    
    // Simulate download
    // In production: const link = document.createElement('a');
    // link.href = `/api/ssl/download/${domain}`;
    // link.download = `${domain}-certificates.zip`;
    // link.click();
    
    console.log('Downloading certificate for:', domain);
}

/**
 * Renew Certificate
 */
async function renewCertificate(domain) {
    if (!confirm(`Renew SSL certificate for ${domain}? This will request a new certificate from Let's Encrypt.`)) {
        return;
    }
    
    showInfo(`Certificate renewal initiated for ${domain}. This may take 1-2 minutes.`);
    
    // Simulate renewal
    setTimeout(() => {
        showSuccess(`Certificate for ${domain} renewed successfully! Valid for 90 days.`);
    }, 2000);
    
    console.log('Renewing certificate for:', domain);
}

/**
 * Delete Certificate
 */
async function deleteCertificate(domain) {
    if (!confirm(`Delete SSL certificate for ${domain}? This action cannot be undone and will remove HTTPS access.`)) {
        return;
    }
    
    showWarning(`Certificate for ${domain} has been deleted. Your site will no longer have HTTPS.`);
    
    console.log('Deleting certificate for:', domain);
}
