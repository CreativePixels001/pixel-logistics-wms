/**
 * TMS Routes Page - API Integration
 * Route optimization and management
 */

const API_BASE_URL = 'http://localhost:5001/api/tms';

let routes = [];
let filteredRoutes = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadRoutes();
  setupEventListeners();
});

async function loadRoutes() {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/routes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    routes = data.data || [];
    filteredRoutes = routes;
    
    renderRoutes();
    hideLoading();
  } catch (error) {
    console.error('Error loading routes:', error);
    loadDemoData();
    hideLoading();
  }
}

function renderRoutes() {
  const mainContent = document.querySelector('.main-content');
  
  if (!mainContent) return;

  // Replace the "coming soon" content with actual routes
  const pageHeader = mainContent.querySelector('.page-header');
  const existingContent = mainContent.querySelector('.routes-container');
  
  if (!existingContent) {
    const routesContainer = document.createElement('div');
    routesContainer.className = 'routes-container';
    routesContainer.style.cssText = 'display: grid; gap: 1.5rem; margin-top: 2rem;';
    
    if (pageHeader) {
      pageHeader.after(routesContainer);
      // Remove "coming soon" message
      const comingSoon = mainContent.querySelector('[style*="text-align: center"]');
      if (comingSoon) comingSoon.remove();
    }
  }

  const container = mainContent.querySelector('.routes-container');
  
  if (filteredRoutes.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 3rem;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto; opacity: 0.3;">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <h3 style="margin-top: 1.5rem;">No routes found</h3>
        <p style="color: var(--color-text-secondary); margin-top: 0.5rem;">Routes will appear here once created</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRoutes.map(route => `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${route.name || `Route ${route.routeId}`}</h3>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-top: 0.25rem;">
            ${route.waypoints?.length || 0} stops • ${route.totalDistance?.value || 0} ${route.totalDistance?.unit || 'miles'}
          </p>
        </div>
        <span class="status-badge status-${route.status}">${route.status}</span>
      </div>
      <div style="padding: 1.5rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Total Distance</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${route.totalDistance?.value || 0} ${route.totalDistance?.unit || 'mi'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Duration</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${route.totalDuration?.value || 0} ${route.totalDuration?.unit || 'hrs'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Total Cost</div>
            <div style="font-size: 1.25rem; font-weight: 600;">$${(route.cost?.totalCost || 0).toLocaleString()}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Progress</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${route.progress || 0}%</div>
          </div>
        </div>
        
        <div style="margin-top: 1.5rem;">
          <div style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem;">Waypoints</div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${(route.waypoints || []).slice(0, 5).map((wp, idx) => `
              <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: var(--color-bg-secondary); border-radius: 6px;">
                <span style="background: ${wp.type === 'origin' ? '#16a34a' : (wp.type === 'destination' ? '#dc2626' : 'var(--color-primary)')}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">
                  ${idx + 1}
                </span>
                <div style="flex: 1;">
                  <div style="font-size: 0.875rem; font-weight: 500;">${wp.location?.address || 'Unknown location'}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${wp.type}</div>
                </div>
                <span class="status-badge status-${wp.status}">${wp.status || 'pending'}</span>
              </div>
            `).join('')}
            ${route.waypoints?.length > 5 ? `<div style="text-align: center; font-size: 0.875rem; color: var(--color-text-secondary);">+${route.waypoints.length - 5} more stops</div>` : ''}
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
          <button onclick="viewRouteDetails('${route._id}')" class="btn btn-secondary" style="flex: 1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View Details
          </button>
          <button onclick="optimizeRoute('${route._id}')" class="btn btn-primary" style="flex: 1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Optimize
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function viewRouteDetails(routeId) {
  const route = routes.find(r => r._id === routeId);
  if (!route) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <div class="modal-header">
        <h2>${route.name || `Route ${route.routeId}`}</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
        <div style="display: grid; gap: 2rem;">
          <div>
            <h3 style="font-size: 1rem; margin-bottom: 1rem;">All Waypoints (${route.waypoints?.length || 0})</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${(route.waypoints || []).map((wp, idx) => `
                <div style="display: flex; align-items: start; gap: 0.75rem; padding: 1rem; background: var(--color-bg-secondary); border-radius: 8px;">
                  <span style="background: ${wp.type === 'origin' ? '#16a34a' : (wp.type === 'destination' ? '#dc2626' : 'var(--color-primary)')}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0;">
                    ${idx + 1}
                  </span>
                  <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 0.25rem;">${wp.location?.address || 'Unknown'}</div>
                    <div style="font-size: 0.875rem; color: var(--color-text-secondary);">
                      ${wp.location?.city || ''}, ${wp.location?.state || ''} ${wp.location?.zipCode || ''}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 0.5rem;">
                      Type: ${wp.type} • ${wp.estimatedArrival ? `ETA: ${new Date(wp.estimatedArrival).toLocaleString()}` : 'No ETA'}
                    </div>
                  </div>
                  <span class="status-badge status-${wp.status}">${wp.status || 'pending'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function optimizeRoute(routeId) {
  alert(`Optimizing route ${routeId}...\n\nRoute optimization functionality coming soon!`);
}

function setupEventListeners() {
  const optimizeBtn = document.querySelector('.btn-primary');
  if (optimizeBtn && optimizeBtn.textContent.includes('Optimize Routes')) {
    optimizeBtn.addEventListener('click', () => {
      alert('Bulk route optimization coming soon!');
    });
  }
}

function showLoading() {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    const pageHeader = mainContent.querySelector('.page-header');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-container';
    loadingDiv.innerHTML = `
      <div style="text-align: center; padding: 4rem;">
        <div class="loading-spinner" style="margin: 0 auto;"></div>
        <div style="margin-top: 1rem; color: var(--color-text-secondary);">Loading routes...</div>
      </div>
    `;
    if (pageHeader) {
      pageHeader.after(loadingDiv);
    }
  }
}

function hideLoading() {
  const loading = document.querySelector('.loading-container');
  if (loading) loading.remove();
}

function loadDemoData() {
  routes = [
    {
      _id: 'route-1',
      routeId: 'RT-2024-5001',
      name: 'Route 1: Chicago to New York',
      status: 'in_progress',
      totalDistance: { value: 789, unit: 'miles' },
      totalDuration: { value: 12.5, unit: 'hours' },
      progress: 65,
      cost: { totalCost: 2450 },
      waypoints: [
        { sequence: 0, type: 'origin', location: { address: '123 W Madison St', city: 'Chicago', state: 'IL', zipCode: '60602' }, status: 'completed' },
        { sequence: 1, type: 'stop', location: { address: '456 Main St', city: 'Cleveland', state: 'OH', zipCode: '44114' }, status: 'completed' },
        { sequence: 2, type: 'fuel', location: { address: 'I-80 Rest Stop', city: 'Sharon', state: 'PA', zipCode: '16146' }, status: 'in_progress' },
        { sequence: 3, type: 'destination', location: { address: '789 Broadway', city: 'New York', state: 'NY', zipCode: '10003' }, status: 'pending' }
      ]
    },
    {
      _id: 'route-2',
      routeId: 'RT-2024-5002',
      name: 'Route 2: Los Angeles to Seattle',
      status: 'planned',
      totalDistance: { value: 1135, unit: 'miles' },
      totalDuration: { value: 17, unit: 'hours' },
      progress: 0,
      cost: { totalCost: 3200 },
      waypoints: [
        { sequence: 0, type: 'origin', location: { address: '1234 Harbor Blvd', city: 'Los Angeles', state: 'CA', zipCode: '90021' }, status: 'pending' },
        { sequence: 1, type: 'stop', location: { address: '567 Market St', city: 'San Francisco', state: 'CA', zipCode: '94102' }, status: 'pending' },
        { sequence: 2, type: 'stop', location: { address: '890 SW 5th Ave', city: 'Portland', state: 'OR', zipCode: '97204' }, status: 'pending' },
        { sequence: 3, type: 'destination', location: { address: '321 1st Ave', city: 'Seattle', state: 'WA', zipCode: '98104' }, status: 'pending' }
      ]
    }
  ];
  filteredRoutes = routes;
  renderRoutes();
}
