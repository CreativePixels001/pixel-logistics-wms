// Cross-Docking Operations JavaScript

// Mock data for ASNs and Orders
const mockASNs = [
  { id: 'ASN-2025-045', item: 'ITM-5678', desc: 'Widget Assembly A', qty: '500 EA', arrival: 'Today 2:00 PM' },
  { id: 'ASN-2025-046', item: 'ITM-5679', desc: 'Component B', qty: '300 EA', arrival: 'Today 3:30 PM' },
  { id: 'ASN-2025-047', item: 'ITM-5680', desc: 'Part C', qty: '200 EA', arrival: 'Tomorrow 9:00 AM' },
  { id: 'ASN-2025-048', item: 'ITM-5681', desc: 'Assembly D', qty: '150 EA', arrival: 'Tomorrow 10:00 AM' }
];

const mockOrders = [
  { id: 'ORD-2025-089', item: 'ITM-5678', desc: 'Widget Assembly A', qty: '480 EA', ship: 'Today 6:00 PM' },
  { id: 'ORD-2025-090', item: 'ITM-5679', desc: 'Component B', qty: '280 EA', ship: 'Today 7:00 PM' },
  { id: 'ORD-2025-091', item: 'ITM-5681', desc: 'Assembly D', qty: '150 EA', ship: 'Tomorrow 2:00 PM' }
];

let matchedPairs = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Cross-Docking system initialized');
  
  // Set up keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
  
  // Close modal when clicking outside
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });
  
  // Auto-scan simulation for execute form
  document.getElementById('scanASN')?.addEventListener('input', function(e) {
    if (this.value.length >= 8) {
      loadCrossDockDetails();
    }
  });
});

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    
    // Load data for matching modal
    if (modalId === 'matchingModal') {
      loadMatchingData();
    }
    
    // Focus first input
    const firstInput = modal.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });
}

// Load ASNs and Orders for drag & drop matching
function loadMatchingData() {
  const asnList = document.getElementById('asnList');
  const orderList = document.getElementById('orderList');
  
  // Clear existing
  asnList.innerHTML = '';
  orderList.innerHTML = '';
  
  // Populate ASNs
  mockASNs.forEach(asn => {
    const div = document.createElement('div');
    div.className = 'draggable-item';
    div.draggable = true;
    div.dataset.asnId = asn.id;
    div.dataset.item = asn.item;
    div.innerHTML = `
      <div class="item-title">
        <span class="match-indicator unmatched"></span>
        ${asn.id}
      </div>
      <div class="item-detail">${asn.item} - ${asn.desc}</div>
      <div class="item-detail">${asn.qty} | ${asn.arrival}</div>
    `;
    
    // Drag events for ASN
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    
    asnList.appendChild(div);
  });
  
  // Populate Orders
  mockOrders.forEach(order => {
    const div = document.createElement('div');
    div.className = 'draggable-item';
    div.dataset.orderId = order.id;
    div.dataset.item = order.item;
    div.innerHTML = `
      <div class="item-title">
        <span class="match-indicator unmatched"></span>
        ${order.id}
      </div>
      <div class="item-detail">${order.item} - ${order.desc}</div>
      <div class="item-detail">${order.qty} | Ship: ${order.ship}</div>
    `;
    
    // Drop events for Order
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('dragleave', handleDragLeave);
    div.addEventListener('drop', handleDrop);
    
    orderList.appendChild(div);
  });
  
  // Reset matched pairs display
  document.getElementById('matchedPairs').style.display = 'none';
  matchedPairs = [];
}

