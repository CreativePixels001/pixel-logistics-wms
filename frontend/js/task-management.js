// DLT WMS - Task Management Module JavaScript
// Handles task orchestration, assignment, prioritization, and worker performance tracking

let selectedTasks = new Set();

// Toggle select all
function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.task-checkbox');
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
    const taskId = checkbox.dataset.taskId;
    if (selectAllCheckbox.checked) {
      selectedTasks.add(taskId);
    } else {
      selectedTasks.delete(taskId);
    }
  });
  
  updateSelectedCount();
}

// Update selected count
function updateSelectedCount() {
  document.getElementById('selectedCount').textContent = selectedTasks.size;
}

// Filter tasks
function filterTasks() {
  const type = document.getElementById('filterTaskType').value;
  const priority = document.getElementById('filterPriority').value;
  const status = document.getElementById('filterStatus').value;
  const worker = document.getElementById('filterWorker').value;
  
  WMS.showNotification('Filtering tasks...', 'info');
  
  // In a real app, this would filter the table based on selected criteria
  setTimeout(() => {
    const filterCount = Math.floor(Math.random() * 20) + 10;
    WMS.showNotification(`${filterCount} tasks match your filters`, 'success');
  }, 500);
}

// Bulk assign tasks
function bulkAssign() {
  if (selectedTasks.size === 0) {
    WMS.showNotification('Please select tasks to assign', 'error');
    return;
  }
  
  const worker = prompt('Enter worker name to assign tasks:');
  
  if (worker) {
    WMS.showNotification(`Assigning ${selectedTasks.size} tasks to ${worker}...`, 'info');
    
    setTimeout(() => {
      WMS.showNotification(`${selectedTasks.size} tasks assigned to ${worker}`, 'success');
      
      // Clear selection
      selectedTasks.clear();
      document.getElementById('selectAll').checked = false;
      document.querySelectorAll('.task-checkbox').forEach(cb => cb.checked = false);
      updateSelectedCount();
    }, 1000);
  }
}

// Auto dispatch tasks
function autoDispatch() {
  WMS.showNotification('Running auto-dispatch algorithm...', 'info');
  
  setTimeout(() => {
    const assignedCount = Math.floor(Math.random() * 15) + 10;
    WMS.showNotification(`${assignedCount} tasks auto-assigned based on worker availability and location`, 'success');
  }, 1500);
}

// Show create task form
function showCreateTask() {
  const taskType = prompt('Enter task type (putaway/replenishment/picking/cycle-count/packing):');
  
  if (taskType) {
    const taskID = 'TASK-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    WMS.showNotification(`Task ${taskID} created - type: ${taskType}`, 'success');
  }
}

// View task details
function viewTask(taskID) {
  WMS.showNotification(`Loading task ${taskID}...`, 'info');
  
  setTimeout(() => {
    alert(`Task Details: ${taskID}\n\nType: Putaway\nItem: ITM-5678\nLocation: A-01-05-A\nPriority: High\nAssigned: John Smith\nStatus: In Progress\n\nEstimated time: 5 minutes\nStarted: 10:45 AM`);
  }, 500);
}

// Assign task
function assignTask(taskID) {
  const worker = prompt('Assign task to worker:');
  
  if (worker) {
    WMS.showNotification(`Task ${taskID} assigned to ${worker}`, 'success');
    
    // Update UI
    setTimeout(() => {
      const tbody = document.getElementById('tasksTable');
      const rows = tbody.getElementsByTagName('tr');
      
      for (let row of rows) {
        const taskCell = row.cells[1];
        if (taskCell.textContent.includes(taskID)) {
          row.cells[6].textContent = worker;
          row.cells[9].innerHTML = '<span class="badge badge-outline">Assigned</span>';
          row.cells[10].innerHTML = `<button class="btn btn-sm btn-outline" onclick="viewTask('${taskID}')">View</button>`;
          break;
        }
      }
    }, 500);
  }
}

// Calculate worker productivity
function calculateProductivity(completed, avgTime) {
  const targetCompleted = 40;
  const targetTime = 20;
  
  const completedRatio = (completed / targetCompleted) * 100;
  const timeRatio = (targetTime / avgTime) * 100;
  
  return Math.round((completedRatio + timeRatio) / 2);
}

// Update worker metrics
function updateWorkerMetrics() {
  const workers = WMS.Storage.get('workers') || [];
  
  // In a real app, this would fetch live worker data and update the performance table
  WMS.showNotification('Worker metrics updated', 'info');
}

// Task performance analytics
function generateTaskAnalytics() {
  const tasks = WMS.Storage.get('allTasks') || [];
  
  const analytics = {
    totalTasks: tasks.length,
    completedToday: tasks.filter(t => t.completedDate === WMS.formatDate(new Date())).length,
    avgCompletionTime: '18m',
    workerUtilization: '78%'
  };
  
  return analytics;
}

// Initialize task management
document.addEventListener('DOMContentLoaded', function() {
  
  // Handle individual checkbox selection
  const checkboxes = document.querySelectorAll('.task-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const taskId = this.dataset.taskId;
      
      if (this.checked) {
        selectedTasks.add(taskId);
      } else {
        selectedTasks.delete(taskId);
        document.getElementById('selectAll').checked = false;
      }
      
      updateSelectedCount();
    });
  });
  
  // Load initial data
  updateSelectedCount();
  
  // Refresh metrics every 30 seconds
  setInterval(() => {
    updateWorkerMetrics();
  }, 30000);
  
  // Auto-refresh task queue every 60 seconds
  setInterval(() => {
    const openTasks = document.querySelectorAll('.task-checkbox').length;
    console.log(`Task queue refreshed - ${openTasks} tasks visible`);
  }, 60000);
});

// Export functions for external access
window.TaskManagement = {
  assignTask,
  viewTask,
  bulkAssign,
  autoDispatch,
  calculateProductivity,
  generateTaskAnalytics
};
