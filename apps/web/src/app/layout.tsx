import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PromptAI - AI API Builder Platform',
    template: '%s | PromptAI',
  },
  description: 'Create custom AI APIs with natural language prompts. Build, deploy, and manage your AI-powered endpoints in minutes.',
  keywords: ['AI', 'API', 'builder', 'prompt', 'no-code', 'artificial intelligence', 'machine learning'],
  authors: [{ name: 'PromptAI Team' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://promptai.com',
    title: 'PromptAI - AI API Builder Platform',
    description: 'Create custom AI APIs with natural language prompts.',
    siteName: 'PromptAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptAI - AI API Builder Platform',
    description: 'Create custom AI APIs with natural language prompts.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
