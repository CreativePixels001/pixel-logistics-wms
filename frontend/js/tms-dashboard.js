/* ===================================
   TMS Dashboard JavaScript
   Transportation Management System
   =================================== */

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeDashboard();
  loadShipmentData();
  startLiveUpdates();
});

// Dashboard Initialization
function initializeDashboard() {
  console.log('TMS Dashboard initialized');
  
  // Animate stat cards on load
  animateStatCards();
  
  // Initialize tooltips
  initializeTooltips();
  
  // Setup event listeners
  setupEventListeners();
}

// Animate Statistics Cards
function animateStatCards() {
  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach((stat, index) => {
    const targetValue = stat.textContent;
    const isPercent = targetValue.includes('%');
    const isCurrency = targetValue.includes('$');
    const isNumber = !isPercent && !isCurrency;
    
    // Extract numeric value
    let numValue = parseFloat(targetValue.replace(/[^0-9.]/g, ''));
    
    // Reset to 0
    stat.textContent = isPercent ? '0%' : isCurrency ? '$0' : '0';
    
    // Animate to target
    setTimeout(() => {
      animateValue(stat, 0, numValue, 1000, isPercent, isCurrency);
    }, index * 100);
  });
}

// Animate Number Value
function animateValue(element, start, end, duration, isPercent, isCurrency) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    
    let displayValue = Math.round(current * 10) / 10;
    
    if (isCurrency) {
      element.textContent = `$${displayValue.toFixed(1)}K`;
    } else if (isPercent) {
      element.textContent = `${displayValue.toFixed(1)}%`;
    } else {
      element.textContent = Math.round(displayValue);
    }
  }, 16);
}

// Load Shipment Data
function loadShipmentData() {
  // Simulate API call - replace with actual API
  setTimeout(() => {
    console.log('Shipment data loaded');
    updateShipmentProgress();
  }, 500);
}

// Update Shipment Progress Bars
function updateShipmentProgress() {
  const progressBars = document.querySelectorAll('.progress-fill');
  
  progressBars.forEach((bar, index) => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, index * 100);
  });
}

// Start Live Updates (simulated)
function startLiveUpdates() {
  // Update every 30 seconds
  setInterval(() => {
    updateLiveTracking();
  }, 30000);
}

// Update Live Tracking Status
function updateLiveTracking() {
  // Simulate real-time updates
  const statusIndicators = document.querySelectorAll('.status-indicator.online');
  
  statusIndicators.forEach(indicator => {
    indicator.style.opacity = '0.5';
    setTimeout(() => {
      indicator.style.opacity = '1';
    }, 200);
  });
  
  console.log('Live tracking updated');
}

// Initialize Tooltips
function initializeTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
  });
}

function showTooltip(e) {
  const text = e.target.getAttribute('data-tooltip');
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;
  document.body.appendChild(tooltip);
  
  const rect = e.target.getBoundingClientRect();
  tooltip.style.position = 'absolute';
  tooltip.style.left = rect.left + (rect.width / 2) + 'px';
  tooltip.style.top = rect.top - 40 + 'px';
  tooltip.style.transform = 'translateX(-50%)';
}

function hideTooltip() {
  const tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Track buttons
  const trackButtons = document.querySelectorAll('.btn-track');
  trackButtons.forEach(btn => {
    btn.addEventListener('click', handleTrackShipment);
  });
  
  // Carrier items
  const carrierItems = document.querySelectorAll('.carrier-item');
  carrierItems.forEach(item => {
    item.addEventListener('click', handleCarrierClick);
  });
  
  // Alert items
  const alertItems = document.querySelectorAll('.alert-item');
  alertItems.forEach(item => {
    item.addEventListener('click', handleAlertClick);
  });
}

// Handle Track Shipment
function handleTrackShipment(e) {
  const row = e.target.closest('tr');
  const shipmentId = row.querySelector('td').textContent;
  
  console.log(`Tracking shipment: ${shipmentId}`);
  
  // Show tracking modal
  showTrackingModal(shipmentId);
  
  e.preventDefault();
}

