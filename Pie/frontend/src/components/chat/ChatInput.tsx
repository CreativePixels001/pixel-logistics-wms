'use client'

import { useState } from 'react'
import { Send, Paperclip } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Mobile-First Minimal Input */}
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          className="flex-shrink-0 p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Input Field */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-3xl px-4 py-3 min-h-[44px] flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Pi..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 p-2.5 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl active:scale-95 transition-all disabled:hover:scale-100"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
