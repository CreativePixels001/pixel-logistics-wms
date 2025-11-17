/**
 * Authentication System
 * Handles login, registration, and session management
 */

// Demo user database (in production, this would be API calls)
const DEMO_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@dltwms.com',
    fullName: 'Admin User',
    role: 'warehouse_manager',
    warehouse: 'WH-001'
  },
  {
    username: 'manager',
    password: 'manager123',
    email: 'manager@dltwms.com',
    fullName: 'Warehouse Manager',
    role: 'warehouse_manager',
    warehouse: 'WH-001'
  },
  {
    username: 'worker',
    password: 'worker123',
    email: 'worker@dltwms.com',
    fullName: 'Warehouse Worker',
    role: 'warehouse_worker',
    warehouse: 'WH-001'
  }
];

// Check if user is already logged in
function checkAuth() {
  const currentUser = getCurrentUser();
  const currentPage = window.location.pathname;
  
  // If on login/register page and already logged in, redirect to dashboard
  if (currentUser && (currentPage.includes('login.html') || currentPage.includes('register.html'))) {
    window.location.href = 'index.html';
    return;
  }
  
  // If not on login/register page and not logged in, redirect to login
  if (!currentUser && !currentPage.includes('login.html') && !currentPage.includes('register.html')) {
    window.location.href = 'login.html';
    return;
  }
}

// Get current logged-in user
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Set current user
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Logout
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  checkAuth();
  
  // Setup login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Setup registration form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Update header with user info if logged in
  updateHeaderUserInfo();
});

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  // Show loading state
  const btn = document.getElementById('loginBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');
  
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Find user in demo database
  const user = DEMO_USERS.find(u => 
    (u.username === username || u.email === username) && u.password === password
  );
  
  if (user) {
    // Create session (remove password from stored data)
    const { password, ...userSession } = user;
    setCurrentUser(userSession);
    
    // Show success and redirect
    showNotification('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } else {
    // Show error
    showError('Invalid username/email or password. Please try again.');
    
    // Reset button
    btn.disabled = false;
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
  }
}

// Handle Registration
async function handleRegister(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const role = document.getElementById('role').value;
  const warehouse = document.getElementById('warehouse').value;
  const terms = document.getElementById('terms').checked;
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showError('Passwords do not match!');
    return;
  }
  
  // Validate password strength
  if (password.length < 6) {
    showError('Password must be at least 6 characters long!');
    return;
  }
  
  // Validate terms
  if (!terms) {
    showError('You must accept the Terms & Conditions!');
    return;
  }
  
  // Show loading state
  const btn = document.getElementById('registerBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');
  
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Check if username/email already exists
  const existingUser = DEMO_USERS.find(u => 
    u.username === username || u.email === email
  );
  
  if (existingUser) {
    showError('Username or email already exists!');
    btn.disabled = false;
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
    return;
  }
  
  // Create new user
  const newUser = {
    username,
    password,
    email,
    fullName,
    role,
    warehouse
  };
  
  // Add to demo database (in production, this would be API call)
  DEMO_USERS.push(newUser);
  
  // Show success message
  showSuccess('Account created successfully! Redirecting to login...');
  
  // Redirect to login after 2 seconds
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 2000);
}

// Fill demo credentials
function fillCredentials(username, password) {
  document.getElementById('username').value = username;
  document.getElementById('password').value = password;
  
  // Add visual feedback
  const inputs = document.querySelectorAll('#username, #password');
  inputs.forEach(input => {
    input.style.backgroundColor = '#f0f9ff';
    setTimeout(() => {
      input.style.backgroundColor = '';
    }, 500);
  });
}

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const showIcon = document.getElementById('showIcon');
  const hideIcon = document.getElementById('hideIcon');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    showIcon.style.display = 'none';
    hideIcon.style.display = 'block';
  } else {
    passwordInput.type = 'password';
    showIcon.style.display = 'block';
    hideIcon.style.display = 'none';
  }
}

// Check password strength
function checkPasswordStrength() {
  const password = document.getElementById('password').value;
  const strengthDiv = document.getElementById('passwordStrength');
  
  if (!password) {
    strengthDiv.className = 'password-strength';
    return;
  }
  
  let strength = 0;
  
  // Length
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Has lowercase and uppercase
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  
  // Has numbers
  if (/\d/.test(password)) strength++;
  
  // Has special characters
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  // Set class based on strength
  if (strength <= 2) {
    strengthDiv.className = 'password-strength weak';
  } else if (strength <= 3) {
    strengthDiv.className = 'password-strength medium';
  } else {
    strengthDiv.className = 'password-strength strong';
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorDiv.classList.remove('show');
  }, 5000);
}

// Show success message
function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.classList.add('show');
  }
}

// Show notification (for logged-in pages)
function showNotification(message, type = 'success') {
  // Check if notification container exists
  let notification = document.querySelector('.notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-icon">
        ${type === 'success' ? '✓' : '✕'}
      </div>
      <div class="notification-message">${message}</div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Show forgot password modal
function showForgotPassword() {
  alert('Forgot Password feature coming soon!\n\nFor demo purposes, use:\n\nAdmin: admin / admin123\nManager: manager / manager123\nWorker: worker / worker123');
}

// Update header with user info
function updateHeaderUserInfo() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Update user name in header if element exists
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(el => {
    el.textContent = currentUser.fullName;
  });
  
  // Update user role if element exists
  const userRoleElements = document.querySelectorAll('.user-role');
  userRoleElements.forEach(el => {
    el.textContent = formatRole(currentUser.role);
  });
}

// Format role for display
function formatRole(role) {
  return role.replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Session timeout (30 minutes)
let sessionTimeout;
function resetSessionTimeout() {
  clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(() => {
    alert('Your session has expired. Please log in again.');
    logout();
  }, 30 * 60 * 1000); // 30 minutes
}

// Reset timeout on user activity
document.addEventListener('mousemove', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);
document.addEventListener('click', resetSessionTimeout);

// Initialize session timeout
resetSessionTimeout();
