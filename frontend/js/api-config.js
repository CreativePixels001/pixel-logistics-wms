/**
 * API Configuration
 * Centralized API endpoints and utilities for frontend-backend communication
 */

// API Base URL - Change this based on environment
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  API_VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};

// Get full API URL
function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}${endpoint}`;
}

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Set auth token
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

// Remove auth token
function removeAuthToken() {
  localStorage.removeItem('authToken');
}

// API Request Helper with error handling
async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Merge options
  const config = {
    ...options,
    headers,
    timeout: API_CONFIG.TIMEOUT
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    // Handle HTTP errors
    if (!response.ok) {
      // If unauthorized, clear token and redirect to login
      if (response.status === 401) {
        removeAuthToken();
        localStorage.removeItem('currentUser');
        if (!window.location.pathname.includes('login.html')) {
          window.location.href = 'login.html';
        }
        throw new Error(data.error?.message || 'Authentication failed');
      }
      
      throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Network error handling
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
}

// API Endpoints
const API = {
  // ============ Authentication APIs ============
  AUTH: {
    login: (credentials) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    
    register: (userData) => apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    
    getMe: () => apiRequest('/auth/me', {
      method: 'GET'
    }),
    
    refreshToken: (refreshToken) => apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    }),
    
    changePassword: (passwords) => apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords)
    })
  },
  
  // ============ Inventory APIs ============
  INVENTORY: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/inventory${queryString ? '?' + queryString : ''}`, {
        method: 'GET'
      });
    },
    
    getStats: () => apiRequest('/inventory/stats', {
      method: 'GET'
    }),
    
    getById: (id) => apiRequest(`/inventory/${id}`, {
      method: 'GET'
    }),
    
    create: (inventoryData) => apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(inventoryData)
    }),
    
    update: (id, inventoryData) => apiRequest(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inventoryData)
    }),
    
    delete: (id) => apiRequest(`/inventory/${id}`, {
      method: 'DELETE'
    }),
    
    getLowStock: () => apiRequest('/inventory/reports/low-stock', {
      method: 'GET'
    }),
    
    getExpired: () => apiRequest('/inventory/reports/expired', {
      method: 'GET'
    })
  },
  
  // ============ Orders APIs (Placeholder - to be implemented) ============
  ORDERS: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/orders${queryString ? '?' + queryString : ''}`, {
        method: 'GET'
      });
    },
    
    getById: (id) => apiRequest(`/orders/${id}`, {
      method: 'GET'
    }),
    
    create: (orderData) => apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),
    
    update: (id, orderData) => apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData)
    }),
    
    delete: (id) => apiRequest(`/orders/${id}`, {
      method: 'DELETE'
    })
  },
  
  // ============ TMS APIs ============
  TMS: {
    SHIPMENTS: {
      getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/tms/shipments${queryString ? '?' + queryString : ''}`, {
          method: 'GET'
        });
      },
      
      getById: (id) => apiRequest(`/tms/shipments/${id}`, {
        method: 'GET'
      }),
      
      create: (shipmentData) => apiRequest('/tms/shipments', {
        method: 'POST',
        body: JSON.stringify(shipmentData)
      }),
      
      update: (id, shipmentData) => apiRequest(`/tms/shipments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(shipmentData)
      }),
      
      updateStatus: (id, status) => apiRequest(`/tms/shipments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
    },
    
    CARRIERS: {
      getAll: () => apiRequest('/tms/carriers', {
        method: 'GET'
      }),
      
      getById: (id) => apiRequest(`/tms/carriers/${id}`, {
        method: 'GET'
      })
    },
    
    DASHBOARD: {
      getStats: () => apiRequest('/tms/dashboard/stats', {
        method: 'GET'
      })
    },
    
    TRACKING: {
      getByNumber: (trackingNumber) => apiRequest(`/tms/tracking/${trackingNumber}`, {
        method: 'GET'
      }),
      
      addUpdate: (trackingNumber, update) => apiRequest(`/tms/tracking/${trackingNumber}/updates`, {
        method: 'POST',
        body: JSON.stringify(update)
      })
    }
  },
  
  // ============ Integration APIs (WMS-TMS Bridge) ============
  INTEGRATION: {
    createShipment: (orderData) => apiRequest('/integration/create-shipment', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),
    
    getShipmentStatus: (wmsOrderId) => apiRequest(`/integration/shipment-status/${wmsOrderId}`, {
      method: 'GET'
    }),
    
    updateWMSStatus: (statusData) => apiRequest('/integration/update-wms', {
      method: 'POST',
      body: JSON.stringify(statusData)
    }),
    
    getDashboard: () => apiRequest('/integration/dashboard', {
      method: 'GET'
    }),
    
    bulkCreateShipments: (orders) => apiRequest('/integration/bulk-create-shipments', {
      method: 'POST',
      body: JSON.stringify({ orders })
    })
  }
};

// Mock mode flag (for demo without backend)
let USE_MOCK_DATA = false;

// Check if backend is available
async function checkBackendAvailability() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      USE_MOCK_DATA = false;
      console.log('✅ Backend is available');
      return true;
    }
  } catch (error) {
    console.warn('⚠️ Backend not available, using mock data mode');
    USE_MOCK_DATA = true;
    return false;
  }
}

// Initialize - check backend on load
checkBackendAvailability();

// Export for use in other scripts
window.API = API;
window.API_CONFIG = API_CONFIG;
window.getApiUrl = getApiUrl;
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;
window.removeAuthToken = removeAuthToken;
window.apiRequest = apiRequest;
window.checkBackendAvailability = checkBackendAvailability;
