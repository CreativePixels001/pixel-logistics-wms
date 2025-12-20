/**
 * Pixel Radio - JavaScript
 * Geographic radio station browser with City View (radio.garden inspired)
 */

const Radio = {
    // Grid configuration (for grid view)
    COLS: 14,
    ROWS: 15,
    TOTAL: 14 * 15,
    
    // India zone: center of the grid
    indiaZone: {
        colStart: 3, colEnd: 10,
        rowStart: 2, rowEnd: 11
    },
    
    // State
    cells: [],
    stations: [],
    indiaStations: [],
    current: null,
    currentIndex: -1,
    audio: null,
    saved: [],
    
    // City View State
    currentView: 'city', // 'city' or 'grid'
    cities: [],
    userLocation: null,
    selectedCity: null,
    cityStations: {},
    
    // Radio.garden API for city data
    RADIO_GARDEN_API: 'https://radio.garden/api/ara/content/places',
    
    // Multiple API servers (radio-browser has mirrors)
    API_SERVERS: [
        'https://de1.api.radio-browser.info',
        'https://at1.api.radio-browser.info',
        'https://de2.api.radio-browser.info'
    ],
    
    /**
     * Initialize the radio app
     */
    async init() {
        this.audio = document.getElementById('audio');
        this.saved = JSON.parse(localStorage.getItem('pixelRadioSaved') || '[]');
        
        this.setupEvents();
        
        // Start with city view
        await this.initCityView();
    },
    
    /**
     * Initialize City View (radio.garden style)
     */
    async initCityView() {
        console.log('[Radio] Initializing City View...');
        this.updateLoading('Loading cities...');
        this.showCitySkeletons();
        
        // Get user location (async, doesn't block)
        this.getUserLocation();
        
        // Load Indian cities
        try {
            await this.fetchCities();
            console.log('[Radio] Cities loaded:', this.cities.length);
        } catch(e) {
            console.error('[Radio] fetchCities failed:', e);
            this.cities = this.getFallbackCities();
        }
        
        // Ensure we have cities
        if (!this.cities || this.cities.length === 0) {
            console.log('[Radio] No cities, using fallback');
            this.cities = this.getFallbackCities();
        }
        
        // Render city bubbles
        console.log('[Radio] Rendering', this.cities.length, 'cities');
        this.renderCities();
        
        this.updateLoading(this.cities.length + ' cities found');
        setTimeout(() => {
            document.getElementById('loadingText').style.opacity = '0';
        }, 2000);
    },
    
    /**
     * Fetch cities - use comprehensive fallback list
     */
    async fetchCities() {
        // Use fallback cities (radio.garden blocks CORS proxies)
        console.log('[Radio] Loading Indian cities...');
        this.cities = this.getFallbackCities();
        console.log('[Radio] ✓ Loaded ' + this.cities.length + ' Indian cities');
        this.addStateChips();
    },
    
    /**
     * Get state from city name (for Indian cities)
     */
    getStateFromCity(cityName) {
        const city = cityName.toLowerCase();
        
        // Major cities to state mapping
        const cityStateMap = {
            'mumbai': 'Maharashtra', 'pune': 'Maharashtra', 'nagpur': 'Maharashtra', 'nashik': 'Maharashtra', 'thane': 'Maharashtra',
            'delhi': 'Delhi', 'new delhi': 'Delhi',
            'bangalore': 'Karnataka', 'bengaluru': 'Karnataka', 'mysore': 'Karnataka', 'mysuru': 'Karnataka', 'mangalore': 'Karnataka', 'hubli': 'Karnataka',
            'chennai': 'Tamil Nadu', 'coimbatore': 'Tamil Nadu', 'madurai': 'Tamil Nadu', 'trichy': 'Tamil Nadu', 'salem': 'Tamil Nadu',
            'hyderabad': 'Telangana', 'secunderabad': 'Telangana', 'warangal': 'Telangana',
            'kolkata': 'West Bengal', 'howrah': 'West Bengal', 'durgapur': 'West Bengal', 'siliguri': 'West Bengal',
            'ahmedabad': 'Gujarat', 'surat': 'Gujarat', 'vadodara': 'Gujarat', 'rajkot': 'Gujarat', 'gandhinagar': 'Gujarat',
            'jaipur': 'Rajasthan', 'jodhpur': 'Rajasthan', 'udaipur': 'Rajasthan', 'kota': 'Rajasthan', 'ajmer': 'Rajasthan',
            'lucknow': 'Uttar Pradesh', 'kanpur': 'Uttar Pradesh', 'varanasi': 'Uttar Pradesh', 'agra': 'Uttar Pradesh', 'allahabad': 'Uttar Pradesh', 'noida': 'Uttar Pradesh', 'ghaziabad': 'Uttar Pradesh', 'meerut': 'Uttar Pradesh',
            'patna': 'Bihar', 'gaya': 'Bihar', 'muzaffarpur': 'Bihar',
            'bhopal': 'Madhya Pradesh', 'indore': 'Madhya Pradesh', 'gwalior': 'Madhya Pradesh', 'jabalpur': 'Madhya Pradesh',
            'chandigarh': 'Punjab', 'ludhiana': 'Punjab', 'amritsar': 'Punjab', 'jalandhar': 'Punjab', 'patiala': 'Punjab',
            'gurgaon': 'Haryana', 'gurugram': 'Haryana', 'faridabad': 'Haryana', 'karnal': 'Haryana', 'hisar': 'Haryana',
            'kochi': 'Kerala', 'cochin': 'Kerala', 'thiruvananthapuram': 'Kerala', 'trivandrum': 'Kerala', 'kozhikode': 'Kerala', 'calicut': 'Kerala', 'thrissur': 'Kerala',
            'bhubaneswar': 'Odisha', 'cuttack': 'Odisha', 'rourkela': 'Odisha',
            'ranchi': 'Jharkhand', 'jamshedpur': 'Jharkhand', 'dhanbad': 'Jharkhand',
            'raipur': 'Chhattisgarh', 'bilaspur': 'Chhattisgarh',
            'guwahati': 'Assam', 'dibrugarh': 'Assam', 'silchar': 'Assam',
            'goa': 'Goa', 'panaji': 'Goa', 'margao': 'Goa', 'vasco': 'Goa',
            'dehradun': 'Uttarakhand', 'haridwar': 'Uttarakhand', 'rishikesh': 'Uttarakhand', 'nainital': 'Uttarakhand',
            'shimla': 'Himachal Pradesh', 'dharamshala': 'Himachal Pradesh', 'manali': 'Himachal Pradesh', 'kullu': 'Himachal Pradesh',
            'shillong': 'Meghalaya',
            'imphal': 'Manipur',
            'agartala': 'Tripura',
            'aizawl': 'Mizoram',
            'kohima': 'Nagaland',
            'itanagar': 'Arunachal Pradesh',
            'gangtok': 'Sikkim',
            'srinagar': 'Jammu & Kashmir', 'jammu': 'Jammu & Kashmir',
            'leh': 'Ladakh',
            'pondicherry': 'Puducherry', 'puducherry': 'Puducherry',
            'visakhapatnam': 'Andhra Pradesh', 'vizag': 'Andhra Pradesh', 'vijayawada': 'Andhra Pradesh', 'tirupati': 'Andhra Pradesh', 'guntur': 'Andhra Pradesh', 'amaravati': 'Andhra Pradesh'
        };
        
        for (const [key, state] of Object.entries(cityStateMap)) {
            if (city.includes(key)) return state;
        }
        
        return 'India';
    },
    
    /**
     * Comprehensive Indian cities list
     */
    getFallbackCities() {
        return [
            // Tier 1 - Metro Cities
            { id: 'mumbai', name: 'Mumbai', country: 'India', stations: 35, geo: [72.8777, 19.0760], state: 'Maharashtra' },
            { id: 'delhi', name: 'Delhi', country: 'India', stations: 42, geo: [77.1025, 28.7041], state: 'Delhi' },
            { id: 'bangalore', name: 'Bengaluru', country: 'India', stations: 18, geo: [77.5946, 12.9716], state: 'Karnataka' },
            { id: 'chennai', name: 'Chennai', country: 'India', stations: 17, geo: [80.2707, 13.0827], state: 'Tamil Nadu' },
            { id: 'kolkata', name: 'Kolkata', country: 'India', stations: 15, geo: [88.3639, 22.5726], state: 'West Bengal' },
            { id: 'hyderabad', name: 'Hyderabad', country: 'India', stations: 14, geo: [78.4867, 17.3850], state: 'Telangana' },
            
            // Tier 2 - Major Cities
            { id: 'ahmedabad', name: 'Ahmedabad', country: 'India', stations: 10, geo: [72.5714, 23.0225], state: 'Gujarat' },
            { id: 'pune', name: 'Pune', country: 'India', stations: 9, geo: [73.8567, 18.5204], state: 'Maharashtra' },
            { id: 'jaipur', name: 'Jaipur', country: 'India', stations: 8, geo: [75.7873, 26.9124], state: 'Rajasthan' },
            { id: 'lucknow', name: 'Lucknow', country: 'India', stations: 7, geo: [80.9462, 26.8467], state: 'Uttar Pradesh' },
            { id: 'kochi', name: 'Kochi', country: 'India', stations: 8, geo: [76.2673, 9.9312], state: 'Kerala' },
            { id: 'chandigarh', name: 'Chandigarh', country: 'India', stations: 6, geo: [76.7794, 30.7333], state: 'Punjab' },
            { id: 'indore', name: 'Indore', country: 'India', stations: 6, geo: [75.8577, 22.7196], state: 'Madhya Pradesh' },
            { id: 'bhopal', name: 'Bhopal', country: 'India', stations: 5, geo: [77.4126, 23.2599], state: 'Madhya Pradesh' },
            { id: 'patna', name: 'Patna', country: 'India', stations: 5, geo: [85.1376, 25.5941], state: 'Bihar' },
            { id: 'nagpur', name: 'Nagpur', country: 'India', stations: 5, geo: [79.0882, 21.1458], state: 'Maharashtra' },
            
            // South India
            { id: 'coimbatore', name: 'Coimbatore', country: 'India', stations: 7, geo: [76.9558, 11.0168], state: 'Tamil Nadu' },
            { id: 'madurai', name: 'Madurai', country: 'India', stations: 5, geo: [78.1198, 9.9252], state: 'Tamil Nadu' },
            { id: 'trichy', name: 'Tiruchirappalli', country: 'India', stations: 4, geo: [78.7047, 10.7905], state: 'Tamil Nadu' },
            { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', country: 'India', stations: 6, geo: [76.9366, 8.5241], state: 'Kerala' },
            { id: 'kozhikode', name: 'Kozhikode', country: 'India', stations: 4, geo: [75.7804, 11.2588], state: 'Kerala' },
            { id: 'thrissur', name: 'Thrissur', country: 'India', stations: 3, geo: [76.2144, 10.5276], state: 'Kerala' },
            { id: 'mysore', name: 'Mysuru', country: 'India', stations: 4, geo: [76.6394, 12.2958], state: 'Karnataka' },
            { id: 'mangalore', name: 'Mangaluru', country: 'India', stations: 4, geo: [74.8560, 12.9141], state: 'Karnataka' },
            { id: 'hubli', name: 'Hubli-Dharwad', country: 'India', stations: 3, geo: [75.1240, 15.3647], state: 'Karnataka' },
            { id: 'vizag', name: 'Visakhapatnam', country: 'India', stations: 5, geo: [83.2185, 17.6868], state: 'Andhra Pradesh' },
            { id: 'vijayawada', name: 'Vijayawada', country: 'India', stations: 4, geo: [80.6480, 16.5062], state: 'Andhra Pradesh' },
            { id: 'tirupati', name: 'Tirupati', country: 'India', stations: 3, geo: [79.4192, 13.6288], state: 'Andhra Pradesh' },
            
            // North India
            { id: 'varanasi', name: 'Varanasi', country: 'India', stations: 5, geo: [82.9913, 25.3176], state: 'Uttar Pradesh' },
            { id: 'agra', name: 'Agra', country: 'India', stations: 4, geo: [78.0081, 27.1767], state: 'Uttar Pradesh' },
            { id: 'kanpur', name: 'Kanpur', country: 'India', stations: 4, geo: [80.3319, 26.4499], state: 'Uttar Pradesh' },
            { id: 'noida', name: 'Noida', country: 'India', stations: 6, geo: [77.3910, 28.5355], state: 'Uttar Pradesh' },
            { id: 'gurgaon', name: 'Gurugram', country: 'India', stations: 5, geo: [77.0266, 28.4595], state: 'Haryana' },
            { id: 'faridabad', name: 'Faridabad', country: 'India', stations: 3, geo: [77.3178, 28.4089], state: 'Haryana' },
            { id: 'amritsar', name: 'Amritsar', country: 'India', stations: 5, geo: [74.8723, 31.6340], state: 'Punjab' },
            { id: 'ludhiana', name: 'Ludhiana', country: 'India', stations: 4, geo: [75.8573, 30.9010], state: 'Punjab' },
            { id: 'jalandhar', name: 'Jalandhar', country: 'India', stations: 3, geo: [75.5762, 31.3260], state: 'Punjab' },
            { id: 'dehradun', name: 'Dehradun', country: 'India', stations: 4, geo: [78.0322, 30.3165], state: 'Uttarakhand' },
            { id: 'haridwar', name: 'Haridwar', country: 'India', stations: 2, geo: [78.1642, 29.9457], state: 'Uttarakhand' },
            { id: 'shimla', name: 'Shimla', country: 'India', stations: 2, geo: [77.1734, 31.1048], state: 'Himachal Pradesh' },
            
            // West India
            { id: 'surat', name: 'Surat', country: 'India', stations: 5, geo: [72.8311, 21.1702], state: 'Gujarat' },
            { id: 'vadodara', name: 'Vadodara', country: 'India', stations: 4, geo: [73.1812, 22.3072], state: 'Gujarat' },
            { id: 'rajkot', name: 'Rajkot', country: 'India', stations: 3, geo: [70.8022, 22.3039], state: 'Gujarat' },
            { id: 'udaipur', name: 'Udaipur', country: 'India', stations: 3, geo: [73.7125, 24.5854], state: 'Rajasthan' },
            { id: 'jodhpur', name: 'Jodhpur', country: 'India', stations: 3, geo: [73.0243, 26.2389], state: 'Rajasthan' },
            { id: 'goa', name: 'Panaji (Goa)', country: 'India', stations: 6, geo: [73.8278, 15.4909], state: 'Goa' },
            { id: 'nashik', name: 'Nashik', country: 'India', stations: 3, geo: [73.7898, 19.9975], state: 'Maharashtra' },
            { id: 'aurangabad', name: 'Aurangabad', country: 'India', stations: 3, geo: [75.3433, 19.8762], state: 'Maharashtra' },
            
            // East India
            { id: 'guwahati', name: 'Guwahati', country: 'India', stations: 5, geo: [91.7362, 26.1445], state: 'Assam' },
            { id: 'bhubaneswar', name: 'Bhubaneswar', country: 'India', stations: 4, geo: [85.8245, 20.2961], state: 'Odisha' },
            { id: 'ranchi', name: 'Ranchi', country: 'India', stations: 3, geo: [85.3096, 23.3441], state: 'Jharkhand' },
            { id: 'jamshedpur', name: 'Jamshedpur', country: 'India', stations: 3, geo: [86.1889, 22.8046], state: 'Jharkhand' },
            { id: 'raipur', name: 'Raipur', country: 'India', stations: 3, geo: [81.6296, 21.2514], state: 'Chhattisgarh' },
            { id: 'siliguri', name: 'Siliguri', country: 'India', stations: 2, geo: [88.4275, 26.7271], state: 'West Bengal' },
            
            // Northeast India
            { id: 'shillong', name: 'Shillong', country: 'India', stations: 2, geo: [91.8933, 25.5788], state: 'Meghalaya' },
            { id: 'imphal', name: 'Imphal', country: 'India', stations: 2, geo: [93.9368, 24.8170], state: 'Manipur' },
            { id: 'agartala', name: 'Agartala', country: 'India', stations: 2, geo: [91.2868, 23.8315], state: 'Tripura' },
            { id: 'aizawl', name: 'Aizawl', country: 'India', stations: 1, geo: [92.7176, 23.7271], state: 'Mizoram' },
            { id: 'kohima', name: 'Kohima', country: 'India', stations: 1, geo: [94.1086, 25.6751], state: 'Nagaland' },
            { id: 'gangtok', name: 'Gangtok', country: 'India', stations: 1, geo: [88.6138, 27.3314], state: 'Sikkim' },
            { id: 'itanagar', name: 'Itanagar', country: 'India', stations: 1, geo: [93.6053, 27.0844], state: 'Arunachal Pradesh' },
            
            // J&K and Ladakh
            { id: 'srinagar', name: 'Srinagar', country: 'India', stations: 3, geo: [74.7973, 34.0837], state: 'Jammu & Kashmir' },
            { id: 'jammu', name: 'Jammu', country: 'India', stations: 2, geo: [74.8570, 32.7266], state: 'Jammu & Kashmir' },
            { id: 'leh', name: 'Leh', country: 'India', stations: 1, geo: [77.5771, 34.1526], state: 'Ladakh' }
        ];
    },
    
    /**
     * Add state filter chips dynamically
     */
    addStateChips() {
        const filter = document.getElementById('stateFilter');
        const states = [...new Set(this.cities.map(c => c.state))].filter(s => s !== 'India').sort();
        
        states.forEach(state => {
            const chip = document.createElement('button');
            chip.className = 'state-chip';
            chip.dataset.state = state;
            chip.textContent = this.getStateCode(state) || state;
            chip.title = state;
            filter.appendChild(chip);
        });
    },
    
    /**
     * Get user's location
     */
    getUserLocation() {
        const locationEl = document.getElementById('userLocation');
        
        if (!navigator.geolocation) {
            locationEl.textContent = 'Location not supported';
            document.getElementById('locationBar').classList.add('error');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.userLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                
                // Find nearest city
                const nearest = this.findNearestCity();
                if (nearest) {
                    locationEl.innerHTML = 'Near <strong>' + nearest.name + '</strong> • ' + 
                        Math.round(nearest.distance) + ' km away';
                } else {
                    locationEl.textContent = 'Location detected';
                }
                
                // Re-render cities with distance
                this.renderCities();
            },
            (err) => {
                console.log('[Radio] Location error:', err.message);
                locationEl.textContent = 'Enable location for nearby cities';
                document.getElementById('locationBar').classList.add('error');
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    },
    
    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },
    
    /**
     * Find nearest city to user
     */
    findNearestCity() {
        if (!this.userLocation || !this.cities.length) return null;
        
        let nearest = null;
        let minDist = Infinity;
        
        for (const city of this.cities) {
            if (!city.geo) continue;
            const dist = this.calculateDistance(
                this.userLocation.lat, this.userLocation.lng,
                city.geo[1], city.geo[0] // geo is [lng, lat]
            );
            if (dist < minDist) {
                minDist = dist;
                nearest = { ...city, distance: dist };
            }
        }
        
        return nearest;
    },
    
    /**
     * Show loading skeletons
     */
    showCitySkeletons() {
        const grid = document.getElementById('cityGrid');
        grid.innerHTML = '';
        
        for (let i = 0; i < 12; i++) {
            const skel = document.createElement('div');
            skel.className = 'city-skeleton';
            skel.innerHTML = '<div class="skel-name"></div><div class="skel-count"></div><div class="skel-state"></div>';
            grid.appendChild(skel);
        }
    },
    
    /**
     * Render city bubbles
     */
    renderCities(filter = 'all') {
        const grid = document.getElementById('cityGrid');
        grid.innerHTML = '';
        
        let citiesToShow = [...this.cities];
        
        // Apply filter
        if (filter === 'nearby' && this.userLocation) {
            citiesToShow = citiesToShow
                .map(city => {
                    if (!city.geo) return { ...city, distance: Infinity };
                    const dist = this.calculateDistance(
                        this.userLocation.lat, this.userLocation.lng,
                        city.geo[1], city.geo[0]
                    );
                    return { ...city, distance: dist };
                })
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 20);
        } else if (filter !== 'all') {
            citiesToShow = citiesToShow.filter(c => c.state === filter);
        }
        
        // Add distance to all cities if location available
        if (this.userLocation) {
            citiesToShow = citiesToShow.map(city => {
                if (!city.geo) return city;
                if (city.distance) return city;
                const dist = this.calculateDistance(
                    this.userLocation.lat, this.userLocation.lng,
                    city.geo[1], city.geo[0]
                );
                return { ...city, distance: dist };
            });
        }
        
        // Render each city
        console.log('[Radio] Creating', citiesToShow.length, 'city bubbles');
        citiesToShow.forEach((city, idx) => {
            const bubble = document.createElement('div');
            bubble.className = 'city-bubble';
            bubble.dataset.cityId = city.id;
            bubble.dataset.cityIdx = idx;
            
            if (city.distance && city.distance < 100) {
                bubble.classList.add('nearby');
            }
            
            let distanceHtml = '';
            if (city.distance && city.distance < 10000) {
                distanceHtml = '<div class="city-distance"><i class="bi bi-geo-alt"></i> ' + 
                    (city.distance < 1 ? '<1' : Math.round(city.distance)) + ' km</div>';
            }
            
            bubble.innerHTML = `
                <div class="city-name">${city.name}</div>
                <div class="city-count"><i class="bi bi-broadcast"></i> ${city.stations} stations</div>
                <div class="city-state">${city.state}</div>
                ${distanceHtml}
            `;
            
            grid.appendChild(bubble);
            
            // Animate in after append
            requestAnimationFrame(() => {
                bubble.style.opacity = '1';
            });
        });
    },
    
    /**
     * Open city and show its stations below the city card
     */
    async openCity(cityId) {
        const city = this.cities.find(c => c.id === cityId);
        if (!city) return;
        
        // Remove previous active state and drawer
        document.querySelectorAll('.city-bubble').forEach(b => b.classList.remove('active'));
        const existingDrawer = document.getElementById('cityStationsDrawer');
        if (existingDrawer) existingDrawer.remove();
        
        const bubble = document.querySelector(`[data-city-id="${cityId}"]`);
        if (!bubble) return;
        
        bubble.classList.add('active');
        this.selectedCity = city;
        
        // Create drawer and insert right after the bubble
        const drawer = document.createElement('div');
        drawer.id = 'cityStationsDrawer';
        drawer.className = 'city-stations open';
        drawer.innerHTML = `
            <div class="city-stations-header">
                <span class="city-stations-title" id="drawerTitle">${city.name} Stations</span>
                <button class="city-stations-close" id="closeDrawer"><i class="bi bi-x"></i></button>
            </div>
            <div class="city-stations-list" id="stationsList">
                <div class="station-card loading">Loading stations...</div>
            </div>
        `;
        
        // Insert drawer after the bubble (using insertAdjacentElement)
        bubble.insertAdjacentElement('afterend', drawer);
        
        // Add close listener
        document.getElementById('closeDrawer').addEventListener('click', () => {
            this.closeStationsDrawer();
        });
        
        // Scroll to show the drawer
        setTimeout(() => {
            drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        // Fetch and render stations
        const stations = await this.fetchCityStations(city);
        this.renderCityStations(stations);
    },
    
    /**
     * Fetch stations for a specific city
     */
    async fetchCityStations(city) {
        if (this.cityStations[city.id]) {
            return this.cityStations[city.id];
        }
        
        // Try radio-browser API with city search
        try {
            const searchTerms = [city.name, city.state].filter(Boolean);
            for (const term of searchTerms) {
                const path = '/json/stations/byname/' + encodeURIComponent(term) + 
                    '?hidebroken=true&limit=30&order=clickcount&reverse=true';
                
                for (const server of this.API_SERVERS) {
                    try {
                        const res = await fetch(server + path);
                        if (res.ok) {
                            const data = await res.json();
                            const indianStations = data.filter(s => 
                                (s.country === 'India' || s.countrycode === 'IN') &&
                                (s.url_resolved || s.url)
                            );
                            if (indianStations.length > 0) {
                                this.cityStations[city.id] = indianStations;
                                return indianStations;
                            }
                        }
                    } catch(e) {}
                }
            }
        } catch(e) {}
        
        return this.getFallbackStations().slice(0, 10);
    },
    
    /**
     * Render stations in drawer
     */
    renderCityStations(stations) {
        const list = document.getElementById('stationsList');
        list.innerHTML = '';
        
        if (!stations.length) {
            list.innerHTML = '<div class="station-card">No stations found</div>';
            return;
        }
        
        stations.forEach((station, idx) => {
            const card = document.createElement('div');
            card.className = 'station-card';
            card.dataset.stationIdx = this.stations.length;
            
            const langLabel = this.getLangLabel(station.language);
            
            card.innerHTML = `
                <div class="station-name">${station.name}</div>
                <div class="station-lang"><span>${langLabel}</span> ${station.bitrate ? station.bitrate + ' kbps' : ''}</div>
            `;
            
            card.addEventListener('click', () => {
                document.querySelectorAll('.station-card').forEach(c => c.classList.remove('playing'));
                card.classList.add('playing');
                this.playStation(station, idx);
            });
            
            list.appendChild(card);
            this.stations.push(station);
        });
    },
    
    /**
     * Close stations drawer
     */
    closeStationsDrawer() {
        const drawer = document.getElementById('cityStationsDrawer');
        if (drawer) drawer.remove();
        document.querySelectorAll('.city-bubble').forEach(b => b.classList.remove('active'));
        this.selectedCity = null;
    },
    
    /**
     * Play a station directly
     */
    playStation(station, index) {
        this.current = station;
        this.currentIndex = index;
        
        this.audio.src = station.url_resolved || station.url;
        this.audio.play().catch(() => {
            document.getElementById('nowLocation').textContent = 'Stream error - try another';
        });
        
        document.getElementById('nowPlaying').textContent = station.name;
        document.getElementById('nowLocation').textContent = 
            ((station.state || '') + ' ' + (station.country || '')).trim();
        
        this.updateSaveBtn();
    },
    
    /**
     * Check if cell is in India zone (for grid view)
     */
    isIndiaCell(col, row) {
        return col >= this.indiaZone.colStart && col <= this.indiaZone.colEnd &&
               row >= this.indiaZone.rowStart && row <= this.indiaZone.rowEnd;
    },
    
    /**
     * Get 2-letter language code for display
     */
    getLangCode(language) {
        if (!language) return 'FM';
        const lang = language.toLowerCase();
        
        // Indian languages
        if (lang.includes('hindi')) return 'HI';
        if (lang.includes('tamil')) return 'TA';
        if (lang.includes('telugu')) return 'TE';
        if (lang.includes('kannada')) return 'KN';
        if (lang.includes('malayalam')) return 'ML';
        if (lang.includes('marathi')) return 'MR';
        if (lang.includes('gujarati')) return 'GU';
        if (lang.includes('punjabi')) return 'PA';
        if (lang.includes('bengali') || lang.includes('bangla')) return 'BN';
        if (lang.includes('odia') || lang.includes('oriya')) return 'OR';
        if (lang.includes('assamese')) return 'AS';
        if (lang.includes('urdu')) return 'UR';
        if (lang.includes('sanskrit')) return 'SA';
        
        // Other languages
        if (lang.includes('english')) return 'EN';
        if (lang.includes('chinese') || lang.includes('mandarin')) return 'ZH';
        if (lang.includes('nepali')) return 'NE';
        if (lang.includes('sinhala') || lang.includes('sinhalese')) return 'SI';
        if (lang.includes('thai')) return 'TH';
        if (lang.includes('burmese') || lang.includes('myanmar')) return 'MY';
        if (lang.includes('arabic')) return 'AR';
        if (lang.includes('persian') || lang.includes('farsi') || lang.includes('pashto') || lang.includes('dari')) return 'FA';
        if (lang.includes('indonesian') || lang.includes('malay')) return 'ID';
        if (lang.includes('dzongkha')) return 'DZ';
        if (lang.includes('tibetan')) return 'BO';
        if (lang.includes('dhivehi') || lang.includes('maldivian')) return 'DV';
        
        // Default: first 2 letters
        return language.substring(0, 2).toUpperCase();
    },
    
    /**
     * Get user-friendly language label for badge
     */
    getLangLabel(language) {
        if (!language) return 'FM';
        const lang = language.toLowerCase();
        
        // Indian languages with friendly labels
        if (lang.includes('hindi')) return 'HI';
        if (lang.includes('bhojpuri')) return 'Bhoj';
        if (lang.includes('tamil')) return 'TA';
        if (lang.includes('telugu')) return 'TE';
        if (lang.includes('kannada')) return 'KN';
        if (lang.includes('malayalam')) return 'ML';
        if (lang.includes('marathi')) return 'MR';
        if (lang.includes('gujarati')) return 'GJ';
        if (lang.includes('punjabi')) return 'PB';
        if (lang.includes('bengali') || lang.includes('bangla')) return 'BN';
        if (lang.includes('odia') || lang.includes('oriya')) return 'OD';
        if (lang.includes('assamese')) return 'AS';
        if (lang.includes('urdu')) return 'UR';
        if (lang.includes('rajasthani')) return 'RJ';
        if (lang.includes('haryanvi')) return 'HR';
        if (lang.includes('kashmiri')) return 'KS';
        if (lang.includes('konkani')) return 'KK';
        if (lang.includes('maithili')) return 'Mai';
        if (lang.includes('santali')) return 'Sat';
        if (lang.includes('dogri')) return 'Dgr';
        if (lang.includes('sanskrit')) return 'SA';
        if (lang.includes('sindhi')) return 'SD';
        if (lang.includes('manipuri')) return 'Mni';
        if (lang.includes('nepali')) return 'NE';
        
        // International
        if (lang.includes('english')) return 'EN';
        if (lang.includes('chinese') || lang.includes('mandarin')) return 'ZH';
        if (lang.includes('sinhala') || lang.includes('sinhalese')) return 'SI';
        if (lang.includes('thai')) return 'TH';
        if (lang.includes('indonesian') || lang.includes('malay')) return 'ID';
        if (lang.includes('arabic')) return 'AR';
        
        // Default: first 2-3 chars
        return language.substring(0, 3);
    },
    
    /**
     * Get state abbreviation for display
     */
    getStateCode(state) {
        if (!state) return '';
        const s = state.toLowerCase().trim();
        
        // Indian states
        if (s.includes('uttar pradesh') || s === 'up') return 'UP';
        if (s.includes('madhya pradesh') || s === 'mp') return 'MP';
        if (s.includes('andhra pradesh') || s === 'ap') return 'AP';
        if (s.includes('arunachal pradesh')) return 'AR';
        if (s.includes('himachal pradesh') || s === 'hp') return 'HP';
        if (s.includes('maharashtra')) return 'MH';
        if (s.includes('karnataka') || s.includes('bangalore') || s.includes('bengaluru')) return 'KA';
        if (s.includes('tamil nadu') || s.includes('chennai')) return 'TN';
        if (s.includes('kerala') || s.includes('kochi') || s.includes('trivandrum')) return 'KL';
        if (s.includes('west bengal') || s.includes('kolkata')) return 'WB';
        if (s.includes('gujarat') || s.includes('ahmedabad')) return 'GJ';
        if (s.includes('rajasthan') || s.includes('jaipur')) return 'RJ';
        if (s.includes('punjab') || s.includes('chandigarh')) return 'PB';
        if (s.includes('haryana')) return 'HR';
        if (s.includes('odisha') || s.includes('orissa') || s.includes('bhubaneswar')) return 'OD';
        if (s.includes('bihar') || s.includes('patna')) return 'BR';
        if (s.includes('jharkhand') || s.includes('ranchi')) return 'JH';
        if (s.includes('chhattisgarh') || s.includes('raipur')) return 'CG';
        if (s.includes('assam') || s.includes('guwahati')) return 'AS';
        if (s.includes('telangana') || s.includes('hyderabad')) return 'TS';
        if (s.includes('goa')) return 'GA';
        if (s.includes('uttarakhand') || s.includes('dehradun')) return 'UK';
        if (s.includes('meghalaya') || s.includes('shillong')) return 'ML';
        if (s.includes('manipur') || s.includes('imphal')) return 'MN';
        if (s.includes('tripura') || s.includes('agartala')) return 'TR';
        if (s.includes('mizoram') || s.includes('aizawl')) return 'MZ';
        if (s.includes('nagaland') || s.includes('kohima')) return 'NL';
        if (s.includes('sikkim') || s.includes('gangtok')) return 'SK';
        if (s.includes('delhi') || s.includes('new delhi')) return 'DL';
        if (s.includes('mumbai')) return 'MH';
        if (s.includes('jammu') || s.includes('kashmir') || s.includes('srinagar')) return 'JK';
        if (s.includes('ladakh') || s.includes('leh')) return 'LA';
        if (s.includes('puducherry') || s.includes('pondicherry')) return 'PY';
        if (s.includes('national') || s.includes('india')) return 'IN';
        
        // Return first 2 chars if no match
        return state.substring(0, 2).toUpperCase();
    },
    
    /**
     * Fallback stations when API fails
     */
    getFallbackStations() {
        return [
            { name: 'Radio Mirchi', language: 'Hindi', state: 'Mumbai', country: 'India', url_resolved: 'https://radioindia.net/radio/mirchi/icecast.audio', bitrate: 128 },
            { name: 'Red FM', language: 'Hindi', state: 'Delhi', country: 'India', url_resolved: 'https://radioindia.net/radio/red_fm/icecast.audio', bitrate: 128 },
            { name: 'Radio City', language: 'Hindi', state: 'Bangalore', country: 'India', url_resolved: 'https://prclive1.listenon.in/Hindi', bitrate: 64 },
            { name: 'AIR Vividh Bharati', language: 'Hindi', state: 'National', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8', bitrate: 128 },
            { name: 'Radio One', language: 'English', state: 'Mumbai', country: 'India', url_resolved: 'https://stream.zeno.fm/06e1qp5w40zuv', bitrate: 128 },
            { name: 'Suryan FM', language: 'Tamil', state: 'Chennai', country: 'India', url_resolved: 'https://stream.zeno.fm/sn8b2f0r8zzuv', bitrate: 64 },
            { name: 'Radio Mango', language: 'Malayalam', state: 'Kerala', country: 'India', url_resolved: 'https://stream.zeno.fm/fda17yaqpzzuv', bitrate: 64 },
            { name: 'Big FM', language: 'Hindi', state: 'Delhi', country: 'India', url_resolved: 'https://radioindia.net/radio/sc-bb/icecast.audio', bitrate: 128 },
            { name: 'Fever FM', language: 'Hindi', state: 'Mumbai', country: 'India', url_resolved: 'https://stream.zeno.fm/h3nz6a7ykzzuv', bitrate: 64 },
            { name: 'Radio Nasha', language: 'Hindi', state: 'Delhi', country: 'India', url_resolved: 'https://stream.zeno.fm/smp6gqdz8zzuv', bitrate: 64 },
            { name: 'Ishq FM', language: 'Hindi', state: 'Mumbai', country: 'India', url_resolved: 'https://stream.zeno.fm/e6s2cqvp108uv', bitrate: 64 },
            { name: 'AIR Tamil', language: 'Tamil', state: 'Chennai', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio023/playlist.m3u8', bitrate: 128 },
            { name: 'Radio Olive', language: 'Malayalam', state: 'Kerala', country: 'India', url_resolved: 'https://stream.zeno.fm/3sqb4w0g9zzuv', bitrate: 64 },
            { name: 'AIR Telugu', language: 'Telugu', state: 'Hyderabad', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio042/playlist.m3u8', bitrate: 128 },
            { name: 'AIR Kannada', language: 'Kannada', state: 'Bangalore', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio021/playlist.m3u8', bitrate: 128 },
            { name: 'Radio Hungama', language: 'Hindi', state: 'Mumbai', country: 'India', url_resolved: 'https://stream.zeno.fm/zt8u8pf4xzzuv', bitrate: 64 },
            { name: 'AIR Marathi', language: 'Marathi', state: 'Mumbai', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio019/playlist.m3u8', bitrate: 128 },
            { name: 'AIR Gujarati', language: 'Gujarati', state: 'Ahmedabad', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio044/playlist.m3u8', bitrate: 128 },
            { name: 'AIR Bengali', language: 'Bengali', state: 'Kolkata', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio013/playlist.m3u8', bitrate: 128 },
            { name: 'AIR Punjabi', language: 'Punjabi', state: 'Chandigarh', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio031/playlist.m3u8', bitrate: 128 },
            { name: 'Club FM', language: 'Malayalam', state: 'Kerala', country: 'India', url_resolved: 'https://stream.zeno.fm/cqybbw7p9zzuv', bitrate: 64 },
            { name: 'Hello FM', language: 'Tamil', state: 'Chennai', country: 'India', url_resolved: 'https://stream.zeno.fm/00r0qvhvb2zuv', bitrate: 64 },
            { name: 'S FM', language: 'Telugu', state: 'Hyderabad', country: 'India', url_resolved: 'https://stream.zeno.fm/yz27dv0m208uv', bitrate: 64 },
            { name: 'AIR Odia', language: 'Odia', state: 'Bhubaneswar', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio039/playlist.m3u8', bitrate: 128 },
            { name: 'AIR Urdu', language: 'Urdu', state: 'Delhi', country: 'India', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio006/playlist.m3u8', bitrate: 128 }
        ].map((s, i) => ({ ...s, stationuuid: 'fallback_' + i }));
    },

    /**
     * Fetch stations - try multiple servers directly
     */
    async fetchStations(country, limit = 100) {
        const path = '/json/stations/bycountry/' + encodeURIComponent(country) + 
                     '?hidebroken=true&limit=' + limit + '&order=clickcount&reverse=true';
        
        // Try each server directly (radio-browser supports CORS)
        for (const server of this.API_SERVERS) {
            try {
                const res = await fetch(server + path, {
                    headers: { 'User-Agent': 'PixelRadio/1.0' }
                });
                if (res.ok) {
                    const data = await res.json();
                    const filtered = data.filter(s => s.url_resolved || s.url);
                    console.log('[Radio] ✓ ' + country + ': ' + filtered.length + ' stations');
                    return filtered;
                }
            } catch (e) {
                console.log('[Radio] ' + server.split('//')[1].split('.')[0] + ' failed for ' + country);
            }
        }
        
        // Last resort: try with different proxy
        try {
            const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=' + 
                encodeURIComponent(this.API_SERVERS[0] + path);
            const res = await fetch(proxyUrl);
            if (res.ok) {
                const data = await res.json();
                const filtered = data.filter(s => s.url_resolved || s.url);
                console.log('[Radio] ✓ ' + country + ' via proxy: ' + filtered.length);
                return filtered;
            }
        } catch (e) {}
        
        return [];
    },
    
    /**
     * Create the 14x15 grid
     */
    createGrid() {
        const grid = document.getElementById('grid');
        
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell empty';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.index = row * this.COLS + col;
                
                if (this.isIndiaCell(col, row)) {
                    cell.classList.add('india');
                }
                
                cell.innerHTML = '<div class="cell-name"></div><div class="cell-lang"></div><div class="cell-detail"></div><div class="cell-extra"></div>';
                
                grid.appendChild(cell);
                this.cells.push(cell);
            }
        }
    },
    
    /**
     * Load Indian stations into center zone
     */
    async loadIndia() {
        this.updateLoading('Loading India...');
        
        let data = await this.fetchStations('India', 100);
        
        // If API fails, use fallback sample stations
        if (!data || data.length === 0) {
            console.log('[Radio] Using fallback stations');
            data = this.getFallbackStations();
        }
        
        if (!data || data.length === 0) {
            this.updateLoading('Failed. Try refreshing.');
            return;
        }
        
        this.indiaStations = data;
        console.log('[Radio] Loaded ' + this.indiaStations.length + ' stations');
        
        // Fill India zone
        let stationIdx = 0;
        for (let row = this.indiaZone.rowStart; row <= this.indiaZone.rowEnd && stationIdx < this.indiaStations.length; row++) {
            for (let col = this.indiaZone.colStart; col <= this.indiaZone.colEnd && stationIdx < this.indiaStations.length; col++) {
                const cellIdx = row * this.COLS + col;
                const cell = this.cells[cellIdx];
                const station = this.indiaStations[stationIdx];
                
                this.populateCell(cell, station, stationIdx + 1);
                
                // Animate in with delay
                setTimeout(() => cell.classList.add('loaded'), stationIdx * 15);
                stationIdx++;
            }
        }
        
        this.updateLoading(this.indiaStations.length + ' Indian stations');
        setTimeout(() => {
            document.getElementById('loadingText').style.opacity = '0';
        }, 3000);
    },
    
    /**
     * Load neighboring countries into edge zones - PARALLEL loading
     */
    async loadNeighbors() {
        const neighbors = [
            { country: 'Pakistan', position: 'west' },
            { country: 'Nepal', position: 'north' },
            { country: 'Bangladesh', position: 'east' },
            { country: 'Sri Lanka', position: 'south' },
            { country: 'Indonesia', position: 'south' },
            { country: 'China', position: 'north' }
        ];
        
        // Get empty cells by direction
        const cellsByDirection = this.getEmptyCellsByDirection();
        
        // Load ALL neighbors in parallel (much faster!)
        const results = await Promise.allSettled(
            neighbors.map(n => this.fetchStations(n.country, 20))
        );
        
        // Process results
        results.forEach((result, i) => {
            if (result.status !== 'fulfilled' || !result.value.length) return;
            
            const neighbor = neighbors[i];
            const stations = result.value;
            const targetCells = cellsByDirection[neighbor.position];
            
            let stationNum = 1;
            for (const station of stations) {
                if (targetCells.length === 0) break;
                
                const cellIdx = targetCells.shift();
                const cell = this.cells[cellIdx];
                
                this.populateCell(cell, station, stationNum, neighbor.country);
                setTimeout(() => cell.classList.add('loaded'), Math.random() * 300);
                stationNum++;
            }
        });
    },
    
    /**
     * Get empty cells categorized by direction
     */
    getEmptyCellsByDirection() {
        const west = [], east = [], north = [], south = [];
        
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (!cell.classList.contains('empty')) continue;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (col < this.indiaZone.colStart) west.push(i);
            else if (col > this.indiaZone.colEnd) east.push(i);
            else if (row < this.indiaZone.rowStart) north.push(i);
            else if (row > this.indiaZone.rowEnd) south.push(i);
        }
        
        return { west, east, north, south };
    },
    
    /**
     * Populate a cell with station data
     */
    populateCell(cell, station, num, fallbackLocation) {
        fallbackLocation = fallbackLocation || 'IN';
        cell.classList.remove('empty');
        cell.dataset.stationIdx = this.stations.length;
        
        const lang = this.getLangCode(station.language);
        const langLabel = this.getLangLabel(station.language);
        const fmNum = String(num).padStart(2, '0');
        const stateCode = this.getStateCode(station.state) || fallbackLocation.substring(0, 2).toUpperCase();
        const fullState = station.state || station.country || fallbackLocation;
        
        cell.querySelector('.cell-name').textContent = fmNum;
        cell.querySelector('.cell-lang').textContent = langLabel;
        cell.querySelector('.cell-detail').textContent = stateCode;
        cell.querySelector('.cell-extra').textContent = station.name;
        
        // Store full state for expanded view
        cell.dataset.fullState = fullState;
        cell.dataset.stationName = station.name;
        cell.dataset.language = station.language || 'Unknown';
        cell.dataset.langLabel = langLabel;
        
        cell.title = station.name + ' - ' + (station.language || 'Unknown') + ' - ' + fullState;
        
        this.stations.push(station);
    },
    
    /**
     * Update loading text
     */
    updateLoading(text) {
        document.getElementById('loadingText').textContent = text;
    },
    
    /**
     * Set up event listeners
     */
    setupEvents() {
        // City Grid click
        document.getElementById('cityGrid').addEventListener('click', (e) => {
            const bubble = e.target.closest('.city-bubble');
            if (!bubble) return;
            this.openCity(bubble.dataset.cityId);
        });
        
        // State filter click
        document.getElementById('stateFilter').addEventListener('click', (e) => {
            const chip = e.target.closest('.state-chip');
            if (!chip) return;
            
            document.querySelectorAll('.state-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            this.closeStationsDrawer();
            this.renderCities(chip.dataset.state);
        });
        
        // Grid click (for grid view)
        document.getElementById('grid').addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell || cell.classList.contains('empty')) return;
            
            const idx = parseInt(cell.dataset.stationIdx);
            this.play(idx, cell);
        });
        
        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.search(e.target.value);
        });
        
        // Controls
        document.getElementById('nextBtn').addEventListener('click', () => this.next());
        document.getElementById('prevBtn').addEventListener('click', () => this.prev());
        document.getElementById('saveBtn').addEventListener('click', () => this.toggleSave());
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareStation());
        
        // Audio events
        this.audio.addEventListener('playing', () => {
            document.getElementById('playerIcon').classList.add('playing');
            this.updatePlayPauseBtn(true);
        });
        this.audio.addEventListener('pause', () => {
            document.getElementById('playerIcon').classList.remove('playing');
            this.updatePlayPauseBtn(false);
        });
        this.audio.addEventListener('ended', () => {
            document.getElementById('playerIcon').classList.remove('playing');
            this.updatePlayPauseBtn(false);
        });
        this.audio.addEventListener('error', () => {
            document.getElementById('nowLocation').textContent = 'Stream error - try next';
            this.updatePlayPauseBtn(false);
        });
    },
    
    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (!this.current) return;
        
        if (this.audio.paused) {
            this.audio.play().catch(() => {});
        } else {
            this.audio.pause();
        }
    },
    
    /**
     * Update play/pause button icon
     */
    updatePlayPauseBtn(isPlaying) {
        const btn = document.getElementById('playPauseBtn');
        btn.innerHTML = isPlaying 
            ? '<i class="bi bi-stop-fill"></i>' 
            : '<i class="bi bi-play-fill"></i>';
        btn.classList.toggle('playing', isPlaying);
    },

    /**
     * Search stations
     */
    search(query) {
        const q = query.toLowerCase();
        
        this.cells.forEach(cell => {
            if (cell.classList.contains('empty')) return;
            
            const name = cell.querySelector('.cell-name').textContent.toLowerCase();
            const extra = cell.querySelector('.cell-extra').textContent.toLowerCase();
            const match = !q || name.includes(q) || extra.includes(q) || cell.title.toLowerCase().includes(q);
            
            cell.style.opacity = match ? '' : '0.1';
        });
    },
    
    /**
     * Play a station
     */
    play(index, cell) {
        if (index < 0 || index >= this.stations.length) return;
        
        // Remove old active and restore its state/lang code
        document.querySelectorAll('.cell.active').forEach(el => {
            el.classList.remove('active');
            // Restore state code and lang label on deactivate
            const stateCode = this.getStateCode(el.dataset.fullState) || 'IN';
            el.querySelector('.cell-detail').textContent = stateCode;
            el.querySelector('.cell-lang').textContent = el.dataset.langLabel || 'FM';
        });
        
        // Set new active
        if (cell) {
            cell.classList.add('active');
            // Show full state name on expanded card
            cell.querySelector('.cell-detail').textContent = cell.dataset.fullState || '';
            // Show full language name on expanded card
            cell.querySelector('.cell-lang').textContent = cell.dataset.language || '';
        }
        
        this.currentIndex = index;
        this.current = this.stations[index];
        
        // Play audio
        this.audio.src = this.current.url_resolved || this.current.url;
        this.audio.play().catch(() => {});
        
        // Update UI
        document.getElementById('nowPlaying').textContent = this.current.name;
        document.getElementById('nowLocation').textContent = 
            ((this.current.state || '') + ' ' + (this.current.country || '')).trim();
        
        this.updateSaveBtn();
    },
    
    /**
     * Play next station
     */
    next() {
        if (this.stations.length === 0) return;
        const nextIdx = (this.currentIndex + 1) % this.stations.length;
        const cell = document.querySelector('[data-station-idx="' + nextIdx + '"]');
        this.play(nextIdx, cell);
    },
    
    /**
     * Play previous station
     */
    prev() {
        if (this.stations.length === 0) return;
        const prevIdx = this.currentIndex <= 0 ? this.stations.length - 1 : this.currentIndex - 1;
        const cell = document.querySelector('[data-station-idx="' + prevIdx + '"]');
        this.play(prevIdx, cell);
    },
    
    /**
     * Toggle save station
     */
    toggleSave() {
        if (!this.current) return;
        
        const idx = this.saved.findIndex(s => s.stationuuid === this.current.stationuuid);
        if (idx > -1) {
            this.saved.splice(idx, 1);
        } else {
            this.saved.push(this.current);
        }
        
        localStorage.setItem('pixelRadioSaved', JSON.stringify(this.saved));
        this.updateSaveBtn();
    },
    
    /**
     * Update save button state
     */
    updateSaveBtn() {
        const btn = document.getElementById('saveBtn');
        const isSaved = this.current && this.saved.some(s => s.stationuuid === this.current.stationuuid);
        
        btn.classList.toggle('saved', isSaved);
        btn.innerHTML = '<i class="bi bi-heart' + (isSaved ? '-fill' : '') + '"></i>';
    },
    
    /**
     * Share current station
     */
    shareStation() {
        if (!this.current) {
            alert('Select a station first!');
            return;
        }
        
        const stationName = this.current.name;
        const language = this.current.language || 'Unknown';
        const location = (this.current.state || '') + ' ' + (this.current.country || '');
        
        const shareText = `🎵 I'm listening to "${stationName}" on Pixel Radio!\n📍 ${location.trim()}\n🗣️ ${language}\n\nListen now: ${window.location.href}`;
        
        // Use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'Pixel Radio - ' + stationName,
                text: shareText,
                url: window.location.href
            }).catch(() => {});
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                const btn = document.getElementById('shareBtn');
                btn.innerHTML = '<i class="bi bi-check"></i>';
                setTimeout(() => {
                    btn.innerHTML = '<i class="bi bi-share"></i>';
                }, 2000);
            }).catch(() => {
                alert(shareText);
            });
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Radio.init());
