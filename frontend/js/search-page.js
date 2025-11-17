// Search Page Functionality
const searchData = {
    pages: [
        { title: 'Dashboard', description: 'Overview and analytics', url: 'index.html', category: 'Pages', icon: 'bar-chart' },
        { title: 'Receiving', description: 'Inbound shipment management', url: 'receiving.html', category: 'Pages', icon: 'file-text' },
        { title: 'Inventory', description: 'Stock levels and locations', url: 'inventory.html', category: 'Pages', icon: 'package' },
        { title: 'Orders', description: 'Order management', url: 'orders.html', category: 'Pages', icon: 'file-plus' },
        { title: 'Picking', description: 'Order picking operations', url: 'picking.html', category: 'Pages', icon: 'list' },
        { title: 'Packing', description: 'Order packing station', url: 'packing.html', category: 'Pages', icon: 'package' },
        { title: 'Shipping', description: 'Outbound shipments', url: 'shipping.html', category: 'Pages', icon: 'file-text' },
        { title: 'Put Away', description: 'Stock placement', url: 'putaway.html', category: 'Pages', icon: 'package' },
        { title: 'Replenishment', description: 'Stock replenishment', url: 'replenishment.html', category: 'Pages', icon: 'rotate-ccw' },
        { title: 'Cycle Count', description: 'Inventory counting', url: 'cycle-count.html', category: 'Pages', icon: 'check-square' },
        { title: 'Quality Inspection', description: 'Quality control', url: 'quality-inspection.html', category: 'Pages', icon: 'search' },
        { title: 'Returns', description: 'Return processing', url: 'returns.html', category: 'Pages', icon: 'rotate-ccw' },
        { title: 'LPN Management', description: 'License plate numbers', url: 'lpn-management.html', category: 'Pages', icon: 'file-text' },
        { title: 'Inspection', description: 'Item inspection', url: 'inspection.html', category: 'Pages', icon: 'search' },
        { title: 'ASN Receipt', description: 'Advanced shipping notice', url: 'asn-receipt.html', category: 'Pages', icon: 'file-text' },
        { title: 'Crossdock', description: 'Cross-docking operations', url: 'crossdock.html', category: 'Pages', icon: 'package' },
        { title: 'Kitting', description: 'Kit assembly', url: 'kitting.html', category: 'Pages', icon: 'package' },
        { title: 'Labeling', description: 'Label generation', url: 'labeling.html', category: 'Pages', icon: 'file-text' },
        { title: 'Reports', description: 'Analytics and reports', url: 'reports.html', category: 'Pages', icon: 'bar-chart' },
        { title: 'Task Management', description: 'Task tracking', url: 'task-management.html', category: 'Pages', icon: 'list' },
        { title: 'Lot Traceability', description: 'Lot tracking', url: 'lot-traceability.html', category: 'Pages', icon: 'search' },
        { title: 'Location Management', description: 'Warehouse locations', url: 'location-management.html', category: 'Pages', icon: 'package' }
    ],
    quickActions: [
        { title: 'New Receipt', description: 'Create new inbound receipt', url: 'receiving.html', icon: 'file-plus' },
        { title: 'Create Order', description: 'Create new order', url: 'orders.html', icon: 'file-plus' },
        { title: 'Start Picking', description: 'Begin picking tasks', url: 'picking.html', icon: 'list' },
        { title: 'View Inventory', description: 'Check stock levels', url: 'inventory.html', icon: 'package' },
        { title: 'Generate Report', description: 'Create new report', url: 'reports.html', icon: 'bar-chart' },
        { title: 'Manage Tasks', description: 'View and assign tasks', url: 'task-management.html', icon: 'list' }
    ],
    recentItems: [
        { title: 'Order #12345', description: 'Picking in progress', url: 'picking.html', icon: 'clock' },
        { title: 'Receipt #R-2024-001', description: 'Received 2 hours ago', url: 'receiving.html', icon: 'clock' },
        { title: 'Location A-01-05', description: 'Last updated today', url: 'location-management.html', icon: 'clock' },
        { title: 'Report: Daily Summary', description: 'Generated today', url: 'reports.html', icon: 'clock' }
    ]
};

function initializeSearchPage() {
    const input = document.getElementById('searchPageInput');
    const suggestions = document.getElementById('searchPageSuggestions');

    // Show quick access on load
    renderQuickAccessPage();

    // Search on input
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query) {
            performSearchPage(query);
        } else {
            renderQuickAccessPage();
        }
    });

    // Handle ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.history.back();
        }
    });
}

