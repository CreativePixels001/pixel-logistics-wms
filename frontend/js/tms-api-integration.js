/* ===================================
   TMS API Integration
   Connects Frontend to Backend APIs
   =================================== */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://creativepixels.in/api';

// API Endpoints
const API_ENDPOINTS = {
  // Dashboard
  getDashboardStats: '/tms/dashboard/stats',
  getAlerts: '/tms/dashboard/alerts',
  
  // Shipments
  createShipment: '/tms/shipments',
  getShipments: '/tms/shipments',
  getShipmentById: '/tms/shipments/:id',
  updateShipment: '/tms/shipments/:id',
  deleteShipment: '/tms/shipments/:id',
  
  // Carriers
  getCarriers: '/tms/carriers',
  getCarrierById: '/tms/carriers/:id',
  searchCarriers: '/tms/carriers/search',
  updateCarrierPerformance: '/tms/carriers/:id/performance',
  
  // Routes
  getRoutes: '/tms/routes',
  optimizeRoute: '/tms/routes/optimize'
};

// ===================================
// API Helper Functions
// ===================================

/**
 * Make API Request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - API response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // Add auth token if available
      ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` })
    }
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Failed:', error);
    handleAPIError(error);
    throw error;
  }
}

/**
 * Get Authentication Token
 */
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Handle API Errors
 */
function handleAPIError(error) {
  // Show user-friendly error message
  const errorMessages = {
    'Failed to fetch': 'Unable to connect to server. Please check your internet connection.',
    '401': 'Session expired. Please login again.',
    '403': 'You don\'t have permission to perform this action.',
    '404': 'Requested resource not found.',
    '500': 'Server error. Please try again later.'
  };
  
  let message = errorMessages[error.message] || 'An unexpected error occurred.';
  
  // Check for network error
  if (error.message === 'Failed to fetch') {
    message = errorMessages['Failed to fetch'];
  }
  
  showErrorNotification(message);
}

// ===================================
// Dashboard API Functions
// ===================================

/**
 * Load Dashboard Statistics
 */
async function loadDashboardStats() {
  try {
    const stats = await apiRequest(API_ENDPOINTS.getDashboardStats);
    
    // Update stat cards
    updateStatCard('active-shipments', stats.activeShipments || 0);
    updateStatCard('ontime-delivery', stats.ontimePercentage || 0, '%');
    updateStatCard('monthly-cost', stats.monthlyCost || 0, '$', 'K');
    updateStatCard('pending-deliveries', stats.pendingDeliveries || 0);
    
    // Update carrier rankings
    if (stats.topCarriers && stats.topCarriers.length > 0) {
      updateCarrierRankings(stats.topCarriers);
    }
    
    // Update alerts
    if (stats.alerts && stats.alerts.length > 0) {
      updateAlerts(stats.alerts);
    }
    
    return stats;
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    // Use fallback mock data
    loadMockDashboardStats();
  }
}

/**
 * Update Stat Card
 */
function updateStatCard(id, value, suffix = '', prefix = '') {
  const element = document.querySelector(`[data-stat="${id}"] .stat-value`);
  if (!element) return;
  
  let displayValue = value;
  if (prefix === '$') {
    displayValue = `$${(value / 1000).toFixed(1)}${suffix}`;
  } else if (suffix === '%') {
    displayValue = `${value.toFixed(1)}%`;
  } else {
    displayValue = Math.round(value);
  }
  
  // Animate the value
  animateValue(element, 0, value, 1000, suffix === '%', prefix === '$');
}

/**
 * Update Carrier Rankings
 */
