/**
 * Labor Management Module
 * Worker productivity, time tracking, and performance metrics
 */

// Worker data
const workers = [
  { id: 'W001', name: 'John Smith', shift: 'day', status: 'active', tasksToday: 45, uph: 125, efficiency: 115, tier: 1 },
  { id: 'W002', name: 'Sarah Johnson', shift: 'day', status: 'active', tasksToday: 42, uph: 118, efficiency: 112, tier: 1 },
  { id: 'W003', name: 'Mike Davis', shift: 'day', status: 'active', tasksToday: 38, uph: 108, efficiency: 108, tier: 2 },
  { id: 'W004', name: 'Emily Brown', shift: 'night', status: 'active', tasksToday: 40, uph: 115, efficiency: 110, tier: 1 },
  { id: 'W005', name: 'David Wilson', shift: 'day', status: 'break', tasksToday: 35, uph: 105, efficiency: 105, tier: 2 },
  { id: 'W006', name: 'Lisa Martinez', shift: 'night', status: 'active', tasksToday: 37, uph: 102, efficiency: 102, tier: 2 },
  { id: 'W007', name: 'James Taylor', shift: 'swing', status: 'active', tasksToday: 33, uph: 98, efficiency: 98, tier: 3 },
  { id: 'W008', name: 'Jennifer Lee', shift: 'day', status: 'active', tasksToday: 41, uph: 112, efficiency: 111, tier: 1 },
  { id: 'W009', name: 'Robert Garcia', shift: 'night', status: 'active', tasksToday: 36, uph: 100, efficiency: 100, tier: 2 },
  { id: 'W010', name: 'Maria Rodriguez', shift: 'swing', status: 'active', tasksToday: 39, uph: 110, efficiency: 109, tier: 2 },
  { id: 'W011', name: 'William Anderson', shift: 'day', status: 'active', tasksToday: 44, uph: 120, efficiency: 114, tier: 1 },
  { id: 'W012', name: 'Patricia Thomas', shift: 'night', status: 'offline', tasksToday: 0, uph: 0, efficiency: 0, tier: 0 },
  { id: 'W013', name: 'Charles Jackson', shift: 'swing', status: 'active', tasksToday: 34, uph: 96, efficiency: 96, tier: 3 },
  { id: 'W014', name: 'Nancy White', shift: 'day', status: 'active', tasksToday: 43, uph: 116, efficiency: 113, tier: 1 },
  { id: 'W015', name: 'Daniel Harris', shift: 'night', status: 'active', tasksToday: 38, uph: 107, efficiency: 107, tier: 2 },
  { id: 'W016', name: 'Betty Martin', shift: 'swing', status: 'break', tasksToday: 31, uph: 92, efficiency: 92, tier: 3 },
  { id: 'W017', name: 'Steven Thompson', shift: 'day', status: 'active', tasksToday: 40, uph: 114, efficiency: 110, tier: 1 },
  { id: 'W018', name: 'Karen Moore', shift: 'night', status: 'active', tasksToday: 37, uph: 104, efficiency: 104, tier: 2 },
  { id: 'W019', name: 'Paul Clark', shift: 'swing', status: 'active', tasksToday: 35, uph: 99, efficiency: 99, tier: 3 },
  { id: 'W020', name: 'Sandra Lewis', shift: 'day', status: 'active', tasksToday: 42, uph: 117, efficiency: 112, tier: 1 }
];

// Productivity data for chart (last 7 days)
const productivityData = [
  { day: 'Mon', efficiency: 102 },
  { day: 'Tue', efficiency: 105 },
  { day: 'Wed', efficiency: 103 },
  { day: 'Thu', efficiency: 107 },
  { day: 'Fri', efficiency: 108 },
  { day: 'Sat', efficiency: 106 },
  { day: 'Sun', efficiency: 107 }
];

let currentShiftFilter = 'all';

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
  renderLeaderboard();
  renderWorkersTable();
  updateStats();
  startClock();
});

/**
 * Render leaderboard
 */
function renderLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  
  // Sort by efficiency, top 10
  const topPerformers = [...workers]
    .filter(w => w.status !== 'offline')
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 10);
  
  leaderboard.innerHTML = topPerformers.map((worker, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
    const tierClass = getTierClass(worker.tier);
    
    return `
      <div class="leaderboard-item">
        <div class="leaderboard-rank">${medal || (index + 1)}</div>
        <div class="leaderboard-worker">
          <div class="worker-avatar">${worker.name.split(' ').map(n => n[0]).join('')}</div>
          <div class="worker-details">
            <div class="worker-name">${worker.name}</div>
            <div class="worker-id">${worker.id} - ${capitalizeFirst(worker.shift)} Shift</div>
          </div>
        </div>
        <div class="leaderboard-stats">
          <div class="stat-item">
            <span>Tasks:</span>
            <strong>${worker.tasksToday}</strong>
          </div>
          <div class="stat-item">
            <span>UPH:</span>
            <strong>${worker.uph}</strong>
          </div>
          <div class="stat-item">
            <span>Efficiency:</span>
            <strong class="${tierClass}">${worker.efficiency}%</strong>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render workers table
 */
function renderWorkersTable() {
  const tbody = document.getElementById('workersTable');
  
  const filtered = currentShiftFilter === 'all' 
    ? workers 
    : workers.filter(w => w.shift === currentShiftFilter);
  
  tbody.innerHTML = filtered.map(worker => {
    const statusBadge = getStatusBadge(worker.status);
    const tierClass = getTierClass(worker.tier);
    const incentive = calculateIncentive(worker);
    
    return `
      <tr>
        <td><strong>${worker.id}</strong></td>
        <td>${worker.name}</td>
        <td>${capitalizeFirst(worker.shift)}</td>
        <td>${statusBadge}</td>
        <td>${worker.tasksToday}</td>
        <td>${worker.uph}</td>
        <td><strong class="${tierClass}">${worker.efficiency}%</strong></td>
        <td><strong style="color: #10b981;">$${incentive}</strong></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="viewWorkerDetails('${worker.id}')">
            View Details
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Get status badge
 */
function getStatusBadge(status) {
  const badges = {
    'active': '<span class="status-badge status-success">Active</span>',
    'break': '<span class="status-badge status-warning">On Break</span>',
    'offline': '<span class="status-badge status-error">Offline</span>'
  };
  return badges[status] || badges.offline;
}

/**
 * Get tier class
 */
function getTierClass(tier) {
  const classes = {
    1: 'tier-excellent',
    2: 'tier-good',
    3: 'tier-average',
    0: 'tier-poor'
  };
  return classes[tier] || classes[0];
}

/**
 * Calculate incentive
 */
function calculateIncentive(worker) {
  if (worker.status === 'offline' || worker.tasksToday === 0) return 0;
  
  const hoursWorked = 8; // Assume 8 hour shift
  let hourlyBonus = 0;
  
  if (worker.efficiency >= 110) {
    hourlyBonus = 2.00; // Tier 1
  } else if (worker.efficiency >= 100) {
    hourlyBonus = 1.00; // Tier 2
  } else if (worker.efficiency >= 90) {
    hourlyBonus = 0.50; // Tier 3
  }
  
  return (hourlyBonus * hoursWorked).toFixed(2);
}

/**
 * Update stats
 */
function updateStats() {
  const activeCount = workers.filter(w => w.status === 'active').length;
  document.getElementById('activeWorkers').textContent = activeCount;
  
  const avgEff = workers
    .filter(w => w.status !== 'offline')
    .reduce((sum, w) => sum + w.efficiency, 0) / workers.filter(w => w.status !== 'offline').length;
  document.getElementById('avgEfficiency').textContent = Math.round(avgEff) + '%';
  
  const totalTasks = workers.reduce((sum, w) => sum + w.tasksToday, 0);
  document.getElementById('tasksCompleted').textContent = totalTasks;
  
  const totalIncentives = workers.reduce((sum, w) => sum + parseFloat(calculateIncentive(w)), 0);
  document.getElementById('incentivesEarned').textContent = '$' + totalIncentives.toFixed(0);
}

/**
 * Filter by shift
 */
function filterByShift() {
  currentShiftFilter = document.getElementById('shiftFilter').value;
  renderWorkersTable();
}

/**
 * Open clock in modal
 */
function openClockInModal() {
  document.getElementById('clockInModal').classList.add('active');
}

/**
 * Close modal
 */
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

/**
 * Submit clock action
 */
function submitClockAction() {
  const workerId = document.getElementById('workerIdInput').value.trim().toUpperCase();
  const action = document.getElementById('clockAction').value;
  
  if (!workerId) {
    if (typeof notify !== 'undefined') {
      notify.error('Please enter Worker ID');
    } else {
      alert('Please enter Worker ID');
    }
    return;
  }
  
  const worker = workers.find(w => w.id === workerId);
  if (!worker) {
    if (typeof notify !== 'undefined') {
      notify.error('Worker not found');
    } else {
      alert('Worker not found');
    }
    return;
  }
  
  // Update worker status based on action
  if (action === 'in') {
    worker.status = 'active';
  } else if (action === 'out') {
    worker.status = 'offline';
  } else if (action === 'break-start') {
    worker.status = 'break';
  } else if (action === 'break-end') {
    worker.status = 'active';
  }
  
  if (typeof notify !== 'undefined') {
    notify.success(`${worker.name} - ${action.replace('-', ' ')} recorded at ${new Date().toLocaleTimeString()}`);
  } else {
    alert(`${worker.name} - ${action.replace('-', ' ')} recorded`);
  }
  
  renderWorkersTable();
  renderLeaderboard();
  updateStats();
  closeModal('clockInModal');
  
  // Clear input
  document.getElementById('workerIdInput').value = '';
}

/**
 * View worker details
 */
function viewWorkerDetails(workerId) {
  const worker = workers.find(w => w.id === workerId);
  if (!worker) return;
  
  document.getElementById('workerDetailsTitle').textContent = `${worker.name} - Performance Scorecard`;
  
  const scorecard = document.getElementById('workerScorecard');
  const incentive = calculateIncentive(worker);
  const tierClass = getTierClass(worker.tier);
  
  scorecard.innerHTML = `
    <div class="scorecard-header">
      <div class="worker-avatar-large">${worker.name.split(' ').map(n => n[0]).join('')}</div>
      <div>
        <h3>${worker.name}</h3>
        <p>${worker.id} - ${capitalizeFirst(worker.shift)} Shift</p>
      </div>
    </div>
    
    <div class="scorecard-metrics">
      <div class="metric-card">
        <div class="metric-label">Tasks Completed</div>
        <div class="metric-value">${worker.tasksToday}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Units Per Hour</div>
        <div class="metric-value">${worker.uph}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Efficiency</div>
        <div class="metric-value ${tierClass}">${worker.efficiency}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Incentive Earned</div>
        <div class="metric-value" style="color: #10b981;">$${incentive}</div>
      </div>
    </div>
    
    <div class="scorecard-details">
      <h4>Performance Details</h4>
      <table class="details-table">
        <tr>
          <td>Status:</td>
          <td>${getStatusBadge(worker.status)}</td>
        </tr>
        <tr>
          <td>Performance Tier:</td>
          <td><strong class="${tierClass}">Tier ${worker.tier || 'N/A'}</strong></td>
        </tr>
        <tr>
          <td>Shift Type:</td>
          <td>${capitalizeFirst(worker.shift)}</td>
        </tr>
        <tr>
          <td>Hourly Rate Bonus:</td>
          <td>$${(parseFloat(incentive) / 8).toFixed(2)}/hour</td>
        </tr>
      </table>
    </div>
  `;
  
  document.getElementById('workerDetailsModal').classList.add('active');
}

/**
 * View productivity chart
 */
function viewProductivityChart() {
  document.getElementById('chartCard').style.display = 'block';
  renderProductivityChart();
}

/**
 * Hide productivity chart
 */
function hideProductivityChart() {
  document.getElementById('chartCard').style.display = 'none';
}

/**
 * Render productivity chart
 */
function renderProductivityChart() {
  const canvas = document.getElementById('productivityChart');
  const ctx = canvas.getContext('2d');
  
  const barWidth = 80;
  const spacing = 40;
  const maxHeight = 250;
  const maxEfficiency = 120;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw bars
  productivityData.forEach((data, i) => {
    const x = spacing + (i * (barWidth + spacing));
    const height = (data.efficiency / maxEfficiency) * maxHeight;
    const y = canvas.height - height - 30;
    
    // Bar color based on efficiency
    let color = '#10b981'; // Green
    if (data.efficiency < 100) color = '#ef4444'; // Red
    else if (data.efficiency < 105) color = '#f59e0b'; // Orange
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, height);
    
    // Label
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '14px -apple-system';
    ctx.textAlign = 'center';
    ctx.fillText(data.day, x + barWidth/2, canvas.height - 10);
    ctx.fillText(data.efficiency + '%', x + barWidth/2, y - 10);
  });
  
  // Draw baseline at 100%
  const baselineY = canvas.height - ((100 / maxEfficiency) * maxHeight) - 30;
  ctx.strokeStyle = '#6b7280';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(0, baselineY);
  ctx.lineTo(canvas.width, baselineY);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Export productivity report
 */
function exportProductivityReport() {
  if (typeof notify !== 'undefined') {
    const hide = notify.loading('Generating report...');
    setTimeout(() => {
      hide();
      notify.success('Productivity report exported successfully!');
    }, 1500);
  } else {
    alert('Generating productivity report...');
    setTimeout(() => {
      alert('Report exported successfully!');
    }, 1000);
  }
}

/**
 * Start clock
 */
function startClock() {
  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const clockDiv = document.getElementById('currentTime');
    if (clockDiv) {
      clockDiv.innerHTML = `
        <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 16px;">
          <div style="font-size: 32px; font-weight: 700; color: #1a1a1a;">${timeStr}</div>
          <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">${dateStr}</div>
        </div>
      `;
    }
  }
  
  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Toggle sidebar section
 */
function toggleSidebarSection(element) {
  const section = element.parentElement;
  const menu = section.querySelector('.sidebar-menu');
  const icon = element.querySelector('.sidebar-title-icon');
  
  if (menu.style.display === 'none') {
    menu.style.display = 'block';
    icon.style.transform = 'rotate(0deg)';
  } else {
    menu.style.display = 'none';
    icon.style.transform = 'rotate(-90deg)';
  }
}
