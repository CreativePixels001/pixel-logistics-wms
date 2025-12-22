/**
 * MULTILINGUAL INTENT DETECTION SERVICE
 * Supports 9 Indian languages + English
 */

const INTENT_PATTERNS = {
  pincode: {
    keywords: {
      en: ['pincode', 'pin code', 'postal code', 'post office', 'pin'],
      hi: ['पिनकोड', 'पिन कोड', 'डाक कोड', 'डाकघर', 'पोस्टल कोड'],
      bn: ['পিনকোড', 'পিন কোড', 'ডাক কোড', 'ডাকঘর', 'পোস্টাল কোড'],
      te: ['పిన్‌కోడ్', 'పిన్ కోడ్', 'డాక్ కోడ్', 'పోస్ట్ ఆఫీస్'],
      mr: ['पिनकोड', 'पिन कोड', 'टपाल कोड', 'पोस्ट ऑफिस'],
      ta: ['பின்கோட்', 'பின் கோட்', 'அஞ்சல் குறியீடு', 'தபால் அலுவலகம்'],
      gu: ['પિનકોડ', 'પિન કોડ', 'પોસ્ટલ કોડ', 'પોસ્ટ ઓફિસ'],
      kn: ['ಪಿನ್‌ಕೋಡ್', 'ಪಿನ್ ಕೋಡ್', 'ಅಂಚೆ ಕೋಡ್', 'ಅಂಚೆ ಕಛೇರಿ'],
      pa: ['ਪਿੰਨਕੋਡ', 'ਪਿੰਨ ਕੋਡ', 'ਪੋਸਟਲ ਕੋਡ', 'ਡਾਕਘਰ']
    },
    regex: /\b\d{6}\b/,
    extract: (text) => {
      const match = text.match(/\b\d{6}\b/)
      return match ? match[0] : null
    }
  },
  
  ifsc: {
    keywords: {
      en: ['ifsc', 'bank code', 'bank branch', 'bank details'],
      hi: ['आईएफएससी', 'बैंक कोड', 'बैंक शाखा', 'बैंक विवरण'],
      bn: ['আইএফএসসি', 'ব্যাঙ্ক কোড', 'ব্যাঙ্কের শাখা', 'ব্যাঙ্কের বিবরণ'],
      te: ['ఐఎఫ్‌ఎస్‌సి', 'బ్యాంక్ కోడ్', 'బ్యాంక్ శాఖ'],
      mr: ['आयएफएससी', 'बँक कोड', 'बँक शाखा'],
      ta: ['ஐஎஃப்எஸ்சி', 'வங்கி குறியீடு', 'வங்கி கிளை'],
      gu: ['આઈએફએસસી', 'બેંક કોડ', 'બેંકની શાખા'],
      kn: ['ಐಎಫ್‌ಎಸ್‌ಸಿ', 'ಬ್ಯಾಂಕ್ ಕೋಡ್', 'ಬ್ಯಾಂಕ್ ಶಾಖೆ'],
      pa: ['ਆਈਐਫਐਸਸੀ', 'ਬੈਂਕ ਕੋਡ', 'ਬੈਂਕ ਸ਼ਾਖਾ']
    },
    regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/,
    extract: (text) => {
      const match = text.match(/\b[A-Z]{4}0[A-Z0-9]{6}\b/)
      return match ? match[0] : null
    }
  },
  
  currency: {
    keywords: {
      en: ['currency', 'exchange rate', 'dollar rate', 'usd', 'euro', 'pound', 'forex'],
      hi: ['मुद्रा', 'विनिमय दर', 'डॉलर की दर', 'यूएसडी', 'यूरो', 'पाउंड', 'फॉरेक्स'],
      bn: ['মুদ্রা', 'বিনিময় হার', 'ডলারের হার', 'ইউএসডি', 'ইউরো', 'পাউন্ড'],
      te: ['కరెన్సీ', 'మార్పిడి రేటు', 'డాలర్ రేటు', 'యుఎస్‌డి'],
      mr: ['चलन', 'विनिमय दर', 'डॉलरचा दर', 'यूएसडी'],
      ta: ['நாணயம்', 'மாற்று விகிதம்', 'டாலர் விகிதம்', 'யூஎஸ்டி'],
      gu: ['ચલણ', 'વિનિમય દર', 'ડોલરનો દર', 'યુએસડી'],
      kn: ['ಕರೆನ್ಸಿ', 'ವಿನಿಮಯ ದರ', 'ಡಾಲರ್ ದರ', 'ಯುಎಸ್‌ಡಿ'],
      pa: ['ਮੁਦਰਾ', 'ਐਕਸਚੇਂਜ ਰੇਟ', 'ਡਾਲਰ ਦੀ ਦਰ', 'ਯੂਐਸਡੀ']
    }
  },
  
  weather: {
    keywords: {
      en: ['weather', 'temperature', 'forecast', 'climate', 'rain', 'humidity'],
      hi: ['मौसम', 'तापमान', 'पूर्वानुमान', 'जलवायु', 'बारिश', 'नमी'],
      bn: ['আবহাওয়া', 'তাপমাত্রা', 'পূর্বাভাস', 'জলবায়ু', 'বৃষ্টি'],
      te: ['వాతావరణం', 'ఉష్ణోగ్రత', 'సూచన', 'వాతావరణ మార్పు', 'వర్షం'],
      mr: ['हवामान', 'तापमान', 'अंदाज', 'हवामान बदल', 'पाऊस'],
      ta: ['வானிலை', 'வெப்பநிலை', 'முன்னறிவிப்பு', 'காலநிலை', 'மழை'],
      gu: ['હવામાન', 'તાપમાન', 'આગાહી', 'હવામાન પરિવર્તન', 'વરસાદ'],
      kn: ['ಹವಾಮಾನ', 'ತಾಪಮಾನ', 'ಮುನ್ಸೂಚನೆ', 'ಹವಾಮಾನ ಬದಲಾವಣೆ', 'ಮಳೆ'],
      pa: ['ਮੌਸਮ', 'ਤਾਪਮਾਨ', 'ਪੂਰਵ-ਅਨੁਮਾਨ', 'ਮਾਹੌਲ', 'ਮੀਂਹ']
    }
  },

  aqi: {
    keywords: {
      en: ['aqi', 'air quality', 'pollution', 'air index', 'pm2.5', 'air pollution'],
      hi: ['एयर क्वालिटी', 'वायु गुणवत्ता', 'प्रदूषण', 'हवा का सूचकांक'],
      bn: ['এয়ার কোয়ালিটি', 'বায়ু গুণমান', 'দূষণ', 'বাতাসের সূচক'],
      te: ['గాలి నాణ్యత', 'వాయు కాలుష్యం', 'కాలుష్య సూచిక'],
      mr: ['हवेची गुणवत्ता', 'वायू प्रदूषण', 'प्रदूषण निर्देशांक'],
      ta: ['காற்று தரம்', 'காற்று மாசு', 'மாசுபாடு குறியீடு'],
      gu: ['હવાની ગુણવત્તા', 'વાયુ પ્રદૂષણ', 'પ્રદૂષણ સૂચકાંક'],
      kn: ['ಗಾಳಿಯ ಗುಣಮಟ್ಟ', 'ವಾಯು ಮಾಲಿನ್ಯ', 'ಮಾಲಿನ್ಯ ಸೂಚಿ'],
      pa: ['ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ', 'ਹਵਾ ਦੀ ਗੰਦਗੀ', 'ਪ੍ਰਦੂਸ਼ਣ ਸੂਚਕਾਂਕ']
    }
  },

  fuel: {
    keywords: {
      en: ['petrol', 'diesel', 'fuel price', 'petrol price', 'diesel price'],
      hi: ['पेट्रोल', 'डीजल', 'ईंधन की कीमत', 'पेट्रोल की कीमत'],
      bn: ['পেট্রোল', 'ডিজেল', 'জ্বালানির দাম', 'পেট্রোলের দাম'],
      te: ['పెట్రోల్', 'డీజిల్', 'ఇంధన ధర', 'పెట్రోల్ ధర'],
      mr: ['पेट्रोल', 'डिझेल', 'इंधनाची किंमत', 'पेट्रोलची किंमत'],
      ta: ['பெட்ரோல்', 'டீசல்', 'எரிபொருள் விலை', 'பெட்ரோல் விலை'],
      gu: ['પેટ્રોલ', 'ડીઝલ', 'ઇંધણની કિંમત', 'પેટ્રોલની કિંમત'],
      kn: ['ಪೆಟ್ರೋಲ್', 'ಡೀಸೆಲ್', 'ಇಂಧನ ಬೆಲೆ', 'ಪೆಟ್ರೋಲ್ ಬೆಲೆ'],
      pa: ['ਪੈਟਰੋਲ', 'ਡੀਜ਼ਲ', 'ਬਾਲਣ ਦੀ ਕੀਮਤ', 'ਪੈਟਰੋਲ ਦੀ ਕੀਮਤ']
    }
  }
}

