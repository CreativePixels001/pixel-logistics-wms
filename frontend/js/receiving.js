// DLT WMS - Receiving Module JavaScript
// Handles all receiving functionality

let currentReceiptType = null;
let lpnCounter = 1000;

// Select receipt type
function selectReceiptType(type) {
  currentReceiptType = type;
  
  // Update label
  const labels = {
    'standard': 'Standard Receipt',
    'direct': 'Direct Receipt',
    'inspection': 'Inspection Required'
  };
  
  document.getElementById('receiptTypeLabel').textContent = labels[type];
  
  // Show/hide location section based on type
  const locationSection = document.getElementById('locationSection');
  if (type === 'direct') {
    locationSection.style.display = 'block';
    document.getElementById('subinventory').required = true;
    document.getElementById('locator').required = true;
  } else {
    locationSection.style.display = 'none';
    document.getElementById('subinventory').required = false;
    document.getElementById('locator').required = false;
  }
  
  // Show form
  document.getElementById('receiptForm').style.display = 'block';
  
  // Scroll to form
  document.getElementById('receiptForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Show notification
  WMS.showNotification(`${labels[type]} selected. Please fill in the receipt details.`, 'info');
}

// Generate LPN
function generateLPN() {
  lpnCounter++;
  const lpnNumber = `LPN-${String(lpnCounter).padStart(6, '0')}`;
  document.getElementById('lpnNumber').value = lpnNumber;
  WMS.showNotification(`LPN ${lpnNumber} generated successfully`, 'success');
}

// Reset form
function resetForm() {
  document.getElementById('receiptFormElement').reset();
  document.getElementById('receiptForm').style.display = 'none';
  currentReceiptType = null;
  WMS.showNotification('Form reset successfully', 'info');
}

// Handle document type change
document.addEventListener('DOMContentLoaded', function() {
  const documentTypeSelect = document.getElementById('documentType');
  if (documentTypeSelect) {
    documentTypeSelect.addEventListener('change', function() {
      const docType = this.value;
      const supplierField = document.getElementById('supplier');
      
      // Simulate auto-population based on document type
      const supplierMap = {
        'PO': 'ABC Suppliers Inc.',
        'ASN': 'XYZ Logistics',
        'RMA': 'Customer Returns',
        'INTSHIP': 'Internal Transfer',
        'INTREQ': 'Internal Requisition'
      };
      
      if (docType && supplierMap[docType]) {
        supplierField.value = supplierMap[docType];
        supplierField.style.backgroundColor = 'var(--color-grey-lightest)';
      }
    });
  }

  // Handle item number input
  const itemNumberInput = document.getElementById('itemNumber');
  if (itemNumberInput) {
    itemNumberInput.addEventListener('blur', function() {
      const itemNumber = this.value.trim();
      if (itemNumber) {
        // Simulate item lookup
        const itemDescField = document.getElementById('itemDescription');
        itemDescField.value = `${itemNumber} - Sample Item Description`;
        itemDescField.style.backgroundColor = 'var(--color-grey-lightest)';
      }
    });
  }

  // Handle form submission
  const receiptForm = document.getElementById('receiptFormElement');
  if (receiptForm) {
    receiptForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      // Collect form data
      const receiptData = {
        receiptType: currentReceiptType,
        documentType: document.getElementById('documentType').value,
        documentNumber: document.getElementById('documentNumber').value,
        supplier: document.getElementById('supplier').value,
        lineNumber: document.getElementById('lineNumber').value,
        lpnNumber: document.getElementById('lpnNumber').value,
        intoLPN: document.getElementById('intoLPN').value,
        itemNumber: document.getElementById('itemNumber').value,
        itemDescription: document.getElementById('itemDescription').value,
        quantity: document.getElementById('quantity').value,
        uom: document.getElementById('uom').value,
        lotNumber: document.getElementById('lotNumber').value,
        serialNumbers: document.getElementById('serialNumbers').value,
        timestamp: new Date().toISOString()
      };
      
      // Add location data for direct receipt
      if (currentReceiptType === 'direct') {
        receiptData.subinventory = document.getElementById('subinventory').value;
        receiptData.locator = document.getElementById('locator').value;
      }
      
      // Save to local storage
      const receipts = WMS.Storage.get('receipts') || [];
      receipts.push(receiptData);
      WMS.Storage.set('receipts', receipts);
      
      // Generate receipt number
      const receiptNumber = `RCV-2025-${String(receipts.length).padStart(4, '0')}`;
      
      // Show success message
      WMS.showNotification(
        `Receipt ${receiptNumber} completed successfully! LPN: ${receiptData.lpnNumber}`,
        'success'
      );
      
      // Reset form after short delay
      setTimeout(() => {
        resetForm();
        // Optionally redirect to dashboard
        // window.location.href = 'index.html';
      }, 2000);
    });
  }
});

// Auto-save draft functionality
let autoSaveInterval;

function startAutoSave() {
  autoSaveInterval = setInterval(() => {
    const form = document.getElementById('receiptFormElement');
    if (form && currentReceiptType) {
      const formData = new FormData(form);
      const draftData = {};
      
      for (let [key, value] of formData.entries()) {
        draftData[key] = value;
      }
      
      draftData.receiptType = currentReceiptType;
      draftData.lastSaved = new Date().toISOString();
      
      WMS.Storage.set('receiptDraft', draftData);
      console.log('Draft auto-saved');
    }
  }, 30000); // Auto-save every 30 seconds
}

function loadDraft() {
  const draft = WMS.Storage.get('receiptDraft');
  if (draft && confirm('A draft receipt was found. Would you like to continue from where you left off?')) {
    // Load draft data into form
    Object.keys(draft).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        element.value = draft[key];
      }
    });
    
    if (draft.receiptType) {
      selectReceiptType(draft.receiptType);
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadDraft();
  startAutoSave();
});

// Clear auto-save on form reset
window.addEventListener('beforeunload', function() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
});
