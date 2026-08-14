import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { KeyProvider } from '@/components/context/KeyContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Zorveus Documentation',
    template: '%s | Zorveus Docs',
  },
  description:
    'Zorveus is an AI wallet, billing layer, and multi-provider inference gateway providing OpenAI-compatible routing, BYOK credentials, product-user metering, and spending controls.',
  icons: {
    icon: '/zorveus-mark.svg',
    shortcut: '/zorveus-mark.svg',
    apple: '/zorveus-mark.svg',
  },
  metadataBase: new URL('https://docs.zorveus.com'),
  openGraph: {
    title: 'Zorveus Documentation',
    description:
      'One wallet and control layer for using AI across products and providers.',
    url: 'https://docs.zorveus.com',
    siteName: 'Zorveus Docs',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-zorveus-dark font-sans text-zinc-100 antialiased selection:bg-mint/20 selection:text-mint">
        <KeyProvider>
          <RootProvider
            theme={{
              enabled: false,
              defaultTheme: 'dark',
            }}
          >
            {children}
          </RootProvider>
        </KeyProvider>
      </body>
    </html>
  );
}
