/**
 * COMPREHENSIVE INDIAN LANGUAGE SUPPORT
 * Supporting 8 major Indian languages + English
 */

export const SUPPORTED_LANGUAGES = {
  en: {
    name: 'English',
    nativeName: 'English',
    code: 'en',
    flag: '🇬🇧',
    speechCode: 'en-IN'
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    code: 'hi',
    flag: '🇮🇳',
    speechCode: 'hi-IN'
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    code: 'bn',
    flag: '🟡',
    speechCode: 'bn-IN'
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    code: 'te',
    flag: '🟢',
    speechCode: 'te-IN'
  },
  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    code: 'mr',
    flag: '🟠',
    speechCode: 'mr-IN'
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    code: 'ta',
    flag: '🔴',
    speechCode: 'ta-IN'
  },
  gu: {
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    code: 'gu',
    flag: '🟡',
    speechCode: 'gu-IN'
  },
  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    code: 'kn',
    flag: '🟡',
    speechCode: 'kn-IN'
  },
  pa: {
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    code: 'pa',
    flag: '🟡',
    speechCode: 'pa-IN'
  }
}

// Translations for UI elements
export const TRANSLATIONS = {
  en: {
    // Header
    appTitle: 'Pi Assistant',
    appSubtitle: 'Your intelligent assistant for India',
    changeLanguage: 'Change Language',
    settings: 'Settings',
    
    // Welcome
    welcomeTitle: '👋 Welcome to Pi Assistant!',
    welcomeSubtitle: 'Try these example queries:',
    
    // Example queries
    examples: [
      'Check pincode 110001',
      'Find IFSC code SBIN0001234',
      'Weather in Delhi',
      'Currency exchange rate',
      'AQI in Mumbai',
      'Fuel price in Bangalore'
    ],
    
    // Common responses
    loading: 'Processing...',
    error: 'Sorry, something went wrong. Please try again.',
    invalidInput: 'Please provide valid input.',
    notFound: 'Information not found.',
    
    // Categories
    documents: 'Documents',
    location: 'Location Services',
    finance: 'Financial Services',
    weather: 'Weather & Environment',
    government: 'Government Services',
    
    // Action buttons
    copy: 'Copy',
    share: 'Share',
    save: 'Save',
    retry: 'Retry',
    
    // Voice
    voiceStart: 'Listening...',
    voiceError: 'Voice recognition failed. Please try again.',
    voiceNotSupported: 'Voice input not supported in your browser.'
  },
  
  hi: {
    // Header
    appTitle: 'Pi सहायक',
    appSubtitle: 'भारत के लिए आपका बुद्धिमान सहायक',
    changeLanguage: 'भाषा बदलें',
    settings: 'सेटिंग्स',
    
    // Welcome
    welcomeTitle: '👋 Pi सहायक में आपका स्वागत है!',
    welcomeSubtitle: 'ये उदाहरण प्रश्न आज़माएं:',
    
    // Example queries
    examples: [
      'पिनकोड 110001 की जानकारी',
      'IFSC कोड SBIN0001234 खोजें',
      'दिल्ली का मौसम',
      'विनिमय दर बताएं',
      'मुंबई का AQI',
      'बैंगलोर में पेट्रोल की कीमत'
    ],
    
    // Common responses
    loading: 'प्रक्रिया में...',
    error: 'माफ़ करें, कुछ गलत हुआ। कृपया फिर से कोशिश करें।',
    invalidInput: 'कृपया वैध जानकारी दें।',
    notFound: 'जानकारी नहीं मिली।',
    
    // Categories
    documents: 'दस्तावेज़',
    location: 'स्थान सेवाएं',
    finance: 'वित्तीय सेवाएं',
    weather: 'मौसम और पर्यावरण',
    government: 'सरकारी सेवाएं',
    
    // Action buttons
    copy: 'कॉपी करें',
    share: 'साझा करें',
    save: 'सेव करें',
    retry: 'पुनः प्रयास',
    
    // Voice
    voiceStart: 'सुन रहा हूं...',
    voiceError: 'आवाज़ पहचान असफल। कृपया पुनः प्रयास करें।',
    voiceNotSupported: 'आपके ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है।'
  },
  
  bn: {
    // Header
    appTitle: 'Pi সহায়ক',
    appSubtitle: 'ভারতের জন্য আপনার বুদ্ধিমান সহায়ক',
    changeLanguage: 'ভাষা পরিবর্তন',
    settings: 'সেটিংস',
    
    // Welcome
    welcomeTitle: '👋 Pi সহায়কে স্বাগতম!',
    welcomeSubtitle: 'এই উদাহরণ প্রশ্নগুলি চেষ্টা করুন:',
    
    // Example queries
    examples: [
      'পিনকোড 110001 চেক করুন',
      'IFSC কোড SBIN0001234 খুঁজুন',
      'দিল্লির আবহাওয়া',
      'মুদ্রার বিনিময় হার',
      'মুম্বাইয়ের AQI',
      'ব্যাঙ্গালোরে জ্বালানির দাম'
    ],
    
    loading: 'প্রক্রিয়াকরণ...',
    error: 'দুঃখিত, কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    copy: 'কপি',
    share: 'শেয়ার',
    save: 'সেভ'
  },
  
  te: {
    // Header
    appTitle: 'Pi సహాయకుడు',
    appSubtitle: 'భారతదేశం కోసం మీ తెలివైన సహాయకుడు',
    changeLanguage: 'భాష మార్చండి',
    settings: 'సెట్టింగ్స్',
    
    // Welcome
    welcomeTitle: '👋 Pi సహాయకుడికి స్వాగతం!',
    welcomeSubtitle: 'ఈ ఉదాహరణ ప్రశ్నలను ప్రయత్నించండి:',
    
    // Example queries
    examples: [
      'పిన్‌కోడ్ 110001 చెక్ చేయండి',
      'IFSC కోడ్ SBIN0001234 కనుగొనండి',
      'ఢిల్లీ వాతావరణం',
      'కరెన్సీ మార్పిడి రేటు',
      'ముంబై AQI',
      'బెంగుళూరులో ఇంధన ధర'
    ],
    
    loading: 'ప్రాసెసింగ్...',
    error: 'క్షమించండి, ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి।',
    copy: 'కాపీ',
    share: 'షేర్',
    save: 'సేవ్'
  },
  
  mr: {
    // Header
    appTitle: 'Pi सहायक',
    appSubtitle: 'भारतासाठी तुमचा बुद्धिमान सहायक',
    changeLanguage: 'भाषा बदला',
    settings: 'सेटिंग्स',
    
    // Welcome
    welcomeTitle: '👋 Pi सहायकामध्ये स्वागत!',
    welcomeSubtitle: 'हे उदाहरण प्रश्न वापरून पहा:',
    
    // Example queries
    examples: [
      'पिनकोड 110001 तपासा',
      'IFSC कोड SBIN0001234 शोधा',
      'दिल्लीचे हवामान',
      'चलन विनिमय दर',
      'मुंबईचा AQI',
      'बेंगळुरूमधील इंधनाची किंमत'
    ],
    
    loading: 'प्रक्रिया...',
    error: 'माफ करा, काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा।',
    copy: 'कॉपी',
    share: 'शेअर',
    save: 'सेव्ह'
  },
  
  ta: {
    // Header
    appTitle: 'Pi உதவியாளர்',
    appSubtitle: 'இந்தியாவிற்கான உங்கள் புத்திசாலி உதவியாளர்',
    changeLanguage: 'மொழியை மாற்று',
    settings: 'அமைப்புகள்',
    
    // Welcome
    welcomeTitle: '👋 Pi உதவியாளருக்கு வரவேற்கிறோம்!',
    welcomeSubtitle: 'இந்த உதாரண கேள்விகளை முயற்சிக்கவும்:',
    
    // Example queries
    examples: [
      'பின்கோட் 110001 சரிபார்க்க',
      'IFSC குறியீடு SBIN0001234 கண்டுபிடி',
      'டெல்லி வானிலை',
      'நாணய மாற்று விகிதம்',
      'மும்பை AQI',
      'பெங்களூரில் எரிபொருள் விலை'
    ],
    
    loading: 'செயலாக்கம்...',
    error: 'மன்னிக்கவும், ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்।',
    copy: 'நகல்',
    share: 'பகிர்',
    save: 'சேமி'
  },
  
  gu: {
    // Header
    appTitle: 'Pi સહાયક',
    appSubtitle: 'ભારત માટે તમારો બુદ્ધિમાન સહાયક',
    changeLanguage: 'ભાષા બદલો',
    settings: 'સેટિંગ્સ',
    
    // Welcome
    welcomeTitle: '👋 Pi સહાયકમાં સ્વાગત!',
    welcomeSubtitle: 'આ ઉદાહરણ પ્રશ્નો અજમાવો:',
    
    // Example queries
    examples: [
      'પિનકોડ 110001 ચકાસો',
      'IFSC કોડ SBIN0001234 શોધો',
      'દિલ્હીનું હવામાન',
      'ચલણ વિનિમય દર',
      'મુંબઈનો AQI',
      'બેંગલોરમાં ઇંધણની કિંમત'
    ],
    
    loading: 'પ્રક્રિયા...',
    error: 'માફ કરશો, કંઈક ખોટું થયું. કૃપા કરી ફરી પ્રયાસ કરો।',
    copy: 'કોપી',
    share: 'શેર',
    save: 'સેવ'
  },
  
  kn: {
    // Header
    appTitle: 'Pi ಸಹಾಯಕ',
    appSubtitle: 'ಭಾರತಕ್ಕಾಗಿ ನಿಮ್ಮ ಬುದ್ಧಿವಂತ ಸಹಾಯಕ',
    changeLanguage: 'ಭಾಷೆ ಬದಲಿಸಿ',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    
    // Welcome
    welcomeTitle: '👋 Pi ಸಹಾಯಕಕ್ಕೆ ಸ್ವಾಗತ!',
    welcomeSubtitle: 'ಈ ಉದಾಹರಣೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ:',
    
    // Example queries
    examples: [
      'ಪಿನ್‌ಕೋಡ್ 110001 ಪರಿಶೀಲಿಸಿ',
      'IFSC ಕೋಡ್ SBIN0001234 ಹುಡುಕಿ',
      'ದೆಹಲಿ ಹವಾಮಾನ',
      'ಕರೆನ್ಸಿ ವಿನಿಮಯ ದರ',
      'ಮುಂಬೈ AQI',
      'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಇಂಧನ ಬೆಲೆ'
    ],
    
    loading: 'ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಿಕೆ...',
    error: 'ಕ್ಷಮಿಸಿ, ಏನೋ ತಪ್ಪು ಆಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    copy: 'ನಕಲಿಸಿ',
    share: 'ಹಂಚಿಕೊಳ್ಳಿ',
    save: 'ಉಳಿಸಿ'
  },
  
  pa: {
    // Header
    appTitle: 'Pi ਸਹਾਇਕ',
    appSubtitle: 'ਭਾਰਤ ਲਈ ਤੁਹਾਡਾ ਬੁੱਧੀਮਾਨ ਸਹਾਇਕ',
    changeLanguage: 'ਭਾਸ਼ਾ ਬਦਲੋ',
    settings: 'ਸੈਟਿੰਗਾਂ',
    
    // Welcome
    welcomeTitle: '👋 Pi ਸਹਾਇਕ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ!',
    welcomeSubtitle: 'ਇਹ ਉਦਾਹਰਨ ਸਵਾਲ ਆਜ਼ਮਾਓ:',
    
    // Example queries
    examples: [
      'ਪਿੰਨਕੋਡ 110001 ਚੈੱਕ ਕਰੋ',
      'IFSC ਕੋਡ SBIN0001234 ਲੱਭੋ',
      'ਦਿੱਲੀ ਦਾ ਮੌਸਮ',
      'ਮੁਦਰਾ ਐਕਸਚੇਂਜ ਰੇਟ',
      'ਮੁੰਬਈ ਦਾ AQI',
      'ਬੰਗਲੌਰ ਵਿੱਚ ਬਾਲਣ ਦੀ ਕੀਮਤ'
    ],
    
    loading: 'ਪ੍ਰਕਿਰਿਆ...',
    error: 'ਮਾਫ ਕਰੋ, ਕੁਝ ਗਲਤ ਹੋਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    copy: 'ਕਾਪੀ',
    share: 'ਸ਼ੇਅਰ',
    save: 'ਸੇਵ'
  }
}

// Helper functions
export function getTranslation(language, key, fallback = '') {
  return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || fallback
}

export function getCurrentLanguage() {
  return localStorage.getItem('pi-language') || 'en'
}

export function setCurrentLanguage(lang) {
  localStorage.setItem('pi-language', lang)
}

export function detectUserLanguage() {
  // Try to detect from browser
  const browserLang = navigator.language || navigator.languages[0]
  const langCode = browserLang.split('-')[0]
  
  // Return if supported, otherwise default to English
  return SUPPORTED_LANGUAGES[langCode] ? langCode : 'en'
}