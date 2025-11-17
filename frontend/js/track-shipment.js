// Track Shipment - Google Maps with Moving Trucks

let map;
let markers = [];
let activeMarker = null;
let trafficLayer;

// Sample shipment data with routes
const shipments = [
  {
    id: 'ORD-2024-001',
    customer: 'Tech Solutions Inc.',
    status: 'in-transit',
    driver: 'John Smith',
    vehicle: 'TRK-4521',
    origin: { lat: 28.6139, lng: 77.2090, name: 'Delhi Warehouse' },
    destination: { lat: 28.7041, lng: 77.1025, name: 'Rohini Distribution Center' },
    currentLocation: { lat: 28.6562, lng: 77.1548 },
    eta: '2:30 PM',
    progress: 65,
    weight: '2,450 kg',
    items: 24,
    timeline: [
      { title: 'Package Picked Up', time: '10:00 AM', location: 'Delhi Warehouse', completed: true },
      { title: 'In Transit', time: '11:30 AM', location: 'On Route NH-44', completed: true, active: true },
      { title: 'Out for Delivery', time: 'Expected 2:00 PM', location: 'Rohini Area', completed: false },
      { title: 'Delivered', time: 'Expected 2:30 PM', location: 'Rohini Distribution Center', completed: false }
    ]
  },
  {
    id: 'ORD-2024-002',
    customer: 'Global Traders Ltd.',
    status: 'scheduled',
    driver: 'Sarah Johnson',
    vehicle: 'TRK-3389',
    origin: { lat: 28.5355, lng: 77.3910, name: 'Noida Warehouse' },
    destination: { lat: 28.4595, lng: 77.0266, name: 'Gurgaon Hub' },
    currentLocation: { lat: 28.5355, lng: 77.3910 },
    eta: '4:00 PM',
    progress: 15,
    weight: '1,850 kg',
    items: 18,
    timeline: [
      { title: 'Package Ready', time: '1:00 PM', location: 'Noida Warehouse', completed: true },
      { title: 'Pickup Scheduled', time: '2:00 PM', location: 'Noida Warehouse', completed: false, active: true },
      { title: 'In Transit', time: 'Expected 2:30 PM', location: 'On Route', completed: false },
      { title: 'Delivered', time: 'Expected 4:00 PM', location: 'Gurgaon Hub', completed: false }
    ]
  },
  {
    id: 'ORD-2024-003',
    customer: 'Metro Supplies Co.',
    status: 'in-transit',
    driver: 'Mike Brown',
    vehicle: 'TRK-5672',
    origin: { lat: 28.7041, lng: 77.1025, name: 'Rohini Distribution Center' },
    destination: { lat: 28.4089, lng: 77.3178, name: 'Faridabad Depot' },
    currentLocation: { lat: 28.5562, lng: 77.2095 },
    eta: '3:15 PM',
    progress: 45,
    weight: '3,120 kg',
    items: 32,
    timeline: [
      { title: 'Package Picked Up', time: '9:30 AM', location: 'Rohini Distribution Center', completed: true },
      { title: 'In Transit', time: '10:45 AM', location: 'On Route NH-44', completed: true, active: true },
      { title: 'Out for Delivery', time: 'Expected 2:45 PM', location: 'Faridabad Area', completed: false },
      { title: 'Delivered', time: 'Expected 3:15 PM', location: 'Faridabad Depot', completed: false }
    ]
  },
  {
    id: 'ORD-2024-004',
    customer: 'Express Logistics',
    status: 'in-transit',
    driver: 'David Wilson',
    vehicle: 'TRK-2198',
    origin: { lat: 28.4595, lng: 77.0266, name: 'Gurgaon Hub' },
    destination: { lat: 28.6692, lng: 77.4538, name: 'Ghaziabad Center' },
    currentLocation: { lat: 28.6129, lng: 77.2295 },
    eta: '5:00 PM',
    progress: 55,
    weight: '2,890 kg',
    items: 28,
    timeline: [
      { title: 'Package Picked Up', time: '11:00 AM', location: 'Gurgaon Hub', completed: true },
      { title: 'In Transit', time: '12:15 PM', location: 'On Route NH-24', completed: true, active: true },
      { title: 'Out for Delivery', time: 'Expected 4:30 PM', location: 'Ghaziabad Area', completed: false },
      { title: 'Delivered', time: 'Expected 5:00 PM', location: 'Ghaziabad Center', completed: false }
    ]
  },
  {
    id: 'ORD-2024-005',
    customer: 'Quick Ship Services',
    status: 'delivered',
    driver: 'Emily Davis',
    vehicle: 'TRK-7734',
    origin: { lat: 28.6139, lng: 77.2090, name: 'Delhi Warehouse' },
    destination: { lat: 28.5355, lng: 77.3910, name: 'Noida Warehouse' },
    currentLocation: { lat: 28.5355, lng: 77.3910 },
    eta: 'Delivered',
    progress: 100,
    weight: '1,450 kg',
    items: 15,
    timeline: [
      { title: 'Package Picked Up', time: '8:00 AM', location: 'Delhi Warehouse', completed: true },
      { title: 'In Transit', time: '9:15 AM', location: 'On Route', completed: true },
      { title: 'Out for Delivery', time: '10:30 AM', location: 'Noida Area', completed: true },
      { title: 'Delivered', time: '11:00 AM', location: 'Noida Warehouse', completed: true }
    ]
  }
];

