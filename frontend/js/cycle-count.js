// DLT WMS - Cycle Count Module JavaScript
// Handles cycle count execution, variance analysis, and accuracy tracking

let currentCountType = null;
let currentCountTask = null;
let currentItemIndex = 0;
let countTaskData = null;
let itemsCounted = 0;
let varianceCount = 0;
let totalAccuracy = 0;

// Select count type
function selectCountType(type) {
  currentCountType = type;
  
  const typeLabels = {
    'full': 'Full Cycle Count',
    'partial': 'Partial Cycle Count',
    'blind': 'Blind Cycle Count',
    'abc': 'ABC Analysis Count'
  };
  
  document.getElementById('countTypeTitle').textContent = typeLabels[type];
  document.getElementById('countGenerationForm').style.display = 'block';
  
  // Show/hide ABC class field
  if (type === 'abc') {
    document.getElementById('abcClassGroup').style.display = 'block';
    document.getElementById('abcClass').required = true;
  } else {
    document.getElementById('abcClassGroup').style.display = 'none';
    document.getElementById('abcClass').required = false;
  }
  
  // Set default count name
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('countName').value = `${typeLabels[type]} - ${today}`;
  document.getElementById('countDate').value = today;
  
  WMS.showNotification(`${typeLabels[type]} selected. Configure count parameters.`, 'info');
  
  setTimeout(() => {
    document.getElementById('countName').focus();
  }, 100);
}

// Cancel count generation
function cancelCountGeneration() {
  document.getElementById('countGenerationForm').reset();
  document.getElementById('countGenerationForm').style.display = 'none';
  currentCountType = null;
}

