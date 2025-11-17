// DLT WMS - Labeling & Relabeling Module JavaScript
// Handles label printing, relabeling workflows, batch uploads, and drag & drop functionality

let uploadedFile = null;

// Modal Functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Focus first input in modal
  setTimeout(() => {
    const modal = document.getElementById(modalId);
    const firstInput = modal.querySelector('input, select');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  document.body.style.overflow = 'auto';
  
  // Reset form
  const modal = document.getElementById(modalId);
  const form = modal.querySelector('form');
  if (form) form.reset();
  
  if (modalId === 'batchUploadModal') {
    clearUpload();
  }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id);
  }
});

// Filter Functions
function toggleFilters() {
  const panel = document.getElementById('filterPanel');
  const toggleText = document.getElementById('filterToggleText');
  
  if (panel.classList.contains('active')) {
    panel.classList.remove('active');
    toggleText.textContent = 'Show Filters';
  } else {
    panel.classList.add('active');
    toggleText.textContent = 'Hide Filters';
  }
}

function applyFilters() {
  const labelType = document.getElementById('filterLabelType').value;
  const status = document.getElementById('filterStatus').value;
  const date = document.getElementById('filterDate').value;
  const printer = document.getElementById('filterPrinter').value;
  
  WMS.showNotification('Applying filters...', 'info');
  
  setTimeout(() => {
    WMS.showNotification('Filters applied successfully', 'success');
  }, 500);
}

function clearFilters() {
  document.getElementById('filterLabelType').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterDate').value = 'today';
  document.getElementById('filterPrinter').value = '';
  
  applyFilters();
}

// Template Management
function updateTemplates() {
  const labelType = document.getElementById('labelType').value;
  const templateSelect = document.getElementById('labelTemplate');
  
  templateSelect.innerHTML = '<option value="">Select template</option>';
  
  const templates = {
    'product': [
      { value: 'standard', text: 'Standard Product Label' },
      { value: 'retail', text: 'Retail Product Label' },
      { value: 'compliance', text: 'Compliance Product Label' }
    ],
    'shipping': [
      { value: 'ups', text: 'UPS Shipping Label' },
      { value: 'fedex', text: 'FedEx Shipping Label' },
      { value: 'usps', text: 'USPS Shipping Label' }
    ],
    'barcode': [
      { value: 'code128', text: 'Code 128 Barcode' },
      { value: 'qr', text: 'QR Code' },
      { value: 'datamatrix', text: 'Data Matrix' }
    ],
    'compliance': [
      { value: 'fda', text: 'FDA Compliance Label' },
      { value: 'gs1', text: 'GS1 Standard Label' },
      { value: 'hazmat', text: 'HazMat Label' }
    ],
    'lpn': [
      { value: 'standard-lpn', text: 'Standard LPN Label' },
      { value: 'nested-lpn', text: 'Nested LPN Label' }
    ]
  };
  
  if (labelType && templates[labelType]) {
    templates[labelType].forEach(template => {
      const option = document.createElement('option');
      option.value = template.value;
      option.textContent = template.text;
      templateSelect.appendChild(option);
    });
  }
}

// Label Preview
function generateLabelPreview(itemLPN, template) {
  const preview = document.getElementById('labelPreview');
  
  // Generate barcode preview
  const barcodeHTML = `
    <div class="barcode-preview">
      <div style="font-weight: 600; margin-bottom: 12px;">PRODUCT LABEL</div>
      <div style="margin-bottom: 8px;"><strong>Item:</strong> ${itemLPN}</div>
      <div style="margin-bottom: 8px;"><strong>Description:</strong> Widget Assembly A</div>
      <div style="margin-bottom: 12px;"><strong>Qty:</strong> 1 EA</div>
      <div class="barcode-bars">
        ${Array.from({length: 40}, (_, i) => 
          `<div class="barcode-bar" style="height: ${Math.random() > 0.5 ? '60px' : '40px'};"></div>`
        ).join('')}
      </div>
      <div class="barcode-number">${itemLPN.replace(/[^0-9]/g, '').padStart(12, '0')}</div>
      <div style="margin-top: 12px; font-size: 12px; color: var(--color-grey);">
        ${new Date().toLocaleDateString()} | ${template}
      </div>
    </div>
  `;
  
  preview.innerHTML = barcodeHTML;
}

// Print Label Functions
function submitPrintLabel() {
  const form = document.getElementById('printLabelForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const labelData = {
    type: document.getElementById('labelType').value,
    template: document.getElementById('labelTemplate').value,
    itemLPN: document.getElementById('printItemLPN').value,
    quantity: parseInt(document.getElementById('printQty').value),
    printer: document.getElementById('printer').value,
    createdBy: 'Ashish Kumar',
    createdDate: WMS.formatDateTime(new Date())
  };
  
  WMS.showNotification(`Printing ${labelData.quantity} label(s)...`, 'info');
  
  setTimeout(() => {
    // Save to storage
    const labelJobs = WMS.Storage.get('labelJobs') || [];
    const jobID = 'LBL-2025-' + String(labelJobs.length + 1).padStart(3, '0');
    labelJobs.unshift({ jobID, ...labelData, status: 'Printed' });
    WMS.Storage.set('labelJobs', labelJobs);
    
    WMS.showNotification(`${labelData.quantity} label(s) printed successfully!`, 'success');
    closeModal('printLabelModal');
  }, 1500);
}

