'use client'

import { useState } from 'react'
import { Plus, Search, MessageSquare, Clock, Settings, ChevronRight, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
}

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  onNewChat: () => void
  currentConversationId: string | null
  onSelectConversation?: (id: string) => void
}

export function ChatSidebar({ 
  isOpen, 
  onToggle, 
  onNewChat,
  currentConversationId,
  onSelectConversation 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations] = useState<Conversation[]>([
    // Mock data - will be replaced with real API calls
    {
      id: '1',
      title: 'Latest news in AI',
      lastMessage: 'Here are the latest AI developments...',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      title: 'India GDP growth',
      lastMessage: 'India\'s GDP has shown...',
      timestamp: 'Yesterday'
    },
  ])

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-gray-200/60 dark:border-gray-700/60 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-900/10 dark:to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Chats</h2>
            <Button
              onClick={onNewChat}
              size="sm"
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-800 border-gray-200/60 dark:border-gray-700/60 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation?.(conv.id)}
                  className={cn(
                    'group relative p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md',
                    currentConversationId === conv.id
                      ? 'bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 border border-purple-300 dark:border-purple-700 shadow-sm'
                      : 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800/50 dark:hover:to-gray-800/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                        {conv.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate line-clamp-1">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">{conv.timestamp}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                  </div>

                  {/* Action buttons on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Edit conversation
                      }}
                      className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:shadow-lg transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
                    >
                      <Edit2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Delete conversation
                      }}
                      className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-lg transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
                    >
                      <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-purple-400 dark:text-purple-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No conversations found</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-t from-purple-50/30 to-transparent dark:from-purple-900/10 dark:to-transparent">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </aside>
    </>
  )
}
