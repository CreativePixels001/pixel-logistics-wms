/**
 * Mobile Scanner Interface - Phase 10B
 * Full-screen mobile scanning with RF device simulation
 */

class MobileScannerUI {
  constructor(options = {}) {
    this.options = {
      module: options.module || 'warehouse',
      onScan: options.onScan || null,
      onClose: options.onClose || null,
      theme: options.theme || 'modern', // modern or rf (RF green screen)
      enableVoice: options.enableVoice !== false,
      enableVibration: options.enableVibration !== false
    };

    this.scanner = null;
    this.container = null;
    this.isActive = false;
    this.scanQueue = []; // Offline scan queue
  }

  /**
   * Open mobile scanner interface
   */
  open() {
    this.createMobileInterface();
    this.initializeScanner();
    this.isActive = true;
  }

  /**
   * Create mobile-optimized scanner interface
   */
  createMobileInterface() {
    const container = document.createElement('div');
    container.className = `mobile-scanner-container ${this.options.theme}-theme`;
    container.innerHTML = this.getInterfaceHTML();

    document.body.appendChild(container);
    this.container = container;

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Get interface HTML based on theme
   */
  getInterfaceHTML() {
    if (this.options.theme === 'rf') {
      return this.getRFThemeHTML();
    }
    return this.getModernThemeHTML();
  }

  /**
   * Get modern theme HTML
   */
  getModernThemeHTML() {
    return `
      <!-- Mobile Scanner Header -->
      <div class="mobile-scanner-header">
        <button class="mobile-back-btn" id="mobileBackBtn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 class="mobile-scanner-title">${this.getModuleTitle()}</h1>
        <button class="mobile-theme-btn" id="mobileThemeBtn" title="Switch to RF Theme">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </button>
      </div>

      <!-- Camera View -->
      <div class="mobile-camera-view">
        <video id="mobileScannerVideo" class="mobile-scanner-video" autoplay playsinline></video>
        <div class="mobile-scanner-overlay">
          <div class="mobile-scanner-frame">
            <div class="frame-corner frame-corner-tl"></div>
            <div class="frame-corner frame-corner-tr"></div>
            <div class="frame-corner frame-corner-bl"></div>
            <div class="frame-corner frame-corner-br"></div>
          </div>
          <p class="mobile-scanner-hint">Position barcode in frame</p>
        </div>
        <div class="mobile-flashlight-btn" id="flashlightBtn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 2h6l3 7v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9l3-7z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
          </svg>
        </div>
      </div>

      <!-- Manual Entry Section -->
      <div class="mobile-manual-section">
        <div class="mobile-input-group">
          <input 
            type="text" 
            id="mobileManualInput" 
            class="mobile-manual-input" 
            placeholder="Or type barcode..."
            autocomplete="off"
          >
          <button class="mobile-submit-btn" id="mobileSubmitBtn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mobile-quick-actions">
        <button class="mobile-action-btn" id="historyBtn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>History</span>
        </button>
        <button class="mobile-action-btn" id="settingsBtn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
          </svg>
          <span>Settings</span>
        </button>
        <button class="mobile-action-btn" id="offlineBtn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.2 15.2L11 6"></path>
            <circle cx="11" cy="13" r="7"></circle>
          </svg>
          <span>Offline (<span id="queueCount">0</span>)</span>
        </button>
      </div>
    `;
  }

  /**
   * Get RF (Radio Frequency) theme HTML
   */
  getRFThemeHTML() {
    return `
      <!-- RF Scanner Header -->
      <div class="rf-scanner-header">
        <div class="rf-status-bar">
          <span class="rf-signal">▂▃▅▇</span>
          <span class="rf-battery">100%</span>
          <span class="rf-time" id="rfTime">12:00</span>
        </div>
        <div class="rf-title-bar">
          <span class="rf-title">${this.getModuleTitle()}</span>
          <button class="rf-exit-btn" id="rfExitBtn">ESC</button>
        </div>
      </div>

      <!-- RF Display Screen -->
      <div class="rf-display-screen">
        <div class="rf-screen-content">
          <div class="rf-prompt">READY TO SCAN</div>
          <div class="rf-scanner-area">
            <video id="mobileScannerVideo" class="rf-scanner-video" autoplay playsinline></video>
            <div class="rf-scan-line"></div>
          </div>
          <div class="rf-last-scan" id="rfLastScan">Last: --</div>
        </div>
      </div>

      <!-- RF Function Keys -->
      <div class="rf-function-keys">
        <button class="rf-fkey" id="rfF1">F1<br><small>MENU</small></button>
        <button class="rf-fkey" id="rfF2">F2<br><small>HISTORY</small></button>
        <button class="rf-fkey" id="rfF3">F3<br><small>MANUAL</small></button>
        <button class="rf-fkey" id="rfF4">F4<br><small>SYNC</small></button>
      </div>

      <!-- RF Numeric Keypad -->
      <div class="rf-keypad">
        <button class="rf-key" data-key="1">1</button>
        <button class="rf-key" data-key="2">2</button>
        <button class="rf-key" data-key="3">3</button>
        <button class="rf-key" data-key="4">4</button>
        <button class="rf-key" data-key="5">5</button>
        <button class="rf-key" data-key="6">6</button>
        <button class="rf-key" data-key="7">7</button>
        <button class="rf-key" data-key="8">8</button>
        <button class="rf-key" data-key="9">9</button>
        <button class="rf-key rf-key-wide" data-key="CLR">CLR</button>
        <button class="rf-key" data-key="0">0</button>
        <button class="rf-key rf-key-wide" data-key="ENT">ENT</button>
      </div>

      <!-- RF Manual Input (Hidden by default) -->
      <div class="rf-manual-input" id="rfManualInput" style="display:none;">
        <input type="text" class="rf-input-field" id="rfInputField" placeholder="Enter barcode...">
        <div class="rf-input-actions">
          <button class="rf-input-btn" id="rfCancelBtn">CANCEL</button>
          <button class="rf-input-btn rf-input-btn-primary" id="rfSubmitBtn">SUBMIT</button>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.options.theme === 'modern') {
      this.setupModernListeners();
    } else {
      this.setupRFListeners();
    }
  }

  /**
   * Setup modern theme listeners
   */
  setupModernListeners() {
    const backBtn = this.container.querySelector('#mobileBackBtn');
    const themeBtn = this.container.querySelector('#mobileThemeBtn');
    const submitBtn = this.container.querySelector('#mobileSubmitBtn');
    const manualInput = this.container.querySelector('#mobileManualInput');
    const flashlightBtn = this.container.querySelector('#flashlightBtn');
    const historyBtn = this.container.querySelector('#historyBtn');
    const settingsBtn = this.container.querySelector('#settingsBtn');
    const offlineBtn = this.container.querySelector('#offlineBtn');

    backBtn?.addEventListener('click', () => this.close());
    themeBtn?.addEventListener('click', () => this.switchToRFTheme());
    submitBtn?.addEventListener('click', () => this.submitManualEntry());
    manualInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.submitManualEntry();
    });
    flashlightBtn?.addEventListener('click', () => this.toggleFlashlight());
    historyBtn?.addEventListener('click', () => this.showScanHistory());
    settingsBtn?.addEventListener('click', () => this.showSettings());
    offlineBtn?.addEventListener('click', () => this.showOfflineQueue());
  }

  /**
   * Setup RF theme listeners
   */
  setupRFListeners() {
    const exitBtn = this.container.querySelector('#rfExitBtn');
    const f1Btn = this.container.querySelector('#rfF1');
    const f2Btn = this.container.querySelector('#rfF2');
    const f3Btn = this.container.querySelector('#rfF3');
    const f4Btn = this.container.querySelector('#rfF4');
    const keypadKeys = this.container.querySelectorAll('.rf-key');

    exitBtn?.addEventListener('click', () => this.close());
    f1Btn?.addEventListener('click', () => this.switchToModernTheme());
    f2Btn?.addEventListener('click', () => this.showScanHistory());
    f3Btn?.addEventListener('click', () => this.showRFManualEntry());
    f4Btn?.addEventListener('click', () => this.syncOfflineScans());

    keypadKeys.forEach(key => {
      key.addEventListener('click', () => this.handleKeypadPress(key.dataset.key));
    });

    // Update RF time every second
    this.updateRFTime();
    this.rfTimeInterval = setInterval(() => this.updateRFTime(), 1000);
  }

  /**
   * Initialize scanner
   */
  async initializeScanner() {
    const video = this.container.querySelector('#mobileScannerVideo');

    this.scanner = new BarcodeScanner({
      videoElement: video,
      onScan: (scanData) => this.handleScan(scanData),
      onError: (error) => this.handleError(error),
      beepOnScan: true,
      vibrateOnScan: this.options.enableVibration
    });

    await this.scanner.startScanning();
  }

  /**
   * Handle successful scan
   */
  handleScan(scanData) {
    // Voice feedback
    if (this.options.enableVoice) {
      this.speakScan(scanData.value);
    }

    // Update UI based on theme
    if (this.options.theme === 'rf') {
      const lastScanEl = this.container.querySelector('#rfLastScan');
      if (lastScanEl) {
        lastScanEl.textContent = `Last: ${scanData.value}`;
      }
    }

    // Check if online
    if (!navigator.onLine) {
      this.addToOfflineQueue(scanData);
      if (window.notify) {
        notify.warning('Scan queued (offline mode)');
      }
    } else {
      // Call user callback
      if (this.options.onScan) {
        this.options.onScan(scanData);
      }
    }
  }

  /**
   * Handle scanning error
   */
  handleError(error) {
    console.error('Mobile scanner error:', error);
    if (window.notify) {
      notify.error('Scanner error: ' + error.message);
    }
  }

  /**
   * Submit manual entry
   */
  submitManualEntry() {
    const input = this.container.querySelector('#mobileManualInput');
    const value = input?.value.trim();

    if (value && this.scanner) {
      this.scanner.processManualEntry(value);
      if (input) input.value = '';
    }
  }

  /**
   * Toggle flashlight
   */
  async toggleFlashlight() {
    if (!this.scanner || !this.scanner.stream) return;

    try {
      const track = this.scanner.stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      if (capabilities.torch) {
        const constraints = track.getConstraints();
        const torchEnabled = constraints.advanced?.[0]?.torch;
        
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled }]
        });

        const flashBtn = this.container.querySelector('#flashlightBtn');
        if (flashBtn) {
          flashBtn.classList.toggle('active');
        }
      } else {
        if (window.notify) {
          notify.error('Flashlight not available on this device');
        }
      }
    } catch (error) {
      console.error('Flashlight error:', error);
    }
  }

  /**
   * Show scan history
   */
  showScanHistory() {
    if (!this.scanner) return;

    const history = this.scanner.getHistory();
    
    if (window.notify) {
      if (history.length === 0) {
        notify.info('No scans in history');
      } else {
        const recent = history.slice(0, 5).map(s => s.value).join(', ');
        notify.info(`Recent scans: ${recent}`);
      }
    }
  }

  /**
   * Show settings
   */
  showSettings() {
    if (window.notify) {
      notify.info('Scanner settings: Voice ON, Vibrate ON');
    }
  }

  /**
   * Show offline queue
   */
  showOfflineQueue() {
    if (window.notify) {
      notify.info(`Offline queue: ${this.scanQueue.length} scans pending`);
    }
  }

  /**
   * Add scan to offline queue
   */
  addToOfflineQueue(scanData) {
    this.scanQueue.push({
      ...scanData,
      queuedAt: Date.now()
    });

    // Update queue count
    const queueCount = this.container.querySelector('#queueCount');
    if (queueCount) {
      queueCount.textContent = this.scanQueue.length;
    }

    // Store in localStorage
    localStorage.setItem('offlineScanQueue', JSON.stringify(this.scanQueue));
  }

  /**
   * Sync offline scans
   */
  async syncOfflineScans() {
    if (this.scanQueue.length === 0) {
      if (window.notify) notify.info('No offline scans to sync');
      return;
    }

    if (window.notify) {
      const hideLoader = notify.loading(`Syncing ${this.scanQueue.length} scans...`);
      
      // Simulate sync
      setTimeout(() => {
        hideLoader();
        this.scanQueue = [];
        localStorage.removeItem('offlineScanQueue');
        
        const queueCount = this.container.querySelector('#queueCount');
        if (queueCount) {
          queueCount.textContent = '0';
        }
        
        notify.success('All scans synced successfully!');
      }, 2000);
    }
  }

  /**
   * Voice feedback
   */
  speakScan(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Switch to RF theme
   */
  switchToRFTheme() {
    this.options.theme = 'rf';
    this.close();
    this.open();
  }

  /**
   * Switch to modern theme
   */
  switchToModernTheme() {
    this.options.theme = 'modern';
    this.close();
    this.open();
  }

  /**
   * Show RF manual entry
   */
  showRFManualEntry() {
    const manualInput = this.container.querySelector('#rfManualInput');
    if (manualInput) {
      manualInput.style.display = 'block';
      const inputField = this.container.querySelector('#rfInputField');
      inputField?.focus();

      const cancelBtn = this.container.querySelector('#rfCancelBtn');
      const submitBtn = this.container.querySelector('#rfSubmitBtn');

      cancelBtn?.addEventListener('click', () => {
        manualInput.style.display = 'none';
        if (inputField) inputField.value = '';
      });

      submitBtn?.addEventListener('click', () => {
        const value = inputField?.value.trim();
        if (value && this.scanner) {
          this.scanner.processManualEntry(value);
          manualInput.style.display = 'none';
          if (inputField) inputField.value = '';
        }
      });
    }
  }

  /**
   * Handle keypad press (RF theme)
   */
  handleKeypadPress(key) {
    const inputField = this.container.querySelector('#rfInputField');
    
    if (!inputField || inputField.parentElement.style.display === 'none') {
      this.showRFManualEntry();
      return;
    }

    if (key === 'CLR') {
      inputField.value = '';
    } else if (key === 'ENT') {
      const value = inputField.value.trim();
      if (value && this.scanner) {
        this.scanner.processManualEntry(value);
        inputField.value = '';
        inputField.parentElement.style.display = 'none';
      }
    } else {
      inputField.value += key;
    }
  }

  /**
   * Update RF time display
   */
  updateRFTime() {
    const timeEl = this.container?.querySelector('#rfTime');
    if (timeEl) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      timeEl.textContent = `${hours}:${minutes}`;
    }
  }

  /**
   * Get module title
   */
  getModuleTitle() {
    const titles = {
      receiving: 'RECEIVING',
      picking: 'PICKING',
      packing: 'PACKING',
      cycleCount: 'CYCLE COUNT',
      inventory: 'INVENTORY',
      warehouse: 'WAREHOUSE'
    };
    return titles[this.options.module] || 'SCANNER';
  }

  /**
   * Close mobile scanner
   */
  close() {
    this.isActive = false;

    if (this.rfTimeInterval) {
      clearInterval(this.rfTimeInterval);
    }

    if (this.scanner) {
      this.scanner.stopScanning();
    }

    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    if (this.options.onClose) {
      this.options.onClose();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileScannerUI;
}
