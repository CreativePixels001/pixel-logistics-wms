// Track Shipment - Using Leaflet.js (No API key, No watermarks)

let map;
let markers = [];
let activeMarker = null;

// Sample shipment data - Major Indian Cities
const shipments = [
  {
    id: 'ORD-2024-001',
    customer: 'Tech Solutions Inc.',
    status: 'in-transit',
    driver: 'Rajesh Kumar',
    vehicle: 'MH-01-AB-1234',
    origin: {
      lat: 19.0760,
      lng: 72.8777,
      name: 'Mumbai Hub'
    },
    destination: {
      lat: 28.7041,
      lng: 77.1025,
      name: 'Delhi Distribution Center'
    },
    currentLocation: {
      lat: 23.2599,
      lng: 77.4126
    },
    eta: '6:30 PM',
    progress: 45,
    weight: '3,250 kg',
    items: 45,
    timeline: [
      { title: 'Package Picked Up', time: '6:00 AM', location: 'Mumbai Hub', completed: true },
      { title: 'In Transit', time: '8:30 AM', location: 'Crossing Madhya Pradesh', completed: true },
      { title: 'Rest Stop', time: '2:00 PM', location: 'Bhopal Check Point', completed: false },
      { title: 'Delivered', time: '6:30 PM', location: 'Delhi Distribution Center', completed: false }
    ]
  },
  {
    id: 'ORD-2024-002',
    customer: 'E-Commerce Global',
    status: 'in-transit',
    driver: 'Amit Singh',
    vehicle: 'KA-03-CD-5678',
    origin: {
      lat: 12.9716,
      lng: 77.5946,
      name: 'Bangalore Warehouse'
    },
    destination: {
      lat: 17.3850,
      lng: 78.4867,
      name: 'Hyderabad Depot'
    },
    currentLocation: {
      lat: 15.3173,
      lng: 78.0394
    },
    eta: '3:45 PM',
    progress: 62,
    weight: '2,890 kg',
    items: 38,
    timeline: [
      { title: 'Package Picked Up', time: '7:00 AM', location: 'Bangalore Warehouse', completed: true },
      { title: 'In Transit', time: '9:30 AM', location: 'Via Kolar', completed: true },
      { title: 'Out for Delivery', time: '3:00 PM', location: 'Approaching Hyderabad', completed: false },
      { title: 'Delivered', time: '3:45 PM', location: 'Hyderabad Depot', completed: false }
    ]
  },
  {
    id: 'ORD-2024-003',
    customer: 'Pharma Logistics Ltd.',
    status: 'in-transit',
    driver: 'Priya Sharma',
    vehicle: 'TN-09-EF-9012',
    origin: {
      lat: 13.0827,
      lng: 80.2707,
      name: 'Chennai Port'
    },
    destination: {
      lat: 12.9716,
      lng: 77.5946,
      name: 'Bangalore Tech Park'
    },
    currentLocation: {
      lat: 12.9165,
      lng: 79.1325
    },
    eta: '2:15 PM',
    progress: 71,
    weight: '1,650 kg',
    items: 28,
    timeline: [
      { title: 'Package Picked Up', time: '8:00 AM', location: 'Chennai Port', completed: true },
      { title: 'In Transit', time: '10:00 AM', location: 'Via Vellore', completed: true },
      { title: 'Out for Delivery', time: '1:45 PM', location: 'Entering Bangalore', completed: false },
      { title: 'Delivered', time: '2:15 PM', location: 'Bangalore Tech Park', completed: false }
    ]
  },
  {
    id: 'ORD-2024-004',
    customer: 'Manufacturing India',
    status: 'in-transit',
    driver: 'Suresh Patel',
    vehicle: 'WB-02-GH-3456',
    origin: {
      lat: 22.5726,
      lng: 88.3639,
      name: 'Kolkata Industrial Hub'
    },
    destination: {
      lat: 19.0760,
      lng: 72.8777,
      name: 'Mumbai Gateway'
    },
    currentLocation: {
      lat: 20.9374,
      lng: 80.9534
    },
    eta: '8:00 PM',
    progress: 38,
    weight: '4,120 kg',
    items: 52,
    timeline: [
      { title: 'Package Picked Up', time: '5:00 AM', location: 'Kolkata Industrial Hub', completed: true },
      { title: 'In Transit', time: '11:00 AM', location: 'Via Raipur', completed: true },
      { title: 'Rest Stop', time: '4:00 PM', location: 'Nagpur Junction', completed: false },
      { title: 'Delivered', time: '8:00 PM', location: 'Mumbai Gateway', completed: false }
    ]
  },
  {
    id: 'ORD-2024-005',
    customer: 'Retail Express',
    status: 'scheduled',
    driver: 'Vikram Desai',
    vehicle: 'MH-12-IJ-7890',
    origin: {
      lat: 18.5204,
      lng: 73.8567,
      name: 'Pune Logistics Center'
    },
    destination: {
      lat: 23.0225,
      lng: 72.5714,
      name: 'Ahmedabad Hub'
    },
    currentLocation: {
      lat: 18.5204,
      lng: 73.8567
    },
    eta: '5:30 PM',
    progress: 8,
    weight: '2,340 kg',
    items: 32,
    timeline: [
      { title: 'Order Confirmed', time: '10:00 AM', location: 'Pune Logistics Center', completed: true },
      { title: 'Loading in Progress', time: '2:00 PM', location: 'Pune Logistics Center', completed: false },
      { title: 'Scheduled Departure', time: '2:30 PM', location: 'Pune Logistics Center', completed: false },
      { title: 'Expected Delivery', time: '5:30 PM', location: 'Ahmedabad Hub', completed: false }
    ]
  },
  {
    id: 'ORD-2024-006',
    customer: 'Electronics Hub',
    status: 'in-transit',
    driver: 'Arjun Reddy',
    vehicle: 'TS-07-KL-2345',
    origin: {
      lat: 17.3850,
      lng: 78.4867,
      name: 'Hyderabad Tech Hub'
    },
    destination: {
      lat: 13.0827,
      lng: 80.2707,
      name: 'Chennai Manufacturing'
    },
    currentLocation: {
      lat: 15.8281,
      lng: 78.0373
    },
    eta: '4:20 PM',
    progress: 55,
    weight: '3,580 kg',
    items: 48,
    timeline: [
      { title: 'Package Picked Up', time: '8:30 AM', location: 'Hyderabad Tech Hub', completed: true },
      { title: 'In Transit', time: '11:00 AM', location: 'Via Nellore', completed: true },
      { title: 'Out for Delivery', time: '3:45 PM', location: 'Approaching Chennai', completed: false },
      { title: 'Delivered', time: '4:20 PM', location: 'Chennai Manufacturing', completed: false }
    ]
  },
  {
    id: 'ORD-2024-007',
    customer: 'Textile Industries',
    status: 'in-transit',
    driver: 'Lakshmi Menon',
    vehicle: 'KL-14-MN-6789',
    origin: {
      lat: 28.7041,
      lng: 77.1025,
      name: 'Delhi NCR Hub'
    },
    destination: {
      lat: 22.5726,
      lng: 88.3639,
      name: 'Kolkata Trade Center'
    },
    currentLocation: {
      lat: 25.5941,
      lng: 85.1376
    },
    eta: '7:45 PM',
    progress: 68,
    weight: '2,760 kg',
    items: 36,
    timeline: [
      { title: 'Package Picked Up', time: '6:00 AM', location: 'Delhi NCR Hub', completed: true },
      { title: 'In Transit', time: '1:00 PM', location: 'Crossing Patna', completed: true },
      { title: 'Out for Delivery', time: '7:00 PM', location: 'Near Kolkata', completed: false },
      { title: 'Delivered', time: '7:45 PM', location: 'Kolkata Trade Center', completed: false }
    ]
  },
  {
    id: 'ORD-2024-008',
    customer: 'Food Distribution Co.',
    status: 'delivered',
    driver: 'Mohammed Khan',
    vehicle: 'GJ-01-OP-4567',
    origin: {
      lat: 23.0225,
      lng: 72.5714,
      name: 'Ahmedabad Central'
    },
    destination: {
      lat: 19.0760,
      lng: 72.8777,
      name: 'Mumbai Warehouse'
    },
    currentLocation: {
      lat: 19.0760,
      lng: 72.8777
    },
    eta: '1:00 PM',
    progress: 100,
    weight: '1,890 kg',
    items: 25,
    timeline: [
      { title: 'Package Picked Up', time: '7:00 AM', location: 'Ahmedabad Central', completed: true },
      { title: 'In Transit', time: '9:30 AM', location: 'Via Surat', completed: true },
      { title: 'Out for Delivery', time: '12:30 PM', location: 'Mumbai Suburbs', completed: true },
      { title: 'Delivered', time: '1:00 PM', location: 'Mumbai Warehouse', completed: true }
    ]
  }
];

