/**
 * TMS Common JavaScript
 * Shared functionality across all TMS pages
 */

// Theme Toggle
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('tms-theme', newTheme);
  
  // Smooth transition
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      themeToggle.style.transform = 'rotate(0deg)';
    }, 300);
  }
}

// User Menu Toggle
function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');
  
  if (dropdown && userMenu && !userMenu.contains(event.target)) {
    dropdown.classList.remove('show');
  }
});

// Global Search Functions
function openSearch() {
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('globalSearchInput');
  
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
      if (input) input.focus();
    }, 100);
  }
}

function closeSearch() {
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('globalSearchInput');
  
  if (modal) {
    modal.style.display = 'none';
  }
  if (input) {
    input.value = '';
  }
  
  const suggestions = document.getElementById('searchSuggestions');
  if (suggestions) {
    suggestions.innerHTML = '';
  }
}

// Search keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // CMD+K or CTRL+K to open search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
  
  // ESC to close search
  if (e.key === 'Escape') {
    closeSearch();
  }
});

// Search input handler
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim();
      const suggestions = document.getElementById('searchSuggestions');
      
      if (!suggestions) return;
      
      if (query.length < 2) {
        suggestions.innerHTML = '';
        return;
      }
      
      // Sample search results - replace with actual API call
      const results = [
        { type: 'Shipment', id: 'SH-2024-0001', title: 'Los Angeles → Chicago', status: 'In Transit' },
        { type: 'Shipment', id: 'SH-2024-0002', title: 'New York → Miami', status: 'Delivered' },
        { type: 'Carrier', id: 'CAR-001', title: 'Fast Freight Lines', rating: '4.8' },
        { type: 'Route', id: 'RT-042', title: 'West Coast Express', distance: '2,800 mi' }
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase())
      );
      
      if (results.length === 0) {
        suggestions.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--color-text-secondary);">No results found</div>';
        return;
      }
      
      suggestions.innerHTML = results.map(item => `
        <div class="search-result-item" onclick="selectSearchResult('${item.type}', '${item.id}')">
          <div class="search-result-type">${item.type}</div>
          <div class="search-result-title">${item.title}</div>
          <div class="search-result-meta">${item.id} • ${item.status || item.rating || item.distance}</div>
        </div>
      `).join('');
    });
  }
});

function selectSearchResult(type, id) {
  console.log('Selected:', type, id);
  // Navigate to the appropriate page based on type
  if (type === 'Shipment') {
    window.location.href = `tms-shipments.html?id=${id}`;
  } else if (type === 'Carrier') {
    window.location.href = `tms-carriers.html?id=${id}`;
  } else if (type === 'Route') {
    window.location.href = `tms-routes.html?id=${id}`;
  }
  closeSearch();
}

// Quick Shipment Modal
function showQuickShipment() {
  alert('Quick Shipment creation form will be implemented here');
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('tms-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Set active menu item based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'tms-dashboard.html';
  const menuLinks = document.querySelectorAll('.sidebar-link');
  
  menuLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'landing.html';
  }
}

// Profile functions
function viewProfile() {
  alert('Profile page will be implemented here');
}

function changePassword() {
  alert('Change password form will be implemented here');
}
