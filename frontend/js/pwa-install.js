/**
 * PWA Install Manager
 * Handles service worker registration, installation prompts, and PWA features
 */

class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.swRegistration = null;
    
    this.init();
  }

  /**
   * Initialize PWA features
   */
  init() {
    // Check if already installed
    this.checkInstallation();
    
    // Register service worker
    this.registerServiceWorker();
    
    // Setup install prompt
    this.setupInstallPrompt();
    
    // Setup update notifications
    this.setupUpdateNotifications();
    
    // Setup online/offline detection
    this.setupConnectivityDetection();
  }

  /**
   * Check if app is installed
   */
  checkInstallation() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      this.isInstalled = true;
      console.log('[PWA] App is installed');
      
      // Hide install button if present
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
    }
  }

  /**
   * Register service worker
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);
            this.swRegistration = registration;
            
            // Check for updates every hour
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
            
            this.showInstallStatus('Service Worker active', 'success');
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
            this.showInstallStatus('Offline mode unavailable', 'error');
          });
      });
    } else {
      console.log('[PWA] Service Workers not supported');
    }
  }

  /**
   * Setup install prompt
   */
  setupInstallPrompt() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Install prompt available');
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event for later use
      this.deferredPrompt = e;
      
      // Show custom install button
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed');
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.hideInstallButton();
      this.showInstallStatus('App installed successfully!', 'success');
    });
  }

  /**
   * Show install button
   */
  showInstallButton() {
    let installBtn = document.getElementById('pwa-install-btn');
    
    if (!installBtn) {
      // Create install button
      installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-btn';
      installBtn.className = 'pwa-install-button';
      installBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Install App
      `;
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .pwa-install-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          animation: slideUp 0.4s ease-out;
        }
        
        .pwa-install-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
        }
        
        .pwa-install-button:active {
          transform: translateY(0);
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .pwa-install-button {
            bottom: 80px;
            right: 16px;
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Add click handler
      installBtn.addEventListener('click', () => this.promptInstall());
      
      document.body.appendChild(installBtn);
    }
    
    installBtn.style.display = 'flex';
  }

  /**
   * Hide install button
   */
  hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.animation = 'slideDown 0.4s ease-out';
      setTimeout(() => {
        installBtn.style.display = 'none';
      }, 400);
    }
  }

  /**
   * Prompt user to install
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`[PWA] User response: ${outcome}`);

    if (outcome === 'accepted') {
      this.showInstallStatus('Installing app...', 'info');
    } else {
      this.showInstallStatus('Installation cancelled', 'info');
    }

    // Clear the deferred prompt
    this.deferredPrompt = null;
    this.hideInstallButton();
  }

  /**
   * Setup update notifications
   */
  setupUpdateNotifications() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] New service worker activated');
      this.showUpdatePrompt();
    });
  }

  /**
   * Show update prompt
   */
  showUpdatePrompt() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div class="pwa-update-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        <div>
          <strong>Update Available</strong>
          <p>A new version of DLT WMS is ready.</p>
        </div>
      </div>
      <button onclick="location.reload()" class="pwa-update-button">Update Now</button>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .pwa-update-banner {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 16px 20px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 20px;
        animation: slideDown 0.4s ease-out;
        max-width: 500px;
      }
      
      .pwa-update-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }
      
      .pwa-update-content svg {
        stroke: #667eea;
        flex-shrink: 0;
      }
      
      .pwa-update-content strong {
        display: block;
        color: #1f2937;
        font-size: 15px;
        margin-bottom: 2px;
      }
      
      .pwa-update-content p {
        color: #6b7280;
        font-size: 13px;
        margin: 0;
      }
      
      .pwa-update-button {
        background: #667eea;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        white-space: nowrap;
      }
      
      .pwa-update-button:hover {
        background: #5568d3;
      }
      
      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(-100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .pwa-update-banner {
          left: 16px;
          right: 16px;
          transform: none;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(updateBanner);
  }

  /**
   * Setup connectivity detection
   */
  setupConnectivityDetection() {
    window.addEventListener('online', () => {
      console.log('[PWA] Connection restored');
      this.showInstallStatus('Back online', 'success');
      
      // Sync offline data if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_OFFLINE_DATA'
        });
      }
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Connection lost');
      this.showInstallStatus('Offline mode - changes will sync when online', 'warning');
    });

    // Check initial status
    if (!navigator.onLine) {
      this.showInstallStatus('You are offline', 'warning');
    }
  }

  /**
   * Show installation status
   */
  showInstallStatus(message, type = 'info') {
    // Use notification system if available
    if (typeof notify !== 'undefined') {
      notify[type](message);
      return;
    }

    // Fallback to console
    console.log(`[PWA] ${message}`);
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('[PWA] Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush() {
    if (!this.swRegistration) {
      console.log('[PWA] Service worker not registered');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'YOUR_PUBLIC_VAPID_KEY_HERE'
        )
      });

      console.log('[PWA] Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Convert VAPID key
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Clear all caches (for debugging)
   */
  async clearAllCaches() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      });
      console.log('[PWA] Cache cleared');
      this.showInstallStatus('Cache cleared', 'success');
    }
  }
}

// Initialize PWA installer
const pwaInstaller = new PWAInstaller();

// Expose to window for manual control
window.pwaInstaller = pwaInstaller;
