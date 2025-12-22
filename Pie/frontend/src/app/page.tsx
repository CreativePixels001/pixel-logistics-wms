import { ChatInterface } from '@/components/chat/ChatInterface'

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-[#f5f5f7] dark:bg-[#1a1a1a]">
      <main className="flex-1 overflow-hidden relative">
        <ChatInterface />
      </main>
    </div>
  )
}
