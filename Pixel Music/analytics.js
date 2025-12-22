// Google Analytics Event Tracking for Pixel Music

// Track user login
function trackLogin(method) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'login', {
            method: method
        });
    }
}

// Track song search
function trackSearch(query) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'search', {
            search_term: query
        });
    }
}

// Track song play
function trackSongPlay(title, artist, source) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'play_song', {
            song_title: title,
            artist: artist,
            source: source // 'youtube' or 'library'
        });
    }
}

// Track add to library
function trackAddToLibrary(title, artist) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_library', {
            song_title: title,
            artist: artist
        });
    }
}

// Track remove from library
function trackRemoveFromLibrary(title, artist) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'remove_from_library', {
            song_title: title,
            artist: artist
        });
    }
}

// Track platform switch
function trackPlatformSwitch(platform) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'switch_platform', {
            platform: platform // 'youtube' or 'library'
        });
    }
}

// Track keyboard shortcut usage
function trackKeyboardShortcut(shortcut) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'keyboard_shortcut', {
            shortcut: shortcut // 'cmd_k', 'space', etc.
        });
    }
}

// Track fullscreen toggle
function trackFullscreen(action) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'fullscreen', {
            action: action // 'enter' or 'exit'
        });
    }
}

// Track lyrics view
function trackLyricsView(title) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_lyrics', {
            song_title: title
        });
    }
}

// Track volume change
function trackVolumeChange(volume) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'volume_change', {
            volume_level: volume
        });
    }
}

// Track playback controls
function trackPlaybackControl(action) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'playback_control', {
            action: action // 'play', 'pause', 'next', 'previous'
        });
    }
}

// Track session duration (call on page unload)
function trackSessionEnd() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'session_end', {
            timestamp: new Date().toISOString()
        });
    }
}

// Track error events
function trackError(errorType, errorMessage) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: errorType + ': ' + errorMessage,
            fatal: false
        });
    }
}

// Initialize session tracking
window.addEventListener('load', function() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'session_start', {
            timestamp: new Date().toISOString()
        });
    }
});

// Track session end on page unload
window.addEventListener('beforeunload', trackSessionEnd);
