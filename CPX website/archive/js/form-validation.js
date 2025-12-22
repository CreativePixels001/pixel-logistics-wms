/**
 * Form Validation for CreativePixels Website
 * Handles client-side validation for contact and checkout forms
 */

(function() {
    'use strict';

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Phone validation regex (supports international formats)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

    /**
     * Display error message
     */
    function showError(input, message) {
        const formGroup = input.closest('.form-group') || input.parentElement;
        let errorElement = formGroup.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.style.color = '#ff4444';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            errorElement.style.display = 'block';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
    }

    /**
     * Clear error message
     */
    function clearError(input) {
        const formGroup = input.closest('.form-group') || input.parentElement;
        const errorElement = formGroup.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
    }

    /**
     * Validate required field
     */
    function validateRequired(input) {
        const value = input.value.trim();
        
        if (!value) {
            showError(input, `${input.getAttribute('placeholder') || 'This field'} is required`);
            return false;
        }
        
        clearError(input);
        return true;
    }

    /**
     * Validate email
     */
    function validateEmail(input) {
        const value = input.value.trim();
        
        if (!value) {
            showError(input, 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(value)) {
            showError(input, 'Please enter a valid email address');
            return false;
        }
        
        clearError(input);
        return true;
    }

    /**
     * Validate phone number
     */
    function validatePhone(input) {
        const value = input.value.trim();
        
        if (!value) {
            showError(input, 'Phone number is required');
            return false;
        }
        
        if (!phoneRegex.test(value)) {
            showError(input, 'Please enter a valid phone number');
            return false;
        }
        
        clearError(input);
        return true;
    }

    /**
     * Validate credit card number (basic Luhn algorithm)
     */
    function validateCardNumber(input) {
        const value = input.value.replace(/\s/g, '');
        
        if (!value) {
            showError(input, 'Card number is required');
            return false;
        }
        
        if (!/^\d{13,19}$/.test(value)) {
            showError(input, 'Please enter a valid card number');
            return false;
        }
        
        // Luhn algorithm
        let sum = 0;
        let isEven = false;
        
        for (let i = value.length - 1; i >= 0; i--) {
            let digit = parseInt(value.charAt(i), 10);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        if (sum % 10 !== 0) {
            showError(input, 'Invalid card number');
            return false;
        }
        
        clearError(input);
        return true;
    }

    /**
     * Validate expiry date (MM/YY format)
     */
    function validateExpiry(input) {
        const value = input.value.trim();
        
        if (!value) {
            showError(input, 'Expiry date is required');
            return false;
        }
        
        const match = value.match(/^(\d{2})\/(\d{2})$/);
        
        if (!match) {
            showError(input, 'Format should be MM/YY');
            return false;
        }
        
        const month = parseInt(match[1], 10);
        const year = parseInt('20' + match[2], 10);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        if (month < 1 || month > 12) {
            showError(input, 'Invalid month');
            return false;
        }
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            showError(input, 'Card has expired');
            return false;
        }
        
        clearError(input);
        return true;
    }

    /**
     * Validate CVV
     */
    function validateCVV(input) {
        const value = input.value.trim();
        
        if (!value) {
            showError(input, 'CVV is required');
            return false;
        }
        
        if (!/^\d{3,4}$/.test(value)) {
            showError(input, 'CVV must be 3 or 4 digits');
            return false;
        }
        
        clearError(input);
        return true;
    }

    /**
     * Auto-format card number with spaces
     */
    function formatCardNumber(input) {
        let value = input.value.replace(/\s/g, '');
        let formatted = value.match(/.{1,4}/g);
        input.value = formatted ? formatted.join(' ') : value;
    }

    /**
     * Auto-format expiry date
     */
    function formatExpiry(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        input.value = value;
    }

    /**
     * Initialize form validation
     */
    function initFormValidation() {
        // Contact form validation
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            const nameInput = contactForm.querySelector('input[name="name"]');
            const emailInput = contactForm.querySelector('input[name="email"]');
            const phoneInput = contactForm.querySelector('input[name="phone"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');
            
            if (nameInput) {
                nameInput.addEventListener('blur', () => validateRequired(nameInput));
            }
            
            if (emailInput) {
                emailInput.addEventListener('blur', () => validateEmail(emailInput));
            }
            
            if (phoneInput) {
                phoneInput.addEventListener('blur', () => validatePhone(phoneInput));
            }
            
            if (messageInput) {
                messageInput.addEventListener('blur', () => validateRequired(messageInput));
            }
            
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                let isValid = true;
                
                if (nameInput && !validateRequired(nameInput)) isValid = false;
                if (emailInput && !validateEmail(emailInput)) isValid = false;
                if (phoneInput && !validatePhone(phoneInput)) isValid = false;
                if (messageInput && !validateRequired(messageInput)) isValid = false;
                
                if (isValid) {
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.style.cssText = 'background: #4CAF50; color: white; padding: 1rem; border-radius: 4px; margin: 1rem 0; text-align: center;';
                    successMessage.textContent = 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.';
                    
                    contactForm.insertBefore(successMessage, contactForm.firstChild);
                    contactForm.reset();
                    
                    setTimeout(() => {
                        successMessage.remove();
                    }, 5000);
                }
            });
        }

        // Checkout form validation
        const checkoutForm = document.querySelector('.checkout-form');
        if (checkoutForm) {
            const cardNumberInput = checkoutForm.querySelector('input[name="card-number"]');
            const expiryInput = checkoutForm.querySelector('input[name="expiry"]');
            const cvvInput = checkoutForm.querySelector('input[name="cvv"]');
            const emailInput = checkoutForm.querySelector('input[name="email"]');
            const nameInput = checkoutForm.querySelector('input[name="name"]');
            
            // Auto-formatting
            if (cardNumberInput) {
                cardNumberInput.addEventListener('input', () => formatCardNumber(cardNumberInput));
                cardNumberInput.addEventListener('blur', () => validateCardNumber(cardNumberInput));
            }
            
            if (expiryInput) {
                expiryInput.addEventListener('input', () => formatExpiry(expiryInput));
                expiryInput.addEventListener('blur', () => validateExpiry(expiryInput));
            }
            
            if (cvvInput) {
                cvvInput.addEventListener('blur', () => validateCVV(cvvInput));
            }
            
            if (emailInput) {
                emailInput.addEventListener('blur', () => validateEmail(emailInput));
            }
            
            if (nameInput) {
                nameInput.addEventListener('blur', () => validateRequired(nameInput));
            }
            
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                let isValid = true;
                
                if (cardNumberInput && !validateCardNumber(cardNumberInput)) isValid = false;
                if (expiryInput && !validateExpiry(expiryInput)) isValid = false;
                if (cvvInput && !validateCVV(cvvInput)) isValid = false;
                if (emailInput && !validateEmail(emailInput)) isValid = false;
                if (nameInput && !validateRequired(nameInput)) isValid = false;
                
                if (isValid) {
                    // Process payment (integrate with Stripe here)
                    console.log('Form is valid, processing payment...');
                    // For now, redirect to success page
                    window.location.href = 'payment-success.html';
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormValidation);
    } else {
        initFormValidation();
    }

})();
