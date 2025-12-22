// Landing Page JavaScript

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.navbar-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offset = 80; // Navbar height
            const targetPosition = target.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    });
});

// Navbar Scroll Effect with Class
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add scrolled class
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Animate Stats on Scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const animateStats = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statValues = entry.target.querySelectorAll('.stat-value');
            statValues.forEach(stat => {
                const text = stat.textContent;
                const hasNumber = /\d+/.test(text);
                
                if (hasNumber) {
                    const number = parseInt(text.match(/\d+/)[0]);
                    const suffix = text.replace(/\d+/, '');
                    let current = 0;
                    const increment = number / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            stat.textContent = number + suffix;
                            clearInterval(timer);
                        } else {
                            stat.textContent = Math.floor(current) + suffix;
                        }
                    }, 30);
                }
            });
            
            observer.unobserve(entry.target);
        }
    });
};

const statsObserver = new IntersectionObserver(animateStats, observerOptions);
const statsSection = document.querySelector('.stats');

if (statsSection) {
    statsObserver.observe(statsSection);
}

// Animate Feature Cards on Scroll
const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            featureObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s, transform 0.5s';
    featureObserver.observe(card);
});

// Parallax Effect for Hero Cards
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
    window.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.hero-card');
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        
        cards.forEach((card, index) => {
            const speed = (index + 1) * 10;
            const xOffset = x * speed;
            const yOffset = y * speed;
            card.style.transform = `translateX(${xOffset}px) translateY(${yOffset}px)`;
        });
    });
}

// Cursor Glow Effect
const createCursorGlow = () => {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.cssText = `
        position: fixed;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.2s ease;
    `;
    document.body.appendChild(glow);
    
    window.addEventListener('mousemove', (e) => {
        glow.style.left = (e.clientX - 150) + 'px';
        glow.style.top = (e.clientY - 150) + 'px';
    });
};

// Only on desktop
if (window.innerWidth > 768) {
    createCursorGlow();
}

// Console Easter Egg
console.log('%c👋 Welcome to PixelAudit!', 'font-size: 24px; font-weight: bold; color: #FFFFFF; text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);');
console.log('%c🚀 Built with Futuristic Design', 'font-size: 16px; color: #E5E5E5;');
console.log('%c✨ Glassmorphism + White Glow + 3D Effects', 'font-size: 14px; color: #CCCCCC;');
console.log('%c💼 Join our team: careers@pixelaudit.com', 'font-size: 12px; color: #FFFFFF; font-weight: bold;');

