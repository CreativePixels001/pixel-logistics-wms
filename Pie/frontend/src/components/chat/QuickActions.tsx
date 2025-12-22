'use client'

import { Sparkles, TrendingUp, MapPin, Newspaper } from 'lucide-react'

interface QuickActionsProps {
  onActionClick: (query: string) => void
}

const QUICK_ACTIONS = [
  {
    icon: Sparkles,
    label: 'Latest AI News',
    query: 'What are the latest developments in AI in India?',
    gradient: 'from-purple-500 via-purple-600 to-pink-500',
    iconBg: 'from-purple-400 to-pink-500'
  },
  {
    icon: TrendingUp,
    label: 'Economy Update',
    query: 'What is the current state of the Indian economy?',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    iconBg: 'from-blue-400 to-cyan-500'
  },
  {
    icon: MapPin,
    label: 'Local News',
    query: 'Latest news in my area',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    iconBg: 'from-green-400 to-emerald-500'
  },
  {
    icon: Newspaper,
    label: 'Top Headlines',
    query: 'What are today\'s top headlines in India?',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    iconBg: 'from-orange-400 to-red-500'
  },
]

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      {QUICK_ACTIONS.map((action, idx) => {
        const Icon = action.icon
        return (
          <button
            key={idx}
            onClick={() => onActionClick(action.query)}
            className="group relative p-5 lg:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 hover:border-transparent transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:scale-[1.02] overflow-hidden"
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
            
            <div className="relative flex flex-col items-start">
              <div className={`w-11 h-11 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br ${action.iconBg} flex items-center justify-center mb-3 lg:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100 text-left">
                {action.label}
              </h3>
              <div className={`mt-2 w-0 h-0.5 bg-gradient-to-r ${action.gradient} group-hover:w-full transition-all duration-300`} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
