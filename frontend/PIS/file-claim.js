// File Claim Form Logic
const API_BASE = 'http://localhost:5001/api/v1/pis';

let currentStep = 1;
let uploadedFiles = [];
let userPolicies = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserPolicies();
    setupEventListeners();
    setMaxDate();
});

function setupEventListeners() {
    // Navigation buttons
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    document.getElementById('prevBtn').addEventListener('click', prevStep);
    document.getElementById('submitBtn').addEventListener('click', submitClaim);
    
    // Policy selection
    document.getElementById('policyNumber').addEventListener('change', handlePolicySelect);
    
    // File upload
    const fileUpload = document.getElementById('fileUpload');
    const fileInput = document.getElementById('fileInput');
    
    fileUpload.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.classList.add('drag-over');
    });
    
    fileUpload.addEventListener('dragleave', () => {
        fileUpload.classList.remove('drag-over');
    });
    
    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.classList.remove('drag-over');
        handleFileSelect({ target: { files: e.dataTransfer.files } });
    });
    
    // Real-time amount formatting
    document.getElementById('claimAmount').addEventListener('input', function(e) {
        const value = e.target.value.replace(/,/g, '');
        if (value) {
            e.target.value = parseFloat(value).toLocaleString('en-IN');
        }
    });
}

function setMaxDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incidentDate').setAttribute('max', today);
}

// Load user's active policies
async function loadUserPolicies() {
    try {
        // Get client ID from session storage or URL param
        const clientId = sessionStorage.getItem('clientId') || new URLSearchParams(window.location.search).get('clientId');
        
        if (!clientId) {
            showNotification('Please login to file a claim', 'error');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }
        
        const response = await fetch(`${API_BASE}/policies?clientId=${clientId}&status=active`);
        const data = await response.json();
        
        if (data.success && data.data) {
            userPolicies = data.data;
            populatePolicyDropdown();
        } else {
            // Sample policies for testing
            userPolicies = [
                {
                    _id: '1',
                    policyNumber: 'POL-2024-001',
                    insuranceType: 'health',
                    insurer: 'Star Health',
                    coverageAmount: 500000,
                    startDate: '2024-01-01',
                    endDate: '2025-01-01',
                    premiumAmount: 12000
                }
            ];
            populatePolicyDropdown();
        }
    } catch (error) {
        console.error('Error loading policies:', error);
        showNotification('Error loading policies', 'error');
    }
}

function populatePolicyDropdown() {
    const select = document.getElementById('policyNumber');
    
    userPolicies.forEach(policy => {
        const option = document.createElement('option');
        option.value = policy._id;
        option.textContent = `${policy.policyNumber} - ${policy.insuranceType.toUpperCase()} (${policy.insurer})`;
        option.dataset.policy = JSON.stringify(policy);
        select.appendChild(option);
    });
}

function handlePolicySelect(e) {
    const selectedOption = e.target.options[e.target.selectedIndex];
    
    if (selectedOption.value) {
        const policy = JSON.parse(selectedOption.dataset.policy);
        const policyDetails = document.getElementById('policyDetails');
        const policyInfo = document.getElementById('policyInfo');
        
        policyInfo.innerHTML = `
            <strong>Policy Type:</strong> ${policy.insuranceType.toUpperCase()}<br>
            <strong>Insurer:</strong> ${policy.insurer}<br>
            <strong>Coverage Amount:</strong> ${formatCurrency(policy.coverageAmount)}<br>
            <strong>Valid Until:</strong> ${formatDate(policy.endDate)}
        `;
        
        policyDetails.style.display = 'block';
    } else {
        document.getElementById('policyDetails').style.display = 'none';
    }
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showNotification(`${file.name} is too large. Max size is 5MB`, 'error');
            return;
        }
        
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            showNotification(`${file.name} is not a supported format`, 'error');
            return;
        }
        
        // Add to uploaded files
        uploadedFiles.push(file);
    });
    
    renderFileList();
    e.target.value = ''; // Reset input
}

function renderFileList() {
    const fileList = document.getElementById('fileList');
    
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }
    
    fileList.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="remove-file" onclick="removeFile(${index})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
}

