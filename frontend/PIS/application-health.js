// Application Form JavaScript

let applicationData = {};
let uploadedDocuments = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadApplicationData();
    setupEventListeners();
    setupDocumentUploads();
});

function loadApplicationData() {
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem('applicationData');
    
    if (storedData) {
        applicationData = JSON.parse(storedData);
        
        // Pre-fill form with existing data
        if (applicationData.fullName) {
            document.getElementById('fullName').value = applicationData.fullName;
        }
        if (applicationData.email) {
            document.getElementById('email').value = applicationData.email;
        }
        if (applicationData.phone) {
            document.getElementById('phone').value = applicationData.phone;
        }
        if (applicationData.age) {
            // Calculate DOB from age
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - applicationData.age;
            document.getElementById('dateOfBirth').value = `${birthYear}-01-01`;
        }
        if (applicationData.gender) {
            document.getElementById('gender').value = applicationData.gender;
        }
        if (applicationData.pincode) {
            document.getElementById('pincode').value = applicationData.pincode;
        }
        
        // Update summary panel
        updateSummaryPanel();
    } else {
        // Redirect back if no data
        alert('No quote data found. Please start from the calculator.');
        window.location.href = 'calculator-health.html';
    }
}

function updateSummaryPanel() {
    const quote = applicationData.selectedQuote;
    
    if (quote) {
        document.getElementById('summaryLogo').textContent = quote.logo || 'SH';
        document.getElementById('summaryInsurer').textContent = quote.insurerName || applicationData.insurerName;
        document.getElementById('summaryPlan').textContent = quote.planName || applicationData.planName;
    }
    
    // Coverage details
    document.getElementById('summaryCoverage').textContent = formatCurrency(applicationData.coverageAmount);
    document.getElementById('summaryType').textContent = applicationData.coverageType === 'individual' ? 'Individual' : 'Family';
    
    // Premium breakdown
    const premium = applicationData.premium || quote?.premium || {};
    document.getElementById('summaryBase').textContent = '₹' + (premium.base || premium.basePremium || 0).toLocaleString('en-IN');
    document.getElementById('summaryAddons').textContent = '₹' + (premium.addons || 0).toLocaleString('en-IN');
    document.getElementById('summaryGst').textContent = '₹' + (premium.gst || 0).toLocaleString('en-IN');
    document.getElementById('summaryTotal').textContent = '₹' + (premium.total || premium.totalPremium || 0).toLocaleString('en-IN');
}

function formatCurrency(amount) {
    const crores = Math.floor(amount / 10000000);
    const lakhs = Math.floor((amount % 10000000) / 100000);
    
    if (crores > 0) {
        return lakhs > 0 ? `₹${crores}.${lakhs} Cr` : `₹${crores} Cr`;
    }
    return `₹${lakhs} Lakh`;
}

function setupEventListeners() {
    // Form submission
    document.getElementById('applicationForm').addEventListener('submit', handleFormSubmit);
    
    // PAN number uppercase
    document.getElementById('panNumber').addEventListener('input', function(e) {
        this.value = this.value.toUpperCase();
    });
    
    // Aadhaar number formatting
    document.getElementById('aadhaarNumber').addEventListener('input', function(e) {
        let value = this.value.replace(/\s/g, '');
        if (value.length > 12) {
            value = value.substring(0, 12);
        }
        this.value = value;
    });
}

function setupDocumentUploads() {
    // PAN Document
    document.getElementById('panDocument').addEventListener('change', function(e) {
        handleFileUpload(e, 'pan', 'panStatus', 2);
    });
    
    // Aadhaar Document
    document.getElementById('aadhaarDocument').addEventListener('change', function(e) {
        handleFileUpload(e, 'aadhaar', 'aadhaarStatus', 2);
    });
    
    // Photo Document
    document.getElementById('photoDocument').addEventListener('change', function(e) {
        handleFileUpload(e, 'photo', 'photoStatus', 1);
    });
}

