import { useState, useRef, useEffect } from 'react'
import { sendMessage } from './api'
import './App.css'
import { SUPPORTED_LANGUAGES, TRANSLATIONS, getTranslation, getCurrentLanguage, setCurrentLanguage, detectUserLanguage } from './services/languageService.js'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguageState] = useState(() => getCurrentLanguage() || detectUserLanguage())
  const [isListening, setIsListening] = useState(false)
  const [showExamples, setShowExamples] = useState(true)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const messagesEndRef = useRef(null)
  const sessionId = useRef(crypto.randomUUID())

  // Get current translations
  const t = (key, fallback = '') => getTranslation(language, key, fallback)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize Feather icons
    if (window.feather) {
      window.feather.replace()
    }
  }, [messages])

  useEffect(() => {
    // Close language menu when clicking outside
    const handleClickOutside = (event) => {
      if (showLanguageMenu && !event.target.closest('.language-selector')) {
        setShowLanguageMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLanguageMenu])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    // Hide examples after first message
    setShowExamples(false)

    const userMsg = { type: 'user', text: input, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await sendMessage(input, sessionId.current, language)
      const piMsg = {
        type: 'pi',
        text: response.message,
        id: Date.now() + 1
      }
      setMessages(prev => [...prev, piMsg])
    } catch (error) {
      console.error('Error:', error)
      const errorMsg = {
        type: 'pi',
        text: '❌ Sorry, I had trouble connecting. Please try again.',
        id: Date.now() + 1
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example) => {
    setInput(example)
    setShowExamples(false)
  }

  const toggleLanguage = () => {
    setShowLanguageMenu(prev => !prev)
  }

  const selectLanguage = (langCode) => {
    setLanguageState(langCode)
    setCurrentLanguage(langCode)
    setShowLanguageMenu(false)
    
    // Update examples for new language
    if (messages.length === 0) {
      setShowExamples(true)
    }
  }

  const openSettings = () => {
    alert('Settings feature coming soon!')
  }

  const openProfile = () => {
    alert('Profile feature coming soon!')
  }

  const openSaved = () => {
    alert('Saved conversations feature coming soon!')
  }

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(t('voiceNotSupported'))
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    const currentLang = SUPPORTED_LANGUAGES[language]
    recognition.lang = currentLang?.speechCode || 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      alert(t('voiceError'))
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <h1>
            <i data-feather="cpu"></i> {t('appTitle')}
          </h1>
          <p>{t('appSubtitle')}</p>
        </div>
        <div className="chat-header-actions">
          <div className="language-selector">
            <button 
              className="header-btn" 
              onClick={toggleLanguage} 
              title={t('changeLanguage')}
            >
              <i data-feather="globe"></i>
              <span>{SUPPORTED_LANGUAGES[language]?.nativeName}</span>
              <span className="lang-flag">{SUPPORTED_LANGUAGES[language]?.flag}</span>
            </button>
            {showLanguageMenu && (
              <div className="language-menu">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                  <button
                    key={code}
                    className={`language-option ${code === language ? 'active' : ''}`}
                    onClick={() => selectLanguage(code)}
                  >
                    <span className="lang-flag">{lang.flag}</span>
                    <span className="lang-name">{lang.nativeName}</span>
                    <span className="lang-code">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="header-btn" onClick={openSettings} title={t('settings')}>
            <i data-feather="settings"></i>
          </button>
        </div>
      </div>

      <div className="messages">
        {showExamples && messages.length === 0 && (
          <div className="examples-container">
            <div className="welcome-text">
              <h2>{t('welcomeTitle')}</h2>
              <p>{t('welcomeSubtitle')}</p>
            </div>
            <div className="examples-grid">
              {TRANSLATIONS[language]?.examples?.map((example, index) => (
                <button
                  key={index}
                  className="example-chip"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="message pi">
            <div className="message-content typing">
              {t('loading')}
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="input-form">
        <button type="button" className={`icon-btn ${isListening ? 'listening' : ''}`} onClick={toggleVoiceInput} title="Voice Input">
          <i data-feather={isListening ? "mic-off" : "mic"}></i>
        </button>
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="send-btn">
            <i data-feather="send"></i>
          </button>
        </div>
        <button type="button" className="icon-btn" onClick={openProfile} title="Profile">
          <i data-feather="user"></i>
        </button>
        <button type="button" className="icon-btn" onClick={openSaved} title="Saved">
          <i data-feather="bookmark"></i>
        </button>
      </form>
    </div>
  )
}

export default App
