/**
 * API Configuration
 * Store all API keys and endpoints here
 * 
 * IMPORTANT: In production, use environment variables and keep this file secure
 */

const API_CONFIG = {
    
    // Data.gov.in Open Data Portal
    dataGovIn: {
        baseUrl: 'https://api.data.gov.in/resource',
        apiKey: '', // Get from: https://data.gov.in/
        datasets: {
            tourism: '9ef84268-d588-465a-a308-a864a43d0070', // Tourism dataset ID
            monuments: 'e93a7c1b-1f7b-4e2e-8e3f-3d5b6c7d8e9f', // ASI monuments
            destinations: 'f1a2b3c4-5d6e-7f8g-9h0i-1j2k3l4m5n6o' // Tourist destinations
        }
    },
    
    // Ministry of Tourism APIs
    tourism: {
        incredibleIndia: 'https://www.india.gov.in/api/tourism',
        ministryOfTourism: 'https://tourism.gov.in/api',
        apiKey: '' // If required
    },
    
    // Archaeological Survey of India
    asi: {
        baseUrl: 'https://asi.nic.in/api',
        monuments: '/monuments',
        worldHeritage: '/unesco-sites'
    },
    
    // State Tourism Boards
    stateTourism: {
        himachal: 'https://himachaltourism.gov.in/api',
        goa: 'https://goatourism.gov.in/api',
        kerala: 'https://keralatourism.org/api',
        rajasthan: 'https://tourism.rajasthan.gov.in/api',
        uttarakhand: 'https://uttarakhandtourism.gov.in/api',
        tamilnadu: 'https://tamilnadutourism.tn.gov.in/api',
        karnataka: 'https://karnatakatourism.org/api',
        maharashtra: 'https://maharashtratourism.gov.in/api',
        westBengal: 'https://wbtourism.gov.in/api',
        ladakh: 'https://ladakh.nic.in/tourism/api'
    },
    
    // Unsplash (for images)
    unsplash: {
        accessKey: '', // Get from: https://unsplash.com/developers
        baseUrl: 'https://api.unsplash.com',
        searchEndpoint: '/search/photos'
    },
    
    // Weather API (India Meteorological Department)
    weather: {
        imd: 'https://mausam.imd.gov.in/api',
        apiKey: ''
    },
    
    // Transport APIs
    transport: {
        irctc: 'https://www.irctc.co.in/api', // Indian Railways
        redBus: 'https://api.redbus.in', // Bus bookings
        nhai: 'https://nhai.gov.in/api' // Highway info
    },
    
    // Cache settings
    cache: {
        enabled: true,
        expiryHours: 24,
        prefix: 'pitrip_'
    },
    
    // Feature flags
    features: {
        useGovernmentAPI: false, // Enable after adding API keys
        useFallbackData: true, // Use fallback templates if API fails
        useUnsplash: false, // Enable after adding Unsplash key
        cacheResponses: true, // Cache API responses
        showAPISource: true // Show data source badge on UI
    },
    
    // API Rate Limits
    rateLimits: {
        dataGovIn: 100, // requests per hour
        unsplash: 50, // requests per hour
        default: 60
    }
};

/**
 * Get API endpoint with parameters
 */
function getAPIEndpoint(service, endpoint, params = {}) {
    let url = '';
    
    switch(service) {
        case 'dataGovIn':
            url = `${API_CONFIG.dataGovIn.baseUrl}/${params.dataset || API_CONFIG.dataGovIn.datasets.tourism}`;
            if (API_CONFIG.dataGovIn.apiKey) {
                url += `?api-key=${API_CONFIG.dataGovIn.apiKey}`;
            }
            break;
            
        case 'tourism':
            url = `${API_CONFIG.tourism.incredibleIndia}${endpoint}`;
            break;
            
        case 'asi':
            url = `${API_CONFIG.asi.baseUrl}${endpoint}`;
            break;
            
        case 'stateTourism':
            const state = params.state;
            if (API_CONFIG.stateTourism[state]) {
                url = `${API_CONFIG.stateTourism[state]}${endpoint}`;
            }
            break;
            
        case 'unsplash':
            url = `${API_CONFIG.unsplash.baseUrl}${endpoint}`;
            if (API_CONFIG.unsplash.accessKey) {
                url += `?client_id=${API_CONFIG.unsplash.accessKey}`;
            }
            break;
    }
    
    // Add query parameters
    if (params.query) {
        const separator = url.includes('?') ? '&' : '?';
        const queryString = Object.keys(params.query)
            .map(key => `${key}=${encodeURIComponent(params.query[key])}`)
            .join('&');
        url += separator + queryString;
    }
    
    return url;
}

/**
 * Check if feature is enabled
 */
function isFeatureEnabled(feature) {
    return API_CONFIG.features[feature] === true;
}

/**
 * Get cache key
 */
function getCacheKey(type, identifier) {
    return `${API_CONFIG.cache.prefix}${type}_${identifier}`;
}
