/**
 * Yard Management Module
 * Handles trailer tracking, yard locations, and detention management
 */

// Sample yard data
let yardData = [
  {
    id: 'TRL-001',
    trailerNumber: 'TRL-20241101',
    carrier: 'FedEx',
    status: 'at_dock',
    location: 'DOCK-01',
    type: 'Inbound',
    checkInTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    sealNumber: 'SEAL-789456',
    driverName: 'John Smith',
    detentionHours: 0,
    notes: 'Priority shipment'
  },
  {
    id: 'TRL-002',
    trailerNumber: 'TRL-20241102',
    carrier: 'UPS',
    status: 'in_yard',
    location: 'YARD-A1',
    type: 'Outbound',
    checkInTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    sealNumber: 'SEAL-123789',
    driverName: 'Mike Johnson',
    detentionHours: 0,
    notes: ''
  },
  {
    id: 'TRL-003',
    trailerNumber: 'TRL-20241103',
    carrier: 'XPO Logistics',
    status: 'at_dock',
    location: 'DOCK-02',
    type: 'Live Load',
    checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    sealNumber: 'SEAL-456123',
    driverName: 'Sarah Williams',
    detentionHours: 0,
    notes: 'Urgent delivery'
  },
  {
    id: 'TRL-004',
    trailerNumber: 'TRL-20241104',
    carrier: 'YRC Freight',
    status: 'in_yard',
    location: 'YARD-B1',
    type: 'Drop',
    checkInTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
    sealNumber: 'SEAL-987654',
    driverName: 'Tom Brown',
    detentionHours: 2.5,
    notes: ''
  },
  {
    id: 'TRL-005',
    trailerNumber: 'TRL-20241105',
    carrier: 'Old Dominion',
    status: 'at_dock',
    location: 'DOCK-03',
    type: 'Inbound',
    checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    sealNumber: 'SEAL-321654',
    driverName: 'Lisa Davis',
    detentionHours: 0,
    notes: 'Fragile items'
  },
  {
    id: 'TRL-006',
    trailerNumber: 'TRL-20241106',
    carrier: 'ABF Freight',
    status: 'in_yard',
    location: 'YARD-A2',
    type: 'Inbound',
    checkInTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
    sealNumber: 'SEAL-789123',
    driverName: 'Chris Wilson',
    detentionHours: 4.5,
    notes: 'Awaiting unload'
  },
  {
    id: 'TRL-007',
    trailerNumber: 'TRL-20241107',
    carrier: 'FedEx',
    status: 'at_dock',
    location: 'DOCK-04',
    type: 'Outbound',
    checkInTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    sealNumber: 'SEAL-654987',
    driverName: 'Amy Martinez',
    detentionHours: 0,
    notes: 'Express shipment'
  },
  {
    id: 'TRL-008',
    trailerNumber: 'TRL-20241108',
    carrier: 'UPS',
    status: 'in_yard',
    location: 'YARD-B2',
    type: 'Drop',
    checkInTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    sealNumber: 'SEAL-147258',
    driverName: 'David Garcia',
    detentionHours: 0,
    notes: ''
  }
];

let currentFilter = 'all';
let selectedTrailer = null;

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
  renderYardTable();
  renderYardMap();
  updateDashboardStats();
});

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
  const totalTrailers = yardData.length;
  const atDock = yardData.filter(t => t.status === 'at_dock').length;
  const inYard = yardData.filter(t => t.status === 'in_yard').length;
  
  // Calculate average detention
  const totalDetention = yardData.reduce((sum, t) => sum + t.detentionHours, 0);
  const avgDetention = totalTrailers > 0 ? (totalDetention / totalTrailers).toFixed(1) : 0;
  
  document.getElementById('totalTrailers').textContent = totalTrailers;
  document.getElementById('atDock').textContent = atDock;
  document.getElementById('inYard').textContent = inYard;
  document.getElementById('avgDetention').textContent = `${avgDetention}h`;
}

/**
 * Render yard table
 */