function reprintLabel(jobID) {
  WMS.showNotification(`Reprinting job ${jobID}...`, 'info');
  
  setTimeout(() => {
    WMS.showNotification('Label reprinted successfully', 'success');
  }, 1000);
}

function printLabel(jobID) {
  WMS.showNotification(`Printing job ${jobID}...`, 'info');
  
  setTimeout(() => {
    WMS.showNotification('Label printed successfully', 'success');
    
    // Update table row status
    const tbody = document.getElementById('labelJobsTable');
    const rows = tbody.getElementsByTagName('tr');
    
    for (let row of rows) {
      if (row.cells[0].textContent.includes(jobID)) {
        row.cells[8].innerHTML = '<span class="badge badge-primary">Printed</span>';
        row.cells[9].innerHTML = `<button class="btn btn-sm btn-outline" onclick="reprintLabel('${jobID}')">Reprint</button>`;
        break;
      }
    }
  }, 1000);
}

// Relabel Functions
function submitRelabel() {
  const form = document.getElementById('relabelForm');
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const relabelData = {
    lpn: document.getElementById('relabelLPN').value,
    reason: document.getElementById('relabelReason').value,
    comments: document.getElementById('relabelComments').value,
    template: document.getElementById('relabelTemplate').value,
    printer: document.getElementById('relabelPrinter').value,
    relabeledBy: 'Ashish Kumar',
    relabeledDate: WMS.formatDateTime(new Date())
  };
  
  WMS.showNotification('Processing relabel request...', 'info');
  
  setTimeout(() => {
    // Save to storage
    const relabelJobs = WMS.Storage.get('relabelJobs') || [];
    relabelJobs.unshift(relabelData);
    WMS.Storage.set('relabelJobs', relabelJobs);
    
    WMS.showNotification('New label printed. Please apply to item.', 'success');
    closeModal('relabelModal');
  }, 1500);
}

// Drag & Drop Functions
function initializeDragDrop() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  
  // Click to browse
  dropzone.addEventListener('click', () => {
    fileInput.click();
  });
  
  // File input change
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });
  
  // Drag and drop events
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
}

function handleFiles(files) {
  if (files.length === 0) return;
  
  const file = files[0];
  
  // Validate file type
  const validTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  
  if (!validTypes.includes(fileExtension)) {
    WMS.showNotification('Invalid file type. Please upload CSV or Excel file.', 'error');
    return;
  }
  
  uploadedFile = file;
  
  // Show upload status
  document.getElementById('uploadStatus').style.display = 'block';
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatFileSize(file.size);
  document.getElementById('processUploadBtn').disabled = false;
  
  // Simulate upload progress
  let progress = 0;
  const progressBar = document.getElementById('uploadProgress');
  const uploadText = document.getElementById('uploadText');
  
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = progress + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      uploadText.textContent = 'Upload complete - Ready to process';
      WMS.showNotification('File uploaded successfully', 'success');
    } else {
      uploadText.textContent = `Uploading... ${progress}%`;
    }
  }, 100);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function clearUpload() {
  uploadedFile = null;
  document.getElementById('uploadStatus').style.display = 'none';
  document.getElementById('fileInput').value = '';
  document.getElementById('processUploadBtn').disabled = true;
  document.getElementById('uploadProgress').style.width = '0%';
}

function processUpload() {
  if (!uploadedFile) {
    WMS.showNotification('No file uploaded', 'error');
    return;
  }
  
  WMS.showNotification('Processing batch labels...', 'info');
  
  setTimeout(() => {
    const recordsProcessed = Math.floor(Math.random() * 100) + 50;
    WMS.showNotification(`Batch processed: ${recordsProcessed} labels queued for printing`, 'success');
    closeModal('batchUploadModal');
  }, 2000);
}

function downloadTemplate() {
  WMS.showNotification('Downloading template...', 'info');
  
  // In a real app, this would download an actual CSV template file
  setTimeout(() => {
    WMS.showNotification('Template downloaded', 'success');
  }, 500);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeDragDrop();
  
  // Auto-update preview when item changes
  const itemInput = document.getElementById('printItemLPN');
  const templateSelect = document.getElementById('labelTemplate');
  
  if (itemInput && templateSelect) {
    const updatePreview = () => {
      const item = itemInput.value;
      const template = templateSelect.options[templateSelect.selectedIndex]?.text || 'Standard';
      
      if (item) {
        generateLabelPreview(item, template);
      }
    };
    
    itemInput.addEventListener('input', updatePreview);
    templateSelect.addEventListener('change', updatePreview);
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        closeModal(activeModal.id);
      }
    }
    
    // CTRL+P for print label modal
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      openModal('printLabelModal');
    }
  });
});
