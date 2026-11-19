import React, { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Zap,
  Shield,
  Key,
  Layers,
  Rocket,
  Terminal,
  Code,
  Cpu,
  BookOpen,
  CreditCard,
  Users,
  Settings,
  Webhook,
  Activity,
  Lock,
  Database,
  Server,
  Sparkles,
} from 'lucide-react';

interface CardProps {
  title: string;
  icon?: string;
  href?: string;
  cta?: string;
  children?: ReactNode;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  shield: Shield,
  key: Key,
  layers: Layers,
  rocket: Rocket,
  terminal: Terminal,
  code: Code,
  cpu: Cpu,
  book: BookOpen,
  'credit-card': CreditCard,
  creditcard: CreditCard,
  users: Users,
  settings: Settings,
  webhook: Webhook,
  activity: Activity,
  lock: Lock,
  database: Database,
  server: Server,
  sparkles: Sparkles,
};

export function CardGroup({
  cols = 2,
  variant = 'cards',
  children,
}: {
  cols?: number;
  variant?: 'cards' | 'links';
  children: ReactNode;
}) {
  return (
    <div className="zorveus-card-grid" data-columns={cols} data-variant={variant}>
      {children}
    </div>
  );
}

export function Card({ title, icon, href, cta, children }: CardProps) {
  const normalizedIcon = icon ? icon.toLowerCase().replace(/[^a-z0-9-]/g, '') : '';
  const Icon = normalizedIcon ? iconMap[normalizedIcon] : null;
  const content = (
    <>
      <div className="zorveus-card-heading">
        {Icon && <Icon className="zorveus-card-icon" aria-hidden="true" />}
        <h3>{title}</h3>
        {href && !cta && <ArrowUpRight className="zorveus-card-arrow" aria-hidden="true" />}
      </div>
      {children && <div className="zorveus-rich-content">{children}</div>}
      {cta && (
        <div className="zorveus-card-cta">
          <span>{cta}</span>
          <ArrowUpRight aria-hidden="true" />
        </div>
      )}
    </>
  );
  if (href) return <Link href={href} className="zorveus-card-container not-prose">{content}</Link>;
  return <div className="zorveus-card-container not-prose">{content}</div>;
}
