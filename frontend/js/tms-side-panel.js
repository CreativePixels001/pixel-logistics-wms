/**
 * TMS Side Panel Component
 * Reusable slide-in panel for creating/editing items and uploading documents
 */

// Global panel state
let activePanelType = null;
let panelCallback = null;

/**
 * Open create panel for different entity types
 */
function openCreatePanel(type, existingData = null, callback = null) {
  activePanelType = type;
  panelCallback = callback;
  
  const panel = document.getElementById('sidePanel') || createPanelElement();
  const title = existingData ? `Edit ${type}` : `Add New ${type}`;
  
  panel.innerHTML = `
    <div class="side-panel-overlay" onclick="closeSidePanel()"></div>
    <div class="side-panel-content">
      <div class="side-panel-header">
        <h2>${title}</h2>
        <button onclick="closeSidePanel()" class="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="side-panel-body">
        ${getFormHTML(type, existingData)}
      </div>
      <div class="side-panel-footer">
        <button onclick="closeSidePanel()" class="btn btn-secondary">Cancel</button>
        <button onclick="submitPanelForm()" class="btn btn-primary">
          ${existingData ? 'Update' : 'Create'} ${type}
        </button>
      </div>
    </div>
  `;
  
  panel.style.display = 'flex';
  setTimeout(() => panel.classList.add('active'), 10);
}

/**
 * Open upload document panel
 */
function openUploadPanel(entityType, entityId, entityName, callback = null) {
  panelCallback = callback;
  
  const panel = document.getElementById('sidePanel') || createPanelElement();
  
  panel.innerHTML = `
    <div class="side-panel-overlay" onclick="closeSidePanel()"></div>
    <div class="side-panel-content">
      <div class="side-panel-header">
        <h2>Upload Documents</h2>
        <button onclick="closeSidePanel()" class="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="side-panel-body">
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Uploading to</div>
          <div style="font-weight: 600;">${entityName}</div>
          <div style="font-size: 0.875rem; color: var(--color-text-secondary);">${entityType}</div>
        </div>
        
        <div class="upload-area" id="uploadArea" ondrop="handleDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" onclick="document.getElementById('fileInput').click()">
          <input type="file" id="fileInput" multiple style="display: none;" onchange="handleFileSelect(event)">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.3;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <div style="font-weight: 600; margin-bottom: 0.5rem;">Drop files here or click to browse</div>
          <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)</div>
        </div>
        
        <div id="fileList" style="margin-top: 1.5rem;"></div>
      </div>
      <div class="side-panel-footer">
        <button onclick="closeSidePanel()" class="btn btn-secondary">Cancel</button>
        <button onclick="submitUpload('${entityType}', '${entityId}')" class="btn btn-primary" id="uploadBtn" disabled>
          Upload Files
        </button>
      </div>
    </div>
  `;
  
  panel.style.display = 'flex';
  setTimeout(() => panel.classList.add('active'), 10);
}

/**
 * Create panel element if it doesn't exist
 */
function createPanelElement() {
  const panel = document.createElement('div');
  panel.id = 'sidePanel';
  panel.className = 'side-panel';
  document.body.appendChild(panel);
  return panel;
}

/**
 * Close side panel
 */
function closeSidePanel() {
  const panel = document.getElementById('sidePanel');
  if (panel) {
    panel.classList.remove('active');
    setTimeout(() => {
      panel.style.display = 'none';
      panel.innerHTML = '';
    }, 300);
  }
  activePanelType = null;
  panelCallback = null;
  selectedFiles = [];
}

/**
 * Get form HTML based on entity type
 */
function getFormHTML(type, data = null) {
  switch(type.toLowerCase()) {
    case 'carrier':
      return getCarrierForm(data);
    case 'vehicle':
      return getVehicleForm(data);
    case 'shipment':
      return getShipmentForm(data);
    case 'violation':
    case 'compliance':
      return getComplianceForm(data);
    default:
      return `<p>Form for ${type} coming soon...</p>`;
  }
}

/**
 * Carrier form
 */
