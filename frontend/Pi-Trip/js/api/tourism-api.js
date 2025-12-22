/**
 * Tourism API Integration
 * Fetches destination data from Indian Government APIs
 * Sources: data.gov.in, Ministry of Tourism, Incredible India
 */

class TourismAPI {
    constructor() {
        // Load configuration from config.js
        this.config = API_CONFIG || {};
        
        // Government API endpoints (from config)
        this.endpoints = {
            dataGovIn: this.config.dataGovIn?.baseUrl || 'https://api.data.gov.in/resource',
            incredibleIndia: this.config.tourism?.incredibleIndia || 'https://www.india.gov.in/api/tourism',
            stateTourism: 'https://api.tourism.gov.in/destinations',
            asiMonuments: this.config.asi?.baseUrl || 'https://asi.nic.in/api'
        };
        
        // Feature flags
        this.enabled = this.config.features?.useGovernmentAPI !== false;
        this.useCache = this.config.cache?.enabled !== false;
        this.cacheExpiry = (this.config.cache?.expiryHours || 24) * 60 * 60 * 1000;
        
        console.log('🏛️ Tourism API initialized:', {
            enabled: this.enabled,
            cache: this.useCache,
            endpoints: Object.keys(this.endpoints).length
        });
    }

    /**
     * Fetch destination details from government APIs
     * @param {string} destination - Destination name (e.g., "Manali", "Goa")
     * @returns {Promise<Object>} Destination data
     */
    async getDestinationDetails(destination) {
        try {
            // Check cache first
            const cached = this.getFromCache(destination);
            if (cached) {
                console.log('📦 Loading from cache:', destination);
                return cached;
            }

            console.log('🌐 Fetching from API:', destination);

            // Try multiple sources in parallel
            const results = await Promise.allSettled([
                this.fetchFromDataGovIn(destination),
                this.fetchFromIncredibleIndia(destination),
                this.fetchFromStateTourism(destination)
            ]);

            // Merge data from all sources
            const mergedData = this.mergeDestinationData(results, destination);
            
            // Save to cache
            this.saveToCache(destination, mergedData);
            
            return mergedData;

        } catch (error) {
            console.error('❌ API Error:', error);
            return this.getFallbackData(destination);
        }
    }

    /**
     * Fetch from data.gov.in Open Data Portal
     */
    async fetchFromDataGovIn(destination) {
        // Get API key from config
        const apiKey = this.config.dataGovIn?.apiKey || '';
        
        if (!apiKey) {
            console.warn('⚠️ data.gov.in API key not configured');
            return null;
        }
        
        // Using Open Data Portal - Tourism dataset
        const datasetId = this.config.dataGovIn?.datasets?.tourism || '9ef84268-d588-465a-a308-a864a43d0070';
        
        const url = `${this.endpoints.dataGovIn}/${datasetId}?api-key=${apiKey}&filters[destination]=${encodeURIComponent(destination)}&limit=10`;
        
        console.log('📡 Fetching from data.gov.in:', destination);
        
        const response = await fetch(url);
        if (!response.ok) {
            console.error('❌ data.gov.in API failed:', response.status);
            return null;
        }
        
        const data = await response.json();
        console.log('✅ data.gov.in response:', data);
        return data;
    }

