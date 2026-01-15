// Global Variables
let player;
let currentPlatform = 'youtube';
let currentSongIndex = -1;
let currentVideoId = null; // Store current playing video ID for sharing
let currentSongData = null; // Store current song metadata for sharing
let youtubeSearchResults = [];
let displayedResultsCount = 0; // Track how many results are shown (for load more)
let localFiles = [];
let isPlaying = false;
let audioPlayer;
let isMuted = false;
let previousVolume = 90; // Default 90% for mobile users
let loadingTimeout = null;
let isBuffering = false;
let pendingDeepLinkVideoId = null; // Store video ID from deep link until player is ready

// 🎯 DEVICE DETECTION - Pixel Perfect on every screen!
// Adds class to body: device-mobile, device-tablet, device-desktop, device-tv, device-ultrawide
const DeviceDetector = {
    init() {
        this.detect();
        window.addEventListener('resize', () => this.detect());
        console.log('[Device] 🎯 Device detector initialized');
    },

    detect() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const ratio = w / h;
        const isTouchDevice =
            'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Remove all device classes
        document.body.classList.remove(
            'device-mobile',
            'device-tablet',
            'device-desktop',
            'device-tv',
            'device-ultrawide',
            'device-portrait',
            'touch-device',
            'mouse-device'
        );

        // Touch or Mouse
        document.body.classList.add(
            isTouchDevice ? 'touch-device' : 'mouse-device'
        );

        // Portrait mode
        if (h > w) {
            document.body.classList.add('device-portrait');
        }

        // Device type based on width
        if (w <= 480) {
            document.body.classList.add('device-mobile');
        } else if (w <= 1024) {
            document.body.classList.add('device-tablet');
        } else if (w <= 1920) {
            document.body.classList.add('device-desktop');
        } else if (w <= 2560) {
            document.body.classList.add('device-ultrawide');
        } else {
            document.body.classList.add('device-tv');
        }

        // Ultra-wide aspect ratio (21:9+)
        if (ratio >= 2.1) {
            document.body.classList.add('device-ultrawide');
        }

        // TV detection: Large screen + no touch
        if (w >= 1920 && !isTouchDevice && (w >= 3000 || h >= 1600)) {
            document.body.classList.add('device-tv');
        }

        console.log(
            `[Device] Screen: ${w}x${h}, Ratio: ${ratio.toFixed(2)}, Classes: ${
                document.body.className
            }`
        );
    },
};

// Initialize device detector immediately
DeviceDetector.init();

// 🍎 iOS AUTOPLAY CHAIN - Track if user started a playback session
// Once user taps play, we maintain an "active session" for autoplay chain
let iOSPlaybackSession = {
    active: false, // User has initiated playback
    lastUserInteraction: 0, // Timestamp of last tap/click
    songsPlayed: 0, // Songs played in this session
    failedAttempts: 0, // Track consecutive failures
};

// 🎨 ROTATING SHARE BANNERS - Like API keys, rotate banners on share!
const SHARE_BANNER_CONFIG = {
    maxBanners: 6, // Actual count: 001-006 in folder
    basePath: 'banners/SongShareBanner',
    extensions: ['.jpeg', '.jpg', '.png', '.webp'], // Support all formats - Gen-Z designers! 😄
    currentIndex: 0,
    cachedBanners: new Map(), // Track which banners exist with their actual extension
};

// Vibe Shuffle System - Smart DJ that keeps users in the right mood
let vibeHistory = []; // Track mood of last songs: 'sad', 'happy', 'love', 'party', 'chill'
let consecutiveSadCount = 0; // Track consecutive sad songs
let isVibeShuffleEnabled = true; // Smart shuffle enabled by default
let lastPlayedVideoIds = []; // Prevent repeats (increased to 50 for better protection)
let songStartTime = 0; // Track when current song started (for skip detection)

// 🎯 USER SEARCH PROTECTION - Track the song user explicitly searched for
// This song should NEVER auto-repeat! "3-4 gaane ke baad search kiya hua gaana fir aata hai" - FIXED!
let userSearchedVideoId = null; // The video ID user explicitly clicked from search results
let autoplayLoopBreaker = 0; // Prevent infinite recursion between playArtistMoreSongs ↔ playVibeShuffledNext

// 📱 BACKGROUND AUTOPLAY FIX - Timer backup for when ENDED event doesn't fire (Android lock screen)
let backgroundAutoplayTimer = null;
let expectedSongEndTime = 0; // When we expect current song to end

// � iOS Detection (global for crossfade check)
const isIOSDevice =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// 🎚️ CROSSFADE SYSTEM - Spotify-like smooth transitions between songs
// "Gaano ke beech mein brake nahi lagega!" - Seamless experience
// 🍎 NOTE: Disabled on iOS because setTimeout breaks autoplay chain!
const Crossfade = {
    enabled: !isIOSDevice, // 🍎 DISABLED on iOS - breaks autoplay!
    duration: 8, // 🎧 8 seconds - Professional DJ transition! (No other app has this!)
    fadeOutStart: 0, // Will be set when song loads
    isFading: false, // Currently in crossfade transition
    originalVolume: 90, // Store original volume before fade
    nextSongQueued: false, // Is next song ready to play

    // Initialize crossfade for current song
    init(songDuration) {
        // 🍎 iOS: Skip crossfade entirely - it breaks autoplay chain!
        if (isIOSDevice) {
            this.enabled = false;
            this.fadeOutStart = 0;
            console.log('[Crossfade] 🍎 Disabled on iOS - autoplay policy');
            return;
        }

        if (!this.enabled || songDuration < 30) {
            this.fadeOutStart = 0; // Disable for short songs
            return;
        }
        // Start fade 5 seconds before end
        this.fadeOutStart = songDuration - this.duration;
        this.isFading = false;
        this.nextSongQueued = false;
        console.log(
            `[Crossfade] 🎚️ Will fade at ${Math.floor(
                this.fadeOutStart
            )}s of ${Math.floor(songDuration)}s`
        );
    },

    // Check if we should start crossfade (called every second from updateProgress)
    check(currentTime, duration) {
        if (!this.enabled || this.isFading || this.fadeOutStart <= 0) return;
        if (!player || typeof player.getVolume !== 'function') return;

        // Check if we're in the fade zone
        if (currentTime >= this.fadeOutStart && currentTime < duration) {
            this.startFade();
        }
    },

    // Start the crossfade process
    startFade() {
        // 🍎 iOS: NEVER trigger next song via setTimeout - breaks autoplay!
        if (isIOSDevice) {
            console.log(
                '[Crossfade] 🍎 Skipped on iOS - only volume fade allowed'
            );
            return;
        }

        if (this.isFading) return;
        this.isFading = true;

        // Store current volume
        this.originalVolume = player.getVolume ? player.getVolume() : 90;
        console.log(
            `[Crossfade] 🎚️ Starting fade from ${this.originalVolume}%`
        );

        // Start volume fade: 100% → 20% over 5 seconds (DJ Mode! 🎧)
        this.fadeVolumeDown();

        // Trigger next song with fade-in
        setTimeout(() => {
            if (this.isFading) {
                this.triggerNextWithFadeIn();
            }
        }, 4000); // Start next song at 4 seconds (midpoint of 8 sec fade)
    },

    // Gradually decrease volume (100% → 20% for smooth DJ transition)
    fadeVolumeDown() {
        const steps = 10; // 10 steps over 5 seconds
        const stepDuration = (this.duration * 1000) / steps;
        const volumeStep =
            (this.originalVolume - this.originalVolume * 0.2) / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            if (!this.isFading || currentStep >= steps) {
                clearInterval(fadeInterval);
                return;
            }

            currentStep++;
            const newVolume = Math.max(
                0,
                this.originalVolume - volumeStep * currentStep
            );

            if (player && typeof player.setVolume === 'function') {
                player.setVolume(newVolume);
            }
        }, stepDuration);
    },

    // Trigger next song and fade volume back up
    triggerNextWithFadeIn() {
        console.log('[Crossfade] 🎵 Triggering next song with fade-in');

        // Call playNext which will load next song
        playNext();

        // After a short delay, fade volume back up
        setTimeout(() => {
            this.fadeVolumeUp();
        }, 500);
    },

    // Gradually increase volume back to original (50% → 100% smooth rise)
    fadeVolumeUp() {
        const targetVolume = this.originalVolume;
        const startVolume = targetVolume * 0.5; // Start at 50%
        const steps = 16; // 16 steps for smoother 4 second fade-in
        const stepDuration = 250; // 4 seconds total (16 x 250ms)
        const volumeStep = (targetVolume - startVolume) / steps;
        let currentStep = 0;

        // Set starting volume
        if (player && typeof player.setVolume === 'function') {
            player.setVolume(startVolume);
        }

        const fadeInterval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                // Restore original volume
                if (player && typeof player.setVolume === 'function') {
                    player.setVolume(targetVolume);
                }
                this.reset();
                console.log(
                    '[Crossfade] ✅ Fade complete, volume restored to',
                    targetVolume
                );
                return;
            }

            const newVolume = startVolume + volumeStep * currentStep;
            if (player && typeof player.setVolume === 'function') {
                player.setVolume(newVolume);
            }
        }, stepDuration);
    },

    // Reset crossfade state
    reset() {
        this.isFading = false;
        this.nextSongQueued = false;
        this.fadeOutStart = 0;
    },

    // Disable crossfade (called when user manually skips)
    cancel() {
        if (this.isFading) {
            console.log('[Crossfade] ❌ Cancelled by user action');
            // Restore volume immediately
            if (player && typeof player.setVolume === 'function') {
                player.setVolume(this.originalVolume);
            }
        }
        this.reset();
    },
};

// 🎧 REAL LISTENING TIME TRACKER - Background time bhi track karo!
let listeningSession = {
    startTime: 0, // When current song started playing
    totalListenedTime: 0, // Total seconds listened in this session
    songsPlayed: 0, // Number of songs played
    sessionStart: Date.now(), // When session started
};

// 📲 PWA INSTALL PROMPT - "Ghar mein jagah de do!" 🏠
// Capture browser's beforeinstallprompt so we can trigger from our button
let deferredInstallPrompt = null;
let isPWAInstalled = false;

// 📱 PWA INSTALL PROMPT SYSTEM - Like login prompt, but for home screen!
// "Liked songs on Pixel Play? Keep it on home screen for quick access!"
const PWAInstallPrompt = {
    PROMPT_AFTER_SONGS: 3, // Show after 3 songs played
    COOLDOWN_HOURS: 48, // Don't show again for 48 hours
    storageKey: 'pwaInstallPromptData',

    // Check if we should show the prompt
    shouldShow() {
        // Already installed? Don't show
        if (isPWAInstalled || PWAHelper.isStandalone()) {
            console.log('[PWA Prompt] Already installed, skipping');
            return false;
        }

        // No install prompt available from browser? Can't show
        if (!deferredInstallPrompt) {
            console.log('[PWA Prompt] No browser prompt available');
            return false;
        }

        // Check cooldown
        const data = this.getData();
        if (data.lastPromptTime) {
            const hoursSince =
                (Date.now() - data.lastPromptTime) / (1000 * 60 * 60);
            if (hoursSince < this.COOLDOWN_HOURS) {
                console.log(
                    `[PWA Prompt] Cooldown: ${Math.round(
                        this.COOLDOWN_HOURS - hoursSince
                    )}h remaining`
                );
                return false;
            }
        }

        // Check if enough songs played
        const songsPlayed = parseInt(localStorage.getItem('playCount') || '0');
        if (songsPlayed < this.PROMPT_AFTER_SONGS) {
            console.log(
                `[PWA Prompt] Need ${
                    this.PROMPT_AFTER_SONGS - songsPlayed
                } more songs`
            );
            return false;
        }

        return true;
    },

    getData() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch {
            return {};
        }
    },

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    },

    // Show the nice bottom sheet prompt
    show() {
        if (!this.shouldShow()) return;

        console.log('[PWA Prompt] 📲 Showing install prompt...');

        // Remove existing if any
        document.getElementById('pwaInstallPrompt')?.remove();

        const promptHTML = `
            <div id="pwaInstallPrompt" class="pwa-install-prompt mobile-bottom-sheet">
                <div class="bottom-sheet-handle"></div>
                <div class="prompt-content">
                    <div class="prompt-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 5v14M5 12l7-7 7 7"/>
                            <rect x="3" y="17" width="18" height="4" rx="1" fill="currentColor" opacity="0.2"/>
                        </svg>
                    </div>
                    <div class="prompt-text">
                        <h4>Liked songs on Pixel Play?</h4>
                        <p>Keep it on home screen for quick access</p>
                    </div>
                    <div class="prompt-actions">
                        <button class="prompt-btn-install" onclick="PWAInstallPrompt.install()">
                            Add to Home Screen
                        </button>
                        <button class="prompt-btn-later" onclick="PWAInstallPrompt.dismiss()">
                            Maybe later
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', promptHTML);

        // Animate in
        setTimeout(() => {
            document.getElementById('pwaInstallPrompt')?.classList.add('show');
        }, 100);

        // Save prompt time
        this.saveData({ lastPromptTime: Date.now() });
    },

    // Trigger the actual browser install prompt
    async install() {
        if (!deferredInstallPrompt) {
            console.log('[PWA Prompt] No deferred prompt available');
            this.dismiss();
            return;
        }

        console.log('[PWA Prompt] 📲 Triggering browser install...');

        // Show browser's install prompt
        deferredInstallPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`[PWA Prompt] User choice: ${outcome}`);

        if (outcome === 'accepted') {
            showToast('🎉 Pixel Play added to home screen!');
            isPWAInstalled = true;
        }

        // Clear the deferred prompt
        deferredInstallPrompt = null;
        this.dismiss();
    },

    // Dismiss the prompt
    dismiss() {
        const prompt = document.getElementById('pwaInstallPrompt');
        if (prompt) {
            prompt.classList.remove('show');
            setTimeout(() => prompt.remove(), 300);
        }
    },

    // Check and show after song plays
    checkAfterSongPlay() {
        // Small delay for better UX
        setTimeout(() => {
            this.show();
        }, 2000);
    },
};

// Make globally accessible
window.PWAInstallPrompt = PWAInstallPrompt;

// 🎵 SONG COUNTER - Track total songs played in Google Sheet
const SONG_COUNTER_URL =
    'https://script.google.com/macros/s/AKfycbxp5Q0-mKFmsLzT9ihiNuds4-_TMepUJbUsFrlGmnln6xGVtI7glif5199J7GzL9DkT/exec';

function incrementSongCounter() {
    // Silent call - don't block playback, just increment counter
    fetch(SONG_COUNTER_URL, { mode: 'no-cors' })
        .then(() => console.log('[SongCounter] 🎵 +1 song played!'))
        .catch(() => {}); // Silently fail - counter is not critical
}

// 📱 PWA DETECTION - Check if running as installed app
const PWAHelper = {
    // Check if app is running in standalone mode (installed PWA)
    isStandalone() {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true || // iOS Safari
            document.referrer.includes('android-app://') // Android TWA
        );
    },

    // Check if app is installable
    isInstalled() {
        return this.isStandalone();
    },

    // Log PWA status on load
    logStatus() {
        const status = this.isStandalone() ? 'PWA (Installed)' : 'Browser';
        console.log(`[PWA] 📱 Running as: ${status}`);

        // Track in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_mode', {
                mode: status,
                source:
                    new URLSearchParams(window.location.search).get('source') ||
                    'direct',
            });
        }
    },
};

// Log PWA status on load
window.addEventListener('load', () => {
    PWAHelper.logStatus();
});

// 🎬 SMART THUMBNAIL SYSTEM - YouTube jaisa variety!
// Default thumbnail list mein, random frame disc pe, preload background mein
// Like Vera chat - dhire dhire reveal, mystery banao! 😏
const SmartThumbnail = {
    preloadedFrames: new Map(), // Cache preloaded frame URLs
    revealTimer: null, // Timer for smooth reveal
    currentVideoId: null, // Track current video for reveal

    // Get random frame URL for disc (1, 2, or 3)
    getRandomFrame(videoId) {
        const frameNumber = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
        return `https://img.youtube.com/vi/${videoId}/${frameNumber}.jpg`;
    },

    // Get high quality thumbnail for disc (better than default)
    getDiscThumbnail(videoId) {
        // First check if we have preloaded frames
        if (this.preloadedFrames.has(videoId)) {
            const frames = this.preloadedFrames.get(videoId);
            // Return a random preloaded frame
            const randomIndex = Math.floor(Math.random() * frames.length);
            return frames[randomIndex] || this.getRandomFrame(videoId);
        }
        // Otherwise return random frame directly
        return this.getRandomFrame(videoId);
    },

    // 🎭 Start smooth reveal - grayscale blur first, color after delay
    // Like Vera chat - anticipation builds the connection!
    startSmoothReveal(albumArt, videoId, title, defaultThumbnail) {
        // Clear any existing timer
        if (this.revealTimer) {
            clearTimeout(this.revealTimer);
            this.revealTimer = null;
        }

        this.currentVideoId = videoId;

        // Phase 1: Show default thumbnail with grayscale + blur (mystery mode)
        albumArt.innerHTML = `<img src="${defaultThumbnail}" alt="${title}" class="disc-img-loading" style="filter: grayscale(100%) blur(3px); opacity: 0.7; transition: all 1.5s ease;">`;

        console.log(
            `[SmartThumbnail] 🎭 Phase 1: Mystery mode (grayscale + blur)`
        );

        // Phase 2: After ~3 seconds, start revealing (smooth transition)
        this.revealTimer = setTimeout(() => {
            // Make sure we're still on same video
            if (this.currentVideoId !== videoId) return;

            const img = albumArt.querySelector('img');
            if (img) {
                // Remove blur, keep slight grayscale
                img.style.filter = 'grayscale(50%) blur(1px)';
                img.style.opacity = '0.85';
                console.log(
                    `[SmartThumbnail] 🎭 Phase 2: Revealing (less blur)`
                );
            }
        }, 3000);

        // Phase 3: After ~6 seconds, show random frame in full color!
        setTimeout(() => {
            // Make sure we're still on same video
            if (this.currentVideoId !== videoId) return;

            const randomFrame = this.getDiscThumbnail(videoId);
            const img = albumArt.querySelector('img');
            if (img) {
                // Smooth transition to new image
                img.style.filter = 'grayscale(0%) blur(0px)';
                img.style.opacity = '1';

                // After transition completes, swap to random frame
                setTimeout(() => {
                    if (this.currentVideoId !== videoId) return;
                    img.src = randomFrame;
                    console.log(
                        `[SmartThumbnail] 🎭 Phase 3: Full reveal! Random frame loaded`
                    );
                }, 500);
            }
        }, 6000);

        // Preload frames in background
        this.preloadFrames(videoId);
    },

    // Cancel reveal (song changed)
    cancelReveal() {
        if (this.revealTimer) {
            clearTimeout(this.revealTimer);
            this.revealTimer = null;
        }
        this.currentVideoId = null;
    },

    // Preload all 3 frames in background (non-blocking)
    preloadFrames(videoId) {
        // Skip if already preloaded
        if (this.preloadedFrames.has(videoId)) return;

        const frames = [];
        let loadedCount = 0;

        // Use requestIdleCallback for non-blocking load (performance first!)
        const loadFrame = (frameNum) => {
            const img = new Image();
            const url = `https://img.youtube.com/vi/${videoId}/${frameNum}.jpg`;

            img.onload = () => {
                frames.push(url);
                loadedCount++;
                if (loadedCount === 3) {
                    this.preloadedFrames.set(videoId, frames);
                    console.log(
                        `[SmartThumbnail] 🎬 Preloaded 3 frames for ${videoId}`
                    );
                }
            };

            img.onerror = () => {
                loadedCount++; // Count even errors to not block
            };

            img.src = url;
        };

        // Use requestIdleCallback if available, otherwise setTimeout
        const scheduleLoad =
            window.requestIdleCallback || ((cb) => setTimeout(cb, 100));

        // Stagger loads to avoid network congestion
        scheduleLoad(() => loadFrame(1));
        setTimeout(() => scheduleLoad(() => loadFrame(2)), 200);
        setTimeout(() => scheduleLoad(() => loadFrame(3)), 400);
    },

    // Clear old preloaded frames (memory management)
    clearOldFrames(keepVideoId) {
        if (this.preloadedFrames.size > 10) {
            const keysToDelete = [];
            for (const key of this.preloadedFrames.keys()) {
                if (key !== keepVideoId) {
                    keysToDelete.push(key);
                    if (this.preloadedFrames.size - keysToDelete.length <= 5)
                        break;
                }
            }
            keysToDelete.forEach((k) => this.preloadedFrames.delete(k));
        }
    },
};

// 🔬 QED HEART - Quantum Amplitude Selection (Inspired by Feynman)
// Like QED: Calculate amplitude for each path, sum them, highest wins!
// Simple paths dominate (genre/language), complex paths refine (trust/time)
const QED_HEART = {
    // Calculate amplitude (0-100) for a song based on user preferences
    // Higher amplitude = higher probability of selection
    calculateAmplitude(song, userPrefs) {
        if (!song || !song.snippet) return 0;

        const title = (song.snippet.title || '').toLowerCase();
        const channel = (song.snippet.channelTitle || '').toLowerCase();
        let amplitude = 50; // Base amplitude (neutral)

        // 🎯 SIMPLE DIAGRAMS (Dominant - 70% weight)
        // Like QED: Simple 1-vertex diagrams contribute most

        // Language match (+20)
        const songLang = this.detectLanguage(title);
        if (userPrefs.preferredLanguages?.includes(songLang)) {
            amplitude += 20;
        }

        // Genre match (+15)
        const songGenre = this.detectGenre(title);
        if (userPrefs.preferredGenres?.includes(songGenre)) {
            amplitude += 15;
        }

        // Current mood continuation (+10)
        if (
            userPrefs.currentMood &&
            this.matchesMood(title, userPrefs.currentMood)
        ) {
            amplitude += 10;
        }

        // 🔄 COMPLEX DIAGRAMS (Refinement - 30% weight)
        // Like QED: Higher-order corrections

        // Channel trust (+8)
        const trustScore = InvisibleIntelligence.getChannelTrust(channel);
        amplitude += Math.min(8, trustScore * 2);

        // Time of day bonus (+5) - party at night, chill in morning
        const hour = new Date().getHours();
        if (hour >= 20 || hour < 2) {
            // Night - party songs
            if (songGenre === 'party' || songGenre === 'dance') amplitude += 5;
        } else if (hour >= 5 && hour < 10) {
            // Morning - devotional/chill
            if (songGenre === 'devotional' || songGenre === 'chill')
                amplitude += 5;
        }

        // Avoid keywords (-15)
        const avoidKeywords = userPrefs.avoidKeywords || [];
        if (avoidKeywords.some((k) => title.includes(k))) {
            amplitude -= 15;
        }

        // Already played recently (-25)
        const videoId = song.id?.videoId || song.id;
        if (
            typeof lastPlayedVideoIds !== 'undefined' &&
            lastPlayedVideoIds.includes(videoId)
        ) {
            amplitude -= 25;
        }

        return Math.max(0, Math.min(100, amplitude));
    },

    // Select best song from array using amplitude probability
    selectByAmplitude(songs) {
        if (!songs || songs.length === 0) return null;
        if (songs.length === 1) return songs[0];

        // Get user preferences
        const data = InvisibleIntelligence.getData();
        const userPrefs = {
            preferredLanguages: InvisibleIntelligence.getPreferredLanguages(),
            preferredGenres: InvisibleIntelligence.getPreferredGenres(),
            currentMood:
                typeof vibeHistory !== 'undefined' && vibeHistory.length > 0
                    ? vibeHistory[vibeHistory.length - 1]
                    : null,
            avoidKeywords: data.avoidKeywords || [],
        };

        // Calculate amplitude for each song
        const scored = songs.map((song) => ({
            song,
            amplitude: this.calculateAmplitude(song, userPrefs),
        }));

        // Sort by amplitude (highest first)
        scored.sort((a, b) => b.amplitude - a.amplitude);

        // Weighted random from top 5 (not always #1 for variety)
        const topN = scored.slice(0, Math.min(5, scored.length));
        const totalAmplitude = topN.reduce((sum, s) => sum + s.amplitude, 0);

        if (totalAmplitude === 0) {
            return songs[Math.floor(Math.random() * songs.length)];
        }

        // Probability-weighted selection
        let rand = Math.random() * totalAmplitude;
        for (const item of topN) {
            rand -= item.amplitude;
            if (rand <= 0) {
                console.log(
                    `[QED] 🎯 Selected: ${item.song.snippet?.title?.substring(
                        0,
                        40
                    )} (amp: ${item.amplitude})`
                );
                return item.song;
            }
        }

        return topN[0].song;
    },

    // Quick language detection
    detectLanguage(title) {
        const t = title.toLowerCase();
        if (
            /[\u0900-\u097F]/.test(title) ||
            /pyaar|ishq|dil|zindagi|tere|mere/.test(t)
        )
            return 'hindi';
        if (/punjabi|bhangra|jatt|desi/.test(t)) return 'punjabi';
        if (/tamil|kollywood/.test(t)) return 'tamil';
        if (/telugu|tollywood/.test(t)) return 'telugu';
        return 'english';
    },

    // Quick genre detection
    detectGenre(title) {
        const t = title.toLowerCase();
        if (/party|club|dj|remix|dance/.test(t)) return 'party';
        if (/sad|dard|bewafa|broken|tanha/.test(t)) return 'sad';
        if (/romantic|love|pyaar|ishq|valentine/.test(t)) return 'romantic';
        if (/bhajan|aarti|bhakti|devotional|mantra/.test(t))
            return 'devotional';
        if (/sufi|qawwali|nusrat/.test(t)) return 'sufi';
        if (/lofi|chill|relax|sleep/.test(t)) return 'chill';
        return 'bollywood';
    },

    // Check if title matches mood
    matchesMood(title, mood) {
        const t = title.toLowerCase();
        const moodKeywords = {
            sad: ['sad', 'dard', 'bewafa', 'broken', 'roya', 'aashiqui'],
            happy: ['happy', 'party', 'dance', 'masti', 'enjoy'],
            love: ['love', 'pyaar', 'ishq', 'romantic', 'valentine'],
            chill: ['lofi', 'chill', 'relax', 'acoustic', 'unplugged'],
        };
        return (moodKeywords[mood] || []).some((k) => t.includes(k));
    },
};

