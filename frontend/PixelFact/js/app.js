// Pixel Fact - Advanced Application JavaScript

// Sample Article Data (Extended)
const articlesData = [
    {
        id: 1,
        title: "The Future of Artificial Intelligence in 2025",
        category: "technology",
        excerpt: "Exploring how AI is transforming industries and reshaping our daily lives with unprecedented innovation and capability.",
        author: "Dr. Sarah Chen",
        readTime: "8 min",
        date: "Dec 7, 2025",
        views: "12.5K",
        viewsNum: 12500,
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
        featured: true,
        trending: true
    },
    {
        id: 2,
        title: "India's Space Program Reaches New Milestone",
        category: "india",
        excerpt: "ISRO successfully launches Chandrayaan-4, marking another historic achievement in space exploration.",
        author: "Rajesh Kumar",
        readTime: "6 min",
        date: "Dec 7, 2025",
        views: "18.2K",
        viewsNum: 18200,
        image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=450&fit=crop",
        featured: true,
        trending: true
    },
    {
        id: 3,
        title: "Understanding Quantum Computing Basics",
        category: "science",
        excerpt: "A beginner-friendly guide to quantum computing and its potential to revolutionize computational power.",
        author: "Prof. Michael Zhang",
        readTime: "10 min",
        date: "Dec 6, 2025",
        views: "9.8K",
        viewsNum: 9800,
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop",
        featured: true,
        trending: false
    },
    {
        id: 4,
        title: "Stock Market Analysis: Tech Sector Outlook",
        category: "stocks",
        excerpt: "Expert analysis on technology stocks and emerging trends for smart investors in 2025.",
        author: "Emily Watson",
        readTime: "7 min",
        date: "Dec 6, 2025",
        views: "15.3K",
        viewsNum: 15300,
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
        trending: true
    },
    {
        id: 5,
        title: "Cricket World Cup 2025: India's Journey",
        category: "sports",
        excerpt: "Analyzing India's performance and key moments from the tournament that captivated millions.",
        author: "Vikram Patel",
        readTime: "5 min",
        date: "Dec 5, 2025",
        views: "22.7K",
        viewsNum: 22700,
        image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=450&fit=crop",
        trending: true
    },
    {
        id: 6,
        title: "Startups Revolutionizing Healthcare in India",
        category: "business",
        excerpt: "How Indian healthtech startups are making quality healthcare accessible to millions.",
        author: "Priya Sharma",
        readTime: "9 min",
        date: "Dec 5, 2025",
        views: "11.4K",
        viewsNum: 11400,
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop"
    },
    {
        id: 7,
        title: "Ancient Indian Mathematics You Never Learned",
        category: "gk",
        excerpt: "Discover the forgotten mathematical innovations from ancient India that shaped modern mathematics.",
        author: "Dr. Arun Mehta",
        readTime: "12 min",
        date: "Dec 4, 2025",
        views: "8.9K",
        viewsNum: 8900,
        image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop"
    },
    {
        id: 8,
        title: "Climate Change: What Science Says Now",
        category: "science",
        excerpt: "Latest research findings on climate change and actionable steps we can take today.",
        author: "Dr. James Wilson",
        readTime: "11 min",
        date: "Dec 4, 2025",
        views: "14.6K",
        viewsNum: 14600,
        image: "https://images.unsplash.com/photo-1569163139394-de4798aa62b0?w=800&h=450&fit=crop"
    },
    {
        id: 9,
        title: "5G Technology: A Complete Guide",
        category: "technology",
        excerpt: "Everything you need to know about 5G networks and how they're changing connectivity.",
        author: "Alex Johnson",
        readTime: "8 min",
        date: "Dec 3, 2025",
        views: "13.2K",
        viewsNum: 13200,
        image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=450&fit=crop"
    }
];