    /**
     * Fetch from Incredible India / Ministry of Tourism
     */
    async fetchFromIncredibleIndia(destination) {
        // Note: This is a placeholder - actual API endpoint needs to be verified
        const url = `${this.endpoints.incredibleIndia}/destinations/${encodeURIComponent(destination)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Incredible India API failed');
        
        return await response.json();
    }

    /**
     * Fetch from State Tourism APIs
     */
    async fetchFromStateTourism(destination) {
        // State-specific tourism boards
        const stateMap = {
            'Manali': 'himachal',
            'Goa': 'goa',
            'Kerala': 'kerala',
            'Rajasthan': 'rajasthan',
            'Ooty': 'tamilnadu'
            // Add more mappings
        };
        
        const state = stateMap[destination];
        if (!state) return null;
        
        const url = `${this.endpoints.stateTourism}/${state}/${encodeURIComponent(destination)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('State Tourism API failed');
        
        return await response.json();
    }

    /**
     * Merge data from multiple sources
     */
    mergeDestinationData(results, destination) {
        const data = {
            name: destination,
            description: '',
            images: [],
            highlights: [],
            attractions: [],
            bestTime: '',
            duration: '',
            difficulty: '',
            activities: [],
            packing: [],
            amenities: [],
            source: 'government'
        };

        // Extract data from successful API calls
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                const apiData = result.value;
                
                // Merge descriptions
                if (apiData.description) {
                    data.description = apiData.description;
                }
                
                // Merge images (prefer government sources)
                if (apiData.images) {
                    data.images.push(...apiData.images);
                }
                
                // Merge highlights
                if (apiData.highlights) {
                    data.highlights.push(...apiData.highlights);
                }
                
                // Merge attractions
                if (apiData.attractions) {
                    data.attractions.push(...apiData.attractions);
                }
            }
        });

        // If no data found, return fallback
        if (!data.description && data.images.length === 0) {
            return this.getFallbackData(destination);
        }

        return data;
    }

    /**
     * Get cached data
     */
    getFromCache(destination) {
        if (!this.useCache) return null;
        
        const cacheKey = `tourism_${destination}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache expired
        if (now - data.timestamp > this.cacheExpiry) {
            localStorage.removeItem(cacheKey);
            return null;
        }
        
        return data.content;
    }

    /**
     * Save to cache
     */
    saveToCache(destination, data) {
        const cacheKey = `tourism_${destination}`;
        const cacheData = {
            timestamp: Date.now(),
            content: data
        };
        
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    /**
     * Fallback data when API fails
     */
    getFallbackData(destination) {
        console.log('📋 Using fallback data for:', destination);
        
        // Return existing trip templates from trip-details.js
        const fallbackTrips = {
            'Manali': this.getManaliTemplate(),
            'Goa': this.getGoaTemplate(),
            'Delhi-Manali': this.getManaliTemplate(),
            'Mumbai-Goa': this.getGoaTemplate()
        };
        
        return fallbackTrips[destination] || this.getDefaultTemplate(destination);
    }

    /**
     * Manali template (existing data)
     */
    getManaliTemplate() {
        return {
            name: 'Delhi to Manali Road Trip',
            duration: '5 Days / 4 Nights',
            distance: '540 km',
            difficulty: 'Moderate',
            bestTime: 'March to June, September to November',
            description: 'Experience the thrill of driving through the majestic Himalayas. This route takes you from the bustling capital to the serene mountain paradise of Manali.',
            source: 'fallback'
        };
    }

    /**
     * Goa template (existing data)
     */
    getGoaTemplate() {
        return {
            name: 'Mumbai to Goa Coastal Drive',
            duration: '4 Days / 3 Nights',
            distance: '480 km',
            difficulty: 'Easy',
            bestTime: 'October to March',
            description: 'Cruise along the stunning Konkan coastline from Mumbai to Goa. Beautiful beaches, lush greenery, and endless sea views await.',
            source: 'fallback'
        };
    }

    /**
     * Default template for unknown destinations
     */
    getDefaultTemplate(destination) {
        return {
            name: `Road Trip to ${destination}`,
            duration: '3-5 Days',
            distance: 'Varies',
            difficulty: 'Moderate',
            bestTime: 'Year Round',
            description: `Explore the beautiful destination of ${destination}. Plan your road trip adventure with our comprehensive guide.`,
            source: 'fallback'
        };
    }

    /**
     * Fetch destination images from Unsplash (as backup)
     */
    async getUnsplashImages(destination, grayscale = true) {
        const accessKey = this.config.unsplash?.accessKey || '';
        
        if (!accessKey || !this.config.features?.useUnsplash) {
            console.warn('⚠️ Unsplash API not configured');
            return [];
        }
        
        const query = `${destination} India tourism`;
        const filter = grayscale ? '&color=black_and_white' : '';
        
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape${filter}&client_id=${accessKey}`;
        
        try {
            console.log('📸 Fetching Unsplash images:', destination);
            const response = await fetch(url);
            const data = await response.json();
            
            return data.results.map(img => ({
                url: img.urls.regular,
                thumb: img.urls.small,
                alt: img.alt_description,
                credit: img.user.name,
                source: 'unsplash'
            }));
        } catch (error) {
            console.error('❌ Unsplash API error:', error);
            return [];
        }
    }

    /**
     * Get ASI Heritage Sites near destination
     */
    async getHeritageSites(destination) {
        // ASI protected monuments database
        try {
            const response = await fetch(`${this.endpoints.asiMonuments}?location=${encodeURIComponent(destination)}`);
            const data = await response.json();
            return data.monuments || [];
        } catch (error) {
            console.error('ASI API error:', error);
            return [];
        }
    }

    /**
     * Get state tourism board data
     */
    async getStateTourismData(state) {
        // State-specific tourism information
        const stateTourismAPIs = {
            'himachal': 'https://himachaltourism.gov.in/api',
            'goa': 'https://goatourism.gov.in/api',
            'kerala': 'https://keralatourism.org/api',
            'rajasthan': 'https://tourism.rajasthan.gov.in/api',
            'tamilnadu': 'https://tamilnadutourism.tn.gov.in/api'
        };
        
        const apiUrl = stateTourismAPIs[state.toLowerCase()];
        if (!apiUrl) return null;
        
        try {
            const response = await fetch(apiUrl);
            return await response.json();
        } catch (error) {
            console.error(`${state} Tourism API error:`, error);
            return null;
        }
    }
}

// Export singleton instance
const tourismAPI = new TourismAPI();
