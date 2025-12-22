// API Configuration
const API_BASE = 'http://localhost:5001/api';

// State
let policies = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadPolicies();
});

// Load Policies
async function loadPolicies() {
    try {
        // Get userId from session/localStorage (for demo, using a sample ID)
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        
        if (userId) {
            // Fetch from API
            const response = await fetch(`${API_BASE}/policies/user/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                policies = data.policies;
                renderPolicies();
                updateStatistics();
                return;
            }
        }
        
        // Fallback to sample data if no userId or API fails
        policies = getSamplePolicies();
        renderPolicies();
        updateStatistics();
    } catch (error) {
        console.error('Error loading policies:', error);
        // Use sample data as fallback
        policies = getSamplePolicies();
        renderPolicies();
        updateStatistics();
    }
}

// Get Sample Policies
function getSamplePolicies() {
    return [
        {
            policyNumber: 'POL-2024-001234',
            type: 'Health Insurance',
            plan: 'Individual Health Plus',
            premium: 15000,
            coverAmount: 500000,
            startDate: '2024-01-15',
            endDate: '2025-01-14',
            status: 'active',
            insuredPerson: 'John Doe',
            claimsMade: 0,
            eligibleForNCB: true
        },
        {
            policyNumber: 'POL-2023-005678',
            type: 'Health Insurance',
            plan: 'Family Health Care',
            premium: 25000,
            coverAmount: 1000000,
            startDate: '2023-06-01',
            endDate: '2024-06-01',
            status: 'expiring',
            insuredPerson: 'John Doe & Family',
            claimsMade: 1,
            eligibleForNCB: false
        },
        {
            policyNumber: 'POL-2022-009999',
            type: 'Health Insurance',
            plan: 'Senior Citizen Health',
            premium: 18000,
            coverAmount: 300000,
            startDate: '2022-03-15',
            endDate: '2023-03-14',
            status: 'expired',
            insuredPerson: 'Jane Doe',
            claimsMade: 2,
            eligibleForNCB: false
        }
    ];
}

// Render Policies
function renderPolicies() {
    const grid = document.getElementById('policiesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!policies || policies.length === 0) {
        showEmptyState();
        return;
    }
    
    grid.innerHTML = '';
    emptyState.style.display = 'none';
    
    policies.forEach(policy => {
        const policyCard = createPolicyCard(policy);
        grid.appendChild(policyCard);
    });
}

// Create Policy Card
function createPolicyCard(policy) {
    const card = document.createElement('div');
    card.className = 'policy-card';
    
    const daysUntilExpiry = calculateDaysUntilExpiry(policy.endDate);
    const status = determineStatus(policy.endDate, policy.status);
    const renewalPrice = calculateRenewalPrice(policy.premium, policy.eligibleForNCB);
    
    card.innerHTML = `
        <div class="policy-header">
            <div class="policy-info">
                <h3>${policy.plan}</h3>
                <div class="policy-number">${policy.policyNumber}</div>
            </div>
            <span class="policy-status status-${status}">${formatStatus(status)}</span>
        </div>
        
        <div class="policy-body">
            ${status === 'expiring' ? createExpiryAlert(daysUntilExpiry) : ''}
            ${(status === 'expiring' || status === 'expired') && policy.eligibleForNCB ? createRenewalOffer(policy.premium, renewalPrice) : ''}
            
            <div class="policy-details">
                <div class="detail-item">
                    <span class="detail-label">Insured Person</span>
                    <span class="detail-value">${policy.insuredPerson}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Coverage Amount</span>
                    <span class="detail-value">₹${formatNumber(policy.coverAmount)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Annual Premium</span>
                    <span class="detail-value">₹${formatNumber(policy.premium)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Start Date</span>
                    <span class="detail-value">${formatDate(policy.startDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Expiry Date</span>
                    <span class="detail-value">${formatDate(policy.endDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Claims Made</span>
                    <span class="detail-value">${policy.claimsMade}</span>
                </div>
            </div>
            
            <div class="policy-actions">
                ${createActionButtons(policy, status)}
            </div>
        </div>
    `;
    
    return card;
}

// Create Expiry Alert
function createExpiryAlert(daysUntilExpiry) {
    return `
        <div class="expiry-alert">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v4m0 4h.01M3.055 11H5a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 1 2 2v2.945M8 3.935V5.5A2.5 2.5 0 0 0 10.5 8h.5a2 2 0 0 1 2 2 2 2 0 1 0 4 0 2 2 0 0 1 2-2h1.064M15 20.488V18a2 2 0 0 1 2-2h3.064M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
            <div>
                <strong>Policy Expiring Soon!</strong><br>
                Your policy will expire in ${daysUntilExpiry} days. Renew now to avoid coverage gaps.
            </div>
        </div>
    `;
}

// Create Renewal Offer
function createRenewalOffer(originalPrice, renewalPrice) {
    const discount = originalPrice - renewalPrice;
    const discountPercent = Math.round((discount / originalPrice) * 100);
    
    return `
        <div class="renewal-offer">
            <h4>🎉 No Claim Bonus Available!</h4>
            <p>Congratulations! You're eligible for a ${discountPercent}% discount on your renewal.</p>
            <div class="offer-details">
                <div>
                    <div class="original-price">₹${formatNumber(originalPrice)}</div>
                    <div class="offer-price">₹${formatNumber(renewalPrice)}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.875rem; opacity: 0.9;">You Save</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">₹${formatNumber(discount)}</div>
                </div>
            </div>
        </div>
    `;
}

// Create Action Buttons
function createActionButtons(policy, status) {
    if (status === 'expired') {
        return `
            <button class="btn-primary" onclick="renewPolicy('${policy.policyNumber}')">
                Renew Policy
            </button>
            <button class="btn-secondary" onclick="viewPolicyDetails('${policy.policyNumber}')">
                View Details
            </button>
        `;
    } else if (status === 'expiring') {
        return `
            <button class="btn-primary" onclick="renewPolicy('${policy.policyNumber}')">
                Renew Now
            </button>
            <button class="btn-secondary" onclick="viewPolicyDetails('${policy.policyNumber}')">
                View Details
            </button>
        `;
    } else {
        return `
            <button class="btn-secondary" onclick="viewPolicyDetails('${policy.policyNumber}')">
                View Details
            </button>
            <button class="btn-secondary" onclick="downloadPolicy('${policy.policyNumber}')">
                Download PDF
            </button>
        `;
    }
}

// Calculate Days Until Expiry
function calculateDaysUntilExpiry(endDate) {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Determine Status
function determineStatus(endDate, currentStatus) {
    if (currentStatus === 'expired') return 'expired';
    
    const daysUntilExpiry = calculateDaysUntilExpiry(endDate);
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 60) return 'expiring';
    return 'active';
}

// Calculate Renewal Price with NCB
function calculateRenewalPrice(premium, eligibleForNCB) {
    if (!eligibleForNCB) return premium;
    
    // 20% No Claim Bonus discount
    const discount = premium * 0.20;
    return Math.round(premium - discount);
}

// Update Statistics
function updateStatistics() {
    const stats = {
        active: 0,
        expiring: 0,
        totalCoverage: 0,
        pendingRenewal: 0
    };
    
    policies.forEach(policy => {
        const status = determineStatus(policy.endDate, policy.status);
        
        if (status === 'active') stats.active++;
        if (status === 'expiring') stats.expiring++;
        if (status === 'expiring' || status === 'expired') stats.pendingRenewal++;
        
        if (status === 'active' || status === 'expiring') {
            stats.totalCoverage += policy.coverAmount;
        }
    });
    
    document.getElementById('activePolicies').textContent = stats.active;
    document.getElementById('expiringSoon').textContent = stats.expiring;
    document.getElementById('totalCoverage').textContent = '₹' + formatNumber(stats.totalCoverage);
    document.getElementById('pendingRenewal').textContent = stats.pendingRenewal;
}

// Show Empty State
function showEmptyState() {
    document.getElementById('policiesGrid').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    
    document.getElementById('activePolicies').textContent = '0';
    document.getElementById('expiringSoon').textContent = '0';
    document.getElementById('totalCoverage').textContent = '₹0';
    document.getElementById('pendingRenewal').textContent = '0';
}

// Renew Policy
function renewPolicy(policyNumber) {
    const policy = policies.find(p => p.policyNumber === policyNumber);
    
    if (!policy) {
        alert('Policy not found!');
        return;
    }
    
    // Store renewal data in sessionStorage
    const renewalData = {
        policyNumber: policy.policyNumber,
        plan: policy.plan,
        premium: policy.premium,
        coverAmount: policy.coverAmount,
        eligibleForNCB: policy.eligibleForNCB,
        renewalPrice: calculateRenewalPrice(policy.premium, policy.eligibleForNCB),
        insuredPerson: policy.insuredPerson
    };
    
    sessionStorage.setItem('renewalData', JSON.stringify(renewalData));
    
    // Redirect to renewal payment page
    window.location.href = 'renewal-payment.html';
}

// View Policy Details
function viewPolicyDetails(policyNumber) {
    const policy = policies.find(p => p.policyNumber === policyNumber);
    
    if (!policy) {
        alert('Policy not found!');
        return;
    }
    
    // Create detailed view modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 2rem;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 2rem;">
            <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Policy Details</h2>
            
            <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem;">
                <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Policy Number</div>
                <div style="font-size: 1rem; font-weight: 600; font-family: monospace;">${policy.policyNumber}</div>
            </div>
            
            <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
                <div>
                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Plan</div>
                    <div style="font-weight: 600;">${policy.plan}</div>
                </div>
                <div>
                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Insured Person</div>
                    <div style="font-weight: 600;">${policy.insuredPerson}</div>
                </div>
                <div>
                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Coverage Amount</div>
                    <div style="font-weight: 600;">₹${formatNumber(policy.coverAmount)}</div>
                </div>
                <div>
                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Annual Premium</div>
                    <div style="font-weight: 600;">₹${formatNumber(policy.premium)}</div>
                </div>
                <div>
                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Policy Period</div>
                    <div style="font-weight: 600;">${formatDate(policy.startDate)} to ${formatDate(policy.endDate)}</div>
                </div>
                <div>
                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Claims Made</div>
                    <div style="font-weight: 600;">${policy.claimsMade}</div>
                </div>
                ${policy.eligibleForNCB ? `
                    <div style="background: #dcfce7; color: #166534; padding: 0.75rem; border-radius: 6px;">
                        ✓ Eligible for 20% No Claim Bonus on renewal
                    </div>
                ` : ''}
            </div>
            
            <button onclick="this.closest('div[style*=fixed]').remove()" style="width: 100%; padding: 0.875rem; background: #000; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Download Policy
function downloadPolicy(policyNumber) {
    const policy = policies.find(p => p.policyNumber === policyNumber);
    
    if (!policy) {
        alert('Policy not found!');
        return;
    }
    
    // In production, this would trigger actual PDF download
    alert(`Downloading policy ${policyNumber}...\n\nThis feature will be available soon!`);
    
    // Example of actual implementation:
    // window.location.href = `${API_BASE}/policies/${policyNumber}/download`;
}

// Utility Functions
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        day: 'numeric',
        month: 'short', 
        year: 'numeric' 
    });
}

function formatStatus(status) {
    const statusMap = {
        'active': 'Active',
        'expiring': 'Expiring Soon',
        'expired': 'Expired'
    };
    return statusMap[status] || status;
}
