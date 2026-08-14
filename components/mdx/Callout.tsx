import React, { ReactNode } from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'danger' | 'success' | 'tip' | 'note';
  title?: string;
  children: ReactNode;
}

const calloutStyles = {
  info: {
    container: 'border-blue-500/20 bg-blue-950/20 text-blue-200',
    iconBox: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    titleColor: 'text-blue-300',
    icon: Info,
  },
  note: {
    container: 'border-zinc-800 bg-zinc-900/40 text-zinc-300',
    iconBox: 'border-zinc-700/60 bg-zinc-800/40 text-zinc-400',
    titleColor: 'text-zinc-200',
    icon: Info,
  },
  warning: {
    container: 'border-amber-500/30 bg-amber-950/20 text-amber-200',
    iconBox: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    titleColor: 'text-amber-300',
    icon: AlertTriangle,
  },
  danger: {
    container: 'border-rose-500/30 bg-rose-950/20 text-rose-200',
    iconBox: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    titleColor: 'text-rose-300',
    icon: AlertCircle,
  },
  success: {
    container: 'border-[#4DFFB4]/30 bg-[#4DFFB4]/5 text-zinc-200',
    iconBox: 'border-[#4DFFB4]/30 bg-[#4DFFB4]/10 text-[#4DFFB4]',
    titleColor: 'text-[#4DFFB4]',
    icon: CheckCircle2,
  },
  tip: {
    container: 'border-[#4DFFB4]/30 bg-[#4DFFB4]/5 text-zinc-200',
    iconBox: 'border-[#4DFFB4]/30 bg-[#4DFFB4]/10 text-[#4DFFB4]',
    titleColor: 'text-[#4DFFB4]',
    icon: Lightbulb,
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const style = calloutStyles[type] || calloutStyles.info;
  const IconComponent = style.icon;

  return (
    <div className={`my-5 flex items-start gap-3.5 rounded-xl border p-4 shadow-xs text-sm ${style.container}`}>
      <div
        style={{ width: '26px', height: '26px', minWidth: '26px' }}
        className={`flex shrink-0 items-center justify-center rounded-md border ${style.iconBox}`}
      >
        <IconComponent style={{ width: '13px', height: '13px' }} />
      </div>
      <div className="flex-1 space-y-1 overflow-hidden">
        {title && <div className={`font-semibold tracking-tight text-sm ${style.titleColor}`}>{title}</div>}
        <div className="text-zinc-300 text-xs leading-relaxed [&>p]:my-1 font-normal">{children}</div>
      </div>
    </div>
  );
}
