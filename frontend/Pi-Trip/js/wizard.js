/* ===================================
   Pi-Trip - Trip Wizard JavaScript
   Multi-step trip customization flow
   ================================== */

// Wizard State
const wizardState = {
    currentStep: 1,
    totalSteps: 6,
    tripData: {
        route: null,
        tripMode: 'solo',
        guestCount: 1,
        friends: [],
        startDate: null,
        endDate: null,
        vehicleMode: 'own',
        vehicle: null,
        rental: null,
        tripName: '',
        budget: '',
        tripTypes: [],
        specialRequirements: ''
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    setMinDate();
});

// ===================================
// Navigation
// ===================================

function nextStep() {
    if (!validateStep(wizardState.currentStep)) {
        return;
    }

    if (wizardState.currentStep < wizardState.totalSteps) {
        wizardState.currentStep++;
        showStep(wizardState.currentStep);
        updateProgress();
    } else {
        // Final step - confirm and create trip
        confirmTrip();
    }
}

function previousStep() {
    if (wizardState.currentStep > 1) {
        wizardState.currentStep--;
        showStep(wizardState.currentStep);
        updateProgress();
    }
}

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show current step
    document.getElementById(`step${stepNumber}`).classList.add('active');

    // Update progress steps
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
        } else if (index + 1 === stepNumber) {
            step.classList.add('active');
        }
    });

    // Update navigation buttons
    const btnBack = document.getElementById('btnBack');
    const btnNext = document.getElementById('btnNext');

    if (stepNumber === 1) {
        btnBack.style.visibility = 'hidden';
    } else {
        btnBack.style.visibility = 'visible';
    }

    if (stepNumber === wizardState.totalSteps) {
        btnNext.textContent = 'Confirm Trip';
    } else {
        btnNext.innerHTML = `
            Next
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
            </svg>
        `;
    }

    // Special handling for review step
    if (stepNumber === 6) {
        generateSummary();
    }
}

function updateProgress() {
    const progress = (wizardState.currentStep / wizardState.totalSteps) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// ===================================
// Step 1: Route Selection
// ===================================

function selectRoute(routeId) {
    wizardState.tripData.route = routeId;

    // Visual feedback
    document.querySelectorAll('.route-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.route-option').classList.add('selected');
}

function searchRoutes(query) {
    // In a real app, this would filter routes
    console.log('Searching for:', query);
}

// ===================================
// Step 2: Group Setup
// ===================================

function setTripMode(mode) {
    wizardState.tripData.tripMode = mode;

    // Visual feedback
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.mode-btn').classList.add('active');

    // Show/hide group details
    const groupDetails = document.getElementById('groupDetails');
    if (mode === 'group') {
        groupDetails.style.display = 'block';
        wizardState.tripData.guestCount = 2;
        document.getElementById('guestCount').value = 2;
    } else {
        groupDetails.style.display = 'none';
        wizardState.tripData.guestCount = 1;
        wizardState.tripData.friends = [];
    }
}

function changeGuestCount(change) {
    const input = document.getElementById('guestCount');
    let currentValue = parseInt(input.value) || 2;
    let newValue = currentValue + change;

    if (newValue >= 2 && newValue <= 20) {
        input.value = newValue;
        wizardState.tripData.guestCount = newValue;
    }
}

function addFriend() {
    const input = document.getElementById('friendInput');
    const value = input.value.trim();

    if (value) {
        wizardState.tripData.friends.push(value);
        renderFriendsList();
        input.value = '';
        showNotification(`Added: ${value}`, 'success');
    }
}

function removeFriend(index) {
    wizardState.tripData.friends.splice(index, 1);
    renderFriendsList();
}

function renderFriendsList() {
    const container = document.getElementById('friendsList');
    container.innerHTML = wizardState.tripData.friends.map((friend, index) => `
        <div class="friend-item">
            <span>${friend}</span>
            <button onclick="removeFriend(${index})">✕</button>
        </div>
    `).join('');
}

// ===================================
// Step 3: Dates
// ===================================

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput) startDateInput.min = today;
    if (endDateInput) endDateInput.min = today;
}

