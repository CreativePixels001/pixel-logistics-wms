/**
 * Sidebar Collapsible Navigation
 * Handles expand/collapse functionality for sidebar sections
 */

// Toggle sidebar section collapse/expand
function toggleSidebarSection(titleElement) {
  const section = titleElement.parentElement;
  const icon = titleElement.querySelector('.sidebar-title-icon');
  
  // Toggle collapsed class
  section.classList.toggle('collapsed');
  
  // Save state to localStorage
  const sectionName = titleElement.querySelector('span').textContent.trim();
  saveSidebarState(sectionName, section.classList.contains('collapsed'));
}

// Save sidebar section state to localStorage
function saveSidebarState(sectionName, isCollapsed) {
  try {
    const sidebarState = JSON.parse(localStorage.getItem('sidebarState') || '{}');
    sidebarState[sectionName] = isCollapsed;
    localStorage.setItem('sidebarState', JSON.stringify(sidebarState));
  } catch (e) {
    console.warn('Could not save sidebar state:', e);
  }
}

// Restore sidebar state from localStorage
function restoreSidebarState() {
  try {
    const sidebarState = JSON.parse(localStorage.getItem('sidebarState') || '{}');
    const sections = document.querySelectorAll('.sidebar-section');
    
    sections.forEach(section => {
      const titleElement = section.querySelector('.sidebar-title');
      if (titleElement) {
        const sectionName = titleElement.querySelector('span').textContent.trim();
        if (sidebarState[sectionName] === true) {
          section.classList.add('collapsed');
        }
      }
    });
  } catch (e) {
    console.warn('Could not restore sidebar state:', e);
  }
}

// Set active menu item based on current page
function setActiveSidebarLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.sidebar-link');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
      
      // Ensure parent section is expanded
      const section = link.closest('.sidebar-section');
      if (section && section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
      }
    } else {
      link.classList.remove('active');
    }
  });
}

// Initialize sidebar on page load
document.addEventListener('DOMContentLoaded', function() {
  restoreSidebarState();
  setActiveSidebarLink();
});
