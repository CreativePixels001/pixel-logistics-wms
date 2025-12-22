// Pixel Safe Landing Page JavaScript

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    navMenu.classList.toggle('active');
    toggle.classList.toggle('active');
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            document.querySelector('.nav-menu')?.classList.remove('active');
        }
    });
});

// Quote Form Submission
document.getElementById('quoteForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Add to leads database
    try {
        const response = await fetch('http://localhost:5001/api/v1/pis/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                interestType: data.insuranceType,
                source: 'website',
                budget: 'not-disclosed',
                priority: 'medium',
                notes: `Quote request from landing page for ${data.insuranceType} insurance`
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            alert('Thank you! We will send you personalized quotes within 24 hours.');
            this.reset();
            
            // Optionally redirect to a thank you page
            // window.location.href = 'thank-you.html';
        } else {
            alert('Something went wrong. Please try again or call us at 1800-XXX-XXXX');
        }
    } catch (error) {
        console.error('Error submitting quote:', error);
        alert('Unable to submit request. Please try again later.');
    }
});

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Get insurance type from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const insuranceType = urlParams.get('type');
if (insuranceType && document.querySelector('[name="insuranceType"]')) {
    document.querySelector('[name="insuranceType"]').value = insuranceType;
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.product-card, .feature-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Product card click tracking
document.querySelectorAll('.product-cta').forEach(cta => {
    cta.addEventListener('click', (e) => {
        const productTitle = e.target.closest('.product-card').querySelector('.product-title').textContent;
        console.log('Product clicked:', productTitle);
        // Analytics tracking can be added here
    });
});

console.log('Pixel Safe Landing Page Loaded');
