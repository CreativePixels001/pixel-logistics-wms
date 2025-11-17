// DLT WMS - Picking Operations Module JavaScript
// Handles discrete, batch, LPN, and wave picking

let currentPickMethod = null;
let currentPickTask = null;
let currentLineIndex = 0;
let pickTaskData = null;
let pickedLines = 0;
let totalUnits = 0;
let shortPickCount = 0;

// Select picking method
function selectPickingMethod(method) {
  currentPickMethod = method;
  
  const methodLabels = {
    'discrete': 'Discrete Pick',
    'batch': 'Batch Pick',
    'lpn': 'Pick-by-LPN',
    'wave': 'Wave Pick'
  };
  
  document.getElementById('pickingTitle').textContent = methodLabels[method];
  document.getElementById('pickingInterface').style.display = 'block';
  document.getElementById('pickingInterface').scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  WMS.showNotification(`${methodLabels[method]} selected. Scan task to begin.`, 'info');
  
  setTimeout(() => {
    document.getElementById('pickTaskID').focus();
  }, 100);
}

// Start picking
function startPicking(taskID) {
  currentPickTask = taskID;
  currentPickMethod = 'discrete'; // Determine from task
  
  selectPickingMethod(currentPickMethod);
  document.getElementById('pickTaskID').value = taskID;
  loadPickTask(taskID);
}

// Load pick task
function loadPickTask(taskID) {
  WMS.showNotification('Loading pick task...', 'info');
  
  setTimeout(() => {
    // Mock pick task data
    pickTaskData = {
      taskID: taskID,
      orderNum: 'SO-2025-1001',
      customer: 'Acme Corp',
      lines: [
        { item: 'ITM-5678', description: 'Widget Assembly A', required: 100, uom: 'EA', location: 'A-01-01-A', lpn: 'LPN-1001' },
        { item: 'ITM-5679', description: 'Component B', required: 150, uom: 'EA', location: 'A-01-02-B', lpn: 'LPN-1002' },
        { item: 'ITM-5680', description: 'Part C', required: 100, uom: 'EA', location: 'A-02-01-A', lpn: 'LPN-1003' }
      ]
    };
    
    document.getElementById('pickOrderNum').value = pickTaskData.orderNum;
    document.getElementById('pickCustomer').value = pickTaskData.customer;
    
    currentLineIndex = 0;
    pickedLines = 0;
    totalUnits = 0;
    shortPickCount = 0;
    
    loadNextPickLine();
    
    document.getElementById('pickProgress').style.display = 'block';
    document.getElementById('totalLines').textContent = pickTaskData.lines.length;
    
    WMS.showNotification('Pick task loaded successfully', 'success');
  }, 1000);
}

// Load next pick line
function loadNextPickLine() {
  if (currentLineIndex >= pickTaskData.lines.length) {
    completePickTask();
    return;
  }
  
  const line = pickTaskData.lines[currentLineIndex];
  
  document.getElementById('pickItem').textContent = line.item;
  document.getElementById('pickDescription').textContent = line.description;
  document.getElementById('pickRequired').textContent = `${line.required} ${line.uom}`;
  document.getElementById('suggestedLocation').value = line.location;
  
  document.getElementById('pickLineNum').textContent = `Line ${currentLineIndex + 1} of ${pickTaskData.lines.length}`;
  
  // Clear inputs
  document.getElementById('pickLocation').value = '';
  document.getElementById('pickLPN').value = '';
  document.getElementById('pickedQty').value = '';
  document.getElementById('pickLot').value = '';
  document.getElementById('dropLocation').value = '';
  
  document.getElementById('shortPickAlert').style.display = 'none';
  document.getElementById('currentPickLine').style.display = 'block';
  
  document.getElementById('pickLocation').focus();
}

// Skip pick line
function skipPickLine() {
  if (confirm('Skip this pick line? It will remain open for later picking.')) {
    currentLineIndex++;
    loadNextPickLine();
  }
}

// Cancel picking
function cancelPicking() {
  if (confirm('Cancel picking? Progress will be saved.')) {
    resetPickingInterface();
    WMS.showNotification('Picking cancelled. Progress saved.', 'info');
  }
}

// Reset picking interface
function resetPickingInterface() {
  document.getElementById('pickingInterface').style.display = 'none';
  document.getElementById('pickingForm').reset();
  document.getElementById('currentPickLine').style.display = 'none';
  document.getElementById('pickProgress').style.display = 'none';
  
  currentPickTask = null;
  currentPickMethod = null;
  pickTaskData = null;
  currentLineIndex = 0;
  pickedLines = 0;
  totalUnits = 0;
  shortPickCount = 0;
}

