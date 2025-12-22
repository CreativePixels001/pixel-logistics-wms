/**
 * Inventory Management - Backend Integration
 * Connects inventory UI to backend APIs
 */

// Inventory state
let inventoryData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 50;

// Initialize inventory page
async function initInventory() {
  console.log('Initializing inventory module...');
  
  // Check backend availability
  const backendAvailable = await window.checkBackendAvailability();
  
  if (backendAvailable) {
    console.log('✅ Backend available - loading live data');
    await loadInventoryFromAPI();
    await loadInventoryStats();
  } else {
    console.log('⚠️ Backend unavailable - using mock data');
    loadMockInventoryData();
  }
  
  // Setup event listeners
  setupInventoryEventListeners();
  
  // Render initial data
  renderInventoryTable();
}

// Load inventory from backend API
async function loadInventoryFromAPI() {
  try {
    const response = await window.API.INVENTORY.getAll({
      page: currentPage,
      limit: itemsPerPage
    });
    
    if (response.success && response.data) {
      inventoryData = response.data.items || response.data;
      filteredData = [...inventoryData];
      
      console.log(`✅ Loaded ${inventoryData.length} inventory items from API`);
      showNotification(`Loaded ${inventoryData.length} inventory items`, 'success');
    }
  } catch (error) {
    console.error('Failed to load inventory from API:', error);
    showNotification('Failed to load inventory. Using demo data.', 'warning');
    loadMockInventoryData();
  }
}

// Load inventory statistics
async function loadInventoryStats() {
  try {
    const response = await window.API.INVENTORY.getStats();
    
    if (response.success && response.data) {
      updateInventoryStatsDisplay(response.data);
    }
  } catch (error) {
    console.error('Failed to load inventory stats:', error);
  }
}

// Update stats display
function updateInventoryStatsDisplay(stats) {
  // Update stat cards if they exist
  const totalItemsEl = document.getElementById('totalItems');
  const lowStockEl = document.getElementById('lowStock');
  const expiringEl = document.getElementById('expiringSoon');
  
  if (totalItemsEl) totalItemsEl.textContent = stats.totalItems || inventoryData.length;
  if (lowStockEl) lowStockEl.textContent = stats.lowStockCount || 0;
  if (expiringEl) expiringEl.textContent = stats.expiringCount || 0;
}

// Load mock inventory data (fallback)
function loadMockInventoryData() {
  inventoryData = [
    {
      id: 1,
      sku: 'ELEC-001',
      itemName: 'Industrial Sensors',
      lpn: 'LPN-2025-001',
      location: 'RACK-A-12-03',
      quantity: 150,
      uom: 'PCS',
      lot: 'BATCH-2025-001',
      status: 'Available',
      expiryDate: '2026-12-31',
      lastUpdated: '2025-12-06'
    },
    {
      id: 2,
      sku: 'ELEC-002',
      itemName: 'Control Panels',
      lpn: 'LPN-2025-002',
      location: 'RACK-B-05-02',
      quantity: 45,
      uom: 'PCS',
      lot: 'BATCH-2025-002',
      status: 'Available',
      expiryDate: '2026-06-30',
      lastUpdated: '2025-12-06'
    },
    {
      id: 3,
      sku: 'ELEC-003',
      itemName: 'Circuit Breakers',
      lpn: 'LPN-2025-003',
      location: 'RACK-A-08-01',
      quantity: 200,
      uom: 'PCS',
      lot: 'BATCH-2025-003',
      status: 'Available',
      expiryDate: '2027-03-15',
      lastUpdated: '2025-12-05'
    },
    {
      id: 4,
      sku: 'MECH-001',
      itemName: 'Hydraulic Pumps',
      lpn: 'LPN-2025-004',
      location: 'RACK-C-10-05',
      quantity: 30,
      uom: 'PCS',
      lot: 'BATCH-2025-004',
      status: 'Reserved',
      expiryDate: '2028-01-20',
      lastUpdated: '2025-12-06'
    },
    {
      id: 5,
      sku: 'CHEM-001',
      itemName: 'Lubricants - Industrial Grade',
      lpn: 'LPN-2025-005',
      location: 'RACK-D-02-03',
      quantity: 500,
      uom: 'LTR',
      lot: 'BATCH-2025-005',
      status: 'Available',
      expiryDate: '2025-12-31',
      lastUpdated: '2025-12-04'
    }
  ];
  
  filteredData = [...inventoryData];
  console.log(`✅ Loaded ${inventoryData.length} mock inventory items`);
}

// Setup event listeners
function setupInventoryEventListeners() {
  // Search button
  const searchBtn = document.getElementById('searchInventoryBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleInventorySearch);
  }
  
  // Export button
  const exportBtn = document.getElementById('exportInventoryBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportInventory);
  }
  
  // Refresh button
  const refreshBtn = document.getElementById('refreshInventoryBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshInventory);
  }
  
  // Add item button
  const addBtn = document.getElementById('addInventoryBtn');
  if (addBtn) {
    addBtn.addEventListener('click', showAddInventoryModal);
  }
}

