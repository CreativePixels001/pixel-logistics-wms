/**
 * DLT WMS - Universal Filter System
 * Provides collapsible filter panels for all pages
 */

// Toggle filter panel visibility
function toggleFilters() {
  const filterPanel = document.getElementById('filterPanel');
  const headerFilterBtn = document.getElementById('headerFilterBtn');
  
  if (filterPanel && headerFilterBtn) {
    const isActive = filterPanel.classList.toggle('active');
    headerFilterBtn.classList.toggle('active');
    
    // Save filter state to localStorage
    localStorage.setItem('filterPanelOpen', isActive);
  }
}

// Clear all filters
function clearAllFilters() {
  const filterPanel = document.getElementById('filterPanel');
  if (!filterPanel) return;
  
  // Reset all select elements
  const selects = filterPanel.querySelectorAll('select');
  selects.forEach(select => {
    select.value = '';
  });
  
  // Reset all input elements
  const inputs = filterPanel.querySelectorAll('input[type="text"], input[type="search"], input[type="date"]');
  inputs.forEach(input => {
    input.value = '';
  });
  
  // Reset checkboxes
  const checkboxes = filterPanel.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Update filter badge count
  updateFilterBadge();
  
  // Trigger filter application (if custom function exists)
  if (typeof applyFilters === 'function') {
    applyFilters();
  }
}

// Count active filters
function updateFilterBadge() {
  const filterPanel = document.getElementById('filterPanel');
  const filterBadge = document.getElementById('filterBadge');
  
  if (!filterPanel || !filterBadge) return;
  
  let activeCount = 0;
  
  // Count selected selects (not empty)
  const selects = filterPanel.querySelectorAll('select');
  selects.forEach(select => {
    if (select.value && select.value !== '') {
      activeCount++;
    }
  });
  
  // Count filled text inputs
  const inputs = filterPanel.querySelectorAll('input[type="text"], input[type="search"], input[type="date"]');
  inputs.forEach(input => {
    if (input.value && input.value.trim() !== '') {
      activeCount++;
    }
  });
  
  // Count checked checkboxes
  const checkboxes = filterPanel.querySelectorAll('input[type="checkbox"]:checked');
  activeCount += checkboxes.length;
  
  // Update badge
  if (activeCount > 0) {
    filterBadge.textContent = activeCount;
    filterBadge.style.display = 'inline-flex';
  } else {
    filterBadge.style.display = 'none';
  }
  
  return activeCount;
}

// Restore filter panel state from localStorage
function restoreFilterState() {
  const filterPanelOpen = localStorage.getItem('filterPanelOpen') === 'true';
  
  if (filterPanelOpen) {
    const filterPanel = document.getElementById('filterPanel');
    const headerFilterBtn = document.getElementById('headerFilterBtn');
    
    if (filterPanel) {
      filterPanel.classList.add('active');
    }
    if (headerFilterBtn) {
      headerFilterBtn.classList.add('active');
    }
  }
}

// Initialize filter system on page load
window.addEventListener('DOMContentLoaded', () => {
  restoreFilterState();
  updateFilterBadge();
  
  // Add change listeners to all filter inputs
  const filterPanel = document.getElementById('filterPanel');
  if (filterPanel) {
    const inputs = filterPanel.querySelectorAll('select, input');
    inputs.forEach(input => {
      input.addEventListener('change', updateFilterBadge);
      input.addEventListener('input', updateFilterBadge);
    });
  }
});
