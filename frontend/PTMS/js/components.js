/**
 * PTMS Component Loader
 * Loads common header and sidebar components into pages
 */

// Load component from file
async function loadComponent(elementId, filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to load ${filePath}`);
    const html = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  } catch (error) {
    console.error('Error loading component:', error);
  }
}

// Load all common components
async function loadCommonComponents() {
  await Promise.all([
    loadComponent('ptms-header', 'components/header.html'),
    loadComponent('ptms-sidebar', 'components/sidebar.html')
  ]);
  
  // Mark current page as active in sidebar
  activateCurrentPage();
}

// Activate current page in sidebar navigation
function activateCurrentPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const pageId = currentPage.replace('.html', '');
  
  // Remove all active classes
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to current page
  const navLink = document.getElementById('nav-' + pageId);
  if (navLink) {
    navLink.classList.add('active');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadCommonComponents);
