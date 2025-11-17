// DLT WMS - Put-away Module JavaScript
// Handles all put-away functionality

let currentPutawayMethod = null;
let suggestedLocationData = null;

// Select put-away method
function selectPutawayMethod(method) {
  currentPutawayMethod = method;
  
  const methodLabels = {
    'manual-load': 'Manual Load',
    'directed-drop': 'Directed Drop',
    'manual-drop': 'Manual Drop',
    'drop-all': 'Drop All LPNs'
  };
  
  document.getElementById('putawayMethodLabel').textContent = methodLabels[method];
  
  // Show/hide relevant sections based on method
  const intoLPNGroup = document.getElementById('intoLPNGroup');
  const suggestedLocation = document.getElementById('suggestedLocation');
  const overrideReasonGroup = document.getElementById('overrideReasonGroup');
  
  if (method === 'manual-load') {
    intoLPNGroup.style.display = 'block';
    suggestedLocation.style.display = 'none';
    overrideReasonGroup.style.display = 'none';
  } else if (method === 'directed-drop') {
    intoLPNGroup.style.display = 'none';
    suggestedLocation.style.display = 'block';
    overrideReasonGroup.style.display = 'none';
    generateSuggestedLocation();
  } else if (method === 'manual-drop') {
    intoLPNGroup.style.display = 'none';
    suggestedLocation.style.display = 'none';
    overrideReasonGroup.style.display = 'none';
  } else if (method === 'drop-all') {
    // Different workflow for drop all
    processDropAll();
    return;
  }
  
  // Show form
  document.getElementById('putawayForm').style.display = 'block';
  document.getElementById('putawayForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  WMS.showNotification(`${methodLabels[method]} selected. Scan or enter LPN to begin.`, 'info');
}

// Generate suggested location for directed drop
function generateSuggestedLocation() {
  // Simulate rules engine calculation
  const subinventories = ['A-STORES', 'B-STORES', 'C-STORES'];
  const locators = ['A-01-15-B', 'B-02-08-A', 'C-03-12-C', 'A-02-10-A', 'B-01-05-C'];
  
  suggestedLocationData = {
    subinventory: subinventories[Math.floor(Math.random() * subinventories.length)],
    locator: locators[Math.floor(Math.random() * locators.length)]
  };
  
  document.getElementById('suggestedSubinventory').textContent = suggestedLocationData.subinventory;
  document.getElementById('suggestedLocator').textContent = suggestedLocationData.locator;
}

// Accept suggested location
function acceptSuggestedLocation() {
  if (suggestedLocationData) {
    document.getElementById('subinventory').value = suggestedLocationData.subinventory;
    document.getElementById('locator').value = suggestedLocationData.locator;
    WMS.showNotification('Suggested location accepted', 'success');
  }
}

// Process drop all LPNs
function processDropAll() {
  WMS.showNotification('Processing all pending LPNs in optimal sequence...', 'info');
  
  // Simulate processing
  setTimeout(() => {
    WMS.showNotification('Drop All sequence generated. 3 LPNs ready for put-away.', 'success');
  }, 1500);
}

// Reset put-away form
function resetPutawayForm() {
  document.getElementById('putawayFormElement').reset();
  document.getElementById('putawayForm').style.display = 'none';
  document.getElementById('lpnContents').style.display = 'none';
  currentPutawayMethod = null;
  suggestedLocationData = null;
  WMS.showNotification('Form reset successfully', 'info');
}

// Handle source LPN input
document.addEventListener('DOMContentLoaded', function() {
  const sourceLPNInput = document.getElementById('sourceLPN');
  
  if (sourceLPNInput) {
    sourceLPNInput.addEventListener('blur', function() {
      const lpnNumber = this.value.trim();
      if (lpnNumber) {
        loadLPNContents(lpnNumber);
      }
    });
  }
  
  // Monitor location changes for override detection
  const subinventorySelect = document.getElementById('subinventory');
  const locatorInput = document.getElementById('locator');
  
  const checkForOverride = () => {
    if (currentPutawayMethod === 'directed-drop' && suggestedLocationData) {
      const currentSub = subinventorySelect.value;
      const currentLoc = locatorInput.value;
      
      if ((currentSub && currentSub !== suggestedLocationData.subinventory) ||
          (currentLoc && currentLoc !== suggestedLocationData.locator)) {
        document.getElementById('overrideReasonGroup').style.display = 'block';
        document.getElementById('overrideReason').required = true;
      } else {
        document.getElementById('overrideReasonGroup').style.display = 'none';
        document.getElementById('overrideReason').required = false;
      }
    }
  };
  
  if (subinventorySelect) subinventorySelect.addEventListener('change', checkForOverride);
  if (locatorInput) locatorInput.addEventListener('input', checkForOverride);
  
  // Handle form submission
  const putawayForm = document.getElementById('putawayFormElement');
  if (putawayForm) {
    putawayForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      // Collect form data
      const putawayData = {
        method: currentPutawayMethod,
        sourceLPN: document.getElementById('sourceLPN').value,
        destinationLPN: document.getElementById('destinationLPN').value,
        subinventory: document.getElementById('subinventory').value,
        locator: document.getElementById('locator').value,
        putawayType: document.getElementById('putawayType').value,
        priority: document.getElementById('priority').value,
        equipment: document.getElementById('equipment').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
      };
      
      // Add override reason if applicable
      if (document.getElementById('overrideReasonGroup').style.display !== 'none') {
        putawayData.overrideReason = document.getElementById('overrideReason').value;
        putawayData.suggestedLocation = suggestedLocationData;
      }
      
      // Save to local storage
      const putawayTasks = WMS.Storage.get('putawayTasks') || [];
      putawayTasks.push(putawayData);
      WMS.Storage.set('putawayTasks', putawayTasks);
      
      // Generate task number
      const taskNumber = `PUT-2025-${String(putawayTasks.length).padStart(4, '0')}`;
      
      // Show success message
      WMS.showNotification(
        `Put-away task ${taskNumber} completed successfully! LPN ${putawayData.sourceLPN} moved to ${putawayData.subinventory}/${putawayData.locator}`,
        'success'
      );
      
      // Reset form after short delay
      setTimeout(() => {
        resetPutawayForm();
      }, 2000);
    });
  }
});