function performSearchPage(query) {
    const suggestions = document.getElementById('searchPageSuggestions');
    const lowerQuery = query.toLowerCase();
    
    // Search across all data
    const allItems = [
        ...searchData.pages,
        ...searchData.quickActions,
        ...searchData.recentItems
    ];

    const results = allItems
        .map(item => {
            const titleMatch = fuzzyMatchPage(lowerQuery, item.title.toLowerCase());
            const descMatch = fuzzyMatchPage(lowerQuery, item.description.toLowerCase());
            const bestMatch = titleMatch.score > descMatch.score ? titleMatch : descMatch;
            
            return {
                ...item,
                score: bestMatch.score,
                highlight: bestMatch.highlight
            };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    if (results.length === 0) {
        suggestions.innerHTML = `
            <div class="search-page-section">
                <div class="search-page-section-title">No Results</div>
                <div style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: var(--spacing-xl);">
                    No matches found for "${query}"
                </div>
            </div>
        `;
    } else {
        renderSearchResultsPage(results, query);
    }
}

function fuzzyMatchPage(query, text) {
    let score = 0;
    let queryIndex = 0;
    let lastMatchIndex = -1;
    let consecutiveMatches = 0;
    const highlights = [];

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
        if (text[i] === query[queryIndex]) {
            score += 1;
            
            if (i === lastMatchIndex + 1) {
                consecutiveMatches++;
                score += consecutiveMatches;
            } else {
                consecutiveMatches = 0;
            }
            
            if (queryIndex === 0 && i === 0) {
                score += 15;
            }
            
            highlights.push(i);
            lastMatchIndex = i;
            queryIndex++;
        }
    }

    if (queryIndex === query.length && text === query) {
        score += 20;
    }

    let highlightedText = '';
    for (let i = 0; i < text.length; i++) {
        if (highlights.includes(i)) {
            highlightedText += `<span class="search-page-highlight">${text[i]}</span>`;
        } else {
            highlightedText += text[i];
        }
    }

    return { score, highlight: highlightedText };
}

function renderQuickAccessPage() {
    const suggestions = document.getElementById('searchPageSuggestions');
    
    const quickAccessHTML = `
        <div class="search-page-section">
            <div class="search-page-section-title">Quick Access</div>
            <div class="quick-access-page-grid">
                ${searchData.quickActions.map(item => `
                    <div class="quick-access-page-item" onclick="navigateToPage('${item.url}')">
                        <div class="quick-access-page-icon">${getIconSVGPage(item.icon)}</div>
                        <div class="quick-access-page-title">${item.title}</div>
                        <div class="quick-access-page-desc">${item.description}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="search-page-section">
            <div class="search-page-section-title">Recent Activity</div>
            ${searchData.recentItems.map(item => `
                <div class="search-page-item" onclick="navigateToPage('${item.url}')">
                    <div class="search-page-item-icon">${getIconSVGPage(item.icon)}</div>
                    <div class="search-page-item-content">
                        <div class="search-page-item-title">${item.title}</div>
                        <div class="search-page-item-description">${item.description}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    suggestions.innerHTML = quickAccessHTML;
}

function renderSearchResultsPage(results, query) {
    const suggestions = document.getElementById('searchPageSuggestions');
    
    const categorized = {
        'Pages': results.filter(r => r.category === 'Pages'),
        'Actions': results.filter(r => searchData.quickActions.includes(r)),
        'Recent': results.filter(r => searchData.recentItems.includes(r))
    };

    let html = '';
    
    for (const [category, items] of Object.entries(categorized)) {
        if (items.length > 0) {
            html += `
                <div class="search-page-section">
                    <div class="search-page-section-title">${category}</div>
                    ${items.map(item => `
                        <div class="search-page-item" onclick="navigateToPage('${item.url}')">
                            <div class="search-page-item-icon">${getIconSVGPage(item.icon)}</div>
                            <div class="search-page-item-content">
                                <div class="search-page-item-title">${item.title}</div>
                                <div class="search-page-item-description">${item.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    suggestions.innerHTML = html;
}

function navigateToPage(url) {
    window.location.href = url;
}

function getIconSVGPage(icon) {
    const icons = {
        'search': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
        'file-text': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        'package': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16.5 9.4 7.55 4.24m0 0L3 6.82m4.55-2.58L12.05 7m0 0 4.5 2.6m-4.5-2.6v5.16M3 6.82v10.36a2 2 0 0 0 1 1.73l6 3.45a2 2 0 0 0 2 0l6-3.45a2 2 0 0 0 1-1.73V6.82a2 2 0 0 0-1-1.73l-6-3.45a2 2 0 0 0-2 0L4 5.09a2 2 0 0 0-1 1.73z"/></svg>',
        'file-plus': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
        'list': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
        'rotate-ccw': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
        'check-square': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
        'bar-chart': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
        'clock': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
    };
    return icons[icon] || icons['file-text'];
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeSearchPage);
