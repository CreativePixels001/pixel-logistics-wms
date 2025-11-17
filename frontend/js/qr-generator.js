/**
 * QR Code Generator Module - Phase 10A
 * Generate QR codes for items, LPNs, locations
 * Supports bulk generation and printing
 */

class QRCodeGenerator {
  constructor(options = {}) {
    this.options = {
      size: options.size || 200,
      errorCorrection: options.errorCorrection || 'M', // L, M, Q, H
      margin: options.margin || 4,
      darkColor: options.darkColor || '#000000',
      lightColor: options.lightColor || '#FFFFFF'
    };
  }

  /**
   * Generate QR code for an item
   */
  generateItemQR(itemData) {
    const qrData = {
      type: 'ITEM',
      itemNumber: itemData.itemNumber || '',
      itemDescription: itemData.description || '',
      uom: itemData.uom || 'EA',
      lotNumber: itemData.lotNumber || '',
      timestamp: Date.now()
    };

    return this.generateQRCode(JSON.stringify(qrData));
  }

  /**
   * Generate QR code for LPN (License Plate Number)
   */
  generateLPNQR(lpnData) {
    const qrData = {
      type: 'LPN',
      lpnNumber: lpnData.lpnNumber || '',
      itemNumber: lpnData.itemNumber || '',
      quantity: lpnData.quantity || 0,
      lotNumber: lpnData.lotNumber || '',
      location: lpnData.location || '',
      timestamp: Date.now()
    };

    return this.generateQRCode(JSON.stringify(qrData));
  }

  /**
   * Generate QR code for location
   */
  generateLocationQR(locationData) {
    const qrData = {
      type: 'LOCATION',
      locationCode: locationData.locationCode || '',
      zone: locationData.zone || '',
      aisle: locationData.aisle || '',
      bay: locationData.bay || '',
      level: locationData.level || '',
      locationType: locationData.locationType || 'STORAGE',
      timestamp: Date.now()
    };

    return this.generateQRCode(JSON.stringify(qrData));
  }

  /**
   * Generate QR code for order/shipment
   */
  generateOrderQR(orderData) {
    const qrData = {
      type: 'ORDER',
      orderNumber: orderData.orderNumber || '',
      customerName: orderData.customerName || '',
      shipToAddress: orderData.shipToAddress || '',
      carrier: orderData.carrier || '',
      trackingNumber: orderData.trackingNumber || '',
      timestamp: Date.now()
    };

    return this.generateQRCode(JSON.stringify(qrData));
  }

  /**
   * Generate generic QR code from data
   */
  generateQRCode(data) {
    // In production, this would use a library like qrcode.js or kjua
    // For now, we'll return a placeholder that can be replaced with actual QR generation
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = this.options.size;
    canvas.height = this.options.size;
    
    // Draw placeholder (checkered pattern simulating QR code)
    ctx.fillStyle = this.options.lightColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = this.options.darkColor;
    const moduleSize = this.options.size / 25;
    
    // Create a simple pattern (in production, use actual QR library)
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // Pseudo-random pattern based on data
        if ((i + j + data.length) % 3 === 0) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    return {
      canvas: canvas,
      dataURL: canvas.toDataURL('image/png'),
      data: data,
      timestamp: Date.now()
    };
  }

  /**
   * Generate bulk QR codes
   */
  generateBulk(items, type = 'ITEM') {
    const results = [];
    
    items.forEach((item, index) => {
      let qrCode;
      
      switch(type) {
        case 'ITEM':
          qrCode = this.generateItemQR(item);
          break;
        case 'LPN':
          qrCode = this.generateLPNQR(item);
          break;
        case 'LOCATION':
          qrCode = this.generateLocationQR(item);
          break;
        case 'ORDER':
          qrCode = this.generateOrderQR(item);
          break;
        default:
          qrCode = this.generateQRCode(JSON.stringify(item));
      }
      
      results.push({
        ...qrCode,
        index: index,
        sourceData: item
      });
    });
    
    return results;
  }

  /**
   * Create printable QR code label
   */
  createPrintableLabel(qrData, labelInfo) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Label dimensions (4" x 6" at 203 DPI = 812 x 1218 pixels)
    const width = 812;
    const height = 1218;
    canvas.width = width;
    canvas.height = height;
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Draw QR code
    const qrSize = 400;
    const qrX = (width - qrSize) / 2;
    const qrY = 100;
    
