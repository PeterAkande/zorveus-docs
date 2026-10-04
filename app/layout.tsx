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
      'Access AI models across providers, track each user’s usage, and enforce spending limits. Fund requests through Zorveus or bring your own provider credentials.',
    url: 'https://docs.zorveus.com',
    siteName: 'Zorveus Docs',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zorveus Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zorveus Documentation',
    description:
      'Access AI models across providers, track each user’s usage, and enforce spending limits. Fund requests through Zorveus or bring your own provider credentials.',
    images: ['/og-image.png'],
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
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <KeyProvider>
          <RootProvider
            theme={{
              enabled: true,
              defaultTheme: 'system',
              enableSystem: true,
            }}
          >
            {children}
          </RootProvider>
        </KeyProvider>
      </body>
    </html>
  );
}
