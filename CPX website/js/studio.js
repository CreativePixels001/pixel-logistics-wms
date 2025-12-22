/**
 * Pixel Studio - Product Catalog JavaScript
 */

// Category data with product mappings
const categoryData = {
    logistics: {
        title: 'LOGISTICS',
        subtitle: 'Supply Chain & Transport Solutions',
        products: ['WMS', 'TMS', 'DTS'],
        features: [
            'Real-time Fleet Tracking & Monitoring',
            'Advanced Warehouse Management',
            'Intelligent Route Optimization',
            'Multi-location Inventory Control',
            'Automated Dispatch & Scheduling',
            'Comprehensive Driver Management',
            'Smart Load Planning & Optimization',
            'Real-time Analytics Dashboard'
        ],
        screenshots: [
            'images/demo/logistics-1.jpg',
            'images/demo/logistics-2.jpg',
            'images/demo/logistics-3.jpg',
            'images/demo/logistics-4.jpg',
            'images/demo/logistics-5.jpg'
        ],
        productUrls: {
            'WMS': 'wms.html',
            'TMS': 'tms.html',
            'DTS': 'dts.html'
        }
    },
    administration: {
        title: 'ADMINISTRATION',
        subtitle: 'People & HR Management',
        products: ['PMS', 'HRM'],
        features: [
            'Centralized Employee Database',
            'Biometric Attendance Tracking',
            'Automated Payroll Processing',
            'Performance Review Management',
            'Leave & Time-off Management',
            'Recruitment & Onboarding Portal',
            'Digital Document Management',
            'Compliance & Policy Tracking'
        ],
        screenshots: [
            'images/demo/admin-1.jpg',
            'images/demo/admin-2.jpg',
            'images/demo/admin-3.jpg',
            'images/demo/admin-4.jpg',
            'images/demo/admin-5.jpg'
        ],
        productUrls: {
            'PMS': 'pms.html',
            'HRM': 'hrm.html'
        }
    },
    management: {
        title: 'MANAGEMENT',
        subtitle: 'Business Operations & CRM',
        products: ['ERP', 'CRM'],
        features: [
            'Customer Relationship Management',
            'Sales Pipeline & Forecasting',
            'Integrated Financial Management',
            'Order Processing & Fulfillment',
            'Vendor & Supplier Management',
            'Advanced Reporting & Analytics',
            'Multi-location Business Support',
            'Comprehensive API Integration'
        ],
        screenshots: [
            'images/demo/mgmt-1.jpg',
            'images/demo/mgmt-2.jpg',
            'images/demo/mgmt-3.jpg',
            'images/demo/mgmt-4.jpg',
            'images/demo/mgmt-5.jpg'
        ],
        productUrls: {
            'ERP': 'erp.html',
            'CRM': 'crm.html'
        }
    },
    operations: {
        title: 'OPERATIONS',
        subtitle: 'Manufacturing & Quality Control',
        products: ['MES', 'QMS'],
        features: [
            'Production Planning & Scheduling',
            'Quality Control & Assurance',
            'Equipment & Asset Management',
            'Real-time Process Monitoring',
            'Batch & Lot Tracking',
            'Regulatory Compliance Management',
            'Defect & Issue Management',
            'Performance Metrics & KPIs'
        ],
        screenshots: [
            'images/demo/ops-1.jpg',
            'images/demo/ops-2.jpg',
            'images/demo/ops-3.jpg',
            'images/demo/ops-4.jpg',
            'images/demo/ops-5.jpg'
        ],
        productUrls: {
            'MES': 'mes.html',
            'QMS': 'qms.html'
        }
    }
};

let currentCategory = null;
let currentScreenIndex = 0;