    if (qrData.canvas) {
      ctx.drawImage(qrData.canvas, qrX, qrY, qrSize, qrSize);
    }
    
    // Draw label text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    // Title
    ctx.fillText(labelInfo.title || 'QR CODE LABEL', width / 2, 70);
    
    // Primary text (below QR)
    ctx.font = 'bold 40px Arial';
    ctx.fillText(labelInfo.primaryText || '', width / 2, qrY + qrSize + 60);
    
    // Secondary text
    ctx.font = '32px Arial';
    ctx.fillText(labelInfo.secondaryText || '', width / 2, qrY + qrSize + 110);
    
    // Additional info
    if (labelInfo.additionalInfo) {
      ctx.font = '28px Arial';
      let yOffset = qrY + qrSize + 160;
      
      labelInfo.additionalInfo.forEach(info => {
        ctx.fillText(info, width / 2, yOffset);
        yOffset += 40;
      });
    }
    
    // Footer
    ctx.font = '24px Arial';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, width / 2, height - 40);
    
    return {
      canvas: canvas,
      dataURL: canvas.toDataURL('image/png'),
      width: width,
      height: height
    };
  }

  /**
   * Download QR code as image
   */
  download(qrCode, filename = 'qr-code.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = qrCode.dataURL;
    link.click();
  }

  /**
   * Print QR code label
   */
  print(labelCanvas) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Label</title>
          <style>
            body { margin: 0; padding: 0; }
            img { width: 100%; height: auto; }
            @media print {
              body { margin: 0; }
              img { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <img src="${labelCanvas.dataURL}" alt="QR Code Label">
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}

/**
 * QR Code Generator UI Component
 */
class QRCodeGeneratorUI {
  constructor() {
    this.generator = new QRCodeGenerator();
    this.modal = null;
  }

  /**
   * Open QR generator modal
   */
  open(type = 'ITEM', data = null) {
    this.createModal(type, data);
  }

  /**
   * Create QR generator modal UI
   */
  createModal(type, prefillData) {
    const modal = document.createElement('div');
    modal.className = 'qr-modal-overlay';
    modal.innerHTML = `
      <div class="qr-modal">
        <div class="qr-modal-header">
          <h2>Generate QR Code - ${type}</h2>
          <button class="qr-close-btn" id="closeQRBtn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="qr-modal-content">
          <div class="qr-form-section">
            <h3>Enter Information</h3>
            ${this.getFormFields(type, prefillData)}
            
            <div class="qr-actions">
              <button class="btn btn-primary" id="generateQRBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Generate QR Code
              </button>
            </div>
          </div>

          <div class="qr-preview-section" id="qrPreviewSection" style="display: none;">
            <h3>QR Code Preview</h3>
            <div class="qr-preview-container" id="qrPreviewContainer"></div>
            
            <div class="qr-download-actions">
              <button class="btn btn-secondary" id="downloadQRBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </button>
              <button class="btn btn-secondary" id="printQRBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print Label
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;

    // Event listeners
    modal.querySelector('#closeQRBtn').addEventListener('click', () => this.close());
    modal.querySelector('#generateQRBtn').addEventListener('click', () => this.generate(type));
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });
  }

  /**
   * Get form fields based on type
   */
  getFormFields(type, prefillData = {}) {
    const fields = {
      ITEM: `
        <div class="form-group">
          <label>Item Number *</label>
          <input type="text" id="itemNumber" class="form-control" value="${prefillData.itemNumber || ''}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="description" class="form-control" value="${prefillData.description || ''}">
        </div>
        <div class="form-group">
          <label>UOM</label>
          <select id="uom" class="form-control">
            <option value="EA">EA - Each</option>
            <option value="CS">CS - Case</option>
            <option value="PL">PL - Pallet</option>
          </select>
        </div>
        <div class="form-group">
          <label>Lot Number</label>
          <input type="text" id="lotNumber" class="form-control" value="${prefillData.lotNumber || ''}">
        </div>
      `,
      LPN: `
        <div class="form-group">
          <label>LPN Number *</label>
          <input type="text" id="lpnNumber" class="form-control" value="${prefillData.lpnNumber || ''}" required>
        </div>
        <div class="form-group">
          <label>Item Number</label>
          <input type="text" id="itemNumber" class="form-control" value="${prefillData.itemNumber || ''}">
        </div>
        <div class="form-group">
          <label>Quantity</label>
          <input type="number" id="quantity" class="form-control" value="${prefillData.quantity || ''}">
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" id="location" class="form-control" value="${prefillData.location || ''}">
        </div>
      `,
      LOCATION: `
        <div class="form-group">
          <label>Location Code *</label>
          <input type="text" id="locationCode" class="form-control" value="${prefillData.locationCode || ''}" required>
        </div>
        <div class="form-group">
          <label>Zone</label>
          <input type="text" id="zone" class="form-control" value="${prefillData.zone || ''}">
        </div>
        <div class="form-group">
          <label>Aisle</label>
          <input type="text" id="aisle" class="form-control" value="${prefillData.aisle || ''}">
        </div>
        <div class="form-group">
          <label>Location Type</label>
          <select id="locationType" class="form-control">
            <option value="STORAGE">Storage</option>
            <option value="PICK">Pick Face</option>
            <option value="STAGE">Staging</option>
            <option value="DOCK">Dock Door</option>
          </select>
        </div>
      `
    };

    return fields[type] || '';
  }

  /**
   * Generate QR code from form data
   */
  generate(type) {
    const formData = this.getFormData(type);
    
    if (!formData) {
      if (window.notify) {
        notify.error('Please fill in all required fields');
      }
      return;
    }

    let qrCode;
    let labelInfo = {};

    switch(type) {
      case 'ITEM':
        qrCode = this.generator.generateItemQR(formData);
        labelInfo = {
          title: 'ITEM QR CODE',
          primaryText: formData.itemNumber,
          secondaryText: formData.description,
          additionalInfo: [
            `UOM: ${formData.uom}`,
            formData.lotNumber ? `Lot: ${formData.lotNumber}` : ''
          ].filter(Boolean)
        };
        break;
      
      case 'LPN':
        qrCode = this.generator.generateLPNQR(formData);
        labelInfo = {
          title: 'LPN QR CODE',
          primaryText: formData.lpnNumber,
          secondaryText: formData.itemNumber,
          additionalInfo: [
            `Qty: ${formData.quantity}`,
            formData.location ? `Loc: ${formData.location}` : ''
          ].filter(Boolean)
        };
        break;
      
      case 'LOCATION':
        qrCode = this.generator.generateLocationQR(formData);
        labelInfo = {
          title: 'LOCATION QR CODE',
          primaryText: formData.locationCode,
          secondaryText: `${formData.zone} - ${formData.aisle}`,
          additionalInfo: [
            `Type: ${formData.locationType}`
          ]
        };
        break;
    }

    // Store current QR code and label info
    this.currentQR = qrCode;
    this.currentLabel = this.generator.createPrintableLabel(qrCode, labelInfo);

    // Display preview
    this.displayPreview(qrCode);

    // Setup download and print handlers
    const downloadBtn = this.modal.querySelector('#downloadQRBtn');
    const printBtn = this.modal.querySelector('#printQRBtn');

    downloadBtn.onclick = () => this.generator.download(this.currentLabel, `${type.toLowerCase()}-qr-label.png`);
    printBtn.onclick = () => this.generator.print(this.currentLabel);
  }

  /**
   * Get form data based on type
   */
  getFormData(type) {
    const getData = (ids) => {
      const data = {};
      for (const id of ids) {
        const element = this.modal.querySelector(`#${id}`);
        if (element) {
          data[id] = element.value;
          if (element.required && !element.value) {
            return null;
          }
        }
      }
      return data;
    };

    const fieldMap = {
      ITEM: ['itemNumber', 'description', 'uom', 'lotNumber'],
      LPN: ['lpnNumber', 'itemNumber', 'quantity', 'location'],
      LOCATION: ['locationCode', 'zone', 'aisle', 'locationType']
    };

    return getData(fieldMap[type] || []);
  }

  /**
   * Display QR code preview
   */
  displayPreview(qrCode) {
    const previewSection = this.modal.querySelector('#qrPreviewSection');
    const previewContainer = this.modal.querySelector('#qrPreviewContainer');

    previewContainer.innerHTML = `
      <img src="${qrCode.dataURL}" alt="QR Code" class="qr-preview-image">
    `;

    previewSection.style.display = 'block';

    if (window.notify) {
      notify.success('QR Code generated successfully!');
    }
  }

  /**
   * Close modal
   */
  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QRCodeGenerator, QRCodeGeneratorUI };
}
