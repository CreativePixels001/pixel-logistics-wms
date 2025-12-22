// Renewals Management Dashboard
const API_BASE = 'http://localhost:5001/api/v1/pis';

let allRenewals = [];
let filteredRenewals = [];
let currentPage = 1;
const itemsPerPage = 15;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadRenewals();
    setupEventListeners();
    loadUpcomingExpirations();
});

function setupEventListeners() {
    // Real-time search
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    // Filter change listeners
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', applyFilters);
    });
}

// Load renewals data
async function loadRenewals() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/policies?status=active,expiring`);
        const data = await response.json();
        
        if (data.success) {
            // Transform policies to renewal format
            allRenewals = (data.data || []).map(policy => transformToRenewal(policy));
            filteredRenewals = [...allRenewals];
            
            updateStats();
            renderTable();
            updatePagination();
        } else {
            showNotification('Failed to load renewals', 'error');
            loadSampleData();
        }
    } catch (error) {
        console.error('Error loading renewals:', error);
        showNotification('Error connecting to server', 'error');
        loadSampleData();
    } finally {
        showLoading(false);
    }
}

// Transform policy to renewal format
function transformToRenewal(policy) {
    const endDate = new Date(policy.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    let status = 'active';
    if (daysUntilExpiry < 0) {
        status = 'overdue';
    } else if (daysUntilExpiry <= 30) {
        status = 'due-soon';
    } else if (daysUntilExpiry <= 60) {
        status = 'contacted';
    }
    
    return {
        _id: policy._id,
        policyNumber: policy.policyNumber,
        clientId: policy.clientId,
        insuranceType: policy.insuranceType,
        insurer: policy.insurerName || policy.insurer,
        coverageAmount: policy.coverageAmount,
        premiumAmount: policy.premium?.totalPremium || policy.premiumAmount,
        startDate: policy.startDate,
        endDate: policy.endDate,
        daysUntilExpiry,
        status,
        renewalStatus: policy.renewalStatus || (daysUntilExpiry > 0 ? 'pending' : 'overdue'),
        lastContacted: policy.lastContacted,
        remindersSent: policy.remindersSent || 0,
        noClaimBonus: calculateNoClaimBonus(policy)
    };
}

// Calculate no-claim bonus
function calculateNoClaimBonus(policy) {
    // If no claims in policy period, give 20% discount
    const hasClaims = policy.claimCount > 0;
    if (!hasClaims) {
        return {
            eligible: true,
            percentage: 20,
            amount: Math.round((policy.premium?.totalPremium || 0) * 0.20)
        };
    }
    return { eligible: false, percentage: 0, amount: 0 };
}

// Load sample data
function loadSampleData() {
    const today = new Date();
    allRenewals = [
        {
            _id: '1',
            policyNumber: 'POL-2024-001',
            clientId: { name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 98765 43210' },
            insuranceType: 'health',
            insurer: 'Star Health Insurance',
            coverageAmount: 500000,
            premiumAmount: 17700,
            startDate: '2024-11-22',
            endDate: '2025-01-15',
            daysUntilExpiry: 54,
            status: 'contacted',
            renewalStatus: 'pending',
            lastContacted: '2024-11-15',
            remindersSent: 2,
            noClaimBonus: { eligible: true, percentage: 20, amount: 3540 }
        },
        {
            _id: '2',
            policyNumber: 'POL-2024-002',
            clientId: { name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 43211' },
            insuranceType: 'health',
            insurer: 'ICICI Lombard',
            coverageAmount: 1000000,
            premiumAmount: 28500,
            startDate: '2024-10-10',
            endDate: '2024-12-25',
            daysUntilExpiry: 33,
            status: 'contacted',
            renewalStatus: 'pending',
            lastContacted: null,
            remindersSent: 0,
            noClaimBonus: { eligible: false, percentage: 0, amount: 0 }
        },
        {
            _id: '3',
            policyNumber: 'POL-2024-003',
            clientId: { name: 'Amit Patel', email: 'amit@email.com', phone: '+91 98765 43212' },
            insuranceType: 'motor',
            insurer: 'HDFC ERGO',
            coverageAmount: 500000,
            premiumAmount: 12000,
            startDate: '2024-11-01',
            endDate: '2024-12-05',
            daysUntilExpiry: 13,
            status: 'due-soon',
            renewalStatus: 'pending',
            lastContacted: '2024-11-18',
            remindersSent: 3,
            noClaimBonus: { eligible: true, percentage: 20, amount: 2400 }
        }
    ];
    
    filteredRenewals = [...allRenewals];
    updateStats();
    renderTable();
    updatePagination();
}

// Update statistics
function updateStats() {
    const total = allRenewals.length;
    const dueSoon = allRenewals.filter(r => r.status === 'due-soon').length;
    const contacted = allRenewals.filter(r => r.lastContacted).length;
    const totalValue = allRenewals.reduce((sum, r) => sum + (r.premiumAmount || 0), 0);
    
    document.querySelector('.stats-row .stat-card:nth-child(1) .stat-value').textContent = total;
    document.querySelector('.stats-row .stat-card:nth-child(2) .stat-value').textContent = dueSoon;
    document.querySelector('.stats-row .stat-card:nth-child(3) .stat-value').textContent = contacted;
    document.querySelector('.stats-row .stat-card:nth-child(4) .stat-value').textContent = formatCurrency(totalValue);
}

// Apply filters
function applyFilters() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const statusFilter = document.querySelector('.filter-select')?.value || '';
    
    filteredRenewals = allRenewals.filter(renewal => {
        const searchMatch = !searchTerm || 
            renewal.policyNumber?.toLowerCase().includes(searchTerm) ||
            renewal.clientId?.name?.toLowerCase().includes(searchTerm) ||
            renewal.insurer?.toLowerCase().includes(searchTerm);
        
        const statusMatch = !statusFilter || renewal.status === statusFilter;
        
        return searchMatch && statusMatch;
    });
    
    currentPage = 1;
    renderTable();
    updatePagination();
}

// Render table
function renderTable() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedRenewals = filteredRenewals.slice(start, end);
    
    if (paginatedRenewals.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem; color: #666;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 1rem; opacity: 0.3;">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">No renewals found</p>
                    <p style="font-size: 0.875rem; color: #999;">Try adjusting your filters</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = paginatedRenewals.map(renewal => `
        <tr>
            <td style="font-weight: 600; font-family: monospace;">${renewal.policyNumber}</td>
            <td>
                <div style="font-weight: 600;">${renewal.clientId?.name || 'N/A'}</div>
                <div style="font-size: 0.75rem; color: #666;">${renewal.clientId?.email || ''}</div>
            </td>
            <td style="text-transform: capitalize;">${renewal.insuranceType}</td>
            <td>${renewal.insurer}</td>
            <td style="font-weight: 600;">${formatCurrency(renewal.coverageAmount)}</td>
            <td>${formatDate(renewal.endDate)}</td>
            <td>
                <div style="font-weight: 700; ${renewal.daysUntilExpiry < 0 ? 'color: #ef4444;' : renewal.daysUntilExpiry <= 30 ? 'color: #f59e0b;' : ''}">
                    ${renewal.daysUntilExpiry < 0 ? 'Expired' : renewal.daysUntilExpiry + ' days'}
                </div>
            </td>
            <td>${getStatusBadge(renewal.status)}</td>
            <td>
                <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                    <button class="action-btn" onclick="viewRenewal('${renewal._id}')" title="View Details">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="action-btn" onclick="sendReminder('${renewal._id}')" style="background: #3b82f6; color: white; border-color: #3b82f6;" title="Send Reminder">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </button>
                    ${renewal.daysUntilExpiry <= 30 ? `
                        <button class="action-btn" onclick="initiateRenewal('${renewal._id}')" style="background: #10b981; color: white; border-color: #10b981;" title="Renew Now">
                            ↻ Renew
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredRenewals.length / itemsPerPage);
    // Pagination logic here
}

// View renewal details
async function viewRenewal(renewalId) {
    const renewal = allRenewals.find(r => r._id === renewalId);
    if (!renewal) return;
    
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: 1.5rem; font-weight: 700;">Renewal Details</h2>
                    <button onclick="closeModal()" style="background: transparent; border: none; cursor: pointer; padding: 0.5rem;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                        <div>
                            <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Policy Information</h3>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Policy Number:</span>
                                <strong style="font-size: 0.875rem;">${renewal.policyNumber}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Insurance Type:</span>
                                <strong style="font-size: 0.875rem; text-transform: capitalize;">${renewal.insuranceType}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Insurer:</span>
                                <strong style="font-size: 0.875rem;">${renewal.insurer}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Coverage Amount:</span>
                                <strong style="font-size: 0.875rem;">${formatCurrency(renewal.coverageAmount)}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Premium Amount:</span>
                                <strong style="font-size: 0.875rem;">${formatCurrency(renewal.premiumAmount)}</strong>
                            </div>
                        </div>
                        
                        <div>
                            <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Client Details</h3>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Name:</span>
                                <strong style="font-size: 0.875rem;">${renewal.clientId?.name || 'N/A'}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Email:</span>
                                <strong style="font-size: 0.875rem;">${renewal.clientId?.email || 'N/A'}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Phone:</span>
                                <strong style="font-size: 0.875rem;">${renewal.clientId?.phone || 'N/A'}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Renewal Timeline</h3>
                        <div style="background: #f9fafb; padding: 1rem; border-radius: 8px;">
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Policy Start Date:</span>
                                <strong style="font-size: 0.875rem;">${formatDate(renewal.startDate)}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-top: 1px solid #e5e7eb;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Policy End Date:</span>
                                <strong style="font-size: 0.875rem;">${formatDate(renewal.endDate)}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-top: 1px solid #e5e7eb;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Days Until Expiry:</span>
                                <strong style="font-size: 1.25rem; ${renewal.daysUntilExpiry < 0 ? 'color: #ef4444;' : renewal.daysUntilExpiry <= 30 ? 'color: #f59e0b;' : ''}">${renewal.daysUntilExpiry < 0 ? 'EXPIRED' : renewal.daysUntilExpiry + ' days'}</strong>
                            </div>
                        </div>
                    </div>
                    
                    ${renewal.noClaimBonus.eligible ? `
                        <div style="margin-top: 2rem;">
                            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                    </svg>
                                    <h3 style="font-size: 1.25rem; font-weight: 700; margin: 0;">No Claim Bonus Eligible!</h3>
                                </div>
                                <p style="opacity: 0.9; margin-bottom: 1rem;">Congratulations! This customer is eligible for a ${renewal.noClaimBonus.percentage}% discount on renewal.</p>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 0.875rem;">Renewal Discount:</span>
                                    <span style="font-size: 2rem; font-weight: 700;">- ${formatCurrency(renewal.noClaimBonus.amount)}</span>
                                </div>
                                <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2); display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 0.875rem;">New Premium:</span>
                                    <span style="font-size: 1.5rem; font-weight: 700;">${formatCurrency(renewal.premiumAmount - renewal.noClaimBonus.amount)}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="margin-top: 2rem;">
                        <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Communication Status</h3>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 0.875rem;">Last Contacted:</span>
                            <strong style="font-size: 0.875rem;">${renewal.lastContacted ? formatDate(renewal.lastContacted) : 'Not yet contacted'}</strong>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 0.875rem;">Reminders Sent:</span>
                            <strong style="font-size: 0.875rem;">${renewal.remindersSent} reminder(s)</strong>
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                        <button onclick="sendReminder('${renewal._id}')" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                            Send Reminder
                        </button>
                        <button onclick="initiateRenewal('${renewal._id}')" style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                            Initiate Renewal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.id = 'renewalModal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('renewalModal');
    if (modal) modal.remove();
}

