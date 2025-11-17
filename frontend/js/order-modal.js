/**
 * Order Creation Modal
 * Side panel with Excel upload and manual form
 */

class OrderModal {
  constructor() {
    this.modal = null;
    this.overlay = null;
    this.currentTab = 'upload';
    this.uploadedFile = null;
    this.orderData = {};
    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.onclick = () => this.close();

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'side-modal';
    this.modal.innerHTML = `
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Create New Order</h2>
          <p class="modal-subtitle">Upload Excel file or enter details manually</p>
        </div>
        <button class="modal-close" onclick="orderModal.close()">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Tabs -->
        <div class="modal-tabs">
          <button class="modal-tab active" data-tab="upload" onclick="orderModal.switchTab('upload')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload Excel
          </button>
          <button class="modal-tab" data-tab="manual" onclick="orderModal.switchTab('manual')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Manual Entry
          </button>
        </div>

        <!-- Upload Tab -->
        <div class="tab-content active" id="uploadTab">
          <!-- Upload Area -->
          <div class="upload-area" id="uploadArea">
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <div class="upload-text">Drag & Drop Excel File</div>
            <div class="upload-hint">or click to browse (XLSX, XLS files)</div>
            <button type="button" class="upload-button" onclick="document.getElementById('fileInput').click()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Browse Files
            </button>
            <input type="file" id="fileInput" class="upload-file-input" accept=".xlsx,.xls" onchange="orderModal.handleFileSelect(event)">
          </div>

          <!-- File Preview -->
          <div class="file-preview" id="filePreview">
            <div class="file-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="file-info">
              <div class="file-name" id="fileName"></div>
              <div class="file-size" id="fileSize"></div>
            </div>
            <button class="file-remove" onclick="orderModal.removeFile()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Processing Indicator -->
          <div class="processing-indicator" id="processingIndicator">
            <div class="spinner"></div>
            <span class="processing-text">Processing Excel file...</span>
          </div>

          <!-- Download Template -->
          <div style="text-align: center; margin-top: 20px;">
            <a href="#" onclick="orderModal.downloadTemplate(); return false;" style="color: var(--grey-dark); font-size: 13px; text-decoration: underline;">
              Download Excel Template
            </a>
          </div>
        </div>

        <!-- Manual Entry Tab -->
        <div class="tab-content" id="manualTab">
          <form id="orderForm">
            <!-- Order Details Section -->
            <div class="form-section">
              <h3 class="section-title">Order Information</h3>
              <div class="form-row four-col">
                <div class="form-group">
                  <label for="orderNumber">Order Number <span class="required">*</span></label>
                  <input type="text" id="orderNumber" name="orderNumber" class="form-control" placeholder="ORD-2025-XXXX" required>
                </div>
                <div class="form-group">
                  <label for="orderDate">Order Date <span class="required">*</span></label>
                  <input type="date" id="orderDate" name="orderDate" class="form-control" required>
                </div>
                <div class="form-group">
                  <label for="customerName">Customer Name <span class="required">*</span></label>
                  <input type="text" id="customerName" name="customerName" class="form-control" placeholder="Customer name" required>
                </div>
                <div class="form-group">
                  <label for="priority">Priority</label>
                  <select id="priority" name="priority" class="form-control">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Shipping Address Section -->
            <div class="form-section">
              <h3 class="section-title">Shipping Address</h3>
              <div class="form-row">
                <div class="form-group" style="grid-column: 1 / -1;">
                  <label for="address">Street Address <span class="required">*</span></label>
                  <input type="text" id="address" name="address" class="form-control" placeholder="Enter street address" required>
                </div>
              </div>
              <div class="form-row four-col">
                <div class="form-group">
                  <label for="city">City <span class="required">*</span></label>
                  <input type="text" id="city" name="city" class="form-control" placeholder="City" required>
                </div>
                <div class="form-group">
                  <label for="state">State <span class="required">*</span></label>
                  <input type="text" id="state" name="state" class="form-control" placeholder="State" required>
                </div>
                <div class="form-group">
                  <label for="zip">ZIP Code <span class="required">*</span></label>
                  <input type="text" id="zip" name="zip" class="form-control" placeholder="ZIP" required>
                </div>
                <div class="form-group">
                  <label for="country">Country <span class="required">*</span></label>
                  <select id="country" name="country" class="form-control" required>
                    <option value="US">US</option>
                    <option value="CA">CA</option>
                    <option value="MX">MX</option>
                    <option value="UK">UK</option>
                    <option value="DE">DE</option>
                    <option value="FR">FR</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Order Lines Section -->
            <div class="form-section">
              <h3 class="section-title">Order Line Items</h3>
              <div id="orderLinesContainer">
                <!-- Dynamic order lines will be added here -->
              </div>
              <button type="button" class="add-line-btn" onclick="orderModal.addOrderLine()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Line Item
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="modal-footer">
        <div class="modal-footer-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span class="required">*</span> Required fields
        </div>
        <div class="modal-footer-actions">
          <button type="button" class="btn-secondary" onclick="orderModal.close()">
            Cancel
          </button>
          <button type="button" class="btn-primary" onclick="orderModal.submit()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Create Order
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);
  }

  setupEventListeners() {
    // Drag and drop
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFile(files[0]);
      }
    });

    // Auto-generate order number
    const today = new Date().toISOString().split('T')[0];
    const orderNumber = `ORD-2025-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    document.getElementById('orderNumber').value = orderNumber;
    document.getElementById('orderDate').value = today;

    // Add first order line
    this.addOrderLine();
  }