// Trending Topics (Enhanced with Professional Data)
const trendingData = [
    { 
        id: 1,
        title: "AI Regulation Debate Heats Up", 
        views: "45.2K", 
        viewsNum: 45200,
        category: "Technology",
        trend: "up",
        percentage: "+127%",
        timeframe: "Last 24h"
    },
    { 
        id: 2,
        title: "IPL 2026 Auction: Record-Breaking Bids", 
        views: "38.7K", 
        viewsNum: 38700,
        category: "Sports",
        trend: "up",
        percentage: "+89%",
        timeframe: "Last 12h"
    },
    { 
        id: 3,
        title: "Bitcoin Hits New All-Time High at $95K", 
        views: "32.4K", 
        viewsNum: 32400,
        category: "Stocks",
        trend: "up",
        percentage: "+156%",
        timeframe: "Last 6h"
    },
    { 
        id: 4,
        title: "India's Q4 GDP Growth Exceeds Expectations", 
        views: "28.9K", 
        viewsNum: 28900,
        category: "Business",
        trend: "up",
        percentage: "+64%",
        timeframe: "Last 18h"
    },
    { 
        id: 5,
        title: "SpaceX Announces Mars Mission Timeline", 
        views: "25.1K", 
        viewsNum: 25100,
        category: "Science",
        trend: "up",
        percentage: "+92%",
        timeframe: "Last 8h"
    },
    { 
        id: 6,
        title: "Chandrayaan-4 Launch Date Confirmed", 
        views: "22.3K", 
        viewsNum: 22300,
        category: "Science",
        trend: "up",
        percentage: "+73%",
        timeframe: "Last 10h"
    },
    { 
        id: 7,
        title: "Indian Startups Raise $1.2B in November", 
        views: "19.8K", 
        viewsNum: 19800,
        category: "Business",
        trend: "stable",
        percentage: "+12%",
        timeframe: "Last 24h"
    }
];

// Top Authors Data
const topAuthorsData = [
    {
        name: "Dr. Sarah Chen",
        articles: 47,
        followers: "12.5K",
        specialization: "AI & Technology",
        verified: true
    },
    {
        name: "Rajesh Kumar",
        articles: 38,
        followers: "9.8K",
        specialization: "Indian Politics & Culture",
        verified: true
    },
    {
        name: "Prof. Michael Zhang",
        articles: 42,
        followers: "11.2K",
        specialization: "Quantum Computing",
        verified: true
    },
    {
        name: "Emily Watson",
        articles: 35,
        followers: "8.7K",
        specialization: "Stock Market Analysis",
        verified: true
    },
    {
        name: "Dr. Priya Sharma",
        articles: 29,
        followers: "7.3K",
        specialization: "Healthcare Innovation",
        verified: false
    }
];

// State Management
let currentView = 'grid';
let currentCategory = 'all';
let currentSort = 'latest';
let currentReadTimeFilter = 'all';
let isDarkMode = false;
let currentPage = 1;
let articlesPerPage = 6;
let bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarks')) || [];
let readArticles = JSON.parse(localStorage.getItem('readArticles')) || [];
let totalReadTime = parseInt(localStorage.getItem('totalReadTime')) || 0;

// DOM Elements
const featuredGrid = document.getElementById('featuredGrid');
const articlesGrid = document.getElementById('articlesGrid');
const trendingList = document.getElementById('trendingList');
const categoryTabs = document.querySelectorAll('.category-tab');
const viewBtns = document.querySelectorAll('.view-btn');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const sortFilter = document.getElementById('sortFilter');
const readTimeFilter = document.getElementById('readTimeFilter');
const resetFilters = document.getElementById('resetFilters');
const articleCount = document.getElementById('articleCount');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const paginationInfo = document.getElementById('paginationInfo');
const bookmarksList = document.getElementById('bookmarksList');

// Initialize App
function init() {
    loadFeaturedArticles();
    loadArticles();
    loadTrending();
    loadTopAuthors();
    loadBookmarks();
    updateProfileStats();
    setupEventListeners();
    checkDarkMode();
}

// Load Featured Articles
function loadFeaturedArticles() {
    const featured = articlesData.filter(article => article.featured);
    featuredGrid.innerHTML = featured.map(article => createArticleCard(article, true)).join('');
}

