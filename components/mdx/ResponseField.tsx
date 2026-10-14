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
        <span className="zorveus-field-name">
          {name}
        </span>
        {type && <span className="text-zinc-400 font-sans">{type}</span>}
        {required && (
          <span className="zorveus-field-required" data-kind="response">
            required
          </span>
        )}
      </div>
      <div className="zorveus-rich-content">{children}</div>
    </div>
  );
}