/**
 * Detect user intent from message with language support
 */
export function detectIntent(message, language = 'en') {
  const lowerMsg = message.toLowerCase()
  
  // Check each intent pattern
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    let hasKeyword = false
    
    // Check keywords for current language
    if (pattern.keywords[language]) {
      hasKeyword = pattern.keywords[language].some(keyword => 
        lowerMsg.includes(keyword.toLowerCase())
      )
    }
    
    // Fallback to English keywords if not found
    if (!hasKeyword && pattern.keywords.en) {
      hasKeyword = pattern.keywords.en.some(keyword => 
        lowerMsg.includes(keyword.toLowerCase())
      )
    }
    
    // Check regex
    const hasRegex = pattern.regex && pattern.regex.test(message)
    
    if (hasKeyword || hasRegex) {
      const result = {
        type: intent,
        confidence: hasKeyword && hasRegex ? 0.9 : hasKeyword ? 0.7 : 0.5,
        params: {},
        language: language
      }
      
      // Extract specific parameters
      if (pattern.extract) {
        const extracted = pattern.extract(message)
        if (extracted) {
          result.params.value = extracted
        }
      }
      
      // Extract city name for location-based queries
      if (['aqi', 'weather', 'fuel'].includes(intent)) {
        result.params.city = extractCityName(message, language) || 'Delhi'
      }
      
      return result
    }
  }
  
  // Default to general conversation
  return {
    type: 'general',
    confidence: 0.3,
    params: {},
    language: language
  }
}