function updateDuration() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    wizardState.tripData.startDate = startDate;
    wizardState.tripData.endDate = endDate;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const durationDisplay = document.getElementById('durationDisplay');
        durationDisplay.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>${diffDays} days trip planned!</span>
        `;
    }
}

function setQuickDate(option) {
    const today = new Date();
    let startDate, endDate;

    if (option === 'weekend') {
        // Get next Saturday
        const nextSaturday = new Date(today);
        nextSaturday.setDate(today.getDate() + (6 - today.getDay()));
        startDate = nextSaturday;
        endDate = new Date(nextSaturday);
        endDate.setDate(endDate.getDate() + 1);
    } else if (option === 'nextWeek') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() + 7);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
    } else if (option === 'nextMonth') {
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() + 1);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
    }

    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    updateDuration();
}

// ===================================
// Step 4: Vehicle Selection
// ===================================

function setVehicleMode(mode) {
    wizardState.tripData.vehicleMode = mode;

    // Visual feedback
    document.querySelectorAll('.vehicle-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.vehicle-mode-btn').classList.add('active');

    // Show/hide vehicle options
    const ownOptions = document.getElementById('ownVehicleOptions');
    const rentalOptions = document.getElementById('rentalVehicleOptions');

    if (mode === 'own') {
        ownOptions.style.display = 'grid';
        rentalOptions.style.display = 'none';
        wizardState.tripData.rental = null;
    } else {
        ownOptions.style.display = 'none';
        rentalOptions.style.display = 'grid';
        wizardState.tripData.vehicle = null;
    }
}

function selectVehicle(vehicleType) {
    wizardState.tripData.vehicle = vehicleType;

    // Visual feedback
    document.querySelectorAll('.vehicle-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.vehicle-card').classList.add('selected');
}

function selectRental(vehicleType, pricePerDay) {
    wizardState.tripData.rental = {
        type: vehicleType,
        pricePerDay: pricePerDay
    };

    // Visual feedback
    document.querySelectorAll('.rental-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.rental-card').classList.add('selected');
}

// ===================================
// Step 5: Trip Details
// ===================================

// Collect trip details when leaving step 5
function collectTripDetails() {
    wizardState.tripData.tripName = document.getElementById('tripName').value;
    wizardState.tripData.budget = document.getElementById('budgetRange').value;

    // Collect selected trip types
    const selectedTypes = [];
    document.querySelectorAll('.checkbox-group input:checked').forEach(checkbox => {
        selectedTypes.push(checkbox.value);
    });
    wizardState.tripData.tripTypes = selectedTypes;

    wizardState.tripData.specialRequirements = document.getElementById('specialRequirements').value;
}

// ===================================
// Step 6: Review & Confirm
// ===================================

function generateSummary() {
    collectTripDetails();

    const routeNames = {
        'MLH-001': 'Manali to Leh Highway',
        'MGO-001': 'Mumbai to Goa Coastal',
        'GT-001': 'Golden Triangle Circuit',
        'CUSTOM': 'Custom Route'
    };

    const tripSummary = document.getElementById('tripSummary');
    tripSummary.innerHTML = `
        <h3 style="margin-bottom: 1rem; font-size: 1.25rem;">Trip Summary</h3>
        ${createSummaryItem('Route', routeNames[wizardState.tripData.route] || 'Not selected')}
        ${createSummaryItem('Trip Mode', wizardState.tripData.tripMode === 'solo' ? 'Solo Ride' : `Group (${wizardState.tripData.guestCount} people)`)}
        ${createSummaryItem('Dates', wizardState.tripData.startDate && wizardState.tripData.endDate ? `${formatDate(wizardState.tripData.startDate)} to ${formatDate(wizardState.tripData.endDate)}` : 'Not selected')}
        ${createSummaryItem('Vehicle', wizardState.tripData.vehicleMode === 'own' ? `Own ${wizardState.tripData.vehicle || 'vehicle'}` : 'Rental')}
        ${wizardState.tripData.tripName ? createSummaryItem('Trip Name', wizardState.tripData.tripName) : ''}
        ${wizardState.tripData.budget ? createSummaryItem('Budget', wizardState.tripData.budget.replace('budget', 'Budget Friendly').replace('moderate', 'Moderate').replace('premium', 'Premium').replace('flexible', 'Flexible')) : ''}
    `;

    // Calculate costs
    generateCostBreakdown();
}

function createSummaryItem(label, value) {
    return `
        <div class="summary-item">
            <span class="summary-label">${label}</span>
            <span class="summary-value">${value}</span>
        </div>
    `;
}

function generateCostBreakdown() {
    const costBreakdown = document.getElementById('costBreakdown');

    // Demo calculation
    const baseCost = 25000;
    const guestMultiplier = wizardState.tripData.tripMode === 'group' ? wizardState.tripData.guestCount : 1;
    const rentalCost = wizardState.tripData.rental ? wizardState.tripData.rental.pricePerDay * 10 : 0;
    const total = (baseCost * guestMultiplier) + rentalCost;

    costBreakdown.innerHTML = `
        <h3 style="margin-bottom: 1rem; font-size: 1.25rem;">Estimated Cost Breakdown</h3>
        ${createSummaryItem('Base Package', `₹${baseCost.toLocaleString()}`)}
        ${wizardState.tripData.tripMode === 'group' ? createSummaryItem('Group Size', `× ${guestMultiplier} people`) : ''}
        ${rentalCost > 0 ? createSummaryItem('Vehicle Rental', `₹${rentalCost.toLocaleString()}`) : ''}
        <div class="summary-item" style="border-top: 2px solid #000; padding-top: 1rem; margin-top: 1rem;">
            <span class="summary-label" style="font-size: 1.25rem;">Total</span>
            <span class="summary-value" style="font-size: 1.5rem;">₹${total.toLocaleString()}</span>
        </div>
        <p style="margin-top: 1rem; font-size: 0.875rem; color: #666; text-align: center;">
            *This is an estimate. Final cost may vary based on actual bookings.
        </p>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ===================================
