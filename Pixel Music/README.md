# 🎵 Pixel Play - Free Online Music Player with Retro Vinyl Experience

<div align="center">

![Pixel Play Logo](PixelPlayLogo-White.svg)

**Stream unlimited music for free with beautiful retro vinyl aesthetics**

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-blue?style=for-the-badge)](https://creativepixels.in/pixel-music/)
[![Product Hunt](https://img.shields.io/badge/Product%20Hunt-Coming%20Soon-orange?style=for-the-badge&logo=producthunt)](https://www.producthunt.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Try It Now](https://creativepixels.in/pixel-music/) • [Features](#features-) • [Screenshots](#-screenshots) • [Launch Strategy](LAUNCH_STRATEGY.md)

</div>

---

## 🌟 What is Pixel Play?

**Pixel Play** is a **completely free online music player** that combines nostalgic vinyl record aesthetics with modern music streaming capabilities. No ads, no subscriptions, no sign-ups required—just beautiful design and unlimited music.

### 🎯 Perfect For
- Music lovers who appreciate retro aesthetics
- Anyone looking for a free Spotify/Apple Music alternative
- Students, workers, and creators who want ad-free music
- People who miss the tactile feeling of vinyl records

---

## ✨ Features

### Music Playback
- **YouTube Integration** - Search and stream music from YouTube
- **Local Files** - Upload and play audio files from your device (MP3, WAV, OGG, M4A)
- **Drag & Drop** - Easy file upload with drag and drop support
- **Background Playback** 📱 - Continue playing music when app is minimized on mobile
- **Lock Screen Controls** - Control playback from your phone's lock screen/notification center

### User Interface
- **Retro Vinyl Design** - Animated vinyl disc with realistic grooves and tonearm
- **Greyscale Theme** - Classic black and white aesthetic with vintage effects
- **Film Grain & Scan Lines** - Authentic retro visual effects
- **Fullscreen Mode** - Immersive playback experience (Press F key)

### Lyrics Display 🎤
- **Real-time Lyrics** - Automatically fetches and displays song lyrics
- **Free API** - Uses Lyrics.ovh (no API key required)
- **Microphone Icon** - Toggle lyrics panel with a single click
- **Clean Layout** - Retro-styled scrollable lyrics panel

### Playback Controls
- **Play/Pause, Next, Previous** - Full playback control
- **Volume Control** - Adjustable volume slider
- **Progress Tracking** - Seekable progress bar
- **Keyboard Shortcuts** - Space (play/pause), Arrow keys (next/prev), F (fullscreen)
- **Media Session API** - Native media controls on mobile devices

### Authentication
- **Google Sign-In** - Optional login with Google account
- **Guest Mode** - Continue without login for quick access
- **Persistent Sessions** - Stay logged in across page refreshes

## Keyboard Shortcuts ⌨️

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` | Focus Search |
| `Space` | Play/Pause |
| `←` | Previous Song |
| `→` | Next Song |
| `F` | Toggle Fullscreen |
| `Esc` | Clear Search |

## Technologies Used 🛠️

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Framework**: Bootstrap 5.3.0
- **APIs**:
  - YouTube Data API v3 (search)
  - YouTube IFrame Player API (playback)
  - Lyrics.ovh API (lyrics fetching)
  - Google OAuth 2.0 (authentication)
  - Media Session API (background playback controls)
- **PWA Features**:
  - Service Worker (offline support & caching)
  - Background audio handling
  - Mobile lock screen integration
- **Fonts**: Google Fonts (Playfair Display, Roboto, Roboto Mono)

## Setup Instructions 📋

1. **Upload Files** to your web server:
   - `index.html`
   - `style.css`
   - `app.js`
   - `auth.js`
   - `config.js`
   - `service-worker.js` (NEW - for background playback)
---

## 📸 Screenshots

![Pixel Play Interface](PixleBanner.png)

*Beautiful retro vinyl interface with animated disc, tonearm, and modern controls*

---

## 🚀 Getting Started

### For Users
1. Visit [creativepixels.in/pixel-music](https://creativepixels.in/pixel-music/)
2. Click "Launch Player"
3. Search for any song or artist
4. Start enjoying free music!

No installation, no sign-up, no credit card required.

### For Developers

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pixel-play.git
   cd pixel-play
   ```

2. **Configure API Keys** in `config.js`:
   ```javascript
   const CONFIG = {
       YOUTUBE_API_KEYS: [
           'your-youtube-api-key-1',
           'your-youtube-api-key-2',
           'your-youtube-api-key-3'
       ],
       CURRENT_KEY_INDEX: 0,
       MAX_SEARCH_RESULTS: 20,
       DEFAULT_VOLUME: 50
   };
   ```

3. **Open in Browser**
   ```bash
   # Simply open landing.html or index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then visit: http://localhost:8000
   ```

4. **Update Google Cloud Console**:
   - Create YouTube Data API v3 project
   - Add your domain to API restrictions
   - Enable CORS for your domain

---

## 🎯 SEO & Launch Strategy

We've prepared a comprehensive launch strategy! Check out:
- **[LAUNCH_STRATEGY.md](LAUNCH_STRATEGY.md)** - Complete guide for public launch
- **[robots.txt](robots.txt)** - Search engine crawler configuration
- **[sitemap.xml](sitemap.xml)** - Site structure for Google

### Target Keywords
- ✅ Free online music player
- ✅ Retro vinyl music player  
- ✅ YouTube music player
- ✅ Play music online free
- ✅ Aesthetic music player

---

## 📊 Analytics & Performance

**Current Stats** (as of Dec 18, 2025):
- 🎯 **60+ Active Users**
- ⏱️ **4m 32s Average Engagement**
- 📈 **1,700+ Total Events**
- 🎵 **125 Songs Played**
- 🌍 **Users from**: Mumbai, Hyderabad, Bengaluru

**Google Analytics**: Integrated with GA4 (G-KYS6H6HWBL)

---

## 🎤 How Features Work

### Lyrics Display
- Uses **Lyrics.ovh API** (free, no key required)
- Auto-fetches when song plays
- Click microphone icon to toggle panel
- Retro-styled scrollable interface

### Background Playback (Mobile 📱)
- **Media Session API** integration
- Lock screen controls (play, pause, skip)
- Native notification controls
- Artwork display on lock screen
- Works even when app is minimized

### Recently Played History
- Tracks last 20 songs automatically
- Shows when sidebar is empty
- Time stamps (e.g., "2h ago", "Just now")
- One-click replay from history
- Persists across browser sessions

### Smart Autoplay
- Automatically plays next song
- Toggle switch for easy control
- Works with search results
- Works with library songs
- Remembers your preference

---

## 🔧 Technical Stack

- **Frontend**: Vanilla JavaScript (no frameworks!)
- **Styling**: Custom CSS with retro aesthetics
- **YouTube API**: Data API v3 + IFrame Player API
- **Icons**: Bootstrap Icons
- **Analytics**: Google Analytics 4
- **Storage**: localStorage for cache & library
- **Audio**: HTML5 Audio + YouTube IFrame Player

---

## 🎨 Design Philosophy

Pixel Play is built on three core principles:

1. **Nostalgia** - Vinyl records evoke memories and emotions
2. **Simplicity** - No clutter, just music and beauty
3. **Freedom** - Truly free, no ads, no tracking, no barriers

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions
- [ ] Dark mode toggle
- [ ] Playlist creation
- [ ] Spotify integration
- [ ] Last.fm scrobbling
- [ ] Equalizer visualization
- [ ] Shareable playlists
- [ ] Collaborative queues

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌐 Links & Resources

- **Live App**: [creativepixels.in/pixel-music](https://creativepixels.in/pixel-music/)
- **Landing Page**: [creativepixels.in/pixel-music/landing.html](https://creativepixels.in/pixel-music/landing.html)
- **Analytics Dashboard**: Google Analytics 4
- **Launch Guide**: [LAUNCH_STRATEGY.md](LAUNCH_STRATEGY.md)

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/your-username/pixel-play/issues)
- **Website**: [creativepixels.in](https://creativepixels.in)
- **Email**: your-email@example.com

---

## ⭐ Show Your Support

If you like Pixel Play, please:
- ⭐ Star this repository
- 🐦 Tweet about it using #PixelPlay
- 📝 Write a review on Product Hunt
- 💬 Share with friends who love music

---

## 🙏 Acknowledgments

- YouTube API for music streaming
- Lyrics.ovh for free lyrics API
- Bootstrap Icons for beautiful icons
- Google Fonts for typography
- All users who provided feedback and support

---

<div align="center">

**Made with ❤️ by Creative Pixels**

*Where Songs Feel Like Memories*

[🎵 Try Pixel Play Now](https://creativepixels.in/pixel-music/) • [📖 Read Launch Strategy](LAUNCH_STRATEGY.md) • [⭐ Star on GitHub](https://github.com/your-username/pixel-play)

</div>

---

## 📈 Roadmap

### Q1 2025
- [x] Launch public version
- [x] SEO optimization
- [x] Recently played feature
- [ ] Submit to Product Hunt
- [ ] Submit to Google Search Console
- [ ] Reach 500 active users

### Q2 2025
- [ ] Playlist creation feature
- [ ] Social sharing
- [ ] Collaborative queues
- [ ] Mobile app (PWA)
- [ ] Reach 5,000 active users

### Q3 2025
- [ ] Spotify integration
- [ ] Last.fm scrobbling
- [ ] Equalizer visualization
- [ ] Premium features (optional)
- [ ] Reach 25,000 active users

---

**Current Version**: 2.0.0 (December 2025)
**Status**: ✅ Public Launch Ready
**License**: MIT
**Platform**: Web (All Browsers, Mobile-Responsive)
- **YouTube**: Limited by browser policies, works best in Chrome for Android

### Controls Available:
- ▶️ Play/Pause
- ⏭️ Next Track
- ⏮️ Previous Track
- ⏩ Seek Forward (10 seconds)
- ⏪ Seek Backward (10 seconds)

## Browser Support 🌐

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera
- Mobile browsers (Chrome, Safari, Firefox) with Media Session support

## Credits 👨‍💻

Developed by Creative Pixels  
© 2025 Pixel Play

## License 📄

MIT License - Feel free to use and modify!
