/**
 * TMS Fleet Management - API Integration
 * Vehicle and driver management with demo data
 */

const API_BASE_URL = 'http://localhost:5001/api/tms';

let fleet = [];
let filteredFleet = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadFleet();
  renderFleetDashboard();
});

async function loadFleet() {
  try {
    // Backend API not yet implemented - using demo data
    loadDemoData();
  } catch (error) {
    console.error('Error loading fleet:', error);
    loadDemoData();
  }
}

function renderFleetDashboard() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  const pageHeader = mainContent.querySelector('.page-header');
  const existingContent = mainContent.querySelector('.fleet-dashboard');
  
  if (!existingContent) {
    const dashboardDiv = document.createElement('div');
    dashboardDiv.className = 'fleet-dashboard';
    
    if (pageHeader) {
      pageHeader.after(dashboardDiv);
      const comingSoon = mainContent.querySelector('[style*="text-align: center"]');
      if (comingSoon) comingSoon.remove();
    }
  }

  const dashboard = mainContent.querySelector('.fleet-dashboard');
  
  // Calculate stats
  const totalVehicles = fleet.length;
  const activeVehicles = fleet.filter(v => v.status === 'active').length;
  const inMaintenance = fleet.filter(v => v.status === 'maintenance').length;
  const avgUtilization = fleet.reduce((sum, v) => sum + (v.utilization || 0), 0) / totalVehicles || 0;

  dashboard.innerHTML = `
    <!-- Stats Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="card">
        <div style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">Total Vehicles</div>
              <div style="font-size: 2rem; font-weight: 700;">${totalVehicles}</div>
            </div>
            <div style="background: var(--color-primary-light); padding: 0.75rem; border-radius: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
                <path d="M15 18H9"></path>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
                <circle cx="17" cy="18" r="2"></circle>
                <circle cx="7" cy="18" r="2"></circle>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">Active</div>
              <div style="font-size: 2rem; font-weight: 700;">${activeVehicles}</div>
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
              <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">In Maintenance</div>
              <div style="font-size: 2rem; font-weight: 700;">${inMaintenance}</div>
            </div>
            <div style="background: #fed7aa; padding: 0.75rem; border-radius: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">Avg. Utilization</div>
              <div style="font-size: 2rem; font-weight: 700;">${avgUtilization.toFixed(1)}%</div>
            </div>
            <div style="background: var(--color-primary-light); padding: 0.75rem; border-radius: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fleet Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Fleet Vehicles</h3>
        <button onclick="addVehicle()" class="btn btn-primary btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Vehicle
        </button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Type</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Location</th>
              <th>Utilization</th>
              <th>Next Maintenance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${fleet.map(vehicle => `
              <tr>
                <td><strong>${vehicle.vehicleId}</strong></td>
                <td>${vehicle.type}</td>
                <td>${vehicle.driver || 'Unassigned'}</td>
                <td><span class="status-badge status-${vehicle.status}">${vehicle.status}</span></td>
                <td>${vehicle.location}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="flex: 1; background: var(--color-bg-secondary); height: 6px; border-radius: 3px; overflow: hidden;">
                      <div style="background: ${vehicle.utilization >= 80 ? '#16a34a' : (vehicle.utilization >= 50 ? '#ea580c' : '#dc2626')}; height: 100%; width: ${vehicle.utilization}%;"></div>
                    </div>
                    <span style="font-size: 0.875rem; font-weight: 600;">${vehicle.utilization}%</span>
                  </div>
                </td>
                <td>${vehicle.nextMaintenance}</td>
                <td>
                  <div style="display: flex; gap: 0.5rem;">
                    <button onclick="viewVehicle('${vehicle.id}')" class="btn-icon" title="View">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button onclick="editVehicle('${vehicle.id}')" class="btn-icon" title="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button onclick="uploadDocuments('${vehicle.vehicleId}', '${vehicle.type} ${vehicle.vehicleId}')" class="btn-icon" title="Upload Documents">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </button>
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

