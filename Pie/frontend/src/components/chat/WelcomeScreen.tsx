'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void
}

const SUGGESTIONS = [
  'Latest news in AI',
  'Latest news in my area',
  'Latest news in the US',
  'Latest news in Crypto',
]

export function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim().length >= 3) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold tracking-tight">Pi</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 px-3 py-1 h-7 rounded-md"
        >
          SIGN UP
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32 animate-fade-in">
        {/* Circular Gradient Orb */}
        <div className="relative mb-16">
          <div className="w-80 h-80 relative">
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200/30 via-transparent to-blue-200/30 dark:from-purple-900/20 dark:via-transparent dark:to-blue-900/20 blur-3xl animate-pulse-subtle" />
            
            {/* Dotted circle effect */}
            <div className="absolute inset-0 rounded-full" style={{
              background: 'radial-gradient(circle, transparent 45%, rgba(168, 85, 247, 0.08) 45%, rgba(168, 85, 247, 0.08) 46%, transparent 46%)',
              backgroundSize: '4px 4px',
            }} />
            
            {/* Central gradient orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-100/80 via-white to-blue-100/80 dark:from-purple-950/50 dark:via-gray-900 dark:to-blue-950/50 shadow-2xl backdrop-blur-xl border border-purple-200/20 dark:border-purple-800/20">
              {/* Inner glow */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/50 via-transparent to-white/30 dark:from-white/5 dark:via-transparent dark:to-white/5" />
              
              {/* Inner text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-purple-600 dark:text-purple-400 tracking-[0.3em] mb-1 font-medium">
                  // THE WORLD'S FASTEST
                </p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 tracking-[0.3em] font-medium">
                  AI SEARCH ENGINE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="w-full max-w-md space-y-2 mb-8 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 tracking-wide">Latest news</span>
            <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-md flex items-center justify-center shadow-sm">
              <span className="text-[9px] text-white font-bold">i</span>
            </div>
          </div>
          {SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="group w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 rounded-xl hover:bg-purple-50/50 dark:hover:bg-purple-900/10 border border-transparent hover:border-purple-200/50 dark:hover:border-purple-800/50"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-purple-100/60 via-purple-50/40 to-transparent dark:from-purple-900/15 dark:via-purple-950/8 dark:to-transparent backdrop-blur-md px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Pi anything about India..."
              className="w-full px-6 py-4 pr-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/60 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10"
              disabled={false}
            />
            <button
              type="submit"
              disabled={input.trim().length < 3}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button type="button" className="text-xs font-medium text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors tracking-wide">
              SEND
            </button>
            <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
            <button type="button" className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900 dark:hover:to-purple-800 transition-all hover:scale-105">
              ?
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
