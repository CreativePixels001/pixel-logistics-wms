'use client'

import { Sparkles, TrendingUp, Heart, GraduationCap, Building2, Landmark, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void
}

const QUERY_CATEGORIES = [
  {
    icon: Heart,
    title: 'Health & Welfare',
    color: 'from-pink-500 to-rose-500',
    queries: [
      'What is Ayushman Bharat scheme?',
      'Tell me about PM-JAY healthcare coverage',
    ],
  },
  {
    icon: GraduationCap,
    title: 'Education',
    color: 'from-blue-500 to-cyan-500',
    queries: [
      'What is the National Education Policy 2020?',
      'Tell me about PM POSHAN scheme',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Finance & Economy',
    color: 'from-green-500 to-emerald-500',
    queries: [
      'What is PM-KISAN scheme?',
      'Explain the Digital India initiative',
    ],
  },
  {
    icon: Building2,
    title: 'Infrastructure',
    color: 'from-orange-500 to-amber-500',
    queries: [
      'Tell me about Smart Cities Mission',
      'What is PMAY housing scheme?',
    ],
  },
]

export function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
      <div className="max-w-5xl w-full space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          {/* Pi Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50 ring-4 ring-purple-500/20 animate-in zoom-in-50 duration-500">
            <span className="text-4xl font-bold text-white">π</span>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Pi
            </h1>
            <p className="text-xl font-semibold text-muted-foreground">
              Pixel Intelligence
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your AI-powered assistant for Indian government data and insights.
              Ask anything about schemes, policies, statistics, and initiatives.
            </p>
          </div>

          {/* Powered By Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
            <Zap className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-400">
              Powered by Creative Pixels
            </span>
          </div>
        </div>

        {/* Categorized Queries */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 justify-center">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <p className="text-sm font-semibold text-muted-foreground">
              Explore by Category
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUERY_CATEGORIES.map((category, idx) => (
              <Card
                key={idx}
                className="p-5 border-2 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg group cursor-pointer bg-gradient-to-br from-background to-muted/30"
              >
                <div className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">{category.title}</h3>
                  </div>

                  {/* Query Buttons */}
                  <div className="space-y-2">
                    {category.queries.map((query, qIdx) => (
                      <Button
                        key={qIdx}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2.5 px-3 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-xs font-normal"
                        onClick={() => onSendMessage(query)}
                      >
                        <span className="line-clamp-2">{query}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/50">
          <div className="text-center space-y-1.5 group hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 mb-2">
              <Landmark className="h-6 w-6 text-blue-600" />
            </div>
            <p className="font-semibold text-sm">Official Data</p>
            <p className="text-xs text-muted-foreground">
              Powered by govt sources
            </p>
          </div>
          <div className="text-center space-y-1.5 group hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <p className="font-semibold text-sm">AI-Powered</p>
            <p className="text-xs text-muted-foreground">
              GPT-4 intelligence
            </p>
          </div>
          <div className="text-center space-y-1.5 group hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 mb-2">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <p className="font-semibold text-sm">Instant Answers</p>
            <p className="text-xs text-muted-foreground">
              Real-time insights
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
