/**
 * Pixel Logistics WMS - Security Utilities
 * Phase 12C: Security Hardening
 */

// XSS Protection - Sanitize HTML input
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Sanitize for attributes
function sanitizeAttribute(str) {
  return str.replace(/[<>"'&]/g, (char) => {
    const entities = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[char];
  });
}

// CSRF Token Management
const CSRFToken = {
  token: null,
  
  generate() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('csrf_token', this.token);
    return this.token;
  },
  
  get() {
    if (!this.token) {
      this.token = sessionStorage.getItem('csrf_token') || this.generate();
    }
    return this.token;
  },
  
  validate(token) {
    return token === this.get();
  },
  
  addToForm(formElement) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'csrf_token';
    input.value = this.get();
    formElement.appendChild(input);
  },
  
  addToHeaders(headers = {}) {
    headers['X-CSRF-Token'] = this.get();
    return headers;
  }
};

// Initialize CSRF token
CSRFToken.generate();

// Secure API fetch wrapper
async function secureFetch(url, options = {}) {
  const defaultOptions = {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...CSRFToken.addToHeaders()
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    // Check for authentication errors
    if (response.status === 401) {
      console.warn('⚠️ Unauthorized - redirecting to login');
      window.location.href = '/login.html';
      return null;
    }
    
    // Check for CSRF errors
    if (response.status === 403) {
      console.error('🚫 CSRF validation failed');
      CSRFToken.generate();
      throw new Error('CSRF validation failed');
    }
    
    return response;
  } catch (error) {
    console.error('Security fetch error:', error);
    throw error;
  }
}

// Input validation helpers
const validators = {
  email(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  phone(phone) {
    const re = /^\+?[\d\s-()]+$/;
    return re.test(phone);
  },
  
  alphanumeric(str) {
    const re = /^[a-zA-Z0-9]+$/;
    return re.test(str);
  },
  
  noSQLInjection(str) {
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/i;
    return !sqlPatterns.test(str);
  },
  
  length(str, min, max) {
    return str.length >= min && str.length <= max;
  },
  
  number(val, min = -Infinity, max = Infinity) {
    const num = parseFloat(val);
    return !isNaN(num) && num >= min && num <= max;
  }
};

// Secure form submission
function secureFormSubmit(formElement, callback) {
  formElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Add CSRF token
    CSRFToken.addToForm(formElement);
    
    // Get form data
    const formData = new FormData(formElement);
    const data = {};
    
    // Sanitize all inputs
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        data[key] = sanitizeHTML(value);
      } else {
        data[key] = value;
      }
    }
    
    // Call callback with sanitized data
    if (callback) {
      await callback(data);
    }
  });
}

// Content Security Policy checker
function checkCSP() {
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    console.warn('⚠️ CSP not set - consider adding Content Security Policy');
  }
}

// Session management
const SessionManager = {
  timeout: 30 * 60 * 1000, // 30 minutes
  warningTime: 5 * 60 * 1000, // 5 minutes before timeout
  lastActivity: Date.now(),
  timer: null,
  warningTimer: null,
  
  init() {
    this.resetTimer();
    this.trackActivity();
  },
  
  trackActivity() {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = Date.now();
        this.resetTimer();
      }, { passive: true });
    });
  },
  
  resetTimer() {
    clearTimeout(this.timer);
    clearTimeout(this.warningTimer);
    
    // Set warning timer
    this.warningTimer = setTimeout(() => {
      this.showWarning();
    }, this.timeout - this.warningTime);
    
    // Set logout timer
    this.timer = setTimeout(() => {
      this.logout();
    }, this.timeout);
  },
  
  showWarning() {
    if (window.showNotification) {
      window.showNotification('Your session will expire in 5 minutes', 'warning');
    } else {
      console.warn('⚠️ Session expiring soon');
    }
  },
  
  logout() {
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    window.location.href = '/login.html?reason=timeout';
  },
  
  extend() {
    this.resetTimer();
  }
};

// Secure local storage
const SecureStorage = {
  prefix: 'pl_', // Pixel Logistics prefix
  
  set(key, value, encrypt = false) {
    try {
      const data = encrypt ? btoa(JSON.stringify(value)) : JSON.stringify(value);
      localStorage.setItem(this.prefix + key, data);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  
  get(key, decrypt = false) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      if (!data) return null;
      return decrypt ? JSON.parse(atob(data)) : JSON.parse(data);
    } catch (error) {
      console.error('Storage retrieval error:', error);
      return null;
    }
  },
  
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },
  
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Initialize security features
checkCSP();

// Auto-start session manager if logged in
if (sessionStorage.getItem('isLoggedIn') === 'true') {
  SessionManager.init();
}

// Export security utilities
window.PixelLogistics = window.PixelLogistics || {};
window.PixelLogistics.security = {
  sanitizeHTML,
  sanitizeAttribute,
  CSRFToken,
  secureFetch,
  validators,
  secureFormSubmit,
  SessionManager,
  SecureStorage
};

console.log('🔒 Security utilities loaded');
