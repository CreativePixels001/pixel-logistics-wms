// Trip Details Page JavaScript

// Use comprehensive trip database (loaded from trip-database.js)
const tripTemplates = typeof tripDatabase !== 'undefined' ? tripDatabase : {};


// Icon mapping for line icons
const iconMap = {
    'mountain': '<path d="M3 20h18L12 4 3 20z"/>',
    'tree': '<path d="M12 2L9 12h6l-3-10z"/><rect x="10" y="12" width="4" height="8"/>',
    'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    'droplet': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    'sun': '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    'coffee': '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
    'music': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    'map': '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    'camera': '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'
};

// Load trip details on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded, initializing trip details...');
    console.log('📚 Available trips:', Object.keys(tripTemplates));
    loadTripDetails();
});

async function loadTripDetails() {
    // Get trip data from localStorage or URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id');
    
    const storedRoute = localStorage.getItem('selectedRoute');
    let destination;
    
    if (storedRoute) {
        const routeData = JSON.parse(storedRoute);
        // Use the full title (e.g., "Delhi to Manali") to match database keys
        destination = routeData.title;
        console.log('🔍 Looking for trip:', destination);
    } else if (tripId) {
        destination = decodeURIComponent(tripId);
        console.log('🔍 Looking for trip from URL:', destination);
    } else {
        destination = 'Delhi to Manali'; // Default to first trip
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Check if government API is available and enabled
        const useAPI = typeof tourismAPI !== 'undefined' && 
                      typeof API_CONFIG !== 'undefined' && 
                      API_CONFIG.features?.useGovernmentAPI;
        
        if (useAPI) {
            // Try to fetch from government API first
            const apiData = await tourismAPI.getDestinationDetails(destination);
            
            if (apiData && apiData.source !== 'fallback') {
                console.log('✅ Loaded from Government API:', destination);
                
                // Transform API data to trip format
                const tripData = transformAPIToTrip(apiData, destination);
                populateTripData(tripData);
                hideLoading();
                return;
            }
        }
        
        // Use local database - try to find exact match
        console.log('📋 Searching local database for:', destination);
        console.log('📚 Available trips:', Object.keys(tripTemplates));
        
        let tripData = tripTemplates[destination];
        
        if (!tripData) {
            console.warn('⚠️ Trip not found:', destination);
            console.log('🔄 Using default trip');
            tripData = tripTemplates['Delhi to Manali'] || 
                      createDefaultTrip({ title: destination, to: destination });
        } else {
            console.log('✅ Found trip:', destination);
        }
        
        populateTripData(tripData);
        
    } catch (error) {
        console.error('❌ Error loading trip details:', error);
        
        // Fallback to templates
        const tripData = tripTemplates[destination] || 
                        tripTemplates['Delhi to Manali'];
        populateTripData(tripData);
    } finally {
        hideLoading();
    }
}

function showLoading() {
    // Show loading state in key areas
    const title = document.getElementById('tripTitle');
    const desc = document.getElementById('tripDescription');
    if (title) title.textContent = 'Loading...';
    if (desc) desc.textContent = 'Loading trip details...';
}

function hideLoading() {
    // Content will be populated by populateTripData
}

/**
 * Transform government API data to trip data format
 */
function transformAPIToTrip(apiData, destination) {
    return {
        title: apiData.name || `Road Trip to ${destination}`,
        route: apiData.route || destination,
        distance: apiData.distance || 'Varies',
        duration: apiData.duration || '3-5 days',
        category: apiData.category || 'Scenic',
        difficulty: apiData.difficulty || 'Moderate',
        bestTime: apiData.bestTime || 'Year Round',
        budget: apiData.budget || '₹15,000',
        description: apiData.description || `Explore ${destination} with our detailed travel guide.`,
        
        // Convert API highlights to our format
        highlights: (apiData.highlights || []).slice(0, 6).map(h => ({
            icon: h.icon || 'star',
            title: h.title || h.name || 'Attraction',
            desc: h.description || h.desc || ''
        })),
        
        // Generate itinerary from API data
        itinerary: apiData.itinerary || dataAdapter.generateItinerary(apiData),
        
        // Generate packing list
        packing: apiData.packing || dataAdapter.generatePackingList(apiData),
        
        // Generate amenities
        amenities: apiData.amenities || dataAdapter.generateAmenities(apiData),
        
        // Store API source info
        source: 'government-api',
        apiSource: apiData.apiSource || 'data.gov.in'
    };
}

