/* ===================================
   Pi-Trip - Map JavaScript
   Rider Amenities Map Functions
   ================================== */

// Category icons mapping
const categoryIcons = {
    toilet: 'T',
    garage: 'G',
    safety: 'S',
    fuel: 'F',
    food: 'R',
    hospital: 'H'
};

// Demo amenities data
const amenitiesData = [
    {
        id: 1,
        category: 'toilet',
        name: 'Dhaba Clean Restroom',
        location: 'NH-1, Murthal, Haryana',
        rating: 4.8,
        verified: true,
        distance: 2.5,
        note: 'Super clean, well-maintained. Free for customers! Has separate facilities for men and women.',
        lat: 30,
        lng: 40
    },
    {
        id: 2,
        category: 'garage',
        name: 'Royal Enfield Service Center',
        location: 'Manali-Leh Highway, Keylong',
        rating: 4.9,
        verified: true,
        distance: 5.2,
        note: 'Emergency repairs available 24/7. Spare parts in stock. Experienced mechanics for all bike models.',
        lat: 45,
        lng: 55
    },
    {
        id: 3,
        category: 'safety',
        name: 'Highway Police Check Post',
        location: 'NH-44, Srinagar Bypass',
        rating: 4.7,
        verified: true,
        distance: 8.1,
        note: 'Safe spot for rest. Friendly officers, free water available. Emergency assistance provided.',
        lat: 60,
        lng: 35
    },
    {
        id: 4,
        category: 'fuel',
        name: 'Indian Oil Pump',
        location: 'Mumbai-Goa Highway, Ratnagiri',
        rating: 4.6,
        verified: true,
        distance: 1.8,
        note: 'Clean toilets, small cafe, air pump available. Accepts digital payments.',
        lat: 25,
        lng: 70
    },
    {
        id: 5,
        category: 'food',
        name: 'Highway King Dhaba',
        location: 'NH-8, Neemrana, Rajasthan',
        rating: 4.9,
        verified: true,
        distance: 3.4,
        note: 'Best dal makhani! Safe parking for bikes. Rider-friendly staff. Great food at reasonable prices.',
        lat: 70,
        lng: 60
    },
    {
        id: 6,
        category: 'hospital',
        name: 'District Hospital',
        location: 'Leh Town, Ladakh',
        rating: 4.5,
        verified: true,
        distance: 6.7,
        note: '24/7 emergency. Altitude sickness treatment available. Well-equipped facility.',
        lat: 40,
        lng: 25
    }
];

let currentFilter = 'all';
let selectedAmenityId = null;

// ===================================
// Initialize Map
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Map initialized with', amenitiesData.length, 'amenities');
    renderAmenities();
    updateCategoryCounts();
});

// ===================================
// Render Amenities List
// ===================================

function renderAmenities() {
    const amenityList = document.getElementById('amenityList');
    amenityList.innerHTML = '';
    
    amenitiesData.forEach(amenity => {
        const icon = categoryIcons[amenity.category] || '?';
        const amenityHTML = `
            <div class="amenity-item" data-category="${amenity.category}" data-id="${amenity.id}" onclick="selectAmenity(${amenity.id})">
                <div class="amenity-icon ${amenity.category}">${icon}</div>
                <div class="amenity-details">
                    <h4>${amenity.name}</h4>
                    <p class="amenity-location">${amenity.location}</p>
                    <div class="amenity-meta">
                        <span class="rating">${amenity.rating}</span>
                        <span class="verified">${amenity.verified ? 'Verified' : ''}</span>
                        <span class="distance">${amenity.distance} km</span>
                    </div>
                </div>
            </div>
        `;
        amenityList.innerHTML += amenityHTML;
    });
}

// ===================================
// Toggle Filters
// ===================================

function toggleFilters() {
    const filters = document.getElementById('categoryFilters');
    const btn = document.querySelector('.filter-toggle-btn');
    
    if (filters.style.display === 'none' || filters.style.display === '') {
        filters.style.display = 'block';
        btn.classList.add('active');
    } else {
        filters.style.display = 'none';
        btn.classList.remove('active');
    }
}

// ===================================
// Category Filtering
// ===================================