// 🧠 INVISIBLE INTELLIGENCE SYSTEM - Learns user preferences without any UI
// "No Settings, No Checkboxes - System khud seekhe"
const InvisibleIntelligence = {
    storageKey: 'pixelPlayIntelligence',

    // Get stored intelligence data
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (e) {
            return this.getDefaultData();
        }
    },

    // Default data structure
    getDefaultData() {
        return {
            // Language preferences (learned from play history)
            languages: {
                hindi: { plays: 0, skips: 0, score: 0 },
                english: { plays: 0, skips: 0, score: 0 },
                punjabi: { plays: 0, skips: 0, score: 0 },
                tamil: { plays: 0, skips: 0, score: 0 },
                telugu: { plays: 0, skips: 0, score: 0 },
                bengali: { plays: 0, skips: 0, score: 0 },
                marathi: { plays: 0, skips: 0, score: 0 },
                kannada: { plays: 0, skips: 0, score: 0 },
                malayalam: { plays: 0, skips: 0, score: 0 },
                gujarati: { plays: 0, skips: 0, score: 0 },
            },
            // Genre preferences
            genres: {
                bollywood: { plays: 0, skips: 0, score: 0 },
                devotional: { plays: 0, skips: 0, score: 0 },
                romantic: { plays: 0, skips: 0, score: 0 },
                party: { plays: 0, skips: 0, score: 0 },
                sad: { plays: 0, skips: 0, score: 0 },
                sufi: { plays: 0, skips: 0, score: 0 },
                indie: { plays: 0, skips: 0, score: 0 },
                classical: { plays: 0, skips: 0, score: 0 },
            },
            // 🛡️ TRUST: Channel Trust Scores (Rishiyon ki Pehchaan)
            channelTrust: {},
            // Channels to avoid (learned from skips)
            avoidChannels: [],
            // Keywords to avoid
            avoidKeywords: [],
            // Liked artists (learned from full plays)
            likedArtists: [],
            // Skip patterns
            skipHistory: [],
            // 🛡️ TRUST: Clickbait patterns detected
            clickbaitPatterns: [],
            // 🎯 SELECTION PATTERN - User's choice intelligence (40% of HEART)
            selectionPattern: {
                // Channel preferences from selections
                channelSelections: {}, // { "T-Series": {selected: 5, available: 10} }
                // Verified vs non-verified preference
                verifiedPreference: { verified: 0, nonVerified: 0 },
                // Position preference (which result index user picks)
                positionPreference: { top3: 0, mid: 0, bottom: 0 },
                // Content type preference
                contentType: { video: 0, audio: 0, lyrical: 0 },
                // Total selections tracked
                totalSelections: 0,
                // Selection-to-skip ratio
                selectSkipRatio: { selected: 0, skipped: 0 },
            },
            // Last updated
            lastUpdated: Date.now(),
        };
    },

    // Save data
    saveData(data) {
        try {
            data.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('[Intelligence] Save error:', e);
        }
    },

    // Language detection keywords
    languageMarkers: {
        hindi: [
            'hindi',
            'bollywood',
            'हिंदी',
            'dil',
            'pyaar',
            'ishq',
            'mohabbat',
            'zindagi',
            'tere',
            'mere',
            'tumhe',
            'mujhe',
            'yrf',
            't-series',
            'zee music',
            'tips official',
            'saregama',
        ],
        english: [
            'english',
            'pop',
            'rock',
            'jazz',
            'billboard',
            'vevo',
            'official video',
        ],
        punjabi: [
            'punjabi',
            'punjab',
            'bhangra',
            'gidda',
            'jatt',
            'desi',
            'speed records',
            'white hill',
        ],
        tamil: [
            'tamil',
            'தமிழ்',
            'kollywood',
            'think music',
            'sony music south',
            'lahari music',
        ],
        telugu: [
            'telugu',
            'తెలుగు',
            'tollywood',
            'aditya music',
            'mango music',
            'saavn telugu',
        ],
        bengali: [
            'bengali',
            'bangla',
            'বাংলা',
            'tollywood',
            'rabindra sangeet',
        ],
        marathi: ['marathi', 'मराठी'],
        kannada: ['kannada', 'ಕನ್ನಡ', 'sandalwood', 'anand audio'],
        malayalam: ['malayalam', 'മലയാളം', 'mollywood', 'muzik247'],
        gujarati: ['gujarati', 'ગુજરાતી', 'garba', 'dandiya'],
    },

    // Genre detection keywords
    genreMarkers: {
        bollywood: [
            'bollywood',
            'hindi film',
            'movie song',
            'film song',
            'yrf',
            't-series',
            'zee music',
        ],
        devotional: [
            'bhajan',
            'aarti',
            'bhakti',
            'mantra',
            'devotional',
            'spiritual',
            'krishna',
            'shiva',
            'ram',
            'ganesh',
            'sai',
            'ministries',
            'worship',
            'hymn',
            'gospel',
            'christian',
        ],
        romantic: [
            'romantic',
            'love song',
            'pyaar',
            'ishq',
            'mohabbat',
            'dil',
            'heart',
            'valentine',
        ],
        party: [
            'party',
            'dance',
            'dj',
            'remix',
            'club',
            'beat',
            'dhol',
            'item song',
        ],
        sad: [
            'sad',
            'emotional',
            'heartbreak',
            'dard',
            'gham',
            'bewafa',
            'judai',
            'alvida',
            'broken',
        ],
        sufi: ['sufi', 'qawwali', 'naat', 'ghazal', 'mehfil'],
        indie: ['indie', 'independent', 'unplugged', 'acoustic', 'raw'],
        classical: [
            'classical',
            'raag',
            'taal',
            'hindustani',
            'carnatic',
            'bandish',
        ],
    },

    // Detect language from title/channel
    detectLanguage(title, channelTitle = '') {
        const text = (title + ' ' + channelTitle).toLowerCase();
        for (const [lang, markers] of Object.entries(this.languageMarkers)) {
            for (const marker of markers) {
                if (text.includes(marker.toLowerCase())) {
                    return lang;
                }
            }
        }
        return 'hindi'; // Default to Hindi for Indian users
    },

    // Detect genre from title
    detectGenre(title) {
        const text = title.toLowerCase();
        for (const [genre, markers] of Object.entries(this.genreMarkers)) {
            for (const marker of markers) {
                if (text.includes(marker.toLowerCase())) {
                    return genre;
                }
            }
        }
        return 'bollywood'; // Default genre
    },

    // Learn from PLAY (user listened)
    learnFromPlay(
        songData,
        playDuration,
        totalDuration,
        isFromUserSearch = false
    ) {
        const data = this.getData();
        const title = songData?.title || '';
        const channel = songData?.channelTitle || '';

        // Calculate engagement (did user listen to most of the song?)
        const engagementRatio =
            totalDuration > 0 ? playDuration / totalDuration : 0;
        const isFullPlay = engagementRatio > 0.7; // Listened to 70%+

        // Detect language and genre
        const language = this.detectLanguage(title, channel);
        const genre = this.detectGenre(title);

        // Update language score
        if (data.languages[language]) {
            data.languages[language].plays++;
            data.languages[language].score = this.calculateScore(
                data.languages[language]
            );
        }

        // Update genre score
        if (data.genres[genre]) {
            data.genres[genre].plays++;
            data.genres[genre].score = this.calculateScore(data.genres[genre]);
        }

        // If full play, add artist to liked list
        if (isFullPlay && channel) {
            if (!data.likedArtists.includes(channel)) {
                data.likedArtists.push(channel);
                // Keep only last 50 artists
                if (data.likedArtists.length > 50) data.likedArtists.shift();
            }
        }

        // 🛡️ TRUST: Update channel trust on play
        // 🎯 GINI MODE: Only update trust if user explicitly selected this song from search
        this.updateChannelTrust(
            channel,
            'play',
            playDuration,
            totalDuration,
            isFromUserSearch
        );

        console.log(
            `[Intelligence] 📚 Learned: ${language}/${genre} (${
                isFullPlay ? 'full play' : 'partial'
            }) ${isFromUserSearch ? '👆 USER SELECTED' : '🤖 AUTOPLAY'}`
        );
        this.saveData(data);
    },

    // Learn from SKIP (user skipped)
    learnFromSkip(songData, skipTime) {
        const data = this.getData();
        const title = songData?.title || '';
        const channel = songData?.channelTitle || '';

        // Only count as skip if user skipped within first 30 seconds
        if (skipTime > 30) return;

        // Detect language and genre
        const language = this.detectLanguage(title, channel);
        const genre = this.detectGenre(title);

        // Update language score (negative)
        if (data.languages[language]) {
            data.languages[language].skips++;
            data.languages[language].score = this.calculateScore(
                data.languages[language]
            );
        }

        // Update genre score (negative)
        if (data.genres[genre]) {
            data.genres[genre].skips++;
            data.genres[genre].score = this.calculateScore(data.genres[genre]);
        }

        // 🛡️ TRUST: Update channel trust on skip
        this.updateChannelTrust(channel, 'skip', skipTime, 0);

        // Add channel to avoid list if skipped 3+ times
        const skipEntry = { channel, title, time: Date.now() };
        data.skipHistory.push(skipEntry);

        // Count skips per channel
        const channelSkips = data.skipHistory.filter(
            (s) => s.channel === channel
        ).length;
        if (channelSkips >= 3 && !data.avoidChannels.includes(channel)) {
            data.avoidChannels.push(channel);
            console.log(`[Intelligence] 🚫 Auto-blocking channel: ${channel}`);
        }

        // Keep skip history manageable
        if (data.skipHistory.length > 100) {
            data.skipHistory = data.skipHistory.slice(-50);
        }

        // 🎯 Update selectSkipRatio for HEART Sync (20% weight)
        if (data.selectionPattern) {
            data.selectionPattern.selectSkipRatio.skipped++;
            console.log(
                `[Intelligence] ⏭️ Skip tracked: ${data.selectionPattern.selectSkipRatio.skipped} skips / ${data.selectionPattern.selectSkipRatio.selected} selections`
            );
        }

        console.log(
            `[Intelligence] ⏭️ Skip learned: ${language}/${genre} from ${channel}`
        );
        this.saveData(data);
    },

    // 🎯 SELECTION PATTERN - Learn from user's choice (40% of HEART Sync)
    // "21 results mein se user ne kya choose kiya - that's REAL intelligence!"
    learnFromSelection(selectionData) {
        const data = this.getData();

        // Initialize selectionPattern if not exists
        if (!data.selectionPattern) {
            data.selectionPattern = {
                channelSelections: {},
                verifiedPreference: { verified: 0, nonVerified: 0 },
                positionPreference: { top3: 0, mid: 0, bottom: 0 },
                contentType: { video: 0, audio: 0, lyrical: 0 },
                totalSelections: 0,
                selectSkipRatio: { selected: 0, skipped: 0 },
            };
        }

        const sp = data.selectionPattern;
        const {
            selectedIndex,
            totalResults,
            channel,
            isVerified,
            title,
            isAutoPlay,
        } = selectionData;

        // Only track user selections, not autoplay
        if (isAutoPlay) return;

        sp.totalSelections++;
        sp.selectSkipRatio.selected++;

        // 1. Channel Selection Tracking
        if (channel) {
            if (!sp.channelSelections[channel]) {
                sp.channelSelections[channel] = { selected: 0, available: 0 };
            }
            sp.channelSelections[channel].selected++;
            sp.channelSelections[channel].available++;
        }

        // 2. Verified vs Non-Verified Preference
        if (isVerified) {
            sp.verifiedPreference.verified++;
        } else {
            sp.verifiedPreference.nonVerified++;
        }

        // 3. Position Preference (where in list did they pick?)
        if (selectedIndex <= 2) {
            sp.positionPreference.top3++; // First 3 results
        } else if (selectedIndex <= 6) {
            sp.positionPreference.mid++; // 4th to 7th
        } else {
            sp.positionPreference.bottom++; // 8th and beyond (discerning user!)
        }

        // 4. Content Type Detection
        const titleLower = title?.toLowerCase() || '';
        if (titleLower.includes('lyric') || titleLower.includes('lyrics')) {
            sp.contentType.lyrical++;
        } else if (
            titleLower.includes('audio') ||
            titleLower.includes('full album')
        ) {
            sp.contentType.audio++;
        } else {
            sp.contentType.video++; // Default to video
        }

        // Keep channel selections manageable (top 30 channels)
        const channelEntries = Object.entries(sp.channelSelections);
        if (channelEntries.length > 30) {
            const sorted = channelEntries.sort(
                (a, b) => b[1].selected - a[1].selected
            );
            sp.channelSelections = Object.fromEntries(sorted.slice(0, 30));
        }

        console.log(
            `[Intelligence] 🎯 Selection learned: "${channel}" at position ${
                selectedIndex + 1
            }/${totalResults} (verified: ${isVerified})`
        );
        console.log(
            `[Intelligence] 📊 Total selections: ${
                sp.totalSelections
            }, Verified ratio: ${sp.verifiedPreference.verified}/${
                sp.verifiedPreference.verified +
                sp.verifiedPreference.nonVerified
            }`
        );

        this.saveData(data);
    },

    // 📊 Get Selection Pattern Score (0-40 points for HEART Sync)
    getSelectionPatternScore() {
        const data = this.getData();
        const sp = data.selectionPattern;

        if (!sp || sp.totalSelections === 0) {
            return 0; // No selections yet
        }

        let score = 0;

        // 1. Channel Loyalty Score (max 15 points)
        // More selections = more data = more points
        const channelEntries = Object.entries(sp.channelSelections || {});
        const totalChannelSelections = channelEntries.reduce(
            (sum, [, v]) => sum + v.selected,
            0
        );

        // Has consistent channel preference?
        if (channelEntries.length > 0) {
            const topChannel = channelEntries.sort(
                (a, b) => b[1].selected - a[1].selected
            )[0];
            const topChannelRatio =
                topChannel[1].selected / totalChannelSelections;

            // Strong preference = higher score
            const loyaltyScore = Math.min(
                15,
                topChannelRatio * 10 +
                    Math.min(totalChannelSelections, 10) * 0.5
            );
            score += loyaltyScore;
        }

        // 2. Verified Preference Score (max 10 points)
        const totalVerified =
            sp.verifiedPreference.verified + sp.verifiedPreference.nonVerified;
        if (totalVerified > 0) {
            const verifiedRatio =
                sp.verifiedPreference.verified / totalVerified;
            // Prefer verified = quality conscious user
            score += Math.min(10, verifiedRatio * 10);
        }

        // 3. Position Pattern Score (max 10 points)
        const totalPos =
            sp.positionPreference.top3 +
            sp.positionPreference.mid +
            sp.positionPreference.bottom;
        if (totalPos > 0) {
            // Users who scroll down and pick = discerning = higher score
            const discernmentRatio =
                (sp.positionPreference.mid + sp.positionPreference.bottom * 2) /
                totalPos;
            score += Math.min(10, 3 + discernmentRatio * 7);
        }

        // 4. Selection-to-Skip Ratio Bonus (max 5 points)
        const totalActions =
            sp.selectSkipRatio.selected + sp.selectSkipRatio.skipped;
        if (totalActions > 0) {
            const selectRatio = sp.selectSkipRatio.selected / totalActions;
            score += Math.min(5, selectRatio * 5);
        }

        const finalScore = Math.round(Math.min(40, score));
        console.log(
            `[Intelligence] 🎯 Selection Pattern Score: ${finalScore}/40`
        );

        return finalScore;
    },

    // Calculate preference score
    calculateScore(stats) {
        // Score = plays - (skips * 2)
        // Skips have more weight because they indicate active dislike
        return stats.plays - stats.skips * 2;
    },

    // Get preferred languages (score > 0)
    getPreferredLanguages() {
        const data = this.getData();
        return Object.entries(data.languages)
            .filter(([lang, stats]) => stats.score > 0)
            .sort((a, b) => b[1].score - a[1].score)
            .map(([lang]) => lang);
    },

    // Get avoided languages (score < -3)
    getAvoidedLanguages() {
        const data = this.getData();
        return Object.entries(data.languages)
            .filter(([lang, stats]) => stats.score < -3)
            .map(([lang]) => lang);
    },

    // Get preferred genres
    getPreferredGenres() {
        const data = this.getData();
        return Object.entries(data.genres)
            .filter(([genre, stats]) => stats.score > 0)
            .sort((a, b) => b[1].score - a[1].score)
            .map(([genre]) => genre);
    },

    // Get avoided genres (score < -3)
    getAvoidedGenres() {
        const data = this.getData();
        return Object.entries(data.genres)
            .filter(([genre, stats]) => stats.score < -3)
            .map(([genre]) => genre);
    },

    // Check if a song should be filtered
    shouldFilter(title, channelTitle) {
        const data = this.getData();
        const language = this.detectLanguage(title, channelTitle);
        const genre = this.detectGenre(title);

        // Check if language is avoided
        if (this.getAvoidedLanguages().includes(language)) {
            console.log(`[Intelligence] 🚫 Filtering ${language} song`);
            return true;
        }

        // Check if genre is avoided
        if (this.getAvoidedGenres().includes(genre)) {
            console.log(`[Intelligence] 🚫 Filtering ${genre} song`);
            return true;
        }

        // Check if channel is avoided
        if (data.avoidChannels.includes(channelTitle)) {
            console.log(
                `[Intelligence] 🚫 Filtering avoided channel: ${channelTitle}`
            );
            return true;
        }

        return false;
    },

    // Get search boost keywords based on preferences
    getSearchBoost() {
        const preferredLangs = this.getPreferredLanguages();
        const preferredGenres = this.getPreferredGenres();

        let boost = [];

        // Add top language
        if (preferredLangs.length > 0) {
            boost.push(preferredLangs[0] + ' songs');
        }

        // Add top genre
        if (preferredGenres.length > 0 && preferredGenres[0] !== 'bollywood') {
            boost.push(preferredGenres[0]);
        }

        return boost.join(' ');
    },

    // Debug: Show current intelligence
    debug() {
        const data = this.getData();
        console.log('[Intelligence] 🧠 Current State:');
        console.log('  Preferred Languages:', this.getPreferredLanguages());
        console.log('  Avoided Languages:', this.getAvoidedLanguages());
        console.log('  Preferred Genres:', this.getPreferredGenres());
        console.log('  Avoided Genres:', this.getAvoidedGenres());
        console.log('  Avoided Channels:', data.avoidChannels);
        console.log('  Liked Artists:', data.likedArtists.slice(0, 5));
        return data;
    },

    // ═══════════════════════════════════════════════════════════════
    // 🛡️ TRUST SYSTEM - Rishiyon ki Pehchaan (Channel Authenticity)
    // "Jaise sadhu ne 2 baar observe kiya, phir trust diya"
    // ═══════════════════════════════════════════════════════════════

    // 🛡️ TRUST: Pre-trusted channels (Quality music - No borders, just HEART!)
    // "Koi desh ban nahi hai... bus dil ko ghayal kare..." - Ashish
    TRUSTED_CHANNELS: [
        // 🇮🇳 Indian Labels
        't-series',
        'zee music company',
        'tips official',
        'sony music india',
        'saregama music',
        'yrf',
        'eros now music',
        'zee music',
        'shemaroo',
        'venus',
        'ultra bollywood',
        'speed records',
        'white hill music',
        'desi music factory',
        'voilà! digi',
        'tseries',
        'aditya music',
        'lahari music',
        'mango music',
        'sun tv',
        'think music',
        // 🇵🇰 Pakistan (Music has no borders!)
        'coke studio pakistan',
        'coke studio',
        'patari',
        'bisconni music',
        // 🌍 International Quality
        'vevo',
        'colors tv',
        'mtv',
        'bollywood classics',
        'filmigaane',
        'rajshri',
        'gaana',
        'jiocinema',
        'amazon music',
        'spotify',
        // 🎤 Artist Channels (Verified quality)
        'arijit singh',
        'shreya ghoshal',
        'sonu nigam',
        'kumar sanu official',
        'udit narayan',
        'alka yagnik',
        'lata mangeshkar',
        'kishore kumar',
        'ar rahman',
        'amit trivedi',
        'vishal dadlani',
        'pritam',
        'sachin-jigar',
        'atif aslam',
        'rahat fateh ali khan',
        'nusrat fateh ali khan',
        // 🙏 Bhakti Channels (Baba ki mahima!)
        'tilak',
        't-series bhakti sagar',
        'bhakti sagar',
        'shemaroo bhakti',
        'rajshri soul',
        'iskon',
        'art of living',
        'sadhguru',
        'bhajan',
        'gulshan kumar',
        'anuradha paudwal',
        'anup jalota',
        'hariharan',
    ],

    // 🙏 BHAKTI: Keywords to detect devotional content (allow longer duration)
    BHAKTI_KEYWORDS: [
        'sunderkand',
        'hanuman chalisa',
        'aarti',
        'bhajan',
        'kirtan',
        'path',
        'geeta',
        'gita',
        'ramayan',
        'mahabharat',
        'shiv',
        'krishna',
        'ram',
        'sai baba',
        'shirdi',
        'ganesh',
        'durga',
        'lakshmi',
        'vishnu',
        'brahma',
        'mantra',
        'jaap',
        'stuti',
        'stotra',
        'chalisa',
        'satnam',
        'waheguru',
        'gurbani',
        'shabad',
        'bhakti',
        'devotional',
        'spiritual',
        'meditation',
    ],

    // 🙏 BHAKTI: Check if content is devotional
    isBhaktiContent(title, channel) {
        const text = ((title || '') + ' ' + (channel || '')).toLowerCase();
        return this.BHAKTI_KEYWORDS.some((keyword) => text.includes(keyword));
    },

    // 🛡️ TRUST: Clickbait patterns to detect (spam indicators)
    CLICKBAIT_PATTERNS: [
        /^[A-Z\s]{10,}$/, // ALL CAPS titles (10+ chars)
        /[😍🔥💕❤️]{3,}/, // Excessive emojis (3+)
        /\b(leaked|banned|deleted|removed)\b/i, // Misleading words
        /\b(full\s*hd|4k\s*video|1080p|720p)\b/i, // Quality spam
        /\b(bass\s*boosted|8d\s*audio|slowed\s*reverb)\b/i, // Audio gimmicks
        /\[(official|lyrical|lyrics)\s*video\]/i, // Not spam, but low priority
    ],

    // 🛡️ TRUST: Get channel trust score
    getChannelTrust(channelTitle) {
        if (!channelTitle) return 0;

        const data = this.getData();
        const channelKey = channelTitle.toLowerCase().trim();

        // Pre-trusted channels start with high score
        if (this.TRUSTED_CHANNELS.some((tc) => channelKey.includes(tc))) {
            return 100; // Maximum trust for verified channels
        }

        // Check stored trust
        if (data.channelTrust && data.channelTrust[channelKey]) {
            return data.channelTrust[channelKey].score || 0;
        }

        return 0; // New channel = neutral
    },

    // 🛡️ TRUST: Update channel trust based on play behavior
    // 🎯 GINI MODE: Only learn from USER's explicit search/selection, NOT autoplay!
    updateChannelTrust(
        channelTitle,
        action,
        playDuration = 0,
        totalDuration = 0,
        isFromUserSearch = false // 🎯 NEW: Only true when user explicitly selected from search
    ) {
        if (!channelTitle) return;

        // 🎯 GINI MODE: Autoplay songs shouldn't affect trust scoring
        // User's explicit choice matters - "User search matters, not what plays automatically"
        if (!isFromUserSearch && action === 'play') {
            console.log(
                `[TRUST] ⏭️ Skipping trust update (autoplay): ${channelTitle}`
            );
            return;
        }

        const data = this.getData();
        const channelKey = channelTitle.toLowerCase().trim();

        // Initialize channel trust if not exists
        if (!data.channelTrust) data.channelTrust = {};
        if (!data.channelTrust[channelKey]) {
            data.channelTrust[channelKey] = {
                score: 0,
                plays: 0,
                skips: 0,
                totalListenTime: 0,
                firstSeen: Date.now(),
            };
        }

        const channel = data.channelTrust[channelKey];

        if (action === 'play') {
            const engagementRatio =
                totalDuration > 0 ? playDuration / totalDuration : 0;

            if (engagementRatio > 0.7) {
                // Full play = +3 trust (Sadhu approved!)
                channel.score += 3;
                channel.plays++;
                console.log(
                    `[TRUST] 🛡️ Full play! ${channelTitle} trust: +3 → ${channel.score}`
                );
            } else if (engagementRatio > 0.3) {
                // Partial play = +1 trust
                channel.score += 1;
                channel.plays++;
                console.log(
                    `[TRUST] 🛡️ Partial play. ${channelTitle} trust: +1 → ${channel.score}`
                );
            }

            channel.totalListenTime += playDuration;
        } else if (action === 'skip') {
            // Skip within 30s = -2 trust
            if (playDuration < 30) {
                channel.score -= 2;
                channel.skips++;
                console.log(
                    `[TRUST] 🛡️ Quick skip! ${channelTitle} trust: -2 → ${channel.score}`
                );
            }
        }

        // Clamp score between -10 and 100
        channel.score = Math.max(-10, Math.min(100, channel.score));

        // Auto-block if trust goes below -5
        if (channel.score <= -5 && !data.avoidChannels.includes(channelTitle)) {
            data.avoidChannels.push(channelTitle);
            console.log(
                `[TRUST] 🚫 Channel blocked due to low trust: ${channelTitle}`
            );
        }

        this.saveData(data);
    },

    // 🛡️ TRUST: Check if title is clickbait
    isClickbait(title) {
        if (!title) return false;

        let clickbaitScore = 0;

        for (const pattern of this.CLICKBAIT_PATTERNS) {
            if (pattern.test(title)) {
                clickbaitScore++;
            }
        }

        // Count excessive uppercase words
        const words = title.split(' ');
        const capsWords = words.filter(
            (w) => w.length > 3 && w === w.toUpperCase()
        ).length;
        if (capsWords > 2) clickbaitScore++;

        // Count emojis
        const emojiCount = (
            title.match(
                /[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
            ) || []
        ).length;
        if (emojiCount > 3) clickbaitScore++;

        const isClickbait = clickbaitScore >= 2;
        if (isClickbait) {
            console.log(
                `[TRUST] 🎣 Clickbait detected: "${title.substring(
                    0,
                    40
                )}..." (score: ${clickbaitScore})`
            );
        }

        return isClickbait;
    },

    // 🛡️ TRUST: Get trust level label
    getTrustLevel(channelTitle) {
        const score = this.getChannelTrust(channelTitle);

        // Simple Bootstrap Icons - fast load, clean look (Steve philosophy)
        if (score >= 50)
            return {
                level: 'verified',
                icon: 'bi-patch-check-fill',
                label: 'Verified Channel',
            };
        if (score >= 20)
            return {
                level: 'trusted',
                icon: 'bi-shield-check',
                label: 'Trusted',
            };
        if (score >= 5)
            return {
                level: 'known',
                icon: 'bi-hand-thumbs-up',
                label: 'Known',
            };
        if (score >= 0) return { level: 'new', icon: '', label: 'New' }; // No icon for new
        return {
            level: 'suspect',
            icon: 'bi-exclamation-triangle',
            label: 'Suspect',
        };
    },

    // 🛡️ TRUST: Should prioritize this channel?
    shouldPrioritize(channelTitle, title) {
        // Pre-trusted channels = always prioritize
        const channelKey = (channelTitle || '').toLowerCase();
        if (this.TRUSTED_CHANNELS.some((tc) => channelKey.includes(tc))) {
            return true;
        }

        // High trust score = prioritize
        if (this.getChannelTrust(channelTitle) >= 10) {
            return true;
        }

        // Clickbait = de-prioritize
        if (this.isClickbait(title)) {
            return false;
        }

        return null; // Neutral
    },
};

// 💓 HEART ALGORITHM - Harmonic Emotional Adaptive Resonance Technology
// "We are harmonic beings" - Search It, Play It, Feel It!
// System learns user's emotional patterns over 3 days and suggests perfect vibes
const HEART = {
    storageKey: 'pixelPlayHeart',

    // Feeling categories with energy levels
    // Feeling categories with energy levels
    // 🌉 LoFi added as "bridge" mood - perfect for sad → happy transition
    feelings: {
        workout: {
            energy: 90,
            keywords: ['pump', 'gym', 'workout', 'exercise', 'power', 'energy'],
        },
        party: {
            energy: 85,
            keywords: ['party', 'dance', 'club', 'dj', 'remix', 'nachle'],
        },
        travel: {
            energy: 70,
            keywords: ['safar', 'road', 'travel', 'journey', 'musafir'],
        },
        romance: {
            energy: 60,
            keywords: ['pyaar', 'ishq', 'love', 'dil', 'romantic', 'sajna'],
        },
        lofi: {
            energy: 45,
            keywords: ['lofi', 'lo-fi', 'aesthetic', 'study', 'focus', 'vibes'],
        }, // Bridge mood!
        chill: {
            energy: 40,
            keywords: ['relax', 'chill', 'peaceful', 'calm', 'sukoon'],
        },
        rain: {
            energy: 50,
            keywords: ['baarish', 'rain', 'monsoon', 'sawan', 'bheegi'],
        },
        devotional: {
            energy: 30,
            keywords: ['bhajan', 'aarti', 'bhakti', 'spiritual', 'mantra'],
        },
        sad: {
            energy: 20,
            keywords: ['sad', 'dard', 'gham', 'broken', 'judai', 'alvida'],
        },
    },

    // Get stored HEART data
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (e) {
            return this.getDefaultData();
        }
    },

    // Default HEART data structure
    getDefaultData() {
        return {
            // First use timestamp (for 3-day learning period)
            firstUse: Date.now(),

            // Session tracking
            currentSession: {
                startTime: Date.now(),
                songsPlayed: 0,
                dominantMood: null,
                moods: [], // Track moods in current session
            },

            // Energy level (0-100, adjusts with song moods)
            energyLevel: 50,

            // Time-based patterns
            timePatterns: {
                morning: { moods: {}, count: 0 }, // 5am - 12pm
                workday: { moods: {}, count: 0 }, // 12pm - 5pm
                evening: { moods: {}, count: 0 }, // 5pm - 9pm
                night: { moods: {}, count: 0 }, // 9pm - 12am
                latenight: { moods: {}, count: 0 }, // 12am - 5am
            },

            // Mood history for pattern detection
            moodHistory: [],

            // Consecutive sad song counter (for mood uplift)
            consecutiveSadSongs: 0,

            // Last updated
            lastUpdated: Date.now(),
        };
    },

    // Save HEART data
    saveData(data) {
        try {
            data.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('[HEART] Save error:', e);
        }
    },

    // Get current time period
    getTimePeriod() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'workday';
        if (hour >= 17 && hour < 21) return 'evening';
        if (hour >= 21 || hour < 0) return 'night';
        return 'latenight'; // 0am - 5am
    },

    // Get time-based mood suggestion
    getTimeSuggestedMood() {
        const period = this.getTimePeriod();
        const data = this.getData();
        const patterns = data.timePatterns[period];

        // If we have learned patterns for this time
        if (patterns && patterns.count > 3) {
            const moods = patterns.moods;
            const topMood = Object.entries(moods).sort(
                (a, b) => b[1] - a[1]
            )[0];
            if (topMood) {
                console.log(
                    `[HEART] 🎯 Time-based suggestion: ${topMood[0]} (${period})`
                );
                return topMood[0];
            }
        }

        // Default suggestions based on time
        const defaults = {
            morning: 'devotional',
            workday: 'chill',
            evening: 'romance',
            night: 'party',
            latenight: 'chill',
        };
        return defaults[period];
    },

    // Start new session
    startSession() {
        const data = this.getData();
        data.currentSession = {
            startTime: Date.now(),
            songsPlayed: 0,
            dominantMood: null,
            moods: [],
        };
        this.saveData(data);
        console.log('[HEART] 💓 New session started');
    },

    // Update session with song mood
    updateSessionMood(mood) {
        const data = this.getData();
        data.currentSession.songsPlayed++;
        data.currentSession.moods.push(mood);

        // Calculate dominant mood
        const moodCounts = {};
        data.currentSession.moods.forEach((m) => {
            moodCounts[m] = (moodCounts[m] || 0) + 1;
        });
        data.currentSession.dominantMood = Object.entries(moodCounts).sort(
            (a, b) => b[1] - a[1]
        )[0]?.[0];

        // Update time-based patterns
        const period = this.getTimePeriod();
        if (!data.timePatterns[period].moods[mood]) {
            data.timePatterns[period].moods[mood] = 0;
        }
        data.timePatterns[period].moods[mood]++;
        data.timePatterns[period].count++;

        // Update energy level based on mood
        const feeling = this.feelings[mood];
        if (feeling) {
            // Gradual energy adjustment (weighted average)
            data.energyLevel = Math.round(
                data.energyLevel * 0.7 + feeling.energy * 0.3
            );
        }

        // Track sad songs for mood uplift
        if (mood === 'sad') {
            data.consecutiveSadSongs++;

            // 🤗 JADU KI JHAPPI - Check if user needs a hug!
            // "Apne ko user ko jada rone nahi dena..."
            if (
                data.consecutiveSadSongs >= 3 &&
                typeof HEARTWhisper !== 'undefined'
            ) {
                setTimeout(() => {
                    HEARTWhisper.checkSadLoop();
                }, 2000); // Slight delay for natural feel
            }
        } else {
            data.consecutiveSadSongs = 0;
        }

        // Add to mood history
        data.moodHistory.push({
            mood,
            time: Date.now(),
            period: period,
        });

        // Keep history manageable (last 100 songs)
        if (data.moodHistory.length > 100) {
            data.moodHistory = data.moodHistory.slice(-50);
        }

        this.saveData(data);
        console.log(
            `[HEART] 💓 Session mood: ${mood}, Energy: ${data.energyLevel}, Dominant: ${data.currentSession.dominantMood}`
        );
    },

    // Get dominant session mood
    getDominantSessionMood() {
        const data = this.getData();
        return data.currentSession.dominantMood;
    },

    // Check if mood uplift is needed (3+ sad songs)
    shouldUpliftMood() {
        const data = this.getData();
        return data.consecutiveSadSongs >= 3;
    },

    // Get uplift suggestions (gradual mood lift: sad → lofi → happy)
    // 🌉 LoFi added as bridge - smooth transition instead of sudden party songs!
    getUpliftSuggestions() {
        const data = this.getData();
        const sadStreak = data.consecutiveSadSongs || 0;

        // Gradual uplift: first try LoFi (bridge), then go happier
        if (sadStreak <= 3) {
            // First level: LoFi bridge
            return [
                'hindi lofi songs',
                'bollywood lofi mix',
                'chill hindi songs',
                'aesthetic bollywood songs',
                'relaxing hindi music',
            ];
        } else if (sadStreak <= 5) {
            // Second level: Romantic/feel good
            return [
                'feel good hindi songs',
                'upbeat romantic songs',
                'happy bollywood songs',
                'positive vibes hindi',
            ];
        } else {
            // Third level: Full party mode!
            return [
                'bollywood party songs',
                'peppy bollywood songs',
                'dance hindi songs',
                'energy bollywood hits',
            ];
        }
    },

    // Check if user is "known" (3+ days of usage)
    isUserKnown() {
        const data = this.getData();
        const daysSinceFirst =
            (Date.now() - data.firstUse) / (1000 * 60 * 60 * 24);
        return daysSinceFirst >= 3;
    },

    // Get confidence level
    getConfidenceLevel() {
        const data = this.getData();
        const daysSinceFirst =
            (Date.now() - data.firstUse) / (1000 * 60 * 60 * 24);
        const totalSongs = data.moodHistory.length;

        if (daysSinceFirst < 1 || totalSongs < 10) return 'learning';
        if (daysSinceFirst < 3 || totalSongs < 30) return 'medium';
        return 'high';
    },

    // Get current energy level
    getEnergyLevel() {
        const data = this.getData();
        return data.energyLevel;
    },

    // Detect mood from song title
    detectMoodFromTitle(title) {
        const lowerTitle = title.toLowerCase();

        for (const [mood, config] of Object.entries(this.feelings)) {
            for (const keyword of config.keywords) {
                if (lowerTitle.includes(keyword)) {
                    return mood;
                }
            }
        }
        return 'chill'; // Default mood
    },

    // Get smart recommendation based on all factors
    getSmartRecommendation() {
        const data = this.getData();
        const period = this.getTimePeriod();
        const confidence = this.getConfidenceLevel();

        // If mood uplift needed
        if (this.shouldUpliftMood()) {
            console.log('[HEART] 🌈 Mood uplift triggered!');
            return {
                type: 'uplift',
                suggestions: this.getUpliftSuggestions(),
                reason: 'Time for some positive vibes!',
            };
        }

        // If high confidence, use learned patterns
        if (confidence === 'high') {
            const suggestedMood = this.getTimeSuggestedMood();
            return {
                type: 'learned',
                mood: suggestedMood,
                reason: `Based on your ${period} listening patterns`,
            };
        }

        // Default time-based suggestion
        return {
            type: 'time',
            mood: this.getTimeSuggestedMood(),
            reason: `Perfect for ${period} vibes`,
        };
    },

    // Initialize HEART on app load
    init() {
        console.log(
            '[HEART] 💓 HEART Algorithm initialized - "We are harmonic beings"'
        );
        const period = this.getTimePeriod();
        const suggestedMood = this.getTimeSuggestedMood();
        const confidence = this.getConfidenceLevel();

        console.log(`[HEART] 💓 Time period: ${period}`);
        console.log(`[HEART] 💓 Suggested mood: ${suggestedMood}`);
        console.log(`[HEART] 💓 Confidence: ${confidence}`);

        // Start new session if needed
        const data = this.getData();
        const sessionAge = Date.now() - data.currentSession.startTime;
        if (sessionAge > 30 * 60 * 1000) {
            // 30 minutes
            this.startSession();
        }
    },

    // 🧘‍♂️ DEEP LISTENING MODE - When user is in the zone
    // "Jab user zone mein ho, disturb mat karo"
    deepListening: {
        startTime: null,
        skipCount: 0,
        isActive: false,
        currentMood: null,
    },

    // Start tracking deep listening
    startDeepListening(mood) {
        this.deepListening.startTime = Date.now();
        this.deepListening.skipCount = 0;
        this.deepListening.currentMood = mood;
        this.deepListening.isActive = true;
        console.log(
            '[HEART] 🧘‍♂️ Deep Listening started - tracking engagement...'
        );
    },

    // Record a skip (breaks deep listening)
    recordSkip() {
        this.deepListening.skipCount++;
        if (this.deepListening.skipCount >= 2) {
            this.deepListening.isActive = false;
            console.log('[HEART] 🧘‍♂️ Deep Listening broken - user is browsing');
        }
    },

    // Check if user is in deep listening mode
    isInDeepListening() {
        if (!this.deepListening.isActive || !this.deepListening.startTime)
            return false;

        const listenTime =
            (Date.now() - this.deepListening.startTime) / 1000 / 60; // minutes
        const noSkips = this.deepListening.skipCount === 0;

        // 5+ minutes without skip = DEEP LISTENING! 🧘‍♂️
        if (listenTime >= 5 && noSkips) {
            console.log(
                `[HEART] 🧘‍♂️ DEEP LISTENING MODE ACTIVE! (${listenTime.toFixed(
                    1
                )} min, 0 skips)`
            );
            return true;
        }
        return false;
    },

    // Get deep listening stats
    getDeepListeningStats() {
        if (!this.deepListening.startTime) return null;

        const listenTime =
            (Date.now() - this.deepListening.startTime) / 1000 / 60;
        return {
            minutes: listenTime.toFixed(1),
            skips: this.deepListening.skipCount,
            mood: this.deepListening.currentMood,
            isDeep: this.isInDeepListening(),
        };
    },

    // Save deep listening session (for learning)
    saveDeepSession() {
        if (!this.isInDeepListening()) return;

        const data = this.getData();
        const stats = this.getDeepListeningStats();

        // Initialize deep sessions array if not exists
        if (!data.deepSessions) data.deepSessions = [];

        data.deepSessions.push({
            mood: stats.mood,
            duration: stats.minutes,
            time: Date.now(),
            period: this.getTimePeriod(),
        });

        // Keep last 20 deep sessions
        if (data.deepSessions.length > 20) {
            data.deepSessions = data.deepSessions.slice(-20);
        }

        this.saveData(data);
        console.log(
            `[HEART] 🧘‍♂️ Deep session saved: ${stats.mood} for ${stats.minutes} min`
        );
    },

    // Debug: Show HEART state
    debug() {
        const data = this.getData();
        const deepStats = this.getDeepListeningStats();
        console.log('[HEART] 💓 Current State:');
        console.log('  Time Period:', this.getTimePeriod());
        console.log('  Suggested Mood:', this.getTimeSuggestedMood());
        console.log('  Energy Level:', data.energyLevel);
        console.log('  Confidence:', this.getConfidenceLevel());
        console.log('  Session Songs:', data.currentSession.songsPlayed);
        console.log('  Dominant Mood:', data.currentSession.dominantMood);
        console.log('  Consecutive Sad:', data.consecutiveSadSongs);
        console.log('  Is User Known:', this.isUserKnown());
        if (deepStats) {
            console.log(
                '  🧘‍♂️ Deep Listening:',
                deepStats.isDeep ? 'ACTIVE' : 'inactive'
            );
            console.log('     Duration:', deepStats.minutes, 'min');
            console.log('     Skips:', deepStats.skips);
        }
        return data;
    },

    // 💕 HEART SYNC PERCENTAGE - NEW BODMAS/BIDMAS Calculation
    // 🎯 Selection Pattern (40%) + Base/Time (30%) + Skip Behavior (20%) + Mood (10%)
    // "21 results mein se 1 selection = 21x learning!" - Ashish Philosophy
    // #FeatureDevelopedOnFeelings
    getHeartSyncPercentage() {
        // ════════════════════════════════════════════════════════════════
        // 🔐 LOGIN CHECK - Guest mode = 0% (Heart sirf logged-in users ke liye)
        // ════════════════════════════════════════════════════════════════
        try {
            const storedUser = localStorage.getItem('pixelMusicUser');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.loginType === 'guest') {
                    console.log(
                        '[HEART] 👤 Guest mode - Heart sync disabled. Login to sync! 🔐'
                    );
                    return 0;
                }
            } else {
                console.log(
                    '[HEART] ❌ No user logged in - Heart sync requires login'
                );
                return 0;
            }
        } catch (e) {
            console.log('[HEART] ⚠️ Error checking login status');
            return 0;
        }

        const data = this.getData();
        const now = Date.now();
        const daysSinceFirst = (now - data.firstUse) / (1000 * 60 * 60 * 24);
        const dailyVisits = this.getDailyVisits();

        // ════════════════════════════════════════════════════════════════
        // 📊 NEW HEART SYNC FORMULA (BODMAS Style)
        // Total = Base(30) + Selection(40) + Skip(20) + Mood(10) = 100 max
        // ════════════════════════════════════════════════════════════════

        // ────────────────────────────────────────────────────────────────
        // 1️⃣ BASE SCORE (max 30 points) - Time & Visits
        // "Pyaar dhire dhire hota hai..."
        // ────────────────────────────────────────────────────────────────
        let baseScore = 0;

        // Days score (max 15 points over 7 days)
        const daysScore = Math.min(15, (daysSinceFirst / 7) * 15);

        // Visits score (max 15 points for 15 visits)
        const visitsScore = Math.min(15, dailyVisits);

        baseScore = daysScore + visitsScore;

        // ────────────────────────────────────────────────────────────────
        // 2️⃣ SELECTION PATTERN SCORE (max 40 points) - THE MAIN LEARNING
        // "21 results mein se user ne kya choose kiya!"
        // ────────────────────────────────────────────────────────────────
        const selectionScore = InvisibleIntelligence.getSelectionPatternScore();

        // ────────────────────────────────────────────────────────────────
        // 3️⃣ SKIP BEHAVIOR SCORE (max 20 points)
        // Low skips = high engagement = higher score
        // ────────────────────────────────────────────────────────────────
        let skipScore = 0;
        const intelligenceData = InvisibleIntelligence.getData();
        const sp = intelligenceData.selectionPattern || {
            selectSkipRatio: { selected: 0, skipped: 0 },
        };

        const totalActions =
            sp.selectSkipRatio.selected + sp.selectSkipRatio.skipped;
        if (totalActions > 0) {
            // Higher select ratio = less skips = better score
            const selectRatio = sp.selectSkipRatio.selected / totalActions;
            skipScore = Math.min(20, selectRatio * 20);
        } else {
            // No actions yet = neutral score
            skipScore = 10;
        }

        // ────────────────────────────────────────────────────────────────
        // 4️⃣ MOOD/CONTEXT SCORE (max 10 points)
        // Engaged users in positive moods = slight boost
        // ────────────────────────────────────────────────────────────────
        const currentMood = data.currentSession?.dominantMood || 'neutral';
        const moodScores = {
            romance: 10, // 💕 Engaged in love songs
            party: 9, // 🎉 Party vibes
            devotional: 9, // 🙏 Spiritual
            chill: 8, // 🌿 Relaxed
            happy: 8, // 😊 Happy
            neutral: 5, // 🔄 Unknown yet
            sad: 4, // 😢 Sad (might be stuck in loop)
        };
        const moodScore = moodScores[currentMood] || 5;

        // ════════════════════════════════════════════════════════════════
        // 🧮 FINAL CALCULATION (BODMAS: Add all components)
        // ════════════════════════════════════════════════════════════════
        const totalRaw = baseScore + selectionScore + skipScore + moodScore;
        const percentage = Math.round(Math.min(100, Math.max(0, totalRaw)));

        console.log(`[HEART] 🧮 NEW BODMAS Calculation:`);
        console.log(
            `  📅 Base (days+visits): ${baseScore.toFixed(
                1
            )}/30 (days:${daysScore.toFixed(1)} visits:${visitsScore.toFixed(
                1
            )})`
        );
        console.log(`  🎯 Selection Pattern: ${selectionScore}/40`);
        console.log(`  ⏭️ Skip Behavior: ${skipScore.toFixed(1)}/20`);
        console.log(`  🎭 Mood Context: ${moodScore}/10 (${currentMood})`);
        console.log(`[HEART] 💕 Final Sync: ${percentage}%`);

        return percentage;
    },

    // Track unique daily visits
    getDailyVisits() {
        const storageKey = 'pixelPlayDailyVisits';
        const today = new Date().toDateString();

        try {
            const data = JSON.parse(
                localStorage.getItem(storageKey) || '{"visits":[],"lastDay":""}'
            );

            // If today is a new day, add to visits
            if (data.lastDay !== today) {
                data.visits.push(today);
                data.lastDay = today;
                localStorage.setItem(storageKey, JSON.stringify(data));
                console.log(
                    `[HEART] 📅 New day visit recorded! Total: ${data.visits.length} days`
                );
            }

            return data.visits.length;
        } catch (e) {
            return 1;
        }
    },

    // Legacy method for backward compatibility
    getHeartSyncPercentageLegacy() {
        const data = this.getData();
        const intelligenceData = InvisibleIntelligence.getData();

        // Sense 1: Days of usage (max 20 points)
        const daysSinceFirst =
            (Date.now() - data.firstUse) / (1000 * 60 * 60 * 24);
        const daysScore = Math.min(20, (daysSinceFirst / 7) * 20);

        // Sense 2: Songs played (max 25 points)
        const songsPlayed = data.moodHistory?.length || 0;
        const songsScore = Math.min(25, (songsPlayed / 50) * 25);

        // Sense 3: Languages learned (max 20 points)
        const preferredLangs = InvisibleIntelligence.getPreferredLanguages();
        const langScore = Math.min(20, preferredLangs.length * 5);

        // Sense 4: Genres learned (max 20 points)
        const preferredGenres = InvisibleIntelligence.getPreferredGenres();
        const genreScore = Math.min(20, preferredGenres.length * 5);

        // Sense 5: Deep sessions (max 15 points)
        const deepSessions = data.deepSessions?.length || 0;
        const deepScore = Math.min(15, deepSessions * 3);

        // B = BASE SCORE (Pure Addition - the foundation)
        const BASE =
            daysScore + songsScore + langScore + genreScore + deepScore;

        // ════════════════════════════════════════════════════════════════
        // O/I = ORDERS/INDICES - Mood Power Multiplier
        // ════════════════════════════════════════════════════════════════
        const currentMood = data.currentSession?.dominantMood || 'neutral';
        const moodPowers = {
            romance: 1.15, // 💕 Love songs boost sync
            party: 1.12, // 🎉 Party energy boost
            chill: 1.08, // 🌿 Relaxed = good connection
            devotional: 1.1, // 🙏 Spiritual connection
            lofi: 1.05, // 🎧 Focus mode
            sad: 0.92, // 😢 Reduce for sad loops (Jadu Ki Jhappi needed!)
            neutral: 1.0,
        };
        const moodPower = moodPowers[currentMood] || 1.0;
        const ORDERED = BASE * moodPower;

        // ════════════════════════════════════════════════════════════════
        // D = DIVISION - Quality over Quantity (Normalize by sessions)
        // ════════════════════════════════════════════════════════════════
        const totalSessions = Math.max(
            1,
            deepSessions + Math.floor(songsPlayed / 10)
        );
        const qualityFactor = Math.min(1.5, 1 + deepSessions / totalSessions);
        const DIVIDED = ORDERED * qualityFactor;

        // ════════════════════════════════════════════════════════════════
        // M = MULTIPLICATION - Engagement Boost
        // ════════════════════════════════════════════════════════════════
        const fullPlays = intelligenceData.fullPlays || 0;
        const shares = data.shareCount || 0;
        const engagementBoost =
            1 + Math.min(10, fullPlays) / 100 + shares * 0.02;
        const MULTIPLIED = DIVIDED * engagementBoost;

        // ════════════════════════════════════════════════════════════════
        // A = ADDITION - Milestone Bonuses
        // ════════════════════════════════════════════════════════════════
        let BONUS = 0;
        if (songsPlayed >= 100) BONUS += 5; // Century bonus
        if (daysSinceFirst >= 7) BONUS += 3; // Week streak
        if (deepSessions >= 5) BONUS += 3; // Deep listener
        if (preferredLangs.length >= 3) BONUS += 2; // Multilingual
        const ADDED = MULTIPLIED + BONUS;

        // ════════════════════════════════════════════════════════════════
        // S = SUBTRACTION - Penalties (Sad Loop, Skips)
        // ════════════════════════════════════════════════════════════════
        let PENALTY = 0;
        const sadStreak = data.consecutiveSadSongs || 0;
        if (sadStreak > 3) {
            PENALTY += (sadStreak - 3) * 2; // -2 per sad song after 3
            console.log(
                `[HEART] 😢 Sad loop detected! ${sadStreak} songs. Jadu Ki Jhappi needed!`
            );
        }

        // Check autoplay status
        const autoplayEnabled =
            localStorage.getItem('autoplayEnabled') !== 'false';
        if (!autoplayEnabled) {
            PENALTY += 5; // Autoplay off = connection paused
            console.log('[HEART] ⏸️ Autoplay off - HEART connection paused');
        }

        const FINAL = ADDED - PENALTY;

        // ════════════════════════════════════════════════════════════════
        // Final percentage (0-100)
        // ════════════════════════════════════════════════════════════════
        const percentage = Math.round(Math.min(100, Math.max(0, FINAL)));

        // Detailed logging for debugging
        console.log(`[HEART] 🧮 BODMAS Calculation:`);
        console.log(
            `  B (Base): ${BASE.toFixed(1)} = days:${daysScore.toFixed(
                0
            )} + songs:${songsScore.toFixed(
                0
            )} + lang:${langScore} + genre:${genreScore} + deep:${deepScore}`
        );
        console.log(
            `  O (Order): ${ORDERED.toFixed(1)} = ${BASE.toFixed(
                1
            )} × ${moodPower} (${currentMood})`
        );
        console.log(
            `  D (Divide): ${DIVIDED.toFixed(
                1
            )} = quality factor ${qualityFactor.toFixed(2)}`
        );
        console.log(
            `  M (Multiply): ${MULTIPLIED.toFixed(
                1
            )} = engagement ${engagementBoost.toFixed(2)}`
        );
        console.log(`  A (Add): ${ADDED.toFixed(1)} = +${BONUS} bonus`);
        console.log(
            `  S (Subtract): ${FINAL.toFixed(1)} = -${PENALTY} penalty`
        );
        console.log(`[HEART] 💕 Final Sync: ${percentage}%`);

        return percentage;
    },

    // Get sync status message
    getSyncStatus() {
        // Check if guest mode - special message
        try {
            const storedUser = localStorage.getItem('pixelMusicUser');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.loginType === 'guest') {
                    return {
                        level: 'guest',
                        message: 'Login to sync your HEART!',
                    };
                }
            }
        } catch (e) {}

        const percentage = this.getHeartSyncPercentage();

        if (percentage === 0)
            return { level: 'new', message: 'Login to start syncing...' };
        if (percentage < 10)
            return { level: 'new', message: 'Just met you...' };
        if (percentage < 25)
            return { level: 'learning', message: 'Learning your vibe...' };
        if (percentage < 50)
            return { level: 'growing', message: 'Getting to know you...' };
        if (percentage < 75)
            return { level: 'connected', message: 'Feeling your rhythm!' };
        if (percentage < 90)
            return { level: 'synced', message: 'Almost in sync!' };
        return { level: 'soulmate', message: 'We are one!' };
    },
};

