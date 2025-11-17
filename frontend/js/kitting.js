// DLT WMS - Kitting & Assembly Module JavaScript
// Handles kit building, component picking, assembly operations, and kit disassembly

let currentOperation = null;
let currentKitBOM = null;
let currentComponentIndex = 0;
let pickedComponents = [];

// Select kit operation
function selectOperation(operation) {
  currentOperation = operation;
  
  const operations = {
    'build': 'Build Kit',
    'disassemble': 'Disassemble Kit',
    'define': 'Define Kit BOM'
  };
  
  WMS.showNotification(`${operations[operation]} selected`, 'info');
  
  if (operation === 'build') {
    document.getElementById('buildKitCard').style.display = 'block';
    document.getElementById('buildKitCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
      document.getElementById('kitItem').focus();
    }, 100);
  } else if (operation === 'define') {
    const kitItem = prompt('Enter new kit item number:');
    if (kitItem) {
      WMS.showNotification(`Kit definition created for ${kitItem}. Open BOM editor to add components.`, 'success');
    }
  } else if (operation === 'disassemble') {
    const lpn = prompt('Enter kit LPN to disassemble:');
    if (lpn) {
      WMS.showNotification(`Kit ${lpn} disassembled. Components returned to inventory.`, 'success');
    }
  }
}

