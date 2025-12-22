// Health Insurance Quotes Comparison JavaScript

let quotesData = [];
let quoteInputData = {};

// Sample insurer data
const insurers = [
    {
        id: 'star-health',
        name: 'Star Health Insurance',
        logo: 'SH',
        rating: 4.5,
        reviews: 12543,
        claimSettlement: 92,
        baseMultiplier: 1.0
    },
    {
        id: 'hdfc-ergo',
        name: 'HDFC ERGO Health',
        logo: 'HE',
        rating: 4.4,
        reviews: 9876,
        claimSettlement: 89,
        baseMultiplier: 0.95
    },
    {
        id: 'care-health',
        name: 'Care Health Insurance',
        logo: 'CH',
        rating: 4.6,
        reviews: 8234,
        claimSettlement: 94,
        baseMultiplier: 1.05
    },
    {
        id: 'max-bupa',
        name: 'Niva Bupa Health',
        logo: 'NB',
        rating: 4.3,
        reviews: 7654,
        claimSettlement: 88,
        baseMultiplier: 0.98
    },
    {
        id: 'icici-lombard',
        name: 'ICICI Lombard Health',
        logo: 'IL',
        rating: 4.5,
        reviews: 11234,
        claimSettlement: 91,
        baseMultiplier: 1.02
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadQuoteData();
    generateQuotes();
    displayQuotes();
    setupEventListeners();
});

function loadQuoteData() {
    // Get quote data from sessionStorage
    const storedData = sessionStorage.getItem('healthQuoteData');
    
    if (storedData) {
        quoteInputData = JSON.parse(storedData);
        
        // Update summary display
        document.getElementById('coverageDisplay').textContent = formatCurrency(quoteInputData.coverageAmount);
        document.getElementById('typeDisplay').textContent = quoteInputData.coverageType === 'individual' ? 'Individual' : 'Family';
        document.getElementById('ageDisplay').textContent = quoteInputData.age + ' years';
        document.getElementById('locationDisplay').textContent = quoteInputData.pincode || 'India';
    } else {
        // Default data if no stored data
        quoteInputData = {
            coverageAmount: 500000,
            coverageType: 'individual',
            age: 25,
            premium: {
                basePremium: 8000,
                addons: 2000,
                gst: 1800,
                totalPremium: 11800
            }
        };
    }
}

function generateQuotes() {
    quotesData = insurers.map((insurer, index) => {
        const basePremium = quoteInputData.premium?.basePremium || 8000;
        const multiplier = insurer.baseMultiplier;
        
        // Calculate premium with variation
        const adjustedBase = Math.round(basePremium * multiplier);
        const addonsCost = quoteInputData.premium?.addons || 0;
        const subtotal = adjustedBase + addonsCost;
        const gst = Math.round(subtotal * 0.18);
        const total = subtotal + gst;
        
        // Calculate savings (compared to first quote or market average)
        const marketAvg = basePremium * 1.15;
        const savings = Math.max(0, Math.round(marketAvg - total));
        
        return {
            id: insurer.id,
            insurerName: insurer.name,
            logo: insurer.logo,
            planName: getPlanName(quoteInputData.coverageAmount),
            rating: insurer.rating,
            reviews: insurer.reviews,
            claimSettlement: insurer.claimSettlement,
            premium: {
                base: adjustedBase,
                addons: addonsCost,
                gst: gst,
                total: total
            },
            savings: savings,
            features: {
                coverage: quoteInputData.coverageAmount,
                roomRent: quoteInputData.coverageAmount >= 1000000 ? 'No Limit' : '1% of SI',
                cashlessHospitals: 10000 + Math.round(Math.random() * 5000),
                claimSettlement: insurer.claimSettlement + '%',
                prePostHospitalization: '60+90 days',
                dayCare: 'Covered',
                ambulance: '₹2,000',
                noClaimBonus: '50%'
            },
            highlights: [
                'Cashless hospitalization at network hospitals',
                'Coverage for pre & post hospitalization expenses',
                'Day care procedures covered',
                'Free annual health checkup',
                'No claim bonus up to 50%',
                'Ambulance charges covered',
                'Restore benefit available',
                'Lifetime renewability'
            ],
            recommended: index === 0 // First one is recommended
        };
    });
    
    // Sort by premium (low to high)
    quotesData.sort((a, b) => a.premium.total - b.premium.total);
    
    // Mark cheapest as recommended
    if (quotesData.length > 0) {
        quotesData.forEach(q => q.recommended = false);
        quotesData[0].recommended = true;
    }
}

function getPlanName(coverage) {
    if (coverage >= 10000000) return 'Supreme Health Plan';
    if (coverage >= 5000000) return 'Premium Health Plus';
    if (coverage >= 2000000) return 'Super Saver Health';
    if (coverage >= 1000000) return 'Health Optima';
    if (coverage >= 500000) return 'Family Health Shield';
    return 'Essential Health Care';
}