// Show Tracking Modal
function showTrackingModal(shipmentId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Live Tracking - ${shipmentId}</h2>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="tracking-map">
          <div class="map-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p>Real-time GPS tracking map would load here</p>
            <p class="map-note">Integrate Google Maps Platform or Mapbox</p>
          </div>
        </div>
        <div class="tracking-details">
          <h3>Shipment Timeline</h3>
          <div class="timeline">
            <div class="timeline-item completed">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <strong>Picked Up</strong>
                <p>Origin facility - Chicago, IL</p>
                <span class="timeline-time">2 hours ago</span>
              </div>
            </div>
            <div class="timeline-item active">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <strong>In Transit</strong>
                <p>Currently near Cleveland, OH</p>
                <span class="timeline-time">35 minutes ago</span>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <strong>Expected Delivery</strong>
                <p>Destination - New York, NY</p>
                <span class="timeline-time">In 4 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
}

// Handle Carrier Click
function handleCarrierClick(e) {
  const carrierName = e.currentTarget.querySelector('.carrier-name').textContent;
  console.log(`View carrier details: ${carrierName}`);
  
  // Navigate to carrier details page
  // window.location.href = `carrier-details.html?name=${encodeURIComponent(carrierName)}`;
}

// Handle Alert Click
function handleAlertClick(e) {
  const alertTitle = e.currentTarget.querySelector('.alert-title').textContent;
  console.log(`View alert: ${alertTitle}`);
  
  // Mark alert as read
  e.currentTarget.style.opacity = '0.6';
}

// Quick Shipment Modal (from dashboard header button)
function showQuickShipment() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Create New Shipment</h2>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <form class="shipment-form" onsubmit="handleShipmentSubmit(event)">
          <div class="form-row">
            <div class="form-group">
              <label for="origin">Origin</label>
              <input type="text" id="origin" placeholder="Enter pickup location" required>
            </div>
            <div class="form-group">
              <label for="destination">Destination</label>
              <input type="text" id="destination" placeholder="Enter delivery location" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="carrier">Select Carrier</label>
              <select id="carrier" required>
                <option value="">Choose a carrier</option>
                <option value="swift">Swift Freight LLC</option>
                <option value="national">National Express</option>
                <option value="rapid">Rapid Logistics</option>
                <option value="quick">QuickHaul Inc</option>
              </select>
            </div>
            <div class="form-group">
              <label for="pickup-date">Pickup Date</label>
              <input type="date" id="pickup-date" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="cargo-type">Cargo Type</label>
            <input type="text" id="cargo-type" placeholder="e.g., Electronics, Furniture, etc." required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="weight">Weight (lbs)</label>
              <input type="number" id="weight" placeholder="0" required>
            </div>
            <div class="form-group">
              <label for="value">Declared Value ($)</label>
              <input type="number" id="value" placeholder="0.00" step="0.01" required>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Create Shipment</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('pickup-date').setAttribute('min', today);
}

// Handle Shipment Form Submit
function handleShipmentSubmit(e) {
  e.preventDefault();
  
  const formData = {
    origin: document.getElementById('origin').value,
    destination: document.getElementById('destination').value,
    carrier: document.getElementById('carrier').value,
    pickupDate: document.getElementById('pickup-date').value,
    cargoType: document.getElementById('cargo-type').value,
    weight: document.getElementById('weight').value,
    value: document.getElementById('value').value
  };
  
  console.log('New shipment created:', formData);
  
  // Show success message
  showSuccessMessage('Shipment created successfully!');
  
  // Close modal
  closeModal();
  
  // Refresh dashboard (simulate)
  setTimeout(() => {
    location.reload();
  }, 1500);
}

// Show Success Message
function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification success';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Export Functions
window.showQuickShipment = showQuickShipment;
window.closeModal = closeModal;
window.handleShipmentSubmit = handleShipmentSubmit;

// Service Worker Registration (for PWA support)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.log('Service Worker registration failed'));
}

// Offline Detection
window.addEventListener('online', () => {
  showSuccessMessage('Connection restored');
});

window.addEventListener('offline', () => {
  showSuccessMessage('Working offline - changes will sync when online');
});
