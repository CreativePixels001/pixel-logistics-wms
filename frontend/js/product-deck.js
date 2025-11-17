// Product Deck - Pixel Logistics WMS
// Navigation and interaction logic

let currentSlideIndex = 1;
const totalSlides = 7;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    initKeyboardNavigation();
    initDotNavigation();
});

// Navigation Functions
function nextSlide() {
    if (currentSlideIndex < totalSlides) {
        goToSlide(currentSlideIndex + 1);
    }
}

function prevSlide() {
    if (currentSlideIndex > 1) {
        goToSlide(currentSlideIndex - 1);
    }
}

function goToSlide(slideNumber) {
    if (slideNumber < 1 || slideNumber > totalSlides) return;

    // Get current and target slides
    const currentSlide = document.querySelector('.slide.active');
    const targetSlide = document.querySelector(`.slide[data-slide="${slideNumber}"]`);

    if (!targetSlide || currentSlide === targetSlide) return;

    // Determine direction
    const direction = slideNumber > currentSlideIndex ? 'next' : 'prev';

    // Remove active class from current slide
    currentSlide.classList.remove('active');
    if (direction === 'prev') {
        currentSlide.classList.add('prev');
    }

    // Add active class to target slide
    targetSlide.classList.add('active');
    targetSlide.classList.remove('prev');

    // Update index
    currentSlideIndex = slideNumber;

    // Update progress
    updateProgress();

    // Scroll to top of slide content
    const slideContent = targetSlide.querySelector('.slide-content');
    if (slideContent) {
        slideContent.scrollTop = 0;
    }

    // Clean up prev class after transition
    setTimeout(() => {
        const prevSlide = document.querySelector('.slide.prev');
        if (prevSlide) {
            prevSlide.classList.remove('prev');
        }
    }, 500);
}

// Update Progress Indicators
function updateProgress() {
    // Update dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index + 1 === currentSlideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // Update counter
    const currentSlideElement = document.getElementById('currentSlide');
    if (currentSlideElement) {
        currentSlideElement.textContent = currentSlideIndex;
    }

    // Update arrow button states
    const prevButton = document.querySelector('.nav-prev');
    const nextButton = document.querySelector('.nav-next');

    if (prevButton) {
        prevButton.style.opacity = currentSlideIndex === 1 ? '0.3' : '1';
        prevButton.style.pointerEvents = currentSlideIndex === 1 ? 'none' : 'auto';
    }

    if (nextButton) {
        nextButton.style.opacity = currentSlideIndex === totalSlides ? '0.3' : '1';
        nextButton.style.pointerEvents = currentSlideIndex === totalSlides ? 'none' : 'auto';
    }
}

// Initialize Dot Navigation
function initDotNavigation() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index + 1);
        });
    });
}

// Keyboard Navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides);
                break;
            case 'Escape':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
        }
    });
}

// Fullscreen Toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Download as PDF
function downloadDeck() {
    // Option 1: Use browser print dialog
    window.print();
    
    // Option 2: If you want to use html2pdf library (uncomment if library is included)
    /*
    const element = document.querySelector('.deck-container');
    const opt = {
        margin: 0,
        filename: 'pixel-logistics-wms-deck.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
    */
}

// Touch/Swipe Support for Mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            nextSlide();
        } else {
            // Swipe right - prev slide
            prevSlide();
        }
    }
}

// Auto-hide navigation on inactivity
let inactivityTimer;
const navElements = document.querySelectorAll('.nav-arrow, .slide-progress');

function showNavigation() {
    navElements.forEach(el => {
        el.style.opacity = '1';
    });
    resetInactivityTimer();
}

function hideNavigation() {
    if (!document.fullscreenElement) return; // Only hide in fullscreen
    navElements.forEach(el => {
        el.style.opacity = '0';
    });
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(hideNavigation, 3000); // Hide after 3 seconds
}

// Show navigation on mouse move in fullscreen
document.addEventListener('mousemove', () => {
    if (document.fullscreenElement) {
        showNavigation();
    }
});

// Analytics tracking (optional - for production)
function trackSlideView(slideNumber) {
    // Implement analytics tracking here
    // Example: gtag('event', 'slide_view', { slide_number: slideNumber });
    console.log('Slide viewed:', slideNumber);
}

// Export functions for global access
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;
window.toggleFullscreen = toggleFullscreen;
window.downloadDeck = downloadDeck;
