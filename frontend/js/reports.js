// DLT WMS - Reports & Analytics Module JavaScript
// Handles report generation and analytics

let currentReportCategory = null;

// Show report category
function showReportCategory(category) {
  currentReportCategory = category;
  
  const categoryLabels = {
    'receiving': 'Receiving Reports',
    'inventory': 'Inventory Reports',
    'quality': 'Quality Reports',
    'performance': 'Performance Reports'
  };
  
  WMS.showNotification(`${categoryLabels[category]} selected`, 'info');
  
  // Filter report type dropdown
  const reportTypeSelect = document.getElementById('reportType');
  if (reportTypeSelect) {
    // Reset selection
    reportTypeSelect.value = '';
    
    // In production, would filter options based on category
    // For now, scroll to report generator
    document.getElementById('reportGenerator').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Generate report
function generateReport(reportData) {
  WMS.showNotification('Generating report...', 'info');
  
  // Simulate report generation
  setTimeout(() => {
    const report = {
      name: getReportName(reportData.type),
      type: getReportCategory(reportData.type),
      dateRange: `${reportData.dateFrom} to ${reportData.dateTo}`,
      generatedBy: 'Ashish Kumar',
      generatedOn: WMS.formatDateTime(new Date()),
      format: reportData.format.toUpperCase(),
      data: reportData
    };
    
    // Save report
    const reports = WMS.Storage.get('reports') || [];
    reports.unshift(report);
    WMS.Storage.set('reports', reports);
    
    // Add to recent reports table
    addRecentReportRow(report);
    
    WMS.showNotification(`Report generated successfully: ${report.name}`, 'success');
    
    // Simulate download
    setTimeout(() => {
      WMS.showNotification(`Downloading ${report.name}.${reportData.format}...`, 'info');
    }, 1000);
  }, 2000);
}

// Get report name based on type
function getReportName(type) {
  const names = {
    'asn-discrepancy': 'ASN Discrepancy Report',
    'receipt-summary': 'Receipt Summary',
    'receiving-performance': 'Receiving Performance',
    'inventory-position': 'Inventory Position Report',
    'stock-valuation': 'Stock Valuation Report',
    'expiry-report': 'Expiry Report',
    'inspection-summary': 'Inspection Summary',
    'rejection-analysis': 'Rejection Analysis',
    'warehouse-kpi': 'Warehouse KPI Dashboard',
    'user-productivity': 'User Productivity Report'
  };
  
  return names[type] || 'Custom Report';
}

// Get report category
function getReportCategory(type) {
  if (['asn-discrepancy', 'receipt-summary', 'receiving-performance'].includes(type)) {
    return 'Receiving';
  } else if (['inventory-position', 'stock-valuation', 'expiry-report'].includes(type)) {
    return 'Inventory';
  } else if (['inspection-summary', 'rejection-analysis'].includes(type)) {
    return 'Quality';
  } else if (['warehouse-kpi', 'user-productivity'].includes(type)) {
    return 'Performance';
  }
  return 'General';
}

// Add recent report row
function addRecentReportRow(report) {
  const tbody = document.getElementById('recentReports');
  const row = document.createElement('tr');
  
  const formatBadge = `<span class="badge badge-outline">${report.format}</span>`;
  
  row.innerHTML = `
    <td><strong>${report.name}</strong></td>
    <td>${report.type}</td>
    <td>${report.dateRange}</td>
    <td>${report.generatedBy}</td>
    <td>${report.generatedOn}</td>
    <td>${formatBadge}</td>
    <td>
      <button class="btn btn-sm btn-primary" onclick="downloadReport('${report.name}', '${report.format}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download
      </button>
    </td>
  `;
  
  tbody.insertBefore(row, tbody.firstChild);
  
  // Keep only last 20 rows
  while (tbody.rows.length > 20) {
    tbody.deleteRow(tbody.rows.length - 1);
  }
}

// Download report
function downloadReport(name, format) {
  WMS.showNotification(`Downloading ${name}.${format.toLowerCase()}...`, 'info');
  
  // In production, this would trigger actual file download
  setTimeout(() => {
    WMS.showNotification('Download started', 'success');
  }, 500);
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
  const reportForm = document.getElementById('reportForm');
  
  if (reportForm) {
    reportForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!WMS.validateForm(this)) {
        WMS.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      // Validate date range
      const dateFrom = document.getElementById('reportDateFrom').value;
      const dateTo = document.getElementById('reportDateTo').value;
      
      if (new Date(dateFrom) > new Date(dateTo)) {
        WMS.showNotification('Date From cannot be later than Date To', 'error');
        return;
      }
      
      const reportData = {
        type: document.getElementById('reportType').value,
        dateFrom: dateFrom,
        dateTo: dateTo,
        subinv: document.getElementById('reportSubinv').value,
        format: document.getElementById('reportFormat').value
      };
      
      generateReport(reportData);
    });
  }
  
  // Set default dates (last 7 days)
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  
  const dateToInput = document.getElementById('reportDateTo');
  const dateFromInput = document.getElementById('reportDateFrom');
  
  if (dateToInput) {
    dateToInput.value = today.toISOString().split('T')[0];
  }
  
  if (dateFromInput) {
    dateFromInput.value = lastWeek.toISOString().split('T')[0];
  }
});

// Export dashboard stats
function exportDashboardStats() {
  WMS.showNotification('Exporting dashboard statistics...', 'info');
  
  const stats = {
    receiptsProcessed: 45,
    lpnsPutAway: 38,
    inspectionsCompleted: 22,
    discrepancies: 3,
    exportDate: WMS.formatDateTime(new Date())
  };
  
  // In production, would create and download Excel/CSV
  setTimeout(() => {
    WMS.showNotification('Dashboard stats exported successfully', 'success');
  }, 1500);
}
