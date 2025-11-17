// Common Header Actions

let uploadedFiles = [];

// Initialize upload functionality
function initializeUpload() {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  
  if (uploadZone && fileInput) {
    // Click to upload
    uploadZone.addEventListener('click', () => {
      fileInput.click();
    });
    
    // File selection
    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
  }
}

// Open upload sidebar
function openUploadSidebar() {
  const sidebar = document.getElementById('uploadSidebar');
  const overlay = document.getElementById('uploadOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Close upload sidebar
function closeUploadSidebar() {
  const sidebar = document.getElementById('uploadSidebar');
  const overlay = document.getElementById('uploadOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Handle file selection
function handleFiles(files) {
  const fileList = Array.from(files);
  
  fileList.forEach(file => {
    // Check if file already exists
    const exists = uploadedFiles.some(f => f.name === file.name && f.size === file.size);
    if (!exists) {
      uploadedFiles.push(file);
    }
  });
  
  renderFileList();
}

// Remove file from list
function removeFile(index) {
  uploadedFiles.splice(index, 1);
  renderFileList();
}

// Render file list
function renderFileList() {
  const fileListContainer = document.getElementById('fileList');
  
  if (!fileListContainer) return;
  
  if (uploadedFiles.length === 0) {
    fileListContainer.innerHTML = '<p style="text-align: center; color: var(--color-grey); padding: var(--spacing-lg);">No files selected</p>';
    return;
  }
  
  const filesHTML = uploadedFiles.map((file, index) => {
    const fileSize = formatFileSize(file.size);
    const fileIcon = getFileIcon(file.name);
    
    return `
      <div class="file-item">
        <div class="file-icon">
          ${fileIcon}
        </div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${fileSize}</div>
        </div>
        <button class="file-remove" onclick="removeFile(${index})">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  }).join('');
  
  fileListContainer.innerHTML = filesHTML;
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file icon based on file extension
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  const icons = {
    'pdf': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    'xlsx': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38a169" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    'xls': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38a169" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    'csv': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3182ce" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    'default': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
  };
  
  return icons[ext] || icons['default'];
}

// Upload files
function uploadFiles() {
  if (uploadedFiles.length === 0) {
    alert('Please select files to upload');
    return;
  }
  
  // Simulate upload process
  console.log('Uploading files:', uploadedFiles);
  
  // Show progress notification
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1f2937;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-size: 14px;
  `;
  notification.textContent = `Uploading ${uploadedFiles.length} file(s)...`;
  document.body.appendChild(notification);
  
  // Simulate upload delay
  setTimeout(() => {
    notification.textContent = `Successfully uploaded ${uploadedFiles.length} file(s)`;
    notification.style.background = '#10b981';
    
    setTimeout(() => {
      notification.remove();
      uploadedFiles = [];
      renderFileList();
      closeUploadSidebar();
    }, 2000);
  }, 1500);
}

// Cancel upload and clear files
function cancelUpload() {
  uploadedFiles = [];
  renderFileList();
  closeUploadSidebar();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeUpload();
  
  // Close on overlay click
  const overlay = document.getElementById('uploadOverlay');
  if (overlay) {
    overlay.addEventListener('click', closeUploadSidebar);
  }
  
  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeUploadSidebar();
    }
  });
});
