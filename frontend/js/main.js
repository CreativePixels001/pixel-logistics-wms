// DLT WMS - Main JavaScript
// Global utility functions and common functionality

document.addEventListener('DOMContentLoaded', function() {
  console.log('DLT WMS System Initialized');
  initializeApp();
});

// Initialize application
function initializeApp() {
  // Set current date/time
  updateDateTime();
  setInterval(updateDateTime, 60000); // Update every minute
  
  // Initialize any interactive elements
  initializeInteractiveElements();
}

// Update date and time display
function updateDateTime() {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Update if elements exist
  const dateElement = document.getElementById('currentDate');
  const timeElement = document.getElementById('currentTime');
  
  if (dateElement) dateElement.textContent = dateString;
  if (timeElement) timeElement.textContent = timeString;
}

// Initialize interactive elements
function initializeInteractiveElements() {
  // Add click handlers to stat cards if they exist
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#000' : type === 'error' ? '#333' : '#1a1a1a'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px rgba(0,0,0,0.2);
      z-index: 9999;
      min-width: 300px;
      animation: slideInRight 0.3s ease-out;
    ">
      <div style="font-weight: 600; margin-bottom: 0.25rem;">
        ${type === 'success' ? '✓ Success' : type === 'error' ? '✕ Error' : 'ℹ Info'}
      </div>
      <div style="font-size: 0.875rem; opacity: 0.9;">
        ${message}
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Form validation helper
function validateForm(formElement) {
  const inputs = formElement.querySelectorAll('[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      input.style.borderColor = 'var(--color-primary)';
      input.style.borderWidth = '3px';
    } else {
      input.style.borderColor = 'var(--color-grey-lighter)';
      input.style.borderWidth = '2px';
    }
  });
  
  return isValid;
}

// Format date for display
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format time for display
function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Generate unique ID
function generateUniqueId(prefix = 'ID') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

// Local storage helpers
const Storage = {
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },
  
  get: function(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  },
  
  remove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  },
  
  clear: function() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
window.WMS = {
  showNotification,
  validateForm,
  formatDate,
  formatTime,
  formatNumber,
  generateUniqueId,
  Storage
};
