import Link from 'next/link';
import { ArrowLeft, BookOpen, Cpu, Key, Layers, Shield, Terminal } from 'lucide-react';
import styles from './DocsNotFound.module.css';

const QUICK_LINKS = [
  {
    title: 'Make your first API request',
    description: 'Get an API key and send your first model call.',
    href: '/getting-started/startup-quickstart',
    icon: Terminal,
  },
  {
    title: 'Call AI models',
    description: 'Use OpenAI, Anthropic, or Zorveus SDKs through one gateway.',
    href: '/inference/overview',
    icon: Cpu,
  },
  {
    title: 'Customer limits and billing',
    description: 'Set per-customer AI allowances and grant paid credits.',
    href: '/startups/configure-product-user-allowances',
    icon: Layers,
  },
  {
    title: 'User-funded apps',
    description: 'Let users connect their Zorveus account and fund their own usage.',
    href: '/oauth/overview',
    icon: Shield,
  },
  {
    title: 'Provider keys (BYOK)',
    description: 'Add your own provider keys with priority ordering and fallback.',
    href: '/startups/provider-credentials',
    icon: Key,
  },
  {
    title: 'API Reference',
    description: 'Browse endpoints, request parameters, and response schemas.',
    href: '/api-reference/overview',
    icon: BookOpen,
  },
] as const;

export function DocsNotFound() {
  return (
    <section className={`${styles.root} not-prose`} aria-labelledby="zorveus-not-found-title">
      <div className={styles.header}>
        <span className={styles.badge}>404</span>
        <h1 id="zorveus-not-found-title" className={styles.title}>
          Page not found
        </h1>
        <p className={styles.description}>
          This page does not exist or may have moved. Use the search bar above or jump to a section below.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Back to docs home</span>
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={styles.card}>
              <div className={styles.cardHeading}>
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{item.title}</span>
              </div>
              <p className={styles.cardDescription}>{item.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
