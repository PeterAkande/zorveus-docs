import React, { ReactNode } from 'react';

export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="zorveus-steps not-prose">
      {children}
    </div>
  );
}

export function Step({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="zorveus-step">
      {title && <h3>{title}</h3>}
      <div className="zorveus-rich-content">{children}</div>
    </div>
  );
}