// Complete pick task
function completePickTask() {
  document.getElementById('currentPickLine').style.display = 'none';
  
  const summary = {
    taskID: currentPickTask,
    totalLines: pickTaskData.lines.length,
    pickedLines: pickedLines,
    totalUnits: totalUnits,
    shortPicks: shortPickCount,
    completedBy: 'Ashish Kumar',
    completedDate: WMS.formatDateTime(new Date())
  };
  
  // Save to storage
  const completedPicks = WMS.Storage.get('completedPicks') || [];
  completedPicks.unshift(summary);
  WMS.Storage.set('completedPicks', completedPicks);
  
  WMS.showNotification(`Pick task ${currentPickTask} completed! ${pickedLines} lines, ${totalUnits} units picked.`, 'success');
  
  // Update task table
  updatePickTaskStatus(currentPickTask, 'Completed');
  
  setTimeout(() => {
    resetPickingInterface();
  }, 2000);
}

// Check for short pick
function checkShortPick(required, picked) {
  if (picked < required) {
    const shortage = required - picked;
    document.getElementById('shortPickMessage').textContent = 
      `Picked ${picked} but required ${required}. Short by ${shortage} units. Please provide reason.`;
    document.getElementById('shortPickAlert').style.display = 'block';
    return true;
  }
  return false;
}

// Update pick task status in table
function updatePickTaskStatus(taskID, newStatus) {
  const tbody = document.getElementById('pickTasksTable');
  const rows = tbody.getElementsByTagName('tr');
  
  for (let row of rows) {
    const taskCell = row.cells[0];
    if (taskCell.textContent.includes(taskID)) {
      const statusCell = row.cells[8];
      const badge = newStatus === 'Completed' 
        ? '<span class="badge badge-primary">Completed</span>'
        : '<span class="badge badge-primary">In Progress</span>';
      statusCell.innerHTML = badge;
      
      if (newStatus === 'Completed') {
        const actionCell = row.cells[9];
        actionCell.innerHTML = '<button class="btn btn-sm btn-outline" disabled>Completed</button>';
      }
      break;
    }
  }
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const pickingForm = document.getElementById('pickingForm');
  
  if (pickingForm) {
    pickingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const line = pickTaskData.lines[currentLineIndex];
      const pickedQty = parseInt(document.getElementById('pickedQty').value);
      const scannedLocation = document.getElementById('pickLocation').value;
      const suggestedLocation = document.getElementById('suggestedLocation').value;
      
      // Validate location
      if (scannedLocation !== suggestedLocation) {
        if (!confirm(`Location mismatch! Expected: ${suggestedLocation}, Scanned: ${scannedLocation}. Continue?`)) {
          return;
        }
      }
      
      // Check for short pick
      const isShortPick = checkShortPick(line.required, pickedQty);
      
      if (isShortPick) {
        const reason = document.getElementById('shortPickReason').value;
        if (!reason) {
          WMS.showNotification('Please select short pick reason', 'error');
          return;
        }
        shortPickCount++;
      }
      
      // Record pick
      pickedLines++;
      totalUnits += pickedQty;
      
      // Update progress
      document.getElementById('linesPicked').textContent = pickedLines;
      document.getElementById('unitsPicked').textContent = totalUnits;
      document.getElementById('shortPicks').textContent = shortPickCount;
      
      WMS.showNotification(`Line ${currentLineIndex + 1} picked: ${pickedQty} ${line.uom}`, 'success');
      
      // Move to next line
      currentLineIndex++;
      setTimeout(() => {
        loadNextPickLine();
      }, 800);
    });
  }
  
  // Task ID lookup
  const taskInput = document.getElementById('pickTaskID');
  if (taskInput) {
    taskInput.addEventListener('blur', function() {
      const taskID = this.value.trim();
      if (taskID && !pickTaskData) {
        loadPickTask(taskID);
      }
    });
    
    taskInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const taskID = this.value.trim();
        if (taskID) {
          loadPickTask(taskID);
        }
      }
    });
  }
  
  // Location verification
  const locationInput = document.getElementById('pickLocation');
  const suggestedLocationInput = document.getElementById('suggestedLocation');
  
  if (locationInput && suggestedLocationInput) {
    locationInput.addEventListener('blur', function() {
      const scanned = this.value.trim();
      const suggested = suggestedLocationInput.value;
      
      if (scanned && scanned !== suggested) {
        WMS.showNotification('Location does not match suggestion', 'error');
      }
    });
  }
  
  // Auto-save progress every 30 seconds
  setInterval(() => {
    if (pickTaskData && pickedLines > 0) {
      WMS.Storage.set(`pickProgress_${currentPickTask}`, {
        taskID: currentPickTask,
        lineIndex: currentLineIndex,
        pickedLines: pickedLines,
        totalUnits: totalUnits,
        shortPicks: shortPickCount,
        timestamp: new Date().toISOString()
      });
    }
  }, 30000);
});