function renderYardTable() {
  const tbody = document.getElementById('yardTableBody');
  const filteredData = currentFilter === 'all' 
    ? yardData 
    : currentFilter === 'detention'
    ? yardData.filter(t => t.detentionHours > 2)
    : yardData.filter(t => t.status === currentFilter);
  
  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">No trailers found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredData.map(trailer => {
    const duration = calculateDuration(trailer.checkInTime);
    const statusBadge = getStatusBadge(trailer.status);
    const detentionBadge = trailer.detentionHours > 2 
      ? `<span class="badge badge-danger">${trailer.detentionHours}h</span>`
      : `<span class="badge badge-success">OK</span>`;
    
    return `
      <tr>
        <td><strong>${trailer.trailerNumber}</strong></td>
        <td>${trailer.carrier}</td>
        <td>${statusBadge}</td>
        <td>${trailer.location}</td>
        <td>${trailer.type}</td>
        <td>${formatDateTime(trailer.checkInTime)}</td>
        <td>${duration}</td>
        <td>${detentionBadge}</td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick="viewTrailerDetails('${trailer.id}')" title="View Details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-icon" onclick="openMoveModal('${trailer.id}')" title="Move Trailer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button class="btn-icon btn-icon-danger" onclick="checkOutTrailer('${trailer.id}')" title="Check-Out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Render yard map
 */
function renderYardMap() {
  const yardMap = document.getElementById('yardMap');
  
  const yardSpots = [
    { id: 'YARD-A1', name: 'A1', zone: 'North' },
    { id: 'YARD-A2', name: 'A2', zone: 'North' },
    { id: 'YARD-B1', name: 'B1', zone: 'South' },
    { id: 'YARD-B2', name: 'B2', zone: 'South' },
    { id: 'YARD-C1', name: 'C1', zone: 'East' },
    { id: 'YARD-C2', name: 'C2', zone: 'East' },
    { id: 'DOCK-01', name: 'D1', zone: 'Dock' },
    { id: 'DOCK-02', name: 'D2', zone: 'Dock' },
    { id: 'DOCK-03', name: 'D3', zone: 'Dock' },
    { id: 'DOCK-04', name: 'D4', zone: 'Dock' }
  ];
  
  yardMap.innerHTML = yardSpots.map(spot => {
    const trailer = yardData.find(t => t.location === spot.id);
    const occupied = trailer ? 'occupied' : 'vacant';
    const detention = trailer && trailer.detentionHours > 2 ? 'detention' : '';
    
    return `
      <div class="yard-spot ${occupied} ${detention}" onclick="spotClicked('${spot.id}')">
        <div class="yard-spot-label">${spot.name}</div>
        <div class="yard-spot-zone">${spot.zone}</div>
        ${trailer ? `
          <div class="yard-spot-trailer">
            <div class="yard-spot-number">${trailer.trailerNumber.substring(4)}</div>
            <div class="yard-spot-carrier">${trailer.carrier.substring(0, 3)}</div>
          </div>
        ` : '<div class="yard-spot-empty">Empty</div>'}
      </div>
    `;
  }).join('');
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
  const badges = {
    'at_dock': '<span class="badge badge-primary">At Dock</span>',
    'in_yard': '<span class="badge badge-secondary">In Yard</span>',
    'checked_in': '<span class="badge badge-info">Checked In</span>'
  };
  return badges[status] || '<span class="badge badge-secondary">Unknown</span>';
}

/**
 * Calculate duration from check-in time
 */
function calculateDuration(checkInTime) {
  const diff = Date.now() - checkInTime.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

/**
 * Format date/time
 */
function formatDateTime(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Filter trailers
 */
function filterTrailers() {
  currentFilter = document.getElementById('filterStatus').value;
  renderYardTable();
}

/**
 * Refresh yard data
 */
function refreshYard() {
  showNotification('Refreshing yard status...', 'info');
  setTimeout(() => {
    renderYardTable();
    renderYardMap();
    updateDashboardStats();
    showNotification('Yard data refreshed successfully', 'success');
  }, 1000);
}

/**
 * Open check-in modal
 */
function openCheckInModal() {
  openModal('checkInModal');
  document.getElementById('checkInForm').reset();
}

/**
 * Submit check-in
 */
function submitCheckIn(event) {
  event.preventDefault();
  
  const trailerNumber = document.getElementById('trailerNumber').value;
  const carrier = document.getElementById('carrierName').value;
  const type = document.getElementById('trailerType').value;
  const location = document.getElementById('yardLocation').value;
  const sealNumber = document.getElementById('sealNumber').value;
  const driverName = document.getElementById('driverName').value;
  const notes = document.getElementById('notes').value;
  
  const newTrailer = {
    id: `TRL-${String(yardData.length + 1).padStart(3, '0')}`,
    trailerNumber,
    carrier,
    status: location.startsWith('DOCK') ? 'at_dock' : 'in_yard',
    location,
    type,
    checkInTime: new Date(),
    sealNumber,
    driverName,
    detentionHours: 0,
    notes
  };
  
  yardData.unshift(newTrailer);
  
  closeModal('checkInModal');
  renderYardTable();
  renderYardMap();
  updateDashboardStats();
  showNotification(`Trailer ${trailerNumber} checked in successfully to ${location}`, 'success');
}

/**
 * Open move trailer modal
 */
function openMoveModal(trailerId) {
  selectedTrailer = yardData.find(t => t.id === trailerId);
  if (!selectedTrailer) return;
  
  document.getElementById('currentLocation').value = selectedTrailer.location;
  document.getElementById('newLocation').value = '';
  document.getElementById('moveReason').value = '';
  
  openModal('moveModal');
}

/**
 * Confirm move trailer
 */
function confirmMove() {
  const newLocation = document.getElementById('newLocation').value;
  const reason = document.getElementById('moveReason').value;
  
  if (!newLocation) {
    showNotification('Please select a new location', 'error');
    return;
  }
  
  if (!selectedTrailer) return;
  
  const oldLocation = selectedTrailer.location;
  selectedTrailer.location = newLocation;
  selectedTrailer.status = newLocation.startsWith('DOCK') ? 'at_dock' : 'in_yard';
  
  closeModal('moveModal');
  renderYardTable();
  renderYardMap();
  updateDashboardStats();
  showNotification(`Trailer moved from ${oldLocation} to ${newLocation}`, 'success');
}

/**
 * View trailer details
 */
function viewTrailerDetails(trailerId) {
  const trailer = yardData.find(t => t.id === trailerId);
  if (!trailer) return;
  
  document.getElementById('detailTrailerNumber').textContent = trailer.trailerNumber;
  document.getElementById('detailCarrier').textContent = trailer.carrier;
  document.getElementById('detailStatus').innerHTML = getStatusBadge(trailer.status);
  document.getElementById('detailType').textContent = trailer.type;
  document.getElementById('detailLocation').textContent = trailer.location;
  document.getElementById('detailCheckIn').textContent = formatDateTime(trailer.checkInTime);
  document.getElementById('detailDuration').textContent = calculateDuration(trailer.checkInTime);
  document.getElementById('detailSeal').textContent = trailer.sealNumber || 'N/A';
  document.getElementById('detailDriver').textContent = trailer.driverName || 'N/A';
  document.getElementById('detailDetention').textContent = trailer.detentionHours > 2 
    ? `$${(trailer.detentionHours * 50).toFixed(2)} (${trailer.detentionHours}h @ $50/hr)`
    : 'No charges';
  
  // Movement history timeline
  const timeline = document.getElementById('movementTimeline');
  timeline.innerHTML = `
    <div class="timeline-item">
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <div class="timeline-title">Checked In</div>
        <div class="timeline-time">${formatDateTime(trailer.checkInTime)}</div>
        <div class="timeline-description">Location: ${trailer.location}</div>
      </div>
    </div>
  `;
  
  openModal('detailsModal');
}

/**
 * Check-out trailer
 */
function checkOutTrailer(trailerId) {
  const trailer = yardData.find(t => t.id === trailerId);
  if (!trailer) return;
  
  if (confirm(`Check-out trailer ${trailer.trailerNumber}?`)) {
    yardData = yardData.filter(t => t.id !== trailerId);
    renderYardTable();
    renderYardMap();
    updateDashboardStats();
    showNotification(`Trailer ${trailer.trailerNumber} checked out successfully`, 'success');
  }
}

/**
 * Yard spot clicked
 */
function spotClicked(spotId) {
  const trailer = yardData.find(t => t.location === spotId);
  if (trailer) {
    viewTrailerDetails(trailer.id);
  } else {
    showNotification(`${spotId} is vacant`, 'info');
  }
}

/**
 * Toggle map view
 */
function toggleMapView(view) {
  if (view === 'grid') {
    renderYardMap();
  } else {
    // List view - could be implemented
    showNotification('List view coming soon', 'info');
  }
}

/**
 * Open modal
 */
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

/**
 * Close modal
 */
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

/**
 * Toggle sidebar section
 */
function toggleSidebarSection(element) {
  const section = element.parentElement;
  const menu = section.querySelector('.sidebar-menu');
  const icon = element.querySelector('.sidebar-title-icon');
  
  if (menu.style.display === 'none') {
    menu.style.display = 'block';
    icon.style.transform = 'rotate(0deg)';
  } else {
    menu.style.display = 'none';
    icon.style.transform = 'rotate(-90deg)';
  }
}
