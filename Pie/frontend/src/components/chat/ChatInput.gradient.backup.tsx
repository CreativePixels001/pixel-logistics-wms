'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')
  const trimmedLength = input.trim().length
  const isValid = trimmedLength >= 3

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmed = input.trim()
    if (!trimmed || trimmed.length < 3 || isLoading) return

    onSendMessage(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Pi anything about India... (minimum 3 characters)"
            className="min-h-[56px] max-h-[200px] resize-none pr-12 rounded-2xl border-2 focus:border-violet-500 transition-colors"
            disabled={isLoading}
          />
          {trimmedLength > 0 && !isValid && (
            <p className="text-xs text-destructive mt-1.5 ml-1">
              💡 Message must be at least 3 characters (currently {trimmedLength})
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={!isValid || isLoading}
          className="h-[56px] w-[56px] rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
        >
          <Send className="h-5 w-5 text-white" />
        </Button>
      </form>
    </div>
  )
}
