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

// Vibe Shuffle System - Smart DJ that keeps users in the right mood
let vibeHistory = []; // Track mood of last songs: 'sad', 'happy', 'love', 'party', 'chill'
let consecutiveSadCount = 0; // Track consecutive sad songs
let isVibeShuffleEnabled = true; // Smart shuffle enabled by default
let lastPlayedVideoIds = []; // Prevent repeats
let songStartTime = 0; // Track when current song started (for skip detection)

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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    registerServiceWorker();
    setSearchPlaceholder();
    
    // Handle deep link parameters for auto-play
    handleDeepLink();
});

function initializeApp() {
    console.log('Initializing app...');
    
    audioPlayer = document.getElementById('audioPlayer');
    
    // Initialize Media Session API for background playback controls
    initializeMediaSession();
    
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
    console.log('YouTube player ready!');
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
        
        // 🧠 INTELLIGENCE: Track when song started
        if (songStartTime === 0) {
            songStartTime = Date.now();
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
    songList.innerHTML = '<div class="loading"><i class="bi bi-hourglass-split"></i><p>Searching YouTube for: ' + query + '</p></div>';
    
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
        // For iOS: unmute and play - iOS requires user gesture
        try {
            player.unMute();
            player.setVolume(100);
        } catch(e) {}
        
        player.loadVideoById(videoId);
        
        // Attempt multiple play calls for iOS compatibility
        player.playVideo();
        
        // iOS sometimes needs a slight delay
        setTimeout(() => {
            if (player && player.playVideo) {
                player.playVideo();
            }
        }, 100);
        
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
            
            // 🚫 Skip SLOW REVERB / LOFI versions - they shift vibe unexpectedly
            if (title.includes('slowed') && title.includes('reverb')) return false;
            if (title.includes('lofi') || title.includes('lo-fi')) return false;
            if (title.includes('8d audio') || title.includes('8d song')) return false;
            
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
        const searchBoost = InvisibleIntelligence.getSearchBoost();
        if (searchBoost) {
            searchQuery = `${searchQuery} ${searchBoost}`;
            console.log(`[Invisible Intelligence] 🎯 Search boosted with: ${searchBoost}`);
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
    mobileSongList.innerHTML = '<div class="loading"><i class="bi bi-hourglass-split"></i><p>Searching YouTube for: ' + query + '</p></div>';
    
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

// Share Function with Deep Link and UTM tracking
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
    
    const shareText = `🎵 Listen to "${songTitle}" by ${songArtist} on Pixel Play!`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: `${songTitle} - Pixel Play`,
            text: shareText,
            url: shareUrl
        }).then(() => {
            console.log('Shared successfully');
            showStatus('Shared!', 2000);
        }).catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare(shareText, shareUrl);
        });
    } else {
        fallbackShare(shareText, shareUrl);
    }
}

function fallbackShare(text, url) {
    // Copy URL to clipboard as fallback
    const copyText = url ? `${text}\n${url}` : text;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(copyText).then(() => {
            showStatus('Link copied!', 2000);
        }).catch(() => {
            showStatus('Share failed', 2000);
        });
    } else {
        showStatus('Share not supported', 2000);
    }
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
        startVinylAnimation();
        updatePlayButton();
    }
    
    // Update UI
    updateSongInfo(title, artist, thumbnail);
    updatePlayButton();
    updateMediaSessionMetadata(title, artist, thumbnail);
    
    // Trigger disc slide-up animation
    triggerDiscAnimation();
    
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
        startVinylAnimation();
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
        console.log('Player ready! Playing video:', videoId);
        // Force play the video
        player.loadVideoById(videoId);
        isPlaying = true;
        updatePlayButton();
        startVinylAnimation();
        
        // Also call playVideoById to update UI and metadata
        playVideoById(videoId);
    } else if (attempts < maxAttempts) {
        console.log(`Waiting for YouTube player... attempt ${attempts + 1}/${maxAttempts}`);
        setTimeout(() => waitForPlayerAndPlay(videoId, attempts + 1), 500);
    } else {
        // Store the video ID to play when player becomes ready
        console.log('Player not ready yet, storing video ID for later:', videoId);
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
                    if (pendingDeepLinkVideoId && player && player.loadVideoById) {
                        console.log('User tapped - playing video');
                        player.loadVideoById(pendingDeepLinkVideoId);
                        player.playVideo();
                        pendingDeepLinkVideoId = null;
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
        showStatus('API limit reached', 3000);
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
                    isPlaying = true;
                    isBuffering = true;
                    updatePlayButton();
                    startVinylAnimation();
                } else {
                    // Player not ready, wait and retry
                    console.log('Player not ready in playVideoById, waiting...');
                    showStatus('Loading player...', 0);
                    setTimeout(() => {
                        if (player && player.loadVideoById) {
                            player.loadVideoById(videoId);
                            isPlaying = true;
                            isBuffering = true;
                            updatePlayButton();
                            startVinylAnimation();
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
            console.error('Error fetching video:', error);
            showStatus('Failed to load', 3000);
        });
}

// Initialize library on page load
document.addEventListener('DOMContentLoaded', function() {
    updateLibraryCount();
    
    // Show recently played on load
    displayPlayHistory();
});
