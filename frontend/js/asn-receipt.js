// DLT WMS - ASN Receipt Module JavaScript
// Handles ASN receipt processing

let currentASNMode = null;
let currentASNData = null;
let currentLPNIndex = 0;
let receiptData = {
  lpnsReceived: 0,
  totalQuantity: 0,
  discrepancies: 0,
  items: []
};

// Select ASN receipt mode
function selectASNMode(mode) {
  currentASNMode = mode;
  
  const modeLabels = {
    'express': 'Express Receipt',
    'confirm': 'Confirm Receipt'
  };
  
  WMS.showNotification(`${modeLabels[mode]} mode selected. Please scan or enter ASN number.`, 'info');
  
  // Focus on ASN number input
  setTimeout(() => {
    document.getElementById('asnNumber').focus();
  }, 100);
}

// Search for ASN
function searchASN() {
  const asnNumber = document.getElementById('asnNumber').value.trim();
  
  if (!asnNumber) {
    WMS.showNotification('Please enter an ASN number', 'error');
    return;
  }
  
  // Simulate ASN lookup
  loadASNDetails(asnNumber);
}

// Load ASN details
function loadASNDetails(asnNumber) {
  // Simulate loading
  WMS.showNotification('Loading ASN details...', 'info');
  
  setTimeout(() => {
    // Mock ASN data
    currentASNData = {
      asnNumber: asnNumber,
      supplier: 'ABC Logistics Inc.',
      poNumber: 'PO-45678',
      expectedDate: '2025-11-15',
      totalLPNs: 5,
      totalItems: 12,
      totalQuantity: 1250,
      totalWeight: 850,
      lpns: [
        { lpn: 'LPN-ASN-001', item: 'ITM-5678', description: 'Widget Assembly A', quantity: 250, uom: 'EA', lot: 'LOT-2025-100' },
        { lpn: 'LPN-ASN-002', item: 'ITM-5679', description: 'Component B', quantity: 300, uom: 'EA', lot: 'LOT-2025-101' },
        { lpn: 'LPN-ASN-003', item: 'ITM-5680', description: 'Part C', quantity: 400, uom: 'EA', lot: 'LOT-2025-102' },
        { lpn: 'LPN-ASN-004', item: 'ITM-5681', description: 'Assembly D', quantity: 150, uom: 'EA', lot: 'LOT-2025-103' },
        { lpn: 'LPN-ASN-005', item: 'ITM-5682', description: 'Component E', quantity: 150, uom: 'EA', lot: 'LOT-2025-104' }
      ]
    };
    
    displayASNDetails();
    WMS.showNotification(`ASN ${asnNumber} loaded successfully`, 'success');
  }, 1000);
}

