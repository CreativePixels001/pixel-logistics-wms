// ===== PIXEL RADIO - radio.js =====
// A window to your hometown. Free. Personal. Yours.
// The world map drawn by human voices.

const RadioApp = {
    // State
    stations: [],
    allStations: [], // All stations for the world map
    savedStations: JSON.parse(localStorage.getItem('pixelRadioSaved') || '[]'),
    currentStation: null,
    isPlaying: false,
    isMuted: false,
    mapDots: [],
    
    // Map Transform State (for pan & zoom)
    transform: {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        minScale: 0.5,
        maxScale: 8
    },
    isDragging: false,
    lastMousePos: { x: 0, y: 0 },
    
    // DOM Elements
    audio: null,
    canvas: null,
    ctx: null,
    
    // Config - Radio Browser API has multiple servers
    API_SERVERS: [
        'https://de1.api.radio-browser.info/json',
        'https://nl1.api.radio-browser.info/json',
        'https://at1.api.radio-browser.info/json'
    ],
    apiBase: null,
    loadedRegions: new Set(),
    isLoadingMore: false,
    
    // Initialize
    async init() {
        this.audio = document.getElementById('radioAudio');
        this.canvas = document.getElementById('radioMap');
        this.ctx = this.canvas.getContext('2d');
        
        // Set default API
        this.apiBase = this.API_SERVERS[0];
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupMapInteractions();
        this.renderSavedStations();
        
        // Start with India - Home first! 🇮🇳
        const indiaLoaded = await this.loadCountryStations('India');
        
        // Zoom to India if stations loaded
        if (indiaLoaded > 0) {
            this.zoomToLocation(20.5937, 78.9629, 2); // Center of India
        }
        
        // Hide loading
        document.querySelector('.map-loading').classList.add('hidden');
        
        // Load more regions after a delay
        setTimeout(() => this.loadMoreRegions(), 5000);
    },
    
    // Load stations for a specific country
    async loadCountryStations(country) {
        try {
            if (this.loadedRegions.has(country)) return;
            
            document.querySelector('.map-loading p').textContent = `Tuning into ${country}...`;
            
            const url = `${this.apiBase}/stations/bycountry/${encodeURIComponent(country)}?hidebroken=true&has_geo_info=true&limit=1000`;
            
            console.log(`📻 Loading ${country} stations...`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            // Filter valid stations
            const validStations = data.filter(s => s && s.geo_lat && s.geo_long);
            
            console.log(`✅ ${country}: ${validStations.length} stations loaded`);
            
            // Add to all stations (avoid duplicates)
            const existingIds = new Set(this.allStations.map(s => s.stationuuid));
            validStations.forEach(s => {
                if (!existingIds.has(s.stationuuid)) {
                    this.allStations.push(s);
                }
            });
            
            this.stations = this.allStations;
            this.loadedRegions.add(country);
            
            this.drawMap();
            
            return validStations.length;
        } catch (error) {
            console.error(`❌ Failed to load ${country}:`, error.message);
            
            // Try next server
            const currentIndex = this.API_SERVERS.indexOf(this.apiBase);
            this.apiBase = this.API_SERVERS[(currentIndex + 1) % this.API_SERVERS.length];
            
            // Retry once
            if (!this.loadedRegions.has(country + '_retry')) {
                this.loadedRegions.add(country + '_retry');
                return this.loadCountryStations(country);
            }
            return 0;
        }
    },
    
    // Progressively load more regions
    async loadMoreRegions() {
        if (this.isLoadingMore) return;
        this.isLoadingMore = true;
        
        // Priority countries based on user base
        const regions = [
            'United States', 'United Kingdom', 'Germany', 
            'France', 'Japan', 'Australia', 'Canada',
            'Brazil', 'Spain', 'Italy', 'Netherlands'
        ];
        
        for (const region of regions) {
            await this.loadCountryStations(region);
            // Small delay between requests
            await new Promise(r => setTimeout(r, 1000));
        }
        
        this.isLoadingMore = false;
        console.log('🌍 World map expanding:', this.allStations.length, 'stations');
    },
    
    // Setup Canvas
    setupCanvas() {
        const resize = () => {
            this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
            this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this.drawMap();
        };
        
        resize();
        window.addEventListener('resize', resize);
    },
    
    // Load World Map - Get thousands of stations
    // Draw Map with Station Dots - The world emerges from voices
    drawMap() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, width, height);
        
        // Save context for transform
        this.ctx.save();
        
        // Apply transform (pan & zoom)
        this.ctx.translate(this.transform.offsetX, this.transform.offsetY);
        this.ctx.scale(this.transform.scale, this.transform.scale);
        
        // Draw station dots - The world map emerges
        this.drawStationDots(width, height);
        
        // Restore context
        this.ctx.restore();
        
        // Draw zoom indicator
        this.drawZoomIndicator(width, height);
    },
    
    // Draw Station Dots on Map - Each dot is a voice
    drawStationDots(width, height) {
        this.mapDots = [];
        
        // Base dimensions for mapping
        const mapWidth = width / this.transform.scale;
        const mapHeight = height / this.transform.scale;
        
        this.allStations.forEach((station) => {
            const lat = parseFloat(station.geo_lat);
            const lng = parseFloat(station.geo_long);
            
            // Convert lat/long to canvas position (Mercator-like projection)
            const x = ((lng + 180) / 360) * width;
            const y = ((90 - lat) / 180) * height;
            
            // Store dot info for click detection (screen coordinates)
            const screenX = x * this.transform.scale + this.transform.offsetX;
            const screenY = y * this.transform.scale + this.transform.offsetY;
            
            this.mapDots.push({
                x: screenX,
                y: screenY,
                mapX: x,
                mapY: y,
                station,
                size: 3
            });
            
            // Determine if this station is currently playing
            const isActive = this.currentStation && this.currentStation.stationuuid === station.stationuuid;
            
            // Dot size based on zoom level
            const dotSize = Math.max(2, 3 / Math.sqrt(this.transform.scale));
            
            if (isActive) {
                // Active station - bright blue with glow
                this.ctx.fillStyle = 'rgba(74, 158, 255, 1)';
                this.ctx.shadowColor = 'rgba(74, 158, 255, 0.8)';
                this.ctx.shadowBlur = 15;
                this.ctx.fillRect(x - dotSize, y - dotSize, dotSize * 2, dotSize * 2);
                this.ctx.shadowBlur = 0;
            } else {
                // Regular station - white/gray dot
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.fillRect(x - dotSize/2, y - dotSize/2, dotSize, dotSize);
            }
        });
    },
    
    // Draw Zoom Indicator
    drawZoomIndicator(width, height) {
        if (this.transform.scale !== 1) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '12px Roboto';
            this.ctx.fillText(`${Math.round(this.transform.scale * 100)}%`, 15, height - 15);
        }
    },
    
    // Setup Map Interactions (Pan & Zoom)
    setupMapInteractions() {
        // Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Zoom factor
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(
                this.transform.minScale,
                Math.min(this.transform.maxScale, this.transform.scale * zoomFactor)
            );
            
            // Zoom towards mouse position
            const scaleChange = newScale / this.transform.scale;
            this.transform.offsetX = mouseX - (mouseX - this.transform.offsetX) * scaleChange;
            this.transform.offsetY = mouseY - (mouseY - this.transform.offsetY) * scaleChange;
            this.transform.scale = newScale;
            
            this.drawMap();
        }, { passive: false });
        
        // Mouse drag pan
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMousePos.x;
                const deltaY = e.clientY - this.lastMousePos.y;
                
                this.transform.offsetX += deltaX;
                this.transform.offsetY += deltaY;
                
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.drawMap();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        });
        
        // Touch support for mobile
        let lastTouchDistance = 0;
        let lastTouchCenter = { x: 0, y: 0 };
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.lastMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2) {
                // Pinch zoom start
                lastTouchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                lastTouchCenter = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                };
            }
        }, { passive: true });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1 && this.isDragging) {
                const deltaX = e.touches[0].clientX - this.lastMousePos.x;
                const deltaY = e.touches[0].clientY - this.lastMousePos.y;
                
                this.transform.offsetX += deltaX;
                this.transform.offsetY += deltaY;
                
                this.lastMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                this.drawMap();
            } else if (e.touches.length === 2) {
                // Pinch zoom
                const newDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const newCenter = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                };
                
                const zoomFactor = newDistance / lastTouchDistance;
                const newScale = Math.max(
                    this.transform.minScale,
                    Math.min(this.transform.maxScale, this.transform.scale * zoomFactor)
                );
                
                // Zoom towards pinch center
                const rect = this.canvas.getBoundingClientRect();
                const centerX = newCenter.x - rect.left;
                const centerY = newCenter.y - rect.top;
                
                const scaleChange = newScale / this.transform.scale;
                this.transform.offsetX = centerX - (centerX - this.transform.offsetX) * scaleChange;
                this.transform.offsetY = centerY - (centerY - this.transform.offsetY) * scaleChange;
                
                // Pan
                this.transform.offsetX += newCenter.x - lastTouchCenter.x;
                this.transform.offsetY += newCenter.y - lastTouchCenter.y;
                
                this.transform.scale = newScale;
                lastTouchDistance = newDistance;
                lastTouchCenter = newCenter;
                
                this.drawMap();
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });
        
        // Double click to reset view
        this.canvas.addEventListener('dblclick', () => {
            this.transform = {
                scale: 1,
                offsetX: 0,
                offsetY: 0,
                minScale: 0.5,
                maxScale: 8
            };
            this.drawMap();
        });
    },
    
    // Setup Event Listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('radioSearchInput');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchStations(e.target.value);
            }, 500);
        });
        
        // Track if we actually dragged (vs just clicked)
        let dragDistance = 0;
        let clickStart = { x: 0, y: 0 };
        
        this.canvas.addEventListener('mousedown', (e) => {
            clickStart = { x: e.clientX, y: e.clientY };
            dragDistance = 0;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                dragDistance += Math.abs(e.clientX - this.lastMousePos.x) + Math.abs(e.clientY - this.lastMousePos.y);
            }
        });
        
        // Canvas click for station selection (only if not dragged)
        this.canvas.addEventListener('click', (e) => {
            // Ignore if we dragged more than 5px
            if (dragDistance > 5) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Tolerance based on zoom level
            const tolerance = Math.max(10, 20 / this.transform.scale);
            
            // Find clicked station dot
            for (const dot of this.mapDots) {
                const distance = Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2));
                if (distance < tolerance * this.transform.scale) {
                    this.playStation(dot.station);
                    break;
                }
            }
        });
        
        // Canvas hover for tooltip (only when not dragging)
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                document.getElementById('stationTooltip').classList.remove('visible');
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const tooltip = document.getElementById('stationTooltip');
            let found = false;
            
            // Tolerance based on zoom level
            const tolerance = Math.max(8, 15 / this.transform.scale);
            
            for (const dot of this.mapDots) {
                const distance = Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2));
                if (distance < tolerance * this.transform.scale) {
                    tooltip.querySelector('.station-name').textContent = dot.station.name;
                    tooltip.querySelector('.station-country').textContent = 
                        `${dot.station.state || ''} ${dot.station.country}`.trim();
                    tooltip.style.left = `${e.clientX + 15}px`;
                    tooltip.style.top = `${e.clientY + 15}px`;
                    tooltip.classList.add('visible');
                    this.canvas.style.cursor = 'pointer';
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                tooltip.classList.remove('visible');
                this.canvas.style.cursor = 'default';
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            document.getElementById('stationTooltip').classList.remove('visible');
        });
        
        // Player controls
        document.getElementById('nextStationBtn').addEventListener('click', () => this.nextStation());
        document.getElementById('saveStationBtn').addEventListener('click', () => this.toggleSaveStation());
        
        // Mute toggle
        document.getElementById('muteToggle').addEventListener('change', (e) => {
            this.isMuted = !e.target.checked;
            this.audio.muted = this.isMuted;
            this.updateVolumeIcon();
        });
        
        // Audio events
        this.audio.addEventListener('playing', () => {
            this.isPlaying = true;
            document.querySelector('.station-icon').classList.add('playing');
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            document.querySelector('.station-icon').classList.remove('playing');
        });
        
        this.audio.addEventListener('error', () => {
            console.error('Radio stream error');
            this.showMessage('Stream unavailable. Try another station.');
        });
    },
    
    // Search Stations - Find your hometown
    async searchStations(query) {
        if (!query.trim()) {
            // Reset to full world view
            this.transform = {
                scale: 1,
                offsetX: 0,
                offsetY: 0,
                minScale: 0.5,
                maxScale: 8
            };
            this.stations = this.allStations;
            this.drawMap();
            return;
        }
        
        try {
            this.showMessage(`Searching for ${query}...`);
            
            // First try to load as a country (this adds to our world map)
            const countryCount = await this.loadCountryStations(query);
            
            // Also search by state/city name
            const stateUrl = `${this.apiBase}/stations/search?limit=300&hidebroken=true&has_geo_info=true&state=${encodeURIComponent(query)}`;
            
            let searchResults = [];
            
            try {
                const stateRes = await fetch(stateUrl);
                if (stateRes.ok) {
                    const stateData = await stateRes.json();
                    searchResults = stateData.filter(s => s && s.geo_lat && s.geo_long);
                    
                    // Add to allStations
                    const existingIds = new Set(this.allStations.map(s => s.stationuuid));
                    searchResults.forEach(s => {
                        if (!existingIds.has(s.stationuuid)) {
                            this.allStations.push(s);
                        }
                    });
                }
            } catch (e) {
                console.log('State search failed, using country results');
            }
            
            // Find stations matching the query in our loaded data
            const queryLower = query.toLowerCase();
            const matchingStations = this.allStations.filter(s => 
                s.country?.toLowerCase().includes(queryLower) ||
                s.state?.toLowerCase().includes(queryLower) ||
                s.name?.toLowerCase().includes(queryLower)
            );
            
            if (matchingStations.length > 0) {
                // Calculate center of matching results
                let sumLat = 0, sumLng = 0;
                matchingStations.forEach(s => {
                    sumLat += parseFloat(s.geo_lat);
                    sumLng += parseFloat(s.geo_long);
                });
                const centerLat = sumLat / matchingStations.length;
                const centerLng = sumLng / matchingStations.length;
                
                // Zoom to that location
                this.zoomToLocation(centerLat, centerLng, 3);
                
                // Highlight these stations
                this.stations = matchingStations;
                this.showMessage(`Found ${matchingStations.length} stations`);
            } else {
                this.showMessage('No stations found. Try another city.');
            }
            
            this.drawMap();
        } catch (error) {
            console.error('Error searching stations:', error);
            this.showMessage('Search failed. Try again.');
        }
    },
    
    // Zoom to a specific location
    zoomToLocation(lat, lng, zoomLevel = 3) {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        // Convert lat/long to canvas position
        const targetX = ((lng + 180) / 360) * width;
        const targetY = ((90 - lat) / 180) * height;
        
        // Set zoom and center on target
        this.transform.scale = zoomLevel;
        this.transform.offsetX = (width / 2) - (targetX * zoomLevel);
        this.transform.offsetY = (height / 2) - (targetY * zoomLevel);
        
        this.drawMap();
    },
    
    // Play Station
    playStation(station) {
        this.currentStation = station;
        
        // Update audio source
        this.audio.src = station.url_resolved || station.url;
        this.audio.play().catch(e => console.log('Autoplay prevented'));
        
        // Update UI
        document.querySelector('.now-playing').textContent = station.name;
        document.querySelector('.station-location').textContent = 
            `${station.state ? station.state + ', ' : ''}${station.country}`;
        
        // Update save button
        this.updateSaveButton();
        
        // Redraw map to show active station
        this.drawMap();
        
        // Report click to API (helps with station ranking)
        fetch(`${this.apiBase}/url/${station.stationuuid}`).catch(() => {});
    },
    
    // Next Station
    nextStation() {
        if (this.stations.length === 0) return;
        
        let currentIndex = -1;
        if (this.currentStation) {
            currentIndex = this.stations.findIndex(s => s.stationuuid === this.currentStation.stationuuid);
        }
        
        const nextIndex = (currentIndex + 1) % this.stations.length;
        this.playStation(this.stations[nextIndex]);
    },
    
    // Toggle Save Station
    toggleSaveStation() {
        if (!this.currentStation) return;
        
        const index = this.savedStations.findIndex(
            s => s.stationuuid === this.currentStation.stationuuid
        );
        
        if (index > -1) {
            this.savedStations.splice(index, 1);
        } else {
            this.savedStations.push(this.currentStation);
        }
        
        localStorage.setItem('pixelRadioSaved', JSON.stringify(this.savedStations));
        this.updateSaveButton();
        this.renderSavedStations();
    },
    
    // Update Save Button
    updateSaveButton() {
        const btn = document.getElementById('saveStationBtn');
        const isSaved = this.currentStation && 
            this.savedStations.some(s => s.stationuuid === this.currentStation.stationuuid);
        
        btn.classList.toggle('saved', isSaved);
        btn.innerHTML = `<i class="bi bi-heart${isSaved ? '-fill' : ''}"></i>`;
    },
    
    // Render Saved Stations
    renderSavedStations() {
        const container = document.getElementById('savedList');
        
        if (this.savedStations.length === 0) {
            container.innerHTML = '<p class="saved-empty">Save your favorite stations by clicking the heart ❤️</p>';
            return;
        }
        
        container.innerHTML = this.savedStations.map(station => `
            <div class="saved-station-item" onclick="RadioApp.playStation(${JSON.stringify(station).replace(/"/g, '&quot;')})">
                <div class="city">${station.country}</div>
                <div class="name">${station.name}</div>
            </div>
        `).join('');
    },
    
    // Update Volume Icon
    updateVolumeIcon() {
        const icon = document.querySelector('.volume-icon');
        if (this.isMuted) {
            icon.classList.add('muted');
            icon.className = 'bi bi-volume-mute volume-icon muted';
        } else {
            icon.classList.remove('muted');
            icon.className = 'bi bi-volume-up volume-icon';
        }
    },
    
    // Show Message
    showMessage(msg) {
        // Simple toast-like notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 110px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(30, 30, 30, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 0.9rem;
            z-index: 200;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    RadioApp.init();
});