function updateCarrierRankings(carriers) {
  const container = document.querySelector('.carrier-rankings-list');
  if (!container) return;
  
  container.innerHTML = carriers.map((carrier, index) => `
    <div class="carrier-item" data-carrier-id="${carrier._id || carrier.id}">
      <div class="carrier-rank">#${index + 1}</div>
      <div class="carrier-details">
        <div class="carrier-name">${carrier.name}</div>
        <div class="carrier-meta">${carrier.shipmentsCompleted || 0} shipments • ${carrier.rating || 0}⭐</div>
      </div>
      <div class="carrier-stats">
        <div class="stat-mini">
          <div class="stat-mini-label">On-time</div>
          <div class="stat-mini-value">${carrier.ontimeRate || 0}%</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-label">Avg Cost</div>
          <div class="stat-mini-value">$${carrier.avgCost || 0}</div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Update Alerts
 */
function updateAlerts(alerts) {
  const container = document.querySelector('.alerts-list');
  if (!container) return;
  
  container.innerHTML = alerts.slice(0, 5).map(alert => `
    <div class="alert-item ${alert.type || 'warning'}">
      <div class="alert-icon">
        ${getAlertIcon(alert.type)}
      </div>
      <div class="alert-details">
        <div class="alert-title">${alert.title || 'Alert'}</div>
        <div class="alert-message">${alert.message}</div>
        <div class="alert-time">${formatTimeAgo(alert.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

/**
 * Get Alert Icon
 */
function getAlertIcon(type) {
  const icons = {
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    delay: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
  };
  return icons[type] || icons.warning;
}

// ===================================
// Shipment API Functions
// ===================================

/**
 * Load Active Shipments
 */
async function loadActiveShipments(filters = {}) {
  try {
    const queryParams = new URLSearchParams({
      status: 'in_transit,pending_pickup',
      limit: 10,
      ...filters
    });
    
    const response = await apiRequest(`${API_ENDPOINTS.getShipments}?${queryParams}`);
    
    if (response.success && response.data) {
      updateShipmentsTable(response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Failed to load shipments:', error);
    // Use fallback mock data
    loadMockShipments();
  }
}

/**
 * Update Shipments Table
 */
function updateShipmentsTable(shipments) {
  const tbody = document.querySelector('.shipments-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = shipments.map(shipment => `
    <tr data-shipment-id="${shipment._id || shipment.id}">
      <td><span class="shipment-id">${shipment.trackingNumber || shipment.id}</span></td>
      <td>
        <div class="route-info">
          <div class="route-origin">${shipment.origin?.city || shipment.origin}, ${shipment.origin?.state || ''}</div>
          <div class="route-arrow">→</div>
          <div class="route-destination">${shipment.destination?.city || shipment.destination}, ${shipment.destination?.state || ''}</div>
        </div>
      </td>
      <td>
        <div class="carrier-badge">${shipment.carrier?.name || shipment.carrier}</div>
      </td>
      <td>
        <span class="status-badge ${getStatusClass(shipment.status)}">
          ${formatStatus(shipment.status)}
        </span>
      </td>
      <td>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${calculateProgress(shipment)}%"></div>
          </div>
          <span class="progress-text">${calculateProgress(shipment)}%</span>
        </div>
      </td>
      <td>
        <span class="eta-time">${formatETA(shipment.estimatedDelivery)}</span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-icon btn-track" onclick="trackShipment('${shipment._id || shipment.id}')" title="Track">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </button>
          <button class="btn-icon" onclick="viewShipmentDetails('${shipment._id || shipment.id}')" title="Details">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  // Animate progress bars
  setTimeout(updateShipmentProgress, 100);
}

/**
 * Create New Shipment
 */
async function createShipment(shipmentData) {
  try {
    const response = await apiRequest(API_ENDPOINTS.createShipment, {
      method: 'POST',
      body: JSON.stringify(shipmentData)
    });
    
    if (response.success) {
      showSuccessNotification('Shipment created successfully!');
      // Refresh dashboard
      await loadActiveShipments();
      await loadDashboardStats();
      return response.data;
    }
  } catch (error) {
    console.error('Failed to create shipment:', error);
    throw error;
  }
}

/**
 * Update Shipment
 */
async function updateShipmentStatus(shipmentId, updates) {
  try {
    const endpoint = API_ENDPOINTS.updateShipment.replace(':id', shipmentId);
    const response = await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    
    if (response.success) {
      showSuccessNotification('Shipment updated successfully!');
      return response.data;
    }
  } catch (error) {
    console.error('Failed to update shipment:', error);
    throw error;
  }
}

/**
 * Track Shipment
 */
async function trackShipment(shipmentId) {
  try {
    const endpoint = API_ENDPOINTS.getShipmentById.replace(':id', shipmentId);
    const response = await apiRequest(endpoint);
    
    if (response.success && response.data) {
      showTrackingModal(response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Failed to track shipment:', error);
    showErrorNotification('Unable to load tracking information');
  }
}

// ===================================
// Carrier API Functions
// ===================================

/**
 * Load Carriers
 */
async function loadCarriers(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await apiRequest(`${API_ENDPOINTS.getCarriers}?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to load carriers:', error);
  }
}

/**
 * Search Carriers by Service Type
 */
async function searchCarriers(serviceType, route) {
  try {
    const response = await apiRequest(API_ENDPOINTS.searchCarriers, {
      method: 'POST',
      body: JSON.stringify({ serviceType, route })
    });
    
    if (response.success && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to search carriers:', error);
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Get Status Class
 */
function getStatusClass(status) {
  const classes = {
    'in_transit': 'status-in-transit',
    'pending_pickup': 'status-pending',
    'delivered': 'status-delivered',
    'delayed': 'status-delayed',
    'cancelled': 'status-cancelled'
  };
  return classes[status] || 'status-pending';
}

/**
 * Format Status
 */
function formatStatus(status) {
  const labels = {
    'in_transit': 'In Transit',
    'pending_pickup': 'Pending Pickup',
    'delivered': 'Delivered',
    'delayed': 'Delayed',
    'cancelled': 'Cancelled'
  };
  return labels[status] || status;
}

/**
 * Calculate Progress
 */
function calculateProgress(shipment) {
  if (shipment.status === 'delivered') return 100;
  if (shipment.status === 'pending_pickup') return 10;
  
  // Calculate based on events
  if (shipment.events && shipment.events.length > 0) {
    const totalSteps = 5; // Typical shipment steps
    const completedSteps = shipment.events.length;
    return Math.min((completedSteps / totalSteps) * 100, 95);
  }
  
  return 50; // Default
}

/**
 * Format ETA
 */
function formatETA(dateString) {
  if (!dateString) return 'TBD';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date - now;
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return `${diffHours}h`;
  } else {
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d`;
  }
}

/**
 * Format Time Ago
 */
function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Show Success Notification
 */
function showSuccessNotification(message) {
  showNotification(message, 'success');
}

/**
 * Show Error Notification
 */
function showErrorNotification(message) {
  showNotification(message, 'error');
}

/**
 * Show Notification
 */
function showNotification(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  
  const icon = type === 'success' 
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  
  toast.innerHTML = `${icon}<span>${message}</span>`;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===================================
// Mock Data Fallback
// ===================================

/**
 * Load Mock Dashboard Stats (Fallback)
 */
function loadMockDashboardStats() {
  console.log('Using mock data - API unavailable');
  
  updateStatCard('active-shipments', 248);
  updateStatCard('ontime-delivery', 98.4, '%');
  updateStatCard('monthly-cost', 42800, '$', 'K');
  updateStatCard('pending-deliveries', 142);
}

/**
 * Load Mock Shipments (Fallback)
 */
function loadMockShipments() {
  console.log('Using mock shipment data - API unavailable');
  // Keep existing mock data in the HTML
}

// ===================================
// Initialize on Page Load
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('TMS API Integration initialized');
  
  // Load dashboard data
  await loadDashboardStats();
  await loadActiveShipments();
  
  // Set up auto-refresh every 30 seconds
  setInterval(async () => {
    await loadDashboardStats();
    await loadActiveShipments();
  }, 30000);
});

// ===================================
// Export Functions for Global Use
// ===================================

window.tmsAPI = {
  loadDashboardStats,
  loadActiveShipments,
  createShipment,
  updateShipmentStatus,
  trackShipment,
  loadCarriers,
  searchCarriers
};
