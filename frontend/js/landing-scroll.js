// Landing Page Scroll Animations and Parallax Effects

// Navigation scroll state
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.landing-nav');
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

// Parallax effect for elements with data-speed attribute
let ticking = false;

function updateParallax() {
  const scrolled = window.pageYOffset;
  
  document.querySelectorAll('.parallax-element').forEach(element => {
    const speed = parseFloat(element.dataset.speed) || 0;
    const yPos = -(scrolled * speed);
    element.style.transform = `translateY(${yPos}px)`;
  });
  
  // Update parallax background layers
  document.querySelectorAll('.parallax-layer').forEach((layer, index) => {
    const speed = (index + 1) * 0.1;
    const yPos = scrolled * speed;
    layer.style.transform = `translateY(${yPos}px)`;
  });
  
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
}, { passive: true });

// Intersection Observer for scroll reveal animations
const observerOptions = {
  root: null,
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay) || 0;
      
      setTimeout(() => {
        entry.target.classList.add('active');
      }, delay);
      
      // Stop observing once animated
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all scroll-reveal and scroll-fade elements
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.scroll-reveal, .scroll-fade').forEach(element => {
    observer.observe(element);
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});
