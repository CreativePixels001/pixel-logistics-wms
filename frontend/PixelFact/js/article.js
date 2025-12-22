// Article Page JavaScript

// Get article ID from URL
const urlParams = new URLSearchParams(window.location.search);
const articleId = parseInt(urlParams.get('id')) || 1;

// Load article data (in real app, this would come from API)
const articleData = window.PixelFact?.articlesData || [];

// Find the article
const currentArticle = articleData.find(a => a.id === articleId) || articleData[0];

// Load article content
function loadArticle() {
    if (!currentArticle) return;
    
    // Update meta information
    document.getElementById('articleCategory').textContent = `${getCategoryEmoji(currentArticle.category)} ${currentArticle.category.toUpperCase()}`;
    document.getElementById('articleTitle').textContent = currentArticle.title;
    document.getElementById('articleExcerpt').textContent = currentArticle.excerpt;
    document.getElementById('articleAuthor').textContent = currentArticle.author;
    document.getElementById('articleDate').textContent = currentArticle.date;
    document.getElementById('articleReadTime').textContent = currentArticle.readTime;
    document.getElementById('articleViews').textContent = currentArticle.views;
    
    // Update breadcrumbs
    document.getElementById('breadcrumbCategory').textContent = currentArticle.category.charAt(0).toUpperCase() + currentArticle.category.slice(1);
    document.getElementById('breadcrumbTitle').textContent = currentArticle.title.substring(0, 30) + '...';
    
    // Update featured image
    const imageContainer = document.getElementById('articleImage');
    imageContainer.querySelector('img').src = currentArticle.image;
    imageContainer.querySelector('img').alt = currentArticle.title;
    
    // Update page title
    document.title = `${currentArticle.title} - Pixel Fact`;
    
    // Load related articles
    loadRelatedArticles();
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        'technology': '📚',
        'science': '🔬',
        'india': '🇮🇳',
        'business': '💼',
        'stocks': '📈',
        'sports': '⚽',
        'gk': '🧠'
    };
    return emojis[category] || '📄';
}

// Load related articles
function loadRelatedArticles() {
    const related = articleData
        .filter(a => a.category === currentArticle.category && a.id !== currentArticle.id)
        .slice(0, 3);
    
    const relatedGrid = document.getElementById('relatedArticles');
    
    if (related.length === 0) {
        relatedGrid.innerHTML = '<p>No related articles found.</p>';
        return;
    }
    
    relatedGrid.innerHTML = related.map(article => `
        <div class="article-card" onclick="window.location.href='article.html?id=${article.id}'">
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}" loading="lazy">
            </div>
            <div class="article-content">
                <div class="article-category">${getCategoryEmoji(article.category)} ${article.category.toUpperCase()}</div>
                <h3 class="article-title">${article.title}</h3>
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
                </div>
            </div>
        </div>
    `).join('');
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
}

// Check dark mode preference
const savedMode = localStorage.getItem('darkMode');
if (savedMode === 'true') {
    document.body.classList.add('dark-mode');
}

// Share buttons
document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const platform = this.classList[1];
        const url = window.location.href;
        const title = currentArticle.title;
        
        let shareUrl = '';
        
        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                this.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Copied!
                `;
                setTimeout(() => {
                    this.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy Link
                    `;
                }, 2000);
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    });
});

// Action buttons (like, bookmark, share)
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.classList.toggle('active');
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', loadArticle);
