/**
 * TMS DOT Compliance - API Integration
 * Compliance tracking and violation management with demo data
 */

const API_BASE_URL = 'http://localhost:5001/api/tms';

let compliance = [];
let violations = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadComplianceData();
  renderComplianceDashboard();
});

async function loadComplianceData() {
  try {
    // Backend API not yet implemented - using demo data
    loadDemoData();
  } catch (error) {
    console.error('Error loading compliance data:', error);
    loadDemoData();
  }
}

function renderComplianceDashboard() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  const pageHeader = mainContent.querySelector('.page-header');
  const existingContent = mainContent.querySelector('.compliance-dashboard');
  
  if (!existingContent) {
    const dashboardDiv = document.createElement('div');
    dashboardDiv.className = 'compliance-dashboard';
    
    if (pageHeader) {
      pageHeader.after(dashboardDiv);
      const comingSoon = mainContent.querySelector('[style*="text-align: center"]');
      if (comingSoon) comingSoon.remove();
    }
  }

  const dashboard = mainContent.querySelector('.compliance-dashboard');
  
  // Calculate stats
  const totalViolations = violations.length;
  const openViolations = violations.filter(v => v.status === 'open').length;
  const resolvedViolations = violations.filter(v => v.status === 'resolved').length;
  const complianceScore = Math.round(100 - (openViolations / totalViolations * 100)) || 100;

  dashboard.innerHTML = `
    <!-- Stats Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="card">
        <div style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">Compliance Score</div>
              <div style="font-size: 2rem; font-weight: 700; color: ${complianceScore >= 90 ? '#16a34a' : (complianceScore >= 70 ? '#ea580c' : '#dc2626')};">${complianceScore}%</div>
            </div>
            <div style="background: ${complianceScore >= 90 ? '#d1fae5' : '#fed7aa'}; padding: 0.75rem; border-radius: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${complianceScore >= 90 ? '#16a34a' : '#ea580c'}" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">Open Violations</div>
              <div style="font-size: 2rem; font-weight: 700;">${openViolations}</div>
            </div>
            <div style="background: #fee2e2; padding: 0.75rem; border-radius: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">Resolved</div>
              <div style="font-size: 2rem; font-weight: 700;">${resolvedViolations}</div>
            </div>
            <div style="background: #d1fae5; padding: 0.75rem; border-radius: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">Total Violations</div>
              <div style="font-size: 2rem; font-weight: 700;">${totalViolations}</div>
            </div>
            <div style="background: var(--color-bg-secondary); padding: 0.75rem; border-radius: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Violations Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Recent Violations & Inspections</h3>
        <button onclick="addViolation()" class="btn btn-primary btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Record
        </button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Vehicle/Driver</th>
              <th>Description</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${violations.map(violation => `
              <tr>
                <td>${violation.date}</td>
                <td><span class="status-badge">${violation.type}</span></td>
                <td>
                  <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: ${
                    violation.severity === 'critical' ? '#fee2e2' : 
                    violation.severity === 'high' ? '#fed7aa' : 
                    violation.severity === 'medium' ? '#fef3c7' : '#dbeafe'
                  }; color: ${
                    violation.severity === 'critical' ? '#dc2626' : 
                    violation.severity === 'high' ? '#ea580c' : 
                    violation.severity === 'medium' ? '#ca8a04' : '#2563eb'
                  };">
                    ${violation.severity.toUpperCase()}
                  </span>
                </td>
                <td><strong>${violation.entity}</strong></td>
                <td style="max-width: 300px;">${violation.description}</td>
                <td><span class="status-badge status-${violation.status === 'resolved' ? 'delivered' : violation.status === 'in_progress' ? 'in_transit' : 'pending'}">${violation.status.replace('_', ' ')}</span></td>
                <td>${violation.dueDate}</td>
                <td>
                  <div style="display: flex; gap: 0.5rem;">
                    <button onclick="viewViolation('${violation.id}')" class="btn-icon" title="View">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button onclick="editViolation('${violation.id}')" class="btn-icon" title="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button onclick="uploadDocuments('${violation.id}', '${violation.type}')" class="btn-icon" title="Upload Documents">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </button>
                    ${violation.status !== 'resolved' ? `
                      <button onclick="resolveViolation('${violation.id}')" class="btn-icon" title="Resolve" style="color: #16a34a;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewViolation(id) {
  const violation = violations.find(v => v.id === id);
  if (!violation) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Violation Details</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div style="display: grid; gap: 1.5rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Date</div>
            <div style="font-weight: 600;">${violation.date}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Type</div>
            <div><span class="status-badge">${violation.type}</span></div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Severity</div>
            <div><span style="text-transform: uppercase; font-weight: 600; color: ${
              violation.severity === 'critical' ? '#dc2626' : 
              violation.severity === 'high' ? '#ea580c' : 
              violation.severity === 'medium' ? '#ca8a04' : '#2563eb'
            };">${violation.severity}</span></div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Vehicle/Driver</div>
            <div style="font-weight: 600;">${violation.entity}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Description</div>
            <div>${violation.description}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Status</div>
            <div><span class="status-badge status-${violation.status === 'resolved' ? 'delivered' : violation.status === 'in_progress' ? 'in_transit' : 'pending'}">${violation.status.replace('_', ' ')}</span></div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Due Date</div>
            <div style="font-weight: 600;">${violation.dueDate}</div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Close</button>
        ${violation.status !== 'resolved' ? `<button onclick="resolveViolation('${violation.id}'); this.closest('.modal-overlay').remove();" class="btn btn-primary">Mark as Resolved</button>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function resolveViolation(id) {
  const violation = violations.find(v => v.id === id);
  if (!violation) return;

  violation.status = 'resolved';
  renderComplianceDashboard();
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: #16a34a; color: white;
    padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000; animation: slideIn 0.3s ease;
  `;
  notification.textContent = 'Violation marked as resolved';
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function addViolation() {
  openCreatePanel('Violation', null, saveCompliance);
}

function editViolation(id) {
  const violation = violations.find(v => v.id === id);
  if (violation) {
    openCreatePanel('Violation', violation, saveCompliance);
  }
}

function uploadDocuments(recordId, recordType) {
  openUploadPanel('compliance', recordId, `${recordType} ${recordId}`, handleDocumentUpload);
}

async function saveCompliance(complianceData) {
  try {
    const response = await fetch(`${API_BASE_URL}/compliance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(complianceData)
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    alert('Compliance record saved successfully!');
    await loadViolations();
  } catch (error) {
    console.error('Error saving compliance:', error);
    alert('Failed to save compliance record. Using demo mode.');
    const newRecord = {
      id: 'demo-' + Date.now(),
      recordId: 'VIO-' + Math.floor(Math.random() * 10000),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      type: complianceData.type || 'other',
      severity: complianceData.severity || 'medium',
      entity: complianceData.entity?.vehicleId || complianceData.entity?.driverName || 'Unknown',
      description: complianceData.description,
      status: 'open',
      dueDate: complianceData.dueDate ? new Date(complianceData.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
    };
    violations.unshift(newRecord);
    renderViolations();
  }
}

async function handleDocumentUpload(files) {
  console.log('Uploading documents:', files);
  alert(`Successfully uploaded ${files.length} document(s)!`);
}

function loadDemoData() {
  violations = [
    { id: '1', date: 'Nov 18, 2025', type: 'HOS Violation', severity: 'critical', entity: 'TRK-001 / John Smith', description: 'Driver exceeded 11-hour driving limit by 45 minutes', status: 'open', dueDate: 'Nov 25, 2025' },
    { id: '2', date: 'Nov 15, 2025', type: 'Vehicle Inspection', severity: 'high', entity: 'TRK-004', description: 'Brake system requires immediate repair', status: 'in_progress', dueDate: 'Nov 22, 2025' },
    { id: '3', date: 'Nov 12, 2025', type: 'DOT Inspection', severity: 'medium', entity: 'TRK-002 / Sarah Johnson', description: 'Minor logbook discrepancies found during roadside inspection', status: 'resolved', dueDate: 'Nov 19, 2025' },
    { id: '4', date: 'Nov 10, 2025', type: 'Weight Violation', severity: 'high', entity: 'TRK-005', description: 'Vehicle exceeded weight limit by 2,500 lbs on I-80', status: 'open', dueDate: 'Nov 24, 2025' },
    { id: '5', date: 'Nov 8, 2025', type: 'Drug Test', severity: 'low', entity: 'Emily Wilson', description: 'Random drug test - passed', status: 'resolved', dueDate: 'N/A' },
    { id: '6', date: 'Nov 5, 2025', type: 'License Renewal', severity: 'medium', entity: 'David Brown', description: 'CDL license expires in 30 days - renewal required', status: 'in_progress', dueDate: 'Dec 5, 2025' },
    { id: '7', date: 'Nov 1, 2025', type: 'Safety Inspection', severity: 'low', entity: 'TRK-007', description: 'Annual safety inspection completed - passed', status: 'resolved', dueDate: 'N/A' },
    { id: '8', date: 'Oct 28, 2025', type: 'Medical Cert', severity: 'critical', entity: 'Tom Martinez', description: 'Medical certification expired - driver cannot operate until renewed', status: 'open', dueDate: 'Nov 21, 2025' }
  ];
  compliance = violations;
}