// Black and White map style - High contrast monochrome
const darkMapStyle = [
  // Make everything pure black by default
  { elementType: "geometry", stylers: [{ color: "#000000" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }, { weight: 0.5 }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }, { weight: 2 }] },
  
  // Administrative boundaries in dark gray
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#1a1a1a" }]
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "administrative.province",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cccccc" }]
  },
  
  // Hide POI icons and mute labels
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  
  // Parks in very dark gray (barely visible)
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0a0a0a" }]
  },
  
  // Roads in grayscale - from dark to light based on importance
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2a2a2a" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a1a" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#3a3a3a" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#4a4a4a" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2a2a2a" }]
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#5a5a5a" }]
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#222222" }]
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#aaaaaa" }]
  },
  
  // Transit in dark gray
  {
    featureType: "transit",
    stylers: [{ visibility: "simplified" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1a1a1a" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#888888" }]
  },
  
  // Water in pure black (blends with background)
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#444444" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#000000" }]
  }
];

// Initialize map
function initMap() {
  // Center on Delhi NCR region
  const center = { lat: 28.6139, lng: 77.2090 };
  
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: center,
    styles: darkMapStyle,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  });

  // Initialize traffic layer
  trafficLayer = new google.maps.TrafficLayer();

  // Render order cards
  renderOrderCards();

  // Add markers for all shipments
  shipments.forEach((shipment, index) => {
    addShipmentMarker(shipment, index);
  });

  // Start animation for in-transit shipments
  animateShipments();
}

// Render order cards in left panel
function renderOrderCards() {
  const ordersList = document.getElementById('ordersList');
  const shipmentCount = document.getElementById('shipmentCount');
  
  shipmentCount.textContent = shipments.length;
  
  ordersList.innerHTML = shipments.map((shipment, index) => `
    <div class="order-card" data-index="${index}" onclick="selectOrder(${index})">
      <div class="order-card-header">
        <span class="order-id">${shipment.id}</span>
        <span class="order-status ${shipment.status}">${shipment.status.replace('-', ' ')}</span>
      </div>
      <div class="order-card-body">
        <div class="order-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span><strong>${shipment.customer}</strong></span>
        </div>
        <div class="order-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Driver: ${shipment.driver}</span>
        </div>
        <div class="order-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <span>${shipment.vehicle} • ${shipment.weight}</span>
        </div>
      </div>
      <div class="order-card-footer">
        <div class="eta-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>ETA: ${shipment.eta}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${shipment.progress}%"></div>
        </div>
      </div>
    </div>
  `).join('');
}

// Add marker for shipment
function addShipmentMarker(shipment, index) {
  const marker = new google.maps.Marker({
    position: shipment.currentLocation,
    map: map,
    icon: {
      url: 'assets/Images/truck-top-view.png',
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20)
    },
    title: shipment.id,
    animation: google.maps.Animation.DROP
  });

  marker.addListener('click', () => {
    selectOrder(index);
  });

  markers.push({ marker, shipment, index });
}