/**
 * Extract city name from message with multi-language support
 */
function extractCityName(message, language = 'en') {
  const cities = {
    en: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'],
    hi: ['दिल्ली', 'मुंबई', 'बैंगलोर', 'चेन्नई', 'कोलकाता', 'हैदराबाद', 'पुणे', 'अहमदाबाद', 'जयपुर', 'लखनऊ'],
    bn: ['দিল্লি', 'মুম্বাই', 'ব্যাঙ্গালোর', 'চেন্নাই', 'কোলকাতা', 'হায়দরাবাদ', 'পুনে'],
    te: ['ఢిల్లీ', 'ముంబై', 'బెంగుళూరు', 'చెన్నై', 'కోల్‌కతా', 'హైదరాబాదు', 'పుణే'],
    mr: ['दिल्ली', 'मुंबई', 'बेंगलुरु', 'चेन्नई', 'कोलकाता', 'हैदराबाद', 'पुणे'],
    ta: ['டெல்லி', 'மும்பை', 'பெங்களூரு', 'சென்னை', 'கொல்கத்தா', 'ஹைதராபாத்', 'புனே'],
    gu: ['દિલ્હી', 'મુંબઈ', 'બેંગલોર', 'ચેન્નઈ', 'કોલકાતા', 'હૈદરાબાદ', 'પુણે'],
    kn: ['ದೆಹಲಿ', 'ಮುಂಬೈ', 'ಬೆಂಗಳೂರು', 'ಚೆನ್ನೈ', 'ಕೊಲ್ಕತ್ತಾ', 'ಹೈದರಾಬಾದ್', 'ಪುಣೆ'],
    pa: ['ਦਿੱਲੀ', 'ਮੁੰਬਈ', 'ਬੰਗਲੌਰ', 'ਚੇਨੱਈ', 'ਕੋਲਕਾਤਾ', 'ਹੈਦਰਾਬਾਦ', 'ਪੁਣੇ']
  }
  
  const lowerMsg = message.toLowerCase()
  
  // Check cities in current language
  if (cities[language]) {
    for (const city of cities[language]) {
      if (lowerMsg.includes(city.toLowerCase())) {
        // Return English equivalent for API calls
        const index = cities[language].indexOf(city)
        return cities.en[index] || city
      }
    }
  }
  
  // Fallback to English cities
  for (const city of cities.en) {
    if (lowerMsg.includes(city.toLowerCase())) {
      return city
    }
  }
  
  return null
}
