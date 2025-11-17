// DLT WMS - Packing & Staging Module JavaScript
// Handles packing workbench, carton management, label generation, and staging

let currentPackOrder = null;
let currentCarton = null;
let packedItems = [];
let cartonCount = 0;
let totalCartons = 0;

// Carton specifications
const cartonSpecs = {
  'small': { length: 12, width: 10, height: 8, maxWeight: 30 },
  'medium': { length: 18, width: 14, height: 12, maxWeight: 50 },
  'large': { length: 24, width: 18, height: 16, maxWeight: 70 }
};

// Load carton specifications
function loadCartonSpecs() {
  const cartonType = document.getElementById('cartonType').value;
  
  if (cartonType && cartonType !== 'custom') {
    const specs = cartonSpecs[cartonType];
    document.getElementById('cartonLength').value = specs.length;
    document.getElementById('cartonWidth').value = specs.width;
    document.getElementById('cartonHeight').value = specs.height;
    
    WMS.showNotification(`${cartonType.charAt(0).toUpperCase() + cartonType.slice(1)} box dimensions loaded`, 'info');
  } else if (cartonType === 'custom') {
    document.getElementById('cartonLength').value = '';
    document.getElementById('cartonWidth').value = '';
    document.getElementById('cartonHeight').value = '';
  }
}

// Load order for packing
function loadPackOrder(orderLPN) {
  WMS.showNotification('Loading order details...', 'info');
  
  setTimeout(() => {
    // Mock order data
    currentPackOrder = {
      orderNum: 'SO-2025-1001',
      customer: 'Acme Corp',
      carrier: 'FedEx Express',
      lines: [
        { item: 'ITM-5678', description: 'Widget Assembly A', ordered: 100, picked: 100, packed: 0, weight: 2.5 },
        { item: 'ITM-5679', description: 'Component B', ordered: 150, picked: 150, packed: 0, weight: 1.2 },
        { item: 'ITM-5680', description: 'Part C', ordered: 100, picked: 100, packed: 0, weight: 0.8 }
      ]
    };
    
    document.getElementById('packOrderNum').value = currentPackOrder.orderNum;
    document.getElementById('packCustomer').value = currentPackOrder.customer;
    
    // Calculate totals
    const totalLines = currentPackOrder.lines.length;
    const totalUnits = currentPackOrder.lines.reduce((sum, line) => sum + line.ordered, 0);
    const totalWeight = currentPackOrder.lines.reduce((sum, line) => sum + (line.ordered * line.weight), 0);
    
    document.getElementById('packTotalLines').textContent = totalLines;
    document.getElementById('packTotalUnits').textContent = totalUnits;
    document.getElementById('packTotalWeight').textContent = totalWeight.toFixed(1) + ' lbs';
    
    // Populate order lines table
    populateOrderLines();
    
    // Estimate cartons needed
    totalCartons = Math.ceil(totalUnits / 80); // Rough estimate
    document.getElementById('packCartonCount').textContent = totalCartons;
    cartonCount = 0;
    
    // Show order details
    document.getElementById('orderDetails').style.display = 'block';
    document.getElementById('cartonInfo').style.display = 'block';
    document.getElementById('packingList').style.display = 'block';
    document.getElementById('packingActions').style.display = 'flex';
    
    WMS.showNotification('Order loaded successfully', 'success');
    
    startNewCarton();
  }, 1000);
}

