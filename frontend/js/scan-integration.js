/**
 * Scan Integration Module - Phase 10A
 * Integrates barcode scanner and QR generator with existing modules
 * Provides scan-to-action workflows
 */

class ScanIntegration {
  constructor() {
    this.scannerUI = null;
    this.qrGeneratorUI = null;
    this.currentModule = null;
    this.scanHandlers = {};
  }

  /**
   * Initialize scan integration for a specific module
   */
  init(moduleName) {
    this.currentModule = moduleName;
    this.setupScanHandlers();
    this.addFloatingButtons();
  }

  /**
   * Setup scan handlers for different modules
   */
  setupScanHandlers() {
    this.scanHandlers = {
      receiving: (scanData) => this.handleReceivingScan(scanData),
      picking: (scanData) => this.handlePickingScan(scanData),
      packing: (scanData) => this.handlePackingScan(scanData),
      cycleCount: (scanData) => this.handleCycleCountScan(scanData),
      inventory: (scanData) => this.handleInventoryScan(scanData),
      lpn: (scanData) => this.handleLPNScan(scanData),
      location: (scanData) => this.handleLocationScan(scanData)
    };
  }

  /**
   * Add floating scanner/QR buttons to page
   */
  addFloatingButtons() {
    // Check which buttons to show based on module
    const showScanner = ['receiving', 'picking', 'packing', 'cycleCount', 'inventory', 'lpn', 'location'].includes(this.currentModule);
    const showQR = ['inventory', 'lpn', 'location'].includes(this.currentModule);

    if (showScanner) {
      this.addScannerButton();
    }

    if (showQR) {
      this.addQRButton();
    }
  }

  /**
   * Add scanner button
   */
  addScannerButton() {
    const button = document.createElement('button');
    button.className = 'scanner-trigger-btn';
    button.id = 'floatingScannerBtn';
    button.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
        <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
        <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
        <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
        <line x1="10" y1="12" x2="14" y2="12"></line>
      </svg>
    `;
    button.title = 'Scan Barcode';
    
    button.addEventListener('click', () => this.openScanner());
    document.body.appendChild(button);
  }

  /**
   * Add QR generator button
   */
  addQRButton() {
    const button = document.createElement('button');
    button.className = 'qr-trigger-btn';
    button.id = 'floatingQRBtn';
    button.style.bottom = '96px'; // Stack above scanner button
    button.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    `;
    button.title = 'Generate QR Code';
    
    button.addEventListener('click', () => this.openQRGenerator());
    document.body.appendChild(button);
  }

  /**
   * Open scanner modal
   */
  openScanner() {
    if (!window.BarcodeScannerUI) {
      console.error('BarcodeScannerUI not loaded');
      if (window.notify) notify.error('Scanner not available');
      return;
    }

    this.scannerUI = new BarcodeScannerUI(document.body, {
      title: `Scan Barcode - ${this.getModuleTitle()}`,
      allowManual: true,
      showHistory: true,
      onScan: (scanData) => this.handleScan(scanData),
      onClose: () => this.scannerUI = null
    });

    this.scannerUI.open();
  }

  /**
   * Open QR generator modal
   */
  openQRGenerator() {
    if (!window.QRCodeGeneratorUI) {
      console.error('QRCodeGeneratorUI not loaded');
      if (window.notify) notify.error('QR Generator not available');
      return;
    }

    const qrType = this.getQRType();
    this.qrGeneratorUI = new QRCodeGeneratorUI();
    this.qrGeneratorUI.open(qrType);
  }

  /**
   * Get module title
   */
  getModuleTitle() {
    const titles = {
      receiving: 'Receiving',
      picking: 'Picking',
      packing: 'Packing',
      cycleCount: 'Cycle Count',
      inventory: 'Inventory',
      lpn: 'LPN Management',
      location: 'Location'
    };
    return titles[this.currentModule] || 'Warehouse';
  }

  /**
   * Get QR type based on module
   */
  getQRType() {
    const types = {
      inventory: 'ITEM',
      lpn: 'LPN',
      location: 'LOCATION'
    };
    return types[this.currentModule] || 'ITEM';
  }

  /**
   * Handle scan from any module
   */
  handleScan(scanData) {
    const handler = this.scanHandlers[this.currentModule];
    
    if (handler) {
      handler(scanData);
    } else {
      console.warn('No scan handler for module:', this.currentModule);
      if (window.notify) {
        notify.info(`Scanned: ${scanData.value}`);
      }
    }
  }

  /**
   * Handle receiving module scan
   */
  handleReceivingScan(scanData) {
    try {
      // Try to parse as JSON (QR code data)
      const data = JSON.parse(scanData.value);
      
      if (data.type === 'ITEM') {
        this.populateReceivingForm(data);
      } else {
        // Treat as PO/ASN number
        this.lookupPurchaseOrder(scanData.value);
      }
    } catch (e) {
      // Not JSON, treat as barcode
      this.lookupPurchaseOrder(scanData.value);
    }
  }