// Send renewal reminder
async function sendReminder(renewalId) {
    const renewal = allRenewals.find(r => r._id === renewalId);
    if (!renewal) return;
    
    if (confirm(`Send renewal reminder to ${renewal.clientId?.name}?`)) {
        showLoading(true);
        try {
            // In production, call email/SMS API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            renewal.remindersSent++;
            renewal.lastContacted = new Date().toISOString();
            
            showNotification('Reminder sent successfully!', 'success');
            closeModal();
            renderTable();
        } catch (error) {
            showNotification('Failed to send reminder', 'error');
        } finally {
            showLoading(false);
        }
    }
}

// Initiate renewal
function initiateRenewal(renewalId) {
    const renewal = allRenewals.find(r => r._id === renewalId);
    if (!renewal) return;
    
    // Store renewal data in session
    sessionStorage.setItem('renewalData', JSON.stringify(renewal));
    
    // Redirect to renewal page
    window.location.href = `renewal-payment.html?policyId=${renewal._id}`;
}

// Load upcoming expirations calendar
function loadUpcomingExpirations() {
    // Calendar view logic here
}

// Helper functions
function getStatusBadge(status) {
    const statusMap = {
        'due-soon': { class: 'status-due-soon', text: 'Due Soon' },
        'contacted': { class: 'status-contacted', text: 'Contacted' },
        'renewed': { class: 'status-renewed', text: 'Renewed' },
        'overdue': { class: 'status-overdue', text: 'Overdue' }
    };
    
    const s = statusMap[status] || statusMap['due-soon'];
    return `<span class="status-badge ${s.class}">${s.text}</span>`;
}

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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading(show) {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1rem;
        `;
        overlay.innerHTML = `
            <div style="width: 48px; height: 48px; border: 4px solid #f3f4f6; border-top-color: #000; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p>Loading...</p>
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    const colors = {
        success: { bg: '#10b981', icon: 'check-circle' },
        error: { bg: '#ef4444', icon: 'x-circle' },
        info: { bg: '#3b82f6', icon: 'info' }
    };
    
    const color = colors[type] || colors.info;
    
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
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
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        animation: scaleIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(style);
