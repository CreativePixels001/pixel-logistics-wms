/**
 * TMS Carriers Page - API Integration
 * Connects frontend to backend carrier management API
 */

const API_BASE_URL = 'http://localhost:5001/api/tms';

// State management
let carriers = [];
let filteredCarriers = [];
let currentPage = 1;
const itemsPerPage = 10;

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadCarriers();
  setupEventListeners();
  setupSearch();
});

/**
 * Load carriers from API
 */
async function loadCarriers() {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/carriers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    carriers = data.data || [];
    filteredCarriers = carriers;
    
    renderCarriers();
    hideLoading();
  } catch (error) {
    console.error('Error loading carriers:', error);
    showError('Failed to load carriers. Please ensure the backend server is running.');
    hideLoading();
    // Load demo data as fallback
    loadDemoData();
  }
}

/**
 * Render carriers table
 */
function renderCarriers() {
  const tbody = document.querySelector('.table tbody');
  
  if (!tbody) {
    console.error('Table body not found');
    return;
  }

  if (filteredCarriers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem; color: var(--color-text-secondary);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.3;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div style="font-size: 1rem; font-weight: 500;">No carriers found</div>
          <div style="font-size: 0.875rem; margin-top: 0.5rem;">Try adjusting your search or add a new carrier</div>
        </td>
      </tr>
    `;
    return;
  }

  // Sort by rating (highest first)
  const sortedCarriers = [...filteredCarriers].sort((a, b) => 
    (b.performance?.rating || 0) - (a.performance?.rating || 0)
  );

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCarriers = sortedCarriers.slice(startIndex, endIndex);

  tbody.innerHTML = paginatedCarriers.map((carrier, index) => {
    const rank = startIndex + index + 1;
    const rating = carrier.performance?.rating || 0;
    const onTimePercentage = carrier.performance?.onTimePercentage || 0;
    const totalShipments = carrier.performance?.totalShipments || 0;
    const status = carrier.status || 'active';
    
    return `
      <tr data-carrier-id="${carrier._id}">
        <td>
          <span style="background: ${getRankBadgeColor(rank)}; color: ${rank <= 3 ? (rank === 1 ? '#000' : (rank === 2 ? '#000' : '#fff')) : 'var(--color-text)'}; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem;">
            ${rank}
          </span>
        </td>
        <td><strong>${carrier.name}</strong></td>
        <td>${carrier.dotNumber || 'N/A'}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.25rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="gold" stroke="gold">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style="font-weight: 600;">${rating.toFixed(1)}</span>
            <span style="color: var(--color-text-secondary); font-size: 0.75rem;">(${carrier.performance?.totalShipments || 0})</span>
          </div>
        </td>
        <td>
          <span style="color: ${onTimePercentage >= 95 ? '#16a34a' : (onTimePercentage >= 90 ? '#ea580c' : '#dc2626')}; font-weight: 600;">
            ${onTimePercentage.toFixed(1)}%
          </span>
        </td>
        <td>${totalShipments.toLocaleString()}</td>
        <td><span class="status-badge status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-icon" onclick="viewCarrier('${carrier._id}')" title="View Details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-icon" onclick="editCarrier('${carrier._id}')" title="Edit Carrier">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon" onclick="deleteCarrier('${carrier._id}')" title="Delete Carrier" style="color: #dc2626;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderPagination();
}

/**
 * Get rank badge color
 */
function getRankBadgeColor(rank) {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return '#cd7f32';
  return 'rgba(0,0,0,0.1)';
}

/**
 * View carrier details
 */
async function viewCarrier(carrierId) {
  try {
    const response = await fetch(`${API_BASE_URL}/carriers/${carrierId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch carrier details');

    const data = await response.json();
    const carrier = data.data;

    // Show modal with carrier details
    showCarrierModal(carrier);
  } catch (error) {
    console.error('Error fetching carrier:', error);
    alert('Failed to load carrier details');
  }
}

/**
 * Show carrier details modal
 */
function showCarrierModal(carrier) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h2>${carrier.name}</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div style="display: grid; gap: 1.5rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">DOT Number</div>
            <div style="font-weight: 600;">${carrier.dotNumber || 'N/A'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">MC Number</div>
            <div style="font-weight: 600;">${carrier.mcNumber || 'N/A'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Contact</div>
            <div>${carrier.contact?.email || 'N/A'}</div>
            <div>${carrier.contact?.phone || 'N/A'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Service Types</div>
            <div style="display: flex; flex-wrap: gap; gap: 0.5rem; margin-top: 0.5rem;">
              ${(carrier.serviceTypes || []).map(type => 
                `<span class="status-badge">${type.toUpperCase()}</span>`
              ).join('')}
            </div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Performance</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 0.5rem;">
              <div>
                <div style="font-size: 0.875rem;">Rating: <strong>${carrier.performance?.rating?.toFixed(1) || 'N/A'}</strong></div>
              </div>
              <div>
                <div style="font-size: 0.875rem;">On-Time: <strong>${carrier.performance?.onTimePercentage?.toFixed(1) || 0}%</strong></div>
              </div>
              <div>
                <div style="font-size: 0.875rem;">Total Shipments: <strong>${carrier.performance?.totalShipments || 0}</strong></div>
              </div>
              <div>
                <div style="font-size: 0.875rem;">Completed: <strong>${carrier.performance?.completedShipments || 0}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Close</button>
        <button onclick="editCarrier('${carrier._id}'); this.closest('.modal-overlay').remove();" class="btn btn-primary">Edit</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/**
 * Edit carrier
 */
function editCarrier(carrierId) {
  // TODO: Implement edit modal
  alert(`Edit carrier: ${carrierId}\n\nEdit functionality coming soon!`);
}

/**
 * Delete carrier
 */
async function deleteCarrier(carrierId) {
  if (!confirm('Are you sure you want to delete this carrier?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/carriers/${carrierId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to delete carrier');

    showSuccess('Carrier deleted successfully');
    await loadCarriers();
  } catch (error) {
    console.error('Error deleting carrier:', error);
    alert('Failed to delete carrier');
  }
}

/**
 * Setup search
 */
function setupSearch() {
  const searchInput = document.querySelector('input[placeholder*="Search"]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      filteredCarriers = carriers.filter(carrier => 
        carrier.name.toLowerCase().includes(query) ||
        carrier.dotNumber?.toLowerCase().includes(query) ||
        carrier.mcNumber?.toLowerCase().includes(query)
      );
      currentPage = 1;
      renderCarriers();
    });
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Add Carrier button
  const addBtn = document.querySelector('.btn-primary');
  if (addBtn && addBtn.textContent.includes('Add Carrier')) {
    addBtn.addEventListener('click', () => {
      alert('Add Carrier functionality coming soon!');
    });
  }
}

/**
 * Render pagination
 */
function renderPagination() {
  const totalPages = Math.ceil(filteredCarriers.length / itemsPerPage);
  
  // Check if pagination container exists
  let paginationContainer = document.querySelector('.pagination-container');
  
  if (!paginationContainer && totalPages > 1) {
    paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    paginationContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 1.5rem; padding: 1rem;';
    
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.after(paginationContainer);
    }
  }

  if (paginationContainer && totalPages > 1) {
    paginationContainer.innerHTML = `
      <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="btn btn-secondary" style="padding: 0.5rem 0.75rem;">
        Previous
      </button>
      <span style="color: var(--color-text-secondary); font-size: 0.875rem;">
        Page ${currentPage} of ${totalPages}
      </span>
      <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="btn btn-secondary" style="padding: 0.5rem 0.75rem;">
        Next
      </button>
    `;
  } else if (paginationContainer) {
    paginationContainer.remove();
  }
}

/**
 * Change page
 */
function changePage(page) {
  const totalPages = Math.ceil(filteredCarriers.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderCarriers();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show loading state
 */
function showLoading() {
  const tbody = document.querySelector('.table tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem;">
          <div class="loading-spinner" style="margin: 0 auto;"></div>
          <div style="margin-top: 1rem; color: var(--color-text-secondary);">Loading carriers...</div>
        </td>
      </tr>
    `;
  }
}

/**
 * Hide loading state
 */
function hideLoading() {
  // Loading is hidden when data is rendered
}

/**
 * Show error message
 */
function showError(message) {
  const tbody = document.querySelector('.table tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5" style="margin: 0 auto 1rem;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <div style="color: #dc2626; font-weight: 500; margin-bottom: 0.5rem;">${message}</div>
          <button onclick="loadCarriers()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
        </td>
      </tr>
    `;
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #16a34a;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Load demo data as fallback
 */
function loadDemoData() {
  carriers = [
    {
      _id: 'demo-1',
      name: 'Swift Freight Lines',
      dotNumber: 'DOT-1234567',
      mcNumber: 'MC-987654',
      contact: { email: 'contact@swiftfreight.com', phone: '(555) 123-4567' },
      serviceTypes: ['ftl', 'ltl', 'expedited'],
      performance: { rating: 4.8, onTimePercentage: 98.5, totalShipments: 1542, completedShipments: 1518 },
      status: 'active'
    },
    {
      _id: 'demo-2',
      name: 'National Express Logistics',
      dotNumber: 'DOT-2345678',
      mcNumber: 'MC-876543',
      contact: { email: 'info@nationalexpress.com', phone: '(555) 234-5678' },
      serviceTypes: ['ftl', 'refrigerated'],
      performance: { rating: 4.7, onTimePercentage: 97.8, totalShipments: 1234, completedShipments: 1206 },
      status: 'active'
    },
    {
      _id: 'demo-3',
      name: 'Rapid Logistics Corp',
      dotNumber: 'DOT-3456789',
      mcNumber: 'MC-765432',
      contact: { email: 'support@rapidlogistics.com', phone: '(555) 345-6789' },
      serviceTypes: ['ltl', 'parcel', 'expedited'],
      performance: { rating: 4.6, onTimePercentage: 96.2, totalShipments: 987, completedShipments: 949 },
      status: 'active'
    },
    {
      _id: 'demo-4',
      name: 'QuickHaul Transport',
      dotNumber: 'DOT-4567890',
      mcNumber: 'MC-654321',
      contact: { email: 'dispatch@quickhaul.com', phone: '(555) 456-7890' },
      serviceTypes: ['ftl', 'flatbed'],
      performance: { rating: 4.5, onTimePercentage: 95.5, totalShipments: 756, completedShipments: 721 },
      status: 'active'
    },
    {
      _id: 'demo-5',
      name: 'Metro Transport Services',
      dotNumber: 'DOT-5678901',
      mcNumber: 'MC-543210',
      contact: { email: 'info@metrotransport.com', phone: '(555) 567-8901' },
      serviceTypes: ['ltl', 'intermodal'],
      performance: { rating: 4.4, onTimePercentage: 94.8, totalShipments: 623, completedShipments: 590 },
      status: 'active'
    }
  ];
  filteredCarriers = carriers;
  renderCarriers();
}

/**
 * Save carrier (create or update)
 */
async function saveCarrier(carrierData) {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/carriers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(carrierData)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    showSuccess('Carrier created successfully!');
    await loadCarriers(); // Reload to show new carrier
    hideLoading();
  } catch (error) {
    console.error('Error saving carrier:', error);
    showError('Failed to save carrier. Using demo mode.');
    // Demo mode: add carrier locally
    const newCarrier = {
      _id: 'demo-' + Date.now(),
      ...carrierData,
      performance: {
        rating: 0,
        onTimePercentage: 0,
        totalShipments: 0,
        completedShipments: 0
      },
      status: 'active'
    };
    carriers.unshift(newCarrier);
    filteredCarriers = carriers;
    renderCarriers();
    hideLoading();
  }
}
