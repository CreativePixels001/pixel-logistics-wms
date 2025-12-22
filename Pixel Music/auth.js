// Google Sign-In Handler
function handleCredentialResponse(response) {
    // Decode JWT token
    const responsePayload = parseJwt(response.credential);
    
    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log('Email: ' + responsePayload.email);
    console.log("Image URL: " + responsePayload.picture);
    
    // Save user data to localStorage
    const userData = {
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture,
        loginType: 'google'
    };
    localStorage.setItem('pixelMusicUser', JSON.stringify(userData));
    
    // Track login event
    if (typeof trackLogin === 'function') {
        trackLogin('google');
    }
    
    // Show user info
    document.getElementById('userName').innerHTML = `
        <img src="${responsePayload.picture}" alt="${responsePayload.name}" 
             style="width: 32px; height: 32px; border-radius: 50%; vertical-align: middle; margin-right: 8px;">
        ${responsePayload.name}
    `;
    
    // Set mobile profile image
    setMobileProfileImage(responsePayload.picture);
    
    showApp();
}

// Parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

// Skip login for development
function skipLogin() {
    // Save guest user data to localStorage
    const userData = {
        name: 'Guest User',
        loginType: 'guest'
    };
    localStorage.setItem('pixelMusicUser', JSON.stringify(userData));
    
    // Track guest login
    if (typeof trackLogin === 'function') {
        trackLogin('guest');
    }
    
    document.getElementById('userName').innerHTML = `
        <i class="bi bi-person-circle" style="font-size: 1.5rem; vertical-align: middle; margin-right: 8px;"></i>
        Guest User
    `;
    showApp();
}

// Show main app
function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
}

// Profile Dropdown Toggle
function toggleProfileDropdown() {
    const dropdown = document.querySelector('.profile-dropdown');
    dropdown.classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        dropdown.classList.remove('open');
    }
});

// Show Profile (placeholder - can be expanded later)
function showProfile() {
    const dropdown = document.querySelector('.profile-dropdown');
    dropdown.classList.remove('open');
    
    const userData = JSON.parse(localStorage.getItem('pixelMusicUser') || '{}');
    
    // Show profile info in a toast for now
    showToast(`Logged in as: ${userData.name || 'Guest'}`);
}

// Show Settings (placeholder - can be expanded later)
function showSettings() {
    const dropdown = document.querySelector('.profile-dropdown');
    dropdown.classList.remove('open');
    
    // Show settings toast for now
    showToast('Settings coming soon!');
}

// Logout
function logout() {
    // Close dropdown first
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown) dropdown.classList.remove('open');
    
    // Clear localStorage
    localStorage.removeItem('pixelMusicUser');
    
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
    document.getElementById('userName').textContent = '';
    
    // Reset player
    resetApp();
}

// Reset app state
function resetApp() {
    // Stop playback
    if (player && player.stopVideo) {
        player.stopVideo();
    }
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
    }
    
    // Clear UI
    resetPlayer();
    
    // Clear search results
    youtubeSearchResults = [];
    document.getElementById('songList').innerHTML = '';
    document.getElementById('searchInput').value = '';
}

// Check for existing session on page load
function checkExistingSession() {
    const storedUser = localStorage.getItem('pixelMusicUser');
    
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            
            // Restore user UI based on login type
            if (userData.loginType === 'google' && userData.picture) {
                document.getElementById('userName').innerHTML = `
                    <img src="${userData.picture}" alt="${userData.name}" 
                         style="width: 32px; height: 32px; border-radius: 50%; vertical-align: middle; margin-right: 8px;">
                    ${userData.name}
                `;
                // Set mobile profile image
                setMobileProfileImage(userData.picture);
            } else {
                document.getElementById('userName').innerHTML = `
                    <i class="bi bi-person-circle" style="font-size: 1.5rem; vertical-align: middle; margin-right: 8px;"></i>
                    ${userData.name}
                `;
            }
            
            // Show app directly
            showApp();
            return true;
        } catch (e) {
            console.error('Error restoring session:', e);
            localStorage.removeItem('pixelMusicUser');
        }
    }
    
    return false;
}

// Make handleCredentialResponse globally available
window.handleCredentialResponse = handleCredentialResponse;

// Make all auth functions globally available
window.toggleProfileDropdown = toggleProfileDropdown;
window.showProfile = showProfile;
window.showSettings = showSettings;
window.logout = logout;
window.skipLogin = skipLogin;

// Set mobile profile image
function setMobileProfileImage(pictureUrl) {
    const mobileProfileImg = document.getElementById('mobileProfileImg');
    const mobileProfileIconDefault = document.getElementById('mobileProfileIconDefault');
    
    if (mobileProfileImg && pictureUrl) {
        mobileProfileImg.src = pictureUrl;
        mobileProfileImg.style.display = 'block';
        if (mobileProfileIconDefault) {
            mobileProfileIconDefault.style.display = 'none';
        }
    }
}

// Initialize session check on page load
window.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = checkExistingSession();
    
    // Check if there's a pending Google response (from before auth.js loaded)
    if (!isLoggedIn && window.pendingGoogleResponse) {
        console.log('[Auth] Processing pending Google Sign-In response');
        handleCredentialResponse(window.pendingGoogleResponse);
        window.pendingGoogleResponse = null;
    }
    
    // Cancel Google One Tap if already logged in
    if (isLoggedIn && typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.cancel();
    }
});
