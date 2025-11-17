// DLT WMS - Order Management Module JavaScript
// Handles sales order lookup, pick wave creation, and allocation

let currentAction = null;

// Show specific action
function showAction(action) {
  currentAction = action;
  
  // Hide all sections
  document.getElementById('waveSection').style.display = 'none';
  document.getElementById('allocateSection').style.display = 'none';
  
  // Show selected section
  if (action === 'wave') {
    document.getElementById('waveSection').style.display = 'block';
    document.getElementById('waveSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (action === 'allocate') {
    document.getElementById('allocateSection').style.display = 'block';
    document.getElementById('allocateSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (action === 'search') {
    document.getElementById('searchSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('searchOrderNum').focus();
  }
}

// Search orders
function searchOrders() {
  const orderNum = document.getElementById('searchOrderNum').value.trim();
  const customer = document.getElementById('searchCustomer').value.trim();
  const status = document.getElementById('searchStatus').value;
  
  const criteria = [];
  if (orderNum) criteria.push(`Order: ${orderNum}`);
  if (customer) criteria.push(`Customer: ${customer}`);
  if (status) criteria.push(`Status: ${status}`);
  
  if (criteria.length === 0) {
    WMS.showNotification('Please enter at least one search criterion', 'info');
    return;
  }
  
  WMS.showNotification(`Searching orders... (${criteria.join(', ')})`, 'info');
  
  setTimeout(() => {
    filterOrdersTable({orderNum, customer, status});
    WMS.showNotification('Search completed', 'success');
  }, 1000);
}

// Filter orders table
function filterOrdersTable(filters) {
  const tbody = document.getElementById('ordersTable');
  const rows = tbody.getElementsByTagName('tr');
  
  let visibleCount = 0;
  
  for (let row of rows) {
    let showRow = true;
    
    if (filters.orderNum) {
      const orderCell = row.cells[1];
      if (!orderCell.textContent.toLowerCase().includes(filters.orderNum.toLowerCase())) {
        showRow = false;
      }
    }
    
    if (filters.customer) {
      const customerCell = row.cells[2];
      if (!customerCell.textContent.toLowerCase().includes(filters.customer.toLowerCase())) {
        showRow = false;
      }
    }
    
    if (filters.status) {
      const statusCell = row.cells[8];
      if (!statusCell.textContent.toLowerCase().includes(filters.status.toLowerCase())) {
        showRow = false;
      }
    }
    
    row.style.display = showRow ? '' : 'none';
    if (showRow) visibleCount++;
  }
  
  if (visibleCount === 0) {
    WMS.showNotification('No orders found matching criteria', 'info');
  }
}

// Preview wave
function previewWave() {
  WMS.showNotification('Generating wave preview...', 'info');
  
  // Simulate wave calculation
  setTimeout(() => {
    document.getElementById('previewOrders').textContent = '23';
    document.getElementById('previewLines').textContent = '87';
    document.getElementById('previewUnits').textContent = '2,450';
    document.getElementById('previewLocations').textContent = '45';
    
    document.getElementById('wavePreview').style.display = 'block';
    WMS.showNotification('Wave preview generated', 'success');
  }, 1500);
}

// Cancel wave
function cancelWave() {
  if (confirm('Cancel wave creation?')) {
    document.getElementById('waveForm').reset();
    document.getElementById('wavePreview').style.display = 'none';
    document.getElementById('waveSection').style.display = 'none';
    currentAction = null;
  }
}

// Cancel allocate
function cancelAllocate() {
  document.getElementById('allocateForm').reset();
  document.getElementById('orderDetails').style.display = 'none';
  document.getElementById('allocateSection').style.display = 'none';
  currentAction = null;
}

// View order
function viewOrder(orderNum) {
  WMS.showNotification(`Loading order ${orderNum}...`, 'info');
  
  // In production, would fetch actual order details
  setTimeout(() => {
    WMS.showNotification(`Order ${orderNum} details loaded`, 'success');
  }, 800);
}

// Filter orders by status
function filterOrders(status) {
  const tbody = document.getElementById('ordersTable');
  const rows = tbody.getElementsByTagName('tr');
  
  for (let row of rows) {
    if (status === 'all') {
      row.style.display = '';
    } else {
      const statusCell = row.cells[8];
      const rowStatus = statusCell.textContent.toLowerCase();
      row.style.display = rowStatus.includes(status.toLowerCase()) ? '' : 'none';
    }
  }
}

// Refresh orders
function refreshOrders() {
  WMS.showNotification('Refreshing orders...', 'info');
  
  setTimeout(() => {
    WMS.showNotification('Orders refreshed', 'success');
  }, 1000);
}

// Toggle select all
function toggleSelectAll(checkbox) {
  const checkboxes = document.querySelectorAll('.order-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = checkbox.checked;
  });
}

// Lookup order for allocation
function lookupOrder(orderNum) {
  if (!orderNum) return;
  
  WMS.showNotification('Looking up order...', 'info');
  
  setTimeout(() => {
    // Mock order data
    document.getElementById('detailCustomer').textContent = 'Acme Corp';
    document.getElementById('detailShipDate').textContent = '2025-11-20';
    document.getElementById('detailLines').textContent = '5';
    document.getElementById('detailUnits').textContent = '350';
    
    document.getElementById('orderDetails').style.display = 'block';
    WMS.showNotification('Order details loaded', 'success');
  }, 1000);
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  
  // Wave form
  const waveForm = document.getElementById('waveForm');
  if (waveForm) {
    waveForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const waveName = document.getElementById('waveName').value;
      const strategy = document.getElementById('pickStrategy').value;
      
      WMS.showNotification(`Creating pick wave: ${waveName}...`, 'info');
      
      setTimeout(() => {
        const waves = WMS.Storage.get('pickWaves') || [];
        waves.unshift({
          waveName: waveName,
          strategy: strategy,
          priority: document.getElementById('wavePriority').value,
          orders: document.getElementById('previewOrders').textContent,
          lines: document.getElementById('previewLines').textContent,
          units: document.getElementById('previewUnits').textContent,
          status: 'Created',
          createdBy: 'Ashish Kumar',
          createdDate: WMS.formatDateTime(new Date())
        });
        WMS.Storage.set('pickWaves', waves);
        
        WMS.showNotification(`Pick wave ${waveName} created successfully!`, 'success');
        cancelWave();
      }, 2000);
    });
  }
  
  // Allocate form
  const allocateForm = document.getElementById('allocateForm');
  if (allocateForm) {
    allocateForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const orderNum = document.getElementById('allocateOrderNum').value;
      
      WMS.showNotification(`Allocating order ${orderNum}...`, 'info');
      
      setTimeout(() => {
        WMS.showNotification(`Order ${orderNum} allocated successfully!`, 'success');
        cancelAllocate();
        
        // Update order status in table
        updateOrderStatus(orderNum, 'Allocated');
      }, 2000);
    });
  }
  
  // Allocate order input - lookup on blur
  const allocateInput = document.getElementById('allocateOrderNum');
  if (allocateInput) {
    allocateInput.addEventListener('blur', function() {
      lookupOrder(this.value);
    });
    
    allocateInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        lookupOrder(this.value);
      }
    });
  }
  
  // Search on Enter key
  const searchFields = ['searchOrderNum', 'searchCustomer'];
  searchFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchOrders();
        }
      });
    }
  });
  
  // Set default ship dates for wave (today + 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const shipDateFrom = document.getElementById('shipDateFrom');
  const shipDateTo = document.getElementById('shipDateTo');
  
  if (shipDateFrom) shipDateFrom.value = today.toISOString().split('T')[0];
  if (shipDateTo) shipDateTo.value = nextWeek.toISOString().split('T')[0];
});

// Update order status in table
function updateOrderStatus(orderNum, newStatus) {
  const tbody = document.getElementById('ordersTable');
  const rows = tbody.getElementsByTagName('tr');
  
  for (let row of rows) {
    const orderCell = row.cells[1];
    if (orderCell.textContent.includes(orderNum)) {
      const statusCell = row.cells[8];
      statusCell.innerHTML = `<span class="badge badge-primary">${newStatus}</span>`;
      break;
    }
  }
}