function nextStep() {
    if (!validateStep(currentStep)) return;
    
    if (currentStep < 4) {
        currentStep++;
        updateSteps();
        
        if (currentStep === 4) {
            populateReview();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateSteps();
    }
}

function validateStep(step) {
    switch(step) {
        case 1:
            const policyNumber = document.getElementById('policyNumber').value;
            const claimType = document.getElementById('claimType').value;
            
            if (!policyNumber) {
                showNotification('Please select a policy', 'error');
                return false;
            }
            if (!claimType) {
                showNotification('Please select claim type', 'error');
                return false;
            }
            return true;
            
        case 2:
            const incidentDate = document.getElementById('incidentDate').value;
            const claimAmount = document.getElementById('claimAmount').value.replace(/,/g, '');
            const description = document.getElementById('description').value;
            
            if (!incidentDate) {
                showNotification('Please enter incident date', 'error');
                return false;
            }
            if (!claimAmount || parseFloat(claimAmount) <= 0) {
                showNotification('Please enter valid claim amount', 'error');
                return false;
            }
            if (!description.trim()) {
                showNotification('Please provide description', 'error');
                return false;
            }
            return true;
            
        case 3:
            if (uploadedFiles.length === 0) {
                const confirm = window.confirm('No documents uploaded. Continue without documents?');
                return confirm;
            }
            return true;
            
        default:
            return true;
    }
}

function updateSteps() {
    // Update step indicators
    document.querySelectorAll('.step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update form sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelector(`[data-section="${currentStep}"]`).classList.add('active');
    
    // Update buttons
    document.getElementById('prevBtn').style.display = currentStep === 1 ? 'none' : 'block';
    document.getElementById('nextBtn').style.display = currentStep === 4 ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = currentStep === 4 ? 'block' : 'none';
}

function populateReview() {
    const policySelect = document.getElementById('policyNumber');
    const selectedPolicy = policySelect.options[policySelect.selectedIndex].textContent;
    
    const claimTypeSelect = document.getElementById('claimType');
    const selectedType = claimTypeSelect.options[claimTypeSelect.selectedIndex].textContent;
    
    document.getElementById('reviewPolicy').textContent = selectedPolicy;
    document.getElementById('reviewType').textContent = selectedType;
    document.getElementById('reviewDate').textContent = formatDate(document.getElementById('incidentDate').value);
    document.getElementById('reviewHospital').textContent = document.getElementById('hospitalName').value || 'Not specified';
    document.getElementById('reviewDocs').textContent = `${uploadedFiles.length} file(s)`;
    
    const amount = document.getElementById('claimAmount').value.replace(/,/g, '');
    document.getElementById('reviewAmount').textContent = parseFloat(amount).toLocaleString('en-IN');
}

async function submitClaim(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const policyId = document.getElementById('policyNumber').value;
        const clientId = sessionStorage.getItem('clientId') || 'test-client-id';
        
        const claimData = {
            policyId,
            clientId,
            claimType: document.getElementById('claimType').value,
            incidentDate: document.getElementById('incidentDate').value,
            claimAmount: parseFloat(document.getElementById('claimAmount').value.replace(/,/g, '')),
            description: document.getElementById('description').value,
            hospitalName: document.getElementById('hospitalName').value,
            location: document.getElementById('location').value,
            documents: uploadedFiles.map(f => ({
                fileName: f.name,
                fileSize: f.size,
                fileType: f.type,
                type: 'supporting_document'
            })),
            status: 'pending',
            priority: 'medium',
            filedDate: new Date().toISOString()
        };
        
        // In production, upload files to cloud storage first
        // For now, just submit the claim data
        
        const response = await fetch(`${API_BASE}/claims`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(claimData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Claim submitted successfully!', 'success');
            
            // Redirect to success page
            setTimeout(() => {
                window.location.href = `claim-success.html?claimNumber=${data.data.claimNumber}`;
            }, 2000);
        } else {
            throw new Error(data.message || 'Failed to submit claim');
        }
    } catch (error) {
        console.error('Error submitting claim:', error);
        showNotification(error.message || 'Error submitting claim. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Claim';
    }
}

// Helper functions
function formatCurrency(amount) {
    if (!amount) return '₹0';
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
        return `₹${amount.toLocaleString('en-IN')}`;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