// 💭 HEART WHISPER - Subtle organic messages like BABA in the jungle
// "Aao beta..." - System whispers to users based on their listening patterns
// #FeatureDevelopedOnFeelings - Inspired by Nana's jungle story
const HEARTWhisper = {
    storageKey: 'pixelPlayWhisper',

    // 🏷️ Language-based address terms - User ki language = User ki boli!
    // Data se khud seekh ke terms use karega
    languageTerms: {
        hindi: ['bhai', 'yaar', 'dost', 'pagle', 'mere'],
        english: ['buddy', 'friend', 'mate', 'pal', 'legend'],
        punjabi: ['veere', 'yaar', 'paaji', 'bai', 'champ'],
        marathi: ['bhau', 'dosta', 'mitra', 'baba', 'raja'],
        tamil: ['da', 'nanba', 'machan', 'thala', 'boss'],
        telugu: ['ra', 'bro', 'anna', 'mama', 'star'],
        bengali: ['dada', 'bondhu', 'bhai', 'boss', 'tui'],
        gujarati: ['bhai', 'yaar', 'dost', 'mitra', 'hero'],
        kannada: ['maga', 'guru', 'boss', 'anna', 'thala'],
        malayalam: ['machane', 'kutta', 'mone', 'chetta', 'bro'],
        // Gender neutral fallback
        neutral: ['hey', 'suniye', 'friend', 'dear', 'listener'],
    },

    // 🧠 Get user's preferred language from listening data
    getTopLanguage() {
        try {
            const data = InvisibleIntelligence.getData();
            const languages = data.languages;
            let topLang = 'hindi'; // Default
            let topScore = 0;

            Object.keys(languages).forEach((lang) => {
                const score =
                    (languages[lang].plays || 0) - (languages[lang].skips || 0);
                if (score > topScore) {
                    topScore = score;
                    topLang = lang;
                }
            });

            return topLang;
        } catch (e) {
            return 'hindi'; // Default fallback
        }
    },

    // Get user's preferred address term based on their listening language!
    getAddressTerm() {
        const topLang = this.getTopLanguage();
        const terms = this.languageTerms[topLang] || this.languageTerms.neutral;
        const data = this.getData();
        const index = (data.whisperCount || 0) % terms.length;

        console.log(
            `[HEART] 🗣️ Address term: ${terms[index]} (from ${topLang} listening)`
        );
        return terms[index];
    },

    // 🕐 Get time of day for context
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 16) return 'afternoon';
        if (hour >= 16 && hour < 20) return 'evening';
        if (hour >= 20 || hour < 1) return 'night';
        return 'latenight'; // 1 AM - 5 AM
    },

    // 🎭 Get current dominant mood from session
    getCurrentMood() {
        const data = InvisibleIntelligence.getData();
        const genres = data.genres;
        let topMood = 'chill';
        let topScore = 0;

        const moodMap = {
            romantic: 'romance',
            sad: 'sad',
            party: 'party',
            devotional: 'peaceful',
            bollywood: 'filmy',
        };

        Object.keys(genres).forEach((genre) => {
            if (genres[genre].plays > topScore) {
                topScore = genres[genre].plays;
                topMood = moodMap[genre] || genre;
            }
        });

        return topMood;
    },

    // Whisper messages categorized by trigger
    messages: {
        // Mood detection whispers - FEELING based, no numbers!
        mood: {
            romance: [
                'Pyaar ki hawa chal rahi hai...',
                'Dil romantic mood mein hai aaj...',
                'Love is in the air!',
            ],
            sad: [
                'Dard bhi zaroori hai kabhi kabhi...',
                'Aansu bhi gaane sun sakte hain...',
                'Sukoon milega, bas sun-te raho...',
            ],
            party: [
                'Party mood on hai!',
                'Nachne ka mann hai aaj!',
                'Energy high hai!',
            ],
            chill: [
                'Sukoon wali vibes...',
                'Relax mode activated...',
                'Chill vibes aa rahe hain...',
            ],
            devotional: [
                'Aatma ko sukoon mil raha hai...',
                'Bhakti mein shakti hai...',
                'Inner peace activated...',
            ],
            lofi: [
                'Focus mode...',
                'Study vibes detected...',
                'LoFi vibes on point...',
            ],
        },

        // Milestone whispers - FEELING based, no numbers!
        milestone: {
            firstSong: [
                'Pehla gaana! Safar shuru...',
                'Welcome! Let the music begin...',
            ],
            gettingStarted: [
                'HEART seekh raha hai...',
                'Getting to know you...',
            ],
            connected: ['Ab samajh aane lagi hai...', 'Vibe mil rahi hai ab!'],
            synced: ['HEART synced ho gaya!', 'We know your soul now!'],
            deepSession: ['Deep listening mode on!', 'Kho gaye music mein...'],
            longSession: ['True music lover!', 'Music soul detected!'],
        },

        // Time-based greetings - SUBAH HO GAYI style!
        timeBased: {
            morning: [
                'Subah ho gayi! Fresh vibes ready!',
                'Morning energy aa gayi!',
                'Nayi subah, naye gaane!',
            ],
            afternoon: [
                'Dopahar ki dhoop mein chill!',
                'Lunch break vibes!',
                'Afternoon groove on!',
            ],
            evening: [
                'Shaam dhalne lagi... music time!',
                'Evening vibes setting in...',
                'Sunset feels...',
            ],
            night: [
                'Raat ho gayi... sukoon time!',
                'Night vibes are the best!',
                'Shaam ke baad ka magic...',
            ],
            latenight: [
                'Late night warrior!',
                'Neend nahi aayi? Hum hain na...',
                'Raat ke raaz... music ke saath!',
            ],
        },

        // Journey whispers (mood transitions)
        journey: {
            sadToHappy: [
                'Dard se sukoon tak... beautiful journey!',
                'Tears to smiles... music heals!',
            ],
            moodShift: ['Mood change ho gaya!', 'Energy shift felt!'],
            romantic: [
                'Aaj ka din romantic raha... waah!',
                'Pyaar bhari shaam!',
            ],
            peaceful: ['Aaj sukoon mila...', 'Inner peace day!'],
            energetic: ['Energy wala din tha aaj!', 'Full on vibes today!'],
        },

        // Special whispers
        special: {
            returnUser: ['Wapas aa gaye! Yaad kiya kya?', 'Welcome back!'],
            consistentUser: [
                'Rozana aate ho... HEART happy hai!',
                'Daily vibes! True dedication!',
            ],
            weekend: [
                'Weekend hai! Time to vibe!',
                'Chutti ka din... full music mode!',
            ],
        },

        // 🤗 GALE LAGAO - Warm welcome messages (first hug, then whisper)
        galeLagao: {
            firstTime: [
                'Welcome to Pixel Play! Aao, gaane suno...',
                'First time? Let the music begin!',
            ],
            returning: ['Arey waah! Wapas aa gaye!', 'Welcome back!'],
            morning: [
                'Good morning! Chai ke saath gaane?',
                'Subah ho gayi! Fresh vibes ready!',
            ],
            afternoon: ['Dopahar ki vibes ready!', 'Lunch break? Perfect!'],
            evening: [
                'Shaam aa gayi! Music time!',
                'Evening mood set karte hain!',
            ],
            night: ['Night vibes activate!', 'Perfect music time...'],
            latenight: [
                'Late night warrior spotted!',
                'Neend nahi aayi? Music sun!',
            ],
            longGap: [
                'Bahut waqt ho gaya! Miss kiya?',
                'Finally wapas! Kahan the itne din?',
            ],
        },

        // 🤗 JADU KI JHAPPI - When user is in sad loop (3+ sad songs)
        jaduKiJhappi: {
            gentle: [
                'Hey... sab theek hai?',
                'Kuch baat hai? Hum hain yahan...',
            ],
            caring: [
                'Bahut sad gaane ho gaye... thoda chill karein?',
                'Dil bhari hai? Chalo mood change karein...',
            ],
            uplifting: [
                'Ek jhappi le lo... Ab kuch peppy sunein?',
                'Rona zaroori hai, par muskurana bhi!',
            ],
            suggestion: [
                'Kuch feel-good sunoge? HEART suggest kar raha hai...',
                'Thoda vibe change? Trust me!',
            ],
        },

        // 🌅 Day Summary whispers - Mood based, not number based!
        daySummary: {
            romantic: [
                'Aaj ka din romantic raha... waah!',
                'Pyaar wali playlist chal rahi thi!',
            ],
            chill: ['Aaj sukoon wala din tha!', 'Chill vibes all day!'],
            party: ['Energy wala din tha aaj!', 'Party mood mein the aaj!'],
            sad: [
                'Dard bhi gaane ki tarah hai... beautiful!',
                'Emotions explored today...',
            ],
            mixed: ['Bahut variety suni aaj!', 'Har mood cover kiya aaj!'],
            peaceful: ['Sukoon mila aaj...', 'Inner peace day!'],
        },

        // 👤 GUEST WHISPERS - Mehman hai abhi, dil ka member bane!
        // Special messages for guest users to encourage login
        guest: {
            welcome: [
                'Mehman ho abhi... dil ka member bano!',
                'Guest mode mein ho... Login karo, HEART sync karo!',
                'Aao dost, login karo... yaad rakhenge tumhe!',
            ],
            nudge: [
                'Login karoge toh HEART tumhe samjhega...',
                'Guest se dost bano... Login karo!',
                'Apna ghar basa lo yahan... Login karo!',
            ],
            benefit: [
                'Login = HEART sync = Better music!',
                'Guest mein yaadein nahi banti... Login karo!',
                'Dil jodne ke liye... Login zaroori hai!',
            ],
            friendly: [
                'Mehman bhagwan hota hai... par dost family!',
                'Bahar se andar aao... Login karo!',
                'Apne ban jao... Google se login karo!',
            ],
        },
    },

    // Get stored whisper data
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (e) {
            return this.getDefaultData();
        }
    },

    // Default whisper data
    getDefaultData() {
        return {
            lastWhisperTime: 0,
            lastWhisperType: null,
            whisperCount: 0,
            seenWhispers: [],
            sessionWhispers: 0, // Max 3 per session to avoid annoyance
            lastSessionStart: Date.now(),
        };
    },

    // Save whisper data
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('[HEART Whisper] Save error:', e);
        }
    },

    // Check if we should show a whisper (rate limiting)
    canWhisper() {
        const data = this.getData();
        const now = Date.now();

        // Reset session count if new session (30 min gap)
        if (now - data.lastSessionStart > 30 * 60 * 1000) {
            data.sessionWhispers = 0;
            data.lastSessionStart = now;
            this.saveData(data);
        }

        // Max 3 whispers per session
        if (data.sessionWhispers >= 3) return false;

        // Minimum 5 minutes between whispers
        if (now - data.lastWhisperTime < 5 * 60 * 1000) return false;

        return true;
    },

    // Get random message from category
    getRandomMessage(category, subcategory) {
        const messages = this.messages[category]?.[subcategory];
        if (!messages || messages.length === 0) return null;
        return messages[Math.floor(Math.random() * messages.length)];
    },

    // Show a whisper in the song title area (like BABA's gentle message)
    // "Aao beta..." - subtle, in the song title area, not a popup
    showWhisper(message) {
        if (!message || !this.canWhisper()) return;

        const data = this.getData();
        const titleElement = document.getElementById('currentSongTitle');

        if (!titleElement) return;

        // Store the original title
        const originalTitle = titleElement.textContent;
        const originalStyle = titleElement.style.cssText;

        // Show whisper in title area (no emoji, clean text)
        const cleanMessage = message
            .replace(
                /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu,
                ''
            )
            .trim();

        titleElement.textContent = cleanMessage;
        titleElement.style.cssText = `
            ${originalStyle}
            font-style: italic;
            opacity: 0.9;
            transition: all 0.5s ease;
        `;

        // Update data
        data.lastWhisperTime = Date.now();
        data.whisperCount++;
        data.sessionWhispers++;
        data.seenWhispers.push(message);
        if (data.seenWhispers.length > 50)
            data.seenWhispers = data.seenWhispers.slice(-50);
        this.saveData(data);

        console.log(`[HEART Whisper] 💭 "${cleanMessage}"`);

        // Restore original title after 3 seconds
        setTimeout(() => {
            titleElement.textContent = originalTitle;
            titleElement.style.cssText = originalStyle;
        }, 3000);
    },

    // Trigger whisper based on mood
    whisperMood(mood) {
        const message = this.getRandomMessage('mood', mood);
        if (message) this.showWhisper(message);
    },

    // Trigger whisper based on milestone
    whisperMilestone(milestone) {
        const message = this.getRandomMessage('milestone', milestone);
        if (message) this.showWhisper(message);
    },

    // Trigger whisper based on time
    whisperTimeBased(period) {
        const message = this.getRandomMessage('timeBased', period);
        const term = this.getAddressTerm();
        if (message) this.showWhisper(`${term}! ${message}`);
    },

    // Trigger whisper for mood journey (sad → happy)
    whisperJourney(journeyType) {
        const message = this.getRandomMessage('journey', journeyType);
        if (message) this.showWhisper(message);
    },

    // Check and trigger automatic whispers - FEELING based, not number based!
    checkAutoWhisper() {
        if (!this.canWhisper()) return;

        const heartData = HEART.getData();
        const timeOfDay = this.getTimeOfDay();
        const songsPlayed = heartData.moodHistory?.length || 0;
        const term = this.getAddressTerm();

        // Milestone checks - FEELING based messages
        if (songsPlayed === 1) {
            this.whisperMilestone('firstSong');
        } else if (songsPlayed >= 5 && songsPlayed < 10) {
            // Getting started - low probability to avoid spam
            if (Math.random() < 0.3) {
                this.whisperMilestone('gettingStarted');
            }
        } else if (songsPlayed >= 20 && songsPlayed < 30) {
            if (Math.random() < 0.2) {
                this.whisperMilestone('connected');
            }
        } else if (songsPlayed >= 50) {
            if (Math.random() < 0.1) {
                this.whisperMilestone('synced');
            }
        }

        // Deep listening check
        if (HEART.isInDeepListening()) {
            const stats = HEART.getDeepListeningStats();
            if (stats && parseFloat(stats.minutes) >= 5) {
                this.whisperMilestone('deepSession');
            }
        }

        // Time-based whispers with personal address (low probability)
        if (Math.random() < 0.1) {
            // 10% chance
            this.whisperTimeBased(timeOfDay);
        }
    },

    // 🤗 GALE LAGAO - Welcome hug before whisper
    // "Pahale gale lagate hain... fir whisper karte hain... pyaar se..."
    galeLagao(type = 'returning') {
        const message = this.getRandomMessage('galeLagao', type);
        if (message) {
            console.log(`[HEART] 🤗 Gale Lagao: ${type}`);
            this.showWhisper(message);
        }
    },

    // Check if should show welcome (Gale Lagao)
    checkGaleLagao() {
        const heartData = HEART.getData();
        const whisperData = this.getData();
        const now = Date.now();
        const hoursSinceLastVisit =
            (now - (heartData.lastVisit || 0)) / (1000 * 60 * 60);
        const songsPlayed = heartData.moodHistory?.length || 0;
        const hour = new Date().getHours();

        // First time user
        if (songsPlayed === 0) {
            this.galeLagao('firstTime');
            return;
        }

        // Long gap (24+ hours)
        if (hoursSinceLastVisit > 24) {
            this.galeLagao('longGap');
            return;
        }

        // Time-based welcome using getTimeOfDay()
        const timeOfDay = this.getTimeOfDay();
        if (timeOfDay === 'morning') {
            this.galeLagao('morning');
        } else if (timeOfDay === 'afternoon') {
            this.galeLagao('afternoon');
        } else if (timeOfDay === 'evening') {
            this.galeLagao('evening');
        } else if (timeOfDay === 'night') {
            this.galeLagao('night');
        } else if (timeOfDay === 'latenight') {
            this.galeLagao('latenight');
        } else if (hoursSinceLastVisit > 6) {
            this.galeLagao('returning');
        }
    },

    // 🌅 Show day summary based on mood, not numbers!
    showDaySummary() {
        const mood = this.getCurrentMood();
        const term = this.getAddressTerm();
        const message = this.getRandomMessage('daySummary', mood);

        if (message) {
            // Add personal touch with address term
            const personalMessage = `Hey ${term}! ${message}`;
            console.log(`[HEART] 🌅 Day Summary: ${personalMessage}`);
            this.showWhisper(personalMessage);
        }
    },

    // 🤗 JADU KI JHAPPI - Hug when user is sad
    // "Apne ko user ko jada rone nahi dena... jaldi jaake jadu ki jhappi dalni hai!"
    jaduKiJhappi() {
        const heartData = HEART.getData();
        const sadStreak = heartData.consecutiveSadSongs || 0;
        const term = this.getAddressTerm();

        if (sadStreak < 3) return; // Not enough sad songs yet

        let type = 'gentle';
        if (sadStreak >= 5) {
            type = 'suggestion';
        } else if (sadStreak >= 4) {
            type = 'uplifting';
        } else if (sadStreak >= 3) {
            type = 'caring';
        }

        let message = this.getRandomMessage('jaduKiJhappi', type);
        if (message) {
            // Add personal address term for warmth
            message = `Hey ${term}... ${message}`;
            console.log(
                `[HEART] 🤗 Jadu Ki Jhappi triggered! Sad streak: ${sadStreak}`
            );
            this.showWhisper(message);

            // Optionally trigger mood uplift suggestion
            if (sadStreak >= 4 && HEART.shouldUpliftMood) {
                console.log('[HEART] 💫 Suggesting mood uplift...');
            }
        }
    },

    // Check for sad song loop and trigger Jadu Ki Jhappi
    checkSadLoop() {
        const heartData = HEART.getData();
        const sadStreak = heartData.consecutiveSadSongs || 0;

        if (sadStreak >= 3 && this.canWhisper()) {
            this.jaduKiJhappi();
        }
    },

    // 👤 GUEST WHISPER - Mehman ko dost banana hai!
    // Special whispers for guest users encouraging them to login
    isGuestUser() {
        try {
            const storedUser = localStorage.getItem('pixelMusicUser');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                return userData.loginType === 'guest';
            }
        } catch (e) {}
        return false;
    },

    // Whisper to guest users
    whisperToGuest() {
        if (!this.isGuestUser()) return;
        if (!this.canWhisper()) return;

        // Get whisper data to track how many times we've nudged
        const data = this.getData();
        const guestNudges = data.guestNudges || 0;

        // Different message types based on how many nudges
        let type = 'welcome';
        if (guestNudges >= 6) {
            type = 'friendly'; // Be friendly, not pushy
        } else if (guestNudges >= 3) {
            type = 'benefit'; // Show benefits
        } else if (guestNudges >= 1) {
            type = 'nudge'; // Gentle nudge
        }

        const message = this.getRandomMessage('guest', type);
        if (message) {
            console.log(`[HEART Whisper] 👤 Guest whisper: ${message}`);
            this.showWhisper(message);

            // Track guest nudges
            data.guestNudges = guestNudges + 1;
            this.saveData(data);
        }
    },

    // Check if should whisper to guest (call this from song play)
    checkGuestWhisper() {
        if (!this.isGuestUser()) return;

        // Only whisper every 3rd-5th song for guests
        const heartData = HEART.getData();
        const songsPlayed = heartData.moodHistory?.length || 0;

        // First song - welcome
        if (songsPlayed === 1) {
            this.whisperToGuest();
            return;
        }

        // Every 4-5 songs, remind them (but respect canWhisper limits)
        if (songsPlayed > 0 && songsPlayed % 4 === 0) {
            if (Math.random() < 0.5) {
                // 50% chance
                this.whisperToGuest();
            }
        }
    },
};

