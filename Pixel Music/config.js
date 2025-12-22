const CONFIG = {
    // Multiple API keys from DIFFERENT projects
    // Each key = 10,000 units/day, Search = 100 units, Video fetch = 1 unit
    // Total: 12 keys = 120,000 units/day = 1200 searches/day 🔥
    YOUTUBE_API_KEYS: [
        'AIzaSyDY-ufmQhtcervNNLQRL1OkYJt9CfAbz6E',  // Project 1 - PixelNote
        'AIzaSyAeBB7Da04VZ6gyF4g3gHyaf0uu7-yyttA',  // Project 2
        'AIzaSyDZE9p4o_LkZ1ClL094qaxK5WjMi1IYHMU',  // Project 3
        'AIzaSyBejhc4Oq83on2quN6Jx-PuZOpIODTMmnM',  // Project 4 - Pixel Play
        'AIzaSyBkc3RFpdzD0L8gKqkLVTB7IQMg18PtMvw',  // Project 5 - Pixel Play
        'AIzaSyB1cylUD4nnkcgCYu_8UCLt-Sch4-8mzRg',  // Project 6 - Pixel Play
        'AIzaSyAInWrwKtZ_28uhkY8SuoAVuQtSFOAKQ0Q',  // Project 7 - Pixel Play
        'AIzaSyCWplX5A7I1PxtXaic4dDtKcEL5jv0UhoA',  // Project 8 - Pixel Play
        'AIzaSyCQdPvCZ6GBui6RprW4HhnPjAn19Mqv-54',  // Project 9 - Pixel Play
        'AIzaSyAWhmVyr-GGhmBgUqR6BGFXx6E-zUp5m7A',  // Project 10 - Pixel Play
        'AIzaSyDup7mdzLCmqC3tzm-i0FHJYoM4NNrxuF0',  // Project 11 - Pixel Play
        'AIzaSyASOKxqyeFiYRHGvtRGxomCzhlfMtRJCDU'   // Project 12 - Pixel Play
    ],
    INITIAL_SEARCH_RESULTS: 8,  // Show 8 results initially (saves quota)
    MAX_SEARCH_RESULTS: 15,     // Load more on scroll
    CURRENT_KEY_INDEX: 0,  // Tracks which key to use
    EXHAUSTED_KEYS: [],    // Track which keys are exhausted today
    GOOGLE_CLIENT_ID: '469366716838-3140k3fu6lqrrj7uvfv11u8a29jdsrvb.apps.googleusercontent.com',
    DEFAULT_VOLUME: 50,
    
    // Helper function to get current API key
    getCurrentApiKey() {
        // Check if all keys are exhausted
        if (this.EXHAUSTED_KEYS.length >= this.YOUTUBE_API_KEYS.length) {
            return null; // All keys exhausted
        }
        
        // Skip exhausted keys
        while (this.EXHAUSTED_KEYS.includes(this.CURRENT_KEY_INDEX)) {
            this.CURRENT_KEY_INDEX = (this.CURRENT_KEY_INDEX + 1) % this.YOUTUBE_API_KEYS.length;
        }
        
        return this.YOUTUBE_API_KEYS[this.CURRENT_KEY_INDEX];
    },
    
    // Mark current key as exhausted
    markKeyExhausted() {
        if (!this.EXHAUSTED_KEYS.includes(this.CURRENT_KEY_INDEX)) {
            this.EXHAUSTED_KEYS.push(this.CURRENT_KEY_INDEX);
            console.log(`API Key ${this.CURRENT_KEY_INDEX + 1} marked as exhausted. ${this.YOUTUBE_API_KEYS.length - this.EXHAUSTED_KEYS.length} keys remaining.`);
        }
    },
    
    // Helper function to rotate to next key
    rotateApiKey() {
        this.markKeyExhausted();
        this.CURRENT_KEY_INDEX = (this.CURRENT_KEY_INDEX + 1) % this.YOUTUBE_API_KEYS.length;
        console.log(`Rotated to API Key ${this.CURRENT_KEY_INDEX + 1}`);
        return this.getCurrentApiKey();
    },
    
    // Check if all keys are exhausted
    allKeysExhausted() {
        return this.EXHAUSTED_KEYS.length >= this.YOUTUBE_API_KEYS.length;
    },
    
    // Reset exhausted keys (called at 12:30 PM IST / midnight PST)
    resetExhaustedKeys() {
        this.EXHAUSTED_KEYS = [];
        this.CURRENT_KEY_INDEX = 0;
        console.log('All API keys reset!');
    }
};
