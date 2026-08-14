import React, { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'secondary' | 'mint' | 'success' | 'blue' | 'amber' | 'rose' | 'zinc';
  color?: string;
  children: ReactNode;
}

export function Badge({ variant = 'secondary', color, children }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    secondary: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    mint: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    zinc: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
  };

  const selectedClass = color ? '' : (variantStyles[variant] || variantStyles.secondary);
  const inlineStyle = color ? { backgroundColor: `${color}15`, color: color, borderColor: `${color}30` } : undefined;

  return (
    <span
      style={inlineStyle}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide ${selectedClass}`}
    >
      {children}
    </span>
  );
}
