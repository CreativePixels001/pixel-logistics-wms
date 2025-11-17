/**
 * Pixel Logistics WMS - Accessibility Utilities
 * Phase 12C: WCAG 2.1 AA Compliance
 */

// Skip to main content functionality
function initializeSkipLinks() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to main content';
  skipLink.setAttribute('tabindex', '0');
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #000000;
      color: #ffffff;
      padding: 8px 16px;
      text-decoration: none;
      z-index: 10000;
      font-weight: 600;
      border-radius: 0 0 4px 0;
    }
    .skip-link:focus {
      top: 0;
    }
  `;
  document.head.appendChild(style);
}

// Keyboard navigation improvements
function enhanceKeyboardNavigation() {
  // Add visible focus indicators
  const style = document.createElement('style');
  style.textContent = `
    *:focus-visible {
      outline: 2px solid #000000;
      outline-offset: 2px;
    }
    
    body.dark-theme *:focus-visible {
      outline-color: #ffffff;
    }
    
    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
      outline: 2px solid #000000;
      outline-offset: 2px;
    }
    
    body.dark-theme button:focus-visible,
    body.dark-theme a:focus-visible,
    body.dark-theme input:focus-visible,
    body.dark-theme select:focus-visible,
    body.dark-theme textarea:focus-visible {
      outline-color: #ffffff;
    }
  `;
  document.head.appendChild(style);
  
  // Trap focus in modals
  document.addEventListener('keydown', function(e) {
    const modal = document.querySelector('.modal.show, .modal-overlay.show');
    if (!modal) return;
    
    if (e.key === 'Escape') {
      closeModal();
    }
    
    if (e.key === 'Tab') {
      trapFocus(modal, e);
    }
  });
}

// Focus trap for modals
function trapFocus(element, event) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  if (event.shiftKey && document.activeElement === firstFocusable) {
    event.preventDefault();
    lastFocusable.focus();
  } else if (!event.shiftKey && document.activeElement === lastFocusable) {
    event.preventDefault();
    firstFocusable.focus();
  }
}

// ARIA live regions for dynamic content
function announceToScreenReader(message, priority = 'polite') {
  let liveRegion = document.getElementById('aria-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    
    // Add screen reader only style
    const style = document.createElement('style');
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    document.head.appendChild(style);
  }
  
  liveRegion.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
}

// Add ARIA labels to interactive elements
function addARIALabels() {
  // Label buttons without text
  document.querySelectorAll('button:not([aria-label])').forEach(button => {
    if (!button.textContent.trim() && button.querySelector('svg')) {
      const title = button.getAttribute('title') || 'Button';
      button.setAttribute('aria-label', title);
    }
  });
  
  // Label links without text
  document.querySelectorAll('a:not([aria-label])').forEach(link => {
    if (!link.textContent.trim() && link.querySelector('svg')) {
      const title = link.getAttribute('title') || 'Link';
      link.setAttribute('aria-label', title);
    }
  });
  
  // Add role to navigation
  document.querySelectorAll('.sidebar, nav').forEach(nav => {
    if (!nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
    }
    if (!nav.getAttribute('aria-label')) {
      nav.setAttribute('aria-label', 'Main navigation');
    }
  });
  
  // Add role to main content
  const mainContent = document.querySelector('.main-content, main');
  if (mainContent) {
    mainContent.id = 'main-content';
    mainContent.setAttribute('role', 'main');
  }
  
  // Add role to header
  const header = document.querySelector('.header, header');
  if (header && !header.getAttribute('role')) {
    header.setAttribute('role', 'banner');
  }
}

// Form accessibility improvements
function enhanceFormAccessibility() {
  // Associate labels with inputs
  document.querySelectorAll('input, select, textarea').forEach(input => {
    if (!input.id) {
      input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Find associated label
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (!label && input.placeholder) {
      const newLabel = document.createElement('label');
      newLabel.setAttribute('for', input.id);
      newLabel.className = 'sr-only';
      newLabel.textContent = input.placeholder;
      input.parentNode.insertBefore(newLabel, input);
    }
    
    // Add aria-required for required fields
    if (input.required && !input.getAttribute('aria-required')) {
      input.setAttribute('aria-required', 'true');
    }
    
    // Add aria-invalid for invalid fields
    input.addEventListener('invalid', function() {
      this.setAttribute('aria-invalid', 'true');
    });
    
    input.addEventListener('input', function() {
      if (this.validity.valid) {
        this.removeAttribute('aria-invalid');
      }
    });
  });
  
  // Add describedby for error messages
  document.querySelectorAll('.error-message').forEach((error, index) => {
    const id = `error-${index}`;
    error.id = id;
    error.setAttribute('role', 'alert');
    
    const input = error.previousElementSibling;
    if (input && (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA')) {
      input.setAttribute('aria-describedby', id);
    }
  });
}

// Table accessibility
function enhanceTableAccessibility() {
  document.querySelectorAll('table').forEach(table => {
    // Add role if not present
    if (!table.getAttribute('role')) {
      table.setAttribute('role', 'table');
    }
    
    // Add caption if missing
    if (!table.querySelector('caption') && table.previousElementSibling?.tagName === 'H3') {
      const caption = document.createElement('caption');
      caption.className = 'sr-only';
      caption.textContent = table.previousElementSibling.textContent;
      table.insertBefore(caption, table.firstChild);
    }
    
    // Add scope to headers
    table.querySelectorAll('th').forEach(th => {
      if (!th.getAttribute('scope')) {
        const row = th.parentElement;
        const thead = row.closest('thead');
        th.setAttribute('scope', thead ? 'col' : 'row');
      }
    });
  });
}

// Initialize all accessibility features
function initializeAccessibility() {
  initializeSkipLinks();
  enhanceKeyboardNavigation();
  addARIALabels();
  enhanceFormAccessibility();
  enhanceTableAccessibility();
  
  console.log('♿ Accessibility features initialized');
}

// Auto-initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAccessibility);
} else {
  initializeAccessibility();
}

// Export functions for manual use
window.accessibility = {
  announce: announceToScreenReader,
  trapFocus,
  addLabels: addARIALabels,
  enhanceForms: enhanceFormAccessibility,
  enhanceTables: enhanceTableAccessibility
};