function createDefaultTrip(routeData) {
    return {
        title: routeData.title || 'Amazing Road Trip',
        route: `${routeData.from} → ${routeData.to}`,
        distance: routeData.distance || '500 km',
        duration: routeData.duration || '3 days',
        category: routeData.category || 'Scenic',
        difficulty: 'Moderate',
        bestTime: 'All Year',
        budget: '₹15,000',
        description: `Embark on an unforgettable journey from ${routeData.from} to ${routeData.to}. This scenic route offers breathtaking views and memorable experiences.`,
        highlights: [
            { icon: 'map', title: 'Scenic Route', desc: 'Beautiful landscapes and winding roads' },
            { icon: 'camera', title: 'Photo Spots', desc: 'Instagram-worthy locations' },
            { icon: 'coffee', title: 'Local Cuisine', desc: 'Try regional specialties' },
            { icon: 'star', title: 'Cultural Sites', desc: 'Historic landmarks and temples' }
        ],
        itinerary: [
            { day: 1, title: 'Journey Begins', desc: 'Start your adventure with great enthusiasm!' },
            { day: 2, title: 'Explore & Enjoy', desc: 'Discover amazing places along the way.' },
            { day: 3, title: 'Return Journey', desc: 'Head back with wonderful memories.' }
        ],
        packing: [
            'Comfortable clothes',
            'Snacks & water',
            'Camera & charger',
            'First aid kit',
            'Sunglasses & sunscreen',
            'Valid ID & documents'
        ],
        amenities: [
            { icon: 'coffee', name: 'Restaurants' },
            { icon: 'zap', name: 'Fuel Stations' },
            { icon: 'home', name: 'Hotels' }
        ],
        travelTips: [
            { type: 'safety', title: 'Drive Safe', desc: 'Follow speed limits and take breaks every 2 hours.' },
            { type: 'fuel', title: 'Fuel Up', desc: 'Keep tank full and carry emergency fuel.' },
            { type: 'emergency', title: 'Emergency Contacts', desc: 'Save local emergency numbers: Police 100, Ambulance 108' }
        ],
        localInsights: [
            { icon: 'coffee', title: 'Local Food', desc: 'Try authentic local cuisine at roadside dhabas.' },
            { icon: 'home', title: 'Accommodation', desc: 'Book hotels in advance during peak season.' },
            { icon: 'map', title: 'Navigation', desc: 'Download offline maps for areas with poor network.' }
        ]
    };
}