// Initialize map with Leaflet
function initMap() {
  // Center on India
  const center = [20.5937, 78.9629];
  
  // Create map with dark theme
  map = L.map('map', {
    center: center,
    zoom: 5,
    zoomControl: false, // We'll add custom controls
    attributionControl: false // Remove Leaflet attribution
  });

  // Add custom zoom control to bottom right
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);

  // Pure Black and White tile layer - Monochrome style
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    className: 'map-tiles'
  }).addTo(map);

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

// Add shipment marker to map
function addShipmentMarker(shipment, index) {
  // Create custom truck icon
  const truckIcon = L.icon({
    iconUrl: 'assets/Images/truck-top-view.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });

  // Create marker
  const marker = L.marker(
    [shipment.currentLocation.lat, shipment.currentLocation.lng],
    { icon: truckIcon }
  ).addTo(map);

  // Add click event
  marker.on('click', () => selectOrder(index));

  // Store reference
  markers[index] = {
    marker: marker,
    shipment: shipment
  };
}

// Select order - highlight card and show details
function selectOrder(index) {
  const shipment = shipments[index];
  
  // Remove active class from all cards
  document.querySelectorAll('.order-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Add active class to selected card
  const selectedCard = document.querySelector(`[data-index="${index}"]`);
  if (selectedCard) {
    selectedCard.classList.add('active');
  }

  // Center map on truck location
  map.setView([shipment.currentLocation.lat, shipment.currentLocation.lng], 13);

  // Show shipment details in side panel
  showShipmentDetails(shipment);
}

// Show shipment details in side panel
function showShipmentDetails(shipment) {
  const sidePanel = document.getElementById('sidePanel');
  const sidePanelContent = document.getElementById('sidePanelContent');
  
  sidePanelContent.innerHTML = `
    <div class="detail-section">
      <h4>Shipment Information</h4>
      <div class="detail-row">
        <span class="detail-label">Order ID:</span>
        <span class="detail-value">${shipment.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Customer:</span>
        <span class="detail-value">${shipment.customer}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value"><span class="order-status ${shipment.status}">${shipment.status.replace('-', ' ')}</span></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">ETA:</span>
        <span class="detail-value">${shipment.eta}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Progress:</span>
        <span class="detail-value">${shipment.progress}%</span>
      </div>
    </div>

    <div class="detail-section">
      <h4>Vehicle Information</h4>
      <div class="detail-row">
        <span class="detail-label">Driver:</span>
        <span class="detail-value">${shipment.driver}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Vehicle:</span>
        <span class="detail-value">${shipment.vehicle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Weight:</span>
        <span class="detail-value">${shipment.weight}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Items:</span>
        <span class="detail-value">${shipment.items} items</span>
      </div>
    </div>

    <div class="detail-section">
      <h4>Route</h4>
      <div class="detail-row">
        <span class="detail-label">From:</span>
        <span class="detail-value">${shipment.origin.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">To:</span>
        <span class="detail-value">${shipment.destination.name}</span>
      </div>
    </div>

    <div class="detail-section">
      <h4>Tracking History</h4>
      <div class="tracking-timeline">
        ${shipment.timeline.map(event => `
          <div class="timeline-item ${event.completed ? 'completed' : ''}">
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
  const sidePanel = document.getElementById('sidePanel');
  sidePanel.classList.remove('open');
  
  // Remove active class from all cards
  document.querySelectorAll('.order-card').forEach(card => {
    card.classList.remove('active');
  });
}

// Center map to show all shipments
function centerMap() {
  if (markers.length === 0) return;
  
  // Create bounds from all markers
  const group = L.featureGroup(markers.map(m => m.marker));
  map.fitBounds(group.getBounds().pad(0.1));
}

// Toggle traffic layer (simulated for Leaflet)
function toggleTraffic() {
  // Traffic layer not available in free Leaflet version
  // You could add a premium tile layer if needed
  alert('Traffic layer requires premium mapping service');
}

// Animate moving trucks
function animateShipments() {
  setInterval(() => {
    shipments.forEach((shipment, index) => {
      if (shipment.status === 'in-transit' && shipment.progress < 99) {
        // Calculate new position (move slightly towards destination)
        const currentLat = shipment.currentLocation.lat;
        const currentLng = shipment.currentLocation.lng;
        const destLat = shipment.destination.lat;
        const destLng = shipment.destination.lng;
        
        // Move 0.1% towards destination each update
        const newLat = currentLat + (destLat - currentLat) * 0.001;
        const newLng = currentLng + (destLng - currentLng) * 0.001;
        
        // Update shipment location
        shipment.currentLocation.lat = newLat;
        shipment.currentLocation.lng = newLng;
        
        // Update marker position
        if (markers[index]) {
          markers[index].marker.setLatLng([newLat, newLng]);
        }
        
        // Update progress
        shipment.progress = Math.min(shipment.progress + 0.1, 99);
      }
    });
  }, 3000); // Update every 3 seconds
}

// Search functionality
const searchInput = document.getElementById('searchOrders');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const orderCards = document.querySelectorAll('.order-card');
    
    orderCards.forEach(card => {
      const orderText = card.textContent.toLowerCase();
      if (orderText.includes(searchTerm)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}