function filterByCategory(category) {
    currentFilter = category;
    
    // Update active filter button
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.category === category) {
            chip.classList.add('active');
        }
    });
    
    // Filter amenity items
    const amenityItems = document.querySelectorAll('.amenity-item');
    let visibleCount = 0;
    
    amenityItems.forEach(item => {
        const itemCategory = item.dataset.category;
        if (category === 'all' || itemCategory === category) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Filter map markers
    const markers = document.querySelectorAll('.map-marker');
    markers.forEach(marker => {
        const markerType = marker.dataset.type;
        if (category === 'all' || markerType === category) {
            marker.style.display = 'block';
        } else {
            marker.style.display = 'none';
        }
    });
    
    console.log(`Filtered to ${category}:`, visibleCount, 'amenities visible');
}

// ===================================
// Search Location
// ===================================

function searchLocation(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        // Show all amenities if search is empty
        document.querySelectorAll('.amenity-item').forEach(item => {
            if (currentFilter === 'all' || item.dataset.category === currentFilter) {
                item.style.display = 'flex';
            }
        });
        return;
    }
    
    // Filter amenities by search term
    const amenityItems = document.querySelectorAll('.amenity-item');
    let foundCount = 0;
    
    amenityItems.forEach(item => {
        const name = item.querySelector('h4').textContent.toLowerCase();
        const location = item.querySelector('.amenity-location').textContent.toLowerCase();
        
        const matches = name.includes(searchTerm) || location.includes(searchTerm);
        const categoryMatch = currentFilter === 'all' || item.dataset.category === currentFilter;
        
        if (matches && categoryMatch) {
            item.style.display = 'flex';
            foundCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    console.log(`Search "${query}":`, foundCount, 'results');
}

// ===================================
// Select Amenity
// ===================================

function selectAmenity(id) {
    selectedAmenityId = id;
    const amenity = amenitiesData.find(a => a.id === id);
    
    if (!amenity) return;
    
    // Update selected state in list
    document.querySelectorAll('.amenity-item').forEach(item => {
        item.classList.remove('selected');
        if (parseInt(item.dataset.id) === id) {
            item.classList.add('selected');
        }
    });
    
    // Show marker on map
    showMarkerOnMap(amenity);
    
    // Show details card
    showAmenityDetails(amenity);
    
    console.log('Selected amenity:', amenity.name);
}

// ===================================
// Show Marker on Map
// ===================================

function showMarkerOnMap(amenity) {
    const mapMarkers = document.getElementById('mapMarkers');
    const icon = categoryIcons[amenity.category] || '?';
    
    // Clear previous markers
    mapMarkers.innerHTML = '';
    
    // Add new marker
    const marker = `
        <div class="map-marker" style="top: ${amenity.lat}%; left: ${amenity.lng}%;" data-type="${amenity.category}">
            <span class="marker-icon">${icon}</span>
        </div>
    `;
    mapMarkers.innerHTML = marker;
    
    // Show current location marker
    const currentLocation = document.getElementById('currentLocation');
    if (currentLocation) {
        currentLocation.style.display = 'block';
    }
}

// ===================================
// Show Amenity Details Card
// ===================================

function showAmenityDetails(amenity) {
    const detailsCard = document.getElementById('amenityDetailsCard');
    const detailsContent = document.getElementById('amenityDetailsContent');
    
    const icon = categoryIcons[amenity.category] || '?';
    
    detailsContent.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
            <div class="amenity-icon ${amenity.category}" style="width: 56px; height: 56px; font-size: 1.5rem;">${icon}</div>
            <div style="flex: 1;">
                <h3>${amenity.name}</h3>
                <p class="detail-location">${amenity.location}</p>
            </div>
        </div>
        <div class="detail-meta">
            <div class="detail-meta-item">
                <strong>${amenity.rating}</strong>
                <span>Rating</span>
            </div>
            <div class="detail-meta-item">
                <strong>${amenity.distance} km</strong>
                <span>Distance</span>
            </div>
            <div class="detail-meta-item">
                <strong>${amenity.verified ? 'Yes' : 'No'}</strong>
                <span>Verified</span>
            </div>
        </div>
        <p class="detail-description">${amenity.note}</p>
    `;
    
    detailsCard.style.display = 'block';
}

// ===================================
// Close Amenity Details
// ===================================

function closeAmenityDetails() {
    const detailsCard = document.getElementById('amenityDetailsCard');
    detailsCard.style.display = 'none';
    
    // Clear map markers
    document.getElementById('mapMarkers').innerHTML = '';
    
    // Remove selected state
    document.querySelectorAll('.amenity-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    selectedAmenityId = null;
}

// ===================================
// Action Buttons
// ===================================

function bookRide() {
    if (!selectedAmenityId) return;
    const amenity = amenitiesData.find(a => a.id === selectedAmenityId);
    showNotification(`Booking ride to ${amenity.name}...`, 'info');
    // In real app, open booking flow
}

function shareWithFriend() {
    if (!selectedAmenityId) return;
    const amenity = amenitiesData.find(a => a.id === selectedAmenityId);
    
    if (navigator.share) {
        navigator.share({
            title: amenity.name,
            text: `Check out this amenity: ${amenity.name} at ${amenity.location}`,
            url: window.location.href
        }).then(() => {
            showNotification('Shared successfully!', 'success');
        }).catch(() => {
            copyToClipboard(amenity);
        });
    } else {
        copyToClipboard(amenity);
    }
}

function copyToClipboard(amenity) {
    const text = `${amenity.name} - ${amenity.location}`;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Link copied to clipboard!', 'success');
    });
}

function saveForLater() {
    if (!selectedAmenityId) return;
    const amenity = amenitiesData.find(a => a.id === selectedAmenityId);
    
    // Save to localStorage
    let saved = JSON.parse(localStorage.getItem('savedAmenities') || '[]');
    if (!saved.includes(selectedAmenityId)) {
        saved.push(selectedAmenityId);
        localStorage.setItem('savedAmenities', JSON.stringify(saved));
        showNotification(`${amenity.name} saved for later!`, 'success');
    } else {
        showNotification('Already saved!', 'info');
    }
}

// ===================================
// Map Controls
// ===================================

function centerMap() {
    console.log('Centering map');
    showNotification('Map centered 🗺️', 'info');
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Location:', position.coords.latitude, position.coords.longitude);
                showNotification('Location found! 📍', 'success');
            },
            (error) => {
                console.error('Location error:', error);
                showNotification('Could not get location', 'error');
            }
        );
    } else {
        showNotification('Geolocation not supported', 'error');
    }
}

function toggleFullscreen() {
    const mapView = document.getElementById('mapView');
    
    if (!document.fullscreenElement) {
        mapView.requestFullscreen().then(() => {
            showNotification('Fullscreen mode 🔲', 'info');
        }).catch((err) => {
            console.error('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// ===================================
// Add Amenity Modal
// ===================================

function openAddAmenity() {
    const modal = document.getElementById('addAmenityModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAddAmenity() {
    const modal = document.getElementById('addAmenityModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function submitAmenity(event) {
    event.preventDefault();
    
    const category = document.getElementById('amenityCategory').value;
    const name = document.getElementById('amenityName').value;
    const location = document.getElementById('amenityLocation').value;
    const rating = document.getElementById('amenityRating').value;
    const is24x7 = document.getElementById('amenity24x7').value;
    const note = document.getElementById('amenityNote').value;
    
    console.log('New amenity:', { category, name, location, rating, is24x7, note });
    
    showNotification('Amenity submitted for verification! 🙏', 'success');
    
    setTimeout(() => {
        closeAddAmenity();
        event.target.reset();
    }, 1000);
}

// ===================================
// Update Category Counts
// ===================================

function updateCategoryCounts() {
    const counts = {
        all: amenitiesData.length,
        toilet: amenitiesData.filter(a => a.category === 'toilet').length,
        garage: amenitiesData.filter(a => a.category === 'garage').length,
        safety: amenitiesData.filter(a => a.category === 'safety').length,
        fuel: amenitiesData.filter(a => a.category === 'fuel').length,
        food: amenitiesData.filter(a => a.category === 'food').length,
        hospital: amenitiesData.filter(a => a.category === 'hospital').length
    };
    
    // Update counts in UI (in real app, would fetch from API)
    console.log('Category counts:', counts);
}

// ===================================
// Logout
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

// ===================================
// Mobile Menu Toggle
// ===================================

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navActions = document.querySelector('.nav-actions');
    
    if (navMenu && navActions) {
        const isVisible = navMenu.style.display === 'flex';
        navMenu.style.display = isVisible ? 'none' : 'flex';
        navActions.style.display = isVisible ? 'none' : 'flex';
    }
}

// ===================================
// Notifications
// ===================================

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
        background: type === 'success' ? '#000' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6',
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

// ===================================
// Export Functions
// ===================================

window.filterByCategory = filterByCategory;
window.searchLocation = searchLocation;
window.selectAmenity = selectAmenity;
window.closeAmenityDetails = closeAmenityDetails;
window.bookRide = bookRide;
window.shareWithFriend = shareWithFriend;
window.saveForLater = saveForLater;
window.toggleFilters = toggleFilters;
window.centerMap = centerMap;
window.getCurrentLocation = getCurrentLocation;
window.toggleFullscreen = toggleFullscreen;
window.openAddAmenity = openAddAmenity;
window.closeAddAmenity = closeAddAmenity;
window.submitAmenity = submitAmenity;
window.logout = logout;
window.toggleMobileMenu = toggleMobileMenu;

console.log('%c Pi-Trip Amenities Map', 'font-size: 20px; font-weight: bold; color: #000;');