function populateTripData(trip) {
    // Update data source badge
    updateDataSourceBadge(trip.source, trip.apiSource);
    
    // Set hero background image
    const heroSection = document.getElementById('tripHero');
    if (heroSection && trip.heroImage) {
        heroSection.style.backgroundImage = `url('${trip.heroImage}')`;
    }
    
    // Hero Section
    document.getElementById('tripTitle').textContent = trip.title;
    document.getElementById('tripRoute').textContent = trip.route;
    document.getElementById('tripDistance').textContent = trip.distance;
    document.getElementById('tripDuration').textContent = trip.duration;
    
    // Description
    document.getElementById('tripDescription').textContent = trip.description;
    
    // Highlights
    const highlightsContainer = document.getElementById('tripHighlights');
    highlightsContainer.innerHTML = trip.highlights.map(h => `
        <div class="highlight-item">
            <div class="highlight-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${iconMap[h.icon] || iconMap['star']}
                </svg>
            </div>
            <div class="highlight-text">
                <h4>${h.title}</h4>
                <p>${h.desc}</p>
            </div>
        </div>
    `).join('');
    
    // Itinerary
    const itineraryContainer = document.getElementById('tripItinerary');
    if (itineraryContainer && trip.itinerary) {
        itineraryContainer.innerHTML = trip.itinerary.map(item => `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-day">Day ${item.day}</div>
                <h3 class="timeline-title">${item.title}</h3>
                <p class="timeline-description">${item.desc}</p>
            </div>
        `).join('');
    }
    
    // Packing List
    const packingContainer = document.getElementById('packingList');
    if (packingContainer && trip.packing) {
        packingContainer.innerHTML = trip.packing.map(item => `
            <div class="packing-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${item}</span>
            </div>
        `).join('');
    }
    
    // Stats
    const bestTimeEl = document.getElementById('bestTime');
    const difficultyEl = document.getElementById('difficulty');
    const categoryEl = document.getElementById('category');
    const budgetEl = document.getElementById('budget');
    
    if (bestTimeEl) bestTimeEl.textContent = trip.bestTime || 'All Year';
    if (difficultyEl) difficultyEl.textContent = trip.difficulty || 'Moderate';
    if (categoryEl) categoryEl.textContent = trip.category || 'Adventure';
    if (budgetEl) budgetEl.textContent = trip.budget || '₹15,000';
    
    // Amenities
    const amenitiesContainer = document.getElementById('amenitiesList');
    if (amenitiesContainer && trip.amenities) {
        amenitiesContainer.innerHTML = trip.amenities.map(a => `
            <div class="amenity-item">
                <span class="amenity-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${iconMap[a.icon] || iconMap['star']}
                    </svg>
                </span>
                <span>${a.name}</span>
            </div>
        `).join('');
    }
    
    // Travel Tips
    const tipsContainer = document.getElementById('travelTips');
    if (tipsContainer && trip.travelTips) {
        const tipTypeIcons = {
            safety: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
            health: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
            permits: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
            weather: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
            fuel: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
            emergency: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
        };
        
        tipsContainer.innerHTML = trip.travelTips.map(tip => `
            <div class="tip-item tip-${tip.type}">
                <div class="tip-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${tipTypeIcons[tip.type] || tipTypeIcons['safety']}
                    </svg>
                </div>
                <div class="tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.desc}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Local Insights
    const insightsContainer = document.getElementById('localInsights');
    if (insightsContainer && trip.localInsights) {
        insightsContainer.innerHTML = trip.localInsights.map(insight => `
            <div class="insight-item">
                <div class="insight-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${iconMap[insight.icon] || iconMap['star']}
                    </svg>
                </div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.desc}</p>
                </div>
            </div>
        `).join('');
    }
}

function saveTrip() {
    alert('Trip saved to your dashboard!');
    // TODO: Implement actual save functionality
}

function startTrip() {
    // Redirect to dashboard or trip planner
    alert('Starting your trip planning...');
    window.location.href = 'dashboard.html';
}

/**
 * Update data source badge to show where data came from
 */
function updateDataSourceBadge(source, apiSource) {
    const badge = document.getElementById('dataSourceBadge');
    const text = document.getElementById('dataSourceText');
    
    if (!badge || !text) return;
    
    // Show badge if feature is enabled
    if (!API_CONFIG?.features?.showAPISource) {
        badge.style.display = 'none';
        return;
    }
    
    badge.style.display = 'flex';
    
    // Remove existing classes
    badge.classList.remove('government', 'cached', 'fallback');
    
    // Set badge based on source
    if (source === 'government-api') {
        badge.classList.add('government');
        text.textContent = `🏛️ ${apiSource || 'Government Data'}`;
    } else if (source === 'cache') {
        badge.classList.add('cached');
        text.textContent = '📦 Cached Data';
    } else {
        badge.classList.add('fallback');
        text.textContent = '📋 Template Data';
    }
}
