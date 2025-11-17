// DLT WMS - Shipping Operations Module JavaScript
// Handles ship confirm, BOL generation, manifest creation

let currentShipment = null;
let selectedCartons = [];

// Load shipment for shipping
function loadShipment(orderNum) {
  WMS.showNotification('Loading shipment details...', 'info');
  
  setTimeout(() => {
    // Mock shipment data - would fetch from packed cartons
    const packedCartons = WMS.Storage.get('packedCartons') || [];
    
    // Filter cartons for this order
    const orderCartons = packedCartons.filter(c => c.orderNum === orderNum);
    
    if (orderCartons.length === 0) {
      // Create mock data if no real cartons found
      currentShipment = {
        orderNum: orderNum,
        customer: 'Acme Corp',
        shipTo: 'Chicago, IL',
        carrier: 'FedEx Express',
        cartons: [
          { 
            number: 'CRTN-001', 
            tracking: 'TRK1234567890', 
            weight: 25.5, 
            length: 18, width: 14, height: 12,
            stage: 'Stage A'
          },
          { 
            number: 'CRTN-002', 
            tracking: 'TRK1234567891', 
            weight: 18.2, 
            length: 18, width: 14, height: 12,
            stage: 'Stage A'
          },
          { 
            number: 'CRTN-003', 
            tracking: 'TRK1234567892', 
            weight: 24.8, 
            length: 18, width: 14, height: 12,
            stage: 'Stage A'
          }
        ]
      };
    } else {
      currentShipment = {
        orderNum: orderNum,
        customer: orderCartons[0].customer,
        shipTo: 'Chicago, IL', // Would come from order data
        carrier: orderCartons[0].carrier,
        cartons: orderCartons
      };
    }
    
    document.getElementById('shipCustomer').value = currentShipment.customer;
    document.getElementById('shipTo').value = currentShipment.shipTo;
    
    // Calculate totals
    const totalCartons = currentShipment.cartons.length;
    const totalWeight = currentShipment.cartons.reduce((sum, c) => sum + parseFloat(c.weight), 0);
    const totalVolume = currentShipment.cartons.reduce((sum, c) => {
      const vol = (c.length * c.width * c.height) / 1728; // Convert to cubic feet
      return sum + vol;
    }, 0);
    
    document.getElementById('shipCartons').textContent = totalCartons;
    document.getElementById('shipWeight').textContent = totalWeight.toFixed(1) + ' lbs';
    document.getElementById('shipVolume').textContent = totalVolume.toFixed(1) + ' cu.ft';
    document.getElementById('shipCarrier').textContent = currentShipment.carrier;
    
    // Populate cartons table
    populateShipmentCartons();
    
    // Show sections
    document.getElementById('shipmentDetails').style.display = 'block';
    document.getElementById('carrierInfo').style.display = 'block';
    document.getElementById('shipActions').style.display = 'flex';
    
    // Set default ship date to today
    document.getElementById('shipDate').value = new Date().toISOString().split('T')[0];
    
    // Pre-select carrier
    document.getElementById('carrierSelect').value = 'fedex-express';
    
    WMS.showNotification('Shipment loaded successfully', 'success');
    
  }, 1000);
}