// Handle inventory search
async function handleInventorySearch() {
  const searchItem = document.getElementById('searchItem')?.value.trim();
  const searchLPN = document.getElementById('searchLPN')?.value.trim();
  const searchLocation = document.getElementById('searchLocation')?.value.trim();
  const searchLot = document.getElementById('searchLot')?.value.trim();
  const filterStatus = document.getElementById('filterStatus')?.value;
  
  // Build filter criteria
  const filters = {};
  if (searchItem) filters.item = searchItem;
  if (searchLPN) filters.lpn = searchLPN;
  if (searchLocation) filters.location = searchLocation;
  if (searchLot) filters.lot = searchLot;
  if (filterStatus) filters.status = filterStatus;
  
  // Apply filters
  if (Object.keys(filters).length === 0) {
    filteredData = [...inventoryData];
  } else {
    filteredData = inventoryData.filter(item => {
      let match = true;
      
      if (filters.item && !item.sku.toLowerCase().includes(filters.item.toLowerCase()) && 
          !item.itemName.toLowerCase().includes(filters.item.toLowerCase())) {
        match = false;
      }
      
      if (filters.lpn && !item.lpn.toLowerCase().includes(filters.lpn.toLowerCase())) {
        match = false;
      }
      
      if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) {
        match = false;
      }
      
      if (filters.lot && !item.lot.toLowerCase().includes(filters.lot.toLowerCase())) {
        match = false;
      }
      
      if (filters.status && item.status !== filters.status) {
        match = false;
      }
      
      return match;
    });
  }
  
  // Re-render table
  renderInventoryTable();
  
  showNotification(`Found ${filteredData.length} inventory items`, 'success');
}

// Render inventory table
function renderInventoryTable() {
  const tbody = document.getElementById('inventoryTable');
  if (!tbody) {
    console.warn('Inventory table not found');
    return;
  }
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  // If no data, show message
  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 40px; color: var(--text-secondary);">No inventory found</td></tr>';
    return;
  }
  
  // Render rows
  filteredData.forEach((item, index) => {
    const row = document.createElement('tr');
    
    // Determine status class
    let statusClass = 'status-available';
    if (item.status === 'Reserved') statusClass = 'status-reserved';
    if (item.status === 'Blocked') statusClass = 'status-blocked';
    if (item.status === 'Damaged') statusClass = 'status-damaged';
    
    // Check if expiring soon (within 30 days)
    const expiryWarning = isExpiringSoon(item.expiryDate) ? '<span style="color: var(--color-warning); margin-left: 8px;" title="Expiring soon">⚠️</span>' : '';
    
    row.innerHTML = `
      <td>${item.sku}</td>
      <td>${item.itemName}</td>
      <td>${item.lpn}</td>
      <td>${item.location}</td>
      <td style="text-align: right;">${item.quantity}</td>
      <td>${item.uom}</td>
      <td>${item.lot}</td>
      <td><span class="status-badge ${statusClass}">${item.status}</span></td>
      <td>${item.expiryDate}${expiryWarning}</td>
      <td>
        <button class="btn-icon" onclick="viewInventoryItem(${item.id})" title="View Details">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="btn-icon" onclick="editInventoryItem(${item.id})" title="Edit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  console.log(`✅ Rendered ${filteredData.length} inventory items`);
}

// Check if item is expiring soon
function isExpiringSoon(expiryDate) {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
}

// View inventory item details
function viewInventoryItem(id) {
  const item = inventoryData.find(i => i.id === id);
  if (!item) return;
  
  showNotification(`Viewing details for ${item.itemName}`, 'info');
  console.log('Item details:', item);
  
  // TODO: Show modal with full item details
}

// Edit inventory item
function editInventoryItem(id) {
  const item = inventoryData.find(i => i.id === id);
  if (!item) return;
  
  showNotification(`Editing ${item.itemName}`, 'info');
  console.log('Edit item:', item);
  
  // TODO: Show edit modal
}

// Refresh inventory
async function refreshInventory() {
  showNotification('Refreshing inventory...', 'info');
  
  const backendAvailable = await window.checkBackendAvailability();
  
  if (backendAvailable) {
    await loadInventoryFromAPI();
    await loadInventoryStats();
  } else {
    loadMockInventoryData();
  }
  
  renderInventoryTable();
  showNotification('Inventory refreshed', 'success');
}

// Export inventory
function exportInventory() {
  showNotification('Preparing inventory export...', 'info');
  
  // Create CSV content
  const headers = ['SKU', 'Item Name', 'LPN', 'Location', 'Quantity', 'UOM', 'Lot', 'Status', 'Expiry Date'];
  const csvContent = [
    headers.join(','),
    ...filteredData.map(item => [
      item.sku,
      `"${item.itemName}"`,
      item.lpn,
      item.location,
      item.quantity,
      item.uom,
      item.lot,
      item.status,
      item.expiryDate
    ].join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  window.URL.revokeObjectURL(url);
  
  showNotification('Inventory exported successfully', 'success');
}

// Show add inventory modal
function showAddInventoryModal() {
  showNotification('Add inventory feature coming soon', 'info');
  // TODO: Implement add inventory modal
}

// Show notification helper
function showNotification(message, type = 'info') {
  if (window.WMS && window.WMS.showNotification) {
    window.WMS.showNotification(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInventory);
} else {
  initInventory();
}

// Export functions for global use
window.inventoryModule = {
  init: initInventory,
  search: handleInventorySearch,
  refresh: refreshInventory,
  export: exportInventory,
  viewItem: viewInventoryItem,
  editItem: editInventoryItem
};
