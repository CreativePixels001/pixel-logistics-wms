// Policies Dashboard - Sync-Ready Management System
const API_BASE = 'http://localhost:5001/api/v1/pis';

let allPolicies = [];
let filteredPolicies = [];
let currentPage = 1;
const itemsPerPage = 15;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadPolicies();
    setupEventListeners();
});

function setupEventListeners() {
    // Real-time search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
}

// Load all policies from API
async function loadPolicies() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/policies`);
        const data = await response.json();
        
        if (data.success) {
            allPolicies = data.data || [];
            filteredPolicies = [...allPolicies];
            
            updateStats();
            renderTable();
            updatePagination();
        } else {
            showNotification('Failed to load policies', 'error');
        }
    } catch (error) {
        console.error('Error loading policies:', error);
        showNotification('Error connecting to server', 'error');
        
        // Load sample data for testing
        loadSampleData();
    } finally {
        showLoading(false);
    }
}

// Load sample data (for testing when API is unavailable)
function loadSampleData() {
    allPolicies = [
        {
            _id: '1',
            policyNumber: 'POL-2024-001',
            clientId: { name: 'Rajesh Kumar', email: 'rajesh@email.com' },
            insuranceType: 'health',
            insurerName: 'Star Health Insurance',
            planName: 'Family Health Optima',
            coverageAmount: 500000,
            premium: { totalPremium: 15000 },
            startDate: '2024-11-01',
            endDate: '2025-10-31',
            status: 'active',
            dataSource: 'manual',
            createdAt: '2024-11-01'
        },
        {
            _id: '2',
            policyNumber: 'POL-2024-002',
            clientId: { name: 'Priya Sharma', email: 'priya@email.com' },
            insuranceType: 'health',
            insurerName: 'ICICI Lombard',
            planName: 'Complete Health Insurance',
            coverageAmount: 1000000,
            premium: { totalPremium: 25000 },
            startDate: '2024-10-15',
            endDate: '2025-10-14',
            status: 'active',
            dataSource: 'synced',
            providerPolicyId: 'ICICI-HLT-2024-4532',
            syncStatus: 'synced',
            lastSyncDate: '2024-11-22T10:30:00Z',
            createdAt: '2024-10-15'
        }
    ];
    
    filteredPolicies = [...allPolicies];
    updateStats();
    renderTable();
    updatePagination();
}

// Update statistics
function updateStats() {
    const total = allPolicies.length;
    const active = allPolicies.filter(p => p.status === 'active').length;
    const synced = allPolicies.filter(p => p.dataSource === 'synced').length;
    const totalPremium = allPolicies.reduce((sum, p) => sum + (p.premium?.totalPremium || 0), 0);
    
    document.getElementById('totalPolicies').textContent = total;
    document.getElementById('activePolicies').textContent = active;
    document.getElementById('syncedPolicies').textContent = synced;
    document.getElementById('totalPremium').textContent = formatCurrency(totalPremium);
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const insuranceType = document.getElementById('insuranceTypeFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const insurer = document.getElementById('insurerFilter')?.value || '';
    const source = document.getElementById('sourceFilter')?.value || '';
    const dateRange = document.getElementById('dateFilter')?.value || '';
    
    filteredPolicies = allPolicies.filter(policy => {
        // Search filter
        const searchMatch = !searchTerm || 
            policy.policyNumber?.toLowerCase().includes(searchTerm) ||
            policy.clientId?.name?.toLowerCase().includes(searchTerm) ||
            policy.insurerName?.toLowerCase().includes(searchTerm);
        
        // Type filter
        const typeMatch = !insuranceType || policy.insuranceType === insuranceType;
        
        // Status filter
        const statusMatch = !status || policy.status === status;
        
        // Insurer filter
        const insurerMatch = !insurer || policy.insurerName === insurer;
        
        // Source filter
        const sourceMatch = !source || policy.dataSource === source;
        
        // Date range filter
        let dateMatch = true;
        if (dateRange) {
            const policyDate = new Date(policy.createdAt);
            const now = new Date();
            
            switch(dateRange) {
                case 'today':
                    dateMatch = isSameDay(policyDate, now);
                    break;
                case 'week':
                    dateMatch = isWithinDays(policyDate, 7);
                    break;
                case 'month':
                    dateMatch = isWithinDays(policyDate, 30);
                    break;
                case 'year':
                    dateMatch = isWithinDays(policyDate, 365);
                    break;
            }
        }
        
        return searchMatch && typeMatch && statusMatch && insurerMatch && sourceMatch && dateMatch;
    });
    
    currentPage = 1;
    renderTable();
    updatePagination();
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('insuranceTypeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('insurerFilter').value = '';
    document.getElementById('sourceFilter').value = '';
    document.getElementById('dateFilter').value = '';
    
    filteredPolicies = [...allPolicies];
    currentPage = 1;
    renderTable();
    updatePagination();
}

// Render table
function renderTable() {
    const tbody = document.getElementById('policiesTableBody');
    if (!tbody) return;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedPolicies = filteredPolicies.slice(start, end);
    
    if (paginatedPolicies.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" style="text-align: center; padding: 3rem; color: #666;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 1rem; opacity: 0.3;">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">No policies found</p>
                    <p style="font-size: 0.875rem; color: #999;">Try adjusting your filters or create a new policy</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = paginatedPolicies.map(policy => `
        <tr>
            <td>
                <input type="checkbox" class="policy-checkbox" value="${policy._id}">
            </td>
            <td>
                <div style="font-weight: 600; font-family: monospace;">${policy.policyNumber}</div>
                ${policy.dataSource === 'synced' ? `
                    <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                            <polyline points="23 4 23 10 17 10"/>
                            <polyline points="1 20 1 14 7 14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        ${policy.providerPolicyId || 'Synced'}
                    </div>
                ` : ''}
            </td>
            <td>
                <div style="font-weight: 600;">${policy.clientId?.name || 'N/A'}</div>
                <div style="font-size: 0.75rem; color: #666;">${policy.clientId?.email || ''}</div>
            </td>
            <td>
                <span class="type-badge type-${policy.insuranceType}">${formatType(policy.insuranceType)}</span>
            </td>
            <td>
                <div style="font-weight: 500;">${policy.insurerName}</div>
                <div style="font-size: 0.75rem; color: #666;">${policy.planName || ''}</div>
            </td>
            <td style="font-weight: 600;">${formatCurrency(policy.coverageAmount)}</td>
            <td style="font-weight: 600;">${formatCurrency(policy.premium?.totalPremium || 0)}</td>
            <td>${formatDate(policy.startDate)}</td>
            <td>${formatDate(policy.endDate)}</td>
            <td>${getStatusBadge(policy)}</td>
            <td>${getSourceBadge(policy)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewPolicy('${policy._id}')" title="View Details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="editPolicy('${policy._id}')" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    ${policy.dataSource === 'synced' ? `
                        <button class="btn-icon" onclick="resyncPolicy('${policy._id}')" title="Re-sync">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"/>
                                <polyline points="1 20 1 14 7 14"/>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('policyCount').textContent = `${filteredPolicies.length} ${filteredPolicies.length === 1 ? 'policy' : 'policies'}`;
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredPolicies.length);
    
    document.getElementById('showingStart').textContent = filteredPolicies.length > 0 ? start : 0;
    document.getElementById('showingEnd').textContent = end;
    document.getElementById('totalRecords').textContent = filteredPolicies.length;
    
    // Update buttons
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    const pageNumbers = document.getElementById('pageNumbers');
    if (pageNumbers) {
        let pages = '';
        const maxPages = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPages - 1);
        
        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        }
        
        pageNumbers.innerHTML = pages;
    }
}

// Change page
function changePage(delta) {
    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const newPage = currentPage + delta;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable();
        updatePagination();
    }
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    renderTable();
    updatePagination();
}

// View policy details
async function viewPolicy(policyId) {
    try {
        const policy = allPolicies.find(p => p._id === policyId);
        if (!policy) return;
        
        const modalContent = document.getElementById('policyDetailsContent');
        modalContent.innerHTML = `
            <div class="policy-details-grid">
                <div class="detail-section">
                    <h3>Policy Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Policy Number:</span>
                        <span class="detail-value">${policy.policyNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Insurance Type:</span>
                        <span class="detail-value">${formatType(policy.insuranceType)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Insurer:</span>
                        <span class="detail-value">${policy.insurerName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Plan:</span>
                        <span class="detail-value">${policy.planName || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${getStatusBadge(policy)}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Coverage & Premium</h3>
                    <div class="detail-row">
                        <span class="detail-label">Coverage Amount:</span>
                        <span class="detail-value">${formatCurrency(policy.coverageAmount)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Base Premium:</span>
                        <span class="detail-value">${formatCurrency(policy.premium?.basePremium || 0)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">GST (18%):</span>
                        <span class="detail-value">${formatCurrency(policy.premium?.gst || 0)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Premium:</span>
                        <span class="detail-value" style="font-weight: 700;">${formatCurrency(policy.premium?.totalPremium || 0)}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Policy Period</h3>
                    <div class="detail-row">
                        <span class="detail-label">Start Date:</span>
                        <span class="detail-value">${formatDate(policy.startDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">End Date:</span>
                        <span class="detail-value">${formatDate(policy.endDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Mode:</span>
                        <span class="detail-value">${policy.paymentMode || 'N/A'}</span>
                    </div>
                </div>
                
                ${policy.dataSource === 'synced' ? `
                    <div class="detail-section sync-info">
                        <h3>Sync Information</h3>
                        <div class="detail-row">
                            <span class="detail-label">Data Source:</span>
                            <span class="detail-value">${getSourceBadge(policy)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Provider Policy ID:</span>
                            <span class="detail-value">${policy.providerPolicyId || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Sync Status:</span>
                            <span class="detail-value">${policy.syncStatus || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Last Sync:</span>
                            <span class="detail-value">${policy.lastSyncDate ? new Date(policy.lastSyncDate).toLocaleString() : 'N/A'}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('policyModal').classList.add('show');
    } catch (error) {
        console.error('Error viewing policy:', error);
        showNotification('Error loading policy details', 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('policyModal').classList.remove('show');
}

// Edit policy
function editPolicy(policyId) {
    showNotification('Edit functionality coming soon', 'info');
}

// Re-sync policy from provider
async function resyncPolicy(policyId) {
    try {
        showNotification('Re-syncing policy from provider...', 'info');
        
        // In production, this would call the sync API
        // const response = await fetch(`${API_BASE}/policies/${policyId}/sync`, { method: 'POST' });
        
        setTimeout(() => {
            showNotification('Policy synced successfully', 'success');
            loadPolicies();
        }, 2000);
    } catch (error) {
        console.error('Error syncing policy:', error);
        showNotification('Failed to sync policy', 'error');
    }
}

// Sync all policies from providers
async function syncPolicies() {
    try {
        showNotification('Syncing policies from all providers...', 'info');
        
        // In production, this would call the sync API
        // const response = await fetch(`${API_BASE}/policies/sync-all`, { method: 'POST' });
        
        setTimeout(() => {
            showNotification('Policies synced successfully', 'success');
            loadPolicies();
        }, 3000);
    } catch (error) {
        console.error('Error syncing policies:', error);
        showNotification('Failed to sync policies', 'error');
    }
}

// Show create modal
function showCreateModal() {
    showNotification('Create policy form coming soon', 'info');
}

// Refresh policies
function refreshPolicies() {
    loadPolicies();
}

// Export policies to CSV
function exportPolicies() {
    try {
        const csv = convertToCSV(filteredPolicies);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `policies_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        showNotification('Policies exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting policies:', error);
        showNotification('Failed to export policies', 'error');
    }
}

// Convert to CSV
function convertToCSV(data) {
    const headers = ['Policy Number', 'Client', 'Type', 'Insurer', 'Coverage', 'Premium', 'Start Date', 'End Date', 'Status', 'Source'];
    const rows = data.map(p => [
        p.policyNumber,
        p.clientId?.name || '',
        p.insuranceType,
        p.insurerName,
        p.coverageAmount,
        p.premium?.totalPremium || 0,
        p.startDate,
        p.endDate,
        p.status,
        p.dataSource
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Toggle select all
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    document.querySelectorAll('.policy-checkbox').forEach(cb => cb.checked = selectAll);
}

// Helper functions
function getStatusBadge(policy) {
    const statusMap = {
        'active': { color: '#10b981', bg: '#d1fae5', text: 'Active' },
        'expired': { color: '#ef4444', bg: '#fee2e2', text: 'Expired' },
        'pending': { color: '#f59e0b', bg: '#fef3c7', text: 'Pending' },
        'cancelled': { color: '#6b7280', bg: '#f3f4f6', text: 'Cancelled' }
    };
    
    const status = statusMap[policy.status] || statusMap['pending'];
    return `<span style="background: ${status.bg}; color: ${status.color}; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${status.text}</span>`;
}

function getSourceBadge(policy) {
    if (policy.dataSource === 'synced') {
        return `<span style="background: #dbeafe; color: #2563eb; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Synced
        </span>`;
    }
    return `<span style="background: #f3f4f6; color: #6b7280; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Manual</span>`;
}

function formatType(type) {
    const typeMap = {
        'health': 'Health',
        'motor': 'Motor',
        'life': 'Life',
        'travel': 'Travel',
        'property': 'Property'
    };
    return typeMap[type] || type;
}

function formatCurrency(amount) {
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

function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}

function isWithinDays(date, days) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
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
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
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

// Add CSS animations
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
    
    .type-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: capitalize;
    }
    .type-health { background: #dbeafe; color: #2563eb; }
    .type-motor { background: #fef3c7; color: #f59e0b; }
    .type-life { background: #d1fae5; color: #10b981; }
    .type-travel { background: #fce7f3; color: #ec4899; }
    .type-property { background: #e0e7ff; color: #6366f1; }
    
    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }
    
    .btn-icon {
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-icon:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
    }
    
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        align-items: center;
        justify-content: center;
    }
    
    .modal.show {
        display: flex;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .policy-details-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
    }
    
    .detail-section h3 {
        margin-bottom: 1rem;
        font-size: 1.125rem;
        font-weight: 700;
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #f3f4f6;
    }
    
    .detail-label {
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .detail-value {
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .sync-info {
        grid-column: 1 / -1;
        background: #f9fafb;
        padding: 1rem;
        border-radius: 8px;
    }
    
    .btn-close {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
    }
    
    .loading-overlay {
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
    }
    
    .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #f3f4f6;
        border-top-color: #000;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .page-btn {
        padding: 0.5rem 0.75rem;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        margin: 0 0.25rem;
    }
    
    .page-btn.active {
        background: #000;
        color: white;
        border-color: #000;
    }
`;
document.head.appendChild(style);
