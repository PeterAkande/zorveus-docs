import React, { ReactNode } from 'react';

export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="steps-container my-6 ml-4 border-l-2 border-zinc-800 pl-6 space-y-6">
      {children}
    </div>
  );
}

export function Step({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="relative group">
      <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 border-2 border-mint text-[10px] text-mint shadow-sm" />
      {title && <h3 className="text-base font-semibold text-zinc-100 tracking-tight mb-2">{title}</h3>}
      <div className="text-sm text-zinc-300 leading-relaxed">{children}</div>
    </div>
  );
}