// Populate shipment cartons table
function populateShipmentCartons() {
  const tbody = document.getElementById('shipmentCartonsTable');
  tbody.innerHTML = '';
  
  currentShipment.cartons.forEach((carton, index) => {
    const dimensions = `${carton.length}x${carton.width}x${carton.height}`;
    
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input type="checkbox" class="carton-checkbox" data-carton="${carton.number}" checked></td>
      <td><strong>${carton.number}</strong></td>
      <td>${carton.tracking}</td>
      <td>${carton.weight} lbs</td>
      <td>${dimensions}"</td>
      <td>${carton.stage || 'N/A'}</td>
      <td><span class="badge badge-outline">Ready</span></td>
    `;
  });
  
  // Select all by default
  selectedCartons = currentShipment.cartons.map(c => c.number);
}

// Toggle all cartons
function toggleAllCartons(checked) {
  const checkboxes = document.querySelectorAll('.carton-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = checked;
  });
  
  if (checked) {
    selectedCartons = currentShipment.cartons.map(c => c.number);
  } else {
    selectedCartons = [];
  }
}

// Print BOL
function printBOL() {
  if (!currentShipment) {
    WMS.showNotification('No shipment loaded', 'error');
    return;
  }
  
  if (selectedCartons.length === 0) {
    WMS.showNotification('No cartons selected', 'error');
    return;
  }
  
  const bolNum = 'BOL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  document.getElementById('proBOL').value = bolNum;
  
  WMS.showNotification(`Printing BOL ${bolNum} for ${selectedCartons.length} cartons...`, 'info');
  
  setTimeout(() => {
    WMS.showNotification('BOL printed successfully', 'success');
  }, 1500);
}

// Create manifest
function createManifest() {
  if (!currentShipment) {
    WMS.showNotification('No shipment loaded', 'error');
    return;
  }
  
  const carrier = document.getElementById('carrierSelect').value;
  if (!carrier) {
    WMS.showNotification('Please select carrier', 'error');
    return;
  }
  
  const manifestID = 'MAN-' + new Date().getFullYear() + '-' + 
                    String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  const manifest = {
    manifestID: manifestID,
    carrier: document.getElementById('carrierSelect').options[document.getElementById('carrierSelect').selectedIndex].text,
    orders: 1, // Would count unique orders
    cartons: selectedCartons.length,
    weight: currentShipment.cartons
      .filter(c => selectedCartons.includes(c.number))
      .reduce((sum, c) => sum + parseFloat(c.weight), 0),
    created: WMS.formatDateTime(new Date()),
    status: 'Open'
  };
  
  // Save to storage
  const manifests = WMS.Storage.get('manifests') || [];
  manifests.unshift(manifest);
  WMS.Storage.set('manifests', manifests);
  
  WMS.showNotification(`Manifest ${manifestID} created for ${carrier}`, 'success');
  
  // Refresh manifests table
  addManifestToTable(manifest);
}

// Add manifest to table
function addManifestToTable(manifest) {
  const tbody = document.getElementById('manifestsTable');
  const row = tbody.insertRow(0);
  
  row.innerHTML = `
    <td><strong>${manifest.manifestID}</strong></td>
    <td>${manifest.carrier}</td>
    <td>${manifest.orders}</td>
    <td>${manifest.cartons}</td>
    <td>${manifest.weight.toFixed(1)} lbs</td>
    <td>${manifest.created}</td>
    <td><span class="badge badge-primary">Open</span></td>
    <td>
      <button class="btn btn-sm btn-primary" onclick="closeManifest('${manifest.manifestID}')">Close</button>
      <button class="btn btn-sm btn-outline" onclick="printManifest('${manifest.manifestID}')">Print</button>
    </td>
  `;
}

// Close manifest
function closeManifest(manifestID) {
  if (confirm(`Close manifest ${manifestID}? This will finalize the manifest for carrier pickup.`)) {
    WMS.showNotification(`Manifest ${manifestID} closed`, 'success');
    
    // Update storage
    const manifests = WMS.Storage.get('manifests') || [];
    const manifest = manifests.find(m => m.manifestID === manifestID);
    if (manifest) {
      manifest.status = 'Closed';
      manifest.closedDate = WMS.formatDateTime(new Date());
      WMS.Storage.set('manifests', manifests);
    }
    
    // Update table
    updateManifestStatus(manifestID, 'Closed');
  }
}

// Update manifest status in table
function updateManifestStatus(manifestID, newStatus) {
  const tbody = document.getElementById('manifestsTable');
  const rows = tbody.getElementsByTagName('tr');
  
  for (let row of rows) {
    const manifestCell = row.cells[0];
    if (manifestCell.textContent.includes(manifestID)) {
      const statusCell = row.cells[6];
      statusCell.innerHTML = '<span class="badge badge-primary">Closed</span>';
      
      const actionCell = row.cells[7];
      actionCell.innerHTML = `<button class="btn btn-sm btn-outline" onclick="printManifest('${manifestID}')">Print</button>`;
      break;
    }
  }
}

// Print manifest
function printManifest(manifestID) {
  WMS.showNotification(`Printing manifest ${manifestID}...`, 'info');
  
  setTimeout(() => {
    WMS.showNotification('Manifest printed successfully', 'success');
  }, 1500);
}

// New manifest
function newManifest() {
  WMS.showNotification('Scan first order to start new manifest', 'info');
  document.getElementById('shipOrderNum').focus();
}

// Cancel ship
function cancelShip() {
  if (confirm('Cancel shipping? Progress will be lost.')) {
    resetShipping();
    WMS.showNotification('Shipping cancelled', 'info');
  }
}

// Reset shipping interface
function resetShipping() {
  currentShipment = null;
  selectedCartons = [];
  
  document.getElementById('shipConfirmForm').reset();
  document.getElementById('shipmentDetails').style.display = 'none';
  document.getElementById('carrierInfo').style.display = 'none';
  document.getElementById('shipActions').style.display = 'none';
  
  document.getElementById('shipOrderNum').focus();
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const shipConfirmForm = document.getElementById('shipConfirmForm');
  
  if (shipConfirmForm) {
    shipConfirmForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      if (selectedCartons.length === 0) {
        WMS.showNotification('No cartons selected for shipping', 'error');
        return;
      }
      
      const shipment = {
        orderNum: currentShipment.orderNum,
        customer: currentShipment.customer,
        shipTo: currentShipment.shipTo,
        carrier: document.getElementById('carrierSelect').options[document.getElementById('carrierSelect').selectedIndex].text,
        serviceLevel: document.getElementById('serviceLevel').value,
        bolNum: document.getElementById('proBOL').value,
        trailerNum: document.getElementById('trailerNum').value,
        sealNum: document.getElementById('sealNum').value,
        shipDate: document.getElementById('shipDate').value,
        cartons: selectedCartons.length,
        weight: currentShipment.cartons
          .filter(c => selectedCartons.includes(c.number))
          .reduce((sum, c) => sum + parseFloat(c.weight), 0),
        shippedBy: 'Ashish Kumar',
        shippedTime: WMS.formatDateTime(new Date())
      };
      
      // Save to storage
      const shippedOrders = WMS.Storage.get('shippedOrders') || [];
      shippedOrders.unshift(shipment);
      WMS.Storage.set('shippedOrders', shippedOrders);
      
      WMS.showNotification(`Order ${shipment.orderNum} shipped successfully!`, 'success');
      
      // Add to shipped orders table
      addShippedOrderToTable(shipment);
      
      setTimeout(() => {
        resetShipping();
      }, 2000);
    });
  }
  
  // Order number lookup
  const orderNumInput = document.getElementById('shipOrderNum');
  if (orderNumInput) {
    orderNumInput.addEventListener('blur', function() {
      const orderNum = this.value.trim();
      if (orderNum && !currentShipment) {
        loadShipment(orderNum);
      }
    });
    
    orderNumInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const orderNum = this.value.trim();
        if (orderNum) {
          loadShipment(orderNum);
        }
      }
    });
  }
  
  // Track carton selection
  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('carton-checkbox')) {
      const cartonNum = e.target.getAttribute('data-carton');
      if (e.target.checked) {
        if (!selectedCartons.includes(cartonNum)) {
          selectedCartons.push(cartonNum);
        }
      } else {
        selectedCartons = selectedCartons.filter(c => c !== cartonNum);
      }
    }
  });
});

// Add shipped order to table
function addShippedOrderToTable(shipment) {
  const tbody = document.getElementById('shippedOrdersTable');
  const row = tbody.insertRow(0);
  
  row.innerHTML = `
    <td><strong>${shipment.orderNum}</strong></td>
    <td>${shipment.customer}</td>
    <td>${shipment.carrier}</td>
    <td>${shipment.cartons}</td>
    <td>${shipment.weight.toFixed(1)} lbs</td>
    <td>${shipment.bolNum || 'N/A'}</td>
    <td>${shipment.shippedTime}</td>
    <td><span class="badge badge-primary">Shipped</span></td>
  `;
}
