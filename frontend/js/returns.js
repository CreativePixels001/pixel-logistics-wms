// DLT WMS - Returns Processing Module JavaScript
// Handles RMA, return-to-supplier, and LPN-based returns

let currentReturnType = null;

// Select return type
function selectReturnType(type) {
  currentReturnType = type;
  
  const typeLabels = {
    'rma': 'RMA Return',
    'supplier': 'Return to Supplier',
    'lpn': 'LPN-based Return'
  };
  
  document.getElementById('returnFormTitle').textContent = typeLabels[type];
  
  // Show/hide RMA field
  if (type === 'rma') {
    document.getElementById('rmaField').style.display = 'block';
    document.getElementById('rmaNumber').setAttribute('required', 'required');
  } else {
    document.getElementById('rmaField').style.display = 'none';
    document.getElementById('rmaNumber').removeAttribute('required');
  }
  
  // Show/hide supplier section
  if (type === 'supplier') {
    document.getElementById('supplierSection').style.display = 'block';
    document.getElementById('supplierName').setAttribute('required', 'required');
  } else {
    document.getElementById('supplierSection').style.display = 'none';
    document.getElementById('supplierName').removeAttribute('required');
  }
  
  document.getElementById('returnForm').style.display = 'block';
  document.getElementById('returnForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  WMS.showNotification(`${typeLabels[type]} selected. Enter return details.`, 'info');
}

// Cancel return
function cancelReturn() {
  if (confirm('Are you sure you want to cancel this return? Unsaved changes will be lost.')) {
    resetReturnForm();
    WMS.showNotification('Return cancelled', 'info');
  }
}

// Reset return form
function resetReturnForm() {
  document.getElementById('returnForm').style.display = 'none';
  document.getElementById('returnFormElement').reset();
  currentReturnType = null;
}

// Save return draft
function saveReturnDraft() {
  const draftData = collectReturnData();
  
  // Save to localStorage
  const drafts = WMS.Storage.get('returnDrafts') || [];
  const timestamp = new Date().toISOString();
  
  drafts.push({
    ...draftData,
    timestamp: timestamp,
    status: 'draft'
  });
  
  WMS.Storage.set('returnDrafts', drafts);
  WMS.showNotification('Return draft saved', 'success');
}

// Collect return data from form
function collectReturnData() {
  return {
    type: currentReturnType,
    rmaNumber: document.getElementById('rmaNumber').value,
    returnReason: document.getElementById('returnReason').value,
    originalReceipt: document.getElementById('originalReceipt').value,
    lpn: document.getElementById('returnLPN').value,
    item: document.getElementById('returnItem').value,
    quantity: document.getElementById('returnQuantity').value,
    uom: document.getElementById('returnUOM').value,
    disposition: document.getElementById('disposition').value,
    location: document.getElementById('returnLocation').value,
    supplierName: document.getElementById('supplierName').value,
    supplierContact: document.getElementById('supplierContact').value,
    carrier: document.getElementById('returnCarrier').value,
    notes: document.getElementById('returnNotes').value
  };
}

// Lookup LPN for return
function lookupLPN(lpn) {
  if (!lpn) return;
  
  WMS.showNotification('Looking up LPN...', 'info');
  
  // Simulate LPN lookup
  setTimeout(() => {
    // Mock data
    const lpnData = {
      lpn: lpn,
      item: 'ITM-5678',
      quantity: 250,
      uom: 'EA',
      location: 'A-01-01-A'
    };
    
    document.getElementById('returnItem').value = lpnData.item;
    document.getElementById('availableQuantity').value = lpnData.quantity;
    document.getElementById('returnUOM').value = lpnData.uom;
    document.getElementById('returnLocation').value = lpnData.location;
    
    WMS.showNotification('LPN details loaded', 'success');
  }, 1000);
}

// Generate return number
function generateReturnNumber() {
  const returns = WMS.Storage.get('returns') || [];
  const returnNumber = `RTN-2025-${String(returns.length + 1).padStart(3, '0')}`;
  return returnNumber;
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const returnForm = document.getElementById('returnFormElement');
  
  if (returnForm) {
    returnForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      // Collect return data
      const returnData = collectReturnData();
      const returnNumber = generateReturnNumber();
      
      // Save return
      const returns = WMS.Storage.get('returns') || [];
      returns.unshift({
        returnNumber: returnNumber,
        ...returnData,
        createdDate: WMS.formatDate(new Date()),
        status: 'Pending Approval',
        createdBy: 'Ashish Kumar'
      });
      WMS.Storage.set('returns', returns);
      
      // Add to open returns table
      addOpenReturnRow(returns[0]);
      
      // Show success
      const typeLabels = {
        'rma': 'RMA return',
        'supplier': 'Return to supplier',
        'lpn': 'LPN-based return'
      };
      
      WMS.showNotification(`${typeLabels[currentReturnType]} created: ${returnNumber}`, 'success');
      
      // Reset form
      resetReturnForm();
    });
  }
  
  // LPN lookup on blur
  const lpnInput = document.getElementById('returnLPN');
  if (lpnInput) {
    lpnInput.addEventListener('blur', function() {
      lookupLPN(this.value);
    });
    
    lpnInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        lookupLPN(this.value);
      }
    });
  }
  
  // Update supplier section when disposition changes
  const dispositionSelect = document.getElementById('disposition');
  if (dispositionSelect) {
    dispositionSelect.addEventListener('change', function() {
      if (this.value === 'return-supplier' && currentReturnType !== 'supplier') {
        document.getElementById('supplierSection').style.display = 'block';
        document.getElementById('supplierName').setAttribute('required', 'required');
      } else if (currentReturnType !== 'supplier') {
        document.getElementById('supplierSection').style.display = 'none';
        document.getElementById('supplierName').removeAttribute('required');
      }
    });
  }
});

// Add open return row to table
function addOpenReturnRow(returnData) {
  const tbody = document.getElementById('openReturns');
  const row = document.createElement('tr');
  
  const statusBadge = returnData.status === 'Approved' 
    ? '<span class="badge badge-primary">Approved</span>'
    : returnData.status === 'In Process'
    ? '<span class="badge badge-primary">In Process</span>'
    : '<span class="badge badge-outline">Pending Approval</span>';
  
  row.innerHTML = `
    <td><strong>${returnData.returnNumber}</strong></td>
    <td>${returnData.rmaNumber || 'Direct Return'}</td>
    <td>${returnData.lpn}</td>
    <td>${returnData.item}</td>
    <td>${returnData.quantity} ${returnData.uom}</td>
    <td>${returnData.returnReason}</td>
    <td>${returnData.disposition}</td>
    <td>${returnData.createdDate}</td>
    <td>${statusBadge}</td>
  `;
  
  tbody.insertBefore(row, tbody.firstChild);
}

// Auto-save every 30 seconds
setInterval(() => {
  if (currentReturnType && document.getElementById('returnForm').style.display !== 'none') {
    const lpn = document.getElementById('returnLPN').value;
    if (lpn) {
      saveReturnDraft();
    }
  }
}, 30000);
