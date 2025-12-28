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
let previousVolume = 50;
let loadingTimeout = null;
let isBuffering = false;
let pendingDeepLinkVideoId = null; // Store video ID from deep link until player is ready

// 🎨 ROTATING SHARE BANNERS - Like API keys, rotate banners on share!
const SHARE_BANNER_CONFIG = {
    maxBanners: 12,
    basePath: 'banners/SongShareBanner',
    extensions: ['.jpeg', '.jpg', '.png', '.webp'], // Support all formats - Gen-Z designers! 😄
    currentIndex: 0,
    cachedBanners: new Map() // Track which banners exist with their actual extension
};

// Vibe Shuffle System - Smart DJ that keeps users in the right mood
let vibeHistory = []; // Track mood of last songs: 'sad', 'happy', 'love', 'party', 'chill'
let consecutiveSadCount = 0; // Track consecutive sad songs
let isVibeShuffleEnabled = true; // Smart shuffle enabled by default
let lastPlayedVideoIds = []; // Prevent repeats
let songStartTime = 0; // Track when current song started (for skip detection)

// 🎧 REAL LISTENING TIME TRACKER - Background time bhi track karo!
let listeningSession = {
    startTime: 0,           // When current song started playing
    totalListenedTime: 0,   // Total seconds listened in this session
    songsPlayed: 0,         // Number of songs played
    sessionStart: Date.now() // When session started
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
                gujarati: { plays: 0, skips: 0, score: 0 }
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
                classical: { plays: 0, skips: 0, score: 0 }
            },
            // Channels to avoid (learned from skips)
            avoidChannels: [],
            // Keywords to avoid
            avoidKeywords: [],
            // Liked artists (learned from full plays)
            likedArtists: [],
            // Skip patterns
            skipHistory: [],
            // Last updated
            lastUpdated: Date.now()
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
        hindi: ['hindi', 'bollywood', 'हिंदी', 'dil', 'pyaar', 'ishq', 'mohabbat', 'zindagi', 'tere', 'mere', 'tumhe', 'mujhe', 'yrf', 't-series', 'zee music', 'tips official', 'saregama'],
        english: ['english', 'pop', 'rock', 'jazz', 'billboard', 'vevo', 'official video'],
        punjabi: ['punjabi', 'punjab', 'bhangra', 'gidda', 'jatt', 'desi', 'speed records', 'white hill'],
        tamil: ['tamil', 'தமிழ்', 'kollywood', 'think music', 'sony music south', 'lahari music'],
        telugu: ['telugu', 'తెలుగు', 'tollywood', 'aditya music', 'mango music', 'saavn telugu'],
        bengali: ['bengali', 'bangla', 'বাংলা', 'tollywood', 'rabindra sangeet'],
        marathi: ['marathi', 'मराठी'],
        kannada: ['kannada', 'ಕನ್ನಡ', 'sandalwood', 'anand audio'],
        malayalam: ['malayalam', 'മലയാളം', 'mollywood', 'muzik247'],
        gujarati: ['gujarati', 'ગુજરાતી', 'garba', 'dandiya']
    },
    
    // Genre detection keywords
    genreMarkers: {
        bollywood: ['bollywood', 'hindi film', 'movie song', 'film song', 'yrf', 't-series', 'zee music'],
        devotional: ['bhajan', 'aarti', 'bhakti', 'mantra', 'devotional', 'spiritual', 'krishna', 'shiva', 'ram', 'ganesh', 'sai', 'ministries', 'worship', 'hymn', 'gospel', 'christian'],
        romantic: ['romantic', 'love song', 'pyaar', 'ishq', 'mohabbat', 'dil', 'heart', 'valentine'],
        party: ['party', 'dance', 'dj', 'remix', 'club', 'beat', 'dhol', 'item song'],
        sad: ['sad', 'emotional', 'heartbreak', 'dard', 'gham', 'bewafa', 'judai', 'alvida', 'broken'],
        sufi: ['sufi', 'qawwali', 'naat', 'ghazal', 'mehfil'],
        indie: ['indie', 'independent', 'unplugged', 'acoustic', 'raw'],
        classical: ['classical', 'raag', 'taal', 'hindustani', 'carnatic', 'bandish']
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
    learnFromPlay(songData, playDuration, totalDuration) {
        const data = this.getData();
        const title = songData?.title || '';
        const channel = songData?.channelTitle || '';
        
        // Calculate engagement (did user listen to most of the song?)
        const engagementRatio = totalDuration > 0 ? playDuration / totalDuration : 0;
        const isFullPlay = engagementRatio > 0.7; // Listened to 70%+
        
        // Detect language and genre
        const language = this.detectLanguage(title, channel);
        const genre = this.detectGenre(title);
        
        // Update language score
        if (data.languages[language]) {
            data.languages[language].plays++;
            data.languages[language].score = this.calculateScore(data.languages[language]);
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
        
        console.log(`[Intelligence] 📚 Learned: ${language}/${genre} (${isFullPlay ? 'full play' : 'partial'})`);
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
            data.languages[language].score = this.calculateScore(data.languages[language]);
        }
        
        // Update genre score (negative)
        if (data.genres[genre]) {
            data.genres[genre].skips++;
            data.genres[genre].score = this.calculateScore(data.genres[genre]);
        }
        
        // Add channel to avoid list if skipped 3+ times
        const skipEntry = { channel, title, time: Date.now() };
        data.skipHistory.push(skipEntry);
        
        // Count skips per channel
        const channelSkips = data.skipHistory.filter(s => s.channel === channel).length;
        if (channelSkips >= 3 && !data.avoidChannels.includes(channel)) {
            data.avoidChannels.push(channel);
            console.log(`[Intelligence] 🚫 Auto-blocking channel: ${channel}`);
        }
        
        // Keep skip history manageable
        if (data.skipHistory.length > 100) {
            data.skipHistory = data.skipHistory.slice(-50);
        }
        
        console.log(`[Intelligence] ⏭️ Skip learned: ${language}/${genre} from ${channel}`);
        this.saveData(data);
    },
    
    // Calculate preference score
    calculateScore(stats) {
        // Score = plays - (skips * 2)
        // Skips have more weight because they indicate active dislike
        return stats.plays - (stats.skips * 2);
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
            console.log(`[Intelligence] 🚫 Filtering avoided channel: ${channelTitle}`);
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
    }
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
        workout: { energy: 90, keywords: ['pump', 'gym', 'workout', 'exercise', 'power', 'energy'] },
        party: { energy: 85, keywords: ['party', 'dance', 'club', 'dj', 'remix', 'nachle'] },
        travel: { energy: 70, keywords: ['safar', 'road', 'travel', 'journey', 'musafir'] },
        romance: { energy: 60, keywords: ['pyaar', 'ishq', 'love', 'dil', 'romantic', 'sajna'] },
        lofi: { energy: 45, keywords: ['lofi', 'lo-fi', 'aesthetic', 'study', 'focus', 'vibes'] }, // Bridge mood!
        chill: { energy: 40, keywords: ['relax', 'chill', 'peaceful', 'calm', 'sukoon'] },
        rain: { energy: 50, keywords: ['baarish', 'rain', 'monsoon', 'sawan', 'bheegi'] },
        devotional: { energy: 30, keywords: ['bhajan', 'aarti', 'bhakti', 'spiritual', 'mantra'] },
        sad: { energy: 20, keywords: ['sad', 'dard', 'gham', 'broken', 'judai', 'alvida'] }
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
                moods: [] // Track moods in current session
            },
            
            // Energy level (0-100, adjusts with song moods)
            energyLevel: 50,
            
            // Time-based patterns
            timePatterns: {
                morning: { moods: {}, count: 0 },    // 5am - 12pm
                workday: { moods: {}, count: 0 },    // 12pm - 5pm  
                evening: { moods: {}, count: 0 },    // 5pm - 9pm
                night: { moods: {}, count: 0 },      // 9pm - 12am
                latenight: { moods: {}, count: 0 }   // 12am - 5am
            },
            
            // Mood history for pattern detection
            moodHistory: [],
            
            // Consecutive sad song counter (for mood uplift)
            consecutiveSadSongs: 0,
            
            // Last updated
            lastUpdated: Date.now()
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
            const topMood = Object.entries(moods)
                .sort((a, b) => b[1] - a[1])[0];
            if (topMood) {
                console.log(`[HEART] 🎯 Time-based suggestion: ${topMood[0]} (${period})`);
                return topMood[0];
            }
        }
        
        // Default suggestions based on time
        const defaults = {
            morning: 'devotional',
            workday: 'chill',
            evening: 'romance',
            night: 'party',
            latenight: 'chill'
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
            moods: []
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
        data.currentSession.moods.forEach(m => {
            moodCounts[m] = (moodCounts[m] || 0) + 1;
        });
        data.currentSession.dominantMood = Object.entries(moodCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0];
        
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
            data.energyLevel = Math.round((data.energyLevel * 0.7) + (feeling.energy * 0.3));
        }
        
        // Track sad songs for mood uplift
        if (mood === 'sad') {
            data.consecutiveSadSongs++;
            
            // 🤗 JADU KI JHAPPI - Check if user needs a hug!
            // "Apne ko user ko jada rone nahi dena..."
            if (data.consecutiveSadSongs >= 3 && typeof HEARTWhisper !== 'undefined') {
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
            period: period
        });
        
        // Keep history manageable (last 100 songs)
        if (data.moodHistory.length > 100) {
            data.moodHistory = data.moodHistory.slice(-50);
        }
        
        this.saveData(data);
        console.log(`[HEART] 💓 Session mood: ${mood}, Energy: ${data.energyLevel}, Dominant: ${data.currentSession.dominantMood}`);
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
                'relaxing hindi music'
            ];
        } else if (sadStreak <= 5) {
            // Second level: Romantic/feel good
            return [
                'feel good hindi songs',
                'upbeat romantic songs',
                'happy bollywood songs',
                'positive vibes hindi'
            ];
        } else {
            // Third level: Full party mode!
            return [
                'bollywood party songs',
                'peppy bollywood songs',
                'dance hindi songs',
                'energy bollywood hits'
            ];
        }
    },
    
    // Check if user is "known" (3+ days of usage)
    isUserKnown() {
        const data = this.getData();
        const daysSinceFirst = (Date.now() - data.firstUse) / (1000 * 60 * 60 * 24);
        return daysSinceFirst >= 3;
    },
    
    // Get confidence level
    getConfidenceLevel() {
        const data = this.getData();
        const daysSinceFirst = (Date.now() - data.firstUse) / (1000 * 60 * 60 * 24);
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
                reason: 'Time for some positive vibes!'
            };
        }
        
        // If high confidence, use learned patterns
        if (confidence === 'high') {
            const suggestedMood = this.getTimeSuggestedMood();
            return {
                type: 'learned',
                mood: suggestedMood,
                reason: `Based on your ${period} listening patterns`
            };
        }
        
        // Default time-based suggestion
        return {
            type: 'time',
            mood: this.getTimeSuggestedMood(),
            reason: `Perfect for ${period} vibes`
        };
    },
    
    // Initialize HEART on app load
    init() {
        console.log('[HEART] 💓 HEART Algorithm initialized - "We are harmonic beings"');
        const period = this.getTimePeriod();
        const suggestedMood = this.getTimeSuggestedMood();
        const confidence = this.getConfidenceLevel();
        
        console.log(`[HEART] 💓 Time period: ${period}`);
        console.log(`[HEART] 💓 Suggested mood: ${suggestedMood}`);
        console.log(`[HEART] 💓 Confidence: ${confidence}`);
        
        // Start new session if needed
        const data = this.getData();
        const sessionAge = Date.now() - data.currentSession.startTime;
        if (sessionAge > 30 * 60 * 1000) { // 30 minutes
            this.startSession();
        }
    },
    
    // 🧘‍♂️ DEEP LISTENING MODE - When user is in the zone
    // "Jab user zone mein ho, disturb mat karo"
    deepListening: {
        startTime: null,
        skipCount: 0,
        isActive: false,
        currentMood: null
    },
    
    // Start tracking deep listening
    startDeepListening(mood) {
        this.deepListening.startTime = Date.now();
        this.deepListening.skipCount = 0;
        this.deepListening.currentMood = mood;
        this.deepListening.isActive = true;
        console.log('[HEART] 🧘‍♂️ Deep Listening started - tracking engagement...');
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
        if (!this.deepListening.isActive || !this.deepListening.startTime) return false;
        
        const listenTime = (Date.now() - this.deepListening.startTime) / 1000 / 60; // minutes
        const noSkips = this.deepListening.skipCount === 0;
        
        // 5+ minutes without skip = DEEP LISTENING! 🧘‍♂️
        if (listenTime >= 5 && noSkips) {
            console.log(`[HEART] 🧘‍♂️ DEEP LISTENING MODE ACTIVE! (${listenTime.toFixed(1)} min, 0 skips)`);
            return true;
        }
        return false;
    },
    
    // Get deep listening stats
    getDeepListeningStats() {
        if (!this.deepListening.startTime) return null;
        
        const listenTime = (Date.now() - this.deepListening.startTime) / 1000 / 60;
        return {
            minutes: listenTime.toFixed(1),
            skips: this.deepListening.skipCount,
            mood: this.deepListening.currentMood,
            isDeep: this.isInDeepListening()
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
            period: this.getTimePeriod()
        });
        
        // Keep last 20 deep sessions
        if (data.deepSessions.length > 20) {
            data.deepSessions = data.deepSessions.slice(-20);
        }
        
        this.saveData(data);
        console.log(`[HEART] 🧘‍♂️ Deep session saved: ${stats.mood} for ${stats.minutes} min`);
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
            console.log('  🧘‍♂️ Deep Listening:', deepStats.isDeep ? 'ACTIVE' : 'inactive');
            console.log('     Duration:', deepStats.minutes, 'min');
            console.log('     Skips:', deepStats.skips);
        }
        return data;
    },
    
    // 💕 HEART SYNC PERCENTAGE - BODMAS/BIDMAS Calculation
    // 🎬 Inside Out Style: 5 Senses working together for emotional intelligence
    // 🧮 BODMAS: Brackets, Orders, Division, Multiplication, Addition, Subtraction
    // #FeatureDevelopedOnFeelings
    getHeartSyncPercentage() {
        const data = this.getData();
        const intelligenceData = InvisibleIntelligence.getData();
        
        // ═══════════════════════════════════════════════════════════════
        // 🎬 PANCH TATVA (5 SENSES) - Like Inside Out emotions
        // ═══════════════════════════════════════════════════════════════
        // Joy (Romance) | Sadness | Energy (Anger) | Chill (Fear) | Party (Disgust)
        
        // ════════════════════════════════════════════════════════════════
        // B = BRACKETS/BASE - The foundation (ADDITION - as you said!)
        // "Multiplication is nothing but adding 1+1+1+1+1"
        // ════════════════════════════════════════════════════════════════
        
        // Sense 1: Days of usage (max 20 points)
        const daysSinceFirst = (Date.now() - data.firstUse) / (1000 * 60 * 60 * 24);
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
        const BASE = daysScore + songsScore + langScore + genreScore + deepScore;
        
        // ════════════════════════════════════════════════════════════════
        // O/I = ORDERS/INDICES - Mood Power Multiplier
        // ════════════════════════════════════════════════════════════════
        const currentMood = data.currentSession?.dominantMood || 'neutral';
        const moodPowers = {
            romance: 1.15,   // 💕 Love songs boost sync
            party: 1.12,     // 🎉 Party energy boost
            chill: 1.08,     // 🌿 Relaxed = good connection
            devotional: 1.10, // 🙏 Spiritual connection
            lofi: 1.05,      // 🎧 Focus mode
            sad: 0.92,       // 😢 Reduce for sad loops (Jadu Ki Jhappi needed!)
            neutral: 1.0
        };
        const moodPower = moodPowers[currentMood] || 1.0;
        const ORDERED = BASE * moodPower;
        
        // ════════════════════════════════════════════════════════════════
        // D = DIVISION - Quality over Quantity (Normalize by sessions)
        // ════════════════════════════════════════════════════════════════
        const totalSessions = Math.max(1, deepSessions + Math.floor(songsPlayed / 10));
        const qualityFactor = Math.min(1.5, 1 + (deepSessions / totalSessions));
        const DIVIDED = ORDERED * qualityFactor;
        
        // ════════════════════════════════════════════════════════════════
        // M = MULTIPLICATION - Engagement Boost
        // ════════════════════════════════════════════════════════════════
        const fullPlays = intelligenceData.fullPlays || 0;
        const shares = data.shareCount || 0;
        const engagementBoost = 1 + (Math.min(10, fullPlays) / 100) + (shares * 0.02);
        const MULTIPLIED = DIVIDED * engagementBoost;
        
        // ════════════════════════════════════════════════════════════════
        // A = ADDITION - Milestone Bonuses
        // ════════════════════════════════════════════════════════════════
        let BONUS = 0;
        if (songsPlayed >= 100) BONUS += 5;       // Century bonus
        if (daysSinceFirst >= 7) BONUS += 3;       // Week streak
        if (deepSessions >= 5) BONUS += 3;         // Deep listener
        if (preferredLangs.length >= 3) BONUS += 2; // Multilingual
        const ADDED = MULTIPLIED + BONUS;
        
        // ════════════════════════════════════════════════════════════════
        // S = SUBTRACTION - Penalties (Sad Loop, Skips)
        // ════════════════════════════════════════════════════════════════
        let PENALTY = 0;
        const sadStreak = data.consecutiveSadSongs || 0;
        if (sadStreak > 3) {
            PENALTY += (sadStreak - 3) * 2; // -2 per sad song after 3
            console.log(`[HEART] 😢 Sad loop detected! ${sadStreak} songs. Jadu Ki Jhappi needed!`);
        }
        
        // Check autoplay status
        const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
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
        console.log(`  B (Base): ${BASE.toFixed(1)} = days:${daysScore.toFixed(0)} + songs:${songsScore.toFixed(0)} + lang:${langScore} + genre:${genreScore} + deep:${deepScore}`);
        console.log(`  O (Order): ${ORDERED.toFixed(1)} = ${BASE.toFixed(1)} × ${moodPower} (${currentMood})`);
        console.log(`  D (Divide): ${DIVIDED.toFixed(1)} = quality factor ${qualityFactor.toFixed(2)}`);
        console.log(`  M (Multiply): ${MULTIPLIED.toFixed(1)} = engagement ${engagementBoost.toFixed(2)}`);
        console.log(`  A (Add): ${ADDED.toFixed(1)} = +${BONUS} bonus`);
        console.log(`  S (Subtract): ${FINAL.toFixed(1)} = -${PENALTY} penalty`);
        console.log(`[HEART] 💕 Final Sync: ${percentage}%`);
        
        return percentage;
    },
    
    // Get sync status message
    getSyncStatus() {
        const percentage = this.getHeartSyncPercentage();
        
        if (percentage < 10) return { level: 'new', message: 'Just met you...', emoji: '🤍' };
        if (percentage < 25) return { level: 'learning', message: 'Learning your vibe...', emoji: '🩶' };
        if (percentage < 50) return { level: 'growing', message: 'Getting to know you...', emoji: '🩷' };
        if (percentage < 75) return { level: 'connected', message: 'Feeling your rhythm!', emoji: '💗' };
        if (percentage < 90) return { level: 'synced', message: 'Almost in sync!', emoji: '💓' };
        return { level: 'soulmate', message: 'We are one! 🎵', emoji: '❤️' };
    }
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
        neutral: ['hey', 'suniye', 'friend', 'dear', 'listener']
    },
    
    // 🧠 Get user's preferred language from listening data
    getTopLanguage() {
        try {
            const data = InvisibleIntelligence.getData();
            const languages = data.languages;
            let topLang = 'hindi'; // Default
            let topScore = 0;
            
            Object.keys(languages).forEach(lang => {
                const score = (languages[lang].plays || 0) - (languages[lang].skips || 0);
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
        
        console.log(`[HEART] 🗣️ Address term: ${terms[index]} (from ${topLang} listening)`);
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
            'romantic': 'romance',
            'sad': 'sad', 
            'party': 'party',
            'devotional': 'peaceful',
            'bollywood': 'filmy'
        };
        
        Object.keys(genres).forEach(genre => {
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
            romance: ['Pyaar ki hawa chal rahi hai...', 'Dil romantic mood mein hai aaj...', 'Love is in the air!'],
            sad: ['Dard bhi zaroori hai kabhi kabhi...', 'Aansu bhi gaane sun sakte hain...', 'Sukoon milega, bas sun-te raho...'],
            party: ['Party mood on hai!', 'Nachne ka mann hai aaj!', 'Energy high hai!'],
            chill: ['Sukoon wali vibes...', 'Relax mode activated...', 'Chill vibes aa rahe hain...'],
            devotional: ['Aatma ko sukoon mil raha hai...', 'Bhakti mein shakti hai...', 'Inner peace activated...'],
            lofi: ['Focus mode...', 'Study vibes detected...', 'LoFi vibes on point...']
        },
        
        // Milestone whispers - FEELING based, no numbers!
        milestone: {
            firstSong: ['Pehla gaana! Safar shuru...', 'Welcome! Let the music begin...'],
            gettingStarted: ['HEART seekh raha hai...', 'Getting to know you...'],
            connected: ['Ab samajh aane lagi hai...', 'Vibe mil rahi hai ab!'],
            synced: ['HEART synced ho gaya!', 'We know your soul now!'],
            deepSession: ['Deep listening mode on!', 'Kho gaye music mein...'],
            longSession: ['True music lover!', 'Music soul detected!']
        },
        
        // Time-based greetings - SUBAH HO GAYI style!
        timeBased: {
            morning: ['Subah ho gayi! Fresh vibes ready!', 'Morning energy aa gayi!', 'Nayi subah, naye gaane!'],
            afternoon: ['Dopahar ki dhoop mein chill!', 'Lunch break vibes!', 'Afternoon groove on!'],
            evening: ['Shaam dhalne lagi... music time!', 'Evening vibes setting in...', 'Sunset feels...'],
            night: ['Raat ho gayi... sukoon time!', 'Night vibes are the best!', 'Shaam ke baad ka magic...'],
            latenight: ['Late night warrior!', 'Neend nahi aayi? Hum hain na...', 'Raat ke raaz... music ke saath!']
        },
        
        // Journey whispers (mood transitions)
        journey: {
            sadToHappy: ['Dard se sukoon tak... beautiful journey!', 'Tears to smiles... music heals!'],
            moodShift: ['Mood change ho gaya!', 'Energy shift felt!'],
            romantic: ['Aaj ka din romantic raha... waah!', 'Pyaar bhari shaam!'],
            peaceful: ['Aaj sukoon mila...', 'Inner peace day!'],
            energetic: ['Energy wala din tha aaj!', 'Full on vibes today!']
        },
        
        // Special whispers
        special: {
            returnUser: ['Wapas aa gaye! Yaad kiya kya?', 'Welcome back!'],
            consistentUser: ['Rozana aate ho... HEART happy hai!', 'Daily vibes! True dedication!'],
            weekend: ['Weekend hai! Time to vibe!', 'Chutti ka din... full music mode!']
        },
        
        // 🤗 GALE LAGAO - Warm welcome messages (first hug, then whisper)
        galeLagao: {
            firstTime: ['Welcome to Pixel Play! Aao, gaane suno...', 'First time? Let the music begin!'],
            returning: ['Arey waah! Wapas aa gaye!', 'Welcome back!'],
            morning: ['Good morning! Chai ke saath gaane?', 'Subah ho gayi! Fresh vibes ready!'],
            afternoon: ['Dopahar ki vibes ready!', 'Lunch break? Perfect!'],
            evening: ['Shaam aa gayi! Music time!', 'Evening mood set karte hain!'],
            night: ['Night vibes activate!', 'Perfect music time...'],
            latenight: ['Late night warrior spotted!', 'Neend nahi aayi? Music sun!'],
            longGap: ['Bahut waqt ho gaya! Miss kiya?', 'Finally wapas! Kahan the itne din?']
        },
        
        // 🤗 JADU KI JHAPPI - When user is in sad loop (3+ sad songs)
        jaduKiJhappi: {
            gentle: ['Hey... sab theek hai?', 'Kuch baat hai? Hum hain yahan...'],
            caring: ['Bahut sad gaane ho gaye... thoda chill karein?', 'Dil bhari hai? Chalo mood change karein...'],
            uplifting: ['Ek jhappi le lo... Ab kuch peppy sunein?', 'Rona zaroori hai, par muskurana bhi!'],
            suggestion: ['Kuch feel-good sunoge? HEART suggest kar raha hai...', 'Thoda vibe change? Trust me!']
        },
        
        // 🌅 Day Summary whispers - Mood based, not number based!
        daySummary: {
            romantic: ['Aaj ka din romantic raha... waah!', 'Pyaar wali playlist chal rahi thi!'],
            chill: ['Aaj sukoon wala din tha!', 'Chill vibes all day!'],
            party: ['Energy wala din tha aaj!', 'Party mood mein the aaj!'],
            sad: ['Dard bhi gaane ki tarah hai... beautiful!', 'Emotions explored today...'],
            mixed: ['Bahut variety suni aaj!', 'Har mood cover kiya aaj!'],
            peaceful: ['Sukoon mila aaj...', 'Inner peace day!']
        }
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
            lastSessionStart: Date.now()
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
        const cleanMessage = message.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
        
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
        if (data.seenWhispers.length > 50) data.seenWhispers = data.seenWhispers.slice(-50);
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
        if (Math.random() < 0.1) { // 10% chance
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
        const hoursSinceLastVisit = (now - (heartData.lastVisit || 0)) / (1000 * 60 * 60);
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
            console.log(`[HEART] 🤗 Jadu Ki Jhappi triggered! Sad streak: ${sadStreak}`);
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
    }
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
        keywords: ['nachu', 'nach', 'nachle', 'nachenge', 'nacho', 'nache', 'nachdi', 'nachna', 
                   'dance', 'thump', 'dhol', 'dholida', 'beat', 'groove', 'party', 'dj', 'remix',
                   'bajao', 'baja', 'bajate', 'ghungroo', 'payal', 'jhumka', 'jhume', 'jhoom',
                   'deewangi', 'deewane', 'pagli', 'pagla', 'naagin', 'item', 'chikni', 'chameli'],
        searchTerms: ['bollywood dance songs', 'hindi party songs', 'wedding dance songs'],
        vibeType: 'party'
    },
    
    // Romantic Vibes  
    romance: {
        keywords: ['odhani', 'chunari', 'dupatta', 'kajal', 'mehendi', 'sindoor', 'mangalsutra',
                   'sajna', 'sajan', 'jaanu', 'jaan', 'janeman', 'dilbar', 'dilruba', 'mehboob',
                   'pyaar', 'pyar', 'mohabbat', 'ishq', 'prem', 'milan', 'dhadkan', 'dhadke',
                   'chahun', 'chaaha', 'chahu', 'tera', 'mera', 'tere', 'mere', 'hum', 'tum',
                   'baahon', 'bahon', 'aankhon', 'nazar', 'nigah', 'nazare', 'husn', 'ada',
                   'chunnari', 'chunariya', 'saree', 'sari', 'rangoli', 'kajra', 'surma'],
        searchTerms: ['romantic hindi songs', 'bollywood love songs', 'romantic duet songs'],
        vibeType: 'love'
    },
    
    // Sad/Emotional Vibes (removed 'dil' - too generic, causes false matches)
    sad: {
        keywords: ['roya', 'roye', 'royega', 'royenge', 'aansu', 'aansoo', 'ashq', 'tears',
                   'dard', 'gham', 'udaas', 'tanha', 'akela', 'alvida', 'judai', 
                   'bichhad', 'bhula', 'yaad', 'yadein', 'bewafa', 'dhoka', 'tadap', 
                   'zakhm', 'chot', 'toota', 'tuta', 'bikhra', 'toot', 'broken',
                   'rulaaye', 'rulaya', 'dukh', 'ghamgin', 'udasi', 'tanhaai'],
        searchTerms: ['sad hindi songs', 'bollywood emotional songs', 'heart touching songs'],
        vibeType: 'sad'
    },
    
    // Devotional/Spiritual Vibes (removed 'om' - too common in song names like "Om Shanti Om")
    devotional: {
        keywords: ['bhajan', 'aarti', 'mantra', 'shiva', 'krishna', 'radha', 'ram',
                   'ganpati', 'deva', 'bhagwan', 'prabhu', 'jai', 'darshan', 'sai', 'guru'],
        searchTerms: ['hindi bhajan songs', 'devotional songs bollywood', 'spiritual hindi songs'],
        vibeType: 'devotional'
    },
    
    // Chill/Sufi Vibes
    sufi: {
        keywords: ['sufi', 'qawwali', 'naat', 'khwaja', 'maula', 'kun', 'faya', 'rooh',
                   'sukoon', 'chain', 'meetha', 'nazm', 'ghazal', 'shayari', 'rubaai'],
        searchTerms: ['sufi songs hindi', 'qawwali songs', 'peaceful hindi songs'],
        vibeType: 'chill'
    },
    
    // Fun/Masti Vibes
    masti: {
        keywords: ['masti', 'mazaa', 'maza', 'dhoom', 'dhamaal', 'hungama', 'tamasha',
                   'halla', 'gola', 'paagal', 'deewana', 'crazy', 'pataka', 'aag', 'fire',
                   'zor', 'shor', 'dhamal', 'jalwa', 'swag', 'attitude'],
        searchTerms: ['masti songs hindi', 'fun bollywood songs', 'peppy hindi songs'],
        vibeType: 'party'
    },
    
    // Travel/Freedom Vibes
    travel: {
        keywords: ['safar', 'raaste', 'musafir', 'pardesi', 'badal', 'hawaa', 'hawa',
                   'pankh', 'udna', 'udd', 'azaad', 'azadi', 'khula', 'aasmaan', 'road',
                   'gaadi', 'train', 'bike', 'patang', 'parinda'],
        searchTerms: ['travel songs hindi', 'road trip bollywood songs', 'freedom hindi songs'],
        vibeType: 'chill'
    },
    
    // Rain/Monsoon Vibes
    rain: {
        keywords: ['baarish', 'barish', 'barsat', 'sawan', 'rimjhim', 'bheegi', 'bheega',
                   'tip', 'boondon', 'badal', 'bijli', 'toofan', 'megha', 'megh'],
        searchTerms: ['rain songs hindi', 'baarish bollywood songs', 'monsoon romantic songs'],
        vibeType: 'love'
    }
};

// Common artist/actor names to IGNORE (they trigger false vibes)
const ARTIST_NAMES_TO_IGNORE = [
    // Singers
    'anuradha', 'sriram', 'lata', 'kishore', 'kumar', 'rafi', 'mohammed', 
    'arijit', 'singh', 'neha', 'kakkar', 'shreya', 'ghoshal', 'sonu', 'nigam',
    'udit', 'narayan', 'alka', 'yagnik', 'sunidhi', 'chauhan', 'atif', 'aslam',
    'armaan', 'malik', 'jubin', 'nautiyal', 'badshah', 'honey', 'yo yo',
    'pritam', 'vishal', 'shekhar', 'shankar', 'ehsaan', 'loy', 'salim', 'sulaiman',
    'rahman', 'himesh', 'reshammiya', 'amit', 'trivedi', 'sachin', 'jigar',
    'mithoon', 'ankit', 'tiwari', 'mohit', 'chauhan', 'kk', 'shaan', 'abhijeet',
    'akriti', 'palak', 'muchhal', 'monali', 'thakur', 'benny', 'dayal', 'papon',
    
    // Actors/Actresses (their names appear in titles and cause false matches)
    'varun', 'dhawan', 'alia', 'bhatt', 'ranveer', 'deepika', 'padukone',
    'shah', 'rukh', 'khan', 'salman', 'aamir', 'hrithik', 'roshan', 'ranbir',
    'kapoor', 'katrina', 'kaif', 'priyanka', 'chopra', 'kareena', 'saif',
    'akshay', 'ajay', 'devgn', 'shahid', 'shraddha', 'tiger', 'shroff',
    'sidharth', 'malhotra', 'anushka', 'sharma', 'vicky', 'kaushal', 'kiara',
    'advani', 'kriti', 'sanon', 'disha', 'patani', 'jacqueline', 'fernandez',
    'sonakshi', 'sinha', 'parineeti', 'taapsee', 'pannu', 'sara', 'janhvi',
    'govinda', 'anil', 'madhuri', 'dixit', 'kajol', 'juhi', 'chawla',
    'sukhwinder', 'sunidhi'
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
    
    const words = songTitle.split(/[\s\-\|:,()]+/).filter(w => w.length > 2);
    
    // Filter out artist names
    const songWords = words.filter(w => !ARTIST_NAMES_TO_IGNORE.includes(w));
    
    console.log('[Vibe Keywords] Song words (artist filtered):', songWords.join(', '));
    
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
                    isMatch = (word === keyword);
                } else {
                    // Both are long enough - can use partial matching
                    // But only if one STARTS WITH the other (not just contains)
                    isMatch = (word.startsWith(keyword) || keyword.startsWith(word));
                }
                
                if (isMatch) {
                    detectedVibes.push({
                        category: category,
                        matchedWord: word,
                        keyword: keyword,
                        searchTerms: data.searchTerms,
                        vibeType: data.vibeType
                    });
                    break; // Move to next keyword
                }
            }
        }
    }
    
    console.log('[Vibe Keywords] Detected:', detectedVibes.map(v => `${v.matchedWord}→${v.category}`).join(', '));
    return detectedVibes;
}

