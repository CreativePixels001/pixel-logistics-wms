/**
 * Slotting Optimization Module
 * ABC analysis, location optimization, and space utilization
 */

// Sample SKU data with ABC classification
const skuData = [
  { sku: 'ITEM001', name: 'Laptop Computer', category: 'A', velocity: 150, revenue: 75000, currentLoc: 'C-12-05', recommendedLoc: 'A-01-02', size: 'Medium' },
  { sku: 'ITEM002', name: 'Wireless Mouse', category: 'A', velocity: 200, revenue: 20000, currentLoc: 'B-08-03', recommendedLoc: 'A-01-04', size: 'Small' },
  { sku: 'ITEM003', name: 'USB-C Cable', category: 'A', velocity: 180, revenue: 9000, currentLoc: 'C-15-01', recommendedLoc: 'A-02-01', size: 'Small' },
  { sku: 'ITEM004', name: 'Monitor 24"', category: 'B', velocity: 80, revenue: 32000, currentLoc: 'A-05-02', recommendedLoc: 'B-04-03', size: 'Large' },
  { sku: 'ITEM005', name: 'Keyboard Mechanical', category: 'B', velocity: 90, revenue: 18000, currentLoc: 'C-10-04', recommendedLoc: 'B-03-02', size: 'Medium' },
  { sku: 'ITEM006', name: 'Webcam HD', category: 'B', velocity: 70, revenue: 10500, currentLoc: 'B-06-01', recommendedLoc: 'B-05-01', size: 'Small' },
  { sku: 'ITEM007', name: 'Desk Lamp', category: 'C', velocity: 25, revenue: 3750, currentLoc: 'A-03-01', recommendedLoc: 'C-08-02', size: 'Medium' },
  { sku: 'ITEM008', name: 'Paper Clips Box', category: 'C', velocity: 30, revenue: 600, currentLoc: 'A-02-03', recommendedLoc: 'C-12-01', size: 'Small' },
  { sku: 'ITEM009', name: 'Stapler Heavy Duty', category: 'C', velocity: 20, revenue: 800, currentLoc: 'B-04-02', recommendedLoc: 'C-10-03', size: 'Small' },
  { sku: 'ITEM010', name: 'Office Chair', category: 'B', velocity: 60, revenue: 24000, currentLoc: 'C-14-01', recommendedLoc: 'B-06-04', size: 'Large' },
  { sku: 'ITEM011', name: 'Printer All-in-One', category: 'A', velocity: 120, revenue: 48000, currentLoc: 'C-11-02', recommendedLoc: 'A-03-01', size: 'Large' },
  { sku: 'ITEM012', name: 'External Hard Drive', category: 'A', velocity: 140, revenue: 21000, currentLoc: 'B-09-01', recommendedLoc: 'A-02-03', size: 'Small' },
  { sku: 'ITEM013', name: 'Notebook 200pg', category: 'C', velocity: 35, revenue: 1050, currentLoc: 'A-04-02', recommendedLoc: 'C-09-01', size: 'Small' },
  { sku: 'ITEM014', name: 'Desk Organizer', category: 'C', velocity: 28, revenue: 840, currentLoc: 'B-05-03', recommendedLoc: 'C-11-02', size: 'Medium' },
  { sku: 'ITEM015', name: 'Headphones Wireless', category: 'A', velocity: 160, revenue: 32000, currentLoc: 'C-13-01', recommendedLoc: 'A-01-03', size: 'Medium' }
];

// Zone utilization data
const zoneData = [
  { zone: 'A', name: 'Fast Movers', capacity: 100, used: 85, utilization: 85 },
  { zone: 'B', name: 'Medium Movers', capacity: 150, used: 112, utilization: 75 },
  { zone: 'C', name: 'Slow Movers', capacity: 200, used: 140, utilization: 70 }
];

let currentFilter = 'all';

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
  renderABCChart();
  renderRecommendations();
  renderZoneUtilization();
  updateStats();
});

/**
 * Render ABC Chart
 */
