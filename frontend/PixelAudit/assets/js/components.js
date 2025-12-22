// PixelAudit - Reusable UI Components
// Sidebar and Header components for all pages

// Sidebar Component
function renderSidebar(activePage = 'dashboard') {
    const userName = localStorage.getItem('pixelaudit_user_name') || 'Demo User';
    const userEmail = localStorage.getItem('pixelaudit_user_email') || 'demo@pixelaudit.com';
    
    return `
        <aside class="sidebar" id="sidebar">
            <div style="padding: 1.5rem; border-bottom: 1px solid #e5e5e5;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <div>
                        <h1 style="font-size: 1.25rem; font-weight: 800; margin: 0;">PixelAudit</h1>
                        <p style="font-size: 0.75rem; color: #666; margin: 0;">Smart & Pixel Perfect</p>
                    </div>
                </div>
            </div>

            <nav style="padding: 1rem 0;">
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li>
                        <a href="dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"/>
                                <rect x="14" y="3" width="7" height="7"/>
                                <rect x="14" y="14" width="7" height="7"/>
                                <rect x="3" y="14" width="7" height="7"/>
                            </svg>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="templates.html" class="nav-link ${activePage === 'templates' ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                            <span>Templates</span>
                        </a>
                    </li>
                    <li>
                        <a href="audits.html" class="nav-link ${activePage === 'audits' ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            <span>Audits</span>
                        </a>
                    </li>
                    <li>
                        <a href="clients.html" class="nav-link ${activePage === 'clients' ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
                            </svg>
                            <span>Clients</span>
                        </a>
                    </li>
                    <li>
                        <a href="auditors.html" class="nav-link ${activePage === 'auditors' ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                <circle cx="8.5" cy="7" r="4"/>
                                <path d="M20 8v6m3-3h-6"/>
                            </svg>
                            <span>Auditors</span>
                        </a>
                    </li>
                    <li>
                        <a href="reports.html" class="nav-link ${activePage === 'reports' ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
                            </svg>
                            <span>Reports</span>
                        </a>
                    </li>
                    <li>
                        <a href="settings.html" class="nav-link ${activePage === 'settings' ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6m5.7-13.7l-4.2 4.2m0 6l4.2 4.2M1 12h6m6 0h6m-13.7 5.7l4.2-4.2m0-6l-4.2-4.2"/>
                            </svg>
                            <span>Settings</span>
                        </a>
                    </li>
                </ul>
            </nav>

            <div style="margin-top: auto; padding: 1rem; border-top: 1px solid #e5e5e5;">
                <div class="trial-badge" id="trialTimer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Trial: <strong id="timerText">59:45</strong></span>
                </div>
                <a href="index.html#pricing" style="display: block; margin-top: 0.75rem; padding: 0.5rem 1rem; background: #000; color: #fff; text-align: center; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
                    Upgrade Now
                </a>
            </div>
        </aside>
    `;
}

// Page Header Component
function renderPageHeader(title, subtitle = '', actions = '') {
    return `
        <header class="page-header">
            <div class="page-header-content">
                <div class="page-header-left">
                    <div class="page-header-text">
                        <h1 class="page-title">${title}</h1>
                        ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
                    </div>
                </div>
                <div class="page-header-right">
                    ${actions}
                    <div class="user-menu">
                        <button class="user-menu-btn" onclick="toggleUserMenu()">
                            <div class="user-avatar" id="userAvatar">D</div>
                            <div class="user-info">
                                <div class="user-name" id="userName">Demo User</div>
                                <div class="user-email" id="userEmail">demo@pixelaudit.com</div>
                            </div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <div class="user-menu-dropdown" id="userMenuDropdown">
                            <a href="settings.html">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 1v6m0 6v6"/>
                                </svg>
                                Settings
                            </a>
                            <a href="#" onclick="logout(); return false;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9"/>
                                </svg>
                                Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    `;
}

// Initialize components on page
function initializeComponents(activePage, pageTitle, pageSubtitle = '', headerActions = '') {
    // Inject sidebar
    const sidebarContainer = document.getElementById('sidebarContainer');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = renderSidebar(activePage);
    }

    // Inject header
    const headerContainer = document.getElementById('headerContainer');
    if (headerContainer) {
        headerContainer.innerHTML = renderPageHeader(pageTitle, pageSubtitle, headerActions);
    }

    // Initialize user info
    const userName = localStorage.getItem('pixelaudit_user_name') || 'Demo User';
    const userEmail = localStorage.getItem('pixelaudit_user_email') || 'demo@pixelaudit.com';
    
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) userNameEl.textContent = userName;
    if (userEmailEl) userEmailEl.textContent = userEmail;
    if (userAvatarEl) userAvatarEl.textContent = userName.charAt(0).toUpperCase();

    // Start trial timer
    startTrialTimer();
}

// Trial Timer Function
function startTrialTimer() {
    const trialStart = localStorage.getItem('pixelaudit_trial_start');
    if (!trialStart) return;

    const elapsed = Date.now() - parseInt(trialStart);
    const oneHour = 60 * 60 * 1000;
    let remainingTime = oneHour - elapsed;

    const timerEl = document.getElementById('timerText');
    if (!timerEl) return;

    function updateTimer() {
        if (remainingTime <= 0) {
            alert('Your 1-hour trial has expired! Upgrade for just ₹1 to continue.');
            window.location.href = 'index.html#pricing';
            return;
        }

        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        remainingTime -= 1000;
        setTimeout(updateTimer, 1000);
    }
    
    updateTimer();
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Toggle user menu dropdown
function toggleUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close user menu when clicking outside
document.addEventListener('click', function(e) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userMenuDropdown');
    
    if (dropdown && !userMenu?.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('pixelaudit_access_token');
        localStorage.removeItem('pixelaudit_trial_start');
        window.location.href = 'index.html';
    }
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('pixelaudit_access_token');
    const trialStart = localStorage.getItem('pixelaudit_trial_start');
    
    if (!token || !trialStart) {
        // Create demo session
        localStorage.setItem('pixelaudit_access_token', 'demo_' + Date.now());
        localStorage.setItem('pixelaudit_trial_start', Date.now().toString());
        localStorage.setItem('pixelaudit_user_name', 'Demo User');
        localStorage.setItem('pixelaudit_user_email', 'demo@pixelaudit.com');
    }
    
    // Check trial expiry
    const elapsed = Date.now() - parseInt(localStorage.getItem('pixelaudit_trial_start'));
    const oneHour = 60 * 60 * 1000;
    
    if (elapsed >= oneHour) {
        alert('Your 1-hour trial has expired! Upgrade for just ₹1 to continue.');
        window.location.href = 'index.html#pricing';
        return false;
    }
    
    return true;
}
