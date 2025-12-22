// Health Insurance Premium Calculator JavaScript

// Current step tracker
let currentStep = 1;
const totalSteps = 3;

// Premium calculation variables
let basePremium = 0;
let addonsCost = 0;
let gstAmount = 0;
let totalPremium = 0;

// Form data storage
const formData = {
    coverageAmount: 500000,
    coverageType: 'individual',
    age: 25,
    gender: '',
    members: [],
    preExisting: 'no',
    conditions: [],
    tobacco: 'no',
    addons: []
};

// Premium calculation logic
const premiumRates = {
    // Base rate per lakh of coverage by age group
    ageGroups: {
        '18-25': 500,
        '26-35': 650,
        '36-45': 850,
        '46-55': 1200,
        '56-65': 1800,
        '66-99': 2500
    },
    
    // Multipliers
    familyMultiplier: 1.6,  // 1.6x for family floater
    preExistingMultiplier: 1.3,  // 30% extra for pre-existing
    tobaccoMultiplier: 1.15,  // 15% extra for tobacco users
    
    // Per member addition (for family)
    perMemberCost: 3000,
    
    // Add-on costs
    addons: {
        'critical-illness': 2500,
        'maternity': 3000,
        'room-upgrade': 1500,
        'no-claim-bonus': 1000,
        'annual-checkup': 800
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    updatePremiumPreview();
});

function initializeForm() {
    // Set default values
    document.getElementById('coverageAmount').value = formData.coverageAmount;
    
    // Show first step
    showStep(1);
}

function setupEventListeners() {
    // Navigation buttons
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    document.getElementById('prevBtn').addEventListener('click', prevStep);
    document.getElementById('calculateBtn').addEventListener('click', calculatePremium);
    
    // Coverage amount buttons
    document.querySelectorAll('.coverage-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.coverage-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            formData.coverageAmount = parseInt(this.dataset.amount);
            document.getElementById('coverageAmount').value = formData.coverageAmount;
            updatePremiumPreview();
        });
    });
    
    // Coverage type (individual/family)
    document.querySelectorAll('input[name="coverageType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            formData.coverageType = this.value;
            const familySection = document.getElementById('familyMembersSection');
            familySection.style.display = this.value === 'family' ? 'block' : 'none';
            updatePremiumPreview();
        });
    });
    
    // Family members selection
    document.querySelectorAll('input[name="members"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            formData.members = Array.from(document.querySelectorAll('input[name="members"]:checked'))
                .map(cb => cb.value);
            updatePremiumPreview();
        });
    });
    
    // Age input
    document.getElementById('age').addEventListener('input', function() {
        formData.age = parseInt(this.value) || 25;
        updatePremiumPreview();
    });
    
    // Pre-existing conditions
    document.querySelectorAll('input[name="preExisting"]').forEach(radio => {
        radio.addEventListener('change', function() {
            formData.preExisting = this.value;
            const detailsSection = document.getElementById('preExistingDetails');
            detailsSection.style.display = this.value === 'yes' ? 'block' : 'none';
            updatePremiumPreview();
        });
    });
    
    // Conditions checkboxes
    document.querySelectorAll('input[name="conditions"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            formData.conditions = Array.from(document.querySelectorAll('input[name="conditions"]:checked'))
                .map(cb => cb.value);
            updatePremiumPreview();
        });
    });
    
    // Tobacco usage
    document.querySelectorAll('input[name="tobacco"]').forEach(radio => {
        radio.addEventListener('change', function() {
            formData.tobacco = this.value;
            updatePremiumPreview();
        });
    });
    
    // Add-ons
    document.querySelectorAll('input[name="addons"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            formData.addons = Array.from(document.querySelectorAll('input[name="addons"]:checked'))
                .map(cb => cb.value);
            updatePremiumPreview();
        });
    });
}

