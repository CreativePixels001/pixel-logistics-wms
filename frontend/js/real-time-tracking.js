/**
 * Real-Time Tracking Module
 * WebSocket-based live shipment tracking
 */

// WebSocket connection
let socket;
let currentShipmentId = null;
let locationHistory = [];
let isTracking = false;

// Configuration
const SOCKET_URL = 'http://localhost:3000';
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

/**
 * Initialize tracking page
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeWebSocket();
  // Auto-start demo with a sample shipment
  setTimeout(() => {
    startTracking('674a7f8e1c9d4b001f2e3456'); // Sample shipment ID
  }, 1000);
});

/**
 * Initialize WebSocket connection
 */
function initializeWebSocket() {
  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  // Connection established
  socket.on('connect', () => {
    console.log('WebSocket connected:', socket.id);
    updateConnectionStatus(true);
  });

  // Connection lost
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
    updateConnectionStatus(false);
  });

  // Tracking started confirmation
  socket.on('trackingStarted', (data) => {
    console.log('Tracking started:', data);
    showNotification('Real-time tracking activated', 'success');
  });

  // Location update received
  socket.on('locationUpdate', (data) => {
    console.log('Location update:', data);
    handleLocationUpdate(data);
  });

  // Status update received
  socket.on('statusUpdate', (data) => {
    console.log('Status update:', data);
    handleStatusUpdate(data);
  });

  // ETA update received
  socket.on('etaUpdate', (data) => {
    console.log('ETA update:', data);
    handleETAUpdate(data);
  });

  // Geofence alert received
  socket.on('geofenceAlert', (data) => {
    console.log('Geofence alert:', data);
    handleGeofenceAlert(data);
  });

  // Route deviation alert
  socket.on('routeDeviation', (data) => {
    console.warn('Route deviation:', data);
    handleRouteDeviation(data);
  });

  // Generic shipment update
  socket.on('shipmentUpdate', (data) => {
    console.log('Shipment update:', data);
  });

  // Alert received
  socket.on('alert', (data) => {
    console.log('Alert:', data);
    showNotification(data.alert.message, data.alert.severity || 'info');
  });

  // Tracking stopped
  socket.on('trackingStopped', (data) => {
    console.log('Tracking stopped:', data);
    isTracking = false;
  });

  // Error handling
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    updateConnectionStatus(false);
  });
}

/**
 * Start tracking a shipment
 */
function startTracking(shipmentId) {
  if (!socket || !socket.connected) {
    showNotification('WebSocket not connected. Retrying...', 'error');
    setTimeout(() => startTracking(shipmentId), 2000);
    return;
  }

  currentShipmentId = shipmentId;
  isTracking = true;
  locationHistory = [];

  // Update UI
  document.getElementById('currentShipment').textContent = `SHP-2025-${shipmentId.substr(-5)}`;

  // Subscribe to shipment tracking
  socket.emit('trackShipment', shipmentId);

  // Initialize map with route
  initializeMap();
}

/**
 * Stop tracking current shipment
 */
function stopTracking() {
  if (currentShipmentId && socket) {
    socket.emit('untrackShipment', currentShipmentId);
    isTracking = false;
    showNotification('Tracking stopped', 'info');
  }
}

/**
 * Handle location update
 */
function handleLocationUpdate(data) {
  const { location, shipmentId } = data;
  
  // Add to history
  locationHistory.push({
    latitude: location.latitude,
    longitude: location.longitude,
    speed: location.speed,
    heading: location.heading,
    timestamp: new Date(location.timestamp || Date.now())
  });

  // Update map marker
  updateVehiclePosition(location.latitude, location.longitude);

  // Update progress
  updateProgress();

  // Add to location updates list
  addLocationUpdate(location);
}

/**
 * Handle status update
 */
function handleStatusUpdate(data) {
  const { status, timestamp } = data;
  
  // Update timeline
  updateTimeline(status, timestamp);
  
  showNotification(`Status updated: ${status}`, 'info');
}

/**
 * Handle ETA update
 */
function handleETAUpdate(data) {
  const { newETA, reason } = data;
  
  const etaDate = new Date(newETA);
  const formattedETA = etaDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });
  
  showNotification(`ETA updated to ${formattedETA}${reason ? ': ' + reason : ''}`, 'warning');
}

/**
 * Handle geofence alert
 */
function handleGeofenceAlert(data) {
  const { zone, action } = data;
  
  const message = action === 'entered' 
    ? `Vehicle entered ${zone}` 
    : `Vehicle exited ${zone}`;
    
  showNotification(message, 'info');
}

/**
 * Handle route deviation
 */
function handleRouteDeviation(data) {
  const { deviationDistance, severity } = data;
  
  showNotification(
    `Route deviation detected: ${deviationDistance} miles off course`,
    severity === 'high' ? 'error' : 'warning'
  );
}

/**
 * Initialize map visualization
 */
