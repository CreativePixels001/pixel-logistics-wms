/**
 * Conditional Logger - Only logs in development mode
 * Production builds should set DEBUG_MODE to false
 */

const DEBUG_MODE = false; // Set to false for production

const logger = {
  log: (...args) => {
    if (DEBUG_MODE) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (DEBUG_MODE) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (DEBUG_MODE) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (DEBUG_MODE) {
      console.info(...args);
    }
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = logger;
}

// Global availability
if (typeof window !== 'undefined') {
  window.logger = logger;
}

// Service Worker availability
if (typeof self !== 'undefined' && self.serviceWorker) {
  self.logger = logger;
}
