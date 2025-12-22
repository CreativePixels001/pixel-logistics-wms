/**
 * PTMS Component Loader
 * Loads common components (sidebar, header) across all pages
 */

// Load sidebar component
async function loadSidebar() {
  const sidebarContainer = document.getElementById('sidebar-container');
  if (!sidebarContainer) return;
  
  try {
    const response = await fetch('components/sidebar.html');
    const html = await response.text();
    sidebarContainer.innerHTML = html;
    
    // Initialize sidebar after loading
    if (typeof PTMSApp !== 'undefined' && window.ptmsApp) {
      window.ptmsApp.setupCollapsibleMenu();
      window.ptmsApp.loadNotificationBadges();
      window.ptmsApp.setupSidebarActiveState();
      window.ptmsApp.initQuickActions();
    }
  } catch (error) {
    console.error('Error loading sidebar:', error);
  }
}

// Load header component (if needed)
async function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) return;
  
  try {
    const response = await fetch('components/header.html');
    const html = await response.text();
    headerContainer.innerHTML = html;
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadSidebar(),
    loadHeader()
  ]);
});
