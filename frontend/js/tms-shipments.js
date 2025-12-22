/**
 * TMS Shipments Management - API Integration
 * Connects shipments page to backend API
 */

const API_BASE_URL = 'http://localhost:5001/api/tms';

let allShipments = [];
let filteredShipments = [];
let currentPage = 1;
const shipmentsPerPage = 20;

// Load shipments on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadShipments();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  const statusFilter = document.getElementById('statusFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  const searchFilter = document.getElementById('searchFilter');
  
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  if (priorityFilter) priorityFilter.addEventListener('change', applyFilters);
  if (searchFilter) {
    searchFilter.addEventListener('input', debounce(applyFilters, 300));
  }
}

// Debounce helper
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

// Load shipments from API
async function loadShipments() {
  try {
    showLoadingState();
    
    const response = await fetch(`${API_BASE_URL}/shipments`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    allShipments = data.shipments || data || [];
    filteredShipments = [...allShipments];
    
    renderShipments();
    updateStats();
    
  } catch (error) {
    console.error('Error loading shipments:', error);
    showErrorState('Failed to load shipments. Please ensure the backend server is running.');
  }
}

// Apply filters
function applyFilters() {
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  const priorityFilter = document.getElementById('priorityFilter')?.value || '';
  const searchFilter = document.getElementById('searchFilter')?.value.toLowerCase() || '';
  
  filteredShipments = allShipments.filter(shipment => {
    const matchesStatus = !statusFilter || shipment.status === statusFilter;
    const matchesPriority = !priorityFilter || shipment.priority === priorityFilter;
    const matchesSearch = !searchFilter || 
      shipment.shipmentId?.toLowerCase().includes(searchFilter) ||
      shipment.trackingNumber?.toLowerCase().includes(searchFilter) ||
      shipment.origin?.city?.toLowerCase().includes(searchFilter) ||
      shipment.destination?.city?.toLowerCase().includes(searchFilter);
    
    return matchesStatus && matchesPriority && matchesSearch;
  });
  
  currentPage = 1;
  renderShipments();
  updateStats();
}

// Render shipments table
function renderShipments() {
  const tbody = document.getElementById('shipmentsTableBody');
  if (!tbody) return;
  
  if (filteredShipments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto; opacity: 0.3;">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <p style="margin-top: 1rem; color: var(--color-text-secondary);">No shipments found</p>
        </td>
      </tr>
    `;
    return;
  }
  
  const startIndex = (currentPage - 1) * shipmentsPerPage;
  const endIndex = startIndex + shipmentsPerPage;
  const pageShipments = filteredShipments.slice(startIndex, endIndex);
  
  tbody.innerHTML = pageShipments.map(shipment => `
    <tr onclick="viewShipmentDetails('${shipment._id}')" style="cursor: pointer;">
      <td><strong>${shipment.shipmentId || 'N/A'}</strong></td>
      <td>
        <div>${formatLocation(shipment.origin)}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 0.25rem;">
          → ${formatLocation(shipment.destination)}
        </div>
      </td>
      <td>${formatCarrier(shipment.carrier)}</td>
      <td><span class="status-badge status-${shipment.status}">${formatStatus(shipment.status)}</span></td>
      <td><span class="priority-badge priority-${shipment.priority || 'normal'}">${formatPriority(shipment.priority)}</span></td>
      <td>${formatDate(shipment.scheduledDeliveryDate || shipment.estimatedDelivery)}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div class="progress-bar" style="flex: 1;">
            <div class="progress-fill" style="width: ${shipment.progress || 0}%;"></div>
          </div>
          <span style="font-size: 0.75rem; font-weight: 600;">${shipment.progress || 0}%</span>
        </div>
      </td>
      <td style="text-align: center;">
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); trackShipment('${shipment._id}')" title="Track">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
  
  renderPagination();
}

// Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredShipments.length / shipmentsPerPage);
  const paginationContainer = document.getElementById('paginationContainer');
  
  if (!paginationContainer || totalPages <= 1) {
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }
  
  let paginationHTML = '<div class="pagination">';
  
  // Previous button
  paginationHTML += `
    <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      Previous
    </button>
  `;
  
  // Page numbers
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    paginationHTML += `
      <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }
  
  if (totalPages > 5) {
    paginationHTML += `<span style="padding: 0.375rem;">...</span>`;
  }
  
  // Next button
  paginationHTML += `
    <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      Next
    </button>
  `;
  
  paginationHTML += '</div>';
  paginationHTML += `<div class="pagination-info" style="margin-left: 1rem;">Showing ${((currentPage - 1) * shipmentsPerPage) + 1}-${Math.min(currentPage * shipmentsPerPage, filteredShipments.length)} of ${filteredShipments.length}</div>`;
  
  paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
  const totalPages = Math.ceil(filteredShipments.length / shipmentsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderShipments();
}

// Update stats
function updateStats() {
  const totalShipments = filteredShipments.length;
  const activeShipments = filteredShipments.filter(s => ['picked_up', 'in_transit'].includes(s.status)).length;
  const deliveredToday = filteredShipments.filter(s => {
    if (s.status !== 'delivered' || !s.actualDelivery) return false;
    const today = new Date().toDateString();
    const deliveryDate = new Date(s.actualDelivery).toDateString();
    return today === deliveryDate;
  }).length;
  
  // Update stats if elements exist
  const totalElement = document.getElementById('totalShipments');
  const activeElement = document.getElementById('activeShipments');
  const deliveredElement = document.getElementById('deliveredToday');
  
  if (totalElement) totalElement.textContent = totalShipments;
  if (activeElement) activeElement.textContent = activeShipments;
  if (deliveredElement) deliveredElement.textContent = deliveredToday;
}

// Format helpers
function formatLocation(location) {
  if (!location) return 'N/A';
  if (typeof location === 'string') return location;
  return location.city ? `${location.city}, ${location.state || ''}` : location.address || 'N/A';
}

function formatCarrier(carrier) {
  if (!carrier) return 'N/A';
  if (typeof carrier === 'string') return carrier;
  return carrier.name || carrier.companyName || 'N/A';
}

function formatStatus(status) {
  if (!status) return 'N/A';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatPriority(priority) {
  if (!priority) return 'Normal';
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

// View shipment details
function viewShipmentDetails(shipmentId) {
  window.location.href = `tms-tracking.html?id=${shipmentId}`;
}

// Track shipment
function trackShipment(shipmentId) {
  window.location.href = `tms-tracking.html?id=${shipmentId}`;
}

// Show loading state
function showLoadingState() {
  const tbody = document.getElementById('shipmentsTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; padding: 3rem;">
        <div class="loading-spinner" style="margin: 0 auto;"></div>
        <p style="margin-top: 1rem; color: var(--color-text-secondary);">Loading shipments...</p>
      </td>
    </tr>
  `;
}