// Validation
// ===================================

function validateStep(stepNumber) {
    switch (stepNumber) {
        case 1:
            if (!wizardState.tripData.route) {
                showNotification('Please select a route', 'warning');
                return false;
            }
            break;
        case 2:
            if (wizardState.tripData.tripMode === 'group' && wizardState.tripData.guestCount < 2) {
                showNotification('Group trip requires at least 2 people', 'warning');
                return false;
            }
            break;
        case 3:
            if (!wizardState.tripData.startDate || !wizardState.tripData.endDate) {
                showNotification('Please select start and end dates', 'warning');
                return false;
            }
            break;
        case 4:
            if (wizardState.tripData.vehicleMode === 'own' && !wizardState.tripData.vehicle) {
                showNotification('Please select a vehicle type', 'warning');
                return false;
            }
            if (wizardState.tripData.vehicleMode === 'rental' && !wizardState.tripData.rental) {
                showNotification('Please select a rental vehicle', 'warning');
                return false;
            }
            break;
        case 5:
            collectTripDetails();
            if (!wizardState.tripData.tripName) {
                showNotification('Please enter a trip name', 'warning');
                return false;
            }
            break;
    }
    return true;
}

// ===================================
// Confirm Trip
// ===================================

function confirmTrip() {
    console.log('Trip confirmed!', wizardState.tripData);

    showNotification('Trip created successfully! Redirecting...', 'success');

    // In a real app, this would save to backend
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 2000);
}

// ===================================
// Close Wizard
// ===================================

function closeWizard() {
    if (confirm('Are you sure? Your progress will be lost.')) {
        window.location.href = '../index.html';
    }
}

// ===================================
// Notifications
// ===================================

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        background: type === 'success' ? '#000' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: '#fff',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: '99999',
        fontWeight: '600',
        fontSize: '0.875rem',
        maxWidth: '400px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export functions
window.nextStep = nextStep;
window.previousStep = previousStep;
window.selectRoute = selectRoute;
window.searchRoutes = searchRoutes;
window.setTripMode = setTripMode;
window.changeGuestCount = changeGuestCount;
window.addFriend = addFriend;
window.removeFriend = removeFriend;
window.updateDuration = updateDuration;
window.setQuickDate = setQuickDate;
window.setVehicleMode = setVehicleMode;
window.selectVehicle = selectVehicle;
window.selectRental = selectRental;
window.closeWizard = closeWizard;

console.log('%c Pi-Trip Wizard 🧙‍♂️', 'font-size: 20px; font-weight: bold; color: #000;');