function getCarrierForm(data) {
  return `
    <form id="panelForm" class="panel-form">
      <div class="form-group">
        <label for="carrierName">Carrier Name *</label>
        <input type="text" id="carrierName" name="name" value="${data?.name || ''}" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="dotNumber">DOT Number *</label>
          <input type="text" id="dotNumber" name="dotNumber" value="${data?.dotNumber || ''}" required>
        </div>
        <div class="form-group">
          <label for="mcNumber">MC Number</label>
          <input type="text" id="mcNumber" name="mcNumber" value="${data?.mcNumber || ''}">
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="email">Email *</label>
          <input type="email" id="email" name="contact.email" value="${data?.contact?.email || ''}" required>
        </div>
        <div class="form-group">
          <label for="phone">Phone *</label>
          <input type="tel" id="phone" name="contact.phone" value="${data?.contact?.phone || ''}" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="serviceTypes">Service Types *</label>
        <select id="serviceTypes" name="serviceTypes" multiple>
          <option value="ftl">FTL - Full Truckload</option>
          <option value="ltl">LTL - Less Than Truckload</option>
          <option value="parcel">Parcel</option>
          <option value="expedited">Expedited</option>
          <option value="refrigerated">Refrigerated</option>
          <option value="hazmat">Hazmat</option>
          <option value="flatbed">Flatbed</option>
          <option value="intermodal">Intermodal</option>
        </select>
        <small>Hold Ctrl/Cmd to select multiple</small>
      </div>
      
      <div class="form-group">
        <label for="address">Address</label>
        <input type="text" id="address" name="address.street" value="${data?.address?.street || ''}">
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="city">City</label>
          <input type="text" id="city" name="address.city" value="${data?.address?.city || ''}">
        </div>
        <div class="form-group">
          <label for="state">State</label>
          <input type="text" id="state" name="address.state" value="${data?.address?.state || ''}" maxlength="2">
        </div>
        <div class="form-group">
          <label for="zip">ZIP</label>
          <input type="text" id="zip" name="address.zipCode" value="${data?.address?.zipCode || ''}">
        </div>
      </div>
    </form>
  `;
}

/**
 * Vehicle form
 */
function getVehicleForm(data) {
  return `
    <form id="panelForm" class="panel-form">
      <div class="form-group">
        <label for="vehicleId">Vehicle ID *</label>
        <input type="text" id="vehicleId" name="vehicleId" value="${data?.vehicleId || ''}" required ${data ? 'disabled' : ''}>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="type">Type *</label>
          <select id="type" name="type" required>
            <option value="">Select type...</option>
            <option value="semi_truck">Semi Truck</option>
            <option value="box_truck">Box Truck</option>
            <option value="flatbed">Flatbed</option>
            <option value="refrigerated">Refrigerated</option>
            <option value="tanker">Tanker</option>
            <option value="cargo_van">Cargo Van</option>
          </select>
        </div>
        <div class="form-group">
          <label for="status">Status *</label>
          <select id="status" name="status" required>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_service">Out of Service</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="make">Make *</label>
          <input type="text" id="make" name="make" value="${data?.make || ''}" required>
        </div>
        <div class="form-group">
          <label for="model">Model *</label>
          <input type="text" id="model" name="model" value="${data?.model || ''}" required>
        </div>
        <div class="form-group">
          <label for="year">Year *</label>
          <input type="number" id="year" name="year" value="${data?.year || new Date().getFullYear()}" min="1990" max="${new Date().getFullYear() + 1}" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="vin">VIN *</label>
          <input type="text" id="vin" name="vin" value="${data?.vin || ''}" required ${data ? 'disabled' : ''}>
        </div>
        <div class="form-group">
          <label for="licensePlate">License Plate *</label>
          <input type="text" id="licensePlate" name="licensePlate" value="${data?.licensePlate || ''}" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="capacity">Capacity (lbs) *</label>
        <input type="number" id="capacity" name="capacity.weight" value="${data?.capacity?.weight || ''}" required>
      </div>
    </form>
  `;
}

/**
 * Shipment form
 */
function getShipmentForm(data) {
  return `
    <form id="panelForm" class="panel-form">
      <div class="form-group">
        <label for="pickupAddress">Pickup Address *</label>
        <input type="text" id="pickupAddress" name="origin.address" value="${data?.origin?.address || ''}" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="pickupCity">City *</label>
          <input type="text" id="pickupCity" name="origin.city" value="${data?.origin?.city || ''}" required>
        </div>
        <div class="form-group">
          <label for="pickupState">State *</label>
          <input type="text" id="pickupState" name="origin.state" value="${data?.origin?.state || ''}" maxlength="2" required>
        </div>
        <div class="form-group">
          <label for="pickupZip">ZIP *</label>
          <input type="text" id="pickupZip" name="origin.zipCode" value="${data?.origin?.zipCode || ''}" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="deliveryAddress">Delivery Address *</label>
        <input type="text" id="deliveryAddress" name="destination.address" value="${data?.destination?.address || ''}" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="deliveryCity">City *</label>
          <input type="text" id="deliveryCity" name="destination.city" value="${data?.destination?.city || ''}" required>
        </div>
        <div class="form-group">
          <label for="deliveryState">State *</label>
          <input type="text" id="deliveryState" name="destination.state" value="${data?.destination?.state || ''}" maxlength="2" required>
        </div>
        <div class="form-group">
          <label for="deliveryZip">ZIP *</label>
          <input type="text" id="deliveryZip" name="destination.zipCode" value="${data?.destination?.zipCode || ''}" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="pickupDate">Pickup Date *</label>
          <input type="date" id="pickupDate" name="pickupDate" value="${data?.pickupDate?.split('T')[0] || ''}" required>
        </div>
        <div class="form-group">
          <label for="deliveryDate">Delivery Date *</label>
          <input type="date" id="deliveryDate" name="scheduledDeliveryDate" value="${data?.scheduledDeliveryDate?.split('T')[0] || ''}" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="freightType">Freight Type *</label>
          <select id="freightType" name="freightType" required>
            <option value="ftl">FTL</option>
            <option value="ltl">LTL</option>
            <option value="parcel">Parcel</option>
            <option value="expedited">Expedited</option>
            <option value="refrigerated">Refrigerated</option>
            <option value="hazmat">Hazmat</option>
          </select>
        </div>
        <div class="form-group">
          <label for="weight">Weight (lbs) *</label>
          <input type="number" id="weight" name="weight" value="${data?.weight || ''}" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="cost">Cost ($) *</label>
        <input type="number" id="cost" name="cost.baseCost" value="${data?.cost?.baseCost || ''}" step="0.01" required>
      </div>
    </form>
  `;
}