// Add CSS animations for whisper
(function addWhisperStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes whisperIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes whisperOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
        @keyframes whisperPulse {
            0%, 100% { box-shadow: 0 4px 25px rgba(255, 107, 129, 0.2), 0 0 40px rgba(255, 107, 129, 0.1); }
            50% { box-shadow: 0 4px 30px rgba(255, 107, 129, 0.35), 0 0 50px rgba(255, 107, 129, 0.2); }
        }
        .heart-whisper .whisper-icon {
            font-size: 1.2rem;
            animation: whisperIconFloat 2s ease-in-out infinite;
        }
        @keyframes whisperIconFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
    `;
    document.head.appendChild(style);
})();

// 🧠 VIBE KEYWORD INTELLIGENCE - Hindi/Bollywood action words to vibe mapping
const VIBE_KEYWORDS = {
    // Dance/Party Vibes
    dance: {
        keywords: [
            'nachu',
            'nach',
            'nachle',
            'nachenge',
            'nacho',
            'nache',
            'nachdi',
            'nachna',
            'dance',
            'thump',
            'dhol',
            'dholida',
            'beat',
            'groove',
            'party',
            'dj',
            'remix',
            'bajao',
            'baja',
            'bajate',
            'ghungroo',
            'payal',
            'jhumka',
            'jhume',
            'jhoom',
            'deewangi',
            'deewane',
            'pagli',
            'pagla',
            'naagin',
            'item',
            'chikni',
            'chameli',
        ],
        searchTerms: [
            'bollywood dance songs',
            'hindi party songs',
            'wedding dance songs',
        ],
        vibeType: 'party',
    },

    // Romantic Vibes
    romance: {
        keywords: [
            'odhani',
            'chunari',
            'dupatta',
            'kajal',
            'mehendi',
            'sindoor',
            'mangalsutra',
            'sajna',
            'sajan',
            'jaanu',
            'jaan',
            'janeman',
            'dilbar',
            'dilruba',
            'mehboob',
            'pyaar',
            'pyar',
            'mohabbat',
            'ishq',
            'prem',
            'milan',
            'dhadkan',
            'dhadke',
            'chahun',
            'chaaha',
            'chahu',
            'tera',
            'mera',
            'tere',
            'mere',
            'hum',
            'tum',
            'baahon',
            'bahon',
            'aankhon',
            'nazar',
            'nigah',
            'nazare',
            'husn',
            'ada',
            'chunnari',
            'chunariya',
            'saree',
            'sari',
            'rangoli',
            'kajra',
            'surma',
        ],
        searchTerms: [
            'romantic hindi songs',
            'bollywood love songs',
            'romantic duet songs',
        ],
        vibeType: 'love',
    },

    // Sad/Emotional Vibes (removed 'dil' - too generic, causes false matches)
    sad: {
        keywords: [
            'roya',
            'roye',
            'royega',
            'royenge',
            'aansu',
            'aansoo',
            'ashq',
            'tears',
            'dard',
            'gham',
            'udaas',
            'tanha',
            'akela',
            'alvida',
            'judai',
            'bichhad',
            'bhula',
            'yaad',
            'yadein',
            'bewafa',
            'dhoka',
            'tadap',
            'zakhm',
            'chot',
            'toota',
            'tuta',
            'bikhra',
            'toot',
            'broken',
            'rulaaye',
            'rulaya',
            'dukh',
            'ghamgin',
            'udasi',
            'tanhaai',
        ],
        searchTerms: [
            'sad hindi songs',
            'bollywood emotional songs',
            'heart touching songs',
        ],
        vibeType: 'sad',
    },

    // Devotional/Spiritual Vibes (removed 'om' - too common in song names like "Om Shanti Om")
    devotional: {
        keywords: [
            'bhajan',
            'aarti',
            'mantra',
            'shiva',
            'krishna',
            'radha',
            'ram',
            'ganpati',
            'deva',
            'bhagwan',
            'prabhu',
            'jai',
            'darshan',
            'sai',
            'guru',
        ],
        searchTerms: [
            'hindi bhajan songs',
            'devotional songs bollywood',
            'spiritual hindi songs',
        ],
        vibeType: 'devotional',
    },

    // Chill/Sufi Vibes
    sufi: {
        keywords: [
            'sufi',
            'qawwali',
            'naat',
            'khwaja',
            'maula',
            'kun',
            'faya',
            'rooh',
            'sukoon',
            'chain',
            'meetha',
            'nazm',
            'ghazal',
            'shayari',
            'rubaai',
        ],
        searchTerms: [
            'sufi songs hindi',
            'qawwali songs',
            'peaceful hindi songs',
        ],
        vibeType: 'chill',
    },

    // Fun/Masti Vibes
    masti: {
        keywords: [
            'masti',
            'mazaa',
            'maza',
            'dhoom',
            'dhamaal',
            'hungama',
            'tamasha',
            'halla',
            'gola',
            'paagal',
            'deewana',
            'crazy',
            'pataka',
            'aag',
            'fire',
            'zor',
            'shor',
            'dhamal',
            'jalwa',
            'swag',
            'attitude',
        ],
        searchTerms: [
            'masti songs hindi',
            'fun bollywood songs',
            'peppy hindi songs',
        ],
        vibeType: 'party',
    },

    // Travel/Freedom Vibes
    travel: {
        keywords: [
            'safar',
            'raaste',
            'musafir',
            'pardesi',
            'badal',
            'hawaa',
            'hawa',
            'pankh',
            'udna',
            'udd',
            'azaad',
            'azadi',
            'khula',
            'aasmaan',
            'road',
            'gaadi',
            'train',
            'bike',
            'patang',
            'parinda',
        ],
        searchTerms: [
            'travel songs hindi',
            'road trip bollywood songs',
            'freedom hindi songs',
        ],
        vibeType: 'chill',
    },

    // Rain/Monsoon Vibes
    rain: {
        keywords: [
            'baarish',
            'barish',
            'barsat',
            'sawan',
            'rimjhim',
            'bheegi',
            'bheega',
            'tip',
            'boondon',
            'badal',
            'bijli',
            'toofan',
            'megha',
            'megh',
        ],
        searchTerms: [
            'rain songs hindi',
            'baarish bollywood songs',
            'monsoon romantic songs',
        ],
        vibeType: 'love',
    },
};

// Common artist/actor names to IGNORE (they trigger false vibes)
const ARTIST_NAMES_TO_IGNORE = [
    // Singers
    'anuradha',
    'sriram',
    'lata',
    'kishore',
    'kumar',
    'rafi',
    'mohammed',
    'arijit',
    'singh',
    'neha',
    'kakkar',
    'shreya',
    'ghoshal',
    'sonu',
    'nigam',
    'udit',
    'narayan',
    'alka',
    'yagnik',
    'sunidhi',
    'chauhan',
    'atif',
    'aslam',
    'armaan',
    'malik',
    'jubin',
    'nautiyal',
    'badshah',
    'honey',
    'yo yo',
    'pritam',
    'vishal',
    'shekhar',
    'shankar',
    'ehsaan',
    'loy',
    'salim',
    'sulaiman',
    'rahman',
    'himesh',
    'reshammiya',
    'amit',
    'trivedi',
    'sachin',
    'jigar',
    'mithoon',
    'ankit',
    'tiwari',
    'mohit',
    'chauhan',
    'kk',
    'shaan',
    'abhijeet',
    'akriti',
    'palak',
    'muchhal',
    'monali',
    'thakur',
    'benny',
    'dayal',
    'papon',

    // Actors/Actresses (their names appear in titles and cause false matches)
    'varun',
    'dhawan',
    'alia',
    'bhatt',
    'ranveer',
    'deepika',
    'padukone',
    'shah',
    'rukh',
    'khan',
    'salman',
    'aamir',
    'hrithik',
    'roshan',
    'ranbir',
    'kapoor',
    'katrina',
    'kaif',
    'priyanka',
    'chopra',
    'kareena',
    'saif',
    'akshay',
    'ajay',
    'devgn',
    'shahid',
    'shraddha',
    'tiger',
    'shroff',
    'sidharth',
    'malhotra',
    'anushka',
    'sharma',
    'vicky',
    'kaushal',
    'kiara',
    'advani',
    'kriti',
    'sanon',
    'disha',
    'patani',
    'jacqueline',
    'fernandez',
    'sonakshi',
    'sinha',
    'parineeti',
    'taapsee',
    'pannu',
    'sara',
    'janhvi',
    'govinda',
    'anil',
    'madhuri',
    'dixit',
    'kajol',
    'juhi',
    'chawla',
    'sukhwinder',
    'sunidhi',
];

/**
 * 🧠 Detect vibe keywords from song title and return matching search terms
 * SMART: Ignores artist names, only checks actual song title words
 */
function detectVibeKeywords(title) {
    // Extract just the song name (before | or - artist separator)
    let songTitle = title.toLowerCase();

    // Remove artist part (usually after | or last -)
    if (songTitle.includes('|')) {
        songTitle = songTitle.split('|')[0]; // Take only first part (song name)
    }

    // Also remove year patterns like (1999), (2015)
    songTitle = songTitle.replace(/\(\d{4}\)/g, '');

    // Remove common suffixes
    songTitle = songTitle
        .replace(/full video/gi, '')
        .replace(/official/gi, '')
        .replace(/lyrical/gi, '')
        .replace(/audio/gi, '')
        .replace(/hd|4k/gi, '');

    const words = songTitle.split(/[\s\-\|:,()]+/).filter((w) => w.length > 2);

    // Filter out artist names
    const songWords = words.filter((w) => !ARTIST_NAMES_TO_IGNORE.includes(w));

    console.log(
        '[Vibe Keywords] Song words (artist filtered):',
        songWords.join(', ')
    );

    let detectedVibes = [];

    for (const [category, data] of Object.entries(VIBE_KEYWORDS)) {
        for (const keyword of data.keywords) {
            // Check if any word in title matches the keyword
            // STRICT MATCHING to avoid false positives:
            // - Short words (< 4 chars) or short keywords (< 5 chars) = EXACT match only
            // - This prevents "ada" matching "udaas", "ram" matching "romantic" etc.
            for (const word of songWords) {
                let isMatch = false;

                if (keyword.length < 5 || word.length < 4) {
                    // Short keywords OR short words need exact match
                    isMatch = word === keyword;
                } else {
                    // Both are long enough - can use partial matching
                    // But only if one STARTS WITH the other (not just contains)
                    isMatch =
                        word.startsWith(keyword) || keyword.startsWith(word);
                }

                if (isMatch) {
                    detectedVibes.push({
                        category: category,
                        matchedWord: word,
                        keyword: keyword,
                        searchTerms: data.searchTerms,
                        vibeType: data.vibeType,
                    });
                    break; // Move to next keyword
                }
            }
        }
    }

    console.log(
        '[Vibe Keywords] Detected:',
        detectedVibes.map((v) => `${v.matchedWord}→${v.category}`).join(', ')
    );
    return detectedVibes;
}

// � HEART SYNC UI - Update the SVG heart with smooth fill animation
function updateHeartSyncUI() {
    const heartClipRect = document.getElementById('heartClipRect');
    const heartPercent = document.getElementById('heartSyncPercent');
    const heartSvg = document.getElementById('heartSyncSvg');

    if (!heartClipRect || !heartPercent) return;

    const percentage = HEART.getHeartSyncPercentage();

    // Update percentage text
    heartPercent.textContent = `${percentage}%`;

    // Calculate fill: SVG viewBox is 24x22, so height 22 = 100%
    // Fill from bottom: y starts at 22 (bottom), decreases as percentage increases
    const totalHeight = 22;
    const fillHeight = (percentage / 100) * totalHeight;
    const fillY = totalHeight - fillHeight;

    // Smooth animation using CSS transition (defined in CSS)
    // Just update the clip rect position
    heartClipRect.setAttribute('y', fillY);
    heartClipRect.setAttribute('height', fillHeight);

    // Add syncing animation if actively learning (between 0-100%)
    if (heartSvg) {
        if (percentage > 0 && percentage < 100) {
            heartSvg.classList.add('syncing');
        } else {
            heartSvg.classList.remove('syncing');
        }

        // 🌟 GINI GOLDEN GLOW: If user shows extra love (100% sync), give jadhu ki jhappi ONCE!
        if (percentage >= 100 && !sessionStorage.getItem('giniGlowShown')) {
            triggerGiniGoldenGlow();
            sessionStorage.setItem('giniGlowShown', 'true');
        }
    }

    console.log(
        `[HEART UI] 💕 Updated to ${percentage}% (fill: y=${fillY.toFixed(
            1
        )}, h=${fillHeight.toFixed(1)})`
    );
}

// 🌟 GINI GOLDEN GLOW - Jadhu ki jhappi when user shows extra love!
function triggerGiniGoldenGlow() {
    const heartSvg = document.getElementById('heartSyncSvg');
    if (!heartSvg) return;

    console.log(
        '[HEART] 🌟 GINI GOLDEN GLOW! Jadhu ki jhappi! User ne bahut pyaar diya!'
    );

    // Add glow class (plays animation once)
    heartSvg.classList.remove('syncing'); // Remove normal pulse
    heartSvg.classList.add('gini-glow');

    // Show toast
    showStatus('💛 HEART 100% Synced! Pyaar ka jhappi!', 3000);

    // Remove class after animation completes (1.5s)
    setTimeout(() => {
        heartSvg.classList.remove('gini-glow');
    }, 1500);
}

// 💕 HEART TAP MAGIC - Interactive messages when user taps heart
const HEART_TAP_MESSAGES = {
    // Messages for Guest users (nudge to login)
    guest: [
        {
            title: 'Dil lagana hai?',
            artist: 'Pehle login kar, HEART sync karega!',
        },
        {
            title: 'Gaane yaad rakhne hain?',
            artist: 'Login kar, HEART sab yaad rakhega',
        },
        {
            title: 'Tera taste samajhna hai',
            artist: 'Login kar, tujhe jaanu thoda',
        },
        {
            title: 'Music buddy chahiye?',
            artist: 'Login kar, HEART tera dost banega',
        },
        {
            title: 'Kya sun raha hai pata karu?',
            artist: 'Login kar, secrets safe hain mere paas',
        },
    ],
    // Motivational Baba messages for logged in users
    loggedIn: [
        {
            title: 'Tu gaane nahi sun raha...',
            artist: 'Yaadon mein jee raha hai, beta',
        },
        {
            title: 'Sangeet toh bas bahana hai...',
            artist: 'Dil ki baat sunne ka mausam hai',
        },
        {
            title: 'HEART tere saath hai...',
            artist: 'Bas bajata reh, samajh raha hoon',
        },
        { title: 'Raat ho ya din...', artist: 'Tera saathi HEART hai yahan' },
        {
            title: 'Har gaana ek yaad hai...',
            artist: 'Aur tu yaadein bana raha hai',
        },
        {
            title: 'Sunn... feel kar...',
            artist: 'Baaki sab HEART sambhal lega',
        },
        {
            title: 'Tera taste unique hai...',
            artist: 'Aur main samajh raha hoon slowly',
        },
        {
            title: 'Jo sun raha hai...',
            artist: 'Wahi tu hai... music = mirror',
        },
        { title: 'Dhanyavaad tujhe...', artist: 'Itne gaane sunne ke liye' },
        {
            title: 'Tu special hai...',
            artist: 'Kyunki tu FREE mein sun raha hai!',
        },
    ],
};

// Show HEART Sync Status - Interactive heart tap
function showHeartSyncStatus() {
    // 💕 Check if we should show feedback page (Day 4+, 100% sync, not already submitted)
    if (shouldShowHeartFeedback()) {
        // Redirect to separate HeartFeedback page (lightweight, not in player)
        window.location.href = 'HeartFeedback/index.html';
        return;
    }

    const userData = JSON.parse(localStorage.getItem('pixelMusicUser') || '{}');
    const isGuest = userData.loginType === 'guest';

    const songTitle = document.getElementById('currentSongTitle');
    const songArtist = document.getElementById('currentSongArtist');

    if (!songTitle || !songArtist) {
        // Fallback to toast if elements not found
        const status = HEART.getSyncStatus();
        showToast(status.message);
        return;
    }

    // Store original values
    const originalTitle = songTitle.textContent;
    const originalArtist = songArtist.textContent;

    // Get random message based on user type
    const messages = isGuest
        ? HEART_TAP_MESSAGES.guest
        : HEART_TAP_MESSAGES.loggedIn;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    // Make song-info clickable for guests
    const songInfo = document.querySelector('.song-info');
    if (isGuest) {
        songInfo?.classList.add('login-prompt-active');
        songInfo?.setAttribute('onclick', 'GuestLoginPrompt.loginWithGoogle()');
    }

    // Animate the change
    songTitle.style.transition = 'opacity 0.3s ease';
    songArtist.style.transition = 'opacity 0.3s ease';
    songTitle.style.opacity = '0';
    songArtist.style.opacity = '0';

    setTimeout(() => {
        songTitle.textContent = randomMsg.title;
        songArtist.textContent = randomMsg.artist;
        songTitle.style.opacity = '1';
        songArtist.style.opacity = '1';
    }, 300);

    // Restore after 4 seconds
    setTimeout(() => {
        songTitle.style.opacity = '0';
        songArtist.style.opacity = '0';

        setTimeout(() => {
            songTitle.textContent = originalTitle;
            songArtist.textContent = originalArtist;
            songTitle.style.opacity = '1';
            songArtist.style.opacity = '1';

            // Remove click handler
            if (isGuest) {
                songInfo?.classList.remove('login-prompt-active');
                songInfo?.removeAttribute('onclick');
            }
        }, 300);
    }, 4000);

    console.log('[HEART] 💕 Tap magic:', randomMsg.title);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    registerServiceWorker();
    setSearchPlaceholder();

    // � PWA INSTALL PROMPT HANDLER - Capture the browser's event
    // "beforeinstallprompt sirf tab fire hota hai jab app installable ho!"
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67+ from automatically showing the prompt
        e.preventDefault();
        // Save the event so we can trigger it later from our button
        deferredInstallPrompt = e;

        // Show our custom install button
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) {
            installBtn.style.display = 'flex';
            console.log(
                '[PWA] 📲 Install prompt captured! Button visible now.'
            );
        }
    });

    // Detect if already installed as PWA
    window.addEventListener('appinstalled', () => {
        isPWAInstalled = true;
        deferredInstallPrompt = null;

        // Hide install button
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }

        console.log('[PWA] ✅ App installed successfully! Ghar mil gaya! 🏠');
        showToast('🎉 Pixel Play installed! Find it on your home screen.');
    });

    // Check if running as installed PWA (standalone mode)
    if (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    ) {
        isPWAInstalled = true;
        console.log('[PWA] 🏠 Running as installed app - Home sweet home!');
    }

    // �💕 Initialize HEART Sync UI
    setTimeout(() => {
        updateHeartSyncUI();
    }, 1000);

    // 🤗 GALE LAGAO - Welcome hug on page load
    // "Pahale gale lagate hain... fir whisper karte hain... pyaar se..."
    setTimeout(() => {
        if (typeof HEARTWhisper !== 'undefined') {
            HEARTWhisper.checkGaleLagao();
        }
    }, 3000); // Wait 3 seconds for smooth experience

    // 🎵 Initialize Dynamic Tonearm
    initDynamicTonearm();

    // Handle deep link parameters for auto-play
    handleDeepLink();

    // 📱 Android Background Fix: Try to resume when user returns (damdamdoe feedback Jan 2026)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Disable right-click context menu (protection)
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // Disable keyboard shortcuts for inspect/devtools (optional protection)
    document.addEventListener('keydown', function (e) {
        // Disable F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Disable Ctrl+Shift+I / Cmd+Option+I (Inspect)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        // Disable Ctrl+Shift+C / Cmd+Option+C (Inspect element)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
        // Disable Ctrl+U / Cmd+U (View source)
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            return false;
        }
    });
});

function initializeApp() {
    console.log('Initializing app...');

    audioPlayer = document.getElementById('audioPlayer');

    // Initialize Media Session API for background playback controls
    initializeMediaSession();

    // Initialize HEART Algorithm
    HEART.init();

    // 💭 HEART Whisper: Check if returning user (show welcome back message)
    const heartData = HEART.getData();
    const lastVisitGap = Date.now() - heartData.lastUpdated;
    const hoursAway = lastVisitGap / (1000 * 60 * 60);
    if (hoursAway > 12 && heartData.moodHistory?.length > 5) {
        // User was away for 12+ hours and has played songs before
        setTimeout(() => {
            HEARTWhisper.showWhisper('Wapas aa gaye! Missed you!');
        }, 3000); // Show after 3 seconds
    }

    // Search button event
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        console.log('Search button listener attached');
    } else {
        console.error('searchBtn not found!');
    }

    // Enter key in search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                console.log('Enter key pressed in search');
                performSearch();
            }
        });
        console.log('Search input listener attached');
    } else {
        console.error('searchInput not found!');
    }

    // Mobile search button event
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', performMobileSearch);
    }

    // Enter key in mobile search input (legacy modal)
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performMobileSearch();
            }
        });
    }

    // Enter key in sliding search input (new)
    const mobileSlideSearchInput = document.getElementById(
        'mobileSlideSearchInput'
    );
    if (mobileSlideSearchInput) {
        mobileSlideSearchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSlideSearch();
            }
        });
    }

    // Progress slider
    const progressSlider = document.getElementById('progressSlider');
    progressSlider.addEventListener('input', function () {
        if (currentPlatform === 'youtube' && player && player.getDuration) {
            const seekTime =
                (player.getDuration() * progressSlider.value) / 100;
            player.seekTo(seekTime, true);
        } else if (currentPlatform === 'local' && audioPlayer.duration) {
            const seekTime =
                (audioPlayer.duration * progressSlider.value) / 100;
            audioPlayer.currentTime = seekTime;
        }
    });

    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', function () {
        if (player && player.setVolume) {
            player.setVolume(volumeSlider.value);
        }
        if (audioPlayer) {
            audioPlayer.volume = volumeSlider.value / 100;
        }
    });

    // Audio player events
    audioPlayer.addEventListener('timeupdate', updateLocalProgress);
    audioPlayer.addEventListener('ended', function () {
        // Check if autoplay is enabled for local files too
        const autoplayEnabled =
            localStorage.getItem('autoplayEnabled') !== 'false';
        if (autoplayEnabled) {
            playNext();
        } else {
            stopVinylAnimation();
            updatePlayButton();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Cmd+K or Ctrl+K to focus search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            console.log('Cmd+K detected, focusing search...');
            if (typeof trackKeyboardShortcut === 'function') {
                trackKeyboardShortcut('cmd_k');
            }
            focusSearch();
            return;
        }

        // Skip if typing in input field (except for Cmd+K)
        if (e.target.tagName === 'INPUT') return;

        // 🔥 TYPE ANYWHERE TO SEARCH - Ashish's UX Innovation!
        // If user presses any letter A-Z or number 0-9, focus search and type
        if (
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey &&
            e.key.length === 1 &&
            /[a-zA-Z0-9]/.test(e.key)
        ) {
            // Don't trigger if any modifier key is pressed
            // Don't trigger for special keys (length > 1 like 'Enter', 'Escape', etc.)

            console.log('[TypeAnywhere] Key pressed:', e.key);

            const searchInput = document.getElementById('searchInput');
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // Mobile: Open sliding search and focus
                openMobileSearch();
                setTimeout(() => {
                    const mobileInput = document.getElementById(
                        'mobileSlideSearchInput'
                    );
                    if (mobileInput) {
                        mobileInput.value = e.key;
                        mobileInput.focus();
                        // Move cursor to end
                        mobileInput.setSelectionRange(1, 1);
                    }
                }, 100);
            } else {
                // Desktop: Focus search and type the key
                searchInput.value = e.key;
                searchInput.focus();
                // Move cursor to end
                searchInput.setSelectionRange(1, 1);
            }

            // Track this feature usage
            if (typeof trackKeyboardShortcut === 'function') {
                trackKeyboardShortcut('type_anywhere');
            }

            e.preventDefault();
            return;
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                playPrevious();
                break;
            case 'ArrowRight':
                e.preventDefault();
                playNext();
                break;
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'Escape':
                // Clear search on ESC or close mobile search
                if (
                    document.activeElement.id === 'searchInput' ||
                    document.activeElement.id === 'mobileSearchInput' ||
                    document.activeElement.id === 'mobileSlideSearchInput'
                ) {
                    e.preventDefault();
                    if (mobileSearchOpen) {
                        closeMobileSearch();
                    } else {
                        clearSearch();
                    }
                }
                break;
        }
    });
}

// Focus search box function
function focusSearch() {
    const searchInput = document.getElementById('searchInput');
    const mobileSearchModal = document.getElementById('mobileSearchModal');

    // Check if mobile view
    if (window.innerWidth <= 768) {
        // Open new sliding search
        openMobileSearch();
    } else {
        // Focus desktop search
        searchInput.focus();
        searchInput.select();
    }
}

// Clear search function
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const mobileSlideSearchInput = document.getElementById(
        'mobileSlideSearchInput'
    );

    if (searchInput) {
        searchInput.value = '';
        searchInput.blur();
    }
    if (mobileSearchInput) {
        mobileSearchInput.value = '';
    }
    if (mobileSlideSearchInput) {
        mobileSlideSearchInput.value = '';
    }

    // Show Quick Picks after clearing search
    if (currentPlatform === 'youtube') {
        displayQuickPicks();
    }
}

// Set search placeholder with correct keyboard shortcut
function setSearchPlaceholder() {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const shortcut = isMac ? '⌘K' : 'Ctrl+K';

    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const shortcutBadge = document.getElementById('searchShortcutBadge');

    if (searchInput) {
        searchInput.placeholder = 'Search for records...';
    }
    if (mobileSearchInput) {
        mobileSearchInput.placeholder = 'Search for records...';
    }
    if (shortcutBadge) {
        shortcutBadge.textContent = shortcut;
    }
}

// YouTube IFrame API Ready
function onYouTubeIframeAPIReady() {
    // 🍎 iOS Detection
    const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    player = new YT.Player('youtubePlayer', {
        height: '0',
        width: '0',
        playerVars: {
            playsinline: 1,
            controls: 0,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            quality: 'small',
            // 🔥 iOS AUTOPLAY FIX v1.7.1:
            autoplay: 1,
            mute: 1, // Start MUTED on all platforms (unmute after PLAYING state)
            // origin: Required for proper postMessage communication
            origin: window.location.origin,
            enablejsapi: 1,
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
        },
    });
}

function onPlayerReady(event) {
    console.log('🎵 Pixel Player ready!');
    const volumeSlider = document.getElementById('volumeSlider');

    // 🔊 MOBILE VOLUME FIX: Default 90% for mobile (users control via phone buttons)
    const isMobile =
        window.innerWidth <= 768 ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
        volumeSlider.value = 90;
        player.setVolume(90);
        previousVolume = 90;
        console.log('[Volume] 📱 Mobile detected - set to 90%');
    } else {
        player.setVolume(volumeSlider.value);
    }

    setInterval(updateProgress, 1000);

    // Check if there's a pending deep link video to play
    if (pendingDeepLinkVideoId) {
        console.log('Playing pending deep link video:', pendingDeepLinkVideoId);
        playVideoById(pendingDeepLinkVideoId);
        pendingDeepLinkVideoId = null;
    }
}

function onPlayerStateChange(event) {
    // Clear loading timeout when state changes
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }

    if (event.data === YT.PlayerState.ENDED) {
        // 📱 ANDROID LOCK SCREEN FIX: Stop backup timer - ENDED fired normally
        if (typeof stopBackgroundAutoplayTimer === 'function') {
            stopBackgroundAutoplayTimer();
            console.log(
                '[Background] ⏰ Timer stopped - ENDED event fired normally'
            );
        }

        // 🧠 INTELLIGENCE: Song ended naturally = full play = positive learning
        if (currentSongData && player) {
            const duration = player.getDuration ? player.getDuration() : 0;
            const playTime = (Date.now() - songStartTime) / 1000; // seconds
            // 🎯 GINI MODE: Only pass true if user explicitly selected this song (not autoplay)
            const wasUserSearch = !window._lastPlayWasAuto;
            InvisibleIntelligence.learnFromPlay(
                currentSongData,
                playTime,
                duration,
                wasUserSearch // Pass whether user explicitly selected this
            );

            // 💕 Update HEART Sync UI after learning
            updateHeartSyncUI();

            // 🎵 SONG COUNTER: Increment total songs played in Google Sheet
            incrementSongCounter();

            // 📲 PWA INSTALL PROMPT: Check if we should show install prompt
            const currentPlayCount =
                parseInt(localStorage.getItem('playCount') || '0') + 1;
            localStorage.setItem('playCount', currentPlayCount.toString());
            PWAInstallPrompt.checkAfterSongPlay();
        }

        // 🎧 LISTENING TIME: Song ended, add to total
        if (listeningSession.startTime > 0) {
            const listenedNow =
                (Date.now() - listeningSession.startTime) / 1000;
            listeningSession.totalListenedTime += listenedNow;
            listeningSession.startTime = 0;
            console.log(
                '[Listening] ⏹️ Song ended. This: ' +
                    listenedNow.toFixed(1) +
                    's, Total: ' +
                    listeningSession.totalListenedTime.toFixed(1) +
                    's'
            );

            // Send to GA4 every song end
            sendListeningTimeToGA4();
        }

        // Check if autoplay is enabled
        const autoplayEnabled =
            localStorage.getItem('autoplayEnabled') !== 'false';
        if (autoplayEnabled) {
            // �️ CROSSFADE: If crossfade already triggered next song, skip
            if (typeof Crossfade !== 'undefined' && Crossfade.isFading) {
                console.log(
                    '[Autoplay] ⏭️ Skipped - Crossfade already handled transition'
                );
                Crossfade.reset();
                return;
            }

            // 🍎 iOS FIX: NO DELAY! Call playNext IMMEDIATELY when song ends
            // iOS allows autoplay chain ONLY if next song starts within same event loop
            // Any setTimeout delay = "user gesture expired" = autoplay blocked!
            const isIOS =
                /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' &&
                    navigator.maxTouchPoints > 1);

            console.log(
                `[Autoplay] Playing next IMMEDIATELY (iOS: ${isIOS}, session: ${iOSPlaybackSession.active})`
            );

            // 🍎 Track iOS session - user started chain, keep it going
            if (isIOS && iOSPlaybackSession.active) {
                iOSPlaybackSession.songsPlayed++;
                console.log(
                    `[iOS] 📱 Session songs: ${iOSPlaybackSession.songsPlayed}`
                );
            }

            // 🔥 NO SETTIMEOUT! Direct call for iOS autoplay chain to work
            playNext();
        } else {
            stopVinylAnimation();
            updatePlayButton();
            // 📱 Android: Stop background keep-alive
            if (typeof stopBackgroundKeepAlive === 'function')
                stopBackgroundKeepAlive();
        }
    } else if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        isBuffering = false;

        // 📱 Android: Start background keep-alive for pocket play
        if (typeof startBackgroundKeepAlive === 'function')
            startBackgroundKeepAlive();

        // 🍎 iOS: Song started playing - reset failure counter
        if (
            typeof iOSPlaybackSession !== 'undefined' &&
            iOSPlaybackSession.active
        ) {
            iOSPlaybackSession.failedAttempts = 0;
        }

        // 🔊 UNMUTE after play starts (for mobile autoplay workaround)
        try {
            if (player && player.unMute) {
                player.unMute();
                const volumeSlider = document.getElementById('volumeSlider');
                if (volumeSlider) {
                    player.setVolume(volumeSlider.value);
                } else {
                    player.setVolume(70);
                }
            }
        } catch (e) {
            console.log('[Player] Unmute error:', e);
        }

        // 🧠 INTELLIGENCE: Track when song started
        if (songStartTime === 0) {
            songStartTime = Date.now();
        }

        // 🎧 LISTENING TIME: Start tracking
        if (listeningSession.startTime === 0) {
            listeningSession.startTime = Date.now();
            listeningSession.songsPlayed++;
            console.log(
                '[Listening] ▶️ Started tracking song #' +
                    listeningSession.songsPlayed
            );

            // 💕 GUEST LOGIN PROMPT: Track songs for guest users
            if (typeof GuestLoginPrompt !== 'undefined') {
                GuestLoginPrompt.trackSong();
            }
        }

        startVinylAnimation();
        updatePlayButton();

        // Check video duration - skip if too short or too long
        // 🙏 SMART DURATION: Based on HEART sync + content type
        if (player && player.getDuration) {
            const duration = player.getDuration();
            const minDuration = 49; // 49 seconds

            // 🧠 Get HEART sync percentage for smart duration
            const heartSync =
                typeof HEART !== 'undefined' && HEART.calculateSyncPercentage
                    ? HEART.calculateSyncPercentage()
                    : 0;

            // 🙏 Check if bhakti content (allow longer for devotional)
            const title = currentSongData?.title || '';
            const channel = currentSongData?.channel || '';
            const isBhakti = InvisibleIntelligence.isBhaktiContent(
                title,
                channel
            );

            // 📊 Dynamic max duration based on sync + content
            let maxDuration;
            if (isBhakti && heartSync >= 80) {
                // Synced user + Bhakti = Allow 3 hours (Sunderkand, Geeta)
                maxDuration = 180 * 60; // 3 hours
                console.log(
                    '[HEART] 🙏 Bhakti mode (80%+ sync) - allowing up to 3 hours'
                );
            } else if (isBhakti && heartSync >= 50) {
                // Medium sync + Bhakti = Allow 1 hour
                maxDuration = 60 * 60; // 1 hour
                console.log(
                    '[HEART] 🙏 Bhakti mode (50%+ sync) - allowing up to 1 hour'
                );
            } else if (heartSync >= 80) {
                // Highly synced user = Allow longer classics (30 min)
                maxDuration = 30 * 60; // 30 minutes
                console.log(
                    '[HEART] ❤️ Synced user (80%+) - allowing up to 30 min classics'
                );
            } else if (heartSync >= 50) {
                // Medium sync = Allow extended songs (15 min)
                maxDuration = 15 * 60; // 15 minutes
            } else {
                // New users = Standard songs only (8 min)
                maxDuration = 8 * 60; // 8 minutes
            }

            if (duration > 0) {
                // Skip if too short (ads, clips) - ONLY on autoplay
                if (duration < minDuration && window._lastPlayWasAuto) {
                    console.log(
                        'Video too short (' + duration + 's), skipping...'
                    );
                    const autoplayEnabled =
                        localStorage.getItem('autoplayEnabled') !== 'false';
                    if (autoplayEnabled) {
                        setTimeout(() => playNext(), 1000);
                    }
                    return;
                }

                // Skip if too long (based on sync level) - ONLY on autoplay, respect user choice!
                if (duration > maxDuration && window._lastPlayWasAuto) {
                    const minutes = Math.floor(duration / 60);
                    console.log(
                        'Video too long (' +
                            minutes +
                            ' min) for current sync level, skipping...'
                    );
                    const autoplayEnabled =
                        localStorage.getItem('autoplayEnabled') !== 'false';
                    if (autoplayEnabled) {
                        setTimeout(() => playNext(), 1000);
                    }
                    return;
                }

                // If user selected long video, just log it
                if (duration > maxDuration && !window._lastPlayWasAuto) {
                    const minutes = Math.floor(duration / 60);
                    console.log(
                        '[HEART] 🎵 User selected ' +
                            minutes +
                            ' min song - respecting choice!'
                    );
                }

                // 📱 ANDROID LOCK SCREEN FIX: Start backup autoplay timer
                // This ensures next song plays even if ENDED event doesn't fire in background
                if (typeof startBackgroundAutoplayTimer === 'function') {
                    startBackgroundAutoplayTimer(duration);
                    console.log(
                        '[Background] ⏰ Autoplay timer started for ' +
                            Math.floor(duration) +
                            's'
                    );
                }

                // 🎚️ CROSSFADE: Initialize for this song
                if (typeof Crossfade !== 'undefined') {
                    Crossfade.init(duration);
                }
            }
        }
    } else if (event.data === YT.PlayerState.BUFFERING) {
        isBuffering = true;
        console.log('Video buffering...');

        // 🔥 iOS FIX v1.7.1: When buffering starts, ensure playVideo is called
        // Safari sometimes needs explicit playVideo call after buffering begins
        const isIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        if (isIOS && player && player.playVideo) {
            // Small delay to let buffer fill slightly, then trigger play
            setTimeout(() => {
                try {
                    const state = player.getPlayerState();
                    // If still buffering or paused, try playVideo
                    if (
                        state === YT.PlayerState.BUFFERING ||
                        state === YT.PlayerState.PAUSED
                    ) {
                        console.log(
                            '[iOS Buffering] 🍎 Triggering playVideo after buffer start'
                        );
                        player.playVideo();
                    }
                } catch (e) {
                    console.log('[iOS Buffering] Error:', e);
                }
            }, 200);
        }
    } else if (event.data === YT.PlayerState.PAUSED) {
        // 🍎 iOS Background Fix: Detect if this is an unexpected pause during autoplay
        const isIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        const timeSinceLoad = Date.now() - (songStartTime || 0);
        const autoplayEnabled =
            localStorage.getItem('autoplayEnabled') !== 'false';

        // If iOS, autoplay enabled, and song just started (within 10 seconds), try to resume
        if (
            isIOS &&
            autoplayEnabled &&
            timeSinceLoad < 10000 &&
            timeSinceLoad > 0
        ) {
            console.log(
                '[iOS Background] 🍎 Unexpected pause at ' +
                    (timeSinceLoad / 1000).toFixed(1) +
                    's - attempting resume...'
            );

            // Try to resume playback
            setTimeout(() => {
                if (player && player.getPlayerState && player.playVideo) {
                    const state = player.getPlayerState();
                    if (state === YT.PlayerState.PAUSED) {
                        console.log('[iOS Background] 🍎 Retry 1: Playing...');
                        player.playVideo();
                    }
                }
            }, 500);

            setTimeout(() => {
                if (player && player.getPlayerState && player.playVideo) {
                    const state = player.getPlayerState();
                    if (state === YT.PlayerState.PAUSED) {
                        console.log('[iOS Background] 🍎 Retry 2: Playing...');
                        player.playVideo();
                    }
                }
            }, 1500);

            setTimeout(() => {
                if (player && player.getPlayerState && player.playVideo) {
                    const state = player.getPlayerState();
                    if (state === YT.PlayerState.PAUSED) {
                        console.log('[iOS Background] 🍎 Retry 3: Playing...');
                        player.playVideo();
                    }
                }
            }, 3000);

            // Don't stop timers yet - give it a chance to resume
            return;
        }

        // 🐛 FIX: Update UI when paused (Chef Eric's bug report)
        isPlaying = false;
        stopVinylAnimation();
        updatePlayButton();

        // 📱 Android: Stop background keep-alive when paused
        if (typeof stopBackgroundKeepAlive === 'function')
            stopBackgroundKeepAlive();

        // 📱 ANDROID LOCK SCREEN FIX: Stop autoplay timer when paused
        if (typeof stopBackgroundAutoplayTimer === 'function') {
            stopBackgroundAutoplayTimer();
            console.log('[Background] ⏰ Autoplay timer stopped (paused)');
        }

        // 🎧 LISTENING TIME: Pause tracking, save listened time
        if (listeningSession.startTime > 0) {
            const listenedNow =
                (Date.now() - listeningSession.startTime) / 1000;
            listeningSession.totalListenedTime += listenedNow;
            listeningSession.startTime = 0; // Reset for next play
            console.log(
                '[Listening] ⏸️ Paused. This segment: ' +
                    listenedNow.toFixed(1) +
                    's, Total: ' +
                    listeningSession.totalListenedTime.toFixed(1) +
                    's'
            );
        }
    } else if (event.data === YT.PlayerState.CUED) {
        // 📱 iPhone FIX: Video loaded (CUED) but not auto-playing
        // This happens when autoplay is blocked by iOS Safari
        console.log('[iPhone Fix] Video CUED (loaded) - attempting play...');

        // Check if autoplay should happen
        const autoplayEnabled =
            localStorage.getItem('autoplayEnabled') !== 'false';
        if (autoplayEnabled) {
            // Try to play with mute first (iOS requirement)
            try {
                if (player && player.mute) player.mute();
                if (player && player.playVideo) player.playVideo();

                // Retry play attempts for stubborn iOS
                setTimeout(() => {
                    if (player && player.getPlayerState) {
                        const state = player.getPlayerState();
                        if (
                            state !== YT.PlayerState.PLAYING &&
                            state !== YT.PlayerState.BUFFERING
                        ) {
                            console.log('[iPhone Fix] Retry play at 500ms...');
                            player.playVideo();
                        }
                    }
                }, 500);

                setTimeout(() => {
                    if (player && player.getPlayerState) {
                        const state = player.getPlayerState();
                        if (
                            state !== YT.PlayerState.PLAYING &&
                            state !== YT.PlayerState.BUFFERING
                        ) {
                            console.log('[iPhone Fix] Retry play at 1500ms...');
                            player.playVideo();
                        }
                    }
                }, 1500);
            } catch (e) {
                console.log('[iPhone Fix] Play attempt error:', e);
            }
        }
    } else {
        isPlaying = false;
        stopVinylAnimation();
        updatePlayButton();
    }
}

// Handle YouTube player errors
function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);

    // 🍎 iOS: Track failed attempts
    const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS && iOSPlaybackSession.active) {
        iOSPlaybackSession.failedAttempts++;
        console.log(
            `[iOS] ⚠️ Failed attempt #${iOSPlaybackSession.failedAttempts}`
        );

        // If 3+ consecutive failures, session might be stale - ask user to tap
        if (iOSPlaybackSession.failedAttempts >= 3) {
            iOSPlaybackSession.active = false;
            showStatus('Tap to continue ▶️', 3000);
            return;
        }
    }

    // Clear loading timeout
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }

    // Error codes:
    // 2 = Invalid parameter
    // 5 = HTML5 player error
    // 100 = Video not found / removed
    // 101/150 = Video not allowed to be played in embedded players

    let errorMessage = 'Unable to play this video';

    if (event.data === 2) {
        errorMessage = 'Invalid video ID';
    } else if (event.data === 5) {
        errorMessage = 'Player error - please try another song';
    } else if (event.data === 100) {
        errorMessage = 'Video not found or removed';
    } else if (event.data === 101 || event.data === 150) {
        errorMessage = 'Video cannot be played in embedded player';
    }

    showStatus(errorMessage, 3000);

    // Stop playback state
    isPlaying = false;
    isBuffering = false;
    stopVinylAnimation();
    updatePlayButton();

    // Only auto-skip if it was an automatic play (Vibe Shuffle), not user selection
    // Error 150 = embedding disabled - show message but don't force skip on user's choice
    const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
    const wasAutoPlay = window._lastPlayWasAuto || false;

    if (
        autoplayEnabled &&
        wasAutoPlay &&
        currentPlatform === 'youtube' &&
        youtubeSearchResults.length > 0
    ) {
        console.log('[AutoPlay] Skipping unplayable song, finding next...');
        setTimeout(() => {
            playNext();
        }, 1500);
    } else if (event.data === 150) {
        // User selected this song but it can't play - show helpful message
        showStatus(
            '⚠️ This song has playback restrictions. Try another version!',
            4000
        );
        console.log(
            '[Player] User-selected song blocked (Error 150). Not auto-skipping.'
        );
    }
}

// Autoplay Toggle
function toggleAutoplay() {
    const toggle = document.getElementById('autoplayToggle');
    const newState = toggle.checked;
    localStorage.setItem('autoplayEnabled', newState);

    // No toast notification needed - toggle switch is self-explanatory
}

function updateAutoplayButton() {
    const toggle = document.getElementById('autoplayToggle');
    const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';

    if (toggle) {
        toggle.checked = autoplayEnabled;
    }
}

// Initialize autoplay button state on load
window.addEventListener('DOMContentLoaded', function () {
    // Set default autoplay to ON if not set
    if (localStorage.getItem('autoplayEnabled') === null) {
        localStorage.setItem('autoplayEnabled', 'true');
    }
    updateAutoplayButton();
});

// Helper function to decode HTML entities from YouTube
function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

// Search YouTube
async function performSearch() {
    console.log('performSearch called');
    const query = document.getElementById('searchInput').value.trim();
    console.log('Search query:', query);
    if (!query) {
        console.log('Empty query, returning');
        return;
    }

    // Track search event
    if (typeof trackSearch === 'function') {
        trackSearch(query);
    }

    // Switch to YouTube tab to show search results (with safety check)
    if (typeof switchPlatform === 'function') {
        console.log('Switching to youtube platform');
        switchPlatform('youtube');
    }

    const songList = document.getElementById('songList');
    songList.innerHTML =
        '<div class="loading"><i class="bi bi-heart-pulse"></i><p>HEART Syncing your vibe...</p></div>';

    try {
        // YouTube API for search (reliable)
        const results = await searchYouTube(query);
        displayYouTubeResults(results);

        // 🔱 TRIDENT: Prefetch in background for autoplay (quota saver)
        if (typeof tridentRouter !== 'undefined' && results.length > 0) {
            tridentRouter.prefetchForAutoplay(query);
        }
    } catch (error) {
        console.error('Search error:', error);
        songList.innerHTML =
            '<div class="error-message"><i class="bi bi-exclamation-triangle"></i><p>Failed to search. ' +
            error.message +
            '</p></div>';
    }
}

async function searchYouTube(query, retryCount = 0) {
    // Check cache first (6 hours cache to save API quota)
    const cacheKey = `search_cache_${query.toLowerCase().trim()}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

        // Check if cache is still valid
        if (Date.now() - timestamp < sixHours) {
            console.log('Using cached results for:', query);
            return data;
        } else {
            // Clear expired cache
            localStorage.removeItem(cacheKey);
        }
    }

    // Check if CONFIG is loaded
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG is not defined! Make sure config.js is loaded.');
        throw new Error('Configuration not loaded. Please refresh the page.');
    }

    const API_KEY = CONFIG.getCurrentApiKey();
    const MAX_RESULTS = CONFIG.MAX_SEARCH_RESULTS;

    if (!API_KEY) {
        console.error('YouTube API key is missing!');
        throw new Error('YouTube API key not configured.');
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
    )}&type=video&videoCategoryId=10&maxResults=${MAX_RESULTS}&key=${API_KEY}`;

    console.log(
        'Searching YouTube for:',
        query,
        `(Using API Key ${CONFIG.CURRENT_KEY_INDEX + 1})`
    );
    console.log('API URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));

    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        console.error('YouTube API Error:', errorData);

        // Check for quota exceeded or forbidden (403)
        const isQuotaError =
            errorData.error?.errors?.[0]?.reason === 'quotaExceeded' ||
            response.status === 403;

        if (isQuotaError) {
            // Try next API key if available
            if (retryCount < CONFIG.YOUTUBE_API_KEYS.length - 1) {
                console.log(
                    `Key ${
                        CONFIG.CURRENT_KEY_INDEX + 1
                    } quota exceeded. Trying next key...`
                );
                CONFIG.rotateApiKey();
                return searchYouTube(query, retryCount + 1);
            }

            // All keys exhausted
            throw new Error(
                '🎵 All search limits reached! Resets at 12:30 PM IST daily. Meanwhile, browse your ♥️ Records Library!'
            );
        }

        throw new Error(
            errorData.error?.message ||
                'API Error: ' + response.status + ' - ' + response.statusText
        );
    }

    const data = await response.json();
    console.log('YouTube search results:', data);

    const results = data.items || [];

    // Cache the results (6 hours) - with quota safety
    if (results.length > 0) {
        try {
            // Clean old caches first to prevent quota issues
            cleanOldSearchCaches();

            localStorage.setItem(
                cacheKey,
                JSON.stringify({
                    data: results,
                    timestamp: Date.now(),
                })
            );
            console.log('Cached search results for:', query);
        } catch (e) {
            // Storage quota exceeded - clear all search caches and retry
            console.warn('Storage quota exceeded, clearing search caches...');
            clearAllSearchCaches();
            try {
                localStorage.setItem(
                    cacheKey,
                    JSON.stringify({
                        data: results,
                        timestamp: Date.now(),
                    })
                );
            } catch (e2) {
                // Still failing, just skip caching
                console.warn('Could not cache results, skipping');
            }
        }
    }

    return results;
}

/**
 * 🧹 Clean old search caches (older than 6 hours)
 */
function cleanOldSearchCaches() {
    const sixHours = 6 * 60 * 60 * 1000;
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('search_cache_')) {
            try {
                const cached = JSON.parse(localStorage.getItem(key));
                if (
                    cached &&
                    cached.timestamp &&
                    now - cached.timestamp > sixHours
                ) {
                    keysToRemove.push(key);
                }
            } catch (e) {
                keysToRemove.push(key); // Invalid cache, remove it
            }
        }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    if (keysToRemove.length > 0) {
        console.log(`🧹 Cleaned ${keysToRemove.length} old search caches`);
    }
}

/**
 * 🗑️ Clear ALL search caches (emergency quota fix)
 */
function clearAllSearchCaches() {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('search_cache_')) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log(
        `🗑️ Cleared ${keysToRemove.length} search caches to free space`
    );
}

function displayYouTubeResults(results) {
    youtubeSearchResults = results;
    const songList = document.getElementById('songList');

    if (results.length === 0) {
        songList.innerHTML =
            '<div class="error-message"><p>No results found</p></div>';
        return;
    }

    songList.innerHTML = '';

    // Show only initial results (8) first
    const initialCount = CONFIG.INITIAL_SEARCH_RESULTS || 8;
    displayedResultsCount = Math.min(initialCount, results.length);

    // Display initial batch
    for (let index = 0; index < displayedResultsCount; index++) {
        appendSongItem(results[index], index);
    }

    // Add "Load More" button if there are more results
    if (results.length > displayedResultsCount) {
        addLoadMoreButton();
    }

    syncHeartStates();
}

// Append a single song item to the list
function appendSongItem(item, index) {
    const songList = document.getElementById('songList');
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.onclick = () => playYouTubeSong(index);

    const thumbnail = item.snippet.thumbnails.default.url;
    const title = decodeHtmlEntities(item.snippet.title);
    const channel = decodeHtmlEntities(item.snippet.channelTitle);
    const videoId = item.id.videoId;

    // 🛡️ TRUST: Get trust level for channel
    const trustInfo = InvisibleIntelligence.getTrustLevel(channel);
    const trustBadge =
        (trustInfo.level === 'verified' || trustInfo.level === 'trusted') &&
        trustInfo.icon
            ? `<i class="bi ${trustInfo.icon} trust-badge" title="${trustInfo.label}"></i>`
            : '';

    songItem.innerHTML = `
        <img src="${thumbnail}" alt="${title}">
        <div class="song-item-info">
            <div class="song-item-title">${title}</div>
            <div class="song-item-artist">${trustBadge}${channel}</div>
        </div>
        <button class="song-heart-btn" onclick="event.stopPropagation(); toggleLibraryHeart('youtube', '${videoId}', '${title.replace(
        /'/g,
        "\\'"
    )}', '${channel.replace(
        /'/g,
        "\\'"
    )}', '${thumbnail}', this);" title="Add to Records Library">
            <i class="bi bi-heart"></i>
        </button>
    `;

    songList.appendChild(songItem);
}

// Add Load More button
function addLoadMoreButton() {
    const songList = document.getElementById('songList');

    // Remove existing load more button if any
    const existingBtn = document.getElementById('loadMoreBtn');
    if (existingBtn) existingBtn.remove();

    const loadMoreBtn = document.createElement('div');
    loadMoreBtn.id = 'loadMoreBtn';
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.innerHTML = `
        <button onclick="loadMoreResults()">
            <i class="bi bi-arrow-down-circle"></i> Load More Results
        </button>
    `;
    songList.appendChild(loadMoreBtn);
}

// Load more results
function loadMoreResults() {
    const remaining = youtubeSearchResults.length - displayedResultsCount;

    if (remaining <= 0) return;

    // Remove load more button first
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) loadMoreBtn.remove();

    // Calculate how many more to show
    const batchSize = Math.min(remaining, 7); // Load 7 more at a time
    const startIndex = displayedResultsCount;
    const endIndex = startIndex + batchSize;

    // Append new items
    for (let i = startIndex; i < endIndex; i++) {
        appendSongItem(youtubeSearchResults[i], i);
    }

    displayedResultsCount = endIndex;

    // Add load more button again if there are still more
    if (youtubeSearchResults.length > displayedResultsCount) {
        addLoadMoreButton();
    }

    syncHeartStates();
    showStatus(`Loaded ${batchSize} more`, 1500);
}

