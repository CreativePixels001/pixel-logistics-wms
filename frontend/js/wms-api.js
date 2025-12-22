/**
 * WMS API Integration Layer
 * Connects frontend to the complete WMS backend (110 endpoints)
 * Backend URL: http://localhost:5001/api/v1/wms
 */

// API Configuration
const WMS_API_CONFIG = {
    BASE_URL: 'http://localhost:5001/api/v1/wms',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// API Endpoints Mapping (All 10 Modules - 110 Endpoints)
const WMS_ENDPOINTS = {
    // Products Module (15 endpoints)
    PRODUCTS: {
        LIST: '/products',
        CREATE: '/products',
        GET: (id) => `/products/${id}`,
        UPDATE: (id) => `/products/${id}`,
        DELETE: (id) => `/products/${id}`,
        BY_SKU: (sku) => `/products/sku/${sku}`,
        BY_BARCODE: (barcode) => `/products/barcode/${barcode}`,
        SEARCH: '/products/search',
        LOW_STOCK: '/products/low-stock',
        CATEGORIES: '/products/categories',
        BULK_UPDATE: '/products/bulk-update',
        EXPORT: '/products/export',
        IMPORT: '/products/import',
        METRICS: '/products/metrics',
        VALIDATE_SKU: '/products/validate-sku'
    },
    
    // Inventory Module (20 endpoints)
    INVENTORY: {
        LIST: '/inventory',
        CREATE: '/inventory',
        GET: (id) => `/inventory/${id}`,
        UPDATE: (id) => `/inventory/${id}`,
        DELETE: (id) => `/inventory/${id}`,
        BY_PRODUCT: (productId) => `/inventory/product/${productId}`,
        BY_LOCATION: (locationId) => `/inventory/location/${locationId}`,
        ADJUST: '/inventory/adjust',
        TRANSFER: '/inventory/transfer',
        ALLOCATE: '/inventory/allocate',
        DEALLOCATE: '/inventory/deallocate',
        RESERVE: '/inventory/reserve',
        RELEASE: '/inventory/release',
        MOVEMENTS: '/inventory/movements',
        STOCK_LEVELS: '/inventory/stock-levels',
        LOW_STOCK: '/inventory/low-stock',
        EXPIRING: '/inventory/expiring',
        VALUATION: '/inventory/valuation',
        METRICS: '/inventory/metrics',
        CYCLE_COUNT: '/inventory/cycle-count'
    },
    
    // Purchase Orders Module (10 endpoints)
    PURCHASE_ORDERS: {
        LIST: '/purchase-orders',
        CREATE: '/purchase-orders',
        GET: (id) => `/purchase-orders/${id}`,
        UPDATE: (id) => `/purchase-orders/${id}`,
        DELETE: (id) => `/purchase-orders/${id}`,
        CONFIRM: (id) => `/purchase-orders/${id}/confirm`,
        RECEIVE: (id) => `/purchase-orders/${id}/receive`,
        CANCEL: (id) => `/purchase-orders/${id}/cancel`,
        BY_SUPPLIER: (supplierId) => `/purchase-orders/supplier/${supplierId}`,
        METRICS: '/purchase-orders/metrics'
    },
    
    // Sales Orders Module (15 endpoints)
    SALES_ORDERS: {
        LIST: '/sales-orders',
        CREATE: '/sales-orders',
        GET: (id) => `/sales-orders/${id}`,
        UPDATE: (id) => `/sales-orders/${id}`,
        DELETE: (id) => `/sales-orders/${id}`,
        CONFIRM: (id) => `/sales-orders/${id}/confirm`,
        ALLOCATE: (id) => `/sales-orders/${id}/allocate`,
        PICK: (id) => `/sales-orders/${id}/pick`,
        PACK: (id) => `/sales-orders/${id}/pack`,
        SHIP: (id) => `/sales-orders/${id}/ship`,
        CANCEL: (id) => `/sales-orders/${id}/cancel`,
        BY_CUSTOMER: (customerId) => `/sales-orders/customer/${customerId}`,
        PENDING: '/sales-orders/pending',
        READY_TO_SHIP: '/sales-orders/ready-to-ship',
        METRICS: '/sales-orders/metrics'
    },
    
    // Receiving Module (8 endpoints)
    RECEIVING: {
        LIST: '/receiving',
        CREATE: '/receiving',
        GET: (id) => `/receiving/${id}`,
        UPDATE: (id) => `/receiving/${id}`,
        ACCEPT: (id) => `/receiving/${id}/accept`,
        REJECT: (id) => `/receiving/${id}/reject`,
        COMPLETE: (id) => `/receiving/${id}/complete`,
        METRICS: '/receiving/metrics'
    },
    
    // Shipping Module (10 endpoints)
    SHIPPING: {
        LIST: '/shipping',
        CREATE: '/shipping',
        GET: (id) => `/shipping/${id}`,
        UPDATE: (id) => `/shipping/${id}`,
        DISPATCH: (id) => `/shipping/${id}/dispatch`,
        DELIVER: (id) => `/shipping/${id}/deliver`,
        CANCEL: (id) => `/shipping/${id}/cancel`,
        POD: (id) => `/shipping/${id}/pod`,
        TRACK: (id) => `/shipping/${id}/track`,
        METRICS: '/shipping/metrics'
    },
    
    // Warehouse Module (10 endpoints)
    WAREHOUSE: {
        LIST: '/warehouse',
        CREATE: '/warehouse',
        GET: (id) => `/warehouse/${id}`,
        UPDATE: (id) => `/warehouse/${id}`,
        DELETE: (id) => `/warehouse/${id}`,
        LOCATIONS: (id) => `/warehouse/${id}/locations`,
        CAPACITY: (id) => `/warehouse/${id}/capacity`,
        UTILIZATION: (id) => `/warehouse/${id}/utilization`,
        ZONES: (id) => `/warehouse/${id}/zones`,
        METRICS: '/warehouse/metrics'
    },
    
    // Picking Module (10 endpoints)
    PICKING: {
        LIST: '/picking',
        CREATE: '/picking',
        GET: (id) => `/picking/${id}`,
        UPDATE: (id) => `/picking/${id}`,
        ASSIGN: (id) => `/picking/${id}/assign`,
        START: (id) => `/picking/${id}/start`,
        PICK: (id) => `/picking/${id}/pick`,
        COMPLETE: (id) => `/picking/${id}/complete`,
        BY_ORDER: (orderId) => `/picking/order/${orderId}`,
        METRICS: '/picking/metrics'
    },
    
    // Packing Module (10 endpoints) ⭐ NEW
    PACKING: {
        LIST: '/packing',
        CREATE: '/packing',
        GET: (id) => `/packing/${id}`,
        UPDATE: (id) => `/packing/${id}`,
        ASSIGN: (id) => `/packing/${id}/assign`,
        START: (id) => `/packing/${id}/start`,
        PACK: (id) => `/packing/${id}/pack`,
        COMPLETE: (id) => `/packing/${id}/complete`,
        BY_ORDER: (orderId) => `/packing/order/${orderId}`,
        METRICS: '/packing/metrics'
    },
    
    // Put-away Module (5 endpoints) ⭐ NEW
    PUTAWAY: {
        LIST: '/putaway',
        CREATE: '/putaway',
        GET: (id) => `/putaway/${id}`,
        UPDATE: (id) => `/putaway/${id}`,
        COMPLETE: (id) => `/putaway/${id}/complete`,
        METRICS: '/putaway/metrics'
    }
};

// API Class for making requests
class WmsApi {
    constructor() {
        this.baseURL = WMS_API_CONFIG.BASE_URL;
        this.timeout = WMS_API_CONFIG.TIMEOUT;
    }
    
    /**
     * Generic request method with error handling and retry logic
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        // Add body if provided
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }
        
        let lastError;
        for (let attempt = 0; attempt < WMS_API_CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                lastError = error;
                
                // Don't retry on client errors (4xx)
                if (error.message && error.message.includes('HTTP 4')) {
                    throw error;
                }
                
                // Wait before retry
                if (attempt < WMS_API_CONFIG.RETRY_ATTEMPTS - 1) {
                    await new Promise(resolve => 
                        setTimeout(resolve, WMS_API_CONFIG.RETRY_DELAY * (attempt + 1))
                    );
                }
            }
        }
        
        throw lastError || new Error('Request failed after retries');
    }
    
    // Convenience methods
    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }
    
    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }
    
    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }
    
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Create global API instance
const wmsApi = new WmsApi();

// High-level API methods for each module
const WMS = {
    // ===== PRODUCTS =====
    products: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.PRODUCTS.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.PRODUCTS.GET(id)),
        getBySku: (sku) => wmsApi.get(WMS_ENDPOINTS.PRODUCTS.BY_SKU(sku)),
        getByBarcode: (barcode) => wmsApi.get(WMS_ENDPOINTS.PRODUCTS.BY_BARCODE(barcode)),
        search: (query) => wmsApi.get(WMS_ENDPOINTS.PRODUCTS.SEARCH, { q: query }),
        getLowStock: () => wmsApi.get(WMS_ENDPOINTS.PRODUCTS.LOW_STOCK),
        create: (data) => wmsApi.post(WMS_ENDPOINTS.PRODUCTS.CREATE, data),
        update: (id, data) => wmsApi.put(WMS_ENDPOINTS.PRODUCTS.UPDATE(id), data),
        delete: (id) => wmsApi.delete(WMS_ENDPOINTS.PRODUCTS.DELETE(id)),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.PRODUCTS.METRICS)
    },
    
    // ===== INVENTORY =====
    inventory: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.INVENTORY.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.INVENTORY.GET(id)),
        getByProduct: (productId) => wmsApi.get(WMS_ENDPOINTS.INVENTORY.BY_PRODUCT(productId)),
        getByLocation: (locationId) => wmsApi.get(WMS_ENDPOINTS.INVENTORY.BY_LOCATION(locationId)),
        getStockLevels: () => wmsApi.get(WMS_ENDPOINTS.INVENTORY.STOCK_LEVELS),
        getLowStock: () => wmsApi.get(WMS_ENDPOINTS.INVENTORY.LOW_STOCK),
        getExpiring: (days = 30) => wmsApi.get(WMS_ENDPOINTS.INVENTORY.EXPIRING, { days }),
        adjust: (data) => wmsApi.post(WMS_ENDPOINTS.INVENTORY.ADJUST, data),
        transfer: (data) => wmsApi.post(WMS_ENDPOINTS.INVENTORY.TRANSFER, data),
        allocate: (data) => wmsApi.post(WMS_ENDPOINTS.INVENTORY.ALLOCATE, data),
        getMovements: (params = {}) => wmsApi.get(WMS_ENDPOINTS.INVENTORY.MOVEMENTS, params),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.INVENTORY.METRICS)
    },
    
    // ===== PURCHASE ORDERS =====
    purchaseOrders: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.PURCHASE_ORDERS.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.PURCHASE_ORDERS.GET(id)),
        getBySupplier: (supplierId) => wmsApi.get(WMS_ENDPOINTS.PURCHASE_ORDERS.BY_SUPPLIER(supplierId)),
        create: (data) => wmsApi.post(WMS_ENDPOINTS.PURCHASE_ORDERS.CREATE, data),
        update: (id, data) => wmsApi.put(WMS_ENDPOINTS.PURCHASE_ORDERS.UPDATE(id), data),
        confirm: (id) => wmsApi.put(WMS_ENDPOINTS.PURCHASE_ORDERS.CONFIRM(id), {}),
        receive: (id, data) => wmsApi.put(WMS_ENDPOINTS.PURCHASE_ORDERS.RECEIVE(id), data),
        cancel: (id, reason) => wmsApi.put(WMS_ENDPOINTS.PURCHASE_ORDERS.CANCEL(id), { reason }),
        delete: (id) => wmsApi.delete(WMS_ENDPOINTS.PURCHASE_ORDERS.DELETE(id)),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.PURCHASE_ORDERS.METRICS)
    },
    
    // ===== SALES ORDERS =====
    salesOrders: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.SALES_ORDERS.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.SALES_ORDERS.GET(id)),
        getByCustomer: (customerId) => wmsApi.get(WMS_ENDPOINTS.SALES_ORDERS.BY_CUSTOMER(customerId)),
        getPending: () => wmsApi.get(WMS_ENDPOINTS.SALES_ORDERS.PENDING),
        getReadyToShip: () => wmsApi.get(WMS_ENDPOINTS.SALES_ORDERS.READY_TO_SHIP),
        create: (data) => wmsApi.post(WMS_ENDPOINTS.SALES_ORDERS.CREATE, data),
        update: (id, data) => wmsApi.put(WMS_ENDPOINTS.SALES_ORDERS.UPDATE(id), data),
        confirm: (id) => wmsApi.put(WMS_ENDPOINTS.SALES_ORDERS.CONFIRM(id), {}),
        allocate: (id) => wmsApi.put(WMS_ENDPOINTS.SALES_ORDERS.ALLOCATE(id), {}),
        cancel: (id, reason) => wmsApi.put(WMS_ENDPOINTS.SALES_ORDERS.CANCEL(id), { reason }),
        delete: (id) => wmsApi.delete(WMS_ENDPOINTS.SALES_ORDERS.DELETE(id)),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.SALES_ORDERS.METRICS)
    },
    
    // ===== RECEIVING =====
    receiving: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.RECEIVING.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.RECEIVING.GET(id)),
        create: (data) => wmsApi.post(WMS_ENDPOINTS.RECEIVING.CREATE, data),
        update: (id, data) => wmsApi.put(WMS_ENDPOINTS.RECEIVING.UPDATE(id), data),
        accept: (id, items) => wmsApi.put(WMS_ENDPOINTS.RECEIVING.ACCEPT(id), { items }),
        reject: (id, items, reason) => wmsApi.put(WMS_ENDPOINTS.RECEIVING.REJECT(id), { items, reason }),
        complete: (id) => wmsApi.put(WMS_ENDPOINTS.RECEIVING.COMPLETE(id), {}),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.RECEIVING.METRICS)
    },
    
    // ===== SHIPPING =====
    shipping: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.SHIPPING.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.SHIPPING.GET(id)),
        track: (id) => wmsApi.get(WMS_ENDPOINTS.SHIPPING.TRACK(id)),
        create: (data) => wmsApi.post(WMS_ENDPOINTS.SHIPPING.CREATE, data),
        update: (id, data) => wmsApi.put(WMS_ENDPOINTS.SHIPPING.UPDATE(id), data),
        dispatch: (id, data) => wmsApi.put(WMS_ENDPOINTS.SHIPPING.DISPATCH(id), data),
        deliver: (id, data) => wmsApi.put(WMS_ENDPOINTS.SHIPPING.DELIVER(id), data),
        uploadPOD: (id, data) => wmsApi.put(WMS_ENDPOINTS.SHIPPING.POD(id), data),
        cancel: (id, reason) => wmsApi.put(WMS_ENDPOINTS.SHIPPING.CANCEL(id), { reason }),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.SHIPPING.METRICS)
    },
    
    // ===== WAREHOUSE =====
    warehouse: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.WAREHOUSE.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.WAREHOUSE.GET(id)),
        getLocations: (id) => wmsApi.get(WMS_ENDPOINTS.WAREHOUSE.LOCATIONS(id)),
        getCapacity: (id) => wmsApi.get(WMS_ENDPOINTS.WAREHOUSE.CAPACITY(id)),
        getUtilization: (id) => wmsApi.get(WMS_ENDPOINTS.WAREHOUSE.UTILIZATION(id)),
        getZones: (id) => wmsApi.get(WMS_ENDPOINTS.WAREHOUSE.ZONES(id)),
        create: (data) => wmsApi.post(WMS_ENDPOINTS.WAREHOUSE.CREATE, data),
        update: (id, data) => wmsApi.put(WMS_ENDPOINTS.WAREHOUSE.UPDATE(id), data),
        delete: (id) => wmsApi.delete(WMS_ENDPOINTS.WAREHOUSE.DELETE(id)),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.WAREHOUSE.METRICS)
    },
    
    // ===== PICKING =====
    picking: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.PICKING.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.PICKING.GET(id)),
        getByOrder: (orderId) => wmsApi.get(WMS_ENDPOINTS.PICKING.BY_ORDER(orderId)),
        create: (data) => wmsApi.post(WMS_ENDPOINTS.PICKING.CREATE, data),
        update: (id, data) => wmsApi.put(WMS_ENDPOINTS.PICKING.UPDATE(id), data),
        assign: (id, userId) => wmsApi.put(WMS_ENDPOINTS.PICKING.ASSIGN(id), { assignedTo: userId }),
        start: (id) => wmsApi.put(WMS_ENDPOINTS.PICKING.START(id), {}),
        pick: (id, items) => wmsApi.put(WMS_ENDPOINTS.PICKING.PICK(id), { items }),
        complete: (id) => wmsApi.put(WMS_ENDPOINTS.PICKING.COMPLETE(id), {}),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.PICKING.METRICS)
    },
    
    // ===== PACKING ===== ⭐ NEW MODULE
    packing: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.PACKING.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.PACKING.GET(id)),
        getByOrder: (orderId) => wmsApi.get(WMS_ENDPOINTS.PACKING.BY_ORDER(orderId)),
        create: (data) => wmsApi.post(WMS_ENDPOINTS.PACKING.CREATE, data),
        update: (id, data) => wmsApi.put(WMS_ENDPOINTS.PACKING.UPDATE(id), data),
        assign: (id, userId) => wmsApi.put(WMS_ENDPOINTS.PACKING.ASSIGN(id), { assignedTo: userId }),
        start: (id) => wmsApi.put(WMS_ENDPOINTS.PACKING.START(id), {}),
        pack: (id, items, packages) => wmsApi.put(WMS_ENDPOINTS.PACKING.PACK(id), { items, packages }),
        complete: (id) => wmsApi.put(WMS_ENDPOINTS.PACKING.COMPLETE(id), {}),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.PACKING.METRICS)
    },
    
    // ===== PUT-AWAY ===== ⭐ NEW MODULE
    putaway: {
        getAll: (params = {}) => wmsApi.get(WMS_ENDPOINTS.PUTAWAY.LIST, params),
        getById: (id) => wmsApi.get(WMS_ENDPOINTS.PUTAWAY.GET(id)),
        create: (data) => wmsApi.post(WMS_ENDPOINTS.PUTAWAY.CREATE, data),
        update: (id, data) => wmsApi.put(WMS_ENDPOINTS.PUTAWAY.UPDATE(id), data),
        complete: (id, items) => wmsApi.put(WMS_ENDPOINTS.PUTAWAY.COMPLETE(id), { items }),
        getMetrics: () => wmsApi.get(WMS_ENDPOINTS.PUTAWAY.METRICS)
    }
};

// Utility functions for common operations
const WMS_UTILS = {
    // Format currency
    formatCurrency: (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    },
    
    // Format date
    formatDate: (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    // Format datetime
    formatDateTime: (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Get status badge class
    getStatusClass: (status) => {
        const statusMap = {
            'pending': 'status-warning',
            'confirmed': 'status-success',
            'in-progress': 'status-info',
            'completed': 'status-success',
            'delivered': 'status-success',
            'cancelled': 'status-danger',
            'on-hold': 'status-warning',
            'rejected': 'status-danger'
        };
        return statusMap[status?.toLowerCase()] || 'status-secondary';
    },
    
    // Show toast notification
    showToast: (message, type = 'info', duration = 3000) => {
        // Check if notifications utility exists
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }
        
        // Fallback simple toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    // Show loading indicator
    showLoading: (message = 'Loading...') => {
        const loader = document.createElement('div');
        loader.id = 'wms-loader';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <div style="
                        border: 4px solid #f3f4f6;
                        border-top-color: #4F46E5;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    },
    
    // Hide loading indicator
    hideLoading: () => {
        const loader = document.getElementById('wms-loader');
        if (loader) loader.remove();
    },
    
    // Handle API errors
    handleError: (error, context = 'Operation') => {
        console.error(`${context} failed:`, error);
        WMS_UTILS.showToast(
            error.message || `${context} failed. Please try again.`,
            'error'
        );
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WMS, WMS_ENDPOINTS, WMS_UTILS, wmsApi };
}

console.log('✅ WMS API Integration loaded - 110 endpoints ready');
console.log('📦 Available modules:', Object.keys(WMS));
