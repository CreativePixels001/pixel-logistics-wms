// DLT WMS - Inventory Visibility Module JavaScript
// Handles inventory search, filtering, and display

// Search inventory
function searchInventory() {
  const item = document.getElementById('searchItem').value.trim();
  const lpn = document.getElementById('searchLPN').value.trim();
  const location = document.getElementById('searchLocation').value.trim();
  const lot = document.getElementById('searchLot').value.trim();
  const status = document.getElementById('filterStatus').value;
  const subinv = document.getElementById('filterSubinv').value;
  const expiry = document.getElementById('filterExpiry').value;
  
  // Build search criteria
  const criteria = [];
  if (item) criteria.push(`Item: ${item}`);
  if (lpn) criteria.push(`LPN: ${lpn}`);
  if (location) criteria.push(`Location: ${location}`);
  if (lot) criteria.push(`Lot: ${lot}`);
  if (status) criteria.push(`Status: ${status}`);
  if (subinv) criteria.push(`Subinventory: ${subinv}`);
  if (expiry) criteria.push(`Expiry: ${expiry}`);
  
  if (criteria.length === 0) {
    WMS.showNotification('Please enter at least one search criterion', 'info');
    return;
  }
  
  WMS.showNotification(`Searching inventory... (${criteria.join(', ')})`, 'info');
  
  // Simulate search
  setTimeout(() => {
    // In production, this would filter the inventory table based on criteria
    filterInventoryTable({item, lpn, location, lot, status, subinv, expiry});
    WMS.showNotification('Search completed', 'success');
  }, 1000);
}

// Filter inventory table
function filterInventoryTable(filters) {
  const tbody = document.getElementById('inventoryTable');
  const rows = tbody.getElementsByTagName('tr');
  
  let visibleCount = 0;
  
  for (let row of rows) {
    let showRow = true;
    
    // Apply filters
    if (filters.item) {
      const itemCell = row.cells[0];
      if (!itemCell.textContent.toLowerCase().includes(filters.item.toLowerCase())) {
        showRow = false;
      }
    }
    
    if (filters.lpn) {
      const lpnCell = row.cells[2];
      if (!lpnCell.textContent.toLowerCase().includes(filters.lpn.toLowerCase())) {
        showRow = false;
      }
    }
    
    if (filters.location) {
      const locationCell = row.cells[3];
      if (!locationCell.textContent.toLowerCase().includes(filters.location.toLowerCase())) {
        showRow = false;
      }
    }
    
    if (filters.lot) {
      const lotCell = row.cells[6];
      if (!lotCell.textContent.toLowerCase().includes(filters.lot.toLowerCase())) {
        showRow = false;
      }
    }
    
    if (filters.status) {
      const statusCell = row.cells[7];
      if (!statusCell.textContent.toLowerCase().includes(filters.status.toLowerCase())) {
        showRow = false;
      }
    }
    
    // Show/hide row
    row.style.display = showRow ? '' : 'none';
    if (showRow) visibleCount++;
  }
  
  if (visibleCount === 0) {
    WMS.showNotification('No inventory found matching criteria', 'info');
  }
}

// Export inventory
function exportInventory() {
  WMS.showNotification('Preparing inventory export...', 'info');
  
  // Simulate export
  setTimeout(() => {
    // In production, this would generate and download an Excel/CSV file
    const data = gatherInventoryData();
    
    // Create CSV content
    const csv = convertToCSV(data);
    
    // Download CSV (simulated)
    WMS.showNotification(`Inventory exported successfully (${data.length} records)`, 'success');
    
    // In production, trigger download:
    // const blob = new Blob([csv], { type: 'text/csv' });
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `inventory_${WMS.formatDate(new Date())}.csv`;
    // a.click();
  }, 1500);
}

// Gather inventory data
function gatherInventoryData() {
  const tbody = document.getElementById('inventoryTable');
  const rows = tbody.getElementsByTagName('tr');
  const data = [];
  
  for (let row of rows) {
    if (row.style.display !== 'none') {
      data.push({
        item: row.cells[0].textContent.trim(),
        description: row.cells[1].textContent.trim(),
        lpn: row.cells[2].textContent.trim(),
        location: row.cells[3].textContent.trim(),
        quantity: row.cells[4].textContent.trim(),
        uom: row.cells[5].textContent.trim(),
        lot: row.cells[6].textContent.trim(),
        status: row.cells[7].textContent.trim(),
        expiryDate: row.cells[8].textContent.trim()
      });
    }
  }
  
  return data;
}

// Convert to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  // Headers
  const headers = Object.keys(data[0]).join(',');
  
  // Rows
  const rows = data.map(row => {
    return Object.values(row).map(value => {
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return headers + '\n' + rows.join('\n');
}

// Clear filters
function clearFilters() {
  document.getElementById('searchItem').value = '';
  document.getElementById('searchLPN').value = '';
  document.getElementById('searchLocation').value = '';
  document.getElementById('searchLot').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterSubinv').value = '';
  document.getElementById('filterExpiry').value = '';
  
  // Show all rows
  const tbody = document.getElementById('inventoryTable');
  const rows = tbody.getElementsByTagName('tr');
  
  for (let row of rows) {
    row.style.display = '';
  }
  
  WMS.showNotification('Filters cleared', 'info');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Enter key to search
  const searchFields = ['searchItem', 'searchLPN', 'searchLocation', 'searchLot'];
  
  searchFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchInventory();
        }
      });
    }
  });
});
