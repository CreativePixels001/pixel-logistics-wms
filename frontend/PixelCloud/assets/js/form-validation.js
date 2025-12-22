/**
 * PixelCloud - Form Validation
 * Client-side form validation for all dashboard forms
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Profile Settings Form
    const profileForm = document.querySelector('#settings-section form');
    if (profileForm) {
        const saveBtn = profileForm.querySelector('.btn-dark');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const fullName = profileForm.querySelector('input[type="text"]').value.trim();
                const email = profileForm.querySelector('input[type="email"]').value.trim();
                
                if (!fullName) {
                    showError('Please enter your full name');
                    return;
                }
                
                if (!email || !isValidEmail(email)) {
                    showError('Please enter a valid email address');
                    return;
                }
                
                // Simulate save with loading state
                showLoadingButton(saveBtn, 'Saving...');
                
                setTimeout(() => {
                    resetLoadingButton(saveBtn, 'Save Changes');
                    showSuccess('Profile updated successfully!');
                }, 1500);
            });
        }
    }
    
    // Password Change Form
    const passwordInputs = document.querySelectorAll('#settings-section input[type="password"]');
    if (passwordInputs.length === 3) {
        const updatePasswordBtn = document.querySelector('#settings-section .btn-dark');
        if (updatePasswordBtn && updatePasswordBtn.textContent.includes('Update Password')) {
            updatePasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const currentPassword = passwordInputs[0].value;
                const newPassword = passwordInputs[1].value;
                const confirmPassword = passwordInputs[2].value;
                
                if (!currentPassword) {
                    showError('Please enter your current password');
                    return;
                }
                
                if (!newPassword || newPassword.length < 8) {
                    showError('New password must be at least 8 characters long');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    showError('New password and confirmation do not match');
                    return;
                }
                
                if (!isStrongPassword(newPassword)) {
                    showWarning('Password should contain uppercase, lowercase, numbers, and special characters');
                }
                
                // Simulate password update
                showLoadingButton(updatePasswordBtn, 'Updating...');
                
                setTimeout(() => {
                    resetLoadingButton(updatePasswordBtn, 'Update Password');
                    showSuccess('Password updated successfully!');
                    
                    // Clear password fields
                    passwordInputs.forEach(input => input.value = '');
                }, 1500);
            });
        }
    }

    // Create Ticket Form
    const createTicketBtn = document.getElementById('createTicketModal')?.querySelector('.btn-dark');
    if (createTicketBtn) {
        createTicketBtn.addEventListener('click', (e) => {
            const subject = document.getElementById('ticketSubject').value.trim();
            const description = document.getElementById('ticketDescription').value.trim();
            
            if (!subject) {
                showError('Please enter a ticket subject');
                return;
            }
            
            if (!description || description.length < 10) {
                showError('Please provide a detailed description (at least 10 characters)');
                return;
            }
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createTicketModal'));
            modal.hide();
            
            // Show success
            showSuccess('Support ticket created successfully! Ticket #TKT-' + Math.floor(Math.random() * 9000 + 1000));
            
            // Clear form
            document.getElementById('ticketSubject').value = '';
            document.getElementById('ticketDescription').value = '';
        });
    }
});

// Email validation
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Strong password validation
function isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Domain name validation
function isValidDomain(domain) {
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
    return regex.test(domain);
}

// IP address validation
function isValidIPv4(ip) {
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!regex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
    });
}

// Show loading state on button
function showLoadingButton(button, text = 'Loading...') {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        ${text}
    `;
}

// Reset button to original state
function resetLoadingButton(button, text = null) {
    button.disabled = false;
    button.textContent = text || button.dataset.originalText || 'Submit';
    delete button.dataset.originalText;
}
