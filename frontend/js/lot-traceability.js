// DLT WMS - Lot Traceability Module JavaScript
// Handles lot lookup, genealogy, expiry tracking, and lot hold/release

let currentLot = null;

// View lot details
function viewLotDetails(lotNumber) {
  WMS.showNotification('Loading lot details...', 'info');
  
  setTimeout(() => {
    // Mock lot data
    currentLot = {
      lotNumber: lotNumber,
      item: 'ITM-5678',
      description: 'Widget Assembly A',
      supplier: 'ABC Manufacturing',
      receiptDate: '2025-01-15',
      mfgDate: '2025-01-10',
      expiryDate: '2026-01-10',
      status: lotNumber === 'LOT-2025-003' ? 'hold' : 'active',
      qtyReceived: 1000,
      qtyOnHand: 650,
      qtyReserved: 150,
      qtyAvailable: 500
    };
    
    document.getElementById('lotNumber').textContent = currentLot.lotNumber;
    document.getElementById('lotItem').textContent = currentLot.item;
    document.getElementById('lotDescription').textContent = currentLot.description;
    document.getElementById('lotSupplier').textContent = currentLot.supplier;
    document.getElementById('lotReceiptDate').textContent = currentLot.receiptDate;
    document.getElementById('lotMfgDate').textContent = currentLot.mfgDate;
    document.getElementById('lotExpiryDate').textContent = currentLot.expiryDate;
    
    // Set status badge
    const statusBadge = currentLot.status === 'hold' 
      ? '<span class="badge">On Hold</span>'
      : '<span class="badge badge-primary">Active</span>';
    document.getElementById('lotStatusBadge').innerHTML = statusBadge;
    
    // Toggle hold/release buttons
    if (currentLot.status === 'hold') {
      document.getElementById('holdLotBtn').style.display = 'none';
      document.getElementById('releaseLotBtn').style.display = 'inline-block';
    } else {
      document.getElementById('holdLotBtn').style.display = 'inline-block';
      document.getElementById('releaseLotBtn').style.display = 'none';
    }
    
    // Set quantities
    document.getElementById('lotQtyReceived').textContent = WMS.formatNumber(currentLot.qtyReceived);
    document.getElementById('lotQtyOnHand').textContent = WMS.formatNumber(currentLot.qtyOnHand);
    document.getElementById('lotQtyReserved').textContent = WMS.formatNumber(currentLot.qtyReserved);
    document.getElementById('lotQtyAvailable').textContent = WMS.formatNumber(currentLot.qtyAvailable);
    
    // Show lot details card
    document.getElementById('lotDetailsCard').style.display = 'block';
    document.getElementById('lotDetailsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    WMS.showNotification('Lot details loaded', 'success');
  }, 1000);
}

// Hold lot
function holdLot() {
  if (!currentLot) {
    WMS.showNotification('No lot selected', 'error');
    return;
  }
  
  const reason = prompt('Enter reason for hold:');
  if (!reason) {
    return;
  }
  
  WMS.showNotification(`Placing hold on lot ${currentLot.lotNumber}...`, 'info');
  
  setTimeout(() => {
    currentLot.status = 'hold';
    
    // Update UI
    document.getElementById('lotStatusBadge').innerHTML = '<span class="badge">On Hold</span>';
    document.getElementById('holdLotBtn').style.display = 'none';
    document.getElementById('releaseLotBtn').style.display = 'inline-block';
    
    // Save hold record
    const holds = WMS.Storage.get('lotHolds') || [];
    holds.unshift({
      lotNumber: currentLot.lotNumber,
      reason: reason,
      heldBy: 'Ashish Kumar',
      heldDate: WMS.formatDateTime(new Date())
    });
    WMS.Storage.set('lotHolds', holds);
    
    WMS.showNotification(`Lot ${currentLot.lotNumber} placed on hold`, 'success');
    
    // Update search results table
    updateLotStatusInTable(currentLot.lotNumber, 'Hold');
  }, 1000);
}

// Release lot
function releaseLot() {
  if (!currentLot) {
    WMS.showNotification('No lot selected', 'error');
    return;
  }
  
  if (confirm(`Release hold on lot ${currentLot.lotNumber}?`)) {
    WMS.showNotification(`Releasing lot ${currentLot.lotNumber}...`, 'info');
    
    setTimeout(() => {
      currentLot.status = 'active';
      
      // Update UI
      document.getElementById('lotStatusBadge').innerHTML = '<span class="badge badge-primary">Active</span>';
      document.getElementById('holdLotBtn').style.display = 'inline-block';
      document.getElementById('releaseLotBtn').style.display = 'none';
      
      // Remove hold record
      const holds = WMS.Storage.get('lotHolds') || [];
      const updatedHolds = holds.filter(h => h.lotNumber !== currentLot.lotNumber);
      WMS.Storage.set('lotHolds', updatedHolds);
      
      WMS.showNotification(`Lot ${currentLot.lotNumber} released`, 'success');
      
      // Update search results table
      updateLotStatusInTable(currentLot.lotNumber, 'Active');
    }, 1000);
  }
}

// Update lot status in search results table
function updateLotStatusInTable(lotNumber, newStatus) {
  const tbody = document.getElementById('lotSearchResults');
  const rows = tbody.getElementsByTagName('tr');
  
  for (let row of rows) {
    const lotCell = row.cells[0];
    if (lotCell.textContent.includes(lotNumber)) {
      const statusCell = row.cells[7];
      const badge = newStatus === 'Active'
        ? '<span class="badge badge-primary">Active</span>'
        : '<span class="badge">Hold</span>';
      statusCell.innerHTML = badge;
      break;
    }
  }
}

// Print lot history
function printLotHistory() {
  if (!currentLot) {
    WMS.showNotification('No lot selected', 'error');
    return;
  }
  
  WMS.showNotification(`Printing lot history for ${currentLot.lotNumber}...`, 'info');
  
  setTimeout(() => {
    WMS.showNotification('Lot history printed', 'success');
  }, 1500);
}

// Search lots
function searchLots(e) {
  e.preventDefault();
  
  const searchParams = {
    lotNum: document.getElementById('searchLotNum').value,
    itemNum: document.getElementById('searchItemNum').value,
    dateFrom: document.getElementById('searchDateFrom').value,
    dateTo: document.getElementById('searchDateTo').value,
    supplier: document.getElementById('searchSupplier').value,
    status: document.getElementById('searchLotStatus').value,
    expiryStatus: document.getElementById('searchExpiryStatus').value
  };
  
  WMS.showNotification('Searching lots...', 'info');
  
  setTimeout(() => {
    // Mock search - would filter table
    const resultsCount = Math.floor(Math.random() * 50) + 10;
    WMS.showNotification(`Found ${resultsCount} lots matching criteria`, 'success');
  }, 800);
}

// Check for expiring lots on page load
function checkExpiringLots() {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  // Mock check - would query actual lot data
  const expiringCount = 5;
  const expiredCount = 2;
  
  if (expiredCount > 0) {
    WMS.showNotification(`${expiredCount} lot(s) have expired and should be reviewed`, 'error');
  } else if (expiringCount > 0) {
    WMS.showNotification(`${expiringCount} lot(s) expiring within 30 days`, 'info');
  }
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const lotSearchForm = document.getElementById('lotSearchForm');
  
  if (lotSearchForm) {
    lotSearchForm.addEventListener('submit', searchLots);
  }
  
  // Search on Enter key in search fields
  const searchFields = ['searchLotNum', 'searchItemNum', 'searchSupplier'];
  searchFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          searchLots(e);
        }
      });
    }
  });
  
  // Check for expiring lots on page load
  checkExpiringLots();
  
  // Set default date range (last 90 days)
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000));
  
  document.getElementById('searchDateTo').value = today.toISOString().split('T')[0];
  document.getElementById('searchDateFrom').value = ninetyDaysAgo.toISOString().split('T')[0];
});