function displayQuotes() {
    const grid = document.getElementById('quotesGrid');
    grid.innerHTML = '';
    
    document.getElementById('quotesCount').textContent = quotesData.length;
    
    quotesData.forEach(quote => {
        const card = createQuoteCard(quote);
        grid.appendChild(card);
    });
}

function createQuoteCard(quote) {
    const card = document.createElement('div');
    card.className = 'quote-card' + (quote.recommended ? ' recommended' : '');
    
    card.innerHTML = `
        ${quote.recommended ? '<div class="recommended-badge">Recommended</div>' : ''}
        
        <div class="quote-header">
            <div class="insurer-info">
                <div class="insurer-logo">${quote.logo}</div>
                <div class="insurer-details">
                    <h3>${quote.insurerName}</h3>
                    <div class="plan-name">${quote.planName}</div>
                    <div class="rating">
                        <span class="stars">${getStars(quote.rating)}</span>
                        <span>${quote.rating}</span>
                        <span class="rating-count">(${quote.reviews.toLocaleString()} reviews)</span>
                    </div>
                </div>
            </div>
            <div class="quote-price">
                <div class="price-label">Annual Premium</div>
                <div class="price-amount">
                    ₹${quote.premium.total.toLocaleString('en-IN')}
                    <span class="price-period">/year</span>
                </div>
                ${quote.savings > 0 ? `<div class="price-savings">Save ₹${quote.savings.toLocaleString('en-IN')}</div>` : ''}
            </div>
        </div>

        <div class="quote-features">
            <div class="feature-item">
                <span class="label">Sum Insured</span>
                <span class="value">${formatCurrency(quote.features.coverage)}</span>
            </div>
            <div class="feature-item">
                <span class="label">Room Rent</span>
                <span class="value">${quote.features.roomRent}</span>
            </div>
            <div class="feature-item">
                <span class="label">Cashless Hospitals</span>
                <span class="value">${quote.features.cashlessHospitals.toLocaleString()}+</span>
            </div>
            <div class="feature-item">
                <span class="label">Claim Settlement</span>
                <span class="value">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    ${quote.features.claimSettlement}
                </span>
            </div>
        </div>

        <div class="quote-highlights">
            <h4 class="highlights-title">Key Features</h4>
            <ul class="highlights-list">
                ${quote.highlights.slice(0, 6).map(h => `
                    <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        ${h}
                    </li>
                `).join('')}
            </ul>
        </div>

        <div class="quote-actions">
            <button class="btn-secondary" onclick="viewDetails('${quote.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                View Details
            </button>
            <button class="btn-primary" onclick="selectPlan('${quote.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Buy This Plan
            </button>
        </div>
    `;
    
    return card;
}

function getStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '☆';
    return stars;
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
    // Sort dropdown
    document.getElementById('sortBy').addEventListener('change', function() {
        sortQuotes(this.value);
    });
    
    // Online only toggle
    document.getElementById('onlineOnly').addEventListener('change', function() {
        if (this.checked) {
            // Filter online plans only (for now, show all)
            displayQuotes();
        } else {
            displayQuotes();
        }
    });
}

function sortQuotes(sortBy) {
    switch (sortBy) {
        case 'premium-low':
            quotesData.sort((a, b) => a.premium.total - b.premium.total);
            break;
        case 'premium-high':
            quotesData.sort((a, b) => b.premium.total - a.premium.total);
            break;
        case 'coverage-high':
            quotesData.sort((a, b) => b.features.coverage - a.features.coverage);
            break;
        case 'rating':
            quotesData.sort((a, b) => b.rating - a.rating);
            break;
    }
    displayQuotes();
}

function viewDetails(quoteId) {
    const quote = quotesData.find(q => q.id === quoteId);
    if (!quote) return;
    
    // Show detailed comparison modal or navigate to details page
    alert(`Viewing details for ${quote.insurerName} - ${quote.planName}\n\nThis feature will show complete plan details, coverage, exclusions, and terms.`);
}

function selectPlan(quoteId) {
    const quote = quotesData.find(q => q.id === quoteId);
    if (!quote) return;
    
    // Store selected quote data
    const applicationData = {
        ...quoteInputData,
        selectedQuote: quote,
        insurerName: quote.insurerName,
        planName: quote.planName,
        premium: quote.premium
    };
    
    sessionStorage.setItem('applicationData', JSON.stringify(applicationData));
    
    // Navigate to application form
    window.location.href = 'application-health.html';
}

function closeComparisonModal() {
    document.getElementById('comparisonModal').classList.remove('active');
}