  open() {
    this.overlay.classList.add('active');
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.reset();
  }

  reset() {
    this.uploadedFile = null;
    this.removeFile();
    document.getElementById('orderForm').reset();
    document.getElementById('orderLinesContainer').innerHTML = '';
    this.addOrderLine();
    this.switchTab('upload');
  }

  switchTab(tab) {
    this.currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.modal-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update tab content
    document.getElementById('uploadTab').classList.toggle('active', tab === 'upload');
    document.getElementById('manualTab').classList.toggle('active', tab === 'manual');
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file) {
    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    this.uploadedFile = file;

    // Show file preview
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
    document.getElementById('filePreview').classList.add('active');

    // Process file
    this.processExcelFile(file);
  }

  removeFile() {
    this.uploadedFile = null;
    document.getElementById('filePreview').classList.remove('active');
    document.getElementById('fileInput').value = '';
  }

  async processExcelFile(file) {
    // Show processing indicator
    document.getElementById('processingIndicator').classList.add('active');

    // Simulate processing (in real app, use SheetJS/xlsx library)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Sample parsed data
    const excelData = {
      orderNumber: 'ORD-2025-' + Math.floor(Math.random() * 10000),
      orderDate: new Date().toISOString().split('T')[0],
      customerName: 'Acme Corporation',
      priority: 'high',
      address: '123 Business Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'US',
      items: [
        { item: 'ITEM-001', quantity: 10, uom: 'EA', unitPrice: '99.99' },
        { item: 'ITEM-002', quantity: 5, uom: 'EA', unitPrice: '49.99' },
        { item: 'ITEM-003', quantity: 20, uom: 'EA', unitPrice: '29.99' }
      ]
    };

    // Auto-fill form
    this.autoFillForm(excelData);

    // Hide processing indicator
    document.getElementById('processingIndicator').classList.remove('active');

    // Switch to manual tab to show filled data
    this.switchTab('manual');

    // Show success notification
    this.showNotification('Excel file processed successfully! Review the auto-filled data.', 'success');
  }

  autoFillForm(data) {
    // Fill order details
    document.getElementById('orderNumber').value = data.orderNumber;
    document.getElementById('orderDate').value = data.orderDate;
    document.getElementById('customerName').value = data.customerName;
    document.getElementById('priority').value = data.priority;

    // Fill shipping address
    document.getElementById('address').value = data.address;
    document.getElementById('city').value = data.city;
    document.getElementById('state').value = data.state;
    document.getElementById('zip').value = data.zip;
    document.getElementById('country').value = data.country;

    // Clear and add order lines
    document.getElementById('orderLinesContainer').innerHTML = '';
    data.items.forEach(item => {
      this.addOrderLine(item);
    });
  }

  addOrderLine(data = null) {
    const container = document.getElementById('orderLinesContainer');
    const lineNumber = container.children.length + 1;

    const lineDiv = document.createElement('div');
    lineDiv.className = 'order-line-item';
    
    lineDiv.innerHTML = `
      <div class="line-item-number">${lineNumber}</div>
      <div class="line-item-content">
        <div class="form-row four-col">
          <div class="form-group">
            <label>Item ID <span class="required">*</span></label>
            <input type="text" class="form-control" value="${data?.item || ''}" placeholder="ITEM-001" required>
          </div>
          <div class="form-group">
            <label>Quantity <span class="required">*</span></label>
            <input type="number" class="form-control" value="${data?.quantity || ''}" min="1" placeholder="0" required>
          </div>
          <div class="form-group">
            <label>UOM</label>
            <select class="form-control">
              <option value="EA" ${data?.uom === 'EA' ? 'selected' : ''}>EA</option>
              <option value="CS" ${data?.uom === 'CS' ? 'selected' : ''}>CS</option>
              <option value="PL" ${data?.uom === 'PL' ? 'selected' : ''}>PL</option>
              <option value="BX" ${data?.uom === 'BX' ? 'selected' : ''}>BX</option>
            </select>
          </div>
          <div class="form-group">
            <label>Unit Price</label>
            <input type="number" class="form-control" value="${data?.unitPrice || ''}" step="0.01" min="0" placeholder="0.00">
          </div>
        </div>
      </div>
      <button type="button" class="remove-line-btn" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(lineDiv);
  }

  submit() {
    const form = document.getElementById('orderForm');
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Collect form data
    const formData = new FormData(form);
    const orderData = Object.fromEntries(formData);

    // Show success
    this.showNotification('Order created successfully!', 'success');

    // Close modal
    setTimeout(() => {
      this.close();
      // Reload orders table or add new row
    }, 1000);
  }

  downloadTemplate() {
    // In real app, generate and download Excel template
    alert('Excel template download would start here.\n\nTemplate includes:\n- Order Number\n- Customer Name\n- Ship To Address\n- Item ID, Quantity, UOM columns');
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">&times;</button>
    `;

    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }

    container.appendChild(notification);

    setTimeout(() => notification.remove(), 5000);
  }
}

// Initialize
let orderModal;
document.addEventListener('DOMContentLoaded', () => {
  orderModal = new OrderModal();
});