// Load Articles with Filtering, Sorting, and Pagination
function loadArticles() {
    let filtered = articlesData;
    
    // Category Filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(article => article.category === currentCategory);
    }
    
    // Read Time Filter
    if (currentReadTimeFilter !== 'all') {
        filtered = filtered.filter(article => {
            const readMinutes = parseInt(article.readTime);
            if (currentReadTimeFilter === 'quick') return readMinutes < 5;
            if (currentReadTimeFilter === 'medium') return readMinutes >= 5 && readMinutes <= 10;
            if (currentReadTimeFilter === 'long') return readMinutes > 10;
            return true;
        });
    }
    
    // Sorting
    filtered = sortArticles(filtered);
    
    // Update count
    updateArticleCount(filtered.length);
    
    // Pagination
    const totalPages = Math.ceil(filtered.length / articlesPerPage);
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const paginatedArticles = filtered.slice(startIndex, endIndex);
    
    // Render articles
    articlesGrid.className = `articles-grid ${currentView}-view`;
    articlesGrid.innerHTML = paginatedArticles.length > 0
        ? paginatedArticles.map(article => createArticleCard(article)).join('')
        : '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-gray-medium);">No articles found.</p>';
    
    // Update pagination
    updatePagination(currentPage, totalPages);
}

// Sort Articles
function sortArticles(articles) {
    const sorted = [...articles];
    
    switch(currentSort) {
        case 'latest':
            return sorted; // Already in order
        case 'popular':
            return sorted.sort((a, b) => (b.viewsNum || 0) - (a.viewsNum || 0));
        case 'trending':
            return sorted.filter(a => a.trending).concat(sorted.filter(a => !a.trending));
        case 'read-time-asc':
            return sorted.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
        case 'read-time-desc':
            return sorted.sort((a, b) => parseInt(b.readTime) - parseInt(a.readTime));
        default:
            return sorted;
    }
}

// Update Article Count
function updateArticleCount(count) {
    if (articleCount) {
        articleCount.textContent = `${count} article${count !== 1 ? 's' : ''}`;
    }
}

// Update Pagination
function updatePagination(page, totalPages) {
    if (paginationInfo) {
        paginationInfo.textContent = `Page ${page} of ${totalPages}`;
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = page === 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = page === totalPages || totalPages === 0;
    }
}

