// Slide Panel Management System
// Handles all slide-in forms for Pixel Safe Portal

class SlidePanelManager {
    constructor() {
        this.activePanels = new Set();
        this.init();
    }

    init() {
        // Close panels on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('slide-panel-overlay')) {
                this.closeAllPanels();
            }
        });

        // Close panels on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllPanels();
            }
        });
    }

    openPanel(panelId) {
        const panel = document.getElementById(panelId);
        const overlay = document.getElementById(panelId + '-overlay');
        
        if (panel && overlay) {
            // Close other panels first
            this.closeAllPanels();
            
            // Open this panel
            overlay.classList.add('active');
            setTimeout(() => {
                panel.classList.add('active');
            }, 10);
            
            this.activePanels.add(panelId);
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }

    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        const overlay = document.getElementById(panelId + '-overlay');
        
        if (panel && overlay) {
            panel.classList.remove('active');
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 300);
            
            this.activePanels.delete(panelId);
            
            // Restore body scroll if no panels are open
            if (this.activePanels.size === 0) {
                document.body.style.overflow = '';
            }
        }
    }

    closeAllPanels() {
        this.activePanels.forEach(panelId => {
            this.closePanel(panelId);
        });
    }
}

// Initialize the panel manager
const panelManager = new SlidePanelManager();

// Helper functions for opening specific panels
function openNewLeadPanel() {
    panelManager.openPanel('newLeadPanel');
}

function openAddClientPanel() {
    panelManager.openPanel('addClientPanel');
}

function openCreateProposalPanel() {
    panelManager.openPanel('createProposalPanel');
}

function openIssuePolicyPanel() {
    panelManager.openPanel('issuePolicyPanel');
}

function openBulkReminderPanel() {
    panelManager.openPanel('bulkReminderPanel');
}

function openNewClaimPanel() {
    panelManager.openPanel('newClaimPanel');
}

function openScheduleReportPanel() {
    panelManager.openPanel('scheduleReportPanel');
}

// API Configuration
const API_BASE_URL = 'http://localhost:5001/api/v1';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Form submission handlers
async function handleNewLeadSubmit(event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Creating...';
        
        // Get form data
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        // Send to backend API
        const result = await apiCall('/pis/leads', 'POST', data);
        
        // Show success message
        showToast('Lead created successfully!', 'success');
        
        // Close panel and reset form
        panelManager.closePanel('newLeadPanel');
        event.target.reset();
        
        // Reload leads table if function exists
        if (typeof refreshLeadsTable === 'function') {
            refreshLeadsTable();
        }
        
    } catch (error) {
        showToast(error.message || 'Failed to create lead', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

async function handleAddClientSubmit(event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Creating...';
        
        // Get form data
        const formData = new FormData(event.target);
        const rawData = Object.fromEntries(formData);
        
        // Structure the data according to Client schema
        const data = {
            fullName: rawData.fullName,
            email: rawData.email,
            phone: rawData.phone,
            alternatePhone: rawData.alternatePhone,
            dateOfBirth: rawData.dateOfBirth,
            gender: rawData.gender,
            address: {
                street: rawData.street,
                city: rawData.city,
                state: rawData.state,
                pincode: rawData.pincode,
                country: rawData.country || 'India'
            },
            panNumber: rawData.panNumber,
            aadhaarNumber: rawData.aadhaarNumber,
            segment: rawData.segment,
            companyName: rawData.companyName,
            companyGSTIN: rawData.companyGSTIN,
            assignedAgent: rawData.assignedAgent || 'Unassigned',
            notes: rawData.notes
        };
        
        // Send to backend API
        const result = await apiCall('/pis/clients', 'POST', data);
        
        // Show success message
        showToast('Client added successfully!', 'success');
        
        // Close panel and reset form
        panelManager.closePanel('addClientPanel');
        event.target.reset();
        
        // Reload clients table if function exists
        if (typeof refreshClientsTable === 'function') {
            refreshClientsTable();
        }
        
    } catch (error) {
        showToast(error.message || 'Failed to add client', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

function handleCreateProposalSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    console.log('Proposal Data:', data);
    
    // TODO: Send to backend API
    alert('Proposal created successfully!');
    panelManager.closePanel('createProposalPanel');
    event.target.reset();
}

async function handleIssuePolicySubmit(event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Issuing...';
        
        const formData = new FormData(event.target);
        const rawData = Object.fromEntries(formData);
        
        // Structure policy data
        const data = {
            clientId: rawData.clientId,
            insuranceType: rawData.insuranceType,
            policyType: rawData.policyType || 'new',
            insurerName: rawData.insurerName,
            planName: rawData.planName,
            coverageAmount: parseFloat(rawData.coverageAmount),
            premium: {
                basePremium: parseFloat(rawData.basePremium),
                gst: parseFloat(rawData.gst) || 0,
                serviceTax: parseFloat(rawData.serviceTax) || 0,
                totalPremium: parseFloat(rawData.totalPremium)
            },
            startDate: rawData.startDate,
            endDate: rawData.endDate,
            paymentMode: rawData.paymentMode,
            paymentStatus: rawData.paymentStatus || 'pending',
            agentName: rawData.agentName || 'Unassigned',
            notes: rawData.notes
        };
        
        const result = await apiCall('/pis/policies', 'POST', data);
        
        showToast(`Policy ${result.data.policyNumber} issued successfully!`, 'success');
        panelManager.closePanel('issuePolicyPanel');
        event.target.reset();
        
        if (typeof refreshPoliciesTable === 'function') {
            refreshPoliciesTable();
        }
        
    } catch (error) {
        showToast(error.message || 'Failed to issue policy', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

function handleBulkReminderSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    console.log('Bulk Reminder Data:', data);
    
    // TODO: Send to backend API
    alert('Reminders scheduled successfully!');
    panelManager.closePanel('bulkReminderPanel');
    event.target.reset();
}

function handleNewClaimSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    console.log('Claim Data:', data);
    
    // TODO: Send to backend API
    alert('Claim filed successfully!');
    panelManager.closePanel('newClaimPanel');
    event.target.reset();
}

function handleScheduleReportSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    console.log('Schedule Report Data:', data);
    
    // TODO: Send to backend API
    alert('Report scheduled successfully!');
    panelManager.closePanel('scheduleReportPanel');
    event.target.reset();
}

// File upload handling
function handleFileUpload(event, fileListId) {
    const files = event.target.files;
    const fileList = document.getElementById(fileListId);
    
    if (fileList) {
        fileList.innerHTML = '';
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-item-name">${file.name}</span>
                <span class="file-item-remove" onclick="this.parentElement.remove()">✕</span>
            `;
            fileList.appendChild(fileItem);
        });
    }
}

// Drag and drop handling
function setupDragDrop(dropZoneId, fileInputId, fileListId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    
    if (!dropZone || !fileInput) return;
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        fileInput.files = e.dataTransfer.files;
        handleFileUpload({ target: fileInput }, fileListId);
    });
}

// Initialize drag-drop when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Setup drag-drop for claim documents
    setupDragDrop('claimDropZone', 'claimDocuments', 'claimFileList');
    // Add more as needed
});
