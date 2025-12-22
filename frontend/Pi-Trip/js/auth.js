/* ===================================
   Pi-Trip - Authentication JavaScript
   Login, Signup, Password Reset
   ================================== */

// ===================================
// Handle Login
// ===================================

function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const remember = form.remember.checked;
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Demo credentials check
    if (email === 'demo@pitrip.com' && password === 'demo123') {
        setTimeout(() => {
            console.log('Login successful:', { email, remember });
            showNotification('Login successful! Welcome back! 🎉', 'success');
            
            // Store demo login
            if (remember) {
                localStorage.setItem('piTripUser', JSON.stringify({ email, name: 'Demo User' }));
            } else {
                sessionStorage.setItem('piTripUser', JSON.stringify({ email, name: 'Demo User' }));
            }
            
            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }, 1500);
    } else {
        // Real login would make API call here
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showNotification('Login functionality coming soon! Use demo credentials for now.', 'info');
        }, 1500);
    }
}

// ===================================
// Handle Signup
// ===================================

function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        password: form.password.value,
        vehicle: form.vehicle.value,
        terms: form.terms.checked,
        newsletter: form.newsletter.checked
    };
    
    // Validate
    if (!formData.terms) {
        showNotification('Please accept Terms of Service to continue', 'warning');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Demo signup (real app would make API call)
    setTimeout(() => {
        console.log('Signup successful:', formData);
        showNotification(`Welcome to Pi-Trip, ${formData.firstName}! 🎉`, 'success');
        
        // Store user data
        sessionStorage.setItem('piTripUser', JSON.stringify({
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`
        }));
        
        // Redirect after 1 second
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }, 2000);
}

// ===================================
// Handle Password Reset
// ===================================

function handlePasswordReset(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value;
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Demo password reset (real app would make API call)
    setTimeout(() => {
        console.log('Password reset requested for:', email);
        
        // Hide form, show success message
        form.style.display = 'none';
        const successMsg = document.getElementById('successMessage');
        successMsg.style.display = 'block';
        
        // Countdown timer
        let countdown = 5;
        const countdownEl = document.getElementById('countdown');
        const timer = setInterval(() => {
            countdown--;
            countdownEl.textContent = countdown;
            
            if (countdown === 0) {
                clearInterval(timer);
                window.location.href = 'login.html';
            }
        }, 1000);
        
    }, 1500);
}

// ===================================
// Toggle Password Visibility
// ===================================

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
        `;
    } else {
        input.type = 'password';
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `;
    }
}

// ===================================
// Password Strength Checker
// ===================================

function checkPasswordStrength(password) {
    const strengthEl = document.getElementById('passwordStrength');
    if (!strengthEl) return;
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    strengthEl.classList.add('show');
    strengthEl.classList.remove('weak', 'medium', 'strong');
    
    if (strength <= 2) {
        strengthEl.textContent = '⚠️ Weak password';
        strengthEl.classList.add('weak');
    } else if (strength <= 4) {
        strengthEl.textContent = '✓ Medium strength';
        strengthEl.classList.add('medium');
    } else {
        strengthEl.textContent = '✓✓ Strong password';
        strengthEl.classList.add('strong');
    }
}

// Add password strength checker on signup page
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput && document.getElementById('passwordStrength')) {
        passwordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });
    }
});

// ===================================
// Fill Demo Credentials
// ===================================

function fillDemoCredentials() {
    document.getElementById('email').value = 'demo@pitrip.com';
    document.getElementById('password').value = 'demo123';
    
    showNotification('Demo credentials filled! Click Login to continue.', 'success');
}

// ===================================
// Copy to Clipboard
// ===================================

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(`Copied: ${text}`, 'success');
    }).catch(() => {
        showNotification('Failed to copy', 'error');
    });
}

// ===================================
// Social Login
// ===================================

function socialLogin(provider) {
    showNotification(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'info');
    
    // In a real app, this would initiate OAuth flow
    console.log(`Social login initiated with: ${provider}`);
}

// ===================================
// Notifications
// ===================================

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        background: type === 'success' ? '#000' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: '#fff',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: '9999',
        fontWeight: '600',
        fontSize: '0.875rem',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
        opacity: '0',
        transform: 'translateX(100%)'
    });
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Form Validation
// ===================================

// Real-time email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Real-time phone validation (Indian format)
function validatePhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Add validation listeners
document.addEventListener('DOMContentLoaded', () => {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value && !validateEmail(input.value)) {
                input.style.borderColor = '#ef4444';
                showNotification('Please enter a valid email address', 'warning');
            } else {
                input.style.borderColor = '';
            }
        });
    });
    
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value && !validatePhone(input.value)) {
                input.style.borderColor = '#ef4444';
                showNotification('Please enter a valid phone number', 'warning');
            } else {
                input.style.borderColor = '';
            }
        });
    });
});

// ===================================
// Check if User is Logged In
// ===================================

function checkAuth() {
    const user = localStorage.getItem('piTripUser') || sessionStorage.getItem('piTripUser');
    if (user) {
        return JSON.parse(user);
    }
    return null;
}

// ===================================
// Logout Function
// ===================================

function logout() {
    localStorage.removeItem('piTripUser');
    sessionStorage.removeItem('piTripUser');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'auth/login.html';
    }, 1000);
}

// Export for global access
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handlePasswordReset = handlePasswordReset;
window.togglePassword = togglePassword;
window.fillDemoCredentials = fillDemoCredentials;
window.copyToClipboard = copyToClipboard;
window.socialLogin = socialLogin;
window.showNotification = showNotification;
window.checkAuth = checkAuth;
window.logout = logout;

// ===================================
// Console Welcome
// ===================================

console.log(`
%c Pi-Trip Auth 🔐
%c Secure Authentication System
`, 
'font-size: 20px; font-weight: bold; color: #000;',
'font-size: 12px; color: #666;'
);
