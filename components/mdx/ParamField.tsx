import React, { ReactNode } from 'react';

interface ParamFieldProps {
  name: string;
  type?: string;
  required?: boolean;
  default?: string;
  children: ReactNode;
}

export function ParamField({
  name,
  type,
  required,
  default: defaultValue,
  children,
}: ParamFieldProps) {
  return (
    <div className="my-4 border-b border-zinc-800/80 pb-4 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-2 mb-1.5 font-mono text-xs">
        <span className="font-semibold text-zinc-100 bg-zinc-800/70 px-1.5 py-0.5 rounded text-xs text-mint">
          {name}
        </span>
        {type && <span className="text-zinc-400 font-sans">{type}</span>}
        {required && (
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/40">
            required
          </span>
        )}
        {!required && (
          <span className="text-[10px] font-sans text-zinc-500 uppercase tracking-wider">
            optional
          </span>
        )}
        {defaultValue && (
          <span className="text-zinc-500 font-sans">
            default: <code className="text-zinc-300 font-mono">{defaultValue}</code>
          </span>
        )}
      </div>
      <div className="text-xs leading-relaxed text-zinc-300 pl-1">{children}</div>
    </div>
  );
}
