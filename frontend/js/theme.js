// Theme Toggle Functionality
// ===========================

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  if (newTheme === 'dark') {
    body.classList.add('dark-theme');
  } else {
    body.classList.remove('dark-theme');
  }
  
  // Save preference to localStorage
  localStorage.setItem('theme', newTheme);
}

// Initialize theme on page load
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  
  // If user has a saved preference, use it
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
  } else {
    // Default to light theme if no preference saved
    document.body.classList.remove('dark-theme');
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializeTheme);

// Search Modal Functions
// =======================

function openSearch() {
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('globalSearchInput');
  
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
      if (input) {
        input.focus();
      }
    }, 100);
  }
}

function closeSearch() {
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('globalSearchInput');
  
  if (modal) {
    modal.style.display = 'none';
    if (input) {
      input.value = '';
    }
  }
}

// Keyboard shortcut for search (Cmd/Ctrl + K)
document.addEventListener('keydown', function(e) {
  // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
  
  // Close search with Escape key
  if (e.key === 'Escape') {
    closeSearch();
  }
});