// 💕 HEART SYNC UI - Update the SVG heart with smooth fill animation
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
    }
    
    console.log(`[HEART UI] 💕 Updated to ${percentage}% (fill: y=${fillY.toFixed(1)}, h=${fillHeight.toFixed(1)})`);
}

// Show HEART Sync Status (placeholder for future overlay)
function showHeartSyncStatus() {
    const status = HEART.getSyncStatus();
    const percentage = HEART.getHeartSyncPercentage();
    
    // For now, just show a toast. Future: Beautiful overlay!
    showToast(`${status.emoji} ${status.message} (${percentage}% synced)`);
    
    // Log to console for debugging
    console.log('[HEART] 💕 Sync Status:', status);
    HEART.debug();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    registerServiceWorker();
    setSearchPlaceholder();
    
    // 💕 Initialize HEART Sync UI
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
    
    // Disable right-click context menu (protection)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable keyboard shortcuts for inspect/devtools (optional protection)
    document.addEventListener('keydown', function(e) {
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
            HEARTWhisper.showWhisper('Wapas aa gaye! Missed you! 🎵');
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
        searchInput.addEventListener('keypress', function(e) {
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
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performMobileSearch();
            }
        });
    }
    
    // Enter key in sliding search input (new)
    const mobileSlideSearchInput = document.getElementById('mobileSlideSearchInput');
    if (mobileSlideSearchInput) {
        mobileSlideSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSlideSearch();
            }
        });
    }
    
    // Progress slider
    const progressSlider = document.getElementById('progressSlider');
    progressSlider.addEventListener('input', function() {
        if (currentPlatform === 'youtube' && player && player.getDuration) {
            const seekTime = (player.getDuration() * progressSlider.value) / 100;
            player.seekTo(seekTime, true);
        } else if (currentPlatform === 'local' && audioPlayer.duration) {
            const seekTime = (audioPlayer.duration * progressSlider.value) / 100;
            audioPlayer.currentTime = seekTime;
        }
    });
    
    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', function() {
        if (player && player.setVolume) {
            player.setVolume(volumeSlider.value);
        }
        if (audioPlayer) {
            audioPlayer.volume = volumeSlider.value / 100;
        }
    });
    
    // Audio player events
    audioPlayer.addEventListener('timeupdate', updateLocalProgress);
    audioPlayer.addEventListener('ended', function() {
        // Check if autoplay is enabled for local files too
        const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
        if (autoplayEnabled) {
            playNext();
        } else {
            stopVinylAnimation();
            updatePlayButton();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
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
        
        switch(e.code) {
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
                if (document.activeElement.id === 'searchInput' || 
                    document.activeElement.id === 'mobileSearchInput' ||
                    document.activeElement.id === 'mobileSlideSearchInput') {
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
    const mobileSlideSearchInput = document.getElementById('mobileSlideSearchInput');
    
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
    
    // Show recently played after clearing search
    if (currentPlatform === 'youtube') {
        displayPlayHistory();
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
    player = new YT.Player('youtubePlayer', {
        height: '0',
        width: '0',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'quality': 'small'  // Lower quality for faster loading
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    console.log('🎵 Pixel Player ready!');
    const volumeSlider = document.getElementById('volumeSlider');
    player.setVolume(volumeSlider.value);
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
        // 🧠 INTELLIGENCE: Song ended naturally = full play = positive learning
        if (currentSongData && player) {
            const duration = player.getDuration ? player.getDuration() : 0;
            const playTime = (Date.now() - songStartTime) / 1000; // seconds
            InvisibleIntelligence.learnFromPlay(currentSongData, playTime, duration);
            
            // 💕 Update HEART Sync UI after learning
            updateHeartSyncUI();
        }
        
        // 🎧 LISTENING TIME: Song ended, add to total
        if (listeningSession.startTime > 0) {
            const listenedNow = (Date.now() - listeningSession.startTime) / 1000;
            listeningSession.totalListenedTime += listenedNow;
            listeningSession.startTime = 0;
            console.log('[Listening] ⏹️ Song ended. This: ' + listenedNow.toFixed(1) + 's, Total: ' + listeningSession.totalListenedTime.toFixed(1) + 's');
            
            // Send to GA4 every song end
            sendListeningTimeToGA4();
        }
        
        // Check if autoplay is enabled
        const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
        if (autoplayEnabled) {
            playNext();
        } else {
            stopVinylAnimation();
            updatePlayButton();
        }
    } else if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        isBuffering = false;
        
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
        } catch(e) {
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
            console.log('[Listening] ▶️ Started tracking song #' + listeningSession.songsPlayed);
        }
        
        startVinylAnimation();
        updatePlayButton();
        
        // Check video duration - skip if too short or too long
        if (player && player.getDuration) {
            const duration = player.getDuration();
            const minDuration = 49; // 49 seconds
            const maxDuration = 59 * 60; // 59 minutes in seconds (3540s)
            
            if (duration > 0) {
                // Skip if too short (ads, clips)
                if (duration < minDuration) {
                    console.log('Video too short (' + duration + 's), skipping...');
                    const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
                    if (autoplayEnabled) {
                        setTimeout(() => playNext(), 1000);
                    }
                    return;
                }
                
                // Skip if too long (compilations, albums)
                if (duration > maxDuration) {
                    const minutes = Math.floor(duration / 60);
                    console.log('Video too long (' + minutes + ' min), skipping...');
                    const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
                    if (autoplayEnabled) {
                        setTimeout(() => playNext(), 1000);
                    }
                    return;
                }
            }
        }
    } else if (event.data === YT.PlayerState.BUFFERING) {
        isBuffering = true;
        console.log('Video buffering...');
    } else if (event.data === YT.PlayerState.PAUSED) {
        // 🎧 LISTENING TIME: Pause tracking, save listened time
        if (listeningSession.startTime > 0) {
            const listenedNow = (Date.now() - listeningSession.startTime) / 1000;
            listeningSession.totalListenedTime += listenedNow;
            listeningSession.startTime = 0; // Reset for next play
            console.log('[Listening] ⏸️ Paused. This segment: ' + listenedNow.toFixed(1) + 's, Total: ' + listeningSession.totalListenedTime.toFixed(1) + 's');
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
    
    // Auto-skip to next song if autoplay is enabled
    const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
    if (autoplayEnabled && (currentPlatform === 'youtube' && youtubeSearchResults.length > 0)) {
        console.log('Auto-skipping to next song due to error...');
        setTimeout(() => {
            playNext();
        }, 1500); // Wait 1.5 seconds before skipping
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
window.addEventListener('DOMContentLoaded', function() {
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
    songList.innerHTML = '<div class="loading"><i class="bi bi-heart-pulse"></i><p>💫 HEART Syncing: ' + query + '</p></div>';
    
    try {
        const results = await searchYouTube(query);
        displayYouTubeResults(results);
    } catch (error) {
        console.error('Search error:', error);
        songList.innerHTML = '<div class="error-message"><i class="bi bi-exclamation-triangle"></i><p>Failed to search. ' + error.message + '</p></div>';
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
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=${MAX_RESULTS}&key=${API_KEY}`;
    
    console.log('Searching YouTube for:', query, `(Using API Key ${CONFIG.CURRENT_KEY_INDEX + 1})`);
    console.log('API URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('YouTube API Error:', errorData);
        
        // Check for quota exceeded or forbidden (403)
        const isQuotaError = errorData.error?.errors?.[0]?.reason === 'quotaExceeded' || response.status === 403;
        
        if (isQuotaError) {
            // Try next API key if available
            if (retryCount < CONFIG.YOUTUBE_API_KEYS.length - 1) {
                console.log(`Key ${CONFIG.CURRENT_KEY_INDEX + 1} quota exceeded. Trying next key...`);
                CONFIG.rotateApiKey();
                return searchYouTube(query, retryCount + 1);
            }
            
            // All keys exhausted
            throw new Error('🎵 All search limits reached! Resets at 12:30 PM IST daily. Meanwhile, browse your ♥️ Records Library!');
        }
        
        throw new Error(errorData.error?.message || 'API Error: ' + response.status + ' - ' + response.statusText);
    }
    
    const data = await response.json();
    console.log('YouTube search results:', data);
    
    const results = data.items || [];
    
    // Cache the results (1 hour)
    if (results.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify({
            data: results,
            timestamp: Date.now()
        }));
        console.log('Cached search results for:', query);
    }
    
    return results;
}

function displayYouTubeResults(results) {
    youtubeSearchResults = results;
    const songList = document.getElementById('songList');
    
    if (results.length === 0) {
        songList.innerHTML = '<div class="error-message"><p>No results found</p></div>';
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
    
    songItem.innerHTML = `
        <img src="${thumbnail}" alt="${title}">
        <div class="song-item-info">
            <div class="song-item-title">${title}</div>
            <div class="song-item-artist">${channel}</div>
        </div>
        <button class="song-heart-btn" onclick="event.stopPropagation(); toggleLibraryHeart('youtube', '${videoId}', '${title.replace(/'/g, "\\'")}', '${channel.replace(/'/g, "\\'")}', '${thumbnail}', this);" title="Add to Records Library">
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

function playYouTubeSong(index) {
    if (!youtubeSearchResults[index]) return;
    
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
    
    const videoId = youtubeSearchResults[index].id.videoId;
    const title = decodeHtmlEntities(youtubeSearchResults[index].snippet.title);
    const channel = decodeHtmlEntities(youtubeSearchResults[index].snippet.channelTitle);
    const thumbnail = youtubeSearchResults[index].snippet.thumbnails.high?.url || youtubeSearchResults[index].snippet.thumbnails.default.url;
    
    // Store current song data for sharing
    currentVideoId = videoId;
    currentSongData = {
        videoId: videoId,
        title: title,
        artist: channel,
        thumbnail: thumbnail
    };
    
    // Save to play history
    saveToPlayHistory({
        videoId: videoId,
        title: title,
        channel: channel,
        thumbnail: thumbnail
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
    
    // Load and play video first
    if (player && player.loadVideoById) {
        // For iOS/Mobile: Start muted, then unmute after play starts
        // This bypasses browser autoplay restrictions
        try {
            player.mute(); // Start muted to satisfy autoplay policy
        } catch(e) {}
        
        player.loadVideoById(videoId);
        
        // Attempt play immediately
        try {
            player.playVideo();
        } catch(e) {
            console.log('[Autoplay] Initial playVideo failed:', e);
        }
        
        // Multiple retry attempts with unmute to ensure playback starts
        // This handles browser autoplay policies and slow loading
        const playRetryIntervals = [100, 300, 500, 1000, 2000, 3000];
        playRetryIntervals.forEach((delay) => {
            setTimeout(() => {
                try {
                    if (player && player.getPlayerState && player.playVideo) {
                        const state = player.getPlayerState();
                        // If not playing and not ended, try to play again
                        if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.ENDED) {
                            console.log(`[Autoplay Retry] Attempting playVideo at ${delay}ms, current state: ${state}`);
                            player.playVideo();
                        }
                        // Unmute after play attempt (user clicked = interaction happened)
                        if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                            player.unMute();
                            const volumeSlider = document.getElementById('volumeSlider');
                            if (volumeSlider) {
                                player.setVolume(volumeSlider.value);
                            } else {
                                player.setVolume(70);
                            }
                        }
                    }
                } catch(e) {
                    console.log(`[Autoplay Retry] Error at ${delay}ms:`, e);
                }
            }, delay);
        });
        
        player.setPlaybackQuality('small'); // Force lower quality for faster loading
        
        // Manually trigger playback state
        isPlaying = true;
        isBuffering = true; // Set buffering true until PLAYING state received
        startVinylAnimation();
        updatePlayButton();
    }
    
    // Set loading timeout (20 seconds) - only skip if still buffering (PLAYING state not received)
    loadingTimeout = setTimeout(() => {
        if (isBuffering) {
            console.log('Song loading timeout - still buffering after 20s, skipping...');
            showStatus('Timeout, skipping...', 1500);
            
            // Stop stuck state
            isPlaying = false;
            isBuffering = false;
            stopVinylAnimation();
            updatePlayButton();
            
            // Auto-skip to next if autoplay enabled
            const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
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
    
    // 💭 Mood-based whisper (10% chance to avoid spamming)
    if (detectedMood && Math.random() < 0.1) {
        HEARTWhisper.whisperMood(detectedMood);
    }
    
    // Trigger disc slide-up animation
    triggerDiscAnimation();
}

// Handle Local Files
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('audio/')) {
            localFiles.push({
                file: file,
                name: file.name,
                url: URL.createObjectURL(file)
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
        
        const fileName = item.name.replace(/\.[^/.]+$/, "");
        
        songItem.innerHTML = `
            <i class="bi bi-file-music" style="font-size: 2rem; color: var(--text-dim);"></i>
            <div class="song-item-info" onclick="event.stopPropagation(); playLocalFile(${index});" style="cursor: pointer;">
                <div class="song-item-title">${fileName}</div>
                <div class="song-item-artist">Local File</div>
            </div>
            <button class="song-heart-btn" onclick="event.stopPropagation(); toggleLibraryHeart('local', '${item.url}', '${fileName.replace(/'/g, "\\'")}', 'Local File', '', this);" title="Add to Records Library">
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
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    
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
    if (currentPlatform === 'youtube' && player && player.getPlayerState) {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
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
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
    }
}

function playNext() {
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
            InvisibleIntelligence.learnFromPlay(currentSongData, playTime, duration);
        }
    }
    
    // Reset song start time for next song
    songStartTime = 0;
    
    if (currentPlatform === 'youtube') {
        // Use Vibe Shuffle for smart autoplay
        if (isVibeShuffleEnabled && currentVideoId) {
            playVibeShuffledNext();
        } else if (youtubeSearchResults.length > 0) {
            // Fallback to search list
            const nextIndex = (currentSongIndex + 1) % youtubeSearchResults.length;
            playYouTubeSong(nextIndex);
        }
    } else if (currentPlatform === 'local' && localFiles.length > 0) {
        const nextIndex = (currentSongIndex + 1) % localFiles.length;
        playLocalFile(nextIndex);
    }
}

/**
 * Vibe Shuffle - Smart DJ System
 * Plays related songs based on current song's vibe
 * Detects mood and gently lifts user from sad loops
 */
async function playVibeShuffledNext() {
    const startTime = performance.now();
    const currentTitle = currentSongData?.title || '';
    
    console.log('[Vibe Shuffle] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Vibe Shuffle] 🎵 Current: ' + currentTitle.substring(0, 50));
    
    // 🧘‍♂️ DEEP LISTENING: Check if user is in the zone
    if (HEART.isInDeepListening()) {
        const deepStats = HEART.getDeepListeningStats();
        console.log(`[HEART] 🧘‍♂️ Deep Listening ACTIVE - ${deepStats.minutes} min in ${deepStats.mood} mood`);
        console.log('[HEART] 🧘‍♂️ Prioritizing same mood songs to maintain the vibe...');
        // Save deep session for future learning
        HEART.saveDeepSession();
    }
    
    // 💓 HEART: Check for mood uplift (3+ sad songs)
    // But NOT if user is in deep listening mode (respect their mood choice)
    if (HEART.shouldUpliftMood() && !HEART.isInDeepListening()) {
        console.log('[HEART] 🌈 Mood uplift triggered - switching to happy vibes!');
        
        // 💭 HEART Whisper: Journey whisper for sad → happy transition
        HEARTWhisper.whisperJourney('sadToHappy');
        
        const upliftSuggestions = HEART.getUpliftSuggestions();
        const randomSearch = upliftSuggestions[Math.floor(Math.random() * upliftSuggestions.length)];
        
        try {
            const results = await searchYouTube(randomSearch);
            if (results && results.length > 0) {
                const randomIndex = Math.floor(Math.random() * Math.min(5, results.length));
                youtubeSearchResults = results;
                playYouTubeSong(randomIndex);
                return;
            }
        } catch (e) {
            console.log('[HEART] Uplift search failed, continuing with vibe shuffle');
        }
    }
    
    // Detect vibes from current song
    const detectedVibes = detectVibeKeywords(currentTitle);
    if (detectedVibes.length > 0) {
        console.log('[Vibe Shuffle] 🧠 Detected vibes:');
        detectedVibes.forEach(v => {
            console.log(`   → "${v.matchedWord}" = ${v.category} (${v.vibeType})`);

        });
    } else {
        console.log('[Vibe Shuffle] 🧠 No specific vibe keywords detected');
    }
    
    console.log('[Vibe Shuffle] ⏱️ Finding next song...');
    
    try {
        // Get related videos from YouTube
        const fetchStart = performance.now();
        const relatedVideos = await fetchRelatedVideos(currentVideoId);
        const fetchTime = (performance.now() - fetchStart).toFixed(0);
        console.log(`[Vibe Shuffle] ⏱️ API fetch: ${fetchTime}ms`);
        
        if (!relatedVideos || relatedVideos.length === 0) {
            console.log('[Vibe Shuffle] No related videos, using search list');
            if (youtubeSearchResults.length > 0) {
                const nextIndex = (currentSongIndex + 1) % youtubeSearchResults.length;
                playYouTubeSong(nextIndex);
            }
            return;
        }
        
        // Filter for music only and remove already played
        const filterStart = performance.now();
        
        const musicVideos = relatedVideos.filter(video => {
            const title = video.snippet.title.toLowerCase();
            const videoId = video.id.videoId || video.id;
            
            // Skip if already played recently
            if (lastPlayedVideoIds.includes(videoId)) return false;
            
            // Skip same video as current
            if (videoId === currentVideoId) return false;
            
            // Filter out non-music content
            if (title.includes('trailer') || title.includes('teaser')) return false;
            if (title.includes('behind the scenes') || title.includes('making of')) return false;
            if (title.includes('interview') || title.includes('reaction')) return false;
            if (title.includes('gameplay') || title.includes('walkthrough')) return false;
            if (title.includes('review') || title.includes('explained')) return false;
            
            // ✅ Jukebox, Nonstop, Top Lists - NOW ALLOWED
            // User wants these: "Sundar Kand", "Ramayan", "Romantic Jukebox" are valid content!
            // Long devotional/spiritual content (2-3 hours) is intentional and valid
            
            // 🚫 Skip SLOW REVERB - too drastic vibe shift
            if (title.includes('slowed') && title.includes('reverb')) return false;
            if (title.includes('8d audio') || title.includes('8d song')) return false;
            
            // ✅ LOFI - Now ALLOWED as mood transition bridge!
            // LoFi is perfect for: sad → chill → happy (gradual uplift)
            // Don't skip: if (title.includes('lofi') || title.includes('lo-fi')) return false;
            
            // 💓 HEART: Use LoFi as bridge when transitioning from sad mood
            const heartMood = HEART.getDominantSessionMood();
            if (heartMood === 'sad' && (title.includes('lofi') || title.includes('lo-fi'))) {
                console.log('[HEART] 🌉 LoFi bridge allowed for mood transition');
                // Allow LoFi to play as bridge
            }
            
            // 🚫 Skip BHAJAN / DEVOTIONAL when coming from party songs
            // This prevents sudden mood shift from party → bhakti
            const currentMood = vibeHistory.length > 0 ? vibeHistory[vibeHistory.length - 1] : 'neutral';
            if ((currentMood === 'party' || currentMood === 'love') && 
                (title.includes('bhajan') || title.includes('aarti') || title.includes('bhakti') || 
                 title.includes('krishna') || title.includes('shiva') || title.includes('mantra'))) {
                console.log('[Vibe Shuffle] Skipping devotional (mood is party/love):', title.substring(0, 40));
                return false;
            }
            
            // IMPORTANT: Skip same song different versions
            // Get current song's main identifying words
            const currentTitle = (currentSongData?.title || '').toLowerCase();
            
            // Extract meaningful words (remove common words)
            const commonWords = ['the', 'song', 'video', 'full', 'hd', 'lyrical', 'lyrics', 'audio', 'official', 'from', 'movie', 'film'];
            const getMainWords = (str) => {
                return str.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '')
                    .split(/[\s\-\|:,]+/)
                    .filter(w => w.length > 2 && !commonWords.includes(w))
                    .slice(0, 5); // Take first 5 meaningful words
            };
            
            const currentWords = getMainWords(currentTitle);
            const nextWords = getMainWords(title);
            
            // Check for matching words
            let matchCount = 0;
            for (const word of currentWords) {
                if (nextWords.some(nw => nw.includes(word) || word.includes(nw))) {
                    matchCount++;
                }
            }
            
            // If 1 or more main words match, it's probably same song
            // Being more strict now - even 1 unique word match = same song
            if (matchCount >= 1 && currentWords.length >= 1) {
                console.log('[Vibe Shuffle] Skipping same song (' + matchCount + ' matches):', video.snippet.title.substring(0, 50));
                return false;
            }
            
            // Skip covers, karaoke, remakes
            if (title.includes('cover') || title.includes('karaoke')) return false;
            if (title.includes('remake') || title.includes('reprise')) return false;
            
            // 🧠 INVISIBLE INTELLIGENCE - Filter based on learned preferences
            const channelTitle = video.snippet.channelTitle || '';
            if (InvisibleIntelligence.shouldFilter(title, channelTitle)) {
                console.log('[Vibe Shuffle] 🧠 Intelligence filter:', title.substring(0, 40));
                return false;
            }
            
            return true;
        });
        const filterTime = (performance.now() - filterStart).toFixed(0);
        console.log(`[Vibe Shuffle] ⏱️ Filter: ${filterTime}ms (${musicVideos.length} different songs found)`);
        
        if (musicVideos.length === 0) {
            console.log('[Vibe Shuffle] No suitable music found, using search list');
            if (youtubeSearchResults.length > 0) {
                const nextIndex = (currentSongIndex + 1) % youtubeSearchResults.length;
                playYouTubeSong(nextIndex);
            }
            return;
        }
        
        // Detect current song's mood and apply psychological mood lifting
        const selectStart = performance.now();
        let selectedVideo = selectVibeAwareVideo(musicVideos);
        const selectTime = (performance.now() - selectStart).toFixed(0);
        console.log(`[Vibe Shuffle] ⏱️ Mood analysis & selection: ${selectTime}ms`);
        
        // Play the selected video
        const videoId = selectedVideo.id.videoId || selectedVideo.id;
        
        const totalTime = (performance.now() - startTime).toFixed(0);
        console.log(`[Vibe Shuffle] ✅ Total time: ${totalTime}ms`);
        console.log(`[Vibe Shuffle] 🎵 Playing: ${selectedVideo.snippet.title}`);
        
        // Track this video to prevent repeats
        lastPlayedVideoIds.push(videoId);
        if (lastPlayedVideoIds.length > 20) lastPlayedVideoIds.shift(); // Keep last 20
        
        playVideoById(videoId);
        
    } catch (error) {
        const totalTime = (performance.now() - startTime).toFixed(0);
        console.error(`[Vibe Shuffle] ❌ Error after ${totalTime}ms:`, error);
        // Fallback to search list
        if (youtubeSearchResults.length > 0) {
            const nextIndex = (currentSongIndex + 1) % youtubeSearchResults.length;
            playYouTubeSong(nextIndex);
        }
    }
}

/**
 * Fetch related videos from YouTube API
 */
async function fetchRelatedVideos(videoId) {
    try {
        const API_KEY = CONFIG.getCurrentApiKey();
        if (!API_KEY) {
            console.log('[Vibe Shuffle] No API key available');
            return null;
        }
        
        // Use search with the current video title for related content
        // This works better than relatedToVideoId which is deprecated
        const currentTitle = currentSongData?.title || '';
        let searchQuery = extractMusicKeywords(currentTitle);
        
        // 🧠 INVISIBLE INTELLIGENCE: Boost search with preferred language
        // BUT respect current song's language - don't force Hindi on English songs!
        const currentLanguage = InvisibleIntelligence.detectLanguage(currentTitle, currentSongData?.channelTitle || '');
        let searchBoost = '';
        
        // Only boost if current song matches user's preferred language
        if (currentLanguage === 'hindi' || currentLanguage === 'punjabi') {
            searchBoost = InvisibleIntelligence.getSearchBoost();
            if (searchBoost) {
                searchQuery = `${searchQuery} ${searchBoost}`;
                console.log(`[Invisible Intelligence] 🎯 Search boosted with: ${searchBoost}`);
            }
        } else {
            // English/International song - don't add Hindi boost, let it flow naturally
            console.log(`[Invisible Intelligence] 🌍 International mode - no language boost`);
        }
        
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&maxResults=15&key=${API_KEY}`;
        
        console.log('[Vibe Shuffle] Fetching related:', searchQuery);
        
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
        const randomVibe = detectedVibes[Math.floor(Math.random() * detectedVibes.length)];
        const searchTerm = randomVibe.searchTerms[Math.floor(Math.random() * randomVibe.searchTerms.length)];
        
        console.log(`[Vibe Keywords] 🎯 "${randomVibe.matchedWord}" detected as ${randomVibe.category}`);
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
    
    artist = artist.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
    
    if (artist && artist.length > 2) {
        console.log('[Vibe Shuffle] Searching by artist:', artist);
        return artist + ' best songs';
    }
    
    // Final fallback
    const words = cleaned.split(' ').filter(w => w.length > 2).slice(0, 2);
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
    const sadWords = ['sad', 'cry', 'tears', 'broken', 'pain', 'hurt', 'alone', 'lonely', 
        'heartbreak', 'miss you', 'goodbye', 'lost', 'gone', 'leave', 'without you',
        'dard', 'dil', 'judai', 'bewafa', 'tanha', 'alvida', 'roya', 'aansu'];
    
    // Happy/Party indicators
    const happyWords = ['happy', 'party', 'dance', 'celebration', 'fun', 'joy', 'excited',
        'nachle', 'party', 'masti', 'dhamaal', 'badshah', 'honey singh', 'punjabi'];
    
    // Love indicators
    const loveWords = ['love', 'romance', 'romantic', 'pyaar', 'ishq', 'mohabbat', 
        'valentine', 'sweetheart', 'darling', 'janam', 'sanam'];
    
    // Chill indicators
    const chillWords = ['chill', 'relax', 'peaceful', 'calm', 'sleep', 'night', 'soft',
        'acoustic', 'unplugged', 'lofi', 'sukoon'];
    
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
    
    console.log('[Vibe Shuffle] Current mood:', currentMood, '| Sad streak:', consecutiveSadCount);
    
    // Psychological mood lifting: After 5 sad songs, start blending happier vibes
    if (consecutiveSadCount >= 5) {
        console.log('[Vibe Shuffle] 🌈 Mood lifting activated - introducing positive vibes');
        
        // Find a love or happy song to blend in
        const upliftingVideo = videos.find(v => {
            const mood = detectSongMood(v.snippet.title);
            return mood === 'love' || mood === 'happy' || mood === 'chill';
        });
        
        if (upliftingVideo) {
            // Reduce sad count slowly (gradual transition)
            consecutiveSadCount = Math.max(0, consecutiveSadCount - 2);
            return upliftingVideo;
        }
    }
    
    // Default: Pick randomly from available songs for maximum variety
    // This ensures different songs each time, not predictable sequence
    const randomIndex = Math.floor(Math.random() * videos.length);
    console.log('[Vibe Shuffle] 🎲 Random pick from', videos.length, 'songs');
    return videos[randomIndex];
}

function playPrevious() {
    if (currentPlatform === 'youtube' && youtubeSearchResults.length > 0) {
        const prevIndex = currentSongIndex - 1 < 0 ? youtubeSearchResults.length - 1 : currentSongIndex - 1;
        playYouTubeSong(prevIndex);
    } else if (currentPlatform === 'local' && localFiles.length > 0) {
        const prevIndex = currentSongIndex - 1 < 0 ? localFiles.length - 1 : currentSongIndex - 1;
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
    document.querySelectorAll('.platform-tabs .nav-link').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-platform="${platform}"]`).classList.add('active');
    
    // Update content
    document.getElementById('youtubeContent').style.display = platform === 'youtube' ? 'block' : 'none';
    document.getElementById('libraryContent').style.display = platform === 'library' ? 'block' : 'none';
    
    // Load library when switching to library tab
    if (platform === 'library') {
        displayLibrarySongs();
    }
    
    // Show recently played when switching to YouTube tab
    if (platform === 'youtube') {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput || !searchInput.value.trim()) {
            displayPlayHistory();
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
    
    document.getElementById('currentSongTitle').textContent = title;
    document.getElementById('currentSongArtist').textContent = artist;
    
    const albumArt = document.getElementById('albumArt');
    if (thumbnail) {
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
    document.getElementById('currentSongTitle').textContent = 'No song playing';
    document.getElementById('currentSongArtist').textContent = 'Select a song to play';
    document.getElementById('albumArt').innerHTML = '<i class="bi bi-music-note-beamed"></i>';
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

// Dynamic Tonearm Position - calculates arm length based on vinyl position
// Base stays fixed at screen right, arm stretches to reach vinyl grooves
function updateTonearmPosition() {
    const tonearm = document.getElementById('tonearm');
    const tonearmArm = document.getElementById('tonearmArm');
    const vinylDisc = document.getElementById('vinylDisc');
    const playerArea = document.querySelector('.player-area');
    
    if (!tonearm || !tonearmArm || !playerArea) return;
    
    // Get player area dimensions
    const playerRect = playerArea.getBoundingClientRect();
    const playerCenterX = playerRect.width / 2;
    
    // Get vinyl disc size (or use platter if disc not loaded)
    const vinyl = vinylDisc || document.getElementById('turntablePlatter');
    const vinylWidth = vinyl ? vinyl.offsetWidth : 400;
    const vinylRadius = vinylWidth / 2;
    
    // Tonearm base is fixed at right edge (30px from right)
    // Needle should reach vinyl outer grooves (radius + some offset for grooves area)
    // Arm length = distance from base to vinyl grooves
    const basePosition = 30; // Right offset of tonearm base
    const grooveOffset = 80; // How far into grooves the needle should reach
    
    // Calculate required arm length
    // From right edge to center = playerCenterX
    // From center to groove = vinylRadius - grooveOffset (inner part of grooves)
    const armLength = (playerRect.width - basePosition) - playerCenterX + (vinylRadius - grooveOffset);
    
    // Apply with min/max limits
    const clampedArmLength = Math.max(150, Math.min(600, armLength));
    tonearmArm.style.width = clampedArmLength + 'px';
    
    console.log('[Tonearm] 🎵 Arm length updated:', Math.round(clampedArmLength) + 'px', 
                '(Screen:', playerRect.width + 'px, Vinyl:', vinylWidth + 'px)');
}

// Initialize and update tonearm on various events
function initDynamicTonearm() {
    // Initial calculation
    setTimeout(updateTonearmPosition, 100);
    
    // Update on window resize
    window.addEventListener('resize', debounce(updateTonearmPosition, 150));
    
    // Update on fullscreen change
    document.addEventListener('fullscreenchange', () => {
        setTimeout(updateTonearmPosition, 300);
    });
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

// Progress Updates
function updateProgress() {
    if (player && player.getCurrentTime && player.getDuration) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('progressSlider').value = progress;
            
            document.getElementById('currentTime').textContent = formatTime(currentTime);
            document.getElementById('totalTime').textContent = formatTime(duration);
            
            // Update telescopic tonearm
            updateTelescopicTonearm(progress);
        }
    }
}

function updateLocalProgress() {
    if (audioPlayer.duration) {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        
        const progress = (currentTime / duration) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressSlider').value = progress;
        
        document.getElementById('currentTime').textContent = formatTime(currentTime);
        document.getElementById('totalTime').textContent = formatTime(duration);
        
        // Update telescopic tonearm
        updateTelescopicTonearm(progress);
    }
}

// Telescopic Tonearm - retracts as song progresses (like needle moving to center)
function updateTelescopicTonearm(progress) {
    const segment1 = document.querySelector('.arm-segment.segment-1');
    const segment2 = document.querySelector('.arm-segment.segment-2');
    const segment3 = document.querySelector('.arm-segment.segment-3');
    const tonearmHead = document.getElementById('tonearmHead');
    const tonearmArm = document.getElementById('tonearmArm');
    
    if (!segment1 || !segment2 || !segment3 || !tonearmArm) return;
    
    // Calculate retraction: 100% song = 30% retracted (arm shrinks from 100% to 70%)
    const retractionAmount = (progress / 100) * 30; // Max 30% retraction
    
    // Each segment retracts proportionally
    const seg1Width = 100 - retractionAmount;
    const seg2Width = 75 - (retractionAmount * 0.7);
    const seg3Width = 50 - (retractionAmount * 0.5);
    
    segment1.style.width = seg1Width + '%';
    segment2.style.width = seg2Width + '%';
    segment3.style.width = seg3Width + '%';
    
    // Move the head along with the retraction
    if (tonearmHead) {
        const armWidth = tonearmArm.offsetWidth;
        const headOffset = -13 + (armWidth * retractionAmount / 100);
        tonearmHead.style.left = headOffset + 'px';
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// Vinyl Animation
function startVinylAnimation() {
    const vinylDisc = document.getElementById('vinylDisc');
    const tonearm = document.getElementById('tonearm');
    
    // Add spinning class after slide-up animation completes (1200ms)
    setTimeout(() => {
        vinylDisc.classList.add('spinning');
        tonearm.classList.add('playing');
    }, 1200);
}

function stopVinylAnimation() {
    document.getElementById('vinylDisc').classList.remove('spinning');
    document.getElementById('tonearm').classList.remove('playing');
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
    } else {
        appScreen.classList.remove('fullscreen-mode');
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
    }
}

document.addEventListener('fullscreenchange', function() {
    const appScreen = document.getElementById('appScreen');
    if (!document.fullscreenElement) {
        appScreen.classList.remove('fullscreen-mode');
    }
});

// Mobile Sliding Search Functions
let mobileSearchOpen = false;

function openMobileSearch() {
    const slidingSearch = document.getElementById('mobileSlidingSearch');
    const searchInput = document.getElementById('mobileSlideSearchInput');
    const appScreen = document.getElementById('appScreen');
    
    slidingSearch.classList.add('show');
    appScreen.classList.add('search-active');
    mobileSearchOpen = true;
    
    // Auto-focus with slight delay for animation
    setTimeout(() => {
        searchInput.focus();
    }, 100);
}

function closeMobileSearch() {
    const slidingSearch = document.getElementById('mobileSlidingSearch');
    const searchInput = document.getElementById('mobileSlideSearchInput');
    const appScreen = document.getElementById('appScreen');
    
    slidingSearch.classList.remove('show');
    appScreen.classList.remove('search-active');
    mobileSearchOpen = false;
    searchInput.blur();
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

// Scroll listener for auto-showing search (80px threshold)
let lastScrollY = 0;
function initMobileScrollSearch() {
    const playerArea = document.querySelector('.player-area');
    const sidebar = document.getElementById('sidebar');
    
    // Listen on multiple scroll containers
    [window, playerArea, sidebar].forEach(element => {
        if (element) {
            element.addEventListener('scroll', handleMobileScroll, { passive: true });
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
document.addEventListener('click', function(e) {
    const profileMenu = document.getElementById('mobileProfileMenu');
    const profileIcon = document.querySelector('.mobile-profile-icon');
    
    if (profileMenu && profileMenu.classList.contains('show')) {
        if (!profileMenu.contains(e.target) && !profileIcon.contains(e.target)) {
            closeMobileProfileMenu();
        }
    }
});

// Initialize mobile scroll search on DOM ready
document.addEventListener('DOMContentLoaded', initMobileScrollSearch);

// Sliding Search Function (new mobile search)
async function performSlideSearch() {
    const query = document.getElementById('mobileSlideSearchInput').value.trim();
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
        songList.innerHTML = '<div class="loading"><i class="bi bi-hourglass-split"></i><p>Searching...</p></div>';
        
        try {
            const results = await searchYouTube(query);
            displayYouTubeResults(results);
        } catch (error) {
            console.error('Slide search error:', error);
            songList.innerHTML = '<div class="error-message"><i class="bi bi-exclamation-triangle"></i><p>Search failed</p></div>';
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
    mobileSongList.innerHTML = '<div class="loading"><i class="bi bi-heart-pulse"></i><p>💫 HEART Syncing: ' + query + '</p></div>';
    
    try {
        const results = await searchYouTube(query);
        displayMobileYouTubeResults(results);
    } catch (error) {
        console.error('Mobile search error:', error);
        mobileSongList.innerHTML = '<div class="error-message"><i class="bi bi-exclamation-triangle"></i><p>Failed to search. ' + error.message + '</p></div>';
    }
}

function displayMobileYouTubeResults(results) {
    youtubeSearchResults = results;
    const mobileSongList = document.getElementById('mobileSongList');
    
    if (results.length === 0) {
        mobileSongList.innerHTML = '<div class="error-message"><p>No results found</p></div>';
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

// Share Function - Direct URL Copy to Clipboard with Rotating Banners
function shareSong() {
    const songTitle = document.getElementById('currentSongTitle').textContent;
    const songArtist = document.getElementById('currentSongArtist').textContent;
    
    if (songTitle === 'No song playing') {
        showStatus('Play a song first', 2000);
        return;
    }
    
    // Generate deep link URL with UTM parameters for analytics
    let shareUrl = 'https://play.creativepixels.in/';
    
    if (currentPlatform === 'youtube' && currentVideoId) {
        // Share with video ID for direct playback + UTM tracking
        shareUrl += `?v=${currentVideoId}&utm_source=share&utm_medium=social&utm_campaign=song_share`;
    } else if (currentPlatform === 'local') {
        // For local files, share the base URL with song name as query
        shareUrl += `?q=${encodeURIComponent(songTitle)}&utm_source=share&utm_medium=social&utm_campaign=song_share`;
    }
    
    // 🎨 Rotate banner for OG meta tag (for WhatsApp/social preview)
    rotateBannerForShare();
    
    // Direct copy to clipboard - no dialogs!
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('🔗 Link copied! Paste anywhere to share');
            console.log('Share URL copied:', shareUrl);
        }).catch((error) => {
            console.log('Clipboard error:', error);
            showStatus('Copy failed', 2000);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('🔗 Link copied! Paste anywhere to share');
        } catch (err) {
            showStatus('Copy failed', 2000);
        }
        document.body.removeChild(textArea);
    }
}

// 🎧 REAL LISTENING TIME - Send to Google Analytics 4
function sendListeningTimeToGA4() {
    const sessionDuration = (Date.now() - listeningSession.sessionStart) / 1000; // seconds
    
    // Send custom event to GA4
    if (typeof gtag === 'function') {
        gtag('event', 'actual_listening_time', {
            'total_seconds': Math.round(listeningSession.totalListenedTime),
            'songs_played': listeningSession.songsPlayed,
            'session_duration_seconds': Math.round(sessionDuration),
            'avg_per_song': listeningSession.songsPlayed > 0 
                ? Math.round(listeningSession.totalListenedTime / listeningSession.songsPlayed) 
                : 0
        });
        console.log('[Listening] 📊 Sent to GA4: ' + Math.round(listeningSession.totalListenedTime) + 's across ' + listeningSession.songsPlayed + ' songs');
    }
}

// Send listening time when user leaves page
window.addEventListener('beforeunload', function() {
    // Capture any remaining listening time
    if (listeningSession.startTime > 0) {
        listeningSession.totalListenedTime += (Date.now() - listeningSession.startTime) / 1000;
    }
    
    if (listeningSession.totalListenedTime > 0) {
        sendListeningTimeToGA4();
        console.log('[Listening] 👋 Final session: ' + listeningSession.totalListenedTime.toFixed(1) + 's, ' + listeningSession.songsPlayed + ' songs');
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
    
    const bannerNumber = String(SHARE_BANNER_CONFIG.currentIndex).padStart(3, '0');
    
    // Check if we already know the extension for this banner
    if (SHARE_BANNER_CONFIG.cachedBanners.has(bannerNumber)) {
        const cachedUrl = SHARE_BANNER_CONFIG.cachedBanners.get(bannerNumber);
        updateOGBanner(cachedUrl);
        console.log(`[ShareBanner] 🎨 Rotated to banner ${bannerNumber} (cached)`);
        return;
    }
    
    // Try all extensions to find the banner
    findBannerWithAnyExtension(bannerNumber)
        .then(foundUrl => {
            if (foundUrl) {
                updateOGBanner(foundUrl);
                SHARE_BANNER_CONFIG.cachedBanners.set(bannerNumber, foundUrl);
                console.log(`[ShareBanner] 🎨 Rotated to banner ${bannerNumber}`);
            } else {
                // Banner doesn't exist, reset to 001
                console.log(`[ShareBanner] Banner ${bannerNumber} not found, using 001`);
                SHARE_BANNER_CONFIG.currentIndex = 1;
                findBannerWithAnyExtension('001').then(fallbackUrl => {
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
        
        extensions.forEach(ext => {
            const url = baseUrl + ext;
            checkBannerExists(url).then(exists => {
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
    
    checkBannerExists(jpegUrl).then(exists => {
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
    
    formats.forEach(ext => {
        const url = `https://play.creativepixels.in/${SHARE_BANNER_CONFIG.basePath}${bannerNumber}${ext}`;
        checkBannerExists(url).then(exists => {
            checked++;
            if (exists && !found) {
                found = true;
                SHARE_BANNER_CONFIG.cachedBanners.set(bannerNumber, url);
                console.log(`[ShareBanner] ✓ Banner ${bannerNumber}${ext} cached`);
                preloadBannerSequentially(index + 1);
            } else if (checked === formats.length && !found) {
                // No more banners found, stop here
                console.log(`[ShareBanner] ✅ Found ${SHARE_BANNER_CONFIG.cachedBanners.size} banners total`);
            }
        });
    });
}

// Disc Animation Function
function triggerDiscAnimation() {
    const vinylDisc = document.querySelector('.vinyl-disc');
    const tonearm = document.querySelector('.tonearm');
    
    // Reset animation by removing classes
    vinylDisc.classList.remove('loaded', 'spinning');
    tonearm.classList.remove('visible');
    
    // Force reflow to restart animation
    void vinylDisc.offsetWidth;
    
    // Add classes to trigger slide-up animation
    setTimeout(() => {
        vinylDisc.classList.add('loaded');
        tonearm.classList.add('visible');
    }, 50);
}

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Use relative path to work in subdirectories
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('[App] Service Worker registered:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    console.log('[App] Service Worker update found');
                });
            })
            .catch(error => {
                console.log('[App] Service Worker registration failed:', error);
            });
    }
}

// Media Session API for Background Playback
function initializeMediaSession() {
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

// Update Media Session Metadata
function updateMediaSessionMetadata(title, artist, artwork) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Unknown Track',
            artist: artist || 'Unknown Artist',
            album: 'Pixel Music',
            artwork: artwork ? [
                { src: artwork, sizes: '96x96', type: 'image/jpeg' },
                { src: artwork, sizes: '128x128', type: 'image/jpeg' },
                { src: artwork, sizes: '192x192', type: 'image/jpeg' },
                { src: artwork, sizes: '256x256', type: 'image/jpeg' },
                { src: artwork, sizes: '384x384', type: 'image/jpeg' },
                { src: artwork, sizes: '512x512', type: 'image/jpeg' }
            ] : []
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
    getAll: function() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading library:', error);
            return [];
        }
    },
    
    // Save item to library
    save: function(item) {
        try {
            const library = this.getAll();
            
            // Check if already exists
            const exists = library.some(song => song.id === item.id);
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
    remove: function(id) {
        try {
            let library = this.getAll();
            library = library.filter(song => song.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(library));
            return true;
        } catch (error) {
            console.error('Error removing from library:', error);
            return false;
        }
    },
    
    // Check if item is in library
    isInLibrary: function(id) {
        const library = this.getAll();
        return library.some(song => song.id === id);
    },
    
    // Clear entire library
    clearAll: function() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing library:', error);
            return false;
        }
    }
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
            const libraryTab = document.querySelector('[data-bs-target="#library"]');
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
            thumbnail: thumbnail
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
                trackRemoveFromLibrary(currentSongData.title, currentSongData.artist);
            }
        }
    } else {
        // Add to library
        const item = {
            id: currentVideoId,
            source: 'youtube',
            title: currentSongData.title,
            artist: currentSongData.artist,
            thumbnail: currentSongData.thumbnail
        };
        
        if (libraryManager.save(item)) {
            controlsHeartBtn.classList.add('active');
            controlsHeartBtn.querySelector('i').className = 'bi bi-heart-fill';
            showStatus('Added to Library ♡', 2000);
            
            if (typeof trackAddToLibrary === 'function') {
                trackAddToLibrary(currentSongData.title, currentSongData.artist);
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
        existingSongs.forEach(song => song.remove());
        return;
    }
    
    // Hide empty state
    emptyLibrary.style.display = 'none';
    if (clearLibraryBtn) clearLibraryBtn.style.display = 'inline-block';
    
    // Remove existing songs before adding new ones
    const existingSongs = librarySongList.querySelectorAll('.song-item');
    existingSongs.forEach(song => song.remove());
    
    library.forEach((item) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        
        // Build onclick based on source
        let onclick = '';
        if (item.source === 'youtube') {
            onclick = `playLibrarySong('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${item.artist.replace(/'/g, "\\'")}', '${item.thumbnail}')`;
        } else if (item.source === 'local') {
            onclick = `playLibraryLocalSong('${item.id}', '${item.title.replace(/'/g, "\\'").replace(/"/g, '\\"')}')`;
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
        thumbnail: thumbnail
    };
    
    // Save to play history
    saveToPlayHistory({
        videoId: videoId,
        title: title,
        channel: artist,
        thumbnail: thumbnail
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
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.song-item')?.classList.add('active');
}

// Play local song from library
function playLibraryLocalSong(fileUrl, title) {
    // Find the file in localFiles array
    const fileIndex = localFiles.findIndex(f => f.url === fileUrl);
    if (fileIndex !== -1) {
        playLocalFile(fileIndex);
    } else {
        showStatus('File not available', 2000);
    }
}

// Clear entire library
function clearLibrary() {
    if (confirm('Are you sure you want to clear your entire Records Library? This cannot be undone.')) {
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
    
    allHeartButtons.forEach(btn => {
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

// Legacy showToast - redirects to showStatus (for any remaining calls)
function showToast(message, type = 'success') {
    // Skip "Playing:" messages entirely
    if (message.includes('Playing:') || message.includes('🎵 Playing')) {
        return;
    }
    // Show other messages in status area
    showStatus(message, 2500);
}

// Recently Played Feature
function saveToPlayHistory(song) {
    const MAX_HISTORY = 20;
    let history = JSON.parse(localStorage.getItem('playHistory') || '[]');
    
    // Remove duplicates (same videoId or title)
    history = history.filter(item => 
        item.videoId !== song.videoId && item.title !== song.title
    );
    
    // Add new song at the beginning
    history.unshift({
        ...song,
        playedAt: Date.now()
    });
    
    // Keep only last 20 songs
    history = history.slice(0, MAX_HISTORY);
    
    localStorage.setItem('playHistory', JSON.stringify(history));
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
            <button class="song-heart-btn" onclick="event.stopPropagation(); toggleLibraryHeart('youtube', '${song.videoId}', '${song.title.replace(/'/g, "\\'")}', '${song.channel.replace(/'/g, "\\'")}', '${song.thumbnail}', this);" title="Add to Records Library">
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
        thumbnail: song.thumbnail
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
            suggestedQuality: 'small'
        });
        
        // Update player UI with song info and album art
        updateSongInfo(song.title, song.channel, song.thumbnail);
        
        // Update media session
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.channel,
                artwork: [{ src: song.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
            });
        }
        
        // Manually set playing state and start animation
        isPlaying = true;
        isBuffering = true; // Set buffering true until PLAYING state received
        triggerDiscAnimation(); // Slide up the disc
        startVinylAnimation();  // Start spinning
        updatePlayButton();
        
        // Set loading timeout (20 seconds) - only skip if still buffering (PLAYING state not received)
        loadingTimeout = setTimeout(() => {
            if (isBuffering) {
                console.log('Song loading timeout - still buffering after 20s, skipping...');
                showStatus('Timeout, skipping...', 1500);
                
                isPlaying = false;
                isBuffering = false;
                stopVinylAnimation();
                updatePlayButton();
                
                const autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
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
        console.log(`Waiting for YouTube player... attempt ${attempts + 1}/${maxAttempts}`);
        setTimeout(() => waitForPlayerAndPlay(videoId, attempts + 1), 500);
    } else {
        // Store the video ID to play when player becomes ready
        console.log('Player not ready after max attempts, storing for later:', videoId);
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
                        if (player.getPlayerState && player.getPlayerState() !== 1) {
                            player.playVideo();
                            isPlaying = true;
                            updatePlayButton();
                            startVinylAnimation();
                        }
                        
                        // If pending video exists, load and play it
                        if (pendingDeepLinkVideoId && player.loadVideoById) {
                            console.log('Playing pending deep link video on tap:', pendingDeepLinkVideoId);
                            playVideoById(pendingDeepLinkVideoId);
                            pendingDeepLinkVideoId = null;
                        }
                    }
                    
                    document.removeEventListener('click', playOnTap);
                    document.removeEventListener('touchstart', playOnTap);
                };
                document.addEventListener('click', playOnTap, { once: true });
                document.addEventListener('touchstart', playOnTap, { once: true });
                
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
                        if (autoplay !== 'false' && youtubeSearchResults.length > 0) {
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

// Play video directly by ID (for deep links)
function playVideoById(videoId, retryCount = 0) {
    console.log('Playing video by ID:', videoId);
    
    // Check if API key is available
    const apiKey = CONFIG.getCurrentApiKey();
    if (!apiKey) {
        console.log('All API keys exhausted, but still trying to play video...');
        // Even without API key, we can still play the video!
        if (player && player.loadVideoById) {
            currentPlatform = 'youtube';
            currentVideoId = videoId;
            currentSongData = {
                videoId: videoId,
                title: 'Now Playing',
                artist: 'Pixel Play',
                channelTitle: 'Pixel Play',
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            };
            
            updateSongInfo('Now Playing', 'Pixel Play', `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
            player.loadVideoById(videoId);
            
            // Robust autoplay with retries
            player.playVideo();
            const retryDelays = [100, 500, 1000];
            retryDelays.forEach(delay => {
                setTimeout(() => {
                    if (player && player.getPlayerState && player.playVideo) {
                        const state = player.getPlayerState();
                        if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.ENDED) {
                            player.playVideo();
                        }
                    }
                }, delay);
            });
            
            isPlaying = true;
            updatePlayButton();
            triggerDiscAnimation(); // Slide up the disc
            startVinylAnimation();  // Start spinning
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
        .then(response => {
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
        .then(data => {
            if (!data) return; // Retry in progress
            
            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                const title = decodeHtmlEntities(video.snippet.title);
                const channel = decodeHtmlEntities(video.snippet.channelTitle);
                const thumbnail = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url;
                
                // Store current song data
                currentPlatform = 'youtube';
                currentVideoId = videoId;
                currentSongData = {
                    videoId: videoId,
                    title: title,
                    artist: channel,
                    channelTitle: channel, // For Intelligence tracking
                    thumbnail: thumbnail
                };
                
                // 🧠 INTELLIGENCE: Reset song start time for new song
                songStartTime = Date.now();
                
                // Save to play history
                saveToPlayHistory({
                    videoId: videoId,
                    title: title,
                    channel: channel,
                    thumbnail: thumbnail
                });
                
                // Update player UI
                updateSongInfo(title, channel, thumbnail);
                
                // Load video in player
                if (player && player.loadVideoById) {
                    player.loadVideoById(videoId);
                    
                    // Robust autoplay with multiple retry attempts
                    player.playVideo();
                    const playRetryIntervals = [100, 300, 500, 1000, 2000];
                    playRetryIntervals.forEach((delay) => {
                        setTimeout(() => {
                            if (player && player.getPlayerState && player.playVideo) {
                                const state = player.getPlayerState();
                                if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.ENDED) {
                                    console.log(`[Autoplay Retry] playVideoById retry at ${delay}ms, state: ${state}`);
                                    player.playVideo();
                                }
                            }
                        }, delay);
                    });
                    
                    isPlaying = true;
                    isBuffering = true;
                    updatePlayButton();
                    triggerDiscAnimation(); // Slide up the disc
                    startVinylAnimation();  // Start spinning
                } else {
                    // Player not ready, wait and retry
                    console.log('Player not ready in playVideoById, waiting...');
                    showStatus('Loading player...', 0);
                    setTimeout(() => {
                        if (player && player.loadVideoById) {
                            player.loadVideoById(videoId);
                            
                            // Robust autoplay with retries
                            player.playVideo();
                            setTimeout(() => {
                                if (player && player.getPlayerState && player.playVideo) {
                                    const state = player.getPlayerState();
                                    if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.ENDED) {
                                        player.playVideo();
                                    }
                                }
                            }, 500);
                            
                            isPlaying = true;
                            isBuffering = true;
                            updatePlayButton();
                            triggerDiscAnimation(); // Slide up the disc
                            startVinylAnimation();  // Start spinning
                        } else {
                            showStatus('Player error', 3000);
                        }
                    }, 3000);
                }
            } else {
                showStatus('Video not found', 3000);
            }
        })
        .catch(error => {
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
                    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                };
                
                // Use YouTube thumbnail directly
                updateSongInfo('Loading...', 'Pixel Play', `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
                
                // Load and play with robust retry
                player.loadVideoById(videoId);
                player.playVideo();
                
                // Retry playback if needed
                const retryDelays = [100, 500, 1000];
                retryDelays.forEach(delay => {
                    setTimeout(() => {
                        if (player && player.getPlayerState && player.playVideo) {
                            const state = player.getPlayerState();
                            if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.ENDED) {
                                player.playVideo();
                            }
                        }
                    }, delay);
                });
                
                isPlaying = true;
                updatePlayButton();
                triggerDiscAnimation(); // Slide up the disc
                startVinylAnimation();  // Start spinning
                
                showStatus('🎵 Playing...', 2000);
            } else {
                showStatus('Player not ready', 3000);
            }
        });
}

// Initialize library on page load
document.addEventListener('DOMContentLoaded', function() {
    updateLibraryCount();
    
    // Show recently played on load
    displayPlayHistory();
    
    // 🎨 Preload share banners in background (like API keys warming up)
    setTimeout(preloadShareBanners, 2000);
});