// Show error state
function showErrorState(message) {
  const tbody = document.getElementById('shipmentsTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; padding: 3rem;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin: 0 auto;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="margin-top: 1rem; color: #ef4444; font-weight: 500;">${message}</p>
        <button class="btn btn-primary" onclick="loadShipments()" style="margin-top: 1rem;">Retry</button>
      </td>
    </tr>
  `;
}

// Create shipment modal
function showCreateShipmentModal() {
  alert('Create Shipment feature coming soon!\n\nThis will open a form to create new shipments with:\n- Origin & Destination\n- Carrier Selection\n- Freight Details\n- Cost Breakdown\n- Priority & Notes');
}

// Export shipments
function exportShipments() {
  if (filteredShipments.length === 0) {
    alert('No shipments to export');
    return;
  }
  
  const csv = convertToCSV(filteredShipments);
  downloadCSV(csv, 'shipments-export.csv');
}

function convertToCSV(data) {
  const headers = ['Shipment ID', 'Status', 'Origin', 'Destination', 'Carrier', 'Pickup Date', 'Delivery Date', 'Cost'];
  const rows = data.map(s => [
    s.shipmentId || '',
    s.status || '',
    formatLocation(s.origin),
    formatLocation(s.destination),
    formatCarrier(s.carrier),
    s.pickupDate ? new Date(s.pickupDate).toLocaleDateString() : '',
    s.scheduledDeliveryDate ? new Date(s.scheduledDeliveryDate).toLocaleDateString() : '',
    s.cost?.totalCost ? `$${s.cost.totalCost}` : ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