// Populate order lines table
function populateOrderLines() {
  const tbody = document.getElementById('packOrderLines');
  tbody.innerHTML = '';
  
  currentPackOrder.lines.forEach(line => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><strong>${line.item}</strong></td>
      <td>${line.description}</td>
      <td>${line.ordered}</td>
      <td>${line.picked}</td>
      <td id="packed_${line.item}">${line.packed}</td>
      <td>${line.packed === line.picked 
        ? '<span class="badge badge-primary">Complete</span>' 
        : '<span class="badge badge-outline">Packing</span>'}</td>
    `;
  });
}

// Start new carton
function startNewCarton() {
  cartonCount++;
  
  currentCarton = {
    number: `CRTN-${String(cartonCount).padStart(3, '0')}`,
    items: [],
    weight: 0
  };
  
  packedItems = [];
  
  document.getElementById('cartonNumber').value = currentCarton.number;
  document.getElementById('cartonOf').value = `${cartonCount} of ${totalCartons}`;
  document.getElementById('cartonType').value = '';
  document.getElementById('cartonLength').value = '';
  document.getElementById('cartonWidth').value = '';
  document.getElementById('cartonHeight').value = '';
  document.getElementById('cartonWeight').value = '';
  
  // Generate tracking number
  const trackingNum = 'TRK' + Math.random().toString(36).substring(2, 12).toUpperCase();
  document.getElementById('trackingNumber').value = trackingNum;
  
  updatePackedItemsList();
  
  WMS.showNotification(`Started carton ${cartonCount} of ${totalCartons}`, 'info');
  
  setTimeout(() => {
    document.getElementById('cartonType').focus();
  }, 100);
}

// Update packed items list
function updatePackedItemsList() {
  const tbody = document.getElementById('packedItemsList');
  tbody.innerHTML = '';
  
  if (packedItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-grey);">No items packed yet</td></tr>';
    return;
  }
  
  packedItems.forEach((item, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><strong>${item.itemNum}</strong></td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${item.lpn || 'N/A'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="removePackedItem(${index})">Remove</button>
      </td>
    `;
  });
}

// Remove packed item
function removePackedItem(index) {
  const removedItem = packedItems[index];
  
  // Update order line packed quantity
  const orderLine = currentPackOrder.lines.find(l => l.item === removedItem.itemNum);
  if (orderLine) {
    orderLine.packed -= removedItem.quantity;
    document.getElementById(`packed_${orderLine.item}`).textContent = orderLine.packed;
  }
  
  packedItems.splice(index, 1);
  updatePackedItemsList();
  
  WMS.showNotification('Item removed from carton', 'info');
}

// Close carton
function closeCarton() {
  if (packedItems.length === 0) {
    WMS.showNotification('Cannot close empty carton', 'error');
    return;
  }
  
  const weight = document.getElementById('cartonWeight').value;
  if (!weight) {
    WMS.showNotification('Please enter carton weight', 'error');
    return;
  }
  
  // Save carton
  const carton = {
    number: currentCarton.number,
    orderNum: currentPackOrder.orderNum,
    customer: currentPackOrder.customer,
    carrier: currentPackOrder.carrier,
    tracking: document.getElementById('trackingNumber').value,
    length: document.getElementById('cartonLength').value,
    width: document.getElementById('cartonWidth').value,
    height: document.getElementById('cartonHeight').value,
    weight: weight,
    items: [...packedItems],
    packedBy: 'Ashish Kumar',
    packedDate: WMS.formatDateTime(new Date())
  };
  
  // Save to storage
  const packedCartons = WMS.Storage.get('packedCartons') || [];
  packedCartons.unshift(carton);
  WMS.Storage.set('packedCartons', packedCartons);
  
  WMS.showNotification(`Carton ${currentCarton.number} closed successfully`, 'success');
  
  // Check if all items are packed
  const allPacked = currentPackOrder.lines.every(line => line.packed === line.picked);
  
  if (allPacked) {
    WMS.showNotification('All order lines packed! Order ready for shipping.', 'success');
    setTimeout(() => {
      if (confirm('Order complete. Start packing another order?')) {
        resetPacking();
      }
    }, 1500);
  } else {
    // Start new carton for remaining items
    setTimeout(() => {
      if (confirm('Carton closed. Start new carton for remaining items?')) {
        startNewCarton();
      }
    }, 1000);
  }
}

// Print label
function printLabel() {
  const cartonNum = document.getElementById('cartonNumber').value;
  const tracking = document.getElementById('trackingNumber').value;
  
  if (!cartonNum || !tracking) {
    WMS.showNotification('Carton number and tracking required', 'error');
    return;
  }
  
  WMS.showNotification(`Printing shipping label for ${cartonNum}...`, 'info');
  
  setTimeout(() => {
    WMS.showNotification('Label printed successfully', 'success');
  }, 1500);
}