function handleFileUpload(event, docType, statusId, maxSizeMB) {
    const file = event.target.files[0];
    const statusElement = document.getElementById(statusId);
    const uploadCard = event.target.closest('.upload-card');
    
    if (!file) return;
    
    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
        statusElement.textContent = `File too large. Max ${maxSizeMB}MB`;
        statusElement.classList.remove('success');
        uploadCard.classList.remove('uploaded');
        return;
    }
    
    // Validate file type
    const allowedTypes = docType === 'photo' 
        ? ['image/jpeg', 'image/jpg', 'image/png']
        : ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
        statusElement.textContent = 'Invalid file type';
        statusElement.classList.remove('success');
        uploadCard.classList.remove('uploaded');
        return;
    }
    
    // Store file reference
    uploadedDocuments[docType] = file;
    
    // Update UI
    statusElement.textContent = `✓ ${file.name} (${formatFileSize(file.size)})`;
    statusElement.classList.add('success');
    uploadCard.classList.add('uploaded');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate all required documents are uploaded
    if (!uploadedDocuments.pan || !uploadedDocuments.aadhaar || !uploadedDocuments.photo) {
        alert('Please upload all required documents (PAN, Aadhaar, Photo)');
        return;
    }
    
    // Show loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    // Collect form data
    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData);
    
    // Prepare client data
    const clientData = {
        // Personal Information
        fullName: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        dateOfBirth: formValues.dateOfBirth,
        gender: formValues.gender,
        
        // ID Proof
        panNumber: formValues.panNumber,
        aadhaarNumber: formValues.aadhaarNumber,
        
        // Address
        address: {
            addressLine1: formValues.addressLine1,
            addressLine2: formValues.addressLine2,
            city: formValues.city,
            state: formValues.state,
            pincode: formValues.pincode,
            country: formValues.country || 'India'
        },
        
        // Nominee
        nominee: {
            name: formValues.nomineeName,
            relationship: formValues.nomineeRelationship,
            dateOfBirth: formValues.nomineeDob
        },
        
        // Source
        source: 'website',
        assignedAgent: null,
        
        // Tags
        tags: ['online-purchase', 'health-insurance'],
        
        // Notes
        notes: `Online health insurance purchase. Coverage: ${formatCurrency(applicationData.coverageAmount)}`
    };
    
    try {
        // Step 1: Create Client
        const clientResponse = await fetch('http://localhost:5001/api/v1/pis/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData)
        });
        
        const clientResult = await clientResponse.json();
        
        if (!clientResult.success) {
            throw new Error(clientResult.message || 'Failed to create client');
        }
        
        const clientId = clientResult.data._id;
        
        // Step 2: Store application data for payment page
        const completeApplicationData = {
            ...applicationData,
            clientId: clientId,
            clientData: clientData,
            formValues: formValues,
            documents: {
                pan: uploadedDocuments.pan.name,
                aadhaar: uploadedDocuments.aadhaar.name,
                photo: uploadedDocuments.photo.name
            },
            applicationDate: new Date().toISOString(),
            status: 'pending-payment'
        };
        
        sessionStorage.setItem('paymentData', JSON.stringify(completeApplicationData));
        
        // Simulate document upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Hide loading
        document.getElementById('loadingOverlay').style.display = 'none';
        
        // Redirect to payment page
        window.location.href = 'payment-health.html';
        
    } catch (error) {
        console.error('Error submitting application:', error);
        document.getElementById('loadingOverlay').style.display = 'none';
        
        alert('Error submitting application: ' + error.message + '\n\nPlease check your details and try again.');
    }
}

// Auto-fill city and state based on pincode (optional enhancement)
document.getElementById('pincode')?.addEventListener('blur', async function() {
    const pincode = this.value;
    
    if (pincode && pincode.length === 6) {
        // In production, call a pincode API to get city/state
        // For now, we'll leave it for manual entry
    }
});