function renderABCChart() {
  const canvas = document.getElementById('abcChart');
  const ctx = canvas.getContext('2d');
  
  // Calculate category counts and revenue
  const categories = { A: 0, B: 0, C: 0 };
  const revenue = { A: 0, B: 0, C: 0 };
  
  skuData.forEach(item => {
    categories[item.category]++;
    revenue[item.category] += item.revenue;
  });
  
  // Simple bar chart
  const barWidth = 80;
  const spacing = 40;
  const maxHeight = 100;
  const maxRevenue = Math.max(...Object.values(revenue));
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw bars
  Object.keys(categories).forEach((cat, i) => {
    const x = spacing + (i * (barWidth + spacing));
    const height = (revenue[cat] / maxRevenue) * maxHeight;
    const y = canvas.height - height - 30;
    
    // Bar color
    const colors = { A: '#10b981', B: '#3b82f6', C: '#6b7280' };
    ctx.fillStyle = colors[cat];
    ctx.fillRect(x, y, barWidth, height);
    
    // Label
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '14px -apple-system';
    ctx.textAlign = 'center';
    ctx.fillText(`Class ${cat}`, x + barWidth/2, canvas.height - 10);
    ctx.fillText(`${categories[cat]} SKUs`, x + barWidth/2, y - 10);
    ctx.fillText(`$${(revenue[cat]/1000).toFixed(1)}K`, x + barWidth/2, y - 25);
  });
}

/**
 * Render slotting recommendations
 */