// Print packing slip
function printPackingSlip() {
  if (!currentPackOrder) {
    WMS.showNotification('No order loaded', 'error');
    return;
  }
  
  WMS.showNotification(`Printing packing slip for ${currentPackOrder.orderNum}...`, 'info');
  
  setTimeout(() => {
    WMS.showNotification('Packing slip printed', 'success');
  }, 1500);
}

// Cancel packing
function cancelPacking() {
  if (confirm('Cancel packing? Carton data will be lost.')) {
    resetPacking();
    WMS.showNotification('Packing cancelled', 'info');
  }
}

// Reset packing interface
function resetPacking() {
  currentPackOrder = null;
  currentCarton = null;
  packedItems = [];
  cartonCount = 0;
  totalCartons = 0;
  
  document.getElementById('packingForm').reset();
  document.getElementById('orderDetails').style.display = 'none';
  document.getElementById('cartonInfo').style.display = 'none';
  document.getElementById('packingList').style.display = 'none';
  document.getElementById('packingActions').style.display = 'none';
  
  document.getElementById('packOrderLPN').focus();
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const packingForm = document.getElementById('packingForm');
  
  // Order/LPN lookup
  const orderLPNInput = document.getElementById('packOrderLPN');
  if (orderLPNInput) {
    orderLPNInput.addEventListener('blur', function() {
      const orderLPN = this.value.trim();
      if (orderLPN && !currentPackOrder) {
        loadPackOrder(orderLPN);
      }
    });
    
    orderLPNInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const orderLPN = this.value.trim();
        if (orderLPN) {
          loadPackOrder(orderLPN);
        }
      }
    });
  }
  
  // Item/LPN scan
  const packItemLPNInput = document.getElementById('packItemLPN');
  if (packItemLPNInput) {
    packItemLPNInput.addEventListener('blur', function() {
      const scanned = this.value.trim();
      if (scanned && currentPackOrder) {
        // Find matching item
        const orderLine = currentPackOrder.lines.find(l => 
          l.item === scanned || scanned.includes(l.item)
        );
        
        if (orderLine) {
          document.getElementById('packItem').value = orderLine.item;
          document.getElementById('packQty').value = '';
          document.getElementById('packQty').focus();
        } else {
          WMS.showNotification('Item not found in order', 'error');
          this.value = '';
        }
      }
    });
    
    packItemLPNInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.blur();
      }
    });
  }
  
  // Quantity entry
  const packQtyInput = document.getElementById('packQty');
  if (packQtyInput) {
    packQtyInput.addEventListener('blur', function() {
      const qty = parseInt(this.value);
      const itemNum = document.getElementById('packItem').value;
      
      if (qty && itemNum && currentPackOrder) {
        const orderLine = currentPackOrder.lines.find(l => l.item === itemNum);
        
        if (orderLine) {
          const remaining = orderLine.picked - orderLine.packed;
          
          if (qty > remaining) {
            WMS.showNotification(`Only ${remaining} units remaining to pack`, 'error');
            return;
          }
          
          // Add to packed items
          packedItems.push({
            itemNum: orderLine.item,
            description: orderLine.description,
            quantity: qty,
            lpn: document.getElementById('packItemLPN').value
          });
          
          // Update order line
          orderLine.packed += qty;
          document.getElementById(`packed_${orderLine.item}`).textContent = orderLine.packed;
          
          // Update carton weight
          const itemWeight = orderLine.weight * qty;
          currentCarton.weight += itemWeight;
          document.getElementById('cartonWeight').value = currentCarton.weight.toFixed(1);
          
          updatePackedItemsList();
          populateOrderLines();
          
          WMS.showNotification(`${qty} units of ${itemNum} added to carton`, 'success');
          
          // Clear inputs
          document.getElementById('packItemLPN').value = '';
          document.getElementById('packItem').value = '';
          this.value = '';
          document.getElementById('packItemLPN').focus();
        }
      }
    });
    
    packQtyInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.blur();
      }
    });
  }
});
