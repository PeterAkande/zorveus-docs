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
    <div className="zorveus-field not-prose">
      <div className="zorveus-field-heading">
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
      <div className="zorveus-rich-content">{children}</div>
    </div>
  );
}
