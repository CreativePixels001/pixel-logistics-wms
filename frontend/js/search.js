// Global Search Functionality with Elastic Search-like Autocomplete
// ================================================================

// Search data structure - contains all searchable items across the WMS
const searchData = {
  pages: [
    { title: 'Dashboard', description: 'Real-time operations overview', url: 'index.html', category: 'Main' },
    { title: 'Receipt Processing', description: 'Manage inbound receipts and ASNs', url: 'receiving.html', category: 'Inbound' },
    { title: 'ASN Receipt', description: 'Advanced Shipment Notice processing', url: 'asn-receipt.html', category: 'Inbound' },
    { title: 'Quality Inspection', description: 'Inspect and assign quality status', url: 'inspection.html', category: 'Inbound' },
    { title: 'Put-away Operations', description: 'Manage LPN put-away tasks', url: 'putaway.html', category: 'Inbound' },
    { title: 'Inventory Management', description: 'Track stock levels and locations', url: 'inventory.html', category: 'Inventory' },
    { title: 'Location Management', description: 'Warehouse layout and zones', url: 'location-management.html', category: 'Inventory' },
    { title: 'LPN Management', description: 'License plate number lifecycle', url: 'lpn-management.html', category: 'Inventory' },
    { title: 'Cycle Count', description: 'Inventory accuracy tracking', url: 'cycle-count.html', category: 'Inventory' },
    { title: 'Lot Traceability', description: 'Track lot numbers and expiry', url: 'lot-traceability.html', category: 'Inventory' },
    { title: 'Replenishment', description: 'Min/max inventory replenishment', url: 'replenishment.html', category: 'Inventory' },
    { title: 'Order Management', description: 'Create and manage orders', url: 'orders.html', category: 'Outbound' },
    { title: 'Picking Operations', description: 'Execute pick tasks and waves', url: 'picking.html', category: 'Outbound' },
    { title: 'Packing Operations', description: 'Pack orders for shipment', url: 'packing.html', category: 'Outbound' },
    { title: 'Shipping', description: 'Process shipments and BOLs', url: 'shipping.html', category: 'Outbound' },
    { title: 'Cross-Docking', description: 'Dock-to-dock operations', url: 'crossdock.html', category: 'Outbound' },
    { title: 'Quality Inspection', description: 'Defect recording and holds', url: 'quality-inspection.html', category: 'Quality' },
    { title: 'Returns Processing', description: 'RMA and return-to-supplier', url: 'returns.html', category: 'Returns' },
    { title: 'Kitting & Assembly', description: 'Build kits and assemblies', url: 'kitting.html', category: 'Operations' },
    { title: 'Labeling Operations', description: 'Print and manage labels', url: 'labeling.html', category: 'Operations' },
    { title: 'Task Management', description: 'Warehouse task orchestration', url: 'task-management.html', category: 'Operations' },
    { title: 'Reports & Analytics', description: 'Performance dashboards', url: 'reports.html', category: 'Analytics' }
  ],
  quickActions: [
    { title: 'Receive Shipment', description: 'Start receipt process', url: 'receiving.html', icon: 'package' },
    { title: 'Create Order', description: 'New order entry', url: 'orders.html', icon: 'file-plus' },
    { title: 'Start Picking', description: 'Begin pick wave', url: 'picking.html', icon: 'list' },
    { title: 'Process Return', description: 'Handle RMA', url: 'returns.html', icon: 'rotate-ccw' },
    { title: 'Cycle Count', description: 'Inventory verification', url: 'cycle-count.html', icon: 'check-square' },
    { title: 'Generate Report', description: 'Analytics dashboard', url: 'reports.html', icon: 'bar-chart' }
  ],
  recentItems: [
    { title: 'ASN-2024-0015', description: 'Received 2 hours ago', url: 'asn-receipt.html', type: 'ASN' },
    { title: 'Order #WO-45892', description: 'In picking', url: 'orders.html', type: 'Order' },
    { title: 'LPN-000123456', description: 'Location A-01-02-03', url: 'lpn-management.html', type: 'LPN' },
    { title: 'Cycle Count - Zone A', description: 'Completed 98.5%', url: 'cycle-count.html', type: 'Task' }
  ]
};

