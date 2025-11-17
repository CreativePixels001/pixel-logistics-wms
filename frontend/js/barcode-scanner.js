/**
 * Barcode Scanner Module - Phase 10A
 * Camera-based barcode scanning with manual entry fallback
 * Supports: Code128, Code39, UPC, EAN, QR codes
 */

class BarcodeScanner {
  constructor(options = {}) {
    this.options = {
      videoElement: options.videoElement || null,
      canvasElement: options.canvasElement || null,
      onScan: options.onScan || null,
      onError: options.onError || null,
      formats: options.formats || ['code_128', 'code_39', 'ean_13', 'upc_a', 'qr_code'],
      beepOnScan: options.beepOnScan !== false,
      vibrateOnScan: options.vibrateOnScan !== false,
      continuous: options.continuous || false
    };

    this.stream = null;
    this.scanning = false;
    this.lastScanTime = 0;
    this.scanCooldown = 1000; // Prevent duplicate scans within 1 second
    this.scanHistory = [];
  }

  /**
   * Initialize camera and start scanning
   */
  async startScanning() {
    try {
      // Request camera permission
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      if (this.options.videoElement) {
        this.options.videoElement.srcObject = this.stream;
        await this.options.videoElement.play();
      }

      this.scanning = true;
      this.scanFrame();

      return { success: true };
    } catch (error) {
      console.error('Camera initialization failed:', error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop scanning and release camera
   */
  stopScanning() {
    this.scanning = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.options.videoElement) {
      this.options.videoElement.srcObject = null;
    }
  }

  /**
   * Scan a single frame (continuous scanning)
   */
  scanFrame() {
    if (!this.scanning) return;

    // In a real implementation, this would use a library like ZXing or QuaggaJS
    // For now, we'll simulate the scanning process
    
    if (this.options.continuous) {
      requestAnimationFrame(() => this.scanFrame());
    }
  }

  /**
   * Process manual barcode entry
   */
  processManualEntry(barcodeValue) {
    if (!barcodeValue || barcodeValue.trim() === '') {
      if (this.options.onError) {
        this.options.onError(new Error('Invalid barcode value'));
      }
      return false;
    }

    const result = this.validateBarcode(barcodeValue);
    
    if (result.valid) {
      this.handleScan({
        value: barcodeValue,
        format: result.format,
        timestamp: Date.now(),
        method: 'manual'
      });
      return true;
    } else {
      if (this.options.onError) {
        this.options.onError(new Error(result.error || 'Invalid barcode format'));
      }
      return false;
    }
  }

  /**
   * Validate barcode format
   */
  validateBarcode(value) {
    const patterns = {
      code_128: /^[\x00-\x7F]{1,48}$/,
      code_39: /^[0-9A-Z\-\.\s\$\/\+\%]{1,43}$/,
      ean_13: /^\d{13}$/,
      upc_a: /^\d{12}$/,
      qr_code: /^.{1,4296}$/ // QR codes can store up to 4296 characters
    };

    // Try to detect format
    for (const [format, pattern] of Object.entries(patterns)) {
      if (pattern.test(value)) {
        return { valid: true, format: format };
      }
    }

    // If no specific format matched, accept as generic barcode
    if (value.length >= 4 && value.length <= 50) {
      return { valid: true, format: 'generic' };
    }

    return { valid: false, error: 'Barcode format not recognized' };
  }

  /**
   * Handle successful scan
   */
  handleScan(scanData) {
    const now = Date.now();
    
    // Prevent duplicate scans
    if (now - this.lastScanTime < this.scanCooldown) {
      return;
    }

    this.lastScanTime = now;

    // Add to scan history
    this.scanHistory.unshift({
      ...scanData,
      scanId: this.generateScanId()
    });

    // Keep only last 50 scans
    if (this.scanHistory.length > 50) {
      this.scanHistory = this.scanHistory.slice(0, 50);
    }

    // Audio feedback
    if (this.options.beepOnScan) {
      this.playBeep();
    }

    // Vibration feedback
    if (this.options.vibrateOnScan && navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Call user callback
    if (this.options.onScan) {
      this.options.onScan(scanData);
    }
  }

  /**
   * Play beep sound on successful scan
   */
  playBeep() {
    // Create audio context for beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  /**
   * Generate unique scan ID
   */
  generateScanId() {
    return `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get scan history
   */
  getHistory() {
    return this.scanHistory;
  }

  /**
   * Clear scan history
   */
  clearHistory() {
    this.scanHistory = [];
  }

  /**
   * Check if camera is available
   */
  static async isCameraAvailable() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      return false;
    }
  }
}

/**
 * Barcode Scanner UI Component
 */
class BarcodeScannerUI {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      title: options.title || 'Scan Barcode',
      allowManual: options.allowManual !== false,
      showHistory: options.showHistory !== false,
      onScan: options.onScan || null,
      onClose: options.onClose || null
    };

    this.scanner = null;
    this.modal = null;
  }

  /**
   * Open scanner modal
   */
  async open() {
    this.createModal();
    await this.initializeScanner();
  }

  /**
   * Create scanner modal UI
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'scanner-modal-overlay';
    modal.innerHTML = `
      <div class="scanner-modal">
        <div class="scanner-header">
          <h2>${this.options.title}</h2>
          <button class="scanner-close-btn" id="closeScannerBtn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="scanner-content">
          <!-- Camera View -->
          <div class="scanner-camera-container">
            <video id="scannerVideo" class="scanner-video" autoplay playsinline></video>
            <canvas id="scannerCanvas" class="scanner-canvas" style="display:none;"></canvas>
            <div class="scanner-overlay">
              <div class="scanner-frame"></div>
              <p class="scanner-hint">Position barcode within the frame</p>
            </div>
          </div>

          <!-- Manual Entry -->
          ${this.options.allowManual ? `
          <div class="scanner-manual-entry">
            <div class="manual-entry-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Or enter manually</span>
            </div>
            <div class="manual-entry-group">
              <input type="text" id="manualBarcodeInput" class="manual-barcode-input" placeholder="Enter barcode number">
              <button class="btn btn-primary" id="submitManualBtn">Submit</button>
            </div>
          </div>
          ` : ''}

          <!-- Scan History -->
          ${this.options.showHistory ? `
          <div class="scanner-history">
            <h3>Recent Scans</h3>
            <div id="scanHistoryList" class="scan-history-list">
              <p class="no-scans">No scans yet</p>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;

    // Event listeners
    modal.querySelector('#closeScannerBtn').addEventListener('click', () => this.close());
    
    if (this.options.allowManual) {
      const manualInput = modal.querySelector('#manualBarcodeInput');
      const submitBtn = modal.querySelector('#submitManualBtn');
      
      submitBtn.addEventListener('click', () => {
        this.handleManualEntry(manualInput.value);
      });

      manualInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleManualEntry(manualInput.value);
        }
      });
    }

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });
  }

  /**
   * Initialize barcode scanner
   */
  async initializeScanner() {
    const video = this.modal.querySelector('#scannerVideo');
    const canvas = this.modal.querySelector('#scannerCanvas');

    this.scanner = new BarcodeScanner({
      videoElement: video,
      canvasElement: canvas,
      onScan: (scanData) => this.handleScan(scanData),
      onError: (error) => this.handleError(error),
      beepOnScan: true,
      vibrateOnScan: true
    });

    const result = await this.scanner.startScanning();
    
    if (!result.success) {
      if (window.notify) {
        notify.error('Camera access denied. Please use manual entry.');
      }
    }
  }

  /**
   * Handle successful scan
   */
  handleScan(scanData) {
    // Update scan history
    if (this.options.showHistory) {
      this.updateScanHistory(scanData);
    }

    // Clear manual input
    const manualInput = this.modal?.querySelector('#manualBarcodeInput');
    if (manualInput) {
      manualInput.value = '';
    }

    // Call user callback
    if (this.options.onScan) {
      this.options.onScan(scanData);
    }

    // Show success notification
    if (window.notify) {
      notify.success(`Scanned: ${scanData.value}`);
    }
  }

  /**
   * Handle manual barcode entry
   */
  handleManualEntry(value) {
    if (this.scanner) {
      const success = this.scanner.processManualEntry(value);
      
      if (success && this.modal) {
        const input = this.modal.querySelector('#manualBarcodeInput');
        if (input) input.value = '';
      }
    }
  }

  /**
   * Handle scanning error
   */
  handleError(error) {
    console.error('Scanner error:', error);
    if (window.notify) {
      notify.error(error.message || 'Scanning error occurred');
    }
  }

  /**
   * Update scan history display
   */
  updateScanHistory(scanData) {
    const historyList = this.modal?.querySelector('#scanHistoryList');
    if (!historyList) return;

    // Remove "no scans" message
    const noScansMsg = historyList.querySelector('.no-scans');
    if (noScansMsg) {
      noScansMsg.remove();
    }

    // Create history item
    const item = document.createElement('div');
    item.className = 'scan-history-item';
    item.innerHTML = `
      <div class="scan-value">${scanData.value}</div>
      <div class="scan-meta">
        <span class="scan-format">${scanData.format}</span>
        <span class="scan-time">${new Date(scanData.timestamp).toLocaleTimeString()}</span>
      </div>
    `;

    historyList.insertBefore(item, historyList.firstChild);

    // Keep only last 5 items
    const items = historyList.querySelectorAll('.scan-history-item');
    if (items.length > 5) {
      items[items.length - 1].remove();
    }
  }

  /**
   * Close scanner modal
   */
  close() {
    if (this.scanner) {
      this.scanner.stopScanning();
    }

    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }

    if (this.options.onClose) {
      this.options.onClose();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BarcodeScanner, BarcodeScannerUI };
}
