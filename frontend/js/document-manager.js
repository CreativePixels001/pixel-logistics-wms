/**
 * Document Upload Component
 * Reusable component for document management
 */

class DocumentUploader {
  constructor(options = {}) {
    this.apiBase = options.apiBase || 'http://localhost:3000/api/v1/tms/documents';
    this.category = options.category || 'shipment';
    this.entityType = options.entityType || null;
    this.entityId = options.entityId || null;
    this.entityName = options.entityName || null;
    this.onUploadComplete = options.onUploadComplete || (() => {});
    this.onUploadError = options.onUploadError || (() => {});
    this.maxFiles = options.maxFiles || 5;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
  }

  /**
   * Create upload form HTML
   */
  createUploadForm(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div class="document-uploader">
        <div class="upload-header">
          <h3>Upload Documents</h3>
          <button type="button" class="btn-close" onclick="this.closest('.document-uploader').remove()">×</button>
        </div>

        <form id="documentUploadForm" class="upload-form">
          <div class="form-group">
            <label for="documentType">Document Type *</label>
            <select id="documentType" name="documentType" required>
              <option value="">Select Type</option>
              <option value="insurance">Insurance Certificate</option>
              <option value="license">License</option>
              <option value="medical">Medical Certificate</option>
              <option value="registration">Vehicle Registration</option>
              <option value="inspection">Safety Inspection</option>
              <option value="w9">W9 Form</option>
              <option value="authority">Operating Authority</option>
              <option value="pod">Proof of Delivery</option>
              <option value="bol">Bill of Lading</option>
              <option value="invoice">Invoice</option>
              <option value="contract">Contract</option>
              <option value="permit">Special Permit</option>
              <option value="customs">Customs Document</option>
              <option value="photo">Photo</option>
              <option value="report">Report</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="documentFile">Select File(s) *</label>
            <input 
              type="file" 
              id="documentFile" 
              name="file" 
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" 
              multiple
              required
            >
            <small class="form-text">Max ${this.maxFiles} files, 10MB each. Supported: Images, PDF, Word, Excel, CSV, Text</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="issueDate">Issue Date</label>
              <input type="date" id="issueDate" name="issueDate">
            </div>

            <div class="form-group">
              <label for="expiryDate">Expiry Date</label>
              <input type="date" id="expiryDate" name="expiryDate">
            </div>
          </div>

          <div class="form-group">
            <label for="issuingAuthority">Issuing Authority</label>
            <input type="text" id="issuingAuthority" name="issuingAuthority" placeholder="e.g., DMV, DOT, Insurance Company">
          </div>

          <div class="form-group">
            <label for="documentId">Document ID/Number</label>
            <input type="text" id="documentId" name="documentId" placeholder="e.g., License #, Policy #">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="state">State</label>
              <input type="text" id="state" name="state" placeholder="e.g., CA, TX">
            </div>

            <div class="form-group">
              <label for="country">Country</label>
              <input type="text" id="country" name="country" placeholder="e.g., USA">
            </div>
          </div>

          <div class="form-group">
            <label for="tags">Tags (comma separated)</label>
            <input type="text" id="tags" name="tags" placeholder="e.g., urgent, renewal, verified">
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea id="notes" name="notes" rows="3" placeholder="Additional notes about this document"></textarea>
          </div>

          <div class="upload-progress" id="uploadProgress" style="display: none;">
            <div class="progress-bar">
              <div class="progress-fill" id="progressFill"></div>
            </div>
            <p id="progressText">Uploading...</p>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="uploadBtn">
              <span class="btn-icon">📤</span> Upload
            </button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.document-uploader').remove()">
              Cancel
            </button>
          </div>
        </form>

        <div class="upload-files-preview" id="filesPreview"></div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const form = document.getElementById('documentUploadForm');
    const fileInput = document.getElementById('documentFile');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  /**
   * Handle file selection
   */
  handleFileSelect(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('filesPreview');

    if (!previewContainer) return;

    // Validate file count
    if (files.length > this.maxFiles) {
      showNotification(`Maximum ${this.maxFiles} files allowed`, 'error');
      event.target.value = '';
      return;
    }

    // Validate file sizes
    for (let file of files) {
      if (file.size > this.maxFileSize) {
        showNotification(`File ${file.name} exceeds 10MB limit`, 'error');
        event.target.value = '';
        return;
      }
    }

    // Show file preview
    previewContainer.innerHTML = '<h4>Selected Files:</h4>';
    Array.from(files).forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-preview-item';
      fileItem.innerHTML = `
        <span class="file-icon">📄</span>
        <span class="file-name">${file.name}</span>
        <span class="file-size">${this.formatFileSize(file.size)}</span>
      `;
      previewContainer.appendChild(fileItem);
    });
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const fileInput = document.getElementById('documentFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressContainer = document.getElementById('uploadProgress');

    if (!fileInput.files || fileInput.files.length === 0) {
      showNotification('Please select at least one file', 'error');
      return;
    }

    const formData = new FormData();

    // Add files
    if (fileInput.files.length === 1) {
      formData.append('file', fileInput.files[0]);
    } else {
      Array.from(fileInput.files).forEach(file => {
        formData.append('files', file);
      });
    }

    // Add form data
    formData.append('documentType', form.documentType.value);
    formData.append('category', this.category);
    
    if (this.entityType) formData.append('entityType', this.entityType);
    if (this.entityId) formData.append('entityId', this.entityId);
    if (this.entityName) formData.append('entityName', this.entityName);
    
    if (form.issueDate.value) formData.append('issueDate', form.issueDate.value);
    if (form.expiryDate.value) formData.append('expiryDate', form.expiryDate.value);
    if (form.issuingAuthority.value) formData.append('issuingAuthority', form.issuingAuthority.value);
    if (form.documentId.value) formData.append('documentId', form.documentId.value);
    if (form.state.value) formData.append('state', form.state.value);
    if (form.country.value) formData.append('country', form.country.value);
    if (form.tags.value) formData.append('tags', form.tags.value);
    if (form.notes.value) formData.append('notes', form.notes.value);

    try {
      // Show progress
      uploadBtn.disabled = true;
      uploadBtn.innerHTML = '<span class="spinner"></span> Uploading...';
      progressContainer.style.display = 'block';

      const endpoint = fileInput.files.length === 1 
        ? `${this.apiBase}/upload` 
        : `${this.apiBase}/upload-multiple`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        showNotification(result.message || 'Document uploaded successfully', 'success');
        form.reset();
        document.getElementById('filesPreview').innerHTML = '';
        this.onUploadComplete(result.data);
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      showNotification(error.message || 'Failed to upload document', 'error');
      this.onUploadError(error);

    } finally {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<span class="btn-icon">📤</span> Upload';
      progressContainer.style.display = 'none';
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Document List Manager
 */
class DocumentList {
  constructor(options = {}) {
    this.apiBase = options.apiBase || 'http://localhost:3000/api/v1/tms/documents';
    this.category = options.category || null;
    this.entityType = options.entityType || null;
    this.entityId = options.entityId || null;
  }

  /**
   * Load and display documents
   */
  async loadDocuments(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const params = new URLSearchParams();
      if (this.category) params.append('category', this.category);
      if (this.entityType) params.append('entityType', this.entityType);
      if (this.entityId) params.append('entityId', this.entityId);

      const response = await fetch(`${this.apiBase}?${params}`);
      const result = await response.json();

      if (result.success) {
        this.renderDocuments(container, result.data);
      } else {
        throw new Error(result.error?.message || 'Failed to load documents');
      }

    } catch (error) {
      console.error('Load documents error:', error);
      container.innerHTML = `<p class="error">Failed to load documents: ${error.message}</p>`;
    }
  }

  /**
   * Render documents list
   */
  renderDocuments(container, documents) {
    if (!documents || documents.length === 0) {
      container.innerHTML = '<p class="no-data">No documents found</p>';
      return;
    }

    const html = `
      <div class="documents-list">
        <div class="documents-header">
          <h3>Documents (${documents.length})</h3>
        </div>
        <div class="documents-grid">
          ${documents.map(doc => this.renderDocumentCard(doc)).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Render single document card
   */
  renderDocumentCard(doc) {
    const expiryStatus = this.getExpiryStatus(doc);
    const icon = this.getDocumentIcon(doc.mimeType);

    return `
      <div class="document-card ${expiryStatus.class}">
        <div class="document-icon">${icon}</div>
        <div class="document-info">
          <h4>${doc.originalName}</h4>
          <p class="document-type">${this.formatDocumentType(doc.documentType)}</p>
          <p class="document-size">${this.formatFileSize(doc.fileSize)}</p>
          ${doc.metadata?.expiryDate ? `
            <p class="document-expiry ${expiryStatus.class}">
              ${expiryStatus.text}
            </p>
          ` : ''}
        </div>
        <div class="document-actions">
          <button onclick="downloadDocument('${doc._id}')" class="btn-icon" title="Download">
            ⬇️
          </button>
          <button onclick="viewDocument('${doc._id}')" class="btn-icon" title="View">
            👁️
          </button>
          <button onclick="deleteDocument('${doc._id}')" class="btn-icon" title="Delete">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Get expiry status
   */
  getExpiryStatus(doc) {
    if (!doc.metadata?.expiryDate) return { class: '', text: '' };

    const expiryDate = new Date(doc.metadata.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { class: 'expired', text: 'Expired' };
    } else if (daysUntilExpiry <= 30) {
      return { class: 'expiring-soon', text: `Expires in ${daysUntilExpiry} days` };
    } else {
      return { class: 'valid', text: `Expires ${expiryDate.toLocaleDateString()}` };
    }
  }

  /**
   * Get document icon based on MIME type
   */
  getDocumentIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📎';
  }

  /**
   * Format document type
   */
  formatDocumentType(type) {
    const types = {
      insurance: 'Insurance',
      license: 'License',
      medical: 'Medical Certificate',
      registration: 'Registration',
      inspection: 'Inspection',
      w9: 'W9 Form',
      authority: 'Operating Authority',
      pod: 'Proof of Delivery',
      bol: 'Bill of Lading',
      invoice: 'Invoice',
      contract: 'Contract',
      permit: 'Permit',
      customs: 'Customs',
      photo: 'Photo',
      report: 'Report',
      other: 'Other'
    };
    return types[type] || type;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Global document actions
 */
async function downloadDocument(documentId) {
  try {
    window.location.href = `http://localhost:3000/api/v1/tms/documents/${documentId}/download`;
  } catch (error) {
    showNotification('Failed to download document', 'error');
  }
}

async function viewDocument(documentId) {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/tms/documents/${documentId}`);
    const result = await response.json();

    if (result.success) {
      // Open in new tab
      window.open(result.data.storage.url, '_blank');
    }
  } catch (error) {
    showNotification('Failed to view document', 'error');
  }
}

async function deleteDocument(documentId) {
  if (!confirm('Are you sure you want to delete this document?')) return;

  try {
    const response = await fetch(`http://localhost:3000/api/v1/tms/documents/${documentId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showNotification('Document deleted successfully', 'success');
      location.reload(); // Reload to refresh the list
    } else {
      throw new Error(result.error?.message || 'Delete failed');
    }
  } catch (error) {
    showNotification(error.message || 'Failed to delete document', 'error');
  }
}