function playYouTubeSong(index, isAutoPlay = false) {
    console.log('[Play] 🎵 playYouTubeSong called with index:', index);

    // 🍎 iOS Detection for special handling
    const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // ⚡ CRITICAL: Validate FIRST, before any other operations
    if (!youtubeSearchResults[index]) {
        console.error('[Play] ❌ No song at index:', index);
        showStatus('Song not found', 2000);
        return;
    }

    if (!player || !player.loadVideoById) {
        console.error('[Play] ❌ YouTube player not ready!');
        showStatus('Player loading... try again', 2000);
        if (
            typeof onYouTubeIframeAPIReady === 'function' &&
            typeof YT !== 'undefined'
        ) {
            onYouTubeIframeAPIReady();
        }
        return;
    }

    // ⚡ CRITICAL: Get videoId IMMEDIATELY (minimal operations!)
    const videoId = youtubeSearchResults[index].id.videoId;

    // 🔥🔥🔥 iOS AUTOPLAY FIX v1.7.0 🔥🔥🔥
    // iOS Safari user gesture EXPIRES in ~50ms!
    // We MUST call loadVideoById IMMEDIATELY after user tap!
    // All other operations (analytics, UI, history) can wait!

    console.log(
        `[Player] ⚡ IMMEDIATE load: ${videoId} (iOS: ${isIOS}, isAutoPlay: ${isAutoPlay})`
    );
    player.loadVideoById(videoId);
    console.log(
        '[Autoplay] ✅ loadVideoById called FIRST (before any other operations!)'
    );

    // 🎵 DISC ANIMATION IMMEDIATELY after loadVideoById!
    // Disc spin = playVideo trigger (synchronized experience)
    triggerDiscAnimation();
    console.log(
        '[Disc] 🎵 triggerDiscAnimation called - disc will spin and trigger play!'
    );

    // ===== EVERYTHING BELOW HAPPENS AFTER VIDEO STARTS LOADING =====
    // User gesture already "used" above - these don't need it

    // 📱 ANDROID FIX: Stop any existing autoplay timer (new song loading)
    if (typeof stopBackgroundAutoplayTimer === 'function') {
        stopBackgroundAutoplayTimer();
    }

    // 🍎 iOS: Activate playback session when user taps (not auto-play)
    if (isIOS && !isAutoPlay) {
        iOSPlaybackSession.active = true;
        iOSPlaybackSession.lastUserInteraction = Date.now();
        iOSPlaybackSession.songsPlayed = 0;
        iOSPlaybackSession.failedAttempts = 0;
        console.log('[iOS] 📱 User tap detected - playback session ACTIVATED');
    }

    // Track if this was auto-play or user selection
    window._lastPlayWasAuto = isAutoPlay;

    // 🎯 USER SEARCH PROTECTION: Mark this video as user's explicit choice
    // This video should NEVER auto-repeat during this session!
    if (!isAutoPlay) {
        userSearchedVideoId = videoId;
        autoplayLoopBreaker = 0; // Reset loop breaker on user action
        console.log(
            '[Search Protection] 🎯 User selected video protected from auto-repeat:',
            videoId.substring(0, 8)
        );
    }

    // 🎬 Cancel any ongoing thumbnail reveal (new song = new reveal)
    SmartThumbnail.cancelReveal();

    // Close sidebar on mobile and go to player
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
        // Scroll to top to show player
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    currentPlatform = 'youtube';
    currentSongIndex = index;

    // Now get other metadata (video already loading!)
    const title = decodeHtmlEntities(youtubeSearchResults[index].snippet.title);
    const channel = decodeHtmlEntities(
        youtubeSearchResults[index].snippet.channelTitle
    );
    const thumbnail =
        youtubeSearchResults[index].snippet.thumbnails.high?.url ||
        youtubeSearchResults[index].snippet.thumbnails.default.url;

    console.log(
        '[Play] ▶️ Playing:',
        title,
        'by',
        channel,
        '| VideoID:',
        videoId
    );

    // 🎯 SELECTION PATTERN LEARNING (40% of HEART Sync!)
    // "21 results mein se user ne kya choose kiya - that's REAL intelligence!"
    if (!isAutoPlay) {
        // Check if channel is verified (has trust badge)
        const channelTrust = InvisibleIntelligence.getChannelTrust(channel);
        const isVerified = channelTrust && channelTrust.trustScore >= 0.7;

        InvisibleIntelligence.learnFromSelection({
            selectedIndex: index,
            totalResults: youtubeSearchResults.length,
            channel: channel,
            isVerified: isVerified,
            title: title,
            isAutoPlay: false,
        });

        // Update HEART UI after learning
        if (typeof updateHeartSyncUI === 'function') {
            setTimeout(() => updateHeartSyncUI(), 500);
        }
    }

    // Store current song data for sharing
    currentVideoId = videoId;
    currentSongData = {
        videoId: videoId,
        title: title,
        artist: channel,
        thumbnail: thumbnail,
    };

    // Save to play history
    saveToPlayHistory({
        videoId: videoId,
        title: title,
        channel: channel,
        thumbnail: thumbnail,
    });

    // Track song play
    if (typeof trackSongPlay === 'function') {
        trackSongPlay(title, channel, 'youtube');
    }

    // Stop local audio if playing
    audioPlayer.pause();

    // Show loading status in title area
    showStatus('Loading...', 0);

    // Clear any existing loading timeout
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }

    // 🔥 v1.7.0: loadVideoById already called at function start!
    // Now just set up retry logic for cases where buffering takes long

    // iOS-specific: Retry playVideo if stuck in buffering/paused
    // (Gesture was used for loadVideoById, but playVideo retries are allowed)
    const playRetryIntervals = isIOS
        ? [500, 1500, 3000] // Fewer retries, longer gaps for iOS
        : [300, 800, 1500]; // Desktop retries

    playRetryIntervals.forEach((delay) => {
        setTimeout(() => {
            try {
                if (player && player.getPlayerState && player.playVideo) {
                    const state = player.getPlayerState();
                    // If paused/cued (not playing, not buffering), try playVideo
                    if (
                        state === YT.PlayerState.PAUSED ||
                        state === YT.PlayerState.CUED
                    ) {
                        console.log(
                            `[Autoplay Retry] playVideo at ${delay}ms, state: ${state}`
                        );
                        player.playVideo();
                    }
                    // Ensure unmuted and volume set when playing/buffering
                    if (
                        state === YT.PlayerState.PLAYING ||
                        state === YT.PlayerState.BUFFERING
                    ) {
                        player.unMute();
                        const volumeSlider =
                            document.getElementById('volumeSlider');
                        player.setVolume(
                            volumeSlider ? volumeSlider.value : 70
                        );
                    }
                }
            } catch (e) {
                console.log(`[Autoplay Retry] Error at ${delay}ms:`, e);
            }
        }, delay);
    });

    // 🔧 Final check at 4 seconds - if still not playing, show user message
    setTimeout(() => {
        if (player && player.getPlayerState) {
            const state = player.getPlayerState();
            if (
                state !== YT.PlayerState.PLAYING &&
                state !== YT.PlayerState.BUFFERING
            ) {
                showStatus('Tap play button ▶️', 3000);
            }
        }
    }, 4000);

    player.setPlaybackQuality('small'); // Force lower quality for faster loading

    // Manually trigger playback state
    isPlaying = true;
    isBuffering = true; // Set buffering true until PLAYING state received
    startVinylAnimation();
    updatePlayButton();

    // Set loading timeout (20 seconds) - only skip if still buffering (PLAYING state not received)
    loadingTimeout = setTimeout(() => {
        if (isBuffering) {
            console.log(
                'Song loading timeout - still buffering after 20s, skipping...'
            );
            showStatus('Timeout, skipping...', 1500);

            // Stop stuck state
            isPlaying = false;
            isBuffering = false;
            stopVinylAnimation();
            updatePlayButton();

            // Auto-skip to next if autoplay enabled
            const autoplayEnabled =
                localStorage.getItem('autoplayEnabled') !== 'false';
            if (autoplayEnabled && youtubeSearchResults.length > 0) {
                setTimeout(() => playNext(), 1500);
            }
        }
    }, 20000); // 20 second timeout

    // Update UI
    updateSongInfo(title, channel, thumbnail);
    updateActiveItem('songList', index);

    // Update Media Session metadata for background playback
    updateMediaSessionMetadata(title, channel, thumbnail);

    // 💓 HEART: Update session mood based on song
    const detectedMood = HEART.detectMoodFromTitle(title);
    HEART.updateSessionMood(detectedMood);

    // 🧘‍♂️ Start Deep Listening tracking
    HEART.startDeepListening(detectedMood);

    // 💕 Update HEART Sync UI (heart fills as we learn more)
    updateHeartSyncUI();

    // 💭 HEART Whisper: Check for whisper triggers (mood, milestones)
    HEARTWhisper.checkAutoWhisper();

    // � Guest Whisper: Mehman ko dost banana hai!
    HEARTWhisper.checkGuestWhisper();

    // �💭 Mood-based whisper (10% chance to avoid spamming)
    if (detectedMood && Math.random() < 0.1) {
        HEARTWhisper.whisperMood(detectedMood);
    }

    // 🎵 Note: triggerDiscAnimation() already called at start of function
    // after loadVideoById - disc spin triggers playVideo!
}

// Handle Local Files
function handleFiles(files) {
    Array.from(files).forEach((file) => {
        if (file.type.startsWith('audio/')) {
            localFiles.push({
                file: file,
                name: file.name,
                url: URL.createObjectURL(file),
            });
        }
    });

    displayLocalFiles();
}

function displayLocalFiles() {
    const localSongList = document.getElementById('localSongList');

    if (localFiles.length === 0) {
        localSongList.innerHTML = '';
        return;
    }

    localSongList.innerHTML = '';

    localFiles.forEach((item, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';

        const fileName = item.name.replace(/\.[^/.]+$/, '');

        songItem.innerHTML = `
            <i class="bi bi-file-music" style="font-size: 2rem; color: var(--text-dim);"></i>
            <div class="song-item-info" onclick="event.stopPropagation(); playLocalFile(${index});" style="cursor: pointer;">
                <div class="song-item-title">${fileName}</div>
                <div class="song-item-artist">Local File</div>
            </div>
            <button class="song-heart-btn" onclick="event.stopPropagation(); toggleLibraryHeart('local', '${
                item.url
            }', '${fileName.replace(
            /'/g,
            "\\'"
        )}', 'Local File', '', this);" title="Add to Records Library">
                <i class="bi bi-heart"></i>
            </button>
            <button class="song-item-remove" onclick="event.stopPropagation(); removeLocalFile(${index});">
                <i class="bi bi-trash"></i>
            </button>
        `;

        localSongList.appendChild(songItem);
    });

    syncHeartStates();
}

function playLocalFile(index) {
    if (!localFiles[index]) return;

    currentPlatform = 'local';
    currentSongIndex = index;

    const file = localFiles[index];
    const fileName = file.name.replace(/\.[^/.]+$/, '');

    // Stop YouTube if playing
    if (player && player.pauseVideo) {
        player.pauseVideo();
    }

    // Play local file
    audioPlayer.src = file.url;
    audioPlayer.play();

    // Update UI
    updateSongInfo(fileName, 'Local File', null);
    updateActiveItem('localSongList', index);

    // Update Media Session metadata for background playback
    updateMediaSessionMetadata(fileName, 'Local File', null);

    // Trigger disc slide-up animation
    triggerDiscAnimation();

    isPlaying = true;
    startVinylAnimation();
    updatePlayButton();

    // Clear lyrics for local files
    clearLyrics();
}

function removeLocalFile(index) {
    URL.revokeObjectURL(localFiles[index].url);
    localFiles.splice(index, 1);
    displayLocalFiles();

    if (currentPlatform === 'local' && currentSongIndex === index) {
        audioPlayer.pause();
        audioPlayer.src = '';
        resetPlayer();
    }
}

// Playback Controls
function togglePlayPause() {
    console.log(
        '[TogglePlay] Called! Platform:',
        currentPlatform,
        'Player:',
        !!player,
        'getPlayerState:',
        !!(player && player.getPlayerState)
    );

    if (currentPlatform === 'youtube' && player && player.getPlayerState) {
        const currentState = player.getPlayerState();
        console.log('[TogglePlay] Current state:', currentState);

        if (currentState === YT.PlayerState.PLAYING) {
            console.log('[TogglePlay] Pausing...');
            player.pauseVideo();
        } else {
            console.log('[TogglePlay] Playing...');
            player.playVideo();

            // 🍎 iOS: Force unmute on user tap
            try {
                player.unMute();
                const vol =
                    document.getElementById('volumeSlider')?.value || 70;
                player.setVolume(vol);
                console.log('[TogglePlay] Unmuted, volume:', vol);
            } catch (e) {
                console.log('[TogglePlay] Unmute error:', e);
            }
        }
    } else if (currentPlatform === 'local' && audioPlayer.src) {
        if (audioPlayer.paused) {
            audioPlayer.play();
            isPlaying = true;
            startVinylAnimation();
        } else {
            audioPlayer.pause();
            isPlaying = false;
            stopVinylAnimation();
        }
        updatePlayButton();

        // Update Media Session playback state
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = isPlaying
                ? 'playing'
                : 'paused';
        }
    }
}

function playNext() {
    // 🎚️ CROSSFADE: Cancel if user manually triggers next
    if (typeof Crossfade !== 'undefined' && !Crossfade.isFading) {
        Crossfade.cancel();
    }

    // 🧠 INTELLIGENCE: If user manually skips, learn from it
    if (currentSongData && songStartTime > 0) {
        const playTime = (Date.now() - songStartTime) / 1000; // seconds played

        // If skipped within first 30 seconds, count as a skip
        if (playTime < 30) {
            InvisibleIntelligence.learnFromSkip(currentSongData, playTime);
            // 🧘‍♂️ Record skip - breaks deep listening
            HEART.recordSkip();
        } else {
            // Played more than 30 sec = partial play, still positive
            const duration = player?.getDuration ? player.getDuration() : 180;
            // 🎯 GINI MODE: Only pass true if user explicitly selected this song
            const wasUserSearch = !window._lastPlayWasAuto;
            InvisibleIntelligence.learnFromPlay(
                currentSongData,
                playTime,
                duration,
                wasUserSearch
            );
        }
    }

    // Reset song start time for next song
    songStartTime = 0;

    if (currentPlatform === 'youtube') {
        // 🔬 QED AUTOPLAY: NEVER play from search results!
        // Search results = same song different channels = BAD UX
        // Always use intelligent path: Artist songs → Vibe Shuffle → Related
        // Like QED: The "simple path" (artist) dominates, complex paths refine

        const currentTitle = currentSongData?.title || '';

        // 🎯 ALWAYS go to artist's more songs or vibe shuffle
        // Search results are for USER SELECTION, not autoplay!
        if (youtubeSearchResults.length > 0 && currentSongIndex >= 0) {
            // User already selected from search, now HEART takes over
            console.log(
                '[Next] 🔬 QED: Search played, switching to HEART-driven autoplay'
            );

            // Clear search results to prevent loop back
            // But keep them for Previous button history
            const searchResultsBackup = [...youtubeSearchResults];
            youtubeSearchResults = [];

            // Use artist songs for natural continuation
            console.log("[Next] 🎤 Fetching artist's more songs...");
            playArtistMoreSongs();
            return;
        }

        // 🔬 QED PATH 2: Vibe Shuffle for deep link / history plays
        if (isVibeShuffleEnabled && currentVideoId) {
            // 🧘 VIBE SHUFFLE: Only for deep link/history plays (no search context)
            // HEART Matrix decides what to play based on user's mood learning
            console.log(
                '[Next] 🎲 No search context, using Vibe Shuffle (HEART decides)'
            );
            playVibeShuffledNext();
        } else {
            // No search results (deep link/history play) - use play history!
            const history = JSON.parse(
                localStorage.getItem('playHistory') || '[]'
            );
            if (history.length > 1 && currentVideoId) {
                const currentIndex = history.findIndex(
                    (h) => h.videoId === currentVideoId
                );
                const nextIndex =
                    currentIndex >= 0 ? (currentIndex + 1) % history.length : 0;
                const nextSong = history[nextIndex];
                if (nextSong && nextSong.videoId !== currentVideoId) {
                    console.log(
                        '[Next] 📜 Playing from history:',
                        nextSong.title?.substring(0, 40)
                    );
                    // 🐛 FIX: playVideoById(videoId, retryCount, isAutoPlay)
                    // Only pass videoId and isAutoPlay=true, let API fetch the rest
                    playVideoById(nextSong.videoId, 0, true);
                }
            }
        }
    } else if (currentPlatform === 'local' && localFiles.length > 0) {
        const nextIndex = (currentSongIndex + 1) % localFiles.length;
        playLocalFile(nextIndex);
    }
}

/**
 * 🎵 VIBE CACHE - Reduces API calls by 80%!
 * Caches search results by vibe category
 * Reuses cache for similar mood songs
 */
const VibeCache = {
    cache: {}, // { 'romantic': [{video}, {video}...], 'sad': [...] }
    cacheTime: {}, // When each category was cached
    CACHE_TTL: 30 * 60 * 1000, // 30 minutes cache validity
    MIN_CACHE_SIZE: 3, // Minimum songs before refetch

    // Get cached results for a vibe category
    get(category) {
        const now = Date.now();
        if (
            this.cache[category] &&
            this.cache[category].length >= this.MIN_CACHE_SIZE &&
            now - (this.cacheTime[category] || 0) < this.CACHE_TTL
        ) {
            console.log(
                `[VibeCache] ✅ HIT: ${category} (${this.cache[category].length} songs)`
            );
            return this.cache[category];
        }
        console.log(`[VibeCache] ❌ MISS: ${category}`);
        return null;
    },

    // Store results for a vibe category
    set(category, results) {
        if (!results || results.length === 0) return;
        this.cache[category] = results;
        this.cacheTime[category] = Date.now();
        console.log(
            `[VibeCache] 💾 STORED: ${category} (${results.length} songs)`
        );
    },

    // Remove a played song from cache to prevent repeats
    markPlayed(category, videoId) {
        if (this.cache[category]) {
            this.cache[category] = this.cache[category].filter(
                (v) => (v.id.videoId || v.id) !== videoId
            );
            console.log(
                `[VibeCache] 🎵 Marked played, ${this.cache[category].length} remaining in ${category}`
            );
        }
    },

    // Get current vibe category from detected vibes
    getCategory(detectedVibes) {
        if (detectedVibes && detectedVibes.length > 0) {
            return detectedVibes[0].category; // Primary vibe
        }
        return 'general';
    },

    // Clear expired caches
    cleanup() {
        const now = Date.now();
        Object.keys(this.cacheTime).forEach((cat) => {
            if (now - this.cacheTime[cat] > this.CACHE_TTL) {
                delete this.cache[cat];
                delete this.cacheTime[cat];
            }
        });
    },
};

// Cleanup cache every 10 minutes
setInterval(() => VibeCache.cleanup(), 10 * 60 * 1000);

/**
 * 🎤 Play Artist's More Songs - YouTube-style autoplay
 * Instead of searching same song (which gives same song different artist),
 * we search for the ARTIST's other hit songs!
 *
 * Flow: "Dil Laga Liya - Udit Narayan" → searches "Udit Narayan hits" → different songs!
 *
 * 🔥 API SAVINGS: 1 search per 21 songs (vs 1 search per song in old Vibe Shuffle)
 */
async function playArtistMoreSongs() {
    const currentTitle = currentSongData?.title || '';
    const currentChannel = currentSongData?.channelTitle || '';

    console.log('[Artist More] 🎤 Finding more songs from artist...');
    console.log(`[Artist More] 📀 Current: "${currentTitle.substring(0, 40)}"`);
    console.log(`[Artist More] 🎙️ Channel: "${currentChannel}"`);

    // Extract artist name from title or channel
    let artistName = extractArtistName(currentTitle, currentChannel);

    if (!artistName || artistName.length < 3) {
        // Fallback to Vibe Shuffle if can't extract artist
        console.log(
            '[Artist More] ⚠️ Could not extract artist, using Vibe Shuffle'
        );
        playVibeShuffledNext();
        return;
    }

    console.log(`[Artist More] 🎯 Searching: "${artistName} hit songs"`);

    try {
        // Search for artist's hits - NOT the same song!
        const searchQuery = `${artistName} hit songs`;
        const results = await searchYouTube(searchQuery);

        if (results && results.length >= 3) {
            // Filter out songs we already played
            const filteredResults = results.filter((song) => {
                const videoId = song.id?.videoId || song.id;
                // Skip if already in lastPlayedVideoIds
                if (lastPlayedVideoIds.includes(videoId)) return false;
                // Skip if it's the current song
                if (videoId === currentVideoId) return false;
                // 🎯 USER SEARCH PROTECTION: Never auto-play the song user explicitly searched!
                if (userSearchedVideoId && videoId === userSearchedVideoId) {
                    console.log(
                        `[Artist More] 🛡️ Protected: Skipping user's original search`
                    );
                    return false;
                }
                // Skip if title is too similar to current (same song different version)
                const similarity = calculateTitleSimilarity(
                    currentTitle,
                    song.snippet?.title || ''
                );
                if (similarity > 0.7) {
                    console.log(
                        `[Artist More] ❌ Skipped (same song): "${song.snippet?.title?.substring(
                            0,
                            40
                        )}"`
                    );
                    return false;
                }
                return true;
            });

            if (filteredResults.length >= 2) {
                // Replace search results with artist's more songs
                youtubeSearchResults = filteredResults;
                currentSongIndex = -1; // Will become 0 after playNext increments

                // Play random song from first 5 (variety!)
                const randomIndex = Math.floor(
                    Math.random() * Math.min(5, filteredResults.length)
                );
                console.log(
                    `[Artist More] ✅ Found ${
                        filteredResults.length
                    } songs, playing #${randomIndex + 1}`
                );
                playYouTubeSong(randomIndex, true);
                return;
            }
        }

        // Fallback: If artist search failed, use Vibe Shuffle
        console.log(
            '[Artist More] ⚠️ Artist search insufficient, using Vibe Shuffle'
        );
        playVibeShuffledNext();
    } catch (error) {
        console.error('[Artist More] ❌ Error:', error);
        playVibeShuffledNext();
    }
}

/**
 * Extract artist name from song title or channel
 * "Dil Laga Liya - Udit Narayan, Alka Yagnik" → "Udit Narayan"
 * "Shape of You | Ed Sheeran" → "Ed Sheeran"
 */
