import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { detectIntent } from './src/services/intentService.js'
import {
  getPincodeInfo,
  getIFSCInfo,
  getCurrencyRates,
  getAQI,
  getWeather,
  getFuelPrices,
  getCowinSlots,
  getPNRStatus
} from './src/services/govApiService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// In-memory session storage
const sessions = new Map()

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  })
})

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, language = 'en' } = req.body

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required' })
    }

    // Get or create session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        messages: [],
        createdAt: new Date()
      })
    }

    const session = sessions.get(sessionId)
    
    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    })

    // Detect intent using AI with language support
    const intent = detectIntent(message, language)
    console.log(`🧠 Detected intent: ${intent.type} (confidence: ${intent.confidence}) [${language}]`)

    // Route to appropriate API based on intent
    let response = ''
    
    switch (intent.type) {
      case 'pincode': {
        const pincode = intent.params.value
        if (pincode) {
          const result = await getPincodeInfo(pincode)
          if (result.success) {
            response = language === 'hi'
              ? `📮 पिनकोड ${result.data.pincode} की जानकारी:\n\n` +
                `🏢 डाकघर: ${result.data.postOffice}\n` +
                `📍 जिला: ${result.data.district}\n` +
                `🗺️ राज्य: ${result.data.state}\n` +
                `📌 क्षेत्र: ${result.data.region}`
              : `📮 Pincode ${result.data.pincode} Information:\n\n` +
                `🏢 Post Office: ${result.data.postOffice}\n` +
                `📍 District: ${result.data.district}\n` +
                `🗺️ State: ${result.data.state}\n` +
                `📌 Region: ${result.data.region}`
          } else {
            response = language === 'hi'
              ? '❌ माफ़ कीजिये, यह पिनकोड मान्य नहीं है।'
              : '❌ Sorry, this pincode is not valid.'
          }
        } else {
          response = language === 'hi'
            ? '🔍 कृपया 6 अंकों का पिनकोड दें। उदाहरण: "110001 की जानकारी दो"'
            : '🔍 Please provide a 6-digit pincode. Example: "Check pincode 110001"'
        }
        break
      }

      case 'ifsc': {
        const ifsc = intent.params.value
        if (ifsc) {
          const result = await getIFSCInfo(ifsc)
          if (result.success) {
            response = language === 'hi'
              ? `🏦 IFSC ${result.data.ifsc} की जानकारी:\n\n` +
                `🏛️ बैंक: ${result.data.bank}\n` +
                `🏢 शाखा: ${result.data.branch}\n` +
                `📍 शहर: ${result.data.city}\n` +
                `📞 संपर्क: ${result.data.contact || 'N/A'}`
              : `🏦 IFSC ${result.data.ifsc} Information:\n\n` +
                `🏛️ Bank: ${result.data.bank}\n` +
                `🏢 Branch: ${result.data.branch}\n` +
                `📍 City: ${result.data.city}\n` +
                `📞 Contact: ${result.data.contact || 'N/A'}`
          } else {
            response = language === 'hi'
              ? '❌ IFSC कोड मान्य नहीं है।'
              : '❌ Invalid IFSC code.'
          }
        } else {
          response = language === 'hi'
            ? '🔍 कृपया IFSC कोड दें। उदाहरण: "SBIN0001234 खोजें"'
            : '🔍 Please provide an IFSC code. Example: "Find IFSC SBIN0001234"'
        }
        break
      }

      case 'currency': {
        const result = await getCurrencyRates()
        if (result.success) {
          response = language === 'hi'
            ? `💱 आज की विनिमय दरें (INR):\n\n` +
              `🇺🇸 USD: ₹${(1 / result.data.rates.USD).toFixed(2)}\n` +
              `🇪🇺 EUR: ₹${(1 / result.data.rates.EUR).toFixed(2)}\n` +
              `🇬🇧 GBP: ₹${(1 / result.data.rates.GBP).toFixed(2)}\n` +
              `🇦🇪 AED: ₹${(1 / result.data.rates.AED).toFixed(2)}`
            : `💱 Today's Exchange Rates (INR):\n\n` +
              `🇺🇸 USD: ₹${(1 / result.data.rates.USD).toFixed(2)}\n` +
              `🇪🇺 EUR: ₹${(1 / result.data.rates.EUR).toFixed(2)}\n` +
              `🇬🇧 GBP: ₹${(1 / result.data.rates.GBP).toFixed(2)}\n` +
              `🇦🇪 AED: ₹${(1 / result.data.rates.AED).toFixed(2)}`
        } else {
          response = language === 'hi'
            ? '❌ विनिमय दरें प्राप्त नहीं हो सकीं।'
            : '❌ Could not fetch exchange rates.'
        }
        break
      }

      case 'aqi': {
        const city = intent.params.city
        const result = await getAQI(city)
        if (result.success) {
          response = language === 'hi'
            ? `🌫️ ${result.data.city} का वायु गुणवत्ता सूचकांक:\n\n` +
              `📊 AQI: ${result.data.aqi}\n` +
              `✨ स्थिति: ${result.data.quality}\n` +
              `🔬 मुख्य प्रदूषक: ${result.data.dominentPollutant}\n` +
              `⏰ अपडेट: ${result.data.time}`
            : `🌫️ Air Quality Index for ${result.data.city}:\n\n` +
              `📊 AQI: ${result.data.aqi}\n` +
              `✨ Quality: ${result.data.quality}\n` +
              `🔬 Main Pollutant: ${result.data.dominentPollutant}\n` +
              `⏰ Updated: ${result.data.time}`
        } else {
          response = language === 'hi'
            ? '❌ शहर नहीं मिला। कृपया दिल्ली, मुंबई, बैंगलोर जैसे शहर का नाम दें।'
            : '❌ City not found. Please specify cities like Delhi, Mumbai, Bangalore.'
        }
        break
      }

      case 'weather': {
        const city = intent.params.city
        const result = await getWeather(city)
        if (result.success) {
          response = language === 'hi'
            ? `🌤️ ${result.data.city} का मौसम:\n\n` +
              `🌡️ तापमान: ${result.data.temperature}°C\n` +
              `🤔 महसूस: ${result.data.feelsLike}°C\n` +
              `💧 नमी: ${result.data.humidity}%\n` +
              `💨 हवा: ${result.data.windSpeed} km/h\n` +
              `☁️ स्थिति: ${result.data.description}`
            : `🌤️ Weather in ${result.data.city}:\n\n` +
              `🌡️ Temperature: ${result.data.temperature}°C\n` +
              `🤔 Feels Like: ${result.data.feelsLike}°C\n` +
              `💧 Humidity: ${result.data.humidity}%\n` +
              `💨 Wind: ${result.data.windSpeed} km/h\n` +
              `☁️ Condition: ${result.data.description}`
        } else {
          response = language === 'hi'
            ? '❌ मौसम की जानकारी नहीं मिली।'
            : '❌ Weather information not available.'
        }
        break
      }

      case 'fuel': {
        const city = intent.params.city
        const result = await getFuelPrices(city)
        if (result.success) {
          response = language === 'hi'
            ? `⛽ ${result.data.city} में ईंधन की कीमतें:\n\n` +
              `🔴 पेट्रोल: ₹${result.data.petrol}/लीटर\n` +
              `🟢 डीजल: ₹${result.data.diesel}/लीटर\n` +
              `📅 दिनांक: ${new Date(result.data.date).toLocaleDateString('hi-IN')}`
            : `⛽ Fuel Prices in ${result.data.city}:\n\n` +
              `🔴 Petrol: ₹${result.data.petrol}/litre\n` +
              `🟢 Diesel: ₹${result.data.diesel}/litre\n` +
              `📅 Date: ${new Date(result.data.date).toLocaleDateString('en-IN')}`
        } else {
          response = language === 'hi'
            ? '❌ शहर नहीं मिला। उपलब्ध: दिल्ली, मुंबई, बैंगलोर, चेन्नई, कोलकाता'
            : '❌ City not found. Available: Delhi, Mumbai, Bangalore, Chennai, Kolkata'
        }
        break
      }

      case 'pnr': {
        const pnr = intent.params.value
        if (pnr) {
          response = language === 'hi'
            ? `🚂 PNR स्थिति सेवा जल्द आ रही है!\n\nअभी के लिए IRCTC ऐप का उपयोग करें।`
            : `🚂 PNR Status service coming soon!\n\nPlease use IRCTC app for now.`
        } else {
          response = language === 'hi'
            ? '🔍 कृपया 10 अंकों का PNR नंबर दें।'
            : '🔍 Please provide a 10-digit PNR number.'
        }
        break
      }

      default:
        response = generateResponse(message, language)
    }

    // Add assistant message to session
    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    })

    res.json({
      message: response,
      sessionId: sessionId
    })

  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Simple response generator (placeholder)
function generateResponse(message, language) {
  const msg = message.toLowerCase()

  // Greetings
  if (msg.match(/^(hi|hello|hey|namaste)/)) {
    return language === 'hi' 
      ? 'नमस्ते! मैं Pi हूं, आपका AI सहायक। मैं आपकी कैसे मदद कर सकता हूं?'
      : 'Hello! I\'m Pi, your AI assistant for India. How can I help you today?'
  }

  // India specific queries
  if (msg.includes('india') || msg.includes('भारत')) {
    return 'India is a diverse country with rich history and culture. What specific aspect would you like to know about?'
  }

  // Help
  if (msg.includes('help') || msg.includes('मदद')) {
    return 'I can help you with:\n• General questions about India\n• Information and facts\n• Conversations in Hindi and English\n\nJust ask me anything!'
  }

  // Default response
  return 'I understand you said: "' + message + '". I\'m currently in development and will soon be able to provide more intelligent responses. For now, I can answer basic questions!'
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', sessions: sessions.size })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Pi Assistant API running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})
