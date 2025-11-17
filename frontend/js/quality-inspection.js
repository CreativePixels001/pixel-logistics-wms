// DLT WMS - Quality Inspection Module JavaScript
// Handles quality inspections, defect recording, and disposition management

let currentInspection = null;
let defects = [];

// Start inspection
function startInspection(receiptNum) {
  document.getElementById('inspectionLPN').value = receiptNum;
  loadInspection(receiptNum);
}

// Load inspection
function loadInspection(lpn) {
  WMS.showNotification('Loading inspection details...', 'info');
  
  setTimeout(() => {
    // Mock inspection data
    currentInspection = {
      lpn: lpn,
      item: 'ITM-5678',
      description: 'Widget Assembly A',
      po: 'PO-2025-001',
      supplier: 'ABC Manufacturing',
      lot: 'LOT-2025-001',
      qty: 1000,
      uom: 'EA'
    };
    
    document.getElementById('inspectionItem').value = currentInspection.item;
    document.getElementById('inspectionDescription').value = currentInspection.description;
    document.getElementById('inspectionPO').textContent = currentInspection.po;
    document.getElementById('inspectionSupplier').textContent = currentInspection.supplier;
    document.getElementById('inspectionLot').textContent = currentInspection.lot;
    document.getElementById('inspectionQty').textContent = `${WMS.formatNumber(currentInspection.qty)} ${currentInspection.uom}`;
    
    // Show sections
    document.getElementById('receiptInfo').style.display = 'block';
    document.getElementById('inspectionPlan').style.display = 'block';
    document.getElementById('inspectionResults').style.display = 'block';
    document.getElementById('inspectionDecision').style.display = 'block';
    document.getElementById('inspectionActions').style.display = 'flex';
    
    defects = [];
    
    WMS.showNotification('Inspection loaded successfully', 'success');
  }, 1000);
}

// Update sample size based on inspection type
function updateSampleSize() {
  const inspectionType = document.getElementById('inspectionType').value;
  const totalQty = currentInspection ? currentInspection.qty : 1000;
  
  let sampleSize = 0;
  
  switch (inspectionType) {
    case 'full':
      sampleSize = totalQty;
      break;
    case 'sample':
      // Use AQL sampling plan (simplified)
      if (totalQty <= 150) {
        sampleSize = 13;
      } else if (totalQty <= 280) {
        sampleSize = 20;
      } else if (totalQty <= 500) {
        sampleSize = 32;
      } else if (totalQty <= 1200) {
        sampleSize = 50;
      } else {
        sampleSize = 80;
      }
      break;
    case 'skip-lot':
      sampleSize = Math.ceil(totalQty * 0.05); // 5% sample
      break;
  }
  
  document.getElementById('sampleSize').value = sampleSize;
}

// Calculate rejected units
document.addEventListener('DOMContentLoaded', function() {
  const unitsInspectedInput = document.getElementById('unitsInspected');
  const unitsAcceptedInput = document.getElementById('unitsAccepted');
  const unitsRejectedInput = document.getElementById('unitsRejected');
  
  function calculateRejected() {
    const inspected = parseInt(unitsInspectedInput.value) || 0;
    const accepted = parseInt(unitsAcceptedInput.value) || 0;
    const rejected = inspected - accepted;
    
    unitsRejectedInput.value = rejected > 0 ? rejected : 0;
    
    // Show defect section if there are rejected units
    if (rejected > 0) {
      document.getElementById('defectSection').style.display = 'block';
    } else {
      document.getElementById('defectSection').style.display = 'none';
    }
  }
  
  if (unitsInspectedInput) {
    unitsInspectedInput.addEventListener('input', calculateRejected);
  }
  if (unitsAcceptedInput) {
    unitsAcceptedInput.addEventListener('input', calculateRejected);
  }
});

// Add defect
function addDefect() {
  const defectType = document.getElementById('defectType').value;
  const severity = document.getElementById('defectSeverity').value;
  const qty = document.getElementById('defectQty').value;
  const description = document.getElementById('defectDescription').value;
  
  if (!defectType || !qty) {
    WMS.showNotification('Please enter defect type and quantity', 'error');
    return;
  }
  
  const defect = {
    type: defectType,
    severity: severity,
    qty: parseInt(qty),
    description: description
  };
  
  defects.push(defect);
  updateDefectsTable();
  
  // Clear inputs
  document.getElementById('defectType').value = '';
  document.getElementById('defectSeverity').value = 'critical';
  document.getElementById('defectQty').value = '';
  document.getElementById('defectDescription').value = '';
  
  WMS.showNotification('Defect recorded', 'success');
}