// Select order and show details
function selectOrder(index) {
  const shipment = shipments[index];
  
  // Highlight card
  document.querySelectorAll('.order-card').forEach(card => card.classList.remove('active'));
  document.querySelector(`[data-index="${index}"]`).classList.add('active');

  // Center map on marker
  map.panTo(shipment.currentLocation);
  map.setZoom(13);

  // Show side panel with details
  showShipmentDetails(shipment);
}

// Show shipment details in side panel
function showShipmentDetails(shipment) {
  const sidePanel = document.getElementById('sidePanel');
  const content = document.getElementById('sidePanelContent');

  content.innerHTML = `
    <div class="detail-section">
      <h4>Shipment Information</h4>
      <div class="detail-row">
        <span class="detail-label">Order ID</span>
        <span class="detail-value">${shipment.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Customer</span>
        <span class="detail-value">${shipment.customer}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value">
          <span class="order-status ${shipment.status}">${shipment.status.replace('-', ' ')}</span>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">ETA</span>
        <span class="detail-value">${shipment.eta}</span>
      </div>
    </div>

    <div class="detail-section">
      <h4>Vehicle Information</h4>
      <div class="detail-row">
        <span class="detail-label">Driver</span>
        <span class="detail-value">${shipment.driver}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Vehicle ID</span>
        <span class="detail-value">${shipment.vehicle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Weight</span>
        <span class="detail-value">${shipment.weight}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Items</span>
        <span class="detail-value">${shipment.items} packages</span>
      </div>
    </div>

    <div class="detail-section">
      <h4>Route</h4>
      <div class="detail-row">
        <span class="detail-label">From</span>
        <span class="detail-value">${shipment.origin.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">To</span>
        <span class="detail-value">${shipment.destination.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Progress</span>
        <span class="detail-value">${shipment.progress}%</span>
      </div>
    </div>

    <div class="detail-section">
      <h4>Tracking History</h4>
      <div class="timeline">
        ${shipment.timeline.map(event => `
          <div class="timeline-item ${event.completed ? 'completed' : ''} ${event.active ? 'active' : ''}">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-title">${event.title}</div>
              <div class="timeline-time">${event.time}</div>
              <div class="timeline-location">${event.location}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  sidePanel.classList.add('open');
}

// Close side panel
function closeSidePanel() {
  document.getElementById('sidePanel').classList.remove('open');
  document.querySelectorAll('.order-card').forEach(card => card.classList.remove('active'));
}

// Center map on all markers
function centerMap() {
  const bounds = new google.maps.LatLngBounds();
  markers.forEach(({ marker }) => {
    bounds.extend(marker.getPosition());
  });
  map.fitBounds(bounds);
}

// Toggle traffic layer
let trafficVisible = false;
function toggleTraffic() {
  trafficVisible = !trafficVisible;
  trafficLayer.setMap(trafficVisible ? map : null);
}

// Animate shipments along their routes
function animateShipments() {
  setInterval(() => {
    shipments.forEach((shipment, index) => {
      if (shipment.status === 'in-transit') {
        // Simulate movement towards destination
        const currentLat = shipment.currentLocation.lat;
        const currentLng = shipment.currentLocation.lng;
        const destLat = shipment.destination.lat;
        const destLng = shipment.destination.lng;

        // Move 0.1% towards destination
        const newLat = currentLat + (destLat - currentLat) * 0.001;
        const newLng = currentLng + (destLng - currentLng) * 0.001;

        shipment.currentLocation = { lat: newLat, lng: newLng };
        
        // Update marker position
        if (markers[index]) {
          markers[index].marker.setPosition(shipment.currentLocation);
        }

        // Update progress
        shipment.progress = Math.min(shipment.progress + 0.1, 99);
      }
    });
  }, 3000); // Update every 3 seconds
}

// Search functionality
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  document.querySelectorAll('.order-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(searchTerm) ? 'block' : 'none';
  });
});

// Initialize on load
window.initMap = initMap;