// Create Article Card HTML
function createArticleCard(article, isFeatured = false) {
    const categoryIcon = getCategoryIcon(article.category);
    const isBookmarked = bookmarkedArticles.includes(article.id);
    
    return `
        <div class="article-card ${isFeatured ? 'featured' : ''}" data-id="${article.id}">
            <div class="article-image" onclick="openArticle(${article.id})">
                <img src="${article.image}" alt="${article.title}" loading="lazy">
                ${article.trending ? '<span class="trending-badge">Trending</span>' : ''}
            </div>
            <div class="article-content">
                <div class="article-header-row">
                    <div class="article-category">${categoryIcon} ${article.category.toUpperCase()}</div>
                    <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark(event, ${article.id})" title="${isBookmarked ? 'Remove bookmark' : 'Bookmark article'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                </div>
                <h3 class="article-title" onclick="openArticle(${article.id})">${article.title}</h3>
                <p class="article-excerpt">${article.excerpt}</p>
                <div class="article-meta">
                    <span class="article-author">By ${article.author}</span>
                    <span class="article-read-time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${article.readTime}
                    </span>
                    <span class="article-views">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        ${article.views}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Get Category Icon
function getCategoryIcon(category) {
    const icons = {
        'technology': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
        'science': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v6l-3 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-6l-3-3V2"></path><circle cx="12" cy="17" r="1"></circle></svg>',
        'india': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
        'business': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
        'stocks': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
        'sports': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>',
        'gk': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    };
    return icons[category] || icons['technology'];
}

// Load Trending Topics (Enhanced)
function loadTrending() {
    trendingList.innerHTML = trendingData.map((topic, index) => {
        const trendIcon = topic.trend === 'up' 
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00C853" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        
        return `
            <div class="trending-item">
                <div class="trending-rank">${String(index + 1).padStart(2, '0')}</div>
                <div class="trending-content">
                    <div class="trending-title">${topic.title}</div>
                    <div class="trending-meta">
                        <span class="trending-category">${topic.category}</span>
                        <span class="trending-separator">•</span>
                        <span class="trending-views">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            ${topic.views}
                        </span>
                    </div>
                    <div class="trending-stats">
                        ${trendIcon}
                        <span class="trending-percentage ${topic.trend}">${topic.percentage}</span>
                        <span class="trending-time">${topic.timeframe}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Load Top Authors
function loadTopAuthors() {
    const topAuthors = document.getElementById('topAuthors');
    if (!topAuthors) return;
    
    topAuthors.innerHTML = topAuthorsData.map((author, index) => `
        <div class="author-item">
            <div class="author-rank">${index + 1}</div>
            <div class="author-avatar-small">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="author-info">
                <div class="author-name-row">
                    <span class="author-name">${author.name}</span>
                    ${author.verified ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="#1DA1F2" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : ''}
                </div>
                <div class="author-specialization">${author.specialization}</div>
                <div class="author-stats-mini">
                    <span>${author.articles} articles</span>
                    <span>•</span>
                    <span>${author.followers} followers</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Update Profile Stats
function updateProfileStats() {
    const articlesReadEl = document.getElementById('articlesRead');
    const totalReadTimeEl = document.getElementById('totalReadTime');
    const bookmarkCountEl = document.getElementById('bookmarkCount');
    
    if (articlesReadEl) articlesReadEl.textContent = readArticles.length;
    if (totalReadTimeEl) totalReadTimeEl.textContent = `${totalReadTime} min`;
    if (bookmarkCountEl) bookmarkCountEl.textContent = bookmarkedArticles.length;
}

// Setup Event Listeners
function setupEventListeners() {
    // Category Tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            currentPage = 1;
            loadArticles();
        });
    });
    
    // View Toggle
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            loadArticles();
        });
    });
    
    // Sort Filter
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            loadArticles();
        });
    }
    
    // Read Time Filter
    if (readTimeFilter) {
        readTimeFilter.addEventListener('change', (e) => {
            currentReadTimeFilter = e.target.value;
            currentPage = 1;
            loadArticles();
        });
    }
    
    // Reset Filters
    if (resetFilters) {
        resetFilters.addEventListener('click', () => {
            currentCategory = 'all';
            currentSort = 'latest';
            currentReadTimeFilter = 'all';
            currentPage = 1;
            
            // Reset UI
            categoryTabs.forEach(t => t.classList.remove('active'));
            document.querySelector('[data-category="all"]').classList.add('active');
            sortFilter.value = 'latest';
            readTimeFilter.value = 'all';
            
            loadArticles();
        });
    }
    
    // Pagination
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadArticles();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            currentPage++;
            loadArticles();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Theme Toggle
    themeToggle.addEventListener('click', toggleDarkMode);
    
    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));
}

// Toggle Bookmark
function toggleBookmark(event, articleId) {
    event.stopPropagation();
    
    const index = bookmarkedArticles.indexOf(articleId);
    if (index > -1) {
        bookmarkedArticles.splice(index, 1);
    } else {
        bookmarkedArticles.push(articleId);
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarkedArticles));
    loadArticles();
    loadBookmarks();
    updateProfileStats();
}

// Load Bookmarks
function loadBookmarks() {
    if (!bookmarksList) return;
    
    const bookmarked = articlesData.filter(a => bookmarkedArticles.includes(a.id));
    
    if (bookmarked.length === 0) {
        bookmarksList.innerHTML = '<p class="empty-state">No bookmarks yet</p>';
        return;
    }
    
    bookmarksList.innerHTML = bookmarked.map(article => `
        <div class="bookmark-item" onclick="openArticle(${article.id})">
            <div class="bookmark-title">${article.title}</div>
            <div class="bookmark-meta">${article.readTime} • ${article.category}</div>
        </div>
    `).join('');
}

// Toggle Dark Mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Check Dark Mode Preference
function checkDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
    }
}

// Handle Search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (!query) {
        loadArticles();
        return;
    }
    
    const filtered = articlesData.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query)
    );
    
    updateArticleCount(filtered.length);
    articlesGrid.className = `articles-grid ${currentView}-view`;
    articlesGrid.innerHTML = filtered.length > 0
        ? filtered.map(article => createArticleCard(article)).join('')
        : '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-gray-medium);">No articles found matching your search.</p>';
    
    // Hide pagination during search
    updatePagination(1, 1);
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Open Article (Navigate to article detail page)
function openArticle(id) {
    // Track article as read
    if (!readArticles.includes(id)) {
        readArticles.push(id);
        localStorage.setItem('readArticles', JSON.stringify(readArticles));
        
        // Add read time
        const article = articlesData.find(a => a.id === id);
        if (article) {
            const readMinutes = parseInt(article.readTime);
            totalReadTime += readMinutes;
            localStorage.setItem('totalReadTime', totalReadTime);
        }
        
        updateProfileStats();
    }
    
    window.location.href = `article.html?id=${id}`;
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', init);

// Export for use in other files
window.PixelFact = {
    articlesData,
    trendingData
};