// Open demo modal
function buyProduct(category) {
    currentCategory = category;
    currentScreenIndex = 0;
    
    const data = categoryData[category];
    if (!data) return;
    
    // Set modal content
    document.getElementById('demoTitle').textContent = data.title;
    document.getElementById('demoSubtitle').textContent = data.subtitle;
    
    // Set features
    const featuresList = document.getElementById('demoFeatures');
    featuresList.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
    
    // Set screenshot
    updateScreenshot();
    
    // Show modal with slight delay for smooth animation
    setTimeout(() => {
        document.getElementById('demoModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 50);
}

// Close demo modal
function closeDemo() {
    document.getElementById('demoModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Update screenshot display
function updateScreenshot() {
    const data = categoryData[currentCategory];
    const totalScreens = data.screenshots.length;
    
    document.getElementById('currentScreen').textContent = currentScreenIndex + 1;
    document.getElementById('totalScreens').textContent = totalScreens;
    
    // Create enhanced placeholder
    const deviceScreen = document.querySelector('.device-screen');
    deviceScreen.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem;">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
            <div style="text-align: center;">
                <p style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                    ${data.title}
                </p>
                <p style="margin: 1rem 0 0 0; font-size: 14px; letter-spacing: 0.05em; color: #666;">
                    Demo Screenshot ${currentScreenIndex + 1} of ${totalScreens}
                </p>
            </div>
        </div>
    `;
}

// Navigate screenshots
function nextScreen() {
    const data = categoryData[currentCategory];
    currentScreenIndex = (currentScreenIndex + 1) % data.screenshots.length;
    updateScreenshot();
}

function prevScreen() {
    const data = categoryData[currentCategory];
    currentScreenIndex = (currentScreenIndex - 1 + data.screenshots.length) % data.screenshots.length;
    updateScreenshot();
}

// Buy from demo modal
function buyFromDemo() {
    const data = categoryData[currentCategory];
    sessionStorage.setItem('selectedCategory', currentCategory);
    
    // Create product selection modal or redirect
    const products = data.products;
    if (products.length === 1) {
        // If only one product, go directly to checkout
        window.location.href = 'checkout.html?product=' + products[0].toLowerCase();
    } else {
        // Show product selection
        showProductSelection();
    }
}

// Show product selection overlay
function showProductSelection() {
    const data = categoryData[currentCategory];
    const products = data.products;
    
    const selectionHtml = `
        <div style="position: fixed; z-index: 20000; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center;" id="productSelection">
            <div style="background: white; padding: 4rem; max-width: 600px; width: 90%; text-align: center;">
                <h3 style="font-size: 28px; font-weight: 700; letter-spacing: 0.1em; margin: 0 0 2rem 0;">SELECT PRODUCT</h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${products.map(p => `
                        <button onclick="window.location.href='checkout.html?product=${p.toLowerCase()}'" 
                                style="padding: 2rem; font-size: 18px; font-weight: 600; letter-spacing: 0.15em; background: white; border: 2px solid black; cursor: pointer; transition: all 0.3s;">
                            ${p}
                        </button>
                    `).join('')}
                </div>
                <button onclick="document.getElementById('productSelection').remove()" 
                        style="margin-top: 2rem; padding: 1rem 3rem; background: black; color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.1em;">
                    CANCEL
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', selectionHtml);
}

// Live demo from modal - opens the first product page for the category
function liveDemoFromModal() {
    const data = categoryData[currentCategory];
    const products = data.products;
    
    // If multiple products, show selection
    if (products.length > 1) {
        const selectionHtml = `
            <div style="position: fixed; z-index: 20000; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center;" id="demoSelection">
                <div style="background: white; padding: 4rem; max-width: 600px; width: 90%; text-align: center;">
                    <h3 style="font-size: 28px; font-weight: 700; letter-spacing: 0.1em; margin: 0 0 2rem 0; text-transform: uppercase;">SELECT PRODUCT FOR DEMO</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${products.map(p => `
                            <button onclick="navigateToProduct('${data.productUrls[p]}')" 
                                    style="padding: 2rem; font-size: 18px; font-weight: 600; letter-spacing: 0.15em; background: white; border: 2px solid black; cursor: pointer; transition: all 0.3s; text-transform: uppercase;">
                                ${p} - Live Demo
                            </button>
                        `).join('')}
                    </div>
                    <button onclick="document.getElementById('demoSelection').remove()" 
                            style="margin-top: 2rem; padding: 1rem 3rem; background: black; color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
                        CANCEL
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', selectionHtml);
    } else {
        // If only one product, navigate directly
        const productUrl = data.productUrls[products[0]];
        navigateToProduct(productUrl);
    }
}

// Navigate to product page
function navigateToProduct(url) {
    window.location.href = url;
}

// Close modal on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDemo();
    }
});

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('demoModal');
    if (e.target === modal) {
        closeDemo();
    }
});

// Add smooth scroll behavior
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pixel Studio initialized');
    
    // Add hover effect sounds (optional)
    const cards = document.querySelectorAll('.category-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.willChange = 'transform';
        });
        card.addEventListener('mouseleave', function() {
            this.style.willChange = 'auto';
        });
    });
});
