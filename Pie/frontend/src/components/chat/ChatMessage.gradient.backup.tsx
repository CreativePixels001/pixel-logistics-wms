'use client'

import { useState } from 'react'
import { type Message } from '@/lib/chat'
import { cn } from '@/lib/utils'
import { User, Copy, Check, Share2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
    <div
      className={cn(
        'flex gap-3 group',
        'animate-in fade-in-0 slide-in-from-bottom-3 duration-500',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-2 ring-purple-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
      )}

      <div className={cn('flex flex-col gap-2 max-w-[85%]', isUser && 'items-end')}>
        <Card
          className={cn(
            'px-5 py-3.5 shadow-sm border-0 transition-all duration-300',
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30'
              : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:shadow-md'
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-semibold">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </Card>

        {/* Action Buttons - Only show for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <><Check className="h-3 w-3 mr-1" /> Copied!</>
              ) : (
                <><Copy className="h-3 w-3 mr-1" /> Copy</>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Share2 className="h-3 w-3 mr-1" /> Share
            </Button>
          </div>
        )}

        {/* Sources */}
        {!isUser && message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.metadata.sources.map((source: any, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5 cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => source.url && window.open(source.url, '_blank')}
              >
                📊 {source.apiName}
              </Badge>
            ))}
          </div>
        )}

        {/* Confidence Score */}
        {!isUser && message.metadata?.confidence && (
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              Confidence: {Math.round(message.metadata.confidence * 100)}%
            </Badge>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  )
}
