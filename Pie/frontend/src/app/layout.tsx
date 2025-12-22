import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Pi - Pixel Intelligence | AI-Powered Gov Data Assistant',
  description: 'Your intelligent assistant for Indian government data, policies, and schemes. Powered by Creative Pixels.',
  keywords: ['Pi', 'Pixel Intelligence', 'India', 'Government', 'Data', 'AI', 'Creative Pixels', 'Q&A'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
