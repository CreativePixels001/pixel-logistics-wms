// DLT WMS - Inspection Module JavaScript
// Handles quality inspection workflows

let currentInspectionLPN = null;
let currentInspectionData = null;
let inspectionResult = null;

// Start inspection for an LPN
function startInspection(lpn) {
  currentInspectionLPN = lpn;
  
  // Mock inspection data
  currentInspectionData = {
    lpn: lpn,
    receipt: 'RCV-2025-100',
    item: 'ITM-5678',
    description: 'Widget Assembly A',
    quantity: 250,
    uom: 'EA',
    lot: 'LOT-2025-100',
    receivedDate: '2025-11-10'
  };
  
  loadInspectionForm();
  WMS.showNotification(`Starting inspection for ${lpn}`, 'info');
}

// Load inspection form
function loadInspectionForm() {
  document.getElementById('inspectingLPN').textContent = currentInspectionLPN;
  document.getElementById('inspectItem').textContent = currentInspectionData.item;
  document.getElementById('inspectDescription').textContent = currentInspectionData.description;
  document.getElementById('inspectQuantity').textContent = `${currentInspectionData.quantity} ${currentInspectionData.uom}`;
  
  // Pre-fill lot number
  document.getElementById('lotNumber').value = currentInspectionData.lot;
  
  // Reset form
  document.getElementById('inspectionFormElement').reset();
  document.getElementById('lotNumber').value = currentInspectionData.lot; // Restore after reset
  document.getElementById('inspectionResult').value = '';
  document.getElementById('rejectDetailsSection').style.display = 'none';
  
  // Reset card highlights
  document.getElementById('acceptCard').style.border = '1px solid var(--color-grey-light)';
  document.getElementById('rejectCard').style.border = '1px solid var(--color-grey-light)';
  
  document.getElementById('inspectionForm').style.display = 'block';
  document.getElementById('inspectionForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Select inspection result
function selectInspectionResult(result) {
  inspectionResult = result;
  document.getElementById('inspectionResult').value = result;
  
  // Update card highlights
  const acceptCard = document.getElementById('acceptCard');
  const rejectCard = document.getElementById('rejectCard');
  
  if (result === 'accept') {
    acceptCard.style.border = '2px solid var(--color-primary)';
    acceptCard.style.backgroundColor = 'var(--color-grey-lightest)';
    rejectCard.style.border = '1px solid var(--color-grey-light)';
    rejectCard.style.backgroundColor = 'transparent';
    document.getElementById('rejectDetailsSection').style.display = 'none';
    
    // Remove required from reject fields
    document.getElementById('rejectReason').removeAttribute('required');
    document.getElementById('rejectQuantity').removeAttribute('required');
    document.getElementById('rejectNotes').removeAttribute('required');
  } else {
    rejectCard.style.border = '2px solid var(--color-primary)';
    rejectCard.style.backgroundColor = 'var(--color-grey-lightest)';
    acceptCard.style.border = '1px solid var(--color-grey-light)';
    acceptCard.style.backgroundColor = 'transparent';
    document.getElementById('rejectDetailsSection').style.display = 'block';
    
    // Add required to reject fields
    document.getElementById('rejectReason').setAttribute('required', 'required');
    document.getElementById('rejectQuantity').setAttribute('required', 'required');
    document.getElementById('rejectNotes').setAttribute('required', 'required');
    
    // Pre-fill reject quantity with full quantity
    document.getElementById('rejectQuantity').value = currentInspectionData.quantity;
  }
  
  WMS.showNotification(`Inspection result: ${result.toUpperCase()}`, 'info');
}

// Save inspection draft
function saveInspectionDraft() {
  const draftData = collectInspectionData();
  
  // Save to localStorage
  const drafts = WMS.Storage.get('inspectionDrafts') || [];
  const existingIndex = drafts.findIndex(d => d.lpn === currentInspectionLPN);
  
  if (existingIndex >= 0) {
    drafts[existingIndex] = draftData;
  } else {
    drafts.push(draftData);
  }
  
  WMS.Storage.set('inspectionDrafts', drafts);
  WMS.showNotification('Inspection draft saved', 'success');
}

// Collect inspection data from form
function collectInspectionData() {
  return {
    lpn: currentInspectionLPN,
    result: document.getElementById('inspectionResult').value,
    visualCondition: document.getElementById('visualCondition').value,
    packagingCondition: document.getElementById('packagingCondition').value,
    dimensionsCheck: document.getElementById('dimensionsCheck').value,
    weightCheck: document.getElementById('weightCheck').value,
    sampleSize: document.getElementById('sampleSize').value,
    lotNumber: document.getElementById('lotNumber').value,
    expirationDate: document.getElementById('expirationDate').value,
    mfgDate: document.getElementById('mfgDate').value,
    serialNumbers: document.getElementById('serialNumbers').value,
    rejectReason: document.getElementById('rejectReason').value,
    rejectQuantity: document.getElementById('rejectQuantity').value,
    rejectNotes: document.getElementById('rejectNotes').value,
    disposition: document.getElementById('disposition').value,
    inspectorNotes: document.getElementById('inspectorNotes').value,
    timestamp: new Date().toISOString()
  };
}

// Cancel inspection
function cancelInspection() {
  if (confirm('Are you sure you want to cancel this inspection? Unsaved changes will be lost.')) {
    resetInspectionForm();
    WMS.showNotification('Inspection cancelled', 'info');
  }
}

// Reset inspection form
function resetInspectionForm() {
  document.getElementById('inspectionForm').style.display = 'none';
  currentInspectionLPN = null;
  currentInspectionData = null;
  inspectionResult = null;
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
  const inspectionForm = document.getElementById('inspectionFormElement');
  
  if (inspectionForm) {
    inspectionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!inspectionResult) {
        WMS.showNotification('Please select Accept or Reject decision', 'error');
        return;
      }
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      // Collect inspection data
      const inspectionData = collectInspectionData();
      
      // Save completed inspection
      const inspections = WMS.Storage.get('completedInspections') || [];
      inspections.unshift({
        ...currentInspectionData,
        ...inspectionData,
        inspector: 'Ashish Kumar',
        completedDate: WMS.formatDateTime(new Date())
      });
      WMS.Storage.set('completedInspections', inspections);
      
      // Remove from drafts if exists
      const drafts = WMS.Storage.get('inspectionDrafts') || [];
      const updatedDrafts = drafts.filter(d => d.lpn !== currentInspectionLPN);
      WMS.Storage.set('inspectionDrafts', updatedDrafts);
      
      // Show success message based on result
      if (inspectionResult === 'accept') {
        WMS.showNotification(`Inspection completed: ${currentInspectionLPN} ACCEPTED. Material ready for put-away.`, 'success');
      } else {
        WMS.showNotification(`Inspection completed: ${currentInspectionLPN} REJECTED. Material disposition: ${inspectionData.disposition || 'Pending'}`, 'success');
      }
      
      // Update completed inspections table
      addCompletedInspectionRow(inspections[0]);
      
      // Reset form
      resetInspectionForm();
    });
  }
  
  // Auto-save every 30 seconds
  setInterval(() => {
    if (currentInspectionLPN && document.getElementById('inspectionForm').style.display !== 'none') {
      saveInspectionDraft();
    }
  }, 30000);
});

// Add completed inspection row to table
function addCompletedInspectionRow(inspection) {
  const tbody = document.getElementById('completedInspections');
  const row = document.createElement('tr');
  
  const resultBadge = inspection.result === 'accept' 
    ? '<span class="badge badge-primary">Accepted</span>'
    : '<span class="badge badge-outline">Rejected</span>';
  
  row.innerHTML = `
    <td><strong>${inspection.lpn}</strong></td>
    <td>${inspection.item}</td>
    <td>${resultBadge}</td>
    <td>${inspection.quantity} ${inspection.uom}</td>
    <td>${inspection.lotNumber}</td>
    <td>${inspection.inspector}</td>
    <td>${inspection.completedDate}</td>
    <td>
      <button class="btn btn-sm btn-outline">View Details</button>
    </td>
  `;
  
  // Insert at the beginning
  tbody.insertBefore(row, tbody.firstChild);
}

// Load saved data on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load completed inspections
  const inspections = WMS.Storage.get('completedInspections') || [];
  
  inspections.slice(0, 10).forEach(inspection => {
    // Rows are already in HTML, this is for demo purposes
    // In production, you'd populate from the actual data
  });
});
