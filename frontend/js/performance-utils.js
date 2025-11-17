/**
 * Pixel Logistics WMS - Performance Utilities
 * Phase 12C: System Optimization
 */

// Performance monitoring
const performanceMonitor = {
  marks: {},
  
  start(label) {
    this.marks[label] = performance.now();
  },
  
  end(label) {
    if (this.marks[label]) {
      const duration = performance.now() - this.marks[label];
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      delete this.marks[label];
      return duration;
    }
  }
};

// Debounce utility for search/filter functions
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for scroll/resize events
function throttle(func, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy load images
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Optimize table rendering for large datasets
function virtualScrollTable(tableId, data, renderRow, rowHeight = 40) {
  const container = document.getElementById(tableId);
  if (!container) return;
  
  const visibleRows = Math.ceil(container.clientHeight / rowHeight) + 2;
  let scrollTop = 0;
  
  function render() {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(startIndex + visibleRows, data.length);
    
    const fragment = document.createDocumentFragment();
    for (let i = startIndex; i < endIndex; i++) {
      fragment.appendChild(renderRow(data[i], i));
    }
    
    container.innerHTML = '';
    container.appendChild(fragment);
    container.style.paddingTop = `${startIndex * rowHeight}px`;
    container.style.paddingBottom = `${(data.length - endIndex) * rowHeight}px`;
  }
  
  container.addEventListener('scroll', throttle((e) => {
    scrollTop = e.target.scrollTop;
    render();
  }, 50));
  
  render();
}

// Cache management
const cache = {
  storage: new Map(),
  ttl: 5 * 60 * 1000, // 5 minutes
  
  set(key, value, customTTL) {
    this.storage.set(key, {
      value,
      expiry: Date.now() + (customTTL || this.ttl)
    });
  },
  
  get(key) {
    const item = this.storage.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.storage.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  clear() {
    this.storage.clear();
  }
};

// Optimized API calls with caching
async function fetchWithCache(url, options = {}) {
  const cacheKey = url + JSON.stringify(options);
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('📦 Cache hit:', url);
    return cached;
  }
  
  performanceMonitor.start(url);
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    cache.set(cacheKey, data);
    performanceMonitor.end(url);
    return data;
  } catch (error) {
    performanceMonitor.end(url);
    console.error('API Error:', error);
    throw error;
  }
}

// Batch DOM updates
function batchDOMUpdate(updates) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// Memory leak prevention - cleanup event listeners
const eventListenerRegistry = [];

function addManagedEventListener(element, event, handler) {
  element.addEventListener(event, handler);
  eventListenerRegistry.push({ element, event, handler });
}

function cleanupEventListeners() {
  eventListenerRegistry.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  eventListenerRegistry.length = 0;
}

// Page visibility optimization
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause expensive operations when page is hidden
    console.log('⏸️ Page hidden - pausing updates');
  } else {
    // Resume operations when page is visible
    console.log('▶️ Page visible - resuming updates');
  }
});

// Report web vitals
function reportWebVitals() {
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('LCP:', entry.renderTime || entry.loadTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log('CLS:', clsValue);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Initialize performance monitoring
if (window.location.hostname !== 'localhost') {
  reportWebVitals();
}

// Export utilities
window.PixelLogistics = window.PixelLogistics || {};
window.PixelLogistics.utils = {
  debounce,
  throttle,
  performanceMonitor,
  lazyLoadImages,
  virtualScrollTable,
  cache,
  fetchWithCache,
  batchDOMUpdate,
  addManagedEventListener,
  cleanupEventListeners
};

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  cleanupEventListeners();
  cache.clear();
});

console.log('✅ Performance utilities loaded');