// Search state
let searchActive = false;
let searchInput = null;
let searchOverlay = null;
let searchContainer = null;
let searchSuggestions = null;

// Initialize search functionality - redirect to dedicated search page
function initializeSearch() {
  searchInput = document.getElementById('globalSearchInput');

  if (!searchInput) return;

  // Redirect to search page on click
  searchInput.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'search.html';
  });

  // Also redirect on focus
  searchInput.addEventListener('focus', (e) => {
    e.preventDefault();
    searchInput.blur();
    window.location.href = 'search.html';
  });

  // Keyboard shortcut: Cmd+K or Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      window.location.href = 'search.html';
    }
  });
}

// Removed - search functionality moved to dedicated search.html page
// All overlay, blur, and search logic now handled in search-page.js// Perform elastic search-like autocomplete
function performSearch() {
  const query = searchInput.value.trim().toLowerCase();

  if (query === '') {
    renderQuickAccess();
    return;
  }

  // Fuzzy search algorithm
  const results = {
    pages: [],
    actions: [],
    recent: []
  };

  // Search pages
  searchData.pages.forEach(page => {
    const titleMatch = fuzzyMatch(query, page.title.toLowerCase());
    const descMatch = fuzzyMatch(query, page.description.toLowerCase());
    const categoryMatch = fuzzyMatch(query, page.category.toLowerCase());

    if (titleMatch.score > 0 || descMatch.score > 0 || categoryMatch.score > 0) {
      const maxScore = Math.max(titleMatch.score, descMatch.score, categoryMatch.score);
      results.pages.push({
        ...page,
        score: maxScore,
        titleHighlight: titleMatch.highlight,
        descHighlight: descMatch.highlight
      });
    }
  });

  // Search quick actions
  searchData.quickActions.forEach(action => {
    const titleMatch = fuzzyMatch(query, action.title.toLowerCase());
    const descMatch = fuzzyMatch(query, action.description.toLowerCase());

    if (titleMatch.score > 0 || descMatch.score > 0) {
      const maxScore = Math.max(titleMatch.score, descMatch.score);
      results.actions.push({
        ...action,
        score: maxScore,
        titleHighlight: titleMatch.highlight,
        descHighlight: descMatch.highlight
      });
    }
  });

  // Search recent items
  searchData.recentItems.forEach(item => {
    const titleMatch = fuzzyMatch(query, item.title.toLowerCase());
    const descMatch = fuzzyMatch(query, item.description.toLowerCase());

    if (titleMatch.score > 0 || descMatch.score > 0) {
      const maxScore = Math.max(titleMatch.score, descMatch.score);
      results.recent.push({
        ...item,
        score: maxScore,
        titleHighlight: titleMatch.highlight,
        descHighlight: descMatch.highlight
      });
    }
  });

  // Sort by score
  results.pages.sort((a, b) => b.score - a.score);
  results.actions.sort((a, b) => b.score - a.score);
  results.recent.sort((a, b) => b.score - a.score);

  // Render results
  renderSearchResults(results, query);
}

// Fuzzy match algorithm with highlighting
function fuzzyMatch(query, text) {
  const queryChars = query.split('');
  const textChars = text.split('');
  let score = 0;
  let queryIndex = 0;
  let highlight = '';
  let lastMatchIndex = -1;

  for (let i = 0; i < textChars.length && queryIndex < queryChars.length; i++) {
    if (textChars[i] === queryChars[queryIndex]) {
      score += (i === lastMatchIndex + 1) ? 2 : 1; // Bonus for consecutive matches
      highlight += `<span class="search-item-highlight">${textChars[i]}</span>`;
      lastMatchIndex = i;
      queryIndex++;
    } else {
      highlight += textChars[i];
    }
  }

  // Complete match bonus
  if (queryIndex === queryChars.length) {
    score += 10;
    
    // Exact match bonus
    if (text.includes(query)) {
      score += 20;
    }
    
    // Start match bonus
    if (text.startsWith(query)) {
      score += 15;
    }
  } else {
    score = 0; // No match
    highlight = text;
  }

  return { score, highlight };
}

