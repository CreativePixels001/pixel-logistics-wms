// PixelCloud - Main JavaScript
// Minimal interactions and enhancements

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    initSmoothScroll();
    
    // Navbar scroll effect
    initNavbarScroll();
    
    // Animate server metrics
    animateServerMetrics();
    
    // Close mobile menu on link click
    initMobileMenuClose();
});

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#get-started') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Navbar background on scroll
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 1)';
            navbar.style.backdropFilter = 'none';
        }
    });
}

/**
 * Animate server metrics with random values
 */
function animateServerMetrics() {
    const metrics = document.querySelectorAll('.metric .value');
    
    setInterval(() => {
        metrics.forEach((metric, index) => {
            const currentValue = parseInt(metric.textContent);
            let newValue;
            
            switch(index) {
                case 0: // CPU
                    newValue = Math.floor(Math.random() * 30) + 40; // 40-70%
                    break;
                case 1: // RAM
                    newValue = Math.floor(Math.random() * 20) + 60; // 60-80%
                    break;
                case 2: // Disk
                    newValue = Math.floor(Math.random() * 10) + 30; // 30-40%
                    break;
            }
            
            // Smooth transition
            animateValue(metric, currentValue, newValue, 1000);
        });
    }, 3000);
}

/**
 * Animate number value change
 */
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = end + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '%';
        }
    }, 16);
}

/**
 * Close mobile menu when clicking on a link
 */
function initMobileMenuClose() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        });
    });
}

/**
 * Intersection Observer for fade-in animations
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.solution-card, .pricing-card, .feature-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

/**
 * Console branding
 */
console.log('%c PixelCloud ', 'background: #000; color: #fff; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Enterprise Cloud Solutions ', 'background: #fff; color: #000; font-size: 12px; padding: 5px;');