function renderRecommendations() {
  const tbody = document.getElementById('recommendationsTable');
  const filtered = currentFilter === 'all' 
    ? skuData 
    : skuData.filter(item => item.category === currentFilter);
  
  // Only show items that need reSlotting
  const needsSlotting = filtered.filter(item => item.currentLoc !== item.recommendedLoc);
  
  if (needsSlotting.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">All items optimally slotted</td></tr>';
    return;
  }
  
  tbody.innerHTML = needsSlotting.map(item => {
    const badge = getCategoryBadge(item.category);
    const reason = getSlottingReason(item);
    const impact = calculateImpact(item);
    
    return `
      <tr>
        <td><strong>${item.sku}</strong></td>
        <td>${item.name}</td>
        <td>${badge}</td>
        <td>${item.currentLoc}</td>
        <td><strong style="color: #10b981;">${item.recommendedLoc}</strong></td>
        <td>${reason}</td>
        <td><span class="badge badge-success">${impact}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="applyRecommendation('${item.sku}')">
            Apply
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Get category badge
 */
function getCategoryBadge(category) {
  const badges = {
    'A': '<span class="category-badge category-a">A</span>',
    'B': '<span class="category-badge category-b">B</span>',
    'C': '<span class="category-badge category-c">C</span>'
  };
  return badges[category];
}

/**
 * Get slotting reason
 */
function getSlottingReason(item) {
  if (item.category === 'A' && !item.currentLoc.startsWith('A')) {
    return 'High velocity - move to fast zone';
  }
  if (item.category === 'C' && item.currentLoc.startsWith('A')) {
    return 'Low velocity - free up prime space';
  }
  if (item.size === 'Large' && item.currentLoc.includes('01')) {
    return 'Heavy item - move to ground level';
  }
  return 'Optimize pick path';
}

/**
 * Calculate impact
 */
function calculateImpact(item) {
  if (item.category === 'A') return '-25% pick time';
  if (item.category === 'B') return '-15% pick time';
  return '-10% pick time';
}

/**
 * Render zone utilization
 */
function renderZoneUtilization() {
  const grid = document.getElementById('zoneGrid');
  
  grid.innerHTML = zoneData.map(zone => {
    const color = zone.utilization > 80 ? '#ef4444' : zone.utilization > 70 ? '#f59e0b' : '#10b981';
    
    return `
      <div class="zone-card">
        <div class="zone-header">
          <h4>Zone ${zone.zone}</h4>
          <span class="zone-util" style="color: ${color};">${zone.utilization}%</span>
        </div>
        <div class="zone-name">${zone.name}</div>
        <div class="zone-stats">
          <div class="zone-stat">
            <span>Used:</span>
            <strong>${zone.used} / ${zone.capacity}</strong>
          </div>
          <div class="zone-progress">
            <div class="zone-progress-bar" style="width: ${zone.utilization}%; background: ${color};"></div>
          </div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="viewZoneDetails('${zone.zone}')">
          View Details
        </button>
      </div>
    `;
  }).join('');
}

/**
 * Update stats
 */
function updateStats() {
  document.getElementById('totalSKUs').textContent = skuData.length;
  
  const avgUtil = zoneData.reduce((sum, z) => sum + z.utilization, 0) / zoneData.length;
  document.getElementById('spaceUtil').textContent = Math.round(avgUtil) + '%';
  
  const misplaced = skuData.filter(item => item.currentLoc !== item.recommendedLoc).length;
  document.getElementById('misplaced').textContent = misplaced;
  
  const savings = misplaced * 550; // $550 per month per misplaced item
  document.getElementById('savings').textContent = '$' + (savings/1000).toFixed(1) + 'K';
}

/**
 * Filter by category
 */
function filterByCategory() {
  currentFilter = document.getElementById('categoryFilter').value;
  renderRecommendations();
}

/**
 * Apply recommendation
 */
function applyRecommendation(sku) {
  const item = skuData.find(i => i.sku === sku);
  if (!item) return;
  
  if (typeof notify !== 'undefined') {
    notify.confirm(
      `Move ${item.name} from ${item.currentLoc} to ${item.recommendedLoc}?`,
      () => {
        item.currentLoc = item.recommendedLoc;
        notify.success(`${item.name} slotted to ${item.recommendedLoc}`);
        renderRecommendations();
        updateStats();
      }
    );
  } else {
    if (confirm(`Move ${item.name} from ${item.currentLoc} to ${item.recommendedLoc}?`)) {
      item.currentLoc = item.recommendedLoc;
      alert(`${item.name} slotted to ${item.recommendedLoc}`);
      renderRecommendations();
      updateStats();
    }
  }
}

/**
 * Apply all recommendations
 */
function applyAllRecommendations() {
  const needsSlotting = skuData.filter(item => item.currentLoc !== item.recommendedLoc);
  
  if (needsSlotting.length === 0) {
    if (typeof notify !== 'undefined') {
      notify.info('All items are already optimally slotted');
    } else {
      alert('All items are already optimally slotted');
    }
    return;
  }
  
  if (typeof notify !== 'undefined') {
    notify.confirm(
      `Apply all ${needsSlotting.length} recommendations?`,
      () => {
        needsSlotting.forEach(item => {
          item.currentLoc = item.recommendedLoc;
        });
        notify.success(`${needsSlotting.length} items re-slotted successfully!`);
        renderRecommendations();
        updateStats();
      }
    );
  } else {
    if (confirm(`Apply all ${needsSlotting.length} recommendations?`)) {
      needsSlotting.forEach(item => {
        item.currentLoc = item.recommendedLoc;
      });
      alert(`${needsSlotting.length} items re-slotted successfully!`);
      renderRecommendations();
      updateStats();
    }
  }
}

/**
 * Run analysis
 */
function runAnalysis() {
  if (typeof notify !== 'undefined') {
    const hide = notify.loading('Running ABC analysis...');
    setTimeout(() => {
      hide();
      notify.success('Analysis complete! Found ' + skuData.filter(i => i.currentLoc !== i.recommendedLoc).length + ' optimization opportunities');
      renderABCChart();
      renderRecommendations();
    }, 1500);
  } else {
    alert('Running analysis...');
    setTimeout(() => {
      alert('Analysis complete!');
      renderABCChart();
      renderRecommendations();
    }, 1000);
  }
}

/**
 * Open simulation modal
 */
function openSimulationModal() {
  document.getElementById('simulationModal').classList.add('active');
  document.getElementById('simResults').style.display = 'none';
}

/**
 * Close modal
 */
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

/**
 * Run simulation
 */
function runSimulation() {
  const simType = document.getElementById('simType').value;
  
  if (typeof notify !== 'undefined') {
    const hide = notify.loading('Running simulation...');
    
    setTimeout(() => {
      hide();
      
      // Show results
      document.getElementById('simResults').style.display = 'block';
      document.getElementById('pathReduction').textContent = '23%';
      document.getElementById('spaceImprovement').textContent = '15%';
      document.getElementById('itemsToMove').textContent = '34';
      document.getElementById('estSavings').textContent = '$18,500';
      
      notify.success('Simulation complete!');
    }, 2000);
  } else {
    alert('Running simulation...');
    setTimeout(() => {
      document.getElementById('simResults').style.display = 'block';
      document.getElementById('pathReduction').textContent = '23%';
      document.getElementById('spaceImprovement').textContent = '15%';
      document.getElementById('itemsToMove').textContent = '34';
      document.getElementById('estSavings').textContent = '$18,500';
      alert('Simulation complete!');
    }, 1500);
  }
}

/**
 * View zone details
 */
function viewZoneDetails(zone) {
  const zoneItems = skuData.filter(item => item.recommendedLoc.startsWith(zone));
  if (typeof notify !== 'undefined') {
    notify.info(`Zone ${zone} contains ${zoneItems.length} items`);
  } else {
    alert(`Zone ${zone} contains ${zoneItems.length} items`);
  }
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