// Render quick access (when search is empty)
function renderQuickAccess() {
  if (!searchSuggestions) return;

  const html = `
    <div class="search-suggestions-header">Quick Access</div>
    
    <div class="quick-access-grid">
      ${searchData.quickActions.map(action => `
        <div class="quick-access-item" onclick="navigateTo('${action.url}')">
          <div class="quick-access-icon">
            ${getIconSVG(action.icon)}
          </div>
          <div class="quick-access-title">${action.title}</div>
          <div class="quick-access-desc">${action.description}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="search-section">
      <div class="search-section-title">Recent Activity</div>
      ${searchData.recentItems.map(item => `
        <div class="search-item" onclick="navigateTo('${item.url}')">
          <div class="search-item-icon">
            ${getIconSVG('clock')}
          </div>
          <div class="search-item-content">
            <div class="search-item-title">${item.title}</div>
            <div class="search-item-description">${item.description} • ${item.type}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  searchSuggestions.innerHTML = html;
}

// Render search results
function renderSearchResults(results, query) {
  if (!searchSuggestions) return;

  const totalResults = results.pages.length + results.actions.length + results.recent.length;

  if (totalResults === 0) {
    searchSuggestions.innerHTML = `
      <div class="search-empty">
        <div class="search-empty-icon">
          ${getIconSVG('search')}
        </div>
        <div class="search-empty-text">No results found for "${query}"</div>
        <div class="search-empty-hint">Try different keywords or check spelling</div>
      </div>
    `;
    return;
  }

  let html = `<div class="search-suggestions-header">${totalResults} result${totalResults > 1 ? 's' : ''} found</div>`;

  // Pages section
  if (results.pages.length > 0) {
    html += `
      <div class="search-section">
        <div class="search-section-title">Pages (${results.pages.length})</div>
        ${results.pages.slice(0, 5).map(page => `
          <div class="search-item" onclick="navigateTo('${page.url}')">
            <div class="search-item-icon">
              ${getIconSVG('file-text')}
            </div>
            <div class="search-item-content">
              <div class="search-item-title">${page.titleHighlight || page.title}</div>
              <div class="search-item-description">${page.descHighlight || page.description} • ${page.category}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Quick actions section
  if (results.actions.length > 0) {
    html += `
      <div class="search-section">
        <div class="search-section-title">Quick Actions (${results.actions.length})</div>
        ${results.actions.slice(0, 3).map(action => `
          <div class="search-item" onclick="navigateTo('${action.url}')">
            <div class="search-item-icon">
              ${getIconSVG(action.icon)}
            </div>
            <div class="search-item-content">
              <div class="search-item-title">${action.titleHighlight || action.title}</div>
              <div class="search-item-description">${action.descHighlight || action.description}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Recent items section
  if (results.recent.length > 0) {
    html += `
      <div class="search-section">
        <div class="search-section-title">Recent Activity (${results.recent.length})</div>
        ${results.recent.map(item => `
          <div class="search-item" onclick="navigateTo('${item.url}')">
            <div class="search-item-icon">
              ${getIconSVG('clock')}
            </div>
            <div class="search-item-content">
              <div class="search-item-title">${item.titleHighlight || item.title}</div>
              <div class="search-item-description">${item.descHighlight || item.description} • ${item.type}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  searchSuggestions.innerHTML = html;
}

// Navigate to URL
function navigateTo(url) {
  window.location.href = url;
}

// Get icon SVG
function getIconSVG(icon) {
  const icons = {
    'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    'file-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    'package': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',
    'file-plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>',
    'list': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
    'rotate-ccw': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>',
    'check-square': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    'bar-chart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
    'clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
  };
  
  return icons[icon] || icons['file-text'];
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSearch);
} else {
  initializeSearch();
}