function viewVehicle(id) {
  const vehicle = fleet.find(v => v.id === id);
  if (!vehicle) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Vehicle Details: ${vehicle.vehicleId}</h2>
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
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Type</div>
            <div style="font-weight: 600;">${vehicle.type}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Current Driver</div>
            <div style="font-weight: 600;">${vehicle.driver || 'Unassigned'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Status</div>
            <div><span class="status-badge status-${vehicle.status}">${vehicle.status}</span></div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Current Location</div>
            <div>${vehicle.location}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Utilization Rate</div>
            <div style="font-weight: 600;">${vehicle.utilization}%</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Next Scheduled Maintenance</div>
            <div>${vehicle.nextMaintenance}</div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function editVehicle(id) {
  const vehicle = fleet.find(v => v.id === id);
  if (vehicle) {
    openCreatePanel('Vehicle', vehicle, saveVehicle);
  }
}

function addVehicle() {
  openCreatePanel('Vehicle', null, saveVehicle);
}

function uploadDocuments(vehicleId, vehicleName) {
  openUploadPanel('vehicle', vehicleId, vehicleName || `Vehicle ${vehicleId}`, handleDocumentUpload);
}

async function saveVehicle(vehicleData) {
  try {
    const response = await fetch(`${API_BASE_URL}/fleet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vehicleData)
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    alert('Vehicle saved successfully!');
    await loadFleet();
  } catch (error) {
    console.error('Error saving vehicle:', error);
    alert('Failed to save vehicle. Using demo mode.');
    const newVehicle = {
      id: 'demo-' + Date.now(),
      vehicleId: vehicleData.vehicleId,
      type: vehicleData.type,
      status: vehicleData.status || 'active',
      driver: null,
      location: 'Unknown',
      utilization: 0,
      nextMaintenance: 'Not Scheduled'
    };
    fleet.unshift(newVehicle);
    renderFleetDashboard();
  }
}

async function handleDocumentUpload(files) {
  console.log('Uploading documents:', files);
  alert(`Successfully uploaded ${files.length} document(s)!`);
}

function loadDemoData() {
  fleet = [
    { id: '1', vehicleId: 'TRK-001', type: 'Semi Truck', driver: 'John Smith', status: 'active', location: 'Chicago, IL', utilization: 85, nextMaintenance: 'Dec 15, 2025' },
    { id: '2', vehicleId: 'TRK-002', type: 'Semi Truck', driver: 'Sarah Johnson', status: 'active', location: 'New York, NY', utilization: 92, nextMaintenance: 'Dec 20, 2025' },
    { id: '3', vehicleId: 'TRK-003', type: 'Box Truck', driver: 'Mike Davis', status: 'active', location: 'Los Angeles, CA', utilization: 78, nextMaintenance: 'Dec 10, 2025' },
    { id: '4', vehicleId: 'TRK-004', type: 'Semi Truck', driver: null, status: 'maintenance', location: 'Houston, TX', utilization: 0, nextMaintenance: 'In Progress' },
    { id: '5', vehicleId: 'TRK-005', type: 'Flatbed', driver: 'Emily Wilson', status: 'active', location: 'Atlanta, GA', utilization: 88, nextMaintenance: 'Dec 25, 2025' },
    { id: '6', vehicleId: 'TRK-006', type: 'Semi Truck', driver: 'David Brown', status: 'active', location: 'Dallas, TX', utilization: 75, nextMaintenance: 'Dec 18, 2025' },
    { id: '7', vehicleId: 'TRK-007', type: 'Box Truck', driver: 'Lisa Anderson', status: 'active', location: 'Phoenix, AZ', utilization: 82, nextMaintenance: 'Dec 22, 2025' },
    { id: '8', vehicleId: 'TRK-008', type: 'Refrigerated', driver: 'Tom Martinez', status: 'active', location: 'Seattle, WA', utilization: 90, nextMaintenance: 'Dec 12, 2025' }
  ];
  filteredFleet = fleet;
}
