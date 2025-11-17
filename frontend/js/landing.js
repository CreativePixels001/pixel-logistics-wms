// Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize Charts
    initializeCharts();
    
    // Parallax effect for banner and hero sections
    window.addEventListener('scroll', handleParallax);
    
    function handleParallax() {
        const scrolled = window.pageYOffset;
        
        // Banner parallax
        const banner = document.querySelector('.hero-banner');
        const bannerContent = document.querySelector('.banner-content');
        const pixelBoxes = document.querySelectorAll('.pixel-box');
        
        if (banner && scrolled < banner.offsetHeight) {
            if (bannerContent) {
                bannerContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                bannerContent.style.opacity = 1 - (scrolled / banner.offsetHeight) * 0.8;
            }
            
            // Animate pixel boxes
            pixelBoxes.forEach((box, index) => {
                const speed = 0.2 + (index * 0.05);
                box.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
            });
        }
        
        // Shipping hero parallax text
        const parallaxText = document.querySelector('.parallax-text');
        if (parallaxText) {
            const speed = parallaxText.getAttribute('data-speed') || 0.5;
            const offset = scrolled * speed;
            parallaxText.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
        }
    }
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Only prevent default for actual anchor links (not just "#")
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Hero scroll indicator
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
        heroScroll.addEventListener('click', () => {
            const featuresSection = document.querySelector('#features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Intersection Observer for fade-in animations
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

    // Observe all cards and sections
    document.querySelectorAll('.feature-card, .module-card, .benefit-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Show success message (in a real app, this would send to server)
            showNotification('Thank you! We will contact you soon.', 'success');
            
            // Reset form
            contactForm.reset();
            
            // Log data (for demo purposes)
            console.log('Form submitted:', data);
        });
    }

    // Stats counter animation
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Observe stats for counter animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const value = entry.target.textContent.replace(/[^0-9.]/g, '');
                const numValue = parseFloat(value);
                
                if (!isNaN(numValue)) {
                    entry.target.textContent = '0';
                    animateValue(entry.target, 0, numValue, 2000);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number, .metric-value').forEach(stat => {
        statsObserver.observe(stat);
    });

    // Show notification helper
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add CSS for notification animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });

    // Mobile menu toggle (if needed in future)
    const createMobileMenu = () => {
        const navLinks = document.querySelector('.nav-links');
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.cssText = `
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--dark);
            cursor: pointer;
        `;
        
        if (window.innerWidth <= 768) {
            toggleBtn.style.display = 'block';
            document.querySelector('.nav-container').appendChild(toggleBtn);
            
            toggleBtn.addEventListener('click', () => {
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            });
        }
    };

    // CTA buttons click tracking (for analytics)
    document.querySelectorAll('.btn-primary, .btn-demo').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            console.log('CTA Button Clicked:', buttonText);
            // In production, send to analytics
            // gtag('event', 'cta_click', { button_text: buttonText });
        });
    });

    // Add loading state to demo buttons
    document.querySelectorAll('a[href="login.html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Demo...';
            this.style.pointerEvents = 'none';
        });
    });

    console.log('✅ Landing page loaded successfully');
    
    // Animate vehicle markers
    animateVehicles();
});

// Animate vehicles along routes
function animateVehicles() {
    const vehicles = document.querySelectorAll('.vehicle-marker');
    
    vehicles.forEach((vehicle, index) => {
        const route = vehicle.getAttribute('data-route');
        let progress = 0;
        
        setInterval(() => {
            progress += 0.5;
            if (progress > 100) progress = 0;
            
            // Calculate position based on route
            const positions = getRoutePosition(route, progress);
            vehicle.style.top = positions.top;
            vehicle.style.left = positions.left;
            
        }, 100);
    });
}

function getRoutePosition(route, progress) {
    const routes = {
        '1': {
            start: { top: 25, left: 20 },
            end: { top: 30, left: 65 }
        },
        '2': {
            start: { top: 45, left: 35 },
            end: { top: 70, left: 75 }
        },
        '3': {
            start: { top: 60, left: 55 },
            end: { top: 50, left: 85 }
        }
    };
    
    const routeData = routes[route];
    const percent = progress / 100;
    
    return {
        top: (routeData.start.top + (routeData.end.top - routeData.start.top) * percent) + '%',
        left: (routeData.start.left + (routeData.end.left - routeData.start.left) * percent) + '%'
    };
}

// Initialize all charts
function initializeCharts() {
    // Chart defaults
    Chart.defaults.color = '#666666';
    Chart.defaults.borderColor = '#e0e0e0';
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Hero Performance Chart
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Uptime %',
                    data: [98.5, 99.1, 99.4, 99.7, 99.8, 99.9],
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#000000',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#000000',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#000000',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return 'Uptime: ' + context.parsed.y + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 98,
                        max: 100,
                        ticks: { 
                            callback: value => value + '%',
                            font: { size: 11 }
                        },
                        grid: { 
                            color: '#e0e0e0',
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 11 }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    // Efficiency Trends Chart
    const efficiencyCtx = document.getElementById('efficiencyChart');
    if (efficiencyCtx) {
        new Chart(efficiencyCtx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Picking Efficiency',
                    data: [78, 82, 88, 92],
                    backgroundColor: '#000000'
                }, {
                    label: 'Packing Efficiency',
                    data: [72, 76, 81, 85],
                    backgroundColor: '#666666'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        display: true,
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });
    }
    
    // Fulfillment Rate Chart
    const fulfillmentCtx = document.getElementById('fulfillmentChart');
    if (fulfillmentCtx) {
        new Chart(fulfillmentCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Fulfillment Rate',
                    data: [94, 96, 95, 97, 98, 99, 99.5],
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 90,
                        max: 100,
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });
    }
    
    // Module Utilization Chart
    const modulesCtx = document.getElementById('modulesChart');
    if (modulesCtx) {
        new Chart(modulesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Inbound', 'Outbound', 'Inventory', 'Quality', 'Analytics', 'Optimization'],
                datasets: [{
                    data: [18, 25, 20, 12, 15, 10],
                    backgroundColor: [
                        '#000000',
                        '#1a1a1a',
                        '#333333',
                        '#4d4d4d',
                        '#666666',
                        '#999999'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true }
                    }
                }
            }
        });
    }
    
    // Cost Reduction Chart
    const costCtx = document.getElementById('costChart');
    if (costCtx) {
        new Chart(costCtx, {
            type: 'bar',
            data: {
                labels: ['Labor', 'Inventory', 'Shipping', 'Storage', 'Returns'],
                datasets: [{
                    label: 'Cost Reduction %',
                    data: [32, 28, 35, 22, 40],
                    backgroundColor: '#000000'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 50,
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });
    }
}