// Start kit build
function startBuild(orderID) {
  document.getElementById('buildKitCard').style.display = 'block';
  document.getElementById('buildKitCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Pre-fill kit item from order
  document.getElementById('kitItem').value = 'KIT-5678';
  loadKitBOM('KIT-5678');
}

// Load kit BOM
function loadKitBOM(kitItem) {
  WMS.showNotification('Loading kit BOM...', 'info');
  
  setTimeout(() => {
    // Mock kit BOM data
    currentKitBOM = {
      kitItem: kitItem,
      description: 'Premium Starter Kit',
      weight: '2.5 kg',
      components: [
        { seq: 1, item: 'COMP-001', description: 'Main Unit', location: 'A-05-12-B', qtyRequired: 2, uom: 'EA' },
        { seq: 2, item: 'COMP-002', description: 'Power Adapter', location: 'A-06-08-A', qtyRequired: 2, uom: 'EA' },
        { seq: 3, item: 'COMP-003', description: 'Cable Assembly', location: 'A-05-15-C', qtyRequired: 4, uom: 'EA' },
        { seq: 4, item: 'COMP-004', description: 'User Manual', location: 'B-02-05-A', qtyRequired: 2, uom: 'EA' },
        { seq: 5, item: 'COMP-005', description: 'Packaging Box', location: 'C-01-03-B', qtyRequired: 2, uom: 'EA' }
      ]
    };
    
    document.getElementById('kitDescription').textContent = currentKitBOM.description;
    document.getElementById('kitWeight').textContent = currentKitBOM.weight;
    document.getElementById('componentCount').textContent = `${currentKitBOM.components.length} items`;
    
    // Populate components table
    updateComponentsTable();
    
    document.getElementById('kitDetails').style.display = 'block';
    document.getElementById('buildActions').style.display = 'flex';
    
    WMS.showNotification('Kit BOM loaded. Start component picking.', 'success');
    
    // Start with first component
    currentComponentIndex = 0;
    pickedComponents = [];
    loadNextComponent();
  }, 1000);
}

// Update components table
function updateComponentsTable() {
  const tbody = document.getElementById('componentsTable');
  tbody.innerHTML = '';
  
  const buildQty = parseInt(document.getElementById('buildQty').value) || 1;
  
  currentKitBOM.components.forEach((component, index) => {
    const picked = pickedComponents[index];
    const totalRequired = component.qtyRequired * buildQty;
    const totalPicked = picked ? picked.qty : 0;
    const status = picked ? 'Picked' : (index === currentComponentIndex ? 'Current' : 'Pending');
    
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${component.seq}</td>
      <td><strong>${component.item}</strong></td>
      <td>${component.description}</td>
      <td>${component.location}</td>
      <td>${totalRequired} ${component.uom}</td>
      <td>${totalPicked} ${component.uom}</td>
      <td>${picked ? picked.lot || '-' : '-'}</td>
      <td><span class="badge ${status === 'Picked' ? 'badge-primary' : status === 'Current' ? 'badge-outline' : ''}">${status}</span></td>
    `;
  });
}

// Load next component
function loadNextComponent() {
  if (currentComponentIndex >= currentKitBOM.components.length) {
    // All components picked, show quality check
    document.getElementById('currentComponent').style.display = 'none';
    document.getElementById('qualityCheck').style.display = 'block';
    
    WMS.showNotification('All components picked! Complete quality check.', 'success');
    return;
  }
  
  const component = currentKitBOM.components[currentComponentIndex];
  const buildQty = parseInt(document.getElementById('buildQty').value) || 1;
  const totalRequired = component.qtyRequired * buildQty;
  
  document.getElementById('currentSeq').textContent = component.seq;
  document.getElementById('currentItem').textContent = component.item;
  document.getElementById('currentLocation').textContent = component.location;
  document.getElementById('currentQty').textContent = `${totalRequired} ${component.uom}`;
  
  document.getElementById('scanComponent').value = '';
  document.getElementById('pickedQty').value = totalRequired;
  document.getElementById('componentLot').value = '';
  
  document.getElementById('currentComponent').style.display = 'block';
  
  setTimeout(() => {
    document.getElementById('scanComponent').focus();
  }, 100);
  
  updateComponentsTable();
}

// Confirm component
function confirmComponent() {
  const component = currentKitBOM.components[currentComponentIndex];
  const scannedItem = document.getElementById('scanComponent').value.trim();
  const pickedQty = parseInt(document.getElementById('pickedQty').value);
  const lot = document.getElementById('componentLot').value.trim();
  
  if (!scannedItem) {
    WMS.showNotification('Please scan component item', 'error');
    return;
  }
  
  if (!pickedQty) {
    WMS.showNotification('Please enter picked quantity', 'error');
    return;
  }
  
  // Validate scanned item matches expected
  if (scannedItem !== component.item) {
    WMS.showNotification(`Expected ${component.item}, scanned ${scannedItem}`, 'error');
    return;
  }
  
  const buildQty = parseInt(document.getElementById('buildQty').value) || 1;
  const expectedQty = component.qtyRequired * buildQty;
  
  if (pickedQty !== expectedQty) {
    const proceed = confirm(`Picked quantity (${pickedQty}) does not match required (${expectedQty}). Continue?`);
    if (!proceed) return;
  }
  
  // Save picked component
  pickedComponents[currentComponentIndex] = {
    item: component.item,
    qty: pickedQty,
    lot: lot,
    timestamp: new Date()
  };
  
  WMS.showNotification(`Component ${component.item} confirmed`, 'success');
  
  // Move to next component
  currentComponentIndex++;
  loadNextComponent();
}

// Skip component
function skipComponent() {
  if (confirm('Skip this component? Kit build may be incomplete.')) {
    pickedComponents[currentComponentIndex] = null;
    currentComponentIndex++;
    loadNextComponent();
  }
}

// Cancel kit build
function cancelBuild() {
  if (confirm('Cancel kit build? Progress will be lost.')) {
    resetKitBuild();
    WMS.showNotification('Kit build cancelled', 'info');
  }
}

// Reset kit build
function resetKitBuild() {
  document.getElementById('buildKitCard').style.display = 'none';
  document.getElementById('buildKitForm').reset();
  document.getElementById('kitDetails').style.display = 'none';
  document.getElementById('currentComponent').style.display = 'none';
  document.getElementById('qualityCheck').style.display = 'none';
  document.getElementById('finalKit').style.display = 'none';
  document.getElementById('buildActions').style.display = 'none';
  
  currentKitBOM = null;
  currentComponentIndex = 0;
  pickedComponents = [];
}

// Generate kit LPN
function generateKitLPN() {
  const timestamp = Date.now().toString().slice(-6);
  return `KIT-LPN-${timestamp}`;
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const buildKitForm = document.getElementById('buildKitForm');
  
  if (buildKitForm) {
    buildKitForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Check quality checks
      const checksComplete = 
        document.getElementById('checkComponents').checked &&
        document.getElementById('checkAssembly').checked &&
        document.getElementById('checkPackaging').checked &&
        document.getElementById('checkQuality').checked;
      
      if (!checksComplete) {
        WMS.showNotification('Please complete all quality checks', 'error');
        return;
      }
      
      const buildQty = parseInt(document.getElementById('buildQty').value);
      const kitItem = document.getElementById('kitItem').value;
      const workstation = document.getElementById('workstation').value;
      const kitLPN = generateKitLPN();
      
      const kitBuild = {
        kitItem: kitItem,
        buildQty: buildQty,
        workstation: workstation,
        kitLPN: kitLPN,
        components: pickedComponents,
        builtBy: 'Ashish Kumar',
        builtDate: WMS.formatDateTime(new Date())
      };
      
      // Save to storage
      const completedKits = WMS.Storage.get('completedKits') || [];
      completedKits.unshift(kitBuild);
      WMS.Storage.set('completedKits', completedKits);
      
      WMS.showNotification(`Kit ${kitItem} built successfully! LPN: ${kitLPN}`, 'success');
      
      setTimeout(() => {
        resetKitBuild();
      }, 2000);
    });
  }
  
  // Kit item lookup
  const kitItemInput = document.getElementById('kitItem');
  if (kitItemInput) {
    kitItemInput.addEventListener('blur', function() {
      const kitItem = this.value.trim();
      if (kitItem && !currentKitBOM) {
        loadKitBOM(kitItem);
      }
    });
    
    kitItemInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const kitItem = this.value.trim();
        if (kitItem) {
          loadKitBOM(kitItem);
        }
      }
    });
  }
  
  // Update table when build quantity changes
  const buildQtyInput = document.getElementById('buildQty');
  if (buildQtyInput) {
    buildQtyInput.addEventListener('change', function() {
      if (currentKitBOM) {
        updateComponentsTable();
        if (currentComponentIndex < currentKitBOM.components.length) {
          loadNextComponent();
        }
      }
    });
  }
  
  // Show final kit section when all quality checks are done
  const qualityChecks = ['checkComponents', 'checkAssembly', 'checkPackaging', 'checkQuality'];
  qualityChecks.forEach(checkId => {
    const checkbox = document.getElementById(checkId);
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        const allChecked = qualityChecks.every(id => document.getElementById(id).checked);
        
        if (allChecked) {
          const kitLPN = generateKitLPN();
          document.getElementById('kitLPN').value = kitLPN;
          document.getElementById('finalKit').style.display = 'grid';
          
          WMS.showNotification('Quality check passed! Generated kit LPN.', 'success');
          
          setTimeout(() => {
            document.getElementById('kitDestination').focus();
          }, 100);
        }
      });
    }
  });
});
