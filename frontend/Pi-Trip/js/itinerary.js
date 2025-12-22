// ===================================
// Itinerary Creation Page
// ===================================

// State Management
let itineraryState = {
    currentLocation: null,
    destination: null,
    waypoints: [],
    selectedAmenities: [],
    tripType: 'solo',
    groupMembers: [],
    routeData: null
};

// Indian Cities Database
const indianCities = [
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
    { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
    { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
    { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
    { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
    { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
    { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
    { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
    { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lng: 77.4538 },
    { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
    { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
    { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
    { name: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178 },
    { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064 },
    { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022 },
    { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
    { name: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973 },
    { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
    { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
    { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
    { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
    { name: 'Mangalore', state: 'Karnataka', lat: 12.9141, lng: 74.8560 },
    { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
    { name: 'Manali', state: 'Himachal Pradesh', lat: 32.2432, lng: 77.1892 },
    { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
    { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676 },
    { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
    { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
    { name: 'Goa', state: 'Goa', lat: 15.2993, lng: 74.1240 },
    { name: 'Darjeeling', state: 'West Bengal', lat: 27.0410, lng: 88.2663 },
    { name: 'Ooty', state: 'Tamil Nadu', lat: 11.4102, lng: 76.6950 },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
    { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
    { name: 'Pondicherry', state: 'Puducherry', lat: 11.9416, lng: 79.8083 }
];

// Popular Destinations Data
const popularDestinations = [
    // Himachal Pradesh
    { id: 1, name: 'Manali', state: 'Himachal Pradesh', distance: 540, duration: 12, rating: '4.8', type: 'Hill Station', emoji: '🏔️' },
    { id: 2, name: 'Shimla', state: 'Himachal Pradesh', distance: 360, duration: 8, rating: '4.7', type: 'Hill Station', emoji: '🏔️' },
    { id: 3, name: 'Kasol', state: 'Himachal Pradesh', distance: 520, duration: 12, rating: '4.9', type: 'Mountain Village', emoji: '⛰️' },
    { id: 4, name: 'Dharamshala', state: 'Himachal Pradesh', distance: 480, duration: 10, rating: '4.8', type: 'Spiritual Hills', emoji: '🏔️' },
    { id: 5, name: 'Kullu', state: 'Himachal Pradesh', distance: 510, duration: 11, rating: '4.6', type: 'Valley', emoji: '🌄' },
    
    // Tamil Nadu
    { id: 6, name: 'Ooty', state: 'Tamil Nadu', distance: 2280, duration: 36, rating: '4.9', type: 'Hill Station', emoji: '🌿' },
    { id: 7, name: 'Kodaikanal', state: 'Tamil Nadu', distance: 2450, duration: 38, rating: '4.8', type: 'Hill Station', emoji: '🌲' },
    
    // Kerala
    { id: 8, name: 'Munnar', state: 'Kerala', distance: 2420, duration: 38, rating: '4.9', type: 'Tea Gardens', emoji: '🍃' },
    { id: 9, name: 'Alleppey', state: 'Kerala', distance: 2640, duration: 41, rating: '4.8', type: 'Backwaters', emoji: '🚣' },
    { id: 10, name: 'Wayanad', state: 'Kerala', distance: 2380, duration: 37, rating: '4.7', type: 'Wildlife', emoji: '🦌' },
    { id: 11, name: 'Kovalam', state: 'Kerala', distance: 2820, duration: 44, rating: '4.6', type: 'Beach', emoji: '🏖️' },
    { id: 12, name: 'Thekkady', state: 'Kerala', distance: 2510, duration: 39, rating: '4.7', type: 'Wildlife Sanctuary', emoji: '🐘' },
    
    // North East India
    { id: 13, name: 'Shillong', state: 'Meghalaya', distance: 1900, duration: 32, rating: '4.8', type: 'Scotland of East', emoji: '☁️' },
    { id: 14, name: 'Gangtok', state: 'Sikkim', distance: 1840, duration: 31, rating: '4.9', type: 'Mountain Capital', emoji: '🏔️' },
    { id: 15, name: 'Tawang', state: 'Arunachal Pradesh', distance: 2150, duration: 36, rating: '4.9', type: 'Monastery Town', emoji: '🙏' },
    { id: 16, name: 'Kaziranga', state: 'Assam', distance: 1720, duration: 29, rating: '4.8', type: 'National Park', emoji: '🦏' },
    { id: 17, name: 'Cherrapunji', state: 'Meghalaya', distance: 1950, duration: 33, rating: '4.7', type: 'Wettest Place', emoji: '🌧️' },
    { id: 18, name: 'Dawki', state: 'Meghalaya', distance: 2000, duration: 34, rating: '4.8', type: 'Crystal River', emoji: '💧' },
    
    // Other Popular Destinations
    { id: 19, name: 'Jaipur', state: 'Rajasthan', distance: 280, duration: 5, rating: '4.6', type: 'Pink City', emoji: '🏰' },
    { id: 20, name: 'Udaipur', state: 'Rajasthan', distance: 650, duration: 11, rating: '4.9', type: 'Lake City', emoji: '🏰' },
    { id: 21, name: 'Rishikesh', state: 'Uttarakhand', distance: 240, duration: 5, rating: '4.7', type: 'Yoga Capital', emoji: '🧘' },
    { id: 22, name: 'Agra', state: 'Uttar Pradesh', distance: 230, duration: 4, rating: '4.5', type: 'Taj Mahal', emoji: '🕌' },
    { id: 23, name: 'Goa', state: 'Goa', distance: 1880, duration: 28, rating: '4.8', type: 'Beach Paradise', emoji: '🏝️' }
];

// Amenities along routes
const routeAmenities = {
    food: [
        { id: 'r1', name: 'Highway Dhaba', location: 'NH-44, 120 km', rating: '4.3', verified: true },
        { id: 'r2', name: 'Midway Restaurant', location: 'NH-8, 85 km', rating: '4.5', verified: true },
        { id: 'r3', name: 'Traveler\'s Stop', location: 'NH-48, 200 km', rating: '4.2', verified: false }
    ],
    fuel: [
        { id: 'f1', name: 'Indian Oil Pump', location: 'NH-44, 95 km', rating: '4.4', verified: true },
        { id: 'f2', name: 'HP Petrol Pump', location: 'NH-8, 150 km', rating: '4.6', verified: true },
        { id: 'f3', name: 'Bharat Petroleum', location: 'NH-48, 180 km', rating: '4.3', verified: true }
    ],
    toilet: [
        { id: 't1', name: 'Highway Rest Stop', location: 'NH-44, 100 km', rating: '4.2', verified: true },
        { id: 't2', name: 'Clean Toilets', location: 'NH-8, 140 km', rating: '4.5', verified: true }
    ],
    garage: [
        { id: 'g1', name: 'Bike Service Center', location: 'NH-44, 110 km', rating: '4.4', verified: true },
        { id: 'g2', name: 'Auto Repairs', location: 'NH-8, 160 km', rating: '4.2', verified: false }
    ],
    hospital: [
        { id: 'h1', name: 'Emergency Medical', location: 'NH-44, 130 km', rating: '4.6', verified: true },
        { id: 'h2', name: 'City Hospital', location: 'NH-8, 170 km', rating: '4.5', verified: true }
    ],
    safety: [
        { id: 's1', name: 'Police Checkpost', location: 'NH-44, 90 km', rating: '4.3', verified: true },
        { id: 's2', name: 'Highway Patrol', location: 'NH-8, 145 km', rating: '4.4', verified: true }
    ]
};

// ===================================
// Initialize
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Itinerary page loaded');
    
    // Check for pre-filled route from featured trips
    checkForFeaturedRoute();
    
    // Auto-detect location on load
    detectLocation();
    
    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;
    
    // Listen for start date changes to update end date minimum
    document.getElementById('startDate').addEventListener('change', (e) => {
        document.getElementById('endDate').min = e.target.value;
        updatePreviewDetails();
    });
    
    document.getElementById('endDate').addEventListener('change', updatePreviewDetails);
    document.getElementById('itineraryTitle').addEventListener('input', updatePreviewDetails);
    document.getElementById('itineraryDescription').addEventListener('input', updatePreviewDetails);
});

// ===================================
// Check for Featured Route Data
// ===================================

function checkForFeaturedRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const isFromFeatured = urlParams.get('route') === 'featured';
    
    if (isFromFeatured) {
        const routeData = localStorage.getItem('selectedRoute');
        if (routeData) {
            try {
                const route = JSON.parse(routeData);
                
                // Pre-fill starting location
                itineraryState.currentLocation = {
                    lat: 28.6139, // Default to approximate location
                    lng: 77.2090,
                    formatted: route.from
                };
                document.getElementById('currentLocation').value = route.from;
                updatePreviewLocation();
                document.getElementById('btnProceedDestination').disabled = false;
                
                // Auto-show destination section
                setTimeout(() => {
                    proceedToDestination();
                    
                    // Pre-fill destination
                    setTimeout(() => {
                        // Create destination object
                        const destination = {
                            id: Date.now(),
                            name: route.to.split(',')[0],
                            state: route.to.split(',')[1]?.trim() || 'India',
                            distance: route.distance,
                            duration: route.duration,
                            rating: '4.8',
                            category: route.category
                        };
                        
                        itineraryState.destination = destination;
                        document.getElementById('selectedDestination').innerHTML = `
                            <div class="destination-card">
                                <div class="destination-header">
                                    <div>
                                        <h4>${destination.name}</h4>
                                        <p>${destination.state}</p>
                                    </div>
                                    <button class="btn-remove" onclick="removeDestination()">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                <div class="destination-stats">
                                    <span>${destination.distance} km</span>
                                    <span>${destination.duration} hrs</span>
                                    <span>⭐ ${destination.rating}</span>
                                </div>
                            </div>
                        `;
                        document.getElementById('selectedDestination').style.display = 'block';
                        const continueBtn = document.getElementById('destinationContinueBtn');
                        if (continueBtn) continueBtn.style.display = 'flex';
                        updatePreviewDestination();
                        
                        // Show destination on map
                        showDestinationOnMap(destination);
                        
                        // Show notification
                        showNotification(`Route loaded: ${route.from} → ${route.to}`, 'success');
                        
                        // Clear the stored route
                        localStorage.removeItem('selectedRoute');
                    }, 300);
                }, 500);
                
            } catch (e) {
                console.error('Error loading featured route:', e);
            }
        }
    }
}


// ===================================
// Progressive Form Reveal
// ===================================

function showSection(sectionId) {
    // Hide all sections first
    const allSections = document.querySelectorAll('.question-step');
    allSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'flex';
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
    }
}

function updateStepIndicator(currentStep) {
    const indicator = document.querySelector('.step-indicator');
    if (indicator) {
        indicator.textContent = `${currentStep}/6`;
    }
}

function proceedToWaypoints() {
    showSection('section-waypoints');
    showNotification('Step 3: Add waypoints (optional)', 'info');
}

function skipWaypoints() {
    proceedToAmenities();
}

function proceedToAmenities() {
    showSection('section-amenities');
    showNotification('Step 4: Plan your amenities', 'info');
}

function skipAmenities() {
    proceedToTripType();
}

function proceedToTripType() {
    showSection('section-triptype');
    showNotification('Step 5: Choose trip type', 'info');
}

function proceedToDetails() {
    showSection('section-details');
    showNotification('Step 6: Add trip details', 'info');
}

// ===================================
// Step 1: Location Detection
// ===================================

function detectLocation() {
    const locationInput = document.getElementById('currentLocation');
    const btnConfirm = document.getElementById('btnConfirmLocation');
    locationInput.value = 'Detecting location...';
    btnConfirm.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Mock reverse geocoding (in real app, use Google Maps API)
                const location = {
                    name: 'Delhi, India',
                    lat: latitude,
                    lng: longitude,
                    formatted: 'Connaught Place, New Delhi, Delhi 110001'
                };
                
                itineraryState.currentLocation = location;
                locationInput.value = location.formatted;
                btnConfirm.disabled = false;
                
                showNotification('Location detected successfully!', 'success');
            },
            (error) => {
                console.error('Location error:', error);
                locationInput.value = 'Delhi, India (Default)';
                itineraryState.currentLocation = {
                    name: 'Delhi, India',
                    lat: 28.6139,
                    lng: 77.2090,
                    formatted: 'New Delhi, Delhi'
                };
                btnConfirm.disabled = false;
                showNotification('Using default location', 'info');
            }
        );
    } else {
        locationInput.value = 'Delhi, India (Default)';
        itineraryState.currentLocation = {
            name: 'Delhi, India',
            lat: 28.6139,
            lng: 77.2090,
            formatted: 'New Delhi, Delhi'
        };
        btnConfirm.disabled = false;
        showNotification('Geolocation not supported. Using default location.', 'info');
    }
}

function manualStartLocation() {
    const newLocation = prompt('Enter starting location:', itineraryState.currentLocation?.formatted || '');
    if (newLocation) {
        document.getElementById('currentLocation').value = newLocation;
        itineraryState.currentLocation = {
            name: newLocation,
            lat: 28.6139,
            lng: 77.2090,
            formatted: newLocation
        };
        document.getElementById('btnProceedDestination').disabled = false;
        updatePreviewLocation();
        showNotification('Location updated', 'success');
    }
}

// ===================================
// Step 2: Destination Search
// ===================================

function searchDestination(query) {
    console.log('searchDestination called with query:', query);
    const suggestionsDiv = document.getElementById('destinationSuggestions');
    console.log('Suggestions div found:', suggestionsDiv);
    
    if (!query || query.length < 1) {
        // Show all destinations when empty
        const allDestinations = popularDestinations.slice(0, 8);
        console.log('Showing all destinations:', allDestinations.length);
        renderDestinationCards(allDestinations, suggestionsDiv);
        suggestionsDiv.style.display = 'block';
        return;
    }
    
    // Filter destinations by query
    const filtered = popularDestinations.filter(dest => 
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        dest.state.toLowerCase().includes(query.toLowerCase()) ||
        dest.type.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log('Filtered destinations:', filtered.length);
    
    if (filtered.length === 0) {
        suggestionsDiv.innerHTML = `
            <div class="no-results" style="padding: 24px; text-align: center; color: rgba(255,255,255,0.5);">
                <p>No destinations found for "${query}"</p>
            </div>
        `;
        suggestionsDiv.style.display = 'block';
        return;
    }
    
    renderDestinationCards(filtered, suggestionsDiv);
    suggestionsDiv.style.display = 'block';
}

function renderDestinationCards(destinations, container) {
    console.log('Rendering cards for', destinations.length, 'destinations');
    container.innerHTML = destinations.map(dest => `
        <div class="destination-card-suggestion" onclick="selectDestination(${dest.id})">
            <div class="destination-card-content">
                <div class="destination-emoji">${dest.emoji}</div>
                <div class="destination-details">
                    <h4 class="destination-name">${dest.name}</h4>
                    <p class="destination-location">${dest.state}</p>
                    <span class="destination-type">${dest.type}</span>
                </div>
            </div>
            <div class="destination-meta">
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                    <span>${dest.distance} km</span>
                </div>
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${dest.duration}h</span>
                </div>
                <div class="meta-item">
                    <span class="rating-star">⭐</span>
                    <span>${dest.rating}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function selectDestination(id) {
    const destination = popularDestinations.find(d => d.id === id);
    if (!destination) return;
    
    itineraryState.destination = destination;
    
    console.log('Destination selected:', destination);
    
    // Hide destination section
    const destSection = document.getElementById('section-destination');
    if (destSection) {
        destSection.style.display = 'none';
    }
    
    // Show amenities section
    const amenitiesSection = document.getElementById('section-waypoints');
    if (amenitiesSection) {
        amenitiesSection.style.display = 'flex';
        
        // Update the section title and content for amenities
        setTimeout(() => {
            showAmenitiesSelection();
        }, 100);
    }
    
    // Update step indicator
    const indicator = document.querySelector('.step-indicator');
    if (indicator) {
        indicator.textContent = '3/6';
    }
    
    // Show notification
    showNotification(`${destination.emoji} ${destination.name} selected! Now choose your amenities.`, 'success');
}

function showAmenitiesSelection() {
    const amenitiesList = document.getElementById('amenitiesList');
    if (!amenitiesList) return;
    
    const amenities = [
        { id: 'food', name: 'Food & Dining', emoji: '🍽️', description: 'Restaurants, cafes, dhabas' },
        { id: 'fuel', name: 'Fuel Stations', emoji: '⛽', description: 'Petrol pumps, charging stations' },
        { id: 'toilet', name: 'Rest Stops', emoji: '🚻', description: 'Clean restrooms' },
        { id: 'hotel', name: 'Accommodation', emoji: '🏨', description: 'Hotels, resorts, homestays' },
        { id: 'hospital', name: 'Medical', emoji: '🏥', description: 'Hospitals, clinics, pharmacies' },
        { id: 'garage', name: 'Vehicle Service', emoji: '🔧', description: 'Garages, mechanics' },
        { id: 'atm', name: 'ATM & Banking', emoji: '🏧', description: 'Cash points, banks' },
        { id: 'scenic', name: 'Scenic Spots', emoji: '📸', description: 'Photo points, viewpoints' }
    ];
    
    if (!itineraryState.amenities) {
        itineraryState.amenities = [];
    }
    
    amenitiesList.innerHTML = amenities.map(amenity => `
        <div class="amenity-card ${itineraryState.amenities.includes(amenity.id) ? 'selected' : ''}" 
             onclick="toggleAmenity('${amenity.id}')" 
             id="amenity-${amenity.id}">
            <div class="amenity-emoji">${amenity.emoji}</div>
            <div class="amenity-content">
                <h4 class="amenity-name">${amenity.name}</h4>
                <p class="amenity-description">${amenity.description}</p>
            </div>
            <div class="amenity-check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        </div>
    `).join('');
}

function toggleAmenity(amenityId) {
    if (!itineraryState.amenities) {
        itineraryState.amenities = [];
    }
    
    const index = itineraryState.amenities.indexOf(amenityId);
    const card = document.getElementById(`amenity-${amenityId}`);
    
    if (index > -1) {
        // Remove amenity
        itineraryState.amenities.splice(index, 1);
        card.classList.remove('selected');
    } else {
        // Add amenity
        itineraryState.amenities.push(amenityId);
        card.classList.add('selected');
    }
    
    console.log('Selected amenities:', itineraryState.amenities);
}

function proceedToDates() {
    // Hide amenities section
    const amenitiesSection = document.getElementById('section-waypoints');
    if (amenitiesSection) {
        amenitiesSection.style.display = 'none';
    }
    
    // Show dates section
    const datesSection = document.getElementById('section-dates');
    if (datesSection) {
        datesSection.style.display = 'flex';
        
        // Generate calendar
        setTimeout(() => {
            generateCalendar();
        }, 100);
    }
    
    // Update step indicator
    const indicator = document.querySelector('.step-indicator');
    if (indicator) {
        indicator.textContent = '4/6';
    }
    
    const count = itineraryState.amenities?.length || 0;
    showNotification(`${count} amenities selected!`, 'success');
}

// Calendar state
let calendarState = {
    startDate: null,
    endDate: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
};

function generateCalendar() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const today = new Date();
    const currentDate = new Date(calendarState.currentYear, calendarState.currentMonth, 1);
    const firstDay = currentDate.getDay();
    const daysInMonth = new Date(calendarState.currentYear, calendarState.currentMonth + 1, 0).getDate();
    
    container.innerHTML = `
        <div class="calendar">
            <div class="calendar-header">
                <button class="calendar-nav" onclick="changeMonth(-1)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h3 class="calendar-title">${months[calendarState.currentMonth]} ${calendarState.currentYear}</h3>
                <button class="calendar-nav" onclick="changeMonth(1)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
            
            <div class="calendar-weekdays">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            
            <div class="calendar-days">
                ${generateDays(firstDay, daysInMonth, today)}
            </div>
        </div>
    `;
}

function generateDays(firstDay, daysInMonth, today) {
    let days = '';
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        days += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(calendarState.currentYear, calendarState.currentMonth, day);
        const dateStr = date.toISOString().split('T')[0];
        const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isSelected = (calendarState.startDate === dateStr) || (calendarState.endDate === dateStr);
        const isInRange = calendarState.startDate && calendarState.endDate && 
                         date >= new Date(calendarState.startDate) && 
                         date <= new Date(calendarState.endDate);
        
        let className = 'calendar-day';
        if (isPast) className += ' past';
        if (isSelected) className += ' selected';
        if (isInRange && !isSelected) className += ' in-range';
        
        days += `<div class="${className}" onclick="selectDate('${dateStr}')" data-date="${dateStr}">${day}</div>`;
    }
    
    return days;
}

function changeMonth(delta) {
    calendarState.currentMonth += delta;
    
    if (calendarState.currentMonth > 11) {
        calendarState.currentMonth = 0;
        calendarState.currentYear++;
    } else if (calendarState.currentMonth < 0) {
        calendarState.currentMonth = 11;
        calendarState.currentYear--;
    }
    
    generateCalendar();
}

function selectDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
        showNotification('Cannot select past dates', 'error');
        return;
    }
    
    if (!calendarState.startDate || (calendarState.startDate && calendarState.endDate)) {
        // Start new selection
        calendarState.startDate = dateStr;
        calendarState.endDate = null;
    } else if (calendarState.startDate && !calendarState.endDate) {
        // Complete the range
        if (date < new Date(calendarState.startDate)) {
            calendarState.endDate = calendarState.startDate;
            calendarState.startDate = dateStr;
        } else {
            calendarState.endDate = dateStr;
        }
        
        // Show continue button
        document.getElementById('btnConfirmDates').style.display = 'block';
    }
    
    // Update display
    updateSelectedDatesDisplay();
    generateCalendar();
}

function updateSelectedDatesDisplay() {
    const display = document.getElementById('selectedDatesDisplay');
    if (!display) return;
    
    if (calendarState.startDate && calendarState.endDate) {
        const start = new Date(calendarState.startDate);
        const end = new Date(calendarState.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        display.innerHTML = `
            <div class="dates-summary">
                <div class="date-badge">
                    <span class="date-label">Start</span>
                    <span class="date-value">${formatDate(start)}</span>
                </div>
                <div class="date-separator">→</div>
                <div class="date-badge">
                    <span class="date-label">End</span>
                    <span class="date-value">${formatDate(end)}</span>
                </div>
                <div class="date-duration">${days} ${days === 1 ? 'day' : 'days'}</div>
            </div>
        `;
        display.style.display = 'block';
        
        // Store in state
        itineraryState.startDate = calendarState.startDate;
        itineraryState.endDate = calendarState.endDate;
    } else if (calendarState.startDate) {
        display.innerHTML = `
            <div class="dates-summary">
                <div class="date-badge">
                    <span class="date-label">Start</span>
                    <span class="date-value">${formatDate(new Date(calendarState.startDate))}</span>
                </div>
                <div class="date-hint">Select end date</div>
            </div>
        `;
        display.style.display = 'block';
    }
}

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function proceedToFinal() {
    if (!calendarState.startDate || !calendarState.endDate) {
        showNotification('Please select start and end dates', 'error');
        return;
    }
    
    // Hide dates section
    const datesSection = document.getElementById('section-dates');
    if (datesSection) {
        datesSection.style.display = 'none';
    }
    
    // Show final details section
    const detailsSection = document.getElementById('section-details');
    if (detailsSection) {
        detailsSection.style.display = 'flex';
    }
    
    // Update step indicator
    const indicator = document.querySelector('.step-indicator');
    if (indicator) {
        indicator.textContent = '5/6';
    }
    
    showNotification('Dates confirmed!', 'success');
}


function removeDestination() {
    itineraryState.destination = null;
    document.getElementById('selectedDestination').style.display = 'none';
    document.getElementById('destinationActions').style.display = 'none';
    clearMapMarkers();
    
    // Hide preview destination
    document.getElementById('previewDestination').style.display = 'none';
}

// ===================================
// Step 3: Waypoints
// ===================================

let waypointCounter = 0;

function addWaypoint() {
    const location = prompt('Enter waypoint location:');
    if (!location) return;
    
    waypointCounter++;
    const waypoint = {
        id: waypointCounter,
        name: location,
        order: itineraryState.waypoints.length + 1
    };
    
    itineraryState.waypoints.push(waypoint);
    renderWaypoints();
    updateRouteStats();
    showNotification('Waypoint added!', 'success');
}

function renderWaypoints() {
    const waypointsList = document.getElementById('waypointsList');
    
    if (itineraryState.waypoints.length === 0) {
        waypointsList.innerHTML = '<p style="color: var(--gray-500); font-size: var(--font-size-sm);">No waypoints added yet</p>';
        return;
    }
    
    waypointsList.innerHTML = itineraryState.waypoints.map((waypoint, index) => `
        <div class="waypoint-item">
            <div class="waypoint-number">${index + 1}</div>
            <div class="waypoint-info">
                <h5>${waypoint.name}</h5>
                <p>Stop ${index + 1}</p>
            </div>
            <button class="btn-remove" onclick="removeWaypoint(${waypoint.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `).join('');
    
    // Update preview
    updatePreviewWaypoints();
    
    // Update map if destination is set
    if (itineraryState.destination) {
        renderWaypointsOnMap();
    }
}

function removeWaypoint(id) {
    itineraryState.waypoints = itineraryState.waypoints.filter(w => w.id !== id);
    renderWaypoints();
    updateRouteStats();
    
    // Update map
    if (itineraryState.destination) {
        renderWaypointsOnMap();
    }
    
    showNotification('Waypoint removed', 'info');
}

// ===================================
// Step 4: Amenities Selection
// ===================================

function toggleAmenity(type) {
    const chip = document.querySelector(`.amenity-chip[data-type="${type}"]`);
    const isSelected = chip.classList.contains('selected');
    
    if (isSelected) {
        chip.classList.remove('selected');
        itineraryState.selectedAmenities = itineraryState.selectedAmenities.filter(a => a.type !== type);
    } else {
        chip.classList.add('selected');
        
        // Add amenities of this type
        const amenities = routeAmenities[type] || [];
        amenities.forEach(amenity => {
            if (!itineraryState.selectedAmenities.find(a => a.id === amenity.id)) {
                itineraryState.selectedAmenities.push({ ...amenity, type });
            }
        });
    }
    
    renderSelectedAmenities();
    updatePreviewAmenities();
    
    // Update map if destination is set
    if (itineraryState.destination) {
        const startPos = { x: 20, y: 50 };
        const endPos = { x: 80, y: 40 };
        renderAmenitiesOnMap(startPos, endPos);
    }
}

function renderSelectedAmenities() {
    const selectedDiv = document.getElementById('selectedAmenities');
    
    if (itineraryState.selectedAmenities.length === 0) {
        selectedDiv.style.display = 'none';
        return;
    }
    
    // Group by type
    const grouped = itineraryState.selectedAmenities.reduce((acc, amenity) => {
        if (!acc[amenity.type]) acc[amenity.type] = [];
        acc[amenity.type].push(amenity);
        return acc;
    }, {});
    
    selectedDiv.innerHTML = Object.entries(grouped).map(([type, amenities]) => `
        <div style="margin-bottom: var(--spacing-md);">
            <h5 style="font-size: var(--font-size-sm); font-weight: 700; margin-bottom: var(--spacing-sm); text-transform: capitalize;">${type} (${amenities.length})</h5>
            ${amenities.map(amenity => `
                <div class="selected-amenity-item">
                    <div>
                        <h5>${amenity.name}</h5>
                        <p>${amenity.location} • ${amenity.rating} ⭐</p>
                    </div>
                    <button class="btn-remove" onclick="removeAmenity('${amenity.id}', '${type}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `).join('')}
        </div>
    `).join('');
    
    selectedDiv.style.display = 'block';
}

function removeAmenity(id, type) {
    itineraryState.selectedAmenities = itineraryState.selectedAmenities.filter(a => a.id !== id);
    
    // If no more amenities of this type, unselect chip
    const hasType = itineraryState.selectedAmenities.some(a => a.type === type);
    if (!hasType) {
        document.querySelector(`.amenity-chip[data-type="${type}"]`).classList.remove('selected');
    }
    
    renderSelectedAmenities();
    updatePreviewAmenities();
}

// ===================================
// Step 5: Trip Type Selection
// ===================================

function selectTripType(type) {
    itineraryState.tripType = type;
    
    // Update buttons
    document.querySelectorAll('.trip-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide group section
    const groupSection = document.getElementById('groupSection');
    if (type === 'group') {
        groupSection.style.display = 'block';
    } else {
        groupSection.style.display = 'none';
        itineraryState.groupMembers = [];
        renderGroupMembers();
    }
    
    updatePreviewTripType();
}

// ===================================
// Group Members Management
// ===================================

function addGroupMember() {
    const modal = document.getElementById('addMemberModal');
    modal.classList.add('active');
}

function closeAddMemberModal() {
    const modal = document.getElementById('addMemberModal');
    modal.classList.remove('active');
    
    // Reset form
    document.getElementById('memberName').value = '';
    document.getElementById('memberPhone').value = '';
}

function submitGroupMember(event) {
    event.preventDefault();
    
    const name = document.getElementById('memberName').value;
    const phone = document.getElementById('memberPhone').value;
    
    const member = {
        id: Date.now(),
        name,
        phone,
        avatar: name.charAt(0).toUpperCase()
    };
    
    itineraryState.groupMembers.push(member);
    renderGroupMembers();
    closeAddMemberModal();
    
    showNotification(`${name} added to trip!`, 'success');
}

function renderGroupMembers() {
    const membersList = document.getElementById('groupMembersList');
    
    if (itineraryState.groupMembers.length === 0) {
        membersList.innerHTML = '<p style="color: var(--gray-500); font-size: var(--font-size-sm);">No riders added yet</p>';
        return;
    }
    
    membersList.innerHTML = itineraryState.groupMembers.map(member => `
        <div class="group-member-card">
            <div class="member-avatar">${member.avatar}</div>
            <div class="member-info">
                <h5>${member.name}</h5>
                <p>${member.phone}</p>
            </div>
            <button class="btn-remove" onclick="removeGroupMember(${member.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `).join('');
    
    updatePreviewTripType();
}

function removeGroupMember(id) {
    itineraryState.groupMembers = itineraryState.groupMembers.filter(m => m.id !== id);
    renderGroupMembers();
    showNotification('Member removed', 'info');
}

function importFromContacts() {
    showNotification('Contact import feature coming soon!', 'info');
    // In real app, integrate with device contacts API
}

// ===================================
// Map Integration Functions
// ===================================

function showCurrentLocationOnMap(location) {
    const marker = document.getElementById('currentLocationMarker');
    marker.style.top = '50%';
    marker.style.left = '30%';
    marker.style.display = 'block';
}

function showDestinationOnMap(destination) {
    const mapContainer = document.getElementById('mapContainer');
    const placeholder = document.getElementById('mapPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    
    // Calculate positions based on destination distance
    const startPos = { x: 20, y: 50 }; // Left middle
    const endPos = { x: 80, y: 40 }; // Right middle-top
    
    // Show start marker (current location)
    const currentMarker = document.getElementById('currentLocationMarker');
    currentMarker.style.left = `${startPos.x}%`;
    currentMarker.style.top = `${startPos.y}%`;
    currentMarker.style.display = 'block';
    
    // Show destination marker
    const markersDiv = document.getElementById('mapMarkers');
    markersDiv.innerHTML = `
        <div class="map-marker start" style="top: ${startPos.y}%; left: ${startPos.x}%;" title="${itineraryState.currentLocation?.name || 'Start'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="8"></circle>
            </svg>
        </div>
        <div class="map-marker end" style="top: ${endPos.y}%; left: ${endPos.x}%;" title="${destination.name}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            </svg>
        </div>
    `;
    
    // Draw route line
    drawRouteLine(startPos, endPos);
    
    // Show waypoints if any
    renderWaypointsOnMap();
    
    // Show amenities on route
    renderAmenitiesOnMap(startPos, endPos);
    
    // Show destination info card
    const infoCard = document.getElementById('destinationInfoCard');
    infoCard.innerHTML = `
        <h4>${destination.name}</h4>
        <p>${destination.state} • ${destination.type}</p>
        <div class="card-stats">
            <div class="card-stat-item">
                <strong>${destination.distance} km</strong>
                <span>Distance</span>
            </div>
            <div class="card-stat-item">
                <strong>${destination.duration} hrs</strong>
                <span>Duration</span>
            </div>
            <div class="card-stat-item">
                <strong>${destination.rating}</strong>
                <span>Rating</span>
            </div>
        </div>
    `;
    infoCard.style.display = 'block';
}

function drawRouteLine(start, end) {
    const svg = document.getElementById('routeOverlay');
    
    // Calculate control points for curved path
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 10; // Curve upward
    
    // Create path with bezier curve
    const path = `M ${start.x}% ${start.y}% Q ${midX}% ${midY}%, ${end.x}% ${end.y}%`;
    
    svg.innerHTML = `
        <!-- Route shadow/glow -->
        <path d="${path}" 
              fill="none" 
              stroke="rgba(59, 130, 246, 0.3)" 
              stroke-width="8" 
              stroke-linecap="round"/>
        <!-- Main route line -->
        <path d="${path}" 
              fill="none" 
              stroke="#3b82f6" 
              stroke-width="4" 
              stroke-linecap="round"
              stroke-dasharray="10,5"
              class="route-line-animated"/>
    `;
}

function renderWaypointsOnMap() {
    if (itineraryState.waypoints.length === 0) return;
    
    const waypointMarkersDiv = document.getElementById('waypointMarkers');
    const startPos = { x: 20, y: 50 };
    const endPos = { x: 80, y: 40 };
    
    // Distribute waypoints along the route
    waypointMarkersDiv.innerHTML = itineraryState.waypoints.map((waypoint, index) => {
        const progress = (index + 1) / (itineraryState.waypoints.length + 1);
        const x = startPos.x + (endPos.x - startPos.x) * progress;
        const y = startPos.y + (endPos.y - startPos.y) * progress - 5; // Slightly above route
        
        return `
            <div class="map-marker waypoint" 
                 style="top: ${y}%; left: ${x}%;" 
                 title="${waypoint.name}">
                ${index + 1}
            </div>
        `;
    }).join('');
}

function renderAmenitiesOnMap(start, end) {
    if (itineraryState.selectedAmenities.length === 0) {
        document.getElementById('amenityMarkersMap').innerHTML = '';
        return;
    }
    
    const amenityMarkersDiv = document.getElementById('amenityMarkersMap');
    const iconMap = {
        food: 'R',
        fuel: 'F',
        toilet: 'T',
        garage: 'G',
        hospital: 'H',
        safety: 'S'
    };
    
    // Distribute amenities along route
    amenityMarkersDiv.innerHTML = itineraryState.selectedAmenities.map((amenity, index) => {
        const progress = (index + 0.5) / itineraryState.selectedAmenities.length;
        const x = start.x + (end.x - start.x) * progress;
        const y = start.y + (end.y - start.y) * progress + (index % 2 === 0 ? 8 : -8); // Alternate sides
        
        return `
            <div class="map-marker amenity" 
                 data-type="${amenity.type}"
                 style="top: ${y}%; left: ${x}%;" 
                 title="${amenity.name}">
                ${iconMap[amenity.type] || '?'}
            </div>
        `;
    }).join('');
}

function clearMapMarkers() {
    document.getElementById('mapMarkers').innerHTML = '';
    document.getElementById('waypointMarkers').innerHTML = '';
    document.getElementById('amenityMarkersMap').innerHTML = '';
    document.getElementById('routeOverlay').innerHTML = '';
    document.getElementById('currentLocationMarker').style.display = 'none';
    
    const placeholder = document.getElementById('mapPlaceholder');
    if (placeholder) placeholder.style.display = 'flex';
}

function updateRouteStats() {
    const totalDistance = document.getElementById('totalDistance');
    const totalDuration = document.getElementById('totalDuration');
    const totalStops = document.getElementById('totalStops');
    
    if (!totalDistance || !totalDuration || !totalStops) return; // Elements don't exist in new layout
    
    if (itineraryState.destination) {
        totalDistance.textContent = `${itineraryState.destination.distance} km`;
        totalDuration.textContent = `${itineraryState.destination.duration} hrs`;
        totalStops.textContent = itineraryState.waypoints.length;
    } else {
        totalDistance.textContent = '-- km';
        totalDuration.textContent = '-- hrs';
        totalStops.textContent = '0';
    }
}

function centerMap() {
    showNotification('Map centered', 'info');
}

function zoomIn() {
    showNotification('Zoomed in', 'info');
}

function zoomOut() {
    showNotification('Zoomed out', 'info');
}

// ===================================
// Create Itinerary
// ===================================

function createItinerary() {
    // Validate required fields
    if (!itineraryState.currentLocation) {
        showNotification('Please set starting location', 'error');
        return;
    }
    
    if (!itineraryState.destination) {
        showNotification('Please select a destination', 'error');
        return;
    }
    
    const title = document.getElementById('itineraryTitle').value;
    if (!title) {
        showNotification('Please enter trip title', 'error');
        return;
    }
    
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select trip dates', 'error');
        return;
    }
    
    // Create itinerary object
    const itinerary = {
        id: Date.now(),
        title,
        description: document.getElementById('itineraryDescription').value,
        startLocation: itineraryState.currentLocation,
        destination: itineraryState.destination,
        waypoints: itineraryState.waypoints,
        amenities: itineraryState.selectedAmenities,
        tripType: itineraryState.tripType,
        groupMembers: itineraryState.groupMembers,
        startDate,
        endDate,
        isPublic: document.getElementById('makePublic').checked,
        createdAt: new Date().toISOString(),
        stats: {
            likes: 0,
            comments: 0,
            followers: 0
        }
    };
    
    // Save to localStorage (in real app, save to database)
    const savedItineraries = JSON.parse(localStorage.getItem('itineraries') || '[]');
    savedItineraries.push(itinerary);
    localStorage.setItem('itineraries', JSON.stringify(savedItineraries));
    
    showNotification('Itinerary created successfully!', 'success');
    
    // Redirect to profile/itineraries page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'dashboard.html?tab=itineraries';
    }, 1500);
}

function saveDraft() {
    const draft = {
        ...itineraryState,
        title: document.getElementById('itineraryTitle').value,
        description: document.getElementById('itineraryDescription').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('itineraryDraft', JSON.stringify(draft));
    showNotification('Draft saved!', 'success');
}

function shareTrip() {
    const tripData = {
        location: itineraryState.currentLocation,
        destination: itineraryState.destination,
        waypoints: itineraryState.waypoints,
        amenities: itineraryState.selectedAmenities,
        tripType: itineraryState.tripType
    };
    
    // Create shareable link (you can implement proper sharing logic here)
    const shareText = `Check out my trip plan from ${tripData.location || 'my location'} to ${tripData.destination?.name || 'destination'}!`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'Pi-Trip Itinerary',
            text: shareText,
            url: window.location.href
        }).then(() => {
            showNotification('Trip shared successfully!', 'success');
        }).catch((error) => {
            console.log('Share failed:', error);
            copyToClipboard(shareText);
        });
    } else {
        // Fallback: copy to clipboard
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showNotification('Trip details copied to clipboard!', 'success');
}

// ===================================
// Utility Functions
// ===================================

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('piTripUser');
        sessionStorage.removeItem('piTripUser');
        showNotification('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '90px',
        right: '20px',
        padding: '1rem 1.5rem',
        background: type === 'success' ? '#000' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: '#fff',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: '9999',
        fontWeight: '600',
        fontSize: '0.875rem',
        maxWidth: '400px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

console.log('%c Pi-Trip Itinerary Creator', 'font-size: 20px; font-weight: bold; color: #000;');

// ===================================
// Live Preview Updates
// ===================================

function updatePreviewLocation() {
    const previewDiv = document.getElementById('previewLocation');
    const previewLocationText = document.getElementById('previewLocationText');
    const previewEmpty = document.querySelector('.preview-empty');
    
    if (!previewDiv || !previewLocationText) return; // Elements don't exist in new layout
    
    if (itineraryState.currentLocation) {
        previewLocationText.textContent = itineraryState.currentLocation.formatted;
        previewDiv.style.display = 'block';
        if (previewEmpty) previewEmpty.style.display = 'none';
    }
}

function updatePreviewDestination() {
    const previewDiv = document.getElementById('previewDestination');
    const dest = itineraryState.destination;
    
    if (dest) {
        document.getElementById('previewDestinationText').textContent = `${dest.name}, ${dest.state}`;
        
        const statsDiv = document.getElementById('previewDestinationStats');
        statsDiv.innerHTML = `
            <div class="preview-stat-item">
                <strong>${dest.distance} km</strong>
                <span>Distance</span>
            </div>
            <div class="preview-stat-item">
                <strong>${dest.duration} hrs</strong>
                <span>Duration</span>
            </div>
            <div class="preview-stat-item">
                <strong>${dest.rating}</strong>
                <span>Rating</span>
            </div>
        `;
        statsDiv.style.display = 'grid';
        previewDiv.style.display = 'block';
    }
}

function updatePreviewWaypoints() {
    const previewDiv = document.getElementById('previewWaypoints');
    const listDiv = document.getElementById('previewWaypointsList');
    
    if (itineraryState.waypoints.length > 0) {
        listDiv.innerHTML = itineraryState.waypoints.map((waypoint, index) => `
            <div class="preview-waypoint-item">
                <strong>Stop ${index + 1}:</strong> ${waypoint.name}
            </div>
        `).join('');
        previewDiv.style.display = 'block';
    } else {
        previewDiv.style.display = 'none';
    }
}

function updatePreviewAmenities() {
    const previewDiv = document.getElementById('previewAmenities');
    const listDiv = document.getElementById('previewAmenitiesList');
    
    if (itineraryState.selectedAmenities.length > 0) {
        // Group by type
        const grouped = itineraryState.selectedAmenities.reduce((acc, amenity) => {
            if (!acc[amenity.type]) acc[amenity.type] = [];
            acc[amenity.type].push(amenity);
            return acc;
        }, {});
        
        listDiv.innerHTML = Object.entries(grouped).map(([type, amenities]) => `
            <div class="preview-amenity-type">
                <strong style="text-transform: capitalize;">${type}:</strong> ${amenities.length} location${amenities.length > 1 ? 's' : ''}
            </div>
        `).join('');
        previewDiv.style.display = 'block';
    } else {
        previewDiv.style.display = 'none';
    }
}

function updatePreviewTripType() {
    const previewDiv = document.getElementById('previewTripType');
    const typeText = document.getElementById('previewTripTypeText');
    const membersDiv = document.getElementById('previewGroupMembers');
    
    if (!previewDiv || !typeText) return; // Elements don't exist in new layout
    
    typeText.textContent = itineraryState.tripType === 'solo' ? 'Solo Trip' : 'Group Trip';
    
    if (itineraryState.tripType === 'group' && itineraryState.groupMembers.length > 0) {
        membersDiv.innerHTML = itineraryState.groupMembers.map(member => `
            <div class="preview-member-item">
                <div class="preview-member-avatar">${member.avatar}</div>
                <div>
                    <strong>${member.name}</strong><br>
                    <span style="font-size: var(--font-size-xs); color: var(--gray-600);">${member.phone}</span>
                </div>
            </div>
        `).join('');
        membersDiv.style.display = 'block';
    } else {
        membersDiv.style.display = 'none';
    }
    
    previewDiv.style.display = 'block';
}

function updatePreviewDetails() {
    const previewDiv = document.getElementById('previewDetails');
    const titleInput = document.getElementById('itineraryTitle');
    const descriptionInput = document.getElementById('itineraryDescription');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const previewTitle = document.getElementById('previewTitle');
    const previewDescription = document.getElementById('previewDescription');
    const datesDiv = document.getElementById('previewDates');
    
    if (!previewDiv || !previewTitle || !previewDescription) return; // Elements don't exist in new layout
    
    const title = titleInput ? titleInput.value : '';
    const description = descriptionInput ? descriptionInput.value : '';
    const startDate = startDateInput ? startDateInput.value : '';
    const endDate = endDateInput ? endDateInput.value : '';
    
    if (title || description || startDate || endDate) {
        previewTitle.textContent = title || 'Untitled Trip';
        previewDescription.textContent = description || 'No description';
        
        if (datesDiv && (startDate || endDate)) {
            datesDiv.innerHTML = `
                ${startDate ? `<div><strong>Start:</strong> ${new Date(startDate).toLocaleDateString()}</div>` : ''}
                ${endDate ? `<div><strong>End:</strong> ${new Date(endDate).toLocaleDateString()}</div>` : ''}
            `;
        }
        
        previewDiv.style.display = 'block';
    }
}

// ===================================
// CONFIRM START LOCATION - FRESH
// ===================================

// Search locations as user types
function searchLocations(query) {
    const suggestionsDiv = document.getElementById('locationSuggestions');
    
    if (!query || query.trim().length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    // Filter cities based on query
    const searchTerm = query.toLowerCase();
    const matches = indianCities.filter(city => 
        city.name.toLowerCase().includes(searchTerm) || 
        city.state.toLowerCase().includes(searchTerm)
    ).slice(0, 8); // Show max 8 results
    
    if (matches.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    // Build suggestions HTML
    suggestionsDiv.innerHTML = matches.map(city => `
        <div class="suggestion-item" onclick="selectLocation('${city.name}', '${city.state}', ${city.lat}, ${city.lng})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div class="suggestion-text">
                <strong>${city.name}</strong>
                <span>${city.state}</span>
            </div>
        </div>
    `).join('');
    
    suggestionsDiv.style.display = 'block';
}

// Select a location from suggestions
function selectLocation(name, state, lat, lng) {
    const locationInput = document.getElementById('currentLocation');
    const suggestionsDiv = document.getElementById('locationSuggestions');
    
    // Set input value
    locationInput.value = `${name}, ${state}`;
    
    // Store in state
    itineraryState.currentLocation = {
        name: name,
        state: state,
        lat: lat,
        lng: lng,
        formatted: `${name}, ${state}`
    };
    
    // Hide suggestions
    suggestionsDiv.style.display = 'none';
}

// Close suggestions when clicking outside
document.addEventListener('click', function(e) {
    const suggestionsDiv = document.getElementById('locationSuggestions');
    const locationInput = document.getElementById('currentLocation');
    if (suggestionsDiv && locationInput && !e.target.closest('.input-wrapper')) {
        suggestionsDiv.style.display = 'none';
    }
});

function confirmStartLocation() {
    const locationInput = document.getElementById('currentLocation');
    const location = locationInput.value.trim();
    
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    // Store location in state
    itineraryState.currentLocation = {
        name: location,
        formatted: location
    };
    
    // Hide location section
    const locationSection = document.getElementById('section-location');
    if (locationSection) {
        locationSection.style.display = 'none';
    }
    
    // Show map panel
    const mapPanel = document.querySelector('.map-panel');
    if (mapPanel) {
        mapPanel.style.display = 'block';
    }
    
    // Show destination section
    const destSection = document.getElementById('section-destination');
    if (destSection) {
        destSection.style.display = 'flex';
        
        // Show default recommendations after a short delay
        setTimeout(() => {
            showDefaultDestinations();
        }, 300);
    }
    
    // Update step indicator
    const indicator = document.querySelector('.step-indicator');
    if (indicator) {
        indicator.textContent = '2/6';
    }
}

// Show default destination recommendations
function showDefaultDestinations() {
    const suggestionsDiv = document.getElementById('destinationSuggestions');
    if (!suggestionsDiv) return;
    
    const topDestinations = popularDestinations.slice(0, 8);
    renderDestinationCards(topDestinations, suggestionsDiv);
    suggestionsDiv.style.display = 'block';
}

// Setup destination search event listener
document.addEventListener('DOMContentLoaded', function() {
    const destInput = document.getElementById('destinationSearch');
    if (destInput) {
        destInput.addEventListener('input', function(e) {
            console.log('Input event:', e.target.value);
            searchDestination(e.target.value);
        });
        
        destInput.addEventListener('focus', function() {
            console.log('Input focused');
            const suggestionsDiv = document.getElementById('destinationSuggestions');
            if (suggestionsDiv && suggestionsDiv.innerHTML.trim() === '') {
                showDefaultDestinations();
            } else if (suggestionsDiv) {
                suggestionsDiv.style.display = 'block';
            }
        });
    }
});
