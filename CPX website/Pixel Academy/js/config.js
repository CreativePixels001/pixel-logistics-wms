// ==========================================
// PRODUCTION CONFIGURATION
// Easy to switch backend URLs
// ==========================================

const CONFIG = {
  // Backend API URL - Change this when switching providers
  API_URL: 'https://pixel-academy-backend.onrender.com',  // Render.com (Production)
  
  // Alternative backend URLs (uncomment to switch)
  // API_URL: 'http://localhost:8080',  // Local development
  // API_URL: 'https://academy-api.creativepixels.in',  // Custom domain
  // API_URL: 'https://ec2-xx-xx-xx.compute.amazonaws.com',  // AWS EC2
  
  // Google OAuth Client ID
  GOOGLE_CLIENT_ID: '469366716838-3140k3fu6lqrrj7uvfv11u8a29jdsrvb.apps.googleusercontent.com',  // Production
  
  // Environment detection
  IS_DEVELOPMENT: window.location.hostname === 'localhost',
  IS_PRODUCTION: window.location.hostname !== 'localhost'
};

// Auto-detect environment and use appropriate URL
if (CONFIG.IS_DEVELOPMENT) {
  CONFIG.API_URL = 'http://localhost:8080';
}

// Export for use in other files
window.PIXEL_ACADEMY_CONFIG = CONFIG;
