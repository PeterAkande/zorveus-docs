import React, { ReactNode } from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'danger' | 'success' | 'tip' | 'note';
  title?: string;
  children: ReactNode;
}

const icons = { info: Info, note: Info, warning: AlertTriangle, danger: AlertCircle, success: CheckCircle2, tip: Lightbulb };

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const Icon = icons[type] || Info;
  return (
    <aside className="zorveus-callout not-prose" data-type={type} role="note">
      <Icon className="zorveus-callout-icon" aria-hidden="true" />
      <div className="zorveus-callout-content">
        {title && <div className="zorveus-callout-title">{title}</div>}
        <div className="zorveus-rich-content">{children}</div>
      </div>
    </aside>
  );
}