function extractArtistName(title, channel) {
    let artist = '';

    // Try to extract from title first
    if (title) {
        const lowerTitle = title.toLowerCase();

        // Common patterns: "Song - Artist", "Song | Artist", "Song by Artist"
        if (title.includes(' - ')) {
            artist = title.split(' - ')[1] || '';
        } else if (title.includes(' | ')) {
            artist = title.split(' | ')[1] || '';
        } else if (lowerTitle.includes(' by ')) {
            artist = title.split(/ by /i)[1] || '';
        } else if (title.includes(' : ')) {
            artist = title.split(' : ')[1] || '';
        }

        // Clean up artist name
        artist = artist
            .replace(/\(.*?\)/g, '') // Remove (Official Video)
            .replace(/\[.*?\]/g, '') // Remove [Full HD]
            .replace(/ft\..*$/i, '') // Remove ft. other artists
            .replace(/feat\..*$/i, '')
            .replace(/,.*$/i, '') // Take first artist only
            .replace(/official.*$/i, '')
            .replace(/video.*$/i, '')
            .replace(/audio.*$/i, '')
            .trim();
    }

    // If no artist from title, use channel name
    if (!artist || artist.length < 3) {
        artist = channel
            .replace(/official/i, '')
            .replace(/music/i, '')
            .replace(/vevo/i, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Validate: Skip if it looks like a label/channel, not artist
    const skipChannels = [
        't-series',
        'zee music',
        'sony music',
        'tips',
        'saregama',
        'yrf',
        'eros now',
        'shemaroo',
        'ultra',
        'speed records',
    ];
    if (skipChannels.some((ch) => artist.toLowerCase().includes(ch))) {
        // For music labels, try to get artist from title differently
        // "Dil Laga Liya Full Video - DHTKN | Udit Narayan, Alka Yagnik"
        const matches = title.match(/[|]\s*([^|,]+)/);
        if (matches && matches[1]) {
            artist = matches[1].trim();
        }
    }

    console.log(`[Artist Extract] 📝 Extracted: "${artist}"`);
    return artist;
}

/**
 * Calculate similarity between two song titles (0-1)
 * Used to filter out same song different artist versions
 */
function calculateTitleSimilarity(title1, title2) {
    if (!title1 || !title2) return 0;

    // Extract core song name (remove artist, version info)
    const core1 = extractSongCore(title1);
    const core2 = extractSongCore(title2);

    if (!core1 || !core2) return 0;

    // Word-based similarity
    const words1 = new Set(core1.split(' ').filter((w) => w.length > 2));
    const words2 = new Set(core2.split(' ').filter((w) => w.length > 2));

    if (words1.size === 0 || words2.size === 0) return 0;

    let matches = 0;
    words1.forEach((word) => {
        if (words2.has(word)) matches++;
    });

    return matches / Math.max(words1.size, words2.size);
}

/**
 * Extract core song name for comparison
 * "Dil Laga Liya (Official Video) - Udit Narayan" → "dil laga liya"
 */
function extractSongCore(title) {
    if (!title) return '';

    let core = title.toLowerCase();

    // Take only first part (before separators)
    core = core.split(' - ')[0];
    core = core.split(' | ')[0];
    core = core.split(' by ')[0];
    core = core.split(' ft.')[0];
    core = core.split(' feat.')[0];

    // Remove common suffixes
    core = core.replace(/\(.*?\)/g, '');
    core = core.replace(/\[.*?\]/g, '');
    core = core.replace(/official.*$/gi, '');
    core = core.replace(/full.*video/gi, '');
    core = core.replace(/lyric.*$/gi, '');
    core = core.replace(/audio/gi, '');
    core = core.replace(/video/gi, '');
    core = core.replace(/hd|4k|1080p/gi, '');

    // Clean up
    core = core
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return core;
}

/**
 * Vibe Shuffle - Smart DJ System
 * Plays related songs based on current song's vibe
 * Detects mood and gently lifts user from sad loops
 * 🚀 NOW WITH CACHING - 80% less API calls!
 */
async function playVibeShuffledNext() {
    const startTime = performance.now();
    const currentTitle = currentSongData?.title || '';

    console.log('[Vibe Shuffle] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Vibe Shuffle] 🎵 Current: ' + currentTitle.substring(0, 50));

    // 🧘‍♂️ DEEP LISTENING: Check if user is in the zone
    if (HEART.isInDeepListening()) {
        const deepStats = HEART.getDeepListeningStats();
        console.log(
            `[HEART] 🧘‍♂️ Deep Listening ACTIVE - ${deepStats.minutes} min in ${deepStats.mood} mood`
        );
        console.log(
            '[HEART] 🧘‍♂️ Prioritizing same mood songs to maintain the vibe...'
        );
        // Save deep session for future learning
        HEART.saveDeepSession();
    }

    // 💓 HEART: Check for mood uplift (3+ sad songs)
    // But NOT if user is in deep listening mode (respect their mood choice)
    if (HEART.shouldUpliftMood() && !HEART.isInDeepListening()) {
        console.log(
            '[HEART] 🌈 Mood uplift triggered - switching to happy vibes!'
        );

        // 💭 HEART Whisper: Journey whisper for sad → happy transition
        HEARTWhisper.whisperJourney('sadToHappy');

        const upliftSuggestions = HEART.getUpliftSuggestions();
        const randomSearch =
            upliftSuggestions[
                Math.floor(Math.random() * upliftSuggestions.length)
            ];

        try {
            const results = await searchYouTube(randomSearch);
            if (results && results.length > 0) {
                const randomIndex = Math.floor(
                    Math.random() * Math.min(5, results.length)
                );
                youtubeSearchResults = results;
                playYouTubeSong(randomIndex);
                return;
            }
        } catch (e) {
            console.log(
                '[HEART] Uplift search failed, continuing with vibe shuffle'
            );
        }
    }

    // Detect vibes from current song
    const detectedVibes = detectVibeKeywords(currentTitle);
    if (detectedVibes.length > 0) {
        console.log('[Vibe Shuffle] 🧠 Detected vibes:');
        detectedVibes.forEach((v) => {
            console.log(
                `   → "${v.matchedWord}" = ${v.category} (${v.vibeType})`
            );
        });
    } else {
        console.log('[Vibe Shuffle] 🧠 No specific vibe keywords detected');
    }

    console.log('[Vibe Shuffle] ⏱️ Finding next song...');

    try {
        // 🎯 VIBE CACHE: Check cache first before API call!
        const detectedVibes = detectVibeKeywords(currentTitle);
        const vibeCategory = VibeCache.getCategory(detectedVibes);

        let relatedVideos = VibeCache.get(vibeCategory);
        let fromCache = false;

        const fetchStart = performance.now();
        if (relatedVideos && relatedVideos.length >= 3) {
            // Use cached results - NO API CALL! 🎉
            fromCache = true;
            console.log(
                `[Vibe Shuffle] 🚀 Using CACHED results for: ${vibeCategory}`
            );
        } else {
            // Cache empty or expired - fetch fresh
            relatedVideos = await fetchRelatedVideos(currentVideoId);
            if (relatedVideos && relatedVideos.length > 0) {
                VibeCache.set(vibeCategory, relatedVideos);
            }
        }
        const fetchTime = (performance.now() - fetchStart).toFixed(0);
        console.log(
            `[Vibe Shuffle] ⏱️ ${
                fromCache ? 'Cache' : 'API'
            } fetch: ${fetchTime}ms`
        );

        if (!relatedVideos || relatedVideos.length === 0) {
            console.log(
                '[Vibe Shuffle] No related videos, fetching artist songs...'
            );
            // 🐛 FIX: Don't loop back! Get fresh songs instead
            playArtistMoreSongs();
            return;
        }

        // Filter for music only and remove already played
        const filterStart = performance.now();

        const musicVideos = relatedVideos.filter((video) => {
            const title = video.snippet.title.toLowerCase();
            const videoId = video.id.videoId || video.id;

            // Skip if already played recently
            if (lastPlayedVideoIds.includes(videoId)) return false;

            // Skip same video as current
            if (videoId === currentVideoId) return false;

            // 🎯 USER SEARCH PROTECTION: Never auto-play the song user explicitly searched!
            // "3-4 gaane ke baad search kiya hua gaana fir aata hai" - FIXED!
            if (userSearchedVideoId && videoId === userSearchedVideoId) {
                console.log(
                    "[Vibe Shuffle] 🛡️ Protected: Skipping user's original search:",
                    video.snippet.title.substring(0, 40)
                );
                return false;
            }

            // Filter out non-music content
            if (title.includes('trailer') || title.includes('teaser'))
                return false;
            if (
                title.includes('behind the scenes') ||
                title.includes('making of')
            )
                return false;
            if (title.includes('interview') || title.includes('reaction'))
                return false;
            if (title.includes('gameplay') || title.includes('walkthrough'))
                return false;
            if (title.includes('review') || title.includes('explained'))
                return false;

            // ✅ Jukebox, Nonstop, Top Lists - NOW ALLOWED
            // User wants these: "Sundar Kand", "Ramayan", "Romantic Jukebox" are valid content!
            // Long devotional/spiritual content (2-3 hours) is intentional and valid

            // 🚫 Skip SLOW REVERB - too drastic vibe shift
            if (title.includes('slowed') && title.includes('reverb'))
                return false;
            if (title.includes('8d audio') || title.includes('8d song'))
                return false;

            // ✅ LOFI - Now ALLOWED as mood transition bridge!
            // LoFi is perfect for: sad → chill → happy (gradual uplift)
            // Don't skip: if (title.includes('lofi') || title.includes('lo-fi')) return false;

            // 💓 HEART: Use LoFi as bridge when transitioning from sad mood
            const heartMood = HEART.getDominantSessionMood();
            if (
                heartMood === 'sad' &&
                (title.includes('lofi') || title.includes('lo-fi'))
            ) {
                console.log(
                    '[HEART] 🌉 LoFi bridge allowed for mood transition'
                );
                // Allow LoFi to play as bridge
            }

            // 🚫 Skip BHAJAN / DEVOTIONAL when coming from party songs
            // This prevents sudden mood shift from party → bhakti
            const currentMood =
                vibeHistory.length > 0
                    ? vibeHistory[vibeHistory.length - 1]
                    : 'neutral';
            if (
                (currentMood === 'party' || currentMood === 'love') &&
                (title.includes('bhajan') ||
                    title.includes('aarti') ||
                    title.includes('bhakti') ||
                    title.includes('krishna') ||
                    title.includes('shiva') ||
                    title.includes('mantra'))
            ) {
                console.log(
                    '[Vibe Shuffle] Skipping devotional (mood is party/love):',
                    title.substring(0, 40)
                );
                return false;
            }

            // IMPORTANT: Skip same song different versions
            // Get current song's main identifying words
            const currentTitle = (currentSongData?.title || '').toLowerCase();

            // Extract meaningful words (remove common words)
            const commonWords = [
                'the',
                'song',
                'video',
                'full',
                'hd',
                'lyrical',
                'lyrics',
                'audio',
                'official',
                'from',
                'movie',
                'film',
            ];
            const getMainWords = (str) => {
                return str
                    .replace(/\(.*?\)/g, '')
                    .replace(/\[.*?\]/g, '')
                    .split(/[\s\-\|:,]+/)
                    .filter((w) => w.length > 2 && !commonWords.includes(w))
                    .slice(0, 5); // Take first 5 meaningful words
            };

            const currentWords = getMainWords(currentTitle);
            const nextWords = getMainWords(title);

            // Check for matching words
            let matchCount = 0;
            for (const word of currentWords) {
                if (
                    nextWords.some(
                        (nw) => nw.includes(word) || word.includes(nw)
                    )
                ) {
                    matchCount++;
                }
            }

            // If 1 or more main words match, it's probably same song
            // Being more strict now - even 1 unique word match = same song
            if (matchCount >= 1 && currentWords.length >= 1) {
                console.log(
                    '[Vibe Shuffle] Skipping same song (' +
                        matchCount +
                        ' matches):',
                    video.snippet.title.substring(0, 50)
                );
                return false;
            }

            // Skip covers, karaoke, remakes
            if (title.includes('cover') || title.includes('karaoke'))
                return false;
            if (title.includes('remake') || title.includes('reprise'))
                return false;

            // 🧠 INVISIBLE INTELLIGENCE - Filter based on learned preferences
            const channelTitle = video.snippet.channelTitle || '';
            if (InvisibleIntelligence.shouldFilter(title, channelTitle)) {
                console.log(
                    '[Vibe Shuffle] 🧠 Intelligence filter:',
                    title.substring(0, 40)
                );
                return false;
            }

            // 🛡️ TRUST: Skip clickbait content
            if (InvisibleIntelligence.isClickbait(video.snippet.title)) {
                console.log(
                    '[TRUST] 🎣 Skipping clickbait:',
                    video.snippet.title.substring(0, 40)
                );
                return false;
            }

            return true;
        });

        // 🛡️ TRUST: Sort by channel trust score (prioritize trusted channels)
        musicVideos.sort((a, b) => {
            const trustA = InvisibleIntelligence.getChannelTrust(
                a.snippet.channelTitle
            );
            const trustB = InvisibleIntelligence.getChannelTrust(
                b.snippet.channelTitle
            );
            return trustB - trustA; // Higher trust first
        });

        const filterTime = (performance.now() - filterStart).toFixed(0);
        console.log(
            `[Vibe Shuffle] ⏱️ Filter: ${filterTime}ms (${musicVideos.length} different songs found)`
        );

        if (musicVideos.length === 0) {
            console.log(
                '[Vibe Shuffle] No suitable music found, fetching artist songs...'
            );
            // 🐛 FIX: Don't loop back! Get fresh songs instead
            playArtistMoreSongs();
            return;
        }

        // Detect current song's mood and apply psychological mood lifting
        const selectStart = performance.now();
        let selectedVideo = selectVibeAwareVideo(musicVideos);
        const selectTime = (performance.now() - selectStart).toFixed(0);
        console.log(
            `[Vibe Shuffle] ⏱️ Mood analysis & selection: ${selectTime}ms`
        );

        // Play the selected video
        const videoId = selectedVideo.id.videoId || selectedVideo.id;

        const totalTime = (performance.now() - startTime).toFixed(0);
        console.log(`[Vibe Shuffle] ✅ Total time: ${totalTime}ms`);
        console.log(
            `[Vibe Shuffle] 🎵 Playing: ${selectedVideo.snippet.title}`
        );

        // Track this video to prevent repeats
        lastPlayedVideoIds.push(videoId);
        if (lastPlayedVideoIds.length > 50) lastPlayedVideoIds.shift(); // Keep last 50 (was 20 - increased for better protection)

        // 🎵 Mark as played in cache
        const playedVibes = detectVibeKeywords(selectedVideo.snippet.title);
        const playedCategory =
            VibeCache.getCategory(playedVibes) || vibeCategory;
        VibeCache.markPlayed(playedCategory, videoId);

        playVideoById(videoId);
    } catch (error) {
        const totalTime = (performance.now() - startTime).toFixed(0);
        console.error(`[Vibe Shuffle] ❌ Error after ${totalTime}ms:`, error);
        // 🐛 FIX: Don't loop back! Get fresh songs instead
        console.log('[Vibe Shuffle] Error occurred, fetching artist songs...');
        playArtistMoreSongs();
    }
}

/**
 * 🔱 Fetch related videos - FREE API first, then YouTube fallback
 * Saves API quota by using Piped for related videos!
 * Also filters out same song different artist versions
 */
async function fetchRelatedVideos(videoId) {
    const currentTitle = currentSongData?.title || '';

    // 🔱 TRIDENT: Try FREE API first!
    if (
        typeof tridentRouter !== 'undefined' &&
        tridentRouter.fetchRelatedVideosFREE
    ) {
        try {
            console.log(
                '[Vibe Shuffle] 🔱 Using TRIDENT for FREE related videos...'
            );
            const freeResults = await tridentRouter.fetchRelatedVideosFREE(
                videoId,
                currentTitle
            );

            if (freeResults && freeResults.length >= 3) {
                console.log(
                    `[Vibe Shuffle] ✅ TRIDENT returned ${freeResults.length} related videos (FREE!)`
                );
                return freeResults;
            }
        } catch (e) {
            console.log(
                '[Vibe Shuffle] ⚠️ TRIDENT failed, falling back to YouTube:',
                e.message
            );
        }
    }

    // 📺 FALLBACK: YouTube API (costs 100 units)
    try {
        const API_KEY = CONFIG.getCurrentApiKey();
        if (!API_KEY) {
            console.log('[Vibe Shuffle] No API key available');
            return null;
        }

        // Use search with the current video title for related content
        // This works better than relatedToVideoId which is deprecated
        let searchQuery = extractMusicKeywords(currentTitle);

        // 🧠 INVISIBLE INTELLIGENCE: Boost search with preferred language
        // BUT respect current song's language - don't force Hindi on English songs!
        const currentLanguage = InvisibleIntelligence.detectLanguage(
            currentTitle,
            currentSongData?.channelTitle || ''
        );
        let searchBoost = '';

        // Only boost if current song matches user's preferred language
        if (currentLanguage === 'hindi' || currentLanguage === 'punjabi') {
            searchBoost = InvisibleIntelligence.getSearchBoost();
            if (searchBoost) {
                searchQuery = `${searchQuery} ${searchBoost}`;
                console.log(
                    `[Invisible Intelligence] 🎯 Search boosted with: ${searchBoost}`
                );
            }
        } else {
            // English/International song - don't add Hindi boost, let it flow naturally
            console.log(
                `[Invisible Intelligence] 🌍 International mode - no language boost`
            );
        }

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            searchQuery
        )}&type=video&videoCategoryId=10&maxResults=15&key=${API_KEY}`;

        console.log('[Vibe Shuffle] Fetching related (YouTube):', searchQuery);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('API Error: ' + response.status);
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('[Vibe Shuffle] Fetch error:', error);
        return null;
    }
}

/**
 * Extract music keywords from song title for better related search
 * 🧠 NEW: Uses Vibe Keyword Intelligence to find similar vibe songs!
 */
function extractMusicKeywords(title) {
    // First, check for vibe keywords in the title
    const detectedVibes = detectVibeKeywords(title);

    // If we detected meaningful vibes, use them for search!
    if (detectedVibes.length > 0) {
        // Pick a random search term from detected vibes
        const randomVibe =
            detectedVibes[Math.floor(Math.random() * detectedVibes.length)];
        const searchTerm =
            randomVibe.searchTerms[
                Math.floor(Math.random() * randomVibe.searchTerms.length)
            ];

        console.log(
            `[Vibe Keywords] 🎯 "${randomVibe.matchedWord}" detected as ${randomVibe.category}`
        );
        console.log(`[Vibe Keywords] 🔍 Searching: ${searchTerm}`);

        return searchTerm;
    }

    // Fallback to artist-based search
    let cleaned = title
        .replace(/\(official.*?\)/gi, '')
        .replace(/\[official.*?\]/gi, '')
        .replace(/official video/gi, '')
        .replace(/official audio/gi, '')
        .replace(/official music video/gi, '')
        .replace(/full video/gi, '')
        .replace(/lyrical video/gi, '')
        .replace(/lyrics?/gi, '')
        .replace(/hd|4k|1080p/gi, '')
        .replace(/\|.*$/g, '')
        .trim();

    // Try to extract artist name
    let artist = '';
    if (cleaned.includes(' - ')) {
        artist = cleaned.split(' - ')[1] || '';
    } else if (cleaned.includes(' by ')) {
        artist = cleaned.split(' by ')[1] || '';
    }

    artist = artist
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .trim();

    if (artist && artist.length > 2) {
        console.log('[Vibe Shuffle] Searching by artist:', artist);
        return artist + ' best songs';
    }

    // Final fallback
    const words = cleaned
        .split(' ')
        .filter((w) => w.length > 2)
        .slice(0, 2);
    const searchTerm = words.join(' ') + ' similar hindi songs';
    console.log('[Vibe Shuffle] Searching similar:', searchTerm);
    return searchTerm;
}

/**
 * Detect song mood from title
 */
function detectSongMood(title) {
    const lowerTitle = title.toLowerCase();

    // Sad indicators
    const sadWords = [
        'sad',
        'cry',
        'tears',
        'broken',
        'pain',
        'hurt',
        'alone',
        'lonely',
        'heartbreak',
        'miss you',
        'goodbye',
        'lost',
        'gone',
        'leave',
        'without you',
        'dard',
        'dil',
        'judai',
        'bewafa',
        'tanha',
        'alvida',
        'roya',
        'aansu',
    ];

    // Happy/Party indicators
    const happyWords = [
        'happy',
        'party',
        'dance',
        'celebration',
        'fun',
        'joy',
        'excited',
        'nachle',
        'party',
        'masti',
        'dhamaal',
        'badshah',
        'honey singh',
        'punjabi',
    ];

    // Love indicators
    const loveWords = [
        'love',
        'romance',
        'romantic',
        'pyaar',
        'ishq',
        'mohabbat',
        'valentine',
        'sweetheart',
        'darling',
        'janam',
        'sanam',
    ];

    // Chill indicators
    const chillWords = [
        'chill',
        'relax',
        'peaceful',
        'calm',
        'sleep',
        'night',
        'soft',
        'acoustic',
        'unplugged',
        'lofi',
        'sukoon',
    ];

    // Check each category
    for (const word of sadWords) {
        if (lowerTitle.includes(word)) return 'sad';
    }
    for (const word of happyWords) {
        if (lowerTitle.includes(word)) return 'happy';
    }
    for (const word of loveWords) {
        if (lowerTitle.includes(word)) return 'love';
    }
    for (const word of chillWords) {
        if (lowerTitle.includes(word)) return 'chill';
    }

    return 'neutral';
}

/**
 * Select video with psychological mood awareness
 * If user has been listening to too many sad songs, gently introduce happier vibes
 */
function selectVibeAwareVideo(videos) {
    // Detect current song mood and add to history
    const currentMood = detectSongMood(currentSongData?.title || '');
    vibeHistory.push(currentMood);
    if (vibeHistory.length > 10) vibeHistory.shift(); // Keep last 10

    // Count consecutive sad songs
    if (currentMood === 'sad') {
        consecutiveSadCount++;
    } else {
        consecutiveSadCount = 0;
    }

    console.log(
        '[Vibe Shuffle] Current mood:',
        currentMood,
        '| Sad streak:',
        consecutiveSadCount
    );

    // Psychological mood lifting: After 5 sad songs, start blending happier vibes
    if (consecutiveSadCount >= 5) {
        console.log(
            '[Vibe Shuffle] 🌈 Mood lifting activated - introducing positive vibes'
        );

        // Find a love or happy song to blend in
        const upliftingVideo = videos.find((v) => {
            const mood = detectSongMood(v.snippet.title);
            return mood === 'love' || mood === 'happy' || mood === 'chill';
        });

        if (upliftingVideo) {
            // Reduce sad count slowly (gradual transition)
            consecutiveSadCount = Math.max(0, consecutiveSadCount - 2);
            return upliftingVideo;
        }
    }

    // 🔬 QED HEART: Use quantum amplitude selection instead of random!
    // Like Feynman diagrams - each song has an amplitude, sum all paths, highest wins
    if (typeof QED_HEART !== 'undefined' && videos.length > 1) {
        console.log(
            '[Vibe Shuffle] 🔬 QED amplitude selection from',
            videos.length,
            'songs'
        );
        return QED_HEART.selectByAmplitude(videos);
    }

    // Fallback: Pick randomly from available songs
    const randomIndex = Math.floor(Math.random() * videos.length);
    console.log('[Vibe Shuffle] 🎲 Random pick from', videos.length, 'songs');
    return videos[randomIndex];
}

function playPrevious() {
    if (currentPlatform === 'youtube') {
        if (youtubeSearchResults.length > 0) {
            // Search results available - use them
            const prevIndex =
                currentSongIndex - 1 < 0
                    ? youtubeSearchResults.length - 1
                    : currentSongIndex - 1;
            playYouTubeSong(prevIndex);
        } else {
            // No search results (deep link/history play) - use play history!
            const history = JSON.parse(
                localStorage.getItem('playHistory') || '[]'
            );
            if (history.length > 1 && currentVideoId) {
                // Find current song in history and play previous one
                const currentIndex = history.findIndex(
                    (h) => h.videoId === currentVideoId
                );
                if (currentIndex > 0) {
                    const prevSong = history[currentIndex - 1];
                    console.log(
                        '[Previous] 📜 Playing from history:',
                        prevSong.title?.substring(0, 40)
                    );
                    playVideoById(
                        prevSong.videoId,
                        prevSong.title,
                        prevSong.channel,
                        prevSong.thumbnail
                    );
                } else if (history.length > 1) {
                    // Not in history or first item - play the last item from history
                    const prevSong = history[history.length - 1];
                    console.log(
                        '[Previous] 📜 Playing last from history:',
                        prevSong.title?.substring(0, 40)
                    );
                    playVideoById(
                        prevSong.videoId,
                        prevSong.title,
                        prevSong.channel,
                        prevSong.thumbnail
                    );
                }
            }
        }
    } else if (currentPlatform === 'local' && localFiles.length > 0) {
        const prevIndex =
            currentSongIndex - 1 < 0
                ? localFiles.length - 1
                : currentSongIndex - 1;
        playLocalFile(prevIndex);
    }
}

// Platform Switching
function switchPlatform(platform) {
    currentPlatform = platform;

    // Track platform switch
    if (typeof trackPlatformSwitch === 'function') {
        trackPlatformSwitch(platform);
    }

    // Update tabs
    document.querySelectorAll('.platform-tabs .nav-link').forEach((tab) => {
        tab.classList.remove('active');
    });
    document
        .querySelector(`[data-platform="${platform}"]`)
        .classList.add('active');

    // Update content
    document.getElementById('youtubeContent').style.display =
        platform === 'youtube' ? 'block' : 'none';
    document.getElementById('libraryContent').style.display =
        platform === 'library' ? 'block' : 'none';

    // Load library when switching to library tab
    if (platform === 'library') {
        displayLibrarySongs();
    }

    // Show Quick Picks when switching to YouTube tab
    if (platform === 'youtube') {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput || !searchInput.value.trim()) {
            displayQuickPicks();
        }
    }

    // Stop playback when switching
    if (platform === 'youtube' && audioPlayer) {
        audioPlayer.pause();
    } else if (platform === 'library' && player && player.pauseVideo) {
        player.pauseVideo();
    }
}

// UI Updates
function updateSongInfo(title, artist, thumbnail) {
    // Store actual song info for status message restoration
    actualSongTitle = title;
    actualSongArtist = artist;

    // Clear any status timeout and show actual song info
    if (statusTimeout) {
        clearTimeout(statusTimeout);
        statusTimeout = null;
    }

    // 📱 Mobile: Truncate long titles (30 chars max)
    let displayTitle = title;
    const isMobile = window.innerWidth <= 768;
    if (isMobile && title.length > 30) {
        displayTitle = title.substring(0, 30) + '...';
    }

    const titleElement = document.getElementById('currentSongTitle');
    titleElement.textContent = displayTitle;
    // Remove New Year celebration class when song plays
    titleElement.classList.remove('new-year-celebration');

    document.getElementById('currentSongArtist').textContent = artist;

    const albumArt = document.getElementById('albumArt');
    if (thumbnail && currentVideoId) {
        // 🎬 SMART THUMBNAIL: Smooth reveal like Vera chat!
        // Phase 1: Grayscale blur (mystery) → Phase 2: Less blur → Phase 3: Full color random frame!
        SmartThumbnail.startSmoothReveal(
            albumArt,
            currentVideoId,
            title,
            thumbnail
        );

        // Clean old cached frames (memory management)
        SmartThumbnail.clearOldFrames(currentVideoId);
    } else if (thumbnail) {
        albumArt.innerHTML = `<img src="${thumbnail}" alt="${title}">`;
    } else {
        albumArt.innerHTML = '<i class="bi bi-music-note-beamed"></i>';
    }

    // Update controls heart button state
    updateControlsHeartButton();
}

function updateActiveItem(listId, activeIndex) {
    const list = document.getElementById(listId);
    const items = list.querySelectorAll('.song-item');

    items.forEach((item, index) => {
        if (index === activeIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function updatePlayButton() {
    const playBtn = document.getElementById('playPauseBtn');
    if (isPlaying) {
        playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    } else {
        playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    }
}

function resetPlayer() {
    const titleElement = document.getElementById('currentSongTitle');

    // 🎵 Screen-size based welcome message
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        titleElement.textContent = 'Keep the vibe going...';
    } else {
        titleElement.textContent = 'Search it, Play it, Feel it...';
    }

    document.getElementById('currentSongArtist').textContent = isMobile
        ? 'Search your favorite song'
        : 'Keep the vibe going, Search your favorite song';
    document.getElementById('albumArt').innerHTML =
        '<i class="bi bi-music-note-beamed"></i>';
    document.getElementById('currentTime').textContent = '0:00';
    document.getElementById('totalTime').textContent = '0:00';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressSlider').value = 0;

    stopVinylAnimation();
    updatePlayButton();
    clearLyrics();

    // Reset telescopic tonearm to full length
    resetTelescopicTonearm();
}

function resetTelescopicTonearm() {
    const segment1 = document.querySelector('.arm-segment.segment-1');
    const segment2 = document.querySelector('.arm-segment.segment-2');
    const segment3 = document.querySelector('.arm-segment.segment-3');
    const tonearmHead = document.getElementById('tonearmHead');

    if (segment1) segment1.style.width = '100%';
    if (segment2) segment2.style.width = '75%';
    if (segment3) segment3.style.width = '50%';
    if (tonearmHead) tonearmHead.style.left = '-13px';
}

// 🎵 PIXEL PERFECT TONEARM SYSTEM v2.0
// The NEW approach:
// 1. Base = ALWAYS outside vinyl disc (never overlap)
// 2. Arm length = Distance from base to vinyl playing area
// 3. Head = ALWAYS on vinyl grooves (playing area)
// 4. Song progress = Head moves from outer to inner grooves
//
// Geometry:
// - Vinyl center is at (cx, cy) with radius r
// - Playing area = between 50% (label edge) and 90% (outer edge) of radius
// - Base positioned at vinyl right edge + gap
// - Arm rotates: -25deg (rest) → -5deg (playing)
// - When playing, arm points to vinyl grooves

// Store calculated values for progress updates
let tonearmGeometry = {
    vinylCenterX: 0,
    vinylCenterY: 0,
    vinylRadius: 0,
    baseX: 0,
    baseY: 0,
    armLength: 0,
    headExtension: 20, // Default, recalculated per screen
    outerGrooveRadius: 0.85, // 85% of vinyl = outer grooves (start)
    innerGrooveRadius: 0.52, // 52% of vinyl = inner grooves (end, near label)
    initialized: false,
};

function updateTonearmPosition() {
    const tonearm = document.getElementById('tonearm');
    const tonearmArm = document.getElementById('tonearmArm');
    const tonearmHead = document.getElementById('tonearmHead');
    const vinylDisc = document.getElementById('vinylDisc');
    const platter = document.querySelector('.turntable-platter');
    const playerArea = document.querySelector('.player-area');
    const vinylContainer = document.querySelector('.vinyl-container');

    if (!tonearm || !tonearmArm || !playerArea || !vinylContainer) return;

    // 🎯 ALWAYS use PLATTER for positioning (it's always visible)
    // VinylDisc can be off-screen (translateY: 150vh) before song loads
    const vinyl = platter;
    if (!vinyl) return;

    const vinylRect = vinyl.getBoundingClientRect();

    // Safety check: if vinyl not rendered yet
    if (vinylRect.width === 0 || vinylRect.height === 0) {
        console.log('[Tonearm] Waiting for vinyl to render...');
        setTimeout(updateTonearmPosition, 200);
        return;
    }

    const containerRect = vinylContainer.getBoundingClientRect();
    const playerRect = playerArea.getBoundingClientRect();

    const vinylRadius = vinylRect.width / 2;
    const vinylCenterX = vinylRect.left + vinylRadius - containerRect.left;
    const vinylCenterY = vinylRect.top + vinylRadius - containerRect.top;

    // 🎯 DEVICE DETECTION
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isLandscape = screenWidth > screenHeight;
    const isSmallMobile = screenWidth <= 480;
    const isMobile = screenWidth <= 768;
    const isTablet = screenWidth > 768 && screenWidth <= 1024;
    const isDesktop = screenWidth > 1024 && screenWidth <= 1920;
    const isUltrawide = screenWidth > 1920 && screenWidth <= 2560;
    const isTV = screenWidth > 2560;
    const isWidescreen = isLandscape && (isDesktop || isUltrawide || isTV);

    // 🎯 KEY INSIGHT: Tonearm base must be OUTSIDE the vinyl disc
    // On WIDESCREEN/LANDSCAPE - base stays FARTHER from disc (more elegant)
    // On MOBILE/TABLET/PORTRAIT - base stays CLOSER (compact view)
    let baseGap;
    if (isWidescreen) {
        // Wide screens - elegant spacing, base away from disc
        baseGap = isTV ? 60 : isUltrawide ? 50 : 40;
    } else if (isTablet) {
        baseGap = isLandscape ? 25 : 15;
    } else if (isMobile) {
        baseGap = isSmallMobile ? 8 : 12;
    } else {
        baseGap = 20;
    }

    // Base position = vinyl right edge + gap
    // This ensures base NEVER overlaps disc on any screen size
    const vinylRightEdge = vinylCenterX + vinylRadius;
    const baseXFromVinylCenter = vinylRightEdge + baseGap;

    // Base Y = same as vinyl center (vertically aligned)
    const baseYFromVinylCenter = vinylCenterY;

    // 🎯 CALCULATE ARM LENGTH
    // Arm needs to reach from base to the PLAYING area (outer grooves)
    // Playing area starts at ~85% of vinyl radius
    const outerGrooveX =
        vinylCenterX + vinylRadius * tonearmGeometry.outerGrooveRadius;

    // Distance from base to outer groove (horizontal, as arm is nearly horizontal when playing)
    // When arm is at -5deg (playing angle), we need to account for the angle
    const playingAngle = 5; // degrees when playing
    const angleRad = playingAngle * (Math.PI / 180);

    // Horizontal distance from base to target groove
    const horizontalDistance = baseXFromVinylCenter - outerGrooveX;

    // Arm length = horizontal distance / cos(angle) because arm is tilted
    let armLength = horizontalDistance / Math.cos(angleRad);

    // Add extra length for tonearm head (which extends beyond the arm end)
    let headExtension;
    if (isWidescreen) {
        headExtension = isTV ? 35 : isUltrawide ? 30 : 25;
    } else {
        headExtension = isSmallMobile ? 15 : isMobile ? 18 : 22;
    }
    armLength = armLength - headExtension; // Head adds this, so arm is shorter

    // 🎯 CLAMP ARM LENGTH for safety
    // On WIDESCREEN - allow much longer arms to reach from far base to vinyl
    let minArm, maxArm;
    if (isWidescreen) {
        minArm = isTV ? 250 : isUltrawide ? 200 : 150;
        maxArm = isTV ? 700 : isUltrawide ? 600 : 500;
    } else if (isTablet) {
        minArm = isLandscape ? 120 : 100;
        maxArm = isLandscape ? 350 : 300;
    } else if (isMobile) {
        minArm = isSmallMobile ? 60 : 80;
        maxArm = isSmallMobile ? 150 : 200;
    } else {
        minArm = 120;
        maxArm = 400;
    }

    armLength = Math.max(minArm, Math.min(maxArm, armLength));

    // 🎯 STORE GEOMETRY for progress-based updates
    tonearmGeometry.vinylCenterX = vinylCenterX;
    tonearmGeometry.vinylCenterY = vinylCenterY;
    tonearmGeometry.vinylRadius = vinylRadius;
    tonearmGeometry.baseX = baseXFromVinylCenter;
    tonearmGeometry.baseY = baseYFromVinylCenter;
    tonearmGeometry.armLength = armLength;
    tonearmGeometry.headExtension = headExtension;
    tonearmGeometry.initialized = true;

    // 🎯 APPLY STYLES
    // Position tonearm container so base aligns with calculated position
    // The CSS has .tonearm positioned with `right: Xpx` from vinyl-container
    // We need to set `right` so the base (which is at right:0 of tonearm-arm) lands at baseXFromVinylCenter

    const containerWidth = containerRect.width;
    const tonearmRightOffset = containerWidth - baseXFromVinylCenter;

    // Apply to tonearm
    tonearm.style.right = tonearmRightOffset + 'px';
    tonearm.style.top = baseYFromVinylCenter + 'px';
    tonearm.style.transform = tonearm.classList.contains('playing')
        ? 'translateY(-50%) rotate(-5deg)'
        : 'translateY(-50%) rotate(-25deg)';

    // Apply arm length
    tonearmArm.style.width = armLength + 'px';

    // 🎯 HEAD POSITION - At the left end of the arm (needle touches vinyl)
    if (tonearmHead) {
        // Head sits at the very end of arm - CSS default -13px is correct
        // Only override if needed for extreme screen sizes
        const headSize = tonearmHead.offsetWidth || 26;
        tonearmHead.style.left = -(headSize / 2) + 'px';
    }

    // Debug log
    console.log(
        '[Tonearm] 🎵 Pixel Perfect',
        `Screen: ${window.innerWidth}x${window.innerHeight}`,
        `| Landscape: ${isLandscape}`,
        `| Widescreen: ${isWidescreen}`,
        `| Vinyl: ${Math.round(vinylRect.width)}px`,
        `| Base gap: ${baseGap}px`,
        `| Arm: ${Math.round(armLength)}px`,
        `| Right offset: ${Math.round(tonearmRightOffset)}px`
    );
}

// Initialize and update tonearm on various events
function initDynamicTonearm() {
    // Initial calculation
    setTimeout(updateTonearmPosition, 100);

    // Recalculate after vinyl loads
    setTimeout(updateTonearmPosition, 500);
    setTimeout(updateTonearmPosition, 1000);

    // Update on window resize
    window.addEventListener('resize', debounce(updateTonearmPosition, 150));

    // Update on orientation change (mobile landscape/portrait)
    window.addEventListener('orientationchange', () => {
        setTimeout(updateTonearmPosition, 300);
        setTimeout(updateTonearmPosition, 600);
    });

    // Update on fullscreen change
    document.addEventListener('fullscreenchange', () => {
        setTimeout(updateTonearmPosition, 300);
    });

    // 🎯 REAL-TIME: Observe vinyl disc size changes
    const vinylDisc = document.getElementById('vinylDisc');
    if (vinylDisc && window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(updateTonearmPosition, 50);
        });
        resizeObserver.observe(vinylDisc);
    }
}

// Simple debounce helper
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

// 🔧 Track last known progress to prevent disappearing progress bar
let lastKnownProgress = 0;
let lastKnownDuration = 0;
let lastKnownCurrentTime = 0;

// Progress Updates - Fixed for stability (damdamdoe feedback Jan 2026)
function updateProgress() {
    try {
        // Get progress bar elements
        const progressBar = document.getElementById('progressBar');
        const progressSlider = document.getElementById('progressSlider');
        const currentTimeEl = document.getElementById('currentTime');
        const totalTimeEl = document.getElementById('totalTime');

        // Safety check for elements
        if (!progressBar || !progressSlider) {
            console.warn('[Progress] UI elements not found');
            return;
        }

        if (
            player &&
            typeof player.getCurrentTime === 'function' &&
            typeof player.getDuration === 'function'
        ) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();

            // Only update if we have valid values
            if (duration > 0 && !isNaN(currentTime) && !isNaN(duration)) {
                const progress = (currentTime / duration) * 100;

                // Store last known values
                lastKnownProgress = progress;
                lastKnownDuration = duration;
                lastKnownCurrentTime = currentTime;

                // Update UI
                progressBar.style.width = progress + '%';
                progressSlider.value = progress;

                if (currentTimeEl)
                    currentTimeEl.textContent = formatTime(currentTime);
                if (totalTimeEl) totalTimeEl.textContent = formatTime(duration);

                // Update telescopic tonearm
                updateTelescopicTonearm(progress);

                // 🎚️ CROSSFADE: Check if we should start fading to next song
                if (isPlaying && Crossfade.enabled) {
                    Crossfade.check(currentTime, duration);
                }
            } else if (lastKnownProgress > 0 && isPlaying) {
                // 🔧 FIX: During buffering/transitions, show last known progress
                progressBar.style.width = lastKnownProgress + '%';
                progressSlider.value = lastKnownProgress;
            }
        } else if (lastKnownProgress > 0 && isPlaying) {
            // 🔧 FIX: Player temporarily unavailable, maintain UI
            progressBar.style.width = lastKnownProgress + '%';
        }
    } catch (error) {
        console.warn('[Progress] Update error:', error.message);
    }
}

function updateLocalProgress() {
    if (audioPlayer.duration) {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;

        const progress = (currentTime / duration) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressSlider').value = progress;

        document.getElementById('currentTime').textContent =
            formatTime(currentTime);
        document.getElementById('totalTime').textContent = formatTime(duration);

        // Update telescopic tonearm
        updateTelescopicTonearm(progress);
    }
}

// 🎵 TELESCOPIC TONEARM - Needle moves from outer to inner grooves
// As song progresses (0% → 100%), needle moves from outer edge to inner (near label)
// This simulates real vinyl record playback!
function updateTelescopicTonearm(progress) {
    const segment1 = document.querySelector('.arm-segment.segment-1');
    const segment2 = document.querySelector('.arm-segment.segment-2');
    const segment3 = document.querySelector('.arm-segment.segment-3');
    const tonearmHead = document.getElementById('tonearmHead');
    const tonearmArm = document.getElementById('tonearmArm');

    if (!segment1 || !segment2 || !segment3 || !tonearmArm) return;
    if (!tonearmGeometry.initialized) return;

    // 🎯 NEEDLE TRAVEL
    // Song 0% = needle at outer grooves (85% of radius from center)
    // Song 100% = needle at inner grooves (52% of radius, near label)
    // Total travel = 33% of vinyl radius (from 85% to 52%)

    const outerGroove = tonearmGeometry.outerGrooveRadius; // 0.85
    const innerGroove = tonearmGeometry.innerGrooveRadius; // 0.52
    const travelRange = outerGroove - innerGroove; // 0.33

    // Current needle position (as fraction of radius from center)
    // At 0% progress = outer groove, at 100% = inner groove
    const currentGroovePosition = outerGroove - (progress / 100) * travelRange;

    // 🎯 CALCULATE ARM RETRACTION
    // The arm needs to be shorter as needle moves inward
    // At outer groove, arm is at full length
    // At inner groove, arm is shorter

    const baseArmLength = tonearmGeometry.armLength; // Full length (at outer groove)
    const retractionPercent = (progress / 100) * 0.25; // Max 25% retraction at song end

    // Each segment retracts proportionally
    const seg1Width = 100 - retractionPercent * 100;
    const seg2Width = 75 - retractionPercent * 70;
    const seg3Width = 50 - retractionPercent * 50;

    segment1.style.width = Math.max(70, seg1Width) + '%';
    segment2.style.width = Math.max(50, seg2Width) + '%';
    segment3.style.width = Math.max(35, seg3Width) + '%';

    // 🎯 HEAD POSITION - Moves with retraction
    if (tonearmHead) {
        // Head offset from arm end (uses stored value from geometry calculation)
        const baseOffset = -(tonearmGeometry.headExtension / 2);

        // Head moves inward as arm retracts
        const headTravel = baseArmLength * retractionPercent * 0.3;
        const headOffset = baseOffset + headTravel;

        tonearmHead.style.left = headOffset + 'px';
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// Vinyl Animation - Called when song actually PLAYS
function startVinylAnimation() {
    const vinylDisc = document.getElementById('vinylDisc');
    const tonearm = document.getElementById('tonearm');

    if (vinylDisc && tonearm) {
        // Start spinning immediately when song plays
        vinylDisc.classList.add('spinning');
        tonearm.classList.add('playing');

        // Update tonearm arm length for current viewport
        updateTonearmPosition();
    }
}

function stopVinylAnimation() {
    const vinylDisc = document.getElementById('vinylDisc');
    const tonearm = document.getElementById('tonearm');

    if (vinylDisc) vinylDisc.classList.remove('spinning');
    if (tonearm) tonearm.classList.remove('playing');
    // CSS handles the rest angle transition
}

// Fullscreen Mode
function toggleFullscreen() {
    const appScreen = document.getElementById('appScreen');

    if (!document.fullscreenElement) {
        appScreen.classList.add('fullscreen-mode');
        if (appScreen.requestFullscreen) {
            appScreen.requestFullscreen();
        } else if (appScreen.webkitRequestFullscreen) {
            appScreen.webkitRequestFullscreen();
        } else if (appScreen.mozRequestFullScreen) {
            appScreen.mozRequestFullScreen();
        }
        // Update tonearm for fullscreen vinyl size
        setTimeout(updateTonearmPosition, 300);
    } else {
        appScreen.classList.remove('fullscreen-mode');
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        // Update tonearm back to normal size
        setTimeout(updateTonearmPosition, 300);
    }
}

document.addEventListener('fullscreenchange', function () {
    const appScreen = document.getElementById('appScreen');
    if (!document.fullscreenElement) {
        appScreen.classList.remove('fullscreen-mode');
    }
});

// Mobile Sliding Search Functions
let mobileSearchOpen = false;

function openMobileSearch() {
    // 🎯 NEW: Direct to sidebar with search focused (1 less screen!)
    const sidebar = document.getElementById('sidebar');
    const mainSearchInput = document.getElementById('searchInput');

    // Open sidebar
    sidebar.classList.add('show');
    mobileSearchOpen = true;

    // Switch to Discover Records tab (YouTube)
    if (typeof switchPlatform === 'function') {
        switchPlatform('youtube');
    }

    // Focus on search input with keyboard
    setTimeout(() => {
        if (mainSearchInput) {
            mainSearchInput.focus();
            // Scroll to top so search box is visible
            mainSearchInput.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, 150);
}

function closeMobileSearch() {
    const slidingSearch = document.getElementById('mobileSlidingSearch');
    const searchInput = document.getElementById('mobileSlideSearchInput');
    const appScreen = document.getElementById('appScreen');
    const sidebar = document.getElementById('sidebar');

    // Close sliding search if open
    if (slidingSearch) {
        slidingSearch.classList.remove('show');
    }
    appScreen.classList.remove('search-active');
    mobileSearchOpen = false;

    // Close sidebar
    if (sidebar) {
        sidebar.classList.remove('show');
    }

    if (searchInput) {
        searchInput.blur();
    }
}

function closeMobileSearchToPlayer() {
    closeMobileSearch();

    // Close sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
    }

    // Scroll to top to show player
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile Profile Menu Functions
function toggleMobileProfileMenu() {
    const profileMenu = document.getElementById('mobileProfileMenu');
    profileMenu.classList.toggle('show');
}

function closeMobileProfileMenu() {
    const profileMenu = document.getElementById('mobileProfileMenu');
    profileMenu.classList.remove('show');
}

// 📲 TRIGGER PWA INSTALL - From our custom button!
// "Ek click mein ghar mil jaaye!" 🏠
async function triggerPWAInstall() {
    closeMobileProfileMenu();

    // Check if we have the deferred prompt
    if (!deferredInstallPrompt) {
        // Fallback for Safari/iOS - show manual instructions
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
        );

        if (isIOS || isSafari) {
            showToast('📱 Tap Share button → "Add to Home Screen"', 5000);
            console.log('[PWA] 🍎 iOS/Safari - Manual install required');
        } else {
            showToast('App already installed or not supported 🤔');
            console.log('[PWA] ⚠️ No install prompt available');
        }
        return;
    }

    try {
        // Show the browser's install prompt
        deferredInstallPrompt.prompt();

        // Wait for user's choice
        const { outcome } = await deferredInstallPrompt.userChoice;

        console.log(`[PWA] 📲 User response: ${outcome}`);

        if (outcome === 'accepted') {
            showToast('🎉 Installing... Check your home screen!');

            // Track install in analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_install', {
                    event_category: 'engagement',
                    event_label: 'accepted',
                });
            }
        } else {
            showToast('No problem! You can install anytime 😊');
        }

        // Clear the prompt - can only be used once
        deferredInstallPrompt = null;

        // Hide our install button
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('[PWA] ❌ Install error:', error);
        showToast('Something went wrong. Try again later.');
    }
}

// Scroll listener for auto-showing search (80px threshold)
let lastScrollY = 0;
function initMobileScrollSearch() {
    const playerArea = document.querySelector('.player-area');
    const sidebar = document.getElementById('sidebar');

    // Listen on multiple scroll containers
    [window, playerArea, sidebar].forEach((element) => {
        if (element) {
            element.addEventListener('scroll', handleMobileScroll, {
                passive: true,
            });
        }
    });
}

function handleMobileScroll() {
    // Only on mobile
    if (window.innerWidth > 768) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const sidebar = document.getElementById('sidebar');
    const sidebarScrollTop = sidebar ? sidebar.scrollTop : 0;

    // Use whichever has more scroll
    const effectiveScroll = Math.max(scrollY, sidebarScrollTop);

    if (effectiveScroll > 80 && !mobileSearchOpen) {
        openMobileSearch();
    } else if (effectiveScroll <= 80 && mobileSearchOpen) {
        closeMobileSearch();
    }

    lastScrollY = effectiveScroll;
}

// Close profile menu when clicking outside
document.addEventListener('click', function (e) {
    const profileMenu = document.getElementById('mobileProfileMenu');
    const profileIcon = document.querySelector('.mobile-profile-icon');

    if (profileMenu && profileMenu.classList.contains('show')) {
        if (
            !profileMenu.contains(e.target) &&
            !profileIcon.contains(e.target)
        ) {
            closeMobileProfileMenu();
        }
    }
});

// Initialize mobile scroll search on DOM ready
document.addEventListener('DOMContentLoaded', initMobileScrollSearch);

// Sliding Search Function (new mobile search)
async function performSlideSearch() {
    const query = document
        .getElementById('mobileSlideSearchInput')
        .value.trim();
    if (!query) return;

    // Close the sliding search
    closeMobileSearch();

    // Open sidebar to show results
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add('show');

    // Switch to YouTube tab
    if (typeof switchPlatform === 'function') {
        switchPlatform('youtube');
    }

    // Use the main search input and trigger search
    const mainSearchInput = document.getElementById('searchInput');
    if (mainSearchInput) {
        mainSearchInput.value = query;
    }

    // Perform the search using main search function
    if (typeof searchYouTube === 'function') {
        const songList = document.getElementById('songList');
        songList.innerHTML =
            '<div class="loading"><i class="bi bi-hourglass-split"></i><p>Searching...</p></div>';

        try {
            const results = await searchYouTube(query);
            displayYouTubeResults(results);
        } catch (error) {
            console.error('Slide search error:', error);
            songList.innerHTML =
                '<div class="error-message"><i class="bi bi-exclamation-triangle"></i><p>Search failed</p></div>';
        }
    }

    // Clear the slide search input
    document.getElementById('mobileSlideSearchInput').value = '';
}

// Legacy Mobile Functions (kept for compatibility)
function toggleMobileSearch() {
    const mobileSearchModal = document.getElementById('mobileSearchModal');
    if (mobileSearchModal) {
        mobileSearchModal.classList.toggle('show');
    }
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}

async function performMobileSearch() {
    const query = document.getElementById('mobileSearchInput').value.trim();
    if (!query) return;

    // Switch to YouTube tab to show search results (with safety check)
    if (typeof switchPlatform === 'function') {
        switchPlatform('youtube');
    }

    const mobileSongList = document.getElementById('mobileSongList');
    mobileSongList.innerHTML =
        '<div class="loading"><i class="bi bi-heart-pulse"></i><p>HEART Syncing your vibe...</p></div>';

    try {
        const results = await searchYouTube(query);
        displayMobileYouTubeResults(results);
    } catch (error) {
        console.error('Mobile search error:', error);
        mobileSongList.innerHTML =
            '<div class="error-message"><i class="bi bi-exclamation-triangle"></i><p>Failed to search. ' +
            error.message +
            '</p></div>';
    }
}

function displayMobileYouTubeResults(results) {
    youtubeSearchResults = results;
    const mobileSongList = document.getElementById('mobileSongList');

    if (results.length === 0) {
        mobileSongList.innerHTML =
            '<div class="error-message"><p>No results found</p></div>';
        return;
    }

    mobileSongList.innerHTML = '';

    results.forEach((item, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.onclick = () => {
            playYouTubeSong(index);
            toggleMobileSearch(); // Close modal after selection
        };

        const thumbnail = item.snippet.thumbnails.default.url;
        const title = decodeHtmlEntities(item.snippet.title);
        const channel = decodeHtmlEntities(item.snippet.channelTitle);

        songItem.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <div class="song-item-info">
                <div class="song-item-title">${title}</div>
                <div class="song-item-artist">${channel}</div>
            </div>
        `;

        mobileSongList.appendChild(songItem);
    });
}

// Mute Function
function toggleMute() {
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');

    if (isMuted) {
        // Unmute
        isMuted = false;
        volumeSlider.value = previousVolume;

        if (currentPlatform === 'youtube' && player && player.setVolume) {
            player.setVolume(previousVolume);
        }
        if (audioPlayer) {
            audioPlayer.volume = previousVolume / 100;
        }

        muteBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
        muteBtn.classList.remove('muted');
    } else {
        // Mute
        isMuted = true;
        previousVolume = volumeSlider.value;
        volumeSlider.value = 0;

        if (currentPlatform === 'youtube' && player && player.setVolume) {
            player.setVolume(0);
        }
        if (audioPlayer) {
            audioPlayer.volume = 0;
        }

        muteBtn.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        muteBtn.classList.add('muted');
    }
}

// Share Function - Enhanced for Mobile with Platform Selection
function shareSong() {
    const songTitle = document.getElementById('currentSongTitle').textContent;
    const songArtist = document.getElementById('currentSongArtist').textContent;

    if (songTitle === 'No song playing') {
        showStatus('Play a song first', 2000);
        return;
    }

    // Generate deep link URL - SHORT and CLEAN for sharing!
    // Analytics tracked via referrer on server, not UTM clutter
    let shareUrl = 'https://play.creativepixels.in/';

    if (currentPlatform === 'youtube' && currentVideoId) {
        // 🎯 SHORT URL: Just video ID, no UTM spam
        shareUrl += `?v=${currentVideoId}`;
    } else if (currentPlatform === 'local') {
        // For local files, share the base URL with song name as query
        shareUrl += `?q=${encodeURIComponent(songTitle)}`;
    }

    // 🎨 Rotate banner for OG meta tag (for WhatsApp/social preview)
    rotateBannerForShare();

    // 📱 Mobile: Show platform selection bottom sheet
    const isMobile =
        window.innerWidth <= 768 ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
        showShareBottomSheet(shareUrl, songTitle, songArtist);
    } else {
        // Desktop: Direct copy to clipboard
        copyToClipboard(shareUrl);
    }
}

