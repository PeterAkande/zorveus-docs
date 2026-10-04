import React, { ReactNode } from 'react';

interface ResponseFieldProps {
  name: string;
  type?: string;
  required?: boolean;
  children: ReactNode;
}

export function ResponseField({
  name,
  type,
  required,
  children,
}: ResponseFieldProps) {
  return (
    <div className="zorveus-field not-prose">
      <div className="zorveus-field-heading">
        <span className="font-semibold text-zinc-100 bg-zinc-800/70 px-1.5 py-0.5 rounded text-xs text-mint">
          {name}
        </span>
        {type && <span className="text-zinc-400 font-sans">{type}</span>}
        {required && (
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
            required
          </span>
        )}
      </div>
      <div className="zorveus-rich-content">{children}</div>
    </div>
  );
}
