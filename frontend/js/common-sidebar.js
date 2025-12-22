/**
 * Common Sidebar Component for WMS
 * Dynamically generates consistent sidebar navigation across all pages
 * Auto-detects current page for active state highlighting
 */

(function() {
  'use strict';

  // Complete sidebar menu structure
  const sidebarStructure = [
    {
      title: 'Main Menu',
      items: [
        { name: 'Dashboard', href: 'index.html', icon: 'dashboard' },
        { name: 'User Management', href: 'user-management.html', icon: 'users' },
        { name: 'Access Control', href: 'access-control.html', icon: 'lock' },
        { name: 'Location Management', href: 'location-management.html', icon: 'map-pin' }
      ]
    },
    {
      title: 'Inbound Operations',
      items: [
        { name: 'Receipt Processing', href: 'receiving.html', icon: 'package' },
        { name: 'ASN Receipt', href: 'asn-receipt.html', icon: 'file-text' },
        { name: 'Inspection', href: 'inspection.html', icon: 'search' },
        { name: 'Put-away', href: 'putaway.html', icon: 'box' }
      ]
    },
    {
      title: 'Outbound Operations',
      items: [
        { name: 'Orders', href: 'orders.html', icon: 'clipboard' },
        { name: 'Track Shipment', href: 'track-shipment.html', icon: 'truck' },
        { name: 'Picking', href: 'picking.html', icon: 'check' },
        { name: 'Packing', href: 'packing.html', icon: 'package-cube' },
        { name: 'Shipping', href: 'shipping.html', icon: 'truck-delivery' }
      ]
    },
    {
      title: 'Yard Operations',
      items: [
        { name: 'Yard Management', href: 'yard-management.html', icon: 'grid' },
        { name: 'Dock Scheduling', href: 'dock-scheduling.html', icon: 'calendar' },
        { name: 'Slotting Optimization', href: 'slotting.html', icon: 'grid-alt' },
        { name: 'Labor Management', href: 'labor-management.html', icon: 'users-alt' }
      ]
    },
    {
      title: 'Inventory Management',
      items: [
        { name: 'LPN Management', href: 'lpn-management.html', icon: 'tag' },
        { name: 'Inventory Visibility', href: 'inventory.html', icon: 'bar-chart' },
        { name: 'Location Management', href: 'location-management.html', icon: 'map-pin' }
      ]
    },
    {
      title: 'Quality Management',
      items: [
        { name: 'Quality Inspection', href: 'quality-inspection.html', icon: 'search' },
        { name: 'Cycle Count', href: 'cycle-count.html', icon: 'trending-up' }
      ]
    },
    {
      title: 'Value-Added Services',
      items: [
        { name: 'Kitting & Assembly', href: 'kitting.html', icon: 'grid' },
        { name: 'Labeling', href: 'labeling.html', icon: 'tag' },
        { name: 'Cross-Docking', href: 'crossdock.html', icon: 'arrow-right' }
      ]
    },
    {
      title: 'Warehouse Operations',
      items: [
        { name: 'Replenishment', href: 'replenishment.html', icon: 'arrow-down' },
        { name: 'Task Management', href: 'task-management.html', icon: 'list' }
      ]
    },
    {
      title: 'Returns & Reports',
      items: [
        { name: 'Returns', href: 'returns.html', icon: 'rotate-ccw' },
        { name: 'Advanced Analytics', href: 'analytics-dashboard.html', icon: 'activity' },
        { name: 'Reports & Analytics', href: 'reports.html', icon: 'bar-chart-2' }
      ]
    },
    {
      title: 'Settings & Tools',
      items: [
        { name: 'Notification Settings', href: 'notification-settings.html', icon: 'bell' },
        { name: 'Notification Demo', href: 'notification-demo.html', icon: 'help-circle' },
        { name: 'Mobile Receiving', href: 'mobile-receiving-new.html', icon: 'smartphone' },
        { name: 'Mobile Picking', href: 'mobile-picking-new.html', icon: 'smartphone' },
        { name: 'Mobile Cycle Count', href: 'mobile-count-new.html', icon: 'smartphone' }
      ]
    }
  ];

  // SVG icon definitions
  const icons = {
    'dashboard': '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
    'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
    'package': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
    'search': '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
    'box': '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
    'clipboard': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>',
    'truck': '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
    'check': '<polyline points="20 6 9 17 4 12"></polyline>',
    'package-cube': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>',
    'truck-delivery': '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
    'grid': '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
    'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
    'grid-alt': '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
    'users-alt': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    'tag': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>',
    'bar-chart': '<line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line>',
    'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
    'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>',
    'arrow-down': '<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>',
    'list': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="15" x2="15" y2="15"></line>',
    'rotate-ccw': '<polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>',
    'activity': '<path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path>',
    'bar-chart-2': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
    'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
    'help-circle': '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
    'smartphone': '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>'
  };

  // Get current page filename
  function getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  }

  // Generate sidebar HTML
  function generateSidebarHTML() {
    const currentPage = getCurrentPage();
    let html = '<aside class="sidebar">';

    sidebarStructure.forEach(section => {
      html += `
        <div class="sidebar-section">
          <div class="sidebar-title" onclick="toggleSidebarSection(this)">
            <span>${section.title}</span>
            <svg class="sidebar-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <ul class="sidebar-menu">`;

      section.items.forEach(item => {
        const isActive = item.href === currentPage ? 'active' : '';
        const iconSvg = icons[item.icon] || icons['grid'];
        
        html += `
            <li class="sidebar-item">
              <a href="${item.href}" class="sidebar-link ${isActive}">
                <span class="sidebar-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${iconSvg}
                  </svg>
                </span>
                <span>${item.name}</span>
              </a>
            </li>`;
      });

      html += `
          </ul>
        </div>`;
    });

    html += '</aside>';
    return html;
  }

  // Initialize sidebar
  function initializeCommonSidebar() {
    // Check if sidebar container exists
    const sidebarContainer = document.getElementById('common-sidebar-container');
    
    if (sidebarContainer) {
      // Insert sidebar HTML
      sidebarContainer.innerHTML = generateSidebarHTML();
    } else {
      // If no container, try to insert after header
      const layout = document.querySelector('.layout');
      if (layout) {
        const existingSidebar = layout.querySelector('.sidebar');
        if (!existingSidebar) {
          layout.insertAdjacentHTML('afterbegin', generateSidebarHTML());
        }
      }
    }
  }

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCommonSidebar);
  } else {
    initializeCommonSidebar();
  }

  // Expose to global scope for manual initialization if needed
  window.initializeCommonSidebar = initializeCommonSidebar;
})();
