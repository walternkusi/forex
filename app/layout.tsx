import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Trading Assistant - Professional Trading Signals & Analysis',
  description: 'Advanced AI-powered trading signals, chart analysis, and professional trading recommendations using ICT and SMC strategies.',
  keywords: 'trading, AI, chart analysis, trading signals, forex, crypto, stock market',
  authors: [{ name: 'AI Trading Assistant' }],
  creator: 'AI Trading Assistant',
  publisher: 'AI Trading Assistant',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'AI Trading Assistant',
    title: 'AI Trading Assistant - Professional Trading Signals',
    description: 'Advanced AI-powered trading signals and professional chart analysis',
    images: [
      {
        url: 'https://your-domain.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Trading Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Trading Assistant',
    description: 'Professional trading signals powered by AI',
    images: ['https://your-domain.com/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Google FedCM errors
              if (window.console && console.error) {
                const originalError = console.error;
                console.error = function(...args) {
                  if (args[0] && typeof args[0] === 'string' && 
                      (args[0].includes('FedCM') || 
                       args[0].includes('GSI_LOGGER') ||
                       args[0].includes('retrieving a token') ||
                       args[0].includes('NetworkError'))) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              }
              
              // Also suppress console warnings for FedCM
              if (window.console && console.warn) {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  if (args[0] && typeof args[0] === 'string' && 
                      (args[0].includes('FedCM') || args[0].includes('GSI_LOGGER'))) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body className="bg-dark text-white">
        {children}
      </body>
    </html>
  )
}
