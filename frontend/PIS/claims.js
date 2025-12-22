// Claims Management Dashboard
const API_BASE = 'http://localhost:5001/api/v1/pis';

let allClaims = [];
let filteredClaims = [];
let currentPage = 1;
const itemsPerPage = 15;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadClaims();
    setupEventListeners();
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

// Load all claims from API
async function loadClaims() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/claims`);
        const data = await response.json();
        
        if (data.success) {
            allClaims = data.data || [];
            filteredClaims = [...allClaims];
            
            updateStats();
            renderTable();
            updatePagination();
        } else {
            showNotification('Failed to load claims', 'error');
        }
    } catch (error) {
        console.error('Error loading claims:', error);
        showNotification('Error connecting to server', 'error');
        
        // Load sample data for testing
        loadSampleData();
    } finally {
        showLoading(false);
    }
}

// Load sample data (for testing)
function loadSampleData() {
    allClaims = [
        {
            _id: '1',
            claimNumber: 'CLM-2024-001',
            policyId: {
                policyNumber: 'POL-2024-001',
                insuranceType: 'health'
            },
            clientId: {
                name: 'Rajesh Kumar',
                email: 'rajesh@email.com',
                phone: '+91 98765 43210'
            },
            claimType: 'hospitalization',
            claimAmount: 125000,
            approvedAmount: 0,
            status: 'pending',
            priority: 'high',
            incidentDate: '2024-11-15',
            filedDate: '2024-11-18',
            description: 'Emergency hospitalization due to cardiac issue',
            documents: [
                { fileName: 'hospital_bill.pdf', type: 'medical_bill' },
                { fileName: 'discharge_summary.pdf', type: 'discharge_summary' }
            ]
        },
        {
            _id: '2',
            claimNumber: 'CLM-2024-002',
            policyId: {
                policyNumber: 'POL-2024-002',
                insuranceType: 'health'
            },
            clientId: {
                name: 'Priya Sharma',
                email: 'priya@email.com',
                phone: '+91 98765 43211'
            },
            claimType: 'medical',
            claimAmount: 45000,
            approvedAmount: 45000,
            status: 'approved',
            priority: 'medium',
            incidentDate: '2024-11-10',
            filedDate: '2024-11-12',
            approvedDate: '2024-11-20',
            description: 'Outpatient medical treatment',
            documents: [
                { fileName: 'prescription.pdf', type: 'prescription' },
                { fileName: 'bills.pdf', type: 'medical_bill' }
            ]
        }
    ];
    
    filteredClaims = [...allClaims];
    updateStats();
    renderTable();
    updatePagination();
}

// Update statistics
function updateStats() {
    const total = allClaims.length;
    const pending = allClaims.filter(c => c.status === 'pending').length;
    const approved = allClaims.filter(c => c.status === 'approved').length;
    const totalAmount = allClaims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
    const approvedAmount = allClaims.filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
    
    document.querySelector('.stats-row .stat-card:nth-child(1) .stat-value').textContent = total;
    document.querySelector('.stats-row .stat-card:nth-child(2) .stat-value').textContent = pending;
    document.querySelector('.stats-row .stat-card:nth-child(3) .stat-value').textContent = formatCurrency(totalAmount);
    document.querySelector('.stats-row .stat-card:nth-child(4) .stat-value').textContent = formatCurrency(approvedAmount);
}

// Apply filters
function applyFilters() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const statusFilter = document.querySelector('.filter-select')?.value || '';
    
    filteredClaims = allClaims.filter(claim => {
        // Search filter
        const searchMatch = !searchTerm || 
            claim.claimNumber?.toLowerCase().includes(searchTerm) ||
            claim.clientId?.name?.toLowerCase().includes(searchTerm) ||
            claim.policyId?.policyNumber?.toLowerCase().includes(searchTerm);
        
        // Status filter
        const statusMatch = !statusFilter || claim.status === statusFilter;
        
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
    const paginatedClaims = filteredClaims.slice(start, end);
    
    if (paginatedClaims.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem; color: #666;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 1rem; opacity: 0.3;">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">No claims found</p>
                    <p style="font-size: 0.875rem; color: #999;">Try adjusting your filters</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = paginatedClaims.map(claim => `
        <tr>
            <td style="font-weight: 600; font-family: monospace;">${claim.claimNumber}</td>
            <td>
                <div style="font-weight: 600;">${claim.clientId?.name || 'N/A'}</div>
                <div style="font-size: 0.75rem; color: #666;">${claim.policyId?.policyNumber || 'N/A'}</div>
            </td>
            <td style="text-transform: capitalize;">${claim.claimType || 'N/A'}</td>
            <td style="font-weight: 600;">${formatCurrency(claim.claimAmount)}</td>
            <td>${formatDate(claim.incidentDate)}</td>
            <td>${formatDate(claim.filedDate)}</td>
            <td>${getStatusBadge(claim.status)}</td>
            <td class="priority-${claim.priority}">${(claim.priority || 'medium').toUpperCase()}</td>
            <td>
                <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                    <button class="action-btn" onclick="viewClaim('${claim._id}')" title="View Details">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    ${claim.status === 'pending' ? `
                        <button class="action-btn" onclick="approveClaim('${claim._id}')" style="background: #10b981; color: white; border-color: #10b981;" title="Approve">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="rejectClaim('${claim._id}')" style="background: #ef4444; color: white; border-color: #ef4444;" title="Reject">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    ` : claim.status === 'approved' ? `
                        <button class="action-btn" onclick="processPayment('${claim._id}')" style="background: #3b82f6; color: white; border-color: #3b82f6;" title="Process Payment">
                            💰 Pay
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
    // Pagination logic here (similar to policies dashboard)
}

// View claim details
async function viewClaim(claimId) {
    const claim = allClaims.find(c => c._id === claimId);
    if (!claim) return;
    
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: 1.5rem; font-weight: 700;">Claim Details</h2>
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
                            <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Claim Information</h3>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Claim Number:</span>
                                <strong style="font-size: 0.875rem;">${claim.claimNumber}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Policy Number:</span>
                                <strong style="font-size: 0.875rem;">${claim.policyId?.policyNumber || 'N/A'}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Claim Type:</span>
                                <strong style="font-size: 0.875rem; text-transform: capitalize;">${claim.claimType}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Status:</span>
                                ${getStatusBadge(claim.status)}
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Priority:</span>
                                <strong style="font-size: 0.875rem; text-transform: uppercase;">${claim.priority}</strong>
                            </div>
                        </div>
                        
                        <div>
                            <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Claimant Details</h3>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Name:</span>
                                <strong style="font-size: 0.875rem;">${claim.clientId?.name || 'N/A'}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Email:</span>
                                <strong style="font-size: 0.875rem;">${claim.clientId?.email || 'N/A'}</strong>
                            </div>
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Phone:</span>
                                <strong style="font-size: 0.875rem;">${claim.clientId?.phone || 'N/A'}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Financial Details</h3>
                        <div style="background: #f9fafb; padding: 1rem; border-radius: 8px;">
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Claim Amount:</span>
                                <strong style="font-size: 1.25rem;">${formatCurrency(claim.claimAmount)}</strong>
                            </div>
                            ${claim.approvedAmount > 0 ? `
                                <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-top: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280; font-size: 0.875rem;">Approved Amount:</span>
                                    <strong style="font-size: 1.25rem; color: #10b981;">${formatCurrency(claim.approvedAmount)}</strong>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Incident Details</h3>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 0.875rem;">Incident Date:</span>
                            <strong style="font-size: 0.875rem;">${formatDate(claim.incidentDate)}</strong>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 0.875rem;">Filed Date:</span>
                            <strong style="font-size: 0.875rem;">${formatDate(claim.filedDate)}</strong>
                        </div>
                        ${claim.approvedDate ? `
                            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6;">
                                <span style="color: #6b7280; font-size: 0.875rem;">Approved Date:</span>
                                <strong style="font-size: 0.875rem;">${formatDate(claim.approvedDate)}</strong>
                            </div>
                        ` : ''}
                        <div style="margin-top: 1rem;">
                            <span style="color: #6b7280; font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Description:</span>
                            <p style="font-size: 0.875rem; line-height: 1.6;">${claim.description || 'No description provided'}</p>
                        </div>
                    </div>
                    
                    ${claim.documents && claim.documents.length > 0 ? `
                        <div style="margin-top: 2rem;">
                            <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem;">Documents (${claim.documents.length})</h3>
                            <div style="display: grid; gap: 0.5rem;">
                                ${claim.documents.map(doc => `
                                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f9fafb; border-radius: 6px;">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                        </svg>
                                        <span style="flex: 1; font-size: 0.875rem;">${doc.fileName}</span>
                                        <span style="font-size: 0.75rem; color: #6b7280; text-transform: capitalize;">${doc.type?.replace('_', ' ')}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${claim.status === 'pending' ? `
                        <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                            <button onclick="rejectClaim('${claim._id}')" style="padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                                Reject Claim
                            </button>
                            <button onclick="approveClaim('${claim._id}')" style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                                Approve Claim
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.id = 'claimModal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('claimModal');
    if (modal) modal.remove();
}

// Approve claim
async function approveClaim(claimId) {
    const claim = allClaims.find(c => c._id === claimId);
    if (!claim) return;
    
    const approvedAmount = prompt(`Enter approved amount (Claimed: ${formatCurrency(claim.claimAmount)}):`, claim.claimAmount);
    if (!approvedAmount) return;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/claims/${claimId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'approved',
                approvedAmount: parseFloat(approvedAmount),
                approvedDate: new Date().toISOString(),
                remarks: 'Approved by admin'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Claim approved successfully!', 'success');
            closeModal();
            loadClaims();
        } else {
            showNotification(data.message || 'Failed to approve claim', 'error');
        }
    } catch (error) {
        console.error('Error approving claim:', error);
        showNotification('Error approving claim', 'error');
    } finally {
        showLoading(false);
    }
}

// Reject claim
async function rejectClaim(claimId) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/claims/${claimId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'rejected',
                rejectionReason: reason,
                rejectedDate: new Date().toISOString()
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Claim rejected', 'success');
            closeModal();
            loadClaims();
        } else {
            showNotification(data.message || 'Failed to reject claim', 'error');
        }
    } catch (error) {
        console.error('Error rejecting claim:', error);
        showNotification('Error rejecting claim', 'error');
    } finally {
        showLoading(false);
    }
}

// Process payment
function processPayment(claimId) {
    const claim = allClaims.find(c => c._id === claimId);
    if (!claim) return;
    
    showNotification(`Processing payment of ${formatCurrency(claim.approvedAmount)} to ${claim.clientId?.name}`, 'info');
    // In production, integrate with payment gateway
}

// Helper functions
function getStatusBadge(status) {
    const statusMap = {
        'pending': { class: 'status-pending', text: 'Pending' },
        'approved': { class: 'status-approved', text: 'Approved' },
        'rejected': { class: 'status-rejected', text: 'Rejected' },
        'investigating': { class: 'status-investigating', text: 'Investigating' }
    };
    
    const s = statusMap[status] || statusMap['pending'];
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

// Add modal overlay styles
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
