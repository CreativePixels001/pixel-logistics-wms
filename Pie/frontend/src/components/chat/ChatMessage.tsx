'use client'

import { useState } from 'react'
import { type Message } from '@/lib/chat'
import { cn } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'USER'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('group animate-slide-up', isUser ? 'flex justify-end' : '')}>
      <div className={cn('max-w-[85%]', isUser && 'text-right')}>
        {/* Label */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 tracking-wide">
            {isUser ? 'You' : 'Pi'}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-all text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-110"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          'text-sm leading-relaxed',
          isUser 
            ? 'text-gray-700 dark:text-gray-300' 
            : 'text-gray-900 dark:text-gray-100'
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-purple-50 dark:prose-code:bg-purple-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources - Minimal badges */}
        {!isUser && message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {message.metadata.sources.map((source: any, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg cursor-pointer transition-all border border-purple-200/50 dark:border-purple-800/50 hover:scale-105"
                onClick={() => source.url && window.open(source.url, '_blank')}
              >
                <span className="font-medium">[{index + 1}]</span>
                <span>{source.apiName}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