// Update defects table
function updateDefectsTable() {
  const tbody = document.getElementById('defectsTableBody');
  tbody.innerHTML = '';
  
  if (defects.length === 0) {
    document.getElementById('defectsList').style.display = 'none';
    return;
  }
  
  document.getElementById('defectsList').style.display = 'block';
  
  defects.forEach((defect, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${defect.type}</td>
      <td><span class="badge badge-outline">${defect.severity}</span></td>
      <td>${defect.qty}</td>
      <td>${defect.description || '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="removeDefect(${index})">Remove</button>
      </td>
    `;
  });
}

// Remove defect
function removeDefect(index) {
  defects.splice(index, 1);
  updateDefectsTable();
  WMS.showNotification('Defect removed', 'info');
}

// Update disposition
function updateDisposition() {
  const disposition = document.getElementById('disposition').value;
  
  if (disposition === 'reject' || disposition === 'hold') {
    document.getElementById('dispositionReason').required = true;
  } else {
    document.getElementById('dispositionReason').required = false;
  }
}

// Save inspection draft
function saveInspectionDraft() {
  if (!currentInspection) {
    WMS.showNotification('No inspection loaded', 'error');
    return;
  }
  
  const draft = {
    lpn: currentInspection.lpn,
    inspectionType: document.getElementById('inspectionType').value,
    sampleSize: document.getElementById('sampleSize').value,
    unitsInspected: document.getElementById('unitsInspected').value,
    unitsAccepted: document.getElementById('unitsAccepted').value,
    defects: [...defects],
    disposition: document.getElementById('disposition').value,
    savedBy: 'Ashish Kumar',
    savedDate: WMS.formatDateTime(new Date())
  };
  
  WMS.Storage.set(`inspectionDraft_${currentInspection.lpn}`, draft);
  WMS.showNotification('Inspection draft saved', 'success');
}

// Cancel inspection
function cancelInspection() {
  if (confirm('Cancel inspection? Draft will be saved.')) {
    saveInspectionDraft();
    resetInspection();
    WMS.showNotification('Inspection cancelled', 'info');
  }
}

// Reset inspection
function resetInspection() {
  document.getElementById('inspectionForm').reset();
  document.getElementById('receiptInfo').style.display = 'none';
  document.getElementById('inspectionPlan').style.display = 'none';
  document.getElementById('inspectionResults').style.display = 'none';
  document.getElementById('inspectionDecision').style.display = 'none';
  document.getElementById('inspectionActions').style.display = 'none';
  document.getElementById('defectSection').style.display = 'none';
  document.getElementById('defectsList').style.display = 'none';
  
  currentInspection = null;
  defects = [];
  
  document.getElementById('inspectionLPN').focus();
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const inspectionForm = document.getElementById('inspectionForm');
  
  if (inspectionForm) {
    inspectionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const unitsInspected = parseInt(document.getElementById('unitsInspected').value);
      const unitsAccepted = parseInt(document.getElementById('unitsAccepted').value);
      const unitsRejected = parseInt(document.getElementById('unitsRejected').value);
      const disposition = document.getElementById('disposition').value;
      
      // Validate disposition matches rejection
      if (unitsRejected > 0 && disposition === 'accept') {
        if (!confirm('Units were rejected but disposition is Accept. Continue?')) {
          return;
        }
      }
      
      const inspection = {
        lpn: currentInspection.lpn,
        item: currentInspection.item,
        lot: currentInspection.lot,
        po: currentInspection.po,
        supplier: currentInspection.supplier,
        inspectionType: document.getElementById('inspectionType').value,
        sampleSize: document.getElementById('sampleSize').value,
        aqlLevel: document.getElementById('aqlLevel').value,
        unitsInspected: unitsInspected,
        unitsAccepted: unitsAccepted,
        unitsRejected: unitsRejected,
        defects: [...defects],
        disposition: disposition,
        dispositionReason: document.getElementById('dispositionReason').value,
        comments: document.getElementById('inspectionComments').value,
        inspector: 'Ashish Kumar',
        inspectionDate: WMS.formatDateTime(new Date())
      };
      
      // Save to storage
      const completedInspections = WMS.Storage.get('completedInspections') || [];
      completedInspections.unshift(inspection);
      WMS.Storage.set('completedInspections', completedInspections);
      
      const passRate = ((unitsAccepted / unitsInspected) * 100).toFixed(1);
      WMS.showNotification(`Inspection completed! Pass rate: ${passRate}%`, 'success');
      
      // Remove from pending table
      removePendingInspection(currentInspection.lpn);
      
      // Apply disposition
      if (disposition === 'hold') {
        WMS.showNotification(`Lot ${currentInspection.lot} placed on quality hold`, 'info');
      }
      
      setTimeout(() => {
        resetInspection();
      }, 2000);
    });
  }
  
  // LPN lookup
  const lpnInput = document.getElementById('inspectionLPN');
  if (lpnInput) {
    lpnInput.addEventListener('blur', function() {
      const lpn = this.value.trim();
      if (lpn && !currentInspection) {
        loadInspection(lpn);
      }
    });
    
    lpnInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const lpn = this.value.trim();
        if (lpn) {
          loadInspection(lpn);
        }
      }
    });
  }
});

// Remove pending inspection from table
function removePendingInspection(receiptNum) {
  const tbody = document.getElementById('pendingInspectionsTable');
  const rows = tbody.getElementsByTagName('tr');
  
  for (let i = 0; i < rows.length; i++) {
    const receiptCell = rows[i].cells[0];
    if (receiptCell.textContent.includes(receiptNum)) {
      tbody.deleteRow(i);
      break;
    }
  }
}