// Drag & Drop handlers
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  
  // Remove all dragover classes
  document.querySelectorAll('.draggable-item').forEach(item => {
    item.classList.remove('dragover');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  
  this.classList.add('dragover');
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragLeave(e) {
  this.classList.remove('dragover');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  this.classList.remove('dragover');
  
  if (draggedElement !== this) {
    // Check if items match
    const asnItem = draggedElement.dataset.item;
    const orderItem = this.dataset.item;
    
    if (asnItem === orderItem) {
      // Create match
      const match = {
        asnId: draggedElement.dataset.asnId,
        orderId: this.dataset.orderId,
        item: asnItem
      };
      
      matchedPairs.push(match);
      
      // Update visuals
      draggedElement.classList.add('matched');
      this.classList.add('matched');
      
      // Update indicators
      draggedElement.querySelector('.match-indicator').classList.remove('unmatched');
      draggedElement.querySelector('.match-indicator').classList.add('matched');
      this.querySelector('.match-indicator').classList.remove('unmatched');
      this.querySelector('.match-indicator').classList.add('matched');
      
      // Display matched pairs
      displayMatchedPairs();
      
      showNotification('Match created: ' + match.asnId + ' → ' + match.orderId, 'success');
    } else {
      showNotification('Item mismatch! ASN: ' + asnItem + ', Order: ' + orderItem, 'error');
    }
  }
  
  return false;
}

// Display matched pairs
function displayMatchedPairs() {
  const container = document.getElementById('matchedPairs');
  const list = document.getElementById('matchedList');
  
  if (matchedPairs.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  list.innerHTML = '';
  
  matchedPairs.forEach((match, index) => {
    const div = document.createElement('div');
    div.className = 'draggable-item matched';
    div.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <div class="item-title">${match.asnId} → ${match.orderId}</div>
          <div class="item-detail">Item: ${match.item}</div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="removeMatch(${index})">Remove</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// Remove a match
function removeMatch(index) {
  matchedPairs.splice(index, 1);
  loadMatchingData(); // Reload to reset
  
  // Re-apply remaining matches
  matchedPairs.forEach(match => {
    const asnEl = document.querySelector(`[data-asn-id="${match.asnId}"]`);
    const orderEl = document.querySelector(`[data-order-id="${match.orderId}"]`);
    if (asnEl && orderEl) {
      asnEl.classList.add('matched');
      orderEl.classList.add('matched');
      asnEl.querySelector('.match-indicator').classList.add('matched');
      orderEl.querySelector('.match-indicator').classList.add('matched');
    }
  });
  
  displayMatchedPairs();
}

// Confirm matches
function confirmMatches() {
  if (matchedPairs.length === 0) {
    showNotification('No matches to confirm', 'error');
    return;
  }
  
  // Save matches
  matchedPairs.forEach(match => {
    console.log('Creating cross-dock:', match);
    // In real system, this would create cross-dock records
  });
  
  showNotification(`${matchedPairs.length} cross-dock matches created successfully!`, 'success');
  closeModal('matchingModal');
  
  // Refresh tables (in real app)
  setTimeout(() => {
    location.reload();
  }, 1500);
}

// Quick create match from table
function createMatch(asnId) {
  openModal('matchingModal');
  
  // Pre-highlight the ASN
  setTimeout(() => {
    const asnEl = document.querySelector(`[data-asn-id="${asnId}"]`);
    if (asnEl) {
      asnEl.style.border = '2px solid var(--color-primary)';
      asnEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 200);
}

// Auto-match algorithm
function runAutoMatch() {
  showNotification('Running auto-match algorithm...', 'info');
  
  let matchCount = 0;
  
  // Simple matching logic: match by item number and sufficient quantity
  mockASNs.forEach(asn => {
    mockOrders.forEach(order => {
      if (asn.item === order.item) {
        const asnQty = parseInt(asn.qty);
        const orderQty = parseInt(order.qty);
        
        if (asnQty >= orderQty) {
          console.log(`Auto-matched: ${asn.id} → ${order.id}`);
          matchCount++;
        }
      }
    });
  });
  
  setTimeout(() => {
    showNotification(`Auto-match complete! ${matchCount} matches created.`, 'success');
    setTimeout(() => location.reload(), 1500);
  }, 2000);
}

// Load cross-dock details in execute modal
function loadCrossDockDetails() {
  const asnValue = document.getElementById('scanASN').value;
  const detailsCard = document.getElementById('xdockDetails');
  
  if (asnValue.length >= 8) {
    // Simulate lookup
    detailsCard.style.display = 'block';
    
    // Populate mock data
    document.getElementById('xdItem').textContent = 'ITM-5678';
    document.getElementById('xdDescription').textContent = 'Widget Assembly A';
    document.getElementById('xdQty').textContent = '250 EA';
    document.getElementById('fromDock').textContent = 'Dock 3 (Receiving)';
    document.getElementById('toDock').textContent = 'Dock 8 (Shipping)';
  } else {
    detailsCard.style.display = 'none';
  }
}

// Submit cross-dock execution
function submitCrossDock() {
  const asn = document.getElementById('scanASN').value;
  const order = document.getElementById('scanOrder').value;
  const fromDock = document.getElementById('confirmFromDock').value;
  const toDock = document.getElementById('confirmToDock').value;
  
  if (!asn || !order || !fromDock || !toDock) {
    showNotification('Please fill all required fields', 'error');
    return;
  }
  
  // Validate dock scans
  if (fromDock !== 'DOCK-3' && fromDock !== 'Dock 3') {
    showNotification('Invalid source dock scan', 'error');
    return;
  }
  
  if (toDock !== 'DOCK-8' && toDock !== 'Dock 8') {
    showNotification('Invalid destination dock scan', 'error');
    return;
  }
  
  console.log('Executing cross-dock:', { asn, order, fromDock, toDock });
  
  showNotification('Cross-dock operation initiated! Moving from ' + fromDock + ' to ' + toDock, 'success');
  closeModal('executeModal');
  
  setTimeout(() => {
    location.reload();
  }, 1500);
}

// Complete cross-dock from table
function completeXDock(xdId) {
  if (confirm('Complete cross-dock operation ' + xdId + '?')) {
    console.log('Completing:', xdId);
    showNotification('Cross-dock ' + xdId + ' completed successfully!', 'success');
    
    setTimeout(() => {
      location.reload();
    }, 1500);
  }
}

// Notification helper
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type}`;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '10000';
  notification.style.minWidth = '300px';
  notification.style.animation = 'slideInRight 0.3s ease-out';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
