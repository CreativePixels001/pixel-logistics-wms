// DLT WMS - LPN Management Module JavaScript
// Handles LPN generation, nesting, consolidation, and lifecycle

let generatedLPNList = [];
let sourceLPNs = [];
let lpnCounter = 1006; // Starting counter for new LPNs

// Show specific LPN action form
function showLPNAction(action) {
  // Hide all forms first
  hideLPNAction();
  
  // Show the selected form
  const formMap = {
    'generate': 'generateLPNForm',
    'nest': 'nestLPNForm',
    'consolidate': 'consolidateLPNForm',
    'split': 'splitLPNForm'
  };
  
  const formId = formMap[action];
  if (formId) {
    document.getElementById(formId).style.display = 'block';
    document.getElementById(formId).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Hide all LPN action forms
function hideLPNAction() {
  document.getElementById('generateLPNForm').style.display = 'none';
  document.getElementById('nestLPNForm').style.display = 'none';
  document.getElementById('consolidateLPNForm').style.display = 'none';
  document.getElementById('splitLPNForm').style.display = 'none';
}

// Generate LPNs
function generateLPNs(context, prefix, quantity) {
  generatedLPNList = [];
  const prefixStr = prefix || 'LPN';
  
  for (let i = 0; i < quantity; i++) {
    const lpn = `${prefixStr}-${lpnCounter}`;
    generatedLPNList.push(lpn);
    lpnCounter++;
  }
  
  displayGeneratedLPNs();
  
  // Log activity
  logLPNActivity(generatedLPNList[0], 'Generated', 'Active', 'RCV-DOCK-01');
  
  return generatedLPNList;
}

// Display generated LPNs
function displayGeneratedLPNs() {
  const container = document.getElementById('generatedLPNs');
  
  if (generatedLPNList.length === 0) {
    container.innerHTML = '<div class="text-grey text-center">LPNs will appear here after generation</div>';
    return;
  }
  
  let html = '<div class="grid grid-cols-4 gap-md">';
  generatedLPNList.forEach(lpn => {
    html += `
      <div class="p-md text-center" style="background-color: var(--color-white); border: 1px solid var(--color-grey-light); border-radius: var(--radius-md);">
        <strong>${lpn}</strong>
      </div>
    `;
  });
  html += '</div>';
  
  container.innerHTML = html;
}

// Print LPNs
function printLPNs() {
  if (generatedLPNList.length === 0) {
    WMS.showNotification('No LPNs to print', 'error');
    return;
  }
  
  WMS.showNotification(`Printing ${generatedLPNList.length} LPN label(s)...`, 'info');
  
  // In production, this would send to a label printer
  setTimeout(() => {
    WMS.showNotification('LPN labels sent to printer', 'success');
  }, 1500);
}

// Add source LPN for consolidation
function addSourceLPN() {
  const input = document.getElementById('sourceLPNInput');
  const lpn = input.value.trim();
  
  if (!lpn) {
    WMS.showNotification('Please enter an LPN', 'error');
    return;
  }
  
  if (sourceLPNs.includes(lpn)) {
    WMS.showNotification('LPN already added', 'error');
    return;
  }
  
  sourceLPNs.push(lpn);
  displaySourceLPNs();
  input.value = '';
  input.focus();
}

// Display source LPNs for consolidation
function displaySourceLPNs() {
  const container = document.getElementById('sourceLPNsList');
  
  if (sourceLPNs.length === 0) {
    container.innerHTML = '<div class="text-grey text-center">Source LPNs will appear here</div>';
    return;
  }
  
  let html = '';
  sourceLPNs.forEach((lpn, index) => {
    html += `
      <div class="flex justify-between items-center p-sm mb-sm" style="background-color: var(--color-white); border: 1px solid var(--color-grey-light); border-radius: var(--radius-sm);">
        <strong>${lpn}</strong>
        <button type="button" class="btn btn-sm btn-outline" onclick="removeSourceLPN(${index})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Remove source LPN
function removeSourceLPN(index) {
  sourceLPNs.splice(index, 1);
  displaySourceLPNs();
}

// Search LPN
function searchLPN() {
  const lpn = document.getElementById('searchLPN').value.trim();
  
  if (!lpn) {
    WMS.showNotification('Please enter an LPN', 'error');
    return;
  }
  
  WMS.showNotification('Searching for LPN...', 'info');
  
  // Simulate LPN lookup
  setTimeout(() => {
    // Mock data
    const lpnData = {
      lpn: lpn,
      status: 'Active',
      location: 'A-01-01-A',
      parent: 'None',
      createdDate: '2025-11-10',
      contents: [
        { item: 'ITM-5678', description: 'Widget Assembly A', quantity: 250, uom: 'EA', lot: 'LOT-2025-100', serial: '-' },
        { item: 'ITM-5679', description: 'Component B', quantity: 100, uom: 'EA', lot: 'LOT-2025-101', serial: 'SN-001,SN-002' }
      ]
    };
    
    displayLPNDetails(lpnData);
    WMS.showNotification('LPN found', 'success');
  }, 1000);
}

// Display LPN details
function displayLPNDetails(data) {
  document.getElementById('lpnStatus').textContent = data.status;
  document.getElementById('lpnLocation').textContent = data.location;
  document.getElementById('lpnParent').textContent = data.parent;
  document.getElementById('lpnCreatedDate').textContent = data.createdDate;
  
  // Display contents
  const tbody = document.getElementById('lpnContentsTable');
  tbody.innerHTML = '';
  
  data.contents.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.item}</strong></td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${item.uom}</td>
      <td>${item.lot}</td>
      <td>${item.serial}</td>
    `;
    tbody.appendChild(row);
  });
  
  document.getElementById('lpnDetailsDisplay').style.display = 'block';
}

// Log LPN activity
function logLPNActivity(lpn, action, status, location) {
  const activities = WMS.Storage.get('lpnActivities') || [];
  
  activities.unshift({
    lpn: lpn,
    action: action,
    status: status,
    location: location,
    user: 'Ashish Kumar',
    timestamp: WMS.formatDateTime(new Date())
  });
  
  // Keep last 50 activities
  if (activities.length > 50) {
    activities.length = 50;
  }
  
  WMS.Storage.set('lpnActivities', activities);
  
  // Update table if visible
  updateActivitiesTable();
}

// Update activities table
function updateActivitiesTable() {
  const activities = WMS.Storage.get('lpnActivities') || [];
  const tbody = document.getElementById('lpnActivities');
  
  // Only update first few rows to show recent activity
  if (activities.length > 0 && tbody.rows.length > 0) {
    const latestActivity = activities[0];
    
    const statusBadge = latestActivity.status === 'Active' 
      ? '<span class="badge badge-primary">Active</span>'
      : latestActivity.status === 'Nested'
      ? '<span class="badge badge-primary">Nested</span>'
      : '<span class="badge badge-outline">Consumed</span>';
    
    // Add new row at the top
    const newRow = tbody.insertRow(0);
    newRow.innerHTML = `
      <td><strong>${latestActivity.lpn}</strong></td>
      <td>${latestActivity.action}</td>
      <td>${statusBadge}</td>
      <td>${latestActivity.location}</td>
      <td>${latestActivity.user}</td>
      <td>${latestActivity.timestamp}</td>
    `;
    
    // Remove last row if more than 10 rows
    if (tbody.rows.length > 10) {
      tbody.deleteRow(tbody.rows.length - 1);
    }
  }
}

// Form handlers
document.addEventListener('DOMContentLoaded', function() {
  
  // Generate LPNs form
  const generateForm = document.getElementById('generateFormElement');
  if (generateForm) {
    generateForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const context = document.getElementById('lpnContext').value;
      const prefix = document.getElementById('lpnPrefix').value;
      const quantity = parseInt(document.getElementById('lpnQuantity').value);
      
      if (!context) {
        WMS.showNotification('Please select an LPN context', 'error');
        return;
      }
      
      generateLPNs(context, prefix, quantity);
      WMS.showNotification(`Generated ${quantity} LPN(s) successfully`, 'success');
    });
  }
  
  // Nest LPNs form
  const nestForm = document.getElementById('nestFormElement');
  if (nestForm) {
    nestForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const parentLPN = document.getElementById('parentLPN').value;
      const childLPN = document.getElementById('childLPN').value;
      
      // Simulate nesting
      logLPNActivity(childLPN, `Nested into ${parentLPN}`, 'Nested', 'A-01-02-B');
      
      WMS.showNotification(`LPN ${childLPN} nested into ${parentLPN}`, 'success');
      
      // Display nested structure
      const display = document.getElementById('nestedLPNsDisplay').querySelector('.p-md');
      display.innerHTML = `
        <div style="font-family: monospace;">
          <div><strong>${parentLPN}</strong> (Parent)</div>
          <div style="margin-left: 2rem;">└─ <strong>${childLPN}</strong> (Child)</div>
        </div>
      `;
      
      setTimeout(() => {
        this.reset();
        display.innerHTML = '<div class="text-grey text-center">Nesting hierarchy will display here</div>';
      }, 3000);
    });
  }
  
  // Consolidate LPNs form
  const consolidateForm = document.getElementById('consolidateFormElement');
  if (consolidateForm) {
    consolidateForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const targetLPN = document.getElementById('targetLPN').value;
      
      if (!targetLPN) {
        WMS.showNotification('Please enter a target LPN', 'error');
        return;
      }
      
      if (sourceLPNs.length === 0) {
        WMS.showNotification('Please add source LPNs to consolidate', 'error');
        return;
      }
      
      // Simulate consolidation
      sourceLPNs.forEach(lpn => {
        logLPNActivity(lpn, 'Consolidated', 'Consumed', '-');
      });
      
      logLPNActivity(targetLPN, `Consolidated from ${sourceLPNs.length} LPNs`, 'Active', 'A-01-03-C');
      
      WMS.showNotification(`Consolidated ${sourceLPNs.length} LPNs into ${targetLPN}`, 'success');
      
      this.reset();
      sourceLPNs = [];
      displaySourceLPNs();
    });
  }
  
  // Split LPN form
  const splitForm = document.getElementById('splitFormElement');
  if (splitForm) {
    splitForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const sourceLPN = document.getElementById('splitSourceLPN').value;
      const quantity = document.getElementById('splitQuantity').value;
      
      // Generate new LPN for split
      const newLPN = `LPN-${lpnCounter}`;
      lpnCounter++;
      
      document.getElementById('newSplitLPN').value = newLPN;
      
      // Simulate split
      logLPNActivity(newLPN, `Split from ${sourceLPN} (Qty: ${quantity})`, 'Active', 'A-01-04-D');
      
      WMS.showNotification(`Split completed. New LPN: ${newLPN}`, 'success');
      
      setTimeout(() => {
        this.reset();
      }, 3000);
    });
  }
  
  // Enter key on search LPN
  const searchInput = document.getElementById('searchLPN');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchLPN();
      }
    });
  }
  
  // Enter key on source LPN input
  const sourceLPNInput = document.getElementById('sourceLPNInput');
  if (sourceLPNInput) {
    sourceLPNInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSourceLPN();
      }
    });
  }
});
