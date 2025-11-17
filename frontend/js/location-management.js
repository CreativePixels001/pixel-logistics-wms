// Location Management JavaScript

let selectedMissionId = null;
let zoomLevel = 1;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Location Management initialized');
  
  // Simulate real-time vehicle movements
  startVehicleAnimation();
  
  // Set up keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeInfoPanel();
    }
  });
});

// Mission Selection
function selectMission(missionId) {
  selectedMissionId = missionId;
  
  // Update UI - remove active class from all cards
  document.querySelectorAll('.mission-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Add active class to selected card
  event.currentTarget.classList.add('active');
  
  // Highlight corresponding vehicle on map
  highlightMissionRoute(missionId);
  
  console.log('Selected mission:', missionId);
}

// Highlight mission route on map
function highlightMissionRoute(missionId) {
  // Remove previous highlights
  document.querySelectorAll('.route-path').forEach(path => {
    path.style.strokeWidth = '2';
    path.style.opacity = '0.5';
  });
  
  // Highlight selected route
  const paths = document.querySelectorAll('.route-path');
  if (paths.length > 0) {
    const routeIndex = missionId.includes('345333478') ? 0 : 1;
    if (paths[routeIndex]) {
      paths[routeIndex].style.strokeWidth = '3';
      paths[routeIndex].style.opacity = '1';
    }
  }
}

// Vehicle Info Panel
function showVehicleInfo(vehicleId) {
  const panel = document.getElementById('infoPanel');
  const title = document.getElementById('infoTitle');
  
  // Set vehicle data
  title.textContent = vehicleId;
  
  // Show panel
  panel.classList.add('visible');
  
  // Prevent event bubbling
  event.stopPropagation();
}

function closeInfoPanel() {
  const panel = document.getElementById('infoPanel');
  panel.classList.remove('visible');
}

// Map Controls
function toggleLive() {
  const btn = event.currentTarget;
  btn.classList.toggle('active');
  
  if (btn.classList.contains('active')) {
    console.log('Live tracking enabled');
    startVehicleAnimation();
  } else {
    console.log('Live tracking disabled');
  }
}

function zoomIn() {
  zoomLevel = Math.min(zoomLevel + 0.1, 2);
  applyZoom();
}

function zoomOut() {
  zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
  applyZoom();
}

function applyZoom() {
  const grid = document.getElementById('warehouseGrid');
  grid.style.transform = `scale(${zoomLevel})`;
  grid.style.transformOrigin = 'top left';
  console.log('Zoom level:', zoomLevel);
}

function toggleFullscreen() {
  const mapCanvas = document.getElementById('mapCanvas');
  
  if (!document.fullscreenElement) {
    mapCanvas.requestFullscreen().catch(err => {
      console.log('Fullscreen error:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

// Animate vehicles moving along routes
function startVehicleAnimation() {
  const vehicles = document.querySelectorAll('.vehicle.moving');
  
  vehicles.forEach((vehicle, index) => {
    animateVehicle(vehicle, index);
  });
}

function animateVehicle(vehicle, index) {
  // Define different paths for each vehicle
  const paths = [
    // AGV-489 path
    [
      { x: 464, y: 520 },
      { x: 400, y: 480 },
      { x: 350, y: 450 },
      { x: 300, y: 400 },
      { x: 280, y: 350 },
      { x: 300, y: 300 },
      { x: 350, y: 250 },
      { x: 400, y: 200 },
      { x: 464, y: 180 }
    ],
    // AGV-571 path
    [
      { x: 573, y: 180 },
      { x: 620, y: 200 },
      { x: 680, y: 230 },
      { x: 720, y: 270 },
      { x: 750, y: 320 },
      { x: 720, y: 370 },
      { x: 680, y: 420 },
      { x: 620, y: 460 },
      { x: 573, y: 480 }
    ],
    // AGV-254 path
    [
      { x: 800, y: 520 },
      { x: 850, y: 500 },
      { x: 900, y: 470 },
      { x: 950, y: 430 },
      { x: 1000, y: 380 },
      { x: 1050, y: 330 },
      { x: 1000, y: 280 },
      { x: 950, y: 230 },
      { x: 900, y: 200 }
    ]
  ];
  
  let pathIndex = index % paths.length;
  let currentPath = paths[pathIndex];
  let step = 0;
  
  setInterval(() => {
    if (step >= currentPath.length) {
      step = 0;
    }
    
    const position = currentPath[step];
    vehicle.setAttribute('transform', `translate(${position.x}, ${position.y})`);
    
    step++;
  }, 2000); // Move every 2 seconds
}

// Zone Selection Handler
function selectZone(zoneName) {
  console.log('Selected zone:', zoneName);
  
  // Update UI - remove active class from all zone items
  document.querySelectorAll('.zone-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to selected zone item
  const zoneItems = document.querySelectorAll('.zone-item');
  zoneItems.forEach(item => {
    const zoneNameEl = item.querySelector('.zone-name');
    if (zoneNameEl && zoneNameEl.textContent.includes(zoneName)) {
      item.classList.add('active');
    }
  });
  
  // Prevent event bubbling to rack clicks
  if (event) event.stopPropagation();
}

// Location/Rack Click Handler
function showLocationInfo(locationId, evt) {
  console.log('Selected location:', locationId);
  
  // Prevent zone click from firing
  if (evt) {
    evt.stopPropagation();
  }
  
  // Show location details
  const panel = document.getElementById('infoPanel');
  const title = document.getElementById('infoTitle');
  
  title.textContent = 'Location: ' + locationId;
  
  // Sample data - would come from backend in production
  const locationData = generateLocationData(locationId);
  
  // Update panel content
  const panelHTML = `
    <div class="info-header">
      <div class="info-title">${locationId}</div>
      <button class="info-close" onclick="closeInfoPanel()">&times;</button>
    </div>
    <div class="info-section">
      <div class="info-label">Status</div>
      <div class="info-value">
        <span class="badge ${locationData.occupied ? 'badge-dark' : 'badge-light'}">
          ${locationData.occupied ? 'Occupied' : 'Empty'}
        </span>
      </div>
    </div>
    ${locationData.occupied ? `
    <div class="info-section">
      <div class="info-label">LPN</div>
      <div class="info-value">${locationData.lpn}</div>
    </div>
    <div class="info-section">
      <div class="info-label">SKU</div>
      <div class="info-value">${locationData.sku}</div>
    </div>
    <div class="info-section">
      <div class="info-label">Quantity</div>
      <div class="info-value">${locationData.quantity} units</div>
    </div>
    <div class="info-section">
      <div class="info-label">Last Activity</div>
      <div class="info-value">${locationData.lastActivity}</div>
    </div>
    <button class="btn btn-primary btn-block mt-md" onclick="relocateInventory('${locationId}')">Relocate</button>
    ` : `
    <div class="info-section">
      <div class="info-label">Dimensions</div>
      <div class="info-value">${locationData.dimensions}</div>
    </div>
    <div class="info-section">
      <div class="info-label">Capacity</div>
      <div class="info-value">${locationData.capacity}</div>
    </div>
    <button class="btn btn-primary btn-block mt-md" onclick="assignInventory('${locationId}')">Assign Location</button>
    `}
  `;
  
  panel.innerHTML = panelHTML;
  panel.classList.add('visible');
}

// Generate sample location data
function generateLocationData(locationId) {
  const occupied = !locationId.includes('03') && !locationId.includes('07') && !locationId.includes('10') && !locationId.includes('14');
  
  if (occupied) {
    return {
      occupied: true,
      lpn: 'LPN' + Math.floor(Math.random() * 1000000).toString().padStart(8, '0'),
      sku: 'SKU' + Math.floor(Math.random() * 100000).toString().padStart(6, '0'),
      quantity: Math.floor(Math.random() * 500) + 50,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString()
    };
  } else {
    return {
      occupied: false,
      dimensions: '1.2m x 1.0m x 2.5m',
      capacity: '1000 kg'
    };
  }
}

// Action handlers
function relocateInventory(locationId) {
  console.log('Relocate inventory from:', locationId);
  alert('Relocation task would be created for ' + locationId);
}

function assignInventory(locationId) {
  console.log('Assign inventory to:', locationId);
  alert('Assignment interface would open for ' + locationId);
}

// Legacy location handler
function selectLocation(locationId) {
  showLocationInfo(locationId, null);
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    
    const tabName = this.textContent.trim();
    console.log('Switched to tab:', tabName);
    
    // In real implementation, this would load different data
    if (tabName === 'Vehicles') {
      loadVehiclesView();
    } else if (tabName === 'Logs') {
      loadLogsView();
    }
  });
});

function loadVehiclesView() {
  console.log('Loading vehicles view...');
  // Implementation would show vehicle list instead of missions
}

function loadLogsView() {
  console.log('Loading logs view...');
  // Implementation would show activity logs
}

// Bin/Rack interactions
document.addEventListener('DOMContentLoaded', function() {
  const bins = document.querySelectorAll('.bin');
  
  bins.forEach(bin => {
    bin.addEventListener('click', function() {
      // Remove previous selection
      document.querySelectorAll('.bin').forEach(b => b.classList.remove('selected'));
      
      // Select this bin
      this.classList.add('selected');
      
      // Show bin details
      showBinDetails(this);
    });
  });
});

function showBinDetails(bin) {
  const panel = document.getElementById('infoPanel');
  const title = document.getElementById('infoTitle');
  
  // Determine bin status and details
  let status = 'Empty';
  if (bin.classList.contains('occupied')) {
    status = 'Occupied';
  } else if (bin.classList.contains('reserved')) {
    status = 'Reserved';
  }
  
  title.textContent = 'Location A-01-15-B';
  
  // Update panel HTML
  panel.innerHTML = `
    <div class="info-header">
      <div class="info-title">Location A-01-15-B</div>
      <button class="info-close" onclick="closeInfoPanel()">&times;</button>
    </div>
    <div class="info-section">
      <div class="info-label">Status</div>
      <div class="info-value">
        <span class="badge badge-${status === 'Occupied' ? 'primary' : status === 'Reserved' ? 'default' : 'outline'}">${status}</span>
      </div>
    </div>
    <div class="info-section">
      <div class="info-label">Zone</div>
      <div class="info-value">Picking Zone A-01</div>
    </div>
    ${status === 'Occupied' ? `
    <div class="info-section">
      <div class="info-label">Item</div>
      <div class="info-value">ITM-5678</div>
    </div>
    <div class="info-section">
      <div class="info-label">Description</div>
      <div class="info-value">Widget Assembly A</div>
    </div>
    <div class="info-section">
      <div class="info-label">Quantity</div>
      <div class="info-value">250 EA</div>
    </div>
    <div class="info-section">
      <div class="info-label">LPN</div>
      <div class="info-value">LPN-001284</div>
    </div>
    ` : ''}
    <div class="info-section">
      <div class="info-label">Capacity</div>
      <div class="info-value">500 kg / 2 pallets</div>
    </div>
    <div class="info-section">
      <div class="info-label">Last Activity</div>
      <div class="info-value">2 hours ago</div>
    </div>
    <button class="btn btn-primary btn-block mt-md">View History</button>
    ${status === 'Occupied' ? '<button class="btn btn-outline btn-block mt-sm">Create Replenishment</button>' : ''}
  `;
  
  panel.classList.add('visible');
}

// Search functionality (would be implemented with real data)
function searchLocations(query) {
  console.log('Searching for:', query);
  // Implementation would filter visible locations/vehicles
}

// Export map as image
function exportMap() {
  const svg = document.getElementById('warehouseGrid');
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  
  console.log('Exporting map...');
  // Implementation would convert SVG to PNG/PDF
}

// Real-time updates simulation
setInterval(() => {
  // Update mission progress
  const progressBars = document.querySelectorAll('.progress-bar');
  progressBars.forEach(bar => {
    let currentWidth = parseInt(bar.style.width) || 0;
    if (currentWidth < 100) {
      bar.style.width = (currentWidth + Math.random() * 2) + '%';
    }
  });
}, 5000);

// Notification system for location events
function showLocationNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type}`;
  notification.style.position = 'fixed';
  notification.style.top = '80px';
  notification.style.right = '20px';
  notification.style.zIndex = '10000';
  notification.style.minWidth = '300px';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Simulate location events
setInterval(() => {
  const events = [
    'AGV-489 arrived at location A-01-15-B',
    'Location B-02-08-A inventory updated',
    'New picking task assigned to Zone A-03',
    'Replenishment completed for location C-03-12-C'
  ];
  
  const randomEvent = events[Math.floor(Math.random() * events.length)];
  // Uncomment to show notifications
  // showLocationNotification(randomEvent, 'info');
}, 15000);

// Page-specific action handlers
function exportLocationData() {
  console.log('Exporting location data...');
  
  // Simulate data export
  const data = {
    timestamp: new Date().toISOString(),
    zones: ['RCV-A', 'PCK-A', 'PCK-B', 'STR-A', 'STR-B', 'SHP-A'],
    totalLocations: 1524,
    occupiedLocations: 1225,
    utilization: 87
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `warehouse-locations-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  showLocationNotification('Location data exported successfully', 'success');
}

function printWarehouseMap() {
  console.log('Printing warehouse map...');
  
  // Hide UI elements before printing
  const controlsToHide = document.querySelectorAll('.map-controls, .info-panel, .operations-panel');
  controlsToHide.forEach(el => el.style.display = 'none');
  
  window.print();
  
  // Restore UI elements after printing
  setTimeout(() => {
    controlsToHide.forEach(el => el.style.display = '');
  }, 100);
  
  showLocationNotification('Print dialog opened', 'info');
}

function optimizeLocations() {
  console.log('Optimizing warehouse layout...');
  
  // Simulate optimization process
  showLocationNotification('Analyzing current layout...', 'info');
  
  setTimeout(() => {
    showLocationNotification('Optimization complete! Suggested 12 location changes to improve efficiency.', 'success');
    
    // Show optimization results in info panel
    const panel = document.getElementById('infoPanel');
    const optimizationHTML = `
      <div class="info-header">
        <div class="info-title">Layout Optimization</div>
        <button class="info-close" onclick="closeInfoPanel()">&times;</button>
      </div>
      <div class="info-section">
        <div class="info-label">Efficiency Gain</div>
        <div class="info-value">+8.3%</div>
      </div>
      <div class="info-section">
        <div class="info-label">Suggested Changes</div>
        <div class="info-value">12 relocations</div>
      </div>
      <div class="info-section">
        <div class="info-label">Estimated Time</div>
        <div class="info-value">2.5 hours</div>
      </div>
      <div class="info-section">
        <div class="info-label">Impact</div>
        <div class="info-value">
          <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
            <li>Reduce travel distance by 15%</li>
            <li>Balance zone utilization</li>
            <li>Improve fast-moving SKU access</li>
          </ul>
        </div>
      </div>
      <button class="btn btn-primary btn-block mt-md" onclick="applyOptimization()">Apply Changes</button>
      <button class="btn btn-secondary btn-block mt-xs" onclick="closeInfoPanel()">Cancel</button>
    `;
    
    panel.innerHTML = optimizationHTML;
    panel.classList.add('visible');
  }, 2000);
}

function applyOptimization() {
  console.log('Applying optimization...');
  showLocationNotification('Optimization changes queued for execution', 'success');
  closeInfoPanel();
}
