'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { chatService, type Message, type QueryRequest } from '@/lib/chat'
import { ChatInput } from './ChatInput'
import { ChatMessage } from './ChatMessage'
import { ChatSidebar } from './ChatSidebar'
import { ChatHeader } from './ChatHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Mic, Radio } from 'lucide-react'

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendQueryMutation = useMutation({
    mutationFn: (data: QueryRequest) => chatService.sendQuery(data),
    onSuccess: (data) => {
      setConversationId(data.conversationId)
      
      // Add assistant message
      const assistantMessage: Message = {
        id: data.message.id,
        role: 'ASSISTANT',
        content: data.message.content,
        metadata: {
          sources: data.message.sources,
          confidence: data.message.confidence,
        },
        createdAt: new Date().toISOString(),
      }
      
      setMessages((prev) => [...prev, assistantMessage])
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to send message',
      })
    },
  })

  const handleSendMessage = (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    }
    
    setMessages((prev) => [...prev, userMessage])

    // Send to backend
    sendQueryMutation.mutate({
      query: content,
      conversationId: conversationId || undefined,
    })
  }

  const handleNewChat = () => {
    setMessages([])
    setConversationId(null)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-full relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        currentConversationId={conversationId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          showMenu={true}
        />

        {messages.length === 0 ? (
          /* Welcome Screen - Clean Centered Design */
          <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
            {/* Centered Orb */}
            <div className="relative mb-8">
              <div className="w-48 h-48 relative">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300/30 via-purple-300/30 to-pink-300/30 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 blur-3xl animate-pulse-subtle" />
                
                {/* Main orb */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200/90 via-purple-200/90 to-pink-200/90 dark:from-blue-400/40 dark:via-purple-400/40 dark:to-pink-400/40 shadow-2xl backdrop-blur-3xl">
                  {/* Inner highlight */}
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/80 via-white/40 to-transparent dark:from-white/20 dark:via-white/10 dark:to-transparent" />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent dark:via-white/10 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Greeting Text */}
            <h2 className="text-base text-gray-500 dark:text-gray-400 font-normal mb-1">
              Hello 👋, how can
            </h2>
            <h2 className="text-base text-gray-500 dark:text-gray-400 font-normal mb-16">
              I help you today?
            </h2>

            {/* Bottom Input Area */}
            <div className="w-full max-w-2xl">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleSendMessage(e.currentTarget.value.trim())
                      e.currentTarget.value = ''
                    }
                  }}
                  className="w-full pl-14 pr-24 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500/50 dark:focus:border-blue-400/50 transition-all shadow-sm"
                />
                
                <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Mic className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Radio className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Topics Button */}
              <button className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 dark:text-blue-400">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Topics
              </button>
            </div>
          </div>
        ) : (
          /* Chat Messages - Mobile-First Minimal Design */
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {sendQueryMutation.isPending && (
                  <div className="flex items-start gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <div className="flex space-x-0.5">
                        <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 dark:text-gray-500 mb-1">Pi</div>
                      <div className="text-gray-600 dark:text-gray-400">Thinking...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </>
        )}

        {/* Bottom Input - Mobile-First Minimal Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 safe-area-inset-bottom">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={sendQueryMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