// 📱 Mobile Share Bottom Sheet with Platform Options
function showShareBottomSheet(shareUrl, songTitle, songArtist) {
    // Remove existing sheet if any
    const existing = document.querySelector('.share-bottom-sheet');
    if (existing) existing.remove();

    // Get album art URL for share image
    const albumArt = document.querySelector('.album-art img');
    const artUrl = albumArt
        ? albumArt.src
        : 'https://play.creativepixels.in/PixelPlayLogo-White.svg';

    const sheet = document.createElement('div');
    sheet.className = 'share-bottom-sheet';
    sheet.innerHTML = `
        <div class="share-sheet-backdrop"></div>
        <div class="share-sheet-content">
            <div class="share-sheet-handle"></div>
            <div class="share-sheet-header">
                <img src="${artUrl}" alt="Album Art" class="share-song-thumb" onerror="this.src='PixelPlayLogo-White.svg'">
                <div class="share-song-info">
                    <div class="share-song-title">${songTitle}</div>
                    <div class="share-song-artist">${songArtist}</div>
                </div>
            </div>
            <div class="share-sheet-options">
                <button class="share-option" data-platform="instagram">
                    <i class="bi bi-instagram"></i>
                    <span>Instagram Story</span>
                </button>
                <button class="share-option" data-platform="whatsapp">
                    <i class="bi bi-whatsapp"></i>
                    <span>WhatsApp</span>
                </button>
                <button class="share-option" data-platform="telegram">
                    <i class="bi bi-telegram"></i>
                    <span>Telegram</span>
                </button>
                <button class="share-option" data-platform="twitter">
                    <i class="bi bi-twitter-x"></i>
                    <span>X / Twitter</span>
                </button>
                <button class="share-option" data-platform="copy">
                    <i class="bi bi-link-45deg"></i>
                    <span>Copy Link</span>
                </button>
                <button class="share-option" data-platform="more">
                    <i class="bi bi-three-dots"></i>
                    <span>More</span>
                </button>
            </div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.id = 'share-sheet-styles';
    if (!document.getElementById('share-sheet-styles')) {
        style.textContent = `
            .share-bottom-sheet {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: flex-end;
            }
            .share-sheet-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                animation: fadeIn 0.2s ease;
            }
            .share-sheet-content {
                position: relative;
                width: 100%;
                background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
                border-radius: 20px 20px 0 0;
                padding: 0.75rem 1.5rem 2rem;
                transform: translateY(100%);
                animation: slideUpSheet 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            @keyframes slideUpSheet {
                to { transform: translateY(0); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .share-sheet-handle {
                width: 40px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                margin: 0 auto 1rem;
            }
            .share-sheet-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding-bottom: 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 1rem;
            }
            .share-song-thumb {
                width: 50px;
                height: 50px;
                border-radius: 8px;
                object-fit: cover;
            }
            .share-song-info {
                flex: 1;
                min-width: 0;
            }
            .share-song-title {
                color: #fff;
                font-size: 1rem;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .share-song-artist {
                color: rgba(255, 255, 255, 0.6);
                font-size: 0.85rem;
            }
            .share-sheet-options {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }
            .share-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 16px 8px;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #fff;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .share-option:hover, .share-option:active {
                background: rgba(255, 255, 255, 0.15);
                transform: scale(0.98);
            }
            .share-option i {
                font-size: 1.5rem;
            }
            .share-option span {
                font-size: 0.75rem;
                opacity: 0.9;
            }
            .share-option i { color: rgba(255, 255, 255, 0.9); }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(sheet);

    // Handle backdrop click to close
    sheet
        .querySelector('.share-sheet-backdrop')
        .addEventListener('click', () => {
            closeShareSheet(sheet);
        });

    // Handle platform selection
    sheet.querySelectorAll('.share-option').forEach((btn) => {
        btn.addEventListener('click', () => {
            const platform = btn.dataset.platform;
            handleSharePlatform(
                platform,
                shareUrl,
                songTitle,
                songArtist,
                artUrl
            );
            closeShareSheet(sheet);
        });
    });
}

// Close share sheet with animation
function closeShareSheet(sheet) {
    const content = sheet.querySelector('.share-sheet-content');
    const backdrop = sheet.querySelector('.share-sheet-backdrop');

    content.style.animation = 'slideDownSheet 0.25s ease forwards';
    backdrop.style.animation = 'fadeOut 0.25s ease forwards';

    // Add the close animations
    const closeStyle = document.createElement('style');
    closeStyle.textContent = `
        @keyframes slideDownSheet { to { transform: translateY(100%); } }
        @keyframes fadeOut { to { opacity: 0; } }
    `;
    document.head.appendChild(closeStyle);

    setTimeout(() => {
        sheet.remove();
        closeStyle.remove();
    }, 250);
}

// Handle share to specific platform
function handleSharePlatform(
    platform,
    shareUrl,
    songTitle,
    songArtist,
    artUrl
) {
    const shareText = `${songTitle} - ${songArtist} | Listen free on Pixel Play`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (platform) {
        case 'instagram':
            // Copy link first
            copyToClipboard(shareUrl);

            // Generate story image and try to share directly to Instagram
            generateStoryImageAndShare(songTitle, songArtist, artUrl, shareUrl);
            break;

        case 'whatsapp':
            // WhatsApp share with text and link
            window.open(
                `https://wa.me/?text=${encodedText}%0A${encodedUrl}`,
                '_blank'
            );
            break;

        case 'telegram':
            // Telegram share
            window.open(
                `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
                '_blank'
            );
            break;

        case 'twitter':
            // X/Twitter share
            window.open(
                `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
                '_blank'
            );
            break;

        case 'copy':
            copyToClipboard(shareUrl);
            break;

        case 'more':
            // Use native share if available
            if (navigator.share) {
                navigator
                    .share({
                        title: songTitle,
                        text: `${songTitle} - ${songArtist} | Pixel Play`,
                        url: shareUrl,
                    })
                    .catch(() => copyToClipboard(shareUrl));
            } else {
                copyToClipboard(shareUrl);
            }
            break;
    }
}

// Generate Enhanced Story Image for Instagram
async function generateStoryImageAndShare(
    songTitle,
    songArtist,
    artUrl,
    shareUrl
) {
    try {
        // Create canvas for story image (9:16 ratio for Instagram Stories)
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');

        // ===== BACKGROUND =====
        // Rich dark gradient (Pixel Play aesthetic)
        const bgGradient = ctx.createRadialGradient(
            540,
            500,
            100,
            540,
            960,
            900
        );
        bgGradient.addColorStop(0, '#2d2d2d');
        bgGradient.addColorStop(0.5, '#1a1a1a');
        bgGradient.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, 1080, 1920);

        // Subtle scanlines effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        for (let i = 0; i < 1920; i += 3) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(1080, i);
            ctx.stroke();
        }

        // ===== TOP CORNER - PIXEL PLAY BRANDING =====
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '600 28px "Roboto", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Pixel Play', 50, 70);

        // Small vinyl icon next to logo
        ctx.beginPath();
        ctx.arc(200, 62, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(200, 62, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // ===== VINYL DISC - TOP 40% AREA (Enhanced) =====
        const centerX = 540;
        const discCenterY = 420; // Positioned in top 40%
        const vinylRadius = 320; // Bigger, more prominent

        // Vinyl shadow (depth effect)
        ctx.beginPath();
        ctx.arc(
            centerX + 15,
            discCenterY + 15,
            vinylRadius + 20,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();

        // Outer vinyl edge (shiny rim)
        const rimGradient = ctx.createRadialGradient(
            centerX - 50,
            discCenterY - 50,
            vinylRadius - 30,
            centerX,
            discCenterY,
            vinylRadius + 25
        );
        rimGradient.addColorStop(0, '#1a1a1a');
        rimGradient.addColorStop(0.8, '#0a0a0a');
        rimGradient.addColorStop(0.95, '#333');
        rimGradient.addColorStop(1, '#1a1a1a');
        ctx.beginPath();
        ctx.arc(centerX, discCenterY, vinylRadius + 20, 0, Math.PI * 2);
        ctx.fillStyle = rimGradient;
        ctx.fill();

        // Vinyl main body
        ctx.beginPath();
        ctx.arc(centerX, discCenterY, vinylRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f0f0f';
        ctx.fill();

        // Enhanced vinyl grooves (realistic)
        for (let r = vinylRadius - 10; r > 130; r -= 6) {
            ctx.beginPath();
            ctx.arc(centerX, discCenterY, r, 0, Math.PI * 2);
            const grooveAlpha = 0.15 + Math.random() * 0.1;
            ctx.strokeStyle = `rgba(60, 60, 60, ${grooveAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Light reflection on vinyl (sheen)
        ctx.beginPath();
        ctx.arc(centerX, discCenterY, vinylRadius, -0.5, 0.8);
        const sheenGradient = ctx.createLinearGradient(200, 200, 700, 600);
        sheenGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        sheenGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
        sheenGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = sheenGradient;
        ctx.lineWidth = 40;
        ctx.stroke();

        // Album art label (center)
        const labelRadius = 120;
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = artUrl;
            });

            // Label background
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, discCenterY, labelRadius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
                img,
                centerX - labelRadius,
                discCenterY - labelRadius,
                labelRadius * 2,
                labelRadius * 2
            );
            ctx.restore();

            // Label ring
            ctx.beginPath();
            ctx.arc(centerX, discCenterY, labelRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        } catch {
            // Fallback label
            ctx.beginPath();
            ctx.arc(centerX, discCenterY, labelRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#2a2a2a';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Center spindle hole
        ctx.beginPath();
        ctx.arc(centerX, discCenterY, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, discCenterY, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // ===== LISTENING TEXT =====
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'italic 32px "Playfair Display", serif';
        ctx.fillText('Listening...', centerX, 830);

        // ===== SONG TITLE (H2 - Big & Bold) =====
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 58px "Roboto", sans-serif';
        const truncTitle =
            songTitle.length > 24
                ? songTitle.substring(0, 24) + '...'
                : songTitle;
        ctx.fillText(truncTitle, centerX, 920);

        // ===== ARTIST NAME (H4 - Smaller) =====
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '36px "Roboto", sans-serif';
        ctx.fillText(songArtist, centerX, 980);

        // ===== TAGLINES =====
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '28px "Roboto", sans-serif';
        ctx.fillText('Listen free on Pixel Play', centerX, 1070);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'italic 26px "Playfair Display", serif';
        ctx.fillText('join in the vibe', centerX, 1115);

        // ===== QUICK GUIDE BOX (Small - User covers with Link Sticker) =====
        const boxY = 1200;
        const boxWidth = 700;
        const boxHeight = 180;
        const boxX = (1080 - boxWidth) / 2;

        // Box background (subtle)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Dashed border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        ctx.setLineDash([]);

        // Guide text - compact
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '24px "Roboto", sans-serif';
        ctx.fillText('Place your LINK STICKER here', centerX, boxY + 50);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '20px "Roboto", sans-serif';
        ctx.fillText('Tap "Add Link" sticker in Instagram', centerX, boxY + 90);
        ctx.fillText('Paste the copied link', centerX, boxY + 120);

        // Small arrow pointing down
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '32px "Roboto", sans-serif';
        ctx.fillText('Link copied to clipboard', centerX, boxY + 160);

        // ===== BOTTOM BRANDING =====
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '22px "Roboto", sans-serif';
        ctx.fillText('play.creativepixels.in', centerX, 1850);

        // Convert to blob and share
        canvas.toBlob(async (blob) => {
            const file = new File([blob], `PixelPlay_Story.png`, {
                type: 'image/png',
            });

            // Try Web Share API with files (works on some mobile browsers)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: songTitle,
                        text: `${songTitle} - ${songArtist}`,
                    });
                    showToast('Shared! Add Link sticker and paste URL');
                    return;
                } catch (err) {
                    console.log('[Share] Web Share cancelled or failed:', err);
                }
            }

            // Fallback: Download the image
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PixelPlay_${songTitle.replace(
                /[^a-zA-Z0-9]/g,
                '_'
            )}.png`;
            a.click();
            URL.revokeObjectURL(url);

            showToast('Image saved! Upload to Story, add Link sticker');
        }, 'image/png');
    } catch (error) {
        console.log('[Share] Story image generation failed:', error);
        showToast('Link copied! Share on Instagram Story');
    }
}

// Helper: Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                showToast('Link copied! Paste anywhere to share');
                console.log('Share URL copied:', text);
            })
            .catch((error) => {
                console.log('Clipboard error:', error);
                fallbackCopy(text);
            });
    } else {
        fallbackCopy(text);
    }
}

// Fallback copy for older browsers
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast('Link copied! Paste anywhere to share');
    } catch (err) {
        showStatus('Copy failed', 2000);
    }
    document.body.removeChild(textArea);
}

// 🎧 REAL LISTENING TIME - Send to Google Analytics 4
function sendListeningTimeToGA4() {
    const sessionDuration = (Date.now() - listeningSession.sessionStart) / 1000; // seconds

    // Send custom event to GA4
    if (typeof gtag === 'function') {
        gtag('event', 'actual_listening_time', {
            total_seconds: Math.round(listeningSession.totalListenedTime),
            songs_played: listeningSession.songsPlayed,
            session_duration_seconds: Math.round(sessionDuration),
            avg_per_song:
                listeningSession.songsPlayed > 0
                    ? Math.round(
                          listeningSession.totalListenedTime /
                              listeningSession.songsPlayed
                      )
                    : 0,
        });
        console.log(
            '[Listening] 📊 Sent to GA4: ' +
                Math.round(listeningSession.totalListenedTime) +
                's across ' +
                listeningSession.songsPlayed +
                ' songs'
        );
    }
}

// Send listening time when user leaves page
window.addEventListener('beforeunload', function () {
    // Capture any remaining listening time
    if (listeningSession.startTime > 0) {
        listeningSession.totalListenedTime +=
            (Date.now() - listeningSession.startTime) / 1000;
    }

    if (listeningSession.totalListenedTime > 0) {
        sendListeningTimeToGA4();
        console.log(
            '[Listening] 👋 Final session: ' +
                listeningSession.totalListenedTime.toFixed(1) +
                's, ' +
                listeningSession.songsPlayed +
                ' songs'
        );
    }
});

// Toast notification for share feedback
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(40, 40, 40, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        padding: 12px 24px;
        border-radius: 30px;
        font-size: 0.95rem;
        z-index: 9999;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    `;

    document.body.appendChild(toast);

    // Auto remove after 2.5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ===== ROTATING SHARE BANNER SYSTEM =====
// Like API key rotation - cycles through banners for social sharing

/**
 * Rotate to next banner for share
 * Cycles 001 → 012, tries all extensions (jpeg, jpg, png, webp)
 * Gen-Z designers send any format! 😄
 */
function rotateBannerForShare() {
    // Increment index (wraps around after 12)
    SHARE_BANNER_CONFIG.currentIndex++;
    if (SHARE_BANNER_CONFIG.currentIndex > SHARE_BANNER_CONFIG.maxBanners) {
        SHARE_BANNER_CONFIG.currentIndex = 1;
    }

    const bannerNumber = String(SHARE_BANNER_CONFIG.currentIndex).padStart(
        3,
        '0'
    );

    // Check if we already know the extension for this banner
    if (SHARE_BANNER_CONFIG.cachedBanners.has(bannerNumber)) {
        const cachedUrl = SHARE_BANNER_CONFIG.cachedBanners.get(bannerNumber);
        updateOGBanner(cachedUrl);
        console.log(
            `[ShareBanner] 🎨 Rotated to banner ${bannerNumber} (cached)`
        );
        return;
    }

    // Try all extensions to find the banner
    findBannerWithAnyExtension(bannerNumber).then((foundUrl) => {
        if (foundUrl) {
            updateOGBanner(foundUrl);
            SHARE_BANNER_CONFIG.cachedBanners.set(bannerNumber, foundUrl);
            console.log(`[ShareBanner] 🎨 Rotated to banner ${bannerNumber}`);
        } else {
            // Banner doesn't exist, reset to 001
            console.log(
                `[ShareBanner] Banner ${bannerNumber} not found, using 001`
            );
            SHARE_BANNER_CONFIG.currentIndex = 1;
            findBannerWithAnyExtension('001').then((fallbackUrl) => {
                if (fallbackUrl) {
                    updateOGBanner(fallbackUrl);
                    SHARE_BANNER_CONFIG.cachedBanners.set('001', fallbackUrl);
                }
            });
        }
    });
}

/**
 * Find banner by trying all supported extensions
 * Returns first URL that works (jpeg, jpg, png, webp)
 */
function findBannerWithAnyExtension(bannerNumber) {
    return new Promise((resolve) => {
        const baseUrl = `https://play.creativepixels.in/${SHARE_BANNER_CONFIG.basePath}${bannerNumber}`;
        const extensions = SHARE_BANNER_CONFIG.extensions;
        let checked = 0;
        let found = false;

        extensions.forEach((ext) => {
            const url = baseUrl + ext;
            checkBannerExists(url).then((exists) => {
                checked++;
                if (exists && !found) {
                    found = true;
                    resolve(url);
                } else if (checked === extensions.length && !found) {
                    resolve(null);
                }
            });
        });
    });
}

/**
 * Check if banner image exists
 */
function checkBannerExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

/**
 * Update OG meta tag for social preview
 */
function updateOGBanner(bannerUrl) {
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', bannerUrl);

    // Also update Twitter card image
    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (!twitterImage) {
        twitterImage = document.createElement('meta');
        twitterImage.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImage);
    }
    twitterImage.setAttribute('content', bannerUrl);
}

/**
 * Cache banner image for faster loading
 * Preloads in user's browser cache
 */
function cacheBannerForSpeed(url, bannerNumber) {
    if (SHARE_BANNER_CONFIG.cachedBanners.has(bannerNumber)) {
        return; // Already cached
    }

    // Preload the image
    const img = new Image();
    img.src = url;
    SHARE_BANNER_CONFIG.cachedBanners.set(bannerNumber, url);
}

/**
 * Preload all available banners on app start
 * Stops when first missing banner is found (no more 404 spam!)
 */
function preloadShareBanners() {
    console.log('[ShareBanner] 🖼️ Preloading share banners...');

    // Start with banner 001 and go sequentially
    preloadBannerSequentially(1);
}

/**
 * Preload banners one by one, stop when not found
 */
function preloadBannerSequentially(index) {
    if (index > SHARE_BANNER_CONFIG.maxBanners) {
        console.log('[ShareBanner] ✅ Preload complete!');
        return;
    }

    const bannerNumber = String(index).padStart(3, '0');

    // Try just .jpeg first (most common)
    const jpegUrl = `https://play.creativepixels.in/${SHARE_BANNER_CONFIG.basePath}${bannerNumber}.jpeg`;

    checkBannerExists(jpegUrl).then((exists) => {
        if (exists) {
            SHARE_BANNER_CONFIG.cachedBanners.set(bannerNumber, jpegUrl);
            console.log(`[ShareBanner] ✓ Banner ${bannerNumber} cached`);
            // Continue to next
            preloadBannerSequentially(index + 1);
        } else {
            // Try other formats before giving up
            tryOtherFormats(bannerNumber, index);
        }
    });
}

/**
 * Try other image formats if jpeg not found
 */
function tryOtherFormats(bannerNumber, index) {
    const formats = ['.jpg', '.png', '.webp'];
    let found = false;
    let checked = 0;

    formats.forEach((ext) => {
        const url = `https://play.creativepixels.in/${SHARE_BANNER_CONFIG.basePath}${bannerNumber}${ext}`;
        checkBannerExists(url).then((exists) => {
            checked++;
            if (exists && !found) {
                found = true;
                SHARE_BANNER_CONFIG.cachedBanners.set(bannerNumber, url);
                console.log(
                    `[ShareBanner] ✓ Banner ${bannerNumber}${ext} cached`
                );
                preloadBannerSequentially(index + 1);
            } else if (checked === formats.length && !found) {
                // No more banners found, stop here
                console.log(
                    `[ShareBanner] ✅ Found ${SHARE_BANNER_CONFIG.cachedBanners.size} banners total`
                );
            }
        });
    });
}

// Disc Animation Function
function triggerDiscAnimation() {
    const vinylDisc = document.querySelector('.vinyl-disc');
    const tonearm = document.querySelector('.tonearm');

    // 🍎 iOS Detection
    const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Reset animation by removing classes
    vinylDisc.classList.remove('loaded', 'spinning');
    tonearm.classList.remove('visible');

    // Force reflow to restart animation
    void vinylDisc.offsetWidth;

    // 🔥 iOS: SYNCHRONOUS execution - no setTimeout gaps!
    // Add disc animation classes
    vinylDisc.classList.add('loaded');
    tonearm.classList.add('visible');

    // 🎯 REAL-TIME TONEARM: Recalculate when vinyl loads
    setTimeout(updateTonearmPosition, 100);
    setTimeout(updateTonearmPosition, 500);

    // 🎵 IMMEDIATE playVideo call - SAME EVENT LOOP!
    // iOS Safari needs this in same execution context as user gesture
    if (player && player.getPlayerState && player.playVideo) {
        const state = player.getPlayerState();
        if (state !== YT.PlayerState.PLAYING) {
            console.log('[Disc Spin] 🎵 IMMEDIATE playVideo (0ms delay)!');
            player.playVideo();

            // Unmute
            if (player.unMute) {
                player.unMute();
                const volumeSlider = document.getElementById('volumeSlider');
                if (volumeSlider) {
                    player.setVolume(volumeSlider.value);
                }
            }
        }
    }

    // Tonearm position update (this can be async - not critical)
    setTimeout(updateTonearmPosition, 500);

    // 🍎 iOS Safari: Check if play worked (ONLY for first song, not autoplay chain)
    // Show hint only if this was user's first interaction
    if (isIOS && !window._lastPlayWasAuto) {
        setTimeout(() => {
            if (player && player.getPlayerState) {
                const currentState = player.getPlayerState();
                if (
                    currentState === YT.PlayerState.PAUSED ||
                    currentState === YT.PlayerState.CUED ||
                    currentState === -1
                ) {
                    // Show glowing tap hint (no emoji)
                    showGlowingTapHint();
                    console.log(
                        '[iOS Safari] Autoplay blocked - showing glowing tap hint'
                    );
                }
            }
        }, 600);
    }
}

// 🍎 Glowing Tap Hint for iOS Safari
function showGlowingTapHint() {
    const songTitle = document.getElementById('songTitle');
    if (!songTitle) return;

    // Save original content
    const originalText = songTitle.textContent;

    // Show glowing "Tap to Play" message
    songTitle.innerHTML = '<span class="tap-to-play-glow">Tap to Play</span>';
    songTitle.style.cursor = 'pointer';

    // Add click handler to play
    const playOnTap = function () {
        if (player && player.playVideo) {
            player.playVideo();
            if (player.unMute) {
                player.unMute();
                const volumeSlider = document.getElementById('volumeSlider');
                player.setVolume(volumeSlider ? volumeSlider.value : 90);
            }
        }
        // Restore original title after short delay
        setTimeout(() => {
            songTitle.textContent = originalText;
            songTitle.style.cursor = 'default';
        }, 500);
        songTitle.removeEventListener('click', playOnTap);
    };

    songTitle.addEventListener('click', playOnTap);

    // Auto-restore after 5 seconds if not clicked
    setTimeout(() => {
        if (songTitle.querySelector('.tap-to-play-glow')) {
            songTitle.textContent = originalText;
            songTitle.style.cursor = 'default';
            songTitle.removeEventListener('click', playOnTap);
        }
    }, 5000);
}

// 🎵 DISC TAP TO PLAY - iOS Safari Autoplay Fix!
// User taps on spinning disc = playVideo triggered with user gesture
function initDiscTapToPlay() {
    const vinylDisc = document.querySelector('.vinyl-disc');
    const vinylContainer = document.querySelector('.vinyl-container');

    if (!vinylDisc) return;

    // Make disc look tappable
    vinylDisc.style.cursor = 'pointer';

    // 🍎 iOS Detection
    const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Tap on disc = play/pause toggle
    const handleDiscTap = function (e) {
        e.stopPropagation();

        console.log('[Disc Tap] 🎵 User tapped disc!');

        if (!player || !player.getPlayerState) {
            console.log('[Disc Tap] ❌ Player not ready');
            return;
        }

        const state = player.getPlayerState();
        console.log('[Disc Tap] Current state:', state);

        // If paused or cued, PLAY
        if (
            state === YT.PlayerState.PAUSED ||
            state === YT.PlayerState.CUED ||
            state === YT.PlayerState.BUFFERING ||
            state === -1
        ) {
            // -1 = unstarted

            console.log('[Disc Tap] ▶️ Playing via disc tap (user gesture!)');
            player.playVideo();

            // iOS: Also unmute
            if (isIOS && player.unMute) {
                player.unMute();
                const volumeSlider = document.getElementById('volumeSlider');
                player.setVolume(volumeSlider ? volumeSlider.value : 90);
                console.log('[Disc Tap] 🔊 Unmuted on iOS');
            }

            // Visual feedback
            vinylDisc.classList.add('spinning');
            showStatus('Playing...', 1500);
        } else if (state === YT.PlayerState.PLAYING) {
            // If playing, pause
            console.log('[Disc Tap] ⏸️ Pausing via disc tap');
            player.pauseVideo();
            vinylDisc.classList.remove('spinning');
            showStatus('Paused', 1500);
        }
    };

    // Add click listener to disc
    vinylDisc.addEventListener('click', handleDiscTap);

    // Also add to vinyl container for bigger tap area
    if (vinylContainer) {
        vinylContainer.addEventListener('click', function (e) {
            // Only trigger if clicking container background, not disc
            if (
                e.target === vinylContainer ||
                e.target.classList.contains('turntable-platter')
            ) {
                handleDiscTap(e);
            }
        });
    }

    console.log('[Disc Tap] ✅ Initialized - tap disc to play/pause!');
}

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Use relative path to work in subdirectories
        navigator.serviceWorker
            .register('./service-worker.js')
            .then((registration) => {
                console.log(
                    '[App] Service Worker registered:',
                    registration.scope
                );

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    console.log('[App] Service Worker update found');
                });
            })
            .catch((error) => {
                console.log('[App] Service Worker registration failed:', error);
            });
    }
}

// 📱 ANDROID BACKGROUND PLAY FIX
// Silent audio keeps browser awake when in background
let silentAudioElement = null;
let wakeLock = null;

function initializeBackgroundPlayKeepAlive() {
    // Create a silent audio element to keep the audio context alive
    if (!silentAudioElement) {
        silentAudioElement = document.createElement('audio');
        silentAudioElement.id = 'silentKeepAlive';

        // Very short silent audio (base64 encoded 0.1s silence)
        // This tricks Android into keeping audio context active
        silentAudioElement.src =
            'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYlxXZhAAAAAAD/+1DEAAAGAAGn9AAAIgAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
        silentAudioElement.loop = true;
        silentAudioElement.volume = 0.01; // Nearly silent
        silentAudioElement.muted = false;

        document.body.appendChild(silentAudioElement);
        console.log('[Background] 🔊 Silent keep-alive audio created');
    }
}

// Start keep-alive when music plays
function startBackgroundKeepAlive() {
    if (silentAudioElement && isPlaying) {
        silentAudioElement.play().catch((e) => {
            console.log('[Background] Keep-alive play failed:', e.message);
        });
        console.log('[Background] 📱 Keep-alive started for background play');
    }

    // Also try Wake Lock API for newer Android
    requestWakeLock();
}

// Stop keep-alive when music stops
function stopBackgroundKeepAlive() {
    if (silentAudioElement) {
        silentAudioElement.pause();
        console.log('[Background] ⏸️ Keep-alive paused');
    }

    releaseWakeLock();
}

// Wake Lock API - prevents screen/CPU sleep
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('[Background] 🔒 Wake Lock acquired');

            wakeLock.addEventListener('release', () => {
                console.log('[Background] 🔓 Wake Lock released');
            });
        } catch (e) {
            console.log('[Background] Wake Lock not available:', e.message);
        }
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}

// 📱 BACKGROUND AUTOPLAY TIMER - Backup for Android lock screen issue
// When ENDED event doesn't fire in background, this timer ensures next song plays

// 🍎 iOS-specific: Interval checker because iOS Safari suspends setTimeout when locked
let iOSBackgroundChecker = null;
let lastCheckedTime = 0;

function startBackgroundAutoplayTimer(duration) {
    // Clear any existing timer
    stopBackgroundAutoplayTimer();

    if (!duration || duration <= 0) return;

    const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
    if (!autoplayEnabled) return;

    // Set expected end time
    expectedSongEndTime = Date.now() + duration * 1000;
    lastCheckedTime = 0;

    // Add 2 second buffer for safety
    const timerDuration = duration * 1000 + 2000;

    console.log(
        `[Background Autoplay] ⏰ Timer set for ${duration}s + 2s buffer`
    );

    // 🍎 iOS FIX: Use setInterval instead of setTimeout
    // iOS Safari suspends setTimeout but sometimes resumes setInterval
    const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
        console.log(
            '[Background Autoplay] 🍎 iOS detected - using interval checker'
        );

        // Check every 3 seconds if song has ended
        iOSBackgroundChecker = setInterval(() => {
            if (player && typeof player.getCurrentTime === 'function') {
                const currentTime = player.getCurrentTime();
                const totalDuration = player.getDuration
                    ? player.getDuration()
                    : 0;
                const state = player.getPlayerState
                    ? player.getPlayerState()
                    : -1;

                // Detect if song ended or stuck
                if (
                    state === YT.PlayerState.ENDED ||
                    (totalDuration > 0 && currentTime >= totalDuration - 2)
                ) {
                    console.log(
                        '[Background Autoplay] 🍎 iOS: Song ended, playing next!'
                    );
                    stopBackgroundAutoplayTimer();
                    playNext();
                } else if (
                    totalDuration > 0 &&
                    currentTime === lastCheckedTime &&
                    currentTime > 0 &&
                    state !== YT.PlayerState.PAUSED
                ) {
                    // Song might be stuck - if time hasn't changed in 6 seconds (2 checks)
                    console.log(
                        '[Background Autoplay] 🍎 iOS: Playback might be stuck, checking...'
                    );
                }
                lastCheckedTime = currentTime;
            }
        }, 3000);
    }

    backgroundAutoplayTimer = setTimeout(() => {
        console.log(
            '[Background Autoplay] ⏰ Timer fired! Checking if song ended...'
        );

        // Check if song actually ended (wasn't skipped or paused)
        if (player && typeof player.getPlayerState === 'function') {
            const state = player.getPlayerState();
            const currentTime = player.getCurrentTime
                ? player.getCurrentTime()
                : 0;
            const totalDuration = player.getDuration ? player.getDuration() : 0;

            // If near end (within 5 seconds) or ended state
            if (
                state === YT.PlayerState.ENDED ||
                (totalDuration > 0 && currentTime >= totalDuration - 5)
            ) {
                console.log(
                    '[Background Autoplay] 🎵 Song ended in background, playing next!'
                );
                playNext();
            } else if (state === YT.PlayerState.PAUSED) {
                console.log(
                    '[Background Autoplay] ⏸️ Song paused, not auto-playing'
                );
            } else {
                console.log(
                    `[Background Autoplay] Song still playing (${currentTime.toFixed(
                        0
                    )}/${totalDuration.toFixed(0)}s), state: ${state}`
                );
            }
        }
    }, timerDuration);
}

function stopBackgroundAutoplayTimer() {
    if (backgroundAutoplayTimer) {
        clearTimeout(backgroundAutoplayTimer);
        backgroundAutoplayTimer = null;
        expectedSongEndTime = 0;
        console.log('[Background Autoplay] ⏰ Timer cleared');
    }
    // 🍎 iOS: Clear interval checker too
    if (iOSBackgroundChecker) {
        clearInterval(iOSBackgroundChecker);
        iOSBackgroundChecker = null;
        console.log('[Background Autoplay] 🍎 iOS interval cleared');
    }
}

// Media Session API for Background Playback
function initializeMediaSession() {
    // Initialize background keep-alive
    initializeBackgroundPlayKeepAlive();

    if ('mediaSession' in navigator) {
        console.log('[App] Media Session API supported');

        // Set action handlers for media controls
        navigator.mediaSession.setActionHandler('play', () => {
            console.log('[Media Session] Play');
            togglePlayPause();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            console.log('[Media Session] Pause');
            togglePlayPause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            console.log('[Media Session] Previous track');
            playPrevious();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            console.log('[Media Session] Next track');
            playNext();
        });

        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            console.log('[Media Session] Seek backward');
            seekRelative(-10);
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            console.log('[Media Session] Seek forward');
            seekRelative(10);
        });
    } else {
        console.log('[App] Media Session API not supported');
    }
}

// 📱 Handle Visibility Change - Android Background Playback Fix (damdamdoe feedback Jan 2026)
// Track if user was playing before leaving
let wasPlayingBeforeHidden = false;

function handleVisibilityChange() {
    if (document.hidden) {
        // User switched away from app
        console.log('[Visibility] 📱 App hidden');

        // Remember if music was playing
        if (player && typeof player.getPlayerState === 'function') {
            const state = player.getPlayerState();
            wasPlayingBeforeHidden = state === YT.PlayerState.PLAYING;

            if (wasPlayingBeforeHidden) {
                console.log(
                    '[Visibility] 🎵 Music was playing - will try to resume on return'
                );
            }
        }
    } else {
        // User returned to app
        console.log('[Visibility] 📱 App visible again');

        // Try to resume if music was playing before
        if (wasPlayingBeforeHidden && player) {
            console.log('[Visibility] 🎵 Attempting to resume playback...');

            // Small delay to let browser stabilize
            setTimeout(() => {
                if (player && typeof player.getPlayerState === 'function') {
                    const currentState = player.getPlayerState();

                    // If paused/stopped but was playing, try to resume
                    if (
                        currentState === YT.PlayerState.PAUSED ||
                        currentState === YT.PlayerState.CUED ||
                        currentState === -1
                    ) {
                        try {
                            player.playVideo();
                            console.log('[Visibility] ▶️ Resumed playback!');

                            // Update UI
                            isPlaying = true;
                            updatePlayButton();
                            startVinylAnimation();
                        } catch (e) {
                            console.log(
                                '[Visibility] Could not auto-resume:',
                                e.message
                            );
                        }
                    }
                }
            }, 300);
        }

        // Reset tracking
        wasPlayingBeforeHidden = false;
    }
}

// Update Media Session Metadata
function updateMediaSessionMetadata(title, artist, artwork) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Unknown Track',
            artist: artist || 'Unknown Artist',
            album: 'Pixel Music',
            artwork: artwork
                ? [
                      { src: artwork, sizes: '96x96', type: 'image/jpeg' },
                      { src: artwork, sizes: '128x128', type: 'image/jpeg' },
                      { src: artwork, sizes: '192x192', type: 'image/jpeg' },
                      { src: artwork, sizes: '256x256', type: 'image/jpeg' },
                      { src: artwork, sizes: '384x384', type: 'image/jpeg' },
                      { src: artwork, sizes: '512x512', type: 'image/jpeg' },
                  ]
                : [],
        });

        // Set playback state
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        console.log('[Media Session] Metadata updated:', title, artist);
    }
}

// Seek relative to current position
function seekRelative(seconds) {
    if (currentPlatform === 'youtube' && player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        const newTime = Math.max(0, currentTime + seconds);
        player.seekTo(newTime, true);
    } else if (currentPlatform === 'local' && audioPlayer) {
        const currentTime = audioPlayer.currentTime;
        const newTime = Math.max(0, currentTime + seconds);
        audioPlayer.currentTime = newTime;
    }
}

// ===== RECORDS LIBRARY SYSTEM =====

// Library Manager - localStorage operations
const libraryManager = {
    storageKey: 'pixelMusicLibrary',

    // Get all library items
    getAll: function () {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading library:', error);
            return [];
        }
    },

    // Save item to library
    save: function (item) {
        try {
            const library = this.getAll();

            // Check if already exists
            const exists = library.some((song) => song.id === item.id);
            if (exists) {
                return false;
            }

            // Add timestamp
            item.dateAdded = new Date().toISOString();

            // Add to beginning of array (newest first)
            library.unshift(item);

            localStorage.setItem(this.storageKey, JSON.stringify(library));
            return true;
        } catch (error) {
            console.error('Error saving to library:', error);
            return false;
        }
    },

    // Remove item from library
    remove: function (id) {
        try {
            let library = this.getAll();
            library = library.filter((song) => song.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(library));
            return true;
        } catch (error) {
            console.error('Error removing from library:', error);
            return false;
        }
    },

    // Check if item is in library
    isInLibrary: function (id) {
        const library = this.getAll();
        return library.some((song) => song.id === id);
    },

    // Clear entire library
    clearAll: function () {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing library:', error);
            return false;
        }
    },
};

// Toggle heart icon and add/remove from library
function toggleLibraryHeart(source, id, title, artist, thumbnail, btnElement) {
    const isInLibrary = libraryManager.isInLibrary(id);

    if (isInLibrary) {
        // Remove from library
        if (libraryManager.remove(id)) {
            btnElement.classList.remove('active');
            btnElement.querySelector('i').className = 'bi bi-heart';
            showStatus('Removed from Library', 2000);

            // Track remove from library
            if (typeof trackRemoveFromLibrary === 'function') {
                trackRemoveFromLibrary(title, artist);
            }

            // Refresh library display if on library tab
            const libraryTab = document.querySelector(
                '[data-bs-target="#library"]'
            );
            if (libraryTab && libraryTab.classList.contains('active')) {
                displayLibrarySongs();
            }
        }
    } else {
        // Add to library
        const item = {
            id: id,
            source: source,
            title: title,
            artist: artist,
            thumbnail: thumbnail,
        };

        if (libraryManager.save(item)) {
            btnElement.classList.add('active');
            btnElement.querySelector('i').className = 'bi bi-heart-fill';
            showStatus('Added to Library ♡', 2000);

            // Track add to library
            if (typeof trackAddToLibrary === 'function') {
                trackAddToLibrary(title, artist);
            }
        }
    }

    updateLibraryCount();
    updateControlsHeartButton();
}

// Toggle current playing song in library (from controls heart button)
function toggleCurrentSongInLibrary() {
    if (!currentSongData || !currentVideoId) {
        showStatus('Play a song first', 2000);
        return;
    }

    const controlsHeartBtn = document.getElementById('controlsHeartBtn');
    const isInLibrary = libraryManager.isInLibrary(currentVideoId);

    if (isInLibrary) {
        // Remove from library
        if (libraryManager.remove(currentVideoId)) {
            controlsHeartBtn.classList.remove('active');
            controlsHeartBtn.querySelector('i').className = 'bi bi-heart';
            showStatus('Removed from Library', 2000);

            if (typeof trackRemoveFromLibrary === 'function') {
                trackRemoveFromLibrary(
                    currentSongData.title,
                    currentSongData.artist
                );
            }
        }
    } else {
        // Add to library
        const item = {
            id: currentVideoId,
            source: 'youtube',
            title: currentSongData.title,
            artist: currentSongData.artist,
            thumbnail: currentSongData.thumbnail,
        };

        if (libraryManager.save(item)) {
            controlsHeartBtn.classList.add('active');
            controlsHeartBtn.querySelector('i').className = 'bi bi-heart-fill';
            showStatus('Added to Library ♡', 2000);

            if (typeof trackAddToLibrary === 'function') {
                trackAddToLibrary(
                    currentSongData.title,
                    currentSongData.artist
                );
            }
        }
    }

    updateLibraryCount();
    syncHeartStates();
}

// Update controls heart button state based on current song
function updateControlsHeartButton() {
    const controlsHeartBtn = document.getElementById('controlsHeartBtn');
    if (!controlsHeartBtn) return;

    if (currentVideoId && libraryManager.isInLibrary(currentVideoId)) {
        controlsHeartBtn.classList.add('active');
        controlsHeartBtn.querySelector('i').className = 'bi bi-heart-fill';
    } else {
        controlsHeartBtn.classList.remove('active');
        controlsHeartBtn.querySelector('i').className = 'bi bi-heart';
    }
}

// Display library songs
function displayLibrarySongs() {
    const librarySongList = document.getElementById('librarySongList');
    const emptyLibrary = document.getElementById('emptyLibrary');
    const clearLibraryBtn = document.getElementById('clearLibraryBtn');
    const library = libraryManager.getAll();

    if (library.length === 0) {
        // Show empty state
        emptyLibrary.style.display = 'block';
        if (clearLibraryBtn) clearLibraryBtn.style.display = 'none';

        // Remove any song items
        const existingSongs = librarySongList.querySelectorAll('.song-item');
        existingSongs.forEach((song) => song.remove());
        return;
    }

    // Hide empty state
    emptyLibrary.style.display = 'none';
    if (clearLibraryBtn) clearLibraryBtn.style.display = 'inline-block';

    // Remove existing songs before adding new ones
    const existingSongs = librarySongList.querySelectorAll('.song-item');
    existingSongs.forEach((song) => song.remove());

    library.forEach((item) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';

        // Build onclick based on source
        let onclick = '';
        if (item.source === 'youtube') {
            onclick = `playLibrarySong('${item.id}', '${item.title.replace(
                /'/g,
                "\\'"
            )}', '${item.artist.replace(/'/g, "\\'")}', '${item.thumbnail}')`;
        } else if (item.source === 'local') {
            onclick = `playLibraryLocalSong('${item.id}', '${item.title
                .replace(/'/g, "\\'")
                .replace(/"/g, '\\"')}')`;
        }

        // Build thumbnail/icon
        const imgHtml = item.thumbnail
            ? `<img src="${item.thumbnail}" alt="${item.title}">`
            : `<i class="bi bi-file-music" style="font-size: 2rem; color: var(--text-dim);"></i>`;

        songItem.innerHTML = `
            ${imgHtml}
            <div class="song-item-info" onclick="${onclick}" style="cursor: pointer;">
                <div class="song-item-title">${item.title}</div>
                <div class="song-item-artist">${item.artist}</div>
            </div>
            <button class="song-heart-btn active" onclick="event.stopPropagation(); removeFromLibrary('${item.id}', this);" title="Remove from Records Library">
                <i class="bi bi-heart-fill"></i>
            </button>
        `;

        librarySongList.appendChild(songItem);
    });
}

