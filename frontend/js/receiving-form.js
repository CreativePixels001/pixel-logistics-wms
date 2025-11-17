/**
 * Receiving Form - Phase 6 Interactive Forms
 * Handles receipt creation, ASN confirmation, and put-away operations
 */

class ReceivingForm {
  constructor() {
    this.receiptLines = [];
    this.currentLineId = 1;
    this.autoSaveInterval = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDraft();
    this.startAutoSave();
  }

  setupEventListeners() {
    // Document type change
    const docTypeSelect = document.getElementById('documentType');
    if (docTypeSelect) {
      docTypeSelect.addEventListener('change', (e) => this.handleDocumentTypeChange(e.target.value));
    }

    // Receipt routing change
    const routingSelect = document.getElementById('receiptRouting');
    if (routingSelect) {
      routingSelect.addEventListener('change', (e) => this.handleRoutingChange(e.target.value));
    }

    // Add line button
    const addLineBtn = document.getElementById('addReceiptLine');
    if (addLineBtn) {
      addLineBtn.addEventListener('click', () => this.addReceiptLine());
    }

    // Form submission
    const form = document.getElementById('receivingForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Item lookup
    document.addEventListener('click', (e) => {
      if (e.target.closest('.item-lookup-btn')) {
        const lineId = e.target.closest('.receipt-line-item').dataset.lineId;
        this.openItemLookup(lineId);
      }
    });
  }

  handleDocumentTypeChange(docType) {
    const docNumberGroup = document.getElementById('documentNumberGroup');
    const docNumberLabel = document.getElementById('documentNumberLabel');
    const asnGroup = document.getElementById('asnGroup');
    
    if (docNumberLabel) {
      switch(docType) {
        case 'PO':
          docNumberLabel.textContent = 'PO Number';
          break;
        case 'RMA':
          docNumberLabel.textContent = 'RMA Number';
          break;
        case 'TRANSFER':
          docNumberLabel.textContent = 'Transfer Order Number';
          break;
        case 'ASN':
          docNumberLabel.textContent = 'ASN Number';
          if (asnGroup) asnGroup.style.display = 'block';
          break;
        default:
          docNumberLabel.textContent = 'Document Number';
      }
    }

    if (docType !== 'ASN' && asnGroup) {
      asnGroup.style.display = 'none';
    }
  }

  handleRoutingChange(routing) {
    const inspectionGroup = document.getElementById('inspectionGroup');
    const putawayGroup = document.getElementById('putawayGroup');
    
    switch(routing) {
      case 'STANDARD':
        if (inspectionGroup) inspectionGroup.style.display = 'none';
        if (putawayGroup) putawayGroup.style.display = 'block';
        break;
      case 'INSPECT':
        if (inspectionGroup) inspectionGroup.style.display = 'block';
        if (putawayGroup) putawayGroup.style.display = 'block';
        break;
      case 'EXPRESS':
        if (inspectionGroup) inspectionGroup.style.display = 'none';
        if (putawayGroup) putawayGroup.style.display = 'none';
        break;
      case 'DIRECT':
        if (inspectionGroup) inspectionGroup.style.display = 'none';
        if (putawayGroup) putawayGroup.style.display = 'block';
        break;
    }
  }

  addReceiptLine() {
    const lineId = this.currentLineId++;
    const line = {
      id: lineId,
      item: '',
      description: '',
      quantity: 0,
      uom: 'EA',
      lot: '',
      serial: '',
      location: ''
    };
    
    this.receiptLines.push(line);
    this.renderReceiptLine(line);
  }

  renderReceiptLine(line) {
    const container = document.getElementById('receiptLinesContainer');
    if (!container) return;

    const lineHtml = `
      <div class="receipt-line-item" data-line-id="${line.id}">
        <div class="grid grid-cols-6" style="gap: var(--spacing-sm); align-items: end;">
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Item Number</label>
            <div style="display: flex; gap: var(--spacing-xs);">
              <input type="text" class="form-input" id="item_${line.id}" 
                     placeholder="Enter or scan item" required
                     value="${line.item}">
              <button type="button" class="btn btn-secondary item-lookup-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Description</label>
            <input type="text" class="form-input" id="description_${line.id}" 
                   value="${line.description}" readonly>
          </div>
          
          <div class="form-group">
            <label class="form-label">Quantity</label>
            <input type="number" class="form-input" id="quantity_${line.id}" 
                   min="0" step="1" required value="${line.quantity}">
          </div>
          
          <div class="form-group">
            <label class="form-label">UOM</label>
            <select class="form-input" id="uom_${line.id}">
              <option value="EA" ${line.uom === 'EA' ? 'selected' : ''}>Each</option>
              <option value="CS" ${line.uom === 'CS' ? 'selected' : ''}>Case</option>
              <option value="PLT" ${line.uom === 'PLT' ? 'selected' : ''}>Pallet</option>
              <option value="KG" ${line.uom === 'KG' ? 'selected' : ''}>Kilogram</option>
              <option value="LB" ${line.uom === 'LB' ? 'selected' : ''}>Pound</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-6" style="gap: var(--spacing-sm); margin-top: var(--spacing-sm);">
          <div class="form-group">
            <label class="form-label">Lot Number</label>
            <input type="text" class="form-input" id="lot_${line.id}" 
                   placeholder="Optional" value="${line.lot}">
          </div>
          
          <div class="form-group">
            <label class="form-label">Serial Number</label>
            <input type="text" class="form-input" id="serial_${line.id}" 
                   placeholder="Optional" value="${line.serial}">
          </div>
          
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Suggested Location</label>
            <input type="text" class="form-input" id="location_${line.id}" 
                   value="${line.location}" readonly>
          </div>
          
          <div class="form-group" style="grid-column: span 2; display: flex; align-items: end; gap: var(--spacing-xs);">
            <button type="button" class="btn btn-outline" style="flex: 1;" 
                    onclick="receivingForm.generateLPN(${line.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              Generate LPN
            </button>
            <button type="button" class="btn btn-outline btn-danger" 
                    onclick="receivingForm.removeLine(${line.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', lineHtml);
  }

  removeLine(lineId) {
    this.receiptLines = this.receiptLines.filter(line => line.id !== lineId);
    const lineElement = document.querySelector(`[data-line-id="${lineId}"]`);
    if (lineElement) {
      lineElement.remove();
    }
    this.showNotification('Line removed', 'info');
  }

  generateLPN(lineId) {
    const lpn = 'LPN-' + new Date().getTime();
    this.showNotification(`Generated LPN: ${lpn}`, 'success');
    // Update line with LPN
    const line = this.receiptLines.find(l => l.id === lineId);
    if (line) {
      line.lpn = lpn;
    }
  }

  openItemLookup(lineId) {
    // Mock item lookup - in real system, this would open a modal
    const items = [
      { number: 'ITM-001', description: 'Widget A - Blue', uom: 'EA' },
      { number: 'ITM-002', description: 'Widget B - Red', uom: 'CS' },
      { number: 'ITM-003', description: 'Gadget C - Green', uom: 'PLT' }
    ];
    
    const selected = items[Math.floor(Math.random() * items.length)];
    
    document.getElementById(`item_${lineId}`).value = selected.number;
    document.getElementById(`description_${lineId}`).value = selected.description;
    document.getElementById(`uom_${lineId}`).value = selected.uom;
    
    this.showNotification(`Selected: ${selected.number}`, 'success');
  }

  validateForm() {
    const form = document.getElementById('receivingForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    if (this.receiptLines.length === 0) {
      this.showNotification('Please add at least one receipt line', 'error');
      return false;
    }

    return true;
  }

  getFormData() {
    return {
      documentType: document.getElementById('documentType')?.value,
      documentNumber: document.getElementById('documentNumber')?.value,
      receiptRouting: document.getElementById('receiptRouting')?.value,
      vendor: document.getElementById('vendor')?.value,
      expectedDate: document.getElementById('expectedDate')?.value,
      receiptDate: document.getElementById('receiptDate')?.value,
      subinventory: document.getElementById('subinventory')?.value,
      carrier: document.getElementById('carrier')?.value,
      trackingNumber: document.getElementById('trackingNumber')?.value,
      notes: document.getElementById('notes')?.value,
      lines: this.receiptLines.map(line => ({
        ...line,
        quantity: document.getElementById(`quantity_${line.id}`)?.value,
        lot: document.getElementById(`lot_${line.id}`)?.value,
        serial: document.getElementById(`serial_${line.id}`)?.value
      }))
    };
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const formData = this.getFormData();
    
    try {
      // Show loading state
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate receipt number
      const receiptNumber = 'RCV-' + new Date().getTime();
      
      this.showNotification(`Receipt ${receiptNumber} created successfully!`, 'success');
      
      // Clear form and draft
      this.clearDraft();
      this.receiptLines = [];
      this.currentLineId = 1;
      document.getElementById('receivingForm').reset();
      document.getElementById('receiptLinesContainer').innerHTML = '';

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = 'receiving.html';
      }, 2000);

    } catch (error) {
      this.showNotification('Error creating receipt: ' + error.message, 'error');
    }
  }

  // Auto-save functionality
  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.saveDraft();
    }, 30000); // Auto-save every 30 seconds
  }

  saveDraft() {
    const formData = this.getFormData();
    localStorage.setItem('receiving_form_draft', JSON.stringify({
      data: formData,
      timestamp: new Date().toISOString()
    }));
  }

  loadDraft() {
    const draft = localStorage.getItem('receiving_form_draft');
    if (!draft) return;

    const { data, timestamp } = JSON.parse(draft);
    const draftAge = (new Date() - new Date(timestamp)) / (1000 * 60 * 60); // hours

    if (draftAge > 24) {
      this.clearDraft();
      return;
    }

    if (confirm('Found a saved draft from ' + new Date(timestamp).toLocaleString() + '. Load it?')) {
      this.restoreFormData(data);
    }
  }

  restoreFormData(data) {
    // Restore header fields
    Object.keys(data).forEach(key => {
      const element = document.getElementById(key);
      if (element && key !== 'lines') {
        element.value = data[key] || '';
      }
    });

    // Restore lines
    if (data.lines && data.lines.length > 0) {
      data.lines.forEach(line => {
        this.receiptLines.push(line);
        this.renderReceiptLine(line);
      });
      this.currentLineId = Math.max(...data.lines.map(l => l.id)) + 1;
    }
  }

  clearDraft() {
    localStorage.removeItem('receiving_form_draft');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 16px 20px;
      background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize form when DOM is ready
let receivingForm;
document.addEventListener('DOMContentLoaded', function() {
  receivingForm = new ReceivingForm();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  .receipt-line-item {
    padding: var(--spacing-md);
    border: 1px solid var(--color-grey-light);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);
    background: var(--color-white);
  }

  body.dark-theme .receipt-line-item {
    background: #000000;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .receipt-line-item:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
