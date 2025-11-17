// DLT WMS - Replenishment Module JavaScript
// Handles min/max replenishment, pick face optimization, and demand-based replenishment

let currentReplenType = null;
let currentReplenTask = null;

// Select replenishment type
function selectReplenType(type) {
  currentReplenType = type;
  
  const typeLabels = {
    'minmax': 'Min/Max Replenishment',
    'demand': 'Demand-Based Replenishment',
    'pickface': 'Pick Face Replenishment',
    'bulk': 'Bulk Replenishment'
  };
  
  document.getElementById('replenTypeTitle').textContent = typeLabels[type];
  document.getElementById('replenPlanForm').style.display = 'block';
  
  WMS.showNotification(`${typeLabels[type]} selected. Configure parameters.`, 'info');
  
  setTimeout(() => {
    document.getElementById('replenZone').focus();
  }, 100);
}

// Cancel replenishment planning
function cancelReplenPlan() {
  document.getElementById('replenPlanForm').reset();
  document.getElementById('replenPlanForm').style.display = 'none';
  currentReplenType = null;
}

// Start replenishment task
function startReplen(taskID) {
  currentReplenTask = taskID;
  
  document.getElementById('replenExecuteCard').style.display = 'block';
  document.getElementById('replenExecuteCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  document.getElementById('replenTaskID').value = taskID;
  loadReplenTask(taskID);
}

// Load replenishment task
function loadReplenTask(taskID) {
  WMS.showNotification('Loading replenishment task...', 'info');
  
  setTimeout(() => {
    // Mock replen task data
    const taskData = {
      taskID: taskID,
      type: 'Min/Max',
      priority: 'High',
      item: 'ITM-5678',
      description: 'Widget Assembly A',
      qty: 200,
      uom: 'EA',
      sourceLocation: 'B-05-12-A',
      sourceType: 'Reserve Storage',
      sourceQty: 500,
      sourceLPN: 'LPN-1001',
      destLocation: 'A-01-05-A',
      destType: 'Pick Face',
      destQty: 15,
      destCapacity: 250
    };
    
    document.getElementById('taskType').value = taskData.type;
    document.getElementById('taskPriority').value = taskData.priority;
    document.getElementById('taskItem').textContent = taskData.item;
    document.getElementById('taskDescription').textContent = taskData.description;
    document.getElementById('taskQty').textContent = `${taskData.qty} ${taskData.uom}`;
    
    document.getElementById('sourceLocation').textContent = taskData.sourceLocation;
    document.getElementById('sourceType').textContent = taskData.sourceType;
    document.getElementById('sourceQty').textContent = `${taskData.sourceQty} ${taskData.uom}`;
    document.getElementById('sourceLPN').textContent = taskData.sourceLPN;
    
    document.getElementById('destLocation').textContent = taskData.destLocation;
    document.getElementById('destType').textContent = taskData.destType;
    document.getElementById('destQty').textContent = `${taskData.destQty} ${taskData.uom}`;
    document.getElementById('destCapacity').textContent = `${taskData.destCapacity} ${taskData.uom}`;
    
    document.getElementById('movedQty').value = taskData.qty;
    
    document.getElementById('taskDetails').style.display = 'block';
    document.getElementById('replenActions').style.display = 'flex';
    
    WMS.showNotification('Replenishment task loaded', 'success');
    
    setTimeout(() => {
      document.getElementById('scanSource').focus();
    }, 100);
  }, 1000);
}

// Cancel replenishment execution
function cancelReplen() {
  if (confirm('Cancel replenishment? Task will remain open.')) {
    resetReplenExecution();
    WMS.showNotification('Replenishment cancelled', 'info');
  }
}

// Reset replenishment execution
function resetReplenExecution() {
  document.getElementById('replenExecuteCard').style.display = 'none';
  document.getElementById('replenExecuteForm').reset();
  document.getElementById('taskDetails').style.display = 'none';
  document.getElementById('replenActions').style.display = 'none';
  
  currentReplenTask = null;
}

// Update task status in table
function updateReplenTaskStatus(taskID, newStatus) {
  const tbody = document.getElementById('replenTasksTable');
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
  const replenPlanForm = document.getElementById('replenPlanForm');
  
  // Replenishment planning
  if (replenPlanForm) {
    replenPlanForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const planParams = {
        type: currentReplenType,
        zone: document.getElementById('replenZone').value,
        item: document.getElementById('replenItem').value,
        abcClass: document.getElementById('replenABC').value,
        minThreshold: document.getElementById('minThreshold').value,
        maxCapacity: document.getElementById('maxCapacity').value,
        priority: document.getElementById('replenPriority').value
      };
      
      WMS.showNotification('Generating replenishment tasks...', 'info');
      
      setTimeout(() => {
        const tasksGenerated = Math.floor(Math.random() * 15) + 5;
        WMS.showNotification(`${tasksGenerated} replenishment tasks generated`, 'success');
        cancelReplenPlan();
      }, 1500);
    });
  }
  
  const replenExecuteForm = document.getElementById('replenExecuteForm');
  
  // Replenishment execution
  if (replenExecuteForm) {
    replenExecuteForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      const sourceLocation = document.getElementById('sourceLocation').textContent;
      const destLocation = document.getElementById('destLocation').textContent;
      const scannedSource = document.getElementById('scanSource').value;
      const scannedDest = document.getElementById('scanDest').value;
      
      // Validate locations
      if (scannedSource !== sourceLocation) {
        WMS.showNotification('Source location mismatch!', 'error');
        return;
      }
      
      if (scannedDest !== destLocation) {
        WMS.showNotification('Destination location mismatch!', 'error');
        return;
      }
      
      const movedQty = parseInt(document.getElementById('movedQty').value);
      
      const replenishment = {
        taskID: currentReplenTask,
        item: document.getElementById('taskItem').textContent,
        qty: movedQty,
        fromLocation: sourceLocation,
        toLocation: destLocation,
        lpn: document.getElementById('scanLPN').value,
        lot: document.getElementById('replenLot').value,
        completedBy: 'Ashish Kumar',
        completedDate: WMS.formatDateTime(new Date())
      };
      
      // Save to storage
      const completedReplen = WMS.Storage.get('completedReplen') || [];
      completedReplen.unshift(replenishment);
      WMS.Storage.set('completedReplen', completedReplen);
      
      WMS.showNotification(`Replenishment ${currentReplenTask} completed! ${movedQty} units moved.`, 'success');
      
      // Update task table
      updateReplenTaskStatus(currentReplenTask, 'Completed');
      
      setTimeout(() => {
        resetReplenExecution();
      }, 2000);
    });
  }
  
  // Task ID lookup
  const taskInput = document.getElementById('replenTaskID');
  if (taskInput) {
    taskInput.addEventListener('blur', function() {
      const taskID = this.value.trim();
      if (taskID && !currentReplenTask) {
        loadReplenTask(taskID);
      }
    });
    
    taskInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const taskID = this.value.trim();
        if (taskID) {
          loadReplenTask(taskID);
        }
      }
    });
  }
  
  // Location verification
  const scanSourceInput = document.getElementById('scanSource');
  const scanDestInput = document.getElementById('scanDest');
  
  if (scanSourceInput) {
    scanSourceInput.addEventListener('blur', function() {
      const scanned = this.value.trim();
      const expected = document.getElementById('sourceLocation').textContent;
      
      if (scanned && scanned !== expected) {
        WMS.showNotification(`Expected ${expected}, scanned ${scanned}`, 'error');
      }
    });
  }
  
  if (scanDestInput) {
    scanDestInput.addEventListener('blur', function() {
      const scanned = this.value.trim();
      const expected = document.getElementById('destLocation').textContent;
      
      if (scanned && scanned !== expected) {
        WMS.showNotification(`Expected ${expected}, scanned ${scanned}`, 'error');
      }
    });
  }
});