// Remove from library (used in library view)
function removeFromLibrary(id, btnElement) {
    if (libraryManager.remove(id)) {
        showStatus('Removed from Library', 2000);
        displayLibrarySongs();
        updateLibraryCount();
        syncHeartStates();
    }
}

// Play song from library (YouTube)
function playLibrarySong(videoId, title, artist, thumbnail) {
    currentPlatform = 'youtube';

    // Store current song data for sharing
    currentVideoId = videoId;
    currentSongData = {
        videoId: videoId,
        title: title,
        artist: artist,
        thumbnail: thumbnail,
    };

    // Save to play history
    saveToPlayHistory({
        videoId: videoId,
        title: title,
        channel: artist,
        thumbnail: thumbnail,
    });

    // Stop local audio if playing
    audioPlayer.pause();

    // Load and play YouTube video
    if (player && player.loadVideoById) {
        player.loadVideoById(videoId);
        player.playVideo();
        isPlaying = true;
        updatePlayButton();
    }

    // Update UI
    updateSongInfo(title, artist, thumbnail);
    updatePlayButton();
    updateMediaSessionMetadata(title, artist, thumbnail);

    // Trigger disc slide-up animation first, then spinning
    triggerDiscAnimation();
    startVinylAnimation();

    // Highlight active song
    document.querySelectorAll('.song-item').forEach((item) => {
        item.classList.remove('active');
    });
    event.target.closest('.song-item')?.classList.add('active');
}

// Play local song from library
function playLibraryLocalSong(fileUrl, title) {
    // Find the file in localFiles array
    const fileIndex = localFiles.findIndex((f) => f.url === fileUrl);
    if (fileIndex !== -1) {
        playLocalFile(fileIndex);
    } else {
        showStatus('File not available', 2000);
    }
}

// Clear entire library
function clearLibrary() {
    if (
        confirm(
            'Are you sure you want to clear your entire Records Library? This cannot be undone.'
        )
    ) {
        if (libraryManager.clearAll()) {
            displayLibrarySongs();
            updateLibraryCount();
            syncHeartStates();
            showStatus('Library cleared', 2000);
        }
    }
}

// Update library count badge
function updateLibraryCount() {
    const library = libraryManager.getAll();
    const countBadge = document.getElementById('libraryCount');

    if (countBadge) {
        countBadge.textContent = library.length;
        countBadge.style.display = library.length > 0 ? 'inline-block' : 'none';
    }
}

// Sync heart states across all displayed songs
function syncHeartStates() {
    const allHeartButtons = document.querySelectorAll('.song-heart-btn');

    allHeartButtons.forEach((btn) => {
        const onclick = btn.getAttribute('onclick');
        if (!onclick) return;

        // Extract ID from onclick attribute
        const match = onclick.match(/toggleLibraryHeart\([^,]+,\s*'([^']+)'/);
        if (match && match[1]) {
            const songId = match[1];
            const isInLibrary = libraryManager.isInLibrary(songId);

            if (isInLibrary) {
                btn.classList.add('active');
                btn.querySelector('i').className = 'bi bi-heart-fill';
            } else {
                btn.classList.remove('active');
                btn.querySelector('i').className = 'bi bi-heart';
            }
        }
    });
}

// Status message variables
let statusTimeout = null;
let actualSongTitle = 'No song playing';
let actualSongArtist = '';

// Show status message in song title area (replaces toasts)
function showStatus(message, duration = 2000) {
    const titleElement = document.getElementById('currentSongTitle');
    const artistElement = document.getElementById('currentSongArtist');

    if (!titleElement) return;

    // Clear any existing timeout
    if (statusTimeout) {
        clearTimeout(statusTimeout);
    }

    // Show status message
    titleElement.textContent = message;
    artistElement.textContent = '';

    // Restore actual song info after duration
    if (duration > 0) {
        statusTimeout = setTimeout(() => {
            titleElement.textContent = actualSongTitle;
            artistElement.textContent = actualSongArtist;
        }, duration);
    }
}

// Legacy showToast - redirects to showStatus
function showToast(message, type = 'success') {
    // Skip "Playing:" messages entirely
    if (message.includes('Playing:') || message.includes('🎵 Playing')) {
        return;
    }

    // Convert technical messages to user-friendly ones
    let userMessage = message;

    // Error message translations for users
    if (message.includes('declined') || message.includes('suppressed')) {
        userMessage = 'Sign in anytime ❤️';
    } else if (message.includes('invalid') || message.includes('Invalid')) {
        userMessage = 'Song not available';
    } else if (message.includes('API') || message.includes('quota')) {
        userMessage = 'Refreshing...';
    } else if (message.includes('error') || message.includes('Error')) {
        userMessage = 'Try again';
    } else if (message.includes('timeout') || message.includes('Timeout')) {
        userMessage = 'Loading slow, skipping...';
    } else if (message.includes('not found') || message.includes('Not found')) {
        userMessage = 'Not found';
    }

    showStatus(userMessage, 2500);
}

// Recently Played Feature
function saveToPlayHistory(song) {
    const MAX_HISTORY = 20;
    let history = JSON.parse(localStorage.getItem('playHistory') || '[]');

    // Remove duplicates (same videoId or title)
    history = history.filter(
        (item) => item.videoId !== song.videoId && item.title !== song.title
    );

    // Add new song at the beginning
    history.unshift({
        ...song,
        playedAt: Date.now(),
    });

    // Keep only last 20 songs
    history = history.slice(0, MAX_HISTORY);

    localStorage.setItem('playHistory', JSON.stringify(history));
}

// 🎯 QUICK PICKS - Smart suggestions from history (ZERO API CALLS!)
function getQuickPicks() {
    const history = JSON.parse(localStorage.getItem('playHistory') || '[]');
    const library = JSON.parse(localStorage.getItem('musicLibrary') || '[]');
    const preferredLanguages = InvisibleIntelligence.getPreferredLanguages();
    const preferredGenres = InvisibleIntelligence.getPreferredGenres();

    // Combine history and library for suggestions
    const allSongs = [
        ...history,
        ...library.filter((s) => s.platform === 'youtube'),
    ];

    // Remove duplicates by videoId
    const uniqueSongs = [];
    const seenIds = new Set();
    allSongs.forEach((song) => {
        if (song.videoId && !seenIds.has(song.videoId)) {
            seenIds.add(song.videoId);
            uniqueSongs.push(song);
        }
    });

    // Score songs based on preferences
    const scoredSongs = uniqueSongs.map((song) => {
        let score = 0;
        const title = (song.title || '').toLowerCase();
        const channel = (song.channel || '').toLowerCase();

        // Boost for preferred languages
        preferredLanguages.forEach((lang, index) => {
            const markers = InvisibleIntelligence.languageMarkers[lang] || [];
            if (markers.some((m) => title.includes(m) || channel.includes(m))) {
                score += 5 - index; // Higher score for top preferred
            }
        });

        // Boost for preferred genres
        preferredGenres.forEach((genre, index) => {
            const markers = InvisibleIntelligence.genreMarkers[genre] || [];
            if (markers.some((m) => title.includes(m))) {
                score += 4 - index;
            }
        });

        // Randomize slightly for variety
        score += Math.random() * 2;

        return { ...song, pickScore: score };
    });

    // Sort by score and return top picks
    return scoredSongs.sort((a, b) => b.pickScore - a.pickScore).slice(0, 8);
}

// 📻 Display Quick Picks section
function displayQuickPicks() {
    const songList = document.getElementById('songList');
    const quickPicks = getQuickPicks();
    const history = JSON.parse(localStorage.getItem('playHistory') || '[]');

    // If no history, show welcome message
    if (history.length === 0) {
        songList.innerHTML = `
            <div style="padding: 2rem; text-align: center; opacity: 0.5;">
                <i class="bi bi-music-note-beamed" style="font-size: 3rem;"></i>
                <p style="margin-top: 1rem;">No songs played yet</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Search and play to build your history</p>
            </div>
        `;
        return;
    }

    // Build Quick Picks HTML
    let html = '';

    // Quick Picks Section (if we have scored picks)
    if (quickPicks.length > 0) {
        html += `
            <div style="padding: 1rem 1rem 0.5rem; opacity: 0.7; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="bi bi-lightning-charge-fill" style="color: #ffd700;"></i>
                <span>Quick Picks</span>
            </div>
        `;

        // Show top 4 quick picks as a compact grid
        quickPicks.slice(0, 4).forEach((song, index) => {
            html += `
                <div class="song-item quick-pick-item" onclick="playFromHistory(${JSON.stringify(
                    song
                ).replace(/"/g, '&quot;')})" style="animation-delay: ${
                index * 0.08
            }s;">
                    <img src="${song.thumbnail}" alt="${song.title}">
                    <div class="song-item-info">
                        <div class="song-item-title">${song.title}</div>
                        <div class="song-item-artist">${song.channel}</div>
                    </div>
                </div>
            `;
        });
    }

    // Recently Played Section
    html += `
        <div style="padding: 1.5rem 1rem 0.5rem; opacity: 0.6; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="bi bi-clock-history"></i>
            <span>Recently Played</span>
        </div>
    `;

    history.slice(0, 10).forEach((song, index) => {
        const timeAgo = getTimeAgo(song.playedAt);
        html += `
            <div class="song-item" onclick="playFromHistory(${JSON.stringify(
                song
            ).replace(/"/g, '&quot;')})" style="animation-delay: ${
            (index + 4) * 0.05
        }s;">
                <img src="${song.thumbnail}" alt="${song.title}">
                <div class="song-item-info">
                    <div class="song-item-title">${song.title}</div>
                    <div class="song-item-artist">${
                        song.channel
                    } · ${timeAgo}</div>
                </div>
                <button class="song-heart-btn" onclick="event.stopPropagation(); toggleLibraryHeart('youtube', '${
                    song.videoId
                }', '${song.title.replace(
            /'/g,
            "\\'"
        )}', '${song.channel.replace(/'/g, "\\'")}', '${
            song.thumbnail
        }', this);" title="Add to Records Library">
                    <i class="bi bi-heart"></i>
                </button>
            </div>
        `;
    });

    songList.innerHTML = html;
    syncHeartStates();

    console.log(
        '[QuickPicks] 🎯 Displayed',
        quickPicks.length,
        'smart picks (ZERO API!)'
    );
}

function displayPlayHistory() {
    const songList = document.getElementById('songList');
    const history = JSON.parse(localStorage.getItem('playHistory') || '[]');

    if (history.length === 0) {
        songList.innerHTML = `
            <div style="padding: 2rem; text-align: center; opacity: 0.5;">
                <i class="bi bi-music-note-beamed" style="font-size: 3rem;"></i>
                <p style="margin-top: 1rem;">No songs played yet</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Search and play to build your history</p>
            </div>
        `;
        return;
    }

    songList.innerHTML = `
        <div style="padding: 1rem 1rem 0.5rem; opacity: 0.6; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="bi bi-clock-history"></i>
            <span>Recently Played</span>
        </div>
    `;

    history.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.onclick = () => playFromHistory(song);

        // Calculate time ago
        const timeAgo = getTimeAgo(song.playedAt);

        songItem.innerHTML = `
            <img src="${song.thumbnail}" alt="${song.title}">
            <div class="song-item-info">
                <div class="song-item-title">${song.title}</div>
                <div class="song-item-artist">${song.channel} · ${timeAgo}</div>
            </div>
            <button class="song-heart-btn" onclick="event.stopPropagation(); toggleLibraryHeart('youtube', '${
                song.videoId
            }', '${song.title.replace(/'/g, "\\'")}', '${song.channel.replace(
            /'/g,
            "\\'"
        )}', '${song.thumbnail}', this);" title="Add to Records Library">
                <i class="bi bi-heart"></i>
            </button>
        `;

        songList.appendChild(songItem);
    });

    syncHeartStates();
}

function playFromHistory(song) {
    currentPlatform = 'youtube';

    // Store current song data for sharing
    currentVideoId = song.videoId;
    currentSongData = {
        videoId: song.videoId,
        title: song.title,
        artist: song.channel,
        thumbnail: song.thumbnail,
    };

    // Track song play
    if (typeof trackSongPlay === 'function') {
        trackSongPlay(song.title, song.channel, 'youtube');
    }

    // Stop local audio if playing
    audioPlayer.pause();

    // Show loading status in title area
    showStatus('Loading...', 0);

    // Clear any existing loading timeout
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }

    if (player && player.loadVideoById) {
        player.loadVideoById({
            videoId: song.videoId,
            suggestedQuality: 'small',
        });

        // Update player UI with song info and album art
        updateSongInfo(song.title, song.channel, song.thumbnail);

        // Update media session
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.channel,
                artwork: [
                    {
                        src: song.thumbnail,
                        sizes: '512x512',
                        type: 'image/jpeg',
                    },
                ],
            });
        }

        // Manually set playing state and start animation
        isPlaying = true;
        isBuffering = true; // Set buffering true until PLAYING state received
        triggerDiscAnimation(); // Slide up the disc
        startVinylAnimation(); // Start spinning
        updatePlayButton();

        // Set loading timeout (20 seconds) - only skip if still buffering (PLAYING state not received)
        loadingTimeout = setTimeout(() => {
            if (isBuffering) {
                console.log(
                    'Song loading timeout - still buffering after 20s, skipping...'
                );
                showStatus('Timeout, skipping...', 1500);

                isPlaying = false;
                isBuffering = false;
                stopVinylAnimation();
                updatePlayButton();

                const autoplayEnabled =
                    localStorage.getItem('autoplayEnabled') !== 'false';
                if (autoplayEnabled) {
                    setTimeout(() => playNext(), 1500);
                }
            }
        }, 20000);

        // Save to history again (updates timestamp)
        saveToPlayHistory(song);
    }
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
}

// Wait for YouTube player to be ready, then play video
function waitForPlayerAndPlay(videoId, attempts = 0) {
    const maxAttempts = 30; // Try for up to 15 seconds (30 * 500ms)

    if (player && player.loadVideoById) {
        console.log('Player ready! Playing video from deep link:', videoId);

        // Clear pending flag since we're playing now
        pendingDeepLinkVideoId = null;

        // Call playVideoById which handles everything: API fetch, UI update, and playback
        playVideoById(videoId);
    } else if (attempts < maxAttempts) {
        console.log(
            `Waiting for YouTube player... attempt ${
                attempts + 1
            }/${maxAttempts}`
        );
        setTimeout(() => waitForPlayerAndPlay(videoId, attempts + 1), 500);
    } else {
        // Store the video ID to play when player becomes ready
        console.log(
            'Player not ready after max attempts, storing for later:',
            videoId
        );
        pendingDeepLinkVideoId = videoId;
        showStatus('Loading player...', 0);
    }
}

// Deep Link Handler - Auto-play from URL parameters
function handleDeepLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v'); // Direct video ID
    const query = urlParams.get('q'); // Search query
    const autoplay = urlParams.get('autoplay');

    // Handle direct video ID (highest priority)
    if (videoId) {
        console.log('Deep link detected - Video ID:', videoId);

        // Store for later use
        pendingDeepLinkVideoId = videoId;

        // Wait for DOM and app initialization
        setTimeout(() => {
            // Auto-login as guest if not logged in
            const storedUser = localStorage.getItem('pixelMusicUser');
            if (!storedUser) {
                console.log('No user logged in, skipping to guest mode...');
                skipLogin();
            }

            // Give more time for app screen to show and YouTube API to load
            setTimeout(() => {
                console.log('Attempting to play deep link video...');
                waitForPlayerAndPlay(videoId);

                // Show tap-to-play message for mobile (browser autoplay policy)
                showStatus('🎵 Tap anywhere to play', 3000);

                // Add one-time click listener for mobile autoplay policy
                const playOnTap = () => {
                    console.log('User tapped - attempting to play');

                    if (player) {
                        // If video is paused/stopped, play it
                        if (
                            player.getPlayerState &&
                            player.getPlayerState() !== 1
                        ) {
                            player.playVideo();
                            isPlaying = true;
                            updatePlayButton();
                            startVinylAnimation();
                        }

                        // If pending video exists, load and play it
                        if (pendingDeepLinkVideoId && player.loadVideoById) {
                            console.log(
                                'Playing pending deep link video on tap:',
                                pendingDeepLinkVideoId
                            );
                            playVideoById(pendingDeepLinkVideoId);
                            pendingDeepLinkVideoId = null;
                        }
                    }

                    document.removeEventListener('click', playOnTap);
                    document.removeEventListener('touchstart', playOnTap);
                };
                document.addEventListener('click', playOnTap, { once: true });
                document.addEventListener('touchstart', playOnTap, {
                    once: true,
                });
            }, 1500); // Wait 1.5 more seconds after login
        }, 500);
        return;
    }

    // Handle search query
    if (query) {
        console.log('Deep link detected:', query);

        // Skip login if deep link present
        setTimeout(() => {
            const storedUser = localStorage.getItem('pixelMusicUser');
            if (!storedUser) {
                skipLogin();
            }

            // Wait for app initialization
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = decodeURIComponent(query);

                    // Auto-search and play
                    performSearch().then(() => {
                        // Auto-play first result if autoplay=true or autoplay not specified
                        if (
                            autoplay !== 'false' &&
                            youtubeSearchResults.length > 0
                        ) {
                            setTimeout(() => {
                                playYouTubeSong(0);
                            }, 1000);
                        }
                    });
                }
            }, 500);
        }, 300);
    }
}

// Play video directly by ID (for deep links and Vibe Shuffle)
function playVideoById(videoId, retryCount = 0, isAutoPlay = true) {
    console.log('Playing video by ID:', videoId);

    // Track if this was auto-play (Vibe Shuffle) or user selection
    window._lastPlayWasAuto = isAutoPlay;

    // 🍎 iOS Detection for special handling
    const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // 🍎 iOS: Activate playback session when user taps (not auto-play)
    if (isIOS && !isAutoPlay) {
        iOSPlaybackSession.active = true;
        iOSPlaybackSession.lastUserInteraction = Date.now();
        iOSPlaybackSession.songsPlayed = 0;
        iOSPlaybackSession.failedAttempts = 0;
        console.log(
            '[iOS] 📱 User tap on history/deep-link - session ACTIVATED'
        );
    }

    // Check if API key is available
    const apiKey = CONFIG.getCurrentApiKey();
    if (!apiKey) {
        console.log(
            'All API keys exhausted, but still trying to play video...'
        );
        // Even without API key, we can still play the video!
        if (player && player.loadVideoById) {
            currentPlatform = 'youtube';
            currentVideoId = videoId;
            currentSongData = {
                videoId: videoId,
                title: 'Now Playing',
                artist: 'Pixel Play',
                channelTitle: 'Pixel Play',
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            };

            updateSongInfo(
                'Now Playing',
                'Pixel Play',
                `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            );
            player.loadVideoById(videoId);

            // Robust autoplay with retries
            player.playVideo();
            const retryDelays = [100, 500, 1000];
            retryDelays.forEach((delay) => {
                setTimeout(() => {
                    if (player && player.getPlayerState && player.playVideo) {
                        const state = player.getPlayerState();
                        if (
                            state !== YT.PlayerState.PLAYING &&
                            state !== YT.PlayerState.ENDED
                        ) {
                            player.playVideo();
                        }
                    }
                }, delay);
            });

            isPlaying = true;
            updatePlayButton();
            triggerDiscAnimation(); // Slide up the disc
            startVinylAnimation(); // Start spinning
            showStatus('🎵 Playing...', 2000);
        } else {
            showStatus('API limit reached', 3000);
        }
        return;
    }

    // Fetch video details from YouTube API (only costs 1 quota unit)
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    console.log('Fetching video details for:', videoId);

    fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                // Try next API key on quota error
                if (retryCount < CONFIG.YOUTUBE_API_KEYS.length - 1) {
                    console.log('API error, trying next key...');
                    CONFIG.rotateApiKey();
                    return playVideoById(videoId, retryCount + 1);
                }
                throw new Error('All API keys exhausted');
            }
            return response.json();
        })
        .then((data) => {
            if (!data) return; // Retry in progress

            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                const title = decodeHtmlEntities(video.snippet.title);
                const channel = decodeHtmlEntities(video.snippet.channelTitle);
                const thumbnail =
                    video.snippet.thumbnails.high?.url ||
                    video.snippet.thumbnails.default.url;

                // Store current song data
                currentPlatform = 'youtube';
                currentVideoId = videoId;
                currentSongData = {
                    videoId: videoId,
                    title: title,
                    artist: channel,
                    channelTitle: channel, // For Intelligence tracking
                    thumbnail: thumbnail,
                };

                // 🧠 INTELLIGENCE: Reset song start time for new song
                songStartTime = Date.now();

                // Save to play history
                saveToPlayHistory({
                    videoId: videoId,
                    title: title,
                    channel: channel,
                    thumbnail: thumbnail,
                });

                // Update player UI
                updateSongInfo(title, channel, thumbnail);

                // Load video in player
                if (player && player.loadVideoById) {
                    // 🍎 iOS FIX: Mute first, load, play, then unmute
                    try {
                        player.mute();
                    } catch (e) {}

                    player.loadVideoById(videoId);

                    // Robust autoplay with multiple retry attempts
                    // 🍎 iOS needs mute→play→unmute sequence
                    const playRetryIntervals = isIOS
                        ? [150, 400, 800, 1500, 2500]
                        : [100, 300, 500, 1000, 2000];

                    // Initial play attempt
                    setTimeout(
                        () => {
                            try {
                                player.playVideo();
                            } catch (e) {
                                console.log('[iOS] Initial play failed:', e);
                            }
                        },
                        isIOS ? 100 : 0
                    );

                    playRetryIntervals.forEach((delay) => {
                        setTimeout(() => {
                            try {
                                if (
                                    player &&
                                    player.getPlayerState &&
                                    player.playVideo
                                ) {
                                    const state = player.getPlayerState();
                                    if (
                                        state !== YT.PlayerState.PLAYING &&
                                        state !== YT.PlayerState.ENDED
                                    ) {
                                        console.log(
                                            `[Autoplay Retry] playVideoById retry at ${delay}ms, state: ${state}`
                                        );
                                        player.playVideo();
                                    }
                                    // Unmute once playing (iOS fix)
                                    if (
                                        state === YT.PlayerState.PLAYING ||
                                        state === YT.PlayerState.BUFFERING
                                    ) {
                                        player.unMute();
                                        const volumeSlider =
                                            document.getElementById(
                                                'volumeSlider'
                                            );
                                        player.setVolume(
                                            volumeSlider
                                                ? volumeSlider.value
                                                : 70
                                        );
                                    }
                                }
                            } catch (e) {
                                console.log(
                                    `[Autoplay Retry] Error at ${delay}ms:`,
                                    e
                                );
                            }
                        }, delay);
                    });

                    isPlaying = true;
                    isBuffering = true;
                    updatePlayButton();
                    triggerDiscAnimation(); // Slide up the disc
                    startVinylAnimation(); // Start spinning
                } else {
                    // Player not ready, wait and retry
                    console.log(
                        'Player not ready in playVideoById, waiting...'
                    );
                    showStatus('Loading player...', 0);
                    setTimeout(() => {
                        if (player && player.loadVideoById) {
                            player.loadVideoById(videoId);

                            // Robust autoplay with retries
                            player.playVideo();
                            setTimeout(() => {
                                if (
                                    player &&
                                    player.getPlayerState &&
                                    player.playVideo
                                ) {
                                    const state = player.getPlayerState();
                                    if (
                                        state !== YT.PlayerState.PLAYING &&
                                        state !== YT.PlayerState.ENDED
                                    ) {
                                        player.playVideo();
                                    }
                                }
                            }, 500);

                            isPlaying = true;
                            isBuffering = true;
                            updatePlayButton();
                            triggerDiscAnimation(); // Slide up the disc
                            startVinylAnimation(); // Start spinning
                        } else {
                            showStatus('Player error', 3000);
                        }
                    }, 3000);
                }
            } else {
                showStatus('Video not found', 3000);
            }
        })
        .catch((error) => {
            console.error('Error fetching video details:', error);

            // FALLBACK: Even if API fails, try to play the video anyway!
            console.log('API failed but attempting to play video anyway...');
            if (player && player.loadVideoById) {
                // Set basic info without API
                currentPlatform = 'youtube';
                currentVideoId = videoId;
                currentSongData = {
                    videoId: videoId,
                    title: 'Now Playing',
                    artist: 'Pixel Play',
                    channelTitle: 'Pixel Play',
                    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                };

                // Use YouTube thumbnail directly
                updateSongInfo(
                    'Loading...',
                    'Pixel Play',
                    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                );

                // Load and play with robust retry
                player.loadVideoById(videoId);
                player.playVideo();

                // Retry playback if needed
                const retryDelays = [100, 500, 1000];
                retryDelays.forEach((delay) => {
                    setTimeout(() => {
                        if (
                            player &&
                            player.getPlayerState &&
                            player.playVideo
                        ) {
                            const state = player.getPlayerState();
                            if (
                                state !== YT.PlayerState.PLAYING &&
                                state !== YT.PlayerState.ENDED
                            ) {
                                player.playVideo();
                            }
                        }
                    }, delay);
                });

                isPlaying = true;
                updatePlayButton();
                triggerDiscAnimation(); // Slide up the disc
                startVinylAnimation(); // Start spinning

                showStatus('🎵 Playing...', 2000);
            } else {
                showStatus('Player not ready', 3000);
            }
        });
}

// Initialize library on page load
document.addEventListener('DOMContentLoaded', function () {
    updateLibraryCount();

    // Show Quick Picks on load (smart suggestions from history - ZERO API!)
    displayQuickPicks();

    // 🎨 Preload share banners in background (like API keys warming up)
    setTimeout(preloadShareBanners, 2000);

    // Initialize HEART Feedback modal
    initHeartFeedbackModal();

    // 🎵 DISC TAP TO PLAY - iOS Safari Fix!
    // When disc is tapped, trigger playVideo (user gesture = Safari happy!)
    initDiscTapToPlay();
});

// ===== 💕 HEART FEEDBACK SYSTEM =====
// Collect user feedback when HEART is fully synced (Day 4+)

// Check if we should show the feedback modal
function shouldShowHeartFeedback() {
    const userData = JSON.parse(localStorage.getItem('pixelMusicUser') || '{}');
    const isGuest = userData.loginType === 'guest';

    // Only for logged-in users
    if (isGuest) return false;

    // Check if already submitted feedback
    const feedbackSubmitted = localStorage.getItem('heartFeedbackSubmitted');
    if (feedbackSubmitted) return false;

    // Check HEART sync status
    const syncStatus = HEART.getSyncStatus();
    const syncPercent = syncStatus.percent;

    // Must be 100% synced
    if (syncPercent < 100) return false;

    // Track when user first hit 100%
    let firstFullSync = localStorage.getItem('heartFirstFullSync');
    if (!firstFullSync) {
        firstFullSync = Date.now();
        localStorage.setItem('heartFirstFullSync', firstFullSync.toString());
        console.log('[HEART Feedback] 🎉 First 100% sync recorded!');
        return false; // Just hit 100%, wait for Day 4
    }

    // Check if 4 days have passed (4 * 24 * 60 * 60 * 1000 = 345600000ms)
    const daysPassed =
        (Date.now() - parseInt(firstFullSync)) / (1000 * 60 * 60 * 24);

    console.log(`[HEART Feedback] Days since 100%: ${daysPassed.toFixed(1)}`);

    // Show feedback on Day 4+
    if (daysPassed >= 4) {
        // Don't show too frequently - once per session max
        const lastPrompt = sessionStorage.getItem('heartFeedbackPrompted');
        if (lastPrompt) return false;

        sessionStorage.setItem('heartFeedbackPrompted', 'true');
        return true;
    }

    return false;
}

// Initialize feedback modal event listeners
function initHeartFeedbackModal() {
    // ═══════════════════════════════════════════════════════════════
    // 🎚️ NEW SLIDER-BASED HEART FEEDBACK
    // "Slide to fill the heart... the more you drag, the more love!"
    // ═══════════════════════════════════════════════════════════════

    const slider = document.getElementById('heartLoveSlider');
    const heartFillRect = document.getElementById('heartFillRect');
    const percentDisplay = document.getElementById('heartPercentDisplay');
    const feelingText = document.getElementById('heartFeelingText');
    const container = document.getElementById('heartFillContainer');
    const thankYou = document.getElementById('heartThankYou');
    const sliderControl = document.querySelector('.heart-slider-control');
    const sliderBody = document.querySelector('.heart-slider-body');

    let submitTimeout = null;
    let hasInteracted = false;

    // Feeling messages based on slider position
    const feelings = [
        { min: 0, max: 10, text: 'Slide to fill the heart...', excited: false },
        { min: 11, max: 30, text: 'Just getting started...', excited: false },
        { min: 31, max: 50, text: "It's growing! 💗", excited: false },
        { min: 51, max: 70, text: 'Feeling the love! 💕', excited: true },
        { min: 71, max: 85, text: 'Almost there! 💖', excited: true },
        { min: 86, max: 95, text: 'So much love! 💓', excited: true },
        { min: 96, max: 100, text: 'FULL HEART! ❤️', excited: true },
    ];

    if (slider) {
        // Slider input handler - update heart fill in real-time
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            hasInteracted = true;
            updateHeartFill(value);

            // Clear any pending submit
            if (submitTimeout) {
                clearTimeout(submitTimeout);
                submitTimeout = null;
            }
        });

        // When user stops sliding - auto submit after 1.5s
        slider.addEventListener('change', (e) => {
            if (!hasInteracted) return;

            const value = parseInt(e.target.value);
            if (value > 0) {
                // Wait 1.5s after user stops, then submit
                submitTimeout = setTimeout(() => {
                    submitSliderFeedback(value);
                }, 1500);
            }
        });

        // Also handle mouseup/touchend for more responsive feel
        ['mouseup', 'touchend'].forEach((event) => {
            slider.addEventListener(event, () => {
                if (!hasInteracted) return;

                const value = parseInt(slider.value);
                if (value > 0 && !submitTimeout) {
                    submitTimeout = setTimeout(() => {
                        submitSliderFeedback(value);
                    }, 1500);
                }
            });
        });
    }

    // Update heart fill visual
    function updateHeartFill(percent) {
        if (heartFillRect) {
            // SVG viewBox is 0-90 height, fill from bottom
            const fillHeight = (percent / 100) * 90;
            const yPos = 90 - fillHeight;
            heartFillRect.setAttribute('y', yPos);
            heartFillRect.setAttribute('height', fillHeight);
        }

        if (percentDisplay) {
            percentDisplay.textContent = `${percent}%`;
        }

        // Update feeling text
        if (feelingText) {
            const feeling = feelings.find(
                (f) => percent >= f.min && percent <= f.max
            );
            if (feeling) {
                feelingText.textContent = feeling.text;
                feelingText.classList.toggle('excited', feeling.excited);
            }
        }

        // Add glow effect at high values
        if (container) {
            container.classList.toggle('glowing', percent > 50);
            container.classList.toggle('high-love', percent > 80);
        }

        // Activate "Love it!" label
        const loveLabel = document.querySelector(
            '.slider-labels span:last-child'
        );
        if (loveLabel) {
            loveLabel.classList.toggle('active', percent > 70);
        }
    }

    // Submit the slider feedback
    function submitSliderFeedback(percent) {
        // Convert 0-100 to 1-5 rating
        const rating = Math.max(1, Math.ceil(percent / 20));
        selectedHeartRating = rating;

        // Hide slider, show thank you
        if (sliderControl) sliderControl.style.display = 'none';
        if (sliderBody) sliderBody.style.display = 'none';
        if (thankYou) thankYou.classList.add('show');

        // Get user data
        const userData = JSON.parse(
            localStorage.getItem('pixelMusicUser') || '{}'
        );
        const syncStatus = HEART.getSyncStatus();

        // Build feedback object
        const feedback = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            rating: rating,
            sliderPercent: percent, // Store exact slider position
            comment: '', // No comment in slider mode
            user: {
                name: userData.name || 'Anonymous',
                email: userData.email || '',
                photo: userData.imageUrl || '',
                loginType: userData.loginType || 'unknown',
            },
            heartSync: {
                percent: syncStatus.percent,
                level: syncStatus.level,
                songsPlayed: localStorage.getItem('playCount') || 0,
                daysUsed: getDaysUsed(),
            },
            device: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
            },
            approved: false,
            showOnLanding: false,
        };

        // Save to localStorage
        saveFeedbackToStorage(feedback);

        // Mark as submitted
        localStorage.setItem('heartFeedbackSubmitted', 'true');
        localStorage.setItem('heartFeedbackRating', rating.toString());
        localStorage.setItem('heartFeedbackPercent', percent.toString());

        // Track in GA
        if (typeof gtag === 'function') {
            gtag('event', 'heart_feedback_submitted', {
                event_category: 'engagement',
                event_label: 'slider_feedback',
                value: percent,
            });
        }

        console.log(
            `[HEART Feedback] ✅ Slider submitted: ${percent}% (${rating}/5)`,
            feedback
        );

        // Close modal after 2s
        setTimeout(() => {
            closeHeartFeedbackModal();
            showToast('Thank you for the love! 💕');
        }, 2000);
    }

    // Back button
    const backBtn = document.getElementById('heartBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', closeHeartFeedbackModal);
    }

    // Skip button
    const skipBtn = document.getElementById('heartSkipBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', skipHeartFeedback);
    }

    // Close on backdrop click
    const overlay = document.getElementById('heartFeedbackOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeHeartFeedbackModal();
            }
        });
    }

    console.log('[HEART Feedback] 🎚️ Slider modal initialized');
}

// Current selected rating (for compatibility)
let selectedHeartRating = 0;

// Handle heart rating selection (legacy - kept for compatibility)
function selectHeartRating(rating) {
    selectedHeartRating = rating;
    console.log(`[HEART Feedback] Rating selected: ${rating}/5`);
}

// Show the feedback modal
function showHeartFeedbackModal() {
    const overlay = document.getElementById('heartFeedbackOverlay');
    if (overlay) {
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scroll

        // Reset slider state
        selectedHeartRating = 0;

        // Reset slider
        const slider = document.getElementById('heartLoveSlider');
        if (slider) slider.value = 0;

        // Reset heart fill
        const heartFillRect = document.getElementById('heartFillRect');
        if (heartFillRect) {
            heartFillRect.setAttribute('y', 90);
            heartFillRect.setAttribute('height', 0);
        }

        // Reset percent display
        const percentDisplay = document.getElementById('heartPercentDisplay');
        if (percentDisplay) percentDisplay.textContent = '0%';

        // Reset feeling text
        const feelingText = document.getElementById('heartFeelingText');
        if (feelingText) {
            feelingText.textContent = 'Slide to fill the heart...';
            feelingText.classList.remove('excited');
        }

        // Reset container classes
        const container = document.getElementById('heartFillContainer');
        if (container) {
            container.classList.remove('glowing', 'high-love');
        }

        // Show slider controls, hide thank you
        const sliderControl = document.querySelector('.heart-slider-control');
        const sliderBody = document.querySelector('.heart-slider-body');
        const thankYou = document.getElementById('heartThankYou');
        if (sliderControl) sliderControl.style.display = '';
        if (sliderBody) sliderBody.style.display = '';
        if (thankYou) thankYou.classList.remove('show');

        console.log('[HEART Feedback] 🎚️ Slider modal shown!');

        // Track this event
        if (typeof gtag === 'function') {
            gtag('event', 'heart_feedback_shown', {
                event_category: 'engagement',
                event_label: 'slider_feedback',
            });
        }
    }
}

// Close the feedback modal
function closeHeartFeedbackModal() {
    const overlay = document.getElementById('heartFeedbackOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = ''; // Restore scroll
    }
}

// Skip feedback for now
function skipHeartFeedback() {
    closeHeartFeedbackModal();
    showToast('No worries! You can rate anytime 💕');

    // Track skip
    if (typeof gtag === 'function') {
        gtag('event', 'heart_feedback_skipped', {
            event_category: 'engagement',
            event_label: 'feedback_modal',
        });
    }
}

// Submit the feedback
function submitHeartFeedback() {
    if (selectedHeartRating === 0) {
        showToast('Please select a rating first! 💕');
        return;
    }

    const textarea = document.getElementById('heartFeedbackComment');
    const comment = textarea ? textarea.value.trim() : '';

    // Get user data
    const userData = JSON.parse(localStorage.getItem('pixelMusicUser') || '{}');
    const syncStatus = HEART.getSyncStatus();

    // Build feedback object
    const feedback = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        rating: selectedHeartRating,
        comment: comment,
        user: {
            name: userData.name || 'Anonymous',
            email: userData.email || '',
            photo: userData.imageUrl || '',
            loginType: userData.loginType || 'unknown',
        },
        heartSync: {
            percent: syncStatus.percent,
            level: syncStatus.level,
            songsPlayed: localStorage.getItem('playCount') || 0,
            daysUsed: getDaysUsed(),
        },
        device: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
        },
        approved: false, // Admin will approve
        showOnLanding: false,
    };

    // Save to localStorage (for HeartAdmin to pick up)
    saveFeedbackToStorage(feedback);

    // Mark as submitted
    localStorage.setItem('heartFeedbackSubmitted', 'true');
    localStorage.setItem('heartFeedbackRating', selectedHeartRating.toString());

    // Close modal
    closeHeartFeedbackModal();

    // Show thank you message
    const messages = [
        'Thank you for the love! 💕',
        'Your feedback means everything! ❤️',
        'HEART synced with yours! 💗',
        'You made our day! 🥰',
        'Shukriya! 🙏❤️',
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    showToast(randomMsg);

    // Track submission
    if (typeof gtag === 'function') {
        gtag('event', 'heart_feedback_submitted', {
            event_category: 'engagement',
            event_label: 'feedback_modal',
            value: selectedHeartRating,
        });
    }

    console.log('[HEART Feedback] ✅ Feedback submitted:', feedback);
}

// Get days since first use
function getDaysUsed() {
    const firstVisit = localStorage.getItem('pixelFirstVisit');
    if (!firstVisit) return 1;

    const days = (Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24);
    return Math.ceil(days);
}

// Save feedback to localStorage for HeartAdmin
function saveFeedbackToStorage(feedback) {
    try {
        // Get existing feedbacks
        let feedbacks = JSON.parse(
            localStorage.getItem('heartAdmin_feedbacks') || '[]'
        );

        // Add new feedback
        feedbacks.unshift(feedback);

        // Keep only last 100 (prevent bloat)
        feedbacks = feedbacks.slice(0, 100);

        // Save back
        localStorage.setItem('heartAdmin_feedbacks', JSON.stringify(feedbacks));

        console.log(
            `[HEART Feedback] Saved to storage. Total: ${feedbacks.length}`
        );
    } catch (error) {
        console.error('[HEART Feedback] Error saving:', error);
    }
}
