/**
 * CPX Website Configuration
 * Central configuration for API endpoints and environment settings
 */

const CPX_CONFIG = {
    // API Configuration
    API: {
        BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:5001/api/v1' 
            : 'https://api.creativepixels.in/api/v1',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3
    },

    // Environment
    ENV: {
        isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    },

    // Payment Configuration
    PAYMENT: {
        STRIPE_PUBLIC_KEY: 'pk_test_51QKl0wP0zXXk84rFwJH1V3ylzQwdcLCkQKb3MIZqYqBNI8mxFaWbJWPp1eZqW3JUfZzIWLbBF6ILT0IEtJb0UXmN00c1lPP7x8',
        CURRENCY: 'INR'
    },

    // Features
    FEATURES: {
        enableAnalytics: true,
        enablePayments: true,
        enableNewsletter: true,
        enableChat: true
    },

    // Paths
    PATHS: {
        ecosystem: 'ecosystem.html',
        studio: 'studio.html',
        checkout: 'checkout.html',
        success: 'payment-success.html',
        pixelConnect: 'Low/UX Study /motherboard.html'
    },

    // Social Links
    SOCIAL: {
        linkedin: 'https://www.linkedin.com/company/creativepixels',
        behance: 'https://www.behance.net/creativepixels',
        dribbble: 'https://dribbble.com/creativepixels',
        instagram: 'https://www.instagram.com/creativepixels.in'
    },

    // Contact
    CONTACT: {
        email: 'Connect@creativepixels.in',
        phone: '+91 9004 78 9969',
        whatsapp: 'https://wa.me/message/6HMB3VUWAME7P1'
    }
};

// API Helper Functions
const CPX_API = {
    /**
     * Make API request with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${CPX_CONFIG.API.BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: CPX_CONFIG.API.TIMEOUT
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            
            if (CPX_CONFIG.ENV.isDevelopment) {
                console.warn('Using mock data in development mode');
                return this.getMockData(endpoint);
            }
            
            throw error;
        }
    },

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    /**
     * POST request
     */
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * PUT request
     */
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },

    /**
     * Mock data for development
     */
    getMockData(endpoint) {
        const mockData = {
            '/projects': {
                success: true,
                data: [
                    { id: 1, name: 'Pixel Logistics WMS', category: 'Enterprise Software' },
                    { id: 2, name: 'Pixel TMS', category: 'Transportation' },
                    { id: 3, name: 'Kinetic EV', category: 'Web Design' }
                ]
            },
            '/contact': {
                success: true,
                message: 'Message sent successfully (mock)'
            }
        };

        return mockData[endpoint] || { success: false, error: 'Endpoint not found' };
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CPX_CONFIG, CPX_API };
}

console.log('🎨 CPX Config loaded:', {
    environment: CPX_CONFIG.ENV.isDevelopment ? 'Development' : 'Production',
    apiUrl: CPX_CONFIG.API.BASE_URL
});
