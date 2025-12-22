/**
 * PTMS Main Application Controller
 * Handles all interactive features and state management
 */

class PTMSApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupSidebarActiveState();
    this.setupFilters();
    this.setupSearch();
    this.setupModals();
    this.setupNotifications();
    this.setupTableActions();
    this.setupFormValidation();
    this.setupKeyboardShortcuts();
    this.setupCollapsibleMenu();
    this.loadNotificationBadges();
    this.initQuickActions();
  }

  // Collapsible Menu Sections
  setupCollapsibleMenu() {
    const menuGroups = document.querySelectorAll('.menu-group');
    
    menuGroups.forEach(group => {
      const header = group.querySelector('.menu-group-header');
      const content = group.querySelector('.menu-group-content');
      
      if (header && content) {
        // Load saved state from localStorage
        const groupId = header.dataset.group;
        const isCollapsed = localStorage.getItem(`menu-${groupId}-collapsed`) === 'true';
        
        if (isCollapsed) {
          group.classList.add('collapsed');
          content.style.maxHeight = '0';
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
        
        header.addEventListener('click', () => {
          const isCurrentlyCollapsed = group.classList.contains('collapsed');
          
          if (isCurrentlyCollapsed) {
            group.classList.remove('collapsed');
            content.style.maxHeight = content.scrollHeight + 'px';
            localStorage.setItem(`menu-${groupId}-collapsed`, 'false');
          } else {
            group.classList.add('collapsed');
            content.style.maxHeight = '0';
            localStorage.setItem(`menu-${groupId}-collapsed`, 'true');
          }
        });
      }
    });
  }

  // Update notification badges dynamically
  updateBadge(pageId, count, type = 'default') {
    const link = document.querySelector(`a[href="${pageId}"]`);
    if (!link) return;
    
    let badge = link.querySelector('.menu-badge');
    
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'menu-badge';
        link.appendChild(badge);
      }
      
      badge.textContent = count;
      badge.className = `menu-badge badge-${type}`;
    } else if (badge) {
      badge.remove();
    }
  }

  // Load and update all notification badges
  loadNotificationBadges() {
    // Get data from PTMSData
    if (typeof PTMSData !== 'undefined') {
      const stats = PTMSData.getDashboardStats();
      
      // Update badges based on real data
      this.updateBadge('dashboard.html', stats.activeTrips, 'info');
      this.updateBadge('live-tracking.html', stats.activeTrips, 'success');
      this.updateBadge('vehicle-management.html', stats.maintenanceDue, 'urgent');
      this.updateBadge('compliance.html', stats.complianceIssues, 'urgent');
      this.updateBadge('route-planning.html', 5, 'default'); // Pending approvals
      
      // Update employee count if element exists
      const empBadge = document.querySelector('a[href="employee-roster.html"] .menu-badge');
      if (empBadge) {
        empBadge.textContent = '2,847';
      }
    }
    
    // Refresh badges every 30 seconds
    setInterval(() => this.loadNotificationBadges(), 30000);
  }

  // Quick Actions Panel
  initQuickActions() {
    const emergencyBtn = document.querySelector('.quick-action-emergency');
    const quickAddBtn = document.querySelector('.quick-action-add');
    
    if (emergencyBtn) {
      emergencyBtn.addEventListener('click', () => this.emergencyAlert());
    }
    
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', () => this.quickAddTrip());
    }
  }

  emergencyAlert() {
    const confirmation = confirm('⚠️ Send Emergency Alert to all drivers and fleet managers?');
    if (confirmation) {
      this.showNotification('Emergency alert sent to all fleet managers', 'success');
      console.log('Emergency alert dispatched');
    }
  }

  quickAddTrip() {
    window.location.href = 'trip-manifest.html?action=new';
  }

  // Sidebar Active State Management
  setupSidebarActiveState() {
    const currentPage = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      }
      
      // Add click handler
      link.addEventListener('click', (e) => {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  // Filter Functionality
  setupFilters() {
    const filterSelects = document.querySelectorAll('.filter-select, .form-select');
    const searchInputs = document.querySelectorAll('.form-input[type="text"]');
    
    filterSelects.forEach(select => {
      select.addEventListener('change', () => this.applyFilters());
    });
    
    searchInputs.forEach(input => {
      input.addEventListener('input', () => this.applyFilters());
    });
  }

  applyFilters() {
    // This would filter table rows based on selected criteria
    const tableRows = document.querySelectorAll('tbody tr');
    // Filter logic here
    console.log('Filters applied');
  }

  // Search Implementation
  setupSearch() {
    const searchTrigger = document.querySelector('.search-trigger');
    if (searchTrigger) {
      searchTrigger.addEventListener('click', () => this.openSearchModal());
    }
  }

  openSearchModal() {
    // Create and show search modal
    console.log('Search modal opened');
  }

  // Modal Management
  setupModals() {
    // Setup all modal triggers and closers
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-close') || 
          e.target.classList.contains('modal-backdrop')) {
        this.closeAllModals();
      }
    });

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
  }

  // Notifications
  setupNotifications() {
    // Initialize notification system
    this.notifications = [];
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background: #fff; border-left: 4px solid ${type === 'success' ? '#000' : '#666'}; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span style="font-size: 0.9375rem; font-weight: 500; color: #000;">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; background: none; border: none; cursor: pointer; padding: 0.25rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    
    const container = this.getNotificationContainer();
    container.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
  }

  getNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 0.75rem;';
      document.body.appendChild(container);
    }
    return container;
  }

  // Table Actions
  setupTableActions() {
    // Bulk selection
    const selectAllCheckboxes = document.querySelectorAll('[data-select-all]');
    selectAllCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const targetTable = e.target.closest('table');
        const rowCheckboxes = targetTable.querySelectorAll('tbody input[type="checkbox"]');
        rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
        this.updateBulkActionBar();
      });
    });

    // Individual row selection
    const rowCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    rowCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateBulkActionBar());
    });
  }

  updateBulkActionBar() {
    const selectedCount = document.querySelectorAll('tbody input[type="checkbox"]:checked').length;
    const bulkActionBar = document.getElementById('bulk-action-bar');
    
    if (bulkActionBar) {
      bulkActionBar.style.display = selectedCount > 0 ? 'flex' : 'none';
      const countDisplay = bulkActionBar.querySelector('.selected-count');
      if (countDisplay) {
        countDisplay.textContent = `${selectedCount} selected`;
      }
    }
  }

  // Form Validation
  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });
    
    return isValid;
  }

  // Notification Badges
  loadNotificationBadges() {
    // Simulate loading badge counts
    this.updateBadge('dashboard', 32); // Active trips
    this.updateBadge('route-planning', 5); // Pending approvals
    this.updateBadge('vehicle-management', 3); // Maintenance due
    this.updateBadge('compliance', 2); // Expiring documents
  }

  updateBadge(pageId, count) {
    const link = document.querySelector(`[data-page="${pageId}"]`);
    if (link && count > 0) {
      let badge = link.querySelector('.menu-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'menu-badge';
        link.querySelector('.sidebar-text').appendChild(badge);
      }
      badge.textContent = count;
      badge.style.cssText = 'background: #000; color: #fff; font-size: 0.6875rem; font-weight: 600; padding: 0.125rem 0.375rem; border-radius: 10px; margin-left: 0.5rem;';
    }
  }

  // Keyboard Shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearchModal();
      }
      
      // Number keys for quick navigation (1-9)
      if (e.key >= '1' && e.key <= '9' && !e.target.matches('input, textarea')) {
        const index = parseInt(e.key) - 1;
        const links = document.querySelectorAll('.sidebar-link');
        if (links[index]) {
          links[index].click();
        }
      }
    });
  }

  // Export Functions
  exportReport(format) {
    this.showNotification(`Exporting report as ${format.toUpperCase()}...`, 'info');
    
    setTimeout(() => {
      this.showNotification(`Report exported successfully!`, 'success');
    }, 2000);
  }

  // Quick Actions
  quickAddTrip() {
    this.showNotification('Opening new trip form...', 'info');
  }

  emergencyAlert() {
    this.showNotification('Emergency alert sent to dispatch!', 'success');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.ptmsApp = new PTMSApp();
});

// Global helper functions
function filterEmployees() {
  if (window.ptmsApp) {
    window.ptmsApp.applyFilters();
  }
}

function exportReport(format) {
  if (window.ptmsApp) {
    window.ptmsApp.exportReport(format);
  }
}