// Start count execution
function startCount(taskID) {
  currentCountTask = taskID;
  
  document.getElementById('countExecutionCard').style.display = 'block';
  document.getElementById('countExecutionCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  document.getElementById('countTaskID').value = taskID;
  loadCountTask(taskID);
}

// Load count task
function loadCountTask(taskID) {
  WMS.showNotification('Loading count task...', 'info');
  
  setTimeout(() => {
    // Mock count task data
    countTaskData = {
      taskID: taskID,
      countType: 'Full',
      location: 'A-01-01-A',
      isBlind: taskID.includes('002'), // Blind count doesn't show system qty
      items: [
        { item: 'ITM-5678', description: 'Widget Assembly A', systemQty: 100, uom: 'EA' },
        { item: 'ITM-5679', description: 'Component B', systemQty: 150, uom: 'EA' },
        { item: 'ITM-5680', description: 'Part C', systemQty: 100, uom: 'EA' }
      ]
    };
    
    document.getElementById('taskCountType').value = countTaskData.countType;
    document.getElementById('taskLocation').value = countTaskData.location;
    
    currentItemIndex = 0;
    itemsCounted = 0;
    varianceCount = 0;
    totalAccuracy = 0;
    
    loadNextCountItem();
    
    document.getElementById('countProgress').style.display = 'block';
    document.getElementById('countActions').style.display = 'flex';
    document.getElementById('totalItems').textContent = countTaskData.items.length;
    
    WMS.showNotification('Count task loaded successfully', 'success');
  }, 1000);
}

// Load next count item
function loadNextCountItem() {
  if (currentItemIndex >= countTaskData.items.length) {
    completeCountTask();
    return;
  }
  
  const item = countTaskData.items[currentItemIndex];
  
  document.getElementById('countItem').textContent = item.item;
  document.getElementById('countDescription').textContent = item.description;
  
  // Show or hide system quantity based on blind count
  if (countTaskData.isBlind) {
    document.getElementById('systemQtyDisplay').style.display = 'none';
  } else {
    document.getElementById('systemQtyDisplay').style.display = 'block';
    document.getElementById('systemQty').textContent = `${item.systemQty} ${item.uom}`;
  }
  
  document.getElementById('countItemNum').textContent = `Item ${currentItemIndex + 1} of ${countTaskData.items.length}`;
  
  // Clear inputs
  document.getElementById('countItemScan').value = '';
  document.getElementById('countedQty').value = '';
  document.getElementById('countLot').value = '';
  
  document.getElementById('varianceAlert').style.display = 'none';
  document.getElementById('currentCountItem').style.display = 'block';
  
  document.getElementById('countItemScan').focus();
}

// Skip count item
function skipCountItem() {
  if (confirm('Skip this item? It will remain uncounted.')) {
    currentItemIndex++;
    loadNextCountItem();
  }
}

// Cancel count
function cancelCount() {
  if (confirm('Cancel count? Progress will be saved.')) {
    resetCountInterface();
    WMS.showNotification('Count cancelled. Progress saved.', 'info');
  }
}

// Reset count interface
function resetCountInterface() {
  document.getElementById('countExecutionCard').style.display = 'none';
  document.getElementById('countExecutionForm').reset();
  document.getElementById('currentCountItem').style.display = 'none';
  document.getElementById('countProgress').style.display = 'none';
  document.getElementById('countActions').style.display = 'none';
  
  currentCountTask = null;
  countTaskData = null;
  currentItemIndex = 0;
  itemsCounted = 0;
  varianceCount = 0;
  totalAccuracy = 0;
}

// Complete count task
function completeCountTask() {
  document.getElementById('currentCountItem').style.display = 'none';
  
  const accuracyRate = ((itemsCounted - varianceCount) / itemsCounted * 100).toFixed(1);
  
  const summary = {
    taskID: currentCountTask,
    totalItems: countTaskData.items.length,
    itemsCounted: itemsCounted,
    variances: varianceCount,
    accuracy: accuracyRate,
    completedBy: 'Ashish Kumar',
    completedDate: WMS.formatDateTime(new Date())
  };
  
  // Save to storage
  const completedCounts = WMS.Storage.get('completedCounts') || [];
  completedCounts.unshift(summary);
  WMS.Storage.set('completedCounts', completedCounts);
  
  WMS.showNotification(`Count task ${currentCountTask} completed! Accuracy: ${accuracyRate}%`, 'success');
  
  // Update task table
  updateCountTaskStatus(currentCountTask, 'Completed');
  
  setTimeout(() => {
    resetCountInterface();
  }, 2000);
}

// Check for variance
function checkVariance(systemQty, countedQty) {
  if (!countTaskData.isBlind && systemQty !== countedQty) {
    const variance = countedQty - systemQty;
    const variancePct = ((variance / systemQty) * 100).toFixed(1);
    
    document.getElementById('varianceMessage').textContent = 
      `System: ${systemQty}, Counted: ${countedQty}. Variance: ${variance > 0 ? '+' : ''}${variance} (${variancePct}%). Please verify or provide reason.`;
    document.getElementById('varianceAlert').style.display = 'block';
    return true;
  }
  return false;
}

// Update count task status in table
function updateCountTaskStatus(taskID, newStatus) {
  const tbody = document.getElementById('countTasksTable');
  const rows = tbody.getElementsByTagName('tr');
  
  for (let row of rows) {
    const taskCell = row.cells[0];
    if (taskCell.textContent.includes(taskID)) {
      const statusCell = row.cells[7];
      const badge = newStatus === 'Completed' 
        ? '<span class="badge badge-primary">Completed</span>'
        : '<span class="badge badge-primary">In Progress</span>';
      statusCell.innerHTML = badge;
      
      if (newStatus === 'Completed') {
        const actionCell = row.cells[8];
        actionCell.innerHTML = '<button class="btn btn-sm btn-outline" disabled>Completed</button>';
      }
      break;
    }
  }
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const countGenerationForm = document.getElementById('countGenerationForm');
  
  // Count generation
  if (countGenerationForm) {
    countGenerationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const countParams = {
        name: document.getElementById('countName').value,
        type: currentCountType,
        date: document.getElementById('countDate').value,
        locationFrom: document.getElementById('locationFrom').value,
        locationTo: document.getElementById('locationTo').value,
        itemNumber: document.getElementById('itemNumber').value,
        abcClass: document.getElementById('abcClass').value
      };
      
      WMS.showNotification('Generating count tasks...', 'info');
      
      setTimeout(() => {
        const tasksGenerated = Math.floor(Math.random() * 10) + 5;
        WMS.showNotification(`${tasksGenerated} count tasks generated successfully`, 'success');
        cancelCountGeneration();
      }, 1500);
    });
  }
  
  const countExecutionForm = document.getElementById('countExecutionForm');
  
  // Count execution
  if (countExecutionForm) {
    countExecutionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const item = countTaskData.items[currentItemIndex];
      const countedQty = parseInt(document.getElementById('countedQty').value);
      const scannedItem = document.getElementById('countItemScan').value;
      
      // Validate item scan
      if (!scannedItem.includes(item.item)) {
        WMS.showNotification('Scanned item does not match expected item', 'error');
        return;
      }
      
      // Check for variance
      const hasVariance = checkVariance(item.systemQty, countedQty);
      
      if (hasVariance) {
        const reason = document.getElementById('varianceReason').value;
        if (!reason) {
          WMS.showNotification('Please select variance reason', 'error');
          return;
        }
        varianceCount++;
      }
      
      // Record count
      itemsCounted++;
      
      // Update progress
      document.getElementById('itemsCounted').textContent = itemsCounted;
      document.getElementById('varianceCount').textContent = varianceCount;
      
      const accuracy = ((itemsCounted - varianceCount) / itemsCounted * 100).toFixed(1);
      document.getElementById('accuracyPct').textContent = accuracy + '%';
      
      WMS.showNotification(`Item ${currentItemIndex + 1} counted: ${countedQty} ${item.uom}`, 'success');
      
      // Move to next item
      currentItemIndex++;
      setTimeout(() => {
        loadNextCountItem();
      }, 800);
    });
  }
  
  // Task ID lookup
  const taskInput = document.getElementById('countTaskID');
  if (taskInput) {
    taskInput.addEventListener('blur', function() {
      const taskID = this.value.trim();
      if (taskID && !countTaskData) {
        loadCountTask(taskID);
      }
    });
    
    taskInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const taskID = this.value.trim();
        if (taskID) {
          loadCountTask(taskID);
        }
      }
    });
  }
  
  // Item verification
  const itemScanInput = document.getElementById('countItemScan');
  if (itemScanInput) {
    itemScanInput.addEventListener('blur', function() {
      const scanned = this.value.trim();
      if (scanned && countTaskData) {
        const item = countTaskData.items[currentItemIndex];
        if (!scanned.includes(item.item)) {
          WMS.showNotification('Item mismatch! Please scan correct item.', 'error');
          this.value = '';
        }
      }
    });
  }
  
  // Auto-save progress every 30 seconds
  setInterval(() => {
    if (countTaskData && itemsCounted > 0) {
      WMS.Storage.set(`countProgress_${currentCountTask}`, {
        taskID: currentCountTask,
        itemIndex: currentItemIndex,
        itemsCounted: itemsCounted,
        variances: varianceCount,
        timestamp: new Date().toISOString()
      });
    }
  }, 30000);
});
