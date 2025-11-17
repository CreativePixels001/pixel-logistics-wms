/* Performance Optimization - Lazy Loading Images */
document.addEventListener('DOMContentLoaded', function() {
  // Lazy load images
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  lazyImages.forEach(img => imageObserver.observe(img));

  // Debounce resize events
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      window.dispatchEvent(new Event('optimizedResize'));
    }, 250);
  });

  // Throttle scroll events
  let scrollTimer;
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', () => {
    if (!scrollTimer) {
      scrollTimer = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(scrollTop - lastScrollTop) > 5) {
          window.dispatchEvent(new CustomEvent('optimizedScroll', {
            detail: { scrollTop }
          }));
          lastScrollTop = scrollTop;
        }
        scrollTimer = null;
      }, 100);
    }
  });
});

// Request Animation Frame wrapper for smooth animations
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

// Preload critical resources
function preloadCriticalResources() {
  const criticalCSS = [
    '/css/styles.css',
    '/css/mobile-app.css'
  ];
  
  const criticalJS = [
    '/js/main.js'
  ];
  
  criticalCSS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
  
  criticalJS.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  });
}

// Cache DOM queries
const DOMCache = new Map();

function getCachedElement(selector) {
  if (!DOMCache.has(selector)) {
    DOMCache.set(selector, document.querySelector(selector));
  }
  return DOMCache.get(selector);
}

// Batch DOM updates
function batchDOMUpdate(updates) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// Memory cleanup
function clearDOMCache() {
  DOMCache.clear();
}

// Export utilities
window.WMSOptimization = {
  getCachedElement,
  batchDOMUpdate,
  clearDOMCache,
  preloadCriticalResources
};