// Display ASN details
function displayASNDetails() {
  document.getElementById('asnNumberDisplay').textContent = currentASNData.asnNumber;
  document.getElementById('asnSupplier').textContent = currentASNData.supplier;
  document.getElementById('asnPO').textContent = currentASNData.poNumber;
  document.getElementById('asnExpectedDate').textContent = currentASNData.expectedDate;
  
  document.getElementById('asnDetails').style.display = 'block';
  document.getElementById('asnDetails').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Process ASN
function processASN() {
  if (!currentASNMode) {
    WMS.showNotification('Please select a receipt mode first', 'error');
    return;
  }
  
  if (currentASNMode === 'express') {
    processExpressReceipt();
  } else {
    processConfirmReceipt();
  }
}

// Process Express Receipt
function processExpressReceipt() {
  WMS.showNotification('Processing express receipt...', 'info');
  
  // Simulate processing all LPNs
  setTimeout(() => {
    receiptData.lpnsReceived = currentASNData.totalLPNs;
    receiptData.totalQuantity = currentASNData.totalQuantity;
    receiptData.discrepancies = 0;
    
    // Save receipt
    const receiptRecord = {
      asnNumber: currentASNData.asnNumber,
      mode: 'express',
      ...receiptData,
      timestamp: new Date().toISOString()
    };
    
    const receipts = WMS.Storage.get('asnReceipts') || [];
    receipts.push(receiptRecord);
    WMS.Storage.set('asnReceipts', receipts);
    
    showReceiptSummary();
    WMS.showNotification('Express receipt completed successfully!', 'success');
  }, 2000);
}

// Process Confirm Receipt
function processConfirmReceipt() {
  currentLPNIndex = 0;
  receiptData = {
    lpnsReceived: 0,
    totalQuantity: 0,
    discrepancies: 0,
    items: []
  };
  
  document.getElementById('confirmModeForm').style.display = 'block';
  document.getElementById('confirmModeForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  loadNextLPN();
}

// Load next LPN for confirmation
function loadNextLPN() {
  if (currentLPNIndex >= currentASNData.lpns.length) {
    // All LPNs processed
    showReceiptSummary();
    return;
  }
  
  const lpnData = currentASNData.lpns[currentLPNIndex];
  
  document.getElementById('expectedLPN').value = lpnData.lpn;
  document.getElementById('confirmItem').value = lpnData.item;
  document.getElementById('expectedQuantity').value = lpnData.quantity;
  document.getElementById('expectedLot').value = lpnData.lot;
  
  document.getElementById('confirmLPN').value = '';
  document.getElementById('confirmQuantity').value = '';
  document.getElementById('confirmLot').value = '';
  document.getElementById('confirmSerial').value = '';
  
  document.getElementById('discrepancyAlert').style.display = 'none';
  
  document.getElementById('confirmLPN').focus();
}

// Next LPN
function nextLPN() {
  currentLPNIndex++;
  loadNextLPN();
}

// Skip LPN
function skipLPN() {
  if (confirm('Are you sure you want to skip this LPN?')) {
    currentLPNIndex++;
    loadNextLPN();
  }
}

// Show receipt summary
function showReceiptSummary() {
  document.getElementById('confirmModeForm').style.display = 'none';
  
  document.getElementById('summaryLPNs').textContent = receiptData.lpnsReceived;
  document.getElementById('summaryQuantity').textContent = WMS.formatNumber(receiptData.totalQuantity);
  document.getElementById('summaryDiscrepancies').textContent = receiptData.discrepancies;
  
  document.getElementById('receiptSummary').style.display = 'block';
  document.getElementById('receiptSummary').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Print receipt
function printReceipt() {
  WMS.showNotification('Preparing receipt for printing...', 'info');
  setTimeout(() => {
    window.print();
  }, 500);
}

// Generate discrepancy report
function generateDiscrepancyReport() {
  if (receiptData.discrepancies === 0) {
    WMS.showNotification('No discrepancies found in this receipt', 'info');
    return;
  }
  
  WMS.showNotification('Generating discrepancy report...', 'info');
  // In real implementation, this would generate and download a report
  setTimeout(() => {
    WMS.showNotification('Discrepancy report generated', 'success');
  }, 1500);
}

// Complete ASN receipt
function completeASNReceipt() {
  resetASN();
  WMS.showNotification('Receipt completed. Ready for new ASN.', 'success');
}

// Reset ASN
function resetASN() {
  document.getElementById('asnNumber').value = '';
  document.getElementById('asnDetails').style.display = 'none';
  document.getElementById('confirmModeForm').style.display = 'none';
  document.getElementById('receiptSummary').style.display = 'none';
  
  currentASNData = null;
  currentASNMode = null;
  currentLPNIndex = 0;
  receiptData = {
    lpnsReceived: 0,
    totalQuantity: 0,
    discrepancies: 0,
    items: []
  };
  
  document.getElementById('asnNumber').focus();
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
  const confirmForm = document.getElementById('confirmFormElement');
  
  if (confirmForm) {
    confirmForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const lpnData = currentASNData.lpns[currentLPNIndex];
      const scannedLPN = document.getElementById('confirmLPN').value;
      const actualQuantity = parseInt(document.getElementById('confirmQuantity').value);
      const actualLot = document.getElementById('confirmLot').value;
      
      // Check for discrepancies
      let hasDiscrepancy = false;
      let discrepancyMsg = '';
      
      if (scannedLPN !== lpnData.lpn) {
        hasDiscrepancy = true;
        discrepancyMsg += `LPN mismatch. Expected: ${lpnData.lpn}, Actual: ${scannedLPN}. `;
      }
      
      if (actualQuantity !== lpnData.quantity) {
        hasDiscrepancy = true;
        discrepancyMsg += `Quantity variance. Expected: ${lpnData.quantity}, Actual: ${actualQuantity}. `;
      }
      
      if (actualLot && actualLot !== lpnData.lot) {
        hasDiscrepancy = true;
        discrepancyMsg += `Lot mismatch. Expected: ${lpnData.lot}, Actual: ${actualLot}. `;
      }
      
      if (hasDiscrepancy) {
        document.getElementById('discrepancyMessage').textContent = discrepancyMsg;
        document.getElementById('discrepancyAlert').style.display = 'block';
        receiptData.discrepancies++;
      }
      
      // Record the receipt
      receiptData.lpnsReceived++;
      receiptData.totalQuantity += actualQuantity;
      receiptData.items.push({
        lpn: scannedLPN,
        item: lpnData.item,
        expectedQty: lpnData.quantity,
        actualQty: actualQuantity,
        hasDiscrepancy: hasDiscrepancy
      });
      
      WMS.showNotification(`LPN ${scannedLPN} confirmed successfully`, 'success');
      
      // Move to next LPN
      setTimeout(() => {
        currentLPNIndex++;
        loadNextLPN();
      }, 1000);
    });
  }
  
  // Enter key on ASN number
  const asnInput = document.getElementById('asnNumber');
  if (asnInput) {
    asnInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchASN();
      }
    });
  }
});