// Load LPN contents
function loadLPNContents(lpnNumber) {
  // Simulate LPN lookup
  const mockContents = [
    { item: 'ITM-5678', description: 'Widget Assembly A', quantity: 250, uom: 'EA', lot: 'LOT-2025-001' },
    { item: 'ITM-5679', description: 'Component B', quantity: 150, uom: 'EA', lot: 'LOT-2025-002' }
  ];
  
  const lpnContentsBody = document.getElementById('lpnContentsBody');
  lpnContentsBody.innerHTML = '';
  
  mockContents.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.item}</strong></td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${item.uom}</td>
      <td>${item.lot}</td>
    `;
    lpnContentsBody.appendChild(row);
  });
  
  document.getElementById('lpnContents').style.display = 'block';
  WMS.showNotification(`LPN ${lpnNumber} contents loaded`, 'success');
}

// Auto-save functionality
let putawayAutoSaveInterval;

function startPutawayAutoSave() {
  putawayAutoSaveInterval = setInterval(() => {
    const form = document.getElementById('putawayFormElement');
    if (form && currentPutawayMethod) {
      const formData = new FormData(form);
      const draftData = {};
      
      for (let [key, value] of formData.entries()) {
        draftData[key] = value;
      }
      
      draftData.method = currentPutawayMethod;
      draftData.lastSaved = new Date().toISOString();
      
      WMS.Storage.set('putawayDraft', draftData);
      console.log('Put-away draft auto-saved');
    }
  }, 30000); // Auto-save every 30 seconds
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  startPutawayAutoSave();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (putawayAutoSaveInterval) {
    clearInterval(putawayAutoSaveInterval);
  }
});