  /**
   * Populate receiving form with scanned data
   */
  populateReceivingForm(data) {
    const itemField = document.getElementById('itemNumber') || document.querySelector('[name="itemNumber"]');
    const lotField = document.getElementById('lotNumber') || document.querySelector('[name="lotNumber"]');
    
    if (itemField) {
      itemField.value = data.itemNumber || '';
      itemField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (lotField && data.lotNumber) {
      lotField.value = data.lotNumber;
      lotField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (window.notify) {
      notify.success(`Item ${data.itemNumber} scanned successfully!`);
    }
  }

  /**
   * Lookup purchase order
   */
  lookupPurchaseOrder(poNumber) {
    if (window.notify) {
      const hideLoader = notify.loading(`Looking up PO ${poNumber}...`);
      
      // Simulate API call
      setTimeout(() => {
        hideLoader();
        
        // Mock PO data
        const mockPO = {
          poNumber: poNumber,
          supplier: 'ACME Suppliers Inc.',
          items: [
            { itemNumber: 'ITEM-001', description: 'Widget A', qty: 100 },
            { itemNumber: 'ITEM-002', description: 'Widget B', qty: 50 }
          ]
        };

        // Populate form
        const poField = document.getElementById('poNumber') || document.querySelector('[name="poNumber"]');
        if (poField) {
          poField.value = poNumber;
        }

        notify.success(`PO ${poNumber} found - ${mockPO.items.length} items`);
      }, 1000);
    }
  }

  /**
   * Handle picking module scan
   */
  handlePickingScan(scanData) {
    try {
      const data = JSON.parse(scanData.value);
      
      if (data.type === 'ITEM') {
        this.validatePickItem(data);
      } else if (data.type === 'ORDER') {
        this.loadPickOrder(data);
      } else if (data.type === 'LOCATION') {
        this.validatePickLocation(data);
      }
    } catch (e) {
      // Treat as item barcode or order number
      this.validatePickItem({ itemNumber: scanData.value });
    }
  }

  /**
   * Validate pick item
   */
  validatePickItem(data) {
    // Check if item is in current pick list
    const pickList = document.querySelectorAll('.pick-item');
    let found = false;

    pickList.forEach(item => {
      const itemNum = item.dataset.itemNumber || item.querySelector('.item-number')?.textContent;
      if (itemNum === data.itemNumber) {
        found = true;
        item.classList.add('highlighted');
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-fill quantity if field exists
        const qtyField = item.querySelector('input[type="number"]');
        if (qtyField) {
          qtyField.focus();
        }
      }
    });

    if (found) {
      if (window.notify) {
        notify.success(`Item ${data.itemNumber} found in pick list!`);
      }
    } else {
      if (window.notify) {
        notify.error(`Item ${data.itemNumber} not in current pick list`);
      }
    }
  }

  /**
   * Load pick order
   */
  loadPickOrder(data) {
    if (window.notify) {
      notify.success(`Loading order ${data.orderNumber}...`);
    }

    // Populate order field
    const orderField = document.getElementById('orderNumber') || document.querySelector('[name="orderNumber"]');
    if (orderField) {
      orderField.value = data.orderNumber;
      orderField.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Validate pick location
   */
  validatePickLocation(data) {
    const expectedLoc = document.getElementById('expectedLocation')?.textContent;
    
    if (expectedLoc === data.locationCode) {
      if (window.notify) {
        notify.success(`Location ${data.locationCode} confirmed!`);
      }
    } else {
      if (window.notify) {
        notify.error(`Wrong location! Expected: ${expectedLoc}, Scanned: ${data.locationCode}`);
      }
    }
  }

  /**
   * Handle packing module scan
   */
  handlePackingScan(scanData) {
    try {
      const data = JSON.parse(scanData.value);
      
      if (data.type === 'ITEM') {
        this.addItemToPack(data);
      } else if (data.type === 'LPN') {
        this.scanLPNToPack(data);
      }
    } catch (e) {
      this.addItemToPack({ itemNumber: scanData.value });
    }
  }

  /**
   * Add item to packing list
   */
  addItemToPack(data) {
    const itemField = document.getElementById('scannedItem');
    if (itemField) {
      itemField.value = data.itemNumber;
      
      // Trigger add button if exists
      const addBtn = document.getElementById('addItemBtn');
      if (addBtn) {
        addBtn.click();
      }
    }

    if (window.notify) {
      notify.success(`Item ${data.itemNumber} added to pack list`);
    }
  }

  /**
   * Scan LPN to pack
   */
  scanLPNToPack(data) {
    if (window.notify) {
      notify.success(`LPN ${data.lpnNumber} scanned - ${data.quantity} units`);
    }
  }

  /**
   * Handle cycle count module scan
   */
  handleCycleCountScan(scanData) {
    try {
      const data = JSON.parse(scanData.value);
      
      if (data.type === 'LOCATION') {
        this.startCycleCountAtLocation(data);
      } else if (data.type === 'ITEM') {
        this.recordCycleCountItem(data);
      }
    } catch (e) {
      // Treat as location or item barcode
      this.startCycleCountAtLocation({ locationCode: scanData.value });
    }
  }

  /**
   * Start cycle count at location
   */
  startCycleCountAtLocation(data) {
    const locationField = document.getElementById('countLocation') || document.querySelector('[name="location"]');
    
    if (locationField) {
      locationField.value = data.locationCode;
      locationField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (window.notify) {
      notify.success(`Starting count at location ${data.locationCode}`);
    }

    // Simulate loading items at this location
    setTimeout(() => {
      if (window.notify) {
        notify.info(`3 items found at ${data.locationCode}`);
      }
    }, 500);
  }

  /**
   * Record cycle count item
   */
  recordCycleCountItem(data) {
    const itemField = document.getElementById('countItem');
    
    if (itemField) {
      itemField.value = data.itemNumber;
      
      // Focus on quantity field
      const qtyField = document.getElementById('countQuantity');
      if (qtyField) {
        qtyField.focus();
      }
    }

    if (window.notify) {
      notify.success(`Item ${data.itemNumber} ready to count`);
    }
  }

  /**
   * Handle inventory module scan
   */
  handleInventoryScan(scanData) {
    try {
      const data = JSON.parse(scanData.value);
      
      if (data.type === 'ITEM') {
        this.searchInventoryItem(data.itemNumber);
      } else if (data.type === 'LPN') {
        this.searchInventoryLPN(data.lpnNumber);
      }
    } catch (e) {
      this.searchInventoryItem(scanData.value);
    }
  }

  /**
   * Search inventory by item
   */
  searchInventoryItem(itemNumber) {
    const searchField = document.getElementById('searchInput') || document.querySelector('input[type="search"]');
    
    if (searchField) {
      searchField.value = itemNumber;
      searchField.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Trigger search if function exists
      if (window.performSearch) {
        window.performSearch();
      }
    }

    if (window.notify) {
      notify.success(`Searching inventory for ${itemNumber}`);
    }
  }

  /**
   * Search inventory by LPN
   */
  searchInventoryLPN(lpnNumber) {
    this.searchInventoryItem(lpnNumber);
  }

  /**
   * Handle LPN module scan
   */
  handleLPNScan(scanData) {
    try {
      const data = JSON.parse(scanData.value);
      
      if (data.type === 'LPN') {
        this.loadLPNDetails(data);
      }
    } catch (e) {
      this.loadLPNDetails({ lpnNumber: scanData.value });
    }
  }

  /**
   * Load LPN details
   */
  loadLPNDetails(data) {
    const searchField = document.getElementById('lpnSearch') || document.getElementById('searchInput');
    
    if (searchField) {
      searchField.value = data.lpnNumber;
      searchField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (window.notify) {
      notify.success(`Loading LPN ${data.lpnNumber}...`);
    }
  }

  /**
   * Handle location module scan
   */
  handleLocationScan(scanData) {
    try {
      const data = JSON.parse(scanData.value);
      
      if (data.type === 'LOCATION') {
        this.loadLocationDetails(data);
      }
    } catch (e) {
      this.loadLocationDetails({ locationCode: scanData.value });
    }
  }

  /**
   * Load location details
   */
  loadLocationDetails(data) {
    const searchField = document.getElementById('locationSearch') || document.getElementById('searchInput');
    
    if (searchField) {
      searchField.value = data.locationCode;
      searchField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (window.notify) {
      notify.success(`Loading location ${data.locationCode}...`);
    }
  }

  /**
   * Cleanup - remove floating buttons
   */
  cleanup() {
    const scannerBtn = document.getElementById('floatingScannerBtn');
    const qrBtn = document.getElementById('floatingQRBtn');
    
    if (scannerBtn) scannerBtn.remove();
    if (qrBtn) qrBtn.remove();
  }
}

// Initialize scan integration based on current page
function initializeScanIntegration() {
  // Detect current module from page
  const path = window.location.pathname;
  let module = null;

  if (path.includes('receiving') || path.includes('asn-receipt')) {
    module = 'receiving';
  } else if (path.includes('picking')) {
    module = 'picking';
  } else if (path.includes('packing')) {
    module = 'packing';
  } else if (path.includes('cycle-count')) {
    module = 'cycleCount';
  } else if (path.includes('inventory')) {
    module = 'inventory';
  } else if (path.includes('lpn')) {
    module = 'lpn';
  } else if (path.includes('location')) {
    module = 'location';
  }

  if (module) {
    const integration = new ScanIntegration();
    integration.init(module);
    
    // Make available globally
    window.scanIntegration = integration;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScanIntegration);
} else {
  initializeScanIntegration();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScanIntegration;
}