function initializeMap() {
  const mapElements = document.getElementById('mapElements');
  mapElements.innerHTML = '';

  // Demo route coordinates
  const origin = { lat: 41.8781, lon: -87.6298, name: 'Chicago' }; // Chicago
  const destination = { lat: 40.7128, lon: -74.0060, name: 'New York' }; // New York

  // Convert to map coordinates
  const originPos = latLonToMapPos(origin.lat, origin.lon);
  const destPos = latLonToMapPos(destination.lat, destination.lon);

  // Draw route line
  const routeLine = document.createElement('div');
  routeLine.className = 'route-line';
  const angle = Math.atan2(destPos.y - originPos.y, destPos.x - originPos.x) * 180 / Math.PI;
  const length = Math.sqrt(Math.pow(destPos.x - originPos.x, 2) + Math.pow(destPos.y - originPos.y, 2));
  
  routeLine.style.left = originPos.x + 'px';
  routeLine.style.top = originPos.y + 'px';
  routeLine.style.width = length + 'px';
  routeLine.style.transform = `rotate(${angle}deg)`;
  mapElements.appendChild(routeLine);

  // Add origin marker
  const originMarker = document.createElement('div');
  originMarker.className = 'marker origin';
  originMarker.style.left = originPos.x + 'px';
  originMarker.style.top = originPos.y + 'px';
  originMarker.title = origin.name;
  mapElements.appendChild(originMarker);

  // Add destination marker
  const destMarker = document.createElement('div');
  destMarker.className = 'marker destination';
  destMarker.style.left = destPos.x + 'px';
  destMarker.style.top = destPos.y + 'px';
  destMarker.title = destination.name;
  mapElements.appendChild(destMarker);

  // Add vehicle marker (starts at origin)
  const vehicleMarker = document.createElement('div');
  vehicleMarker.id = 'vehicleMarker';
  vehicleMarker.className = 'marker vehicle';
  vehicleMarker.style.left = originPos.x + 'px';
  vehicleMarker.style.top = originPos.y + 'px';
  vehicleMarker.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="margin: 8px;"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>';
  mapElements.appendChild(vehicleMarker);
}

/**
 * Convert lat/lon to map pixel coordinates
 */
function latLonToMapPos(lat, lon) {
  // Simplified projection for demo (not accurate)
  const map = document.getElementById('trackingMap');
  const bounds = map.getBoundingClientRect();
  
  // Demo bounds: roughly US map
  const minLat = 25;
  const maxLat = 50;
  const minLon = -125;
  const maxLon = -65;
  
  const x = ((lon - minLon) / (maxLon - minLon)) * bounds.width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * bounds.height;
  
  return { x, y };
}

/**
 * Update vehicle marker position
 */
function updateVehiclePosition(lat, lon) {
  const vehicleMarker = document.getElementById('vehicleMarker');
  if (!vehicleMarker) return;

  const pos = latLonToMapPos(lat, lon);
  
  vehicleMarker.style.left = pos.x + 'px';
  vehicleMarker.style.top = pos.y + 'px';
}

/**
 * Update progress indicators
 */
function updateProgress() {
  if (locationHistory.length === 0) return;

  // Demo calculation - in production use actual route data
  const progress = Math.min(100, locationHistory.length * 5); // 5% per update
  
  document.getElementById('progressPercent').textContent = progress + '%';
  document.getElementById('progressFill').style.width = progress + '%';
  
  const totalDistance = 790; // Chicago to NYC approx
  const traveled = Math.round(totalDistance * (progress / 100));
  const remaining = totalDistance - traveled;
  
  document.getElementById('distanceTraveled').textContent = traveled;
  document.getElementById('distanceRemaining').textContent = remaining;
}

/**
 * Add location update to list
 */
function addLocationUpdate(location) {
  const container = document.getElementById('locationUpdates');
  const updateCount = document.getElementById('updateCount');
  
  // Create new update item
  const item = document.createElement('div');
  item.className = 'location-item';
  
  const time = new Date(location.timestamp).toLocaleTimeString();
  const coords = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  const speed = location.speed ? `${Math.round(location.speed)} mph` : 'N/A';
  
  item.innerHTML = `
    <div>
      <div style="font-weight: 500;">${coords}</div>
      <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Speed: ${speed}</div>
    </div>
    <div style="text-align: right; font-size: 0.875rem; color: var(--color-text-secondary);">
      ${time}
    </div>
  `;
  
  // Add to top of list
  if (container.firstChild && container.firstChild.textContent.includes('Waiting')) {
    container.innerHTML = '';
  }
  container.insertBefore(item, container.firstChild);
  
  // Keep only last 10 updates
  while (container.children.length > 10) {
    container.removeChild(container.lastChild);
  }
  
  // Update count
  updateCount.textContent = `${locationHistory.length} updates`;
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected) {
  const statusElement = document.getElementById('connectionStatus');
  const dot = statusElement.querySelector('.status-dot');
  const text = statusElement.querySelector('span');
  
  if (connected) {
    statusElement.className = 'connection-status connected';
    dot.className = 'status-dot active';
    text.textContent = 'Connected';
  } else {
    statusElement.className = 'connection-status disconnected';
    dot.className = 'status-dot';
    text.textContent = 'Disconnected';
  }
}

/**
 * Update status timeline
 */
function updateTimeline(status, timestamp) {
  // This would update the timeline based on actual status changes
  console.log('Timeline update:', status, timestamp);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // You can integrate with your existing notification system
  // For now, just log to console
}

/**
 * Simulate tracking (for demo)
 */
function simulateTracking() {
  if (!currentShipmentId) {
    showNotification('No shipment selected', 'error');
    return;
  }

  // Call API to start simulation
  fetch(`http://localhost:3000/api/v1/tms/tracking/${currentShipmentId}/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      duration: 60 // 60 seconds simulation
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showNotification('Demo tracking simulation started (60 seconds)', 'success');
    } else {
      showNotification('Failed to start simulation', 'error');
    }
  })
  .catch(error => {
    console.error('Simulation error:', error);
    showNotification('Failed to start simulation', 'error');
  });
}

/**
 * Select shipment dialog
 */
function selectShipment() {
  const shipmentId = prompt('Enter Shipment ID:', currentShipmentId || '674a7f8e1c9d4b001f2e3456');
  
  if (shipmentId) {
    if (currentShipmentId) {
      stopTracking();
    }
    setTimeout(() => {
      startTracking(shipmentId);
    }, 500);
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (socket) {
    stopTracking();
    socket.disconnect();
  }
});