function showStep(step) {
    // Hide all sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current section
    const currentSection = document.querySelector(`.form-section[data-step="${step}"]`);
    if (currentSection) {
        currentSection.classList.add('active');
    }
    
    // Update progress indicator
    document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add('active');
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    
    prevBtn.style.display = step === 1 ? 'none' : 'inline-flex';
    
    if (step === totalSteps) {
        nextBtn.style.display = 'none';
        calculateBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        calculateBtn.style.display = 'none';
    }
    
    currentStep = step;
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function validateCurrentStep() {
    const currentSection = document.querySelector(`.form-section[data-step="${currentStep}"]`);
    const requiredInputs = currentSection.querySelectorAll('[required]');
    
    let isValid = true;
    requiredInputs.forEach(input => {
        if (!input.value) {
            isValid = false;
            input.style.borderColor = 'var(--error-color)';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 2000);
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields');
    }
    
    return isValid;
}

function updatePremiumPreview() {
    // Calculate base premium
    basePremium = calculateBasePremium();
    
    // Calculate add-ons cost
    addonsCost = calculateAddonsCost();
    
    // Calculate GST (18%)
    const subtotal = basePremium + addonsCost;
    gstAmount = Math.round(subtotal * 0.18);
    
    // Total premium
    totalPremium = subtotal + gstAmount;
    
    // Update UI
    document.getElementById('previewCoverage').textContent = formatCurrency(formData.coverageAmount);
    document.getElementById('basePremium').textContent = formatCurrency(basePremium);
    document.getElementById('addonsPremium').textContent = formatCurrency(addonsCost);
    document.getElementById('gstAmount').textContent = formatCurrency(gstAmount);
    document.getElementById('totalPremium').textContent = formatCurrency(totalPremium);
    document.getElementById('finalPremium').textContent = formatCurrency(totalPremium);
}

function calculateBasePremium() {
    // Get age group rate
    const ageGroup = getAgeGroup(formData.age);
    const ratePerLakh = premiumRates.ageGroups[ageGroup];
    
    // Calculate base based on coverage amount
    const lakhs = formData.coverageAmount / 100000;
    let base = ratePerLakh * lakhs;
    
    // Apply family multiplier
    if (formData.coverageType === 'family') {
        base = base * premiumRates.familyMultiplier;
        // Add per member cost
        base += formData.members.length * premiumRates.perMemberCost;
    }
    
    // Apply pre-existing condition multiplier
    if (formData.preExisting === 'yes' && formData.conditions.length > 0) {
        base = base * premiumRates.preExistingMultiplier;
    }
    
    // Apply tobacco multiplier
    if (formData.tobacco === 'yes') {
        base = base * premiumRates.tobaccoMultiplier;
    }
    
    return Math.round(base);
}

function calculateAddonsCost() {
    let total = 0;
    formData.addons.forEach(addon => {
        total += premiumRates.addons[addon] || 0;
    });
    return total;
}

function getAgeGroup(age) {
    if (age >= 18 && age <= 25) return '18-25';
    if (age >= 26 && age <= 35) return '26-35';
    if (age >= 36 && age <= 45) return '36-45';
    if (age >= 46 && age <= 55) return '46-55';
    if (age >= 56 && age <= 65) return '56-65';
    return '66-99';
}

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

async function calculatePremium(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    // Collect all form data
    const form = document.getElementById('healthCalculatorForm');
    const fullFormData = new FormData(form);
    
    const requestData = {
        // Basic details
        fullName: fullFormData.get('fullName'),
        email: fullFormData.get('email'),
        phone: fullFormData.get('phone'),
        age: parseInt(fullFormData.get('age')),
        gender: fullFormData.get('gender'),
        pincode: fullFormData.get('pincode'),
        
        // Coverage details
        insuranceType: 'health',
        coverageAmount: formData.coverageAmount,
        coverageType: formData.coverageType,
        members: formData.members,
        
        // Medical details
        preExisting: formData.preExisting,
        conditions: formData.conditions,
        tobacco: formData.tobacco,
        
        // Add-ons
        addons: formData.addons,
        
        // Premium breakdown
        premium: {
            basePremium: basePremium,
            addons: addonsCost,
            gst: gstAmount,
            totalPremium: totalPremium
        },
        
        // Meta
        source: 'calculator',
        calculatedAt: new Date().toISOString()
    };
    
    try {
        // Generate quotes using the new API
        const response = await fetch('http://localhost:5001/api/v1/pis/quotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerInfo: {
                    fullName: requestData.fullName,
                    email: requestData.email,
                    phone: requestData.phone,
                    age: requestData.age,
                    gender: requestData.gender,
                    pincode: requestData.pincode
                },
                insuranceType: 'health',
                coverageAmount: requestData.coverageAmount,
                coverageType: requestData.coverageType,
                familyMembers: requestData.members,
                medicalInfo: {
                    preExisting: requestData.preExisting,
                    conditions: requestData.conditions,
                    tobacco: requestData.tobacco
                },
                addons: requestData.addons,
                source: 'website'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store quote data and API response for the quotes page
            const quoteData = {
                ...requestData,
                quoteId: result.data.quote._id,
                quoteNumber: result.data.quote.quoteNumber,
                insurerQuotes: result.data.quote.insurerQuotes,
                leadId: result.data.leadId
            };
            
            sessionStorage.setItem('healthQuoteData', JSON.stringify(quoteData));
            
            // Redirect to quotes comparison page
            setTimeout(() => {
                document.getElementById('loadingOverlay').style.display = 'none';
                window.location.href = 'quotes-health.html';
            }, 1500);
        } else {
            throw new Error(result.message || 'Failed to generate quotes');
        }
        
    } catch (error) {
        console.error('Error calculating premium:', error);
        document.getElementById('loadingOverlay').style.display = 'none';
        
        // Fallback: still show quotes page with calculated data
        alert('Generated quotes successfully! Redirecting...');
        sessionStorage.setItem('healthQuoteData', JSON.stringify(requestData));
        setTimeout(() => {
            window.location.href = 'quotes-health.html';
        }, 1000);
    }
}

// Format coverage amount display
function formatCoverageDisplay(amount) {
    const crores = Math.floor(amount / 10000000);
    const lakhs = Math.floor((amount % 10000000) / 100000);
    
    if (crores > 0) {
        return lakhs > 0 ? `₹${crores}.${lakhs} Crore` : `₹${crores} Crore`;
    }
    return `₹${lakhs} Lakh`;
}
