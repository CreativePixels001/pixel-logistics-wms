'use client'

import { Menu, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ChatHeaderProps {
  onMenuToggle: () => void
  showMenu?: boolean
}

export function ChatHeader({ onMenuToggle, showMenu = true }: ChatHeaderProps) {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <>
      {/* Mobile-First Minimal Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 safe-area-inset-top">
        {/* Left: Menu */}
        {showMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Button>
        )}

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">Pi</span>
        </div>

        {/* Right: Profile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowProfile(!showProfile)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </Button>
      </header>

      {/* Profile Dropdown */}
      {showProfile && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
            onClick={() => setShowProfile(false)}
          />
          <div className="absolute top-14 right-4 z-50 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
            {/* Profile Header */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-white">Guest User</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Anonymous Session</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Settings</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Preferences & privacy</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">About Pi</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Learn more</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Help & Support</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Get assistance</div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Pixel Intelligence v1.0
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
