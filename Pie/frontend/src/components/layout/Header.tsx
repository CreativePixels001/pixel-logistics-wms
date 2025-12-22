'use client'

import { Menu, Moon, Sun, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b bg-gradient-to-r from-background via-violet-50/30 to-purple-50/30 dark:from-background dark:via-violet-950/10 dark:to-purple-950/10 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            {/* Pi Logo */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <span className="text-xl font-bold text-white">π</span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Pi
                </h1>
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 hidden sm:inline-flex">
                  Beta
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">Pixel Intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  )
}
