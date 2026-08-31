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
  children: ReactNode;
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
  children,
}: {
  cols?: number;
  children: ReactNode;
}) {
  const colClass =
    cols === 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : cols === 4
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2';

  return <div className={`my-6 grid gap-4 ${colClass}`}>{children}</div>;
}

export function Card({ title, icon, href, children }: CardProps) {
  const normalizedIcon = icon ? icon.toLowerCase().replace(/[^a-z0-9-]/g, '') : '';
  const IconComponent = normalizedIcon ? iconMap[normalizedIcon] : null;

  // Interactive link card
  if (href) {
    return (
      <Link
        href={href}
        style={{ padding: '14px 16px' }}
        className="zorveus-card-container group relative flex flex-col justify-between rounded-xl border border-[#222226] bg-[#121214] p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-500/40 hover:bg-[#161619] hover:shadow-md cursor-pointer !no-underline select-none"
      >
        <div className="flex flex-col gap-2.5">
          {/* Top row: Icon + ArrowUpRight */}
          <div className="flex items-center justify-between w-full">
            {IconComponent ? (
              <div
                style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
                className="zorveus-card-icon-box flex items-center justify-center p-1.5 rounded-lg border border-zinc-800 bg-zinc-800/40 text-zinc-300 transition-colors group-hover:border-emerald-500/40 group-hover:text-emerald-400"
              >
                <IconComponent className="h-4 w-4" />
              </div>
            ) : (
              <div style={{ width: '32px', height: '32px' }} />
            )}
            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-200" />
          </div>

          {/* Title & Description */}
          <div className="flex flex-col gap-1">
            <h4 className="text-[15px] sm:text-base font-semibold text-zinc-100 !no-underline group-hover:text-emerald-400 transition-colors m-0 leading-snug">
              {title}
            </h4>
            <div className="text-sm text-zinc-300 leading-relaxed font-normal !no-underline m-0">
              {children}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Non-interactive container card
  return (
    <div
      style={{ padding: '14px 16px' }}
      className="zorveus-card-container rounded-xl border border-[#222226] bg-[#121214] p-3.5 shadow-xs transition-colors"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2 m-0">
          {IconComponent && <IconComponent className="h-4 w-4 text-zinc-400" />}
          <span>{title}</span>
        </h3>
        <div className="text-sm text-zinc-300 leading-relaxed m-0">{children}</div>
      </div>
    </div>
  );
}
