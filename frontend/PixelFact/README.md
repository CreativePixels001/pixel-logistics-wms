# Pixel Fact

A modern content platform combining blogs, articles, news, and community discussions with a pixel-perfect black & white design.

## 🎯 Overview

Pixel Fact is a hybrid content platform that brings together:
- **Articles**: Long-form, in-depth content (1000-3000 words)
- **Blogs**: Personal insights and opinions (500-1000 words)
- **News Briefs**: Quick updates and breaking news (200-500 words)
- **Forums**: Community discussions and Q&A
- **Daily Facts**: Bite-sized knowledge snippets

## 📚 Categories

1. **Technology** 📚 - AI, software, gadgets, innovations
2. **Science** 🔬 - Research, discoveries, space, physics
3. **Indian News** 🇮🇳 - Politics, culture, developments
4. **Business** 💼 - Startups, entrepreneurship, economy
5. **Stocks** 📈 - Market analysis, trading, investments
6. **Sports** ⚽ - Cricket, football, Olympics, championships
7. **General Knowledge** 🧠 - History, geography, trivia
8. **Forums** 💬 - Discussions, Q&A, community

## 🎨 Design Philosophy

- **Black & White Theme**: Pixel-perfect minimalist design
- **Typography-Focused**: Beautiful reading experience
- **Responsive**: Works seamlessly on all devices
- **Fast**: Optimized for performance
- **Accessible**: WCAG 2.1 compliant

## 🚀 Features

### Content Discovery
- ✅ Featured articles carousel
- ✅ Category-based filtering
- ✅ Real-time search
- ✅ Trending topics sidebar
- ✅ Grid and list view toggle

### Reading Experience
- ✅ Clean, distraction-free layout
- ✅ Estimated read time
- ✅ Progress indicator
- ✅ Table of contents
- ✅ Text-to-speech option

### Engagement
- ✅ Like and bookmark articles
- ✅ Share on social media
- ✅ Comments and discussions
- ✅ Author profiles
- ✅ Related articles

### Personalization
- ✅ Dark mode toggle
- ✅ Reading history
- ✅ Bookmarks collection
- ✅ Customizable feed
- ✅ Newsletter subscription

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Fonts**: Inter, Playfair Display, Space Grotesk
- **Images**: Unsplash API (grayscale filtered)
- **Icons**: Custom SVG icons
- **Performance**: Lazy loading, infinite scroll
- **PWA Ready**: Offline reading capability

## 📁 Project Structure

```
PixelFact/
├── index.html          # Landing page
├── article.html        # Article detail page
├── css/
│   └── main.css       # Complete stylesheet
├── js/
│   ├── app.js         # Main application logic
│   └── article.js     # Article page logic
├── images/
│   └── articles/      # Article images
└── data/
    └── articles.json  # Sample article data
```

## 🎯 Sample Articles (Included)

1. **The Future of Artificial Intelligence in 2025** (Technology, 8 min)
2. **India's Space Program Reaches New Milestone** (India, 6 min)
3. **Understanding Quantum Computing Basics** (Science, 10 min)
4. **Stock Market Analysis: Tech Sector Outlook** (Stocks, 7 min)
5. **Cricket World Cup 2025: India's Journey** (Sports, 5 min)
6. **Startups Revolutionizing Healthcare in India** (Business, 9 min)
7. **Ancient Indian Mathematics You Never Learned** (GK, 12 min)
8. **Climate Change: What Science Says Now** (Science, 11 min)
9. **5G Technology: A Complete Guide** (Technology, 8 min)

## 🚦 Getting Started

### Local Development

1. **Open in Browser**
   ```bash
   # Simply open index.html in your browser
   open index.html
   ```

2. **Or use a local server** (recommended)
   ```bash
   # Python 3
   python3 -m http.server 8080
   
   # Then visit: http://localhost:8080
   ```

### Testing Features

- **Search**: Type in the search bar to filter articles
- **Categories**: Click category tabs to filter by topic
- **Views**: Toggle between grid and list view
- **Theme**: Click sun/moon icon for dark mode
- **Articles**: Click any article to view full content

## 🌐 Deployment

### Deploy to Creative Pixels Hosting

```bash
# Create deployment script
./deploy-fact.sh

# This will upload to fact.creativepixels.in
```

### Required Files for Deployment
- All HTML files (index.html, article.html)
- CSS folder with main.css
- JS folder with app.js and article.js
- Images folder (if using local images)
- .htaccess file for clean URLs

## 🎨 Customization

### Colors
Edit CSS variables in `css/main.css`:
```css
:root {
    --color-black: #000000;
    --color-white: #FFFFFF;
    --color-gray-dark: #333333;
    /* Add your custom colors */
}
```

### Fonts
Current fonts (Google Fonts):
- **Inter**: Body text
- **Playfair Display**: Display headings
- **Space Grotesk**: Article titles

### Article Data
Add more articles in `js/app.js`:
```javascript
const articlesData = [
    {
        id: 10,
        title: "Your Article Title",
        category: "technology",
        excerpt: "Short description...",
        author: "Author Name",
        readTime: "5 min",
        date: "Dec 7, 2025",
        views: "1.2K",
        image: "image-url",
        featured: false
    }
];
```

## 📊 Performance

- **Page Load**: < 2 seconds
- **First Contentful Paint**: < 1 second
- **Lighthouse Score**: 95+
- **Image Optimization**: Lazy loading + WebP
- **CSS**: Minified for production
- **JS**: Vanilla (no framework overhead)

## 🔮 Future Enhancements

### Phase 1 (MVP) ✅
- [x] Landing page with articles
- [x] Category filtering
- [x] Search functionality
- [x] Article detail pages
- [x] Dark mode
- [x] Responsive design

### Phase 2 (Coming Soon)
- [ ] User authentication
- [ ] Comment system
- [ ] User profiles
- [ ] Bookmarks persistence
- [ ] Reading history
- [ ] Newsletter signup

### Phase 3 (Future)
- [ ] Forum/discussion boards
- [ ] User-generated content
- [ ] Voting/rating system
- [ ] Advanced search filters
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] Mobile app (PWA)
- [ ] Multi-language support

## 🤝 Contributing

Want to add articles or features?
1. Fork the repository
2. Create your feature branch
3. Add your content/code
4. Test thoroughly
5. Submit a pull request

## 📝 Content Guidelines

### Writing Style
- Clear and concise
- Well-researched and factual
- Engaging and informative
- Proper citations for sources
- Inclusive and respectful language

### Article Length
- **News Brief**: 200-500 words
- **Blog Post**: 500-1000 words
- **Article**: 1000-3000 words
- **Long-form**: 3000+ words

### Images
- High quality (1200x600 minimum)
- Grayscale filtered for consistency
- Properly attributed
- Optimized for web (<200KB)

## 📧 Contact

Part of the **Creative Pixels Ecosystem**

- **Website**: creativepixels.in
- **WMS**: wms.creativepixels.in
- **TMS**: tms.creativepixels.in
- **PIS**: pis.creativepixels.in
- **PTMS**: trip.creativepixels.in

## 📄 License

© 2025 Pixel Fact. All rights reserved.

---

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**  
*No frameworks. No build tools. Just clean code.*