/**
 * Compliance/Violation form
 */
function getComplianceForm(data) {
  return `
    <form id="panelForm" class="panel-form">
      <div class="form-row">
        <div class="form-group">
          <label for="violationType">Type *</label>
          <select id="violationType" name="type" required>
            <option value="hos_violation">HOS Violation</option>
            <option value="vehicle_inspection">Vehicle Inspection</option>
            <option value="driver_inspection">Driver Inspection</option>
            <option value="dot_inspection">DOT Inspection</option>
            <option value="drug_test">Drug Test</option>
            <option value="license_renewal">License Renewal</option>
            <option value="medical_cert">Medical Certification</option>
            <option value="weight_violation">Weight Violation</option>
            <option value="safety_inspection">Safety Inspection</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label for="severity">Severity *</label>
          <select id="severity" name="severity" required>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="incidentDate">Incident Date *</label>
        <input type="date" id="incidentDate" name="incidentDate" value="${data?.incidentDate?.split('T')[0] || ''}" required>
      </div>
      
      <div class="form-group">
        <label for="entityVehicle">Vehicle ID</label>
        <input type="text" id="entityVehicle" name="entity.vehicleId" value="${data?.entity?.vehicleId || ''}">
      </div>
      
      <div class="form-group">
        <label for="entityDriver">Driver Name</label>
        <input type="text" id="entityDriver" name="entity.driverName" value="${data?.entity?.driverName || ''}">
      </div>
      
      <div class="form-group">
        <label for="description">Description *</label>
        <textarea id="description" name="description" rows="3" required>${data?.description || ''}</textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="fineAmount">Fine Amount ($)</label>
          <input type="number" id="fineAmount" name="citation.fineAmount" value="${data?.citation?.fineAmount || 0}" step="0.01">
        </div>
        <div class="form-group">
          <label for="dueDate">Due Date</label>
          <input type="date" id="dueDate" name="dueDate" value="${data?.dueDate?.split('T')[0] || ''}">
        </div>
      </div>
    </form>
  `;
}

/**
 * Submit form data
 */
async function submitPanelForm() {
  const form = document.getElementById('panelForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const formData = new FormData(form);
  const data = {};
  
  // Convert FormData to nested object
  for (let [key, value] of formData.entries()) {
    setNestedValue(data, key, value);
  }
  
  console.log('Form data:', data);
  
  if (panelCallback) {
    await panelCallback(data);
  }
  
  closeSidePanel();
}

/**
 * Helper to set nested object values from dot notation
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

// File upload handling
let selectedFiles = [];

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('drag-over');
  
  const files = Array.from(e.dataTransfer.files);
  addFiles(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addFiles(files);
}

function addFiles(files) {
  const validFiles = files.filter(file => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'];
    
    if (file.size > maxSize) {
      alert(`${file.name} is too large (max 10MB)`);
      return false;
    }
    
    if (!validTypes.includes(file.type)) {
      alert(`${file.name} has invalid file type`);
      return false;
    }
    
    return true;
  });
  
  selectedFiles = [...selectedFiles, ...validFiles];
  renderFileList();
  
  document.getElementById('uploadBtn').disabled = selectedFiles.length === 0;
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderFileList();
  document.getElementById('uploadBtn').disabled = selectedFiles.length === 0;
}

function renderFileList() {
  const fileList = document.getElementById('fileList');
  
  if (selectedFiles.length === 0) {
    fileList.innerHTML = '';
    return;
  }
  
  fileList.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 0.75rem;">Selected Files (${selectedFiles.length})</div>
    ${selectedFiles.map((file, index) => `
      <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--color-bg-secondary); border-radius: 6px; margin-bottom: 0.5rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${formatFileSize(file.size)}</div>
        </div>
        <button onclick="removeFile(${index})" class="btn-icon" style="color: #dc2626;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `).join('')}
  `;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function submitUpload(entityType, entityId) {
  if (selectedFiles.length === 0) return;
  
  // In a real app, this would upload to a server
  console.log('Uploading files:', selectedFiles, 'to', entityType, entityId);
  
  // Simulate upload
  const uploadBtn = document.getElementById('uploadBtn');
  uploadBtn.disabled = true;
  uploadBtn.innerHTML = '<span class="loading-spinner"></span> Uploading...';
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (panelCallback) {
    await panelCallback(selectedFiles);
  }
  
  alert(`Successfully uploaded ${selectedFiles.length} file(s)`);
  closeSidePanel();
}
